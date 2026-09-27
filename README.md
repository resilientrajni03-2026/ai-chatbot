# AI Chatbot

Full-stack chatbot application matching the provided reference UI.

## Stack

- Frontend: React + Vite (JavaScript)
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Database migrations: node-pg-migrate
- Version control: GitHub

## Repository structure

```
ai-chatbot/
├── frontend/          # React application
├── backend/           # Node.js + TypeScript API
│   └── migrations/    # PostgreSQL migrations
├── .env.example
├── .gitignore
└── package.json
```

## Database model

The first migration creates:

- `uploaded_files` — uploaded file metadata used by the file selector.
- `chats` — conversation history and the currently selected file.
- `messages` — user/assistant/system messages belonging to a chat.

All schema changes must be made through new migration files. Never manually alter the PostgreSQL schema for application changes.

## Development

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev:frontend
```

Run the backend:

```bash
npm run dev:backend
```

Apply PostgreSQL migrations:

```bash
npm run db:migrate
```

The current UI implements the reference layout, chat-history loading, new-chat creation, message persistence, and uploaded-file listing. AI response generation and actual file storage/upload will be added in the next feature phase.
