# Guía de Configuración: IPFS y Blockchain (Sepolia Testnet)

Esta guía te ayudará a configurar el sistema para almacenar certificados en IPFS y registrar hashes en Ethereum Sepolia Testnet.

## 📋 Tabla de Contenidos

1. [Configuración de IPFS con Pinata](#1-configuración-de-ipfs-con-pinata)
2. [Configuración de Blockchain (Sepolia Testnet)](#2-configuración-de-blockchain-sepolia-testnet)
3. [Configuración de Variables de Entorno](#3-configuración-de-variables-de-entorno)
4. [Despliegue del Contrato Inteligente](#4-despliegue-del-contrato-inteligente)
5. [Instalación de Dependencias](#5-instalación-de-dependencias)
6. [Migración de Base de Datos](#6-migración-de-base-de-datos)
7. [Verificación](#7-verificación)

---

## 1. Configuración de IPFS con Pinata

### Paso 1.1: Crear cuenta en Pinata

1. Ve a [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. Haz clic en **"Sign Up"** y crea una cuenta gratuita
3. Verifica tu email

### Paso 1.2: Obtener API Keys

**Opción A: Usar API Key + Secret (Recomendado para desarrollo)**

1. Inicia sesión en Pinata
2. Ve a **"API Keys"** en el menú lateral
3. Haz clic en **"New Key"**
4. Configura:
   - **Key Name**: `certificates-app` (o el nombre que prefieras)
   - **Admin**: ✅ Marca esta opción
   - **Pin Policy**: Deja por defecto (permite subir cualquier archivo)
5. Haz clic en **"Create"**
6. **IMPORTANTE**: Copia inmediatamente:
   - **API Key** (ejemplo: `a1b2c3d4e5f6g7h8i9j0`)
   - **Secret API Key** (ejemplo: `k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`)
   
   ⚠️ **La Secret API Key solo se muestra una vez**. Guárdala en un lugar seguro.

**Opción B: Usar JWT (Recomendado para producción)**

1. Ve a **"API Keys"** en Pinata
2. Crea una nueva API Key con permisos de Admin
3. En lugar de usar API Key + Secret, puedes generar un JWT:
   - Ve a la documentación de Pinata para generar JWT
   - O usa la API Key + Secret para generar el JWT

### Paso 1.3: Verificar límites

- **Plan Gratuito**: 1 GB de almacenamiento, 100 archivos
- Para producción, considera un plan de pago

---

## 2. Configuración de Blockchain (Sepolia Testnet)

### Paso 2.1: Obtener ETH de prueba (Sepolia ETH)

Necesitas ETH de prueba para pagar las tarifas de gas en Sepolia Testnet.

**Opción A: Faucet de Sepolia (Alchemy)**

1. Ve a [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
2. Conecta tu wallet (MetaMask)
3. Ingresa tu dirección de wallet
4. Completa el CAPTCHA
5. Recibirás 0.5 ETH de prueba

**Opción B: Faucet de Alchemy**

1. Ve a [https://www.alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)
2. Conecta tu wallet o ingresa tu dirección
3. Solicita ETH de prueba

**Opción C: Faucet de Infura**

1. Ve a [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
2. Ingresa tu dirección de wallet
3. Solicita ETH de prueba

### Paso 2.2: Crear o usar una Wallet

**Si ya tienes MetaMask:**

1. Abre MetaMask
2. Cambia la red a **"Sepolia Test Network"**
3. Copia tu dirección de wallet (comienza con `0x...`)
4. Exporta tu clave privada:
   - Haz clic en los tres puntos (⋮) junto a tu cuenta
   - Selecciona **"Account Details"**
   - Haz clic en **"Export Private Key"**
   - Ingresa tu contraseña
   - ⚠️ **NUNCA compartas esta clave privada**

**Si necesitas crear una nueva wallet:**

1. Instala [MetaMask](https://metamask.io/)
2. Crea una nueva wallet o importa una existente
3. Cambia a Sepolia Testnet
4. Exporta la clave privada (solo para desarrollo/test)

### Paso 2.3: Obtener RPC URL de Sepolia

Necesitas un endpoint RPC para conectarte a Sepolia Testnet.

**Opción A: Infura (Recomendado)**

1. Ve a [https://www.infura.io/](https://www.infura.io/)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Selecciona **"Ethereum"** como red
5. En **"Endpoints"**, selecciona **"Sepolia"**
6. Copia la URL (formato: `https://sepolia.infura.io/v3/TU_API_KEY`)

**Opción B: Alchemy**

1. Ve a [https://www.alchemy.com/](https://www.alchemy.com/)
2. Crea una cuenta gratuita
3. Crea una nueva app
4. Selecciona **"Ethereum"** y **"Sepolia"**
5. Copia la URL HTTP (formato: `https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY`)

**Opción C: Public RPC (No recomendado para producción)**

Puedes usar endpoints públicos, pero pueden tener límites de rate:
- `https://rpc.sepolia.org`
- `https://sepolia.infura.io/v3/YOUR_KEY`

---

## 3. Configuración de Variables de Entorno

### Paso 3.1: Crear archivo `.env.local`

En la raíz del proyecto, crea o edita el archivo `.env.local`:

```bash
# JWT Secret (para firmar certificados)
JWT_SECRET=tu-clave-secreta-super-segura-aqui-minimo-32-caracteres

# IPFS - Pinata Configuration
# Opción 1: Usar API Key + Secret
PINATA_API_KEY=tu_api_key_de_pinata
PINATA_SECRET_API_KEY=tu_secret_api_key_de_pinata

# Opción 2: Usar JWT (alternativa)
# PINATA_JWT=tu_jwt_token_de_pinata

# Blockchain - Sepolia Testnet
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/TU_INFURA_API_KEY
# O usa Alchemy:
# BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_ALCHEMY_API_KEY

WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
# ⚠️ IMPORTANTE: La clave privada debe comenzar con 0x y tener 64 caracteres hex

CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
# Esta dirección la obtendrás después de desplegar el contrato (ver sección 4)

# Dominio público (para URLs de verificación)
NEXT_PUBLIC_DOMAIN=http://localhost:3000
# En producción, usa tu dominio real:
# NEXT_PUBLIC_DOMAIN=https://tu-dominio.com
```

### Paso 3.2: Ejemplo de `.env.local` completo

```env
# JWT
JWT_SECRET=certificate-secret-key-2024-production-change-this

# IPFS - Pinata
PINATA_API_KEY=a1b2c3d4e5f6g7h8i9j0
PINATA_SECRET_API_KEY=k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Blockchain - Sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12

# Dominio
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

---

## 4. Despliegue del Contrato Inteligente

### Paso 4.1: Preparar el contrato

El contrato ya está en `src/contracts/CertificateRegistry.sol`. Necesitas desplegarlo en Sepolia.

### Paso 4.2: Usar Remix IDE (Más fácil)

1. Ve a [https://remix.ethereum.org/](https://remix.ethereum.org/)
2. Crea un nuevo archivo `CertificateRegistry.sol`
3. Copia el contenido de `src/contracts/CertificateRegistry.sol`
4. Compila el contrato:
   - Selecciona el compilador: **"0.8.19"** o superior
   - Haz clic en **"Compile CertificateRegistry.sol"**
5. Despliega:
   - Ve a la pestaña **"Deploy & Run Transactions"**
   - Selecciona **"Injected Provider - MetaMask"** (conecta MetaMask)
   - Asegúrate de estar en **"Sepolia Test Network"**
   - Haz clic en **"Deploy"**
   - Confirma la transacción en MetaMask
6. **Copia la dirección del contrato** (aparece en "Deployed Contracts")
   - Ejemplo: `0x1234567890123456789012345678901234567890`
   - Esta es tu `CONTRACT_ADDRESS`

### Paso 4.3: Usar Hardhat (Avanzado)

Si prefieres usar Hardhat:

```bash
# Instalar Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Inicializar proyecto
npx hardhat init

# Configurar hardhat.config.js para Sepolia
# Desplegar con: npx hardhat run scripts/deploy.js --network sepolia
```

### Paso 4.4: Verificar el contrato (Opcional)

1. Ve a [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
2. Busca tu dirección de contrato
3. Haz clic en **"Contract"** → **"Verify and Publish"**
4. Ingresa el código fuente y verifica

---

## 5. Instalación de Dependencias

```bash
# Instalar nuevas dependencias (axios, form-data)
pnpm install
# O
npm install
# O
yarn install
```

---

## 6. Migración de Base de Datos

El schema de Prisma ya incluye el campo `ipfsHash`. Ejecuta la migración:

```bash
# Generar migración
npx prisma migrate dev --name add_ipfs_hash

# O si prefieres solo actualizar el cliente
npx prisma generate
```

Si ya tienes datos en la base de datos, la migración agregará el campo `ipfs_hash` como opcional (nullable).

---

## 7. Verificación

### Paso 7.1: Verificar configuración

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

2. Revisa la consola. Deberías ver:
   ```
   ✅ Blockchain Service inicializado para Sepolia Testnet
      Wallet: 0x...
      Contrato: 0x...
   ```

3. Si hay errores, verifica:
   - Que todas las variables de entorno estén configuradas
   - Que la wallet tenga ETH de prueba
   - Que el contrato esté desplegado

### Paso 7.2: Probar el flujo completo

1. Ve a `http://localhost:3000`
2. Registra un nuevo estudiante
3. Genera una constancia
4. Revisa la consola del servidor. Deberías ver:
   ```
   📄 Generando PDF del certificado...
   ☁️  Subiendo PDF a IPFS...
   ✅ PDF subido a IPFS: Qm...
   ⛓️  Registrando hash en blockchain (Sepolia Testnet)...
   ✅ Hash registrado en blockchain: 0x...
   ```

### Paso 7.3: Verificar en IPFS

1. Copia el hash IPFS de la consola
2. Ve a `https://gateway.pinata.cloud/ipfs/TU_HASH`
3. Deberías poder descargar el PDF

### Paso 7.4: Verificar en Blockchain

1. Copia el hash de transacción de la consola
2. Ve a `https://sepolia.etherscan.io/tx/TU_TX_HASH`
3. Deberías ver la transacción confirmada

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE: Nunca compartas:

- Tu `WALLET_PRIVATE_KEY`
- Tu `PINATA_SECRET_API_KEY`
- Tu `JWT_SECRET`

### ✅ Mejores prácticas:

1. **Nunca** subas `.env.local` a Git
2. Usa `.env.local` para desarrollo local
3. En producción, usa variables de entorno del servidor
4. Considera usar un servicio de gestión de secretos (AWS Secrets Manager, etc.)

---

## 🐛 Solución de Problemas

### Error: "Wallet sin fondos"
- **Solución**: Obtén ETH de prueba de un faucet de Sepolia

### Error: "PINATA_API_KEY no configurado"
- **Solución**: Verifica que las variables `PINATA_API_KEY` y `PINATA_SECRET_API_KEY` estén en `.env.local`

### Error: "CONTRACT_ADDRESS inválido"
- **Solución**: Asegúrate de haber desplegado el contrato y copiado la dirección correcta

### Error: "Transacción revertida"
- **Solución**: El hash podría ya estar registrado. Verifica en el contrato

### PDF no se sube a IPFS
- **Solución**: Verifica los límites de tu cuenta de Pinata (plan gratuito: 1GB, 100 archivos)

---

## 📚 Recursos Adicionales

- [Documentación de Pinata](https://docs.pinata.cloud/)
- [Documentación de Sepolia](https://sepolia.dev/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Remix IDE](https://remix.ethereum.org/)
- [MetaMask](https://metamask.io/)

---

## ✅ Checklist Final

- [ ] Cuenta de Pinata creada y API Keys obtenidas
- [ ] Wallet con ETH de prueba en Sepolia
- [ ] RPC URL de Sepolia configurada
- [ ] Contrato desplegado en Sepolia
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Dependencias instaladas
- [ ] Base de datos migrada
- [ ] Servidor iniciado sin errores
- [ ] Flujo completo probado exitosamente

---

¡Listo! Tu sistema ahora almacena certificados en IPFS y registra hashes en Ethereum Sepolia Testnet. 🎉







