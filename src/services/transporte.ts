// services/transporte.ts - SERVICIO DE TRANSPORTE ESCOLAR
import api from '../lib/api';
import type {
  RutaTransporte,
  ParadaRuta,
  AsignacionTransporte,
  PagoTransporte,
  CrearRutaRequest,
  ActualizarRutaRequest,
  CrearParadaRequest,
  ActualizarParadaRequest,
  ReordenarParadasRequest,
  CrearAsignacionRequest,
  ActualizarAsignacionRequest,
  CambiarEstadoAsignacionRequest,
  GenerarCuotasRequest,
  RegistrarPagoTransporteRequest,
  AnularPagoTransporteRequest,
  CalcularRecargosRequest,
  RutasResponse,
  RutaResponse,
  ParadasResponse,
  ParadaResponse,
  AsignacionesResponse,
  AsignacionResponse,
  PagosTransporteResponse,
  PagoTransporteResponse,
  EstadisticasRutaResponse,
  EstadisticasAsignacionResponse,
  EstadoCuentaResponse,
  EstudiantesRutaResponse,
  CalcularRecargosResponse,
  CentralizarPagoResponse,
  FiltrosRuta,
  FiltrosAsignacion,
  FiltrosPagoTransporte,
  EstadoAsignacion,
  EstadoPagoTransporte,
  MetodoPago
} from '../types/transporte';

class TransporteService {
  // ============== GESTIÓN DE RUTAS ==============

  async listarRutas(filtros?: FiltrosRuta): Promise<RutasResponse> {
    const { data } = await api.get<RutasResponse>('/api/ruta-transporte', { params: filtros });
    return data;
  }

  async obtenerRutaPorId(id: number): Promise<RutaResponse> {
    const { data } = await api.get<RutaResponse>(`/api/ruta-transporte/${id}`);
    return data;
  }

  async crearRuta(request: CrearRutaRequest): Promise<RutaResponse> {
    const { data } = await api.post<RutaResponse>('/api/ruta-transporte', request);
    return data;
  }

  async actualizarRuta(id: number, request: ActualizarRutaRequest): Promise<RutaResponse> {
    const { data } = await api.put<RutaResponse>(`/api/ruta-transporte/${id}`, request);
    return data;
  }

