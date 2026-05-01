const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'db', 'employer_auth.sqlite');
const db = new Database(dbPath);
const jobs = db.prepare('SELECT * FROM jobs').all();
console.log(JSON.stringify(jobs, null, 2));
