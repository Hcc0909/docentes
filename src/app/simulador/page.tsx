'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Pregunta } from '@/lib/supabase'
import {
  Clock, ChevronRight, Loader2, AlertCircle, PlayCircle,
  ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, AlertTriangle
} from 'lucide-react'

// ── Configuración por simulador ───────────────────────────────────────────────
const SIMULADORES: Record<number, { titulo: string; duracion: number }> = {
  1: { titulo: 'Fundamentos Teóricos del Aprendizaje y Desarrollo Infantil', duracion: 1800 },
  2: { titulo: 'Marco Legal y Derechos de la Infancia', duracion: 1800 },
  3: { titulo: 'Currículo, Planeación y Programas de Estudio', duracion: 1800 },
  4: { titulo: 'Gestión Escolar, CTE y Participación Comunitaria', duracion: 1800 },
  5: { titulo: 'Evaluación Formativa, Convivencia y Vida Saludable', duracion: 1800 },
  6: { titulo: 'Examen Final Integrador', duracion: 7200 },
}

// ── Temas por categoría para retroalimentación ────────────────────────────────
const TEMAS_ESTUDIO: Record<string, string> = {
  'Fundamentos Teóricos': 'Teoría de Vygotsky, herramientas de la mente, ZDP, estilos de crianza, aprendizaje CASC (OCDE), evaluación formativa.',
  'Marco Legal': 'Artículos 3°, 4° y 5° Constitucionales, LGE, Ley General de Derechos de NNA, protocolos de acoso y violencia escolar.',
  'Currículo': 'Plan de Estudio 2022, campos formativos, ejes articuladores, Programa Analítico, Programa Sintético, planeación didáctica.',
  'Gestión Escolar': 'Lineamientos CTE, Proceso de Mejora Continua, participación comunitaria, entornos escolares seguros.',
  'Evaluación': 'Acuerdo 10/09/23, evaluación formativa, mediación escolar, resolución de conflictos, vida saludable, cultura de paz.',
}

