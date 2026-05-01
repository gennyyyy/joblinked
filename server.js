import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())

// Open the three databases
const adminDb = new Database(path.join(__dirname, 'db/admin_auth.sqlite'))
const employerDb = new Database(path.join(__dirname, 'db/employer_auth.sqlite'))
const applicantDb = new Database(path.join(__dirname, 'db/applicant_auth.sqlite'))

// Ensure schemas exist
adminDb.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  );
  INSERT OR IGNORE INTO admins (email, password, name) VALUES ('admin', 'admin123', 'System Administrator');
`)

employerDb.exec(`
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
`)

applicantDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    barangay TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Recreate applications table without foreign key constraint (fixes migration issue)
applicantDb.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Migration: fix applications table if it has foreign key issue
try {
  const schema = applicantDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='applications'").get()
  if (schema && schema.sql && schema.sql.includes('FOREIGN KEY')) {
    applicantDb.exec('DROP TABLE IF EXISTS applications')
    applicantDb.exec(`
      CREATE TABLE applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        user_id INTEGER,
        status TEXT DEFAULT 'pending',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Migrated applications table to remove foreign key constraints')
  }
} catch (e) {
  // Table might not exist yet, ignore
}

// Also keep jobs in employer db
employerDb.exec(`
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
`)

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body

  if (role === 'admin') {
    const admin = adminDb.prepare('SELECT * FROM admins WHERE email = ? AND password = ?').get(email, password)
    if (!admin) return res.json({ success: false, error: 'Invalid admin credentials' })
    return res.json({ success: true, user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' } })
  }

  if (role === 'employer') {
    const employer = employerDb.prepare('SELECT * FROM employers WHERE email = ? AND password = ?').get(email, password)
    if (!employer) return res.json({ success: false, error: 'Invalid employer credentials' })
    if (employer.status === 'pending') return res.json({ success: false, error: 'Account pending approval' })
    if (employer.status === 'rejected') return res.json({ success: false, error: 'Account has been rejected' })
    return res.json({ success: true, user: { id: employer.id, email: employer.email, company_name: employer.company_name, role: 'employer' } })
  }

  if (role === 'applicant') {
    const user = applicantDb.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password)
    if (!user) return res.json({ success: false, error: 'Invalid credentials' })
    return res.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, barangay: user.barangay, role: 'applicant' } })
  }

  res.json({ success: false, error: 'Invalid role' })
})

app.post('/api/auth/register/user', (req, res) => {
  const { email, password, fullName, phone, barangay } = req.body
  try {
    const result = applicantDb.prepare(
      'INSERT INTO users (email, password, full_name, phone, barangay) VALUES (?, ?, ?, ?, ?)'
    ).run(email, password, fullName, phone, barangay)
    res.json({ success: true, userId: result.lastInsertRowid })
  } catch (e) {
    res.json({ success: false, error: e.message.includes('UNIQUE') ? 'Email already registered' : e.message })
  }
})

