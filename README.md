# AI Customer Support Agent

A production-ready RAG-based AI support agent with Google Auth, pgvector search, and streaming responses.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Clerk Auth.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (pgvector).
- **AI**: OpenAI (gpt-4o, text-embedding-3-small), LangChain.

## Setup Instructions

### 1. Database (PostgreSQL + pgvector)
Ensure you have a PostgreSQL instance running with the `pgvector` extension enabled.
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Setup
1. `cd server`
2. `npm install`
3. Update `.env` with your `DATABASE_URL`, `OPENAI_API_KEY`, and Clerk secrets.
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. `cd client`
2. `npm install`
3. Update `.env.local` with `VITE_CLERK_PUBLISHABLE_KEY`.
4. Start the app:
   ```bash
   npm run dev
   ```

## Key Features
- **Mandatory Google Auth**: Secured via Clerk.
- **RAG Architecture**: PDF/TXT parsing, chunking, and similarity search using `pgvector`.
- **Real-time Streaming**: Chat responses stream word-by-word via SSE.
- **Source Referencing**: AI explicitly mentions which document a fact came from.
- **Modern UI**: Dark/Light mode, glassmorphism, and smooth animations.
- **Admin Dashboard**: System-wide analytics and user management.