function formatTime(seg: number) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  return h > 0
    ? [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
    : [m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Componente de alerta de inicio ────────────────────────────────────────────
function AlertaInicio({ simId, duracion, onConfirmar, onCancelar }: {
  simId: number
  duracion: number
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Antes de comenzar</h2>
        </div>

        <ul className="space-y-3">
          {[
            'Al salir del examen se pierde todo el progreso.',
            'Al seleccionar una respuesta no podrás cambiarla.',
            'No podrás regresar a preguntas anteriores.',
            `Si se acaba el tiempo (${formatTime(duracion)}), el examen se cierra automáticamente.`,
            'Al terminar verás tu calificación y los temas a reforzar.',
          ].map((texto, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
              {texto}
            </li>
          ))}
        </ul>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-colors"
          >
            Entendido, iniciar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pantalla de resultados ────────────────────────────────────────────────────
function Resultados({ aciertos, errores, total, categoriasFalladas, onReintentar, onVolver }: {
  aciertos: number
  errores: number
  total: number
  categoriasFalladas: string[]
  onReintentar: () => void
  onVolver: () => void
}) {
  const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0
  const aprobado = porcentaje >= 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-5 fade-in">

        {/* Título */}
        <div className="text-center space-y-2">
          <div className={`inline-flex p-4 rounded-full ${aprobado ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Trophy size={36} className={aprobado ? 'text-green-600' : 'text-amber-500'} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {aprobado ? '¡Excelente resultado!' : 'Sigue practicando'}
          </h1>
        </div>

        {/* Calificación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Calificación</p>
          <p className="text-6xl font-extrabold text-blue-700">
            {porcentaje}<span className="text-3xl">%</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{aciertos} de {total} correctas</p>
          <div className="mt-4 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${aprobado ? 'bg-green-500' : 'bg-amber-400'}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
            <p className="font-bold text-2xl text-green-700">{aciertos}</p>
            <p className="text-xs text-gray-400">Correctas</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <XCircle size={20} className="text-red-400 mx-auto mb-1" />
            <p className="font-bold text-2xl text-red-600">{errores}</p>
            <p className="text-xs text-gray-400">Incorrectas</p>
          </div>
        </div>

        {/* Temas a reforzar */}
        {categoriasFalladas.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-bold text-amber-800">📚 Temas a reforzar:</p>
            {categoriasFalladas.map(cat => (
              <div key={cat} className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                <span className="font-semibold">{cat}:</span> {TEMAS_ESTUDIO[cat] ?? 'Revisa los documentos base de este tema.'}
              </div>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onReintentar}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <RotateCcw size={17} /> Intentar de nuevo
          </button>
          <button
            onClick={onVolver}
            className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors"
          >
            <ArrowLeft size={17} /> Volver al menú
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
function SimuladorContenido() {
  const router = useRouter()
  const params = useSearchParams()
  const simId = Number(params.get('id') ?? 1)
  const config = SIMULADORES[simId] ?? SIMULADORES[1]

  const [fase,           setFase]          = useState<'inicio' | 'alerta' | 'examen' | 'resultados'>('inicio')
  const [preguntas,      setPreguntas]     = useState<Pregunta[]>([])
  const [cargando,       setCargando]      = useState(true)
  const [errorCarga,     setErrorCarga]    = useState<string | null>(null)
  const [indice,         setIndice]        = useState(0)
  const [respuestas,     setRespuestas]    = useState<Record<number, number>>({}) // indice → opción elegida
  const [aciertos,       setAciertos]      = useState(0)
  const [errores,        setErrores]       = useState(0)
  const [segundos,       setSegundos]      = useState(config.duracion)
  const [timerActivo,    setTimerActivo]   = useState(false)
  const [catsFalladas,   setCatsFalladas]  = useState<string[]>([])

  // Cargar preguntas
  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const { data, error } = await supabase
        .from('preguntas')
        .select('*')
        .eq('simulador', simId)
      if (error) { setErrorCarga(error.message); setCargando(false); return }
      setPreguntas(barajar(data as Pregunta[]))
      setCargando(false)
    }
    cargar()
  }, [simId])

  // Cronómetro
  const finalizarExamen = useCallback((preguntasActuales?: Pregunta[], respuestasActuales?: Record<number, number>) => {
    setTimerActivo(false)
    // Calcular categorías falladas
    const pArr = preguntasActuales ?? preguntas
    const rMap = respuestasActuales ?? respuestas
    const falladas = new Set<string>()
    pArr.forEach((p, i) => {
      if (rMap[i] !== p.respuesta_correcta) falladas.add(p.categoria)
    })
    setCatsFalladas(Array.from(falladas))
    setFase('resultados')
  }, [preguntas, respuestas])

  useEffect(() => {
    if (!timerActivo) return
    if (segundos <= 0) { finalizarExamen(); return }
    const interval = setInterval(() => setSegundos(s => s - 1), 1000)
    return () => clearInterval(interval)
  }, [timerActivo, segundos, finalizarExamen])

  function iniciarExamen() {
    setFase('examen')
    setTimerActivo(true)
  }

  function seleccionar(idx: number) {
    if (respuestas[indice] !== undefined) return // ya respondida
    const nuevasRespuestas = { ...respuestas, [indice]: idx }
    setRespuestas(nuevasRespuestas)

    const correcta = preguntas[indice].respuesta_correcta
    if (idx === correcta) {
      setAciertos(a => a + 1)
    } else {
      setErrores(e => e + 1)
    }
  }

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      finalizarExamen(preguntas, { ...respuestas })
      return
    }
    setIndice(i => i + 1)
  }

  function reintentar() {
    setFase('inicio')
    setIndice(0)
    setRespuestas({})
    setAciertos(0)
    setErrores(0)
    setSegundos(config.duracion)
    setTimerActivo(false)
    setCatsFalladas([])
    setPreguntas(p => barajar([...p]))
  }

  const esCritico = segundos <= 300
  const progreso  = preguntas.length > 0 ? Math.round((indice / preguntas.length) * 100) : 0
  const yaRespondida = respuestas[indice] !== undefined
  const LETRAS = ['A', 'B', 'C', 'D']

  // ── Resultados ──
  if (fase === 'resultados') {
    return (
      <Resultados
        aciertos={aciertos}
        errores={errores}
        total={preguntas.length}
        categoriasFalladas={catsFalladas}
        onReintentar={reintentar}
        onVolver={() => router.push('/')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">

      {/* Alerta de inicio */}
      {fase === 'alerta' && (
        <AlertaInicio
          simId={simId}
          duracion={config.duracion}
          onConfirmar={iniciarExamen}
          onCancelar={() => setFase('inicio')}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <p className="text-xs font-semibold text-gray-600 truncate flex-1 text-center">{config.titulo}</p>
          {fase === 'examen' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold shrink-0 ${esCritico ? 'bg-red-50 border-red-300 text-red-700 pulse-danger' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              {esCritico ? <AlertTriangle size={13} /> : <Clock size={13} />}
              {formatTime(segundos)}
            </div>
          )}
        </div>
        {fase === 'examen' && (
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progreso}%` }} />
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── INICIO ── */}
        {fase === 'inicio' && (
          <div className="text-center space-y-6 py-8 fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-800">
                {simId === 6 ? 'Examen Final Integrador' : `Simulador ${simId}`}
              </h1>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">{config.titulo}</p>
            </div>

            {cargando && (
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Cargando reactivos…</p>
              </div>
            )}

            {errorCarga && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} /> {errorCarga}
              </div>
            )}

            {!cargando && !errorCarga && (
              <>
                <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
  {[
    { l: 'Preguntas', v: preguntas.length },
    { l: 'Duración', v: simId === 6 ? '2 h' : '30 min' },
    { l: 'Mínimo', v: '60%' },
  ].map(({ l, v }) => (
    <div key={l} className="bg-white px-4 py-4">
      <p className="text-2xl font-extrabold text-blue-700">{v}</p>
      <p className="text-xs text-gray-400">{l}</p>
    </div>
  ))}
</div>
<button
  onClick={() => setFase('alerta')}
  className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-base"
>
  <PlayCircle size={20} /> Iniciar Examen
</button>
              </>
            )}
          </div>
        )}

        {/* ── EXAMEN ── */}
        {fase === 'examen' && preguntas.length > 0 && (
          <>
            {/* Alerta tiempo crítico */}
            {esCritico && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-2.5 flex items-center gap-2">
                ⚠️ ¡Menos de 5 minutos! Termina tu examen pronto.
              </div>
            )}

            {/* Tarjeta de pregunta */}
            <div className="question-enter bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7 space-y-5">
              <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{preguntas[indice].categoria}</span>
                <span>{indice + 1} / {preguntas.length}</span>
              </div>

              <p className="text-gray-800 font-medium leading-relaxed">{preguntas[indice].pregunta}</p>

              <div className="space-y-2.5">
                {preguntas[indice].opciones.map((op, idx) => {
                  let cls = 'flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 w-full '

                  if (!yaRespondida) {
                    cls += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                  } else {
                    // Solo mostrar seleccionada en azul, sin revelar correcta/incorrecta
                    cls += idx === respuestas[indice]
                      ? 'border-blue-500 bg-blue-50 text-blue-900 cursor-default'
                      : 'border-gray-200 opacity-50 cursor-default'
                  }

                  return (
                    <button
                      key={idx}
                      disabled={yaRespondida}
                      onClick={() => seleccionar(idx)}
                      className={cls}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                        {LETRAS[idx]}
                      </span>
                      <span className="text-sm leading-snug">{op}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between items-center">
              <button
  onClick={() => {
    if (confirm('¿Seguro que deseas salir? Perderás todo el progreso del examen.')) {
      router.push('/')
    }
  }}
  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
>
  Salir del examen
</button>

              {yaRespondida && (
                <button
                  onClick={siguiente}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {indice + 1 < preguntas.length ? 'Siguiente' : 'Ver resultados'}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function SimuladorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    }>
      <SimuladorContenido />
    </Suspense>
  )
}