const request = require('supertest');
const express = require('express');

jest.mock('pg');
const {Pool, Client} = require('pg');

/*
 * Cuz the js import way, we must mock it in this way
 */
const query = jest.fn();
Pool.mockImplementation(() => ({
  query,
}));
const {auth} = require('./auth.js');

jest.mock('./Audit');
const Audit = require('./Audit');
const audit = {
  did: jest.fn(),
};
Audit.mockImplementation(() => audit);

describe.skip('auth', () => {
  let app;

  it('Check the config', () => {
    expect(Pool).toHaveBeenCalledWith({
      connectionString: expect.stringMatching(/postgres(ql)?:\/\/.*/),
    });
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('*', auth.isAuth);
    app.use('/auth', auth.router);
    //mock api
    app.use('/api', async (req, res, next) => {
      res.status(200).send('OK');
    });
  });

  it('get /auth/test', async () => {
    const response = await request(app).get('/auth/test');
    expect(response.statusCode).toBe(200);
  });

  it('/auth/login', async () => {
    //    const p = new Pool();
    //    p.query.mockReturnValue("OK");
    //    console.warn("xxxx:", p.query);
    //    const r = await p.query();
    //    console.warn("rrrr:", r);
    query
      .mockReturnValueOnce({
        rows: [
          {
            id: 0,
            user_name: 'dadiorchen',
            first_name: 'Dadior',
          },
        ],
      })
      .mockReturnValueOnce({
        rows: [
          {
            role_id: 0,
          },
          {
            role_id: 1,
          },
        ],
      });
    const response = await request(app)
      .post('/auth/login')
      .send({
        userName: 'dadiorchen',
        password: '123456',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.token).toMatch(/\S+/);
    expect(response.body.user).toMatchObject({
      userName: expect.anything(),
      role: [0, 1],
    });
  });

  it('/auth/login fail', async () => {
    query.mockReturnValueOnce({
      rows: [],
    });
    const response = await request(app)
      .post('/auth/login')
      .send({
        userName: 'dadiorchen',
        password: 'xxxxxxx',
      });
    expect(response.statusCode).toBe(401);
  });

  it('401 /auth/admin_users/ cuz no token', async () => {
    const response = await request(app).get('/auth/admin_users');
    expect(response.statusCode).toBe(401);
  });

  describe('Login', () => {
    let token;

    beforeEach(async () => {
      query
        .mockReset()
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              user_name: 'dadiorchen',
              first_name: 'Dadior',
              salt: 'xxx',
            },
          ],
        })
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              user_name: 'dadiorchen',
              first_name: 'Dadior',
              salt: 'xxx',
            },
          ],
        })
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              user_name: 'dadiorchen',
              first_name: 'Dadior',
              salt: 'xxx',
            },
          ],
        })
        .mockReturnValueOnce({
          rows: [
            {
              role_id: 1,
            },
            {
              role_id: 2,
            },
          ],
        });
      const response = await request(app)
        .post('/auth/login')
        .send({
          userName: 'dadiorchen',
          password: '123456',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.token).toMatch(/\S+/);
      token = response.body.token;
    });

    it('audit(login) should be called', () => {
      expect(audit.did).toHaveBeenCalledWith(
        expect.any(Number),
        Audit.TYPE.LOGIN,
        expect.anything(),
      );
    });

    it('/permissions', async () => {
      query.mockReturnValueOnce({
        rows: [
          {
            id: 0,
            role_name: 'role1',
            description: 'role description',
          },
        ],
      });
      const res = await request(app)
        .get('/auth/permissions')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach(permission => {
        expect(permission).toMatchObject({
          id: expect.any(Number),
          roleName: expect.any(String),
          description: expect.any(String),
        });
      });
    });

    it('admin_users', async () => {
      query
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              user_name: 'role1',
            },
          ],
        })
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              role_id: 1,
            },
          ],
        });
      const res = await request(app)
        .get('/auth/admin_users')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach(user => {
        expect(user).toMatchObject({
          id: expect.any(Number),
          userName: expect.any(String),
          role: expect.any(Array),
        });
      });
    });

    describe('create user', () => {
      let newUser = {
        id: 3,
        userName: 'ccc',
        password: '123456',
        firstName: 'C',
        lastName: 'C',
        email: 'c@g.com',
        role: [1],
      };

      beforeEach(async () => {
        query.mockReturnValueOnce({
          rows: [
            {
              id: 1,
            },
          ],
        });
        const res = await request(app)
          .post('/auth/admin_users')
          .set('Authorization', token)
          .send(newUser);
        expect(res.statusCode).toBe(201);
      });

      describe('Edit user info', () => {
        beforeEach(async () => {
          const res = await request(app)
            .patch('/auth/admin_users/3')
            .set('Authorization', token)
            .send({
              email: 'new@q.com',
            });
          expect(res.statusCode).toBe(200);
        });

        it('should get new info', async () => {
          query
            .mockReturnValueOnce({
              rows: [
                {
                  id: 1,
                  email: 'new@q.com',
                },
              ],
            })
            .mockReturnValueOnce({
              rows: [{}],
            });
          const res = await request(app)
            .get('/auth/admin_users/3')
            .set('Authorization', token);
          expect(res.statusCode).toBe(200);
          expect(res.body.email).toBe('new@q.com');
        });
      });

      describe('Generate password', () => {
        beforeEach(async () => {
          const res = await request(app)
            .put('/auth/admin_users/3/password')
            .set('Authorization', token)
            .send({
              password: 'abcdef',
            });
          expect(res.statusCode).toBe(200);
        });

        it('', async () => {});
      });
    });
  });

  describe('Login B', () => {
    let token;

    beforeEach(async () => {
      query
        .mockReturnValueOnce({
          rows: [
            {
              id: 0,
              user_name: 'bbb',
              first_name: '123456',
            },
          ],
        })
        .mockReturnValueOnce({
          rows: [
            {
              role_id: 2,
            },
          ],
        });
      const response = await request(app)
        .post('/auth/login')
        .send({
          userName: 'bbb',
          password: '123456',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.token).toMatch(/\S+/);
      token = response.body.token;
    });

    it('admin_users 401', async () => {
      const res = await request(app)
        .get('/auth/admin_users')
        .set('Authorization', token);
      expect(res.statusCode).toBe(401);
    });

    it('api: /api/trees/count 200', async () => {
      const res = await request(app)
        .get('/api/trees/count')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
    });

    it('api: /api/planter/count 401', async () => {
      const res = await request(app)
        .get('/api/planter/count')
        .set('Authorization', token);
      expect(res.statusCode).toBe(401);
    });
  });
});
