// services/asistenciaService.ts
import api from '@/lib/api';
import {
  SolicitudesListResponse,
  SolicitudResponse,
  AsistenciasListResponse,
  ListaDiaResponse,
  ReporteResponse,
  SolicitudPermisoFiltros,
  AsistenciaFiltros,
  CrearSolicitudPermisoDTO,
  CambiarEstadoPermisoDTO,
  CrearAsistenciaDTO,
  RegistrarMasivoDTO,
  ActualizarAsistenciaDTO,
  SolicitudPermiso,
  Asistencia,
  HistorialPermiso,
  CorregirAsistenciaDTO,
  ReporteClaseResponse,
} from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// TIPO: respuesta de /mis-asignaciones
// ──────────────────────────────────────────────

export interface AsignacionDocente {
  
  asignacion_id: number;
  es_titular: boolean;
  materia_id: number;
  materia_nombre: string;
  materia_codigo: string;
  materia_color: string | null;
  grado_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  grado_materia_id: number; 
  paralelo_id: number;
  paralelo_nombre: string;
  aula: string | null;
  turno_nombre: string;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  periodo_academico_id: number;
  periodo_evaluacion_id: number;
  periodo_nombre: string;
  total_estudiantes: number;
  total_marcados: number;
  total_pendientes: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  faltas_parciales: number;
  asistencia_completa: boolean;
}

export interface MisAsignacionesResponse {
  success: boolean;
  data: {
    fecha: string;
    docente_usuario_id: number;
    total_asignaciones: number;
    asignaciones: AsignacionDocente[];
  };
}

// =============================================
// SOLICITUDES DE PERMISO
// ✅ FIX: URLs corregidas a /asistencia/permisos
// =============================================

