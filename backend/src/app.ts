import cors from 'cors';
import express from 'express';

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

export default app;
