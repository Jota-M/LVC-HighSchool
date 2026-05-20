// types/horario.types.ts

export type HorarioEstado = 'borrador' | 'publicado' | 'archivado';

export const DIAS_SEMANA: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export const DIAS_SEMANA_CORTO: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

export const ESTADO_CONFIG: Record<HorarioEstado, { label: string; color: string; bg: string }> = {
  borrador:  { label: 'Borrador',  color: '#f59e0b', bg: '#fef3c7' },
  publicado: { label: 'Publicado', color: '#10b981', bg: '#d1fae5' },
  archivado: { label: 'Archivado', color: '#6b7280', bg: '#f3f4f6' },
};

export const COLORES_MATERIA = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#84cc16', '#a855f7',
];

// =============================================
// BLOQUE HORARIO
// =============================================
export interface BloqueHorario {
  id: number;
  turno_id: number;
  turno_nombre: string;
  nombre: string;
  codigo: string | null;
  numero: number;
  hora_inicio: string;
  hora_fin: string;
  es_recreo: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloqueHorarioCreate {
  turno_id: number;
  nombre: string;
  codigo?: string;
  numero: number;
  hora_inicio: string;
  hora_fin: string;
  es_recreo?: boolean;
}

export interface BloqueHorarioUpdate {
  nombre?: string;
  codigo?: string;
  numero?: number;
  hora_inicio?: string;
  hora_fin?: string;
  es_recreo?: boolean;
  activo?: boolean;
}

// =============================================
// HORARIO (cabecera)
// =============================================
export interface Horario {
  id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  nombre: string | null;
  estado: HorarioEstado;
  publicado_en: string | null;
  publicado_por: number | null;
  publicado_por_username: string | null;
  observaciones: string | null;
  // joins
  paralelo_nombre: string;
  paralelo_aula: string | null;
  grado_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  turno_id: number;
  turno_nombre: string;
  periodo_nombre: string;
  periodo_codigo: string;
  total_celdas: number;
  created_at: string;
  updated_at: string;
}

export interface HorarioCreate {
  paralelo_id: number;
  periodo_academico_id: number;
  nombre?: string;
  observaciones?: string;
}

export interface HorarioUpdate {
  nombre?: string;
  observaciones?: string;
}

// =============================================
// HORARIO DETALLE (celdas)
// =============================================
export interface HorarioDetalle {
  id: number;
  horario_id: number;
  dia_semana: number;
  bloque_horario_id: number;
  grado_materia_id: number;
  asignacion_docente_id: number | null;
  aula: string | null;
  color: string | null;
  observaciones: string | null;
  activo: boolean;
  // joins
  bloque_nombre: string;
  bloque_numero: number;
  hora_inicio: string;
  hora_fin: string;
  es_recreo: boolean;
  materia_id: number;
  materia_nombre: string;
  materia_color: string | null;
  docente_id: number | null;
  docente_nombres: string | null;
  docente_apellidos: string | null;
}

export interface HorarioDetalleCreate {
  dia_semana: number;
  bloque_horario_id: number;
  grado_materia_id: number;
  asignacion_docente_id?: number | null;
  aula?: string;
  color?: string;
  observaciones?: string;
}

export interface HorarioDetalleUpdate {
  grado_materia_id?: number;
  asignacion_docente_id?: number | null;
  aula?: string;
  color?: string;
  observaciones?: string;
}

// =============================================
// AUXILIARES (para CeldaModal)
// =============================================
export interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  materia_nombre: string;
  materia_color: string | null;
  materia_codigo: string;
  orden: number | null;
  activo: boolean;
}

export interface AsignacionDocente {
  id: number;
  docente_id: number;
  docente_nombres: string;
  docente_apellidos: string;
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular: boolean;
  activo: boolean;
}

// =============================================
// FILTROS
// =============================================
export interface HorariosFilters {
  periodo_academico_id?: number;
  paralelo_id?: number;
  estado?: HorarioEstado;
  grado_id?: number;
  nivel_academico_id?: number;
}

export interface BloquesFilters {
  turno_id?: number;
  activo?: boolean;
  incluir_recreos?: boolean;
}