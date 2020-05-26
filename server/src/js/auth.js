const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret =
  '3n398nrNMSI992298948)#€/#/€#€Q/H/DFN/FNF90DFNM(FN)(Fn)(FDN)(DNF)(æ';

router.post('/login', async function login(req, res, next) {
  try {
    const {username, password} = req.body;
    if (username === 'test' && password === 'password') {
      const token = await jwt.sign(
        {
          role: ['admin'],
        },
        jwtSecret,
      );
      return res.json({token});
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

exports.auth = {
  router,
};
