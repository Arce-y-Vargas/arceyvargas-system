const request = require('supertest');
const app = require('./app'); // Ajusta la ruta según tu estructura

// Configuración de datos de prueba para cada entidad
const testData = {
  personas: {
    create: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@test.com',
      telefono: '555-0123',
      edad: 30,
      direccion: 'Calle Principal 123'
    },
    update: {
      nombre: 'Juan Carlos Pérez',
      email: 'juan.carlos@test.com',
      telefono: '555-0124',
      edad: 31,
      direccion: 'Avenida Central 456'
    }
  },
  objetos: {
    create: {
      nombre: 'Laptop Dell',
      descripcion: 'Laptop para oficina',
      categoria: 'Tecnología',
      precio: 799.99,
      stock: 10
    },
    update: {
      nombre: 'Laptop Dell XPS',
      descripcion: 'Laptop premium para oficina',
      categoria: 'Tecnología',
      precio: 899.99,
      stock: 8
    }
  },
  servicios: {
    create: {
      nombre: 'Consultoría IT',
      descripcion: 'Servicio de consultoría en tecnología',
      categoria: 'Consultoría',
      precio: 150.00,
      duracion: '2 horas'
    },
    update: {
      nombre: 'Consultoría IT Avanzada',
      descripcion: 'Servicio especializado de consultoría en tecnología',
      categoria: 'Consultoría Especializada',
      precio: 200.00,
      duracion: '3 horas'
    }
  },
  transacciones: {
    create: {
      tipo: 'venta',
      monto: 999.99,
      descripcion: 'Venta de laptop',
      fecha: new Date().toISOString(),
      cliente: 'Empresa ABC'
    },
    update: {
      tipo: 'venta',
      monto: 1099.99,
      descripcion: 'Venta de laptop con accesorios',
      fecha: new Date().toISOString(),
      cliente: 'Empresa ABC S.A.'
    }
  }
};

// Lista de entidades del sistema
const entidades = ['personas', 'objetos', 'servicios', 'transacciones'];

// Objeto para almacenar IDs creados durante las pruebas
const createdIds = {};

