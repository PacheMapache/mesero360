const db = require('../config/database');

async function migrate() {
  try {
    console.log('Agregando campo imagen_url a la tabla productos...');
    
    await db.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_url TEXT;
    `);
    
    console.log('Migración completada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error ejecutando migración:', err);
    process.exit(1);
  }
}

migrate();
