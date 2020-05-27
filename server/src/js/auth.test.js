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
        username: "test",
        password: "password",
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
          username: "test",
          password: "password",
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
    });

  });

});
