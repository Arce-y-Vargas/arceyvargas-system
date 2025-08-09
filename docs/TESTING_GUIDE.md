# 🧪 Guía Completa de Testing - Sistema Empresarial

## 🎯 Objetivo

Esta guía explica cómo usar el sistema de pruebas automatizadas para el sistema completo de gestión empresarial que incluye 14 módulos funcionales.

## 🏗️ Arquitectura del Sistema de Pruebas

### Componentes Principales

1. **employee-test-server.js** - Servidor Express con 14 módulos empresariales
2. **employee-system.test.js** - 233 casos de prueba automatizados
3. **jest.api.config.js** - Configuración optimizada para APIs
4. **api-test-setup.js** - Setup global y polyfills

## 📋 Lista Completa de Módulos

### 👥 Gestión de Recursos Humanos
| Módulo | Endpoint | Funcionalidades |
|--------|----------|-----------------|
| Lista de Empleados | `/empleados` | CRUD, validación cédula única, email |
| Horas Extras | `/horasExtras` | Registro, cálculo automático, aprobación |
| Gestión Horas Extra | `/gestionHorasExtra` | Consolidación mensual, pagos |
| Vacaciones | `/vacaciones` | Solicitudes, workflow, días disponibles |
| Registrar Horas Extra | `/registroHorasExtra` | Control detallado, autorización |
| Solicitudes RRHH | `/solicitudesRRHH` | Procesos internos, tipos múltiples |
| Solicitud de Vacaciones | `/solicitudVacaciones` | Proceso simplificado, cobertura |

### 💼 Gestión Comercial y Operativa
| Módulo | Endpoint | Funcionalidades |
|--------|----------|-----------------|
| Inventario | `/inventario` | Control stock, códigos únicos, ubicaciones |
| Productos | `/productos` | Catálogo, desarrollo, responsables |
| Cotizaciones | `/cotizaciones` | Comercial, validez, números únicos |
| Facturas | `/facturas` | Facturación, cálculo impuestos, referencias |
| Categorías | `/categorias` | Clasificación, colores, iconos |
| Proyectos | `/proyectos` | Seguimiento, equipos, progreso |
| Reportes | `/reportes` | Generación, formatos múltiples, parámetros |

## 🚀 Ejecución de Pruebas

### Comando Principal
```bash
cd test
NODE_ENV=test npx jest employee-system.test.js --config jest.api.config.js --coverage --verbose
```

### Pruebas por Categoría

#### Recursos Humanos
```bash
# Empleados
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="EMPLEADOS"

# Horas Extra
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="HORASEXTRAS"

# Vacaciones
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="VACACIONES"
```

#### Gestión Comercial
```bash
# Facturas
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="FACTURAS"

# Inventario
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="INVENTARIO"

# Proyectos
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="PROYECTOS"
```

#### Pruebas Especiales
```bash
# Integración entre módulos
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="Integration Tests"

# Seguridad
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="Security"

# Rendimiento
NODE_ENV=test npx jest --config jest.api.config.js --testNamePattern="Performance"
```

## 📊 Interpretación de Resultados

### Resultado Exitoso
```
PASS API Tests ./employee-system.test.js
Test Suites: 1 passed, 1 total
Tests:       233 passed, 233 total
Time:        1.075 s
```

### Cobertura de Código
```
=============================== Coverage summary ===============================
Statements   : 83.87% ( X/Y )
Branches     : 83.55% ( X/Y )
Functions    : 90.69% ( X/Y )
Lines        : 83.78% ( X/Y )
================================================================================
```

## 🔍 Tipos de Pruebas Implementadas

### 1. Pruebas CRUD Básicas (Por cada módulo)
- **POST** - Creación exitosa con validaciones
- **GET** - Listado y consulta individual
- **PUT** - Actualización completa y parcial
- **DELETE** - Eliminación con verificación

### 2. Validaciones de Negocio
```javascript
// Ejemplos de validaciones específicas
empleados: {
  - Cédula única en el sistema
  - Formato de email válido
  - Campos requeridos
}

facturas: {
  - Total = Subtotal + Impuestos
  - Números únicos de factura
  - Referencias a cotizaciones
}
```

