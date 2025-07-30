import { NextRequest, NextResponse } from 'next/server';

// Base de conocimiento del chatbot con preguntas y respuestas predefinidas
const KNOWLEDGE_BASE = {
  // Preguntas sobre empleados
  'como agregar empleado': 'Para agregar un empleado:\n1. Ve a Dashboard → Empleados (/dashboard/employees)\n2. Haz clic en "Agregar Empleado"\n3. Completa los datos: cedula, nombre, posicion, departamento, salario\n4. Haz clic en "Guardar"\n\nEl sistema validara que la cedula no este duplicada.',
  
  'como editar empleado': 'Para editar un empleado:\n1. Ve a Dashboard → Empleados\n2. Busca al empleado en la tabla\n3. Haz clic en el icono de editar (lapiz)\n4. Modifica los datos necesarios\n5. Guarda los cambios',
  
  'que es nomina': 'El modulo de Nomina permite:\n• Calcular salarios automaticamente\n• Gestionar deducciones y bonificaciones\n• Generar recibos de pago\n• Consultar historial de pagos\n\nAccede desde Dashboard → Nomina (/dashboard/payroll)',

  // Preguntas sobre vacaciones
  'como solicitar vacaciones': 'Para solicitar vacaciones:\n1. Ve a Dashboard → Vacaciones (/dashboard/vacations)\n2. Completa el formulario con fechas de inicio y fin\n3. Agrega la razon de la solicitud\n4. Envía la solicitud\n\nLos administradores podran aprobar o rechazar tu solicitud.',
  
  'como aprobar vacaciones': 'Para aprobar vacaciones (solo administradores):\n1. Ve a Dashboard → Empleados → Vacaciones\n2. Revisa las solicitudes pendientes\n3. Haz clic en "Aprobar" o "Rechazar"\n4. El empleado sera notificado del resultado',

  // Preguntas sobre inventario
  'como agregar producto inventario': 'Para agregar productos al inventario:\n1. Ve a Dashboard → Inventario (/dashboard/inventory)\n2. Haz clic en "Agregar Item"\n3. Completa: nombre, categoria, cantidad, precio\n4. Guarda el item\n\nEl sistema controlara el stock automaticamente.',
  
  'como controlar stock': 'El control de stock incluye:\n• Alertas cuando hay poco inventario\n• Registro de movimientos (entradas/salidas)\n• Reportes de existencias\n• Categorizacion de productos\n\nTodo se maneja desde el modulo de Inventario.',

  // Preguntas sobre proyectos
  'como crear proyecto': 'Para crear un proyecto:\n1. Ve a Dashboard → Proyectos (/dashboard/proyectos)\n2. Haz clic en "Agregar Proyecto"\n3. Completa: nombre, cliente, fechas, descripcion\n4. Selecciona el estado inicial\n5. Guarda el proyecto\n\nEl sistema validara que la fecha de fin no sea anterior al inicio.',
  
  'estados de proyecto': 'Los proyectos pueden tener estos estados:\n• ACTIVO: Proyecto en desarrollo\n• COMPLETADO: Proyecto terminado\n• CANCELADO: Proyecto cancelado\n\nPuedes cambiar el estado editando el proyecto.',

  // Preguntas sobre cotizaciones
  'como crear cotizacion': 'Para crear una cotizacion:\n1. Ve a Dashboard → Cotizaciones (/dashboard/quotes)\n2. Haz clic en "Agregar Cotizacion"\n3. Completa: cliente, fecha, total, items\n4. Selecciona el estado\n5. Guarda la cotizacion',
  
  'estados cotizacion': 'Estados de cotizaciones:\n• PENDIENTE: Esperando respuesta del cliente\n• APROBADA: Cliente acepto la cotizacion\n• RECHAZADA: Cliente rechazo la cotizacion\n• EN PROCESO: Cotizacion en desarrollo\n• COMPLETADA: Cotizacion finalizada',

  // Preguntas sobre facturas
  'como crear factura': 'Para crear una factura:\n1. Ve a Dashboard → Facturas (/dashboard/accounting)\n2. Haz clic en "Agregar Factura"\n3. Completa: numero, proyecto, categoria, monto\n4. Establece fecha de emision\n5. Guarda la factura\n\nEl saldo inicial sera igual al monto.',
  
  'como marcar factura pagada': 'Para marcar una factura como pagada:\n1. Ve a la lista de facturas\n2. Edita la factura\n3. Establece la fecha de pago\n4. Ajusta el saldo a 0\n5. Guarda los cambios',

  // Preguntas sobre reportes
  'como generar reportes': 'Para generar reportes:\n1. Ve a Dashboard → Reportes (/dashboard/reports)\n2. Selecciona la pestaña del reporte deseado:\n   - General: Resumen de todas las metricas\n   - Empleados: Datos de personal\n   - Inventario: Stock y productos\n   - Facturacion: Montos y pagos\n   - Finanzas: Ingresos y egresos\n3. Haz clic en "Exportar PDF"',
  
  'que reportes hay': 'Tipos de reportes disponibles:\n• GENERAL: Resumen completo del sistema\n• EMPLEADOS: Datos de personal y vacaciones\n• INVENTARIO: Stock y movimientos\n• FACTURACION: Montos facturados y cobrados\n• FINANZAS: Ingresos, egresos y balance\n\nTodos se pueden exportar a PDF.',

  // Preguntas sobre navegacion
  'como navegar sistema': 'Navegacion del sistema:\n• /dashboard - Panel principal con metricas\n• /dashboard/employees - Gestion de empleados\n• /dashboard/payroll - Nomina y planillas\n• /dashboard/vacations - Solicitudes de vacaciones\n• /dashboard/inventory - Control de inventario\n• /dashboard/proyectos - Gestion de proyectos\n• /dashboard/quotes - Cotizaciones\n• /dashboard/accounting - Facturas\n• /dashboard/reports - Reportes y analytics',
  
  'donde esta dashboard': 'El dashboard principal esta en la ruta /dashboard\n\nAqui encontraras:\n• Metricas clave de la empresa\n• Resumen de empleados, vacaciones, inventario\n• Balance financiero actual\n• Accesos rapidos a los modulos\n• Asistente de chat',

  // Preguntas generales
  'que es arce vargas': 'Arce & Vargas es un sistema integral de gestion empresarial que incluye:\n• Gestion de empleados y nomina\n• Control de vacaciones y horas extra\n• Inventario y productos\n• Proyectos y cotizaciones\n• Facturacion y finanzas\n• Reportes y analytics\n\nDesarrollado con Next.js, Firebase y TypeScript.',
  
  'como funciona sistema': 'El sistema funciona con:\n• AUTENTICACION: Login seguro con Firebase\n• MODULOS: Diferentes secciones para cada area\n• DATOS: Almacenados en Firestore (NoSQL)\n• REPORTES: Exportacion a PDF y Excel\n• RESPONSIVE: Funciona en desktop y movil\n• TEMAS: Modo claro y oscuro',
  
  'ayuda general': 'AYUDA GENERAL:\n• Usa el menu lateral para navegar\n• Cada modulo tiene botones de "Agregar" y "Editar"\n• Los reportes se exportan desde la seccion Reportes\n• Usa los filtros para encontrar informacion\n• El dashboard muestra un resumen general\n• Este chat te ayuda con preguntas especificas',

  // Preguntas adicionales
  'como buscar': 'Para buscar en cualquier modulo:\n• Usa la barra de busqueda en la parte superior de cada tabla\n• Los filtros te permiten encontrar por categoria, estado, etc.\n• Usa las opciones de ordenamiento haciendo clic en los encabezados\n• Muchos modulos tienen filtros avanzados disponibles',
  
  'como exportar datos': 'Para exportar datos:\n• REPORTES: Ve a /dashboard/reports y selecciona "Exportar PDF"\n• TABLAS: Muchas tablas tienen boton de exportacion\n• FORMATO: Los datos se exportan en PDF o Excel\n• CONTENIDO: Se exporta solo lo que este filtrado/visible',
  
  'problema login': 'Si tienes problemas para iniciar sesion:\n• Verifica tu email y contraseña\n• Asegurate de estar registrado en el sistema\n• Si olvidaste tu contraseña, usa "Recuperar contraseña"\n• Contacta al administrador si persisten los problemas',
  
  'que modulos hay': 'MODULOS DISPONIBLES:\n• EMPLEADOS: Gestion de personal\n• NOMINA: Planillas y pagos\n• VACACIONES: Solicitudes y aprobaciones\n• INVENTARIO: Control de stock\n• PROYECTOS: Gestion de trabajos\n• COTIZACIONES: Presupuestos a clientes\n• FACTURAS: Control de cobros\n• REPORTES: Analytics y exportacion',
  
  'como usar filtros': 'Los filtros te ayudan a encontrar informacion:\n• Cada tabla tiene opciones de filtrado\n• Puedes filtrar por fechas, estados, categorias\n• Combina multiples filtros para busquedas precisas\n• Usa "Limpiar filtros" para resetear la vista\n• Los filtros se mantienen mientras navegas',
  
  // Respuesta por defecto
  'default': 'No entendi tu pregunta. Prueba preguntar sobre:\n• "Como agregar empleado"\n• "Como crear proyecto" \n• "Como generar reportes"\n• "Que modulos hay"\n• "Como solicitar vacaciones"\n• "Como crear factura"\n• "Como usar filtros"\n\nO escribe "ayuda general" para mas informacion.'
};

