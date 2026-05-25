# AI Customer Support Agent

A production-ready RAG-based AI support agent with Auth, pgvector search, and Gemini AI streaming responses.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Clerk Auth.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (pgvector).
- **AI**: Gemini API (Google), HuggingFace (Embeddings), LangChain.

## Setup Instructions

### 1. Database (PostgreSQL + pgvector)
Ensure you have a PostgreSQL instance running with the `pgvector` extension enabled (e.g. Neon DB, Supabase).
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Setup
1. Open a terminal and run:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in the `server` folder and add your keys:
   ```env
   PORT=5001
   DATABASE_URL="your-postgresql-url-here"
   GEMINI_API_KEY="your-google-gemini-key"
   HUGGINGFACE_API_KEY="your-huggingface-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   FRONTEND_URL=http://localhost:5173
   ```
3. Run the database migrations to set up the tables:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and run:
   ```bash
   cd client
   npm install
   ```
2. Create a `.env` file in the `client` folder:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   VITE_API_URL=http://localhost:5001
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

*(Tip: If you are on Windows, you can also just double click the `start-local.bat` file in the root folder to start both servers instantly once the setup is done!)*
