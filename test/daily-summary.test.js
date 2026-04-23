import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function setupDbWithEvents(events) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phishshield-summary-test-'));
  const dbPath = path.join(tempDir, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify({ campaigns: [], events }, null, 2));
  return { tempDir, dbPath };
}

test('daily summary report includes completion count, avg score and fail rate', () => {
  const now = new Date();
  const todayIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0)).toISOString();
  const yesterdayIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 12, 0, 0)).toISOString();

  const { tempDir, dbPath } = setupDbWithEvents([
    { id: '1', type: 'drill-complete', score: 80, completedAt: todayIso, createdAt: todayIso, userId: 'u1', campaignId: 'c1' },
    { id: '2', type: 'drill-complete', score: 60, completedAt: todayIso, createdAt: todayIso, userId: 'u2', campaignId: 'c1' },
    { id: '3', type: 'drill-complete', score: 95, completedAt: yesterdayIso, createdAt: yesterdayIso, userId: 'u3', campaignId: 'c2' },
    { id: '4', type: 'click', createdAt: todayIso, email: 'x@y.com', campaignId: 'c1' },
  ]);

  const result = spawnSync('node', ['src/daily-summary.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DB_PATH: dbPath,
      FAIL_SCORE_THRESHOLD: '70',
    },
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);

  assert.equal(report.completionCount, 2);
  assert.equal(report.avgScore, 70);
  assert.equal(report.failRate, 50);
  assert.equal(report.failScoreThreshold, 70);

  fs.rmSync(tempDir, { recursive: true, force: true });
});
