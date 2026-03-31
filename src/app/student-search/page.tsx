'use client'

import Image from 'next/image'
import { redirectToConfirmation, redirectToNewRegistration, searchStudentAction } from '@/actions/certificate-actions'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Loading } from '@/components/ui/index'
import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function StudentSearch() {
    const router = useRouter()
  const [matricula, setMatricula] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Función para buscar alumno
  const handleSearch = () => {
    if (!matricula.trim()) {
      setError('Por favor ingresa una matrícula')
      toast.error('Ingresa una matrícula para buscar')
      return
    }

    setError('')

    startTransition(async () => {
      try {
        const result = await searchStudentAction(matricula)
        if (result.student) {
          toast.success('Alumno encontrado', { description: result.student.name })
          await redirectToConfirmation(matricula)
        } else {
          toast.error('Alumno no encontrado')
          await redirectToNewRegistration(matricula)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-2xl">
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
              Sistema de Constancias de Servicio Social
            </CardTitle>
            <p className="text-gray-600 mt-2 text-sm">
              Ingresa tu matrícula para buscar o generar tu constancia
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="matricula" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                🆔 Matrícula del Alumno:
              </label>
              <Input
                id="matricula"
                type="text"
                placeholder="Ej: 20240001"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isPending}
                className="text-center font-mono bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botón Buscar Alumno con gradiente y hover */}
            <Button
              onClick={handleSearch}
              disabled={isPending || !matricula.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:scale-105 hover:shadow-lg transition-transform duration-300 rounded-lg"
              size="lg"
            >
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <Loading />
                  <span>Buscando...</span>
                </div>
              ) : (
                '🔍 Buscar Alumno'
              )}
            </Button>

            {/* Leyenda llamativa animada */}
            <motion.div
              className="text-center pt-4 border-t border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 }}
            >
              <Button onClick={() => router.push('/')} className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300">
              🏠 Ir al Inicio
            </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
