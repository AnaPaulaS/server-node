const { Pool } = require('pg');

const pool = new Pool({
  user: 'pitelecom_user',
  host: 'localhost',
  database: 'pitelecom_db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pool;
