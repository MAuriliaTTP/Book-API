const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: 'postgres://postgres:3336c054cc5@localhost:5432/book_inventory',
});

// Retrieve all books
app.get('/books', (req, res) => {
  pool.query('SELECT * FROM books', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(result.rows);
    }
  });
});

// Retrieve a specific book by ID
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  pool.query('SELECT * FROM books WHERE id = $1', [bookId], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Internal Server Error');
    } else if (result.rows.length === 0) {
      res.status(404).send('Book not found');
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Add a new book
app.post('/books', (req, res) => {
  const { title, author, genre, quantity } = req.body;
  pool.query(
    'INSERT INTO books (title, author, genre, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, author, genre, quantity],
    (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).json(result.rows[0]);
      }
    }
  );
});

// Update a book by ID
app.patch('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, genre, quantity } = req.body;
  pool.query(
    'UPDATE books SET title = $1, author = $2, genre = $3, quantity = $4 WHERE id = $5 RETURNING *',
    [title, author, genre, quantity, bookId],
    (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      } else if (result.rows.length === 0) {
        res.status(404).send('Book not found');
      } else {
        res.json(result.rows[0]);
      }
    }
  );
});

// Delete a book by ID
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [bookId], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Internal Server Error');
    } else if (result.rows.length === 0) {
      res.status(404).send('Book not found');
    } else {
      res.json(result.rows[0]);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});