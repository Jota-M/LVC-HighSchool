// services/seguimientoPedagogicoService.ts
import api from '@/lib/api';
import {
  ObservacionesListResponse,
  ObservacionDetalleResponse,
  LineaTiempoResponse,
  ResumenAsignacionResponse,
  CategoriasResponse,
  PlantillasResponse,
  ObservacionFiltros,
  CrearObservacionDTO,
  ActualizarObservacionDTO,
  CambiarVisibilidadDTO,
  RegistrarAcuseDTO,
  ObservacionPedagogica,
  HistorialObservacion,
  AcuseReciboPadre,
} from '@/types/seguimientoPedagogicoTypes';

// =============================================
// CATÁLOGO — categorías y plantillas
// =============================================

export const catalogoService = {

  async getCategorias(): Promise<CategoriasResponse> {
    const response = await api.get('/seguimiento/categorias');
    return response.data;
  },

  async getPlantillas(categoria_id?: number): Promise<PlantillasResponse> {
    const params = categoria_id ? `?categoria_id=${categoria_id}` : '';
    const response = await api.get(`/seguimiento/plantillas${params}`);
    return response.data;
  },
};

// =============================================
// OBSERVACIONES — docente
// =============================================

export const observacionService = {

  async listar(filters: ObservacionFiltros = {}): Promise<ObservacionesListResponse> {
    const params = new URLSearchParams();
    if (filters.page)                    params.append('page',                    filters.page.toString());
    if (filters.limit)                   params.append('limit',                   filters.limit.toString());
    if (filters.matricula_id)            params.append('matricula_id',            filters.matricula_id.toString());
    if (filters.docente_id)              params.append('docente_id',              filters.docente_id.toString());
    if (filters.asignacion_docente_id)   params.append('asignacion_docente_id',   filters.asignacion_docente_id.toString());
    if (filters.periodo_academico_id)    params.append('periodo_academico_id',    filters.periodo_academico_id.toString());
    if (filters.categoria_observacion_id)params.append('categoria_observacion_id',filters.categoria_observacion_id.toString());
    if (filters.nivel_relevancia)        params.append('nivel_relevancia',        filters.nivel_relevancia);
    if (filters.visible_para_padre !== undefined)
      params.append('visible_para_padre', filters.visible_para_padre.toString());
    if (filters.fecha_inicio)            params.append('fecha_inicio',            filters.fecha_inicio);
    if (filters.fecha_fin)               params.append('fecha_fin',               filters.fecha_fin);

    const response = await api.get(`/seguimiento/observaciones?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<ObservacionDetalleResponse> {
    const response = await api.get(`/seguimiento/observaciones/${id}`);
    return response.data;
  },

  async getHistorial(id: number): Promise<{ success: boolean; data: { historial: HistorialObservacion[] } }> {
    const response = await api.get(`/seguimiento/observaciones/${id}/historial`);
    return response.data;
  },

  async crear(
    data: CrearObservacionDTO
  ): Promise<{ success: boolean; message: string; data: { observacion: ObservacionPedagogica } }> {
    const response = await api.post('/seguimiento/observaciones', data);
    return response.data;
  },

  async actualizar(
    id: number,
    data: ActualizarObservacionDTO
  ): Promise<{ success: boolean; message: string; data: { observacion: ObservacionPedagogica } }> {
    const response = await api.patch(`/seguimiento/observaciones/${id}`, data);
    return response.data;
  },

  async cambiarVisibilidad(
    id: number,
    data: CambiarVisibilidadDTO
  ): Promise<{ success: boolean; message: string; data: { observacion: ObservacionPedagogica } }> {
    const response = await api.patch(`/seguimiento/observaciones/${id}/visibilidad`, data);
    return response.data;
  },

  async eliminar(
    id: number
  ): Promise<{ success: boolean; message: string; data: { observacion: ObservacionPedagogica } }> {
    const response = await api.delete(`/seguimiento/observaciones/${id}`);
    return response.data;
  },

  async getLineaTiempo(params: {
    matricula_id: number;
    periodo_academico_id?: number;
    categoria_id?: number;
    nivel_relevancia?: string;
    solo_visibles_padre?: boolean;
  }): Promise<LineaTiempoResponse> {
    const query = new URLSearchParams({ matricula_id: params.matricula_id.toString() });
    if (params.periodo_academico_id) query.append('periodo_academico_id', params.periodo_academico_id.toString());
    if (params.categoria_id)         query.append('categoria_id',         params.categoria_id.toString());
    if (params.nivel_relevancia)     query.append('nivel_relevancia',     params.nivel_relevancia);
    if (params.solo_visibles_padre !== undefined)
      query.append('solo_visibles_padre', params.solo_visibles_padre.toString());

    const response = await api.get(`/seguimiento/linea-tiempo?${query}`);
    return response.data;
  },

  async getResumenPorAsignacion(
    asignacion_docente_id: number,
    periodo_academico_id?: number
  ): Promise<ResumenAsignacionResponse> {
    const params = new URLSearchParams({ asignacion_docente_id: asignacion_docente_id.toString() });
    if (periodo_academico_id) params.append('periodo_academico_id', periodo_academico_id.toString());

    const response = await api.get(`/seguimiento/resumen-asignacion?${params}`);
    return response.data;
  },
};

// =============================================
// ACUSE DE RECIBO — padre de familia
// =============================================

export const acuseService = {

  async registrar(
    data: RegistrarAcuseDTO
  ): Promise<{ success: boolean; message: string; data: { acuse: AcuseReciboPadre } }> {
    const response = await api.post('/seguimiento/acuse', data);
    return response.data;
  },

  async getResumenPadre(
    padre_familia_id: number,
    periodo_academico_id?: number
  ) {
    const params = new URLSearchParams({ padre_familia_id: padre_familia_id.toString() });
    if (periodo_academico_id) params.append('periodo_academico_id', periodo_academico_id.toString());

    const response = await api.get(`/seguimiento/padre/resumen?${params}`);
    return response.data;
  },

  async getObservacionesHijo(
    matricula_id: number,
    padre_familia_id: number,
    periodo_academico_id?: number
  ) {
    const params = new URLSearchParams({
      matricula_id:     matricula_id.toString(),
      padre_familia_id: padre_familia_id.toString(),
    });
    if (periodo_academico_id) params.append('periodo_academico_id', periodo_academico_id.toString());

    const response = await api.get(`/seguimiento/padre/observaciones-hijo?${params}`);
    return response.data;
  },
};

export default {
  catalogo:     catalogoService,
  observacion:  observacionService,
  acuse:        acuseService,
};