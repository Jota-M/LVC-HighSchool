// services/padreAsistenciaService.ts
// Todas las rutas validadas contra asistenciaRoutes.js y padreRoutes.js.

import api from '@/lib/api';
import type { HistorialPermisoItem } from '@/types/padreAsistenciaTypes';
import {
  HijoInfo,
  ResumenAsistenciaHijo,
  AsistenciaHijo,
  SolicitudPermisoHijo,
  CrearPermisoHijoDTO,
  FiltrosHistorialAsistencia,
  FiltrosPermisosHijo,
} from '@/types/padreAsistenciaTypes';
import { Paginacion } from '@/types/asistenciaTypes';

// =============================================
// HIJO / ESTUDIANTE
// =============================================

/**
 * GET /api/padre/hijos
 * Lista los hijos vinculados al padre autenticado con matrícula activa.
 * Ruta definida en padreRoutes.js → PadreController.getHijos
 */
export const getHijosDelPadre = async (): Promise<{ success: boolean; data: { hijos: HijoInfo[] } }> => {
  const response = await api.get('/padre/hijos');
  return response.data;
};

// =============================================
// RESUMEN DE ASISTENCIA
// =============================================

/**
 * GET /api/asistencia/reporte?matricula_id=X
 * Ruta real: asistenciaRoutes.js → GET /reporte → AsistenciaController.getReporte
 * Requiere permiso: asistencia.reporte
 * Transforma el array del stored procedure al formato ResumenAsistenciaHijo.
 */
export const getResumenAsistencia = async (
  matriculaId: number,
  opciones?: { fecha_inicio?: string; fecha_fin?: string }
): Promise<ResumenAsistenciaHijo> => {
  const params = new URLSearchParams({ matricula_id: matriculaId.toString() });
  if (opciones?.fecha_inicio) params.append('fecha_inicio', opciones.fecha_inicio);
  if (opciones?.fecha_fin)    params.append('fecha_fin',    opciones.fecha_fin);

  const response = await api.get(`/asistencia/reporte?${params}`);
  const reporte: any[] = response.data.data.reporte;

  const porMateria = reporte.map((r) => ({
    asignacion_id:         Number(r.asignacion_id),
    materia_nombre:        r.materia_nombre,
    materia_codigo:        r.materia_nombre,
    materia_color:         null,
    total_clases:          Number(r.total_clases),
    presentes:             Number(r.presentes),
    ausentes:              Number(r.ausentes),
    tardanzas:             Number(r.tardanzas),
    justificados:          Number(r.justificados),
    faltas_parciales:      Number(r.faltas_parciales),
    porcentaje_asistencia: Number(r.porcentaje_asistencia),
    en_riesgo:             Number(r.porcentaje_asistencia) < 75,
  }));

  const totales = porMateria.reduce(
    (acc, m) => ({
      total_clases:           acc.total_clases           + m.total_clases,
      total_presentes:        acc.total_presentes        + m.presentes,
      total_ausentes:         acc.total_ausentes         + m.ausentes,
      total_tardanzas:        acc.total_tardanzas        + m.tardanzas,
      total_justificados:     acc.total_justificados     + m.justificados,
      total_faltas_parciales: acc.total_faltas_parciales + m.faltas_parciales,
    }),
    {
      total_clases: 0, total_presentes: 0, total_ausentes: 0,
      total_tardanzas: 0, total_justificados: 0, total_faltas_parciales: 0,
    }
  );

  const porcentaje_asistencia_global =
    totales.total_clases > 0
      ? Math.round(
          ((totales.total_presentes + totales.total_tardanzas + totales.total_justificados) /
            totales.total_clases) * 100
        )
      : 0;

  return { ...totales, porcentaje_asistencia_global, por_materia: porMateria };
};

// =============================================
// HISTORIAL DE ASISTENCIA
// =============================================

/**
 * GET /api/asistencia?matricula_id=X&...
 * Ruta real: asistenciaRoutes.js → GET / → AsistenciaController.listar
 * Requiere permiso: asistencia.leer
 */
