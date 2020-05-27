const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret =
  '3n398nrNMSI992298948)#€/#/€#€Q/H/DFN/FNF90DFNM(FN)(Fn)(FDN)(DNF)(æ';

const user = {
  username: "dadiorchen",
  firstName: "Dadior",
  lastName: "Chen",
  role: [0, 1],
  email: "dadiorchen@outlook.com",
}

router.post('/login', async function login(req, res, next) {
  try {
    const {username, password} = req.body;
    if (username === 'test' && password === 'password') {
      //TODO get user
      const token = await jwt.sign(user, jwtSecret);
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
    const userId = decodedToken.userId;
//    if (req.body.userId && req.body.userId !== userId) {
//      throw new Error("Invalid user ID");
//    } else {
      req.userId = userId;
      next();
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
