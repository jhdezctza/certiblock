'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, ShieldCheck, UserPlus } from 'lucide-react'

interface WelcomeCardProps {
  title: string
  description: string
  icon: 'Search' | 'ShieldCheck' | 'UserPlus'
  href: string
  delay: number
}

const icons = {
  Search: Search,
  ShieldCheck: ShieldCheck,
  UserPlus: UserPlus
}

export default function WelcomeCard({ title, description, icon, href, delay }: WelcomeCardProps) {
  const IconComponent = icons[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-lg hover:border-green-400 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center"
    >
      <div className="bg-green-100 text-green-700 rounded-full p-4 mb-4">
        <IconComponent size={36} />
      </div>
      <h3 className="text-lg font-semibold text-green-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className="mt-auto bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Ingresar
      </Link>
    </motion.div>
  )
}
