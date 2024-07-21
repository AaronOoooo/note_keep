require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MariaDB:', err.stack);
    return;
  }
  console.log('Connected to MariaDB as id ' + connection.threadId);
});

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

console.log(`Attempting to start server on ${host}:${port}`);

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

// Create the notes table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
connection.query(createTableQuery, (err) => {
  if (err) throw err;
});

// Routes

// Get all notes
app.get('/api/notes', (req, res) => {
  const searchQuery = req.query.search ? `WHERE text LIKE ?` : '';
  const query = `SELECT * FROM notes ${searchQuery} ORDER BY date DESC LIMIT 10 OFFSET ?`;
  const offset = parseInt(req.query.offset) || 0;
  const params = searchQuery ? [`%${req.query.search}%`, offset] : [offset];
  
  connection.query(query, params, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  const query = 'INSERT INTO notes (text) VALUES (?)';
  connection.query(query, [text], (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, text, date: new Date() });
  });
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const query = 'UPDATE notes SET text = ?, date = CURRENT_TIMESTAMP WHERE id = ?';
  connection.query(query, [text, id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Move a note to the top
app.put('/api/notes/:id/move-to-top', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE notes SET date = CURRENT_TIMESTAMP WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});
