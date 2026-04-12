const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDBConnection() {
  return open({
    filename: path.join(__dirname, 'investshield.sqlite'),
    driver: sqlite3.Database
  });
}

async function initDB() {
  const db = await getDBConnection();
  
  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Portfolio History table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_value REAL,
      health_score INTEGER,
      payload_json TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log("✅ SQLite Database initialized and checked.");
  return db;
}

module.exports = {
  getDBConnection,
  initDB
};
