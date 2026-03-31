import type { CertificateData } from '@/types'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'certificate-secret-key-2024'

export class JWTService {
  private static ensureSecretIsSafe() {
    const usingDefault = JWT_SECRET === 'certificate-secret-key-2024'
    if (process.env.NODE_ENV === 'production' && usingDefault) {
      throw new Error('JWT_SECRET no configurado en producción')
    }
    if (usingDefault) {
      console.warn('Usando JWT_SECRET por defecto. Configure JWT_SECRET para mayor seguridad.')
    }
  }

  static generateCertificateHash(data: Omit<CertificateData, 'timestamp'>): string {
    JWTService.ensureSecretIsSafe()
    const certificateData: CertificateData = {
      ...data,
      timestamp: Date.now()
    }

    return jwt.sign(certificateData, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '100y'
    })
  }

  static verifyCertificateHash(hash: string): CertificateData | null {
    try {
      JWTService.ensureSecretIsSafe()
      const decoded = jwt.verify(hash, JWT_SECRET) as CertificateData
      return decoded
    } catch (error) {
      return null
    }
  }

  static isValidHash(hash: string): boolean {
    try {
      JWTService.ensureSecretIsSafe()
      jwt.verify(hash, JWT_SECRET)
      return true
    } catch {
      return false
    }
  }
}