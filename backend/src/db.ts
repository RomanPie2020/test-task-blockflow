import Database from "better-sqlite3";
import { JobRecord, JobStatus } from "./types.js";

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

const insertJobStmt = db.prepare(
  "INSERT INTO jobs (id, status, progress, result, error, created_at) VALUES (?, ?, ?, ?, ?, ?)",
);
const getJobStmt = db.prepare("SELECT * FROM jobs WHERE id = ?");
const updateJobStmt = db.prepare(
  "UPDATE jobs SET status = ?, progress = ?, result = ?, error = ? WHERE id = ?",
);

const mapRow = (row: any): JobRecord => ({
  id: row.id,
  status: row.status as JobStatus,
  progress: row.progress,
  result: row.result,
  error: row.error,
  createdAt: row.created_at,
});

export function insertJob(id: string) {
  insertJobStmt.run(id, "queued", 0, null, null, new Date().toISOString());
}

export function getJobById(id: string): JobRecord | null {
  const row = getJobStmt.get(id);
  if (!row) {
    return null;
  }
  return mapRow(row);
}

export function updateJob(
  id: string,
  status: JobStatus,
  progress: number,
  result: string | null,
  error: string | null,
) {
  updateJobStmt.run(status, progress, result, error, id);
}