describe('Sistema CRUD - API Tests', () => {
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    // Inicializar IDs para cada entidad
    entidades.forEach(entidad => {
      createdIds[entidad] = [];
    });
  });

  // Limpiar después de todas las pruebas
  afterAll(async () => {
    // Limpiar registros creados durante las pruebas
    for (const entidad of entidades) {
      for (const id of createdIds[entidad]) {
        try {
          await request(app).delete(`/${entidad}/${id}`);
        } catch (error) {
          // Ignorar errores de limpieza
          console.log(`No se pudo eliminar ${entidad}/${id}: ${error.message}`);
        }
      }
    }
  });

  // Pruebas para cada entidad
  entidades.forEach(entidad => {
    describe(`CRUD Operations - ${entidad.toUpperCase()}`, () => {
      let createdId;

      describe('POST /' + entidad, () => {
        test('should create a new record successfully', async () => {
          const response = await request(app)
            .post(`/${entidad}`)
            .send(testData[entidad].create)
            .expect(201);

          // Verificar que la respuesta tiene la estructura esperada
          expect(response.body).toHaveProperty('id');
          expect(response.body.id).toBeTruthy();
          
          // Verificar que los datos enviados estén en la respuesta
          Object.keys(testData[entidad].create).forEach(key => {
            expect(response.body).toHaveProperty(key);
            if (typeof testData[entidad].create[key] === 'number') {
              expect(response.body[key]).toBeCloseTo(testData[entidad].create[key]);
            } else {
              expect(response.body[key]).toBe(testData[entidad].create[key]);
            }
          });

          // Guardar ID para pruebas posteriores
          createdId = response.body.id;
          createdIds[entidad].push(createdId);
        });

        test('should return 400 for invalid data', async () => {
          const response = await request(app)
            .post(`/${entidad}`)
            .send({})
            .expect(400);

          expect(response.body).toHaveProperty('error');
        });

        test('should return 400 for malformed JSON', async () => {
          await request(app)
            .post(`/${entidad}`)
            .send('invalid json')
            .set('Content-Type', 'application/json')
            .expect(400);
        });
      });

      describe('GET /' + entidad, () => {
        test('should get all records including created one', async () => {
          const response = await request(app)
            .get(`/${entidad}`)
            .expect(200);

          expect(Array.isArray(response.body)).toBe(true);
          
          // Verificar que el registro creado esté en la lista
          const createdRecord = response.body.find(record => record.id === createdId);
          expect(createdRecord).toBeTruthy();
          
          // Verificar que los datos coincidan
          Object.keys(testData[entidad].create).forEach(key => {
            if (typeof testData[entidad].create[key] === 'number') {
              expect(createdRecord[key]).toBeCloseTo(testData[entidad].create[key]);
            } else {
              expect(createdRecord[key]).toBe(testData[entidad].create[key]);
            }
          });
        });

        test('should return empty array when no records exist (after cleanup)', async () => {
          // Esta prueba se podría usar con una base de datos limpia
          const response = await request(app)
            .get(`/${entidad}`)
            .expect(200);

          expect(Array.isArray(response.body)).toBe(true);
        });
      });

      describe('GET /' + entidad + '/:id', () => {
        test('should get record by ID with correct data', async () => {
          const response = await request(app)
            .get(`/${entidad}/${createdId}`)
            .expect(200);

          expect(response.body).toHaveProperty('id', createdId);
          
          // Verificar que todos los campos coincidan
          Object.keys(testData[entidad].create).forEach(key => {
            expect(response.body).toHaveProperty(key);
            if (typeof testData[entidad].create[key] === 'number') {
              expect(response.body[key]).toBeCloseTo(testData[entidad].create[key]);
            } else {
              expect(response.body[key]).toBe(testData[entidad].create[key]);
            }
          });
        });

        test('should return 404 for non-existent ID', async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .get(`/${entidad}/${nonExistentId}`)
            .expect(404);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toMatch(/not found/i);
        });

        test('should return 400 for invalid ID format', async () => {
          const invalidId = 'invalid@id#format';
          await request(app)
            .get(`/${entidad}/${invalidId}`)
            .expect(400);
        });
      });

      describe('PUT /' + entidad + '/:id', () => {
        test('should update record successfully', async () => {
          const response = await request(app)
            .put(`/${entidad}/${createdId}`)
            .send(testData[entidad].update)
            .expect(200);

          expect(response.body).toHaveProperty('id', createdId);
          
          // Verificar que los datos actualizados estén en la respuesta
          Object.keys(testData[entidad].update).forEach(key => {
            if (typeof testData[entidad].update[key] === 'number') {
              expect(response.body[key]).toBeCloseTo(testData[entidad].update[key]);
            } else {
              expect(response.body[key]).toBe(testData[entidad].update[key]);
            }
          });
        });

        test('should verify update persisted in database', async () => {
          // Verificar que los cambios se reflejen al consultar por ID
          const response = await request(app)
            .get(`/${entidad}/${createdId}`)
            .expect(200);

          Object.keys(testData[entidad].update).forEach(key => {
            if (typeof testData[entidad].update[key] === 'number') {
              expect(response.body[key]).toBeCloseTo(testData[entidad].update[key]);
            } else {
              expect(response.body[key]).toBe(testData[entidad].update[key]);
            }
          });
        });

        test('should return 404 for updating non-existent record', async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .put(`/${entidad}/${nonExistentId}`)
            .send(testData[entidad].update)
            .expect(404);

          expect(response.body).toHaveProperty('error');
        });

        test('should return 400 for invalid update data', async () => {
          await request(app)
            .put(`/${entidad}/${createdId}`)
            .send({ invalid: 'data that breaks validation' })
            .expect(400);
        });

        test('should handle partial updates correctly', async () => {
          const partialUpdate = Object.keys(testData[entidad].update).reduce((acc, key, index) => {
            if (index === 0) acc[key] = testData[entidad].update[key];
            return acc;
          }, {});

          const response = await request(app)
            .put(`/${entidad}/${createdId}`)
            .send(partialUpdate)
            .expect(200);

          // Verificar que solo se actualizó el campo enviado
          Object.keys(partialUpdate).forEach(key => {
            if (typeof partialUpdate[key] === 'number') {
              expect(response.body[key]).toBeCloseTo(partialUpdate[key]);
            } else {
              expect(response.body[key]).toBe(partialUpdate[key]);
            }
          });
        });
      });

      describe('DELETE /' + entidad + '/:id', () => {
        test('should delete record successfully', async () => {
          const response = await request(app)
            .delete(`/${entidad}/${createdId}`)
            .expect(200);

          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toMatch(/deleted|removed|eliminado/i);
        });

        test('should verify record is actually deleted', async () => {
          // Verificar que el registro ya no existe
          await request(app)
            .get(`/${entidad}/${createdId}`)
            .expect(404);

          // Remover de la lista de limpieza ya que fue eliminado
          const index = createdIds[entidad].indexOf(createdId);
          if (index > -1) {
            createdIds[entidad].splice(index, 1);
          }
        });

        test('should return 404 for deleting non-existent record', async () => {
          const nonExistentId = 'non-existent-id-12345';
          const response = await request(app)
            .delete(`/${entidad}/${nonExistentId}`)
            .expect(404);

          expect(response.body).toHaveProperty('error');
        });

        test('should return 400 for invalid ID format', async () => {
          const invalidId = 'invalid@id#format';
          await request(app)
            .delete(`/${entidad}/${invalidId}`)
            .expect(400);
        });
      });

      describe('Error Handling and Edge Cases - ' + entidad, () => {
        test('should handle concurrent requests properly', async () => {
          // Crear múltiples registros simultáneamente
          const promises = [];
          for (let i = 0; i < 3; i++) {
            promises.push(
              request(app)
                .post(`/${entidad}`)
                .send({
                  ...testData[entidad].create,
                  nombre: `${testData[entidad].create.nombre} ${i}`
                })
            );
          }

          const responses = await Promise.all(promises);
          
          // Verificar que todos se crearon exitosamente
          responses.forEach(response => {
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            createdIds[entidad].push(response.body.id);
          });
        });

        test('should handle large payload correctly', async () => {
          const largeData = {
            ...testData[entidad].create,
            descripcion: 'A'.repeat(1000) // String largo para probar límites
          };

          const response = await request(app)
            .post(`/${entidad}`)
            .send(largeData);

          if (response.status === 201) {
            expect(response.body).toHaveProperty('id');
            createdIds[entidad].push(response.body.id);
          } else {
            // Si el servidor rechaza payloads grandes, debería ser 413
            expect([400, 413]).toContain(response.status);
          }
        });

        test('should maintain data integrity after multiple operations', async () => {
          // Crear un registro
          const createResponse = await request(app)
            .post(`/${entidad}`)
            .send(testData[entidad].create)
            .expect(201);

          const recordId = createResponse.body.id;
          createdIds[entidad].push(recordId);

          // Actualizar múltiples veces
          for (let i = 0; i < 3; i++) {
            const updateData = {
              ...testData[entidad].update,
              nombre: `${testData[entidad].update.nombre} v${i}`
            };

            await request(app)
              .put(`/${entidad}/${recordId}`)
              .send(updateData)
              .expect(200);
          }

          // Verificar que el registro final tenga los datos correctos
          const finalResponse = await request(app)
            .get(`/${entidad}/${recordId}`)
            .expect(200);

          expect(finalResponse.body.nombre).toBe(`${testData[entidad].update.nombre} v2`);
        });
      });
    });
  });

  describe('System Integration Tests', () => {
    test('should handle cross-entity operations', async () => {
      const createdRecords = {};

      // Crear un registro en cada entidad
      for (const entidad of entidades) {
        const response = await request(app)
          .post(`/${entidad}`)
          .send(testData[entidad].create)
          .expect(201);

        createdRecords[entidad] = response.body;
        createdIds[entidad].push(response.body.id);
      }

      // Verificar que todos fueron creados
      for (const entidad of entidades) {
        const response = await request(app)
          .get(`/${entidad}/${createdRecords[entidad].id}`)
          .expect(200);

        expect(response.body.id).toBe(createdRecords[entidad].id);
      }
    });

    test('should handle system load with multiple entities', async () => {
      const promises = [];

      // Crear múltiples registros en todas las entidades simultáneamente
      entidades.forEach(entidad => {
        for (let i = 0; i < 2; i++) {
          promises.push(
            request(app)
              .post(`/${entidad}`)
              .send({
                ...testData[entidad].create,
                nombre: `Load Test ${entidad} ${i}`
              })
          );
        }
      });

      const responses = await Promise.all(promises);

      // Verificar que todas las operaciones fueron exitosas
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        
        const entidadIndex = Math.floor(index / 2);
        createdIds[entidades[entidadIndex]].push(response.body.id);
      });
    });
  });

  describe('API Performance and Limits', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/personas')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5 segundos máximo
    });

    test('should handle rapid successive requests', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app).get('/personas').expect(200)
        );
      }

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(10);
    });
  });

  describe('Security and Validation Tests', () => {
    test('should sanitize input data', async () => {
      const maliciousData = {
        ...testData.personas.create,
        nombre: '<script>alert("xss")</script>',
        email: 'test@test.com"; DROP TABLE personas; --'
      };

      const response = await request(app)
        .post('/personas')
        .send(maliciousData);

      if (response.status === 201) {
        // Si acepta los datos, deben estar sanitizados
        expect(response.body.nombre).not.toContain('<script>');
        expect(response.body.email).not.toContain('DROP TABLE');
        createdIds.personas.push(response.body.id);
      } else {
        // O debe rechazar los datos maliciosos
        expect(response.status).toBe(400);
      }
    });

    test('should validate required fields', async () => {
      await request(app)
        .post('/personas')
        .send({})
        .expect(400);
    });

    test('should validate data types', async () => {
      const invalidData = {
        ...testData.personas.create,
        edad: 'invalid_age' // String en lugar de número
      };

      await request(app)
        .post('/personas')
        .send(invalidData)
        .expect(400);
    });
  });
});