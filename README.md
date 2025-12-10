<<<<<<< HEAD
# Alas Latinas 3.0 — Soroban Smart Contract

Contrato inteligente Soroban que implementa el sistema completo de viajes y reservas de "Alas Latinas 3.0" según especificaciones wiki (RF-01 a RF-15).

## Características

El contrato cubre todas las funcionalidades requeridas:

- **RF-01 a RF-05:** Gestión de usuarios (registro, eliminación, actualización, búsqueda, autenticación)
- **RF-06 a RF-09:** Gestión de destinos (crear, eliminar, actualizar, consultar información)
- **RF-10:** Carga de multimedia (imágenes, videos)
- **RF-11:** Comentarios y calificaciones de destinos
- **RF-12 a RF-15:** Reservas (crear, cancelar, consultar estado, pagar)

## Estructura del Proyecto

```
soroban_users/
├── Cargo.toml              # Configuración del proyecto Rust + dependencias
├── src/
│   └── lib.rs              # Contrato Soroban (AlasLatinas struct + 15 funciones)
├── scripts/
│   ├── deploy_testnet.sh   # Script para desplegar en Soroban Testnet
│   └── invoke_testnet.sh   # Helper para invocar funciones del contrato
├── frontend/               # Frontend (Vue.js + Node.js, próximamente)
├── test_snapshots/         # Snapshots de pruebas
└── README.md               # Este archivo
```

## Construcción y Pruebas

### 1. Compilar el Contrato

```bash
cd ~/soroban_users

# Compilar en debug (para pruebas)
cargo build

# Ejecutar pruebas unitarias (16 tests cubren todos los RF)
cargo test --lib

# Compilar release wasm (para despliegue)
cargo build --release --target wasm32-unknown-unknown
```

El artefacto wasm estará en: `target/wasm32-unknown-unknown/release/soroban_users.wasm`

### 2. Pruebas Unitarias

El contrato incluye 16 pruebas exhaustivas:

```
✅ test_register_user              (RF-01)
✅ test_delete_user                (RF-02)
✅ test_update_user                (RF-03)
✅ test_list_users                 (RF-04)
✅ test_authenticate_user          (RF-05)
✅ test_create_destination         (RF-06)
✅ test_delete_destination         (RF-07)
✅ test_update_destination         (RF-08)
✅ test_list_destinations          (RF-09)
✅ test_upload_media               (RF-10)
✅ test_add_comment                (RF-11)
✅ test_create_reservation         (RF-12)
✅ test_cancel_reservation         (RF-13)
✅ test_get_reservation_status     (RF-14)
✅ test_pay_reservation            (RF-15)
✅ test_full_booking_flow          (Integration test)
```

Ejecutar:
```bash
cargo test --lib
# Resultado esperado: ok. 16 passed
```

## Despliegue en Soroban Testnet

### ⚠️ Testnet Deployment Status

**Currently Blocked**: El Soroban Testnet (v23.0.0) rechaza nuestro WASM con error de validación (`reference-types not enabled`). Este es un issue del validador de Testnet, no del contrato.

**Workaround**: Usa [LOCAL_DEPLOYMENT.md](LOCAL_DEPLOYMENT.md) para testing local con backend + frontend.

Para más detalles del issue y soluciones, ver [TESTNET_ISSUE.md](TESTNET_ISSUE.md).

### Información de Red

- **Testnet Horizon:** https://horizon-testnet.stellar.org
- **Soroban CLI Version:** 23.2.0 (soportado)
- **soroban-sdk Version:** 21.7.7

### Scripts de Despliegue (Cuando Testnet se actualice)

#### 1. Desplegar el Contrato

```bash
bash scripts/deploy_testnet.sh
```

El script:
1. Compila el wasm en modo release
2. Despliega usando `soroban contract deploy`
3. Imprime el contract ID una vez desplegado

#### 2. Invocar Funciones

```bash
CONTRACT_ID="CA..." SECRET_KEY="SA..." bash scripts/invoke_testnet.sh
```

Usa este script después del despliegue para interactuar con el contrato.

