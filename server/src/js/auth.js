const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret =
  '3n398nrNMSI992298948)#€/#/€#€Q/H/DFN/FNF90DFNM(FN)(Fn)(FDN)(DNF)(æ';
const {Pool, Client} = require("pg");
const {utils} = require("./utils");
const config = require("../datasources/treetracker.datasource.json");

//const pool = new Pool({ connectionString: "postgres://deanchen:@localhost:5432/postgres"});
//const pool = new Pool({ connectionString: "postgresql://doadmin:l5al4hwte8qmj6x8@db-postgresql-sfo2-nextgen-do-user-1067699-0.db.ondigitalocean.com:25060/treetracker_dev?ssl=true"});
//const pool = new Pool({ connectionString: "postgres://treetracker:tr33dev@107.170.246.116:5432/treetracker"});
//const pool = new Pool({ connectionString: "postgresql://doadmin:g7a1fey4jeqao9mg@db-postgresql-sfo2-40397-do-user-1067699-0.db.ondigitalocean.com:25060/treetracker?ssl=true"});
const pool = new Pool({ connectionString: config.url});

const PERMISSIONS = {
  ADMIN : 1,
  TREE_AUDITOR: 2,
  PLANTER_MANAGER: 3,
}

const user = {
  id: 1,
  username: 'dadiorchen',
  firstName: 'Dadior',
  lastName: 'Chen',
  password: '123456',
  role: [0, 1],
  email: 'dadiorchen@outlook.com',
};

const userB = {
  id: 2,
  username: 'bbb',
  firstName: 'B',
  lastName: 'B',
  password: '123456',
  role: [1],
  email: 'b@outlook.com',
};

const permissions = [
  {
    id: 0,
    name: 'Admin',
    description: 'Admin pemission',
  },
  {
    id: 1,
    name: 'Tree Auditor',
    description: 'Veify & view trees',
  },
  {
    id: 2,
    name: 'Planter Manager',
    description: 'Check & manage planters',
  },
];

const users = [user, userB];

router.get('/permissions', async function login(req, res, next) {
  try {
    const result = await pool.query(`select * from admin_role`);
    res.status(200).json(result.rows.map(r => utils.convertCamel(r)));
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.post('/login', async function login(req, res, next) {
  try {
    const {userName, password} = req.body;
    //console.log(pool);
    let result = await pool.query(`select * from admin_user where user_name = '${userName}' and password_hash = '${password}'`);
    let userLogin;
    if(result.rows.length === 1){
      userLogin = utils.convertCamel(result.rows[0]);
      //load role
      console.assert(userLogin.id >= 0, "id?", userLogin);
      result = await pool.query(`select * from admin_user_role where admin_user_id = ${userLogin.id}`);
      userLogin.role = result.rows.map(r => r.role_id);
    }
    
    if (userLogin) {
      //TODO get user
      const token = await jwt.sign(userLogin, jwtSecret);
      return res.json({
        token,
        user: userLogin,
      });
    } else {
      return res.status(401).json();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/test', async function login(req, res, next) {
  res.send('OK');
});

router.get('/admin_users/:userId', async (req, res, next) => {
  try {
    //console.log(pool);
    let result = await pool.query(`select * from admin_user where id=${req.params.userId}`);
    let userGet;
    if(result.rows.length === 1){
      userGet = utils.convertCamel(result.rows[0]);
      //load role
      result = await pool.query(`select * from admin_user_role where role_id = ${userGet.id}`);
      userGet.role = result.rows.map(r => r.role_id);
    }
    if (userGet) {
      res.status(200).json(userGet);
    } else {
      res.status(404).json();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.put('/admin_users/:userId/password', async (req, res, next) => {
  try {
    const result = await pool.query(`update admin_user set password_hash = '${req.body.password}' where id = ${req.params.userId}`);
    res.status(200).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.patch('/admin_users/:userId', async (req, res, next) => {
  try {
    const update = `update admin_user set ${utils.buildUpdateFields(req.body)} where id = ${req.params.userId}`;
    console.log("update:", update)
    let result = await pool.query(update);
    //role
    result = await pool.query(`delete from admin_user_role where admin_user_id = ${req.params.userId}`);
    if(req.body.role){
      for(let i = 0; i < req.body.role.length; i++){
        let result = await pool.query(`insert into admin_user_role (role_id, admin_user_id) values (${req.body.role[i]},${req.params.userId})`);
      }
    }
    res.status(200).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.get('/admin_users/', async (req, res, next) => {
  try {
    let result = await pool.query(`select * from admin_user`);
    const users = [];
    for(let i = 0; i <  result.rows.length; i++){
      const r = result.rows[i];
      const roles = await pool.query(`select * from admin_user_role where admin_user_id = ${r.id}`);
      r.role = roles.rows.map(rr => rr.role_id);
      users.push(utils.convertCamel(r));
    }
    res.status(200).json(users);
  } catch (e){
    console.error(e);
    res.status(500).json();
  }
});

router.post('/admin_users/', async (req, res, next) => {
  try {
    req.body.passwordHash = req.body.password;
    delete req.body.password;
    let result = await pool.query(`select * from admin_user where user_name = '${req.body.userName}'`);
    if(result.rows.length === 1){
      //TODO 401
      res.status(201).json({id: result.rows[0].id});
      return;
    }
    const insert = `insert into admin_user ${utils.buildInsertFields(req.body)}`;
    console.log("insert:", insert);
    await pool.query(insert);
    result = await pool.query(`select * from admin_user where user_name = '${req.body.userName}'`);
    let obj;
    if(result.rows.length === 1){
      obj = result.rows[0];
      //roles
      //role
      await pool.query(`delete from admin_user_role where admin_user_id = ${obj.id}`);
      for(let i = 0; i < req.body.role.length; i++){
        const insertRole = `insert into admin_user_role (role_id, admin_user_id) values (${req.body.role[i]},${obj.id})`;
        console.log("insert role:", insertRole);
        await pool.query(insertRole);
      }
    }else{
      throw new Error("can not find new user");
    }
    res.status(201).json({id: obj.id});
  } catch(e) {
    console.error(e);
    res.status(500).json();
  }
});

const isAuth = (req, res, next) => {
  //white list
//  console.error("req.originalUrl", req.originalUrl);
  const url = req.originalUrl;
  if (url === '/auth/login' || url === '/auth/test') {
    next();
    return;
  }
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, jwtSecret);
    const userSession = decodedToken;
    req.user = userSession;
    const roles = userSession.role;
    if (url.match(/\/auth\/(?!login).*/)) {
      //if role is admin, then can do auth stuff
      if (userSession.role.some(r => r === PERMISSIONS.ADMIN)) {
        next();
        return;
      }else{
        res.status(401).json({
          error: new Error('No permission'),
        });
        return;
      }
    } else if(url.match(/\/api\/.*/)){
      if(url.match(/\/api\/trees\/.*/)){
        if(roles.includes(PERMISSIONS.ADMIN) || roles.includes(PERMISSIONS.TREE_AUDITOR)){
          next();
          return;
        }else{
          res.status(401).json({
            error: new Error('No permission'),
          });
          return;
        }
      }else if(url.match(/\/api\/planter\/.*/)){
        if(roles.includes(PERMISSIONS.ADMIN) || roles.includes(PERMISSIONS.PLANTER_MANAGER)){
          next();
          return;
        }else{
          res.status(401).json({
            error: new Error('No permission'),
          });
          return;
        }
      }
    }else{
      next();
      return;
    }
    res.status(401).json({
      error: new Error('No permission'),
    });
    //res.status(200).json([user]);
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};

exports.auth = {
  router,
  isAuth,
};
