const { Pool } = require('pg');
require('dotenv').config();

// Use explicit params so peer auth (Unix socket) works correctly.
// This avoids issues with password-based connection strings.
const pool = new Pool({
  host: process.env.DB_HOST || '/var/run/postgresql',
  database: process.env.DB_NAME || 'members_only',
  // user/password optional — omit to rely on OS peer auth
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASS || undefined,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

module.exports = pool;
