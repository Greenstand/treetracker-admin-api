/*
 * To record operation on the system
 */
const {Pool, Client} = require('pg');
const log = require('loglevel');
const db = require('../datasources/treetracker.datasource.json');
const assert = require('assert').strict;

const operations = {
  login: {
    type: 'login',
  },
};

class Audit {
  constructor() {
    this.pool = new Pool({connectionString: db.url});
  }

  async did(req, res) {
    assert(req);
    assert(req.headers);
    assert(req.headers.host);
    assert(req.headers['user-agent']);
    const host = req.headers.host.match(/(.*):(.*)/)[1];
    const userAgent = req.headers['user-agent'];
    assert(/\/auth\/login/.test(req.baseUrl), req.baseUrl);
    const operation = operations[Audit.TYPE.LOGIN];
    assert(operation);
    assert(res.myData);
    assert(!isNaN(res.myData.id), res.myData.id);
    const operator = res.myData.id;
    //console.warn('res:', res);
    const sql = `insert into audit ("operator", platform, ip, browser, organization, operation) values (${operator}, 'admin_panel', '${host}', '${userAgent}', 'greenstand', '${JSON.stringify(
      operation,
    )}')`;
    console.debug('audit sql:', sql);
    await this.pool.query(sql);
  }
}

Audit.TYPE = {
  LOGIN: 'login',
};

module.exports = Audit;
