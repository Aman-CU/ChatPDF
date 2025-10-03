import 'dotenv/config';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { registerRoutes } from '../server/routes';

// Vercel Function config
export const config = {
  runtime: 'nodejs20.x',
  memory: 1024,
  maxDuration: 10,
};

// Create an Express app and register the existing routes without starting a listener
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    // registerRoutes returns an http.Server but does not bind; we can ignore the return value
    await registerRoutes(app);
    // JSON error handler to normalize errors from routes and multer
    // Must be added after routes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: any, res: any, _next: any) => {
      // Handle Multer file size errors explicitly
      if (err && (err.name === 'MulterError') && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Max 4MB.' });
      }

      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(status).json({ error: message });
    });
    initialized = true;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureInitialized();
  // Delegate handling to the Express app
  // @ts-ignore - Express request/response are compatible with Node's IncomingMessage/ServerResponse
  return app(req, res);
}
