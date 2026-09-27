import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, original_name, mime_type, size_bytes, created_at
       FROM uploaded_files
       ORDER BY created_at DESC`,
    );

    res.json({ files: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
