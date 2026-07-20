import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { keysRouter } from "./routes/keys.js";
import { personasRouter } from "./routes/personas.js";
import { createSessionGateway } from "./ws/sessionGateway.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/keys", keysRouter);
app.use("/api/personas", personasRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as { status?: number })?.status ?? 500;
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(status).json({ ok: false, error: message });
});

const server = createServer(app);
const sessionGateway = createSessionGateway();

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/api/sessions/stream") {
    sessionGateway.handleUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

const port = Number(process.env.PORT) || 8787;
server.listen(port, () => {
  console.log(`ai-screen-sense server listening on :${port}`);
});
