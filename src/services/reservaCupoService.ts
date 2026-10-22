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
   * Verifica si un hermano ya existe en el sistema por su CI
   */
  async verificarHermano(params: {
    ci: string;
    periodo_academico_id?: number;
  }): Promise<{ existe: boolean; tipo?: string; mensaje?: string; datos?: any }> {
    const { data } = await api.get('/reserva-cupo/verificar-hermano', { params });
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
    turno_destino_id?: number;
    estado?: string;
    periodo_academico_id?: number;
    tipo_reporte?: string;
    titulo_reporte?: string;
  }): Promise<void> {
    const query = new URLSearchParams();
    query.set('formato', formato);
    if (params?.search) query.set('search', params.search);
    if (params?.grado_destino_id) query.set('grado_destino_id', params.grado_destino_id.toString());
    if (params?.nivel_destino_id) query.set('nivel_destino_id', params.nivel_destino_id.toString());
    if (params?.turno_destino_id) query.set('turno_destino_id', params.turno_destino_id.toString());
    if (params?.estado) query.set('estado', params.estado);
    if (params?.periodo_academico_id) query.set('periodo_academico_id', params.periodo_academico_id.toString());
    if (params?.tipo_reporte) query.set('tipo_reporte', params.tipo_reporte);
    if (params?.titulo_reporte) query.set('titulo_reporte', params.titulo_reporte);

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
    estado_entrevista?: string;
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
   * Elimina la reserva de un hermano definitivamente (liberando cupo en caso de duplicados o bajas)
   */
  async eliminarHermanoAdmin(id: number, motivo?: string): Promise<{ message: string; data: ReservaCupoHermanoData }> {
    const { data } = await api.delete(`/reserva-cupo/admin/hermanos/${id}`, {
      data: { motivo },
    });
    return data;
  }

  /**
   * Obtiene todos los hermanos postulantes registrados de la misma familia / tutor
   */
  async obtenerFamiliaHermano(id: number): Promise<{
    hermano: ReservaCupoHermanoData;
    hermanosFamilia: ReservaCupoHermanoData[];
  }> {
    const { data } = await api.get(`/reserva-cupo/admin/hermanos/${id}/familia`);
    return data.data;
  }

  /**
   * Agenda o reprograma la entrevista de un hermano postulante o familia conjunta
   */
  async agendarEntrevistaHermano(id: number, payload: {
    fecha_entrevista: string;
    modalidad_entrevista: 'presencial' | 'virtual';
    lugar_entrevista?: string;
    enlace_entrevista?: string;
    observaciones_entrevista?: string;
    notificar_whatsapp?: boolean;
    hermano_ids?: number[];
  }): Promise<{ success: boolean; message: string; data: ReservaCupoHermanoData; hermanos?: ReservaCupoHermanoData[]; whatsapp?: any }> {
    const { data } = await api.patch(`/reserva-cupo/admin/hermanos/${id}/agendar-entrevista`, payload);
    return data;
  }

  /**
   * Actualiza el estado de la entrevista de un hermano o familia conjunta
   */
  async actualizarEstadoEntrevistaHermano(id: number, payload: {
    estado_entrevista: 'pendiente' | 'programada' | 'realizada' | 'aprobada' | 'no_asistio';
    observaciones_entrevista?: string;
    hermano_ids?: number[];
  }): Promise<{ success: boolean; message: string; data: ReservaCupoHermanoData; hermanos?: ReservaCupoHermanoData[] }> {
    const { data } = await api.patch(`/reserva-cupo/admin/hermanos/${id}/estado-entrevista`, payload);
    return data;
  }

  /**
   * Notifica o reenvía la citación de entrevista al tutor vía WhatsApp institucional
   */
  async notificarEntrevistaHermanoWhatsApp(id: number, telefonoDestino?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const { data } = await api.post(`/reserva-cupo/admin/hermanos/${id}/notificar-entrevista-whatsapp`, { telefonoDestino });
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

  /**
   * Obtiene el balance general y por grado/turno de cupos asegurados para estudiantes regulares
   */
  async obtenerBalanceCuposAsegurados(anioDestino = 2027): Promise<BalanceCuposAseguradosData> {
    const { data } = await api.get('/reserva-cupo/admin/cupos-asegurados', {
      params: { anio_destino: anioDestino }
    });
    return data.data;
  }

  /**
   * Obtiene el listado de estudiantes regulares con cupo asegurado (confirmados o pendientes)
   */
  async obtenerEstudiantesCuposAsegurados(params?: {
    grado_destino_id?: number;
    turno_destino_id?: number;
    estado_confirmacion?: 'todos' | 'confirmados' | 'pendientes' | 'no_continua';
    busqueda?: string;
    limite?: number;
    pagina?: number;
  }): Promise<EstudiantesCuposAseguradosResponse> {
    const { data } = await api.get('/reserva-cupo/admin/cupos-asegurados/estudiantes', {
      params
    });
    return data.data;
  }

  /**
   * Envía confirmación oficial por WhatsApp al tutor de una reserva (texto con link)
   */
  async enviarConfirmacionWhatsApp(codigo: string, telefono?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/reserva-cupo/notificar-whatsapp/${codigo}`, { telefono });
    return data;
  }

  /**
   * Envía el comprobante oficial como documento PDF adjunto vía WhatsApp
   */
  async enviarPDFWhatsApp(codigo: string, telefono?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/reserva-cupo/notificar-whatsapp/${codigo}/documento`, { telefono });
    return data;
  }

  /**
   * Envía WhatsApp desde el panel administrativo
   */
  async enviarWhatsAppAdmin(id: number, payload?: { tipo?: 'regular' | 'hermano'; telefono?: string }): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/reserva-cupo/admin/${id}/enviar-whatsapp`, payload);
    return data;
  }

  /**
   * Envía recordatorio oficial directo por WhatsApp vía Evolution API a un tutor
   */
  async enviarRecordatorioContinuidadWhatsApp(payload: {
    estudiante_id: number;
    tutor_telefono?: string;
    tutor_nombre?: string;
    nombre_completo?: string;
    ci?: string;
    grado_destino_nombre?: string;
    turno_destino_nombre?: string;
    mensaje_personalizado?: string;
    anio_destino?: number;
  }): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/reserva-cupo/admin/recordatorio-continuidad/whatsapp', payload);
    return data;
  }

  /**
   * Envía recordatorios masivos por WhatsApp vía Evolution API
   */
  async enviarRecordatorioContinuidadMasivoWhatsApp(payload: {
    estudiantes: EstudianteCupoAsegurado[];
    anio_destino?: number;
  }): Promise<{ success: boolean; message: string; total_encolados?: number }> {
    const { data } = await api.post('/reserva-cupo/admin/recordatorio-continuidad/whatsapp-masivo', payload);
    return data;
  }

  /**
   * Inicia campaña masiva anti-baneo con cola secuencial, pausas humanas y spintax
   */
  async iniciarCampanaWhatsApp(payload: {
    grado_destino_id?: number | 'todos';
    delay_min_seg?: number;
    delay_max_seg?: number;
    anio_destino?: number;
  }): Promise<{ success: boolean; message: string; id_campana?: string; total_programados?: number }> {
    const { data } = await api.post('/reserva-cupo/admin/recordatorio-continuidad/campana-iniciar', payload);
    return data;
  }

  /**
   * Consulta el estado en tiempo real de la campaña masiva en curso
   */
  async obtenerEstadoCampanaWhatsApp(): Promise<EstadoCampanaWhatsApp> {
    const { data } = await api.get('/reserva-cupo/admin/recordatorio-continuidad/campana-estado');
    return data.data;
  }

  /**
   * Detiene la campaña de envíos masivos en curso
   */
  async detenerCampanaWhatsApp(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/reserva-cupo/admin/recordatorio-continuidad/campana-detener');
    return data;
  }
}

export interface EstadoCampanaWhatsApp {
  activo: boolean;
  detenerSolicitado: boolean;
  id_campana: string | null;
  total: number;
  enviados: number;
  fallidos: number;
  en_cola: number;
  porcentaje: number;
  estudiante_actual: string | null;
  iniciado_at: string | null;
  finalizado_at: string | null;
  ultimo_envio_at: string | null;
  delay_min_seg: number;
  delay_max_seg: number;
}

export interface BalanceCupoGrado {
  grado_destino_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  orden_grado: number;
  total_asegurados: number;
  total_confirmados: number;
  total_no_continua: number;
  total_restantes: number;
  porcentaje_confirmado: number;
  turnos: {
    manana: { asegurados: number; confirmados: number; restantes: number };
    tarde: { asegurados: number; confirmados: number; restantes: number };
  };
}

export interface BalanceCuposAseguradosData {
  anio_origen: number;
  anio_destino: number;
  totales_globales: {
    total_asegurados: number;
    total_confirmados: number;
    total_no_continua: number;
    total_restantes: number;
    porcentaje_confirmado: number;
  };
  resumen?: {
    total_asegurados: number;
    total_confirmados: number;
    total_no_continua: number;
    total_restantes: number;
    porcentaje_confirmado: number;
  };
  grados: BalanceCupoGrado[];
}

export interface EstudianteCupoAsegurado {
  estudiante_id: number;
  codigo_estudiante: string;
  nombre_completo: string;
  ci: string;
  curso_actual_2026: string;
  grado_destino_id: number;
  grado_destino_nombre: string;
  nivel_destino: string;
  turno_destino_id: number;
  turno_destino_nombre: string;
  estado_confirmacion: 'CONFIRMADO' | 'PENDIENTE' | 'NO_CONTINUA';
  codigo_reserva: string | null;
  fecha_reserva: string | null;
  tutor_nombre: string | null;
  tutor_telefono: string | null;
}

export interface EstudiantesCuposAseguradosResponse {
  estudiantes: EstudianteCupoAsegurado[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export const reservaCupoService = new ReservaCupoService();
export default reservaCupoService;
