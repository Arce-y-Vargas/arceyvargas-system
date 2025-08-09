const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { body, validationResult, param } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();

// Configuración de middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite de requests por IP
  message: 'Demasiadas peticiones desde esta IP'
});
app.use(limiter);

// Simulación de base de datos en memoria
const database = {
  personas: new Map(),
  objetos: new Map(),
  servicios: new Map(),
  transacciones: new Map()
};

let idCounters = {
  personas: 1,
  objetos: 1,
  servicios: 1,
  transacciones: 1
};

// Función para generar ID único
const generateId = (entity) => {
  return (idCounters[entity]++).toString();
};

// Validaciones por entidad
const validations = {
  personas: [
    body('nombre').isLength({ min: 1 }).withMessage('Nombre es requerido'),
    body('email').isEmail().withMessage('Email debe ser válido'),
    body('telefono').optional().isLength({ min: 1 }),
    body('edad').optional().isInt({ min: 0, max: 150 }),
    body('direccion').optional().isLength({ min: 1 })
  ],
  objetos: [
    body('nombre').isLength({ min: 1 }).withMessage('Nombre es requerido'),
    body('descripcion').optional().isLength({ min: 1 }),
    body('categoria').optional().isLength({ min: 1 }),
    body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número entero positivo')
  ],
  servicios: [
    body('nombre').isLength({ min: 1 }).withMessage('Nombre es requerido'),
    body('descripcion').optional().isLength({ min: 1 }),
    body('categoria').optional().isLength({ min: 1 }),
    body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
    body('duracion').optional().isLength({ min: 1 })
  ],
  transacciones: [
    body('tipo').isIn(['venta', 'compra', 'transferencia']).withMessage('Tipo debe ser venta, compra o transferencia'),
    body('monto').isFloat({ min: 0 }).withMessage('Monto debe ser un número positivo'),
    body('descripcion').optional().isLength({ min: 1 }),
    body('fecha').isISO8601().withMessage('Fecha debe ser válida'),
    body('cliente').optional().isLength({ min: 1 })
  ]
};

// Middleware para validar parámetros
const validateId = [
  param('id').isLength({ min: 1 }).withMessage('ID es requerido')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// Función genérica para crear rutas CRUD
const createCRUDRoutes = (entityName) => {
  const router = express.Router();

  // GET /:entity - Obtener todos los registros
  router.get('/', (req, res) => {
    try {
      const records = Array.from(database[entityName].values());
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /:entity/:id - Obtener un registro por ID
  router.get('/:id', validateId, handleValidationErrors, (req, res) => {
    try {
      const record = database[entityName].get(req.params.id);
      if (!record) {
        return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST /:entity - Crear nuevo registro
  router.post('/', validations[entityName], handleValidationErrors, (req, res) => {
    try {
      const id = generateId(entityName);
      const record = {
        id,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      database[entityName].set(id, record);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT /:entity/:id - Actualizar registro
  router.put('/:id', 
    validateId.concat(validations[entityName]), 
    handleValidationErrors, 
    (req, res) => {
      try {
        const existingRecord = database[entityName].get(req.params.id);
        if (!existingRecord) {
          return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
        }

        const updatedRecord = {
          ...existingRecord,
          ...req.body,
          id: req.params.id, // Mantener el ID original
          updated_at: new Date().toISOString()
        };

        database[entityName].set(req.params.id, updatedRecord);
        res.json(updatedRecord);
      } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  );

  // DELETE /:entity/:id - Eliminar registro
  router.delete('/:id', validateId, handleValidationErrors, (req, res) => {
    try {
      const existingRecord = database[entityName].get(req.params.id);
      if (!existingRecord) {
        return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
      }

      database[entityName].delete(req.params.id);
      res.json({ 
        message: `${entityName.slice(0, -1)} eliminado exitosamente`,
        id: req.params.id 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};

// Configurar rutas para cada entidad
const entities = ['personas', 'objetos', 'servicios', 'transacciones'];
entities.forEach(entity => {
  app.use(`/${entity}`, createCRUDRoutes(entity));
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta para estadísticas del sistema
app.get('/stats', (req, res) => {
  const stats = {};
  entities.forEach(entity => {
    stats[entity] = database[entity].size;
  });
  
  res.json({
    totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0),
    recordsByEntity: stats,
    timestamp: new Date().toISOString()
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📚 Entidades disponibles: ${entities.join(', ')}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;