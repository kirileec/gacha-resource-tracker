const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Use /app/data for Docker or local directory for development
const dbPath = path.join(process.env.NODE_ENV === 'production' ? '/app/data' : __dirname, 'gacha-tracker.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        conversion_rate INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE(game_id, name)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE(game_id, name)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS resource_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        version_id INTEGER,
        record_date TEXT NOT NULL,
        垫数 INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE SET NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS resource_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (record_id) REFERENCES resource_records(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        UNIQUE(record_id, resource_id)
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_resource_records_game_date ON resource_records(game_id, record_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_resource_records_version ON resource_records(version_id)`);
  });
}

initDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const gameRoutes = require('./routes/games');
const resourceRoutes = require('./routes/resources');
const versionRoutes = require('./routes/versions');
const recordRoutes = require('./routes/records');
const statsRoutes = require('./routes/stats');

app.use((req, res, next) => {
  req.db = db;
  next();
});



app.use('/api/games', gameRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/stats', statsRoutes);
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, 'public');
    app.use(express.static(publicPath));
    app.get('*', (req, res, next) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(publicPath, 'index.html'));
        } else {
          next();
        }
      });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});