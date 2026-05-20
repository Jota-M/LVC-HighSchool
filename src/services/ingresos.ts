// services/ingresos.ts - SERVICIO DE INGRESOS
import api from '../lib/api';
import type {
  TipoIngreso,
  Ingreso,
  CrearTipoIngresoRequest,
  ActualizarTipoIngresoRequest,
  CrearIngresoRequest,
  AnularIngresoRequest,
  TiposIngresoResponse,
  TipoIngresoResponse,
  IngresosResponse,
  IngresoResponse,
  ResumenCategoriasResponse,
  ResumenMetodosPagoResponse,
  IngresosDiariosResponse,
  EstadisticasResponse,
  FiltrosTipoIngreso,
  FiltrosIngreso,
  FiltrosResumen,
  MetodoPago,
  EstadoIngreso,
  CategoriaIngreso,
} from '../types/ingresos';

class IngresosService {
  // ============== GESTIÓN DE TIPOS DE INGRESO ==============

  async listarTipos(filtros?: FiltrosTipoIngreso): Promise<TiposIngresoResponse> {
    const { data } = await api.get<TiposIngresoResponse>('/api/ingreso/tipos', { params: filtros });
    return data;
  }

  async obtenerTipoPorId(id: number): Promise<TipoIngresoResponse> {
    const { data } = await api.get<TipoIngresoResponse>(`/api/ingreso/tipos/${id}`);
    return data;
  }

  async crearTipo(request: CrearTipoIngresoRequest): Promise<TipoIngresoResponse> {
    const { data } = await api.post<TipoIngresoResponse>('/api/ingreso/tipos', request);
    return data;
  }

  async actualizarTipo(id: number, request: ActualizarTipoIngresoRequest): Promise<TipoIngresoResponse> {
    const { data } = await api.put<TipoIngresoResponse>(`/api/ingreso/tipos/${id}`, request);
    return data;
  }

  // ============== GESTIÓN DE INGRESOS ==============

  async listarIngresos(filtros?: FiltrosIngreso): Promise<IngresosResponse> {
    const { data } = await api.get<IngresosResponse>('/api/ingreso', { params: filtros });
    return data;
  }

  async obtenerIngresoPorId(id: number): Promise<IngresoResponse> {
    const { data } = await api.get<IngresoResponse>(`/api/ingreso/${id}`);
    return data;
  }

  async obtenerIngresoPorCodigo(codigo: string): Promise<IngresoResponse> {
    const { data } = await api.get<IngresoResponse>(`/api/ingreso/codigo/${codigo}`);
    return data;
  }