// Palabras clave para detectar el tema de la pregunta
const KEYWORDS = {
  'empleado': ['empleado', 'personal', 'trabajador', 'staff'],
  'nomina': ['nomina', 'planilla', 'salario', 'pago', 'sueldo'],
  'vacaciones': ['vacaciones', 'descanso', 'tiempo libre', 'solicitud'],
  'inventario': ['inventario', 'stock', 'producto', 'existencia'],
  'proyecto': ['proyecto', 'cliente', 'trabajo'],
  'cotizacion': ['cotizacion', 'presupuesto', 'quote'],
  'factura': ['factura', 'cobro', 'pago', 'invoice'],
  'reporte': ['reporte', 'informe', 'exportar', 'pdf'],
  'navegacion': ['navegar', 'menu', 'donde', 'como llegar', 'dashboard'],
  'buscar': ['buscar', 'encontrar', 'filtrar', 'filtro'],
  'exportar': ['exportar', 'descargar', 'excel', 'pdf'],
  'login': ['login', 'iniciar', 'sesion', 'contraseña', 'acceso'],
  'modulos': ['modulos', 'secciones', 'que hay', 'disponible'],
  'general': ['ayuda', 'help', 'sistema', 'arce', 'vargas', 'que es']
};

function findBestMatch(question: string): string {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Buscar coincidencia exacta primero
  for (const [key, response] of Object.entries(KNOWLEDGE_BASE)) {
    if (key !== 'default' && lowerQuestion.includes(key)) {
      return response;
    }
  }
  
  // Buscar por palabras clave
  let maxMatches = 0;
  let bestCategory = '';
  
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    const matches = keywords.filter(keyword => lowerQuestion.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }
  
  // Respuestas especificas por categoria
  const categoryResponses = {
    'empleado': KNOWLEDGE_BASE['como agregar empleado'],
    'nomina': KNOWLEDGE_BASE['que es nomina'],
    'vacaciones': KNOWLEDGE_BASE['como solicitar vacaciones'],
    'inventario': KNOWLEDGE_BASE['como agregar producto inventario'],
    'proyecto': KNOWLEDGE_BASE['como crear proyecto'],
    'cotizacion': KNOWLEDGE_BASE['como crear cotizacion'],
    'factura': KNOWLEDGE_BASE['como crear factura'],
    'reporte': KNOWLEDGE_BASE['como generar reportes'],
    'navegacion': KNOWLEDGE_BASE['como navegar sistema'],
    'buscar': KNOWLEDGE_BASE['como buscar'],
    'exportar': KNOWLEDGE_BASE['como exportar datos'],
    'login': KNOWLEDGE_BASE['problema login'],
    'modulos': KNOWLEDGE_BASE['que modulos hay'],
    'general': KNOWLEDGE_BASE['ayuda general']
  };
  
  return categoryResponses[bestCategory] || KNOWLEDGE_BASE['default'];
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'La pregunta es requerida' },
        { status: 400 }
      );
    }

    // Usar el sistema de respuestas predefinidas
    const response = findBestMatch(question);
    
    return NextResponse.json({ 
      response: response,
      type: 'predefined',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en API de chat:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}