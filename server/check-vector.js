const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkVector() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM pg_extension WHERE extname = \'vector\';');
    if (res.rows.length > 0) {
      console.log('Verified: vector extension IS installed.');
    } else {
      console.log('Error: vector extension is NOT installed.');
    }
  } catch (err) {
    console.error('Error checking extension:', err);
  } finally {
    await client.end();
  }
}

checkVector();
