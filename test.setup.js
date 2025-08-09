// Configuración global para las pruebas de API

// Aumentar timeout para pruebas de integración
jest.setTimeout(30000);

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.DB_NAME = 'test_database';

// Configuración de base de datos de prueba
// Ajusta según tu base de datos (MongoDB, PostgreSQL, MySQL, etc.)

// Para MongoDB con Mongoose:
/*
const mongoose = require('mongoose');

beforeAll(async () => {
  const url = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_db';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
*/

// Para PostgreSQL/MySQL con Sequelize:
/*
const { sequelize } = require('./models');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Recrear tablas
});

afterAll(async () => {
  await sequelize.close();
});
*/

// Para bases de datos en memoria o SQLite:
/*
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

beforeAll(async () => {
  db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });
  
  // Crear tablas necesarias
  await db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT,
      telefono TEXT,
      edad INTEGER,
      direccion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS objetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      descripcion TEXT,
      categoria TEXT,
      precio REAL,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      descripcion TEXT,
      categoria TEXT,
      precio REAL,
      duracion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT,
      monto REAL,
      descripcion TEXT,
      fecha TEXT,
      cliente TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

afterAll(async () => {
  if (db) {
    await db.close();
  }
});
*/

// Helpers globales para las pruebas
global.testHelpers = {
  // Función para generar datos aleatorios
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Función para generar email único
  generateUniqueEmail: () => {
    return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
  },
  
  // Función para limpiar base de datos
  cleanDatabase: async () => {
    // Implementar según tu base de datos
    console.log('Limpiando base de datos de prueba...');
  },
  
  // Función para crear datos de prueba
  createTestData: (entityName, customData = {}) => {
    const baseData = {
      personas: {
        nombre: `Test Person ${Date.now()}`,
        email: global.testHelpers.generateUniqueEmail(),
        telefono: '555-0000',
        edad: 25,
        direccion: 'Test Address 123'
      },
      objetos: {
        nombre: `Test Object ${Date.now()}`,
        descripcion: 'Test object description',
        categoria: 'Test Category',
        precio: 99.99,
        stock: 5
      },
      servicios: {
        nombre: `Test Service ${Date.now()}`,
        descripcion: 'Test service description',
        categoria: 'Test Category',
        precio: 49.99,
        duracion: '1 hora'
      },
      transacciones: {
        tipo: 'venta',
        monto: 199.99,
        descripcion: 'Test transaction',
        fecha: new Date().toISOString(),
        cliente: 'Test Client'
      }
    };
    
    return { ...baseData[entityName], ...customData };
  }
};

// Configurar mocks globales si es necesario
// Por ejemplo, para servicios externos o APIs
global.mocks = {
  // Mock de servicio de email
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
  },
  
  // Mock de servicio de pagos
  paymentService: {
    processPayment: jest.fn().mockResolvedValue({ transactionId: '12345' }),
  }
};

// Configuración de logging para pruebas
console.log('🧪 Configuración de pruebas cargada');

// Manejo de errores no capturados durante las pruebas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});