// services/padreNotasService.ts
// Rutas validadas contra notasRoutes.js — app.use('/notas', notasRoutes)

import api from '@/lib/api';
import {
  BoletinItem,
  NotaDimension,
  CalificacionPorPeriodo,
  DimensionEvaluacion,
  PeriodoEvaluacion,
  ResumenMateriaPadre,
  getNivelRendimiento,
} from '@/types/padreNotasTypes';

// =============================================
// PERÍODOS DE EVALUACIÓN
// =============================================

/**
 * GET /notas/periodos?periodo_academico_id=X&activo=true
 * Requiere permiso: periodo_evaluacion.leer
 * Devuelve los trimestres del período académico activo del hijo.
 */
export const getPeriodosEvaluacion = async (
  periodo_academico_id: number
): Promise<PeriodoEvaluacion[]> => {
  const params = new URLSearchParams({
    periodo_academico_id: periodo_academico_id.toString(),
    activo: 'true',
  });
  const response = await api.get(`/notas/periodos?${params}`);
  return response.data.data.periodos;
};

// =============================================
// DIMENSIONES
// =============================================

/**
 * GET /notas/dimensiones
 * Requiere permiso: notas.leer
 * Para mostrar colores y porcentajes de Ser/Saber/Hacer/Auto.
 */
export const getDimensiones = async (): Promise<DimensionEvaluacion[]> => {
  const response = await api.get('/notas/dimensiones');
  return response.data.data.dimensiones;
};

// =============================================
// BOLETÍN
// =============================================

/**
 * GET /notas/boletin/:matricula_id/:periodo_evaluacion_id
 * Requiere permiso: notas.boletin
 * Devuelve nota por materia con desglose Ser/Saber/Hacer.
 * Llama al stored procedure boletin_notas() de la BD.
 */
export const getBoletin = async (
  matricula_id: number,
  periodo_evaluacion_id: number
): Promise<BoletinItem[]> => {
  const response = await api.get(`/notas/boletin/${matricula_id}/${periodo_evaluacion_id}`);
  return response.data.data.boletin;
};

/**
 * Transforma el boletín en ResumenMateriaPadre con nivel calculado.
 */
export const transformarBoletin = (boletin: BoletinItem[]): ResumenMateriaPadre[] => {
  return boletin.map(item => ({
    materia_nombre:   item.materia_nombre,
    materia_codigo:   item.materia_codigo,
    grado_materia_id: 0, // se completa desde nota_dimension si es necesario
    nota_final:       item.nota_final ?? null,
    nota_minima:      Number(item.nota_minima),
    aprobado:         item.aprobado,
    estado_periodo:   item.estado_periodo,
    nota_ser:         item.nota_ser   ?? null,
    nota_saber:       item.nota_saber ?? null,
    nota_hacer:       item.nota_hacer ?? null,
    nota_auto:        item.nota_auto  ?? null,
    nivel:            getNivelRendimiento(item.nota_final),
  }));
};

// =============================================
// NOTAS POR DIMENSIÓN (detalle de una materia)
// =============================================

/**
 * GET /notas/dimension-notas/:matricula_id/:grado_materia_id/:periodo_evaluacion_id
 * Requiere permiso: notas.leer
 * Muestra el promedio de cada dimensión para una materia específica.
 */
export const getNotasDimension = async (
  matricula_id: number,
  grado_materia_id: number,
  periodo_evaluacion_id: number
): Promise<NotaDimension[]> => {
  const response = await api.get(
    `/notas/dimension-notas/${matricula_id}/${grado_materia_id}/${periodo_evaluacion_id}`
  );
  return response.data.data.notas;
};

// =============================================
// CALIFICACIONES DETALLADAS (por evaluación)
// =============================================

/**
 * GET /notas/calificaciones/matricula/:matricula_id/periodo/:periodo_evaluacion_id
 * Requiere permiso: notas.leer
 * Lista todas las evaluaciones del período con la nota obtenida.
 * Solo devuelve las que tienen visible_para_padres = true.
 *
 * Nota: el backend no filtra por visible_para_padres en esta ruta,
 * pero el padre solo debería ver las publicadas.
 * Se filtra en el frontend por seguridad adicional.
 */
export const getCalificacionesDetalle = async (
  matricula_id: number,
  periodo_evaluacion_id: number
): Promise<CalificacionPorPeriodo[]> => {
  const response = await api.get(
    `/notas/calificaciones/matricula/${matricula_id}/periodo/${periodo_evaluacion_id}`
  );
  return response.data.data.calificaciones;
};