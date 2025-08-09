const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulación de base de datos en memoria para el sistema completo de gestión empresarial
const database = {
  empleados: new Map(),
  horasExtras: new Map(),
  gestionHorasExtra: new Map(),
  vacaciones: new Map(),
  registroHorasExtra: new Map(),
  solicitudesRRHH: new Map(),
  solicitudVacaciones: new Map(),
  inventario: new Map(),
  productos: new Map(),
  cotizaciones: new Map(),
  facturas: new Map(),
  categorias: new Map(),
  proyectos: new Map(),
  reportes: new Map()
};

// Contadores para IDs únicos
let idCounters = {
  empleados: 1,
  horasExtras: 1,
  gestionHorasExtra: 1,
  vacaciones: 1,
  registroHorasExtra: 1,
  solicitudesRRHH: 1,
  solicitudVacaciones: 1,
  inventario: 1,
  productos: 1,
  cotizaciones: 1,
  facturas: 1,
  categorias: 1,
  proyectos: 1,
  reportes: 1
};

// Función para generar ID único
const generateId = (entity) => {
  return (idCounters[entity]++).toString();
};

// Función para sanitizar datos de entrada (prevenir XSS)
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/DROP\s+TABLE/gi, '')
      .replace(/DELETE\s+FROM/gi, '')
      .replace(/INSERT\s+INTO/gi, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Función para validar datos específicos por módulo
const validateData = (entity, data) => {
  const validationRules = {
    empleados: {
      required: ['cedula', 'nombre', 'email'],
      validations: {
        email: (value) => value.includes('@') && value.includes('.'),
        salario: (value) => value === undefined || (!isNaN(parseFloat(value)) && parseFloat(value) > 0)
      }
    },
    horasExtras: {
      required: ['empleadoId', 'fecha', 'horaInicio', 'horaFin', 'totalHoras'],
      validations: {
        totalHoras: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
        fecha: (value) => !isNaN(Date.parse(value))
      }
    },
    gestionHorasExtra: {
      required: ['periodo', 'empleadoId', 'totalHorasExtras', 'totalAPagar'],
      validations: {
        totalHorasExtras: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
        totalAPagar: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
      }
    },
    vacaciones: {
      required: ['empleadoId', 'fechaInicio', 'fechaFin', 'diasSolicitados'],
      validations: {
        fechaInicio: (value) => !isNaN(Date.parse(value)),
        fechaFin: (value) => !isNaN(Date.parse(value)),
        diasSolicitados: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
      }
    },
    registroHorasExtra: {
      required: ['empleadoId', 'fecha', 'horaInicio', 'horaFin', 'totalHoras'],
      validations: {
        totalHoras: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0
      }
    },
    solicitudesRRHH: {
      required: ['empleadoId', 'tipo', 'descripcion'],
      validations: {
        tipo: (value) => ['Cambio de Posición', 'Aumento Salarial', 'Capacitación', 'Otro'].includes(value)
      }
    },
    solicitudVacaciones: {
      required: ['empleadoId', 'fechaInicio', 'fechaFin', 'diasSolicitados'],
      validations: {
        diasSolicitados: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
      }
    },
    inventario: {
      required: ['codigo', 'nombre', 'categoria', 'cantidad', 'precio'],
      validations: {
        cantidad: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0,
        precio: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
      }
    },
    productos: {
      required: ['codigo', 'nombre', 'precio'],
      validations: {
        precio: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0
      }
    },
    cotizaciones: {
      required: ['numero', 'cliente', 'producto', 'monto'],
      validations: {
        monto: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0
      }
    },
    facturas: {
      required: ['numero', 'cliente', 'subtotal', 'impuestos', 'total'],
      validations: {
        subtotal: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
        impuestos: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
        total: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
      }
    },
    categorias: {
      required: ['nombre', 'tipo'],
      validations: {}
    },
    proyectos: {
      required: ['nombre', 'cliente', 'fechaInicio', 'presupuesto'],
      validations: {
        presupuesto: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
        porcentajeAvance: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0 && parseInt(value) <= 100
      }
    },
    reportes: {
      required: ['nombre', 'tipo', 'periodo'],
      validations: {}
    }
  };

  const rules = validationRules[entity];
  if (!rules) {
    return { valid: false, message: `Entidad ${entity} no válida` };
  }

  // Verificar campos requeridos
  const missing = rules.required.filter(field => !data[field]);
  if (missing.length > 0) {
    return { valid: false, message: `Campos requeridos: ${missing.join(', ')}` };
  }

  // Validaciones específicas
  for (const [field, validator] of Object.entries(rules.validations)) {
    if (data[field] !== undefined && !validator(data[field])) {
      return { valid: false, message: `Campo ${field} inválido` };
    }
  }

  // Validaciones de negocio específicas
  if (entity === 'vacaciones' || entity === 'solicitudVacaciones') {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);
    if (fechaFin <= fechaInicio) {
      return { valid: false, message: 'Fecha fin debe ser posterior a fecha inicio' };
    }
  }

  if (entity === 'proyectos' && data.fechaFinEstimada) {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFinEstimada);
    if (fechaFin <= fechaInicio) {
      return { valid: false, message: 'Fecha fin estimada debe ser posterior a fecha inicio' };
    }
  }

  if (entity === 'facturas') {
    const subtotal = parseFloat(data.subtotal) || 0;
    const impuestos = parseFloat(data.impuestos) || 0;
    const total = parseFloat(data.total) || 0;
    if (Math.abs(total - (subtotal + impuestos)) > 0.01) {
      return { valid: false, message: 'El total debe ser igual a subtotal + impuestos' };
    }
  }

  if (entity === 'inventario' && parseInt(data.cantidad) < 0) {
    return { valid: false, message: 'La cantidad no puede ser negativa' };
  }

  return { valid: true };
};

