const Database = require("better-sqlite3")
const fs = require("fs")
const path = require("path")

// ایجاد پوشه data اگر وجود ندارد
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// ایجاد دیتابیس
const dbPath = path.join(dataDir, "app.db")
const db = new Database(dbPath)

console.log("Initializing SQLite database...")

try {
  // ایجاد جداول
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       email TEXT UNIQUE NOT NULL,
                                       password TEXT NOT NULL,
                                       first_name TEXT,
                                       last_name TEXT,
                                       full_name TEXT,
                                       avatar_url TEXT,
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       user_id INTEGER NOT NULL,
                                       title TEXT,
                                       template_id TEXT NOT NULL,
                                       image_url TEXT,
                                       caption TEXT,
                                       topic TEXT,
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
                                          id TEXT PRIMARY KEY,
                                          user_id INTEGER NOT NULL,
                                          expires_at DATETIME NOT NULL,
                                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
  `)

  console.log("Database initialized successfully!")
  console.log("Database location:", dbPath)
} catch (error) {
  console.error("Database initialization failed:", error)
} finally {
  db.close()
}