export const getHistorialAsistencia = async (
  filtros: FiltrosHistorialAsistencia
): Promise<{ asistencias: AsistenciaHijo[]; paginacion: Paginacion }> => {
  const params = new URLSearchParams();
  params.append('matricula_id', filtros.matricula_id.toString());
  params.append('page',         (filtros.page  ?? 1).toString());
  params.append('limit',        (filtros.limit ?? 15).toString());
  if (filtros.asignacion_docente_id) params.append('asignacion_docente_id', filtros.asignacion_docente_id.toString());
  if (filtros.fecha_inicio)          params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin)             params.append('fecha_fin',    filtros.fecha_fin);
  if (filtros.estado)                params.append('estado',       filtros.estado);

  const response = await api.get(`/asistencia?${params}`);
  const { asistencias, paginacion } = response.data.data;

  const mapped: AsistenciaHijo[] = asistencias.map((a: any) => ({
    id:             a.id,
    fecha:          a.fecha,
    estado:         a.estado,
    hora_marcacion: a.hora_marcacion,
    materia_nombre: a.materia_nombre,
    materia_codigo: a.materia_nombre,
    materia_color:  null,
    justificacion:  a.justificacion,
    observaciones:  a.observaciones,
    permiso_codigo: a.permiso_codigo,
    tiene_permiso:  !!a.solicitud_permiso_id,
  }));

  return { asistencias: mapped, paginacion };
};

// =============================================
// PERMISOS
// =============================================

/**
 * GET /api/permisos?estudiante_id=X&...
 * Ruta real: asistenciaRoutes.js → GET /permisos → SolicitudPermisoController.listar
 * Requiere permiso: solicitud_permiso.leer
 * El filtro estudiante_id ya está soportado en SolicitudPermiso.findAll()
 */
export const getPermisosDelHijo = async (
  estudianteId: number,
  filtros: FiltrosPermisosHijo = {}
): Promise<{ solicitudes: SolicitudPermisoHijo[]; paginacion: Paginacion }> => {
  const params = new URLSearchParams({ estudiante_id: estudianteId.toString() });
  params.append('page',  (filtros.page  ?? 1).toString());
  params.append('limit', (filtros.limit ?? 10).toString());
  if (filtros.estado)       params.append('estado',       filtros.estado);
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin)    params.append('fecha_fin',    filtros.fecha_fin);

  const response = await api.get(`/asistencia/permisos?${params}`);
  const { solicitudes, paginacion } = response.data.data;

  const mapped: SolicitudPermisoHijo[] = solicitudes.map((s: any) => ({
    id:                    s.id,
    codigo_solicitud:      s.codigo_solicitud,
    fecha_ausencia:        s.fecha_ausencia,
    es_dia_completo:       s.es_dia_completo,
    hora_inicio:           s.hora_inicio,
    hora_fin:              s.hora_fin,
    motivo:                s.motivo,
    descripcion:           s.descripcion,
    archivo_adjunto_url:   s.archivo_adjunto_url,
    estado:                s.estado,
    motivo_rechazo:        s.motivo_rechazo,
    observaciones_revisor: s.observaciones_revisor,
    fecha_revision:        s.fecha_revision,
    revisado_por_username: s.revisado_por_username,
    created_at:            s.created_at,
    materia_nombre:        s.materia_nombre,
    asignacion_docente_id: s.asignacion_docente_id,
  }));

  return { solicitudes: mapped, paginacion };
};

/**
 * GET /api/permisos/:id → detalle
 * GET /api/permisos/:id/historial → historial
 * Ambas rutas existen en asistenciaRoutes.js
 * Requieren permiso: solicitud_permiso.leer
 */
export const getDetallePermiso = async (
  id: number
): Promise<{ solicitud: SolicitudPermisoHijo; historial: HistorialPermisoItem[] }> => {
  const [detRes, histRes] = await Promise.all([
    api.get(`/asistencia/permisos/${id}`),
    api.get(`/asistencia/permisos/${id}/historial`),
  ]);
  return {
    solicitud: detRes.data.data.solicitud,
    historial: histRes.data.data.historial,
  };
};

/**
 * POST /api/permisos
 * Ruta real: asistenciaRoutes.js → POST /permisos → SolicitudPermisoController.crear
 * Requiere permiso: solicitud_permiso.crear
 */
export const crearPermiso = async (
  data: CrearPermisoHijoDTO,
  archivo?: File
): Promise<{ success: boolean; message: string; data: { solicitud: SolicitudPermisoHijo } }> => {
  // Solo usar FormData cuando hay un archivo real adjunto.
  // Sin archivo siempre enviar JSON — si se envía FormData sin multer
  // configurado en el backend, Express no parsea el body y da error 500.
  if (archivo instanceof File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    const response = await api.post('/asistencia/permisos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
  // Sin archivo → JSON puro, el backend lo parsea correctamente
  const response = await api.post('/asistencia/permisos', data);
  return response.data;
};

/**
 * PATCH /api/padre/permisos/:id/cancelar
 * Ruta real: padreRoutes.js → PadreController.cancelarPermiso
 * Requiere permiso: solicitud_permiso.crear
 *
 * NO se usa PATCH /api/permisos/:id/estado porque ese endpoint requiere
 * solicitud_permiso.aprobar, que es exclusivo de docentes/admins.
 */
export const cancelarPermiso = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch(`/padre/permisos/${id}/cancelar`);
  return response.data;
};