# 🚀 Guía de Integración Freighter Wallet

## ¿Qué es Freighter?

Freighter es una extensión de navegador que permite interactuar de forma segura con contratos inteligentes en la red Stellar (incluyendo Soroban).

## Instalación de Freighter

1. Ve a [https://www.freighter.app](https://www.freighter.app)
2. Haz clic en "Install" y sigue las instrucciones según tu navegador
3. Una vez instalado, verás el icono de Freighter en la barra de herramientas

## Crear una Wallet de Testnet

1. Abre Freighter desde la barra de herramientas
2. Haz clic en "Create a new key"
3. Elige el nombre de tu cuenta (ej: "Testnet Account")
4. Selecciona "Testnet" como red
5. Guarda tu frase de recuperación en un lugar seguro
6. Copia tu dirección pública (empieza con "G")

## Obtener Lumens de Testnet (Fondos de prueba)

1. Copia tu dirección pública de Freighter
2. Ve a [https://friendbot.stellar.org/](https://friendbot.stellar.org/)
3. Pega tu dirección pública
4. Haz clic en "Fund this account"
5. En 5-10 segundos, recibirás 10,000 lumens de prueba

## Usar Freighter en Alas Latinas

### Conectar tu Wallet

1. Ve a tu perfil: `/profile`
2. Desplázate hasta la sección "Conectar Wallet"
3. Haz clic en "Conectar Freighter Wallet"
4. La extensión de Freighter abrirá un popup pidiendo permiso
5. Haz clic en "Approve"
6. Tu dirección de wallet aparecerá en la pantalla

### Vincular Wallet a tu Perfil

1. Después de conectar, haz clic en "Vincular a Mi Perfil"
2. Tu cuenta se asociará a esta dirección de wallet
3. Ahora puedes usar funciones que requieren blockchain

### Realizar Transacciones

Las transacciones en Soroban requieren:
- Freighter conectado
- Tu cuenta financiada con Lumens (obtenidos de Friendbot)
- Aprobación en Freighter para cada transacción

## Datos de Prueba

### Testnet Friendbot
**URL**: https://friendbot.stellar.org/?addr=<TU_DIRECCIÓN_PÚBLICA>

### Testnet Soroban RPC
**URL**: https://soroban-testnet.stellar.org:443

## Solución de Problemas

### "Freighter no está instalado"
- Instala Freighter desde https://www.freighter.app
- Asegúrate de permitir acceso al sitio web

### "Error al conectar wallet"
- Verifica que Freighter esté abierto y desbloqueado
- Recarga la página
- Intenta desbloquear Freighter nuevamente

### "No hay fondos en la cuenta"
- Usa Friendbot para obtener 10,000 lumens de prueba
- Espera 10-30 segundos después de usar Friendbot

## Variables de Entorno (Backend)

Si necesitas configurar endpoints personalizados:

```bash
# .env
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
FREIGHTER_ENABLED=true
```

## Referencias

- [Documentación oficial de Freighter](https://support.freighter.app)
- [Stellar Testnet](https://stellar.org/ecosystem/testnet)
- [Soroban JavaScript SDK](https://github.com/stellar/js-stellar-sdk)
- [Friendbot](https://developers.stellar.org/docs/tutorials/get-started#get-test-network-lumens)
