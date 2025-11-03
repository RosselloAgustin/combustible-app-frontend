# 🚗 Calculadora Corsa - Frontend Standalone

Frontend completamente independiente para la **Calculadora Corsa** - una aplicación de análisis de costos y ganancias para Chevrolet Corsa Classic 1.6 2007.

Este es un proyecto **React + TypeScript + Tailwind CSS** que puede funcionar de forma completamente independiente de cualquier backend.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Desarrollo](#desarrollo)
- [Build para Producción](#build-para-producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Integración con Backend](#integración-con-backend)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

✅ **Autenticación Personalizada**
- Registro e inicio de sesión con email/contraseña
- Gestión de sesiones con JWT
- Protección de rutas

✅ **Gestión de Viajes**
- Crear, leer, actualizar y eliminar viajes
- Filtros por tipo (trabajo/personal), fecha, etc.
- Estadísticas y análisis

✅ **Interfaz Moderna**
- Diseño responsivo con Tailwind CSS
- Componentes UI con shadcn/ui
- Animaciones suaves

✅ **Totalmente Tipado**
- TypeScript para máxima seguridad de tipos
- Validación con Zod
- Autocompletado en el IDE

✅ **Desacoplado del Backend**
- Puedes usar cualquier backend que implemente los endpoints tRPC
- Fácil de integrar con diferentes servicios
- Código limpio y mantenible

---

## 🔧 Requisitos

- **Node.js** 18+ 
- **npm** 9+ o **pnpm** 8+
- **Git**

---

## 📦 Instalación

### Opción 1: Clonar este Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/RosselloAgustin/CombustibleApp.git
cd CombustibleApp/frontend-standalone

# Instalar dependencias
npm install
# o
pnpm install
```

### Opción 2: Usar como Template

```bash
# Crear un nuevo proyecto basado en este
npx degit RosselloAgustin/CombustibleApp/frontend-standalone mi-proyecto
cd mi-proyecto
npm install
```

### Opción 3: Copiar Manualmente

```bash
# Copiar solo los archivos necesarios
cp -r frontend-standalone /ruta/destino/
cd /ruta/destino
npm install
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL del Backend (IMPORTANTE)
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000
# o para producción:
# VITE_FRONTEND_FORGE_API_URL=https://tu-backend.com

# API Key (si es requerida)
VITE_FRONTEND_FORGE_API_KEY=tu_api_key_aqui

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im/umami
VITE_ANALYTICS_WEBSITE_ID=calculadora-corsa

# Información de la App
VITE_APP_TITLE=Calculadora Corsa
VITE_APP_LOGO=https://placehold.co/128x128
VITE_APP_ID=calculadora-corsa
```

### 2. Configurar el Backend

**Opción A: Usar Backend Existente**

Si tienes un backend tRPC ya corriendo, solo necesitas actualizar `VITE_FRONTEND_FORGE_API_URL`.

**Opción B: Crear tu Propio Backend**

El frontend espera estos endpoints tRPC:

```typescript
// Autenticación
POST /api/trpc/auth.register
POST /api/trpc/auth.login
GET /api/trpc/auth.me
POST /api/trpc/auth.logout

// Viajes
POST /api/trpc/trips.create
GET /api/trpc/trips.list
POST /api/trpc/trips.update
POST /api/trpc/trips.delete
```

Ver sección [Integración con Backend](#integración-con-backend) para más detalles.

---

## 🚀 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar TypeScript

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

### Linting (si está configurado)

```bash
npm run lint
```

---

## 📦 Build para Producción

### Compilar

```bash
npm run build
```

Esto generará los archivos optimizados en la carpeta `dist/`.

### Verificar el Build

```bash
npm run preview
```

### Deployar

Ver sección [Deployment](#deployment).

---

## 📁 Estructura del Proyecto

```
frontend-standalone/
├── src/
│   ├── pages/                    # Páginas principales
│   │   ├── Home.tsx             # Dashboard principal
│   │   ├── Login.tsx            # Página de login/registro
│   │   └── NotFound.tsx         # Página 404
│   │
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── ErrorBoundary.tsx    # Manejo de errores
│   │   ├── ProtectedRoute.tsx   # Rutas protegidas
│   │   └── DashboardLayout.tsx  # Layout del dashboard
│   │
│   ├── contexts/                # Contextos de React
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   │
│   ├── lib/                     # Utilidades y clientes
│   │   ├── sdk.ts              # Cliente HTTP personalizado
│   │   ├── trpc.ts             # Cliente tRPC
│   │   └── utils.ts            # Funciones auxiliares
│   │
│   ├── _core/                  # Código core
│   │   ├── hooks/              # Custom hooks
│   │   └── types/              # Tipos TypeScript
│   │
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Punto de entrada
│   ├── const.ts                # Constantes
│   └── index.css               # Estilos globales
│
├── public/                      # Archivos estáticos
│   └── (imágenes, logos, etc.)
│
├── index.html                   # HTML principal
├── vite.config.ts              # Configuración de Vite
├── tsconfig.json               # Configuración de TypeScript
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

---

## 🧩 Componentes Principales

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)

Gestiona el estado de autenticación global.

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user?.name}</p>
      ) : (
        <p>Por favor, inicia sesión</p>
      )}
    </div>
  );
}
```

### 2. **SDK** (`src/lib/sdk.ts`)

Cliente HTTP para comunicarse con el backend.

```typescript
import { sdk } from '@/lib/sdk';

