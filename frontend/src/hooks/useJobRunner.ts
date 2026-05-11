import { useCallback, useEffect, useRef, useState } from "react";
import { createJob, getJobStatus, getJobWebSocketUrl } from "../api/jobs";
import type { JobPayload, JobResponse, RunMode } from "../types/job";

const pollingIntervalMs = 1200;

const isTerminalStatus = (job: Pick<JobResponse, "status">) => job.status === "done" || job.status === "failed";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export const useJobRunner = () => {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [runningMode, setRunningMode] = useState<RunMode | null>(null);
  const [isHttpLoading, setIsHttpLoading] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<number | null>(null);

  const stopWatchers = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;

    if (pollingRef.current !== null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const resetRunner = useCallback(() => {
    stopWatchers();
    setJob(null);
    setRunningMode(null);
    setIsHttpLoading(false);
    setError("");
  }, [stopWatchers]);

  const prepareRun = useCallback(
    (mode: RunMode) => {
      stopWatchers();
      setError("");
      setJob(null);
      setRunningMode(mode);
      setIsHttpLoading(mode === "http");
    },
    [stopWatchers],
  );

  const startWebSocketRun = useCallback(
    async (payload: JobPayload) => {
      try {
        prepareRun("ws");

        const createdJob = await createJob(payload);
        setJob(createdJob);

        const socket = new WebSocket(getJobWebSocketUrl(createdJob.id));
        wsRef.current = socket;

        socket.onmessage = (event) => {
          const update = JSON.parse(event.data) as Partial<JobResponse>;

          setJob((currentJob) => (currentJob ? { ...currentJob, ...update } : { ...createdJob, ...update }));

          if (update.status === "done" || update.status === "failed") {
            socket.close();
            wsRef.current = null;
          }
        };

        socket.onerror = () => {
          setError("WebSocket error");
        };

        socket.onclose = () => {
          if (wsRef.current === socket) {
            wsRef.current = null;
          }
        };
      } catch (error) {
        setRunningMode(null);
        setError(getErrorMessage(error, "Failed to start WebSocket job"));
      }
    },
    [prepareRun],
  );

  const startHttpRun = useCallback(
    async (payload: JobPayload) => {
      try {
        prepareRun("http");

        const createdJob = await createJob(payload);
        setJob(createdJob);

        const pollJob = async () => {
          const nextJob = await getJobStatus(createdJob.id);
          setJob(nextJob);

          if (isTerminalStatus(nextJob)) {
            stopWatchers();
            setIsHttpLoading(false);
          }
        };

        pollingRef.current = window.setInterval(() => {
          void pollJob().catch((error) => {
            stopWatchers();
            setIsHttpLoading(false);
            setError(getErrorMessage(error, "Polling failed"));
          });
        }, pollingIntervalMs);

        void pollJob();
      } catch (error) {
        stopWatchers();
        setRunningMode(null);
        setIsHttpLoading(false);
        setError(getErrorMessage(error, "Failed to start HTTP job"));
      }
    },
    [prepareRun, stopWatchers],
  );

  useEffect(() => stopWatchers, [stopWatchers]);

  return {
    error,
    isHttpLoading,
    job,
    resetRunner,
    runningMode,
    startHttpRun,
    startWebSocketRun,
  };
};
