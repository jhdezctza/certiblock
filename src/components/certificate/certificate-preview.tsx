'use client'

import Image from 'next/image'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { CertificateData } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'

interface CertificatePreviewProps {
  certificateData: CertificateData
  hash: string
}

export default function CertificatePreview({ certificateData, hash }: CertificatePreviewProps) {
  const router = useRouter()
  const [downloadInitiated, setDownloadInitiated] = useState(false)

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verificar?hash=${hash}`

  useEffect(() => {
    if (downloadInitiated) return
    setDownloadInitiated(true)

    const initiateDownload = async () => {
      try {
        const response = await fetch('/api/certificates/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash }),
        })
        if (!response.ok) throw new Error('Error al descargar el certificado')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificado_${certificateData.matricula}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('¡Descarga completada!', { description: 'El certificado se descargó correctamente' })
      } catch (error) {
        toast.error('Error en la descarga', { description: 'No se pudo descargar el certificado automáticamente' })
      }
    }

    const timer = setTimeout(initiateDownload, 1000)
    return () => clearTimeout(timer)
  }, [hash, certificateData.matricula, downloadInitiated])

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleManualDownload = async () => {
    try {
      const response = await fetch('/api/certificates/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      })
      if (!response.ok) throw new Error('Error al descargar el certificado')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado_${certificateData.matricula}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Descarga iniciada')
    } catch {
      toast.error('Error en la descarga')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-4">
          {/* Logo UJAT */}
          <div className="flex justify-center mb-3">
                        <Image
                          src="/ujat-logo.png"
                          alt="Logo UJAT"
                          width={80}
                          height={80}
                          className="rounded-full shadow-md"
                          priority
                        />
                      </div>

          <CardTitle className="text-2xl text-gray-900 font-bold">
            ✅ Constancia Generada
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">
            Tu Constancia del Servicio Social UJAT ha sido registrada exitosamente en la Red de Blockchain
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del Estudiante */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🎓 Datos del Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-2">🧑 Nombre:</span>
                <p className="bg-blue-50 px-3 py-2 rounded border border-blue-200">{certificateData.name}</p>
              </div>
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-2">🆔 Matrícula:</span>
                <p className="bg-blue-50 px-3 py-2 rounded border border-blue-200 font-mono">{certificateData.matricula}</p>
              </div>
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-2">📚 Carrera:</span>
                <p className="bg-blue-50 px-3 py-2 rounded border border-blue-200">{certificateData.career}</p>
              </div>
              <div className="flex flex-col">
                <span className="font-medium flex items-center gap-2">📅 Fecha:</span>
                <p className="bg-blue-50 px-3 py-2 rounded border border-blue-200">{formatDate(certificateData.timestamp)}</p>
              </div>
            </div>
          </div>

          {/* Firma digital y QR */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">✍️ Firma Digital</h3>
              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-2">Hash único de tu constancia:</div>
                <div className="font-mono text-xs bg-white p-2 rounded border break-all">{hash}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">📱 Código de Verificación</h3>
              <div className="bg-white border rounded-lg p-3 flex justify-center">
                <QRCode value={verificationUrl} size={120} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
              <p className="text-xs text-gray-500 text-center">Escanea para verificar autenticidad</p>
            </div>
          </div>

          {/* Descarga */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-pulse">📄</div>
              <span className="font-medium">{downloadInitiated ? 'Descarga iniciada automáticamente...' : 'Preparando descarga...'}</span>
            </div>
            <p className="text-sm text-blue-600">
              El archivo PDF se descargará automáticamente. Redirigiendo al inicio...
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-3 space-y-3 md:space-y-0">
            <Button variant="outline" onClick={handleManualDownload} className="flex-1">
              ⬇ Descargar Nuevamente
            </Button>
            <Button onClick={() => router.push('/')} className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300">
              🏠 Ir al Inicio
            </Button>
          </div>

          <div className="text-center mt-4">
            <a
              href={`/verificar?hash=${encodeURIComponent(hash)}`}
              className="inline-block px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
            >
              🔗 Ver Página de Verificación
            </a>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
