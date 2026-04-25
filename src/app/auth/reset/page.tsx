'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verPass,   setVerPass]   = useState(false)
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [exito,     setExito]     = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6)    { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setCargando(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setExito(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Nueva contraseña</h1>
          <p className="text-gray-500 text-sm mt-1">Guía Nacional USICAMM</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
          {exito ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={40} className="text-green-500" />
              <p className="font-semibold text-gray-800">¡Contraseña actualizada!</p>
              <p className="text-sm text-gray-500">Redirigiendo al inicio…</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={verPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button type="button" onClick={() => setVerPass(!verPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
                </div>
              )}

              <button type="submit" disabled={cargando}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors">
                {cargando && <Loader2 size={16} className="animate-spin" />}
                Guardar contraseña
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}