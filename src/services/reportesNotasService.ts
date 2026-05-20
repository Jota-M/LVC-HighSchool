// services/reportesNotasService.ts
import api from '@/lib/api';

export type FormatoReporte = 'pdf' | 'excel';

// ── Helper: descarga el blob ──────────────────────────────────
const descargarArchivo = (blob: Blob, filename: string) => {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const mimeType = (f: FormatoReporte) =>
  f === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const ext = (f: FormatoReporte) => (f === 'pdf' ? 'pdf' : 'xlsx');

const fetchBlob = async (url: string, formato: FormatoReporte, filename: string) => {
  const response = await api.get(url, { responseType: 'blob' });
  descargarArchivo(new Blob([response.data], { type: mimeType(formato) }), filename);
};

// ─────────────────────────────────────────────────────────────
// 1. BOLETÍN DE NOTAS (clase completa, un trimestre)
// ─────────────────────────────────────────────────────────────
export interface BoletinParams {
  asignacion_docente_id:  number;
  periodo_evaluacion_id:  number;
  formato:                FormatoReporte;
  materia_codigo?:        string;
}

export const descargarBoletin = async (p: BoletinParams) => {
  const q = new URLSearchParams({
    asignacion_docente_id: p.asignacion_docente_id.toString(),
    periodo_evaluacion_id: p.periodo_evaluacion_id.toString(),
    formato:               p.formato,
  });
  await fetchBlob(
    `/reportes/notas/boletin?${q}`,
    p.formato,
    `boletin-${p.materia_codigo ?? 'notas'}.${ext(p.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────
// 2. REPORTE POR EVALUACIÓN
// ─────────────────────────────────────────────────────────────
export interface EvaluacionReporteParams {
  evaluacion_id: number;
  formato:       FormatoReporte;
}

export const descargarReporteEvaluacion = async (p: EvaluacionReporteParams) => {
  const q = new URLSearchParams({
    evaluacion_id: p.evaluacion_id.toString(),
    formato:       p.formato,
  });
  await fetchBlob(
    `/reportes/notas/evaluacion?${q}`,
    p.formato,
    `evaluacion-${p.evaluacion_id}.${ext(p.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────
// 3. REPORTE POR DIMENSIÓN
// ─────────────────────────────────────────────────────────────
export interface DimensionReporteParams {
  asignacion_docente_id: number;
  periodo_evaluacion_id: number;
  dimension_id:          number;
  dimension_codigo?:     string;
  formato:               FormatoReporte;
}

export const descargarReporteDimension = async (p: DimensionReporteParams) => {
  const q = new URLSearchParams({
    asignacion_docente_id: p.asignacion_docente_id.toString(),
    periodo_evaluacion_id: p.periodo_evaluacion_id.toString(),
    dimension_id:          p.dimension_id.toString(),
    formato:               p.formato,
  });
  await fetchBlob(
    `/reportes/notas/dimension?${q}`,
    p.formato,
    `dimension-${p.dimension_codigo ?? p.dimension_id}.${ext(p.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────
// 4. COMPARATIVO TRIMESTRAL
// ─────────────────────────────────────────────────────────────
export interface ComparativoTrimestralParams {
  asignacion_docente_id: number;
  formato:               FormatoReporte;
  materia_codigo?:       string;
}

export const descargarComparativoTrimestralNotas = async (p: ComparativoTrimestralParams) => {
  const q = new URLSearchParams({
    asignacion_docente_id: p.asignacion_docente_id.toString(),
    formato:               p.formato,
  });
  await fetchBlob(
    `/reportes/notas/comparativo-trimestral?${q}`,
    p.formato,
    `comparativo-notas-${p.materia_codigo ?? 'clase'}.${ext(p.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────
// 5. ESTUDIANTE INDIVIDUAL
// ─────────────────────────────────────────────────────────────
export interface EstudianteNotasParams {
  asignacion_docente_id: number;
  matricula_id:          number;
  periodo_evaluacion_id: number;
  formato:               FormatoReporte;
  codigo_estudiante?:    string;
}

export const descargarEstudianteNotas = async (p: EstudianteNotasParams) => {
  const q = new URLSearchParams({
    asignacion_docente_id: p.asignacion_docente_id.toString(),
    matricula_id:          p.matricula_id.toString(),
    periodo_evaluacion_id: p.periodo_evaluacion_id.toString(),
    formato:               p.formato,
  });
  await fetchBlob(
    `/reportes/notas/estudiante?${q}`,
    p.formato,
    `notas-${p.codigo_estudiante ?? p.matricula_id}.${ext(p.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────
// 6. RESUMEN GENERAL CLASE
// ─────────────────────────────────────────────────────────────
export interface ResumenClaseNotasParams {
  asignacion_docente_id: number;
  periodo_evaluacion_id: number;
  formato:               FormatoReporte;
  materia_codigo?:       string;
}

export const descargarResumenClaseNotas = async (p: ResumenClaseNotasParams) => {
  const q = new URLSearchParams({
    asignacion_docente_id: p.asignacion_docente_id.toString(),
    periodo_evaluacion_id: p.periodo_evaluacion_id.toString(),
    formato:               p.formato,
  });
  await fetchBlob(
    `/reportes/notas/resumen-clase?${q}`,
    p.formato,
    `resumen-notas-${p.materia_codigo ?? 'clase'}.${ext(p.formato)}`
  );
};

export default {
  descargarBoletin,
  descargarReporteEvaluacion,
  descargarReporteDimension,
  descargarComparativoTrimestralNotas,
  descargarEstudianteNotas,
  descargarResumenClaseNotas,
};