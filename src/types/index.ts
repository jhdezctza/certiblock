export interface Student {
  matricula: string
  name: string
  career: string
  created_at?: string
}

export interface User {
  id: number
  username: string
  name: string
  password: string
  created_at?: string
}

export interface Certificate {
  id: number
  matricula: string
  hash: string
  ipfs_hash?: string
  blockchain_tx?: string
  created_at?: string
}

export interface CertificateData {
  name: string
  matricula: string
  career: string
  timestamp: number
}

export interface BlockchainResponse {
  success: boolean
  transactionHash?: string
  error?: string
}

export interface VerificationResult {
  isValid: boolean
  certificateData?: CertificateData
  certificate?: Certificate
  student?: Student
  ipfsVerified?: boolean
  ipfsUrl?: string
  blockchainVerified?: boolean
  blockchainTx?: string
  error?: string
}

export interface IPFSResponse {
  success: boolean
  ipfsHash?: string
  ipfsUrl?: string
  error?: string
}