const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 9200;

app.use(bodyParser.json());
app.use(express.static('public'));

require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

app.get('/api/notes', (req, res) => {
  const searchQuery = req.query.search || '';
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 15;

  const query = `
    SELECT * FROM notes
    WHERE text LIKE ?
    ORDER BY date DESC
    LIMIT ?, ?
  `;

  db.query(query, [`%${searchQuery}%`, offset, limit], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  const query = 'INSERT INTO notes (text, date) VALUES (?, NOW())';

  db.query(query, [text], (err, result) => {
    if (err) {
      console.error('Error saving note:', err);
      res.status(500).send(err);
    } else {
      res.status(201).send({ id: result.insertId });
    }
  });
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const query = 'UPDATE notes SET text = ? WHERE id = ?';

  db.query(query, [text, id], (err, result) => {
    if (err) {
      console.error('Error updating note:', err);
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting note:', err);
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

app.put('/api/notes/:id/move-to-top', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE notes SET date = NOW() WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error moving note to top:', err);
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/api/notes/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM notes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching notes count:', err);
      res.status(500).send(err);
    } else {
      res.json(results[0]);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
