import type { Express } from "express";
import { createWebSocketServer } from "./websocket";
import { registerAllRoutes } from "./routes/index";

export async function registerRoutes(app: Express) {
  // Register all API routes
  registerAllRoutes(app);

  // Create and return WebSocket-enabled HTTP server
  return createWebSocketServer(app);
}
