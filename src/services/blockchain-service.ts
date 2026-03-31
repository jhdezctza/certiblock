import type { BlockchainResponse } from '@/types'
import { ethers } from 'ethers'

const CONTRACT_ABI = [
  "function registerCertificate(string memory _hash) external returns (bool)",
  "function verifyCertificate(string memory _hash) external view returns (bool exists, address issuer, uint256 timestamp)",
  "event CertificateRegistered(string indexed hash, address indexed issuer, uint256 timestamp)"
]

export class BlockchainService {
  private provider: ethers.Provider
  private wallet: ethers.Wallet
  private contract: ethers.Contract
  private contractAddress: string

  constructor() {
    // Configuración para Sepolia Testnet
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
    const privateKey = process.env.WALLET_PRIVATE_KEY || ''
    const contractAddress = process.env.CONTRACT_ADDRESS || ''

    // Validar RPC URL (debe ser una URL válida de Sepolia)
    if (!rpcUrl || (!rpcUrl.includes('sepolia') && !rpcUrl.includes('localhost'))) {
      console.warn('⚠️  BLOCKCHAIN_RPC_URL no parece ser Sepolia Testnet. Usando:', rpcUrl)
    }
    if (!rpcUrl) {
      throw new Error('BLOCKCHAIN_RPC_URL no configurado. Usa un endpoint de Sepolia Testnet')
    }

    // Validar private key
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      throw new Error('WALLET_PRIVATE_KEY inválida o no configurada (formato 0x + 64 caracteres hex)')
    }

    // Validar contract address
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      throw new Error('CONTRACT_ADDRESS inválido o no configurado. Debe ser una dirección válida del contrato desplegado en Sepolia')
    }

    this.contractAddress = contractAddress
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.wallet = new ethers.Wallet(privateKey, this.provider)
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet)

    console.log('✅ Blockchain Service inicializado para Sepolia Testnet')
    console.log('   Wallet:', this.wallet.address)
    console.log('   Contrato:', contractAddress)
  }

  async registerCertificate(hash: string): Promise<BlockchainResponse> {
    try {
      // Verificar balance antes de enviar transacción
      const balance = await this.provider.getBalance(this.wallet.address)
      const balanceInEth = ethers.formatEther(balance)
      
      if (balanceInEth === '0.0') {
        return {
          success: false,
          error: 'Wallet sin fondos. Necesitas ETH en Sepolia Testnet para pagar gas fees'
        }
      }

      console.log(`📝 Registrando hash en blockchain: ${hash.substring(0, 20)}...`)
      console.log(`💰 Balance disponible: ${balanceInEth} ETH`)

      // Estimar gas antes de enviar
      const gasEstimate = await this.contract.registerCertificate.estimateGas(hash)
      console.log(`⛽ Gas estimado: ${gasEstimate.toString()}`)

      // Enviar transacción
      const tx = await this.contract.registerCertificate(hash)
      console.log(`⏳ Transacción enviada: ${tx.hash}`)
      console.log(`🔗 Ver en Sepolia: https://sepolia.etherscan.io/tx/${tx.hash}`)

      // Esperar confirmación
      const receipt = await tx.wait()
      console.log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`)

      return {
        success: true,
        transactionHash: receipt.hash
      }
    } catch (error) {
      console.error('❌ Error registrando en blockchain:', error)
      
      // Mensajes de error más descriptivos
      let errorMessage = 'Error desconocido en blockchain'
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para pagar gas fees'
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Error de nonce. Intenta nuevamente'
        } else if (error.message.includes('revert')) {
          errorMessage = 'Transacción revertida. El hash podría ya estar registrado'
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async verifyCertificate(hash: string): Promise<{ exists: boolean; issuer?: string; timestamp?: number }> {
    try {
      const [exists, issuer, timestamp] = await this.contract.verifyCertificate(hash)

      return {
        exists,
        issuer: exists ? issuer : undefined,
        timestamp: exists ? Number(timestamp) : undefined
      }
    } catch (error) {
      console.error('Blockchain verification error:', error)
      return { exists: false }
    }
  }

  /**
   * Fallback de verificación por transacción.
   * Útil cuando la lectura del mapping no coincide (por configuración de red/contrato),
   * pero se tiene un txHash guardado en BD.
   */
  async verifyCertificateByTransaction(txHash: string, expectedHash: string): Promise<{ exists: boolean; error?: string }> {
    try {
      if (!BlockchainService.isValidTransactionHash(txHash)) {
        return { exists: false, error: 'Hash de transacción inválido' }
      }

      const receipt = await this.provider.getTransactionReceipt(txHash)
      if (!receipt) return { exists: false, error: 'No se encontró el receipt de la transacción' }
      if (receipt.status !== 1n) return { exists: false, error: 'Transacción fallida (status != 1)' }

      // Verificar que el tx fue al contrato configurado
      const to = (receipt.to || '').toLowerCase()
      if (!to || to !== this.contractAddress.toLowerCase()) {
        return { exists: false, error: 'La transacción no corresponde al contrato configurado' }
      }

      const iface = new ethers.Interface(CONTRACT_ABI)
      const eventTopic = iface.getEvent('CertificateRegistered').topicHash

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== this.contractAddress.toLowerCase()) continue
        if (!log.topics || log.topics.length === 0) continue
        if (log.topics[0].toLowerCase() !== eventTopic.toLowerCase()) continue

        try {
          const parsed = iface.parseLog(log)
          const registeredHash = String(parsed.args.hash)
          if (registeredHash === expectedHash) {
            return { exists: true }
          }
        } catch {
          // ignorar logs que no parseen
        }
      }

      return { exists: false, error: 'No se encontró el evento CertificateRegistered para este hash' }
    } catch (error) {
      console.error('Error verifyCertificateByTransaction:', error)
      return { exists: false, error: 'Error verificando por transacción' }
    }
  }

  async getTransactionReceipt(txHash: string) {
    try {
      return await this.provider.getTransactionReceipt(txHash)
    } catch (error) {
      console.error('Error getting transaction receipt:', error)
      return null
    }
  }

  static isValidTransactionHash(txHash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(txHash)
  }
}