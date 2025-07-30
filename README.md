# 🏢 Sistema de Gestión Empresarial - Arce & Vargas

Sistema integral de gestión empresarial desarrollado con Next.js, Firebase y TypeScript.

## 🚀 Características

- **👥 Gestión de Empleados**: Perfiles, salarios, departamentos
- **💰 Nómina**: Cálculo automático de planillas y recibos
- **🏖️ Vacaciones**: Solicitudes y aprobaciones
- **⏰ Horas Extra**: Registro y cálculos
- **📦 Inventario**: Control de existencias
- **🏗️ Proyectos**: Gestión con fechas y estados
- **💼 Cotizaciones**: Creación y seguimiento
- **🧾 Facturas**: Emisión y control de pagos
- **📊 Reportes**: Analytics y exportación
- **🤖 Asistente IA**: Ayuda contextual inteligente

## ⚡ Configuración Rápida

### 1. Instalación

```bash
git clone [repository-url]
cd arceyvargas
npm install

### 2. Configuración de Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# OpenAI para Asistente IA (Opcional)
OPENAI_API_KEY=sk-tu_openai_api_key
```

### 3. Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea base de datos Firestore
4. Configura las reglas de seguridad:

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🤖 Chatbot Integrado (Sin IA Externa)

El sistema incluye un **chatbot inteligente** que funciona **sin necesidad de APIs externas**.

### ✨ **Características**
- ⚡ **Respuestas instantáneas** - Sin demoras de red
- 📚 **Base de conocimiento completa** - Más de 20 preguntas predefinidas
- 🎯 **Reconocimiento inteligente** - Entiende variaciones de preguntas
- 🔧 **Siempre disponible** - No depende de servicios externos

### 📝 **Ejemplos de Preguntas**
- **"¿Cómo agregar un empleado?"** - Guía paso a paso
- **"¿Cómo crear un proyecto?"** - Proceso completo
- **"¿Cómo generar reportes?"** - Exportación de datos
- **"¿Qué módulos hay?"** - Lista de funcionalidades
- **"¿Cómo solicitar vacaciones?"** - Proceso de solicitud

### 🚀 **Uso**
1. Ve al dashboard principal
2. Haz clic en "Asistente IA"
3. Escribe tu pregunta
4. ¡Recibe respuesta instantánea!

Ver [`CHATBOT_EXAMPLES.md`](./CHATBOT_EXAMPLES.md) para lista completa de preguntas.

## 🔧 Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth  
- **Chatbot**: Sistema de respuestas predefinidas (sin IA externa)
- **UI**: shadcn/ui, Lucide Icons
- **Exportación**: jsPDF, ExcelJS

## 📂 Estructura del Proyecto

```
src/
├── app/                 # App Router (Next.js 13+)
│   ├── api/chat/       # Endpoint del asistente IA
│   ├── dashboard/      # Páginas del sistema
│   └── auth/           # Autenticación
├── components/         # Componentes React
│   ├── dashboard/      # Módulos del sistema
│   └── ui/             # Componentes UI base
├── lib/                # Utilidades y servicios
└── hooks/              # Custom hooks
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel --prod
```

### Variables de Entorno en Producción
Configura las mismas variables del `.env.local` en tu plataforma de deploy.

## 📝 Licencia

Proyecto propietario - Arce & Vargas
