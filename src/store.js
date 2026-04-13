import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'db.json');

function ensure() {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ campaigns: [], events: [] }, null, 2));
}

export function readDb() {
  ensure();
  return JSON.parse(fs.readFileSync(DB, 'utf8'));
}

export function writeDb(db) {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
}
