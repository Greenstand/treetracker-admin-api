/*
 * To test organizational user, like login, permission, and so on
 */

const request = require("supertest");
const seed = require("../seed/seed.js");

describe("Orgnaization", () => {

  beforeAll(() => {
    seed.seed();
  });

  afterAll(() => {
    seed.clear();
  });


  it("login", () => {
    const response = request(app).post(
      "/auth/login",
    );
    token
  });

});