### 3. Pruebas de Integración
- **Employee-Vacation**: Relación empleado-solicitud vacaciones
- **Project-Employee**: Asignación de equipos a proyectos  
- **Quotation-Invoice**: Workflow cotización → factura

### 4. Pruebas de Seguridad
- **XSS Prevention**: Filtrado de scripts maliciosos
- **SQL Injection**: Sanitización de caracteres especiales
- **Data Validation**: Tipos correctos, rangos válidos

### 5. Pruebas de Rendimiento
- **Concurrencia**: Operaciones simultáneas sin conflictos
- **Tiempo de Respuesta**: < 3 segundos por operación

## 🛠️ Configuración y Setup

### Estructura de Datos de Prueba
```javascript
const testData = {
  empleados: {
    create: {
      cedula: '123456789',
      nombre: 'Juan Carlos Pérez',
      email: 'juan.perez@empresa.com',
      // ... más campos
    },
    update: {
      nombre: 'Juan Carlos Pérez Rodríguez',
      // ... campos a actualizar
    }
  }
  // ... otros módulos
};
```

### Limpieza Automática
```javascript
// Limpieza después de cada prueba
afterAll(async () => {
  for (const modulo of modulos) {
    for (const id of createdIds[modulo]) {
      await request(app).delete(`/${modulo}/${id}`);
    }
  }
});
```

## 🐛 Solución de Problemas

### Error: "Jest: beforeEach() may not be used..."
**Causa**: beforeEach sin pruebas en el bloque describe
**Solución**: Cada beforeEach debe estar dentro de un describe con pruebas

### Error: "Expected 201 'Created', got 400 'Bad Request'"
**Causa**: Datos de prueba duplicados o validación fallida
**Solución**: Verificar unicidad de datos (cédulas, emails, números)

### Error: "Array.isArray() toBe(true) received false"
**Causa**: Arrays convertidos a objetos en serialización
**Solución**: Manejar ambos formatos en assertions

### Error: Timeout en pruebas
**Causa**: Operaciones lentas o bloqueantes
**Solución**: Usar `--maxWorkers=1` o aumentar timeout

## 📈 Métricas y Benchmarks

### Rendimiento Esperado
- **Tiempo total**: 1-2 segundos
- **Promedio por prueba**: ~4-5ms
- **Operaciones por segundo**: >200 ops/sec
- **Memory usage**: Estable, sin leaks

### Cobertura Mínima
- **Statements**: >80%
- **Branches**: >80%
- **Functions**: >85%
- **Lines**: >80%

## 🔄 Integración Continua

### Script para CI/CD
```bash
#!/bin/bash
cd test
NODE_ENV=test npx jest employee-system.test.js --config jest.api.config.js --coverage --ci --watchAll=false --maxWorkers=1
```

### Validación de Coverage
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "statements": 80,
        "branches": 80,
        "functions": 85,
        "lines": 80
      }
    }
  }
}
```

## ✅ Checklist de Validación

### Antes de Ejecutar
- [ ] Node.js y npm instalados
- [ ] Dependencias instaladas (`npm install`)
- [ ] Puerto 3001 disponible
- [ ] Variables de entorno configuradas

### Durante la Ejecución
- [ ] Todas las pruebas pasan (233/233)
- [ ] Cobertura >80% en todas las métricas
- [ ] Sin errores de memoria
- [ ] Tiempo <3 segundos

### Después de la Ejecución
- [ ] Reportes de cobertura generados
- [ ] No hay datos residuales
- [ ] Logs limpios sin errores

## 📚 Referencias Adicionales

- **Jest Documentation**: https://jestjs.io/docs
- **Supertest Guide**: https://github.com/visionmedia/supertest
- **API Testing Best Practices**: Consultar docs/best-practices.md
- **Troubleshooting**: Consultar docs/troubleshooting.md

---

**✅ Sistema de Pruebas 100% Funcional - Listo para Uso Empresarial**