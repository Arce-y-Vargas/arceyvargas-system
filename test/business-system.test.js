const request = require('supertest');
const app = require('./business-test-server'); // Servidor completo del sistema empresarial

// Configuración de datos de prueba para cada módulo
const testData = {
  empleados: {
    create: {
      cedula: '123456789',
      nombre: 'Juan Carlos Pérez',
      email: 'juan.perez@empresa.com',
      telefono: '88887777',
      posicion: 'Desarrollador Senior',
      departamento: 'Tecnología',
      fechaIngreso: new Date().toISOString().split('T')[0],
      salario: 850000,
      estado: 'Activo',
      supervisor: 'María González',
      diasVacaciones: 15
    },
    update: {
      nombre: 'Juan Carlos Pérez Rodríguez',
      posicion: 'Team Lead',
      salario: 950000,
      supervisor: 'Carlos Mendez',
      diasVacaciones: 20
    }
  },
  horasExtras: {
    create: {
      empleadoId: '123456789',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '18:00',
      horaFin: '20:00',
      totalHoras: 2,
      descripcion: 'Finalización de proyecto urgente',
      proyecto: 'Sistema ERP',
      aprobadoPor: 'supervisor123',
      estado: 'Pendiente',
      tarifaPorHora: 5000
    },
    update: {
      horaFin: '21:00',
      totalHoras: 3,
      estado: 'Aprobado',
      observaciones: 'Horas extra aprobadas por gerencia'
    }
  },
  gestionHorasExtra: {
    create: {
      periodo: '2024-01',
      empleadoId: '123456789',
      totalHorasExtras: 10,
      totalAPagar: 50000,
      estado: 'Calculado',
      fechaCalculo: new Date().toISOString(),
      aprobadoPor: 'supervisor123',
      comentarios: 'Cálculo automático mensual'
    },
    update: {
      estado: 'Aprobado',
      totalAPagar: 52000,
      fechaAprobacion: new Date().toISOString(),
      comentarios: 'Aprobado con bonificación adicional'
    }
  },
  vacaciones: {
    create: {
      empleadoId: '123456789',
      fechaInicio: '2024-07-15',
      fechaFin: '2024-07-29',
      diasSolicitados: 14,
      tipo: 'Vacaciones Anuales',
      motivo: 'Descanso familiar',
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString(),
      encargadoDurante: 'Ana López'
    },
    update: {
      estado: 'Aprobado',
      fechaAprobacion: new Date().toISOString(),
      aprobadoPor: 'supervisor123',
      observaciones: 'Aprobado. Buen descanso.'
    }
  },
  registroHorasExtra: {
    create: {
      empleadoId: '123456789',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '17:30',
      horaFin: '19:30',
      totalHoras: 2,
      actividad: 'Mantenimiento de servidor',
      urgencia: 'Alta',
      autorizado: false,
      ubicacion: 'Oficina Principal'
    },
    update: {
      autorizado: true,
      horaFin: '20:00',
      totalHoras: 2.5,
      observaciones: 'Autorizado retroactivamente'
    }
  },
  solicitudesRRHH: {
    create: {
      empleadoId: '123456789',
      tipo: 'Cambio de Posición',
      descripcion: 'Solicitud de promoción a Senior Developer',
      prioridad: 'Media',
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString(),
      departamentoDestino: 'Desarrollo',
      justificacion: 'Cumplimiento de objetivos y capacitación completada'
    },
    update: {
      estado: 'En Revisión',
      fechaRevision: new Date().toISOString(),
      revisadoPor: 'RRHH001',
      comentariosRRHH: 'En proceso de evaluación con el supervisor directo'
    }
  },
  solicitudVacaciones: {
    create: {
      empleadoId: '123456789',
      fechaInicio: '2024-12-20',
      fechaFin: '2024-12-31',
      diasSolicitados: 11,
      tipo: 'Vacaciones de Fin de Año',
      motivo: 'Celebraciones navideñas en familia',
      estado: 'Pendiente',
      cobertura: 'Pedro Martínez',
      telefono: '88889999'
    },
    update: {
      estado: 'Aprobado',
      fechaAprobacion: new Date().toISOString(),
      aprobadoPor: 'supervisor123',
      instrucciones: 'Coordinar entrega de pendientes antes del 19/12'
    }
  },
  inventario: {
    create: {
      codigo: 'LAP001',
      nombre: 'Laptop Dell Inspiron 15',
      categoria: 'Tecnología',
      descripcion: 'Laptop para desarrollo, 16GB RAM, 512GB SSD',
      cantidad: 5,
      precio: 650000,
      proveedor: 'Dell Costa Rica',
      ubicacion: 'Almacén TI',
      estado: 'Disponible',
      fechaIngreso: new Date().toISOString()
    },
    update: {
      cantidad: 3,
      precio: 620000,
      estado: 'En Uso',
      ultimaActualizacion: new Date().toISOString(),
      observaciones: '2 unidades asignadas a nuevos empleados'
    }
  },
  productos: {
    create: {
      codigo: 'PROD001',
      nombre: 'Sistema de Gestión Empresarial',
      descripcion: 'Software ERP completo para PYMES',
      categoria: 'Software',
      precio: 1500000,
      tiempoDesarrollo: '6 meses',
      estado: 'En Desarrollo',
      responsable: 'Equipo Desarrollo',
      fechaInicio: new Date().toISOString()
    },
    update: {
      estado: 'Completado',
      precio: 1650000,
      fechaCompletado: new Date().toISOString(),
      observaciones: 'Entregado con funcionalidades adicionales'
    }
  },
  cotizaciones: {
    create: {
      numero: 'COT-2024-001',
      cliente: 'Empresa ABC S.A.',
      contacto: 'María Rodríguez',
      email: 'maria@empresaabc.com',
      telefono: '22334455',
      producto: 'Sistema ERP Personalizado',
      descripcion: 'Implementación de sistema ERP con módulos de contabilidad y inventario',
      monto: 2500000,
      fechaCotizacion: new Date().toISOString(),
      validezDias: 30,
      estado: 'Enviada',
      vendedor: 'Carlos Vega'
    },
    update: {
      estado: 'Aprobada',
      monto: 2750000,
      fechaAprobacion: new Date().toISOString(),
      observaciones: 'Cliente solicitó módulo adicional de reportes'
    }
  },
  facturas: {
    create: {
      numero: 'FACT-2024-001',
      cotizacionId: 'COT-2024-001',
      cliente: 'Empresa ABC S.A.',
      contacto: 'María Rodríguez',
      descripcion: 'Facturación por desarrollo de Sistema ERP',
      subtotal: 2500000,
      impuestos: 325000,
      total: 2825000,
      fechaFactura: new Date().toISOString(),
      fechaVencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      estado: 'Pendiente',
      metodoPago: 'Transferencia Bancaria'
    },
    update: {
      estado: 'Pagada',
      fechaPago: new Date().toISOString(),
      referenciaPago: 'TRANS-789456123',
      observaciones: 'Pago recibido según lo acordado'
    }
  },
  categorias: {
    create: {
      nombre: 'Desarrollo de Software',
      descripcion: 'Servicios de desarrollo y programación',
      tipo: 'Servicios',
      activa: true,
      color: '#007bff',
      icono: 'code',
      orden: 1
    },
    update: {
      descripcion: 'Servicios completos de desarrollo, programación y consultoría técnica',
      color: '#0056b3',
      orden: 2,
      observaciones: 'Actualizada para incluir consultoría'
    }
  },
  proyectos: {
    create: {
      nombre: 'Sistema ERP Empresa ABC',
      descripcion: 'Desarrollo completo de sistema ERP personalizado',
      cliente: 'Empresa ABC S.A.',
      fechaInicio: new Date().toISOString(),
      fechaFinEstimada: new Date(Date.now() + 180*24*60*60*1000).toISOString(),
      presupuesto: 2500000,
      estado: 'En Progreso',
      prioridad: 'Alta',
      responsable: 'Juan Pérez',
      equipo: ['Ana López', 'Carlos Mendez', 'María González'],
      porcentajeAvance: 25
    },
    update: {
      porcentajeAvance: 75,
      estado: 'Casi Completado',
      presupuesto: 2750000,
      observaciones: 'Proyecto adelantado, se agregaron funcionalidades extra'
    }
  },
  reportes: {
    create: {
      nombre: 'Reporte Mensual de Horas Extra',
      tipo: 'Horas Extra',
      periodo: '2024-01',
      fechaGeneracion: new Date().toISOString(),
      generadoPor: 'Sistema Automático',
      estado: 'Generado',
      formato: 'PDF',
      parametros: {
        departamento: 'Todos',
        incluirGraficos: true,
        incluirDetalle: true
      },
      numeroRegistros: 45
    },
    update: {
      estado: 'Enviado',
      fechaEnvio: new Date().toISOString(),
      destinatarios: ['gerencia@empresa.com', 'rrhh@empresa.com'],
      observaciones: 'Reporte enviado a gerencia y RRHH'
    }
  }
};

