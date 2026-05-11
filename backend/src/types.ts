export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface JobRecord {
  id: string;
  status: JobStatus;
  progress: number;
  result: string | null;
  error: string | null;
  createdAt: string;
}

export interface JobEvent {
  id: string;
  status: JobStatus;
  progress: number;
  result?: string | null;
  error?: string | null;
}
