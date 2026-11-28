import {
  contractOptions,
  workerVerification,
  saveContract,
  contractHistory,
} from './contracts';
import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import getDatasource from '../datasources/config';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { AdminDomainService } from './service';
import { DomainError } from './validation';
import { subscriptionPlanCatalog } from './plans';
import { members, saveMember } from './members';
import { billingStatus, openBilling } from './checkout';
import { verificationQueue, verifyCaptures } from './verification';
import {
  projectGrowers,
  projectGrowerHistory,
  changeProjectGrower,
} from './projectGrowers';
import { subscriptionUsage } from './subscriptionUsage';
import { captureTags } from './captureTags';
import { sessionProject, changeSessionProject } from './sessionProject';
import { allocationPreview } from './growerAllocation';
import { growerTransfers, transferGrower } from './growerTransfer';

export function createDomainRouter(service: AdminDomainService) {
  const router = express.Router();
  router.use(
    (request: KeycloakRequest, _response: Response, next: NextFunction) => {
      if (!request.user)
        return next(new DomainError(401, 'Sign in is required'));
      if (
        !request.user.policy.policies.some((p) =>
          ['greenstand-admin', 'org', 'org-admin-saas'].includes(p.name),
        )
      ) {
        return next(new DomainError(403, 'Organization access is required'));
      }
      next();
    },
  );
  const platform = (
    request: KeycloakRequest,
    _response: Response,
    next: NextFunction,
  ) => {
    if (
      !request.user?.policy.policies.some((p) => p.name === 'greenstand-admin')
    )
      return next(new DomainError(403, 'Platform admin access is required'));
    next();
  };
  const route =
    (
      handler: (request: KeycloakRequest) => Promise<unknown>,
      created = false,
    ) =>
    (request: Request, response: Response, next: NextFunction) => {
      Promise.resolve()
        .then(() => handler(request))
        .then((result) => response.status(created ? 201 : 200).json(result))
        .catch(next);
    };
  router.get(
    '/context',
    route(async (req) => {
      const organizationId = await service.organization(req);
      return {
        organizationId,
        permissions: await service.permissions(req, organizationId),
      };
    }),
  );
  router.get(
    '/dashboard',
    route((req) => service.dashboard(req, req.query)),
  );
  router.get(
    '/organizations',
    route((req) => service.organizations(req, req.query)),
  );
  router.post(
    '/organizations',
    platform,
    route((req) => service.saveOrganization(undefined, req.body), true),
  );
  router.patch(
    '/organizations/:id',
    platform,
    route((req) => service.saveOrganization(req.params.id, req.body)),
  );
  router.get(
    '/projects',
    route((req) => service.projects(req, req.query)),
  );
  router.post(
    '/projects',
    route((req) => service.saveProject(req, undefined, req.body), true),
  );
  router.patch(
    '/projects/:id',
    route((req) => service.saveProject(req, req.params.id, req.body)),
  );
  router.get(
    '/projects/:id/growers',
    route((req) => projectGrowers(service, req, req.params.id, req.query)),
  );
  router.get(
    '/projects/:id/grower-history',
    route((req) =>
      projectGrowerHistory(service, req, req.params.id, req.query),
    ),
  );
  router.post(
    '/projects/:id/growers/:growerId',
    route((req) =>
      changeProjectGrower(
        service,
        req,
        req.params.id,
        req.params.growerId,
        req.body,
      ),
    ),
  );
  router.get(
    '/capture-tags',
    route((req) => captureTags(service, req, req.query)),
  );
  router.get(
    '/verification',
    route((req) => verificationQueue(service, req, req.query)),
  );
  router.post(
    '/verification',
    route((req) => verifyCaptures(service, req, req.body)),
  );
  router.get(
    '/growers/:id/allocation-preview',
    platform,
    route((req) => allocationPreview(service, req, req.params.id, req.query)),
  );
  router.get(
    '/growers/:id/organization-history',
    platform,
    route((req) => growerTransfers(service, req, req.params.id)),
  );
  router.post(
    '/growers/:id/organization',
    platform,
    route((req) => transferGrower(service, req, req.params.id, req.body)),
  );
  router.get(
    '/growers',
    route((req) => service.growers(req, req.query)),
  );
  router.get(
    '/growers/:id',
    route((req) => service.growerAccount(req, req.params.id, req.query)),
  );
  router.get(
    '/sessions',
    route((req) => service.sessions(req, req.query)),
  );
  router.get(
    '/sessions/:id/project',
    route((req) => sessionProject(service, req, req.params.id, req.query)),
  );
  router.post(
    '/sessions/:id/project',
    route((req) => changeSessionProject(service, req, req.params.id, req.body)),
  );
  router.get(
    '/sessions/:id/map',
    route((req) => service.sessionMap(req, req.params.id)),
  );
  router.get(
    '/sessions/:id/captures',
    route((req) => service.sessionDetail(req, req.params.id)),
  );
  router.get(
    '/contract-options',
    route((req) => contractOptions(service, req, req.query)),
  );
  router.post(
    '/contracts',
    route((req) => saveContract(service, req, undefined, req.body), true),
  );
  router.patch(
    '/contracts/:id',
    route((req) => saveContract(service, req, req.params.id, req.body)),
  );
  router.get(
    '/contracts/:id/history',
    route((req) => contractHistory(service, req, req.params.id)),
  );
  router.get(
    '/growers/:id/worker-verification',
    platform,
    route((req) => workerVerification(service, req, req.params.id)),
  );
  router.post(
    '/growers/:id/worker-verification',
    platform,
    route(
      (req) => workerVerification(service, req, req.params.id, req.body),
      true,
    ),
  );
  router.get(
    '/contracts',
    route((req) => service.contracts(req, req.query)),
  );
  router.get(
    '/contracts/:id/documents',
    route((req) => service.contractDocuments(req, req.params.id)),
  );
  router.get(
    '/species-choices',
    route((req) => service.speciesChoices(req, req.query)),
  );
  router.get(
    '/species',
    route((req) =>
      service.species({
        ...req.query,
        includeHidden: req.user?.policy.policies.some(
          (p) => p.name === 'greenstand-admin',
        )
          ? req.query.includeHidden
          : 'false',
      }),
    ),
  );
  router.post(
    '/species',
    platform,
    route((req) => service.saveSpecies(undefined, req.body), true),
  );
  router.patch(
    '/species/:id',
    platform,
    route((req) => service.saveSpecies(req.params.id, req.body)),
  );
  router.get(
    '/species-selection',
    route((req) => service.speciesSelection(req, req.query)),
  );
  router.put(
    '/species-selection',
    route((req) => service.saveSpeciesSelection(req, req.body)),
  );
  router.get(
    '/saas/users',
    platform,
    route(async (req) =>
      (await import('./billing')).saasUsers(service.pool, req.query),
    ),
  );
  router.get(
    '/billing',
    route((req) => billingStatus(service, req, req.query)),
  );
  router.post(
    '/billing/session',
    route((req) => openBilling(service, req, req.body)),
  );
  router.get(
    '/organization-users',
    route((req) => members(service, req, req.query)),
  );
  router.put(
    '/organization-users/:id',
    route((req) => saveMember(service, req, req.params.id, req.body)),
  );
  router.get(
    '/subscription-usage',
    route((req) => subscriptionUsage(service, req, req.query)),
  );
  router.get(
    '/subscription-plans',
    route(async () => ({
      captureAllowanceBasis: 'total-managed',
      plans: await subscriptionPlanCatalog(),
    })),
  );
  router.use(
    (
      error: Error & { code?: string; statusCode?: number },
      _req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (res.headersSent) return next(error);
      if (error instanceof DomainError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      if (error.code === '23505') {
        res
          .status(409)
          .json({ error: 'This code or selection already exists' });
        return;
      }
      console.error('Admin domain operation failed', error.code ?? error.name);
      res.status(503).json({
        error:
          'The domain service could not complete this operation. Try again or contact an administrator.',
      });
    },
  );
  return router;
}
export function createDomainPool() {
  const config = getDatasource();
  return new Pool({
    connectionString: config.url,
    max: 5,
    connectionTimeoutMillis: 7000,
    statement_timeout: 15000,
    ssl: process.env.PGSSLROOTCERT
      ? {
          ca: readFileSync(process.env.PGSSLROOTCERT, 'utf8'),
          rejectUnauthorized: true,
        }
      : config.ssl,
  });
}
