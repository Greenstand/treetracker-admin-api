const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret =
  '3n398nrNMSI992298948)#€/#/€#€Q/H/DFN/FNF90DFNM(FN)(Fn)(FDN)(DNF)(æ';

const ROLE_ADMIN = 0;

const user = {
  username: "dadiorchen",
  firstName: "Dadior",
  lastName: "Chen",
  password: "123456",
  role: [0, 1],
  email: "dadiorchen@outlook.com",
}

const userB = {
  username: "bbb",
  firstName: "B",
  lastName: "B",
  password: "123456",
  role: [1],
  email: "b@outlook.com",
}

const users = [user, userB];

router.post('/login', async function login(req, res, next) {
  try {
    const {username, password} = req.body;
    const userLogin = users.reduce((a,c) => {
      if(a){
        return a;
      }else if(c.username === username && c.password === password){
        return c;
      }else{
        return a;
      }
    }, undefined);
    if (userLogin) {
      //TODO get user
      const token = await jwt.sign(userLogin, jwtSecret);
      return res.json({
        token,
        user,
      });
    } else {
      return res.status(401).send();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/test', async function login(req, res, next) {
  res.send('OK');
});

router.get("/admin_users/", async (req, res, next) => {
  try {
      res.status(200).json([user]);
  } catch {
    res.status(500);
  }
});

router.post("/admin_users/", async (req, res, next) => {
  try {
    const userNew = req.body;
    users.push(userNew);
    res.status(201).json(userNew);
  } catch {
    res.status(500);
  }
});

const isAuth = (req, res, next) => {
  //white list
  if(req.baseUrl === "/auth/login" || 
    req.baseUrl === "/auth/test"
  ){
    next();
    return;
  }
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, jwtSecret);
    const userSession = decodedToken;
//    if (req.body.userId && req.body.userId !== userId) {
//      throw new Error("Invalid user ID");
//    } else {
      req.user = userSession;
    //check role
    //console.log("userB:", userSession);
    if(req.baseUrl.match(/\/auth\/(?!login).*/)){
      if(userSession.role.some(r => r === ROLE_ADMIN)){
        next();
        return;
      }
    }else{
      next();
      return;
    }
    res.status(401).json({
      error: new Error("No permission"),
    });
      //res.status(200).json([user]);
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
}

exports.auth = {
  router,
  isAuth,
};
