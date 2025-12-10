# 🚀 Alas Latinas - Despliegue Local

## Estado Actual ✅

- **Backend (Express)**: Ejecutándose en `http://localhost:3001`
- **Frontend (Vue.js 3)**: Compilado y servido en `http://localhost:5000`
- **Conexión**: Backend y Frontend conectados y funcionales
- **Contract Tests**: 16/16 tests pasando ✅
- **Backend Tests**: 11/11 tests pasando ✅

---

## 📋 Requisitos Previos

- Node.js 16+ (verificar: `node --version`)
- npm 7+ (verificar: `npm --version`)
- Python 3 (para servir archivos estáticos)
- Cargo y Soroban CLI (para contratos)

---

## 🏃 Iniciar Proyecto Localmente

### 1. **Backend Express** (Puerto 3001)

```bash
# Terminal 1
cd /home/yael/soroban_users/frontend
node server/index.js
```

**Esperado:**
```
🚀 Servidor ejecutándose en puerto 3001
```

### 2. **Frontend Vue.js 3** (Puerto 5000)

```bash
# Terminal 2
cd /home/yael/soroban_users/frontend
python3 -m http.server 5000 --directory dist
```

**Esperado:**
```
Serving HTTP on 0.0.0.0 port 5000 (http://0.0.0.0:5000/) ...
```

---

## 🧪 Pruebas de Endpoints

### Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "securePass123",
    "phone": "555-1234",
    "birthDate": "1990-01-01",
    "gender": "Masculino"
  }'
```

**Respuesta exitosa:**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJ1c2VySWQiOiIxNzY0OTU3Njk5ODM4IiwiZW1haWwiOiJqdWFuQGV4YW1wbGUuY29tIn0=",
  "user": {
    "id": "1764957699838",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234",
    "birthDate": "1990-01-01",
    "gender": "Masculino"
  }
}
```

### Listar Destinos
```bash
curl http://localhost:3001/api/destinations | jq .
```

**Respuesta:** Array de destinos (Machu Picchu, Playas, Galápagos, Atacama, etc.)

### Health Check
```bash
curl http://localhost:3001/health
```

**Respuesta:**
```json
{"status":"OK"}
```

---

## 🌐 Acceder a la Interfaz

### URL del Frontend
```
http://localhost:5000
```

### Funcionalidades Disponibles

#### Home
- Página de bienvenida
- Información general del proyecto

#### Registro e Inicio de Sesión
- Formulario de registro (nombre, email, contraseña, teléfono, etc.)
- Formulario de login
- Tokens JWT almacenados en localStorage

#### Perfil de Usuario
- Ver datos personales
- Editar perfil
- Vinculación de Wallet Freighter (Soroban)
- Desconectarse

#### Destinos
- Listar todos los destinos disponibles
- Ver detalles de cada destino
- Rating y reviews

#### Reservas
- Crear reservas para destinos
- Ver historial de reservas
- Cancelar reservas

---

## 🔄 Flujo Completo de Prueba

1. **Abre el navegador** → `http://localhost:5000`
2. **Haz clic en "Registro"** → Rellena el formulario
3. **Se autenticará y guardará token** → Redirigirá a Home
4. **Ve a "Destinos"** → Verás lista de lugares turísticos
5. **Haz clic en un destino** → Verás detalles
6. **Ve a "Reservas"** → Crea una reserva
7. **Ve a "Perfil"** → Conecta tu wallet Freighter (opcional, requiere extension instalada)

---

## 🧪 Pruebas Automatizadas

### Tests del Contrato Smart (Soroban)
```bash
cd /home/yael/soroban_users
cargo test --release
```
**Resultado:** 16 tests pasando ✅

### Tests del Backend
```bash
cd /home/yael/soroban_users/frontend
npm test
```
**Resultado:** 11 tests pasando ✅

---

## 📡 Arquitectura

```
┌────────────────────┐
│   Frontend (Vue.js) │  http://localhost:5000
│  ├ Home            │
│  ├ Auth            │
│  ├ Destinations    │
│  └ Reservations    │
└────────┬───────────┘
         │
         │ API Calls (Axios)
         │
┌────────▼───────────────┐
│ Backend (Express.js)   │  http://localhost:3001
│  ├ /api/auth/         │
│  ├ /api/destinations/ │
│  └ /api/reservations/ │
└────────┬───────────────┘
         │
    In-Memory DB
```

---

## 🔐 Autenticación

- **Sistema:** JWT (JSON Web Tokens)
- **Almacenamiento:** localStorage (`authToken`)
- **Endpoints Protegidos:** GET /api/auth/profile, PUT /api/auth/profile, etc.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 📦 Variables de Entorno

Crear `.env` en `frontend/server/` si es necesario:

```env
PORT=3001
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Puerto 3001 ya está en uso
```bash
# Cambiar puerto en server/index.js
# O matar proceso:
lsof -i :3001
kill -9 <PID>
```

### Frontend no se carga
```bash
# Verificar que dist/ existe
ls frontend/dist/

# Reconstruir si no existe
cd frontend
npm run build
```

### API no responde
```bash
# Verificar que servidor está corriendo
curl http://localhost:3001/health

# Revisar logs de Express en la terminal
```

---

## 📚 Documentación Adicional

- **Contrato Soroban:** Ver `src/lib.rs`
- **Rutas Backend:** Ver `frontend/server/routes/`
- **Componentes Frontend:** Ver `frontend/src/components/`
- **Estado (Pinia):** Ver `frontend/src/stores/`

---

## ✅ Checklist de Verificación

- [ ] Backend responde en http://localhost:3001/health
- [ ] Frontend carga en http://localhost:5000
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Perfil se actualiza
- [ ] Listar destinos funciona
- [ ] Crear reserva funciona
- [ ] Tests del contrato pasan
- [ ] Tests del backend pasan

---

**¡Proyecto listo para desarrollo local!** 🎉
