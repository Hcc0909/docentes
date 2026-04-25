'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, User, ArrowLeft, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Modo = 'login' | 'registro' | 'recuperar'

export default function AuthPage() {
  const router = useRouter()
  const [modo,      setModo]      = useState<Modo>('login')
  const [nombre,    setNombre]    = useState('')
  const [email,     setEmail]     = useState('')
  const [telefono,  setTelefono]  = useState('')
  const [password,  setPassword]  = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verPass,   setVerPass]   = useState(false)
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [exito,     setExito]     = useState<string | null>(null)

  function limpiar() { setError(null); setExito(null) }
  function cambiarModo(m: Modo) { limpiar(); setModo(m) }

  function traducirError(msg: string): string {
    if (msg.includes('Invalid login credentials'))  return 'Correo o contraseña incorrectos.'
    if (msg.includes('User already registered'))    return 'Este correo ya tiene una cuenta.'
    if (msg.includes('Password should be'))         return 'La contraseña debe tener al menos 6 caracteres.'
    if (msg.includes('Email not confirmed'))        return 'Confirma tu correo antes de iniciar sesión.'
    return msg
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true); limpiar()
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(traducirError(err instanceof Error ? err.message : 'Error desconocido'))
    } finally { setCargando(false) }
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim())             { setError('El nombre es obligatorio.'); return }
    if (!telefono.trim())           { setError('El teléfono es obligatorio.'); return }
    if (!/^\d{10}$/.test(telefono)) { setError('El teléfono debe tener exactamente 10 dígitos.'); return }
    if (password !== confirmar)     { setError('Las contraseñas no coinciden.'); return }
    setCargando(true); limpiar()
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: nombre.trim(), phone: telefono.trim() } },
      })
      if (error) throw error

      if (data.user) {
        await supabase.from('perfiles').insert({
          id: data.user.id,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
        })
      }

      setExito('¡Cuenta creada! Ya puedes iniciar sesión.')
    } catch (err: unknown) {
      setError(traducirError(err instanceof Error ? err.message : 'Error desconocido'))
    } finally { setCargando(false) }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true); limpiar()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      if (error) throw error
      setExito('Te enviamos un enlace para restablecer tu contraseña.')
    } catch (err: unknown) {
      setError(traducirError(err instanceof Error ? err.message : 'Error desconocido'))
    } finally { setCargando(false) }
  }

  const inputClass = 'w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm fade-in">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {modo === 'login' ? 'Bienvenido' : modo === 'registro' ? 'Crear cuenta' : 'Recuperar contraseña'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Guía Nacional USICAMM</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">

          {/* LOGIN */}
          {modo === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Campo label="Correo" icon={<Mail size={15}/>}>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass}/>
              </Campo>
              <Campo label="Contraseña" icon={<Lock size={15}/>} extra={
                <button type="button" onClick={()=>setVerPass(!verPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {verPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>}>
                <input type={verPass?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tu contraseña" className={inputClass+' pr-10'}/>
              </Campo>
              <div className="text-right">
                <button type="button" onClick={()=>cambiarModo('recuperar')} className="text-xs text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Alertas error={error} exito={exito}/>
              <BtnSubmit cargando={cargando} label="Iniciar sesión"/>
              <p className="text-center text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={()=>cambiarModo('registro')} className="text-blue-600 font-semibold hover:underline">Regístrate</button>
              </p>
            </form>
          )}

          {/* REGISTRO */}
          {modo === 'registro' && (
            <form onSubmit={handleRegistro} className="space-y-4">
              <Campo label="Nombre completo" icon={<User size={15}/>}>
                <input type="text" required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" className={inputClass}/>
              </Campo>
              <Campo label="Correo" icon={<Mail size={15}/>}>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass}/>
              </Campo>
              <Campo label="Teléfono (10 dígitos)" icon={<Phone size={15}/>}>
                <input type="tel" required value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="1234567890" className={inputClass} maxLength={10}/>
              </Campo>
              <Campo label="Contraseña" icon={<Lock size={15}/>} extra={
                <button type="button" onClick={()=>setVerPass(!verPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {verPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>}>
                <input type={verPass?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass+' pr-10'}/>
              </Campo>
              <Campo label="Confirmar contraseña" icon={<Lock size={15}/>}>
                <input type="password" required value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Repite tu contraseña" className={inputClass}/>
              </Campo>
              <Alertas error={error} exito={exito}/>
              <BtnSubmit cargando={cargando} label="Crear cuenta"/>
              <p className="text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={()=>cambiarModo('login')} className="text-blue-600 font-semibold hover:underline">Inicia sesión</button>
              </p>
            </form>
          )}

          {/* RECUPERAR */}
          {modo === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <Campo label="Correo" icon={<Mail size={15}/>}>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass}/>
              </Campo>
              <Alertas error={error} exito={exito}/>
              <BtnSubmit cargando={cargando} label="Enviar enlace"/>
              <button type="button" onClick={()=>cambiarModo('login')} className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={14}/> Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Guía Nacional USICAMM
        </p>
      </div>
    </div>
  )
}

function Campo({ label, icon, extra, children }: { label: string; icon: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        {children}
        {extra}
      </div>
    </div>
  )
}

function Alertas({ error, exito }: { error: string | null; exito: string | null }) {
  if (!error && !exito) return null
  return (
    <>
      {error && <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xl px-3 py-2.5"><AlertCircle size={15} className="shrink-0 mt-0.5"/>{error}</div>}
      {exito && <div className="flex items-start gap-2 bg-green-50 text-green-700 text-sm border border-green-200 rounded-xl px-3 py-2.5"><CheckCircle size={15} className="shrink-0 mt-0.5"/>{exito}</div>}
    </>
  )
}

function BtnSubmit({ cargando, label }: { cargando: boolean; label: string }) {
  return (
    <button type="submit" disabled={cargando} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors">
      {cargando && <Loader2 size={16} className="animate-spin"/>}
      {label}
    </button>
  )
}