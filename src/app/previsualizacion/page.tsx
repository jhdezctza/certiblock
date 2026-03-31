import CertificatePreview from '@/components/certificate/certificate-preview'
import { JWTService } from '@/services/jwt'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: { hash?: string }
}

export default async function PrevisualizacionPage({ searchParams }: PageProps) {
  if (!searchParams.hash) {
    redirect('/')
  }

  const certificateData = JWTService.verifyCertificateHash(searchParams.hash)

  if (!certificateData) {
    redirect('/')
  }

  return (
    <CertificatePreview
      certificateData={certificateData}
      hash={searchParams.hash}
    />
  )
}