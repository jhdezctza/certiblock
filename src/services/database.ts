import type { Certificate, Student, User } from '@/types'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

class DatabaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  private static sha256Hex(input: string): string {
    return createHash('sha256').update(input).digest('hex')
  }

  private static truncateForLegacyHash(input: string): string {
    // Mantener compatibilidad con columna hash VARCHAR(191)
    return input.length > 191 ? input.slice(0, 191) : input
  }

  async findStudentByMatricula(matricula: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({
      where: { matricula }
    })

    return student ? {
      matricula: student.matricula,
      name: student.name,
      career: student.career,
      created_at: student.createdAt.toISOString()
    } : null
  }

  async createStudent(student: Omit<Student, 'created_at'>): Promise<Student> {
    const created = await this.prisma.student.create({
      data: {
        matricula: student.matricula,
        name: student.name,
        career: student.career
      }
    })

    return {
      matricula: created.matricula,
      name: created.name,
      career: created.career,
      created_at: created.createdAt.toISOString()
    }
  }

  async findCertificateByHash(hash: string): Promise<Certificate | null> {
    const digest = DatabaseService.sha256Hex(hash)

    // 1) Buscar por digest (forma recomendada / no se trunca)
    // Nota: en algunos entornos el tipado de Prisma puede quedar desfasado hasta regenerar/reiniciar TS server.
    // Usamos cast a any para no bloquear compilación.
    const byDigest = await (this.prisma.certificate as any).findUnique({
      where: { hashDigest: digest }
    })
    const cert = byDigest || await (this.prisma.certificate as any).findFirst({
      // 2) Fallback: buscar por JWT completo (si se guardó)
      where: {
        OR: [
          { hashFull: hash },
          // 3) Legacy: hash truncado guardado en `hash`
          { hash: hash },
          { hash: { startsWith: hash.slice(0, 50) } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return cert ? {
      id: (cert as any).id,
      matricula: (cert as any).matricula,
      hash: (cert as any).hash,
      hash_full: (cert as any).hashFull || undefined,
      hash_digest: (cert as any).hashDigest || undefined,
      ipfs_hash: (cert as any).ipfsHash || undefined,
      blockchain_tx: (cert as any).blockchainTx || undefined,
      created_at: (cert as any).createdAt.toISOString()
    } : null
  }

  async findCertificateByMatricula(matricula: string): Promise<Certificate | null> {
    const cert = await this.prisma.certificate.findFirst({
      where: { matricula },
      orderBy: { createdAt: 'desc' }
    })

    return cert ? {
      id: (cert as any).id,
      matricula: (cert as any).matricula,
      hash: (cert as any).hash,
      hash_full: (cert as any).hashFull || undefined,
      hash_digest: (cert as any).hashDigest || undefined,
      ipfs_hash: (cert as any).ipfsHash || undefined,
      blockchain_tx: (cert as any).blockchainTx || undefined,
      created_at: (cert as any).createdAt.toISOString()
    } : null
  }

  async createCertificate(certificate: Omit<Certificate, 'id' | 'created_at'>): Promise<Certificate> {
    const fullHash = certificate.hash
    const digest = DatabaseService.sha256Hex(fullHash)
    const legacyHash = DatabaseService.truncateForLegacyHash(fullHash)

    const created = await this.prisma.certificate.create({
      data: {
        matricula: certificate.matricula,
        hash: legacyHash,
        ...( { hashFull: fullHash, hashDigest: digest } as any ),
        ipfsHash: certificate.ipfs_hash,
        blockchainTx: certificate.blockchain_tx
      }
    })

    return {
      id: (created as any).id,
      matricula: (created as any).matricula,
      hash: (created as any).hash,
      hash_full: (created as any).hashFull || undefined,
      hash_digest: (created as any).hashDigest || undefined,
      ipfs_hash: (created as any).ipfsHash || undefined,
      blockchain_tx: (created as any).blockchainTx || undefined,
      created_at: (created as any).createdAt.toISOString()
    }
  }

  async updateCertificateTransaction(hash: string, transactionHash: string): Promise<void> {
    // update() falla si no existe el registro. updateMany() es idempotente y evita crash en runtime.
    await this.prisma.certificate.updateMany({
      where: { hash },
      data: { blockchainTx: transactionHash }
    })
  }

  async updateCertificateIPFS(hash: string, ipfsHash: string): Promise<void> {
    // update() falla si no existe el registro. updateMany() es idempotente y evita crash en runtime.
    await this.prisma.certificate.updateMany({
      where: { hash },
      data: { ipfsHash }
    })
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username }
    })

    return user ? {
      id: user.id,
      username: user.username,
      name: user.name,
      password: user.password,
      created_at: user.createdAt.toISOString()
    } : null
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        username: user.username,
        name: user.name,
        password: user.password
      }
    })

    return {
      id: created.id,
      username: created.username,
      name: created.name,
      password: created.password,
      created_at: created.createdAt.toISOString()
    }
  }

  async close() {
    await this.prisma.$disconnect()
  }
}

export const database = new DatabaseService()

// import type { Certificate, Student, User } from '@/types'
// import Database from 'better-sqlite3'
// import { readFileSync } from 'fs'
// import { join } from 'path'

// class DatabaseService {
//   private db: Database.Database

//   constructor() {
//     const dbPath = join(process.cwd(), 'certificates.db')
//     this.db = new Database(dbPath)
//     this.init()
//   }

//   private init() {
//     const schema = readFileSync(join(process.cwd(), 'src/lib/database/schema.sql'), 'utf-8')
//     this.db.exec(schema)
//   }

//   findStudentByMatricula(matricula: string): Student | null {
//     const stmt = this.db.prepare('SELECT * FROM students WHERE matricula = ?')
//     return stmt.get(matricula) as Student | null
//   }

//   createStudent(student: Omit<Student, 'created_at'>): Student {
//     const stmt = this.db.prepare(`
//       INSERT INTO students (matricula, name, career)
//       VALUES (?, ?, ?)
//     `)

//     stmt.run(student.matricula, student.name, student.career)
//     return this.findStudentByMatricula(student.matricula)!
//   }

//   findCertificateByHash(hash: string): Certificate | null {
//     const stmt = this.db.prepare('SELECT * FROM certificates WHERE hash = ?')
//     return stmt.get(hash) as Certificate | null
//   }

//   createCertificate(certificate: Omit<Certificate, 'id' | 'created_at'>): Certificate {
//     const stmt = this.db.prepare(`
//       INSERT INTO certificates (matricula, hash, blockchain_tx)
//       VALUES (?, ?, ?)
//     `)

//     const result = stmt.run(certificate.matricula, certificate.hash, certificate.blockchain_tx)

//     const getStmt = this.db.prepare('SELECT * FROM certificates WHERE id = ?')
//     return getStmt.get(result.lastInsertRowid) as Certificate
//   }

//   updateCertificateTransaction(hash: string, transactionHash: string): void {
//     const stmt = this.db.prepare('UPDATE certificates SET blockchain_tx = ? WHERE hash = ?')
//     stmt.run(transactionHash, hash)
//   }

//   findUserByUsername(username: string): User | null {
//     const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?')
//     return stmt.get(username) as User | null
//   }

//   createUser(user: Omit<User, 'id' | 'created_at'>): User {
//     const stmt = this.db.prepare(`
//       INSERT INTO users (username, name, password)
//       VALUES (?, ?, ?)
//     `)

//     const result = stmt.run(user.username, user.name, user.password)

//     const getStmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
//     return getStmt.get(result.lastInsertRowid) as User
//   }

//   close() {
//     this.db.close()
//   }
// }

// export const database = new DatabaseService()