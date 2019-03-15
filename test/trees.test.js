const app = require('../server/server.js');

const assert = require('chai').assert;
const request = require('supertest');

const params = Object.freeze({
  'id': 6,
  'timeCreated': '2015-03-24T18:02:41.000Z',
  'timeUpdated': '2015-03-24T18:02:41.000Z',
  'missing': false,
  'priority': false,
  'causeOfDeathId': null,
  'userId': 3,
  'primaryLocationId': 14,
  'settingsId': 12,
  'overrideSettingsId': 13,
  'dead': 0,
  'photoId': null,
  'photoUrl': null,
  'imageUrl': null,
  'certificateId': null,
  'estimatedGeometricLocation': '0101000020E6100000A83462669FAF30407B4D0F0A4A0F4B40',
  'lat': '54.119447',
  'lon': '16.686026',
  'gpsAccuracy': 14,
  'active': true,
});

describe('Trees', () => {
  it('GET /Trees/', (done) => {
    request(app)
      .get('/Trees')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done());
  });

  it('GET /Trees/{id}', (done) => {
    request(app)
      .get('/Trees/6')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done());
  });

  it('GET /Trees/{id}/exists', (done) => {
    request(app)
      .get('/Trees/6/exists')
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200, done());
  });

  it('GET /Trees/count', (done) => {
    request(app)
      .get('/Trees/count')
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200, done());
  });

  it('PATCH /Trees/{id}', (done) => {
    request(app)
      .patch('Trees/6')
      .send(params)
      .set('Accept', 'application/json')
      .expect(200, params, done());
  });

  it('PUT /Trees/{id}', (done) => {
    request(app)
      .put('Trees/6')
      .send(params)
      .set('Accept', 'application/json')
      .expect(200, params, done());
  });

  it('POST /Trees/{id}/replace', (done) => {
    request(app)
      .put('Trees/6/replace')
      .send(params)
      .set('Accept', 'application/json')
      .expect(200, params, done());
  });
});
