const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret =
  '3n398nrNMSI992298948)#€/#/€#€Q/H/DFN/FNF90DFNM(FN)(Fn)(FDN)(DNF)(æ';

const PERMISSIONS = {
  ADMIN : 0,
  TREE_AUDITOR: 1,
  PLANTER_MANAGER: 2,
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
    res.status(200).json(permissions);
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.post('/login', async function login(req, res, next) {
  try {
    const {username, password} = req.body;
    const userLogin = users.reduce((a, c) => {
      if (a) {
        return a;
      } else if (c.username === username && c.password === password) {
        return c;
      } else {
        return a;
      }
    }, undefined);
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
    const userGet = users.reduce(
      (a, c) => a || (c.id === parseInt(req.params.userId) ? c : undefined),
      undefined,
    );
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
    const userGet = users.reduce(
      (a, c) => a || (c.id === parseInt(req.params.userId) ? c : undefined),
      undefined,
    );
    if (userGet) {
      Object.assign(userGet, req.body);
      res.status(200).json(userGet);
    } else {
      res.status(404).json();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.patch('/admin_users/:userId', async (req, res, next) => {
  try {
    const userGet = users.reduce(
      (a, c) => a || (c.id === parseInt(req.params.userId) ? c : undefined),
      undefined,
    );
    if (userGet) {
      Object.assign(userGet, req.body);
      res.status(200).json(userGet);
    } else {
      res.status(404).json();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.get('/admin_users/', async (req, res, next) => {
  try {
    res.status(200).json(users);
  } catch {
    res.status(500).json();
  }
});

router.post('/admin_users/', async (req, res, next) => {
  try {
    const userNew = req.body;
    users.push(userNew);
    res.status(201).json(userNew);
  } catch {
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
