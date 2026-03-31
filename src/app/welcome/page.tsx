'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import WelcomeCard from '@/components/WelcomeCard/WelcomeCardPage'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden px-6 py-12">

      {/* Efecto decorativo de fondo */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_60%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* Logo UJAT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6 relative z-10"
      >
        <Image
          src="/ujat-logo.png"
          alt="Logo UJAT"
          width={140}
          height={140}
          className="rounded-full shadow-2xl border-4 border-white"
          priority
        />
      </motion.div>

      {/* Mensaje de bienvenida */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-3xl md:text-4xl font-bold text-green-800 text-center mb-10 drop-shadow-sm z-10"
      >
        Bienvenido al Sistema de Gestión de Constancias de Servicio Social <br />
        <span className="text-green-600 font-extrabold">Universidad Juárez Autónoma de Tabasco</span>
      </motion.h1>

      {/* Tarjetas de opciones */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl z-10"
      >
        <WelcomeCard
          title="Buscar Alumno"
          description="Accede a la información de los alumnos registrados."
          icon="Search"
          href="/student-search"
          delay={0.5}
        />
        <WelcomeCard
          title="Verificar Constancia"
          description="Comprueba la validez de una constancia emitida."
          icon="ShieldCheck"
          href="/verificar"
          delay={0.7}
        />
        <WelcomeCard
          title="Registrar Alumno"
          description="Agrega un nuevo alumno al sistema."
          icon="UserPlus"
          href="/nuevo-registro"
          delay={0.9}
        />
      </motion.div>

      {/* Pie de página */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-gray-600 text-sm text-center z-10"
      >
        © {new Date().getFullYear()} Universidad Juárez Autónoma de Tabasco — Todos los derechos reservados.
      </motion.footer>
    </div>
  )
}
