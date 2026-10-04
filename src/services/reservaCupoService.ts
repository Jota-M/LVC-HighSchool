// services/reservaCupoService.ts
import api from '@/lib/api';
import {
  ValidarEstudianteResponse,
  ConfirmarReservaPayload,
  ConfirmarReservaResponse,
  ReservaCupoData,
  ReservaCupoHermanoData,
  DisponibilidadHermanoResponse
} from '@/types/reservaCupoTypes';

class ReservaCupoService {
  /**
   * Valida un estudiante regular ingresando ÚNICAMENTE su CI
   */
  async validarEstudiantePorCI(ci: string): Promise<ValidarEstudianteResponse['data']> {
    const { data } = await api.post('/reserva-cupo/validar-estudiante', {
      ci: ci.trim()
    });
    return data.data;
  }

  /**
   * Confirma la reserva de cupo para 1 o más estudiantes
   */
  async confirmarReserva(payload: ConfirmarReservaPayload): Promise<ConfirmarReservaResponse['data']> {
    const { data } = await api.post('/reserva-cupo/confirmar', payload);
    return data.data;
  }

  /**
   * Obtiene la lista pública de grados disponibles (ordenados por nivel)
   */
  async obtenerGradosDisponibles(): Promise<Array<{ id: number; nombre: string; nivel_nombre?: string }>> {
    try {
      const { data } = await api.get('/public/academicos/grados');
      return data.data?.grados || data.data || [];
    } catch (e) {
      console.error('Error al obtener grados públicos:', e);
      return [];
    }
  }

  /**
   * Consulta la disponibilidad inmediata o puesto en lista de espera para un hermano nuevo
   */
  async consultarDisponibilidadHermano(params: {
    grado_id: number;
    turno_id: number;
    periodo_id?: number;
  }): Promise<DisponibilidadHermanoResponse> {
    const { data } = await api.get('/reserva-cupo/disponibilidad-hermano', { params });
    return data.data;
  }

  /**
   * Consulta una reserva por código (sea regular o hermano)
   */
  async consultarPorCodigo(codigo: string): Promise<ReservaCupoData | ReservaCupoHermanoData> {
    const { data } = await api.get(`/reserva-cupo/consultar/${codigo.trim()}`);
    return data.data;
  }

  /**
   * Solicita la anulación de una reserva (padre/tutor mediante el CI del estudiante)
   */
  async solicitarAnulacion(payload: {
    codigo: string;
    motivo: string;
    estudiante_ci?: string;
    ci?: string;
    tutor_ci?: string;
  }): Promise<{ message: string; data: ReservaCupoData }> {
    const { data } = await api.post('/reserva-cupo/solicitar-anulacion', payload);
    return data;
  }