// Función para verificar unicidad de campos
const checkUniqueness = (entity, data, excludeId = null) => {
  if (entity === 'empleados' && data.cedula) {
    for (const [id, record] of database.empleados) {
      if (id !== excludeId && record.cedula === data.cedula) {
        return { unique: false, message: 'La cédula ya existe en el sistema' };
      }
    }
  }

  if ((entity === 'facturas' || entity === 'cotizaciones') && data.numero) {
    for (const [id, record] of database[entity]) {
      if (id !== excludeId && record.numero === data.numero) {
        return { unique: false, message: 'El número ya existe en el sistema' };
      }
    }
  }

  return { unique: true };
};

// Función genérica para crear rutas CRUD del sistema empresarial
const createBusinessCRUDRoutes = (entityName) => {
  const router = express.Router();

  // GET /:entity - Obtener todos los registros con filtrado opcional
  router.get('/', (req, res) => {
    try {
      let records = Array.from(database[entityName].values());
      
      // Aplicar filtros si se proporcionan en query params
      Object.keys(req.query).forEach(key => {
        const value = req.query[key];
        if (value && key !== 'page' && key !== 'limit') {
          records = records.filter(record => 
            record[key] && record[key].toString().toLowerCase().includes(value.toLowerCase())
          );
        }
      });

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
        return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST /:entity - Crear nuevo registro
  router.post('/', (req, res) => {
    try {
      // Sanitizar datos de entrada
      const sanitizedData = sanitizeInput(req.body);
      
      const validation = validateData(entityName, sanitizedData);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
      }

      const uniquenessCheck = checkUniqueness(entityName, sanitizedData);
      if (!uniquenessCheck.unique) {
        return res.status(400).json({ error: uniquenessCheck.message });
      }

      const id = generateId(entityName);
      const record = {
        id,
        ...sanitizedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
      }

      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
      }

      // Sanitizar datos de entrada
      const sanitizedData = sanitizeInput(req.body);

      const uniquenessCheck = checkUniqueness(entityName, sanitizedData, id);
      if (!uniquenessCheck.unique) {
        return res.status(400).json({ error: uniquenessCheck.message });
      }

      const updatedRecord = {
        ...existingRecord,
        ...sanitizedData,
        id: id, // Mantener el ID original
        updatedAt: new Date().toISOString()
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
        return res.status(404).json({ error: `${entityName.slice(0, -1)} no encontrado` });
      }

      database[entityName].delete(id);
      res.json({ 
        message: `${entityName.slice(0, -1)} eliminado exitosamente`,
        id: id 
      });
    } catch (error) {
      console.error('Error in DELETE:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};

// Lista de módulos del sistema completo de gestión empresarial
const businessModules = [
  'empleados',
  'horasExtras', 
  'gestionHorasExtra',
  'vacaciones',
  'registroHorasExtra',
  'solicitudesRRHH',
  'solicitudVacaciones', 
  'inventario',
  'productos',
  'cotizaciones',
  'facturas',
  'categorias',
  'proyectos',
  'reportes'
];

// Configurar rutas para cada módulo del sistema empresarial
businessModules.forEach(module => {
  app.use(`/${module}`, createBusinessCRUDRoutes(module));
});

// Rutas especiales para funcionalidades específicas

// Endpoint para consultar días de vacaciones disponibles
app.get('/empleados/:cedulaOrId/vacaciones-disponibles', (req, res) => {
  try {
    const { cedulaOrId } = req.params;
    
    // Buscar empleado por cédula o ID
    let empleado = null;
    for (const record of database.empleados.values()) {
      if (record.cedula === cedulaOrId || record.id === cedulaOrId) {
        empleado = record;
        break;
      }
    }

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Calcular días disponibles (simplificado)
    const diasAsignados = empleado.diasVacaciones || 15;
    const vacacionesTomadas = Array.from(database.vacaciones.values())
      .filter(v => v.empleadoId === empleado.cedula && v.estado === 'Aprobado')
      .reduce((total, v) => total + (v.diasSolicitados || 0), 0);

    res.json({
      empleadoId: empleado.cedula,
      nombreEmpleado: empleado.nombre,
      diasAsignados,
      diasTomados: vacacionesTomadas,
      diasDisponibles: Math.max(0, diasAsignados - vacacionesTomadas)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check con información de módulos
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    modules: businessModules,
    totalRecords: Object.keys(database).reduce((total, entity) => total + database[entity].size, 0)
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    availableModules: businessModules
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
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor del Sistema Empresarial corriendo en puerto ${PORT}`);
    console.log(`🏢 Módulos disponibles: ${businessModules.join(', ')}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Endpoints especiales:`);
    console.log(`   - GET /empleados/:cedula/vacaciones-disponibles`);
  });
}

module.exports = app;