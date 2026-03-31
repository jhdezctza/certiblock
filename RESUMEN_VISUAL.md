# Resumen Visual del Sistema - Constancias UJAT

## 🎯 Visión General del Sistema

```mermaid
graph TB
    subgraph "Sistema de Gestión de Constancias UJAT"
        A[Registro de<br/>Estudiantes] --> B[Generación de<br/>Constancias]
        B --> C[Almacenamiento<br/>Descentralizado]
        B --> D[Registro<br/>Blockchain]
        B --> E[Verificación<br/>Multi-capa]
        E --> F[Descarga de<br/>PDF]
    end
    
    style A fill:#e1f5ff
    style B fill:#fff9c4
    style C fill:#f3e5f5
    style D fill:#fff9c4
    style E fill:#c8e6c9
    style F fill:#b2dfdb
```

---

## 📊 Arquitectura de Alto Nivel

### Vista General del Sistema

```mermaid
graph LR
    subgraph "Frontend"
        UI[Interfaz Web<br/>Next.js + React]
    end
    
    subgraph "Backend"
        API[API & Actions<br/>Next.js Server]
        Services[Servicios<br/>Business Logic]
    end
    
    subgraph "Persistencia"
        DB[(SQLite<br/>Base de Datos)]
        IPFS[IPFS<br/>Almacenamiento]
        BC[Blockchain<br/>Registro]
    end
    
    UI --> API
    API --> Services
    Services --> DB
    Services --> IPFS
    Services --> BC
    
    style UI fill:#e3f2fd
    style API fill:#fff3e0
    style Services fill:#f1f8e9
    style DB fill:#e8f5e9
    style IPFS fill:#f3e5f5
    style BC fill:#fff9c4
```

---

## 🔄 Procesos Principales

### 1. Proceso de Generación de Constancia

```mermaid
graph TD
    A[Usuario confirma datos] --> B[Generar Hash JWT]
    B --> C[Crear PDF con QR]
    C --> D[Subir a IPFS]
    D --> E[Registrar en Blockchain]
    E --> F[Guardar en BD]
    F --> G[Constancia lista]
    
    style A fill:#e1f5ff
    style B fill:#fff9c4
    style C fill:#c8e6c9
    style D fill:#f3e5f5
    style E fill:#fff9c4
    style F fill:#e8f5e9
    style G fill:#c8e6c9
```

### 2. Proceso de Verificación

```mermaid
graph TD
    A[Usuario ingresa hash] --> B[Verificar JWT]
    B --> C[Buscar en BD]
    C --> D[Verificar IPFS]
    D --> E[Verificar Blockchain]
    E --> F[Resultado final]
    
    style A fill:#e1f5ff
    style B fill:#fff9c4
    style C fill:#e8f5e9
    style D fill:#f3e5f5
    style E fill:#fff9c4
    style F fill:#c8e6c9
```

---

## 📦 Componentes del Sistema

### Estructura de Componentes

```mermaid
mindmap
  root((Sistema de<br/>Constancias))
    Frontend
      Páginas
        Welcome
        Búsqueda
        Registro
        Confirmación
        Verificación
        Previsualización
      Componentes
        Formularios
        Tablas
        Cards
        QR Code
    Backend
      Actions
        Búsqueda
        Registro
        Generación
        Verificación
        Descarga
      Services
        Database
        JWT
        PDF
        IPFS
        Blockchain
    Persistencia
      SQLite
        Estudiantes
        Certificados
        Usuarios
      IPFS
        PDFs
      Blockchain
        Hashes
```

---

## 🔐 Seguridad y Validación

### Capas de Seguridad

```mermaid
graph TB
    A[Datos de Entrada] --> B[Validación de Formato]
    B --> C[Sanitización]
    C --> D[Validación de Negocio]
    D --> E[Encriptación JWT]
    E --> F[Almacenamiento Seguro]
    F --> G[Verificación Multi-capa]
    G --> H[Salida Segura]
    
    style A fill:#ffcdd2
    style B fill:#fff9c4
    style C fill:#fff9c4
    style D fill:#fff9c4
    style E fill:#c8e6c9
    style F fill:#c8e6c9
    style G fill:#b2dfdb
    style H fill:#c8e6c9
```

### Verificación Multi-capa

```mermaid
graph LR
    Hash[Hash JWT] --> V1[Verificar JWT]
    Hash --> V2[Verificar BD]
    Hash --> V3[Verificar IPFS]
    Hash --> V4[Verificar Blockchain]
    
    V1 --> Result{¿Todas OK?}
    V2 --> Result
    V3 --> Result
    V4 --> Result
    
    Result -->|Sí| Valid[Válido]
    Result -->|No| Invalid[Inválido]
    
    style Hash fill:#e1f5ff
    style V1 fill:#fff9c4
    style V2 fill:#e8f5e9
    style V3 fill:#f3e5f5
    style V4 fill:#fff9c4
    style Valid fill:#c8e6c9
    style Invalid fill:#ffcdd2
```

---

## 📈 Flujo de Datos Simplificado

### Flujo Completo del Sistema

```mermaid
flowchart LR
    Start([Inicio]) --> Input[Entrada de Datos]
    Input --> Process[Procesamiento]
    Process --> Validate[Validación]
    Validate --> Store[Almacenamiento]
    Store --> Verify[Verificación]
    Verify --> Output[Salida]
    Output --> End([Fin])
    
    Process --> IPFS[IPFS]
    Process --> BC[Blockchain]
    Process --> DB[(BD)]
    
    style Start fill:#e1f5ff
    style Process fill:#fff9c4
    style IPFS fill:#f3e5f5
    style BC fill:#fff9c4
    style DB fill:#e8f5e9
    style Output fill:#c8e6c9
    style End fill:#ffcdd2
```

