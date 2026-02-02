const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database', err);
  else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      is_active BOOLEAN DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER,
      text TEXT,
      type TEXT,
      options TEXT,
      category TEXT,
      order_num INTEGER,
      FOREIGN KEY(survey_id) REFERENCES surveys(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER,
      role_id INTEGER,
      answers TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(survey_id) REFERENCES surveys(id),
      FOREIGN KEY(role_id) REFERENCES roles(id)
    )`);
  });
}

// --- ROUTES ---

// 1. Surveys
app.get('/api/surveys', (req, res) => {
  db.all("SELECT * FROM surveys", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/surveys/:id', (req, res) => {
  const surveyId = req.params.id;
  db.get("SELECT * FROM surveys WHERE id = ?", [surveyId], (err, survey) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM questions WHERE survey_id = ? ORDER BY order_num ASC", [surveyId], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      const parsedQuestions = questions.map(q => ({ ...q, options: JSON.parse(q.options) }));
      res.json({ ...survey, questions: parsedQuestions });
    });
  });
});

// 2. Roles (Edit/Delete support)
app.get('/api/roles', (req, res) => {
  db.all("SELECT * FROM roles WHERE is_active = 1", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/roles', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run("INSERT INTO roles (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, is_active: 1 });
  });
});

app.delete('/api/roles/:id', (req, res) => {
  // Soft delete to preserve historical data
  db.run("UPDATE roles SET is_active = 0 WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 3. Responses
app.post('/api/responses', (req, res) => {
  const { surveyId, roleId, answers } = req.body;
  db.run("INSERT INTO responses (survey_id, role_id, answers) VALUES (?, ?, ?)",
    [surveyId, roleId, JSON.stringify(answers)], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

// 4. Reports (Filtered by Survey)
app.get('/api/reports/:surveyId', (req, res) => {
  const sql = `
    SELECT r.id, roles.name as role_name, r.answers, r.timestamp 
    FROM responses r
    JOIN roles ON r.role_id = roles.id
    WHERE r.survey_id = ?
    ORDER BY r.timestamp DESC
  `;
  db.all(sql, [req.params.surveyId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const reports = rows.map(r => ({ ...r, answers: JSON.parse(r.answers) }));
    res.json(reports);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
