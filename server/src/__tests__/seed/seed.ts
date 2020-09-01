const seed = require("../../tests/seed/seed");
const db = require('../../datasources/treetracker.datasource.json');
const {Pool, Client} = require('pg');
const pool = new Pool({connectionString: db.url});

describe("Seed data into DB", () => {

  beforeAll(async () => {
//    console.log("The DB story:");
//    console.log(seed.description);
    await seed.seed();
  });

  afterAll(async ()  => {
    await seed.clear();
  });

  it("Should have default admin user", async () => {
    let r = await pool.query({
      text: `select * from admin_user where user_name = $1`,
      values: ['admin']
    });
    expect(r).toMatchObject({
      rows: [{
        user_name: "admin",
      }],
    });
  });

  it("Should have organization user", async () => {
    let r = await pool.query({
      text: `select * from admin_user where user_name = $1`,
      values: [seed.users.freetown.username]
    });
    expect(r).toMatchObject({
      rows: [{
        user_name: seed.users.freetown.username,
      }],
    });
  });

  it("Should have some roles", async () => {
    let r = await pool.query({
      text: `select * from admin_role `,
      values: []
    });
    expect(r.rows.length).toBeGreaterThan(0);
  });

  it("Should have an entity, it is an organization", async () => {
    let r = await pool.query({
      text: `select * from entity where type = 'o' `,
      values: []
    });
    expect(r.rows.length).toBeGreaterThan(0);
  });

  it("Should have 2 planter", async () => {
    let r = await pool.query({
      text: `select * from planter`,
      values: []
    });
    expect(r.rows.length).toBe(2);
  });

  it("Should have 5 trees", async () => {
    let r = await pool.query({
      text: `select * from trees`,
      values: []
    });
    expect(r.rows.length).toBe(5);
  });

  it("Freetown should get 2 entity id as children", async () => {
    let r = await pool.query({
      text: `select * from getEntityRelationshipChildren(1)`,
      values: []
    });
    console.log("result:!:", r);
    expect(r.rows.length).toBe(2);
  });


});

export {};
