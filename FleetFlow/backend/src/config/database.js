/**
 * FleetFlow — MySQL Connection Pool
 *
 * Uses mysql2/promise for async/await support.
 * All config values are driven from environment variables via dotenv.
 * The pool is created once and re-used across the application.
 */

'use strict';

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// ── Pool configuration ────────────────────────────────────────────────────────
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fleetflow_db',

  // Connection pool sizing
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  queueLimit: 0,                      // unlimited queue

  // Keep connections alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,       // 10 seconds

  // Automatically handle timezone
  timezone: '+00:00',

  // Return JS Date objects for DATETIME / TIMESTAMP columns
  dateStrings: false,
};

// ── Create pool ───────────────────────────────────────────────────────────────
const pool = mysql.createPool(poolConfig);

// ── Health-check helper ───────────────────────────────────────────────────────
/**
 * Verify that the pool can reach the database.
 * Call this once at server startup.
 */
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log(
      `✅  MySQL connected — ${poolConfig.user}@${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`
    );
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    throw err;                         // let server.js decide whether to exit
  } finally {
    if (connection) connection.release();
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function closePool() {
  try {
    await pool.end();
    console.log('🔒  MySQL pool closed gracefully.');
  } catch (err) {
    console.error('Error closing MySQL pool:', err.message);
  }
}

module.exports = { pool, testConnection, closePool };
