import {ApplicationConfig, ExpressServer} from './server';
import expect from 'expect-runtime';

//check if env configration were set correctly
expect(process.env.POLICY_SUPER_PERMISSION).defined();
expect(process.env.POLICY_SUPER_PERMISSION).defined();
expect(process.env.POLICY_LIST_USER).defined();
expect(process.env.POLICY_MANAGER_USER).defined();
expect(process.env.POLICY_LIST_TREE).defined();
expect(process.env.POLICY_APPROVE_TREE).defined();
expect(process.env.POLICY_LIST_PLANTER).defined();
expect(process.env.POLICY_MANAGE_PLANTER).defined();

export * from './server';

export async function main(options: ApplicationConfig = {}): Promise<void> {
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log('Server is running.');
  return;
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
  main(config).catch((err) => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