app.post('/api/auth/register/employer', (req, res) => {
  const { companyName, email, password, address, industry, contactPerson, businessPermit } = req.body
  try {
    const result = employerDb.prepare(
      'INSERT INTO employers (company_name, email, password, address, industry, contact_person, business_permit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(companyName, email, password, address, industry, contactPerson, businessPermit, 'pending')
    res.json({ success: true, employerId: result.lastInsertRowid })
  } catch (e) {
    res.json({ success: false, error: e.message.includes('UNIQUE') ? 'Email already registered' : e.message })
  }
})

// ── Jobs ──────────────────────────────────────────────────────────────────────

app.get('/api/jobs', (req, res) => {
  res.json(employerDb.prepare("SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC").all())
})

app.get('/api/jobs/:employerId', (req, res) => {
  res.json(employerDb.prepare('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC').all(req.params.employerId))
})

app.post('/api/jobs', (req, res) => {
  const { employerId, title, company, location, type, category, salary, description, requirements } = req.body
  const result = employerDb.prepare(
    'INSERT INTO jobs (employer_id, title, company, location, type, category, salary, description, requirements, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(employerId, title, company, location, type, category, salary, description, requirements, 'active')
  res.json({ success: true, jobId: result.lastInsertRowid })
})

app.delete('/api/jobs/:id', (req, res) => {
  employerDb.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.put('/api/jobs/:id/status', (req, res) => {
  employerDb.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ success: true })
})

// ── Applications ──────────────────────────────────────────────────────────────

app.get('/api/applications', (req, res) => {
  // Join across DBs by fetching separately and merging
  const apps = applicantDb.prepare(`
    SELECT a.*, u.full_name, u.email, u.phone, u.barangay 
    FROM applications a 
    JOIN users u ON a.user_id = u.id 
    ORDER BY a.applied_at DESC
  `).all()
  
  const enrichedApps = apps.map(app => {
    const job = employerDb.prepare('SELECT * FROM jobs WHERE id = ?').get(app.job_id) || {}
    return { ...job, ...app, id: app.id, job_id: app.job_id }
  })
  
  res.json(enrichedApps)
})

app.get('/api/applications/user/:userId', (req, res) => {
  const apps = applicantDb.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY applied_at DESC').all(req.params.userId)
  
  const enrichedApps = apps.map(app => {
    const job = employerDb.prepare('SELECT * FROM jobs WHERE id = ?').get(app.job_id) || {}
    return { ...job, ...app, id: app.id, job_id: app.job_id } // Ensure app status and IDs are preserved
  })
  
  res.json(enrichedApps)
})

app.get('/api/applications/job/:jobId', (req, res) => {
  const query = `
    SELECT a.*, u.full_name, u.email, u.phone, u.barangay 
    FROM applications a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.job_id = ? 
    ORDER BY a.applied_at DESC
  `
  res.json(applicantDb.prepare(query).all(req.params.jobId))
})

app.get('/api/applications/employer/:employerId', (req, res) => {
  const jobs = employerDb.prepare('SELECT id, title FROM jobs WHERE employer_id = ?').all(req.params.employerId)
  if (jobs.length === 0) return res.json([])
  
  const jobMap = {}
  jobs.forEach(j => jobMap[j.id] = j.title)
  const jobIds = jobs.map(j => j.id)
  
  const query = `
    SELECT a.*, u.full_name, u.email, u.phone, u.barangay 
    FROM applications a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.job_id IN (${jobIds.map(() => '?').join(',')}) 
    ORDER BY a.applied_at DESC
  `
  
  const apps = applicantDb.prepare(query).all(...jobIds)
  
  const enrichedApps = apps.map(app => ({
    ...app,
    job_title: jobMap[app.job_id]
  }))
  
  res.json(enrichedApps)
})

app.post('/api/applications', (req, res) => {
  const { jobId, userId } = req.body
  
  if (!jobId || !userId) {
    return res.json({ success: false, error: 'Missing jobId or userId' })
  }
  
  // Check for duplicate application first
  const existing = applicantDb.prepare(
    'SELECT id FROM applications WHERE job_id = ? AND user_id = ?'
  ).get(jobId, userId)
  
  if (existing) {
    return res.json({ success: false, error: 'You have already applied to this job' })
  }
  
  // Check if job is active
  const job = employerDb.prepare('SELECT status FROM jobs WHERE id = ?').get(jobId)
  if (!job || job.status !== 'active') {
    return res.json({ success: false, error: 'This job posting is currently inactive' })
  }
  
  try {
    const result = applicantDb.prepare(
      'INSERT INTO applications (job_id, user_id, status) VALUES (?, ?, ?)'
    ).run(jobId, userId, 'pending')
    res.json({ success: true, applicationId: result.lastInsertRowid })
  } catch (e) {
    console.error('Application error:', e.message)
    res.json({ success: false, error: e.message })
  }
})

app.put('/api/applications/:id/status', (req, res) => {
  applicantDb.prepare('UPDATE applications SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ success: true })
})

app.delete('/api/applications/:id', (req, res) => {
  try {
    const appId = req.params.id;
    const app = applicantDb.prepare('SELECT status FROM applications WHERE id = ?').get(appId);
    if (!app) return res.json({ success: false, error: 'Application not found' });
    if (app.status !== 'pending') return res.json({ success: false, error: 'Cannot revert processed applications' });
    
    applicantDb.prepare('DELETE FROM applications WHERE id = ?').run(appId);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete application error:', e.message);
    res.json({ success: false, error: e.message });
  }
})

// ── Admin management ──────────────────────────────────────────────────────────

app.get('/api/users', (req, res) => {
  res.json(applicantDb.prepare('SELECT id, email, full_name, phone, barangay, created_at FROM users ORDER BY created_at DESC').all())
})

app.get('/api/employers', (req, res) => {
  res.json(employerDb.prepare('SELECT * FROM employers ORDER BY created_at DESC').all())
})

app.put('/api/employers/:id/status', (req, res) => {
  employerDb.prepare('UPDATE employers SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ success: true })
})

app.get('/api/stats', (req, res) => {
  res.json({
    userCount: applicantDb.prepare('SELECT COUNT(*) as c FROM users').get().c,
    employerCount: employerDb.prepare('SELECT COUNT(*) as c FROM employers').get().c,
    jobCount: employerDb.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'active'").get().c,
    applicationCount: applicantDb.prepare('SELECT COUNT(*) as c FROM applications').get().c,
  })
})

app.listen(3001, () => console.log('Server running on http://localhost:3001'))
