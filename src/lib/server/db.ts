import Database from "better-sqlite3";
import path from "path";

export const db = new Database(path.resolve("sqlite.db"));
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS minigame (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    filePath TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'unlisted', 'private')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS collection (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'unlisted', 'private')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS collection_minigames (
      collection_id TEXT,
      minigameId TEXT,
      PRIMARY KEY (collection_id, minigameId),
      FOREIGN KEY (collection_id) REFERENCES collection(id) ON DELETE CASCADE
  );
`);
