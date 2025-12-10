# Soroban Users — scaffold

Proyecto scaffold para un contrato Soroban que cubre las funcionalidades solicitadas (RF-01..RF-15).

IMPORTANTE: Este repositorio contiene solo un punto de partida. Antes de desplegar en testnet/mainnet:
- Revisa y elimina cualquier clave secreta de archivos bajo control de versiones.
- Añade validaciones, límites de gas, control de acceso y pruebas extensas.

Estructura:
- `Cargo.toml` y `src/lib.rs` — contrato Soroban en Rust.
- `frontend/` — frontend mínimo en Node.js con helper que llama al `soroban` CLI.

Claves y red (datos que nos proporcionaste):
- Stellar testnet public: `GC5KCKDYBPRN3INU2CSL5KDZOWGLVAMU45OLSHKKDKCODYJUFKIPSLAK`
- Stellar testnet secret: (NO guardes secretos en VCS) — user-provided secret
- Recovery phrase: (user-provided)

Cómo compilar el contrato (en WSL Ubuntu):

1) Asegúrate de tener `rustup` y la toolchain instalada. (Ya lo hicimos en tu sesión WSL).

2) Compilar release wasm:

```bash
cd ~/soroban_users
cargo build --release --target wasm32-unknown-unknown
# El artefacto wasm estará en target/wasm32-unknown-unknown/release/soroban_users.wasm
```

3) (Opcional) Optimizar wasm con wasm-opt si lo deseas (instala `binaryen`):

```bash
wasm-opt -Oz -o soroban_users_opt.wasm target/wasm32-unknown-unknown/release/soroban_users.wasm
```

4) Para desplegar en Soroban Testnet usando la CLI (ejemplo):

```bash
# exporta la clave secreta (mejor ponerla en .env y añadir .env a .gitignore)
export SOROBAN_SECRET="SDGOQ6IKI2INQAXYQ346GOY2AHINOLSMV4GLHIRBPIPJD4MEFKHRHGTH"

# crear cuenta de deploy si falta (usando stellar laboratory o friendsbot)
# subir wasm
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_users.wasm --network testnet

# una vez desplegado invocar una función (ejemplo):
# soroban contract invoke --id <contract_id> --fn create_user --arg <address> --arg "Alice" --arg "alice@example.com" --network testnet
```

Frontend:

```bash
cd frontend
npm install
node index.js
```

Seguridad: **NO** cometas tu `secret key` ni tu `recovery phrase` en el control de versiones. Usa `.env` (y añade `.env` a `.gitignore`) para el desarrollo local.

Notas finales:
- Este es un scaffold. Puedo ahora: agregar validaciones, pruebas automatizadas, ejemplos de llamadas con `soroban` CLI, o implementar un frontend que use una librería JS real para Soroban y Stellar. Dime qué prefieres y lo hago.

Deployment
----------

He añadido dos scripts útiles en `scripts/` para preparar y probar despliegues en Soroban Testnet:

- `scripts/deploy_testnet.sh` — construye el wasm y despliega usando la CLI `soroban`. No incluye secretos; pásalos en tiempo de ejecución via la variable de entorno `SECRET_KEY`:

```bash
SECRET_KEY="SA..." bash scripts/deploy_testnet.sh
```

- `scripts/invoke_testnet.sh` — helper para invocar funciones del contrato en Testnet tras el despliegue. Proporciona `CONTRACT_ID` y `SECRET_KEY` en el entorno:

```bash
CONTRACT_ID="CA..." SECRET_KEY="SA..." bash scripts/invoke_testnet.sh
```

Importante: no subas claves secretas al repositorio. Si quieres que despliegue el contrato ahora con la clave que me diste, confírmalo y lo ejecutamos — no usaré tu secreto sin tu permiso explícito.
