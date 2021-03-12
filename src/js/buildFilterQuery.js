import { ParameterizedSQL } from 'loopback-connector';

export function getConnector(repo) {
  return repo?.dataSource?.connector;
}

export function buildFilterQuery(sql, params) {
  let query = new ParameterizedSQL(sql);

  if (params.filter) {
    const connector = getConnector(params.repo);
    if (connector) {
      const model = connector._models[params.model].model;

      if (model) {
        let safeWhere = model._sanitizeQuery(params.filter);
        safeWhere = model._coerce(safeWhere);

        const whereObjClause = connector._buildWhere(params.model, safeWhere);

        if (whereObjClause.sql) {
          const hasWhere = /WHERE(?![^(]*\))/i.test(sql);
          query.sql += ` ${hasWhere ? 'AND' : 'WHERE'} ${whereObjClause.sql}`;
          query.params = whereObjClause.params;
        }

        query = connector.parameterize(query);
      }
    }
  }

  return query;
}
