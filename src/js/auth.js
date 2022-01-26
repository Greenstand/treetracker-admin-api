/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import generator from 'generate-password';
import Crypto from 'crypto';
import bodyParser from 'body-parser';
import { config } from '../config';
import { Pool } from 'pg';
import { utils } from './utils';
import getDatasource from '../datasources/config';
import policy from '../policy.json';
import expect from 'expect';

const app = express();
const pool = new Pool({ connectionString: getDatasource().url });
const jwtSecret = config.jwtSecret;

//collect all those functions who visit DB into a variables, to give some convenience
//for testing.
const helper = {};

const POLICIES = {
  SUPER_PERMISSION: 'super_permission',
  LIST_USER: 'list_user',
  MANAGER_USER: 'manager_user',
  LIST_TREE: 'list_tree',
  APPROVE_TREE: 'approve_tree',
  LIST_PLANTER: 'list_planter',
  MANAGE_PLANTER: 'manage_planter',
};

helper.needRoleUpdate = function (update_userSession, userSession) {
  /* if no role exists prev/current, then update regardless and don't check if both are equal */
  const hasRoles = !!update_userSession.role && !!userSession.role;
  if (!hasRoles) {
    return true;
  } else {
    /*check if roles equal */
    const isEqual =
      update_userSession.role.length === userSession.role.length &&
      userSession.role.every((val) => update_userSession.role.includes(val));
    return isEqual ? false : true;
  }
};

helper.sha512 = function (password, salt) {
  const hash = Crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashedPwd = hash.digest('hex');
  return hashedPwd;
};

const generateSalt = function () {
  const generated = generator.generate({ length: 6, numbers: true });
  return generated;
};

const jsonParser = app.use(bodyParser.urlencoded({ extended: false })); // parse application/json
// const urlencodedParser = app.use(bodyParser.json());/// parse application/x-www-form-urlencoded

function isIdValid(id) {
  // an ID is valid if it is not null or undefined
  return id != null;
}

helper.getActiveAdminUserRoles = async function (userId) {
  if (!isIdValid(userId)) {
    return null;
  }
  // Include role details
  return await pool.query(
    `select * from admin_user_role aur left join admin_role ar on aur.role_id = ar.id
     where aur.admin_user_id = ${userId} and aur.active = true`,
  );
};

helper.clearAdminUserRoles = async function (userId) {
  if (!isIdValid(userId)) {
    return;
  }
  return await pool.query(
    `update admin_user_role set active = false where admin_user_id = ${userId}`,
  );
};

helper.addAdminUserRole = async function (userId, roleId) {
  if (!isIdValid(userId) || !isIdValid(roleId)) {
    return;
  }
  return await pool.query(
    `insert into admin_user_role (role_id, admin_user_id, active)
     values (${roleId},${userId},true)
     on conflict (role_id, admin_user_id)
     do update set active = true`,
  );
};

helper.getActiveAdminUser = async function (userName) {
  return await pool.query(
    `select * from admin_user where user_name = '${userName}' and active = true`,
  );
};

helper.deactivateAdminUser = async function (userId) {
  if (!isIdValid(userId)) {
    return;
  }
  return await pool.query(
    `update admin_user set active = false where id = ${userId}`,
  );
};

helper.getAdminRoles = async function (roleIds) {
  if (!roleIds) {
    return null;
  }
  return await await pool.query(
    `select * from admin_role where id in (${roleIds.join(
      ',',
    )}) and active = true`,
  );
};

// load roles and policy (permissions)
helper.loadUserPermissions = async function (userId) {
  const userDetails = {};
  //get roles
  const result = await helper.getActiveAdminUserRoles(userId);
  expect(result.rows.length).toBeGreaterThan(0);
  userDetails.role = result.rows.map((r) => r.role_id);
  userDetails.roleNames = result.rows.map((r) => r.role_name);
  //get policies
  const roleResult = await helper.getAdminRoles(userDetails.role);
  const policyObjects = roleResult?.rows.map((r) => r.policy);

  // Build a composite policy object from the various roles
  userDetails.policy = policyObjects?.reduce(
    (compositePolicy, policyObj) => {
      // Assume one organization and apply to all policies
      if (policyObj.organization) {
        compositePolicy.organization = policyObj.organization;
      }
      policyObj.policies.forEach((p) => {
        if (!compositePolicy.policies.find((cp) => cp.name === p.name)) {
          compositePolicy.policies.push(p);
        }
      });

      return compositePolicy;
    },
    { policies: [] },
  );
  return userDetails;
};

