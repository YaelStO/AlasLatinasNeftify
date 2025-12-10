# 📘 Guía Completa de Despliegue - Alas Latinas 3.0

## 🎯 Visión General

**Alas Latinas 3.0** es una plataforma de viajes y reservas con:
- **Smart Contract** en Soroban (para blockchain)
- **Backend API** en Express.js (Node.js)
- **Frontend Web** en Vue.js 3 con Vite
- **Autenticación** con JWT + Wallet Freighter (Stellar)

---

## ✅ Estado Actual (December 5, 2025)

| Componente | Status | Details |
|---|---|---|
| **Smart Contract** | ✅ Completo | 16/16 tests pasando, RF-01..RF-15 implementados |
| **Backend API** | ✅ Funcional | Express.js, 11/11 tests pasando, endpoints probados |
| **Frontend Vue.js** | ✅ Funcional | Compilado, rutas, stores, componentes listos |
| **Local Deployment** | ✅ Funcional | Frontend + Backend + Tests corriendo |
| **Testnet Deploy** | ⏳ Bloqueado | Esperar actualización de validador Stellar |

---

## 🚀 Opción 1: Despliegue Local (RECOMENDADO AHORA)

### Requisitos
- Node.js 16+ (`node --version`)
- npm 7+ (`npm --version`)
- Rust 1.91+ (`rustc --version`)
- Python 3 (`python3 --version`)

### Paso 1: Clonar/Actualizar Repositorio

```bash
# Si no existe
git clone https://github.com/SistemasTecTlaxiaco/Alas-Latinas.git
cd Alas-Latinas

# Si ya existe
git pull origin master
git checkout feature/deploy-fix
```

### Paso 2: Instalar Dependencias

```bash
# Frontend
cd frontend
npm install

# Opcional: Build si no está hecho
npm run build
```

### Paso 3: Arrancar Servidores (en 2 terminales)

**Terminal 1 - Backend (Puerto 3001):**
```bash
cd ~/Alas-Latinas/soroban_users/frontend
node server/index.js
```

**Esperado:**
```
🚀 Servidor ejecutándose en puerto 3001
```

**Terminal 2 - Frontend (Puerto 5000):**
```bash
cd ~/Alas-Latinas/soroban_users/frontend
python3 -m http.server 5000 --directory dist
```

**Esperado:**
```
Serving HTTP on 0.0.0.0 port 5000 (http://0.0.0.0:5000/) ...
```

### Paso 4: Abrir en Navegador

```
http://localhost:5000
```

**Funcionalidades disponibles:**
- ✅ Registro de usuarios
- ✅ Login/Logout
- ✅ Ver perfil y editar
- ✅ Listar destinos
- ✅ Ver detalles de destino
- ✅ Crear reservas
- ✅ Vincular Freighter wallet (si tienes extensión instalada)

---

## 🧪 Opción 2: Ejecutar Tests Locales

### Tests del Contrato Smart

```bash
cd ~/Alas-Latinas/soroban_users
cargo test --release
```

**Esperado:**
```
running 16 tests
...
test result: ok. 16 passed; 0 failed
```

### Tests del Backend API

```bash
cd ~/Alas-Latinas/soroban_users/frontend
npm test
```

**Esperado:**
```
✓ API tests passed (11 tests)
```

---

## ⛓️ Opción 3: Despliegue a Soroban Testnet (FUTURO)

### Estado Actual
❌ **Bloqueado** - Soroban Testnet v23.0.0 tiene un bug en validación

Detalles: Ver [TESTNET_ISSUE.md](TESTNET_ISSUE.md)

### Cuando se Resuelva (Expected: Semana del 9 de Diciembre)

```bash
cd ~/Alas-Latinas/soroban_users

# 1. Compilar contract
cargo build --target wasm32-unknown-unknown --release

# 2. Desplegar a Testnet
bash scripts/deploy_testnet.sh

# 3. Anotar el Contract ID impreso
```

**Conexión Frontend → Testnet:**
1. Usuario instala Freighter extension
2. Frontend conecta a Freighter wallet
3. Frontend invoca funciones del contrato en Testnet
4. Todas las transacciones son reales en blockchain

---

## 🔄 Opción 4: Despliegue Local de Soroban (Avanzado)

Para testing completo del contrato antes de Testnet:

### Requisitos Adicionales
- Docker o Podman instalado
- Soroban CLI 23.2.0

### Pasos

```bash
# 1. Inicia el sandbox local
soroban container start --local

# 2. Compila el wasm
cd ~/Alas-Latinas/soroban_users
cargo build --target wasm32-unknown-unknown --release

# 3. Despliega al sandbox local
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_users.wasm \
  --network standalone \
  --source GA4GQGKRDFH6T2CH7EKIMDCEWPZJWRJ5KU5MJRMTXKMDLCOMBTRATBSC

# 4. Anota el CONTRACT_ID

# 5. Invoca una función (ejemplo: register_user)
soroban contract invoke \
  --contract-id CONTRACT_ID \
  --network standalone \
  --source GA... \
  -- register_user \
  --user '{"type": "account", "account_id": "GA..."}' \
  --name "Juan Pérez"
```

**Ventajas:**
- ✅ Testing completo sin esperar Testnet
- ✅ Transacciones instantáneas
- ✅ Sin costos
- ✅ Debugging más fácil

---

