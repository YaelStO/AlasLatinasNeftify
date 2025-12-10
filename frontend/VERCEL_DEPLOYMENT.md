# Guía de Deployment en Vercel

## Pasos para desplegar en Vercel

### 1. Crear proyecto en Vercel
```bash
# Opción A: Desde GitHub (RECOMENDADO)
- Ve a https://vercel.com
- Click "Add New" → "Project"
- Conecta tu repo AlasLatinasNeftify
- Selecciona rama: main
- Click "Deploy"

# Opción B: Desde CLI
vercel --prod
```

### 2. Configurar Variables de Entorno

**IMPORTANTE: Sin esto, auth no funcionará**

1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en "Settings"
3. En el menú izquierdo, selecciona "Environment Variables"
4. Agrega estas variables:

```
NAME: JWT_SECRET
VALUE: [genera-un-valor-secreto-fuerte]
ENVIRONMENTS: Production, Preview, Development
```

**Ejemplo de valor seguro:**
```
JWT_SECRET=aZvK8mP2qL9nX7bY5cD6eF4gH3iJ1kL0wQ9rT8sU7vW6xY5zA4bC3dE2fG1hI0
```

### 3. Redeploy después de agregar env vars

Después de agregar JWT_SECRET:
1. Ve a "Deployments"
2. Haz clic en los 3 puntos del deployment más reciente
3. Selecciona "Redeploy"

## Estructura esperada en Vercel

```
soroban_users/
└── frontend/
    ├── vercel.json              ← Config detectada automáticamente
    ├── api/
    │   └── auth/
    │       ├── register.js      ← Función serverless
    │       ├── login.js         ← Función serverless
    │       └── store.js         ← Datos compartidos
    ├── dist/                    ← Frontend compilado
    ├── src/
    └── package.json
```

## Testing después del deploy

```bash
# Registrar un usuario
curl -X POST https://tu-proyecto.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "555-1234",
    "birthDate": "1990-01-01",
    "gender": "Male"
  }'

# Login
curl -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Solucionar problemas

### Error: "JWT_SECRET is not defined"
- Verifica que agregaste la variable de entorno en Vercel Dashboard
- Haz redeploy después de agregar la variable
- Espera 2-3 minutos para que se propague

### Error: CORS
- Las funciones incluyen headers CORS
- Si aún tienes problemas, verifica browser console
- Los headers están configurados para aceptar requests desde cualquier origen

### Error: Storage (datos no persisten)
- Actualmente usa almacenamiento en memoria
- Los datos se pierden en cada redeploy
- Para producción, migra a una base de datos real:
  - MongoDB Atlas
  - PostgreSQL (Vercel Postgres)
  - MySQL
  - Vercel KV (Redis)

## Migración a Base de Datos

Actualiza `frontend/api/auth/store.js` para conectar a una BD real:

```javascript
// Ejemplo con MongoDB
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function readData() {
  const db = client.db('app')
  return await db.collection('data').findOne({ _id: 'app-data' })
}

export async function writeData(data) {
  const db = client.db('app')
  return await db.collection('data').updateOne(
    { _id: 'app-data' },
    { $set: data },
    { upsert: true }
  )
}
```

## Links útiles

- Vercel Dashboard: https://vercel.com
- Documentación Vercel Serverless: https://vercel.com/docs/functions
- JWT.io: https://jwt.io
