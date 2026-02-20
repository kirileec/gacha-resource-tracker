const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { game_id } = req.query;
  let query, params;
  
  if (game_id) {
    query = 'SELECT * FROM resources WHERE game_id = ? ORDER BY id';
    params = [game_id];
  } else {
    query = 'SELECT resources.*, games.name as game_name FROM resources JOIN games ON resources.game_id = games.id ORDER BY resources.id';
    params = [];
  }
  
  req.db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM resources WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Resource not found' });
    } else {
      res.json(row);
    }
  });
});

router.post('/', (req, res) => {
  const { game_id, name, conversion_rate } = req.body;
  if (!game_id || !name) {
    return res.status(400).json({ error: 'game_id and name are required' });
  }
  req.db.run(
    'INSERT INTO resources (game_id, name, conversion_rate) VALUES (?, ?, ?)',
    [game_id, name, conversion_rate || 1],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, game_id, name, conversion_rate: conversion_rate || 1 });
      }
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, conversion_rate } = req.body;
  req.db.run(
    'UPDATE resources SET name = ?, conversion_rate = ? WHERE id = ?',
    [name, conversion_rate, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Resource not found' });
      } else {
        res.json({ id: parseInt(req.params.id), name, conversion_rate });
      }
    }
  );
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM resources WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Resource not found' });
    } else {
      res.json({ message: 'Resource deleted successfully' });
    }
  });
});

module.exports = router;