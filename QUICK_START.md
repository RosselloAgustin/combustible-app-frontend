# ⚡ Inicio Rápido - Calculadora Corsa Frontend

Guía de 5 minutos para empezar a usar el frontend.

## 1️⃣ Clonar y Instalar

```bash
# Clonar el repositorio
git clone https://github.com/RosselloAgustin/CombustibleApp.git
cd CombustibleApp/frontend-standalone

# Instalar dependencias
npm install
```

## 2️⃣ Configurar Backend

### Opción A: Usar Backend Existente

Si tienes un backend tRPC corriendo en `http://localhost:3000`:

```bash
# Crear .env.local
echo "VITE_FRONTEND_FORGE_API_URL=http://localhost:3000" > .env.local
```

### Opción B: Usar Backend de Producción

```bash
# Crear .env.local
echo "VITE_FRONTEND_FORGE_API_URL=https://calculadora-corsa-crb9a7dp3-rosselloagustins-projects.vercel.app" > .env.local
```

### Opción C: Crear tu Backend

Ver [BACKEND_SETUP.md](./BACKEND_SETUP.md) para instrucciones.

## 3️⃣ Iniciar Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## 4️⃣ Registrarse y Probar

1. Haz clic en "¿No tienes cuenta? Regístrate"
2. Completa el formulario
3. Inicia sesión
4. ¡Comienza a usar la aplicación!

## 5️⃣ Build para Producción

```bash
npm run build
npm run preview
```

---

## 📋 Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env.local` configurado
- [ ] Backend corriendo o accesible
- [ ] `npm run dev` ejecutándose
- [ ] Navegador abierto en `http://localhost:5173`

---

## 🚀 Próximos Pasos

1. **Personalizar la Interfaz**
   - Edita `src/pages/Home.tsx` para cambiar el dashboard
   - Edita `src/pages/Login.tsx` para cambiar el formulario

2. **Agregar Funcionalidades**
   - Crea nuevos componentes en `src/components/`
   - Crea nuevas páginas en `src/pages/`
   - Actualiza las rutas en `src/App.tsx`

3. **Conectar a tu Backend**
   - Asegúrate de que tu backend tiene los endpoints tRPC correctos
   - Actualiza `VITE_FRONTEND_FORGE_API_URL` en `.env.local`

4. **Deployar**
   - `npm run build` para compilar
   - Sube la carpeta `dist/` a tu servidor

---

## ❓ Problemas Comunes

### Error: "Cannot connect to backend"

**Solución:** Verifica que:
- El backend está corriendo
- `VITE_FRONTEND_FORGE_API_URL` es correcto
- No hay problemas de CORS

### Error: "Module not found"

**Solución:** Ejecuta `npm install` nuevamente

### La aplicación se recarga infinitamente

**Solución:** Abre la consola (F12) y busca errores. Probablemente el backend no está respondiendo.

---

## 📚 Documentación Completa

Ver [README.md](./README.md) para documentación completa.

---

**¡Listo para empezar! 🚀**
