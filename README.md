# AI Chatbot

Full-stack chatbot application built with React, Node.js, TypeScript, and PostgreSQL.

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

## Requirements

- Node.js 20.11+
- npm
- PostgreSQL 13+

## Development

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev:frontend
```

Run backend:

```bash
npm run dev:backend
```

Run database migrations:

```bash
npm run db:migrate
```

> Database schema changes must be made through migrations. Do not manually change the PostgreSQL schema.
