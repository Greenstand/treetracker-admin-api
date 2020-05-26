const request = require("supertest");
const express = require("express");
const {auth} = require("./auth.js");

describe("auth", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
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
  });

});
