import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { HttpErrors, Request, RestBindings } from '@loopback/rest';

import { SpeciesController } from './species.controller';
import { TagController } from './tag.controller';
import { TreeTagController } from './treeTag.controller';
import { TreesTreeTagController } from './treesTreeTag.controller';
import {
  SpeciesRepository,
  TagRepository,
  TreeTagRepository,
  TreesRepository,
} from '../repositories';
import { Role } from '../types/roles';

function contextWithRoles(roles: string[] | undefined): Context {
  const ctx = new Context();
  const user =
    roles === undefined
      ? undefined
      : { id: 'u1', policy: { policies: roles.map((name) => ({ name })) } };
  ctx.bind(RestBindings.Http.REQUEST.key).to({ user } as never);
  return ctx;
}

function speciesController() {
  return new SpeciesController(
    {
      updateById: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      execute: jest.fn().mockResolvedValue([]),
    } as unknown as SpeciesRepository,
    { execute: jest.fn().mockResolvedValue([]) } as unknown as TreesRepository,
    {} as Request,
  );
}

function tagController() {
  return new TagController({
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    updateById: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  } as unknown as TagRepository);
}

function treeTagController() {
  return new TreeTagController({
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    updateById: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  } as unknown as TreeTagRepository);
}

function treesTreeTagController() {
  return new TreesTreeTagController({
    treeTags: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue({ id: 1 }),
      patch: jest.fn().mockResolvedValue({ count: 1 }),
      delete: jest.fn().mockResolvedValue({ count: 1 }),
    }),
  } as unknown as TreesRepository);
}

function invoke(
  roles: string[] | undefined,
  controller: object,
  method: string,
  args: unknown[],
) {
  return invokeMethodWithInterceptors(
    contextWithRoles(roles),
    controller,
    method,
    args,
  );
}

// Every write route and the arguments its method takes, so each one is checked.
const ADMIN_ONLY: [string, () => object, string, unknown[]][] = [
  ['species.updateById', speciesController, 'updateById', [1, {}]],
  [
    'species.combine',
    speciesController,
    'combine',
    [{ combine: [1], species: {} }],
  ],
  ['species.create', speciesController, 'create', [{}]],
  ['species.delete', speciesController, 'delete', [1]],
  ['tag.updateById', tagController, 'updateById', [1, {}]],
  ['tag.delete', tagController, 'delete', [1]],
  ['treeTag.updateById', treeTagController, 'updateById', [1, {}]],
  ['treeTag.delete', treeTagController, 'delete', [1]],
  ['treesTreeTag.create', treesTreeTagController, 'create', [1, {}]],
  ['treesTreeTag.patch', treesTreeTagController, 'patch', [1, {}, {}]],
  ['treesTreeTag.delete', treesTreeTagController, 'delete', [1, {}]],
];

const ADMIN_OR_ORGANIZATION: [string, () => object, string, unknown[]][] = [
  ['tag.create', tagController, 'create', [{ tagName: 'x' }]],
  ['treeTag.create', treeTagController, 'create', [{ treeId: 1, tagId: 1 }]],
];

const ALL = [...ADMIN_ONLY, ...ADMIN_OR_ORGANIZATION];

describe('species, tag and tree tag write routes', () => {
  it.each(ALL)('lets greenstand-admin call %s', async (_n, make, method, a) => {
    await expect(
      invoke([Role.ADMIN], make(), method, a),
    ).resolves.not.toThrow();
  });

  it.each(ALL)(
    'rejects an unauthenticated request on %s',
    async (_n, make, method, a) => {
      await expect(invoke(undefined, make(), method, a)).rejects.toThrow(
        HttpErrors.Unauthorized,
      );
    },
  );

  it.each(ALL)(
    'rejects a user with no role on %s',
    async (_n, make, method, a) => {
      await expect(invoke([], make(), method, a)).rejects.toThrow(
        HttpErrors.Forbidden,
      );
    },
  );

  it.each(ADMIN_ONLY)(
    'rejects an organization user on %s',
    async (_n, make, method, a) => {
      await expect(
        invoke([Role.ORGANIZATION], make(), method, a),
      ).rejects.toThrow(HttpErrors.Forbidden);
    },
  );

  // Capture approval in the admin client creates a tag and tags the capture,
  // and the Verify page is open to organization users.
  it.each(ADMIN_OR_ORGANIZATION)(
    'lets an organization user call %s',
    async (_n, make, method, a) => {
      await expect(
        invoke([Role.ORGANIZATION], make(), method, a),
      ).resolves.not.toThrow();
    },
  );
});
