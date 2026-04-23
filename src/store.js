import fs from 'fs';
import path from 'path';

const DEFAULT_DB = path.join(process.cwd(), 'data', 'db.json');

function dbPath() {
  return process.env.DB_PATH || DEFAULT_DB;
}

function ensure() {
  const DB = dbPath();
  fs.mkdirSync(path.dirname(DB), { recursive: true });
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ campaigns: [], events: [] }, null, 2));
}

export function readDb() {
  ensure();
  return JSON.parse(fs.readFileSync(dbPath(), 'utf8'));
}

export function writeDb(db) {
  fs.writeFileSync(dbPath(), JSON.stringify(db, null, 2));
}
