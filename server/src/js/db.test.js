const {Pool, Client} = require('pg');

//const pool = new Pool({ connectionString: "postgres://deanchen:@localhost:5432/treetracker"});

describe.skip('', () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: 'postgres://deanchen:@localhost:5432/postgres',
    });
  });

  it('db', async () => {
    const query = {
      text:
        "select * from admin_user where user_name ='admin' and password_hash='admin'",
      values: [],
    };
    const result = await pool.query(query);
    console.log('DB result:', result);
  });

  it('db', async () => {
    const query = {
      text: 'select * from admin_user_role',
      values: [],
    };
    const result = await pool.query(query);
    console.log('DB result:', result.rows);
  });

  it('update', async () => {
    const result = await pool.query(
      "update admin_user set password_hash = 'xxx2' where id = 1",
    );
    console.log('update result:', result);
  });

  it('insert', async () => {
    const result = await pool.query(
      "insert into admin_user (id, user_name, first_name) values(4, 'a', 'b')",
    );
    console.log('update result:', result);
  });
});
