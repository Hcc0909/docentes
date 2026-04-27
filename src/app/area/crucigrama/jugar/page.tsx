'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, Loader2, Trophy, Home } from 'lucide-react'
import { setProgresoCrucigrama } from '../page'

const BANCO: Record<number, Record<number, { palabra: string; pista: string }[]>> = {
  1: {
    1: [
      { palabra: 'VYGOTSKY',        pista: 'Teórico que desarrolló el concepto de Zona de Desarrollo Próximo' },
      { palabra: 'MEDIACION',       pista: 'Proceso mediante el cual una herramienta facilita el aprendizaje' },
      { palabra: 'LENGUAJE',        pista: 'Herramienta cultural fundamental para el desarrollo mental superior' },
      { palabra: 'JUEGO',           pista: 'Actividad que crea una ZDP en niños preescolares según Vygotsky' },
      { palabra: 'ANDAMIAJE',       pista: 'Apoyo temporal que un adulto brinda al aprendiz' },
      { palabra: 'EMPATIA',         pista: 'Capacidad de ponerse en el lugar del otro' },
      { palabra: 'AUTORREGULACION', pista: 'Habilidad de gestionar el propio aprendizaje y conducta' },
      { palabra: 'METACOGNICION',   pista: 'Conocimiento sobre el propio proceso de pensar' },
      { palabra: 'CONSTRUCTIVISMO', pista: 'Teoría donde el alumno construye activamente su conocimiento' },
      { palabra: 'INTERIORIZAR',    pista: 'Proceso de llevar una conducta externa al plano mental' },
    ],
    2: [
      { palabra: 'PIAGET',             pista: 'Teórico que enfatizó la construcción cognitiva con objetos físicos' },
      { palabra: 'COLABORATIVO',       pista: 'Tipo de aprendizaje basado en trabajo conjunto' },
      { palabra: 'RETROALIMENTACION',  pista: 'Información que se da al alumno sobre su desempeño' },
      { palabra: 'MOTIVACION',         pista: 'Factor emocional clave para el aprendizaje significativo' },
      { palabra: 'CRIANZA',            pista: 'Estilo de educación familiar que influye en el desempeño escolar' },
      { palabra: 'FORMATIVA',          pista: 'Tipo de evaluación que acompaña el proceso de aprendizaje' },
      { palabra: 'SITUADO',            pista: 'Aprendizaje que ocurre en contexto real y significativo' },
      { palabra: 'HERRAMIENTA',        pista: 'Instrumento mental que amplía las capacidades cognitivas' },
      { palabra: 'REFLEXION',          pista: 'Pensar críticamente sobre la propia práctica o aprendizaje' },
      { palabra: 'ZONA',               pista: 'Espacio entre lo que el niño puede hacer solo y con ayuda' },
    ],
  },
  2: {
    1: [
      { palabra: 'CONSTITUCION',  pista: 'Documento que establece los derechos fundamentales en México' },
      { palabra: 'LAICA',         pista: 'Característica de la educación pública sin orientación religiosa' },
      { palabra: 'GRATUITA',      pista: 'Característica de la educación que el Estado ofrece sin costo' },
      { palabra: 'INFANCIA',      pista: 'Etapa de vida protegida por leyes especiales de derechos' },
      { palabra: 'BULLYING',      pista: 'Acoso escolar intencional, persistente y con asimetría de poder' },
      { palabra: 'PROTOCOLO',     pista: 'Conjunto de pasos a seguir ante una situación de riesgo' },
      { palabra: 'IGUALDAD',      pista: 'Principio constitucional de equidad entre hombres y mujeres' },
      { palabra: 'MAGISTERIO',    pista: 'Colectivo de maestros reconocido en la Ley General de Educación' },
      { palabra: 'OBLIGATORIA',   pista: 'Carácter de la educación desde inicial hasta superior en México' },
      { palabra: 'ADOLESCENTE',   pista: 'Persona entre 12 y menos de 18 años según la ley' },
    ],
    2: [
      { palabra: 'NORMATIVA',      pista: 'Conjunto de reglas y leyes que regulan la educación' },
      { palabra: 'DENUNCIA',       pista: 'Acción obligatoria del personal escolar ante violencia sexual' },
      { palabra: 'AUTONOMIA',      pista: 'Facultad de las universidades para gobernarse a sí mismas' },
      { palabra: 'NUTRICION',      pista: 'Derecho de los niños relacionado con la alimentación adecuada' },
      { palabra: 'ACREDITACION',   pista: 'Proceso formal de reconocer aprendizajes con calificación mínima' },
      { palabra: 'DISCRIMINACION', pista: 'Trato desigual prohibido por la Ley General de Derechos de NNA' },
      { palabra: 'CONVIVENCIA',    pista: 'Relación armónica entre miembros de la comunidad escolar' },
      { palabra: 'REPARACION',     pista: 'Medida formativa que busca remediar el daño causado por acoso' },
      { palabra: 'INTIMIDAD',      pista: 'Derecho a no ser objeto de injerencias arbitrarias en vida privada' },
      { palabra: 'FORMACION',      pista: 'Derecho del magisterio a capacitación y actualización continua' },
    ],
  },
  3: {
    1: [
      { palabra: 'CURRICULO',  pista: 'Plan organizado de contenidos y experiencias de aprendizaje' },
      { palabra: 'CAMPO',      pista: 'Organizador curricular que integra diversas disciplinas' },
      { palabra: 'ANALITICO',  pista: 'Tipo de programa que construye el colectivo docente' },
      { palabra: 'SINTETICO',  pista: 'Primer nivel de concreción curricular nacional' },
      { palabra: 'CONTEXTO',   pista: 'Realidad local que los docentes deben considerar en su planeación' },
      { palabra: 'INCLUSION',  pista: 'Eje articulador que valora la diversidad cultural y epistémica' },
      { palabra: 'ESPIRAL',    pista: 'Organización de contenidos que se complejizan progresivamente' },
      { palabra: 'COMUNIDAD',  pista: 'Núcleo integrador del Plan de Estudio 2022' },
      { palabra: 'FASE',       pista: 'Agrupación de grados para dar continuidad al aprendizaje' },
      { palabra: 'CODISENO',   pista: 'Incorporación de contenidos locales por el colectivo docente' },
    ],
    2: [
      { palabra: 'PLANEACION',      pista: 'Anticipar y organizar el proceso de enseñanza-aprendizaje' },
      { palabra: 'AUTONOMIA',       pista: 'Capacidad docente de decidir sobre su ejercicio didáctico' },
      { palabra: 'INTERDISCIPLINA', pista: 'Relación entre diferentes campos del conocimiento' },
      { palabra: 'EJES',            pista: 'Articuladores que vinculan contenidos con la vida cotidiana' },
      { palabra: 'PERFIL',          pista: 'Rasgos que deben desarrollar los estudiantes al egresar' },
      { palabra: 'METODOLOGIA',     pista: 'Conjunto de estrategias para abordar los contenidos' },
      { palabra: 'DIAGNOSTICO',     pista: 'Análisis inicial de la realidad escolar y comunitaria' },
      { palabra: 'GENERO',          pista: 'Eje articulador que cuestiona prácticas patriarcales' },
      { palabra: 'LENGUAJES',       pista: 'Campo formativo que incluye comunicación y expresión' },
      { palabra: 'FLEXIBILIDAD',    pista: 'Característica de la planeación que permite ajustes continuos' },
    ],
  },
  4: {
    1: [
      { palabra: 'COLEGIADO',     pista: 'Carácter del CTE como órgano de decisión compartida' },
      { palabra: 'MEJORA',        pista: 'Proceso continuo que busca transformar el servicio educativo' },
      { palabra: 'DIAGNOSTICO',   pista: 'Primera fase del proceso de mejora continua' },
      { palabra: 'LIDERAZGO',     pista: 'Tipo de conducción compartida en una Comunidad de Aprendizaje' },
      { palabra: 'SUPERVISION',   pista: 'Instancia que brinda acompañamiento técnico-pedagógico' },
      { palabra: 'MOCHILA',       pista: 'Objeto cuya revisión debe ser consensuada y respetuosa' },
      { palabra: 'FAMILIA',       pista: 'Agente educativo que comparte responsabilidad con la escuela' },
      { palabra: 'EMERGENCIA',    pista: 'Situación de riesgo que activa protocolos de seguridad' },
      { palabra: 'TRANSPARENCIA', pista: 'Principio que guía la comunicación de resultados a la comunidad' },
      { palabra: 'PARTICIPACION', pista: 'Involucramiento activo de la comunidad en la vida escolar' },
    ],
    2: [
      { palabra: 'DIALOGO',        pista: 'Principal herramienta para construir consensos en la escuela' },
      { palabra: 'COLECTIVO',      pista: 'Grupo de docentes que toma decisiones pedagógicas en el CTE' },
      { palabra: 'PLURIANUAL',     pista: 'Característica del PMC que reconoce cambios a largo plazo' },
      { palabra: 'CORRESPONSABLE', pista: 'Relación entre escuela, familia y comunidad en la educación' },
      { palabra: 'INTENSIVA',      pista: 'Fase del CTE que ocurre antes del inicio del ciclo escolar' },
      { palabra: 'ORDINARIA',      pista: 'Tipo de sesión del CTE que se realiza durante el ciclo' },
      { palabra: 'COMITE',         pista: 'Grupo de planeación y evaluación dentro del CTE' },
      { palabra: 'RIESGO',         pista: 'Situación que el croquis escolar ayuda a identificar' },
      { palabra: 'SALUDABLE',      pista: 'Adjetivo que describe el entorno escolar que se debe promover' },
      { palabra: 'COMUNIDAD',      pista: 'Espacio de aprendizaje que es el núcleo del Plan 2022' },
    ],
  },
  5: {
    1: [
      { palabra: 'MEDIACION',    pista: 'Proceso voluntario y neutral para resolver conflictos' },
      { palabra: 'ASERTIVIDAD',  pista: 'Habilidad de expresar necesidades sin agredir ni someterse' },
      { palabra: 'EMPATIA',      pista: 'Capacidad de comprender los sentimientos del otro' },
      { palabra: 'CIBERACOSO',   pista: 'Acoso que utiliza medios digitales fuera del horario escolar' },
      { palabra: 'DISCIPLINA',   pista: 'Tipo positivo que enseña habilidades sociales con respeto' },
      { palabra: 'PROMOCION',    pista: 'Proceso de pasar al siguiente grado con calificación mínima de 6' },
      { palabra: 'ACREDITACION', pista: 'Reconocimiento formal del logro de aprendizajes' },
      { palabra: 'TESTIGO',      pista: 'Persona que observa el acoso y puede convertirse en defensor' },
      { palabra: 'ESCUCHA',      pista: 'Habilidad activa de prestar atención plena al otro' },
      { palabra: 'REGULACION',   pista: 'Control emocional ante situaciones de conflicto' },
    ],
    2: [
      { palabra: 'FORMATIVA',      pista: 'Evaluación que acompaña y retroalimenta el proceso de aprendizaje' },
      { palabra: 'CONVIVENCIA',    pista: 'Relación armónica que se favorece con comunicación efectiva' },
      { palabra: 'SALUDABLE',      pista: 'Estilo de vida que promueve la Estrategia Nacional en escuelas' },
      { palabra: 'CONFLICTO',      pista: 'Situación que debe abordarse de manera temprana y constructiva' },
      { palabra: 'AUTOEVALUACION', pista: 'Estrategia donde el alumno valora su propio aprendizaje' },
      { palabra: 'ACUERDO',        pista: 'Documento 10/09/23 que norma la evaluación en educación básica' },
      { palabra: 'PAZ',            pista: 'Cultura que se promueve mediante tolerancia y respeto mutuo' },
      { palabra: 'SOBRESALIENTE',  pista: 'Aptitud que permite promoción anticipada en la normativa' },
      { palabra: 'BOTIQUIN',       pista: 'Recurso de primeros auxilios en el inventario escolar' },
      { palabra: 'NORMAS',         pista: 'Reglas de convivencia elaboradas de forma participativa' },
    ],
  },
}

