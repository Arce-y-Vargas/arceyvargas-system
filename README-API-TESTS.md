# 🧪 Sistema de Pruebas Automáticas para API CRUD

Este proyecto incluye un sistema completo de pruebas automáticas usando **Jest + Supertest** para APIs REST con operaciones CRUD en múltiples entidades.

## 📋 Características

- ✅ **Detección automática** de rutas CRUD para múltiples entidades
- ✅ **Pruebas completas** para todas las operaciones (CREATE, READ, UPDATE, DELETE)
- ✅ **Validación de integridad** de datos y respuestas
- ✅ **Pruebas de rendimiento** y manejo de carga
- ✅ **Pruebas de seguridad** y validación de entrada
- ✅ **Limpieza automática** de datos de prueba
- ✅ **Reportes de cobertura** detallados
- ✅ **Pruebas de integración** entre entidades

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Instalar dependencias de desarrollo:**
```bash
npm install --save-dev jest supertest nodemon @types/jest @types/supertest
```

## 🏗️ Estructura del Proyecto

```
├── api.test.js              # Archivo principal de pruebas
├── jest.config.api.js       # Configuración de Jest
├── test.setup.js           # Configuración global de pruebas
├── app.example.js          # Ejemplo de aplicación Express
├── package-api-tests.json  # Package.json con scripts
└── README-API-TESTS.md     # Este archivo
```

## 🧪 Entidades Soportadas

El sistema está configurado para probar las siguientes entidades:

- **personas** - Gestión de personas/usuarios
- **objetos** - Inventario de objetos/productos
- **servicios** - Catálogo de servicios
- **transacciones** - Registro de transacciones

### Estructura de Datos de Ejemplo

```javascript
personas: {
  nombre: 'Juan Pérez',
  email: 'juan.perez@test.com',
  telefono: '555-0123',
  edad: 30,
  direccion: 'Calle Principal 123'
}

objetos: {
  nombre: 'Laptop Dell',
  descripcion: 'Laptop para oficina',
  categoria: 'Tecnología',
  precio: 799.99,
  stock: 10
}

servicios: {
  nombre: 'Consultoría IT',
  descripcion: 'Servicio de consultoría en tecnología',
  categoria: 'Consultoría',
  precio: 150.00,
  duracion: '2 horas'
}

transacciones: {
  tipo: 'venta',
  monto: 999.99,
  descripcion: 'Venta de laptop',
  fecha: '2024-01-01T00:00:00.000Z',
  cliente: 'Empresa ABC'
}
```

## 🏃‍♂️ Comandos de Ejecución

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas con reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar solo las pruebas de API
```bash
npm run test:api
```

### Ejecutar pruebas con output detallado
```bash
npm run test:verbose
```

### Debug de pruebas
```bash
npm run test:debug
```

## 📊 Tipos de Pruebas Incluidas

### 1. **Operaciones CRUD Básicas**
- ✅ Crear registros (POST)
- ✅ Listar todos los registros (GET)
- ✅ Obtener registro por ID (GET /:id)
- ✅ Actualizar registros (PUT /:id)
- ✅ Eliminar registros (DELETE /:id)

### 2. **Validaciones y Errores**
- ✅ Validación de datos requeridos
- ✅ Validación de formatos de datos
- ✅ Manejo de registros no existentes (404)
- ✅ Manejo de datos inválidos (400)
- ✅ Validación de IDs malformados

### 3. **Integridad de Datos**
- ✅ Verificación de persistencia de datos
- ✅ Consistencia después de actualizaciones
- ✅ Verificación de eliminación real

### 4. **Rendimiento y Carga**
- ✅ Tiempo de respuesta aceptable
- ✅ Manejo de múltiples requests simultáneos
- ✅ Pruebas de carga del sistema

### 5. **Seguridad**
- ✅ Sanitización de datos de entrada
- ✅ Protección contra XSS
- ✅ Validación de tipos de datos

### 6. **Integración del Sistema**
- ✅ Operaciones entre múltiples entidades
- ✅ Manejo de carga distribuida

## 🔧 Configuración Personalizada

### Agregar Nueva Entidad

1. **Agregar la entidad al array en `api.test.js`:**
```javascript
const entidades = ['personas', 'objetos', 'servicios', 'transacciones', 'nueva_entidad'];
```

2. **Definir datos de prueba:**
```javascript
const testData = {
  // ... otras entidades
  nueva_entidad: {
    create: {
      campo1: 'valor1',
      campo2: 'valor2'
    },
    update: {
      campo1: 'valor_actualizado1',
      campo2: 'valor_actualizado2'
    }
  }
};
```

### Configurar Base de Datos

Edita `test.setup.js` para configurar tu base de datos:

**Para MongoDB:**
```javascript
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test_db');
});
```

**Para PostgreSQL:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  user: 'test_user',
  database: 'test_db',
  password: 'test_password',
});
```

## 📈 Reportes de Cobertura

Después de ejecutar `npm run test:coverage`, encontrarás los reportes en:

- **Terminal**: Resumen de cobertura
- **coverage/lcov-report/index.html**: Reporte HTML detallado
- **coverage/lcov.info**: Archivo LCOV para CI/CD

## 🔍 Debugging

Para debuggear las pruebas:

```bash
npm run test:debug
```

Luego abre Chrome y ve a `chrome://inspect` para conectar al debugger.

## 🚨 Solución de Problemas Comunes

### Error de conexión a base de datos
```bash
# Verificar que tu aplicación esté configurada para modo test
NODE_ENV=test npm test
```

### Timeouts en pruebas
```javascript
// Aumentar timeout en jest.config.api.js
testTimeout: 60000 // 60 segundos
```

### Puertos en uso
```javascript
// En test.setup.js, usar puerto diferente para tests
process.env.PORT = 3001;
```

## 🎯 Mejores Prácticas

1. **Limpieza de Datos**: Las pruebas limpian automáticamente los datos creados
2. **Aislamiento**: Cada prueba es independiente
3. **Datos Únicos**: Se generan emails y nombres únicos para evitar conflictos
4. **Validaciones**: Se prueban tanto casos exitosos como errores
5. **Cobertura**: Mantener al menos 70% de cobertura de código

## 📚 Documentación Adicional

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-prueba`)
3. Commit tus cambios (`git commit -am 'Agregar nueva prueba'`)
4. Push a la rama (`git push origin feature/nueva-prueba`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.