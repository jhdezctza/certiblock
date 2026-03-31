import VerificationComponent from '@/components/verification/verification-result'

interface PageProps {
  searchParams: { hash?: string }
}

export default function VerificarPage({ searchParams }: PageProps) {
  return <VerificationComponent initialHash={searchParams.hash || ''} />
}