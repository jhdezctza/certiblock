import type { Certificate, Student, User } from '@/types'
import { PrismaClient } from '@prisma/client'

class DatabaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
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
    const cert = await this.prisma.certificate.findUnique({
      where: { hash }
    })

    return cert ? {
      id: cert.id,
      matricula: cert.matricula,
      hash: cert.hash,
      ipfs_hash: cert.ipfsHash || undefined,
      blockchain_tx: cert.blockchainTx || undefined,
      created_at: cert.createdAt.toISOString()
    } : null
  }

  async findCertificateByMatricula(matricula: string): Promise<Certificate | null> {
    const cert = await this.prisma.certificate.findFirst({
      where: { matricula },
      orderBy: { createdAt: 'desc' }
    })

    return cert ? {
      id: cert.id,
      matricula: cert.matricula,
      hash: cert.hash,
      ipfs_hash: cert.ipfsHash || undefined,
      blockchain_tx: cert.blockchainTx || undefined,
      created_at: cert.createdAt.toISOString()
    } : null
  }

  async createCertificate(certificate: Omit<Certificate, 'id' | 'created_at'>): Promise<Certificate> {
    const created = await this.prisma.certificate.create({
      data: {
        matricula: certificate.matricula,
        hash: certificate.hash,
        ipfsHash: certificate.ipfs_hash,
        blockchainTx: certificate.blockchain_tx
      }
    })

    return {
      id: created.id,
      matricula: created.matricula,
      hash: created.hash,
      ipfs_hash: created.ipfsHash || undefined,
      blockchain_tx: created.blockchainTx || undefined,
      created_at: created.createdAt.toISOString()
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