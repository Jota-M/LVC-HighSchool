// services/pagos.ts - SISTEMA 10 MESES - VERSIÓN FINAL
import api from '../lib/api';
import type {
  Mensualidad,
  CrearCostoMensualidadRequest,
  ActualizarCostoMensualidadRequest,
  GenerarMensualidadesRequest,
  RegistrarPagoMensualidadRequest,
  ActualizarPagoMensualidadRequest,
  AnularPagoRequest,
  RegistrarPagoAnualRequest,
  CostosResponse,
  CostoResponse,
  MensualidadesResponse,
  MensualidadResponse,
  PagosResponse,
  PagoResponse,
  PagosAnualesResponse,
  PagoAnualResponse,
  EstadoPagosEstudiantesResponse,
  IngresosResponse,
  MorososResponse,
  ResumenResponse,
  FiltrosCostoMensualidad,
  FiltrosMensualidad,
  FiltrosPagoMensualidad,
  FiltrosPagoAnual,
  FiltrosEstadoPagos,
  FiltrosIngresos,
  FiltrosMorosos,
  EstadoMensualidad,
  MetodoPago,
  CalculoDescuento,
  RegistrarPagoMultipleRequest,
  PagoMultipleResponse,
  ResumenPendientesResponse,
  MensualidadSeleccionada,
  CalculoDistribucionResponse,
  RegistrarPagoDistribuidoRequest,
  PagoDistribuidoResponse
} from '../types/pagos';

class PagosService {
  // ============== PAGO DISTRIBUIDO ==============
  
  async calcularDistribucion(params: {
    matricula_id: number;
    monto_total: number;
  }): Promise<CalculoDistribucionResponse> {
    const { data } = await api.post('/api/pago-distribuido/calcular', params);
    return data;
  }

  async registrarPagoDistribuido(params: RegistrarPagoDistribuidoRequest): Promise<PagoDistribuidoResponse> {
    const { data } = await api.post('/api/pago-distribuido', params);
    return data;
  }

  validarPagoDistribuido(mensualidades: Mensualidad[]): {
    puede: boolean;
    razon?: string;
  } {
    const pendientes = mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial'
    );

    if (pendientes.length === 0) {
      return { puede: false, razon: 'No hay mensualidades pendientes' };
    }

