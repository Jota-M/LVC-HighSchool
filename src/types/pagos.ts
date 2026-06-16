// types/pagos.ts - SISTEMA 10 MESES - VERSIÓN FINAL

// ============== ENUMS ==============

export type EstadoMensualidad = 'pendiente' | 'pagado' | 'pagado_parcial' | 'vencido' | 'cancelado' | 'anulado';
export type MetodoPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta';
export type EstadoQR = 'generado' | 'pagado' | 'expirado' | 'cancelado';
export type FormatoReporte = 'pdf' | 'excel';
export type TipoReportePagos = 'estado-cuenta' | 'morosos' | 'ingresos';

// ============== INTERFACES PRINCIPALES ==============

export interface CostoMensualidad {
  id: number;
  periodo_academico_id: number;
  nivel_academico_id: number;
  monto_base: number;
  descuento_pago_completo: number;
  activo: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  periodo_nombre?: string;
  periodo_codigo?: string;
  nivel_nombre?: string;
  nivel_codigo?: string;
}

export interface Mensualidad {
  id: number;
  matricula_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  fecha_vencimiento: string;
  monto_original: number;
  monto_beca: number;
  monto_recargo: number;
  monto_final: number;
  estado: EstadoMensualidad;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  numero_matricula?: string;
  estudiante_codigo?: string;
  nombres?: string;
  apellidos?: string;
  paralelo?: string;
  grado?: string;
  nivel?: string;
  total_pagado?: number;
  saldo_pendiente?: number;
}

export interface PagoMensualidad {
  id: number;
  codigo_pago: string;
  mensualidad_id: number;
  monto_pagado: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  entrego_factura: boolean;
  numero_factura?: string;
  banco_origen?: string;
  numero_referencia?: string;
  fecha_pago: string;
  registrado_por: number;
  observaciones?: string;
  anulado: boolean;
  motivo_anulacion?: string;
  anulado_por?: number;
  fecha_anulacion?: string;
  created_at: string;
  updated_at: string;
  // Campos QR
  qr_data?: string;
  qr_image_url?: string;
  qr_expiracion?: string;
  qr_estado?: EstadoQR;
  transaccion_id?: string;
  // Relaciones
  numero_cuota?: number;
  mes_correspondiente?: string;
  monto_mensualidad?: number;
  numero_matricula?: string;
  estudiante_codigo?: string;
  nombres?: string;
  apellidos?: string;
  registrado_por_username?: string;
  anulado_por_username?: string;
}

export interface PagoAnualCompleto {
  id: number;
  codigo_pago: string;
  matricula_id: number;
  monto_total_sin_descuento: number;
  monto_descuento: number;
  monto_beca_total: number;
  monto_pagado: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  entrego_factura: boolean;
  numero_factura?: string;
  banco_origen?: string;
  numero_referencia?: string;
  fecha_pago: string;
  registrado_por: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  numero_matricula?: string;
  estudiante_codigo?: string;
  nombres?: string;
  apellidos?: string;
  paralelo?: string;
  grado?: string;
  registrado_por_username?: string;
}

// ============== INTERFACES DE REPORTES ==============

export interface EstadoPagosEstudiante {
  estudiante_id: number;
  estudiante_codigo: string;
  nombres: string;
  apellidos: string;
  matricula_id: number;
  numero_matricula: string;
  es_becado: boolean;
  porcentaje_beca?: number;
  paralelo: string;
  grado: string;
  nivel: string;
  periodo_academico: string;
  total_mensualidades: number;
  mensualidades_pagadas: number;
  mensualidades_pendientes: number;
  mensualidades_vencidas: number;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
}

export interface IngresosPorPeriodo {
  periodo_id: number;
  periodo: string;
  mes: string;
  metodo_pago: MetodoPago;
  cantidad_pagos: number;
  total_ingreso: number;
}

export interface EstudianteMoroso {
  estudiante_id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  numero_cuota: number;
  mes_correspondiente: string;
  fecha_vencimiento: string;
  monto_final: number;
  dias_mora: number;
}

export interface ResumenPagos {
  estudiantes: { total: number };
  mensualidades: {
    total: number;
    monto_total: number;
    pagadas: number;
    monto_pagado: number;
    pendientes: number;
    monto_pendiente: number;
    vencidas: number;
    monto_vencido: number;
  };
  ingresos: {
    total: number;
    por_metodo: Array<{ metodo_pago: MetodoPago; cantidad: number; total: number }>;
  };
  pagos_anuales: { total: number; monto_total: number };
  porcentajes: {
    mensualidades_pagadas: string;
    mensualidades_pendientes: string;
    morosidad: string;
  };
  sistema?: string;
}

// ============== INTERFACES DE EXPORTACIÓN ==============

