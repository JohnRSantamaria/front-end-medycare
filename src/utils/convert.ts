// =======================
// TYPES
// =======================
import type {
  IncomingType,
  Step,
  TimelineEvent,
} from "@/types/user_information"

// =======================
// STEP META (BOT + MEANING)
// =======================

export const stepMeta: Record<
  Step,
  {
    bot: string
    meaning: string
  }
> = {
  s0_primer_mensaje: {
    bot: "... Escribe tu nombre completo para continuar.",
    meaning: "Inicio del flujo de onboarding",
  },
  s1_get_name: {
    bot: "... Escribe tu correo electrónico para continuar.",
    meaning: "Solicitando nombre del usuario",
  },
  s1_get_email: {
    bot: "Se envia el menú principal al usuario",
    meaning: "Solicitando email del usuario",
  },
  s2_menu_principal: {
    bot: "Se envia el menú principal al usuario",
    meaning: "Mostrando menú principal",
  },
  s3_faq: {
    bot: "Se envia el menú de preguntas frecuentes al usuario",
    meaning: "Usuario consulta FAQ",
  },
  s3_info_agendar: {
    bot: "Se envia el menú de información para agendar una cita al usuario",
    meaning: "Información para agendar cita",
  },
  s4_reservar: {
    bot: "Se envia el link para reservar una cita al usuario",
    meaning: "Usuario va a reservar cita",
  },
  s4_consulta_valoracion: {
    bot: "Se envia información de valoración al usuario",
    meaning: "Consulta de valoración",
  },
  s4_tratamientos: {
    bot: "Se envia el menú de tratamientos al usuario",
    meaning: "Exploración de tratamientos",
  },
  s5_precio_tratamiento: {
    bot: "... El costo del procedimiento se basa en tus objetivos de pérdida...",
    meaning: "Consulta de precio de tratamiento",
  },
  s0_error: {
    bot: "No comprendí su mensaje.",
    meaning: "Error de interpretación",
  },
  s0_humano: {
    bot: "El horario de atención es... se comunicará un asesor.",
    meaning: "Escalado a humano",
  },
  s0_finalizar: {
    bot: "Gracias por tu interés en Medycare...",
    meaning: "Finalización del flujo",
  },
  s5_balones: {
    bot: "...  Balón gástrico ingerible... ...Balón gástrico endoscópico...",
    meaning: "Información sobre balones gástricos",
  },

  s5_farmacologico: {
    bot: "... El tratamiento farmacológico incluye... ...Los medicamentos utilizados son...",
    meaning: "Información sobre tratamiento farmacológico",
  },

  s5_precio_consulta: {
    bot: "Se envia la información de precios de la consultas al usuario",
    meaning: "Consulta de precio de consulta médica",
  },

  s4_sedes_y_horarios: {
    bot: "... Nuestras sedes están ubicadas en... ...Nuestros horarios de atención son...",
    meaning: "Consulta de sedes y horarios de atención",
  },

  s5_beneficios: {
    bot: "Se envia la información de beneficios de los tratamientos al usuario",
    meaning: "Consulta de beneficios de tratamientos",
  },
}

// =======================
// INCOMING CLASSIFIER
// =======================

export function classifyIncoming(text: string): "text" | "step" {
  if (text.startsWith("s")) return "step"
  return "text"
}

// =======================
// RESOLVER CENTRAL
// =======================

export function resolveTimeline(timeline: TimelineEvent[]) {
  return timeline.map((event) => {
    const isStepIncoming = classifyIncoming(event.incoming) === "step"

    return {
      at: event.at,

      from_step: event.from_step,
      from_meaning: stepMeta[event.from_step].meaning,

      to_step: event.to_step,
      to_meaning: stepMeta[event.to_step].meaning,

      incoming: event.incoming,

      incoming_type: (isStepIncoming ? "system" : "user") as IncomingType,

      incoming_intent: isStepIncoming
        ? (stepMeta[event.incoming as Step]?.meaning ?? "system step")
        : "user message",

      bot_response: stepMeta[event.to_step].bot,
    }
  })
}

// const mockTimeline: TimelineEvent[] = [
//   {
//     at: "2026-05-02T10:08:12Z",
//     flag: null,
//     reason: "start",
//     from_step: "s0_primer_mensaje",
//     to_step: "s1_get_name",
//     incoming: "¡Hola! Quiero más información.",
//   },
//   {
//     at: "2026-05-02T10:08:42Z",
//     flag: null,
//     reason: "user_name",
//     from_step: "s1_get_name",
//     to_step: "s1_get_email",
//     incoming: "Biviana",
//   },
//   {
//     at: "2026-05-02T10:09:02Z",
//     flag: null,
//     reason: "user_email",
//     from_step: "s1_get_email",
//     to_step: "s2_menu_principal",
//     incoming: "vanabet@hotmail.com",
//   },
//   {
//     at: "2026-05-02T10:09:19Z",
//     flag: null,
//     reason: "faq",
//     from_step: "s2_menu_principal",
//     to_step: "s3_faq",
//     incoming: "s3_faq",
//   },
// ]

// console.log(JSON.stringify(resolveTimeline(mockTimeline), null, 2))
