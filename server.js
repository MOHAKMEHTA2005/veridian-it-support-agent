import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Import serverless handlers directly
import chatHandler from './api/chat.js';
import ticketsHandler from './api/tickets.js';
import auditHandler from './api/audit.js';
import kbHandler from './api/kb.js';
import requestsHandler from './api/requests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount framework-independent handlers to /api routes
app.all('/api/chat', (req, res) => chatHandler(req, res));
app.all('/api/tickets', (req, res) => ticketsHandler(req, res));
app.all('/api/audit', (req, res) => auditHandler(req, res));
app.all('/api/kb', (req, res) => kbHandler(req, res));
app.all('/api/requests', (req, res) => requestsHandler(req, res));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Veridian Corp IT Support Agent API',
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    timestamp: new Date().toISOString()
  });
});

// Serve static production build if dist exists
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  res.sendFile(join(__dirname, 'dist', 'index.html'), err => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Veridian Corp IT Support Agent Server running`);
  console.log(`Local API: http://localhost:${PORT}/api/health`);
  console.log(`Configured Model: ${process.env.GEMINI_MODEL || 'gemini-3.6-flash'}`);
  console.log(`=======================================================`);
});
