const { Pool } = require('pg');

const pool = new Pool({
  user: 'taller_user',       // el usuario que creaste
  host: 'localhost',
  database: 'taller',        // tu base de datos
    password: 'Andres56c',
  port: 5432,
});

module.exports = pool;