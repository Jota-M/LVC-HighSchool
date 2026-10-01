// types/notasTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type TipoEvaluacion =
  // Saber
  | 'examen'
  | 'exposicion'
  | 'cuestionario'
  | 'tarea'
  | 'ficha_trabajo'
  | 'investigacion'
  | 'evaluacion_oral'
  // Hacer
  | 'trabajo_practico'
  | 'manualidad'
  | 'experimento'
  | 'actividad_practica'
  | 'ejercicio_practico'
  | 'trabajo_grupal'
  | 'proyecto'
  | 'demostracion'
  | 'produccion_creativa'
  // General / compatibilidad
  | 'practica'
  | 'participacion'
  | 'general'
  | 'ser';

export type EstadoCalificacionPeriodo = 'activa' | 'cerrada' | 'anulada';

// 4 dimensiones del modelo boliviano actual
export type CodigoDimension = 'SER' | 'SAB' | 'HAC' | 'AUT';

// ============================================
// DIMENSIONES
// ============================================

export interface DimensionEvaluacion {
  id: number;
  nombre: string;
  codigo: CodigoDimension;
  descripcion?: string;
  porcentaje_ponderacion: number | string; // SER=10, SAB=45, HAC=40, AUTO=5 (dinámico)
  color: string;
  orden: number;
  activo: boolean;
}

// ============================================
// PERÍODO DE EVALUACIÓN
// ============================================

export interface PeriodoEvaluacion {
  id: number;
  periodo_academico_id: number;
  nombre: string;
  codigo?: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  periodo_academico_nombre?: string;
  periodo_academico_codigo?: string;
}

// ============================================
// MATERIA DEL DOCENTE (/mis-materias)
// ============================================

export interface MateriaDocenteNotas {
  asignacion_id: number;
  es_titular: boolean;
  materia_id: number;
  materia_nombre: string;
  materia_codigo: string;
  materia_color: string | null;
  grado_id: number;
  grado_materia_id: number;    // ← expuesto desde el backend para calcular notas
  grado_nombre: string;
  nivel_nombre: string;
  modalidad_evaluacion?: 'dimensional' | 'cualitativa';
  paralelo_id: number;
  paralelo_nombre: string;
  turno_nombre: string;
  periodo_academico_id: number;
  periodo_nombre: string;
  // Trimestre
  periodo_evaluacion_id: number | null;
  trimestre_nombre: string | null;
  trimestre_orden: number | null;
  // Resumen del trimestre
  total_estudiantes: number;
  total_evaluaciones: number;
  evaluaciones_ser: number;
  evaluaciones_saber: number;
  evaluaciones_hacer: number;
  evaluaciones_auto: number;
  calificaciones_registradas: number;
  total_calificaciones?: number;
  estudiantes_con_nota_final: number;
  aprobados: number;
  reprobados: number;
}

// ============================================
// RÚBRICA
// ============================================

export interface CriterioRubrica {
  id?: number;
  evaluacion_id?: number;
  orden: number;
  criterio: string;
  descripcion?: string;
  nivel_excelente?: string;
  nivel_bueno?: string;
  nivel_basico?: string;
  nivel_insuficiente?: string;
  puntos_posibles: number;
  activo?: boolean;
}

export interface RubricaResponse {
  criterios: CriterioRubrica[];
  total_criterios: number;
  suma_puntos: number;
}
// ============================================
// TEMA CON EVALUACIONES (para vista de temas con evaluaciones anidadas)
// ============================================
export interface TemaConEvaluaciones {
  unidad_id: number;
  numero_unidad: number;
  unidad_titulo: string;
  unidad_descripcion?: string;
  tema_id: number;
  numero_tema: number;
  tema_titulo: string;
  nivel_dificultad?: 'basico' | 'intermedio' | 'avanzado';
  evaluaciones: Array<{
    id: number;
    nombre: string;
    tipo?: TipoEvaluacion;
    fecha?: string;
    puntaje_maximo: number;
    peso_en_dimension: number;
    dimension_nombre: string;
    dimension_codigo: CodigoDimension;
    dimension_color: string;
    visible_para_padres: boolean;
  }>;
  total_evaluaciones: number;
}

