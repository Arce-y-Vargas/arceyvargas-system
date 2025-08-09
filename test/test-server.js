const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Función para validar datos básicos
const validateData = (entity, data) => {
  const requiredFields = {
    personas: ['nombre', 'email'],
    objetos: ['nombre', 'precio'],
    servicios: ['nombre', 'precio'],
    transacciones: ['tipo', 'monto', 'fecha']
  };

  const required = requiredFields[entity] || [];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return { valid: false, message: `Campos requeridos: ${missing.join(', ')}` };
  }

  // Validaciones específicas
  if (entity === 'personas' && data.email && !data.email.includes('@')) {
    return { valid: false, message: 'Email inválido' };
  }

  if (['objetos', 'servicios'].includes(entity) && data.precio && isNaN(parseFloat(data.precio))) {
    return { valid: false, message: 'Precio debe ser un número' };
  }

  if (entity === 'transacciones') {
    if (!['venta', 'compra', 'transferencia'].includes(data.tipo)) {
      return { valid: false, message: 'Tipo debe ser venta, compra o transferencia' };
    }
    if (isNaN(parseFloat(data.monto))) {
      return { valid: false, message: 'Monto debe ser un número' };
    }
  }

  return { valid: true };
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
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || id.includes('@') || id.includes('#')) {
        return res.status(400).json({ error: 'Formato de ID inválido' });
      }

      const record = database[entityName].get(id);
      if (!record) {
        return res.status(404).json({ error: `${entityName.slice(0, -1)} not found` });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST /:entity - Crear nuevo registro
  router.post('/', (req, res) => {
    try {
      const validation = validateData(entityName, req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
      }

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
      console.error('Error in POST:', error);
      res.status(400).json({ error: 'Error al crear registro' });
    }
  });

  // PUT /:entity/:id - Actualizar registro
  router.put('/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || id.includes('@') || id.includes('#')) {
        return res.status(400).json({ error: 'Formato de ID inválido' });
      }

      const existingRecord = database[entityName].get(id);
      if (!existingRecord) {
        return res.status(404).json({ error: `${entityName.slice(0, -1)} not found` });
      }

      // Para actualizaciones, validar solo si se proveen campos requeridos
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
      }

      const updatedRecord = {
        ...existingRecord,
        ...req.body,
        id: id, // Mantener el ID original
        updated_at: new Date().toISOString()
      };

      database[entityName].set(id, updatedRecord);
      res.json(updatedRecord);
    } catch (error) {
      console.error('Error in PUT:', error);
      res.status(400).json({ error: 'Error al actualizar registro' });
    }
  });

  // DELETE /:entity/:id - Eliminar registro
  router.delete('/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || id.includes('@') || id.includes('#')) {
        return res.status(400).json({ error: 'Formato de ID inválido' });
      }

      const existingRecord = database[entityName].get(id);
      if (!existingRecord) {
        return res.status(404).json({ error: `${entityName.slice(0, -1)} not found` });
      }

      database[entityName].delete(id);
      res.json({ 
        message: `${entityName.slice(0, -1)} deleted successfully`,
        id: id 
      });
    } catch (error) {
      console.error('Error in DELETE:', error);
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

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
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