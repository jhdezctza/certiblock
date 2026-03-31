import VerificationComponent from '@/components/verification/verification-result'

interface PageProps {
  searchParams: Promise<{ hash?: string }>
}

export default async function VerificarPage({ searchParams }: PageProps) {
  const { hash } = await searchParams
  return <VerificationComponent initialHash={hash || ''} />
}