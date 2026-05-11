import type { CSSProperties } from "react"
import { useMemo, useRef, useState } from "react"
import "./App.css"

type JobStatus = "queued" | "processing" | "done" | "failed";
type RunMode = "ws" | "http";
type WeightUnit = "lbs" | "kg";

interface JobResponse {
  id: string;
  status: JobStatus;
  progress: number;
  result: string | null;
  error: string | null;
  createdAt: string;
}

const options = ["😊 wish1", "🥳 wish2", "⚖️ wish3", "💚 wish4", "☺️ wish5"];
const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function App() {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [numericValue, setNumericValue] = useState<string>("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [runningMode, setRunningMode] = useState<RunMode | null>(null);
  const [httpLoading, setHttpLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<number | null>(null);

  const numeric = Number(numericValue);
  const min = unit === "kg" ? 10 : 22;
  const max = unit === "kg" ? 200 : 485;
  const isNumberValid = useMemo(() => numeric >= min && numeric <= max, [numeric, min, max]);
  const topProgress = (step / 3) * 100;
  const wsProgressValue = job?.progress ?? 0;

  const resetAll = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setStep(1);
    setSelectedOption("");
    setNumericValue("");
    setRunningMode(null);
    setJob(null);
    setHttpLoading(false);
    setError("");
    setUnit("kg");
  };

  const createJob = async (): Promise<JobResponse> => {
    const response = await fetch(`${apiBase}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedOption,
        numberValue: Number(numericValue),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create job");
    }

    return (await response.json()) as JobResponse;
  };

  const startWithWebSocket = async () => {
    setError("");
    setRunningMode("ws");
    const created = await createJob();
    setJob(created);

    const wsUrl = apiBase.replace("http://", "ws://").replace("https://", "wss://");
    const ws = new WebSocket(`${wsUrl}/ws?jobId=${created.id}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data) as Partial<JobResponse>;
      setJob((previous) => (previous ? { ...previous, ...update } : created));
      if (update.status === "done" || update.status === "failed") {
        ws.close();
      }
    };

    ws.onerror = () => {
      setError("WebSocket error");
    };
  };

  const startWithHttp = async () => {
    setError("");
    setRunningMode("http");
    setHttpLoading(true);
    const created = await createJob();
    setJob(created);

    pollingRef.current = window.setInterval(async () => {
      const response = await fetch(`${apiBase}/jobs/${created.id}`);
      if (!response.ok) {
        return;
      }

      const nextState = (await response.json()) as JobResponse;
      setJob(nextState);
      if (nextState.status === "done" || nextState.status === "failed") {
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setHttpLoading(false);
      }
    }, 1200);
  };

  return (
    <main className="page">
      {(step === 1 || step === 2) && (
        <div className="topBar">
          <button
            type="button"
            className="backButton"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || runningMode !== null}
          >
            ‹
          </button>
          <div className="lineTrack">
            <div className="lineFill" style={{ width: `${topProgress}%` }} />
          </div>
        </div>
      )}

      <div className="card">
        <h1>
          {step === 1 ? (
            "What is your main wish?"
          ) : step === 2 ? (
            "What is your goal weight?"
          ) : (
            "Create something good for you..."
          )}

        </h1>

        {step === 1 && (
          <section>
            <div className="options">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option ${selectedOption === option ? "active" : ""}`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button type="button" disabled={!selectedOption} onClick={() => setStep(2)}>
              Continue
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="weightSection">
            <div className="unitSwitch">
              <button
                type="button"
                className={`unitOption ${unit === "lbs" ? "active" : ""}`}
                onClick={() => setUnit("lbs")}
              >
                lbs
              </button>
              <button
                type="button"
                className={`unitOption ${unit === "kg" ? "active" : ""}`}
                onClick={() => setUnit("kg")}
              >
                kg
              </button>
            </div>

            <input
              className={`weightInput ${!isNumberValid && numericValue ? "invalid" : ""}`}
              type="number"
              value={numericValue}
              onChange={(event) => setNumericValue(event.target.value)}
              placeholder={unit === "kg" ? "56" : "123"}
            />
            <div className={`rangeHint ${!isNumberValid && numericValue ? "error" : ""}`}>
              {unit === "kg"
                ? "Please enter a value from 1 kg to 200 kg"
                : "Please enter a value between 22 lbs and 485 lbs"}
            </div>

            {isNumberValid && (
              <div className="goalCard">
                <p className="goalTitle">⚖ Goal: Lose 5% of your weight</p>
                <p className="goalText">
                  Even small, steady changes can make a meaningful difference. We&apos;ll support you with a balanced
                  plan to help you feel lighter, healthier, and more confident over time.
                </p>
              </div>
            )}

            <button className="continueButton" type="button" disabled={!isNumberValid} onClick={() => setStep(3)}>
              Continue
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="runSection">
            <div className="actions">
              <button type="button" onClick={startWithWebSocket} disabled={runningMode !== null}>
                Start via WebSocket
              </button>
              <button type="button" onClick={startWithHttp} disabled={runningMode !== null}>
                Start via HTTP
              </button>
              <button type="button" className="secondary" onClick={resetAll}>
                Reset
              </button>
            </div>

            {runningMode === "ws" && job && (
              <div className="progressBlock progressDark">
                <div
                  className="circleProgress"
                  style={
                    {
                      "--progress": `${wsProgressValue}%`,
                    } as CSSProperties
                  }
                >
                  <span>{wsProgressValue}%</span>
                </div>
                {job?.status === "done" ? (<p className="progressTitle">It's done!</p>
                 ) : (<><p className="progressTitle">Creating something good for you...</p>
                <p className="progressHint">This will only take a moment — your item is almost ready.</p></>)}

                <div className="reviewCard">
                  <div className="reviewTop">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span>John</span>
                  </div>
                  <p>&quot;I love this website! It makes practicing so easy and relaxing.&quot;</p>
                </div>
              </div>
            )}

            {runningMode === "http" && (
              <div className="progressBlock">
                <p className="progressTitle">Processing via HTTP</p>
                {httpLoading ? <div className="indeterminate" /> : <p>Finished</p>}
                {job?.status === "done" && <p>Result: {job.result}</p>}
              </div>
            )}

            {job?.status === "failed" && <p className="error">Job failed: {job.error}</p>}
            {error && <p className="error">{error}</p>}
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
