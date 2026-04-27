'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, CheckCircle, Zap, Trophy } from 'lucide-react'

const SIMULADORES = [
  { id: 1, titulo: 'Quiz Simulador 1', desc: 'Fundamentos Teóricos del Aprendizaje', color: 'from-red-500 to-rose-600' },
  { id: 2, titulo: 'Quiz Simulador 2', desc: 'Marco Legal y Derechos de la Infancia', color: 'from-blue-500 to-blue-700' },
  { id: 3, titulo: 'Quiz Simulador 3', desc: 'Currículo, Planeación y Programas', color: 'from-violet-500 to-purple-700' },
  { id: 4, titulo: 'Quiz Simulador 4', desc: 'Gestión Escolar y CTE', color: 'from-cyan-500 to-cyan-700' },
  { id: 5, titulo: 'Quiz Simulador 5', desc: 'Evaluación Formativa y Convivencia', color: 'from-teal-500 to-teal-700' },
]

// Progreso en memoria durante la sesión
// nivel 1 siempre desbloqueado
// nivel 2 se desbloquea al pasar nivel 1
// examen se desbloquea al pasar nivel 2
type Progreso = Record<number, { nivel1: boolean; nivel2: boolean; examen: boolean }>

const progresoInicial: Progreso = {
  1: { nivel1: false, nivel2: false, examen: false },
  2: { nivel1: false, nivel2: false, examen: false },
  3: { nivel1: false, nivel2: false, examen: false },
  4: { nivel1: false, nivel2: false, examen: false },
  5: { nivel1: false, nivel2: false, examen: false },
}

// Guardamos progreso en sessionStorage para que persista durante la sesión
function getProgreso(): Progreso {
  if (typeof window === 'undefined') return progresoInicial
  const saved = sessionStorage.getItem('quiz_progreso')
  return saved ? JSON.parse(saved) : progresoInicial
}

export function setProgresoNivel(simId: number, nivel: 'nivel1' | 'nivel2' | 'examen') {
  const p = getProgreso()
  p[simId][nivel] = true
  sessionStorage.setItem('quiz_progreso', JSON.stringify(p))
}

export default function QuizSeleccionPage() {
  const router = useRouter()
  const [simSeleccionado, setSimSeleccionado] = useState<number | null>(null)
  const [progreso, setProgreso] = useState<Progreso>(getProgreso)

  function refrescarProgreso() {
    setProgreso(getProgreso())
  }

  function irANivel(simId: number, nivel: number) {
    router.push(`/area/quiz/jugar?sim=${simId}&nivel=${nivel}`)
  }

  if (simSeleccionado !== null) {
    const sim = SIMULADORES.find(s => s.id === simSeleccionado)!
    const p   = progreso[simSeleccionado]

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5 fade-in">

          <button onClick={() => { setSimSeleccionado(null); refrescarProgreso() }}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
            <ArrowLeft size={16}/> Regresar
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">{sim.titulo}</h2>
            <p className="text-white/70 text-sm mt-1">{sim.desc}</p>
          </div>

          <div className="space-y-3">
            {/* Nivel 1 */}
            <NivelCard
              titulo="Nivel 1"
              desc="15 preguntas · 15 seg c/u"
              completado={p.nivel1}
              bloqueado={false}
              icono={<Zap size={20} className="text-yellow-300"/>}
              onClick={() => irANivel(simSeleccionado, 1)}
            />
            {/* Nivel 2 */}
            <NivelCard
              titulo="Nivel 2"
              desc="15 preguntas · 15 seg c/u"
              completado={p.nivel2}
              bloqueado={!p.nivel1}
              icono={<Zap size={20} className="text-orange-300"/>}
              onClick={() => irANivel(simSeleccionado, 2)}
            />
            {/* Examen */}
            <NivelCard
              titulo="Examen Final"
              desc="10 preguntas · Sin tiempo límite"
              completado={p.examen}
              bloqueado={!p.nivel2}
              icono={<Trophy size={20} className="text-yellow-300"/>}
              onClick={() => irANivel(simSeleccionado, 3)}
              esExamen
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5 fade-in">

        <button onClick={() => router.push('/area')}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
          <ArrowLeft size={16}/> Volver
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white">Quiz Rápidos</h1>
          <p className="text-white/70 text-sm mt-1">Selecciona un simulador</p>
        </div>

        <div className="space-y-3">
          {SIMULADORES.map(sim => (
            <button
              key={sim.id}
              onClick={() => { setSimSeleccionado(sim.id); refrescarProgreso() }}
              className={`w-full bg-gradient-to-r ${sim.color} rounded-2xl p-4 text-left shadow-lg active:scale-95 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-white">{sim.titulo}</p>
                  <p className="text-white/70 text-xs mt-0.5">{sim.desc}</p>
                </div>
                <div className="flex gap-1">
                  {(['nivel1', 'nivel2', 'examen'] as const).map(n => (
                    <div key={n} className={`w-2.5 h-2.5 rounded-full ${progreso[sim.id][n] ? 'bg-yellow-300' : 'bg-white/30'}`}/>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NivelCard({ titulo, desc, completado, bloqueado, icono, onClick, esExamen }: {
  titulo: string
  desc: string
  completado: boolean
  bloqueado: boolean
  icono: React.ReactNode
  onClick: () => void
  esExamen?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={bloqueado}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-95 ${
        bloqueado
          ? 'bg-white/10 opacity-50 cursor-not-allowed'
          : esExamen
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg'
            : 'bg-white/20 hover:bg-white/30 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {bloqueado ? <Lock size={18} className="text-white/60"/> : icono}
          </div>
          <div>
            <p className={`font-extrabold ${esExamen ? 'text-gray-900' : 'text-white'}`}>{titulo}</p>
            <p className={`text-xs ${esExamen ? 'text-gray-700' : 'text-white/70'}`}>{desc}</p>
          </div>
        </div>
        {completado && <CheckCircle size={20} className={esExamen ? 'text-gray-900' : 'text-green-300'}/>}
        {bloqueado  && <Lock size={16} className="text-white/40"/>}
      </div>
    </button>
  )
}