/*
 * To record operation on the system
 */
const {Pool, Client} = require('pg');
const log = require('loglevel');
const db = require('../datasources/treetracker.datasource.json');
//const assert = require('assert').strict;

const operations = {
  login: {
    type: 'login',
  },
  tree_verify: {
    type: 'tree_verify',
  },
};

const auditMiddleware = (request, response, next) => {
  try {
    const oldJSON = response.json;
    response.on('finish', async function() {
      try {
        //console.log('req:', req);
        //console.log('req.header:', request.headers);
        //just audit when success
        //assert(response.statusCode);
        if (/2\d\d/.test(response.statusCode)) {
          const audit = new Audit();
          await audit.did(request, response);
        } else {
          //console.log('quit when failed');
        }
      } catch (e) {
        console.error(e);
        next(e);
      }
    });
    response.json = data => {
      //console.log('data:', data);
      // For Async call, handle the promise and then set the data to `oldJson`
      if (data && data.then != undefined) {
        // Resetting json to original to avoid cyclic call.
        return data
          .then(responseData => {
            // Custom logic/code.
            response.json = oldJSON;
            response.myData = responseData;
            return oldJSON.call(response, responseData);
          })
          .catch(error => {
            next(error);
          });
      } else {
        // For non-async interceptor functions
        // Resetting json to original to avoid cyclic call.
        // Custom logic/code.
        response.json = oldJSON;
        response.myData = data;
        return oldJSON.call(response, data);
      }
    };
  } catch (error) {
    next(error);
  }
  next();
};

class Audit {
  constructor() {
    this.pool = new Pool({connectionString: db.url});
  }

  async did(req, res) {
    //assert(req);
    //assert(req.headers);
    //assert(req.headers.host);
    //assert(req.headers['user-agent']);
    const host = req.headers['x-real-ip'] || req.headers.host.match(/(.*):(.*)/)[1];
    const userAgent = req.headers['user-agent'];
    let operation;
    let operator;
    const url = req.originalUrl;
    //assert(url);
    if (/\/auth\/login/.test(url)) {
      console.info('login event');
      operation = operations.login;
      //assert(res.myData);
      //assert(!isNaN(res.myData.user.id), res.myData.user.id);
      operator = res.myData.user.id;
    } else if (/.*\/api\/trees\/\d+/.test(url)) {
      console.info('tree event');
      //assert(req.method, req.method);
      //assert(req.user);
      //assert(req.user.id);
      operator = req.user.id;
      if (req.method.match(/patch/i)) {
        console.info('verify event');
        //assert(req.body.id, req.body.id);
        operation = operations.tree_verify;
        operation.payload = req.body;
      } else {
        //console.log('no need audit', url);
        return;
      }
    } else {
      //console.log('no need audit', url);
      return;
    }
    //assert(operation);
    //assert(operator);
    //console.warn('res:', res);
    const sql = `insert into audit ("admin_user_id", platform, ip, browser, organization, operation) values (${operator}, 'admin_panel', '${host}', '${userAgent}', 'greenstand', '${JSON.stringify(
      operation,
    )}')`;
    //console.debug('audit sql:', sql);

    await this.pool.query(sql);
  }
}

module.exports = Audit;
module.exports.auditMiddleware = auditMiddleware;
