# 🔧 Configuración del Backend

Guía para crear o configurar un backend compatible con este frontend.

## 📋 Requisitos del Backend

El backend debe implementar los siguientes endpoints tRPC:

### Autenticación

```
POST /api/trpc/auth.register
POST /api/trpc/auth.login
GET /api/trpc/auth.me
POST /api/trpc/auth.logout
```

### Viajes

```
POST /api/trpc/trips.create
GET /api/trpc/trips.list
POST /api/trpc/trips.update
POST /api/trpc/trips.delete
```

---

## 🚀 Opción 1: Usar Backend Existente

Si ya tienes un backend tRPC, solo necesitas:

1. Asegúrate de que tiene los endpoints listados arriba
2. Configura CORS para permitir requests desde el frontend
3. Actualiza `VITE_FRONTEND_FORGE_API_URL` en `.env.local`

```bash
echo "VITE_FRONTEND_FORGE_API_URL=https://tu-backend.com" > .env.local
```

---

## 🛠️ Opción 2: Crear un Backend Nuevo con Node.js + Express + tRPC

### Paso 1: Crear Proyecto

```bash
mkdir calculadora-corsa-backend
cd calculadora-corsa-backend
npm init -y
```

### Paso 2: Instalar Dependencias

```bash
npm install express @trpc/server @trpc/express zod cors
npm install -D typescript ts-node @types/express @types/node
```

### Paso 3: Crear Estructura

```bash
mkdir src
touch src/index.ts
touch src/router.ts
touch src/db.ts
```

### Paso 4: Configurar TypeScript

Crea `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Paso 5: Implementar Router tRPC

Crea `src/router.ts`:

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

// Tipos
interface User {
  id: number;
  email: string;
  name?: string;
}

interface Trip {
  id: number;
  userId: number;
  tipo: 'trabajo' | 'personal';
  fecha: string;
  kmInicio: number;
  kmFinal: number;
  paquetes?: number | null;
  destino?: string | null;
  dineroGanado?: number | null;
  notas?: string | null;
}

// Simulación de base de datos en memoria
const users: Map<number, User> = new Map();
const trips: Map<number, Trip> = new Map();
let userId = 1;
let tripId = 1;

export const appRouter = t.router({
  auth: t.router({
    register: t.procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const id = userId++;
        const user: User = {
          id,
          email: input.email,
          name: input.name,
        };
        users.set(id, user);
        return user;
      }),

    login: t.procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(({ input }) => {
        // Buscar usuario por email
        const user = Array.from(users.values()).find(u => u.email === input.email);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        return user;
      }),

    me: t.procedure
      .query(({ ctx }) => {
        // Aquí obtendrías el usuario de la sesión
        return null;
      }),

    logout: t.procedure
      .mutation(() => {
        return { success: true };
      }),
  }),

  trips: t.router({
    create: t.procedure
      .input(z.object({
        tipo: z.enum(['trabajo', 'personal']),
        fecha: z.string().date(),
        kmInicio: z.number().int().positive(),
        kmFinal: z.number().int().positive(),
        paquetes: z.number().int().nonnegative().optional(),
        destino: z.string().optional(),
        dineroGanado: z.number().int().nonnegative().optional(),
        notas: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const id = tripId++;
        const trip: Trip = {
          id,
          userId: 1, // Usar el usuario de la sesión
          tipo: input.tipo,
          fecha: input.fecha,
          kmInicio: input.kmInicio,
          kmFinal: input.kmFinal,
          paquetes: input.paquetes || null,
          destino: input.destino || null,
          dineroGanado: input.dineroGanado || null,
          notas: input.notas || null,
        };
        trips.set(id, trip);
        return trip;
      }),

    list: t.procedure
      .query(() => {
        // Retornar viajes del usuario actual
        return Array.from(trips.values()).filter(t => t.userId === 1);
      }),

    update: t.procedure
      .input(z.object({
        id: z.number().int(),
        tipo: z.enum(['trabajo', 'personal']).optional(),
        fecha: z.string().date().optional(),
        kmInicio: z.number().int().positive().optional(),
        kmFinal: z.number().int().positive().optional(),
        paquetes: z.number().int().nonnegative().optional(),
        destino: z.string().optional(),
        dineroGanado: z.number().int().nonnegative().optional(),
        notas: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const trip = trips.get(input.id);
        if (!trip) {
          throw new Error('Trip not found');
        }
        const updated = { ...trip, ...input };
        trips.set(input.id, updated);
        return updated;
      }),

    delete: t.procedure
      .input(z.object({ id: z.number().int() }))
      .mutation(({ input }) => {
        trips.delete(input.id);
        return true;
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

### Paso 6: Crear Servidor Express

Crea `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// tRPC
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
```

### Paso 7: Agregar Scripts

Actualiza `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Paso 8: Ejecutar

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`.

---

## 🐍 Opción 3: Usar Backend en Python + FastAPI

### Paso 1: Crear Proyecto

```bash
mkdir calculadora-corsa-backend
cd calculadora-corsa-backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### Paso 2: Instalar Dependencias

