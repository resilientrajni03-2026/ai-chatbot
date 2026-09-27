import { Router } from 'express';
import { db } from '../db/index.js';
import { createId } from '../utils/id.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, selected_file_id, created_at, updated_at
       FROM chats
       ORDER BY updated_at DESC`,
    );

    res.json({ chats: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:chatId/messages', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, chat_id, role, content, created_at
       FROM messages
       WHERE chat_id = $1
       ORDER BY created_at ASC`,
      [req.params.chatId],
    );

    res.json({ messages: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const id = createId();
    const title = typeof req.body?.title === 'string' && req.body.title.trim()
      ? req.body.title.trim().slice(0, 255)
      : 'New chat';

    const result = await db.query(
      `INSERT INTO chats (id, title)
       VALUES ($1, $2)
       RETURNING id, title, selected_file_id, created_at, updated_at`,
      [id, title],
    );

    res.status(201).json({ chat: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * Creates a chat and saves its first user message in one transaction.
 * This is the endpoint used when the user submits the first message
 * of a brand-new conversation.
 */
router.post('/submit', async (req, res, next) => {
  const client = await db.connect();

  try {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
      client.release();
      res.status(400).json({ message: 'Message content is required.' });
      return;
    }

    const title = typeof req.body?.title === 'string' && req.body.title.trim()
      ? req.body.title.trim().slice(0, 255)
      : content.slice(0, 45);

    await client.query('BEGIN');

    const chatId = createId();
    const chatResult = await client.query(
      `INSERT INTO chats (id, title)
       VALUES ($1, $2)
       RETURNING id, title, selected_file_id, created_at, updated_at`,
      [chatId, title],
    );

    const messageId = createId();
    const messageResult = await client.query(
      `INSERT INTO messages (id, chat_id, role, content)
       VALUES ($1, $2, 'user', $3)
       RETURNING id, chat_id, role, content, created_at`,
      [messageId, chatId, content],
    );

    await client.query(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [chatId],
    );

    await client.query('COMMIT');

    res.status(201).json({
      chat: {
        ...chatResult.rows[0],
        updated_at: new Date().toISOString(),
      },
      message: messageResult.rows[0],
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to rollback chat creation:', rollbackError);
    }

    next(error);
  } finally {
    client.release();
  }
});

router.post('/:chatId/messages', async (req, res, next) => {
  try {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
      res.status(400).json({ message: 'Message content is required.' });
      return;
    }

    const chatCheck = await db.query('SELECT id FROM chats WHERE id = $1', [req.params.chatId]);

    if (chatCheck.rowCount === 0) {
      res.status(404).json({ message: 'Chat not found.' });
      return;
    }

    const messageId = createId();

    const result = await db.query(
      `INSERT INTO messages (id, chat_id, role, content)
       VALUES ($1, $2, 'user', $3)
       RETURNING id, chat_id, role, content, created_at`,
      [messageId, req.params.chatId, content],
    );

    await db.query(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.params.chatId],
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
