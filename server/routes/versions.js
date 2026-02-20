const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { game_id } = req.query;
  let query, params;
  
  if (game_id) {
    query = 'SELECT * FROM versions WHERE game_id = ? ORDER BY start_date DESC';
    params = [game_id];
  } else {
    query = 'SELECT versions.*, games.name as game_name FROM versions JOIN games ON versions.game_id = games.id ORDER BY versions.start_date DESC';
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
  req.db.get('SELECT * FROM versions WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Version not found' });
    } else {
      res.json(row);
    }
  });
});

router.post('/', (req, res) => {
  const { game_id, name, start_date, end_date } = req.body;
  if (!game_id || !name || !start_date) {
    return res.status(400).json({ error: 'game_id, name, and start_date are required' });
  }
  req.db.run(
    'INSERT INTO versions (game_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
    [game_id, name, start_date, end_date || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, game_id, name, start_date, end_date: end_date || null });
      }
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, start_date, end_date } = req.body;
  req.db.run(
    'UPDATE versions SET name = ?, start_date = ?, end_date = ? WHERE id = ?',
    [name, start_date, end_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Version not found' });
      } else {
        res.json({ id: parseInt(req.params.id), name, start_date, end_date });
      }
    }
  );
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM versions WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Version not found' });
    } else {
      res.json({ message: 'Version deleted successfully' });
    }
  });
});

module.exports = router;