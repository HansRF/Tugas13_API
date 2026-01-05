const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "database.db"),
  (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to SQLite DB");
  }
);

// bikin tabel users kalau belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    data_added DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
