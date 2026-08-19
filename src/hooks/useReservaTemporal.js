import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useReservaTemporal() {
  const [reservaId, setReservaId]           = useState(null)
  const [segundos, setSegundos]             = useState(600)
  const [activa, setActiva]                 = useState(false)
  const intervalRef                         = useRef(null)
  const reservaIdRef                        = useRef(null)

  const iniciarCountdown = useCallback(() => {
    setSegundos(600)
    setActiva(true)
    intervalRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setActiva(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const crearReserva = useCallback(async ({ slotId, faseLunarId, ciudadCodigos, anuncianteId }) => {
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('reservas_temporales')
      .insert({ slot_id: slotId, fase_lunar_id: faseLunarId, ciudad_codigos: ciudadCodigos, anunciante_id: anuncianteId, expires_at })
      .select('id')
      .maybeSingle()
    if (!error && data) {
      setReservaId(data.id)
      reservaIdRef.current = data.id
      return data.id
    }
    return null
  }, [])

  const liberarReserva = useCallback(async () => {
    clearInterval(intervalRef.current)
    setActiva(false)
    if (reservaIdRef.current) {
      await supabase.from('reservas_temporales').delete().eq('id', reservaIdRef.current)
      reservaIdRef.current = null
      setReservaId(null)
    }
  }, [])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0')
  const ss = String(segundos % 60).padStart(2, '0')

  return {
    reservaId,
    countdown: `${mm}:${ss}`,
    activa,
    segundosRestantes: segundos,
    iniciarCountdown,
    crearReserva,
    liberarReserva
  }
}