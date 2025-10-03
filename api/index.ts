import 'dotenv/config';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { registerRoutes } from '../server/routes';

// Create an Express app and register the existing routes without starting a listener
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    // registerRoutes returns an http.Server but does not bind; we can ignore the return value
    await registerRoutes(app);
    initialized = true;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureInitialized();
  // Delegate handling to the Express app
  // @ts-ignore - Express request/response are compatible with Node's IncomingMessage/ServerResponse
  return app(req, res);
}
