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
import { ParameterizedSQL } from 'loopback-connector';
import { Trees } from '../models';
import { TreesRepository } from '../repositories';

// Extend the LoopBack filter types for the Trees model to include tagId
// This is a workaround for the lack of proper join support in LoopBack
type TreesWhere = Where<Trees> & { tagId?: string, organizationId?: number };
type TreesFilter = Filter<Trees> & { where: TreesWhere };

export class TreesController {
  constructor(
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
  ) { }

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

    // Replace organizationId with full entity tree and planter
    if (where && where.organizationId !== undefined) {
      const clause = await this.treesRepository.getOrganizationWhereClause(where.organizationId)
      where = {
        ...where,
        ...clause,
      }
      delete where.organizationId;
    }

    // In order to filter by tagId (treeTags relation), we need to bypass the LoopBack count()
    if (where && where.tagId !== undefined) {
      try {
        const isTagNull = where.tagId === null
        const query = this.buildFilterQuery(
          `SELECT COUNT(*) FROM trees`,
          `${isTagNull ? 'LEFT JOIN' : 'JOIN'} tree_tag ON trees.id=tree_tag.tree_id`,
          `WHERE tree_tag.tag_id ${isTagNull ? 'IS NULL' : `=${where.tagId}`}`,
          where,
        );

        return <Promise<Count>>(
          await this.treesRepository
            .execute(query.sql, query.params)
            .then((res) => {
              return (res && res[0]) || { count: 0 };
            })
        );
      } catch (e) {
        console.log(e);
        return await this.treesRepository.count(where);
      }
    } else {
      return await this.treesRepository.count(where);
    }
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
    console.log(filter, filter ? filter.where : null);

    // Replace plantingOrganizationId with full entity tree and planter
    if (filter && filter.where && filter.where.organizationId !== undefined) {
      const clause = await this.treesRepository.getOrganizationWhereClause(
        filter.where.organizationId
      );
      filter.where = {
        ...filter.where,
        ...clause,
      }
      delete filter.where.organizationId;
    }

    // In order to filter by tagId (treeTags relation), we need to bypass the LoopBack find()
    if (filter && filter.where && filter.where.tagId !== undefined) {
      try {
        const connector = this.getConnector();
        if (connector) {
          // If included, replace 'id' with 'tree_id as id' to avoid ambiguity
          const columnNames = connector
            .buildColumnNames('Trees', filter)
            .replace('"id"', 'trees.id as "id"')

          const isTagNull = filter.where.tagId === null
          const query = this.buildFilterQuery(
            `SELECT ${columnNames} from trees`,
            `${isTagNull ?
              'LEFT JOIN tree_tag ON trees.id=tree_tag.tree_id ORDER BY "time_created" DESC'
              :
              'JOIN tree_tag ON trees.id=tree_tag.tree_id'}`,
            `WHERE tree_tag.tag_id ${isTagNull ? 'IS NULL' : `=${filter.where.tagId}`}`,
            filter.where,
          );

          return <Promise<Trees[]>>(
            await this.treesRepository
              .execute(query.sql, query.params)
              .then((data) => {
                return data.map((obj) => connector.fromRow('Trees', obj));
              })
          );
        } else {
          throw 'Connector not defined';
        }
      } catch (e) {
        console.log(e);
        return await this.treesRepository.find(filter);
      }
    } else {
      return await this.treesRepository.find(filter);
    }
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
    const query = `SELECT * FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(${lat}, ${lon}), ${radius ? radius : 100
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
    await this.treesRepository.updateById(id, trees);
  }

  private getConnector() {
    return this.treesRepository.dataSource.connector;
  }

  private buildFilterQuery(
    selectClause: string,
    joinClause?: string,
    whereClause?: string,
    whereObj?: TreesWhere,
  ) {
    let sql = selectClause;
    if (joinClause) {
      sql += ` ${joinClause}`;
    }

    if (whereClause) {
      sql += ` ${whereClause}`;
    }

    let query = new ParameterizedSQL(sql);

    if (whereObj) {
      const connector = this.getConnector();
      if (connector) {
        const model = connector._models.Trees.model;

        if (model) {
          let safeWhere = model._sanitizeQuery(whereObj);
          safeWhere = model._coerce(safeWhere);

          const whereObjClause = connector._buildWhere('Trees', safeWhere);

          if (whereObjClause && whereObjClause.sql) {
            query.sql += ` ${whereClause ? 'AND' : 'WHERE'} ${whereObjClause.sql
              }`;
            query.params = whereObjClause.params;
          }

          query = connector.parameterize(query);
        }
      }
    }

    return query;
  }
}
