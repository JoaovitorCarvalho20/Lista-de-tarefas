const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Endpoints
app.get('/reminders', (req, res) => {
  db.query('SELECT * FROM reminders ORDER BY date', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/reminders', (req, res) => {
  const { title, description, date } = req.body;
  const formattedDate = new Date(date).toISOString().split('T')[0];
  db.query('INSERT INTO reminders (title, description, date) VALUES (?, ?, ?)', [title, description, formattedDate], (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, title, description, date: formattedDate, completed: false });
  });
});

app.put('/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed, date } = req.body;
  const formattedDate = new Date(date).toISOString().split('T')[0];
  db.query('UPDATE reminders SET title = ?, description = ?, completed = ?, date = ? WHERE id = ?', [title, description, completed, formattedDate, id], (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
    // Fetch and return the updated reminder
    db.query('SELECT * FROM reminders WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.json(results[0]);
    });
  });
});

app.delete('/reminders/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM reminders WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});