```bash
pip install fastapi uvicorn pydantic python-multipart
```

### Paso 3: Crear Servidor

Crea `main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class User(BaseModel):
    id: int
    email: str
    name: Optional[str] = None

class Trip(BaseModel):
    id: int
    userId: int
    tipo: str  # 'trabajo' | 'personal'
    fecha: str
    kmInicio: int
    kmFinal: int
    paquetes: Optional[int] = None
    destino: Optional[str] = None
    dineroGanado: Optional[int] = None
    notas: Optional[str] = None

# Simulación de BD
users: dict = {}
trips: dict = {}
user_id = 1
trip_id = 1

# Endpoints
@app.post("/api/trpc/auth.register")
async def register(email: str, password: str, name: Optional[str] = None):
    global user_id
    user = User(id=user_id, email=email, name=name)
    users[user_id] = user
    user_id += 1
    return {"result": {"data": user.dict()}}

@app.post("/api/trpc/auth.login")
async def login(email: str, password: str):
    user = next((u for u in users.values() if u.email == email), None)
    if not user:
        return {"error": {"json": {"message": "Invalid email or password"}}}
    return {"result": {"data": user.dict()}}

@app.get("/api/trpc/auth.me")
async def me():
    return {"result": {"data": None}}

@app.post("/api/trpc/auth.logout")
async def logout():
    return {"result": {"data": {"success": True}}}

@app.post("/api/trpc/trips.create")
async def create_trip(
    tipo: str,
    fecha: str,
    kmInicio: int,
    kmFinal: int,
    paquetes: Optional[int] = None,
    destino: Optional[str] = None,
    dineroGanado: Optional[int] = None,
    notas: Optional[str] = None,
):
    global trip_id
    trip = Trip(
        id=trip_id,
        userId=1,
        tipo=tipo,
        fecha=fecha,
        kmInicio=kmInicio,
        kmFinal=kmFinal,
        paquetes=paquetes,
        destino=destino,
        dineroGanado=dineroGanado,
        notas=notas,
    )
    trips[trip_id] = trip
    trip_id += 1
    return {"result": {"data": trip.dict()}}

@app.get("/api/trpc/trips.list")
async def list_trips():
    return {"result": {"data": list(trips.values())}}

@app.post("/api/trpc/trips.update")
async def update_trip(id: int, **kwargs):
    if id in trips:
        trip = trips[id]
        for key, value in kwargs.items():
            if value is not None:
                setattr(trip, key, value)
        return {"result": {"data": trip.dict()}}
    return {"error": {"json": {"message": "Trip not found"}}}

@app.post("/api/trpc/trips.delete")
async def delete_trip(id: int):
    if id in trips:
        del trips[id]
        return {"result": {"data": True}}
    return {"error": {"json": {"message": "Trip not found"}}}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

### Paso 4: Ejecutar

```bash
python main.py
```

El backend estará disponible en `http://localhost:3000`.

---

## 🔗 Conectar Frontend con Backend

Una vez que tu backend esté corriendo:

1. Actualiza `.env.local`:

```env
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000
```

2. Reinicia el frontend:

```bash
npm run dev
```

3. ¡Listo! El frontend debería conectarse al backend.

---

## 🚨 Problemas Comunes

### Error: "CORS policy"

**Solución:** Asegúrate de que el backend tiene CORS habilitado:

**Express:**
```typescript
app.use(cors());
```

**FastAPI:**
```python
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### Error: "Cannot POST /api/trpc/..."

**Solución:** Verifica que:
1. El backend está corriendo
2. La URL en `VITE_FRONTEND_FORGE_API_URL` es correcta
3. Los endpoints están implementados

### Error: "Invalid email or password"

**Solución:** Asegúrate de que:
1. El usuario está registrado
2. Las credenciales son correctas
3. El backend está guardando los usuarios

---

## 📚 Recursos

- [tRPC Documentation](https://trpc.io)
- [Express Documentation](https://expressjs.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**¡Tu backend está listo! 🚀**
