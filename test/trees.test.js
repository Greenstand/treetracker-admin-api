const app = require('../server/server.js');

const assert = require('chai').assert;
const request = require('supertest');

const trees = app.models.tree;

describe('Trees', () => {
  it('should get all trees', (done) => {
    request(app)
      .get('/Trees')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done());
  });

  it('should get tree by id', (done) => {
    request(app)
      .get('/Trees/6')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done());
  });

  it('should check if tree exists', (done) => {
    request(app)
      .get('/Trees/6/exists')
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200, done());
  });

  it('should get the count of trees', (done) => {
    request(app)
      .get('/Trees/count')
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200, done());
  });
});