// ============================================
// EVALUACIÓN (con campos de adjuntos y rúbrica)
// ============================================


export interface Evaluacion {
  ponderacion: string;
  id: number;
  asignacion_docente_id: number;
  dimension_evaluacion_id: number;
  periodo_evaluacion_id: number;
  tema_id?: number | null;
  tema_titulo?: string | null;
  numero_tema?: number | null;
  unidad_id?: number | null;
  unidad_titulo?: string | null;
  numero_unidad?: number | null;
  nombre: string;
  tipo?: TipoEvaluacion;
  descripcion?: string;
  instrucciones?: string;      // ← nuevo
  fecha?: string;
  fecha_limite?: string;       // ← nuevo (para tareas/proyectos)
  puntaje_maximo: number;
  peso_en_dimension: number;
  visible_para_padres: boolean;
  publicado_en?: string;       // ← nuevo
  foto_url?: string | null;    // ← nuevo
  foto_public_id?: string | null;
  pdf_url?: string | null;     // ← nuevo
  pdf_public_id?: string | null;
  pdf_nombre?: string | null;  // ← nuevo
  modalidad?: 'presencial' | 'virtual';
  duracion_minutos?: number | null;
  fecha_hora_inicio?: string | null;
  fecha_hora_fin?: string | null;
  intentos_permitidos?: number | null;
  orden_aleatorio?: boolean | null;
  permite_entrega_archivo?: boolean | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  dimension_nombre?: string;
  dimension_codigo?: CodigoDimension;
  dimension_color?: string;
  periodo_nombre?: string;
  materia_nombre?: string;
  materia_codigo?: string;
  grado_nombre?: string;
  paralelo_nombre?: string;
  porcentaje_ponderacion?: number;
}

// ============================================
// CALIFICACIÓN
// ============================================

export interface CalificacionEstudiante {
  matricula_id: number;
  estudiante_id?: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_foto?: string | null;
  id?: number;
  calificacion_id?: number | null;
  evaluacion_id?: number;
  puntaje_obtenido?: number | null;
  esta_ausente?: boolean;
  observacion?: string;
  fecha_registro?: string;
  entrega_id?: number | null;
  entrega_archivo_url?: string | null;
  entrega_archivo_nombre?: string | null;
  entrega_fecha?: string | null;
  entrega_comentario?: string | null;
}

export interface CalificacionPorPeriodo {
  id?: number;
  evaluacion_id: number;
  matricula_id: number;
  puntaje_obtenido: number;
  esta_ausente: boolean;
  observacion?: string;
  evaluacion_nombre?: string;
  evaluacion_tipo?: TipoEvaluacion;
  puntaje_maximo?: number;
  peso_en_dimension?: number;
  evaluacion_fecha?: string;
  dimension_nombre?: string;
  dimension_codigo?: CodigoDimension;
  porcentaje_ponderacion?: number;
  dimension_color?: string;
}

// ============================================
// NOTA DIMENSIÓN Y CALIFICACIÓN PERÍODO
// ============================================

export interface NotaDimension {
  id: number;
  matricula_id: number;
  grado_materia_id: number;
  periodo_evaluacion_id: number;
  dimension_evaluacion_id: number;
  nota_promedio: number;
  total_evaluaciones: number;
  calculado_en: string;
  dimension_nombre?: string;
  dimension_codigo?: CodigoDimension;
  porcentaje_ponderacion?: number;
  dimension_color?: string;
}

export interface CalificacionPeriodo {
  id?: number;
  matricula_id: number;
  grado_materia_id: number;
  periodo_evaluacion_id: number;
  nota_final: number | null;
  aprobado: boolean | null;
  estado: EstadoCalificacionPeriodo;
  cerrado_por?: number;
  fecha_cierre?: string;
  es_nota_manual: boolean;
  nota_manual?: number;
  justificacion_manual?: string;
  calculado_en: string;
  materia_nombre?: string;
  materia_codigo?: string;
  periodo_nombre?: string;
  cerrado_por_username?: string;
}