export interface FiltrosExportarEstadoCuenta {
  periodo_academico_id: number;
  formato: FormatoReporte;
  grado_id?: number;
  paralelo_id?: number;
}

export interface FiltrosExportarMorosos {
  periodo_academico_id: number;
  formato: FormatoReporte;
  dias_mora_minimo?: number;
  grado_id?: number;
  paralelo_id?: number;
}

export interface FiltrosExportarIngresos {
  periodo_academico_id: number;
  formato: FormatoReporte;
  mes_inicio?: string;
  mes_fin?: string;
}

export interface DescargaReportePagos {
  tipo: TipoReportePagos;
  formato: FormatoReporte;
  filename: string;
}

// ============== INTERFACES DE REQUESTS ==============

export interface CrearCostoMensualidadRequest {
  periodo_academico_id: number;
  nivel_academico_id: number;
  monto_base: number;
  descuento_pago_completo?: number;
  observaciones?: string;
}

export interface ActualizarCostoMensualidadRequest {
  monto_base?: number;
  descuento_pago_completo?: number;
  activo?: boolean;
  observaciones?: string;
}

export interface GenerarMensualidadesRequest {
  matricula_id: number;
  periodo_academico_id: number;
  nivel_academico_id: number;
  porcentaje_beca?: number;
}

export interface RegistrarPagoMensualidadRequest {
  mensualidad_id: number;
  monto_pagado: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  entrego_factura?: boolean;
  numero_factura?: string;
  banco_origen?: string;
  numero_referencia?: string;
  observaciones?: string;
}

export interface ActualizarPagoMensualidadRequest {
  numero_comprobante?: string;
  comprobante_url?: string;
  entrego_factura?: boolean;
  numero_factura?: string;
  observaciones?: string;
}

export interface AnularPagoRequest {
  motivo: string;
}

export interface RegistrarPagoAnualRequest {
  matricula_id: number;
  monto_pagado: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  entrego_factura?: boolean;
  numero_factura?: string;
  banco_origen?: string;
  numero_referencia?: string;
  observaciones?: string;
}

// ============== INTERFACES DE RESPONSES ==============

export interface CostosResponse {
  success: boolean;
  data: { costos: CostoMensualidad[] };
}

export interface CostoResponse {
  success: boolean;
  data: { costo: CostoMensualidad };
  message?: string;
}

export interface MensualidadesResponse {
  success: boolean;
  data: { mensualidades: Mensualidad[]; total?: number; sistema?: string };
}

export interface MensualidadResponse {
  success: boolean;
  data: { mensualidad: Mensualidad; pagos?: PagoMensualidad[] };
}

export interface PagosResponse {
  success: boolean;
  data: {
    pagos: PagoMensualidad[];
    paginacion?: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface PagoResponse {
  success: boolean;
  data: { pago: PagoMensualidad };
  message?: string;
}

export interface PagosAnualesResponse {
  success: boolean;
  data: { pagos: PagoAnualCompleto[]; total?: number };
}

export interface PagoAnualResponse {
  success: boolean;
  data: { pago: PagoAnualCompleto };
  message?: string;
}

export interface EstadoPagosEstudiantesResponse {
  success: boolean;
  data: { estudiantes: EstadoPagosEstudiante[]; total?: number };
}

export interface IngresosResponse {
  success: boolean;
  data: {
    ingresos: IngresosPorPeriodo[];
    totales?: { cantidad_pagos: number; total_ingreso: number };
    total_registros?: number;
  };
}

export interface MorososResponse {
  success: boolean;
  data: { morosos: EstudianteMoroso[]; total_morosos: number; deuda_total: number };
}

export interface ResumenResponse {
  success: boolean;
  data: { resumen: ResumenPagos };
}

// ============== INTERFACES DE FILTROS ==============

export interface FiltrosCostoMensualidad {
  periodo_academico_id?: number;
  nivel_academico_id?: number;
  activo?: boolean;
}

export interface FiltrosMensualidad {
  periodo_academico_id?: number;
  estado?: EstadoMensualidad;
  grado_id?: number;
  paralelo_id?: number;
  mes_correspondiente?: string;
}

export interface FiltrosPagoMensualidad {
  page?: number;
  limit?: number;
  estudiante_id?: number;
  periodo_academico_id?: number;
  metodo_pago?: MetodoPago;
  fecha_desde?: string;
  fecha_hasta?: string;
  anulado?: boolean;
}

export interface FiltrosPagoAnual {
  periodo_academico_id?: number;
  metodo_pago?: MetodoPago;
}

export interface FiltrosEstadoPagos {
  periodo_academico_id?: number;
  grado_id?: number;
  paralelo_id?: number;
}

export interface FiltrosIngresos {
  periodo_academico_id?: number;
  mes_inicio?: string;
  mes_fin?: string;
}

export interface FiltrosMorosos {
  periodo_academico_id?: number;
  grado_id?: number;
  paralelo_id?: number;
  dias_mora_minimo?: number;
}

// ============== TIPOS AUXILIARES ==============

export interface CalculoDescuento {
  monto_base: number;
  cantidad_meses: number;
  porcentaje_descuento: number;
  porcentaje_beca: number;
  monto_sin_descuento: number;
  monto_descuento_anual: number;
  monto_descuento_beca: number;
  monto_final: number;
}

export interface ResumenMensualidades {
  total: number;
  pagadas: number;
  pendientes: number;
  vencidas: number;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
}

// ============== UTILIDADES DE TIPO ==============

export const METODOS_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia Bancaria',
  qr: 'QR',
  tarjeta: 'Tarjeta',
};

export const ESTADOS_MENSUALIDAD: Record<EstadoMensualidad, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  pagado_parcial: 'Pago Parcial',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
  anulado: 'Anulado',
};

