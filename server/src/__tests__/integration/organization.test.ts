/*
 * To test organizational user, like login, permission, and so on
 */
import {ApplicationConfig, ExpressServer} from '../../server';

//export async function main(options: ApplicationConfig = {}) {
//  const server = new ExpressServer(options);
//  await server.boot();
//  await server.start();
//  console.log('Server is running.');
//}
const request = require("supertest");
const seed = require("../seed/seed.js");

describe("Orgnaization", () => {

  beforeAll(() => {
    seed.seed();
  });

  afterAll(() => {
    seed.clear();
  });


  it("login", async () => {
    const server = new ExpressServer(options);
    await server.boot();
    await server.start();
    await server.lbApp.start();
    const response = request(server.app).post(
      "/auth/login",
    );
    token
  });

});

