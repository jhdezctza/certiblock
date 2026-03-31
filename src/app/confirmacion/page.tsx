import StudentConfirmation from '@/components/student/student-confirmation'
import { database } from '@/services/database'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: { matricula?: string }
}

export default async function ConfirmacionPage({ searchParams }: PageProps) {
  const { matricula } = searchParams
  if (!matricula) {
    redirect('/')
  }

  const student = await database.findStudentByMatricula(matricula)

  if (!student) {
    redirect(`/nuevo-registro?matricula=${encodeURIComponent(matricula)}`)
  }

  return <StudentConfirmation student={student} />
}