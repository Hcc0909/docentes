'use client'

import { useRouter } from 'next/navigation'
import { Zap, Grid3x3, ArrowLeft } from 'lucide-react'

export default function AreaPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 fade-in">

        <button onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16}/> Volver al menú
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Área Interactiva</h1>
          <p className="text-white/70 text-sm">Elige tu modo de práctica</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/area/quiz')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all rounded-2xl p-6 text-left shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
                <Zap size={28} className="text-white"/>
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-lg">Quiz Rápidos</p>
                <p className="text-gray-700 text-sm">5 simuladores · 2 niveles · Examen final</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/area/crucigrama')}
            className="w-full bg-green-400 hover:bg-green-300 active:scale-95 transition-all rounded-2xl p-6 text-left shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
                <Grid3x3 size={28} className="text-white"/>
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-lg">Crucigrama</p>
                <p className="text-gray-700 text-sm">5 simuladores · 2 niveles · Palabras clave</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}