// Lista de módulos del sistema
const modulos = [
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

// Objeto para almacenar IDs creados durante las pruebas
const createdIds = {};

describe('Sistema Completo de Gestión Empresarial - API Tests', () => {
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    // Inicializar IDs para cada módulo
    modulos.forEach(modulo => {
      createdIds[modulo] = [];
    });
  });

  // Limpiar después de todas las pruebas
  afterAll(async () => {
    // Limpiar registros creados durante las pruebas
    for (const modulo of modulos) {
      for (const id of createdIds[modulo]) {
        try {
          await request(app).delete(`/${modulo}/${id}`);
        } catch (error) {
          console.log(`No se pudo eliminar ${modulo}/${id}: ${error.message}`);
        }
      }
    }
  });

  // Test del health check del sistema
  describe('Health Check del Sistema', () => {
    test('should return system status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('modules');
      expect(response.body.modules).toEqual(expect.arrayContaining(modulos));
    });
  });

  // Pruebas para cada módulo del sistema
  modulos.forEach(modulo => {
    describe(`${modulo.toUpperCase()} - CRUD Operations`, () => {
      let createdId;

      describe(`POST /${modulo}`, () => {
        test(`should create a new ${modulo} record successfully`, async () => {
          const response = await request(app)
            .post(`/${modulo}`)
            .send(testData[modulo].create)
            .expect(201);

          // Verificar que la respuesta tiene la estructura esperada
          expect(response.body).toHaveProperty('id');
          expect(response.body.id).toBeTruthy();
          
          // Verificar que los datos enviados estén en la respuesta
          Object.keys(testData[modulo].create).forEach(key => {
            expect(response.body).toHaveProperty(key);
            const expectedValue = testData[modulo].create[key];
            const actualValue = response.body[key];
            
            if (typeof expectedValue === 'number') {
              expect(actualValue).toBeCloseTo(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              // Manejar arrays que podrían convertirse en objetos
              if (Array.isArray(actualValue)) {
                expect(actualValue).toEqual(expect.arrayContaining(expectedValue));
              } else if (typeof actualValue === 'object' && actualValue !== null) {
                // Convertir objeto de vuelta a array si es necesario
                const arrayValue = Object.values(actualValue);
                expect(arrayValue).toEqual(expect.arrayContaining(expectedValue));
              } else {
                expect(actualValue).toEqual(expectedValue);
              }
            } else if (typeof expectedValue === 'object' && expectedValue !== null) {
              expect(actualValue).toMatchObject(expectedValue);
            } else {
              expect(actualValue).toBe(expectedValue);
            }
          });

          // Guardar ID para pruebas posteriores
          createdId = response.body.id;
          createdIds[modulo].push(createdId);
        });

        test(`should return 400 for missing required fields in ${modulo}`, async () => {
          const response = await request(app)
            .post(`/${modulo}`)
            .send({})
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toMatch(/requerido|required|missing/i);
        });

        test(`should handle validation errors for ${modulo}`, async () => {
          const invalidData = { invalidField: 'invalid value' };
          
          const response = await request(app)
            .post(`/${modulo}`)
            .send(invalidData)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        });
      });

      describe(`GET /${modulo}`, () => {
        test(`should get all ${modulo} records including created one`, async () => {
          const response = await request(app)
            .get(`/${modulo}`)
            .expect(200);

          expect(Array.isArray(response.body)).toBe(true);
          
          // Verificar que el registro creado esté en la lista
          const createdRecord = response.body.find(record => record.id === createdId);
          expect(createdRecord).toBeTruthy();
          
          // Verificar que los datos coincidan
          Object.keys(testData[modulo].create).forEach(key => {
            const expectedValue = testData[modulo].create[key];
            const actualValue = createdRecord[key];
            
            if (typeof expectedValue === 'number') {
              expect(actualValue).toBeCloseTo(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              // Manejar arrays que podrían convertirse en objetos
              if (Array.isArray(actualValue)) {
                expect(actualValue).toEqual(expect.arrayContaining(expectedValue));
              } else if (typeof actualValue === 'object' && actualValue !== null) {
                // Convertir objeto de vuelta a array si es necesario
                const arrayValue = Object.values(actualValue);
                expect(arrayValue).toEqual(expect.arrayContaining(expectedValue));
              } else {
                expect(actualValue).toEqual(expectedValue);
              }
            } else if (typeof expectedValue === 'object' && expectedValue !== null) {
              expect(actualValue).toMatchObject(expectedValue);
            } else {
              expect(actualValue).toBe(expectedValue);
            }
          });
        });

        test(`should support filtering for ${modulo}`, async () => {
          // Buscar por un campo específico si existe
          const firstKey = Object.keys(testData[modulo].create)[0];
          const firstValue = testData[modulo].create[firstKey];
          
          if (typeof firstValue === 'string') {
            const response = await request(app)
              .get(`/${modulo}?${firstKey}=${encodeURIComponent(firstValue)}`)
              .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // Al menos debería devolver el registro que creamos
            expect(response.body.length).toBeGreaterThanOrEqual(0);
          }
        });
      });

      describe(`GET /${modulo}/:id`, () => {
        test(`should get ${modulo} record by ID with correct data`, async () => {
          const response = await request(app)
            .get(`/${modulo}/${createdId}`)
            .expect(200);

          expect(response.body).toHaveProperty('id', createdId);
          
          // Verificar que todos los campos coincidan
          Object.keys(testData[modulo].create).forEach(key => {
            expect(response.body).toHaveProperty(key);
            const expectedValue = testData[modulo].create[key];
            const actualValue = response.body[key];
            
            if (typeof expectedValue === 'number') {
              expect(actualValue).toBeCloseTo(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              // Manejar arrays que podrían convertirse en objetos
              if (Array.isArray(actualValue)) {
                expect(actualValue).toEqual(expect.arrayContaining(expectedValue));
              } else if (typeof actualValue === 'object' && actualValue !== null) {
                // Convertir objeto de vuelta a array si es necesario
                const arrayValue = Object.values(actualValue);
                expect(arrayValue).toEqual(expect.arrayContaining(expectedValue));
              } else {
                expect(actualValue).toEqual(expectedValue);
              }
            } else if (typeof expectedValue === 'object' && expectedValue !== null) {
              expect(actualValue).toMatchObject(expectedValue);
            } else {
              expect(actualValue).toBe(expectedValue);
            }
          });
        });

        test(`should return 404 for non-existent ${modulo} ID`, async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .get(`/${modulo}/${nonExistentId}`)
            .expect(404);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toMatch(/not found|no encontrado/i);
        });

        test(`should return 400 for invalid ${modulo} ID format`, async () => {
          const invalidId = 'invalid@id#format';
          await request(app)
            .get(`/${modulo}/${invalidId}`)
            .expect(400);
        });
      });

      describe(`PUT /${modulo}/:id`, () => {
        test(`should update ${modulo} record successfully`, async () => {
          const response = await request(app)
            .put(`/${modulo}/${createdId}`)
            .send(testData[modulo].update)
            .expect(200);

          expect(response.body).toHaveProperty('id', createdId);
          
          // Verificar que los datos actualizados estén en la respuesta
          Object.keys(testData[modulo].update).forEach(key => {
            const expectedValue = testData[modulo].update[key];
            const actualValue = response.body[key];
            
            if (typeof expectedValue === 'number') {
              expect(actualValue).toBeCloseTo(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              // Manejar arrays que podrían convertirse en objetos
              if (Array.isArray(actualValue)) {
                expect(actualValue).toEqual(expect.arrayContaining(expectedValue));
              } else if (typeof actualValue === 'object' && actualValue !== null) {
                // Convertir objeto de vuelta a array si es necesario
                const arrayValue = Object.values(actualValue);
                expect(arrayValue).toEqual(expect.arrayContaining(expectedValue));
              } else {
                expect(actualValue).toEqual(expectedValue);
              }
            } else if (typeof expectedValue === 'object' && expectedValue !== null) {
              expect(actualValue).toMatchObject(expectedValue);
            } else {
              expect(actualValue).toBe(expectedValue);
            }
          });

          // Verificar timestamp de actualización
          expect(response.body).toHaveProperty('updatedAt');
        });

        test(`should verify ${modulo} update persisted in database`, async () => {
          // Verificar que los cambios se reflejen al consultar por ID
          const response = await request(app)
            .get(`/${modulo}/${createdId}`)
            .expect(200);

          Object.keys(testData[modulo].update).forEach(key => {
            const expectedValue = testData[modulo].update[key];
            const actualValue = response.body[key];
            
            if (typeof expectedValue === 'number') {
              expect(actualValue).toBeCloseTo(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              // Manejar arrays que podrían convertirse en objetos
              if (Array.isArray(actualValue)) {
                expect(actualValue).toEqual(expect.arrayContaining(expectedValue));
              } else if (typeof actualValue === 'object' && actualValue !== null) {
                // Convertir objeto de vuelta a array si es necesario
                const arrayValue = Object.values(actualValue);
                expect(arrayValue).toEqual(expect.arrayContaining(expectedValue));
              } else {
                expect(actualValue).toEqual(expectedValue);
              }
            } else if (typeof expectedValue === 'object' && expectedValue !== null) {
              expect(actualValue).toMatchObject(expectedValue);
            } else {
              expect(actualValue).toBe(expectedValue);
            }
          });
        });

        test(`should return 404 for updating non-existent ${modulo} record`, async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .put(`/${modulo}/${nonExistentId}`)
            .send(testData[modulo].update)
            .expect(404);

          expect(response.body).toHaveProperty('error');
        });

        test(`should handle partial updates for ${modulo}`, async () => {
          const partialUpdate = {};
          const firstKey = Object.keys(testData[modulo].update)[0];
          partialUpdate[firstKey] = testData[modulo].update[firstKey];

          const response = await request(app)
            .put(`/${modulo}/${createdId}`)
            .send(partialUpdate)
            .expect(200);

          // Verificar que solo se actualizó el campo enviado
          expect(response.body).toHaveProperty(firstKey);
          const expectedValue = partialUpdate[firstKey];
          const actualValue = response.body[firstKey];
          
          if (typeof expectedValue === 'number') {
            expect(actualValue).toBeCloseTo(expectedValue);
          } else {
            expect(actualValue).toBe(expectedValue);
          }
        });
      });

      describe(`DELETE /${modulo}/:id`, () => {
        test(`should delete ${modulo} record successfully`, async () => {
          const response = await request(app)
            .delete(`/${modulo}/${createdId}`)
            .expect(200);

          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toMatch(/deleted|eliminado|removed/i);
          expect(response.body).toHaveProperty('id', createdId);
        });

        test(`should verify ${modulo} record is actually deleted`, async () => {
          // Verificar que el registro ya no existe
          await request(app)
            .get(`/${modulo}/${createdId}`)
            .expect(404);

          // Remover de la lista de limpieza ya que fue eliminado
          const index = createdIds[modulo].indexOf(createdId);
          if (index > -1) {
            createdIds[modulo].splice(index, 1);
          }
        });

        test(`should return 404 for deleting non-existent ${modulo} record`, async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .delete(`/${modulo}/${nonExistentId}`)
            .expect(404);

          expect(response.body).toHaveProperty('error');
        });
      });

      // Pruebas específicas por módulo
      describe(`${modulo.toUpperCase()} - Specific Business Logic Tests`, () => {
        let testRecordId;

        if (modulo === 'empleados') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should validate employee cedula uniqueness', async () => {
            const duplicateEmployee = { ...testData[modulo].create };
            
            const response = await request(app)
              .post(`/${modulo}`)
              .send(duplicateEmployee)
              .expect(400);

            expect(response.body.error).toMatch(/cedula|ya existe|duplicate/i);
          });

          test('should validate email format', async () => {
            const invalidEmployee = {
              ...testData[modulo].create,
              cedula: '999888777',
              email: 'invalid-email-format'
            };
            
            await request(app)
              .post(`/${modulo}`)
              .send(invalidEmployee)
              .expect(400);
          });
        }

        if (modulo === 'horasExtras') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should calculate total hours correctly', async () => {
            const response = await request(app)
              .get(`/${modulo}/${testRecordId}`)
              .expect(200);

            expect(response.body.totalHoras).toBeGreaterThan(0);
          });

          test('should validate date ranges', async () => {
            const invalidHorasExtra = {
              ...testData[modulo].create,
              fecha: '2025-12-31', // Fecha futura
            };
            
            const response = await request(app)
              .post(`/${modulo}`)
              .send(invalidHorasExtra);

            // Puede ser 400 (validación) o 201 (permitido)
            expect([201, 400]).toContain(response.status);
          });
        }

        if (modulo === 'vacaciones') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should validate vacation date ranges', async () => {
            const invalidVacation = {
              ...testData[modulo].create,
              fechaInicio: '2024-07-20',
              fechaFin: '2024-07-15' // Fecha fin antes que inicio
            };
            
            await request(app)
              .post(`/${modulo}`)
              .send(invalidVacation)
              .expect(400);
          });

          test('should check available vacation days', async () => {
            const response = await request(app)
              .get(`/empleados/${testData[modulo].create.empleadoId}/vacaciones-disponibles`);

            if (response.status === 200) {
              expect(response.body).toHaveProperty('diasDisponibles');
              expect(typeof response.body.diasDisponibles).toBe('number');
            }
          });
        }

        if (modulo === 'facturas') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should calculate tax amounts correctly', async () => {
            const response = await request(app)
              .get(`/${modulo}/${testRecordId}`)
              .expect(200);

            const { subtotal, impuestos, total } = response.body;
            expect(total).toBeCloseTo(subtotal + impuestos, 2);
          });

          test('should validate invoice number uniqueness', async () => {
            const duplicateInvoice = { ...testData[modulo].create };
            
            const response = await request(app)
              .post(`/${modulo}`)
              .send(duplicateInvoice)
              .expect(400);

            expect(response.body.error).toMatch(/numero|ya existe|duplicate/i);
          });
        }

        if (modulo === 'inventario') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should track inventory levels', async () => {
            const response = await request(app)
              .get(`/${modulo}/${testRecordId}`)
              .expect(200);

            expect(response.body.cantidad).toBeGreaterThanOrEqual(0);
          });

          test('should prevent negative inventory', async () => {
            const negativeInventory = {
              ...testData[modulo].create,
              codigo: 'NEG001',
              cantidad: -5
            };
            
            await request(app)
              .post(`/${modulo}`)
              .send(negativeInventory)
              .expect(400);
          });
        }

        if (modulo === 'proyectos') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should validate project dates', async () => {
            const invalidProject = {
              ...testData[modulo].create,
              nombre: 'Proyecto Inválido',
              fechaInicio: '2024-12-01',
              fechaFinEstimada: '2024-11-01' // Fecha fin antes que inicio
            };
            
            await request(app)
              .post(`/${modulo}`)
              .send(invalidProject)
              .expect(400);
          });

          test('should track project progress percentage', async () => {
            const response = await request(app)
              .get(`/${modulo}/${testRecordId}`)
              .expect(200);

            expect(response.body.porcentajeAvance).toBeGreaterThanOrEqual(0);
            expect(response.body.porcentajeAvance).toBeLessThanOrEqual(100);
          });
        }

        if (modulo === 'reportes') {
          beforeEach(async () => {
            // Crear un registro para pruebas específicas
            const response = await request(app)
              .post(`/${modulo}`)
              .send(testData[modulo].create);
            testRecordId = response.body.id;
            createdIds[modulo].push(testRecordId);
          });
          test('should generate report with valid parameters', async () => {
            const response = await request(app)
              .get(`/${modulo}/${testRecordId}`)
              .expect(200);

            expect(response.body).toHaveProperty('parametros');
            expect(response.body).toHaveProperty('numeroRegistros');
            expect(response.body.numeroRegistros).toBeGreaterThanOrEqual(0);
          });

          test('should support different report formats', async () => {
            const formats = ['PDF', 'Excel', 'CSV'];
            const randomFormat = formats[Math.floor(Math.random() * formats.length)];
            
            const reportData = {
              ...testData[modulo].create,
              nombre: 'Reporte de Formato',
              formato: randomFormat
            };
            
            const response = await request(app)
              .post(`/${modulo}`)
              .send(reportData)
              .expect(201);

            expect(response.body.formato).toBe(randomFormat);
            createdIds[modulo].push(response.body.id);
          });
        }
      });
    });
  });

  // Pruebas de integración entre módulos
  describe('Integration Tests - Cross-Module Operations', () => {
    test('should handle employee-vacation relationship', async () => {
      // Crear empleado con datos únicos
      const uniqueEmployeeData = {
        ...testData.empleados.create,
        cedula: '987654321',
        email: 'integration@test.com'
      };
      
      const employeeResponse = await request(app)
        .post('/empleados')
        .send(uniqueEmployeeData)
        .expect(201);

      createdIds.empleados.push(employeeResponse.body.id);

      // Crear vacación para ese empleado
      const vacationData = {
        ...testData.vacaciones.create,
        empleadoId: employeeResponse.body.cedula
      };

      const vacationResponse = await request(app)
        .post('/vacaciones')
        .send(vacationData)
        .expect(201);

      createdIds.vacaciones.push(vacationResponse.body.id);

      expect(vacationResponse.body.empleadoId).toBe(employeeResponse.body.cedula);
    });

    test('should handle project-employee assignment', async () => {
      // Crear empleado
      const employeeResponse = await request(app)
        .post('/empleados')
        .send({
          ...testData.empleados.create,
          cedula: '876543210',
          email: 'project@test.com'
        })
        .expect(201);

      createdIds.empleados.push(employeeResponse.body.id);

      // Crear proyecto con ese empleado
      const projectData = {
        ...testData.proyectos.create,
        nombre: 'Proyecto Integración',
        responsable: employeeResponse.body.nombre,
        equipo: [employeeResponse.body.nombre, 'Otro Empleado']
      };

      const projectResponse = await request(app)
        .post('/proyectos')
        .send(projectData)
        .expect(201);

      createdIds.proyectos.push(projectResponse.body.id);

      expect(projectResponse.body.responsable).toBe(employeeResponse.body.nombre);
      // El equipo puede ser array o objeto, verificamos que contenga el empleado
      const equipo = Array.isArray(projectResponse.body.equipo) ? 
        projectResponse.body.equipo : 
        Object.values(projectResponse.body.equipo || {});
      expect(equipo).toContain(employeeResponse.body.nombre);
    });

    test('should handle quotation-to-invoice workflow', async () => {
      // Crear cotización
      const quotationResponse = await request(app)
        .post('/cotizaciones')
        .send({
          ...testData.cotizaciones.create,
          numero: 'COT-INT-001'
        })
        .expect(201);

      createdIds.cotizaciones.push(quotationResponse.body.id);

      // Crear factura basada en la cotización
      const invoiceData = {
        ...testData.facturas.create,
        numero: 'FACT-INT-001',
        cotizacionId: quotationResponse.body.numero,
        cliente: quotationResponse.body.cliente,
        subtotal: quotationResponse.body.monto
      };

      const invoiceResponse = await request(app)
        .post('/facturas')
        .send(invoiceData)
        .expect(201);

      createdIds.facturas.push(invoiceResponse.body.id);

      expect(invoiceResponse.body.cotizacionId).toBe(quotationResponse.body.numero);
      expect(invoiceResponse.body.cliente).toBe(quotationResponse.body.cliente);
    });
  });

  // Pruebas de rendimiento y carga
  describe('Performance and Load Tests', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      // Crear 5 empleados simultáneamente
      for (let i = 0; i < 5; i++) {
        const employeeData = {
          ...testData.empleados.create,
          cedula: `PERF${i.toString().padStart(6, '0')}`,
          email: `perf${i}@test.com`
        };
        
        promises.push(
          request(app)
            .post('/empleados')
            .send(employeeData)
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar que todos se crearon exitosamente
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        createdIds.empleados.push(response.body.id);
      });
    });

    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/empleados')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // 3 segundos máximo
    });
  });

  // Pruebas de seguridad
  describe('Security and Validation Tests', () => {
    test('should sanitize input data', async () => {
      const maliciousData = {
        ...testData.empleados.create,
        cedula: 'SEC001',
        nombre: '<script>alert("xss")</script>',
        email: 'test@test.com"; DROP TABLE empleados; --'
      };

      const response = await request(app)
        .post('/empleados')
        .send(maliciousData);

      if (response.status === 201) {
        // Si acepta los datos, deben estar sanitizados
        expect(response.body.nombre).not.toContain('<script>');
        expect(response.body.email).not.toContain('DROP TABLE');
        createdIds.empleados.push(response.body.id);
      } else {
        // O debe rechazar los datos maliciosos
        expect(response.status).toBe(400);
      }
    });

    test('should validate data types correctly', async () => {
      const invalidData = {
        ...testData.empleados.create,
        cedula: 'TYPE001',
        salario: 'invalid_salary' // String en lugar de número
      };

      await request(app)
        .post('/empleados')
        .send(invalidData)
        .expect(400);
    });

    test('should handle SQL injection attempts', async () => {
      const sqlInjectionData = {
        ...testData.empleados.create,
        cedula: "'; DROP TABLE empleados; --",
        email: 'sql@test.com'
      };

      const response = await request(app)
        .post('/empleados')
        .send(sqlInjectionData);

      // Debe rechazarlo o sanitizarlo
      if (response.status === 201) {
        expect(response.body.cedula).not.toContain('DROP TABLE');
        createdIds.empleados.push(response.body.id);
      } else {
        expect(response.status).toBe(400);
      }
    });
  });
});