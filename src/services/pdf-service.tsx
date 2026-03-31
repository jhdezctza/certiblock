import { CertificatePDF } from '@/components/certificate/certificate-pdf'
import type { CertificateData } from '@/types'
import { renderToBuffer } from '@react-pdf/renderer'

export class PDFService {
  static async generateCertificatePDF(
    certificateData: CertificateData,
    hash: string,
    qrCodeDataUrl: string
  ): Promise<Buffer> {
    const pdfDocument = CertificatePDF({
      certificateData,
      hash,
      qrCodeDataUrl
    })

    return await renderToBuffer(pdfDocument)
  }

  static createSecurePDFResponse(
    buffer: Buffer,
    filename: string
  ): Response {
    const headers = new Headers()

    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Content-Security-Policy', "default-src 'none'")
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    return new Response(buffer as any, { headers })
  }

  static generateFileName(certificateData: CertificateData): string {
    const timestamp = new Date(certificateData.timestamp).toISOString().slice(0, 10)
    const safeName = certificateData.name.replace(/[^a-zA-Z0-9]/g, '_')
    return `certificado_${certificateData.matricula}_${safeName}_${timestamp}.pdf`
  }

  static async generateQRCodeDataUrl(url: string): Promise<string> {
    const QRCode = (await import('qrcode')).default

    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
  }
}