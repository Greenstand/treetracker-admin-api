import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  // post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  // put,
  // del,
  requestBody,
} from '@loopback/rest';
import { Trees } from '../models';
import { TreesRepository, DomainEventRepository } from '../repositories';
import { publishMessage } from '../messaging/RabbitMQMessaging.js';
import { config } from '../config.js';
import { v4 as uuid } from 'uuid';
import { Transaction } from 'loopback-connector';

// Extend the LoopBack filter types for the Trees model to include tagId
// This is a workaround for the lack of proper join support in LoopBack
type TreesWhere =
  | (Where<Trees> & { tagId?: string; organizationId?: number })
  | undefined;
export type TreesFilter = Filter<Trees> & { where: TreesWhere };

export class TreesController {
  constructor(
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
    @repository(DomainEventRepository)
    public domainEventRepository: DomainEventRepository,
  ) {}

  @get('/trees/count', {
    responses: {
      '200': {
        description: 'Trees model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Trees)) where?: TreesWhere,
  ): Promise<Count> {
    const tagId = where?.tagId;

    // Replace organizationId with full entity tree and planter
    if (where) {
      const { organizationId, ...whereWithoutOrganizationId } = where;
      where = await this.treesRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        organizationId,
      );
    }

    // console.log('get /trees/count where --> ', where);

    return await this.treesRepository.countWithTagId(
      where as Where<Trees>,
      tagId,
    );
  }

  @get('/trees', {
    responses: {
      '200': {
        description: 'Array of Trees model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Trees } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Trees))
    filter?: TreesFilter,
  ): Promise<Trees[]> {
    const tagId = filter?.where?.tagId;

    // Replace organizationId with full entity tree and planter
    if (filter?.where) {
      const { organizationId, ...whereWithoutOrganizationId } = filter.where;
      filter.where = await this.treesRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        organizationId,
      );
    }

    // console.log('get /trees filter --> ', filter?.where);
    // In order to filter by tagId (treeTags relation), we need to bypass the LoopBack find()
    return await this.treesRepository.findWithTagId(filter, tagId);
  }

  @get('/trees/{id}', {
    responses: {
      '200': {
        description: 'Trees model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Trees } } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Trees> {
    return await this.treesRepository.findById(id, {
      include: [{ relation: 'treeTags' }],
    });
  }

  // this route is for finding trees within a radius of a lat/lon point
  // execute commands for postgress seen here: https://github.com/strongloop/loopback-connector-postgresql/blob/master/lib/postgresql.js
  @get('/trees/near', {
    responses: {
      '200': {
        description: 'Find trees near a lat/lon with a radius in meters',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Trees } },
          },
        },
      },
    },
  })
  async near(
    @param.query.number('lat') lat: number,
    @param.query.number('lon') lon: number,
    @param({
      name: 'radius',
      in: 'query',
      required: false,
      schema: { type: 'number' },
      description: 'measured in meters (default: 100 meters)',
    })
    radius: number,
    @param({
      name: 'limit',
      in: 'query',
      required: false,
      schema: { type: 'number' },
      description: 'default is 100',
    })
    limit: number,
  ): Promise<Trees[]> {
    const query = `SELECT * FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(${lat}, ${lon}), ${
      radius ? radius : 100
    }, false) LIMIT ${limit ? limit : 100}`;
    console.log(`near query: ${query}`);
    return <Promise<Trees[]>>await this.treesRepository.execute(query, []);
  }

  @patch('/trees/{id}', {
    responses: {
      '204': {
        description: 'Trees PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() trees: Trees,
  ): Promise<void> {
    const tx = await this.treesRepository.dataSource.beginTransaction({
      isolationLevel: Transaction.READ_COMMITTED,
    });
    try {
      let verifyCaptureProcessed;
      let domainEvent;
      if (config.enableVerificationPublishing) {
        const storedTree = await this.treesRepository.findById(id);
        // Raise an event to indicate verification is processed
        // on both rejection and approval
        if (
          (!trees.approved && !trees.active && storedTree.active) ||
          storedTree.approved != trees.approved
        ) {
          verifyCaptureProcessed = {
            id: storedTree.uuid,
            reference_id: storedTree.id,
            type: 'VerifyCaptureProcessed',
            approved: trees.approved,
            rejection_reason: trees.rejectionReason,
            created_at: new Date().toISOString(),
          };
          domainEvent = {
            id: uuid(),
            payload: verifyCaptureProcessed,
            status: 'raised',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await this.domainEventRepository.create(domainEvent, {
            transaction: tx,
          });
        }
      }
      await this.treesRepository.updateById(id, trees, { transaction: tx });
      await tx.commit();
      if (verifyCaptureProcessed) {
        await publishMessage(verifyCaptureProcessed, () => {
          this.domainEventRepository.updateById(domainEvent.id, {
            status: 'sent',
            updatedAt: new Date().toISOString(),
          });
        });
      }
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
