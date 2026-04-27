'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookOpen, LogOut, User, ChevronRight, Loader2, Trophy } from 'lucide-react'

const SIMULADORES = [
  { id: 1, titulo: 'Simulador 1', desc: 'Fundamentos Teóricos del Aprendizaje y Desarrollo Infantil', color: 'from-blue-500 to-blue-700' },
  { id: 2, titulo: 'Simulador 2', desc: 'Marco Legal y Derechos de la Infancia', color: 'from-indigo-500 to-indigo-700' },
  { id: 3, titulo: 'Simulador 3', desc: 'Currículo, Planeación y Programas de Estudio', color: 'from-violet-500 to-violet-700' },
  { id: 4, titulo: 'Simulador 4', desc: 'Gestión Escolar, CTE y Participación Comunitaria', color: 'from-cyan-500 to-cyan-700' },
  { id: 5, titulo: 'Simulador 5', desc: 'Evaluación Formativa, Convivencia y Vida Saludable', color: 'from-teal-500 to-teal-700' },
  { id: 6, titulo: 'Examen Final', desc: 'Examen Final Integrador', color: 'from-rose-500 to-rose-700' },
  { id: 7, titulo: 'Área Interactiva', desc: 'Quiz rápidos por simulador y crucigramas temáticos. ¡Pon a prueba tu conocimiento!', color: 'from-violet-500 to-purple-700' },
]

export default function HomePage() {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)
  const [nombre,      setNombre]      = useState('')
  const [email,       setEmail]       = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth')
      } else {
        const u = data.session.user
        setNombre(u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'Docente')
        setEmail(u.email ?? '')
        setVerificando(false)
      }
    })
  }, [router])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-blue-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
            <BookOpen size={20} className="text-blue-600" />
            <span className="hidden sm:inline">Guía Nacional USICAMM</span>
            <span className="sm:hidden">USICAMM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
              <User size={13} className="text-blue-500 shrink-0" />
              <span className="max-w-[140px] truncate font-medium">{nombre}</span>
            </div>
            <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">
              <LogOut size={15} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 fade-in">

        {/* Hero */}
        <section className="text-center space-y-2">
          <p className="text-blue-600 font-medium text-sm">Bienvenido, {nombre}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Selecciona tu simulador
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Practica con reactivos oficiales y prepárate para tu proceso USICAMM.
          </p>
        </section>

        {/* Grid de simuladores */}
        <section className="grid gap-3">
          {SIMULADORES.map((sim) => (
            <button
              key={sim.id}
              onClick={() => sim.id === 7 ? router.push('/area') : router.push(`/simulador?id=${sim.id}`)}
              className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left w-full"
            >
              {/* Número */}
              <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${sim.color} flex items-center justify-center shadow-sm`}>
                {sim.id === 6
                  ? <Trophy size={20} className="text-white" />
                  : <span className="text-white font-extrabold text-lg">{sim.id}</span>
                }
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{sim.titulo}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{sim.desc}</p>
              </div>

              <ChevronRight size={18} className="shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </section>

        <footer className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} Guía Nacional USICAMM · Todos los derechos reservados
        </footer>
      </main>
    </div>
  )
}