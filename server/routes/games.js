const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.db.all('SELECT * FROM games ORDER BY id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM games WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Game not found' });
    } else {
      res.json(row);
    }
  });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  req.db.run('INSERT INTO games (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, name });
    }
  });
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  req.db.run('UPDATE games SET name = ? WHERE id = ?', [name, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Game not found' });
    } else {
      res.json({ id: parseInt(req.params.id), name });
    }
  });
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM games WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Game not found' });
    } else {
      res.json({ message: 'Game deleted successfully' });
    }
  });
});

module.exports = router;