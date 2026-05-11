export type JobStatus = "queued" | "processing" | "done" | "failed";
export type RunMode = "ws" | "http";

export interface JobPayload {
  selectedOption: string;
  numberValue: number;
}

export interface JobResponse {
  id: string;
  status: JobStatus;
  progress: number;
  result: string | null;
  error: string | null;
  createdAt: string;
}
