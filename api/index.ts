// Vercel serverless entry point. Wraps the Express app from ./_lib/ so each
// /api/* request invokes a single function. The _lib folder is hidden from
// Vercel's function discovery by the underscore prefix.
import serverless from 'serverless-http';
import app from './_lib/index.js';

export default serverless(app as any);
