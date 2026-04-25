import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Pregunta {
  id: string
  pregunta: string
  opciones: string[]
  respuesta_correcta: number
  categoria: string
  simulador: number
  puntos_valor: number
}