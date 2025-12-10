# Backend API - Alas Latinas 3.0

Backend Node.js/Express para la aplicación de viajes Alas Latinas 3.0.

## 🚀 Inicio Rápido

### Instalación

```bash
cd frontend
npm install
```

### Variables de Entorno

Crear archivo `.env`:

```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Desarrollo

```bash
npm run server
```

El servidor estará disponible en `http://localhost:3001`

## 📡 Endpoints de la API

### Autenticación (`/auth`)

- **POST** `/auth/register` — Registrar nuevo usuario
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "birthDate": "1990-01-01",
    "gender": "male"
  }
  ```
  Respuesta:
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "token": "...",
    "user": { ... }
  }
  ```

- **POST** `/auth/login` — Iniciar sesión
  ```json
  {
    "email": "juan@example.com",
    "password": "password123"
  }
  ```
  Respuesta:
  ```json
  {
    "message": "Login exitoso",
    "token": "...",
    "user": { ... }
  }
  ```

- **GET** `/auth/profile` — Obtener perfil del usuario (requiere token)
  ```
  Headers: Authorization: Bearer <token>
  ```

- **PUT** `/auth/profile` — Actualizar perfil (requiere token)
  ```json
  {
    "name": "Nuevo Nombre",
    "email": "nuevo@example.com",
    "phone": "+9876543210"
  }
  ```

- **DELETE** `/auth/profile` — Eliminar usuario (requiere token)

### Destinos (`/destinations`)

- **GET** `/destinations` — Listar todos los destinos
  ```
  Query params:
  - search: filtro de búsqueda
  ```

- **GET** `/destinations/:id` — Obtener detalles de un destino

- **POST** `/destinations` — Crear nuevo destino (requiere token)
  ```json
  {
    "name": "Machu Picchu",
    "location": "Cusco, Peru",
    "address": "Km 112 Ferrocarril Cusco-Aguas Calientes",
    "description": "Maravilla del mundo antiguo...",
    "rating": 5
  }
  ```

- **PUT** `/destinations/:id` — Actualizar destino (requiere token)

- **DELETE** `/destinations/:id` — Eliminar destino (requiere token)

- **POST** `/destinations/:id/comments` — Agregar comentario (requiere token)
  ```json
  {
    "text": "¡Lugar increíble!",
    "rating": 5
  }
  ```

### Reservas (`/reservations`)

- **GET** `/reservations` — Listar reservas del usuario (requiere token)

- **GET** `/reservations/:id` — Obtener detalle de una reserva (requiere token)

- **POST** `/reservations` — Crear nueva reserva (requiere token)
  ```json
  {
    "destinationId": "dest-1",
    "checkInDate": "2025-03-01",
    "checkOutDate": "2025-03-05",
    "totalPrice": 1200
  }
  ```

- **GET** `/reservations/:id/status` — Obtener estado de la reserva (requiere token)

- **POST** `/reservations/:id/pay` — Procesar pago (requiere token)
  ```json
  {
    "cardNumber": "1234567890123456",
    "expiryDate": "12/25",
    "cvv": "123"
  }
  ```

- **POST** `/reservations/:id/cancel` — Cancelar reserva (requiere token)

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

El token se obtiene al registrarse o iniciar sesión.

## 💾 Base de Datos

Actualmente usa una base de datos en memoria (mock). Los datos se pierden al reiniciar el servidor.

Para producción, integrar con:
- PostgreSQL
- MongoDB
- Firebase Firestore

## 🔄 Integración con Soroban

Próximamente se integrará el contrato inteligente Soroban para:
- Almacenar datos de usuarios en el ledger de Stellar
- Procesar pagos en USDC
- Persistencia de reservas en blockchain

## 📝 Notas de Desarrollo

- El servidor proxy está configurado en Vite para dirigir `/api/*` a `http://localhost:3001`
- En producción, cambiar JWT_SECRET por una clave segura
- Implementar rate limiting para endpoints públicos
- Agregar validación más robusta de entrada
- Implementar logging estructurado

## 📦 Estructura de Carpetas

```
server/
├── index.js              # Entrada principal del servidor
├── middleware/
│   └── auth.js          # Middleware de autenticación JWT
├── routes/
│   ├── auth.js          # Rutas de autenticación
│   ├── destinations.js  # Rutas de destinos
│   └── reservations.js  # Rutas de reservas
└── utils/
    └── database.js      # Mock de base de datos
```
