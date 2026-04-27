'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid3x3, Lock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const SIMULADORES = [
  { id: 1, titulo: 'Crucigrama 1', desc: 'Fundamentos Teóricos del Aprendizaje', color: 'from-red-500 to-rose-600' },
  { id: 2, titulo: 'Crucigrama 2', desc: 'Marco Legal y Derechos de la Infancia', color: 'from-blue-500 to-blue-700' },
  { id: 3, titulo: 'Crucigrama 3', desc: 'Currículo, Planeación y Programas', color: 'from-violet-500 to-purple-700' },
  { id: 4, titulo: 'Crucigrama 4', desc: 'Gestión Escolar y CTE', color: 'from-cyan-500 to-cyan-700' },
  { id: 5, titulo: 'Crucigrama 5', desc: 'Evaluación Formativa y Convivencia', color: 'from-teal-500 to-teal-700' },
]

function getProgreso() {
  if (typeof window === 'undefined') return {}
  const saved = sessionStorage.getItem('crucigrama_progreso')
  return saved ? JSON.parse(saved) : {}
}

export function setProgresoCrucigrama(simId: number, nivel: number) {
  const p = getProgreso()
  if (!p[simId]) p[simId] = {}
  p[simId][nivel] = true
  sessionStorage.setItem('crucigrama_progreso', JSON.stringify(p))
}

export default function CrucigramaSeleccionPage() {
  const router = useRouter()
  const [simSeleccionado, setSimSeleccionado] = useState<number | null>(null)
  const [progreso, setProgreso] = useState(getProgreso)

  function refrescar() { setProgreso(getProgreso()) }

  if (simSeleccionado !== null) {
    const sim = SIMULADORES.find(s => s.id === simSeleccionado)!
    const p   = progreso[simSeleccionado] ?? {}

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5 fade-in">
          <button onClick={() => { setSimSeleccionado(null); refrescar() }}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
            <ArrowLeft size={16}/> Regresar
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">{sim.titulo}</h2>
            <p className="text-white/70 text-sm mt-1">{sim.desc}</p>
          </div>

          <div className="space-y-3">
            <NivelCard
              titulo="Nivel 1"
              desc="10 palabras clave · Pistas temáticas"
              completado={!!p[1]}
              bloqueado={false}
              onClick={() => router.push(`/area/crucigrama/jugar?sim=${simSeleccionado}&nivel=1`)}
            />
            <NivelCard
              titulo="Nivel 2"
              desc="10 palabras diferentes · Más difícil"
              completado={!!p[2]}
              bloqueado={!p[1]}
              onClick={() => router.push(`/area/crucigrama/jugar?sim=${simSeleccionado}&nivel=2`)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5 fade-in">
        <button onClick={() => router.push('/area')}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
          <ArrowLeft size={16}/> Volver
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white">Crucigramas</h1>
          <p className="text-white/70 text-sm mt-1">Selecciona un simulador</p>
        </div>

        <div className="space-y-3">
          {SIMULADORES.map(sim => {
            const p = progreso[sim.id] ?? {}
            return (
              <button key={sim.id}
                onClick={() => { setSimSeleccionado(sim.id); refrescar() }}
                className={`w-full bg-gradient-to-r ${sim.color} rounded-2xl p-4 text-left shadow-lg active:scale-95 transition-all`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-white">{sim.titulo}</p>
                    <p className="text-white/70 text-xs mt-0.5">{sim.desc}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2].map(n => (
                      <div key={n} className={`w-2.5 h-2.5 rounded-full ${p[n] ? 'bg-yellow-300' : 'bg-white/30'}`}/>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NivelCard({ titulo, desc, completado, bloqueado, onClick }: {
  titulo: string; desc: string; completado: boolean; bloqueado: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={bloqueado}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-95 ${
        bloqueado ? 'bg-white/10 opacity-50 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30 shadow-md'
      }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {bloqueado ? <Lock size={18} className="text-white/60"/> : <Grid3x3 size={18} className="text-white"/>}
          </div>
          <div>
            <p className="font-extrabold text-white">{titulo}</p>
            <p className="text-white/70 text-xs">{desc}</p>
          </div>
        </div>
        {completado && <CheckCircle size={20} className="text-green-300"/>}
        {bloqueado  && <Lock size={16} className="text-white/40"/>}
      </div>
    </button>
  )
}