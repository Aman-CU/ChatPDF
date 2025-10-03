import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import fs from 'fs';
import path from 'path';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Robust CORS for separating frontend (Vercel) and backend (Render)
// FRONTEND_ORIGIN can be a single origin or a comma-separated list.
app.use((req, res, next) => {
  const envVal = process.env.FRONTEND_ORIGIN?.trim();
  const allowlist = envVal ? envVal.split(',').map(o => o.trim()).filter(Boolean) : [];
  const reqOrigin = req.headers.origin as string | undefined;

  // Allow all if no allowlist provided
  if (!allowlist.length || allowlist.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (reqOrigin && allowlist.includes(reqOrigin)) {
    res.header('Access-Control-Allow-Origin', reqOrigin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // We don't use cookies, but enabling credentials reflection is safe if needed later
  // res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production on Render, we may not ship the built client.
    // Only serve static if client/dist exists; otherwise, run API-only.
    const distPath = path.resolve(import.meta.dirname, "..", "client", "dist");
    if (fs.existsSync(distPath)) {
      serveStatic(app);
    } else {
      log(`client/dist not found at ${distPath}; continuing with API-only server`, 'express');
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
