// services/reservaCupoService.ts
import api from '@/lib/api';
import {
  ValidarEstudianteResponse,
  ConfirmarReservaPayload,
  ConfirmarReservaResponse,
  ReservaCupoData
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
   * Consulta una reserva por código
   */
  async consultarPorCodigo(codigo: string): Promise<ReservaCupoData> {
    const { data } = await api.get(`/reserva-cupo/consultar/${codigo.trim()}`);
    return data.data;
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
    periodo_academico_id?: number;
  }): Promise<void> {
    const query = new URLSearchParams();
    query.set('formato', formato);
    if (params?.search) query.set('search', params.search);
    if (params?.grado_destino_id) query.set('grado_destino_id', params.grado_destino_id.toString());
    if (params?.nivel_destino_id) query.set('nivel_destino_id', params.nivel_destino_id.toString());
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
}

export const reservaCupoService = new ReservaCupoService();
export default reservaCupoService;
