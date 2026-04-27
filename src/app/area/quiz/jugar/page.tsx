'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Pregunta } from '@/lib/supabase'
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowLeft, Loader2, Flame, Lock } from 'lucide-react'
import { setProgresoNivel } from '../page'

const PREGUNTAS_NIVEL  = 15
const PREGUNTAS_EXAMEN = 10
const TIEMPO_POR_PREGUNTA = 15

const COLORES = [
  { bg: 'bg-red-500',    hover: 'hover:bg-red-600',    text: 'text-white',      letra: 'A' },
  { bg: 'bg-blue-500',   hover: 'hover:bg-blue-600',   text: 'text-white',      letra: 'B' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-gray-900',   letra: 'C' },
  { bg: 'bg-green-500',  hover: 'hover:bg-green-600',  text: 'text-white',      letra: 'D' },
]

const TEMAS: Record<string, string> = {
  'Fundamentos Teóricos': 'Teoría de Vygotsky, ZDP, herramientas de la mente, estilos de crianza, aprendizaje CASC.',
  'Marco Legal':          'Artículos 3°, 4° y 5° Constitucionales, LGE, Ley General de Derechos de NNA.',
  'Currículo':            'Plan 2022, campos formativos, ejes articuladores, Programa Analítico y Sintético.',
  'Gestión Escolar':      'Lineamientos CTE, Proceso de Mejora Continua, participación comunitaria.',
  'Evaluación':           'Acuerdo 10/09/23, mediación escolar, resolución de conflictos, vida saludable.',
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function JugarContenido() {
  const router    = useRouter()
  const params    = useSearchParams()
  const simId     = Number(params.get('sim') ?? 1)
  const nivel     = Number(params.get('nivel') ?? 1)
  const esExamen  = nivel === 3
  const totalPreg = esExamen ? PREGUNTAS_EXAMEN : PREGUNTAS_NIVEL

  const [fase,         setFase]        = useState<'cargando'|'jugando'|'resultado_p'|'final'>('cargando')
  const [preguntas,    setPreguntas]   = useState<Pregunta[]>([])
  const [indice,       setIndice]      = useState(0)
  const [seleccion,    setSeleccion]   = useState<number|null>(null)
  const [tiempo,       setTiempo]      = useState(TIEMPO_POR_PREGUNTA)
  const [puntaje,      setPuntaje]     = useState(0)
  const [aciertos,     setAciertos]    = useState(0)
  const [racha,        setRacha]       = useState(0)
  const [maxRacha,     setMaxRacha]    = useState(0)
  const [fueCorrecta,  setFueCorrecta] = useState<boolean|null>(null)
  const [puntosGanados,setPuntosGanados] = useState(0)

  // Cargar preguntas barajadas
  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('preguntas')
        .select('*')
        .eq('simulador', simId)
      if (data) {
        // Barajar tanto preguntas como opciones internamente
        const barajadas = barajar(data as Pregunta[])
        // Para nivel 1: primeras 15, nivel 2: siguientes 15, examen: últimas 10
        let seleccionadas: Pregunta[]
        if (nivel === 1)      seleccionadas = barajadas.slice(0, PREGUNTAS_NIVEL)
        else if (nivel === 2) seleccionadas = barajadas.slice(PREGUNTAS_NIVEL, PREGUNTAS_NIVEL * 2)
        else                  seleccionadas = barajadas.slice(0, PREGUNTAS_EXAMEN)

        setPreguntas(seleccionadas)
        setFase('jugando')
        setTiempo(esExamen ? 999 : TIEMPO_POR_PREGUNTA)
      }
    }
    cargar()
  }, [simId, nivel, esExamen])

  const mostrarResultado = useCallback((idx: number | null) => {
    if (!preguntas[indice]) return
    const correcta = preguntas[indice].respuesta_correcta
    const acerto   = idx === correcta

    setSeleccion(idx)
    setFueCorrecta(acerto)

    if (acerto && !esExamen) {
      const bonus      = Math.round(((tiempo) / TIEMPO_POR_PREGUNTA) * 1000)
      const nuevaRacha = racha + 1
      const bonusRacha = nuevaRacha >= 3 ? Math.round(bonus * 0.5) : 0
      const total      = bonus + bonusRacha
      setPuntosGanados(total)
      setPuntaje(p => p + total)
      setAciertos(a => a + 1)
      setRacha(nuevaRacha)
      setMaxRacha(r => Math.max(r, nuevaRacha))
    } else if (acerto) {
      setAciertos(a => a + 1)
      setRacha(r => r + 1)
      setMaxRacha(r => Math.max(r, racha + 1))
    } else {
      setPuntosGanados(0)
      setRacha(0)
    }

    setFase('resultado_p')
  }, [indice, preguntas, tiempo, racha, esExamen])

  // Cronómetro solo en niveles 1 y 2
  useEffect(() => {
    if (fase !== 'jugando' || esExamen) return
    if (tiempo <= 0) { mostrarResultado(null); return }
    const t = setInterval(() => setTiempo(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [fase, tiempo, mostrarResultado, esExamen])

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      // Guardar progreso en sessionStorage
      const nivelKey = nivel === 1 ? 'nivel1' : nivel === 2 ? 'nivel2' : 'examen'
      setProgresoNivel(simId, nivelKey)
      setFase('final')
    } else {
      setIndice(i => i + 1)
      setSeleccion(null)
      setFueCorrecta(null)
      if (!esExamen) setTiempo(TIEMPO_POR_PREGUNTA)
      setFase('jugando')
    }
  }

  function reintentar() {
    setIndice(0); setSeleccion(null); setFueCorrecta(null)
    setPuntaje(0); setAciertos(0); setRacha(0); setMaxRacha(0)
    setTiempo(esExamen ? 999 : TIEMPO_POR_PREGUNTA)
    setPreguntas(p => barajar([...p]))
    setFase('jugando')
  }

  const porcentajeTiempo = esExamen ? 100 : (tiempo / TIEMPO_POR_PREGUNTA) * 100
  const porcentajeFinal  = Math.round((aciertos / totalPreg) * 100)
  const aprobado         = porcentajeFinal >= 60

  const TITULOS: Record<number, string> = {
    1: 'Nivel 1', 2: 'Nivel 2', 3: 'Examen Final'
  }

  // ── CARGANDO ──
  if (fase === 'cargando') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={40} className="animate-spin text-white mx-auto"/>
          <p className="text-white font-bold">Preparando preguntas…</p>
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
            <span className="bg-white/20 px-3 py-1 rounded-full">{indice + 1}/{totalPreg}</span>
            {!esExamen && (
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
                <Flame size={14} className="text-orange-300"/> {racha}
              </div>
            )}
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {esExamen ? TITULOS[nivel] : `⭐ ${puntaje}`}
            </span>
          </div>

          {!esExamen && (
            <>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${tiempo <= 5 ? 'bg-red-400' : tiempo <= 10 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ width: `${porcentajeTiempo}%` }}
                />
              </div>
              <div className="text-center">
                <span className={`text-2xl font-extrabold ${tiempo <= 5 ? 'text-red-300' : 'text-white'}`}>{tiempo}</span>
              </div>
            </>
          )}
        </div>

        {/* Pregunta */}
        <div className="flex-1 flex flex-col px-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center">
            <p className="text-gray-800 font-semibold leading-relaxed">{p.pregunta}</p>
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            {p.opciones.map((op, idx) => {
              const color = COLORES[idx]
              return (
                <button key={idx} onClick={() => mostrarResultado(idx)}
                  className={`${color.bg} ${color.hover} ${color.text} rounded-2xl p-4 font-bold text-sm shadow-md active:scale-95 transition-all flex flex-col items-start gap-1 min-h-[80px]`}>
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
    const p        = preguntas[indice]
    const correcta = p.respuesta_correcta
    const tema     = TEMAS[p.categoria] ?? 'Revisa los documentos base de este tema.'

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${fueCorrecta ? 'bg-green-500' : 'bg-red-500'}`}>
        <div className="max-w-sm w-full space-y-5 text-center fade-in">

          {fueCorrecta
            ? <CheckCircle size={64} className="text-white mx-auto"/>
            : <XCircle    size={64} className="text-white mx-auto"/>
          }

          <h2 className="text-3xl font-extrabold text-white">
            {seleccion === null ? '¡Tiempo!' : fueCorrecta ? '¡Correcto!' : '¡Incorrecto!'}
          </h2>

          {/* Respuesta correcta siempre visible */}
          <div className="bg-white/20 rounded-2xl p-4 text-white text-sm text-left space-y-2">
            <p className="font-bold">✅ Respuesta correcta:</p>
            <p>{p.opciones[correcta]}</p>
            <div className="border-t border-white/20 pt-2 mt-2">
              <p className="font-bold">📚 Tema:</p>
              <p className="text-white/90 text-xs mt-1">{tema}</p>
            </div>
          </div>

          {/* Puntos solo en niveles */}
          {!esExamen && fueCorrecta && (
            <div>
              <p className="text-white/80 text-sm">Puntos ganados</p>
              <p className="text-4xl font-extrabold text-white">+{puntosGanados}</p>
              {racha >= 3 && <p className="text-yellow-200 font-bold mt-1">🔥 ¡Racha x{racha}!</p>}
            </div>
          )}

          {!esExamen && (
            <div className="bg-white/20 rounded-xl p-3 text-white">
              <p className="text-sm">Puntaje total</p>
              <p className="text-2xl font-extrabold">⭐ {puntaje}</p>
            </div>
          )}

          <button onClick={siguiente}
            className="w-full bg-white text-gray-800 font-extrabold py-4 rounded-2xl text-lg active:scale-95 transition-all">
            {indice + 1 < preguntas.length ? 'Siguiente →' : 'Ver resultados'}
          </button>
        </div>
      </div>
    )
  }

  // ── FINAL ──
  if (fase === 'final') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-5 fade-in">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl">
              <Trophy size={40} className={aprobado ? 'text-yellow-300' : 'text-white/70'}/>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {aprobado ? '¡Completado!' : '¡Sigue intentando!'}
            </h1>
            <p className="text-white/70 text-sm">{TITULOS[nivel]} · Simulador {simId}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 text-center space-y-2">
            {!esExamen && (
              <>
                <p className="text-white/70 text-sm">Puntaje final</p>
                <p className="text-5xl font-extrabold text-yellow-300">⭐ {puntaje}</p>
              </>
            )}
            <p className="text-white/70 text-sm">{aciertos} de {totalPreg} correctas · {porcentajeFinal}%</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${aprobado ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ width: `${porcentajeFinal}%` }}/>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Correctas',   valor: aciertos,            emoji: '✅' },
              { label: 'Incorrectas', valor: totalPreg - aciertos, emoji: '❌' },
              { label: 'Mejor racha', valor: maxRacha,             emoji: '🔥' },
            ].map(({ label, valor, emoji }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
                <p className="text-xl">{emoji}</p>
                <p className="text-white font-extrabold text-xl">{valor}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Siguiente nivel desbloqueado */}
          {aprobado && nivel < 3 && (
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-3 text-center">
              <p className="text-yellow-300 font-bold text-sm">
                🔓 {nivel === 1 ? 'Nivel 2' : 'Examen Final'} desbloqueado
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={reintentar}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw size={18}/> Intentar de nuevo
            </button>
            <button onClick={() => router.push('/area/quiz')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={18}/> Seleccionar nivel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function JugarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white"/>
      </div>
    }>
      <JugarContenido/>
    </Suspense>
  )
}