# Documentación del Sistema de Gestión de Constancias de Servicio Social UJAT

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [Flujos de Proceso](#flujos-de-proceso)
5. [Diagramas de Secuencia](#diagramas-de-secuencia)
6. [Componentes del Sistema](#componentes-del-sistema)
7. [Entradas y Salidas](#entradas-y-salidas)
8. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Resumen Ejecutivo

El **Sistema de Gestión de Constancias de Servicio Social** es una aplicación web desarrollada para la Universidad Juárez Autónoma de Tabasco (UJAT) que permite:

- **Registrar estudiantes** en el sistema
- **Generar constancias digitales** con firma criptográfica
- **Almacenar constancias** en IPFS (almacenamiento descentralizado)
- **Registrar hashes** en Blockchain (Ethereum Sepolia Testnet) para garantizar inmutabilidad
- **Verificar la autenticidad** de constancias mediante múltiples validaciones
- **Descargar constancias** en formato PDF con código QR

### Características Principales

✅ **Seguridad Criptográfica**: Uso de JWT para generar hashes únicos e inmutables  
✅ **Almacenamiento Descentralizado**: IPFS para almacenar PDFs de forma permanente  
✅ **Registro Inmutable**: Blockchain para garantizar la autenticidad  
✅ **Verificación Multi-capa**: Validación en base de datos, IPFS y Blockchain  
✅ **Interfaz Moderna**: UI/UX con React, Next.js y Tailwind CSS  

---

## Arquitectura del Sistema

### Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[Interfaz de Usuario<br/>Next.js 15 + React 19]
    end

    subgraph "Servidor Next.js"
        API[API Routes<br/>Server Actions]
        ACTIONS[Certificate Actions]
        SERVICES[Servicios]
    end

    subgraph "Servicios Internos"
        DB_SERVICE[(Database Service<br/>Prisma + SQLite)]
        JWT_SERVICE[JWT Service<br/>Hash Generation]
        PDF_SERVICE[PDF Service<br/>React PDF]
        IPFS_SERVICE[IPFS Service<br/>Pinata]
        BLOCKCHAIN_SERVICE[Blockchain Service<br/>Ethers.js]
    end

    subgraph "Almacenamiento"
        SQLITE[(SQLite Database<br/>certificates.db)]
        IPFS_NETWORK[IPFS Network<br/>Pinata Gateway]
        BLOCKCHAIN[Ethereum Sepolia<br/>Testnet]
    end

    UI -->|HTTP Requests| API
    API --> ACTIONS
    ACTIONS --> SERVICES
    
    SERVICES --> DB_SERVICE
    SERVICES --> JWT_SERVICE
    SERVICES --> PDF_SERVICE
    SERVICES --> IPFS_SERVICE
    SERVICES --> BLOCKCHAIN_SERVICE
    
    DB_SERVICE --> SQLITE
    IPFS_SERVICE -->|Upload PDF| IPFS_NETWORK
    BLOCKCHAIN_SERVICE -->|Register Hash| BLOCKCHAIN
    
    IPFS_NETWORK -.->|Verify| IPFS_SERVICE
    BLOCKCHAIN -.->|Verify| BLOCKCHAIN_SERVICE

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style SQLITE fill:#e8f5e9
    style IPFS_NETWORK fill:#f3e5f5
    style BLOCKCHAIN fill:#fff9c4
```

### Arquitectura de Capas

```mermaid
graph LR
    subgraph "Capa de Presentación"
        A1[Páginas Next.js]
        A2[Componentes React]
        A3[UI Components]
    end

    subgraph "Capa de Lógica de Negocio"
        B1[Server Actions]
        B2[Validaciones]
        B3[Orquestación]
    end

    subgraph "Capa de Servicios"
        C1[Database Service]
        C2[JWT Service]
        C3[PDF Service]
        C4[IPFS Service]
        C5[Blockchain Service]
    end

    subgraph "Capa de Persistencia"
        D1[SQLite DB]
        D2[IPFS Network]
        D3[Blockchain]
    end

    A1 --> B1
    A2 --> B1
    A3 --> A2
    B1 --> B2
    B2 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
    B3 --> C4
    B3 --> C5
    C1 --> D1
    C4 --> D2
    C5 --> D3

    style A1 fill:#e3f2fd
    style B1 fill:#fff3e0
    style C1 fill:#f1f8e9
    style D1 fill:#fce4ec
```

---

## Modelo de Datos

### Diagrama Entidad-Relación

```mermaid
erDiagram
    User ||--o{ Certificate : "puede crear"
    Student ||--o{ Certificate : "tiene"
    
    User {
        int id PK
        string username UK
        string name
        string password
        datetime created_at
    }
    
    Student {
        string matricula PK
        string name
        string career
        datetime created_at
    }
    
    Certificate {
        int id PK
        string matricula FK
        string hash UK
        string ipfs_hash
        string blockchain_tx
        datetime created_at
    }
```

### Esquema de Base de Datos

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string name
        +string password
        +DateTime createdAt
    }
    
    class Student {
        +string matricula
        +string name
        +string career
        +DateTime createdAt
        +Certificate[] certificates
    }
    
    class Certificate {
        +int id
        +string matricula
        +string hash
        +string ipfsHash
        +string blockchainTx
        +DateTime createdAt
        +Student student
    }
    
    Student "1" --> "*" Certificate : tiene
```

---

## Flujos de Proceso

### 1. Flujo de Búsqueda y Registro de Estudiante

```mermaid
flowchart TD
    Start([Usuario ingresa matrícula]) --> Search{¿Estudiante<br/>existe?}
    
    Search -->|Sí| ShowData[Mostrar datos<br/>del estudiante]
    Search -->|No| ShowForm[Mostrar formulario<br/>de registro]
    
    ShowData --> CheckCert{¿Tiene<br/>constancia?}
    CheckCert -->|Sí| ShowError[Error: Ya existe<br/>constancia]
    CheckCert -->|No| Generate[Generar constancia]
    
    ShowForm --> FillForm[Usuario completa<br/>formulario]
    FillForm --> CreateStudent[Crear estudiante<br/>en BD]
    CreateStudent --> Generate
    
    Generate --> End([Fin])
    ShowError --> End
    
    style Start fill:#e1f5ff
    style Generate fill:#c8e6c9
    style End fill:#ffcdd2
```

### 2. Flujo de Generación de Constancia

```mermaid
flowchart TD
    Start([Inicio: Generar Constancia]) --> Validate[Validar estudiante<br/>existe]
    
    Validate -->|No existe| Error1[Error: Estudiante<br/>no encontrado]
    Validate -->|Existe| CheckDuplicate{¿Ya tiene<br/>constancia?}
    
    CheckDuplicate -->|Sí| Error2[Error: Ya existe<br/>constancia]
    CheckDuplicate -->|No| GenerateHash[Generar Hash JWT<br/>con datos del estudiante]
    
    GenerateHash --> GeneratePDF[Generar PDF<br/>con React PDF]
    GeneratePDF --> GenerateQR[Generar código QR<br/>con URL de verificación]
    GenerateQR --> CreatePDF[Crear buffer PDF<br/>con QR incluido]
    
    CreatePDF --> UploadIPFS[Subir PDF a IPFS<br/>Pinata]
    UploadIPFS -->|Éxito| SaveIPFSHash[Guardar hash IPFS<br/>en BD]
    UploadIPFS -->|Error| LogIPFSError[Registrar error IPFS<br/>continuar proceso]
    
    SaveIPFSHash --> CreateCertDB[Crear registro<br/>en BD]
    LogIPFSError --> CreateCertDB
    
    CreateCertDB --> RegisterBlockchain[Registrar hash<br/>en Blockchain]
    RegisterBlockchain -->|Éxito| SaveBlockchainTx[Guardar TX hash<br/>en BD]
    RegisterBlockchain -->|Error| LogBlockchainError[Registrar error<br/>continuar proceso]
    
    SaveBlockchainTx --> Success[Éxito: Retornar hash]
    LogBlockchainError --> Success
    
    Success --> End([Fin: Redirigir a<br/>previsualización])
    Error1 --> End
    Error2 --> End
    
    style Start fill:#e1f5ff
    style GenerateHash fill:#fff9c4
    style UploadIPFS fill:#f3e5f5
    style RegisterBlockchain fill:#fff9c4
    style Success fill:#c8e6c9
    style End fill:#ffcdd2
```

### 3. Flujo de Verificación de Constancia

```mermaid
flowchart TD
    Start([Usuario ingresa hash]) --> ValidateHash{¿Hash JWT<br/>válido?}
    
    ValidateHash -->|No| Error1[Error: Hash<br/>inválido]
    ValidateHash -->|Sí| ExtractData[Extraer datos<br/>del certificado]
    
    ExtractData --> SearchDB{¿Existe en<br/>Base de Datos?}
    SearchDB -->|No| Error2[Error: No encontrado<br/>en BD]
    SearchDB -->|Sí| GetStudent[Obtener datos<br/>del estudiante]
    
    GetStudent --> VerifyIPFS{¿Tiene hash<br/>IPFS?}
    VerifyIPFS -->|Sí| CheckIPFS[Verificar archivo<br/>en IPFS]
    VerifyIPFS -->|No| LogIPFSMissing[Registrar: Sin IPFS]
    
    CheckIPFS -->|Existe| IPFSOk[IPFS: Válido]
    CheckIPFS -->|No existe| IPFSError[IPFS: Error]
    
    LogIPFSMissing --> VerifyBlockchain
    IPFSOk --> VerifyBlockchain
    IPFSError --> VerifyBlockchain
    
    VerifyBlockchain[Verificar en<br/>Blockchain] -->|Registrado| BlockchainOk[Blockchain: Válido]
    VerifyBlockchain -->|No registrado| BlockchainError[Blockchain: Error]
    
    BlockchainOk --> CheckAll{¿Todas las<br/>verificaciones OK?}
    BlockchainError --> CheckAll
    
    CheckAll -->|JWT + BD + Blockchain OK| Valid[Constancia Válida<br/>Mostrar datos]
    CheckAll -->|Alguna falla| Invalid[Constancia Inválida<br/>Mostrar errores]
    
    Valid --> End([Fin])
    Invalid --> End
    Error1 --> End
    Error2 --> End
    
    style Start fill:#e1f5ff
    style ValidateHash fill:#fff9c4
    style VerifyIPFS fill:#f3e5f5
    style VerifyBlockchain fill:#fff9c4
    style Valid fill:#c8e6c9
    style Invalid fill:#ffcdd2
    style End fill:#ffcdd2
```

### 4. Flujo de Descarga de Constancia

```mermaid
flowchart TD
    Start([Usuario solicita descarga]) --> ValidateHash{¿Hash JWT<br/>válido?}
    
    ValidateHash -->|No| Error[Error: Hash inválido]
    ValidateHash -->|Sí| ExtractData[Extraer datos<br/>del certificado]
    
    ExtractData --> GenerateQR[Generar código QR<br/>con URL de verificación]
    GenerateQR --> GeneratePDF[Generar PDF<br/>con React PDF]
    GeneratePDF --> CreateBuffer[Crear buffer PDF]
    CreateBuffer --> SetHeaders[Configurar headers<br/>de seguridad HTTP]
    SetHeaders --> Download[Descargar PDF]
    
    Download --> End([Fin])
    Error --> End
    
    style Start fill:#e1f5ff
    style GeneratePDF fill:#c8e6c9
    style Download fill:#c8e6c9
    style End fill:#ffcdd2
```

---

## Diagramas de Secuencia

### 1. Secuencia: Generación de Constancia

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant Action as Certificate Action
    participant DB as Database Service
    participant JWT as JWT Service
    participant PDF as PDF Service
    participant IPFS as IPFS Service
    participant BC as Blockchain Service
    participant SQLite as SQLite DB
    participant Pinata as IPFS Network
    participant Sepolia as Blockchain

    U->>UI: Ingresa matrícula y confirma
    UI->>Action: generateCertificateAction(matricula)
    
    Action->>DB: findStudentByMatricula()
    DB->>SQLite: SELECT student
    SQLite-->>DB: Student data
    DB-->>Action: Student object
    
    Action->>DB: findCertificateByMatricula()
    DB->>SQLite: SELECT certificate
    SQLite-->>DB: Certificate or null
    DB-->>Action: null (no existe)
    
    Action->>JWT: generateCertificateHash(data)
    JWT-->>Action: Hash JWT
    
    Action->>JWT: verifyCertificateHash(hash)
    JWT-->>Action: CertificateData con timestamp
    
    Action->>PDF: generateQRCodeDataUrl(url)
    PDF-->>Action: QR Code Data URL
    
    Action->>PDF: generateCertificatePDF(data, hash, qr)
    PDF-->>Action: PDF Buffer
    
    Action->>IPFS: uploadPDFToIPFS(buffer, filename)
    IPFS->>Pinata: POST /pinFileToIPFS
    Pinata-->>IPFS: IPFS Hash
    IPFS-->>Action: IPFS Response
    
    Action->>DB: createCertificate(hash, ipfsHash)
    DB->>SQLite: INSERT certificate
    SQLite-->>DB: Certificate created
    DB-->>Action: Certificate object
    
    Action->>BC: registerCertificate(hash)
    BC->>Sepolia: Smart Contract Call
    Sepolia-->>BC: Transaction Hash
    BC-->>Action: Blockchain Response
    
    Action->>DB: updateCertificateTransaction(hash, txHash)
    DB->>SQLite: UPDATE certificate
    SQLite-->>DB: Updated
    DB-->>Action: Success
    
    Action-->>UI: { success: true, hash }
    UI-->>U: Redirigir a previsualización
```

### 2. Secuencia: Verificación de Constancia

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant Action as Certificate Action
    participant JWT as JWT Service
    participant DB as Database Service
    participant IPFS as IPFS Service
    participant BC as Blockchain Service
    participant SQLite as SQLite DB
    participant Pinata as IPFS Network
    participant Sepolia as Blockchain

    U->>UI: Ingresa hash de constancia
    UI->>Action: verifyCertificateAction(hash)
    
    Action->>JWT: verifyCertificateHash(hash)
    JWT-->>Action: CertificateData o null
    
    alt Hash JWT inválido
        Action-->>UI: { isValid: false, error: "Hash inválido" }
    else Hash JWT válido
        Action->>DB: findCertificateByHash(hash)
        DB->>SQLite: SELECT certificate
        SQLite-->>DB: Certificate data
        DB-->>Action: Certificate object
        
        Action->>DB: findStudentByMatricula(matricula)
        DB->>SQLite: SELECT student
        SQLite-->>DB: Student data
        DB-->>Action: Student object
        
        alt Tiene hash IPFS
            Action->>IPFS: verifyFileExists(ipfsHash)
            IPFS->>Pinata: HEAD request
            Pinata-->>IPFS: 200 OK o 404
            IPFS-->>Action: { exists: true/false, url }
        else No tiene hash IPFS
            IPFS-->>Action: { exists: false, error: "Sin IPFS" }
        end
        
        Action->>BC: verifyCertificate(hash)
        BC->>Sepolia: Smart Contract Call
        Sepolia-->>BC: { exists: true/false, issuer, timestamp }
        BC-->>Action: Verification result
        
        Action->>Action: Determinar validez<br/>(JWT + BD + Blockchain)
        Action-->>UI: VerificationResult completo
        UI-->>U: Mostrar resultado de verificación
    end
```

### 3. Secuencia: Descarga de Constancia

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant API as API Route
    participant JWT as JWT Service
    participant PDF as PDF Service

    U->>UI: Clic en "Descargar PDF"
    UI->>API: POST /api/certificates/download<br/>{ hash }
    
    API->>JWT: verifyCertificateHash(hash)
    JWT-->>API: CertificateData
    
    API->>PDF: generateQRCodeDataUrl(verificationUrl)
    PDF-->>API: QR Code Data URL
    
    API->>PDF: generateCertificatePDF(data, hash, qr)
    PDF-->>API: PDF Buffer
    
    API->>PDF: createSecurePDFResponse(buffer, filename)
    PDF-->>API: Response con headers HTTP
    
    API-->>UI: PDF File Download
    UI-->>U: Descarga automática del PDF
```

---

## Componentes del Sistema

### Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend Components"
        Welcome[Welcome Page]
        Search[Student Search]
        Form[Student Form]
        Confirmation[Student Confirmation]
        Verification[Verification Result]
        Preview[Certificate Preview]
    end
    
    subgraph "Backend Actions"
        SearchAction[searchStudentAction]
        CreateAction[createStudentAction]
        GenerateAction[generateCertificateAction]
        VerifyAction[verifyCertificateAction]
        DownloadAction[downloadCertificateAction]
    end
    
    subgraph "Services Layer"
        DatabaseService[(Database Service)]
        JWTService[JWT Service]
        PDFService[PDF Service]
        IPFSService[IPFS Service]
        BlockchainService[Blockchain Service]
    end
    
    subgraph "External Services"
        SQLite[(SQLite)]
        Pinata[Pinata IPFS]
        Sepolia[Ethereum Sepolia]
    end
    
    Welcome --> Search
    Search --> SearchAction
    Search --> Form
    Form --> CreateAction
    Search --> Confirmation
    Confirmation --> GenerateAction
    Verification --> VerifyAction
    Preview --> DownloadAction
    
    SearchAction --> DatabaseService
    CreateAction --> DatabaseService
    GenerateAction --> DatabaseService
    GenerateAction --> JWTService
    GenerateAction --> PDFService
    GenerateAction --> IPFSService
    GenerateAction --> BlockchainService
    VerifyAction --> DatabaseService
    VerifyAction --> JWTService
    VerifyAction --> IPFSService
    VerifyAction --> BlockchainService
    DownloadAction --> JWTService
    DownloadAction --> PDFService
    
    DatabaseService --> SQLite
    IPFSService --> Pinata
    BlockchainService --> Sepolia
    
    style Welcome fill:#e3f2fd
    style GenerateAction fill:#fff3e0
    style DatabaseService fill:#f1f8e9
    style SQLite fill:#fce4ec
```

### Estructura de Componentes React

```mermaid
graph TD
    App[App Layout] --> Welcome[Welcome Page]
    App --> Search[Student Search Page]
    App --> Form[Student Form Page]
    App --> Confirmation[Confirmation Page]
    App --> Verification[Verification Page]
    App --> Preview[Preview Page]
    
    Welcome --> WelcomeCard[WelcomeCard Component]
    
    Search --> SearchForm[Search Form]
    
    Form --> StudentForm[Student Form Component]
    
    Confirmation --> StudentConfirmation[Student Confirmation Component]
    
    Verification --> VerificationResult[Verification Result Component]
    VerificationResult --> QRCode[QR Code Display]
    VerificationResult --> CertificateInfo[Certificate Info Table]
    VerificationResult --> StudentInfo[Student Info Table]
    
    Preview --> CertificatePreview[Certificate Preview Component]
    Preview --> PDFViewer[PDF Viewer]
    
    CertificatePreview --> CertificatePDF[Certificate PDF Component]
    
    style App fill:#e1f5ff
    style Welcome fill:#c8e6c9
    style Search fill:#fff9c4
    style Form fill:#fff9c4
    style Confirmation fill:#f3e5f5
    style Verification fill:#e1bee7
    style Preview fill:#b2dfdb
```

---

## Entradas y Salidas

### Entradas del Sistema

#### 1. Registro de Estudiante
- **Entrada**: 
  - `matricula` (string): Matrícula del estudiante
  - `name` (string): Nombre completo del estudiante
  - `career` (string): Carrera del estudiante
- **Validaciones**:
  - Todos los campos son requeridos
  - Matrícula debe ser única
  - Matrícula se normaliza a mayúsculas

#### 2. Búsqueda de Estudiante
- **Entrada**: 
  - `matricula` (string): Matrícula a buscar
- **Validaciones**:
  - Matrícula no puede estar vacía
  - Se normaliza a mayúsculas

#### 3. Generación de Constancia
- **Entrada**: 
  - `matricula` (string): Matrícula del estudiante
- **Validaciones**:
  - Estudiante debe existir
  - No debe tener constancia previa
- **Procesamiento**:
  - Genera hash JWT con datos del estudiante
  - Crea PDF con código QR
  - Sube a IPFS
  - Registra en Blockchain

#### 4. Verificación de Constancia
- **Entrada**: 
  - `hash` (string): Hash JWT de la constancia
- **Validaciones**:
  - Hash debe ser válido (formato JWT)
  - Hash debe existir en base de datos
- **Procesamiento**:
  - Verifica JWT
  - Busca en base de datos
  - Verifica en IPFS
  - Verifica en Blockchain

#### 5. Descarga de Constancia
- **Entrada**: 
  - `hash` (string): Hash JWT de la constancia
- **Validaciones**:
  - Hash debe ser válido
- **Procesamiento**:
  - Genera PDF dinámicamente
  - Retorna archivo PDF con headers de seguridad

### Salidas del Sistema

#### 1. Respuesta de Búsqueda
```typescript
{
  student: Student | null
}
```

#### 2. Respuesta de Registro
```typescript
{
  success: boolean
  student?: Student
}
```

#### 3. Respuesta de Generación
```typescript
{
  success: boolean
  hash?: string
  error?: string
}
```

#### 4. Respuesta de Verificación
```typescript
{
  isValid: boolean
  certificateData?: CertificateData
  certificate?: Certificate
  student?: Student
  ipfsVerified?: boolean
  ipfsUrl?: string
  blockchainVerified?: boolean
  blockchainTx?: string
  error?: string
}
```

#### 5. Descarga de PDF
- **Tipo**: `application/pdf`
- **Headers de Seguridad**:
  - `Content-Disposition: attachment`
  - `Content-Security-Policy: default-src 'none'`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Cache-Control: no-cache, no-store, must-revalidate`

---

## Tecnologías Utilizadas

### Frontend
- **Next.js 15.5.2**: Framework React con App Router
- **React 19.1.0**: Biblioteca de UI
- **TypeScript 5**: Tipado estático
- **Tailwind CSS 4**: Estilos
- **Framer Motion**: Animaciones
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Sonner**: Notificaciones toast

### Backend
- **Next.js Server Actions**: Lógica del servidor
- **Prisma 6.13.0**: ORM para base de datos
- **SQLite**: Base de datos relacional
- **jsonwebtoken**: Generación y verificación de JWT

### Servicios Externos
- **IPFS (Pinata)**: Almacenamiento descentralizado de PDFs
- **Ethereum Sepolia**: Blockchain para registro inmutable
- **Ethers.js 6.15.0**: Interacción con blockchain

### Generación de Documentos
- **React PDF (@react-pdf/renderer)**: Generación de PDFs
- **QRCode**: Generación de códigos QR

### Utilidades
- **Axios**: Cliente HTTP
- **Form-Data**: Manejo de formularios multipart
- **Date-fns**: Manipulación de fechas

---

## Flujo de Datos Completo

### Diagrama de Flujo de Datos (DFD)

```mermaid
flowchart LR
    subgraph "Entidades Externas"
        Usuario[Usuario]
        IPFS_Network[IPFS Network]
        Blockchain_Net[Blockchain Network]
    end
    
    subgraph "Sistema"
        subgraph "Proceso 1: Gestión de Estudiantes"
            P1_1[Buscar Estudiante]
            P1_2[Registrar Estudiante]
        end
        
        subgraph "Proceso 2: Generación de Constancias"
            P2_1[Generar Hash JWT]
            P2_2[Generar PDF]
            P2_3[Subir a IPFS]
            P2_4[Registrar en Blockchain]
        end
        
        subgraph "Proceso 3: Verificación"
            P3_1[Verificar JWT]
            P3_2[Verificar BD]
            P3_3[Verificar IPFS]
            P3_4[Verificar Blockchain]
        end
        
        subgraph "Almacenamiento"
            D1[(Base de Datos)]
        end
    end
    
    Usuario -->|Matrícula| P1_1
    Usuario -->|Datos Estudiante| P1_2
    Usuario -->|Hash| P3_1
    
    P1_1 -->|Consulta| D1
    P1_2 -->|Insert| D1
    
    P2_1 -->|Hash| P2_2
    P2_2 -->|PDF Buffer| P2_3
    P2_3 -->|IPFS Hash| P2_4
    P2_4 -->|TX Hash| D1
    P2_3 -->|Upload| IPFS_Network
    P2_4 -->|Register| Blockchain_Net
    
    P3_1 -->|Datos| P3_2
    P3_2 -->|Consulta| D1
    P3_2 -->|IPFS Hash| P3_3
    P3_3 -->|Verify| IPFS_Network
    P3_2 -->|Hash| P3_4
    P3_4 -->|Verify| Blockchain_Net
    
    P3_1 -->|Resultado| Usuario
    P2_4 -->|Hash| Usuario
    
    style Usuario fill:#e1f5ff
    style D1 fill:#c8e6c9
    style IPFS_Network fill:#f3e5f5
    style Blockchain_Net fill:#fff9c4
```

---

## Casos de Uso

### Diagrama de Casos de Uso

```mermaid
graph LR
    Usuario[Usuario del Sistema]
    
    UC1[UC1: Buscar Estudiante]
    UC2[UC2: Registrar Estudiante]
    UC3[UC3: Generar Constancia]
    UC4[UC4: Verificar Constancia]
    UC5[UC5: Descargar Constancia]
    
    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5
    
    UC1 -.->|Si no existe| UC2
    UC1 -.->|Si existe| UC3
    UC3 -.->|Genera hash| UC4
    UC3 -.->|Genera PDF| UC5
    
    style Usuario fill:#e1f5ff
    style UC1 fill:#c8e6c9
    style UC2 fill:#c8e6c9
    style UC3 fill:#fff9c4
    style UC4 fill:#f3e5f5
    style UC5 fill:#b2dfdb
```

---

## Seguridad

### Medidas de Seguridad Implementadas

1. **JWT con Secret Key**: Hashes firmados criptográficamente
2. **Headers HTTP de Seguridad**: 
   - Content-Security-Policy
   - X-Content-Type-Options
   - X-Frame-Options
   - Cache-Control
3. **Validación de Entradas**: Validación en cliente y servidor
4. **Almacenamiento Seguro**: Variables de entorno para secretos
5. **Registro Inmutable**: Blockchain garantiza autenticidad
6. **Verificación Multi-capa**: JWT + BD + IPFS + Blockchain

### Flujo de Seguridad

```mermaid
graph TD
    Input[Entrada de Usuario] --> Validate[Validación de Entrada]
    Validate --> Sanitize[Sanitización]
    Sanitize --> Process[Procesamiento]
    Process --> Encrypt[Encriptación JWT]
    Encrypt --> Store[Almacenamiento]
    Store --> Verify[Verificación Multi-capa]
    Verify --> Output[Salida Segura]
    
    style Input fill:#ffcdd2
    style Validate fill:#fff9c4
    style Encrypt fill:#c8e6c9
    style Verify fill:#b2dfdb
    style Output fill:#e1f5ff
```

---

## Conclusión

Este sistema proporciona una solución completa y segura para la gestión de constancias de servicio social, utilizando tecnologías modernas y mejores prácticas de seguridad. La integración con IPFS y Blockchain garantiza la autenticidad e inmutabilidad de los documentos generados.

### Características Destacadas

✅ **Arquitectura Modular**: Separación clara de responsabilidades  
✅ **Escalabilidad**: Diseño preparado para crecimiento  
✅ **Seguridad**: Múltiples capas de validación y verificación  
✅ **Trazabilidad**: Registro completo en Blockchain  
✅ **Disponibilidad**: Almacenamiento descentralizado en IPFS  
✅ **Usabilidad**: Interfaz intuitiva y moderna  

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Autor**: Sistema de Gestión de Constancias UJAT


