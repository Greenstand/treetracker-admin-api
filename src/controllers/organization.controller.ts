import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  get,
  post,
  HttpErrors,
  requestBody,
  getFilterSchemaFor,
  getWhereSchemaFor,
  RestBindings,
} from '@loopback/rest';
import { inject } from '@loopback/context';
import { Organization } from '../models';
import {
  CreateOrganizationData,
  OrganizationRepository,
} from '../repositories';
import { ORGANIZATION_REQUEST_SCHEMA } from '../dto/organization-dto';
import {
  assignOrganizationRole,
  setOrganizationClaim,
} from '../services/keycloakAdminService';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { ErrorCode } from '../types/error-codes';
import { Role } from '../types/roles';
import { Transaction } from 'loopback-connector';

// Extend the LoopBack filter types for the Planter model to include type
type OrganizationWhere = (Where<Organization> & { type?: string }) | undefined;
export type OrganizationFilter = Filter<Organization> & {
  where: OrganizationWhere;
};

export class OrganizationController {
  constructor(
    @repository(OrganizationRepository)
    public organizationRepository: OrganizationRepository,
    @inject(RestBindings.Http.REQUEST, { optional: true })
    private request?: KeycloakRequest,
  ) {}

  @get('/organizations/count', {
    responses: {
      '200': {
        description: 'Organization model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Organization))
    where?: Where<Organization>,
  ): Promise<Count> {
    return await this.organizationRepository.count(where);
  }

  @get('/organizations', {
    responses: {
      '200': {
        description: 'Array of Organization model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Organization } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Organization))
    filter?: Filter<Organization>,
  ): Promise<Organization[]> {
    return await this.organizationRepository.find(filter);
  }

  @post('/organizations', {
    responses: {
      '200': {
        description: 'Organization POST success',
        content: {
          'application/json': {
            schema: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: ORGANIZATION_REQUEST_SCHEMA,
        },
      },
    })
    organization: CreateOrganizationData,
  ): Promise<Organization> {
    if (this.requestHasRole(Role.ORGANIZATION)) {
      const error = new HttpErrors.Forbidden(
        'User already belongs to an organization',
      ) as HttpErrors.HttpError & { code?: string };
      error.code = ErrorCode.ORGANIZATION_ROLE_ALREADY_ASSIGNED;
      throw error;
    }

    const tx = await this.organizationRepository.dataSource.beginTransaction({
      isolationLevel: Transaction.READ_COMMITTED,
    });

    try {
      const created = await this.organizationRepository.createOrganization(
        organization,
        { transaction: tx },
      );

      if (
        process.env.KEYCLOAK_URL &&
        process.env.KEYCLOAK_ADMIN_ID &&
        process.env.KEYCLOAK_ADMIN_CLIENT_SECRET
      ) {
        const userId = this.request?.user?.id;
        const organizationId = Number(created.id);

        if (userId) {
          try {
            await setOrganizationClaim(userId, organizationId);
          } catch (error) {
            console.error(
              'Failed to update organization claim in Keycloak:',
              error,
            );

            const claimError = new HttpErrors.InternalServerError(
              'Organization claim update failed',
            ) as HttpErrors.HttpError & { code?: string };
            claimError.code = ErrorCode.ORGANIZATION_CLAIM_UPDATE_FAILED;
            throw claimError;
          }

          try {
            await assignOrganizationRole(userId);
          } catch (error) {
            console.error(
              'Failed to assign organization role in Keycloak:',
              error,
            );

            const roleError = new HttpErrors.InternalServerError(
              'Organization role assignment failed',
            ) as HttpErrors.HttpError & { code?: string };
            roleError.code = ErrorCode.ORGANIZATION_ROLE_ASSIGNMENT_FAILED;
            throw roleError;
          }
        }
      }

      await tx.commit();
      return created;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  // inpired from fe
  private requestHasRole(roleName: string): boolean {
    const policies = this.request?.user?.policy?.policies ?? [];

    return policies.some((policy) => policy.name === roleName);
  }

  @get('/organization/{organizationId}/organizations', {
    responses: {
      '200': {
        description: 'Array of Organization model instances by Org',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Organization } },
          },
        },
      },
    },
  })
  async findByParentOrg(
    @param.path.number('organizationId') organizationId: Number,
    @param.query.object('filter', getFilterSchemaFor(Organization))
    filter?: OrganizationFilter,
  ): Promise<Organization[]> {
    // create query to get all orgs and their planters
    if (filter?.where) {
      filter.where =
        await this.organizationRepository.applyOrganizationWhereClause(
          filter.where,
          organizationId.valueOf(),
        );
    }

    const childOrgs = await this.organizationRepository.find(filter);

    return childOrgs;
  }

  @get('/organizations/{id}', {
    responses: {
      '200': {
        description: 'Organization model instance',
        content: {
          'application/json': { schema: { 'x-ts-type': Organization } },
        },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Organization> {
    return await this.organizationRepository.findById(id);
  }
}
