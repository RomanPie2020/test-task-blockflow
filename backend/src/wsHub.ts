import { WebSocketServer, WebSocket } from "ws";
import { JobEvent } from "./types.js";
import { getJobById } from "./db.js";

const jobSubscribers = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url ?? "", "http://localhost");
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      socket.close(1008, "jobId is required");
      return;
    }

    const subscribers = jobSubscribers.get(jobId) ?? new Set<WebSocket>();
    subscribers.add(socket);
    jobSubscribers.set(jobId, subscribers);

    const currentJob = getJobById(jobId);
    if (currentJob && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(currentJob));
    }

    socket.on("close", () => {
      subscribers.delete(socket);
      if (subscribers.size === 0) {
        jobSubscribers.delete(jobId);
      }
    });
  });
}

export function broadcastJobEvent(event: JobEvent) {
  const subscribers = jobSubscribers.get(event.id);
  if (!subscribers) {
    return;
  }

  const payload = JSON.stringify(event);
  subscribers.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}
