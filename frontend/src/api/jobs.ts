import type { JobPayload, JobResponse } from "../types/job";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const parseJobResponse = async (response: Response): Promise<JobResponse> => {
  if (!response.ok) {
    throw new Error("Job request failed");
  }

  return (await response.json()) as JobResponse;
};

export const createJob = async (payload: JobPayload): Promise<JobResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJobResponse(response);
};

export const getJobStatus = async (jobId: string): Promise<JobResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

  return parseJobResponse(response);
};

export const getJobWebSocketUrl = (jobId: string) => {
  const wsBaseUrl = API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");

  return `${wsBaseUrl}/ws?jobId=${jobId}`;
};
