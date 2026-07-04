import Database from "better-sqlite3";
import path from "path";

export const db = new Database(path.resolve("sqlite.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS minigame (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    filePath TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'unlisted', 'private')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  )
`);