interface PalabraColocada {
  palabra:   string
  pista:     string
  numero:    number
  direccion: 'H' | 'V'
  row:       number
  col:       number
}

const GRID_SIZE = 15

function generarCrucigrama(palabras: { palabra: string; pista: string }[]) {
  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  const colocadas: PalabraColocada[] = []
  let numero = 1

  const limpias = palabras.map(p => ({
    ...p,
    palabra: p.palabra.toUpperCase().replace(/[^A-Z]/g, ''),
  }))

  const primera  = limpias[0]
  const rowInicio = Math.floor(GRID_SIZE / 2)
  const colInicio = Math.floor((GRID_SIZE - primera.palabra.length) / 2)

  for (let i = 0; i < primera.palabra.length; i++) {
    grid[rowInicio][colInicio + i] = primera.palabra[i]
  }
  colocadas.push({ palabra: primera.palabra, pista: primera.pista, numero, direccion: 'H', row: rowInicio, col: colInicio })
  numero++

  for (let pi = 1; pi < limpias.length; pi++) {
    const { palabra, pista } = limpias[pi]
    let colocada = false

    for (const ya of [...colocadas].reverse()) {
      if (colocada) break
      for (let ci = 0; ci < ya.palabra.length && !colocada; ci++) {
        const letraComun = ya.palabra[ci]
        const posEnNueva = palabra.indexOf(letraComun)
        if (posEnNueva === -1) continue

        if (ya.direccion === 'H') {
          const col = ya.col + ci
          const row = ya.row - posEnNueva
          if (puedeColocar(grid, palabra, row, col, 'V')) {
            colocar(grid, palabra, row, col, 'V')
            colocadas.push({ palabra, pista, numero, direccion: 'V', row, col })
            numero++; colocada = true
          }
        } else {
          const row = ya.row + ci
          const col = ya.col - posEnNueva
          if (puedeColocar(grid, palabra, row, col, 'H')) {
            colocar(grid, palabra, row, col, 'H')
            colocadas.push({ palabra, pista, numero, direccion: 'H', row, col })
            numero++; colocada = true
          }
        }
      }
    }

    if (!colocada) {
      for (let r = 1; r < GRID_SIZE - 1 && !colocada; r++) {
        for (let c = 1; c < GRID_SIZE - 1 && !colocada; c++) {
          const dir = colocadas.length % 2 === 0 ? 'H' : 'V'
          if (puedeColocar(grid, palabra, r, c, dir)) {
            colocar(grid, palabra, r, c, dir)
            colocadas.push({ palabra, pista, numero, direccion: dir, row: r, col: c })
            numero++; colocada = true
          }
        }
      }
    }
  }

  return { grid, colocadas }
}

