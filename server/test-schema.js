const { Client } = require('pg');
require('dotenv').config({ path: 'server/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, udt_name, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'Chunk' AND column_name = 'embedding';
    `);
    console.log('Embedding Column Info:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();
