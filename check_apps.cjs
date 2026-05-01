const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'db', 'applicant_auth.sqlite');
const db = new Database(dbPath);
const apps = db.prepare('SELECT * FROM applications').all();
console.log(JSON.stringify(apps, null, 2));
