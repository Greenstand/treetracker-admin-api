const request = require("supertest");
const express = require("express");
const {auth} = require("./auth.js");

describe("auth", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use("/auth", auth.router);
  });

  it("get /auth/test", async () => {
    const response = await request(app)
      .get("/auth/test/");
    expect(response.statusCode).toBe(200);
  });


  it("/auth/login", async () => {
    const response = await request(app)
      .post("/auth/login/");
    expect(response.statusCode).toBe(200);
  });

});
