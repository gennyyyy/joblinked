import sqlite3

conn = sqlite3.connect('db/jobs.sqlite')
conn.executescript('''
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
''')

jobs = [
  (None, "Civil Engineer", "Santa Maria Builders Corp.", "Poblacion, Sta. Maria", "Full-time", "Professional", "₱30,000 - ₱45,000", "Join our core team for upcoming municipal projects in Sta. Maria.", "BS Civil Engineering, Licensed, 2+ years experience"),
  (None, "Skilled Mason", "Guyong Construction Services", "Guyong, Sta. Maria", "Contract", "Skilled Labor", "₱600 - ₱800 / day", "Experienced masons needed for residential developments.", "TESDA NC II Certified, Physical fitness"),
  (None, "Summer Intern (GIP)", "Municipal Hall - Sta. Maria", "Poblacion, Sta. Maria", "GIP", "Student Programs", "Minimum Wage", "Government Internship Program for students residing in Sta. Maria.", "Student/Graduate, Resident of Sta. Maria"),
  (None, "Customer Service Associate", "WalterMart Sta. Maria", "Caypombo, Sta. Maria", "Full-time", "Professional", "₱14,000 - ₱16,000", "Help provide excellent service to local shoppers.", "HS Graduate, Good communication skills"),
  (None, "Warehouse Worker", "Santa Clara Logistics Hub", "Santa Clara, Sta. Maria", "Full-time", "Skilled Labor", "₱12,000 - ₱14,000", "Efficiently handle and organize local inventory.", "Can lift heavy loads, Reliable"),
  (None, "SPES Participant", "JobLinked Sta. Maria", "Poblacion, Sta. Maria", "SPES", "Student Programs", "Allowance based", "Special Program for Employment of Students during summer break.", "Strictly for students, Low-income family status"),
  (None, "Heavy Equipment Operator", "Bulacan Earthmovers Inc.", "San Jose Patag, Sta. Maria", "Full-time", "Skilled Labor", "₱18,000 - ₱25,000", "Experienced JCB and Bulldozer operators needed.", "Professional Driver's License, TESDA Cert"),
  (None, "Accountant", "L.M. Santiago Real Estate", "Bagbaguin, Sta. Maria", "Full-time", "Professional", "₱25,000 - ₱35,000", "Manage financial records for local property developments.", "CPA preferred, Proficient in Excel"),
  (None, "TUPAD Community Worker", "DOLE / JobLinked Sta. Maria", "Various Barangays, Sta. Maria", "TUPAD", "Skilled Labor", "Daily Rate (10 days)", "Emergency employment for displaced workers.", "Sta. Maria Resident, Unemployed/Displaced"),
  (None, "Production Operator", "Sta. Maria Industrial Park", "Pulong Buhangin, Sta. Maria", "Full-time", "Skilled Labor", "₱15,000 - ₱18,000", "Shift-based manufacturing work in electronics assembly.", "HS Graduate, Willing to work on shifts"),
]

conn.executemany(
  'INSERT INTO jobs (employer_id, title, company, location, type, category, salary, description, requirements) VALUES (?,?,?,?,?,?,?,?,?)',
  jobs
)
conn.commit()
conn.close()
print('Done. jobs.sqlite created with', len(jobs), 'jobs.')
