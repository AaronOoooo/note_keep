const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 9200;

app.use(bodyParser.json());
app.use(express.static('public'));

// Log the process of reading .env file
console.log('Reading environment variables from .env file');
require('dotenv').config();

// Create a MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Log successful database connection
db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// API endpoint to get notes
app.get('/api/notes', (req, res) => {
  const searchQuery = req.query.search || '';
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 15;

  const query = `
    SELECT * FROM notes
    WHERE text LIKE ?
    ORDER BY id DESC
    LIMIT ?, ?
  `;

  db.query(query, [`%${searchQuery}%`, offset, limit], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      res.status(500).send(err);
    } else {
      console.log('Fetched notes:', results.length);
      res.json(results);
    }
  });
});

// API endpoint to save a new note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  const query = 'INSERT INTO notes (text, date) VALUES (?, NOW())';

  db.query(query, [text], (err, result) => {
    if (err) {
      console.error('Error saving note:', err);
      res.status(500).send(err);
    } else {
      console.log('Saved new note:', result.insertId);
      res.status(201).send({ id: result.insertId });
    }
  });
});

// API endpoint to update a note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const query = 'UPDATE notes SET text = ? WHERE id = ?';

  db.query(query, [text, id], (err, result) => {
    if (err) {
      console.error('Error updating note:', err);
      res.status(500).send(err);
    } else {
      console.log('Updated note:', id);
      res.sendStatus(204);
    }
  });
});

// API endpoint to move a note to top
app.put('/api/notes/:id/move-to-top', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE notes SET date = NOW() WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error moving note to top:', err);
      res.status(500).send(err);
    } else {
      console.log('Moved note to top:', id);
      res.sendStatus(204);
    }
  });
});

// API endpoint to delete a note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting note:', err);
      res.status(500).send(err);
    } else {
      console.log('Deleted note:', id);
      res.sendStatus(204);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Attempting to start server on ${process.env.HOST}:${port}`);
  console.log(`Server is running on http://${process.env.HOST}:${port}`);
});