export const solicitudPermisoService = {

  async listar(filters: SolicitudPermisoFiltros = {}): Promise<SolicitudesListResponse> {
    const params = new URLSearchParams();
    if (filters.page)                  params.append('page',                  filters.page.toString());
    if (filters.limit)                 params.append('limit',                 filters.limit.toString());
    if (filters.estudiante_id)         params.append('estudiante_id',         filters.estudiante_id.toString());
    if (filters.padre_familia_id)      params.append('padre_familia_id',      filters.padre_familia_id.toString());
    if (filters.estado)                params.append('estado',                filters.estado);
    if (filters.fecha_inicio)          params.append('fecha_inicio',          filters.fecha_inicio);
    if (filters.fecha_fin)             params.append('fecha_fin',             filters.fecha_fin);
    if (filters.asignacion_docente_id) params.append('asignacion_docente_id', filters.asignacion_docente_id.toString());

    // ✅ ANTES: /permisos → 404
    // ✅ AHORA: /asistencia/permisos → coincide con app.use('/asistencia', asistenciaRoutes)
    const response = await api.get(`/asistencia/permisos?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<SolicitudResponse> {
    const response = await api.get(`/asistencia/permisos/${id}`);
    return response.data;
  },

  async obtenerHistorial(id: number): Promise<{ success: boolean; data: { historial: HistorialPermiso[] } }> {
    const response = await api.get(`/asistencia/permisos/${id}/historial`);
    return response.data;
  },

  async crear(
    data: CrearSolicitudPermisoDTO,
    archivo?: File
  ): Promise<{ success: boolean; message: string; data: { solicitud: SolicitudPermiso } }> {
    if (archivo) {
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
    const response = await api.post('/asistencia/permisos', data);
    return response.data;
  },

  async cambiarEstado(
    id: number,
    data: CambiarEstadoPermisoDTO
  ): Promise<{ success: boolean; message: string; data: { solicitud: SolicitudPermiso } }> {
    const response = await api.patch(`/asistencia/permisos/${id}/estado`, data);
    return response.data;
  },
};

// =============================================
// ASISTENCIA
// =============================================

export const asistenciaService = {

  async getMisAsignaciones(fecha?: string): Promise<MisAsignacionesResponse> {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await api.get(`/asistencia/mis-asignaciones${params}`);
    return response.data;
  },

  async listar(filters: AsistenciaFiltros = {}): Promise<AsistenciasListResponse> {
    const params = new URLSearchParams();
    if (filters.page)                  params.append('page',                  filters.page.toString());
    if (filters.limit)                 params.append('limit',                 filters.limit.toString());
    if (filters.matricula_id)          params.append('matricula_id',          filters.matricula_id.toString());
    if (filters.asignacion_docente_id) params.append('asignacion_docente_id', filters.asignacion_docente_id.toString());
    if (filters.fecha)                 params.append('fecha',                 filters.fecha);
    if (filters.fecha_inicio)          params.append('fecha_inicio',          filters.fecha_inicio);
    if (filters.fecha_fin)             params.append('fecha_fin',             filters.fecha_fin);
    if (filters.estado)                params.append('estado',                filters.estado);

    const response = await api.get(`/asistencia?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<{ success: boolean; data: { asistencia: Asistencia } }> {
    const response = await api.get(`/asistencia/${id}`);
    return response.data;
  },

  async getListaDia(asignacion_docente_id: number, fecha: string): Promise<ListaDiaResponse> {
    const params = new URLSearchParams({
      asignacion_docente_id: asignacion_docente_id.toString(),
      fecha,
    });
    const response = await api.get(`/asistencia/lista-dia?${params}`);
    return response.data;
  },

  async getReporte(
    matricula_id: number,
    opciones?: { asignacion_docente_id?: number; fecha_inicio?: string; fecha_fin?: string }
  ): Promise<ReporteResponse> {
    const params = new URLSearchParams({ matricula_id: matricula_id.toString() });
    if (opciones?.asignacion_docente_id) params.append('asignacion_docente_id', opciones.asignacion_docente_id.toString());
    if (opciones?.fecha_inicio)          params.append('fecha_inicio',           opciones.fecha_inicio);
    if (opciones?.fecha_fin)             params.append('fecha_fin',              opciones.fecha_fin);

    const response = await api.get(`/asistencia/reporte?${params}`);
    return response.data;
  },

  async registrar(
    data: CrearAsistenciaDTO
  ): Promise<{ success: boolean; message: string; data: { asistencia: Asistencia } }> {
    const response = await api.post('/asistencia', data);
    return response.data;
  },

  async registrarMasivo(
    data: RegistrarMasivoDTO
  ): Promise<{ success: boolean; message: string; data: { total: number; asistencias: Asistencia[] } }> {
    const response = await api.post('/asistencia/masivo', data);
    return response.data;
  },

  async actualizar(
    id: number,
    data: ActualizarAsistenciaDTO
  ): Promise<{ success: boolean; message: string; data: { asistencia: Asistencia } }> {
    const response = await api.patch(`/asistencia/${id}`, data);
    return response.data;
  },

  async getReporteClase(
    asignacion_docente_id: number,
    opciones?: { fecha_inicio?: string; fecha_fin?: string }
  ): Promise<ReporteClaseResponse> {
    const params = new URLSearchParams({
      asignacion_docente_id: asignacion_docente_id.toString(),
    });
    if (opciones?.fecha_inicio) params.append('fecha_inicio', opciones.fecha_inicio);
    if (opciones?.fecha_fin)    params.append('fecha_fin',    opciones.fecha_fin);

    const response = await api.get(`/asistencia/reporte-clase?${params}`);
    return response.data;
  },

  async corregir(
    id: number,
    data: CorregirAsistenciaDTO
  ): Promise<{ success: boolean; message: string; data: { asistencia: Asistencia } }> {
    const response = await api.patch(`/asistencia/${id}/corregir`, data);
    return response.data;
  },
};

export default {
  permisos:   solicitudPermisoService,
  asistencia: asistenciaService,
};