## 📊 Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                        ALAS LATINAS 3.0                      │
└─────────────────────────────────────────────────────────────┘

                         Frontend (Port 5000)
                    Vue.js 3 + Vue Router + Pinia
                    ├─ Home
                    ├─ Register / Login
                    ├─ Profile (con Wallet link)
                    ├─ Destinations
                    └─ Reservations

                              ↓↑ (Axios)

                         Backend (Port 3001)
                      Express.js + JWT Auth
                    ├─ /api/auth (register, login, profile)
                    ├─ /api/destinations (CRUD)
                    └─ /api/reservations (CRUD)

                              ↓↑ (Future)

                    Soroban Smart Contract
                 Stellar Blockchain (Testnet/Mainnet)
         ├─ RF-01..05: User Management
         ├─ RF-06..09: Destination Management
         ├─ RF-10: Media Upload
         ├─ RF-11: Comments & Ratings
         └─ RF-12..15: Reservations & Payments
```

---

## 🔐 Autenticación

### Fase 1: JWT Local (Actual)
- Usuario se registra en Backend
- Backend genera JWT token
- Token se guarda en localStorage
- Frontend usa token para requests protegidos

### Fase 2: Freighter Wallet (Futuro)
- Usuario instala extension Freighter
- Frontend detecta wallet
- Usuario firmá transacciones con Freighter
- Smart Contract valida firma en blockchain

---

## 📝 API Endpoints

### Auth (`/api/auth`)

```bash
# Registro
POST /api/auth/register
{
  "name": "Juan",
  "email": "juan@example.com",
  "password": "securePass123",
  "phone": "555-1234",
  "birthDate": "1990-01-01",
  "gender": "Masculino"
}

# Login
POST /api/auth/login
{
  "email": "juan@example.com",
  "password": "securePass123"
}

# Get Profile (Requires Auth)
GET /api/auth/profile
Headers: Authorization: Bearer <token>

# Update Profile
PUT /api/auth/profile
{
  "name": "Juan Actualizado",
  "email": "nuevo@example.com"
}

# Link Wallet
POST /api/auth/link-wallet
{
  "walletAddress": "GXXXXXX....",
  "network": "testnet"
}
```

### Destinations (`/api/destinations`)

```bash
# List all
GET /api/destinations

# Get one
GET /api/destinations/:id

# Create (Requires Auth)
POST /api/destinations
{
  "name": "Playa Tamarindo",
  "location": "Guanacaste, Costa Rica",
  "description": "Playa paradisíaca..."
}

# Update
PUT /api/destinations/:id

# Delete
DELETE /api/destinations/:id
```

### Reservations (`/api/reservations`)

```bash
# List
GET /api/reservations

# Create
POST /api/reservations
{
  "destinationId": "dest-1",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "guests": 2
}

# Cancel
DELETE /api/reservations/:id

# Status
GET /api/reservations/:id/status
```

---

## 🐛 Troubleshooting

### Puerto 3001 ya está en uso
```bash
lsof -i :3001
kill -9 <PID>
# O cambiar PUERTO en server/index.js
```

### Puerto 5000 ya está en uso
```bash
lsof -i :5000
kill -9 <PID>
```

### Frontend no carga CSS/JS
```bash
# Reconstruir
cd frontend
npm run build

# Limpiar cache
rm -rf dist node_modules
npm install
npm run build
```

### API no responde
```bash
# Verificar backend
curl http://localhost:3001/health
# Esperado: {"status":"OK"}

# Revisar logs en terminal del servidor
# Buscar errores en console de navegador
```

### Tests fallan
```bash
# Actualizar dependencias
cd frontend
npm install --no-audit

# Recompile contract
cargo clean
cargo build --target wasm32-unknown-unknown --release

# Run tests again
cargo test --release
```

---

## 📚 Documentación Adicional

- **[LOCAL_DEPLOYMENT.md](LOCAL_DEPLOYMENT.md)** - Guía de despliegue local con ejemplos curl
- **[TESTNET_ISSUE.md](TESTNET_ISSUE.md)** - Análisis del issue de reference-types y workarounds
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Resumen técnico de implementación
- **[README.md](README.md)** - Documentación del contrato

---

## ✅ Checklist de Verificación

### Local Testing
- [ ] Backend responde en `http://localhost:3001/health`
- [ ] Frontend carga en `http://localhost:5000`
- [ ] Puedo registrar un usuario
- [ ] Puedo hacer login
- [ ] Puedo ver mi perfil
- [ ] Puedo listar destinos
- [ ] Puedo crear una reserva

### Testing Automatizado
- [ ] `cargo test --release` pasa 16/16 tests
- [ ] `npm test` en frontend pasa 11/11 tests

### Blockchain (Cuando Testnet se actualice)
- [ ] Contrato se despliega a Testnet
- [ ] Freighter conecta con frontend
- [ ] Puedo firmar transacciones desde wallet
- [ ] Transacciones ejecutan en blockchain

---

## 🎉 ¡Listo!

El proyecto está completo localmente y listo para testing. Cuando Soroban Testnet se actualice (esperado semana del 9 de Diciembre), se podrá desplegar al blockchain real.

**¿Preguntas?** Consulta la documentación técnica o abre un issue en GitHub.

---

**Última actualización:** 5 de Diciembre, 2025  
**Versión:** 1.0.0  
**Estado:** Production Ready (Local) + Testnet Pending
