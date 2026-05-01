import initSqlJs from 'sql.js';

let db = null;
let initPromise = null;
let initError = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    barangay TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    industry TEXT,
    contact_person TEXT,
    business_permit TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id INTEGER,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    type TEXT,
    category TEXT,
    salary TEXT,
    description TEXT,
    requirements TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  );
`;

const SEED_DATA = `
  INSERT OR IGNORE INTO admins (email, password, name) VALUES ('admin', 'admin123', 'System Administrator');
`;

export async function initDatabase() {
  if (db) return db;
  if (initError) throw initError;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const wasmResponse = await fetch('/sql-wasm.wasm');
      const wasmBinary = await wasmResponse.arrayBuffer();
      
      const SQL = await initSqlJs({
        wasmBinary
      });

      const savedData = localStorage.getItem('joblinked_db');
      
      if (savedData) {
        const data = new Uint8Array(JSON.parse(savedData));
        db = new SQL.Database(data);
      } else {
        db = new SQL.Database();
        db.run(SCHEMA);
        db.run(SEED_DATA);
        saveDatabase();
      }

      return db;
    } catch (error) {
      console.error('Database initialization error:', error);
      initError = error;
      throw error;
    }
  })();

  return initPromise;
}

export function isDbReady() {
  return db !== null;
}

export function getDbError() {
  return initError;
}

export function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const arr = Array.from(data);
    localStorage.setItem('joblinked_db', JSON.stringify(arr));
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

export function getDb() {
  return db;
}

function safeExec(sql, params = []) {
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (e) {
    console.error('Database query error:', e);
    return [];
  }
}

function safeRun(sql, params = []) {
  if (!db) return;
  try {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
  } catch (e) {
    console.error('Database run error:', e);
  }
}

// User operations
export function createUser(email, password, fullName, phone, barangay) {
  safeRun(
    'INSERT INTO users (email, password, full_name, phone, barangay) VALUES (?, ?, ?, ?, ?)',
    [email, password, fullName, phone, barangay]
  );
  saveDatabase();
  const result = safeExec('SELECT last_insert_rowid() as id');
  return result[0]?.id || 0;
}

export function getUserByEmail(email) {
  const result = safeExec('SELECT * FROM users WHERE email = ?', [email]);
  return result[0] || null;
}

export function getAllUsers() {
  return safeExec('SELECT id, email, full_name, phone, barangay, created_at FROM users ORDER BY created_at DESC');
}

// Employer operations
export function createEmployer(companyName, email, password, address, industry, contactPerson, businessPermit) {
  safeRun(
    'INSERT INTO employers (company_name, email, password, address, industry, contact_person, business_permit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [companyName, email, password, address, industry, contactPerson, businessPermit, 'pending']
  );
  saveDatabase();
  const result = safeExec('SELECT last_insert_rowid() as id');
  return result[0]?.id || 0;
}

export function getEmployerByEmail(email) {
  const result = safeExec('SELECT * FROM employers WHERE email = ?', [email]);
  return result[0] || null;
}

export function getAllEmployers() {
  return safeExec('SELECT * FROM employers ORDER BY created_at DESC');
}

export function updateEmployerStatus(id, status) {
  safeRun('UPDATE employers SET status = ? WHERE id = ?', [status, id]);
  saveDatabase();
}

// Admin operations
export function getAdminByEmail(email) {
  const result = safeExec('SELECT * FROM admins WHERE email = ?', [email]);
  return result[0] || null;
}

// Job operations
export function createJob(employerId, title, company, location, type, category, salary, description, requirements) {
  safeRun(
    'INSERT INTO jobs (employer_id, title, company, location, type, category, salary, description, requirements, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [employerId, title, company, location, type, category, salary, description, requirements, 'active']
  );
  saveDatabase();
  const result = safeExec('SELECT last_insert_rowid() as id');
  return result[0]?.id || 0;
}

export function getJobsByEmployer(employerId) {
  return safeExec('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC', [employerId]);
}

export function getAllJobs() {
  return safeExec('SELECT * FROM jobs ORDER BY created_at DESC');
}

export function updateJobStatus(id, status) {
  safeRun('UPDATE jobs SET status = ? WHERE id = ?', [status, id]);
  saveDatabase();
}

export function deleteJob(id) {
  safeRun('DELETE FROM jobs WHERE id = ?', [id]);
  saveDatabase();
}

// Application operations
export function createApplication(jobId, userId) {
  safeRun(
    'INSERT INTO applications (job_id, user_id, status) VALUES (?, ?, ?)',
    [jobId, userId, 'pending']
  );
  saveDatabase();
  const result = safeExec('SELECT last_insert_rowid() as id');
  return result[0]?.id || 0;
}

export function getApplicationsByUser(userId) {
  return safeExec(`
    SELECT a.*, j.title, j.company, j.location, j.type, j.salary, j.status as job_status
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.user_id = ?
    ORDER BY a.applied_at DESC
  `, [userId]);
}

export function getApplicationsByJob(jobId) {
  return safeExec(`
    SELECT a.*, u.full_name, u.email, u.phone, u.barangay
    FROM applications a
    JOIN users u ON a.user_id = u.id
    WHERE a.job_id = ?
    ORDER BY a.applied_at DESC
  `, [jobId]);
}

export function getAllApplications() {
  return safeExec(`
    SELECT a.*, j.title, j.company, u.full_name, u.email, u.barangay
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.user_id = u.id
    ORDER BY a.applied_at DESC
  `);
}

export function updateApplicationStatus(id, status) {
  safeRun('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
  saveDatabase();
}

// Statistics
export function getStats() {
  try {
    const userCount = safeExec('SELECT COUNT(*) as count FROM users')[0]?.count || 0;
    const employerCount = safeExec('SELECT COUNT(*) as count FROM employers')[0]?.count || 0;
    const jobCount = safeExec('SELECT COUNT(*) as count FROM jobs WHERE status = "active"')[0]?.count || 0;
    const applicationCount = safeExec('SELECT COUNT(*) as count FROM applications')[0]?.count || 0;
    
    return { userCount, employerCount, jobCount, applicationCount };
  } catch {
    return { userCount: 0, employerCount: 0, jobCount: 0, applicationCount: 0 };
  }
}