function puedeColocar(grid: (string | null)[][], palabra: string, row: number, col: number, dir: 'H' | 'V'): boolean {
  if (dir === 'H') {
    if (col < 0 || col + palabra.length > GRID_SIZE) return false
    if (col > 0 && grid[row]?.[col - 1] !== null) return false
    if (col + palabra.length < GRID_SIZE && grid[row]?.[col + palabra.length] !== null) return false
    for (let i = 0; i < palabra.length; i++) {
      if (row < 0 || row >= GRID_SIZE) return false
      const celda = grid[row][col + i]
      if (celda !== null && celda !== palabra[i]) return false
      if (celda === null) {
        if (row > 0 && grid[row - 1][col + i] !== null) return false
        if (row < GRID_SIZE - 1 && grid[row + 1][col + i] !== null) return false
      }
    }
  } else {
    if (row < 0 || row + palabra.length > GRID_SIZE) return false
    if (row > 0 && grid[row - 1]?.[col] !== null) return false
    if (row + palabra.length < GRID_SIZE && grid[row + palabra.length]?.[col] !== null) return false
    for (let i = 0; i < palabra.length; i++) {
      if (col < 0 || col >= GRID_SIZE) return false
      const celda = grid[row + i][col]
      if (celda !== null && celda !== palabra[i]) return false
      if (celda === null) {
        if (col > 0 && grid[row + i][col - 1] !== null) return false
        if (col < GRID_SIZE - 1 && grid[row + i][col + 1] !== null) return false
      }
    }
  }
  return true
}

