// services/notificacionService.ts
import api from '@/lib/api';
import {
  NotificacionesListResponse,
  NotificacionResponse,
  BandejaResponse,
  EnviarResponse,
  NotificacionFiltros,
  CrearNotificacionDTO,
  ActualizarNotificacionDTO,
  ResumenEnvioCanal,
} from '@/types/notificacionTypes';

// =============================================
// GESTIÓN (secretaria / admin)
// =============================================

export const notificacionService = {

  // GET /api/notificaciones
  async listar(filters: NotificacionFiltros = {}): Promise<NotificacionesListResponse> {
    const params = new URLSearchParams();
    if (filters.page)        params.append('page',        filters.page.toString());
    if (filters.limit)       params.append('limit',       filters.limit.toString());
    if (filters.tipo)        params.append('tipo',        filters.tipo);
    if (filters.estado)      params.append('estado',      filters.estado);
    if (filters.audiencia)   params.append('audiencia',   filters.audiencia);
    if (filters.fecha_inicio)params.append('fecha_inicio',filters.fecha_inicio);
    if (filters.fecha_fin)   params.append('fecha_fin',   filters.fecha_fin);

    const response = await api.get(`/notificaciones?${params}`);
    return response.data;
  },

  // GET /api/notificaciones/:id
  async obtenerPorId(id: number): Promise<NotificacionResponse> {
    const response = await api.get(`/notificaciones/${id}`);
    return response.data;
  },

  // GET /api/notificaciones/:id/resumen
  async resumenEnvios(id: number): Promise<{ success: boolean; data: { resumen: ResumenEnvioCanal[] } }> {
    const response = await api.get(`/notificaciones/${id}/resumen`);
    return response.data;
  },

  // POST /api/notificaciones  (multipart/form-data si hay foto)
  async crear(data: CrearNotificacionDTO): Promise<NotificacionResponse> {
    if (data.foto) {
      const formData = new FormData();
      formData.append('foto', data.foto);
      // Serializar el resto de los campos
      const { foto, ...rest } = data;
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const response = await api.post('/notificaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/notificaciones', data);
    return response.data;
  },

  // POST /api/notificaciones/enviar-ahora  (crea + envía en un paso)
  async crearYEnviar(data: CrearNotificacionDTO): Promise<NotificacionResponse> {
    if (data.foto) {
      const formData = new FormData();
      formData.append('foto', data.foto);
      const { foto, ...rest } = data;
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const response = await api.post('/notificaciones/enviar-ahora', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/notificaciones/enviar-ahora', data);
    return response.data;
  },

  // POST /api/notificaciones/:id/enviar
  async enviar(id: number): Promise<EnviarResponse> {
    const response = await api.post(`/notificaciones/${id}/enviar`);
    return response.data;
  },

  // PUT /api/notificaciones/:id
  async actualizar(id: number, data: ActualizarNotificacionDTO): Promise<NotificacionResponse> {
    const response = await api.put(`/notificaciones/${id}`, data);
    return response.data;
  },

  // DELETE /api/notificaciones/:id
  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
  },
};

// =============================================
// BANDEJA DEL USUARIO (campana 🔔)
// =============================================

export const bandejaService = {

  // GET /api/notificaciones/mis-notificaciones
  async obtener(opciones?: {
    solo_no_leidas?: boolean;
    page?: number;
    limit?: number;
  }): Promise<BandejaResponse> {
    const params = new URLSearchParams();
    if (opciones?.solo_no_leidas) params.append('solo_no_leidas', 'true');
    if (opciones?.page)           params.append('page',  opciones.page.toString());
    if (opciones?.limit)          params.append('limit', opciones.limit.toString());

    const response = await api.get(`/notificaciones/mis-notificaciones?${params}`);
    return response.data;
  },

  // PATCH /api/notificaciones/:id/leer
  async marcarLeido(notificacion_id: number): Promise<{ success: boolean }> {
    const response = await api.patch(`/notificaciones/${notificacion_id}/leer`);
    return response.data;
  },
};

export default {
  notificaciones: notificacionService,
  bandeja:        bandejaService,
};