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
const seed = require("../../tests/seed/seed.ts");

describe("Orgnaization", () => {
  let server;

  beforeAll(async () => {
    console.log("before All3...");
    await seed.clear();
    await seed.seed();
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
    server = new ExpressServer(config);
  }, 1000*60*5);

  

  it.only("server", async () => {
    await server.boot();
    await server.start();
    //await server.lbApp.start();
    //console.log("print after start:", listEndpoints(this.app));
    console.log("finish start.");
    await new Promise(r => {
      console.log("waiting.....");
      setTimeout(() => {console.log("waited some time.");r()}, 1000 * 60 * 5);
    });
  }, 1000 *60*5);

  afterAll(async () => {
    await seed.clear();
  });


  it("can login with default account admin:admin", async () => {
    const response = await request(server.app)
      .post("/auth/login")
      .send({
        userName: "admin",
        password: "admin",
      });
    expect(response.statusCode).toBe(200);
  });

  

  describe.skip(`Login with account ${seed.users.test.username}`, () => {
    let token;

    beforeEach(async () => {
    console.log("before each...");
      const response = await request(server.app)
        .post("/auth/login")
        .send({
          userName: seed.users.test.username,
          password: seed.users.test.password,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      token = response.body.token;
    });

    it("shoulbe be able request /api/trees", async () => {
      console.log("it it...");
      await new Promise(r => {
        console.log("waiting.....");
        setTimeout(() => {console.log("waited some time.");r()}, 1000 * 60 * 5);
      });
      const response = await request(server.app)
        .get("/api/trees?filter[offset]=0&filter[limit]=100&filter[skip]=0")
        .set('Authorization', token);
      expect(response.statusCode).toBe(200);
    }, 1000 * 60 * 5);

  });

  it(`can login with organization account ${seed.users.organization1}`, async () => {
    const response = await request(server.app)
      .post("/auth/login")
      .send({
        userName: seed.users.organization1.username,
        password: seed.users.organization1.password,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: {
        policy: {
          organizations: expect.any(Array),
          policies: expect.any(Array),
        },
      },
    });
  });

});

