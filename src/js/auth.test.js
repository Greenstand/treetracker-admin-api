const request = require('supertest');
const express = require('express');
const expectRuntime =require("expect-runtime");

jest.mock('pg');
jest.mock("jsonwebtoken");
const {Pool, Client} = require('pg');

/*
 * Cuz the js import way, we must mock it in this way
 */
const query = jest.fn();
Pool.mockImplementation(() => {
  console.warn("mock pg!");
  return ({
    query,
  })
});
//please require auth here to wait pool get mocked!
const auth = require("./auth").default;

describe('auth', () => {
  let app;

  // SAMPLE USER SESSION
  // const testAdminUser = {
  //   id: 1,
  //   userName: 'test',
  //   firstName: 'testFirst',
  //   lastName: 'testLast',
  //   passwordHash: 'testHash',
  //   email: 'test@greenstand.org',
  //   active: true,
  //   enabled: true,
  //   role: [1, 2, 5, 6],
  //   policy: {
  //     policies: [
  //       {name: 'super_permission', description: 'Can do anything'},
  //       {name: 'list_user', description: 'Can view admin users'},
  //       {name: 'manager_user', description: 'Can create/modify admin user'}
  //     ]
  //   }
  // };

  describe("getActiveAdminUserRoles", () => {

    it("success", async () => {
      const getActiveAdminUserRoles = jest.requireActual('./auth').default.helper.getActiveAdminUserRoles;
      await getActiveAdminUserRoles(1);
      expect(query).toHaveBeenCalledWith(expect.stringMatching(/admin_user_role/));
    });
  });

  describe("addAdminUserRole", () => {

    it("success", async () => {
      const addAdminUserRole = jest.requireActual('./auth').default.helper.addAdminUserRole;
      await addAdminUserRole(1,1);
      expect(query).toHaveBeenCalledWith(expect.stringMatching(/insert.*admin_user_role/));
    });
  });

  describe("clearAdminUserRoles", () => {

    it("success", async () => {
      const clearAdminUserRoles = jest.requireActual('./auth').default.helper.clearAdminUserRoles;
      await clearAdminUserRoles(1,1);
      expect(query).toHaveBeenCalledWith(expect.stringMatching(/update admin_user_role set active = false/));
    });
  });

  describe("getActiveAdminUser", () => {

    it("success", async () => {
      const getActiveAdminUser = jest.requireActual('./auth').default.helper.getActiveAdminUser;
      await getActiveAdminUser(1,1);
      expect(query).toHaveBeenCalledWith(expect.stringMatching(/select \* from admin_user/));
    });
  });

  describe("deactivateAdminUser", () => {

    it("success", async () => {
      const deactivateAdminUser = jest.requireActual('./auth').default.helper.deactivateAdminUser;
      await deactivateAdminUser(1,1);
      expect(query).toHaveBeenCalledWith(expect.stringMatching(/update admin_user set active = false/));
    });
  });

  describe("routers withouth isAuth", () => {

    beforeEach(() => {
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("isAuth");
      app = express();
      app.use(express.json());
      //app.use('*', auth.isAuth);
      app.use('/auth', auth.router);
      //mock api
      app.use('/api', async (req, res, next) => {
        res.status(200).send('OK');
      });
    });

    it('/auth/login', async () => {
      //mock
      auth.helper.getActiveAdminUser = jest.fn().mockResolvedValueOnce({
        rows: [{
          id: 0,
          user_name: 'dadiorchen',
          first_name: 'Dadior',
          salt: "test",
          passwordHash: "test",
          enabled: true,
        }],
      })
      auth.helper.getActiveAdminUserRoles = jest.fn(() => ({rows:[]}));
      auth.helper.sha512 = () => "test";
      auth.helper.loadUserPermissions = jest.fn(() => ({}));
      const response = await request(app).post('/auth/login').send({
        userName: 'dadiorchen',
        password: '123456',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.user).toMatchObject({
        userName: expect.anything(),
        role: expect.any(Array),
      });
    });

    it('/auth/login fail', async () => {
      auth.helper.getActiveAdminUser = jest.fn().mockResolvedValueOnce({
        rows: [{
          id: 0,
          user_name: 'dadiorchen',
          first_name: 'Dadior',
          salt: "test",
          passwordHash: "xxxx",
          enabled: true,
        }],
      });
      const response = await request(app).post('/auth/login').send({
        userName: 'dadiorchen',
        password: 'xxxxxxx',
      });
      expect(response.statusCode).toBe(401);
    });


    describe("/permissions", () => {

      it("successfully", async () => {
        query.mockResolvedValue({rows:[]});
        const response = await request(app).get('/auth/permissions');
        expect(response.statusCode).toBe(200);
      });
    });

    describe("GET /admin_user/:id", () => {

      it("successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[]}));
        const response = await request(app).get('/auth/admin_users/1');
        expect(response.statusCode).toBe(200);
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/admin_user/));
      });

      //TODO test fail
    });

    describe("PUT /admin_users/:id/password", () => {

      it("successfully", async () => {
        const response = await request(app).put('/auth/admin_users/1/password')
          .send({password: "test"});
        expect(response.statusCode).toBe(200);
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/update admin_user/));
      });
    });

    describe("PATCH /admin_users/:id", () => {

      it("successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.clearAdminUserRoles = jest.fn();
        const response = await request(app).patch('/auth/admin_users/1');
        expect(response.statusCode).toBe(200);
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/update admin_user/));
        expect(auth.helper.clearAdminUserRoles).toHaveBeenCalledWith("1");

      });
    });

    describe("DELETE /admin_users/:id", () => {

      it("Successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.deactivateAdminUser = jest.fn();
        const response = await request(app).delete('/auth/admin_users/1');
        expect(response.statusCode).toBe(204);
        expect(auth.helper.deactivateAdminUser).toHaveBeenCalledWith("1");
      });
    });

    describe("GET /admin_users", () => {

      it("Successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[]}));
        const response = await request(app).get('/auth/admin_users');
        expect(response.statusCode).toBe(200);
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/select.*admin_user/));
      });
    });

    describe("POST /validate", () => {

      it("Successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[]}));
        auth.helper.sha512 = jest.fn(() => "testHash");
        const jwt = require("jsonwebtoken");
        expectRuntime(jwt).property("verify").defined();
        jwt.verify.mockReturnValueOnce({passwordHash:"testHash"});
        const response = await request(app).post('/auth/validate')
          .set("authorization", "testToken");
        expect(response.statusCode).toBe(200);
      });
    });

    describe("POST /admin_users", () => {

      it("Successfully", async () => {
        query.mockResolvedValue({rows:[{}]});
        auth.helper.getActiveAdminUser = jest.fn()
          .mockResolvedValueOnce({rows:[]})
          .mockResolvedValueOnce({rows:[{}]});

        const response = await request(app)
          .post('/auth/admin_users')
          .send({
            role: [1],
          });
        expect(response.statusCode).toBe(201);
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/insert.*admin_user/));
      });
    });

  });

  describe("router with isAuth (to test isAuth)", () => {

    beforeEach(() => {
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("isAuth");
      app = express();
      app.use(express.json());
      app.use('*', auth.isAuth);
      app.use('/auth', auth.router);
      //mock api
      app.use('/api', async (req, res, next) => {
        res.status(200).send('OK');
      });
    });

    it('GET /auth/test no need token', async () => {
      const response = await request(app).get('/auth/test');
      expect(response.statusCode).toBe(200);
    });


    it('401 /auth/admin_users/ cuz no token', async () => {
      const response = await request(app).get('/auth/admin_users');
      expect(response.statusCode).toBe(401);
    });

    describe("GET /auth/check_session", () => {

      it("Successfully", async () => {
          const jwt = require("jsonwebtoken");
          jwt.verify.mockReturnValueOnce({
            policy:{ policies: [1]},
            passwordHash: "testHash",
            userName: "test"
          });
          query.mockResolvedValue({rows:[{}]});
          auth.helper.getActiveAdminUser = jest.fn(() => Promise.resolve({rows:[{passwordHash:"testHash"}]}));
          const response = await request(app).get('/auth/check_session');
          expect(response.statusCode).toBe(200);
      });

      //TODO test failure case
    });

    describe("/api", () => {

      describe("/api/species", () => {

        it("Successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [1,],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/species');
            expect(response.statusCode).toBe(200);
        });
      });

      describe("trees", () => {

        it("/trees successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "list_tree",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/trees');
            expect(response.statusCode).toBe(200);
        });

        it("/trees 401 no permission", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/trees');
            expect(response.statusCode).toBe(401);
        });

        it("/organization/trees/ successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "list_tree",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/organization/1/trees');
            expect(response.statusCode).toBe(200);
        });

      });

      describe("planter", () => {

        it("/planter successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "list_planter",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/planter');
            expect(response.statusCode).toBe(200);
        });

        it("/planter 401 no permission", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/planter');
            expect(response.statusCode).toBe(401);
        });

        it("/organization/planter successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "list_planter",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/organization/1/planter');
            expect(response.statusCode).toBe(200);
        });

      });

      describe("organizations", () => {

        it("/planter successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "list_tree",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/organizations');
            expect(response.statusCode).toBe(200);
        });

        it("/planter 401 no permission", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/organizations');
            expect(response.statusCode).toBe(401);
        });

        it("/organization/planter successfully", async () => {
            const jwt = require("jsonwebtoken");
            jwt.verify.mockReturnValueOnce({policy:{
              policies: [{
                name: "manage_planter",
              }],
              passwordHash: "testHash",
            }});
            query.mockResolvedValue({rows:[{}]});
            auth.helper.getActiveAdminUserRoles = jest.fn(() => Promise.resolve({rows:[{passwordHasht:"testHash"}]}));
            const response = await request(app).get('/api/organization/1/organizations');
            expect(response.statusCode).toBe(200);
        });

      });


    });

  });

});
