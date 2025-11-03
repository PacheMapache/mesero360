const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env si existe
dotenv.config();

// Configuración de la conexión (usa variables de entorno; ideales para RDS)
// SSL opcional para RDS (DB_SSL=true). Puedes pasar CA por ruta (DB_SSL_CA_FILE) o contenido base64 (DB_SSL_CA_BASE64)
let sslOption = undefined;
if (String(process.env.DB_SSL).toLowerCase() === 'true') {
  sslOption = { rejectUnauthorized: true };
  const caFile = process.env.DB_SSL_CA_FILE;
  const caB64 = process.env.DB_SSL_CA_BASE64;
  try {
    if (caFile) {
      const caPath = path.isAbsolute(caFile) ? caFile : path.join(process.cwd(), caFile);
      sslOption.ca = fs.readFileSync(caPath, 'utf8');
    } else if (caB64) {
      sslOption.ca = Buffer.from(caB64, 'base64').toString('utf8');
    }
  } catch (e) {
    console.warn('No se pudo cargar CA para SSL, usando configuración por defecto. Detalle:', e.message);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: sslOption,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Dependiendo de la aplicación, podrías process.exit(1) aquí
});

async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
