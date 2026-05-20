// types/padreNotasTypes.ts

import {
  BoletinItem,
  NotaDimension,
  CalificacionPorPeriodo,
  DimensionEvaluacion,
  PeriodoEvaluacion,
  CodigoDimension,
  DIMENSIONES_CONFIG,
} from './notasTypes';

// Re-exportamos lo que usamos
export type { BoletinItem, NotaDimension, CalificacionPorPeriodo, DimensionEvaluacion, PeriodoEvaluacion, CodigoDimension };
export { DIMENSIONES_CONFIG };

// =============================================
// RESUMEN POR MATERIA (para la vista del padre)
// =============================================

export interface ResumenMateriaPadre {
  // Datos de la materia
  materia_nombre: string;
  materia_codigo: string;
  grado_materia_id: number;

  // Nota final y estado
  nota_final: number | null;
  nota_minima: number;
  aprobado: boolean | null;
  estado_periodo: string;

  // Desglose por dimensión
  nota_ser?: number | null;
  nota_saber?: number | null;
  nota_hacer?: number | null;
  nota_auto?: number | null;

  // Nivel de rendimiento calculado en frontend
  nivel: NivelRendimiento;
}

export type NivelRendimiento = 'excelente' | 'bueno' | 'regular' | 'bajo' | 'sin_nota';

export function getNivelRendimiento(nota: number | null | undefined): NivelRendimiento {
  if (nota === null || nota === undefined) return 'sin_nota';
  if (nota >= 85) return 'excelente';
  if (nota >= 70) return 'bueno';
  if (nota >= 51) return 'regular';
  return 'bajo';
}

export function getColorNivelRendimiento(nivel: NivelRendimiento, isDark = false): string {
  const map: Record<NivelRendimiento, string> = {
    excelente: isDark ? '#34d399' : '#10b981',
    bueno:     isDark ? '#60a5fa' : '#3b82f6',
    regular:   isDark ? '#fbbf24' : '#f59e0b',
    bajo:      isDark ? '#f87171' : '#ef4444',
    sin_nota:  isDark ? '#9ca3af' : '#6b7280',
  };
  return map[nivel];
}

export function getGradientNivelRendimiento(nivel: NivelRendimiento): string {
  const map: Record<NivelRendimiento, string> = {
    excelente: 'linear-gradient(135deg, #10b981, #34d399)',
    bueno:     'linear-gradient(135deg, #3b82f6, #60a5fa)',
    regular:   'linear-gradient(135deg, #f59e0b, #fbbf24)',
    bajo:      'linear-gradient(135deg, #ef4444, #f87171)',
    sin_nota:  'linear-gradient(135deg, #6b7280, #9ca3af)',
  };
  return map[nivel];
}

// =============================================
// DETALLE DE EVALUACIONES POR MATERIA
// =============================================

export interface DetalleEvaluacionPadre {
  evaluacion_id: number;
  evaluacion_nombre: string;
  evaluacion_tipo?: string;
  evaluacion_fecha?: string;
  puntaje_obtenido: number;
  puntaje_maximo: number;
  nota_sobre_100: number; // (puntaje_obtenido / puntaje_maximo) * 100
  esta_ausente: boolean;
  dimension_nombre: string;
  dimension_codigo: CodigoDimension;
  dimension_color: string;
  peso_en_dimension: number;
}

// =============================================
// FILTROS
// =============================================

export interface FiltrosNotasPadre {
  periodo_evaluacion_id: number | null;
  grado_materia_id?: number | null; // para ver detalle de una materia específica
}