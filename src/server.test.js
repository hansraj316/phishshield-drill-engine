import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from './server.js';
import { readDb, writeDb } from './store.js';

function resetDb() {
  writeDb({ campaigns: [], events: [] });
}

test.beforeEach(() => {
  resetDb();
});

test('POST /api/events/drill-complete stores a valid completion event', async () => {
  const payload = {
    userId: 'user-123',
    campaignId: 'cmp-001',
    score: 82,
    completedAt: '2026-04-22T18:15:00.000Z'
  };

  const response = await request(app)
    .post('/api/events/drill-complete')
    .send(payload)
    .expect(201);

  assert.equal(response.body.userId, payload.userId);
  assert.equal(response.body.campaignId, payload.campaignId);
  assert.equal(response.body.score, payload.score);
  assert.equal(response.body.completedAt, payload.completedAt);
  assert.equal(response.body.type, 'drill-complete');

  const db = readDb();
  assert.equal(db.events.length, 1);
  assert.equal(db.events[0].type, 'drill-complete');
  assert.equal(db.events[0].userId, payload.userId);
});

test('POST /api/events/drill-complete rejects payload with missing fields', async () => {
  const response = await request(app)
    .post('/api/events/drill-complete')
    .send({ userId: 'user-123' })
    .expect(400);

  assert.equal(response.body.error, 'userId, campaignId, score, completedAt required');

  const db = readDb();
  assert.equal(db.events.length, 0);
});

test('POST /api/events/drill-complete rejects invalid score and invalid completedAt', async () => {
  await request(app)
    .post('/api/events/drill-complete')
    .send({
      userId: 'user-123',
      campaignId: 'cmp-001',
      score: 120,
      completedAt: '2026-04-22T18:15:00.000Z'
    })
    .expect(400);

  await request(app)
    .post('/api/events/drill-complete')
    .send({
      userId: 'user-123',
      campaignId: 'cmp-001',
      score: 60,
      completedAt: 'not-a-date'
    })
    .expect(400);

  const db = readDb();
  assert.equal(db.events.length, 0);
});
