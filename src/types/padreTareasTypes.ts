// types/padreTareasTypes.ts

import type { CodigoDimension } from './padreNotasTypes';
export type { CodigoDimension };

// =============================================
// ESTADO DE ENTREGA
// =============================================

export type EstadoTarea = 'pendiente' | 'entregado' | 'atrasado' | 'ausente';

export interface EstadoConfig {
  label: string;
  color: string;
  bgColor: string;
  gradient: string;
  icon: string; // emoji para uso en texto (no en SVG)
}

export const ESTADO_TAREA_CONFIG: Record<EstadoTarea, EstadoConfig> = {
  pendiente: {
    label:    'Pendiente',
    color:    '#f59e0b',
    bgColor:  '#fef3c7',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    icon:     '⏳',
  },
  entregado: {
    label:    'Entregado',
    color:    '#10b981',
    bgColor:  '#d1fae5',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    icon:     '✅',
  },
  atrasado: {
    label:    'Atrasado',
    color:    '#ef4444',
    bgColor:  '#fee2e2',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    icon:     '⚠️',
  },
  ausente: {
    label:    'Ausente',
    color:    '#8b5cf6',
    bgColor:  '#ede9fe',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    icon:     '🚫',
  },
};

// =============================================
// TAREA / EVALUACIÓN
// =============================================

export interface TareaHijo {
  // Evaluación
  evaluacion_id:        number;
  evaluacion_nombre:    string;
  tipo:                 string | null;
  descripcion:          string | null;
  instrucciones:        string | null;
  fecha_evaluacion:     string | null;
  fecha_limite:         string | null;
  puntaje_maximo:       number;
  peso_en_dimension:    number;
  publicado_en:         string | null;

  // Dimensión
  dimension_id:         number;
  dimension_nombre:     string;
  dimension_codigo:     CodigoDimension;
  dimension_color:      string;
  porcentaje_ponderacion: number;

  // Materia
  materia_nombre:       string;
  materia_codigo:       string;
  materia_color:        string | null;

  // Período
  periodo_nombre:       string;
  periodo_evaluacion_id: number;
  periodo_orden:        number;

  // Calificación (null si aún no registrada)
  calificacion_id:      number | null;
  puntaje_obtenido:     number | null;
  esta_ausente:         boolean | null;
  observacion_docente:  string | null;
  fecha_registro:       string | null;
  nota_sobre_100:       number | null;

  // Calculados en backend
  estado_calculado:     EstadoTarea;
  dias_restantes:       number | null; // negativo = atrasado
}

export interface ResumenTareas {
  total:      number;
  entregados: number;
  pendientes: number;
  atrasados:  number;
  ausentes:   number;
}

// =============================================
// FILTROS
// =============================================

export interface FiltrosTareas {
  periodo_evaluacion_id?: number | null;
  estado?: EstadoTarea | null;
  materia?: string | null;     // filtro en frontend por materia_nombre
  busqueda?: string | null;    // filtro en frontend por nombre
}

// =============================================
// HELPERS
// =============================================

export function formatDiasRestantes(dias: number | null): string {
  if (dias === null) return 'Sin fecha límite';
  if (dias < 0) return `${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''} de retraso`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días restantes`;
}

export function getColorDiasRestantes(dias: number | null, estado: EstadoTarea, isDark = false): string {
  if (estado === 'entregado' || estado === 'ausente') return isDark ? '#9ca3af' : '#6b7280';
  if (dias === null) return isDark ? '#9ca3af' : '#6b7280';
  if (dias < 0)  return isDark ? '#f87171' : '#ef4444';
  if (dias <= 2) return isDark ? '#fbbf24' : '#f59e0b';
  return isDark ? '#34d399' : '#10b981';
}

export const TIPOS_EVALUACION_LABELS: Record<string, string> = {
  examen:         'Examen',
  practica:       'Práctica',
  tarea:          'Tarea',
  proyecto:       'Proyecto',
  participacion:  'Participación',
  exposicion:     'Exposición',
  trabajo_grupal: 'Trabajo Grupal',
};