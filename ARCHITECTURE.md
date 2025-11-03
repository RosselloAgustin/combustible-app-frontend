# 🏗️ Arquitectura del Frontend

Documento que explica la estructura, patrones y decisiones de diseño del frontend.

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           App.tsx (Router)                  │   │
│  │  - Define rutas                             │   │
│  │  - Envuelve con ThemeProvider               │   │
│  │  - Envuelve con ErrorBoundary               │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│                      ├──────────────────────────┐   │
│                      │                          │   │
│  ┌─────────────────────────┐  ┌──────────────────┐ │
│  │   Login Page            │  │   Home Page      │ │
│  │  - Registro             │  │  - Dashboard     │ │
│  │  - Inicio de sesión     │  │  - CRUD Viajes   │ │
│  └─────────────────────────┘  └──────────────────┘ │
│           │                            │            │
│           └────────────┬───────────────┘            │
│                        │                            │
│  ┌─────────────────────▼──────────────────────┐   │
│  │        AuthContext (Global State)          │   │
│  │  - user: User | null                       │   │
│  │  - isAuthenticated: boolean                │   │
│  │  - isLoading: boolean                      │   │
│  │  - login(email, password)                  │   │
│  │  - logout()                                │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│                      ▼                              │
│  ┌─────────────────────────────────────────────┐   │
│  │        SDK Client (HTTP)                    │   │
│  │  - register()                               │   │
│  │  - login()                                  │   │
│  │  - getUser()                                │   │
│  │  - logout()                                 │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│                      ▼                              │
│  ┌─────────────────────────────────────────────┐   │
│  │        tRPC Client                          │   │
│  │  - auth.*                                   │   │
│  │  - trips.*                                  │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
│                      ▼                              │
│  ┌─────────────────────────────────────────────┐   │
│  │        HTTP Requests                        │   │
│  │  (fetch con credentials: include)           │   │
│  └─────────────────────────────────────────────┘   │
│                      │                              │
└──────────────────────┼──────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Backend (tRPC)     │
            │   - /api/trpc/*      │
            └──────────────────────┘
```

---

## 📁 Estructura de Directorios

```
src/
├── pages/                    # Páginas principales (rutas)
│   ├── Home.tsx             # Dashboard principal
│   ├── Login.tsx            # Página de autenticación
│   └── NotFound.tsx         # Página 404
│
├── components/              # Componentes reutilizables
│   ├── ui/                  # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── checkbox.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── ErrorBoundary.tsx    # Captura errores de React
│   ├── ProtectedRoute.tsx   # Protege rutas autenticadas
│   └── DashboardLayout.tsx  # Layout del dashboard
│
├── contexts/                # Contextos globales
│   ├── AuthContext.tsx      # Estado de autenticación
│   └── ThemeContext.tsx     # Estado del tema
│
├── lib/                     # Librerías y utilidades
│   ├── sdk.ts              # Cliente HTTP personalizado
│   ├── trpc.ts             # Cliente tRPC
│   └── utils.ts            # Funciones auxiliares
│
├── _core/                  # Código core
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts      # Hook para usar AuthContext
│   └── types/              # Tipos TypeScript
│       └── index.ts        # Tipos compartidos
│
├── App.tsx                 # Componente raíz
├── main.tsx                # Punto de entrada
├── const.ts                # Constantes
└── index.css               # Estilos globales
```

---

## 🔄 Flujo de Datos

### 1. Autenticación

```
Usuario → Login Page
   ↓
Usuario ingresa email/password
   ↓
onClick → handleLogin()
   ↓
sdk.login(email, password)
   ↓
HTTP POST /api/trpc/auth.login
   ↓
Backend valida y retorna usuario
   ↓
SDK guarda cookie (httpOnly)
   ↓
AuthContext actualiza estado
   ↓
Redirige a Home Page
```

### 2. Obtener Datos (Viajes)

```
Home Page monta
   ↓
useEffect → trpc.trips.list.useQuery()
   ↓
tRPC Client prepara request
   ↓
HTTP GET /api/trpc/trips.list
   ↓
Backend retorna viajes
   ↓
React Query cachea datos
   ↓
Componente re-renderiza con datos
```

### 3. Crear Datos (Viaje)

```
Usuario completa formulario
   ↓
onClick → handleSaveTravel()
   ↓
Valida datos
   ↓
trpc.trips.create.useMutation()
   ↓
HTTP POST /api/trpc/trips.create
   ↓
Backend crea viaje
   ↓
Mutation onSuccess
   ↓
Refetch trips.list
   ↓
Toast success
   ↓
Modal cierra
```

---

## 🎯 Patrones Utilizados

### 1. Context API para Estado Global

```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lógica...

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 2. Custom Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 3. Protected Routes

```typescript
// ProtectedRoute.tsx
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

### 4. tRPC + React Query

```typescript
// Home.tsx
const { data: trips } = trpc.trips.list.useQuery();

const createTrip = trpc.trips.create.useMutation({
  onSuccess: () => {
    refetch();
    toast.success("Viaje guardado");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### 5. Error Boundary

```typescript
// ErrorBoundary.tsx
export default class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Algo salió mal</div>;
    }
    return this.props.children;
  }
}
```

---

## 🔐 Seguridad

### 1. Cookies httpOnly

El backend debe enviar cookies con `httpOnly: true`:

```typescript
// Backend
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
});
```

El frontend automáticamente incluye cookies en requests:

```typescript
// Frontend
fetch(url, {
  credentials: 'include', // Incluye cookies
});
```

### 2. CSRF Protection

tRPC maneja CSRF automáticamente con cookies.

### 3. Validación en Frontend

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.parse(data); // Lanza error si no es válido
```

### 4. No Guardar Tokens en localStorage

❌ **NUNCA HAGAS ESTO:**
```typescript
localStorage.setItem('token', token); // ¡INSEGURO!
```

✅ **USA COOKIES:**
```typescript
// El backend maneja las cookies
// El frontend no necesita hacer nada
```

---

## 🚀 Performance

### 1. Code Splitting

Las páginas se cargan bajo demanda:

```typescript
// App.tsx
<Route path="/" component={Home} />
// Home se carga solo cuando se navega a /
```

### 2. React Query Caching

```typescript
// Primera llamada: HTTP request
const { data } = trpc.trips.list.useQuery();

// Segunda llamada: datos en caché (sin HTTP request)
const { data } = trpc.trips.list.useQuery();
```

### 3. Memoización

```typescript
const MemoComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

### 4. Lazy Loading

```typescript
const Home = lazy(() => import('./pages/Home'));
```

---

## 🧪 Testing

### Estructura de Tests

```
src/
├── __tests__/
│   ├── components/
│   │   └── ProtectedRoute.test.tsx
│   ├── contexts/
│   │   └── AuthContext.test.tsx
│   └── lib/
│       └── sdk.test.ts
```

### Ejemplo de Test

```typescript
// __tests__/contexts/AuthContext.test.tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function TestComponent() {
  const { user } = useAuth();
  return <div>{user?.email}</div>;
}

test('AuthContext provides user', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  expect(screen.getByText('user@example.com')).toBeInTheDocument();
});
```

---

## 📦 Dependencias Principales

| Dependencia | Propósito |
|---|---|
| `react` | Framework UI |
| `react-dom` | Renderizado DOM |
| `wouter` | Routing ligero |
| `@tanstack/react-query` | Gestión de estado del servidor |
| `@trpc/client` | Cliente tRPC |
| `@trpc/react-query` | Integración tRPC + React Query |
| `zod` | Validación de esquemas |
| `tailwindcss` | Estilos CSS |
| `shadcn/ui` | Componentes UI |
| `sonner` | Notificaciones |
| `lucide-react` | Iconos |

---

## 🔧 Configuración

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🎨 Estilos

### Tailwind CSS

```typescript
// index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    /* ... más variables */
  }
}
```

### Componentes Personalizados

```typescript
// components/ui/button.tsx
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        variants({ variant, size }),
        className
      )}
      {...props}
    />
  )
);
```

---

## 🚀 Deployment

### Build

```bash
npm run build
```

Genera:
- `dist/index.html` - HTML principal
- `dist/assets/` - JS, CSS, imágenes

### Servir Estáticamente

```bash
# Vercel
vercel

# Netlify
netlify deploy --prod --dir=dist

# Servidor simple
python -m http.server --directory dist 8000
```

---

## 📚 Recursos

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Vite](https://vitejs.dev)

---

**¡Arquitectura clara y mantenible! 🏗️**
