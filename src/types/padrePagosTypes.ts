// types/padrePagosTypes.ts

// =============================================
// HIJO CON RESUMEN DE PAGOS
// =============================================

export interface HijoPagoInfo {
  estudiante_id:          number;
  estudiante_codigo:      string;
  nombres:                string;
  apellidos:              string;
  foto_url:               string | null;
  fecha_nacimiento:       string | null;
  es_tutor_principal:     boolean;
  parentesco:             string | null;

  // Matrícula activa
  matricula_id:           number | null;
  numero_matricula:       string | null;
  matricula_estado:       string | null;
  es_becado:              boolean;
  porcentaje_beca:        number | null;

  // Académico
  grado:                  string | null;
  paralelo:               string | null;
  nivel:                  string | null;
  periodo_academico:      string | null;
  periodo_academico_id:   number | null;

  // Resumen de pagos (para el badge en la card)
  total_mensualidades:    number;
  mensualidades_pagadas:  number;
  mensualidades_pendientes: number;
}

export interface QRMultipleData {
  imagenQr:       string;
  alias:          string;
  monto_total:    number;
  meses:          string;       // "febrero, marzo, abril"
  cantidad_meses: number;
  estudiante:     string;
  bancoDestino:   string;
  cuentaDestino:  string;
  qr_expiracion:  string;
  fechaVencimiento: string;
  mensualidad_ids: number[];
}
 
export interface EstadoQRMultipleResponse {
  success:       boolean;
  estado:        EstadoQRSIP;
  qr_expiracion: string | null;
  en_nuestra_bd?: boolean;
  mensualidades: {
    mensualidad_id: number;
    mes:            string;
    monto:          number;
    estado:         string;
  }[];
  datos_pago?: {
    monto:         number | null;
    moneda:        string | null;
    fecha:         string | null;
    nombreCliente: string | null;
  } | null;
  message: string;
}
 
// =============================================
// MENSUALIDAD DEL HIJO
// =============================================

export type EstadoMensualidad =
  | 'pendiente'
  | 'pagado'
  | 'pagado_parcial'
  | 'vencido'
  | 'cancelado'
  | 'anulado';

export type EstadoQR =
  | 'generado'
  | 'pagado'
  | 'expirado'
  | 'cancelado';

export interface MensualidadHijo {
  mensualidad_id:     number;
  numero_cuota:       number;
  mes_correspondiente: string;
  fecha_vencimiento:  string;
  monto_original:     number;
  monto_beca:         number;
  monto_final:        number;
  estado:             EstadoMensualidad;

  // QR activo (si existe)
  pago_id:            number | null;
  alias_qr:           string | null;
  qr_estado:          EstadoQR | null;
  qr_expiracion:      string | null;
  transaccion_id:     string | null;
  fecha_pago:         string | null;
  monto_pagado:       number | null;
  tiene_qr_activo:    boolean;
}

export interface ResumenMensualidades {
  total:           number;
  pagadas:         number;
  pendientes:      number;
  vencidas:        number;
  monto_pendiente: number;
}

// =============================================
// RESPUESTA GENERAR QR
// =============================================

export interface QRGeneradoData {
  imagenQr:        string;   // Base64 para mostrar con <img src="data:image/png;base64,..." />
  alias:           string;
  monto:           number;
  mes:             string;
  estudiante:      string;
  bancoDestino:    string;
  cuentaDestino:   string;
  qr_expiracion:   string;
  fechaVencimiento: string;
  qr_existente?:   boolean; // true si ya había un QR activo
}

// =============================================
// RESPUESTA ESTADO QR
// =============================================

export type EstadoQRSIP =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'INHABILITADO'
  | 'ERROR'
  | 'SIN_QR';

export interface EstadoQRResponse {
  estado:        EstadoQRSIP;
  qr_expiracion: string | null;
  en_nuestra_bd?: boolean;
  datos_pago?: {
    monto:         number | null;
    moneda:        string | null;
    fecha:         string | null;
    nombreCliente: string | null;
  } | null;
  message: string;
}

// =============================================
// CONFIG DE ESTADO (para la UI)
// =============================================

export interface EstadoMensualidadConfig {
  label:    string;
  color:    string;
  bgColor:  string;
  gradient: string;
}

export const ESTADO_MENSUALIDAD_CONFIG: Record<EstadoMensualidad, EstadoMensualidadConfig> = {
  pendiente: {
    label:    'Pendiente',
    color:    '#f59e0b',
    bgColor:  '#fef3c7',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  pagado: {
    label:    'Pagado',
    color:    '#10b981',
    bgColor:  '#d1fae5',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  pagado_parcial: {
    label:    'Pago parcial',
    color:    '#3b82f6',
    bgColor:  '#dbeafe',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  },
  vencido: {
    label:    'Vencido',
    color:    '#ef4444',
    bgColor:  '#fee2e2',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
  },
  cancelado: {
    label:    'Cancelado',
    color:    '#6b7280',
    bgColor:  '#f3f4f6',
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  },
  anulado: {
    label:    'Anulado',
    color:    '#6b7280',
    bgColor:  '#f3f4f6',
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  },
};

// Nombres de los meses en español para mostrar en la UI
export const MESES_LABELS: Record<string, string> = {
  enero:      'Enero',
  febrero:    'Febrero',
  marzo:      'Marzo',
  abril:      'Abril',
  mayo:       'Mayo',
  junio:      'Junio',
  julio:      'Julio',
  agosto:     'Agosto',
  septiembre: 'Septiembre',
  octubre:    'Octubre',
  noviembre:  'Noviembre',
  diciembre:  'Diciembre',
};

// =============================================
// HELPERS
// =============================================

/**
 * Formatea fecha ISO a string legible en español
 */
export function formatFechaPago(fecha: string | null): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-BO', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
}

/**
 * Devuelve true si una mensualidad se puede pagar
 */
export function puedePagar(m: MensualidadHijo): boolean {
  return (
    (m.estado === 'pendiente' || m.estado === 'vencido') &&
    !m.tiene_qr_activo
  );
}

/**
 * Devuelve el porcentaje pagado de las mensualidades
 */
export function calcularProgreso(resumen: ResumenMensualidades): number {
  if (resumen.total === 0) return 0;
  return Math.round((resumen.pagadas / resumen.total) * 100);
}
export interface QRFamiliarData {
  imagenQr:       string;
  alias:          string;
  monto_total:    number;
  cantidad_meses: number;
  hijos: {
    nombres:    string;
    apellidos:  string;
    meses:      string[];
    monto:      number;
  }[];
  bancoDestino:    string;
  cuentaDestino:   string;
  qr_expiracion:   string;
  mensualidad_ids: number[];
}

export interface MensualidadFamiliar {
  estudiante_id:       number;
  nombres:             string;
  apellidos:           string;
  grado:               string;
  paralelo:            string;
  mensualidad_id:      number;
  numero_cuota:        number;
  mes_correspondiente: string;
  fecha_vencimiento:   string;
  monto_final:         number;
  estado:              EstadoMensualidad;
  tiene_qr_activo:     boolean;
}