  /**
   * Anula definitivamente una reserva (administrador)
   */
  async anularReservaAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoData }> {
    const { data } = await api.post(`/reserva-cupo/admin/${id}/anular`, { motivo });
    return data;
  }

  /**
   * Reactiva/restituye una reserva anulada o no continuada (administrador)
   */
  async reactivarReservaAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoData }> {
    const { data } = await api.post(`/reserva-cupo/admin/${id}/reactivar`, { motivo });
    return data;
  }

  /**
   * Retorna la URL para previsualizar o descargar el PDF oficial
   */
  getReciboPDFUrl(codigo: string, preview = true): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.uepclavozdecristo.site';
    return `${baseUrl}/api/reserva-cupo/recibo/${codigo}/pdf?preview=${preview}`;
  }

  /**
   * Descarga el PDF oficial del recibo
   */
  async descargarPDF(codigo: string): Promise<void> {
    const url = this.getReciboPDFUrl(codigo, false);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Recibo_Reserva_${codigo}.pdf`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Lista reservas de cupo paginadas para el dashboard
   */
  async listarAdmin(params?: {
    search?: string;
    grado_destino_id?: number;
    nivel_destino_id?: number;
    turno_destino_id?: number;
    estado?: string;
    periodo_academico_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get('/reserva-cupo/admin/listado', { params });
    return data.data;
  }

  /**
   * Obtiene estadísticas cuantitativas de reservas
   */
  async obtenerEstadisticas(periodo_academico_id?: number) {
    const { data } = await api.get('/reserva-cupo/admin/estadisticas', {
      params: { periodo_academico_id }
    });
    return data.data;
  }

  /**
   * Exporta reporte de reservas en formato PDF o Excel
   */
  async exportarReporte(formato: 'excel' | 'pdf', params?: {
    search?: string;
    grado_destino_id?: number;
    nivel_destino_id?: number;
    estado?: string;
    periodo_academico_id?: number;
  }): Promise<void> {
    const query = new URLSearchParams();
    query.set('formato', formato);
    if (params?.search) query.set('search', params.search);
    if (params?.grado_destino_id) query.set('grado_destino_id', params.grado_destino_id.toString());
    if (params?.nivel_destino_id) query.set('nivel_destino_id', params.nivel_destino_id.toString());
    if (params?.estado) query.set('estado', params.estado);
    if (params?.periodo_academico_id) query.set('periodo_academico_id', params.periodo_academico_id.toString());

    const response = await api.get(`/reserva-cupo/admin/exportar?${query.toString()}`, {
      responseType: 'blob'
    });

    const mime = formato === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `Reporte_Reservas_Cupos_2027_${new Date().toISOString().slice(0, 10)}.${ext}`;

    const blob = new Blob([response.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Lista hermanos registrados (panel administrativo)
   */
  async listarHermanosAdmin(params?: {
    search?: string;
    grado_solicitado_id?: number;
    turno_solicitado_id?: number;
    estado?: string;
    periodo_academico_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get('/reserva-cupo/admin/hermanos', { params });
    return data.data;
  }

  /**
   * Promueve un hermano de lista de espera a cupo confirmado (administrador)
   */
  async promoverHermanoAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoHermanoData }> {
    const { data } = await api.post(`/reserva-cupo/admin/hermanos/${id}/promover`, { motivo });
    return data;
  }

  /**
   * Anula la reserva de un hermano definitivamente (administrador)
   */
  async anularHermanoAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoHermanoData }> {
    const { data } = await api.post(`/reserva-cupo/admin/hermanos/${id}/anular`, { motivo });
    return data;
  }

  /**
   * Reactiva la reserva de un hermano anulada (administrador)
   */
  async reactivarHermanoAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoHermanoData }> {
    const { data } = await api.post(`/reserva-cupo/admin/hermanos/${id}/reactivar`, { motivo });
    return data;
  }

  /**
   * Descarga el reporte oficial de hermanos en PDF o Excel
   */
  async exportarReporteHermanos(formato: 'pdf' | 'excel', params?: {
    search?: string;
    grado_solicitado_id?: number;
    turno_solicitado_id?: number;
    estado?: string;
    periodo_academico_id?: number;
  }): Promise<void> {
    const query = new URLSearchParams();
    query.set('formato', formato);
    if (params?.search) query.set('search', params.search);
    if (params?.grado_solicitado_id) query.set('grado_solicitado_id', params.grado_solicitado_id.toString());
    if (params?.turno_solicitado_id) query.set('turno_solicitado_id', params.turno_solicitado_id.toString());
    if (params?.estado) query.set('estado', params.estado);
    if (params?.periodo_academico_id) query.set('periodo_academico_id', params.periodo_academico_id.toString());

    const response = await api.get(`/reserva-cupo/admin/hermanos/exportar?${query.toString()}`, {
      responseType: 'blob'
    });

    const mime = formato === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `Reporte_Hermanos_Postulantes_2027_${new Date().toISOString().slice(0, 10)}.${ext}`;

    const blob = new Blob([response.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reservaCupoService = new ReservaCupoService();
export default reservaCupoService;
