# 🏖️ Alas Latinas 3.0 - Aplicación Completa

Aplicación de viajes y reservas con contrato Soroban, frontend Vue.js y backend Node.js/Express.

## 📋 Requisitos

- Node.js v24.11.1 o superior
- npm v11.6.2 o superior
- Rust 1.91.1 + soroban-cli v23.2.0 (para el contrato)
- VSCode con extensión Freighter instalada (para wallet)

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/SistemasTecTlaxiaco/repo-con-acta-y-tablero-kanban-eqipo-aayk.git
cd soroban_users
```

### 2. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
cd ..
```

### 3. Arrancar Backend y Frontend

**Terminal 1 - Backend (Express):**
```bash
cd frontend
node server/index.js
# ✓ Servidor ejecutándose en puerto 3001
```

**Terminal 2 - Frontend (Vite):**
```bash
cd frontend
npm run dev
# ✓ Vite listo en http://localhost:3000
```

### 4. Abrir la Aplicación

Abre tu navegador en: **http://localhost:3000**

O desde WSL2 (acceso desde Windows): **http://192.168.150.199:3000**

## 🔐 Flujo de Uso

### Registro de Usuario

1. Ve a `/register`
2. Completa el formulario:
   - Nombre Completo
   - Email
   - Contraseña (8+ caracteres)
   - Teléfono
   - Fecha de Nacimiento
   - Género
3. Haz clic en "Crear Cuenta"
4. Automáticamente serás redirigido a la página de inicio

### Conectar Wallet (Freighter)

1. Instala Freighter desde https://www.freighter.app
2. Crea una cuenta de Testnet en Freighter
3. Obtén fondos usando Friendbot: https://friendbot.stellar.org
4. Ve a tu perfil (`/profile`)
5. Haz clic en "Conectar Freighter Wallet"
6. Autoriza el acceso en Freighter
7. Vincular wallet a tu perfil

### Explorar Destinos

1. Ve a `/destinations`
2. Busca destinos con el campo de búsqueda
3. Haz clic en un destino para ver detalles
4. Haz clic en "Reservar Ahora"

### Hacer una Reserva

1. En la página de destino, haz clic en "Reservar Ahora"
2. Selecciona fechas de entrada y salida
3. Especifica el precio total
4. Haz clic en "Crear Reserva"

### Pagar Reserva

1. Ve a `/reservations`
2. Selecciona una reserva con estado "Pendiente"
3. Ingresa datos de tarjeta:
   - Número: 16 dígitos (ej: 1234567890123456)
   - Vencimiento: MM/YY
   - CVV: 3 dígitos
4. Haz clic en "Pagar"
5. El pago se procesará (simulado)

## 📁 Estructura del Proyecto

```
soroban_users/
├── frontend/                    # Aplicación Vue.js + Backend Express
│   ├── src/
│   │   ├── views/              # Páginas (Register, Login, Profile, etc.)
│   │   ├── stores/             # Pinia state management
│   │   ├── components/         # Componentes reutilizables
│   │   ├── utils/              # Utilidades (axios, config)
│   │   └── App.vue             # Layout principal
│   ├── server/
│   │   ├── index.js            # Express server
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Autenticación JWT
│   │   └── utils/              # Database mock
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── src/
│   └── lib.rs                  # Contrato Soroban (RF-01..RF-15)
├── scripts/
│   ├── deploy_testnet.sh       # Deploy contract to testnet
│   └── invoke_testnet.sh       # Invoke contract functions
├── Cargo.toml                  # Rust configuration
└── README.md
```

## 🔗 Endpoints de la API

### Autenticación
- **POST** `/api/auth/register` — Crear cuenta
- **POST** `/api/auth/login` — Iniciar sesión
- **GET** `/api/auth/profile` — Obtener perfil (requiere token)
- **PUT** `/api/auth/profile` — Actualizar perfil (requiere token)
- **POST** `/api/auth/link-wallet` — Vincular wallet (requiere token)
- **DELETE** `/api/auth/profile` — Eliminar usuario (requiere token)