helper.hasPermission = (
  userPolicies,
  userOrganization,
  allowedPolicyNames,
  requestedOrgId,
) => {
  if (userOrganization && requestedOrgId !== userOrganization.id) {
    return false;
  }

  return userPolicies.some((userPolicy) =>
    allowedPolicyNames.some(
      (allowedPolicyName) => userPolicy.name === allowedPolicyName,
    ),
  );
};

router.get('/permissions', async function login(req, res) {
  try {
    const result = await pool.query(`select * from admin_role`);
    res.status(200).json(result.rows.map((r) => utils.convertCamel(r)));
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.post('/login', async function login(req, res, next) {
  try {
    //try to init, in case of first visit
    // await init();
    const { userName, password } = req.body;

    //find the user to get the salt, validate if hashed password matches
    const users = await helper.getActiveAdminUser(userName);

    let userLogin;
    if (users.rows.length) {
      const user_entity = utils.convertCamel(users.rows[0]);
      const hash = helper.sha512(password, user_entity.salt);
      if (user_entity.passwordHash === hash) {
        userLogin = user_entity;
        //load role
        //console.assert(userLogin.id >= 0, 'id?', userLogin);
        const result = await helper.getActiveAdminUserRoles(userLogin.id);
        userLogin.role = result.rows.map((r) => r.role_id);
        userLogin.roleNames = result.rows.map((r) => r.role_name);
      } else {
        console.log('checking password failed');
      }
    } else {
      console.log('can not find user by', userName);
    }

    // If user exists in db AND user is active
    // query remaining details and return
    if (userLogin && userLogin.enabled) {
      const userDetails = await helper.loadUserPermissions(userLogin.id);
      userLogin = { ...userLogin, ...userDetails };
      //TODO get user
      const token = await jwt.sign(userLogin, jwtSecret);
      const {
        id,
        userName,
        firstName,
        lastName,
        email,
        role,
        policy,
        roleNames,
        createdAt,
      } = userLogin;
      console.log('login success');
      return res.json({
        token,
        user: {
          id,
          userName,
          firstName,
          lastName,
          email,
          role,
          policy,
          roleNames,
          createdAt,
        },
      });
    } else {
      console.log('login failed:', userLogin);
    }

    if (userLogin && !userLogin.enabled) {
      return res.status(401).json({
        errorMessage:
          'Your account has been locked. Please contact your administrator for more information.',
      });
    }

    return res.status(401).json();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/test', async function login(req, res) {
  res.send('OK');
});

router.get('/admin_users/:userId', async (req, res) => {
  try {
    //console.log(pool);
    let result = await pool.query(
      `select * from admin_user where id=${req.params.userId} and active = true`,
    );
    let userGet;
    if (result.rows.length === 1) {
      userGet = utils.convertCamel(result.rows[0]);
      //load roles
      result = await helper.getActiveAdminUserRoles(userGet.id);
      userGet.role = result.rows.map((r) => r.role_id);
    }
    if (userGet) {
      delete userGet.passwordHash;
      delete userGet.salt;
      res.status(200).json(userGet);
    } else {
      res.status(404).json();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.put('/admin_users/:userId/password', jsonParser, async (req, res) => {
  try {
    const salt = generateSalt();
    const hash = helper.sha512(req.body.password, salt);
    await pool.query(
      `update admin_user set password_hash = '${hash}', salt = '${salt}' where id = ${req.params.userId}`,
    );
    res.status(200).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.patch('/admin_users/:userId', async (req, res) => {
  try {
    const update = `update admin_user set ${utils.buildUpdateFields(
      req.body,
    )} where id = ${req.params.userId}`;
    console.log('update:', update);
    await pool.query(update);
    //set all roles for this user to inactive
    await helper.clearAdminUserRoles(req.params.userId);
    if (req.body.role) {
      for (let i = 0; i < req.body.role.length; i++) {
        await helper.addAdminUserRole(req.params.userId, req.body.role[i]);
      }
    }
    res.status(200).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.delete('/admin_users/:userId', async (req, res) => {
  try {
    await helper.clearAdminUserRoles(req.params.userId);
    await helper.deactivateAdminUser(req.params.userId);
    res.status(204).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.get('/admin_users/', async (req, res) => {
  try {
    const result = await pool.query(
      `select * from admin_user where active = true`,
    );
    const users = [];
    for (let i = 0; i < result.rows.length; i++) {
      const user = result.rows[i];
      delete user.password_hash;
      delete user.salt;
      const roles = await helper.getActiveAdminUserRoles(user.id);
      user.role = roles.rows.map((rr) => rr.role_id);
      users.push(utils.convertCamel(user));
    }
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

router.post('/validate/', async (req, res) => {
  console.log('validate');
  try {
    const { password } = req.body;
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, jwtSecret);
    const userSession = decodedToken;
    const hash = helper.sha512(password, userSession.salt);

    if (hash === userSession.passwordHash) {
      return res.status(200).json();
    } else {
      return res.status(401).json();
    }
  } catch (err) {
    console.error(
      err,
      'verify, req:',
      req.originalUrl,
      req.headers.authorization,
    );
    res.status(500).json();
  }
});

router.post('/admin_users/', async (req, res) => {
  try {
    req.body.passwordHash = req.body.password;
    delete req.body.password;
    let result = await helper.getActiveAdminUser(req.body.userName);
    if (result.rows.length) {
      //TODO 401
      res.status(201).json({ id: result.rows[0].id });
      return;
    }
    //active
    if (req.body.active == undefined) {
      req.body.active = true;
    }
    //enabled
    if (req.body.enabled == undefined) {
      req.body.enabled = true;
    }
    const insert = `insert into admin_user ${utils.buildInsertFields(
      req.body,
    )}`;
    console.log('insert:', insert);
    await pool.query(insert);
    result = await helper.getActiveAdminUser(req.body.userName);
    let obj;
    if (result.rows.length) {
      obj = result.rows[0];
      await helper.clearAdminUserRoles(obj.id);
      for (const role of req.body.role) {
        await helper.addAdminUserRole(obj.id, role);
      }
    } else {
      throw new Error('can not find new user');
    }
    res.status(201).json({ id: obj.id });
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

async function init() {
  console.log('Begin init...');
  const result = await pool.query(`select * from admin_user `);

  if (result.rows.length > 0) {
    console.log('There are accounts in admin user, quit.');
    return;
  }
  console.log('clean...');
  await pool.query('delete from admin_user');
  await pool.query('delete from admin_user_role');
  await pool.query('delete from admin_role');

  await pool.query(
    `insert into admin_role (id, role_name, description, policy) ` +
      `values (1, 'Admin', 'The super administrator role, having all permissions','${JSON.stringify(
        [policy.policies[0], policy.policies[1], policy.policies[2]],
      )}'),` +
      `(2, 'Tree Manager', 'Check, verify, manage trees','${JSON.stringify([
        policy.policies[3],
        policy.policies[4],
      ])}'),` +
      `(3, 'Planter Manager', 'Check, manage planters','${JSON.stringify([
        policy.policies[5],
        policy.policies[6],
      ])}')`,
  );

  await pool.query(
    `insert into admin_user (id, user_name, first_name, last_name, password_hash, salt, email, active) ` +
      `values ( 1, 'admin', 'Admin', 'Panel', 'eab8461725c44aa1532ed88de947fe0706c00c31ed6d832218a6cf59d7602559a7d372d42a64130f21f1f33091105548514bca805b81ee1f01a068a7b0fa2d80', 'OglBTs','admin@greenstand.org', true),` +
      `(2, 'test', 'Admin', 'Test', '539430ec2a48fd607b6e06f3c3a7d3f9b46ac5acb7e81b2633678a8fe3ce6216e2abdfa2bc41bbaa438ba55e5149efb7ad522825d9e98df5300b801c7f8d2c86', 'WjSO0T','test@greenstand.org', true)`,
  );
  await pool.query(
    `insert into admin_user_role (id, role_id, admin_user_id, active) ` +
      `values ( 1, 1, 1, true), ` +
      `(2, 2, 2, true), ` +
      `(3, 3, 2, true)`,
  );
}

router.post('/init', async (req, res) => {
  try {
    await init();
    res.status(200).json();
  } catch (e) {
    console.error(e);
    res.status(500).json();
  }
});

const isAuth = async (req, res, next) => {
  console.log('isAuth...');
  //white list
  const url = req.originalUrl;
  if (url.match(/\/auth\/(login|test|init|validate)/)) {
    next();
    return;
  }

  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, jwtSecret);
    const userSession = decodedToken;
    req.user = userSession;

    // console.log('userSession', userSession);
    console.log('url', url);

    // VALIDATE USER DATA
    expect(userSession.policy).toBeInstanceOf(Object);
    const policies = userSession.policy.policies;
    expect(policies).toBeInstanceOf(Array);
    const organization = userSession.policy.organization;
    organization &&
      expect(organization).toMatchObject({
        name: expect.any(String),
        id: expect.any(Number),
      });

    let matcher;
    if (url.match(/\/auth\/check_session/)) {
      const user_id = req.query.id;
      const result = await helper.getActiveAdminUser(userSession.userName);
      console.log('check_session user_id', user_id);

      if (result.rows.length) {
        const update_userSession = utils.convertCamel(result.rows[0]);
        //compare wuth the updated pwd in case pwd is changed
        if (update_userSession.passwordHash === userSession.passwordHash) {
          /*get the role for updated usersession* */
          const updated_roles = await helper.getActiveAdminUserRoles(user_id);
          update_userSession.role = updated_roles.rows.map((r) => r.role_id);
          //compare wuth the updated role in case role is changed
          if (helper.needRoleUpdate(update_userSession, userSession)) {
            //reassign token with updated roles if roles change
            const new_token = jwt.sign(update_userSession, jwtSecret);
            res.status(200).json({ token: new_token });
            return;
          } else {
            console.log('auth check');
            /*no role change */
            res.status(200).json({});
            return;
          }
        } else {
          console.log('password unmatch');
          res.status(401).json({
            error: new Error('Session expired'),
          });
          return;
        }
      }
    }
    const passwordMatcher = url.match(/\/auth\/admin_users\/(\d+)\/password/);
    if (passwordMatcher && passwordMatcher.length > 1) {
      if (policies.some((r) => r.name === POLICIES.SUPER_PERMISSION)) {
        next();
        return;
      } else {
        const reqUserId = passwordMatcher[1];
        if (Number(reqUserId) === Number(userSession.id)) {
          // User is changing their own password
          next();
          return;
        } else {
          res.status(401).json({
            error: new Error('No permission'),
          });
          return;
        }
      }
    } else if (url.match(/\/auth\/(?!login).*/)) {
      if (
        policies.some(
          (r) =>
            r.name === POLICIES.SUPER_PERMISSION ||
            r.name === POLICIES.MANAGER_USER ||
            r.name === POLICIES.LIST_USER,
        )
      ) {
        next();
        return;
      } else {
        res.status(401).json({
          error: new Error('No permission'),
        });
        return;
      }
    } else if (url.match(/\/api\/.*/)) {
      if (url.match(/\/api\/species.*/)) {
        return next();
      } else if (url.match(/\/api\/tags.*/)) {
        return next();
      } else if (url.match(/\/api\/tree_tags.*/)) {
        return next();
      }

      matcher = url.match(/\/api\/(organization\/(\d+)\/)?trees.*/);
      if (matcher) {
        const requestedOrgId = matcher.length > 1 && parseInt(matcher[2], 10);
        if (
          helper.hasPermission(
            policies,
            organization,
            [
              POLICIES.SUPER_PERMISSION,
              POLICIES.LIST_TREE,
              POLICIES.APPROVE_TREE,
            ],
            requestedOrgId,
          )
        ) {
          return next();
        }

        res.status(401).json({
          error: new Error('No permission'),
        });
        return;
      }

      matcher = url.match(/\/api\/(organization\/(\d+)\/)?planter.*/);
      if (matcher) {
        const requestedOrgId = matcher.length > 1 && parseInt(matcher[2], 10);
        if (
          helper.hasPermission(
            policies,
            organization,
            [
              POLICIES.SUPER_PERMISSION,
              POLICIES.LIST_PLANTER,
              POLICIES.MANAGE_PLANTER,
            ],
            requestedOrgId,
          )
        ) {
          return next();
        }

        res.status(401).json({
          error: new Error('No permission'),
        });
        return;
      }

      matcher = url.match(/\/api\/(organization\/(\d+)\/)?organizations.*/);
      if (matcher) {
        const requestedOrgId = matcher.length > 1 && parseInt(matcher[2], 10);
        if (
          helper.hasPermission(
            policies,
            organization,
            [
              POLICIES.SUPER_PERMISSION,
              POLICIES.MANAGER_USER,
              POLICIES.LIST_USER,
              POLICIES.LIST_TREE,
              POLICIES.APPROVE_TREE,
              POLICIES.MANAGE_PLANTER,
            ],
            requestedOrgId,
          )
        ) {
          return next();
        }

        res.status(401).json({
          error: new Error('No permission'),
        });
        return;
      }
    } else {
      return next();
    }
    res.status(401).json({
      error: new Error('No permission'),
    });
    //res.status(200).json([user]);
  } catch (e) {
    console.warn(e);
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};

export default {
  router,
  isAuth,
  //export just for write tests
  helper,
};
