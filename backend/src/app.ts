import cors from 'cors';
import express from 'express';
import chatRoutes from './routes/chat.routes.js';
import fileRoutes from './routes/file.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  }),
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Chatbot API is running',
  });
});

app.use('/api/chats', chatRoutes);
app.use('/api/files', fileRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

export default app;
