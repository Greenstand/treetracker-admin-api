/*
 * Seed data to DB for test
 */
const getDatasource = require('../../datasources/config').default;
const db = getDatasource();
const {Pool, Client} = require('pg');
const pool = new Pool({connectionString: db.url});
const policy = require('../../policy.json');



const users = {
  admin: {
    id: 1,
    username: "admin",
    password: "admin",
  },
  test: {
    id: 2,
    username: "test",
    password: "admin",
  },
  freetown: {
    id: 3,
    username: "freetown",
    password: "admin",
    policies: [3,4],
  },
}

const roles = {
  admin: {
    id: 1,
    name: "Admin",
    description: 'The super administrator role, having all permissions',
    policy: {
      policies: [policy.policies[0], policy.policies[1], policy.policies[2]],
    },
  },
  treeManager: {
    id: 2,
    name: "Tree Manager",
    description: 'Check, verify, manage trees',
    policy: {
        policies: [policy.policies[3],policy.policies[4]],
    },
  },
  planterManager: {
    id: 3,
    name: "Planter Manager",
    description: "Check, manage planters",
    policy: {
      policies: [policy.policies[5],policy.policies[6],],
    },
  },
  freetownManager: {
    id: 4,
    name: "Freetown Manager", 
    description: "Manager for oranization freetown",
    policy: {
      policies: [policy.policies[3],policy.policies[4],policy.policies[5],policy.policies[6],],
      organization: {
        name: "freetown",
        id: 1,
      },
    },
  },
}


const entities = [
  {
    id: 1,
    type: 'o',
    name: 'freetown',
  },{
    id: 2,
    type: "p",
    name: "freetownStaffA",
  },{
    id: 3,
    type: "p",
    name: "somePlanter",
  }
]

const entity_relationship = [
  {
    id: 1,
    parent_id: 1,
    child_id: 2,
  },
]

const planters = {
  freetownPlanterA: {
    id: 1,
    first_name: "somePlanter",
    person_id: 3,
    organization_id: 1,
  },
  PlanterB: {
    id: 2,
    first_name: "PlanterB",
    person_id: undefined,
    organization_id: undefined,
  },
}

const trees = [
  {
    id: 1,
  },
  {
    id: 2,
    //just for demonstration
    device_id: 1,
  },
//  {
//    id: 3,
//    planter_id: 1,
//  },
  {
    id: 3,
    planter_id: undefined,
    planting_organization_id: 1,
  },
  {
    id: 4,
    planter_id: undefined,
    planting_organization_id: 2,
  },
  {
    id: 5,
    planter_id: 1,
    planting_organization_id: undefined,
  },
]

const description = 
`
---------------------- story -------------------------
admin user accounts:
  ${JSON.stringify(users, null, 2)}

admin roles: 
  ${JSON.stringify(roles, null, 2)}

entities: 
  ${JSON.stringify(entities, null, 2)}

entity_relationship: 
  ${JSON.stringify(entity_relationship, null, 2)}

planters: 
  ${JSON.stringify(planters, null, 2)}

trees:
  ${JSON.stringify(trees, null, 2)}

---------------------- story end -------------------------
`

async function seed(){
  let sql = 
    `insert into admin_role (id, role_name, description, policy) ` +
      `values` + 
      Object.values(roles).map( role => {
        return `(${role.id}, '${role.name}','${role.description}','${JSON.stringify(role.policy)}')`
      }).join(','); 
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
      `(3, 'freetown', 'organization1', 'Panel', 'eab8461725c44aa1532ed88de947fe0706c00c31ed6d832218a6cf59d7602559a7d372d42a64130f21f1f33091105548514bca805b81ee1f01a068a7b0fa2d80', 'OglBTs','admin@greenstand.org', true)`
  );

  await pool.query(
    `insert into admin_user_role (id, role_id, admin_user_id) ` +
      `values ` +
      `(1, 1, 1), ` +
      `(2, 2, 2), ` +
      `(3, 3, 2),` +
      `(4, 4, 3)`
  );

  await pool.query({
    text: `insert into entity
    (id, type, name)
    values ` + 
    entities.map(entity => {
      return `(${entity.id}, '${entity.type}', '${entity.name}')`
    }).join(","),
    values: []
  });

  await pool.query({
    text: `insert into entity_relationship
    (id, parent_id, child_id, type, role)
    values ` + 
    entity_relationship.map(e => {
      return `(${e.id}, '${e.parent_id}', '${e.child_id}', 'test', 'test')`
    }).join(","),
    values: []
  });

  //planter
  await pool.query({
    text: `insert into planter
    (id, first_name, last_name, person_id, organization_id)
    values ` + 
    Object.values(planters).map(e => {
      return `(${e.id}, '${e.first_name}', 'test', ${e.person_id || null}, ${e.organization_id || null} )`
    }).join(","),
    values: []
  });

  await pool.query({
    text: `insert into trees
    (id, time_created, time_updated, device_id, planter_id, planting_organization_id)
    values ` + 
    trees.map(tree => {
      return `(${tree.id}, $1, $1, ${tree.device_id || null}, ${tree.planter_id || null},${tree.planting_organization_id || null})`
    }).join(","),
    values: [new Date()]
  });

}

async function clear(){
  await pool.query('delete from admin_user');
  await pool.query('delete from admin_user_role');
  await pool.query('delete from admin_role');
  await pool.query('delete from trees');
  await pool.query('delete from planter');
  await pool.query('delete from entity');
  await pool.query('delete from entity_relationship');
}

module.exports = {
  seed,
  clear,
  users,
  roles,
  description,
}

