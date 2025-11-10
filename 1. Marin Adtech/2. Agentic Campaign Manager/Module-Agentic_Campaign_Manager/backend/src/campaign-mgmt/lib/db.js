/**
 * PostgreSQL Database Connection Module
 * 
 * Exports a configured PostgreSQL connection pool
 * for use in Lambda functions
 * 
 * Environment Variables Required:
 * - POSTGRES_HOST: PostgreSQL host
 * - POSTGRES_DB: PostgreSQL database name
 * - POSTGRES_USER: PostgreSQL user
 * - DB_PASSWORD: PostgreSQL password (from Secrets Manager)
 * 
 * @module db
 */

const { Pool } = require('pg');
const AWSXRay = require('aws-xray-sdk-core');

// PostgreSQL connection pool
// Note: In production, use connection pooling and proper error handling
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.DB_PASSWORD, // From Secrets Manager
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrap pool with X-Ray for tracing
AWSXRay.capturePostgres(pool);

// Export pool instance
module.exports = pool;

