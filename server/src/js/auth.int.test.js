const request = require('supertest');
const express = require('express');
const {auth} = require('./auth.js');

/*
 * Skip integration tests, let's set up the DB appropriately in the future so we 
 * use it again
 */
describe.skip('auth int', () => {
  let app;

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

  it('init', async () => {
    const response = await request(app).post('/auth/init');
    expect(response.statusCode).toBe(200);
  });

  it('get /auth/test', async () => {
    const response = await request(app).get('/auth/test');
    expect(response.statusCode).toBe(200);
  });

  it('/auth/login', async () => {
    const response = await request(app).post('/auth/login').send({
      userName: 'admin',
      password: 'admin',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.token).toMatch(/\S+/);
    expect(response.body.user).toMatchObject({
      userName: expect.anything(),
      role: [1, 2],
    });
  });

  it('/auth/login fail', async () => {
    const response = await request(app).post('/auth/login').send({
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
      const response = await request(app).post('/auth/login').send({
        userName: 'admin',
        password: 'admin',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.token).toMatch(/\S+/);
      token = response.body.token;
    });

    it('/permissions', async () => {
      const res = await request(app)
        .get('/auth/permissions')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((permission) => {
        expect(permission).toMatchObject({
          id: expect.any(Number),
          roleName: expect.any(String),
          description: expect.any(String),
        });
      });
    });

    it('admin_users', async () => {
      const res = await request(app)
        .get('/auth/admin_users')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((user) => {
        expect(user).toMatchObject({
          id: expect.any(Number),
          userName: expect.any(String),
          role: expect.any(Array),
        });
      });
    });

    describe('create user', () => {
      let id;
      let newUser = {
        userName: 'ccc',
        password: '123456',
        firstName: 'C',
        lastName: 'C',
        email: 'c@g.com',
        role: [2],
      };

      beforeEach(async () => {
        const res = await request(app)
          .post('/auth/admin_users')
          .set('Authorization', token)
          .send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({
          id: expect.any(Number),
        });
        id = res.body.id;
      });

      it.skip('can login with new user', async () => {
        const res = await request(app).post('/auth/login').send({
          userName: newUser.userName,
          password: newUser.password,
        });
        expect(res.statusCode).toBe(200);
      });

      describe('Edit user info', () => {
        beforeEach(async () => {
          const res = await request(app)
            .patch(`/auth/admin_users/${id}`)
            .set('Authorization', token)
            .send({
              email: 'new@q.com',
            });
          expect(res.statusCode).toBe(200);
        });

        it('should get new info', async () => {
          const res = await request(app)
            .get(`/auth/admin_users/${id}`)
            .set('Authorization', token);
          expect(res.statusCode).toBe(200);
          expect(res.body.email).toBe('new@q.com');
        });
      });

      describe('Generate password', () => {
        beforeEach(async () => {
          const res = await request(app)
            .put(`/auth/admin_users/${id}/password`)
            .set('Authorization', token)
            .send({
              password: 'abcdef',
            });
          expect(res.statusCode).toBe(200);
        });

        it('Can login with new password', async () => {
          const res = await request(app).post('/auth/login').send({
            userName: newUser.userName,
            password: 'abcdef',
          });
          expect(res.statusCode).toBe(200);
        });
      });
    });
  });

  describe('Login B', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app).post('/auth/login').send({
        userName: 'seb',
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