function colocar(grid: (string | null)[][], palabra: string, row: number, col: number, dir: 'H' | 'V') {
  for (let i = 0; i < palabra.length; i++) {
    if (dir === 'H') grid[row][col + i] = palabra[i]
    else             grid[row + i][col] = palabra[i]
  }
}

function CrucigramaJugarContenido() {
  const router = useRouter()
  const params = useSearchParams()
  const simId  = Number(params.get('sim') ?? 1)
  const nivel  = Number(params.get('nivel') ?? 1)

  const palabrasBase = BANCO[simId]?.[nivel] ?? BANCO[1][1]
  const { grid, colocadas } = generarCrucigrama(palabrasBase)

  const [respuestas,   setRespuestas]   = useState<Record<string, string>>({})
  const [seleccionada, setSeleccionada] = useState<PalabraColocada | null>(null)
  const [completadas,  setCompletadas]  = useState<Set<number>>(new Set())
  const [terminado,    setTerminado]    = useState(false)
  const [mostrarPista, setMostrarPista] = useState(false)
  const [errores,      setErrores]      = useState<Set<string>>(new Set())

  const filasActivas = grid.map((fila, r) => fila.some(c => c !== null) ? r : -1).filter(r => r >= 0)
  const colsActivas  = grid[0].map((_, c) => grid.some(fila => fila[c] !== null) ? c : -1).filter(c => c >= 0)
  const rowMin = Math.max(0, (filasActivas[0] ?? 0) - 1)
  const rowMax = Math.min(GRID_SIZE - 1, (filasActivas[filasActivas.length - 1] ?? 0) + 1)
  const colMin = Math.max(0, (colsActivas[0] ?? 0) - 1)
  const colMax = Math.min(GRID_SIZE - 1, (colsActivas[colsActivas.length - 1] ?? 0) + 1)

  function getCeldaKey(r: number, c: number) { return `${r}-${c}` }
  function getNumero(r: number, c: number) { return colocadas.find(p => p.row === r && p.col === c)?.numero }
  function esCeldaActiva(r: number, c: number) { return grid[r][c] !== null }
  function esCeldaSeleccionada(r: number, c: number) {
    if (!seleccionada) return false
    if (seleccionada.direccion === 'H') return r === seleccionada.row && c >= seleccionada.col && c < seleccionada.col + seleccionada.palabra.length
    return c === seleccionada.col && r >= seleccionada.row && r < seleccionada.row + seleccionada.palabra.length
  }

  function handleCeldaClick(r: number, c: number) {
    if (!esCeldaActiva(r, c)) return
    const palabra = colocadas.find(p =>
      (p.direccion === 'H' && p.row === r && c >= p.col && c < p.col + p.palabra.length) ||
      (p.direccion === 'V' && p.col === c && r >= p.row && r < p.row + p.palabra.length)
    )
    if (palabra) setSeleccionada(palabra)
    setMostrarPista(true)
  }

  function handleInput(valor: string) {
    if (!seleccionada) return
    const letra = valor.toUpperCase().replace(/[^A-Z]/, '')
    if (!letra) return
    for (let i = 0; i < seleccionada.palabra.length; i++) {
      const r   = seleccionada.direccion === 'H' ? seleccionada.row : seleccionada.row + i
      const c   = seleccionada.direccion === 'H' ? seleccionada.col + i : seleccionada.col
      const key = getCeldaKey(r, c)
      if (!respuestas[key]) {
        const nuevas = { ...respuestas, [key]: letra }
        setRespuestas(nuevas)
        verificarPalabra(seleccionada, nuevas)
        break
      }
    }
  }

  function handleBorrar() {
    if (!seleccionada) return
    for (let i = seleccionada.palabra.length - 1; i >= 0; i--) {
      const r   = seleccionada.direccion === 'H' ? seleccionada.row : seleccionada.row + i
      const c   = seleccionada.direccion === 'H' ? seleccionada.col + i : seleccionada.col
      const key = getCeldaKey(r, c)
      if (respuestas[key]) {
        const nuevas = { ...respuestas }
        delete nuevas[key]
        setRespuestas(nuevas)
        break
      }
    }
  }

  function verificarPalabra(p: PalabraColocada, resp: Record<string, string>) {
    let correcta = true
    for (let i = 0; i < p.palabra.length; i++) {
      const r   = p.direccion === 'H' ? p.row : p.row + i
      const c   = p.direccion === 'H' ? p.col + i : p.col
      const key = getCeldaKey(r, c)
      if (resp[key] !== p.palabra[i]) { correcta = false; break }
    }
    if (correcta) {
      const nuevas = new Set(completadas)
      nuevas.add(p.numero)
      setCompletadas(nuevas)
      if (nuevas.size === colocadas.length) {
        setProgresoCrucigrama(simId, nivel)
        setTerminado(true)
      }
    }
  }

  function verificarTodo() {
    const nuevosErrores = new Set<string>()
    colocadas.forEach(p => {
      for (let i = 0; i < p.palabra.length; i++) {
        const r   = p.direccion === 'H' ? p.row : p.row + i
        const c   = p.direccion === 'H' ? p.col + i : p.col
        const key = getCeldaKey(r, c)
        if (respuestas[key] && respuestas[key] !== p.palabra[i]) nuevosErrores.add(key)
      }
    })
    setErrores(nuevosErrores)
  }

  function reiniciar() {
    setRespuestas({})
    setSeleccionada(null)
    setCompletadas(new Set())
    setTerminado(false)
    setMostrarPista(false)
    setErrores(new Set())
  }

  const TECLADO = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L','Ñ'],
    ['Z','X','C','V','B','N','M','⌫'],
  ]

  // ── COMPLETADO ──
  if (terminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-5 text-center fade-in">
          <Trophy size={64} className="text-yellow-300 mx-auto"/>
          <h1 className="text-3xl font-extrabold text-white">¡Crucigrama completado!</h1>
          <p className="text-white/80">Simulador {simId} · Nivel {nivel}</p>
          {nivel === 1 && (
            <div className="bg-white/20 rounded-2xl p-3 text-white font-bold">
              🔓 ¡Nivel 2 desbloqueado!
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={reiniciar}
              className="w-full bg-yellow-400 text-gray-900 font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95">
              <RotateCcw size={18}/> Jugar de nuevo
            </button>
            <button onClick={() => router.push('/area/crucigrama')}
              className="w-full bg-white/20 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95">
              <ArrowLeft size={18}/> Seleccionar nivel
            </button>
            <button onClick={() => router.push('/')}
              className="w-full bg-white/10 text-white/70 font-medium py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95">
              <Home size={18}/> Menú principal
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── JUGANDO ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 flex flex-col">

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button onClick={() => router.push('/area/crucigrama')}
          className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={20}/>
        </button>
        <div className="text-center">
          <p className="text-white font-extrabold">Crucigrama {simId} · Nivel {nivel}</p>
          <p className="text-white/70 text-xs">{completadas.size}/{colocadas.length} palabras</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reiniciar}
            className="bg-white/20 text-white text-xs font-bold px-2 py-1.5 rounded-lg">
            <RotateCcw size={14}/>
          </button>
          <button onClick={verificarTodo}
            className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            Verificar
          </button>
          <button onClick={() => router.push('/')}
            className="bg-white/20 text-white text-xs font-bold px-2 py-1.5 rounded-lg">
            <Home size={14}/>
          </button>
        </div>
      </div>

      {/* Pista activa */}
      {seleccionada && mostrarPista && (
        <div className="mx-4 mb-2 bg-white/20 rounded-xl px-4 py-2.5 text-white text-sm">
          <span className="font-bold">{seleccionada.numero}{seleccionada.direccion === 'H' ? '→' : '↓'} </span>
          {seleccionada.pista}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center px-2 py-2 overflow-auto">
        <div className="inline-block bg-white/10 rounded-2xl p-2 shadow-xl">
          {Array.from({ length: rowMax - rowMin + 1 }, (_, ri) => {
            const r = rowMin + ri
            return (
              <div key={r} className="flex">
                {Array.from({ length: colMax - colMin + 1 }, (_, ci) => {
                  const c       = colMin + ci
                  const key     = getCeldaKey(r, c)
                  const activa  = esCeldaActiva(r, c)
                  const selec   = esCeldaSeleccionada(r, c)
                  const num     = getNumero(r, c)
                  const completa = colocadas.some(p => completadas.has(p.numero) && (
                    (p.direccion === 'H' && p.row === r && c >= p.col && c < p.col + p.palabra.length) ||
                    (p.direccion === 'V' && p.col === c && r >= p.row && r < p.row + p.palabra.length)
                  ))
                  const error = errores.has(key)

                  return (
                    <div key={c} onClick={() => handleCeldaClick(r, c)}
                      className={`relative w-7 h-7 md:w-8 md:h-8 border flex items-center justify-center text-xs font-extrabold cursor-pointer select-none transition-colors ${
                        !activa  ? 'bg-transparent border-transparent' :
                        completa ? 'bg-green-300 border-green-400 text-green-900' :
                        error    ? 'bg-red-300 border-red-400 text-red-900' :
                        selec    ? 'bg-yellow-200 border-yellow-400 text-gray-900' :
                                   'bg-white border-gray-300 text-gray-800 hover:bg-yellow-50'
                      }`}>
                      {num && <span className="absolute top-0 left-0.5 text-[7px] font-bold text-gray-500 leading-none">{num}</span>}
                      {activa && (respuestas[key] || '')}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pistas */}
      <div className="mx-4 mb-2 max-h-28 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1">
          {colocadas.map(p => (
            <button key={p.numero}
              onClick={() => { setSeleccionada(p); setMostrarPista(true) }}
              className={`text-left px-2 py-1 rounded-lg text-xs transition-colors ${
                completadas.has(p.numero)      ? 'bg-green-400/30 text-green-100 line-through' :
                seleccionada?.numero === p.numero ? 'bg-yellow-300/30 text-yellow-100 font-bold' :
                'bg-white/10 text-white/80 hover:bg-white/20'
              }`}>
              {p.numero}{p.direccion === 'H' ? '→' : '↓'} {p.pista.slice(0, 25)}…
            </button>
          ))}
        </div>
      </div>

      {/* Teclado virtual */}
      <div className="px-2 pb-4 space-y-1">
        {TECLADO.map((fila, fi) => (
          <div key={fi} className="flex justify-center gap-1">
            {fila.map(tecla => (
              <button key={tecla}
                onClick={() => tecla === '⌫' ? handleBorrar() : handleInput(tecla)}
                className={`${tecla === '⌫' ? 'px-3' : 'w-8'} h-10 rounded-lg font-bold text-sm active:scale-95 transition-all shadow ${
                  tecla === '⌫' ? 'bg-red-400 text-white' : 'bg-white text-gray-800 hover:bg-yellow-100'
                }`}>
                {tecla}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CrucigramaJugarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white"/>
      </div>
    }>
      <CrucigramaJugarContenido/>
    </Suspense>
  )
}