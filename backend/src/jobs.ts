import { randomUUID } from "node:crypto";
import { createPipeline } from "./pipeline/steps.js";
import { broadcastJobEvent } from "./wsHub.js";
import { getJobById, insertJob, updateJob } from "./db.js";
import { JobStatus } from "./types.js";

type JobPayload = {
  selectedOption: string;
  numberValue: number;
};

function publishState(
  id: string,
  status: JobStatus,
  progress: number,
  result: string | null = null,
  error: string | null = null,
) {
  updateJob(id, status, progress, result, error);
  broadcastJobEvent({ id, status, progress, result, error });
}

async function processJob(id: string, payload: JobPayload) {
  const steps = createPipeline();
  try {
    publishState(id, "processing", 5);
    const stepProgressPoints = [30, 65, 100];

    for (let i = 0; i < steps.length; i += 1) {
      await steps[i](payload);
      publishState(id, "processing", stepProgressPoints[i]);
    }

    const result = `Mock result for ${payload.selectedOption} with value ${payload.numberValue}`;
    publishState(id, "done", 100, result, null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    publishState(id, "failed", 100, null, message);
  }
}

export function createJob(payload: JobPayload) {
  const id = randomUUID();
  insertJob(id);
  broadcastJobEvent({ id, status: "queued", progress: 0 });
  void processJob(id, payload);
  return getJobById(id);
}

export function getJob(id: string) {
  return getJobById(id);
}