export interface BoletinItem {
  materia_nombre: string;
  materia_codigo: string;
  nota_ser?: number;
  nota_saber?: number;
  nota_hacer?: number;
  nota_auto?: number;
  nota_final?: number;
  nota_minima: number;
  aprobado: boolean;
  estado_periodo: EstadoCalificacionPeriodo;
}

// ============================================
// DTOs
// ============================================

export interface CrearEvaluacionDTO {
  asignacion_docente_id: number;
  dimension_evaluacion_id: number;
  periodo_evaluacion_id: number;
  nombre: string;
  tipo?: TipoEvaluacion;
  descripcion?: string;
  instrucciones?: string;
  fecha?: string;
  fecha_limite?: string;
  puntaje_maximo?: number;
  peso_en_dimension?: number;
  visible_para_padres?: boolean;
  tema_id?: number;
  modalidad?: 'presencial' | 'virtual';
  duracion_minutos?: number;
  fecha_hora_inicio?: string;
  fecha_hora_fin?: string;
  intentos_permitidos?: number;
  orden_aleatorio?: boolean;
  permite_entrega_archivo?: boolean;
  preguntas?: any[];
}

export interface ActualizarEvaluacionDTO {
  nombre?: string;
  tipo?: TipoEvaluacion;
  descripcion?: string;
  instrucciones?: string;
  fecha?: string;
  fecha_limite?: string;
  puntaje_maximo?: number;
  peso_en_dimension?: number;
  visible_para_padres?: boolean;
  activo?: boolean;
  tema_id?: number | null;
  modalidad?: 'presencial' | 'virtual';
  duracion_minutos?: number;
  fecha_hora_inicio?: string;
  fecha_hora_fin?: string;
  intentos_permitidos?: number;
  orden_aleatorio?: boolean;
  permite_entrega_archivo?: boolean;
  preguntas?: any[];
}

export interface PublicarEvaluacionDTO {
  fecha_limite?: string;
  instrucciones?: string;
}

export interface RegistroCalificacionItem {
  matricula_id: number;
  puntaje_obtenido: number;
  esta_ausente?: boolean;
  observacion?: string;
  sin_calificar?: boolean;
  entrega_archivo_url?: string | null;
  entrega_archivo_nombre?: string | null;
  entrega_fecha?: string | null;
  entrega_comentario?: string | null;
}

export interface RegistrarNotasMasivoDTO {
  evaluacion_id: number;
  registros: RegistroCalificacionItem[];
}

// ============================================
// FILTROS
// ============================================

export interface EvaluacionFiltros {
  page?: number;
  limit?: number;
  asignacion_docente_id?: number;
  dimension_evaluacion_id?: number;
  periodo_evaluacion_id?: number;
  activo?: boolean;
}

// ============================================
// CONSTANTES PARA UI — 4 DIMENSIONES
// ============================================

export interface DimensionConfigItem {
  label: string;
  color: string;
  bgColor: string;
  porcentaje: number;
  descripcion: string;
}

export const DIMENSIONES_CONFIG: Record<CodigoDimension, DimensionConfigItem> = {
  SER: {
    label: 'Ser',
    color: '#10b981',
    bgColor: '#d1fae5',
    porcentaje: 10,
    descripcion: 'Valores y actitudes',
  },
  SAB: {
    label: 'Saber',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    porcentaje: 45,
    descripcion: 'Conocimientos y teoría',
  },
  HAC: {
    label: 'Hacer',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    porcentaje: 40,
    descripcion: 'Prácticas y habilidades',
  },
  AUT: {
    label: 'Autoevaluación',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    porcentaje: 5,
    descripcion: 'Autoevaluación del aprendizaje',
  },
};

export const DIMENSIONES_ORDEN: CodigoDimension[] = ['SAB', 'HAC', 'SER', 'AUT'];

