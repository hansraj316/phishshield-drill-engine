import express from 'express';
import { v4 as uuid } from 'uuid';
import { readDb, writeDb } from './store.js';
import { pathToFileURL } from 'url';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true, service: 'phishshield-drill-engine' }));

  app.post('/api/campaigns', (req, res) => {
    const { name, audience = [], template = 'default' } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const db = readDb();
    const campaign = { id: uuid(), name, audience, template, createdAt: new Date().toISOString() };
    db.campaigns.push(campaign);
    writeDb(db);
    res.status(201).json(campaign);
  });

  app.post('/api/events', (req, res) => {
    const { campaignId, email, type } = req.body || {};
    if (!campaignId || !email || !type) return res.status(400).json({ error: 'campaignId, email, type required' });
    const db = readDb();
    const event = { id: uuid(), campaignId, email, type, createdAt: new Date().toISOString() };
    db.events.push(event);
    writeDb(db);
    res.status(201).json(event);
  });

  app.post('/api/events/drill-complete', (req, res) => {
    const { userId, campaignId, score, completedAt } = req.body || {};

    if (
      typeof userId !== 'string' ||
      !userId.trim() ||
      typeof campaignId !== 'string' ||
      !campaignId.trim() ||
      score === undefined ||
      completedAt === undefined
    ) {
      return res.status(400).json({ error: 'userId, campaignId, score, completedAt required' });
    }
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({ error: 'score must be a number between 0 and 100' });
    }
    if (typeof completedAt !== 'string' || !completedAt.includes('T')) {
      return res.status(400).json({ error: 'completedAt must be a valid datetime' });
    }

    const completedTs = Date.parse(completedAt);
    if (Number.isNaN(completedTs)) {
      return res.status(400).json({ error: 'completedAt must be a valid datetime' });
    }

    const db = readDb();
    const event = {
      id: uuid(),
      type: 'drill-complete',
      userId: userId.trim(),
      campaignId: campaignId.trim(),
      score,
      completedAt: new Date(completedTs).toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.events.push(event);
    writeDb(db);
    return res.status(201).json(event);
  });

  app.get('/api/coaching/:eventId', (req, res) => {
    const db = readDb();
    const event = db.events.find(e => e.id === req.params.eventId);
    if (!event) return res.status(404).json({ error: 'event not found' });
    const guidance = event.type === 'click'
      ? 'You clicked a simulated phishing link. Verify sender, check URL, report suspicious emails, and reset password if reused.'
      : 'Great job. Keep validating sender domains and avoid opening unexpected attachments.';
    res.json({ eventId: event.id, email: event.email, type: event.type, guidance });
  });

  app.get('/api/metrics/weekly', (req, res) => {
    const db = readDb();
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekly = db.events.filter(e => new Date(e.createdAt).getTime() >= since);
    const byType = weekly.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
    res.json({ totalEvents: weekly.length, byType });
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`PhishShield running on :${port}`));
}
