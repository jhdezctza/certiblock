'use client'

import Image from 'next/image'
import { verifyCertificateAction } from '@/actions/certificate-actions'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Loading } from '@/components/ui'
import type { VerificationResult } from '@/types'
import { useState, useTransition } from 'react'
import QRCode from 'react-qr-code'

interface VerificationComponentProps {
  initialHash?: string
}

export default function VerificationComponent({ initialHash = '' }: VerificationComponentProps) {
  const [hash, setHash] = useState(initialHash)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleVerification = () => {
    if (!hash.trim()) {
      setResult({
        isValid: false,
        error: 'Por favor ingresa un hash válido'
      })
      return
    }

    startTransition(async () => {
      try {
        const verificationResult = await verifyCertificateAction(hash)
        setResult(verificationResult)
      } catch (error) {
        setResult({
          isValid: false,
          error: 'Error en la verificación'
        })
      }
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleVerification()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Card de verificación */}
        <Card>
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
              🔍 Verificar Constancia del Servicio Social UJAT
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Ingresa el hash de tu constancia o escanea el código QR para verificar su autenticidad
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="hash" className="text-sm font-medium text-gray-700">
                Hash de la constancia
              </label>
              <Input
                id="hash"
                type="text"
                placeholder="Pega aquí el hash de la Constancia del Servicio Social UJAT..."
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isPending}
                className="font-mono text-xs"
              />
            </div>

            <Button
              onClick={handleVerification}
              disabled={isPending || !hash.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300"
              size="lg"
            >
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <Loading />
                  <span>Verificando...</span>
                </div>
              ) : (
                'Verificar Constancia'
              )}
            </Button>

            {/* Link de volver al buscador con estilo */}
            <div className="text-center mt-2">
              <a
                href="/"
                className="inline-block px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
              >
                ← Volver al buscador
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Resultado de la verificación */}
        {result && (
          <Card>
            <CardContent className="pt-6 space-y-6">

              {result.isValid && result.certificateData && result.student ? (
                <div className="space-y-6">

                  {/* Indicador de constancia válida */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                      {result.blockchainVerified && result.ipfsVerified
                        ? 'Constancia Verificada en Blockchain y almacenada en IPFS'
                        : result.blockchainVerified
                        ? 'Constancia Verificada en Blockchain'
                        : 'Constancia Encontrada'}
                    </h3>
                    <p className="text-gray-600">
                      {result.blockchainVerified && result.ipfsVerified
                        ? 'Esta Constancia es auténtica, está registrada en BLOCKCHAIN y almacenada en IPFS'
                        : result.blockchainVerified
                        ? 'Esta Constancia es auténtica y está registrada en BLOCKCHAIN'
                        : 'Esta Constancia ha sido encontrada en el sistema'}
                    </p>
                  </div>

                  {/* Tabla de información del estudiante */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                      🎓 Información del Estudiante
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-blue-50 border-r border-gray-200 w-1/3">
                              🧑 Nombre Completo
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {result.student.name}
                            </td>
                          </tr>
                          <tr className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-blue-50 border-r border-gray-200">
                              🆔 Matrícula
                            </td>
                            <td className="px-4 py-3 text-gray-900 font-mono">
                              {result.student.matricula}
                            </td>
                          </tr>
                          <tr className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-blue-50 border-r border-gray-200">
                              📚 Carrera
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {result.student.career}
                            </td>
                          </tr>
                          {result.student.created_at && (
                            <tr className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-700 bg-blue-50 border-r border-gray-200">
                                📅 Fecha de Registro
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                {new Date(result.student.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabla de información de la constancia */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                      📜 Información de la Constancia
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200 w-1/3">
                              🔐 Hash de Constancia
                            </td>
                            <td className="px-4 py-3 text-gray-900 font-mono text-xs break-all">
                              {hash.substring(0, 50)}...
                            </td>
                          </tr>
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200">
                              📅 Fecha de Emisión
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {formatDate(result.certificateData.timestamp)}
                            </td>
                          </tr>
                          {result.certificate?.ipfs_hash && (
                            <tr className="hover:bg-green-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200">
                                ☁️ Hash IPFS
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">{result.certificate.ipfs_hash}</span>
                                  {result.ipfsUrl && (
                                    <a
                                      href={result.ipfsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                                    >
                                      Ver en IPFS
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {result.blockchainTx && (
                            <tr className="hover:bg-green-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200">
                                ⛓️ Transacción Blockchain
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">{result.blockchainTx.substring(0, 20)}...</span>
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${result.blockchainTx}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                                  >
                                    Ver en Etherscan
                                  </a>
                                </div>
                              </td>
                            </tr>
                          )}
                          {result.ipfsUrl && (
                            <tr className="hover:bg-green-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200">
                                🌐 URL PDF en IPFS
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs break-all hidden md:inline">
                                    {result.ipfsUrl}
                                  </span>
                                  <a
                                    href={result.ipfsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                                  >
                                    Abrir en IPFS
                                  </a>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700 bg-green-50 border-r border-gray-200">
                              ✅ Estado de Verificación
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              <div className="flex flex-col gap-1">
                                <span className={`text-sm ${result.blockchainVerified ? 'text-green-600' : 'text-red-600'}`}>
                                  {result.blockchainVerified ? '✅ Verificado en Blockchain' : '❌ No verificado en Blockchain'}
                                </span>
                                <span className={`text-sm ${result.ipfsVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {result.ipfsVerified ? '✅ Verificado en IPFS' : '⚠️ No verificado en IPFS'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Código QR */}
                  <div className="flex justify-center">
                    <div className="text-center">
                      <QRCode
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verificar?hash=${encodeURIComponent(hash)}`}
                        size={150}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        className="border border-gray-300 rounded-2xl p-2 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Código QR de verificación
                      </p>
                    </div>
                  </div>

                  {/* Garantía de autenticidad */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-blue-600">🔐</span>
                    <div className="text-sm text-blue-700">
                      <div className="font-medium mb-1">Garantía de Autenticidad</div>
                      <p>
                        Esta Constancia de Servicio Social UJAT está protegida por criptografía y registrada en BLOCKCHAIN,
                        garantizando que no puede ser falsificada ni alterada.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">

                  {/* Constancia no válida */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-xl font-semibold text-red-700 mb-2">
                    Constancia No Válida o No Existe
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-600 font-medium">
                      {result.error || 'El hash proporcionado no corresponde a una constancia válida'}
                    </p>
                  </div>

                  {/* Mostrar información parcial si está disponible */}
                  {(result.certificateData || result.student) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Información Parcial Encontrada:</h4>
                      {result.student && (
                        <div className="text-sm text-yellow-700 text-left space-y-1">
                          <p><strong>Estudiante:</strong> {result.student.name}</p>
                          <p><strong>Matrícula:</strong> {result.student.matricula}</p>
                          <p><strong>Carrera:</strong> {result.student.career}</p>
                        </div>
                      )}
                      {result.certificateData && (
                        <div className="text-sm text-yellow-700 text-left mt-2">
                          <p><strong>Fecha de Emisión:</strong> {formatDate(result.certificateData.timestamp)}</p>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-yellow-300">
                        <p className="text-xs text-yellow-600">
                          {!result.blockchainVerified && '❌ No verificado en Blockchain'}
                          {!result.ipfsVerified && result.certificate?.ipfs_hash && ' ⚠️ No verificado en IPFS'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Posibles razones */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">ℹ️</span>
                      <div className="text-sm text-blue-700 text-left">
                        <div className="font-medium mb-1">Posibles razones:</div>
                        <ul className="list-disc list-inside space-y-1">
                          <li>El hash no es válido o está incompleto</li>
                          <li>La constancia no existe en nuestro sistema</li>
                          <li>La constancia no está registrada en blockchain</li>
                          <li>La constancia no está almacenada en IPFS</li>
                          <li>Ha ocurrido un error en la verificación</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
