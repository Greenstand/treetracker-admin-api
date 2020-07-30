/*
 * Seed data to DB for test
 */
const db = require('../../datasources/treetracker.datasource.json');
const {Pool, Client} = require('pg');
const pool = new Pool({connectionString: db.url});
const policy = require('../../policy.json');

const users = {
  admin: {
    username: "admin",
    password: "admin",
  },
  test: {
    username: "test",
    password: "admin",
  },
  organization1: {
    username: "organization1",
    password: "admin",
  },
}

async function seed(){
  let sql = 
    `insert into admin_role (id, role_name, description, policy) ` +
      `values (1, 'Admin', 'The super administrator role, having all permissions','${JSON.stringify({
        policies: [policy.policies[0], policy.policies[1], policy.policies[2]],
      })}'),` +
      `(2, 'Tree Manager', 'Check, verify, manage trees','${JSON.stringify({
        policies: [policy.policies[3],policy.policies[4]],
      })}'),` +
      `(3, 'Planter Manager', 'Check, manage planters','${JSON.stringify({
        policies: [policy.policies[5],policy.policies[6],],
      })}'),` + 
      `(4, 'Organization Tree Manager', 'Check, manage planters','${JSON.stringify({
        policies: [policy.policies[5],policy.policies[6],],
        organizations: [{
          name: "xxx",
          id: "123",
        }],
      })}')`;
  console.log("sql:", sql);
  await pool.query(
    sql
  );

  await pool.query(
    `insert into admin_user (id, user_name, first_name, last_name, password_hash, salt, email, active) ` +
      `values ` +
      `( 1, 'admin', 'Admin', 'Panel', 'eab8461725c44aa1532ed88de947fe0706c00c31ed6d832218a6cf59d7602559a7d372d42a64130f21f1f33091105548514bca805b81ee1f01a068a7b0fa2d80', 'OglBTs','admin@greenstand.org', true),` +
      `( 2, 'test', 'Test', 'Test', 'eab8461725c44aa1532ed88de947fe0706c00c31ed6d832218a6cf59d7602559a7d372d42a64130f21f1f33091105548514bca805b81ee1f01a068a7b0fa2d80', 'OglBTs','test@greenstand.org', true),` +
//      `(2, 'test', 'Admin', 'Test', '539430ec2a48fd607b6e06f3c3a7d3f9b46ac5acb7e81b2633678a8fe3ce6216e2abdfa2bc41bbaa438ba55e5149efb7ad522825d9e98df5300b801c7f8d2c86', 'WjSO0T','test@greenstand.org', true),` +
      `(3, 'organization1', 'organization1', 'Panel', 'eab8461725c44aa1532ed88de947fe0706c00c31ed6d832218a6cf59d7602559a7d372d42a64130f21f1f33091105548514bca805b81ee1f01a068a7b0fa2d80', 'OglBTs','admin@greenstand.org', true)`
  );

  await pool.query(
    `insert into admin_user_role (id, role_id, admin_user_id) ` +
      `values ` +
      `(1, 1, 1), ` +
      `(2, 2, 2), ` +
      `(3, 3, 2),` +
      `(4, 4, 3)`
  );
}

async function clear(){
  await pool.query('delete from admin_user');
  await pool.query('delete from admin_user_role');
  await pool.query('delete from admin_role');
}

module.exports = {
  seed,
  clear,
  users,
}
