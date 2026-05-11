import Database from "better-sqlite3";
const db = new Database("jobs.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL,
    result TEXT,
    error TEXT,
    created_at TEXT NOT NULL
  );
`);
const insertJobStmt = db.prepare("INSERT INTO jobs (id, status, progress, result, error, created_at) VALUES (?, ?, ?, ?, ?, ?)");
const getJobStmt = db.prepare("SELECT * FROM jobs WHERE id = ?");
const updateJobStmt = db.prepare("UPDATE jobs SET status = ?, progress = ?, result = ?, error = ? WHERE id = ?");
const mapRow = (row) => ({
    id: row.id,
    status: row.status,
    progress: row.progress,
    result: row.result,
    error: row.error,
    createdAt: row.created_at,
});
export function insertJob(id) {
    insertJobStmt.run(id, "queued", 0, null, null, new Date().toISOString());
}
export function getJobById(id) {
    const row = getJobStmt.get(id);
    if (!row) {
        return null;
    }
    return mapRow(row);
}
export function updateJob(id, status, progress, result, error) {
    updateJobStmt.run(status, progress, result, error, id);
}
