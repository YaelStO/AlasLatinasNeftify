# VERCEL DEPLOYMENT GUIDE - Destinos Fix

## El Problema

Los destinos no se mostraban en el despliegue de Vercel porque el backend Express server (`server/index.js`) no estaba siendo ejecutado. Vercel requiere funciones serverless para manejar las requests a `/api`.

## La Solución

Se han creado funciones serverless de Vercel en la carpeta `api/`:

- **`api/destinations.js`** - Maneja GET, POST, PUT, DELETE para destinos
- **`api/auth.js`** - Maneja login, register y obtener usuario actual
- **`api/reservations.js`** - Maneja reservaciones del usuario
- **`api/payments.js`** - Maneja procesamiento de pagos
- **`api/init-db.js`** - Script para inicializar la base de datos con destinos

## Configuración Requerida en Vercel

### 1. Variables de Entorno

Debes configurar las variables de entorno en Vercel Dashboard:

```
JWT_SECRET = tu_clave_secreta_aqui
VITE_API_URL = /api
```

**Pasos:**
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `AlasLatinasNeftify`
3. Settings → Environment Variables
4. Agrega las variables arriba

### 2. Database Persistence

La base de datos se almacena en `frontend/server/data/db.json`. 

**Nota Importante:** Vercel tiene un filesystem efímero. Para persistencia de datos a largo plazo, considera:

- **Opción 1 (Recomendado):** Usar una base de datos real (MongoDB, PostgreSQL, etc.)
- **Opción 2:** Usar Vercel KV (Redis) para caché
- **Opción 3:** Los destinos iniciales se cargan automáticamente con cada build

## Cambios Realizados

### 1. Nuevas Funciones Serverless

```
frontend/
├── api/
│   ├── destinations.js     (GET/POST/PUT/DELETE destinos)
│   ├── auth.js             (Login, Register, Get User)
│   ├── reservations.js     (CRUD reservaciones)
│   ├── payments.js         (Procesar pagos)
│   └── init-db.js          (Inicializar DB con datos)
```

### 2. Actualizado `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}
```

### 3. Actualizado `package.json`

El comando build ahora inicializa la base de datos:

```json
"build": "node api/init-db.js && vite build"
```

## Flujo de Requests

```
Frontend (Vue.js)
    ↓
axios.get('/api/destinations')
    ↓
Vercel Router
    ↓
api/destinations.js (Serverless Function)
    ↓
Lee/Escribe en frontend/server/data/db.json
    ↓
Retorna JSON al Frontend
```

## Testing Local

Para probar localmente antes de desplegar:

```bash
cd frontend

# Instalar dependencias
npm install

# Construir el proyecto (esto crea la DB)
npm run build

# Ejecutar el servidor de desarrollo
npm run dev
```

Verifica que los destinos aparezcan en: http://localhost:3000/destinations

## Troubleshooting

### Los destinos siguen no apareciendo

1. **Verifica los logs de Vercel:**
   - Dashboard → Deployments → View Function Logs

2. **Verifica que JWT_SECRET esté configurado:**
   ```bash
   # En Vercel Dashboard → Settings → Environment Variables
   ```

3. **Verifica que la base de datos se inicialice:**
   - El build automáticamente ejecuta `api/init-db.js`
   - Debería crear `frontend/server/data/db.json`

4. **Verifica la respuesta de la API:**
   ```bash
   curl https://tu-app.vercel.app/api/destinations
   ```
   Debería retornar un array con los destinos

### Error 500 en requests de API

- Revisa los Function Logs en Vercel
- Verifica que `JWT_SECRET` esté configurado en variables de entorno
- Verifica permisos de lectura/escritura en la carpeta `/api`

## Próximos Pasos (Recomendado)

1. **Usar una Base de Datos Real:**
   - MongoDB Atlas (Free tier disponible)
   - PostgreSQL en Railway, Render, o Supabase
   - DynamoDB en AWS

2. **Ejemplo con MongoDB:**
   
   ```javascript
   // api/destinations.js
   import { MongoClient } from 'mongodb'
   
   const client = new MongoClient(process.env.MONGODB_URI)
   
   export default async function handler(req, res) {
     try {
       await client.connect()
       const db = client.db('alas_latinas')
       const destinations = await db.collection('destinations').find({}).toArray()
       res.json(destinations)
     } finally {
       await client.close()
     }
   }
   ```

## Recordatorio

Si agregas variables de entorno en Vercel, el proyecto se redesplegará automáticamente. No es necesario hacer push nuevamente.

---

**Última actualización:** Diciembre 2025
