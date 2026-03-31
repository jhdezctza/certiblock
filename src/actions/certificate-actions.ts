'use server'

import { BlockchainService } from '@/services/blockchain-service'
import { database } from '@/services/database'
import { IPFSService } from '@/services/ipfs-service'
import { JWTService } from '@/services/jwt'
import { PDFService } from '@/services/pdf-service'
import type { CertificateData, Student, VerificationResult } from '@/types'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

function normalizeHash(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return trimmed
  try {
    return trimmed.includes('%') ? decodeURIComponent(trimmed) : trimmed
  } catch {
    return trimmed
  }
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export async function searchStudentAction(matricula: string): Promise<{ student: Student | null }> {
  if (!matricula || matricula.trim().length === 0) {
    throw new Error('La matrícula es requerida')
  }

  const student = await database.findStudentByMatricula(matricula.trim().toUpperCase())
  return { student }
}

export async function createStudentAction(formData: FormData): Promise<{ success: boolean; student?: Student }> {
  const matricula = formData.get('matricula') as string
  const name = formData.get('name') as string
  const career = formData.get('career') as string

  if (!matricula || !name || !career) {
    throw new Error('Todos los campos son requeridos')
  }

  try {
    const student = await database.createStudent({
      matricula: matricula.trim().toUpperCase(),
      name: name.trim(),
      career: career.trim()
    })

    return { success: true, student }
  } catch (error) {
    console.error('Error creating student:', error)
    throw new Error('Error al crear el estudiante. La matrícula ya podría existir.')
  }
}

export async function generateCertificateAction(matricula: string): Promise<{
  success: boolean
  hash?: string
  error?: string
}> {
  try {
    const student = await database.findStudentByMatricula(matricula)
    if (!student) {
      throw new Error('Estudiante no encontrado')
    }

    // Validar duplicados por matrícula (evitar múltiples constancias por alumno)
    const existingCertificate = await database.findCertificateByMatricula(student.matricula)
    if (existingCertificate) {
      return {
        success: false,
        error: 'Ya existe una constancia para esta matrícula'
      }
    }

    const certificateData: Omit<CertificateData, 'timestamp'> = {
      name: student.name,
      matricula: student.matricula,
      career: student.career
    }

    // Generar hash JWT del certificado
    const hash = JWTService.generateCertificateHash(certificateData)

    // Obtener el timestamp del hash JWT (debe ser el mismo que se usará en la descarga)
    const certificateDataWithTimestamp = JWTService.verifyCertificateHash(hash)
    if (!certificateDataWithTimestamp) {
      throw new Error('Error al generar el hash del certificado')
    }

    // PASO 1: Generar el PDF usando el mismo timestamp que está en el hash JWT
    console.log('📄 Generando PDF del certificado...')
    const verificationUrl = `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/verificar?hash=${encodeURIComponent(hash)}`
    const qrCodeDataUrl = await PDFService.generateQRCodeDataUrl(verificationUrl)
    const pdfBuffer = await PDFService.generateCertificatePDF(
      certificateDataWithTimestamp, // Usar el mismo certificateData que está en el JWT
      hash,
      qrCodeDataUrl
    )

    // PASO 2: Subir PDF a IPFS
    console.log('☁️  Subiendo PDF a IPFS...')
    let ipfsHash: string | undefined
    let ipfsError: string | undefined

    try {
      const ipfsService = new IPFSService()
      const filename = PDFService.generateFileName(certificateDataWithTimestamp) // Usar el mismo timestamp
      const ipfsResult = await ipfsService.uploadPDFToIPFS(pdfBuffer, filename)

      if (ipfsResult.success && ipfsResult.ipfsHash) {
        ipfsHash = ipfsResult.ipfsHash
        console.log(`✅ PDF subido a IPFS: ${ipfsHash}`)
        console.log(`🔗 URL IPFS: ${ipfsResult.ipfsUrl}`)
      } else {
        ipfsError = ipfsResult.error || 'Error al subir a IPFS'
        console.error('❌ Error subiendo a IPFS:', ipfsError)
      }
    } catch (e) {
      ipfsError = e instanceof Error ? e.message : 'Configuración de IPFS inválida'
      console.error('❌ Error en servicio IPFS:', ipfsError)
    }

    // PASO 3: Registrar hash en blockchain (Sepolia Testnet)
    console.log('⛓️  Registrando hash en blockchain (Sepolia Testnet)...')
    let blockchainError: string | undefined
    let blockchainTxHash: string | undefined

    try {
      const blockchainService = new BlockchainService()
      const digest = sha256Hex(hash)
      const blockchainResult = await blockchainService.registerCertificate(digest)

      if (blockchainResult.success && blockchainResult.transactionHash) {
        blockchainTxHash = blockchainResult.transactionHash
        console.log(`✅ Hash registrado en blockchain: ${blockchainTxHash}`)
      } else if (!blockchainResult.success) {
        blockchainError = blockchainResult.error || 'Fallo al registrar en blockchain'
        console.error('❌ Error en blockchain:', blockchainError)
      }
    } catch (e) {
      blockchainError = e instanceof Error ? e.message : 'Configuración de blockchain inválida'
      console.error('❌ Error en servicio blockchain:', blockchainError)
    }

    // PASO 4: Crear certificado en base de datos (con o sin IPFS hash / blockchain tx)
    await database.createCertificate({
      matricula: student.matricula,
      hash,
      ipfs_hash: ipfsHash,
      blockchain_tx: blockchainTxHash
    })

    // Resumen del proceso
    console.log('📊 Resumen de generación:')
    console.log(`   Hash JWT: ${hash.substring(0, 20)}...`)
    if (ipfsHash) {
      console.log(`   IPFS Hash: ${ipfsHash}`)
    } else {
      console.log(`   ⚠️  IPFS: No se pudo subir (${ipfsError})`)
    }
    if (blockchainTxHash) {
      console.log(`   Blockchain TX: ${blockchainTxHash}`)
    } else {
      console.log(`   ⚠️  Blockchain: No se pudo registrar (${blockchainError})`)
    }

    // Retornar éxito incluso si IPFS o blockchain fallaron (el certificado se creó)
    return {
      success: true,
      hash
    }
  } catch (error) {
    console.error('❌ Error generating constancia:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function downloadCertificateAction(hash: string): Promise<Response> {
  try {
    const normalizedHash = normalizeHash(hash)
    const certificateData = JWTService.verifyCertificateHash(normalizedHash)
    if (!certificateData) {
      throw new Error('Hash de constancia inválido')
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/verificar?hash=${encodeURIComponent(normalizedHash)}`
    const qrCodeDataUrl = await PDFService.generateQRCodeDataUrl(verificationUrl)

    const pdfBuffer = await PDFService.generateCertificatePDF(
      certificateData,
      normalizedHash,
      qrCodeDataUrl
    )

    const filename = PDFService.generateFileName(certificateData)
    return PDFService.createSecurePDFResponse(pdfBuffer, filename)

  } catch (error) {
    console.error('Error downloading constancia:', error)
    throw new Error('Error al generar el PDF de la ocnstancia')
  }
}

export async function verifyCertificateAction(hash: string): Promise<VerificationResult> {
  try {
    if (!hash || hash.trim().length === 0) {
      return {
        isValid: false,
        error: 'Hash es requerido'
      }
    }

    const normalizedHash = normalizeHash(hash)

    // Paso 1: Verificar hash JWT
    const certificateData = JWTService.verifyCertificateHash(normalizedHash)
    if (!certificateData) {
      return {
        isValid: false,
        error: 'Hash de constancia inválido o corrupto'
      }
    }

    // Paso 2: Buscar certificado en base de datos
    let certificate = await database.findCertificateByHash(normalizedHash)
    // Fallback: si en BD el hash fue truncado (por definición de columna),
    // intentamos localizar por matrícula (extraída del JWT) y validar que el hash coincide por prefijo.
    if (!certificate) {
      const byMatricula = await database.findCertificateByMatricula(certificateData.matricula)
      if (byMatricula && normalizedHash.startsWith(byMatricula.hash)) {
        certificate = byMatricula
      }
    }
    if (!certificate) {
      return {
        isValid: false,
        error: 'Constancia no encontrada en la base de datos'
      }
    }

    // Paso 3: Obtener datos del estudiante
    const student = await database.findStudentByMatricula(certificate.matricula)
    if (!student) {
      return {
        isValid: false,
        error: 'Estudiante no encontrado en la base de datos'
      }
    }

    // Paso 4: Verificar en IPFS
    let ipfsVerified = false
    let ipfsUrl: string | undefined
    let ipfsError: string | undefined

    if (certificate.ipfs_hash) {
      try {
        const ipfsService = new IPFSService()
        const ipfsCheck = await ipfsService.verifyFileExists(certificate.ipfs_hash)
        ipfsVerified = ipfsCheck.exists
        ipfsUrl = ipfsCheck.url
        if (!ipfsCheck.exists) {
          ipfsError = ipfsCheck.error
        }
      } catch (e) {
        ipfsError = e instanceof Error ? e.message : 'Error al verificar en IPFS'
        console.error('Error verificando IPFS:', ipfsError)
      }
    } else {
      ipfsError = 'La constancia no tiene hash IPFS asociado'
    }

    // Paso 5: Verificar en Blockchain
    let blockchainVerified = false
    let blockchainTx: string | undefined
    let blockchainError: string | undefined

    try {
      const blockchainService = new BlockchainService()
      const digest = sha256Hex(normalizedHash)
      let blockchainVerification = await blockchainService.verifyCertificate(digest)
      // Legacy fallback: si previamente se registró el JWT completo, intentar con el JWT también.
      if (!blockchainVerification.exists) {
        blockchainVerification = await blockchainService.verifyCertificate(normalizedHash)
      }
      blockchainVerified = blockchainVerification.exists
      if (blockchainVerification.exists) {
        blockchainTx = certificate.blockchain_tx
      } else {
        // Fallback: si existe tx en BD, verificar por receipt/evento.
        if (certificate.blockchain_tx) {
          // Intentar validar que el evento coincida con el digest (forma nueva); si no, con el JWT (forma vieja)
          const byTxDigest = await blockchainService.verifyCertificateByTransaction(certificate.blockchain_tx, digest)
          const byTxJwt = byTxDigest.exists
            ? byTxDigest
            : await blockchainService.verifyCertificateByTransaction(certificate.blockchain_tx, normalizedHash)

          const byTx = byTxJwt
          blockchainVerified = byTx.exists
          blockchainTx = certificate.blockchain_tx
          if (!byTx.exists) {
            blockchainError = byTx.error || 'Constancia no registrada en blockchain'
          }
        } else {
          blockchainError = 'Constancia no registrada en blockchain'
        }
      }
    } catch (e) {
      blockchainError = e instanceof Error ? e.message : 'Error al verificar en blockchain'
      console.error('Error verificando blockchain:', blockchainError)
    }

    // Paso 6: Determinar si es válida
    // La constancia es válida si:
    // - El hash JWT es válido
    // - Existe en la base de datos
    // - Está registrada en blockchain
    // - Está almacenada en IPFS (opcional pero preferible)
    const isValid = certificateData !== null && certificate !== null && blockchainVerified

    if (!isValid) {
      return {
        isValid: false,
        certificateData,
        certificate,
        student,
        ipfsVerified,
        ipfsUrl,
        blockchainVerified,
        blockchainTx,
        error: blockchainError || ipfsError || 'Constancia no válida'
      }
    }

    // Constancia válida
    return {
      isValid: true,
      certificateData,
      certificate,
      student,
      ipfsVerified,
      ipfsUrl,
      blockchainVerified,
      blockchainTx
    }

  } catch (error) {
    console.error('Error verifying constancia:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error en la verificación de la constancia'
    }
  }
}

export async function redirectToConfirmation(matricula: string) {
  redirect(`/confirmacion?matricula=${encodeURIComponent(matricula)}`)
}

export async function redirectToNewRegistration(matricula: string) {
  redirect(`/nuevo-registro?matricula=${encodeURIComponent(matricula)}`)
}