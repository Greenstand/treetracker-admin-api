/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ParameterizedSQL } from 'loopback-connector';

export function getConnector(repo) {
  return repo?.dataSource?.connector;
}

// This method is based on LoopBack's SQLConnector.prototype.buildSelect(),
// but caters for JOINS and existing WHERE in the SELECT statement passed in.
// (See node_modules/loopback_connector/lib/sql.js)
export function buildFilterQuery(selectStmt, params) {
  let query = new ParameterizedSQL(selectStmt);

  if (!params) {
    return query;
  }

  const { modelName, repo, filter } = params;
  const connector = getConnector(repo);

  if (filter && modelName && connector) {
    if (filter.where) {
      const model = connector.getModelDefinition(modelName)?.model;

      if (model) {
        let safeWhere = model._sanitizeQuery(filter.where);
        safeWhere = model._coerce(safeWhere);

        const whereObjClause = connector._buildWhere(modelName, safeWhere);

        //add the modelName to each requested field to avoid ambiguity in more complex queries
        console.log('whereObjClause.sql -------> ', whereObjClause.sql);

        const tableName =
          modelName.toLowerCase() === 'planterregistration'
            ? 'planter_registrations'
            : modelName.toLowerCase();
        const newQueryFields = whereObjClause.sql
          .replace(/"/, `"${tableName}.`)
          .replace(/AND "/gi, `AND "${tableName}.`)
          .replace(/"/g, '');

        whereObjClause.sql = newQueryFields;

        if (whereObjClause.sql) {
          const hasWhere = /WHERE(?![^(]*\))/i.test(selectStmt);
          query.sql += ` ${hasWhere ? 'AND' : 'WHERE'} ${whereObjClause.sql}`;
          query.params = whereObjClause.params;
        }

        query = connector.parameterize(query);
      }
    }

    if (filter.order) {
      query.merge(connector.buildOrderBy(modelName, filter.order));
    }

    if (filter.limit || filter.skip || filter.offset) {
      query = connector.applyPagination(modelName, query, filter);
    }
  }

  // console.log('QUERY ---------', query);

  return query;
}
