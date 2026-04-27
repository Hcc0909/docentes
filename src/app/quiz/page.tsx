'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Pregunta } from '@/lib/supabase'
import { Zap, Trophy, RotateCcw, ArrowLeft, Loader2, CheckCircle, XCircle, Flame } from 'lucide-react'

const TIEMPO_POR_PREGUNTA = 15
const TOTAL_PREGUNTAS     = 10
const PUNTOS_BASE         = 1000

const COLORES = [
  { bg: 'bg-red-500',    hover: 'hover:bg-red-600',    text: 'text-white', letra: 'A' },
  { bg: 'bg-blue-500',   hover: 'hover:bg-blue-600',   text: 'text-white', letra: 'B' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-gray-900', letra: 'C' },
  { bg: 'bg-green-500',  hover: 'hover:bg-green-600',  text: 'text-white', letra: 'D' },
]

function barajar<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function QuizContenido() {
  const router = useRouter()

  const [fase,        setFase]       = useState<'inicio' | 'jugando' | 'resultado_p' | 'final'>('inicio')
  const [preguntas,   setPreguntas]  = useState<Pregunta[]>([])
  const [cargando,    setCargando]   = useState(true)
  const [indice,      setIndice]     = useState(0)
  const [seleccion,   setSeleccion]  = useState<number | null>(null)
  const [tiempo,      setTiempo]     = useState(TIEMPO_POR_PREGUNTA)
  const [puntaje,     setPuntaje]    = useState(0)
  const [aciertos,    setAciertos]   = useState(0)
  const [racha,       setRacha]      = useState(0)
  const [maxRacha,    setMaxRacha]   = useState(0)
  const [fueCorrecta, setFueCorrecta]= useState<boolean | null>(null)
  const [puntosGanados, setPuntosGanados] = useState(0)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('preguntas')
        .select('*')
        .not('simulador', 'eq', 6)
      if (data) setPreguntas(barajar(data as Pregunta[]).slice(0, TOTAL_PREGUNTAS))
      setCargando(false)
    }
    cargar()
  }, [])

  const mostrarResultadoPregunta = useCallback((idx: number | null) => {
    const pregunta = preguntas[indice]
    const correcta = pregunta.respuesta_correcta
    const acerto   = idx === correcta

    setSeleccion(idx)
    setFueCorrecta(acerto)

    if (acerto) {
      const bonus  = Math.round((tiempo / TIEMPO_POR_PREGUNTA) * PUNTOS_BASE)
      const nuevaRacha = racha + 1
      const bonusRacha = nuevaRacha >= 3 ? Math.round(bonus * 0.5) : 0
      const total  = bonus + bonusRacha
      setPuntosGanados(total)
      setPuntaje(p => p + total)
      setAciertos(a => a + 1)
      setRacha(nuevaRacha)
      setMaxRacha(r => Math.max(r, nuevaRacha))
    } else {
      setPuntosGanados(0)
      setRacha(0)
    }

    setFase('resultado_p')
  }, [indice, preguntas, tiempo, racha])

  // Cronómetro
  useEffect(() => {
    if (fase !== 'jugando') return
    if (tiempo <= 0) { mostrarResultadoPregunta(null); return }
    const t = setInterval(() => setTiempo(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [fase, tiempo, mostrarResultadoPregunta])

  function iniciar() {
    setFase('jugando')
    setTiempo(TIEMPO_POR_PREGUNTA)
  }

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      setFase('final')
    } else {
      setIndice(i => i + 1)
      setSeleccion(null)
      setFueCorrecta(null)
      setTiempo(TIEMPO_POR_PREGUNTA)
      setFase('jugando')
    }
  }

  function reiniciar() {
    setPreguntas(p => barajar([...p]))
    setIndice(0); setSeleccion(null); setFueCorrecta(null)
    setPuntaje(0); setAciertos(0); setRacha(0); setMaxRacha(0)
    setTiempo(TIEMPO_POR_PREGUNTA); setFase('inicio')
  }

  const porcentajeTiempo = (tiempo / TIEMPO_POR_PREGUNTA) * 100
  const porcentajeFinal  = Math.round((aciertos / TOTAL_PREGUNTAS) * 100)

  // ── INICIO ──
  if (fase === 'inicio') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6 fade-in">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors mx-auto">
            <ArrowLeft size={16}/> Volver al menú
          </button>

          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-3xl">
              <Zap size={40} className="text-yellow-300" />
            </div>
            <h1 className="text-4xl font-extrabold text-white">Quiz Rápido</h1>
            <p className="text-white/80 text-sm">{TOTAL_PREGUNTAS} preguntas · {TIEMPO_POR_PREGUNTA}s por pregunta</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Preguntas', valor: TOTAL_PREGUNTAS },
              { label: 'Tiempo c/u', valor: `${TIEMPO_POR_PREGUNTA}s` },
              { label: 'Pts. máx.', valor: PUNTOS_BASE * TOTAL_PREGUNTAS },
              { label: 'Bonus racha', valor: '+50%' },
            ].map(({ label, valor }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
                <p className="text-white font-extrabold text-xl">{valor}</p>
                <p className="text-white/70 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {cargando ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 size={20} className="animate-spin"/> Cargando preguntas…
            </div>
          ) : (
            <button onClick={iniciar}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-95">
              ⚡ ¡Empezar!
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── JUGANDO ──
  if (fase === 'jugando' && preguntas.length > 0) {
    const p = preguntas[indice]
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <div className="flex items-center justify-between text-white text-sm font-medium">
            <span className="bg-white/20 px-3 py-1 rounded-full">{indice + 1} / {TOTAL_PREGUNTAS}</span>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
              <Flame size={14} className="text-orange-300"/> <span>{racha} racha</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full">⭐ {puntaje}</span>
          </div>

          {/* Barra de tiempo */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${tiempo <= 5 ? 'bg-red-400' : tiempo <= 10 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${porcentajeTiempo}%` }}
            />
          </div>
          <div className="text-center">
            <span className={`text-2xl font-extrabold ${tiempo <= 5 ? 'text-red-300' : 'text-white'}`}>{tiempo}</span>
          </div>
        </div>

        {/* Pregunta */}
        <div className="flex-1 flex flex-col px-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center">
            <p className="text-gray-800 font-semibold leading-relaxed text-base">{p.pregunta}</p>
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            {p.opciones.map((op, idx) => {
              const color = COLORES[idx]
              return (
                <button
                  key={idx}
                  onClick={() => mostrarResultadoPregunta(idx)}
                  className={`${color.bg} ${color.hover} ${color.text} rounded-2xl p-4 font-bold text-sm shadow-md active:scale-95 transition-all duration-150 flex flex-col items-start gap-1 min-h-[80px]`}
                >
                  <span className="text-lg">{color.letra}</span>
                  <span className="text-left leading-tight">{op}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── RESULTADO DE PREGUNTA ──
  if (fase === 'resultado_p' && preguntas.length > 0) {
    const p = preguntas[indice]
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${fueCorrecta ? 'bg-green-500' : 'bg-red-500'}`}>
        <div className="max-w-sm w-full space-y-6 text-center fade-in">

          {/* Ícono resultado */}
          <div className="space-y-2">
            {fueCorrecta
              ? <CheckCircle size={64} className="text-white mx-auto"/>
              : <XCircle    size={64} className="text-white mx-auto"/>
            }
            <h2 className="text-3xl font-extrabold text-white">
              {seleccion === null ? '¡Tiempo!' : fueCorrecta ? '¡Correcto!' : '¡Incorrecto!'}
            </h2>
          </div>

          {/* Respuesta correcta si falló */}
          {!fueCorrecta && (
            <div className="bg-white/20 rounded-2xl p-4 text-white text-sm">
              <p className="font-semibold mb-1">Respuesta correcta:</p>
              <p>{p.opciones[p.respuesta_correcta]}</p>
            </div>
          )}

          {/* Puntos ganados */}
          {fueCorrecta && (
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Puntos ganados</p>
              <p className="text-5xl font-extrabold text-white">+{puntosGanados}</p>
              {racha >= 3 && <p className="text-yellow-200 font-bold">🔥 ¡Racha x{racha}! Bonus incluido</p>}
            </div>
          )}

          {/* Total */}
          <div className="bg-white/20 rounded-2xl p-3 text-white">
            <p className="text-sm">Puntaje total</p>
            <p className="text-2xl font-extrabold">⭐ {puntaje}</p>
          </div>

          <button onClick={siguiente}
            className="w-full bg-white text-gray-800 font-extrabold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all">
            {indice + 1 < preguntas.length ? 'Siguiente →' : 'Ver resultados'}
          </button>
        </div>
      </div>
    )
  }

  // ── FINAL ──
  if (fase === 'final') {
    const aprobado = porcentajeFinal >= 60
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-5 fade-in">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl">
              <Trophy size={40} className={aprobado ? 'text-yellow-300' : 'text-white/70'} />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {aprobado ? '¡Excelente!' : '¡Sigue practicando!'}
            </h1>
          </div>

          {/* Puntaje */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
            <p className="text-white/70 text-sm">Puntaje final</p>
            <p className="text-5xl font-extrabold text-yellow-300">⭐ {puntaje}</p>
            <p className="text-white/70 text-sm mt-1">{aciertos} de {TOTAL_PREGUNTAS} correctas · {porcentajeFinal}%</p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${aprobado ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ width: `${porcentajeFinal}%` }}/>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Correctas', valor: aciertos, emoji: '✅' },
              { label: 'Incorrectas', valor: TOTAL_PREGUNTAS - aciertos, emoji: '❌' },
              { label: 'Mejor racha', valor: maxRacha, emoji: '🔥' },
            ].map(({ label, valor, emoji }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
                <p className="text-xl">{emoji}</p>
                <p className="text-white font-extrabold text-xl">{valor}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={reiniciar}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw size={18}/> Jugar de nuevo
            </button>
            <button onClick={() => router.push('/')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={18}/> Volver al menú
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white"/>
      </div>
    }>
      <QuizContenido/>
    </Suspense>
  )
}