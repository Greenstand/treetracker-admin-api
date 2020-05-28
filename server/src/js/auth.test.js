const request = require("supertest");
const express = require("express");
const {auth} = require("./auth.js");

describe("auth", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("*", auth.isAuth);
    app.use("/auth", auth.router);
  });

  it("get /auth/test", async () => {
    const response = await request(app)
      .get("/auth/test/");
    expect(response.statusCode).toBe(200);
  });


  it("/auth/login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        username: "dadiorchen",
        password: "123456",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.token).toMatch(/\S+/);
    expect(response.body.user).toMatchObject({
      username: expect.anything(),
      role: expect.anything(),
    });
  });

  it("401 /auth/admin_users/ cuz no token", async () => {
    const response = await request(app)
      .get("/auth/admin_users");
    expect(response.statusCode).toBe(401);
  });

  describe("Login", () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "dadiorchen",
          password: "123456",
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.token).toMatch(/\S+/);
      token = response.body.token;
    });

    it("admin_users", async () => {
      const res = await request(app)
        .get("/auth/admin_users")
        .set("Authorization", token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });


    describe("create user", () => {
      let newUser = {
            id: 3,
            username: "ccc",
            password: "123456",
            firstName: "C",
            lastName: "C",
            email: "c@g.com",
      }

      beforeEach(async () => {
        const res = await request(app)
          .post("/auth/admin_users")
          .set("Authorization", token)
          .send(newUser);
        expect(res.statusCode).toBe(201);
      });

      it("can login with new user", async () => {
        const res = await request(app)
          .post("/auth/login")
          .send({
            username: newUser.username,
            password: newUser.password,
          });
        expect(res.statusCode).toBe(200);
      });

      describe("Edit user info", () => {
        beforeEach(async () => {
          const res = await request(app)
            .patch("/auth/admin_users/3")
            .set("Authorization", token)
            .send({
              email: "new@q.com",
            });
          expect(res.statusCode).toBe(200);
        });

        it("should get new info", async () => {
          const res = await request(app)
            .get("/auth/admin_users/3")
            .set("Authorization", token);
          expect(res.statusCode).toBe(200);
          expect(res.body.email).toBe("new@q.com");
        });
      });

    });


  });

  describe("Login B", () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "bbb",
          password: "123456",
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.token).toMatch(/\S+/);
      token = response.body.token;
    });

    it("admin_users 401", async () => {
      const res = await request(app)
        .get("/auth/admin_users")
        .set("Authorization", token);
      expect(res.statusCode).toBe(401);
    });

  });

});
