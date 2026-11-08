import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { RestApplication } from '@loopback/rest';
import { EntityNotFoundError } from '@loopback/repository';

jest.mock('pg');
import auth from '../js/auth';
import { config } from '../config';
import { GrowerNoteController } from './growerNote.controller';

// Exercise the actual auth middleware, route decorators, body validation, and
// controller with isolated repositories; never connect to the shared database.
describe('grower notes HTTP API', () => {
  let app;
  let api;
  let notes;
  let noteRepository;
  let planterRepository;
  const root = '/api/organization/10/planter/1/notes';
  const staff = {
    id: 7,
    userName: 'staff',
    firstName: 'Calvin',
    lastName: 'Osoro',
    policy: {
      organization: { id: 10, name: 'Organization' },
      policies: [{ name: 'manage_planter' }],
    },
  };
  const token = (user = staff) => jwt.sign(user, config.jwtSecret);
  const send = (method, url = root, user = staff) =>
    request(api)[method](url).set('Authorization', token(user));

  beforeEach(() => {
    notes = [];
    noteRepository = {
      find: jest.fn(async ({ where }) =>
        notes.filter((note) => note.planterId === where.planterId).reverse(),
      ),
      create: jest.fn(async (data) => {
        const note = { id: notes.length + 1, ...data };
        notes.push(note);
        return note;
      }),
      updateAll: jest.fn(async (data, where) => {
        const matching = notes.filter(
          (note) => note.id === where.id && note.planterId === where.planterId,
        );
        matching.forEach((note) => Object.assign(note, data));
        return { count: matching.length };
      }),
      deleteAll: jest.fn(async (where) => {
        const before = notes.length;
        notes = notes.filter(
          (note) => note.id !== where.id || note.planterId !== where.planterId,
        );
        return { count: before - notes.length };
      }),
    };
    planterRepository = {
      findById: jest.fn(async (id) => {
        if (id === 99) throw new EntityNotFoundError('Planter', id);
        return { id, organizationId: id === 4 ? null : id === 3 ? 20 : 11 };
      }),
      getEntityIdsByOrganizationId: jest.fn(async () => [10, 11]),
    };
    app = new RestApplication();
    app.bind('repositories.GrowerNoteRepository').to(noteRepository);
    app.bind('repositories.PlanterRepository').to(planterRepository);
    app.controller(GrowerNoteController);
    api = express();
    api.use(express.json());
    api.use('/api', auth.isAuth, app.requestHandler);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('supports note CRUD within a child organization', async () => {
    await send('get').expect(200, []);
    const created = await send('post')
      .send({ content: '  Follow up  ' })
      .expect(201);
    expect(created.body).toMatchObject({
      id: 1,
      planterId: 1,
      content: 'Follow up',
      authorId: 7,
      authorName: 'Calvin Osoro',
    });
    expect(created.body.createdAt).toBeTruthy();
    expect(created.body.updatedAt).toEqual(created.body.createdAt);
    await send('post').send({ content: 'Another note' }).expect(201);
    const listed = await send('get').expect(200);
    expect(listed.body.map((note) => note.content)).toEqual([
      'Another note',
      'Follow up',
    ]);
    expect(noteRepository.find).toHaveBeenCalledWith({
      where: { planterId: 1 },
      order: ['createdAt DESC', 'id DESC'],
    });
    await send('patch', `${root}/1`).send({ content: 'Updated' }).expect(204);
    expect(notes[0]).toMatchObject({
      content: 'Updated',
      authorId: 7,
      authorName: 'Calvin Osoro',
    });
    expect(notes[0].createdAt.toISOString()).toEqual(created.body.createdAt);
    expect(notes[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
      Date.parse(created.body.updatedAt),
    );
    await send('delete', `${root}/1`).expect(204);
    const remaining = await send('get').expect(200);
    expect(remaining.body.map((note) => note.id)).toEqual([2]);
  });

  it('supports scoped admin CRUD and username fallback', async () => {
    const admin = {
      id: 8,
      userName: 'admin',
      policy: { policies: [{ name: 'super_permission' }] },
    };
    const url = root;
    await send('post', url, admin).send({ content: 'A note' }).expect(201);
    expect(notes[0].authorName).toBe('admin');
    await send('get', url, admin).expect(200);
    await send('patch', `${url}/1`, admin)
      .send({ content: 'Edit' })
      .expect(204);
    await send('delete', `${url}/1`, admin).expect(204);
  });

  it.each(['get', 'post', 'patch', 'delete'])(
    'does not expose an unscoped %s endpoint to admins',
    async (method) => {
      const admin = {
        ...staff,
        policy: { policies: [{ name: 'super_permission' }] },
      };
      const suffix = ['patch', 'delete'].includes(method) ? '/1' : '';
      await send(method, `/api/planter/1/notes${suffix}`, admin)
        .send(
          ['post', 'patch'].includes(method) ? { content: 'No' } : undefined,
        )
        .expect(404);
      expect(planterRepository.findById).not.toHaveBeenCalled();
    },
  );

  it('documents exactly the four scoped note operations', async () => {
    const spec = await app.restServer.getApiSpec();
    const notesPath = '/organization/{organizationId}/planter/{growerId}/notes';
    const notePath = `${notesPath}/{noteId}`;
    expect(Object.keys(spec.paths).sort()).toEqual(
      [notesPath, notePath].sort(),
    );
    expect(Object.keys(spec.paths[notesPath]).sort()).toEqual(['get', 'post']);
    expect(Object.keys(spec.paths[notePath]).sort()).toEqual([
      'delete',
      'patch',
    ]);
    const document = yaml.safeLoad(
      fs.readFileSync(
        path.resolve(
          __dirname,
          '../../docs/api/spec/treetracker-admin.v1.yaml',
        ),
        'utf8',
      ),
    );
    for (const route of [notesPath, notePath]) {
      expect(document.paths[route]).toEqual(spec.paths[route]);
    }
    expect(document.components.schemas.GrowerNote).toEqual(
      spec.components.schemas.GrowerNote,
    );
    expect(document.paths['/planter/{growerId}/notes']).toBeUndefined();
    expect(
      document.paths['/planter/{growerId}/notes/{noteId}'],
    ).toBeUndefined();
  });

  it('supports a grower directly assigned to the organization', async () => {
    planterRepository.findById.mockResolvedValue({ id: 1, organizationId: 10 });
    await send('post').send({ content: 'Direct member' }).expect(201);
    await send('get').expect(200);
  });

  it.each(['get', 'post', 'patch', 'delete'])(
    'rejects %s for a grower without an organization',
    async (method) => {
      const suffix = ['patch', 'delete'].includes(method) ? '/1' : '';
      await send(method, `/api/organization/10/planter/4/notes${suffix}`)
        .send(
          ['post', 'patch'].includes(method) ? { content: 'No' } : undefined,
        )
        .expect(403);
      expect(noteRepository.find).not.toHaveBeenCalled();
      expect(noteRepository.create).not.toHaveBeenCalled();
      expect(noteRepository.updateAll).not.toHaveBeenCalled();
      expect(noteRepository.deleteAll).not.toHaveBeenCalled();
    },
  );

  it('rejects unauthenticated requests', async () => {
    await request(api).get(root).expect(401);
    await request(api).post(root).send({ content: 'No login' }).expect(401);
    expect(noteRepository.create).not.toHaveBeenCalled();
  });

  it('lets readers list notes but prevents every write operation', async () => {
    const reader = {
      ...staff,
      policy: { ...staff.policy, policies: [{ name: 'list_planter' }] },
    };
    await send('get', root, reader).expect(200);
    await send('post', root, reader).send({ content: 'No' }).expect(401);
    await send('patch', `${root}/1`, reader)
      .send({ content: 'No' })
      .expect(401);
    await send('delete', `${root}/1`, reader).expect(401);
    expect(noteRepository.create).not.toHaveBeenCalled();
    expect(noteRepository.updateAll).not.toHaveBeenCalled();
    expect(noteRepository.deleteAll).not.toHaveBeenCalled();
  });

  it('restricts organization staff to their organization route', async () => {
    await send('get', '/api/organization/20/planter/1/notes').expect(401);
    await send('get', '/api/planter/1/notes').expect(401);
    expect(planterRepository.findById).not.toHaveBeenCalled();
  });

  it.each(['get', 'post', 'patch', 'delete'])(
    'rejects %s for a grower outside the organization',
    async (method) => {
      const suffix = ['patch', 'delete'].includes(method) ? '/1' : '';
      await send(method, `/api/organization/10/planter/3/notes${suffix}`)
        .send(
          ['post', 'patch'].includes(method) ? { content: 'No' } : undefined,
        )
        .expect(403);
      expect(noteRepository.find).not.toHaveBeenCalled();
      expect(noteRepository.create).not.toHaveBeenCalled();
      expect(noteRepository.updateAll).not.toHaveBeenCalled();
      expect(noteRepository.deleteAll).not.toHaveBeenCalled();
    },
  );

  it('does not expose or modify a note through another grower', async () => {
    await send('post').send({ content: 'Private to grower 1' }).expect(201);
    const other = '/api/organization/10/planter/2/notes';
    await send('get', other).expect(200, []);
    await send('patch', `${other}/1`)
      .send({ content: 'Wrong grower' })
      .expect(404);
    await send('delete', `${other}/1`).expect(404);
    expect(notes[0].content).toBe('Private to grower 1');
  });

  it.each(['', '   ', '\n\t', null, 42])(
    'rejects invalid content %p on creation and editing',
    async (content) => {
      await send('post').send({ content }).expect(422);
      await send('patch', `${root}/1`).send({ content }).expect(422);
      expect(noteRepository.create).not.toHaveBeenCalled();
      expect(noteRepository.updateAll).not.toHaveBeenCalled();
    },
  );

  it('rejects missing content and client-supplied metadata', async () => {
    await send('post').send({}).expect(422);
    for (const metadata of [
      { authorId: 99 },
      { authorName: 'Impersonation' },
      { planterId: 2 },
      { createdAt: '2000-01-01' },
      { updatedAt: '2000-01-01' },
      { id: 9 },
    ]) {
      await send('post')
        .send({ content: 'Note', ...metadata })
        .expect(422);
      await send('patch', `${root}/1`)
        .send({ content: 'Edit', ...metadata })
        .expect(422);
    }
  });

  it('returns 404 for missing growers and notes', async () => {
    await send('get', '/api/organization/10/planter/99/notes').expect(404);
    await send('patch', `${root}/999`).send({ content: 'Missing' }).expect(404);
    await send('delete', `${root}/999`).expect(404);
  });

  it.each(['0', '-1', '1.5'])('rejects invalid grower ID %s', async (id) => {
    await send('get', `/api/organization/10/planter/${id}/notes`).expect(400);
  });
});
