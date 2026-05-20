// types/ingresos.ts - SISTEMA DE INGRESOS

// ============== ENUMS ==============

export type MetodoPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta';
export type EstadoIngreso = 'registrado' | 'verificado' | 'anulado';
export type CategoriaIngreso = 
  | 'academico'
  | 'transporte'
  | 'productos'
  | 'eventos'
  | 'donaciones'
  | 'servicios'
  | 'vacacional'
  | 'otros';
export type ReferenciaIngreso = 
  | 'mensualidad'
  | 'pago_anual'
  | 'transporte'
  | 'venta_producto'
  | 'evento'
  | 'donacion'
  | 'vacacional'
  | 'otro';

// ============== INTERFACES PRINCIPALES ==============

export interface TipoIngreso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaIngreso;
  requiere_estudiante: boolean;
  activo: boolean;
  color?: string;
  orden?: number;
  created_at: string;
  updated_at: string;
}

export interface Ingreso {
  id: number;
  codigo_ingreso: string;
  tipo_ingreso_id: number;
  fecha_ingreso: string;
  periodo_academico_id?: number;
  estudiante_id?: number;
  padre_familia_id?: number;
  matricula_id?: number;
  referencia_tipo?: ReferenciaIngreso;
  referencia_id?: number;
  referencia_codigo?: string;
  monto: number;
  descuento: number;
  recargo: number;
  monto_neto: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  comprobante_url?: string;
  banco?: string;
  numero_referencia?: string;
  requiere_factura: boolean;
  numero_factura?: string;
  nit_factura?: string;
  razon_social_factura?: string;
  observaciones?: string;
  estado: EstadoIngreso;
  verificado: boolean;
  verificado_por?: number;
  fecha_verificacion?: string;
  anulado: boolean;
  motivo_anulacion?: string;
  anulado_por?: number;
  fecha_anulacion?: string;
  registrado_por: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  tipo_ingreso_nombre?: string;
  tipo_ingreso_codigo?: string;
  tipo_ingreso_categoria?: CategoriaIngreso;
  tipo_ingreso_color?: string;
  estudiante_codigo?: string;
  estudiante_nombres?: string;
  estudiante_apellido_paterno?: string;
  estudiante_apellido_materno?: string;
  periodo_nombre?: string;
  periodo_codigo?: string;
  registrado_por_username?: string;
  verificado_por_username?: string;
  anulado_por_username?: string;
}

// ============== INTERFACES DE ESTADÍSTICAS ==============

export interface ResumenPorCategoria {
  categoria: CategoriaIngreso;
  tipo_ingreso: string;
  color?: string;
  cantidad_transacciones: number;
  monto_bruto: number;
  total_descuentos: number;
  total_recargos: number;
  monto_neto: number;
  promedio_ingreso: number;
}

export interface ResumenPorMetodoPago {
  metodo_pago: MetodoPago;
  cantidad_transacciones: number;
  total_monto: number;
}

export interface IngresoDiario {
  fecha: string;
  cantidad_transacciones: number;
  total_monto: number;
  efectivo: number;
  transferencia: number;
  qr: number;
  tarjeta: number;
}

export interface EstadisticasIngresos {
  total_ingresos: number;
  monto_total: number;
  promedio_ingreso: number;
  ingreso_maximo: number;
  ingreso_minimo: number;
  estudiantes_que_pagaron: number;
  dias_con_ingresos: number;
}

// ============== INTERFACES DE REQUESTS ==============

export interface CrearTipoIngresoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaIngreso;
  requiere_estudiante?: boolean;
  activo?: boolean;
  color?: string;
  orden?: number;
}

export interface ActualizarTipoIngresoRequest {
  nombre?: string;
  descripcion?: string;
  categoria?: CategoriaIngreso;  // Agregado para permitir actualizar categoría
  requiere_estudiante?: boolean;
  activo?: boolean;
  color?: string;
  orden?: number;
}

export interface CrearIngresoRequest {
  tipo_ingreso_id: number;
  fecha_ingreso?: string;
  periodo_academico_id?: number;
  estudiante_id?: number;
  padre_familia_id?: number;
  matricula_id?: number;
  referencia_tipo?: ReferenciaIngreso;
  referencia_id?: number;
  referencia_codigo?: string;
  monto: number;
  descuento?: number;
  recargo?: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  banco?: string;
  numero_referencia?: string;
  requiere_factura?: boolean;
  numero_factura?: string;
  nit_factura?: string;
  razon_social_factura?: string;
  observaciones?: string;
}

export interface VerificarIngresoRequest {
  // No requiere datos, solo el ID en la URL
}

export interface AnularIngresoRequest {
  motivo: string;
}

// ============== INTERFACES DE RESPONSES ==============

export interface TiposIngresoResponse {
  success: boolean;
  data: {
    tipos: TipoIngreso[];
  };
}

export interface TipoIngresoResponse {
  success: boolean;
  data: {
    tipo: TipoIngreso;
  };
  message?: string;
}

export interface IngresosResponse {
  success: boolean;
  data: {
    ingresos: Ingreso[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface IngresoResponse {
  success: boolean;
  data: {
    ingreso: Ingreso;
  };
  message?: string;
}

export interface ResumenCategoriasResponse {
  success: boolean;
  data: {
    resumen: ResumenPorCategoria[];
  };
}

export interface ResumenMetodosPagoResponse {
  success: boolean;
  data: {
    resumen: ResumenPorMetodoPago[];
  };
}

export interface IngresosDiariosResponse {
  success: boolean;
  data: {
    ingresos: IngresoDiario[];
  };
}

export interface EstadisticasResponse {
  success: boolean;
  data: {
    estadisticas: EstadisticasIngresos;
  };
}

// ============== INTERFACES DE FILTROS ==============

export interface FiltrosTipoIngreso {
  activo?: boolean;
  categoria?: CategoriaIngreso;
}

export interface FiltrosIngreso {
  page?: number;
  limit?: number;
  search?: string;
  tipo_ingreso_id?: number;
  periodo_academico_id?: number;
  estudiante_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  metodo_pago?: MetodoPago;
  estado?: EstadoIngreso;
  referencia_tipo?: ReferenciaIngreso;
}

export interface FiltrosResumen {
  periodo_academico_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// ============== UTILIDADES DE TIPO ==============

export const METODOS_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia Bancaria',
  qr: 'QR',
  tarjeta: 'Tarjeta'
};

export const ESTADOS_INGRESO: Record<EstadoIngreso, string> = {
  registrado: 'Registrado',
  verificado: 'Verificado',
  anulado: 'Anulado'
};

// ✅ ACTUALIZADO - Categorías que coinciden con la base de datos
export const CATEGORIAS_INGRESO: Record<CategoriaIngreso, string> = {
  academico: 'Académico',
  transporte: 'Transporte',
  productos: 'Productos',
  eventos: 'Eventos',
  donaciones: 'Donaciones',
  servicios: 'Servicios',
  vacacional: 'Vacacional',
  otros: 'Otros'
};

// ✅ ACTUALIZADO - Colores para las nuevas categorías
export const COLORES_CATEGORIA: Record<CategoriaIngreso, string> = {
  academico: '#3b82f6',      // Azul - Mensualidades, matrículas
  transporte: '#facc15',     // Amarillo - Bus escolar
  productos: '#ec4899',      // Rosa - Uniformes, materiales
  eventos: '#14b8a6',        // Teal - Eventos especiales
  donaciones: '#f97316',     // Naranja - Donaciones
  servicios: '#6366f1',      // Índigo - Servicios adicionales
  vacacional: '#8b5cf6',     // Púrpura - Cursos vacacionales
  otros: '#6b7280'           // Gris - Otros ingresos
};

// ✅ NUEVO - Iconos para las categorías (opcional pero útil)
export const ICONOS_CATEGORIA: Record<CategoriaIngreso, string> = {
  academico: '📚',
  transporte: '🚌',
  productos: '🛍️',
  eventos: '🎉',
  donaciones: '💝',
  servicios: '⚙️',
  vacacional: '🏖️',
  otros: '📦'
};

// ✅ NUEVO - Descripciones de las categorías
export const DESCRIPCION_CATEGORIA: Record<CategoriaIngreso, string> = {
  academico: 'Mensualidades, matrículas y pagos académicos',
  transporte: 'Servicio de transporte escolar',
  productos: 'Uniformes, materiales didácticos y libros',
  eventos: 'Eventos especiales, actividades y excursiones',
  donaciones: 'Aportes y donaciones voluntarias',
  servicios: 'Servicios adicionales del colegio',
  vacacional: 'Cursos y programas vacacionales',
  otros: 'Otros ingresos no clasificados'
};

// ============== TIPOS AUXILIARES ==============

export interface TotalesPorCategoria {
  categoria: CategoriaIngreso;
  total: number;
  porcentaje: number;
}

export interface TendenciaIngresos {
  fecha: string;
  total: number;
  transacciones: number;
}

export interface ComparativaAnual {
  mes: string;
  anio_actual: number;
  anio_anterior: number;
  variacion: number;
}

// ============== FUNCIONES HELPER ==============

/**
 * Obtiene el label de una categoría
 */
export const getCategoriaLabel = (categoria: CategoriaIngreso): string => {
  return CATEGORIAS_INGRESO[categoria] || 'Desconocido';
};

/**
 * Obtiene el color de una categoría
 */
export const getCategoriaColor = (categoria: CategoriaIngreso): string => {
  return COLORES_CATEGORIA[categoria] || '#6b7280';
};

/**
 * Obtiene el icono de una categoría
 */
export const getCategoriaIcon = (categoria: CategoriaIngreso): string => {
  return ICONOS_CATEGORIA[categoria] || '📦';
};

/**
 * Obtiene la descripción de una categoría
 */
export const getCategoriaDescripcion = (categoria: CategoriaIngreso): string => {
  return DESCRIPCION_CATEGORIA[categoria] || '';
};

/**
 * Obtiene todas las categorías válidas
 */
export const getCategoriasValidas = (): CategoriaIngreso[] => {
  return Object.keys(CATEGORIAS_INGRESO) as CategoriaIngreso[];
};

/**
 * Verifica si una categoría es válida
 */
export const isCategoriaValida = (categoria: string): categoria is CategoriaIngreso => {
  return categoria in CATEGORIAS_INGRESO;
};