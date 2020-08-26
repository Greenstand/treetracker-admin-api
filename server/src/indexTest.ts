import {ApplicationConfig, ExpressServer} from './server';

export * from './server';
const seed = require("./tests/seed/seed");

export async function main(options: ApplicationConfig = {}) {
  //seed data
  console.log("seeding data...");
  await seed.clear();
  await seed.seed();
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log('Server is running.');
}

if (require.main === module) {
  // Run the application
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
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
