import StudentForm from '@/components/student/student-form'

interface PageProps {
  searchParams: Promise<{ matricula?: string }>
}

export default async function NuevoRegistroPage({ searchParams }: PageProps) {
  const { matricula } = await searchParams
  return <StudentForm initialMatricula={matricula || ''} />
}