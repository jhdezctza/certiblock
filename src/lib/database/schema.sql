CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    matricula TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    career TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula TEXT NOT NULL,
    hash TEXT UNIQUE NOT NULL,
    blockchain_tx TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula) REFERENCES students(matricula)
);

CREATE INDEX IF NOT EXISTS idx_certificates_hash ON certificates(hash);
CREATE INDEX IF NOT EXISTS idx_certificates_matricula ON certificates(matricula);