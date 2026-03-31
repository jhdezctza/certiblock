# Diagramas Técnicos Detallados - Sistema de Constancias UJAT

## 📋 Índice

1. [Diagrama de Clases](#diagrama-de-clases)
2. [Arquitectura de Servicios](#arquitectura-de-servicios)
3. [Flujo de Datos Detallado](#flujo-de-datos-detallado)
4. [Diagrama de Estados](#diagrama-de-estados)
5. [Arquitectura de Despliegue](#arquitectura-de-despliegue)

---

## Diagrama de Clases

### Modelo de Dominio

```mermaid
classDiagram
    class DatabaseService {
        -PrismaClient prisma
        +findStudentByMatricula(string) Promise~Student~
        +createStudent(Student) Promise~Student~
        +findCertificateByHash(string) Promise~Certificate~
        +findCertificateByMatricula(string) Promise~Certificate~
        +createCertificate(Certificate) Promise~Certificate~
        +updateCertificateTransaction(string, string) Promise~void~
        +updateCertificateIPFS(string, string) Promise~void~
        +findUserByUsername(string) Promise~User~
        +createUser(User) Promise~User~
        +close() Promise~void~
    }
    
    class JWTService {
        -JWT_SECRET: string
        +generateCertificateHash(CertificateData) string
        +verifyCertificateHash(string) CertificateData|null
        +isValidHash(string) boolean
        -ensureSecretIsSafe() void
    }
    
    class PDFService {
        +generateCertificatePDF(CertificateData, string, string) Promise~Buffer~
        +createSecurePDFResponse(Buffer, string) Response
        +generateFileName(CertificateData) string
        +generateQRCodeDataUrl(string) Promise~string~
    }
    
    class IPFSService {
        -pinataApiKey: string
        -pinataSecretApiKey: string
        -pinataJwt: string|null
        +uploadPDFToIPFS(Buffer, string) Promise~IPFSResponse~
        +verifyFileExists(string) Promise~object~
        +getIPFSUrl(string) string$
        +isValidIPFSHash(string) boolean$
    }
    
    class BlockchainService {
        -provider: ethers.Provider
        -wallet: ethers.Wallet
        -contract: ethers.Contract
        +registerCertificate(string) Promise~BlockchainResponse~
        +verifyCertificate(string) Promise~object~
        +getTransactionReceipt(string) Promise~object~
        +isValidTransactionHash(string) boolean$
    }
    
    class Student {
        +string matricula
        +string name
        +string career
        +DateTime created_at
    }
    
    class Certificate {
        +int id
        +string matricula
        +string hash
        +string ipfs_hash
        +string blockchain_tx
        +DateTime created_at
    }
    
    class CertificateData {
        +string name
        +string matricula
        +string career
        +number timestamp
    }
    
    class User {
        +int id
        +string username
        +string name
        +string password
        +DateTime created_at
    }
    
    DatabaseService --> Student : manages
    DatabaseService --> Certificate : manages
    DatabaseService --> User : manages
    
    JWTService --> CertificateData : generates/verifies
    PDFService --> CertificateData : uses
    IPFSService --> Certificate : stores PDF
    BlockchainService --> Certificate : registers hash
    
    Student "1" --> "*" Certificate : has
```

### Servicios y Dependencias

```mermaid
classDiagram
    class CertificateActions {
        +searchStudentAction(string) Promise~object~
        +createStudentAction(FormData) Promise~object~
        +generateCertificateAction(string) Promise~object~
        +verifyCertificateAction(string) Promise~VerificationResult~
        +downloadCertificateAction(string) Promise~Response~
        +redirectToConfirmation(string) Promise~void~
        +redirectToNewRegistration(string) Promise~void~
    }
    
    class DatabaseService {
        +findStudentByMatricula(string)
        +createStudent(Student)
        +findCertificateByHash(string)
        +createCertificate(Certificate)
        +updateCertificateTransaction(string, string)
        +updateCertificateIPFS(string, string)
    }
    
    class JWTService {
        +generateCertificateHash(CertificateData)
        +verifyCertificateHash(string)
    }
    
    class PDFService {
        +generateCertificatePDF(...)
        +generateQRCodeDataUrl(string)
    }
    
    class IPFSService {
        +uploadPDFToIPFS(Buffer, string)
        +verifyFileExists(string)
    }
    
    class BlockchainService {
        +registerCertificate(string)
        +verifyCertificate(string)
    }
    
    CertificateActions --> DatabaseService : uses
    CertificateActions --> JWTService : uses
    CertificateActions --> PDFService : uses
    CertificateActions --> IPFSService : uses
    CertificateActions --> BlockchainService : uses
```

---

## Arquitectura de Servicios

### Diagrama de Servicios y Comunicación

```mermaid
graph TB
    subgraph "Cliente"
        Browser[Navegador Web]
    end
    
    subgraph "Next.js Application Server"
        NextApp[Next.js App]
        ServerActions[Server Actions]
        APIRoutes[API Routes]
    end
    
    subgraph "Servicios de Aplicación"
        CertActions[Certificate Actions]
        DBService[Database Service]
        JWTService[JWT Service]
        PDFService[PDF Service]
        IPFSService[IPFS Service]
        BCService[Blockchain Service]
    end
    
    subgraph "Persistencia Local"
        SQLiteDB[(SQLite Database)]
    end
    
    subgraph "Servicios Externos"
        PinataAPI[Pinata API<br/>IPFS Gateway]
        SepoliaRPC[Sepolia RPC<br/>Ethereum Node]
        SmartContract[Smart Contract<br/>CertificateRegistry]
    end
    
    Browser <-->|HTTP/HTTPS| NextApp
    NextApp --> ServerActions
    NextApp --> APIRoutes
    
    ServerActions --> CertActions
    APIRoutes --> CertActions
    
    CertActions --> DBService
    CertActions --> JWTService
    CertActions --> PDFService
    CertActions --> IPFSService
    CertActions --> BCService
    
    DBService <--> SQLiteDB
    
    IPFSService <-->|HTTPS| PinataAPI
    BCService <-->|JSON-RPC| SepoliaRPC
    SepoliaRPC <--> SmartContract
    
    style Browser fill:#e1f5ff
    style NextApp fill:#fff3e0
    style SQLiteDB fill:#c8e6c9
    style PinataAPI fill:#f3e5f5
    style SepoliaRPC fill:#fff9c4
```

### Flujo de Comunicación entre Servicios

```mermaid
sequenceDiagram
    participant Client
    participant NextJS as Next.js Server
    participant Actions as Certificate Actions
    participant DB as Database Service
    participant JWT as JWT Service
    participant PDF as PDF Service
    participant IPFS as IPFS Service
    participant BC as Blockchain Service
    participant ExtIPFS as Pinata IPFS
    participant ExtBC as Sepolia Blockchain

    Client->>NextJS: HTTP Request
    NextJS->>Actions: Call Server Action
    
    Actions->>DB: Query/Update
    DB-->>Actions: Data
    
    Actions->>JWT: Generate/Verify Hash
    JWT-->>Actions: Hash/Data
    
    Actions->>PDF: Generate PDF
    PDF-->>Actions: PDF Buffer
    
    Actions->>IPFS: Upload PDF
    IPFS->>ExtIPFS: API Call
    ExtIPFS-->>IPFS: IPFS Hash
    IPFS-->>Actions: Response
    
    Actions->>BC: Register Hash
    BC->>ExtBC: Smart Contract Call
    ExtBC-->>BC: Transaction Hash
    BC-->>Actions: Response
    
    Actions->>DB: Save Results
    DB-->>Actions: Confirmation
    
    Actions-->>NextJS: Result
    NextJS-->>Client: HTTP Response
```

---

## Flujo de Datos Detallado

### Flujo de Datos: Generación Completa

```mermaid
flowchart TD
    Start([Usuario confirma datos]) --> Input[Input: matricula]
    
    Input --> Validate1{Validar<br/>estudiante existe}
    Validate1 -->|No| Error1[Error: Estudiante<br/>no encontrado]
    Validate1 -->|Sí| CheckDup{Verificar<br/>duplicados}
    
    CheckDup -->|Existe| Error2[Error: Ya existe<br/>constancia]
    CheckDup -->|No existe| CreateData[Crear CertificateData<br/>name, matricula, career]
    
    CreateData --> GenJWT[Generar Hash JWT<br/>JWTService.generateCertificateHash]
    GenJWT --> Hash[Hash JWT generado]
    
    Hash --> VerifyJWT[Verificar Hash JWT<br/>JWTService.verifyCertificateHash]
    VerifyJWT --> CertData[CertificateData con<br/>timestamp]
    
    CertData --> GenQR[Generar QR Code<br/>PDFService.generateQRCodeDataUrl]
    GenQR --> QRData[QR Code Data URL]
    
    CertData --> GenPDF[Generar PDF<br/>PDFService.generateCertificatePDF]
    QRData --> GenPDF
    Hash --> GenPDF
    GenPDF --> PDFBuffer[PDF Buffer]
    
    PDFBuffer --> UploadIPFS[Subir a IPFS<br/>IPFSService.uploadPDFToIPFS]
    UploadIPFS -->|Éxito| IPFSHash[IPFS Hash]
    UploadIPFS -->|Error| IPFSError[Error IPFS<br/>continuar proceso]
    
    IPFSHash --> CreateCert[Crear Certificado en BD<br/>DatabaseService.createCertificate]
    IPFSError --> CreateCert
    Hash --> CreateCert
    CreateCert --> CertDB[Certificado en BD]
    
    CertDB --> UpdateIPFS{¿Tiene<br/>IPFS Hash?}
    UpdateIPFS -->|Sí| UpdateIPFSDB[Actualizar IPFS Hash<br/>DatabaseService.updateCertificateIPFS]
    UpdateIPFS -->|No| RegisterBC
    
    UpdateIPFSDB --> RegisterBC[Registrar en Blockchain<br/>BlockchainService.registerCertificate]
    RegisterBC -->|Éxito| BCTx[Transaction Hash]
    RegisterBC -->|Error| BCError[Error Blockchain<br/>continuar proceso]
    
    BCTx --> UpdateBC[Actualizar TX Hash<br/>DatabaseService.updateCertificateTransaction]
    BCError --> Return
    
    UpdateBC --> Return[Retornar Hash JWT]
    Return --> Redirect[Redirigir a<br/>previsualización]
    
    Error1 --> End([Fin])
    Error2 --> End
    Redirect --> End
    
    style Start fill:#e1f5ff
    style GenJWT fill:#fff9c4
    style UploadIPFS fill:#f3e5f5
    style RegisterBC fill:#fff9c4
    style Return fill:#c8e6c9
    style End fill:#ffcdd2
```

### Flujo de Datos: Verificación Completa

```mermaid
flowchart TD
    Start([Usuario ingresa hash]) --> Input[Input: hash JWT]
    
    Input --> ValidateJWT{Validar Hash JWT<br/>JWTService.verifyCertificateHash}
    ValidateJWT -->|Inválido| Error1[Error: Hash<br/>inválido]
    ValidateJWT -->|Válido| CertData[CertificateData<br/>extraído]
    
    CertData --> SearchDB[Buscar en BD<br/>DatabaseService.findCertificateByHash]
    SearchDB -->|No existe| Error2[Error: No encontrado<br/>en BD]
    SearchDB -->|Existe| CertDB[Certificado de BD]
    
    CertDB --> GetStudent[Obtener Estudiante<br/>DatabaseService.findStudentByMatricula]
    GetStudent --> Student[Student data]
    
    CertDB --> CheckIPFS{¿Tiene<br/>IPFS Hash?}
    CheckIPFS -->|Sí| VerifyIPFS[Verificar en IPFS<br/>IPFSService.verifyFileExists]
    CheckIPFS -->|No| IPFSMissing[Sin IPFS Hash]
    
    VerifyIPFS -->|Existe| IPFSValid[IPFS: Válido<br/>URL disponible]
    VerifyIPFS -->|No existe| IPFSError[IPFS: Error]
    
    CertDB --> VerifyBC[Verificar en Blockchain<br/>BlockchainService.verifyCertificate]
    VerifyBC -->|Registrado| BCValid[Blockchain: Válido<br/>TX Hash disponible]
    VerifyBC -->|No registrado| BCError[Blockchain: Error]
    
    CertData --> ValidateAll{Validar<br/>todas las<br/>verificaciones}
    Student --> ValidateAll
    IPFSValid --> ValidateAll
    IPFSMissing --> ValidateAll
    IPFSError --> ValidateAll
    BCValid --> ValidateAll
    BCError --> ValidateAll
    
    ValidateAll -->|JWT + BD + BC OK| Valid[Constancia Válida<br/>VerificationResult]
    ValidateAll -->|Alguna falla| Invalid[Constancia Inválida<br/>con errores]
    
    Valid --> Return[Retornar resultado<br/>completo]
    Invalid --> Return
    Return --> Display[Mostrar resultado<br/>en UI]
    
    Error1 --> End([Fin])
    Error2 --> End
    Display --> End
    
    style Start fill:#e1f5ff
    style ValidateJWT fill:#fff9c4
    style VerifyIPFS fill:#f3e5f5
    style VerifyBC fill:#fff9c4
    style Valid fill:#c8e6c9
    style Invalid fill:#ffcdd2
    style End fill:#ffcdd2
```

---

## Diagrama de Estados

### Estados de un Certificado

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Usuario solicita constancia
    
    Pendiente --> Generando: Iniciar generación
    Generando --> PDFGenerado: PDF creado
    PDFGenerado --> SubiendoIPFS: Iniciar subida IPFS
    
    SubiendoIPFS --> IPFSSubido: Subida exitosa
    SubiendoIPFS --> IPFSError: Error en subida
    IPFSError --> RegistrandoBC: Continuar sin IPFS
    IPFSSubido --> RegistrandoBC: Continuar con IPFS
    
    RegistrandoBC --> BCRegistrado: Registro exitoso
    RegistrandoBC --> BCError: Error en registro
    BCError --> Completado: Certificado creado (sin BC)
    BCRegistrado --> Completado: Certificado completo
    
    Completado --> Verificado: Usuario verifica
    Verificado --> [*]
    
    note right of Pendiente
        Estado inicial cuando
        se solicita la constancia
    end note
    
    note right of Completado
        Certificado listo para
        verificación y descarga
    end note
```

### Estados de Verificación

```mermaid
stateDiagram-v2
    [*] --> HashIngresado: Usuario ingresa hash
    
    HashIngresado --> ValidandoJWT: Iniciar verificación
    ValidandoJWT --> JWTInvalido: Hash inválido
    ValidandoJWT --> JWTValido: Hash válido
    
    JWTInvalido --> [*]: Error final
    
    JWTValido --> BuscandoBD: Buscar en BD
    BuscandoBD --> NoEncontradoBD: No existe en BD
    BuscandoBD --> EncontradoBD: Existe en BD
    
    NoEncontradoBD --> [*]: Error final
    
    EncontradoBD --> VerificandoIPFS: Verificar IPFS
    VerificandoIPFS --> IPFSValido: IPFS OK
    VerificandoIPFS --> IPFSInvalido: IPFS Error
    VerificandoIPFS --> SinIPFS: Sin hash IPFS
    
    EncontradoBD --> VerificandoBC: Verificar Blockchain
    VerificandoBC --> BCValido: Blockchain OK
    VerificandoBC --> BCInvalido: Blockchain Error
    
    IPFSValido --> Evaluando: Evaluar resultado
    IPFSInvalido --> Evaluando
    SinIPFS --> Evaluando
    BCValido --> Evaluando
    BCInvalido --> Evaluando
    
    Evaluando --> Valido: JWT + BD + BC OK
    Evaluando --> Invalido: Alguna verificación falló
    
    Valido --> [*]: Mostrar resultado válido
    Invalido --> [*]: Mostrar errores
```

---

## Arquitectura de Despliegue

### Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Cliente"
        User[Usuario]
        Browser[Navegador Web]
    end
    
    subgraph "CDN / Edge Network"
        CDN[CDN<br/>Vercel Edge]
    end
    
    subgraph "Servidor de Aplicación"
        NextJS[Next.js Server<br/>Vercel/Node.js]
        ServerActions[Server Actions]
        APIRoutes[API Routes]
    end
    
    subgraph "Base de Datos"
        SQLite[(SQLite Database<br/>Local/File System)]
    end
    
    subgraph "Servicios Externos"
        Pinata[Pinata IPFS<br/>Gateway API]
        Infura[Infura/Alchemy<br/>Ethereum RPC]
        Sepolia[Sepolia Testnet<br/>Ethereum Network]
    end
    
    User --> Browser
    Browser -->|HTTPS| CDN
    CDN -->|HTTPS| NextJS
    NextJS --> ServerActions
    NextJS --> APIRoutes
    
    ServerActions --> SQLite
    APIRoutes --> SQLite
    
    ServerActions -->|HTTPS API| Pinata
    ServerActions -->|JSON-RPC| Infura
    Infura -->|JSON-RPC| Sepolia
    
    style User fill:#e1f5ff
    style NextJS fill:#fff3e0
    style SQLite fill:#c8e6c9
    style Pinata fill:#f3e5f5
    style Sepolia fill:#fff9c4
```

### Arquitectura de Red

```mermaid
graph LR
    subgraph "Internet"
        Internet[Internet]
    end
    
    subgraph "Cliente"
        Client[Cliente Web]
    end
    
    subgraph "Servidor de Aplicación"
        LoadBalancer[Load Balancer]
        App1[App Instance 1]
        App2[App Instance 2]
        App3[App Instance N]
    end
    
    subgraph "Almacenamiento"
        DB[(SQLite DB)]
        FileStorage[File Storage]
    end
    
    subgraph "Servicios Externos"
        IPFS[IPFS Network]
        Blockchain[Blockchain Network]
    end
    
    Client -->|HTTPS| Internet
    Internet -->|HTTPS| LoadBalancer
    LoadBalancer --> App1
    LoadBalancer --> App2
    LoadBalancer --> App3
    
    App1 --> DB
    App2 --> DB
    App3 --> DB
    
    App1 --> FileStorage
    App2 --> FileStorage
    App3 --> FileStorage
    
    App1 -->|API| IPFS
    App2 -->|API| IPFS
    App3 -->|API| IPFS
    
    App1 -->|RPC| Blockchain
    App2 -->|RPC| Blockchain
    App3 -->|RPC| Blockchain
    
    style Client fill:#e1f5ff
    style LoadBalancer fill:#fff3e0
    style DB fill:#c8e6c9
    style IPFS fill:#f3e5f5
    style Blockchain fill:#fff9c4
```

---

## Modelo de Datos Detallado

### Esquema de Base de Datos

```mermaid
erDiagram
    User {
        int id PK "AUTO_INCREMENT"
        string username UK "UNIQUE"
        string name
        string password "HASHED"
        datetime created_at "DEFAULT NOW()"
    }
    
    Student {
        string matricula PK "PRIMARY KEY"
        string name
        string career
        datetime created_at "DEFAULT NOW()"
    }
    
    Certificate {
        int id PK "AUTO_INCREMENT"
        string matricula FK "REFERENCES students.matricula"
        string hash UK "UNIQUE, JWT HASH"
        string ipfs_hash "NULLABLE, IPFS CID"
        string blockchain_tx "NULLABLE, TX HASH"
        datetime created_at "DEFAULT NOW()"
    }
    
    User ||--o{ Certificate : "puede crear"
    Student ||--o{ Certificate : "tiene"
```

### Relaciones y Constraints

```mermaid
graph TD
    Student[Student<br/>matricula PK] -->|1:N| Certificate[Certificate<br/>matricula FK]
    
    Certificate -->|Hash único| JWT[JWT Hash<br/>UNIQUE]
    Certificate -->|Opcional| IPFS[IPFS Hash<br/>NULLABLE]
    Certificate -->|Opcional| BC[Blockchain TX<br/>NULLABLE]
    
    style Student fill:#c8e6c9
    style Certificate fill:#fff9c4
    style JWT fill:#f3e5f5
    style IPFS fill:#e1f5ff
    style BC fill:#fff3e0
```

---

## Flujo de Autenticación y Autorización

### Proceso de Validación

```mermaid
flowchart TD
    Input[Entrada de Usuario] --> Validate1[Validación de Formato]
    Validate1 -->|Inválido| Error1[Error: Formato inválido]
    Validate1 -->|Válido| Sanitize[Sanitización de Datos]
    
    Sanitize --> Validate2[Validación de Negocio]
    Validate2 -->|Inválido| Error2[Error: Regla de negocio]
    Validate2 -->|Válido| Process[Procesamiento]
    
    Process --> Encrypt[Encriptación/Hash]
    Encrypt --> Store[Almacenamiento]
    Store --> Verify[Verificación]
    Verify -->|Falló| Error3[Error: Verificación falló]
    Verify -->|OK| Success[Éxito]
    
    Error1 --> End([Fin])
    Error2 --> End
    Error3 --> End
    Success --> End
    
    style Input fill:#e1f5ff
    style Validate1 fill:#fff9c4
    style Encrypt fill:#c8e6c9
    style Verify fill:#b2dfdb
    style Success fill:#c8e6c9
    style End fill:#ffcdd2
```

---

## Resumen de Integraciones

### Integraciones Externas

```mermaid
graph TB
    App[Aplicación Next.js]
    
    subgraph "Almacenamiento"
        IPFS[IPFS via Pinata<br/>Almacenamiento PDF]
    end
    
    subgraph "Blockchain"
        Sepolia[Ethereum Sepolia<br/>Registro de Hashes]
    end
    
    subgraph "Base de Datos"
        SQLite[SQLite<br/>Datos locales]
    end
    
    App -->|Upload PDF| IPFS
    App -->|Verify PDF| IPFS
    App -->|Register Hash| Sepolia
    App -->|Verify Hash| Sepolia
    App -->|CRUD Operations| SQLite
    
    style App fill:#fff3e0
    style IPFS fill:#f3e5f5
    style Sepolia fill:#fff9c4
    style SQLite fill:#c8e6c9
```

---

**Versión**: 1.0  
**Fecha**: 2024  
**Sistema**: Gestión de Constancias UJAT


