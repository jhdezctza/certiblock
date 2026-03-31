import StudentForm from '@/components/student/student-form'

interface PageProps {
  searchParams: { matricula?: string }
}

export default function NuevoRegistroPage({ searchParams }: PageProps) {
  return <StudentForm initialMatricula={searchParams.matricula || ''} />
}