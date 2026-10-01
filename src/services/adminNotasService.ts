// services/adminNotasService.ts
import api from '@/lib/api';

export interface CursoInfo {
  paralelo_id: number;
  paralelo_nombre: string;
  aula?: string | null;
  grado_id: number;
  grado_nombre: string;
  grado_orden?: number;
  nivel_id: number;
  nivel_nombre: string;
  turno_id: number;
  turno_nombre: string;
}

export interface PeriodoEvaluacionInfo {
  id: number;
  nombre: string;
  codigo: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface MateriaCursoInfo {
  materia_id: number;
  grado_materia_id: number;
  materia_codigo: string;
  materia_nombre: string;
  nota_minima_aprobacion: number | string;
  docente_nombre?: string | null;
  promedio_curso?: number | null;
  porcentaje_aprobados?: number | null;
}

export interface MateriaNotaEstudiante {
  materia_id: number;
  grado_materia_id: number;
  materia_codigo: string;
  materia_nombre: string;
  nota_minima: number;
  nota_final: number | null;
  aprobado: boolean | null;
  estado: string;
  nota_ser: number | null;
  nota_saber: number | null;
  nota_hacer: number | null;
  nota_auto: number | null;
}

export interface TrimestreEstudiante {
  periodo_id: number;
  periodo_nombre: string;
  periodo_orden: number;
  materias: MateriaNotaEstudiante[];
  promedio: number | null;
  aprobadas: number;
  reprobadas: number;
  sin_nota: number;
}

export interface MateriaAnualEstudiante {
  materia_id: number;
  grado_materia_id: number;
  materia_codigo: string;
  materia_nombre: string;
  nota_minima: number;
  trimestres: {
    periodo_id: number;
    periodo_nombre: string;
    periodo_orden: number;
    nota_final: number | null;
    aprobado: boolean | null;
  }[];
  promedio_anual: number | null;
  aprobado_anual: boolean | null;
  nivel: 'excelente' | 'bueno' | 'regular' | 'en_riesgo' | 'sin_nota';
}

export interface EstudianteCursoNotas {
  matricula_id: number;
  estudiante_id: number;
  codigo: string;
  ci: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  foto_url: string | null;
  genero: string | null;
  trimestres: TrimestreEstudiante[];
  materias_anuales: MateriaAnualEstudiante[];
  promedio_general_anual: number | null;
  aprobadas_anual: number;
  reprobadas_anual: number;
  sin_nota_anual: number;
  estado_general: 'aprobado' | 'regular' | 'en_riesgo' | 'reprobado' | 'sin_nota';
}

export interface CursoStats {
  total_estudiantes: number;
  promedio_general_curso: number | null;
  aprobados_total: number;
  en_riesgo_total: number;
  reprobados_total: number;
  stats_por_periodo: {
    periodo_id: number;
    periodo_nombre: string;
    promedio_curso: number | null;
  }[];
  promedios_materias: MateriaCursoInfo[];
}

export interface CursoNotasData {
  curso: CursoInfo;
  periodos: PeriodoEvaluacionInfo[];
  materias: MateriaCursoInfo[];
  estudiantes: EstudianteCursoNotas[];
  estadisticas: CursoStats;
}

/**
 * GET /api/notas/curso/:paralelo_id
 * Obtiene el consolidado de notas de todos los estudiantes de un curso en sus 3 trimestres
 */
export const getNotasCurso = async (
  paraleloId: number,
  periodoAcademicoId?: number
): Promise<CursoNotasData> => {
  const url = periodoAcademicoId
    ? `/notas/curso/${paraleloId}?periodo_academico_id=${periodoAcademicoId}`
    : `/notas/curso/${paraleloId}`;
  const response = await api.get(url);
  return response.data.data;
};

export interface ActualizarNotaManualPayload {
  matricula_id: number;
  grado_materia_id: number;
  periodo_evaluacion_id: number;
  nota_manual: number;
  justificacion_manual?: string;
}

/**
 * PATCH /api/notas/nota-manual
 * Actualiza la calificación final de un estudiante de forma manual
 */
export const actualizarNotaManual = async (
  payload: ActualizarNotaManualPayload
): Promise<any> => {
  const response = await api.patch('/notas/nota-manual', payload);
  return response.data;
};

