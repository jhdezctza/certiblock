import { JWTService } from '@/services/jwt'
import { PDFService } from '@/services/pdf-service'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { hash } = await request.json()

    if (!hash) {
      return new Response('Hash requerido', { status: 400 })
    }

    const certificateData = JWTService.verifyCertificateHash(hash)
    if (!certificateData) {
      return new Response('Hash inválido', { status: 400 })
    }

    const verificationUrl = `https://www.certiblock.lat/verificar?hash=${encodeURIComponent(hash)}`
    const qrCodeDataUrl = await PDFService.generateQRCodeDataUrl(verificationUrl)

    const pdfBuffer = await PDFService.generateCertificatePDF(
      certificateData,
      hash,
      qrCodeDataUrl
    )

    const filename = PDFService.generateFileName(certificateData)
    return PDFService.createSecurePDFResponse(pdfBuffer, filename)

  } catch (error) {
    console.error('Error in download API:', error)
    return new Response('Error interno del servidor', { status: 500 })
  }
}