  async crearIngreso(request: CrearIngresoRequest, comprobante?: File): Promise<IngresoResponse> {
    const formData = new FormData();
    
    // Agregar campos del request
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregar comprobante si existe
    if (comprobante) {
      formData.append('comprobante', comprobante);
    }

    const { data } = await api.post<IngresoResponse>('/api/ingreso', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  async verificarIngreso(id: number): Promise<IngresoResponse> {
    const { data } = await api.patch<IngresoResponse>(`/api/ingreso/${id}/verificar`);
    return data;
  }

  async anularIngreso(id: number, request: AnularIngresoRequest): Promise<IngresoResponse> {
    const { data } = await api.patch<IngresoResponse>(`/api/ingreso/${id}/anular`, request);
    return data;
  }

  // ============== REPORTES Y ESTADÍSTICAS ==============

  async obtenerResumenPorCategoria(filtros?: FiltrosResumen): Promise<ResumenCategoriasResponse> {
    const { data } = await api.get<ResumenCategoriasResponse>('/api/ingreso/resumen/categoria', {
      params: filtros
    });
    return data;
  }

  async obtenerResumenPorMetodoPago(filtros?: FiltrosResumen): Promise<ResumenMetodosPagoResponse> {
    const { data } = await api.get<ResumenMetodosPagoResponse>('/api/ingreso/resumen/metodo-pago', {
      params: filtros
    });
    return data;
  }

  async obtenerIngresosDiarios(filtros?: FiltrosResumen): Promise<IngresosDiariosResponse> {
    const { data } = await api.get<IngresosDiariosResponse>('/api/ingreso/resumen/diario', {
      params: filtros
    });
    return data;
  }

  async obtenerEstadisticas(filtros?: FiltrosResumen): Promise<EstadisticasResponse> {
    const { data } = await api.get<EstadisticasResponse>('/api/ingreso/estadisticas', {
      params: filtros
    });
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

  getMetodoPagoLabel(metodo: MetodoPago): string {
    const labels: Record<MetodoPago, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia Bancaria',
      qr: 'QR',
      tarjeta: 'Tarjeta'
    };
    return labels[metodo];
  }

  getEstadoIngresoLabel(estado: EstadoIngreso): string {
    const labels: Record<EstadoIngreso, string> = {
      registrado: 'Registrado',
      verificado: 'Verificado',
      anulado: 'Anulado'
    };
    return labels[estado];
  }

  getEstadoIngresoColor(estado: EstadoIngreso): string {
    const colors: Record<EstadoIngreso, string> = {
      registrado: 'text-yellow-600 bg-yellow-50',
      verificado: 'text-green-600 bg-green-50',
      anulado: 'text-red-600 bg-red-50'
    };
    return colors[estado];
  }

  // ✅ ACTUALIZADO - Categorías que coinciden con la base de datos
  getCategoriaIngresoLabel(categoria?: CategoriaIngreso): string {
    const labels: Record<CategoriaIngreso, string> = {
      academico: 'Académico',
      transporte: 'Transporte',
      productos: 'Productos',
      eventos: 'Eventos',
      donaciones: 'Donaciones',
      servicios: 'Servicios',
      vacacional: 'Vacacional',
      otros: 'Otros'
    };

    return labels[categoria ?? 'otros'];
  }

  // ✅ ACTUALIZADO - Colores para las nuevas categorías
  getCategoriaColor(categoria?: CategoriaIngreso): string {
    const colors: Record<CategoriaIngreso, string> = {
      academico: '#3b82f6',      // Azul
      transporte: '#facc15',     // Amarillo
      productos: '#ec4899',      // Rosa
      eventos: '#14b8a6',        // Teal
      donaciones: '#f97316',     // Naranja
      servicios: '#6366f1',      // Índigo
      vacacional: '#8b5cf6',     // Púrpura
      otros: '#6b7280'           // Gris
    };

    return colors[categoria ?? 'otros'];
  }

  // ✅ NUEVO - Obtener icono de categoría
  getCategoriaIcon(categoria?: CategoriaIngreso): string {
    const icons: Record<CategoriaIngreso, string> = {
      academico: '📚',
      transporte: '🚌',
      productos: '🛍️',
      eventos: '🎉',
      donaciones: '💝',
      servicios: '⚙️',
      vacacional: '🏖️',
      otros: '📦'
    };

    return icons[categoria ?? 'otros'];
  }

  calcularMontoNeto(monto: number, descuento: number = 0, recargo: number = 0): number {
    return monto - descuento + recargo;
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

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerNombreCompleto(nombres: string, apellidoPaterno?: string, apellidoMaterno?: string): string {
    const partes = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean);
    return partes.join(' ');
  }

  calcularPorcentaje(parte: number, total: number): number {
    if (total === 0) return 0;
    return (parte / total) * 100;
  }

  agruparPorFecha(ingresos: Ingreso[]): Record<string, Ingreso[]> {
    return ingresos.reduce((acc, ingreso) => {
      const fecha = this.formatearFechaCorta(ingreso.fecha_ingreso);
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(ingreso);
      return acc;
    }, {} as Record<string, Ingreso[]>);
  }

  agruparPorCategoria(ingresos: Ingreso[]): Record<CategoriaIngreso, Ingreso[]> {
    return ingresos.reduce((acc, ingreso) => {
      const categoria = ingreso.tipo_ingreso_categoria || 'otros';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(ingreso);
      return acc;
    }, {} as Record<CategoriaIngreso, Ingreso[]>);
  }

  calcularTotalPorMetodo(ingresos: Ingreso[]): Record<MetodoPago, number> {
    return ingresos.reduce((acc, ingreso) => {
      const metodo = ingreso.metodo_pago;
      acc[metodo] = (acc[metodo] || 0) + ingreso.monto_neto;
      return acc;
    }, {} as Record<MetodoPago, number>);
  }

  obtenerTop5Categorias(resumen: any[]): any[] {
    return resumen
      .sort((a, b) => b.monto_neto - a.monto_neto)
      .slice(0, 5);
  }

  generarCodigoIngreso(): string {
    const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `ING-${fecha}-${random}`;
  }

  validarNIT(nit: string): boolean {
    // Validación básica de NIT boliviano
    if (!nit) return true; // Opcional
    const nitLimpio = nit.replace(/[^0-9]/g, '');
    return nitLimpio.length >= 7 && nitLimpio.length <= 15;
  }

  validarMonto(monto: number): { valido: boolean; mensaje?: string } {
    if (monto <= 0) {
      return { valido: false, mensaje: 'El monto debe ser mayor a 0' };
    }
    if (monto > 1000000) {
      return { valido: false, mensaje: 'El monto no puede exceder Bs. 1,000,000' };
    }
    return { valido: true };
  }

  validarDescuento(descuento: number, monto: number): { valido: boolean; mensaje?: string } {
    if (descuento < 0) {
      return { valido: false, mensaje: 'El descuento no puede ser negativo' };
    }
    if (descuento > monto) {
      return { valido: false, mensaje: 'El descuento no puede ser mayor al monto' };
    }
    return { valido: true };
  }

  esIngresoReciente(fechaIngreso: string, dias: number = 7): boolean {
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diferencia = hoy.getTime() - fecha.getTime();
    const diasDiferencia = diferencia / (1000 * 3600 * 24);
    return diasDiferencia <= dias;
  }

  obtenerMesActual(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  obtenerFechaInicioPeriodo(tipo: 'mes' | 'anio' = 'mes'): string {
    const fecha = new Date();
    if (tipo === 'mes') {
      fecha.setDate(1);
    } else {
      fecha.setMonth(0, 1);
    }
    return fecha.toISOString().split('T')[0];
  }

  obtenerFechaFinPeriodo(tipo: 'mes' | 'anio' = 'mes'): string {
    const fecha = new Date();
    if (tipo === 'mes') {
      fecha.setMonth(fecha.getMonth() + 1, 0);
    } else {
      fecha.setMonth(11, 31);
    }
    return fecha.toISOString().split('T')[0];
  }

  compararPeriodos(actual: number, anterior: number): {
    diferencia: number;
    porcentaje: number;
    esPositivo: boolean;
  } {
    const diferencia = actual - anterior;
    const porcentaje = anterior === 0 ? 100 : (diferencia / anterior) * 100;
    return {
      diferencia,
      porcentaje,
      esPositivo: diferencia >= 0
    };
  }

  formatearVariacion(porcentaje: number): string {
    const signo = porcentaje >= 0 ? '+' : '';
    return `${signo}${porcentaje.toFixed(1)}%`;
  }

  exportarDatosCSV(ingresos: Ingreso[]): string {
    const headers = [
      'Código',
      'Fecha',
      'Tipo',
      'Estudiante',
      'Monto',
      'Método',
      'Estado'
    ];

    const rows = ingresos.map(i => [
      i.codigo_ingreso,
      this.formatearFechaCorta(i.fecha_ingreso),
      i.tipo_ingreso_nombre || '',
      this.obtenerNombreCompleto(
        i.estudiante_nombres || '',
        i.estudiante_apellido_paterno,
        i.estudiante_apellido_materno
      ),
      i.monto_neto,
      this.getMetodoPagoLabel(i.metodo_pago),
      this.getEstadoIngresoLabel(i.estado)
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  }
}

export default new IngresosService();