const seed = require("../../tests/seed/seed");
const db = require('../../datasources/treetracker.datasource.json');
const {Pool, Client} = require('pg');
const pool = new Pool({connectionString: db.url});

describe("Seed data into DB", () => {

  beforeAll(async () => {
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
      values: ['organization1']
    });
    expect(r).toMatchObject({
      rows: [{
        user_name: "organization1",
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


});

