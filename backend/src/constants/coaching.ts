import { GROWStage } from '@/types/coaching';

export const GROW_ETAPAS = {
  [GROWStage.GOAL]: {
    nombre: 'Goal (Objetivo)',
    descripcion: 'Definir el objetivo claro que el cliente quiere lograr',
    prompts: [
      '¿Cuál es el objetivo específico que deseas lograr?',
      '¿Cómo sabrás que has alcanzado este objetivo?',
      '¿Cuál es el resultado ideal para ti?'
    ],
    duracionEstimadaMinutos: 5
  },
  [GROWStage.REALITY]: {
    nombre: 'Reality (Realidad)',
    descripcion: 'Explorar la situación actual del cliente',
    prompts: [
      '¿Cuál es tu situación actual respecto a este objetivo?',
      '¿Qué está sucediendo ahora mismo?',
      '¿Cuáles son los hechos clave de tu situación actual?'
    ],
    duracionEstimadaMinutos: 8
  },
  [GROWStage.OPTIONS]: {
    nombre: 'Options (Opciones)',
    descripcion: 'Generar opciones y alternativas',
    prompts: [
      '¿Qué opciones tienes disponibles?',
      '¿Cuáles son diferentes formas de abordar esto?',
      '¿Qué harías si tuvieras libertad total para elegir?'
    ],
    duracionEstimadaMinutos: 10
  },
  [GROWStage.WILL]: {
    nombre: 'Will (Voluntad)',
    descripcion: 'Comprometerse con acciones concretas',
    prompts: [
      '¿Qué acciones vas a tomar?',
      '¿Cuándo las vas a hacer?',
      '¿Cuál es tu nivel de compromiso con estas acciones?'
    ],
    duracionEstimadaMinutos: 5
  },
  [GROWStage.WRAP_UP]: {
    nombre: 'Wrap Up (Cierre)',
    descripcion: 'Resumir los puntos clave de la sesión',
    prompts: [
      'Resumamos lo que hemos cubierto hoy...',
      '¿Cuáles son tus puntos clave de esta sesión?',
      '¿Hay algo más que quieras mencionar?'
    ],
    duracionEstimadaMinutos: 3
  },
  [GROWStage.REFLECTION]: {
    nombre: 'Reflection (Reflexión)',
    descripcion: 'Reflexionar sobre los aprendizajes',
    prompts: [
      '¿Qué has aprendido de esta conversación?',
      '¿Cómo te sientes ahora en relación a tu objetivo?',
      '¿Qué es lo más importante que te llevas de aquí?'
    ],
    duracionEstimadaMinutos: 3
  },
  [GROWStage.ACTION_PLAN]: {
    nombre: 'Action Plan (Plan de Acción)',
    descripcion: 'Crear un plan de acción detallado',
    prompts: [
      '¿Cuál es tu plan de acción concreto?',
      '¿Cuáles son los pasos específicos?',
      '¿Cómo te mantendré motivado para seguir adelante?'
    ],
    duracionEstimadaMinutos: 7
  }
};

export const INDICADORES_CRISIS = {
  CRISIS_ALTO: [
    'suicidio',
    'automutilación',
    'muerte',
    'depresión severa',
    'ansiedad extrema'
  ],
  CRISIS_MEDIO: [
    'crisis emocional',
    'angustia',
    'pánico',
    'ruptura familiar',
    'pérdida de empleo'
  ],
  CRISIS_BAJO: [
    'estrés',
    'preocupación',
    'incertidumbre',
    'duda',
    'confusión'
  ]
};

export const LIMITES_COSTO = {
  CLAUDE_HAIKU_INPUT: 0.00080,
  CLAUDE_HAIKU_OUTPUT: 0.0024,
  CLAUDE_SONNET_INPUT: 0.003,
  CLAUDE_SONNET_OUTPUT: 0.015,
  OPENAI_GPT_4_MINI_INPUT: 0.00015,
  OPENAI_GPT_4_MINI_OUTPUT: 0.0006
};

export const LIMITES_SESION = {
  DURACION_MAXIMA_MINUTOS: 60,
  MENSAJES_MAXIMOS: 50,
  TOKENS_MAXIMOS: 100000
};

export const IDIOMAS_SOPORTADOS = ['es', 'en', 'fr', 'de', 'pt', 'it', 'ja', 'zh'];

export const VALORES_DEFAULT = {
  MODELO_CLAUDE: 'claude-3-5-sonnet-20241022',
  MODELO_OPENAI: 'gpt-4-mini',
  IDIOMA_DEFAULT: 'es',
  TIMEOUT_SEGUNDOS: 30,
  REINTENTOS: 3
};
