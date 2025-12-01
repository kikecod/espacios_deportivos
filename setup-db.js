#!/usr/bin/env node

/**
 * Script para configurar automáticamente la base de datos PostgreSQL
 * Ejecutar con: node setup-db.js
 */

const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'espacios_deportivos';
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function setupDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    // Verificar si la base de datos existe
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (res.rows.length === 0) {
      // Crear la base de datos
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    } else {
      console.log(`ℹ️  Base de datos '${dbName}' ya existe`);
    }
    
    console.log('🚀 ¡Configuración completa! Ahora puedes ejecutar: npm run start:dev');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   PostgreSQL no está ejecutándose. Opciones:');
      console.error('   1. Ejecutar: npm run db:up (Docker)');
      console.error('   2. Iniciar PostgreSQL local: brew services start postgresql');
    } else if (error.code === '28P01') {
      console.error('   Credenciales incorrectas. Verifica tu archivo .env');
    } else {
      console.error('   ', error.message);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };