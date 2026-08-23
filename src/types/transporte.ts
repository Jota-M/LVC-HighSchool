// types/transporte.ts - SISTEMA DE TRANSPORTE ESCOLAR

// ============== ENUMS ==============

export type EstadoAsignacion = 'activo' | 'suspendido' | 'cancelado' | 'finalizado';
export type EstadoPagoTransporte = 'pendiente' | 'pagado' | 'pagado_parcial' | 'vencido' | 'anulado';
export type MetodoPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta';

// ============== INTERFACES DE RUTA TRANSPORTE ==============

export interface RutaTransporte {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  zona_cobertura?: string;
  punto_inicio?: string;
  punto_fin?: string;
  horario_ida?: string;
  horario_retorno?: string;
  capacidad_maxima: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  costo_mensual: number;
  conductor_responsable?: string;
  telefono_conductor?: string;
  placa_vehiculo?: string;
  modelo_vehiculo?: string;
  anio_vehiculo?: number;
  color?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Campos calculados
  cantidad_paradas?: number;
  estudiantes_asignados?: number;
  porcentaje_ocupacion?: number;
}

export interface ParadaRuta {
  id: number;
  ruta_id: number;
  nombre: string;
  direccion?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  orden: number;
  hora_estimada_ida?: string;
  hora_estimada_retorno?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Campos calculados
  estudiantes_en_parada?: number;
}

// ============== INTERFACES DE ASIGNACIÓN TRANSPORTE ==============

export interface AsignacionTransporte {
  id: number;
  estudiante_id: number;
  ruta_id: number;
  parada_id?: number;
  periodo_academico_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  costo_mensual: number;
  usa_ida: boolean;
  usa_retorno: boolean;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  observaciones?: string;
  estado: EstadoAsignacion;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Relaciones
  estudiante_codigo?: string;
  estudiante_nombres?: string;
  estudiante_apellido_paterno?: string;
  estudiante_apellido_materno?: string;
  estudiante_foto?: string;
  estudiante_telefono?: string;
  ruta_nombre?: string;
  ruta_codigo?: string;
  zona_cobertura?: string;
  conductor_responsable?: string;
  telefono_conductor?: string;
  placa_vehiculo?: string;
  parada_nombre?: string;
  parada_direccion?: string;
  periodo_nombre?: string;
  periodo_codigo?: string;
  // Campos calculados
  total_cuotas?: number;
  cuotas_pagadas?: number;
  cuotas_pendientes?: number;
  cuotas_vencidas?: number;
  deuda_total?: number;
}

// ============== INTERFACES DE PAGO TRANSPORTE ==============

export interface PagoTransporte {
  id: number;
  codigo_pago: string;
  asignacion_transporte_id: number;
  mes_correspondiente: string;
  fecha_vencimiento: string;
  monto_original: number;
  monto_recargo: number;
  monto_final: number;
  monto_pagado: number;
  estado: EstadoPagoTransporte;
  metodo_pago?: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  fecha_pago?: string;
  registrado_por?: number;
  observaciones?: string;
  anulado: boolean;
  motivo_anulacion?: string;
  anulado_por?: number;
  fecha_anulacion?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  estudiante_id?: number;
  estudiante_codigo?: string;
  estudiante_nombres?: string;
  estudiante_apellido_paterno?: string;
  estudiante_apellido_materno?: string;
  ruta_nombre?: string;
  ruta_codigo?: string;
  periodo_academico_id?: number;
  registrado_por_username?: string;
  anulado_por_username?: string;
}

// ============== INTERFACES DE ESTADÍSTICAS ==============

export interface EstadisticasRuta {
  total_rutas: number;
  rutas_activas: number;
  capacidad_total: number;
  cupos_ocupados_total: number;
  cupos_disponibles_total: number;
  ocupacion_promedio: number;
}

export interface EstadisticasAsignacion {
  total_asignaciones: number;
  activas: number;
  suspendidas: number;
  rutas_en_uso: number;
  estudiantes_usando_transporte: number;
  ingreso_mensual_proyectado: number;
}

export interface EstadoCuentaTransporte {
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string;
  ruta_nombre: string;
  asignacion_id: number;
  costo_mensual: number;
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  proxima_cuota?: PagoTransporte;
}

// ============== INTERFACES DE REQUESTS ==============

export interface CrearRutaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  zona_cobertura?: string;
  punto_inicio?: string;
  punto_fin?: string;
  horario_ida?: string;
  horario_retorno?: string;
  capacidad_maxima?: number;
  costo_mensual: number;
  conductor_responsable?: string;
  telefono_conductor?: string;
  placa_vehiculo?: string;
  modelo_vehiculo?: string;
  anio_vehiculo?: number;
  color?: string;
  activo?: boolean;
  observaciones?: string;
}

export interface ActualizarRutaRequest {
  nombre?: string;
  descripcion?: string;
  zona_cobertura?: string;
  punto_inicio?: string;
  punto_fin?: string;
  horario_ida?: string;
  horario_retorno?: string;
  capacidad_maxima?: number;
  costo_mensual?: number;
  conductor_responsable?: string;
  telefono_conductor?: string;
  placa_vehiculo?: string;
  modelo_vehiculo?: string;
  anio_vehiculo?: number;
  color?: string;
  activo?: boolean;
  observaciones?: string;
}

export interface CrearParadaRequest {
  nombre: string;
  direccion?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  orden: number;
  hora_estimada_ida?: string;
  hora_estimada_retorno?: string;
}

export interface ActualizarParadaRequest {
  nombre?: string;
  direccion?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  orden?: number;
  hora_estimada_ida?: string;
  hora_estimada_retorno?: string;
  activo?: boolean;
}

export interface ReordenarParadasRequest {
  paradas: Array<{
    id: number;
    orden: number;
  }>;
}

export interface CrearAsignacionRequest {
  estudiante_id: number;
  ruta_id: number;
  parada_id?: number;
  periodo_academico_id: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  costo_mensual: number;
  usa_ida?: boolean;
  usa_retorno?: boolean;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  observaciones?: string;
}

export interface ActualizarAsignacionRequest {
  ruta_id?: number;
  parada_id?: number;
  costo_mensual?: number;
  usa_ida?: boolean;
  usa_retorno?: boolean;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  observaciones?: string;
}

export interface CambiarEstadoAsignacionRequest {
  estado: EstadoAsignacion;
  motivo?: string;
}

export interface GenerarCuotasRequest {
  cantidad_meses?: number; // Default 10
}

export interface RegistrarPagoTransporteRequest {
  monto_pagado: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  observaciones?: string;
}

export interface AnularPagoTransporteRequest {
  motivo: string;
}

export interface CalcularRecargosRequest {
  porcentaje?: number; // Default 0.05 (5%)
}

// ============== INTERFACES DE RESPONSES ==============

export interface RutasResponse {
  success: boolean;
  data: {
    rutas: RutaTransporte[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface RutaResponse {
  success: boolean;
  data: {
    ruta: RutaTransporte;
  };
  message?: string;
}

export interface ParadasResponse {
  success: boolean;
  data: {
    paradas: ParadaRuta[];
  };
}

export interface ParadaResponse {
  success: boolean;
  data: {
    parada: ParadaRuta;
  };
  message?: string;
}

export interface AsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: AsignacionTransporte[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AsignacionResponse {
  success: boolean;
  data: {
    asignacion: AsignacionTransporte;
  };
  message?: string;
}

export interface PagosTransporteResponse {
  success: boolean;
  data: {
    pagos: PagoTransporte[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PagoTransporteResponse {
  success: boolean;
  data: {
    pago: PagoTransporte;
  };
  message?: string;
}

export interface EstadisticasRutaResponse {
  success: boolean;
  data: {
    estadisticas: EstadisticasRuta;
  };
}

export interface EstadisticasAsignacionResponse {
  success: boolean;
  data: {
    estadisticas: EstadisticasAsignacion;
  };
}

export interface EstadoCuentaResponse {
  success: boolean;
  data: {
    estadoCuenta: EstadoCuentaTransporte;
  };
}

export interface EstudiantesRutaResponse {
  success: boolean;
  data: {
    estudiantes: Array<{
      asignacion_id: number;
      costo_mensual: number;
      estado: EstadoAsignacion;
      id: number;
      codigo: string;
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
      foto_url?: string;
      telefono?: string;
      parada_nombre?: string;
    }>;
    total: number;
  };
}

export interface CalcularRecargosResponse {
  success: boolean;
  message: string;
  data: {
    cantidad_actualizados: number;
    monto_total_recargos: number;
  };
}

export interface CentralizarPagoResponse {
  success: boolean;
  message: string;
  data: {
    ingreso_id: number;
  };
}

// ============== INTERFACES DE FILTROS ==============

export interface FiltrosRuta {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}

export interface FiltrosAsignacion {
  page?: number;
  limit?: number;
  search?: string;
  periodo_academico_id?: number;
  ruta_id?: number;
  estudiante_id?: number;
  estado?: EstadoAsignacion;
  activo?: boolean;
}

export interface FiltrosPagoTransporte {
  page?: number;
  limit?: number;
  asignacion_transporte_id?: number;
  estudiante_id?: number;
  ruta_id?: number;
  estado?: EstadoPagoTransporte;
  mes_correspondiente?: string;
}

// ============== UTILIDADES DE TIPO ==============

export const ESTADOS_ASIGNACION: Record<EstadoAsignacion, string> = {
  activo: 'Activo',
  suspendido: 'Suspendido',
  cancelado: 'Cancelado',
  finalizado: 'Finalizado'
};

export const ESTADOS_PAGO_TRANSPORTE: Record<EstadoPagoTransporte, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  pagado_parcial: 'Pago Parcial',
  vencido: 'Vencido',
  anulado: 'Anulado'
};

export const METODOS_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia Bancaria',
  qr: 'QR',
  tarjeta: 'Tarjeta'
};

export const MESES_ACADEMICOS = [
  'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre'
] as const;

export type MesAcademico = typeof MESES_ACADEMICOS[number];