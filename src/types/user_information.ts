export type Step =
  | "s0_error"
  | "s0_humano"
  | "s0_finalizar"
  | "s0_primer_mensaje"
  | "s2_menu_principal"
  | "s3_faq"
  | "s3_info_agendar"
  | "s4_reservar"
  | "s4_consulta_valoracion"
  | "s4_sedes_y_horarios"
  | "s4_tratamientos"
  | "s5_beneficios"
  | "s5_precio_consulta"
  | "s5_balones"
  | "s5_farmacologico"
  | "s5_precio_tratamiento"
  | "s1_get_name"
  | "s1_get_email"

export type TimelineFlag = "reservar" | null

export interface TimelineEvent {
  at: string // ISO datetime con timezone

  flag: TimelineFlag

  reason: string

  to_step: Step
  from_step: Step

  incoming: string
}

export interface UserSessionResponse {
  phone_number: string

  name: string | null
  email: string | null

  desde: string
  hasta: string

  reservar: boolean
  reservar_at: string | null

  humano: boolean
  humano_at: string | null

  total_eventos: number
  total_pasos: number

  timeline: TimelineEvent[]
}

export type IncomingType = "user" | "system"

export type IncomingIntent =
  | string
  | "Usuario consulta FAQ"
  | "Error de interpretación"
  | "system step"

export interface ResolvedTimelineEvent {
  at: string

  from_step: Step
  from_meaning: string

  to_step: Step
  to_meaning: string

  incoming: string
  incoming_type: IncomingType

  incoming_intent: IncomingIntent

  bot_response: string
}

export type ResolvedTimeline = ResolvedTimelineEvent[]
