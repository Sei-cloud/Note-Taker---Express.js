const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const dbPath = path.join(__dirname, 'db/db.json');

// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to serve static files (e.g., HTML, CSS, client-side JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Route to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read data from the database.' });
      return;
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// Route to save a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read data from the database.' });
      return;
    }
    const notes = JSON.parse(data);
    newNote.id = Date.now().toString(); // Generate a unique ID for the new note
    notes.push(newNote);
    fs.writeFile(dbPath, JSON.stringify(notes), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to write data to the database.' });
        return;
      }
      res.json(newNote);
    });
  });
});

// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read data from the database.' });
      return;
    }
    let notes = JSON.parse(data);
    const index = notes.findIndex(note => note.id === noteId);
    if (index !== -1) {
      notes.splice(index, 1);
      fs.writeFile(dbPath, JSON.stringify(notes), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to write data to the database.' });
          return;
        }
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(404); // Note not found
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
