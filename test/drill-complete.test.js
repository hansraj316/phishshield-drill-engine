import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';

function setupDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phishshield-test-'));
  process.env.DB_PATH = path.join(tempDir, 'db.json');
  return tempDir;
}

test('POST /api/events/drill-complete persists valid drill completion event', async () => {
  const tempDir = setupDb();
  const { createApp } = await import('../src/server.js');
  const app = createApp();

  const payload = {
    userId: 'user-1',
    campaignId: 'campaign-1',
    score: 84,
    completedAt: '2026-04-22T18:00:00.000Z',
  };

  const res = await request(app)
    .post('/api/events/drill-complete')
    .send(payload)
    .expect(201);

  assert.equal(res.body.type, 'drill-complete');
  assert.equal(res.body.userId, payload.userId);
  assert.equal(res.body.campaignId, payload.campaignId);
  assert.equal(res.body.score, payload.score);
  assert.equal(res.body.completedAt, payload.completedAt);

  const db = JSON.parse(fs.readFileSync(process.env.DB_PATH, 'utf8'));
  assert.equal(db.events.length, 1);
  assert.equal(db.events[0].type, 'drill-complete');

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
});

test('POST /api/events/drill-complete rejects invalid payloads', async () => {
  const tempDir = setupDb();
  const { createApp } = await import('../src/server.js');
  const app = createApp();

  const invalidPayloads = [
    { campaignId: 'c1', score: 80, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: '   ', campaignId: 'c1', score: 80, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: 'u1', campaignId: 123, score: 80, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: 'u1', campaignId: 'c1', score: 101, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: 'u1', campaignId: 'c1', score: -1, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: 'u1', campaignId: 'c1', score: Number.POSITIVE_INFINITY, completedAt: '2026-04-22T18:00:00.000Z' },
    { userId: 'u1', campaignId: 'c1', score: 80, completedAt: 'not-a-date' },
    { userId: 'u1', campaignId: 'c1', score: 80, completedAt: 1713808800000 },
  ];

  for (const payload of invalidPayloads) {
    const res = await request(app)
      .post('/api/events/drill-complete')
      .send(payload)
      .expect(400);

    assert.ok(res.body.error);
  }

  const dbExists = fs.existsSync(process.env.DB_PATH);
  if (dbExists) {
    const db = JSON.parse(fs.readFileSync(process.env.DB_PATH, 'utf8'));
    assert.equal(db.events.length, 0);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
});
