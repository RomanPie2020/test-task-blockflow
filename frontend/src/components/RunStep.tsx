import type { CSSProperties } from "react";
import type { JobResponse, RunMode } from "../types/job";

interface RunStepProps {
  error: string;
  isHttpLoading: boolean;
  job: JobResponse | null;
  runningMode: RunMode | null;
  onReset: () => void;
  onStartHttp: () => void;
  onStartWebSocket: () => void;
}

export function RunStep({
  error,
  isHttpLoading,
  job,
  runningMode,
  onReset,
  onStartHttp,
  onStartWebSocket,
}: RunStepProps) {
  return (
    <section className="runSection">
      <div className="actions">
        <button type="button" onClick={onStartWebSocket} disabled={runningMode !== null}>
          Start via WebSocket
        </button>
        <button type="button" onClick={onStartHttp} disabled={runningMode !== null}>
          Start via HTTP
        </button>
        <button type="button" className="secondary" onClick={onReset}>
          Reset
        </button>
      </div>

      {runningMode === "ws" && job && <WebSocketProgress job={job} />}
      {runningMode === "http" && <HttpProgress isLoading={isHttpLoading} job={job} />}

      {job?.status === "failed" && <p className="error">Job failed: {job.error}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

function WebSocketProgress({ job }: { job: JobResponse }) {
  const progress = job.progress ?? 0;
  const isDone = job.status === "done";

  return (
    <div className="progressBlock progressDark">
      <div className="circleProgress" style={{ "--progress": `${progress}%` } as CSSProperties}>
        <span>{progress}%</span>
      </div>

      {isDone ? (
        <p className="progressTitle">It&apos;s done!</p>
      ) : (
        <>
          <p className="progressTitle">Creating something good for you...</p>
          <p className="progressHint">This will only take a moment - your item is almost ready.</p>
        </>
      )}

      <div className="reviewCard">
        <div className="reviewTop">
          <span>⭐⭐⭐⭐⭐</span>
          <span>John</span>
        </div>
        <p>&quot;I love this website! It makes practicing so easy and relaxing.&quot;</p>
      </div>
    </div>
  );
}

function HttpProgress({ isLoading, job }: { isLoading: boolean; job: JobResponse | null }) {
  return (
    <div className="progressBlock">
      <p className="progressTitle">{job?.status === "done" ? "It's done!" : "Processing via HTTP"}</p>
      {isLoading ? <div className="indeterminate" /> : <p className="statusText">Finished</p>}
      {job?.status === "done" && <p className="resultText">Result: {job.result}</p>}
    </div>
  );
}
