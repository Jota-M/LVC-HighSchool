// types/periodoEvaluacion.ts

export interface PeriodoEvaluacion {
  id: number;
  periodo_academico_id: number;
  periodo_academico_nombre?: string;
  periodo_academico_codigo?: string;
  nombre: string;
  codigo?: string;
  orden: number;
  fecha_inicio: string; // ISO date
  fecha_fin: string;    // ISO date
  activo: boolean;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PeriodoEvaluacionFormData {
  periodo_academico_id: number;
  nombre: string;
  codigo?: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  observaciones?: string;
}

export interface PeriodoEvaluacionFilters {
  periodo_academico_id?: number;
  activo?: boolean;
}

export type EstadoPeriodo = 'activo' | 'proximo' | 'finalizado';

export interface PeriodoConEstado extends PeriodoEvaluacion {
  estado: EstadoPeriodo;
  diasRestantes?: number;
  porcentajeAvance?: number;
}