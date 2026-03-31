'use client'

import { createStudentAction } from '@/actions/certificate-actions'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { IdCard, GraduationCap, BookOpen } from 'lucide-react'

interface StudentFormProps {
  initialMatricula?: string
}

export default function StudentForm({ initialMatricula = '' }: StudentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    matricula: initialMatricula.toUpperCase(),
    name: '',
    career: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'matricula' ? value.toUpperCase() : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.matricula.trim() || !formData.name.trim() || !formData.career.trim()) {
      setError('Todos los campos son requeridos')
      return
    }

    setError('')

    startTransition(async () => {
      try {
        const formDataObj = new FormData()
        formDataObj.append('matricula', formData.matricula.trim())
        formDataObj.append('name', formData.name.trim())
        formDataObj.append('career', formData.career.trim())

        const result = await createStudentAction(formDataObj)

        if (result.success && result.student) {
  toast.success('Registro exitoso', {
    description: 'Estudiante registrado correctamente'
  })

  router.push(`/confirmacion?matricula=${encodeURIComponent(result.student.matricula)}`)
} else {
  toast.error('Error al registrar estudiante', {
    description: 'Ocurrió un error al registrar el alumno'
  })
}

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al registrar estudiante'
        setError(errorMessage)
        toast.error('Error en el registro', {
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
            Registro de Datos del Alumno
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">
            Ingresa la información para generar tu Constancia del Servicio Social UJAT
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Envolvemos inputs y botones en FORM con onSubmit */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cuadro de datos con íconos y estilos */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  
                  🆔 Matrícula:
                </span>
                <Input
                  id="matricula"
                  name="matricula"
                  type="text"
                  placeholder="Ej: 20240001"
                  value={formData.matricula}
                  onChange={(e) => handleInputChange('matricula', e.target.value)}
                  disabled={isPending}
                  required
                  className="col-span-2 bg-blue-50 border border-blue-200 text-sm px-3 py-2 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  
                  🎓 Nombre:
                </span>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isPending}
                  required
                  className="col-span-2 bg-blue-50 border border-blue-200 text-sm px-3 py-2 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  
                  📚 Carrera:
                </span>
                <Input
                  id="career"
                  name="career"
                  type="text"
                  placeholder="Ingresa tu carrera"
                  value={formData.career}
                  onChange={(e) => handleInputChange('career', e.target.value)}
                  disabled={isPending}
                  required
                  className="col-span-2 bg-blue-50 border border-blue-200 text-sm px-3 py-2 rounded"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botones dentro del form: el submit ahora funciona */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                disabled={isPending}
                className="flex-1 border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                ⬅ Regresar
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:scale-105 hover:shadow-lg transition-transform duration-300 text-white font-semibold rounded-lg"
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  'Registrar'
                )}
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 text-center mt-2">
            * Todos los campos son obligatorios. Verifica la información antes de continuar.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