// Registro
await sdk.register('user@example.com', 'password123', 'Nombre');

// Login
await sdk.login('user@example.com', 'password123');

// Obtener usuario actual
const user = await sdk.getUser();

// Logout
await sdk.logout();
```

### 3. **tRPC Client** (`src/lib/trpc.ts`)

Cliente tRPC para llamadas tipadas.

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  // Obtener lista de viajes
  const { data: trips } = trpc.trips.list.useQuery();
  
  // Crear viaje
  const createTrip = trpc.trips.create.useMutation();
  
  return (
    <div>
      {trips?.map(trip => (
        <div key={trip.id}>{trip.destino}</div>
      ))}
    </div>
  );
}
```

### 4. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)

Protege rutas que requieren autenticación.

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

// En App.tsx
<Route 
  path="/" 
  component={() => (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  )} 
/>
```

---

## 🔌 Integración con Backend

### Requisitos del Backend

El backend debe tener los siguientes endpoints tRPC:

#### Autenticación

```typescript
// Registro
auth.register({
  email: string;
  password: string;
  name?: string;
}) => { id: number; email: string; name?: string }

// Login
auth.login({
  email: string;
  password: string;
}) => { id: number; email: string; name?: string }

// Obtener usuario actual
auth.me() => { id: number; email: string; name?: string } | null

// Logout
auth.logout() => { success: boolean }
```

#### Viajes

```typescript
// Crear viaje
trips.create({
  tipo: 'trabajo' | 'personal';
  fecha: string; // YYYY-MM-DD
  kmInicio: number;
  kmFinal: number;
  paquetes?: number;
  destino?: string;
  dineroGanado?: number;
  notas?: string;
}) => Trip

// Listar viajes
trips.list() => Trip[]

// Actualizar viaje
trips.update({
  id: number;
  tipo?: 'trabajo' | 'personal';
  fecha?: string;
  kmInicio?: number;
  kmFinal?: number;
  paquetes?: number;
  destino?: string;
  dineroGanado?: number;
  notas?: string;
}) => Trip

// Eliminar viaje
trips.delete({ id: number }) => boolean
```

### Cambiar la URL del Backend

Edita `src/lib/sdk.ts`:

```typescript
// Línea 2
const API_BASE_URL = "https://tu-backend.com"; // Cambiar aquí
```

O usa la variable de entorno:

```typescript
const API_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || window.location.origin;
```

---

## 🌍 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
# Agregar a package.json
"homepage": "https://tu-usuario.github.io/tu-repo",

# Build
npm run build

# Deploy (requiere gh-pages)
npm run deploy
```

### Otros Servicios

El proyecto es un SPA (Single Page Application) estándar. Puede deployarse en:
- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **Heroku**
- **Railway**
- Cualquier servidor web estático

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/sdk'"

**Solución:** Verifica que `tsconfig.json` tenga la configuración de alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: "API request failed"

**Solución:** Verifica que:
1. El backend está corriendo
2. `VITE_FRONTEND_FORGE_API_URL` apunta a la URL correcta
3. El backend tiene los endpoints tRPC correctos
4. No hay problemas de CORS

### Error: "User not authenticated"

**Solución:** 
1. Asegúrate de que el usuario está registrado
2. Verifica que las cookies se están guardando correctamente
3. Comprueba que el backend está enviando las cookies con `httpOnly`

### Aplicación se recarga infinitamente

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Verifica que el backend está respondiendo correctamente

---

## 📚 Recursos Útiles

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [tRPC](https://trpc.io)
- [Vite](https://vitejs.dev)

---

## 🤝 Contribuir

¿Encontraste un bug o tienes una sugerencia? 

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 👤 Autor

**Agustín Rossello**

- GitHub: [@RosselloAgustin](https://github.com/RosselloAgustin)
- Email: agustinrossello.w@gmail.com

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar este frontend con cualquier backend?**

R: Sí, siempre que el backend implemente los endpoints tRPC especificados en la sección "Integración con Backend".

**P: ¿Cómo agrego nuevas funcionalidades?**

R: 
1. Crea nuevos componentes en `src/components/`
2. Crea nuevas páginas en `src/pages/`
3. Actualiza las rutas en `src/App.tsx`
4. Agrega nuevos endpoints tRPC en el backend si es necesario

**P: ¿Es seguro guardar datos en el frontend?**

R: No. Nunca guardes información sensible (contraseñas, tokens, datos personales) en localStorage. Usa cookies httpOnly para tokens.

**P: ¿Cómo manejo errores?**

R: Usa el componente `ErrorBoundary` y manejo de errores en tRPC:

```typescript
const mutation = trpc.trips.create.useMutation({
  onError: (error) => {
    console.error(error.message);
    toast.error("Error al crear viaje");
  }
});
```

**P: ¿Puedo usar este frontend en producción?**

R: Sí, pero asegúrate de:
1. Compilar con `npm run build`
2. Configurar las variables de entorno correctamente
3. Usar un backend seguro y confiable
4. Implementar HTTPS
5. Configurar CORS correctamente

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa esta documentación
2. Abre un issue en GitHub
3. Contacta al autor

---

**¡Gracias por usar Calculadora Corsa! 🚗**
