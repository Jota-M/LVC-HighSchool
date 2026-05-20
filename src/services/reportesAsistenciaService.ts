// services/reportesAsistenciaService.ts
// ✅ VERSIÓN COMPLETA — todos los reportes del módulo docente
import api from '@/lib/api';

export type FormatoReporte = 'pdf' | 'excel';

// ── Helper: descarga el blob como archivo ─────────────────────────
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

const mimeType = (formato: FormatoReporte) =>
  formato === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const ext = (formato: FormatoReporte) => (formato === 'pdf' ? 'pdf' : 'xlsx');

// ─────────────────────────────────────────────────────────────────
// 1. PASE DEL DÍA
// ─────────────────────────────────────────────────────────────────
export interface PaseDiaParams {
  asignacion_docente_id: number;
  fecha:                 string;
  formato:               FormatoReporte;
}

export const descargarPaseDia = async (params: PaseDiaParams): Promise<void> => {
  const query = new URLSearchParams({
    asignacion_docente_id: params.asignacion_docente_id.toString(),
    fecha:                 params.fecha,
    formato:               params.formato,
  });
  const response = await api.get(`/reportes/asistencia/pase-dia?${query}`, { responseType: 'blob' });
  descargarArchivo(
    new Blob([response.data], { type: mimeType(params.formato) }),
    `pase-dia-${params.fecha}.${ext(params.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────────
// 2. PERÍODO COMPLETO DE LA CLASE
// ─────────────────────────────────────────────────────────────────
export interface PeriodoClaseParams {
  asignacion_docente_id: number;
  fecha_inicio?:         string;
  fecha_fin?:            string;
  formato:               FormatoReporte;
}

export const descargarPeriodoClase = async (params: PeriodoClaseParams): Promise<void> => {
  const query = new URLSearchParams({
    asignacion_docente_id: params.asignacion_docente_id.toString(),
    formato:               params.formato,
  });
  if (params.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
  if (params.fecha_fin)    query.append('fecha_fin',    params.fecha_fin);
  const response = await api.get(`/reportes/asistencia/periodo-clase?${query}`, { responseType: 'blob' });
  descargarArchivo(
    new Blob([response.data], { type: mimeType(params.formato) }),
    `asistencia-clase.${ext(params.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────────
// 3. ESTUDIANTE INDIVIDUAL
// ─────────────────────────────────────────────────────────────────
export interface EstudianteReporteParams {
  matricula_id:           number;
  asignacion_docente_id?: number;
  fecha_inicio?:          string;
  fecha_fin?:             string;
  formato:                FormatoReporte;
  codigo_estudiante?:     string;
}

export const descargarReporteEstudiante = async (params: EstudianteReporteParams): Promise<void> => {
  const query = new URLSearchParams({
    matricula_id: params.matricula_id.toString(),
    formato:      params.formato,
  });
  if (params.asignacion_docente_id) query.append('asignacion_docente_id', params.asignacion_docente_id.toString());
  if (params.fecha_inicio)          query.append('fecha_inicio',          params.fecha_inicio);
  if (params.fecha_fin)             query.append('fecha_fin',             params.fecha_fin);
  const response = await api.get(`/reportes/asistencia/estudiante?${query}`, { responseType: 'blob' });
  const nombre = params.codigo_estudiante ?? `est-${params.matricula_id}`;
  descargarArchivo(
    new Blob([response.data], { type: mimeType(params.formato) }),
    `asistencia-${nombre}.${ext(params.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────────
// 4. COMPARATIVO TRIMESTRAL — CLASE
// ─────────────────────────────────────────────────────────────────
export interface TrimestresClaseParams {
  asignacion_docente_id: number;
  formato:               FormatoReporte;
}

export const descargarTrimestresClase = async (params: TrimestresClaseParams): Promise<void> => {
  const query = new URLSearchParams({
    asignacion_docente_id: params.asignacion_docente_id.toString(),
    formato: params.formato,
    tipo:    'clase',
  });
  const response = await api.get(`/reportes/asistencia/trimestres?${query}`, { responseType: 'blob' });
  descargarArchivo(
    new Blob([response.data], { type: mimeType(params.formato) }),
    `asistencia-trimestres.${ext(params.formato)}`
  );
};

// ─────────────────────────────────────────────────────────────────
// 5. COMPARATIVO TRIMESTRAL — ESTUDIANTE
// ─────────────────────────────────────────────────────────────────
export interface TrimestresEstudianteParams {
  asignacion_docente_id: number;
  matricula_id:          number;
  codigo_estudiante?:    string;
  formato:               FormatoReporte;
}

export const descargarTrimestresEstudiante = async (params: TrimestresEstudianteParams): Promise<void> => {
  const query = new URLSearchParams({
    asignacion_docente_id: params.asignacion_docente_id.toString(),
    matricula_id:          params.matricula_id.toString(),
    formato:               params.formato,
    tipo:                  'estudiante',
  });
  const response = await api.get(`/reportes/asistencia/trimestres?${query}`, { responseType: 'blob' });
  const nombre = params.codigo_estudiante ?? `est-${params.matricula_id}`;
  descargarArchivo(
    new Blob([response.data], { type: mimeType(params.formato) }),
    `trimestres-${nombre}.${ext(params.formato)}`
  );
};

export default {
  descargarPaseDia,
  descargarPeriodoClase,
  descargarReporteEstudiante,
  descargarTrimestresClase,
  descargarTrimestresEstudiante,
};