export const TIPOS_EVALUACION: { value: TipoEvaluacion; label: string; icon: string }[] = [
  // Saber
  { value: 'examen',              label: 'Examen',              icon: '📝' },
  { value: 'exposicion',          label: 'Exposición',          icon: '🗣️' },
  { value: 'cuestionario',        label: 'Cuestionario',        icon: '❓' },
  { value: 'tarea',               label: 'Tarea',               icon: '✏️' },
  { value: 'ficha_trabajo',       label: 'Ficha de trabajo',    icon: '📋' },
  { value: 'investigacion',       label: 'Investigación',       icon: '🔎' },
  { value: 'evaluacion_oral',     label: 'Evaluación oral',     icon: '🗣️' },
  // Hacer
  { value: 'trabajo_practico',    label: 'Trabajo práctico',    icon: '🛠️' },
  { value: 'manualidad',          label: 'Manualidad',          icon: '✂️' },
  { value: 'experimento',         label: 'Experimento',         icon: '🧪' },
  { value: 'actividad_practica',  label: 'Actividad práctica',  icon: '🧩' },
  { value: 'ejercicio_practico',  label: 'Ejercicio práctico',  icon: '📐' },
  { value: 'trabajo_grupal',      label: 'Trabajo grupal',      icon: '👥' },
  { value: 'proyecto',            label: 'Proyecto',            icon: '🏗️' },
  { value: 'demostracion',        label: 'Demostración',        icon: '🎭' },
  { value: 'produccion_creativa', label: 'Producción creativa', icon: '🖍️' },
  // General y compatibilidad
  { value: 'general',             label: 'General',             icon: '⭐' },
  { value: 'participacion',       label: 'Participación',       icon: '🙋' },
  { value: 'practica',            label: 'Práctica',            icon: '🔬' },
  { value: 'ser',                 label: 'Actitudinal',         icon: '⭐' },
];

export const COLORES_MATERIA = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
];
// Tipos permitidos por dimensión
export const TIPOS_POR_DIMENSION: Record<CodigoDimension, TipoEvaluacion[]> = {
  SER:  [], // No requiere selector; se asigna tipo general por defecto
  SAB:  ['examen', 'exposicion', 'cuestionario', 'tarea', 'ficha_trabajo', 'investigacion', 'evaluacion_oral'],
  HAC:  ['trabajo_practico', 'manualidad', 'experimento', 'actividad_practica', 'ejercicio_practico', 'trabajo_grupal', 'proyecto', 'demostracion', 'produccion_creativa'],
  AUT:  [], // no usa tipos
};

// Preguntas default de autoreflexión
export const PREGUNTAS_AUTOEVALUACION = [
  '¿Qué aprendí en este período?',
  '¿En qué temas me costó más? ¿Por qué?',
  '¿Cómo me esforcé para mejorar?',
];

// Nombre autogenerado por dimensión
export const generarNombreDefault = (dim: CodigoDimension): string => {
  const fecha = new Date();
  const semana = Math.ceil(fecha.getDate() / 7);
  const mes = fecha.toLocaleString('es', { month: 'long' });
  const trimestre = Math.ceil((fecha.getMonth() + 1) / 4);
  const año = fecha.getFullYear();

  switch (dim) {
    case 'SER':  return `Observación Ser · semana ${semana} de ${mes}`;
    case 'AUT':  return `Autoevaluación · Trimestre ${trimestre} · ${año}`;
    default:     return '';
  }
};

// ============================================
// ENTREGAS DE ESTUDIANTES (VISTA DOCENTE)
// ============================================
export interface EstudianteEntregaItem {
  matricula_id: number;
  estudiante_id?: number;
  nombres?: string;
  apellidos?: string;
  codigo_estudiante?: string;
  foto_perfil_url?: string;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tamano?: number | null;
  archivos?: Array<{ url: string; nombre?: string; tamano?: number; tipo?: string }>;
  comentario_estudiante?: string | null;
  fecha_entrega?: string | null;
  calificado?: boolean;
  puntaje_obtenido?: number | null;
  esta_ausente?: boolean;
  observacion_docente?: string | null;
  [key: string]: any;
}