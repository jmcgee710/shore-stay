// Vercel serverless entry point. Wraps the Express app from the compiled
// backend (backend/dist) so each /api/* request invokes a single function.
import serverless from 'serverless-http';
// @ts-expect-error - resolved at runtime after `tsc` builds backend/dist
import app from '../backend/dist/index.js';

export default serverless(app as any);
