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
    const config = {
      rest: {
        port: +(process.env.NODE_PORT || 3000),
        host: process.env.HOST || 'localhost',
        openApiSpec: {
          // useful when used with OpenAPI-to-GraphQL to locate your application
          setServersFromRequest: true,
        },
        // Use the LB4 application as a route. It should not be listening.
        listenOnStart: false,
      },
    };
    const server = new ExpressServer(config);
    await server.boot();
    await server.lbApp.start();
    const response = request(server.app).post(
      "/auth/login",
    );
    console.log(response);
  });

});

