// types/padreAsistenciaTypes.ts
// Tipos específicos para la vista del padre de familia

import {
  EstadoAsistencia,
  EstadoPermiso,
  MotivoPermiso,
  DispositivoAsistencia,
  Paginacion,
} from './asistenciaTypes';

// Re-exportamos para conveniencia
export type { EstadoAsistencia, EstadoPermiso, MotivoPermiso, DispositivoAsistencia, Paginacion };

// =============================================
// HIJO/ESTUDIANTE VINCULADO AL PADRE
// =============================================

export interface HijoInfo {
  padre_familia_id: number;
  estudiante_id: number;
  matricula_id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  foto_url?: string | null;
  grado_nombre: string;
  paralelo_nombre: string;
  nivel_nombre: string;
  turno_nombre: string;
  periodo_academico_id: number;
  periodo_nombre: string;
}

// =============================================
// RESUMEN DE ASISTENCIA DEL HIJO
// =============================================

export interface ResumenAsistenciaHijo {
  // Totales generales (todas las materias)
  total_clases: number;
  total_presentes: number;
  total_ausentes: number;
  total_tardanzas: number;
  total_justificados: number;
  total_faltas_parciales: number;
  porcentaje_asistencia_global: number;

  // Desglose por materia
  por_materia: ResumenPorMateria[];
}

export interface ResumenPorMateria {
  asignacion_id: number;
  materia_nombre: string;
  materia_codigo: string;
  materia_color?: string | null;
  total_clases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  faltas_parciales: number;
  porcentaje_asistencia: number;
  // Alerta si la asistencia cae por debajo de cierto umbral
  en_riesgo: boolean; // true si porcentaje_asistencia < 75
}

// =============================================
// REGISTRO DE ASISTENCIA (vista padre)
// =============================================

export interface AsistenciaHijo {
  id: number;
  fecha: string;
  estado: EstadoAsistencia;
  hora_marcacion: string;
  materia_nombre: string;
  materia_codigo: string;
  materia_color?: string | null;
  justificacion?: string | null;
  observaciones?: string | null;
  permiso_codigo?: string | null;
  // Si hay permiso vinculado
  tiene_permiso: boolean;
}

// =============================================
// SOLICITUD DE PERMISO (vista padre)
// =============================================

export interface SolicitudPermisoHijo {
  id: number;
  codigo_solicitud: string;
  fecha_ausencia: string;
  es_dia_completo: boolean;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo: MotivoPermiso;
  descripcion?: string | null;
  archivo_adjunto_url?: string | null;
  estado: EstadoPermiso;
  motivo_rechazo?: string | null;
  observaciones_revisor?: string | null;
  fecha_revision?: string | null;
  revisado_por_username?: string | null;
  created_at: string;
  // Materia afectada (null = día completo)
  materia_nombre?: string | null;
  asignacion_docente_id?: number | null;
  // Historial de estado
  historial?: HistorialPermisoItem[];
}

export interface HistorialPermisoItem {
  id: number;
  estado_anterior?: string | null;
  estado_nuevo: string;
  comentario?: string | null;
  usuario_username?: string | null;
  created_at: string;
}

// =============================================
// DTOs
// =============================================

export interface CrearPermisoHijoDTO {
  estudiante_id: number;
  padre_familia_id?: number;
  asignacion_docente_id?: number | null;
  fecha_ausencia: string;
  es_dia_completo: boolean;
  hora_inicio?: string;
  hora_fin?: string;
  motivo: MotivoPermiso;
  descripcion?: string;
}

export interface FiltrosHistorialAsistencia {
  matricula_id: number;
  asignacion_docente_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoAsistencia;
  page?: number;
  limit?: number;
}

export interface FiltrosPermisosHijo {
  page?: number;
  limit?: number;
  estado?: EstadoPermiso;
  fecha_inicio?: string;
  fecha_fin?: string;
}

// =============================================
// CONSTANTES UI
// =============================================

export const UMBRAL_ASISTENCIA_RIESGO = 75; // porcentaje mínimo recomendado
export const UMBRAL_ASISTENCIA_CRITICO = 60; // porcentaje crítico

export type NivelRiesgo = 'excelente' | 'bueno' | 'riesgo' | 'critico';

export function getNivelRiesgo(porcentaje: number): NivelRiesgo {
  if (porcentaje >= 90) return 'excelente';
  if (porcentaje >= 75) return 'bueno';
  if (porcentaje >= 60) return 'riesgo';
  return 'critico';
}

export function getColorNivel(nivel: NivelRiesgo, isDark = false): string {
  const map = {
    excelente: isDark ? '#34d399' : '#10b981',
    bueno:     isDark ? '#60a5fa' : '#3b82f6',
    riesgo:    isDark ? '#fbbf24' : '#f59e0b',
    critico:   isDark ? '#f87171' : '#ef4444',
  };
  return map[nivel];
}

export function getGradientNivel(nivel: NivelRiesgo): string {
  const map = {
    excelente: 'linear-gradient(135deg, #10b981, #34d399)',
    bueno:     'linear-gradient(135deg, #3b82f6, #60a5fa)',
    riesgo:    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    critico:   'linear-gradient(135deg, #ef4444, #f87171)',
  };
  return map[nivel];
}