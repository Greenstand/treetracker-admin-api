import express from 'express';
import request from 'supertest';
import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { createDomainRouter } from './router';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
jest.mock('./billing', () => ({ saasUsers: jest.fn() }));
describe('Domain API route permissions', () => {
  const service = new AdminDomainService({} as Pool);
  function app(role?: string) {
    const instance = express();
    instance.use(express.json());
    instance.use((req: KeycloakRequest, _res, next) => {
      if (role)
        req.user = {
          id: 'fixture',
          userName: 'fixture',
          email: 'fixture@example.org',
          policy: { policies: [{ name: role }], organization: undefined },
        };
      next();
    });
    instance.use(createDomainRouter(service));
    return instance;
  }
  it('requires authentication before reading the catalog', async () => {
    expect((await request(app()).get('/species')).status).toBe(401);
  });
  it('denies catalog writes and SaaS users to an organization admin', async () => {
    expect((await request(app('org')).post('/species').send({})).status).toBe(
      403,
    );
    expect(
      (await request(app('org-admin-saas')).get('/saas/users')).status,
    ).toBe(403);
    expect(
      (await request(app('org')).patch('/organizations/fixture').send({}))
        .status,
    ).toBe(403);
  });
});