### Destinos
- **GET** `/api/destinations` — Listar todos
- **GET** `/api/destinations/:id` — Obtener detalle
- **GET** `/api/destinations?search=nombre` — Buscar
- **POST** `/api/destinations` — Crear (requiere token)
- **PUT** `/api/destinations/:id` — Actualizar (requiere token)
- **DELETE** `/api/destinations/:id` — Eliminar (requiere token)
- **POST** `/api/destinations/:id/comments` — Agregar comentario (requiere token)

### Reservas
- **GET** `/api/reservations` — Listar mis reservas (requiere token)
- **GET** `/api/reservations/:id` — Obtener detalle (requiere token)
- **POST** `/api/reservations` — Crear reserva (requiere token)
- **GET** `/api/reservations/:id/status` — Estado de reserva (requiere token)
- **POST** `/api/reservations/:id/pay` — Procesar pago (requiere token)
- **POST** `/api/reservations/:id/cancel` — Cancelar reserva (requiere token)

## 🔑 Autenticación

Todos los endpoints protegidos requieren:
```
Authorization: Bearer <token>
```

El token se obtiene al registrarse o hacer login.

**Ejemplo:**
```bash
curl -H "Authorization: Bearer eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0=" \
  http://localhost:3001/api/auth/profile
```

## 💾 Base de Datos

**Actualmente:** Base de datos en memoria (datos se pierden al reiniciar)

**Para producción, usar:**
- PostgreSQL
- MongoDB
- Firebase Firestore

## 🧪 Testing

### Backend - Tests de API

```bash
# Con curl
curl http://localhost:3001/health
# {"status":"OK"}

# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass1234","phone":"+555","birthDate":"1990-01-01","gender":"other"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass1234"}'
```

### Frontend - Tests de UI

1. Abre http://localhost:3000
2. Prueba el flujo completo:
   - Registro (`/register`)
   - Login (`/login`)
   - Ver perfil (`/profile`)
   - Explorar destinos (`/destinations`)
   - Crear reserva
   - Ver reservas (`/reservations`)

## ⚠️ Notas Importantes

### Contrato Soroban
- El despliegue en testnet está bloqueado por un problema de versión del SDK
- El contrato está compilado y todos los tests pasan (16/16 ✓)
- Funciona perfectamente para pruebas locales
- Ver `IMPLEMENTATION_SUMMARY.md` para detalles técnicos

### Freighter Wallet
- Requiere instalación desde https://www.freighter.app
- Usa la red **Testnet** de Stellar
- Obtén fondos de prueba en https://friendbot.stellar.org
- Las transacciones reales se procesarían usando Soroban una vez desplegado

### Frontend
- Proxy configurado: `/api/*` → `http://localhost:3001`
- Token guardado en localStorage
- Usa Pinia para state management
- Vue Router con guards de autenticación

## 🐛 Solución de Problemas

### Puerto 3000/3001 en uso
```bash
# Encontrar proceso
lsof -i :3000
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### Frontend no se conecta al backend
- Verifica que backend esté corriendo: `curl http://localhost:3001/health`
- Verifica proxy en `vite.config.js`
- Revisa console del navegador (F12) para errores

### Freighter no se conecta
- Instala desde https://www.freighter.app
- Desbloquea Freighter
- Recarga la página
- Ver `FREIGHTER_GUIDE.md` para más detalles

## 📚 Documentación Adicional

- **IMPLEMENTATION_SUMMARY.md** — Detalles técnicos del contrato
- **FREIGHTER_GUIDE.md** — Guía completa de Freighter Wallet
- **SERVER_README.md** — Documentación del backend Express
- **frontend/SERVER_README.md** — Más detalles de la API

## 👥 Contacto

Sistema de viajes y reservas - Alas Latinas 3.0
Proyecto académico

## 📄 Licencia

ISC

---

**¡Disfruta usando Alas Latinas! 🌴**