    return { puede: true };
  }

  calcularSugerenciasMonto(mensualidades: Mensualidad[]): number[] {
    const pendientes = mensualidades
      .filter(m => m.estado === 'pendiente' || m.estado === 'vencido' || m.estado === 'pagado_parcial')
      .sort((a, b) => a.numero_cuota - b.numero_cuota);

    const sugerencias: number[] = [];

    if (pendientes.length > 0) {
      const saldo = parseFloat((pendientes[0].saldo_pendiente ?? pendientes[0].monto_final).toString());
      sugerencias.push(saldo);
    }

    if (pendientes.length >= 2) {
      const saldo1 = parseFloat((pendientes[0].saldo_pendiente ?? pendientes[0].monto_final).toString());
      const saldo2 = parseFloat((pendientes[1].saldo_pendiente ?? pendientes[1].monto_final).toString());
      sugerencias.push(saldo1 + saldo2);
    }

    if (pendientes.length >= 3) {
      const saldo1 = parseFloat((pendientes[0].saldo_pendiente ?? pendientes[0].monto_final).toString());
      const saldo2 = parseFloat((pendientes[1].saldo_pendiente ?? pendientes[1].monto_final).toString());
      const saldo3 = parseFloat((pendientes[2].saldo_pendiente ?? pendientes[2].monto_final).toString());
      sugerencias.push(saldo1 + saldo2 + saldo3);
    }

    const total = pendientes.reduce((sum, m) => {
      return sum + parseFloat((m.saldo_pendiente ?? m.monto_final).toString());
    }, 0);
    if (!sugerencias.includes(total)) {
      sugerencias.push(total);
    }

    return sugerencias;
  }

  // ============== PAGO MÚLTIPLE ==============
  
  async obtenerResumenPendientes(matriculaIds: number[]): Promise<ResumenPendientesResponse> {
    const { data } = await api.get<ResumenPendientesResponse>('/api/pago-multiple/resumen', {
      params: { matricula_ids: matriculaIds.join(',') }
    });
    return data;
  }

  async registrarPagoMultiple(request: RegistrarPagoMultipleRequest): Promise<PagoMultipleResponse> {
    const { data } = await api.post<PagoMultipleResponse>('/api/pago-multiple', request);
    return data;
  }

  calcularTotalSeleccionadas(mensualidades: Array<{ saldo_pendiente: number }>): number {
    return mensualidades.reduce((sum, m) => sum + m.saldo_pendiente, 0);
  }

  validarSeleccionMultiple(seleccionadas: MensualidadSeleccionada[]): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (seleccionadas.length === 0) {
      errores.push('Debe seleccionar al menos una mensualidad');
    }

    seleccionadas.forEach((item, index) => {
      if (!item.mensualidad_id) {
        errores.push(`Falta mensualidad_id en posición ${index + 1}`);
      }
      if (!item.monto_pagado || item.monto_pagado <= 0) {
        errores.push(`Monto inválido en posición ${index + 1}`);
      }
    });

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // ============== COSTO MENSUALIDAD ==============

  async listarCostos(filtros?: FiltrosCostoMensualidad): Promise<CostosResponse> {
    const { data } = await api.get<CostosResponse>('/api/costo-mensualidad', { params: filtros });
    return data;
  }

  async obtenerCostoPorId(id: number): Promise<CostoResponse> {
    const { data } = await api.get<CostoResponse>(`/api/costo-mensualidad/${id}`);
    return data;
  }

  async crearCosto(request: CrearCostoMensualidadRequest): Promise<CostoResponse> {
    const { data } = await api.post<CostoResponse>('/api/costo-mensualidad', request);
    return data;
  }

  async actualizarCosto(id: number, request: ActualizarCostoMensualidadRequest): Promise<CostoResponse> {
    const { data } = await api.put<CostoResponse>(`/api/costo-mensualidad/${id}`, request);
    return data;
  }

  async eliminarCosto(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/costo-mensualidad/${id}`);
    return data;
  }

  // ============== MENSUALIDAD ==============

  async listarMensualidades(filtros?: FiltrosMensualidad): Promise<MensualidadesResponse> {
    const { data } = await api.get<MensualidadesResponse>('/api/mensualidad', { params: filtros });
    return data;
  }

  async obtenerMensualidadPorId(id: number): Promise<MensualidadResponse> {
    const { data } = await api.get<MensualidadResponse>(`/api/mensualidad/${id}`);
    return data;
  }

  async obtenerMensualidadesPorMatricula(matriculaId: number): Promise<MensualidadesResponse> {
    const { data } = await api.get<MensualidadesResponse>(`/api/mensualidad/matricula/${matriculaId}`);
    return data;
  }

  async generarMensualidades(request: GenerarMensualidadesRequest): Promise<MensualidadesResponse> {
    const { data } = await api.post<MensualidadesResponse>('/api/mensualidad/generar', request);
    return data;
  }

  async anularMensualidad(id: number, motivo: string): Promise<MensualidadResponse> {
    const { data } = await api.patch<MensualidadResponse>(`/api/mensualidad/${id}/anular`, { motivo });
    return data;
  }

  async listarMensualidadesVencidas(periodoAcademicoId?: number): Promise<MensualidadesResponse> {
    const params = periodoAcademicoId ? { periodo_academico_id: periodoAcademicoId } : undefined;
    const { data } = await api.get<MensualidadesResponse>('/api/mensualidad/vencidas', { params });
    return data;
  }

  // ============== PAGO MENSUALIDAD ==============

  async listarPagos(filtros?: FiltrosPagoMensualidad): Promise<PagosResponse> {
    const { data } = await api.get<PagosResponse>('/api/pago-mensualidad', { params: filtros });
    return data;
  }

  async obtenerPagoPorId(id: number): Promise<PagoResponse> {
    const { data } = await api.get<PagoResponse>(`/api/pago-mensualidad/${id}`);
    return data;
  }

  async registrarPago(request: RegistrarPagoMensualidadRequest): Promise<PagoResponse> {
    const { data } = await api.post<PagoResponse>('/api/pago-mensualidad', request);
    return data;
  }

  async actualizarPago(id: number, request: ActualizarPagoMensualidadRequest): Promise<PagoResponse> {
    const { data } = await api.put<PagoResponse>(`/api/pago-mensualidad/${id}`, request);
    return data;
  }

  async anularPago(id: number, request: AnularPagoRequest): Promise<PagoResponse> {
    const { data } = await api.patch<PagoResponse>(`/api/pago-mensualidad/${id}/anular`, request);
    return data;
  }

  // ============== PAGO ANUAL COMPLETO ==============

  async listarPagosAnuales(filtros?: FiltrosPagoAnual): Promise<PagosAnualesResponse> {
    const { data } = await api.get<PagosAnualesResponse>('/api/pago-anual', { params: filtros });
    return data;
  }

  async obtenerPagoAnualPorId(id: number): Promise<PagoAnualResponse> {
    const { data } = await api.get<PagoAnualResponse>(`/api/pago-anual/${id}`);
    return data;
  }

  async registrarPagoAnual(request: RegistrarPagoAnualRequest): Promise<PagoAnualResponse> {
    const { data } = await api.post<PagoAnualResponse>('/api/pago-anual', request);
    return data;
  }

  // ============== REPORTES ==============

  async obtenerEstadoPagosEstudiantes(filtros?: FiltrosEstadoPagos): Promise<EstadoPagosEstudiantesResponse> {
    const { data } = await api.get<EstadoPagosEstudiantesResponse>('/api/reportes-pagos/estado-estudiantes', {
      params: filtros
    });
    return data;
  }

  async obtenerIngresos(filtros?: FiltrosIngresos): Promise<IngresosResponse> {
    const { data} = await api.get<IngresosResponse>('/api/reportes-pagos/ingresos', { params: filtros });
    return data;
  }

  async obtenerMorosos(filtros?: FiltrosMorosos): Promise<MorososResponse> {
    const { data } = await api.get<MorososResponse>('/api/reportes-pagos/morosos', { params: filtros });
    return data;
  }

  async obtenerResumen(periodoAcademicoId: number): Promise<ResumenResponse> {
    const { data } = await api.get<ResumenResponse>('/api/reportes-pagos/resumen', {
      params: { periodo_academico_id: periodoAcademicoId }
    });
    return data;
  }

  // ============== UTILIDADES ==============

  /**
   * 🔧 ACTUALIZADO: Calcula el descuento para pago anual completo (10 meses)
   */
  calcularDescuentoAnual(params: {
    montoBase: number;
    porcentajeBeca?: number;
  }): CalculoDescuento {
    const { montoBase, porcentajeBeca = 0 } = params;
    const cantidadMeses = 10; // 🔧 10 meses
    const porcentajeDescuento = 10.0; // 🔧 10% descuento

    const montoSinDescuento = montoBase * cantidadMeses;
    const montoDescuentoAnual = montoSinDescuento * (porcentajeDescuento / 100);
    const montoConDescuento = montoSinDescuento - montoDescuentoAnual;
    const montoDescuentoBeca = montoConDescuento * (porcentajeBeca / 100);
    const montoFinal = montoConDescuento - montoDescuentoBeca;

    return {
      monto_base: montoBase,
      cantidad_meses: cantidadMeses,
      porcentaje_descuento: porcentajeDescuento,
      porcentaje_beca: porcentajeBeca,
      monto_sin_descuento: montoSinDescuento,
      monto_descuento_anual: montoDescuentoAnual,
      monto_descuento_beca: montoDescuentoBeca,
      monto_final: montoFinal
    };
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(monto);
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

  getEstadoMensualidadLabel(estado: EstadoMensualidad): string {
    const labels: Record<EstadoMensualidad, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      pagado_parcial: 'Pago Parcial',
      vencido: 'Vencido',
      cancelado: 'Cancelado',
      anulado: 'Anulado'
    };
    return labels[estado];
  }

  getEstadoMensualidadColor(estado: EstadoMensualidad): string {
    const colors: Record<EstadoMensualidad, string> = {
      pendiente: 'text-yellow-600 bg-yellow-50',
      pagado: 'text-green-600 bg-green-50',
      pagado_parcial: 'text-blue-600 bg-blue-50',
      vencido: 'text-red-600 bg-red-50',
      cancelado: 'text-gray-600 bg-gray-50',
      anulado: 'text-gray-600 bg-gray-50'
    };
    return colors[estado];
  }

  calcularDiasMora(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = hoy.getTime() - vencimiento.getTime();
    const dias = Math.ceil(diff / (1000 * 3600 * 24));
    return dias > 0 ? dias : 0;
  }

  estaVencida(mensualidad: Mensualidad): boolean {
    if (mensualidad.estado === 'pagado' || mensualidad.estado === 'anulado') {
      return false;
    }
    const hoy = new Date();
    const vencimiento = new Date(mensualidad.fecha_vencimiento);
    return hoy > vencimiento;
  }

  calcularPorcentajePagado(mensualidades: Mensualidad[]): number {
    if (mensualidades.length === 0) return 0;
    const pagadas = mensualidades.filter(m => m.estado === 'pagado').length;
    return (pagadas / mensualidades.length) * 100;
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

  /**
   * 🔧 ACTUALIZADO: Valida si se puede registrar pago anual (10 meses)
   */
  puedeRegistrarPagoAnual(mensualidades: Mensualidad[]): {
    puede: boolean;
    razon?: string;
  } {
    if (mensualidades.length === 0) {
      return { puede: false, razon: 'No hay mensualidades generadas' };
    }

    const pagadas = mensualidades.filter(m => m.estado === 'pagado').length;
    if (pagadas > 0) {
      return { puede: false, razon: 'Ya existen mensualidades pagadas individualmente' };
    }

    const pendientes = mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido'
    );

    if (pendientes.length < 10) {
      return { 
        puede: false, 
        razon: `Solo hay ${pendientes.length} de 10 mensualidades pendientes`
      };
    }

    return { puede: true };
  }

  /**
   * 🔧 NUEVA: Validar cantidad de mensualidades
   */
  validarCantidadMensualidades(mensualidades: Mensualidad[]): {
    valido: boolean;
    cantidad_actual: number;
    cantidad_esperada: number;
    mensaje?: string;
  } {
    const cantidadActual = mensualidades.filter(m => m.estado !== 'anulado').length;
    const cantidadEsperada = 10;

    return {
      valido: cantidadActual === cantidadEsperada,
      cantidad_actual: cantidadActual,
      cantidad_esperada: cantidadEsperada,
      mensaje: cantidadActual !== cantidadEsperada 
        ? `Se esperaban ${cantidadEsperada} mensualidades pero hay ${cantidadActual}`
        : undefined
    };
  }

  /**
   * 🔧 NUEVA: Información del sistema
   */
  obtenerInfoSistema() {
    return {
      cantidad_meses: 10,
      descuento_pago_completo: 10.0,
      meses_gratis: 1,
      primer_mes: 'febrero',
      ultimo_mes: 'noviembre',
      descripcion: 'Sistema de 10 mensualidades',
      beneficio: 'Pagas 9 meses, obtienes 1 mes gratis'
    };
  }

  /**
   * 🔧 NUEVA: Obtener meses académicos válidos
   */
  obtenerMesesAcademicos(): readonly string[] {
    return [
      'febrero', 'marzo', 'abril', 'mayo', 'junio', 
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'
    ];
  }

  /**
   * 🔧 NUEVA: Validar que un mes sea válido
   */
  esMesValido(mes: string): boolean {
    return this.obtenerMesesAcademicos().includes(mes.toLowerCase());
  }

  /**
   * 🔧 NUEVA: Obtener número de mes (1-10)
   */
  obtenerNumeroMes(mes: string): number | null {
    const meses = this.obtenerMesesAcademicos();
    const index = meses.indexOf(mes.toLowerCase());
    return index !== -1 ? index + 1 : null;
  }

  /**
   * 🔧 NUEVA: Obtener mes por número (1-10)
   */
  obtenerMesPorNumero(numero: number): string | null {
    const meses = this.obtenerMesesAcademicos();
    return numero >= 1 && numero <= 10 ? meses[numero - 1] : null;
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
}

export default new PagosService();