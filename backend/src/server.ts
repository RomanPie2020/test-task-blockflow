import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { createJob, getJob } from "./jobs.js";
import { setupWebSocket } from "./wsHub.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/jobs", (req, res) => {
  const { selectedOption, numberValue } = req.body ?? {};

  if (typeof selectedOption !== "string" || typeof numberValue !== "number") {
    res.status(400).json({ error: "selectedOption (string) and numberValue (number) are required" });
    return;
  }

  const job = createJob({ selectedOption, numberValue });
  res.status(201).json(job);
});

app.get("/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});
