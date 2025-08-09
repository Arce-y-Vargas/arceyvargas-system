// Configuración para pruebas de API
process.env.NODE_ENV = 'test';

// Polyfills para compatibilidad
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Timeout para pruebas
jest.setTimeout(30000);