  async eliminarRuta(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/ruta-transporte/${id}`);
    return data;
  }

  async obtenerEstadisticasRutas(): Promise<EstadisticasRutaResponse> {
    const { data } = await api.get<EstadisticasRutaResponse>('/api/ruta-transporte/estadisticas');
    return data;
  }

  // ============== GESTIÓN DE PARADAS ==============

  async listarParadas(rutaId: number): Promise<ParadasResponse> {
    const { data } = await api.get<ParadasResponse>(`/api/ruta-transporte/${rutaId}/paradas`);
    return data;
  }

  async crearParada(rutaId: number, request: CrearParadaRequest): Promise<ParadaResponse> {
    const { data } = await api.post<ParadaResponse>(`/api/ruta-transporte/${rutaId}/paradas`, request);
    return data;
  }

  async actualizarParada(
    rutaId: number,
    paradaId: number,
    request: ActualizarParadaRequest
  ): Promise<ParadaResponse> {
    const { data } = await api.put<ParadaResponse>(
      `/api/ruta-transporte/${rutaId}/paradas/${paradaId}`,
      request
    );
    return data;
  }

  async eliminarParada(rutaId: number, paradaId: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/ruta-transporte/${rutaId}/paradas/${paradaId}`);
    return data;
  }

  async reordenarParadas(rutaId: number, request: ReordenarParadasRequest): Promise<{ success: boolean; message: string }> {
    const { data } = await api.put(`/api/ruta-transporte/${rutaId}/paradas/reordenar`, request);
    return data;
  }

  // ============== GESTIÓN DE ASIGNACIONES ==============

  async listarAsignaciones(filtros?: FiltrosAsignacion): Promise<AsignacionesResponse> {
    const { data } = await api.get<AsignacionesResponse>('/api/asignacion-transporte', { params: filtros });
    return data;
  }

  async obtenerAsignacionPorId(id: number): Promise<AsignacionResponse> {
    const { data } = await api.get<AsignacionResponse>(`/api/asignacion-transporte/${id}`);
    return data;
  }

  async crearAsignacion(request: CrearAsignacionRequest): Promise<AsignacionResponse> {
    const { data } = await api.post<AsignacionResponse>('/api/asignacion-transporte', request);
    return data;
  }

  async actualizarAsignacion(id: number, request: ActualizarAsignacionRequest): Promise<AsignacionResponse> {
    const { data } = await api.put<AsignacionResponse>(`/api/asignacion-transporte/${id}`, request);
    return data;
  }

  async cambiarEstadoAsignacion(
    id: number,
    request: CambiarEstadoAsignacionRequest
  ): Promise<AsignacionResponse> {
    const { data } = await api.patch<AsignacionResponse>(`/api/asignacion-transporte/${id}/estado`, request);
    return data;
  }

  async eliminarAsignacion(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/asignacion-transporte/${id}`);
    return data;
  }

  async listarEstudiantesPorRuta(
    rutaId: number,
    periodoAcademicoId: number
  ): Promise<EstudiantesRutaResponse> {
    const { data } = await api.get<EstudiantesRutaResponse>(
      `/api/asignacion-transporte/ruta/${rutaId}`,
      { params: { periodo_academico_id: periodoAcademicoId } }
    );
    return data;
  }

  async obtenerEstadisticasAsignaciones(periodoAcademicoId: number): Promise<EstadisticasAsignacionResponse> {
    const { data } = await api.get<EstadisticasAsignacionResponse>('/api/asignacion-transporte/estadisticas', {
      params: { periodo_academico_id: periodoAcademicoId }
    });
    return data;
  }

  async generarCuotas(asignacionId: number, request?: GenerarCuotasRequest): Promise<PagosTransporteResponse> {
    const { data } = await api.post<PagosTransporteResponse>(
      `/api/asignacion-transporte/${asignacionId}/generar-cuotas`,
      request || {}
    );
    return data;
  }

  // ============== GESTIÓN DE PAGOS ==============

  async listarPagosTransporte(filtros?: FiltrosPagoTransporte): Promise<PagosTransporteResponse> {
    const { data } = await api.get<PagosTransporteResponse>('/api/pago-transporte', { params: filtros });
    return data;
  }

  async obtenerPagoTransportePorId(id: number): Promise<PagoTransporteResponse> {
    const { data } = await api.get<PagoTransporteResponse>(`/api/pago-transporte/${id}`);
    return data;
  }

  async obtenerPagoTransportePorCodigo(codigo: string): Promise<PagoTransporteResponse> {
    const { data } = await api.get<PagoTransporteResponse>(`/api/pago-transporte/codigo/${codigo}`);
    return data;
  }

  async registrarPagoTransporte(
    id: number,
    request: RegistrarPagoTransporteRequest,
    comprobante?: File
  ): Promise<PagoTransporteResponse> {
    const formData = new FormData();
    formData.append('monto_pagado', request.monto_pagado.toString());
    formData.append('metodo_pago', request.metodo_pago);
    
    if (request.numero_comprobante) {
      formData.append('numero_comprobante', request.numero_comprobante);
    }
    if (request.observaciones) {
      formData.append('observaciones', request.observaciones);
    }
    if (comprobante) {
      formData.append('comprobante', comprobante);
    }

    const { data } = await api.post<PagoTransporteResponse>(
      `/api/pago-transporte/${id}/registrar`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return data;
  }

  async anularPagoTransporte(id: number, request: AnularPagoTransporteRequest): Promise<PagoTransporteResponse> {
    const { data } = await api.patch<PagoTransporteResponse>(`/api/pago-transporte/${id}/anular`, request);
    return data;
  }

  async obtenerEstadoCuenta(
    estudianteId: number,
    periodoAcademicoId?: number
  ): Promise<EstadoCuentaResponse> {
    const { data } = await api.get<EstadoCuentaResponse>(
      `/api/pago-transporte/estudiante/${estudianteId}/estado-cuenta`,
      { params: periodoAcademicoId ? { periodo_academico_id: periodoAcademicoId } : undefined }
    );
    return data;
  }

  async calcularRecargos(request?: CalcularRecargosRequest): Promise<CalcularRecargosResponse> {
    const { data } = await api.post<CalcularRecargosResponse>(
      '/api/pago-transporte/calcular-recargos',
      request || {}
    );
    return data;
  }

  async centralizarPago(pagoId: number): Promise<CentralizarPagoResponse> {
    const { data } = await api.post<CentralizarPagoResponse>(`/api/pago-transporte/${pagoId}/centralizar`);
    return data;
  }

  // ============== UTILIDADES ==============

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(monto);
  }

  getEstadoAsignacionLabel(estado: EstadoAsignacion): string {
    const labels: Record<EstadoAsignacion, string> = {
      activo: 'Activo',
      suspendido: 'Suspendido',
      cancelado: 'Cancelado',
      finalizado: 'Finalizado'
    };
    return labels[estado];
  }

  getEstadoAsignacionColor(estado: EstadoAsignacion): string {
    const colors: Record<EstadoAsignacion, string> = {
      activo: 'text-green-600 bg-green-50',
      suspendido: 'text-yellow-600 bg-yellow-50',
      cancelado: 'text-red-600 bg-red-50',
      finalizado: 'text-gray-600 bg-gray-50'
    };
    return colors[estado];
  }

  getEstadoPagoTransporteLabel(estado: EstadoPagoTransporte): string {
    const labels: Record<EstadoPagoTransporte, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      pagado_parcial: 'Pago Parcial',
      vencido: 'Vencido',
      anulado: 'Anulado'
    };
    return labels[estado];
  }

  getEstadoPagoTransporteColor(estado: EstadoPagoTransporte): string {
    const colors: Record<EstadoPagoTransporte, string> = {
      pendiente: 'text-yellow-600 bg-yellow-50',
      pagado: 'text-green-600 bg-green-50',
      pagado_parcial: 'text-blue-600 bg-blue-50',
      vencido: 'text-red-600 bg-red-50',
      anulado: 'text-gray-600 bg-gray-50'
    };
    return colors[estado];
  }

  getMetodoPagoLabel(metodo: MetodoPago): string {
    const labels: Record<MetodoPago, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia Bancaria',
      qr: 'QR',
      tarjeta: 'Tarjeta'
    };
    return labels[metodo];
  }

  calcularDiasMora(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = hoy.getTime() - vencimiento.getTime();
    const dias = Math.ceil(diff / (1000 * 3600 * 24));
    return dias > 0 ? dias : 0;
  }

  estaVencido(pago: PagoTransporte): boolean {
    if (pago.estado === 'pagado' || pago.estado === 'anulado') {
      return false;
    }
    const hoy = new Date();
    const vencimiento = new Date(pago.fecha_vencimiento);
    return hoy > vencimiento;
  }

  calcularPorcentajeOcupacion(cuposOcupados: number, capacidadMaxima: number): number {
    if (capacidadMaxima === 0) return 0;
    return (cuposOcupados / capacidadMaxima) * 100;
  }

  getMesNombre(mes: string): string {
    const meses: Record<string, string> = {
      febrero: 'Febrero',
      marzo: 'Marzo',
      abril: 'Abril',
      mayo: 'Mayo',
      junio: 'Junio',
      julio: 'Julio',
      agosto: 'Agosto',
      septiembre: 'Septiembre',
      octubre: 'Octubre',
      noviembre: 'Noviembre'
    };
    return meses[mes.toLowerCase()] || mes;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearHora(hora?: string): string {
    if (!hora) return '-';
    return hora;
  }

  obtenerNombreCompleto(nombres: string, apellidoPaterno?: string, apellidoMaterno?: string): string {
    const partes = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean);
    return partes.join(' ');
  }

  calcularCuposDisponibles(capacidadMaxima: number, cuposOcupados: number): number {
    return Math.max(0, capacidadMaxima - cuposOcupados);
  }

  validarCapacidadRuta(ruta: RutaTransporte): {
    tieneEspacio: boolean;
    mensaje?: string;
  } {
    const disponibles = this.calcularCuposDisponibles(ruta.capacidad_maxima, ruta.cupos_ocupados);
    
    if (disponibles <= 0) {
      return {
        tieneEspacio: false,
        mensaje: 'La ruta no tiene cupos disponibles'
      };
    }

    if (disponibles <= 3) {
      return {
        tieneEspacio: true,
        mensaje: `Solo quedan ${disponibles} cupo(s) disponible(s)`
      };
    }

    return { tieneEspacio: true };
  }
}

export default new TransporteService();