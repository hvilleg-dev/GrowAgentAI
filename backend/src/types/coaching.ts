export enum GROWStage {
  GOAL = 'GOAL',
  REALITY = 'REALITY',
  OPTIONS = 'OPTIONS',
  WILL = 'WILL',
  WRAP_UP = 'WRAP_UP',
  REFLECTION = 'REFLECTION',
  ACTION_PLAN = 'ACTION_PLAN'
}

export interface CoachingSession {
  id: string;
  usuarioId: string;
  etapaActual: GROWStage;
  objetivo?: string;
  realidad?: string;
  opciones?: string[];
  voluntad?: string;
  resumen?: string;
  reflexion?: string;
  planAccion?: string;
  criadaEn: Date;
  actualizadaEn: Date;
  finalizadaEn?: Date;
}

export interface CoachingMessage {
  sesionId: string;
  role: 'user' | 'assistant';
  content: string;
  proveedor: string;
  modeloUsado: string;
  tokensInput: number;
  tokensOutput: number;
  costo: number;
  criadoEn: Date;
}

export type GrowStage = GROWStage;