### Ejemplo Manual con Soroban CLI

```bash
# Exportar clave secreta (mejor via .env)
export SECRET_KEY="SA..."

# Desplegar
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_users.wasm \
  --network testnet \
  --source $SECRET_KEY

# Invocar una función (e.g., registrar usuario)
soroban contract invoke \
  --id CA... \
  --fn register_user \
  --arg <address> \
  --arg "John Doe" \
  --arg "john@example.com" \
  --arg "555-1234" \
  --arg "1990-01-15" \
  --arg "Male" \
  --network testnet \
  --source $SECRET_KEY
```

## Seguridad

⚠️ **IMPORTANTE:** No comitas claves secretas al repositorio.

- ✅ Pasa `SECRET_KEY` via **variables de entorno** en tiempo de ejecución
- ✅ Usa `.env` para desarrollo local (añade `.env` a `.gitignore`)
- ❌ **NUNCA** hardcodees secretos en scripts o código fuente

### Archivo `.env.example` (plantilla)

```bash
# .env.example (commiteado; sin secretos reales)
SECRET_KEY=SA...
CONTRACT_ID=CA...
SOROBAN_NETWORK=testnet
```

## Estructura de Datos del Contrato

### Usuarios
```rust
User {
  name: String,
  email: String,
  phone: String,
  birth_date: String,
  gender: String,
  active: bool
}
```

### Destinos
```rust
Destination {
  name: String,
  address: String,
  location: String,
  description: String,
  rating: u32,
  active: bool
}
```

### Reservas
```rust
Reservation {
  user_id: Address,
  destination_id: String,
  check_in: String,
  check_out: String,
  status: String,    // "reserved", "cancelled", "completed"
  total_price: u64,
  paid: bool
}
```

## Almacenamiento Persistente

El contrato usa el almacenamiento persistente de Soroban:

```
users:                   Map<Address, String>              (índice de usuarios activos)
user_data:               (Symbol, Address) → (name, email, phone, birth_date, gender)
destinations:            Map<String, String>               (índice de destinos)
dest_data:               (Symbol, String) → (name, address, location, description, rating)
media:                   (Symbol, String) → Vec[(url, type)]
comments:                (Symbol, String) → Vec[(user_id, comment, rating)]
reservations:            Map<String, String>               (índice de reservas)
res_data:                (Symbol, String) → (user_id, dest_id, check_in, check_out, price, status, paid)
```

## Frontend (Próximo)

El frontend Vue.js + Node.js estará en `frontend/` con:

- Componentes Vue para registro, login, búsqueda de destinos
- Interfaz de reservas con pago
- Galerías de multimedia
- Sistema de comentarios
- Integración con contrato Soroban via soroban-js SDK

## Notas de Desarrollo

- **Lenguaje:** Rust (soroban-sdk 23.1.0)
- **Wasm Target:** wasm32-unknown-unknown
- **Test Framework:** soroban-sdk testutils
- **Almacenamiento:** Persistent (Soroban ledger)
- **No Std:** Contrato usa `#![no_std]` (WebAssembly)

## Próximos Pasos

1. ✅ Contrato Soroban completo (RF-01..RF-15) — **HECHO**
2. ✅ Pruebas unitarias exhaustivas (16 tests) — **HECHO**
3. ✅ Build wasm limpio (sin warnings) — **HECHO**
4. ⏳ Frontend Vue.js con componentes interactivos
5. ⏳ Backend Node.js/Express (autenticación, pagos, CORS)
6. ⏳ Despliegue en Soroban Testnet (resolviendo referencia-types issue)

## Referencias

- [Soroban SDK Docs](https://developers.stellar.org/docs/learn/soroban)
- [Soroban CLI](https://developers.stellar.org/docs/build/cli/invoke-contract)
- [Stellar Testnet](https://testnet.stellar.org)
- [Wiki Alas Latinas 3.0](https://github.com/SistemasTecTlaxiaco/AlasLatinas3.0/wiki)

---

**Estado:** Contrato completado y testeado localmente. ✅
=======
# AlasLatinas
>>>>>>> origin/main
