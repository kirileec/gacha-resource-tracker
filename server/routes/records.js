const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { game_id, start_date, end_date, version_id } = req.query;
  
  let query = `
    SELECT rr.*, v.name as version_name, g.name as game_name
    FROM resource_records rr
    LEFT JOIN versions v ON rr.version_id = v.id
    JOIN games g ON rr.game_id = g.id
    WHERE 1=1
  `;
  const params = [];
  
  if (game_id) {
    query += ' AND rr.game_id = ?';
    params.push(game_id);
  }
  if (version_id) {
    query += ' AND rr.version_id = ?';
    params.push(version_id);
  }
  if (start_date) {
    query += ' AND rr.record_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND rr.record_date <= ?';
    params.push(end_date);
  }
  
  query += ' ORDER BY rr.record_date DESC';
  
  req.db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

router.get('/:id', (req, res) => {
  req.db.get('SELECT * FROM resource_records WHERE id = ?', [req.params.id], (err, record) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!record) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      req.db.all(`
        SELECT rv.*, r.name as resource_name, r.conversion_rate
        FROM resource_values rv
        JOIN resources r ON rv.resource_id = r.id
        WHERE rv.record_id = ?
      `, [req.params.id], (err, values) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ ...record, values });
        }
      });
    }
  });
});

router.post('/', (req, res) => {
  const { game_id, version_id, record_date, 垫数, values } = req.body;
  if (!game_id || !record_date) {
    return res.status(400).json({ error: 'game_id and record_date are required' });
  }
  
  req.db.run(
    `INSERT INTO resource_records (game_id, version_id, record_date, 垫数)
     VALUES (?, ?, ?, ?)`,
    [game_id, version_id || null, record_date, 垫数 || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const recordId = this.lastID;
        
        if (values && Array.isArray(values)) {
          values.forEach((val) => {
            req.db.run(
              `INSERT INTO resource_values (record_id, resource_id, amount)
               VALUES (?, ?, ?)`,
              [recordId, val.resource_id, val.amount || 0]
            );
          });
        }
        
        res.status(201).json({ id: recordId, game_id, version_id, record_date, 垫数: 垫数 || 0 });
      }
    }
  );
});

router.put('/:id', (req, res) => {
  const { version_id, record_date, 垫数, values } = req.body;
  
  req.db.run(
    `UPDATE resource_records
     SET version_id = ?, record_date = ?, 垫数 = ?
     WHERE id = ?`,
    [version_id || null, record_date, 垫数 || 0, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Record not found' });
      } else {
        if (values && Array.isArray(values)) {
          req.db.run('DELETE FROM resource_values WHERE record_id = ?', [req.params.id], () => {
            values.forEach((val) => {
              req.db.run(
                `INSERT INTO resource_values (record_id, resource_id, amount)
                 VALUES (?, ?, ?)`,
                [req.params.id, val.resource_id, val.amount || 0]
              );
            });
          });
        }
        
        res.json({ id: parseInt(req.params.id), version_id, record_date, 垫数: 垫数 || 0 });
      }
    }
  );
});

router.delete('/:id', (req, res) => {
  req.db.run('DELETE FROM resource_records WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json({ message: 'Record deleted successfully' });
    }
  });
});

module.exports = router;