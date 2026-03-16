const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function enableVector() {
  try {
    await client.connect();
    console.log('Connected to database. Enabling vector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Success: pgvector extension enabled.');
  } catch (err) {
    console.error('Error enabling pgvector extension:', err);
  } finally {
    await client.end();
  }
}

enableVector();
