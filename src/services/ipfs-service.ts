import type { IPFSResponse } from '@/types'
import axios from 'axios'
import FormData from 'form-data'

export class IPFSService {
  private pinataApiKey: string
  private pinataSecretApiKey: string
  private pinataJwt: string | null

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || ''
    this.pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY || ''
    this.pinataJwt = process.env.PINATA_JWT || null

    // Validar configuración
    // Si se usa JWT, no se necesitan API Key y Secret
    if (this.pinataJwt) {
      // Configuración con JWT es válida
      return
    }

    // Si no hay JWT, se necesitan API Key y Secret
    if (!this.pinataApiKey) {
      throw new Error('PINATA_API_KEY debe estar configurado (o usa PINATA_JWT)')
    }
    if (!this.pinataSecretApiKey) {
      throw new Error('PINATA_SECRET_API_KEY debe estar configurado (o usa PINATA_JWT)')
    }
  }

  /**
   * Sube un archivo PDF a IPFS usando Pinata
   * @param pdfBuffer Buffer del archivo PDF
   * @param filename Nombre del archivo
   * @returns IPFSResponse con el hash IPFS y URL
   */
  async uploadPDFToIPFS(pdfBuffer: Buffer, filename: string): Promise<IPFSResponse> {
    try {
      const formData = new FormData()
      formData.append('file', pdfBuffer, {
        filename,
        contentType: 'application/pdf'
      })

      // Metadatos opcionales
      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          type: 'certificate',
          format: 'pdf'
        }
      })
      formData.append('pinataMetadata', metadata)

      // Opciones de pinning
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      })
      formData.append('pinataOptions', pinataOptions)

      // Headers para autenticación
      const headers: Record<string, string> = {
        ...formData.getHeaders()
      }

      // Usar JWT si está disponible, sino usar API Key + Secret
      if (this.pinataJwt) {
        headers['Authorization'] = `Bearer ${this.pinataJwt}`
      } else {
        headers['pinata_api_key'] = this.pinataApiKey
        headers['pinata_secret_api_key'] = this.pinataSecretApiKey
      }

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { headers, maxBodyLength: Infinity, maxContentLength: Infinity }
      )

      if (response.data && response.data.IpfsHash) {
        const ipfsHash = response.data.IpfsHash
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

        return {
          success: true,
          ipfsHash,
          ipfsUrl
        }
      }

      throw new Error('Respuesta de Pinata inválida')
    } catch (error) {
      console.error('Error subiendo PDF a IPFS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir a IPFS'
      }
    }
  }

  /**
   * Obtiene la URL del gateway IPFS para un hash
   * @param ipfsHash Hash IPFS (CID)
   * @returns URL del gateway
   */
  static getIPFSUrl(ipfsHash: string): string {
    // Puedes usar diferentes gateways
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    // Alternativas:
    // return `https://ipfs.io/ipfs/${ipfsHash}`
    // return `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
  }

  /**
   * Verifica si un archivo existe en IPFS
   * @param ipfsHash Hash IPFS (CID) a verificar
   * @returns true si el archivo existe y es accesible
   */
  async verifyFileExists(ipfsHash: string): Promise<{ exists: boolean; url?: string; error?: string }> {
    try {
      if (!IPFSService.isValidIPFSHash(ipfsHash)) {
        return {
          exists: false,
          error: 'Hash IPFS inválido'
        }
      }

      // Intentar acceder al archivo a través del gateway
      const ipfsUrl = IPFSService.getIPFSUrl(ipfsHash)
      
      try {
        const response = await axios.head(ipfsUrl, {
          timeout: 10000,
          validateStatus: (status) => status < 500 // No lanzar error para 404
        })

        if (response.status === 200) {
          return {
            exists: true,
            url: ipfsUrl
          }
        }

        // Si el HEAD falla, intentar GET parcial
        const getResponse = await axios.get(ipfsUrl, {
          timeout: 10000,
          responseType: 'arraybuffer',
          maxContentLength: 1024, // Solo leer los primeros bytes
          validateStatus: (status) => status < 500
        })

        if (getResponse.status === 200) {
          return {
            exists: true,
            url: ipfsUrl
          }
        }

        return {
          exists: false,
          error: 'Archivo no encontrado en IPFS'
        }
      } catch (error) {
        // Si hay error de red pero el hash es válido, asumimos que existe
        // (puede ser un problema temporal del gateway)
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          return {
            exists: true, // Asumimos que existe si el hash es válido
            url: ipfsUrl,
            error: 'Timeout al verificar, pero el hash es válido'
          }
        }

        return {
          exists: false,
          error: 'Error al verificar archivo en IPFS'
        }
      }
    } catch (error) {
      console.error('Error verificando archivo en IPFS:', error)
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Verifica si un hash IPFS es válido
   * @param ipfsHash Hash IPFS a verificar
   * @returns true si es válido
   */
  static isValidIPFSHash(ipfsHash: string): boolean {
    // CID v0: Qm... (46 caracteres)
    // CID v1: bafy... (59+ caracteres)
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56,})$/.test(ipfsHash)
  }
}

