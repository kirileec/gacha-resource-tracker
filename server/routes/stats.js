const express = require('express');
const router = express.Router();

router.get('/pulls/:gameId', (req, res) => {
  const { gameId } = req.params;
  const { start_date, end_date, version_id } = req.query;
  
  let query = `
    SELECT rr.id, rr.record_date, rr.垫数, rr.version_id,
      SUM(rv.amount / r.conversion_rate) as resource_pulls,
      rr.垫数 as pad_pulls,
      SUM(rv.amount / r.conversion_rate) + rr.垫数 as total_pulls
    FROM resource_records rr
    LEFT JOIN resource_values rv ON rr.id = rv.record_id
    LEFT JOIN resources r ON rv.resource_id = r.id
    WHERE rr.game_id = ?
  `;
  const params = [gameId];
  
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
  
  query += ' GROUP BY rr.id ORDER BY rr.record_date ASC';
  
  req.db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      let cumulativePulls = 0;
      const result = rows.map(r => {
        cumulativePulls += (r.total_pulls || 0);
        return {
          date: r.record_date,
          pulls: r.total_pulls || 0,
          cumulative_pulls: cumulativePulls
        };
      });
      
      res.json(result);
    }
  });
});

router.get('/current/:gameId', (req, res) => {
  const { gameId } = req.params;
  
  req.db.all(`
    SELECT 
      r.id,
      r.name,
      r.conversion_rate,
      COALESCE(SUM(rv.amount), 0) as total_amount
    FROM resources r
    LEFT JOIN resource_records rr ON rr.game_id = r.game_id
    LEFT JOIN resource_values rv ON rv.record_id = rr.id AND rv.resource_id = r.id
    WHERE r.game_id = ?
    GROUP BY r.id
  `, [gameId], (err, resources) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      req.db.get(`
        SELECT rr.*, SUM(rv.amount / r.conversion_rate) as resource_pulls, rr.垫数
        FROM resource_records rr
        LEFT JOIN resource_values rv ON rr.id = rv.record_id
        LEFT JOIN resources r ON rv.resource_id = r.id
        WHERE rr.game_id = ?
        GROUP BY rr.id
        ORDER BY rr.record_date DESC
        LIMIT 1
      `, [gameId], (err, currentRecord) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          let totalPulls = 0;
          if (currentRecord) {
            totalPulls = (currentRecord.resource_pulls || 0) + (currentRecord.垫数 || 0);
          }
          
          res.json({
            game_id: gameId,
            total_pulls: totalPulls,
            resources: resources,
            last_record_date: currentRecord ? currentRecord.record_date : null
          });
        }
      });
    }
  });
});

module.exports = router;