export const MESES_ACADEMICOS = [
  'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre',
] as const;

export type MesAcademico = typeof MESES_ACADEMICOS[number];

export const SISTEMA_MENSUALIDADES = {
  CANTIDAD_MESES: 10,
  DESCUENTO_PAGO_COMPLETO: 10.0,
  MESES_GRATIS_AL_PAGAR_COMPLETO: 1,
  PRIMER_MES: 'febrero',
  ULTIMO_MES: 'noviembre',
  DESCRIPCION: 'Sistema de 10 mensualidades',
  BENEFICIO: 'Pagas 9 meses, obtienes 1 mes gratis',
} as const;

// ============================================
// PAGO MÚLTIPLE
// ============================================

export interface MensualidadParaPago {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  fecha_vencimiento: string;
  monto_final: number;
  saldo_pendiente: number;
  total_pagado: number;
  estado: EstadoMensualidad;
}

export interface EstudianteConMensualidades {
  estudiante_id: number;
  estudiante_codigo: string;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  matricula_id: number;
  mensualidades: MensualidadParaPago[];
}

export interface MensualidadSeleccionada {
  mensualidad_id: number;
  monto_pagado: number;
}

export interface RegistrarPagoMultipleRequest {
  mensualidades: MensualidadSeleccionada[];
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  banco_origen?: string;
  numero_referencia?: string;
  entrego_factura?: boolean;
  numero_factura?: string;
  observaciones?: string;
}

export interface PagoMultipleRegistrado {
  pago_id: number;
  codigo_pago: string;
  mensualidad_id: number;
  mes: string;
  estudiante: string;
  monto_pagado: number;
}

export interface PagoMultipleResponse {
  success: boolean;
  message: string;
  data: {
    cantidad_pagos: number;
    monto_total: number;
    pagos: PagoMultipleRegistrado[];
  };
}

export interface ResumenPendientesResponse {
  success: boolean;
  data: {
    estudiantes: EstudianteConMensualidades[];
    total_estudiantes: number;
    total_mensualidades: number;
  };
}

// ============================================
// PAGO DISTRIBUIDO
// ============================================

export interface DistribucionMensualidad {
  mensualidad_id: number;
  numero_cuota: number;
  mes_correspondiente: string;
  saldo_pendiente: number;
  monto_a_pagar: number;
  saldo_restante: number;
  porcentaje_pago: number;
  es_pago_completo: boolean;
  es_pago_parcial: boolean;
}

export interface CalculoDistribucionResponse {
  success: boolean;
  data: {
    monto_total: number;
    monto_distribuido: number;
    monto_sobrante: number;
    mensualidades_completas: number;
    mensualidades_parciales: number;
    distribucion: DistribucionMensualidad[];
    advertencias: string[];
  };
}

export interface RegistrarPagoDistribuidoRequest {
  matricula_id: number;
  monto_total: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  banco_origen?: string;
  numero_referencia?: string;
  entrego_factura?: boolean;
  numero_factura?: string;
  observaciones?: string;
}

export interface PagoDistribuidoResponse {
  success: boolean;
  message: string;
  data: {
    monto_total_ingresado: number;
    monto_distribuido: number;
    monto_sobrante: number;
    mensualidades_completas: number;
    mensualidades_parciales: number;
    cantidad_pagos: number;
    distribucion: DistribucionMensualidad[];
    pagos: PagoMultipleRegistrado[];
  };
}

// ============== INFO SISTEMA ==============

export interface InfoSistema {
  cantidad_meses: number;
  descuento_pago_completo: number;
  meses_gratis: number;
  primer_mes: string;
  ultimo_mes: string;
  descripcion: string;
  beneficio: string;
}
