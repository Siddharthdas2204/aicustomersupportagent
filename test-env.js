require('dotenv').config({ path: 'server/.env' });
console.log('DB URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