---

## 🎨 Interfaz de Usuario

### Navegación del Sistema

```mermaid
graph TD
    Home[Página de Inicio] --> Search[Buscar Alumno]
    Home --> Verify[Verificar Constancia]
    Home --> Register[Registrar Alumno]
    
    Search -->|Encontrado| Confirm[Confirmar Datos]
    Search -->|No encontrado| Register
    
    Confirm --> Generate[Generar Constancia]
    Generate --> Preview[Previsualizar]
    Preview --> Download[Descargar PDF]
    
    Verify --> Result[Resultado Verificación]
    
    style Home fill:#e1f5ff
    style Search fill:#c8e6c9
    style Generate fill:#fff9c4
    style Verify fill:#f3e5f5
    style Download fill:#b2dfdb
```

---

## 🔧 Tecnologías Utilizadas

### Stack Tecnológico

```mermaid
graph TB
    subgraph "Frontend"
        NextJS[Next.js 15]
        React[React 19]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
    end
    
    subgraph "Backend"
        ServerActions[Server Actions]
        Prisma[Prisma ORM]
        SQLite[SQLite]
    end
    
    subgraph "Servicios"
        JWT[JWT]
        PDF[React PDF]
        IPFS[IPFS Pinata]
        Ethers[Ethers.js]
    end
    
    subgraph "Blockchain"
        Sepolia[Sepolia Testnet]
        SmartContract[Smart Contract]
    end
    
    NextJS --> React
    React --> TS
    React --> Tailwind
    NextJS --> ServerActions
    ServerActions --> Prisma
    Prisma --> SQLite
    ServerActions --> JWT
    ServerActions --> PDF
    ServerActions --> IPFS
    ServerActions --> Ethers
    Ethers --> Sepolia
    Sepolia --> SmartContract
    
    style NextJS fill:#e3f2fd
    style React fill:#e3f2fd
    style ServerActions fill:#fff3e0
    style Prisma fill:#f1f8e9
    style IPFS fill:#f3e5f5
    style Sepolia fill:#fff9c4
```

---

## 📋 Casos de Uso Principales

### Diagrama de Casos de Uso Simplificado

```mermaid
graph TD
    Usuario[Usuario del Sistema]
    
    UC1[Buscar Estudiante]
    UC2[Registrar Estudiante]
    UC3[Generar Constancia]
    UC4[Verificar Constancia]
    UC5[Descargar Constancia]
    
    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5
    
    UC1 -.->|Si no existe| UC2
    UC1 -.->|Si existe| UC3
    UC3 -.->|Genera| UC4
    UC3 -.->|Genera| UC5
    
    style Usuario fill:#e1f5ff
    style UC1 fill:#c8e6c9
    style UC2 fill:#c8e6c9
    style UC3 fill:#fff9c4
    style UC4 fill:#f3e5f5
    style UC5 fill:#b2dfdb
```

---

## 🎯 Características Clave

### Funcionalidades Principales

```mermaid
mindmap
  root((Sistema de<br/>Constancias))
    Seguridad
      JWT Hash
      Validación Multi-capa
      Headers HTTP Seguros
    Almacenamiento
      Base de Datos Local
      IPFS Descentralizado
      Blockchain Inmutable
    Generación
      PDF Dinámico
      Código QR
      Firma Digital
    Verificación
      JWT Validation
      IPFS Check
      Blockchain Check
      Base de Datos Check
```

---

## 📊 Métricas y Estados

### Estados del Sistema

```mermaid
stateDiagram-v2
    [*] --> Inactivo
    Inactivo --> Buscando: Usuario busca
    Buscando --> Registrando: No encontrado
    Buscando --> Confirmando: Encontrado
    Registrando --> Confirmando: Registrado
    Confirmando --> Generando: Confirmado
    Generando --> Completado: Generado
    Completado --> Verificando: Usuario verifica
    Verificando --> [*]: Verificado
```

---

## 🔄 Ciclo de Vida de una Constancia

### Ciclo Completo

```mermaid
graph LR
    A[Solicitud] --> B[Validación]
    B --> C[Generación]
    C --> D[Almacenamiento]
    D --> E[Registro]
    E --> F[Disponible]
    F --> G[Verificación]
    G --> H[Descarga]
    
    style A fill:#e1f5ff
    style C fill:#fff9c4
    style D fill:#f3e5f5
    style E fill:#fff9c4
    style F fill:#c8e6c9
    style G fill:#b2dfdb
    style H fill:#c8e6c9
```

---

## 📝 Resumen Ejecutivo

### Entradas del Sistema
- ✅ Matrícula de estudiante
- ✅ Datos del estudiante (nombre, carrera)
- ✅ Hash JWT para verificación

### Procesos Principales
1. **Registro**: Crear estudiante en base de datos
2. **Generación**: Crear constancia con hash único
3. **Almacenamiento**: Subir PDF a IPFS
4. **Registro**: Guardar hash en Blockchain
5. **Verificación**: Validar en múltiples capas
6. **Descarga**: Generar PDF dinámicamente

### Salidas del Sistema
- ✅ Constancia en formato PDF
- ✅ Hash JWT único
- ✅ Hash IPFS del PDF
- ✅ Transacción Blockchain
- ✅ Resultado de verificación completo

### Tecnologías Clave
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js Server Actions, Prisma
- **Base de Datos**: SQLite
- **Almacenamiento**: IPFS (Pinata)
- **Blockchain**: Ethereum Sepolia Testnet
- **Seguridad**: JWT, Validación multi-capa

---

**Versión**: 1.0  
**Sistema**: Gestión de Constancias de Servicio Social UJAT  
**Fecha**: 2024


