import CertificatePreview from '@/components/certificate/certificate-preview'
import { JWTService } from '@/services/jwt'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ hash?: string }>
}

export default async function PrevisualizacionPage({ searchParams }: PageProps) {
  const { hash } = await searchParams

  if (!hash) {
    redirect('/')
  }

  const certificateData = JWTService.verifyCertificateHash(hash)

  if (!certificateData) {
    redirect('/')
  }

  return (
    <CertificatePreview
      certificateData={certificateData}
      hash={hash}
    />
  )
}