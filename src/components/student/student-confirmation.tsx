'use client'

import Image from 'next/image'
import { generateCertificateAction } from '@/actions/certificate-actions'
import { Button, Card, CardContent, CardHeader, CardTitle, Loading } from '@/components/ui'
import type { Student } from '@/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export default function StudentConfirmation({ student }: { student: Student }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Función para generar constancia
  const handleGenerateCertificate = () => {
    setError('')
    startTransition(async () => {
      try {
        const result = await generateCertificateAction(student.matricula)
        if (result.success && result.hash) {
          toast.success('¡Constancia generada exitosamente!', {
            description: 'Tu constancia ha sido registrada en blockchain'
          })
          router.push(`/previsualizacion?hash=${encodeURIComponent(result.hash)}`)
        } else {
          setError(result.error || 'Error al generar la constancia')
          toast.error('Error al generar constancia', {
            description: result.error || 'Intenta nuevamente'
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        toast.error('Error inesperado', {
          description: errorMessage
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader className="text-center">
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
            Confirmar Datos del Alumno
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">
            Verifica que la información sea correcta antes de generar tu Constancia del Servicio Social UJAT
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cuadro de datos con íconos y estilos */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                🆔 Matrícula:
              </span>
              <p className="col-span-2 text-sm text-gray-900 font-mono bg-blue-50 px-3 py-2 rounded border border-blue-200">
                {student.matricula}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                🎓 Nombre:
              </span>
              <p className="col-span-2 text-sm text-gray-900 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                {student.name}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                📚 Carrera:
              </span>
              <p className="col-span-2 text-sm text-gray-900 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                {student.career}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botones Generar / Regresar */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/student-search')}
              disabled={isPending}
              className="flex-1 border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-100 transition-all duration-300"
            >
              ⬅ Regresar
            </Button>

            <Button
              onClick={handleGenerateCertificate}
              disabled={isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:scale-105 hover:shadow-lg transition-transform duration-300 text-white font-semibold rounded-lg"
            >
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generando...</span>
                </div>
              ) : (
                'Generar Constancia'
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center mt-2">
            Al generar tu constancia se creará una firma digital única
            registrada en Blockchain para garantizar su autenticidad.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
