import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { contractAccess } from './checkout';
import { subscriptionPlans } from './plans';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const id = '11111111-2222-4333-8444-555555555555';
const orgUser = {
  user: { id, policy: { policies: [{ name: 'org' }] } },
} as KeycloakRequest;
const originalKey = process.env.STRIPE_SECRET_KEY;
afterEach(() => {
  jest.restoreAllMocks();
  if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = originalKey;
});
function setup(tier: string, status = 'active', quantity = 1) {
  process.env.STRIPE_SECRET_KEY = 'fixture-only';
  const s = new AdminDomainService({
    query: jest.fn().mockResolvedValue({ rows: [{ entity_id: 3488 }] }),
  } as unknown as Pool);
  jest.spyOn(s, 'organization').mockResolvedValue(id);
  jest.spyOn(global, 'fetch').mockImplementation(
    async (input) =>
      ({
        ok: true,
        json: async () =>
          String(input).includes('/customers/search')
            ? {
                data: [
                  { id: 'cus_fixture', metadata: { organization_uuid: id } },
                ],
                has_more: false,
              }
            : {
                data: [
                  {
                    status,
                    items: {
                      data: [
                        {
                          quantity,
                          price: {
                            id:
                              subscriptionPlans.find((p) => p.name === tier)
                                ?.priceId || 'unknown',
                          },
                        },
                      ],
                    },
                  },
                ],
                has_more: false,
              },
      }) as Response,
  );
  return s;
}
it.each(['Seed', 'Root', 'Unknown'])(
  'denies %s despite organization access',
  async (tier) => {
    expect((await contractAccess(setup(tier), orgUser, {})).allowed).toBe(
      false,
    );
  },
);
it.each(['Base', 'Crown'])(
  'allows %s for scoped staff without billing administration',
  async (tier) => {
    expect((await contractAccess(setup(tier), orgUser, {})).allowed).toBe(true);
  },
);
it.each(['canceled', 'unpaid', 'paused', 'incomplete'])(
  'denies a Crown subscription with status %s',
  async (status) => {
    expect(
      (await contractAccess(setup('Crown', status), orgUser, {})).allowed,
    ).toBe(false);
  },
);
it('preserves the existing payment-recovery policy for past_due', async () =>
  expect(
    (await contractAccess(setup('Base', 'past_due'), orgUser, {})).allowed,
  ).toBe(true));
it('denies zero-quantity plan items', async () =>
  expect(
    (await contractAccess(setup('Crown', 'active', 0), orgUser, {})).allowed,
  ).toBe(false));
it('fails closed when Stripe cannot verify entitlement', async () => {
  const s = setup('Crown');
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Unavailable'));
  await expect(contractAccess(s, orgUser, {})).rejects.toThrow('Unavailable');
});
it('retains platform access without requiring Stripe', async () => {
  const query = jest.fn(),
    s = new AdminDomainService({ query } as unknown as Pool);
  expect(
    (
      await contractAccess(
        s,
        {
          user: { id, policy: { policies: [{ name: 'greenstand-admin' }] } },
        } as KeycloakRequest,
        {},
      )
    ).allowed,
  ).toBe(true);
  expect(query).not.toHaveBeenCalled();
});

it('blocks every contract and agreement route before reads or writes for Root', async () => {
  const express = require('express'),
    http = require('supertest');
  const { createDomainRouter } = require('./router');
  const s = setup('Root');
  const contracts = jest.spyOn(s, 'contracts');
  const app = express();
  app.use(express.json());
  app.use((req: KeycloakRequest, _res: unknown, next: () => void) => {
    req.user = orgUser.user;
    next();
  });
  app.use(createDomainRouter(s));
  app.use(
    (
      error: { statusCode?: number; message: string },
      _req: unknown,
      res: { status: (code: number) => { json: (body: unknown) => void } },
      _next: unknown,
    ) => res.status(error.statusCode || 500).json({ message: error.message }),
  );
  for (const [method, path] of [
    ['get', '/contracts'],
    ['post', '/contracts'],
    ['patch', '/contracts/' + id],
    ['get', '/contracts/' + id + '/documents'],
    ['get', '/contracts/' + id + '/history'],
    ['get', '/contract-options'],
    ['get', '/agreements'],
    ['post', '/agreements'],
    ['patch', '/agreements/' + id],
    ['get', '/agreements/' + id + '/history'],
    ['get', '/agreement-options'],
  ]) {
    const result = await http(app)[method](path);
    expect(result.status).toBe(403);
    expect(result.body.error).toMatch('Base or Crown');
  }
  expect(contracts).not.toHaveBeenCalled();
});
