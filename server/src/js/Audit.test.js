const request = require('supertest');
const express = require('express');

jest.mock('pg');
const {Pool, Client} = require('pg');
const query = jest.fn();
Pool.mockImplementation(() => ({
  query,
}));

const Audit = require('./Audit');

describe('Audit', () => {
  let app;
  beforeEach(() => {
    query.mockReturnValue(true);
    app = express();
    app.use(express.json());
    app.use((request, response, next) => {
      try {
        const oldJSON = response.json;
        response.json = data => {
          console.log('data:', data);
          // For Async call, handle the promise and then set the data to `oldJson`
          if (data && data.then != undefined) {
            // Resetting json to original to avoid cyclic call.
            return data
              .then(responseData => {
                // Custom logic/code.
                response.json = oldJSON;
                response.myData = responseData;
                return oldJSON.call(response, responseData);
              })
              .catch(error => {
                next(error);
              });
          } else {
            // For non-async interceptor functions
            // Resetting json to original to avoid cyclic call.
            // Custom logic/code.
            response.json = oldJSON;
            response.myData = data;
            return oldJSON.call(response, data);
          }
        };
      } catch (error) {
        next(error);
      }
      next();
    });
    app.use(async (req, res, next) => {
      res.on('finish', async function() {
        try {
          //console.log('req:', req);
          console.log('req.header:', req.headers);
          expect(req.headers).toMatchObject({
            host: expect.any(String),
            'user-agent': expect.any(String),
          });
          const audit = new Audit();
          await audit.did(req, res);
        } catch (e) {
          console.error(e);
          next(e);
        }
      });
      next();
    });
    app.use('/auth/login', async (req, res, next) => {
      console.log('login success');
      res.status(200).send({
        id: 555,
        email: '555@ww.com',
      });
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      const res = await request(app).get('/auth/login');
      expect(res.statusCode).toBe(200);
    });

    it('login', () => {
      //-- Auto-generated SQL script #202006191553
      //INSERT INTO public.audit ("operator",platform,ip,browser,organization,operation)
      //  VALUES (1,'admin_panel','127.0.0.1','chrome','greenstand','{
      //    "type": "login"
      //    }');
      //
      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(
          /insert\s+into.*audit.*555.*(127.0.0.1).*(node-superagent).*login.*/i,
        ),
      );
    });
  });

  describe('Tree verify', () => {
    beforeEach(async () => {
      const res = await request(app).get('/auth/login');
      expect(res.statusCode).toBe(200);
    });

    it('login', () => {
      //-- Auto-generated SQL script #202006191553
      //INSERT INTO public.audit ("operator",platform,ip,browser,organization,operation)
      //  VALUES (1,'admin_panel','127.0.0.1','chrome','greenstand','{
      //    "type": "login"
      //    }');
      //
      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(
          /insert\s+into.*audit.*555.*(127.0.0.1).*(node-superagent).*login.*/i,
        ),
      );
    });
  });
});
