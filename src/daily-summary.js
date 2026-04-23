import { readDb } from './store.js';

const FAIL_SCORE_THRESHOLD = Number(process.env.FAIL_SCORE_THRESHOLD || 70);
const now = new Date();
const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

const db = readDb();
const completions = db.events.filter((event) => {
  if (event.type !== 'drill-complete') return false;
  const ts = new Date(event.completedAt).getTime();
  return ts >= startOfDay.getTime() && ts < endOfDay.getTime();
});

const completionCount = completions.length;
const avgScore = completionCount
  ? Number((completions.reduce((sum, event) => sum + event.score, 0) / completionCount).toFixed(2))
  : 0;
const failCount = completions.filter((event) => event.score < FAIL_SCORE_THRESHOLD).length;
const failRate = completionCount ? Number(((failCount / completionCount) * 100).toFixed(2)) : 0;

const report = {
  date: startOfDay.toISOString().slice(0, 10),
  completionCount,
  avgScore,
  failRate,
  failScoreThreshold: FAIL_SCORE_THRESHOLD,
};

console.log(JSON.stringify(report, null, 2));
