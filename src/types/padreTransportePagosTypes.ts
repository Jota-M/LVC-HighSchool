// types/padreTransportePagosTypes.ts

// =============================================
// HIJO CON TRANSPORTE ASIGNADO
// =============================================

export interface HijoTransporteInfo {
    estudiante_id: number;
    estudiante_codigo: string;
    nombres: string;
    apellidos: string;
    foto_url: string | null;

    // Asignación de transporte
    asignacion_id: number;
    costo_mensual: number;
    ruta_nombre: string;
    parada_nombre: string | null;

    // Resumen de cuotas (para el badge en la card)
    total_cuotas: number;
    cuotas_pagadas: number;
    cuotas_pendientes: number;
}

// =============================================
// CUOTA DE TRANSPORTE DEL HIJO
// =============================================

export type EstadoCuotaTransporte =
    | 'pendiente'
    | 'pagado'
    | 'pagado_parcial'
    | 'vencido'
    | 'cancelado'
    | 'anulado';

export type EstadoQRTransporte =
    | 'generado'
    | 'pagado'
    | 'expirado'
    | 'cancelado';

export interface CuotaTransporteHijo {
    pago_id: number;
    codigo_pago: string;
    mes_correspondiente: string;
    fecha_vencimiento: string;
    monto_original: number;
    monto_recargo: number;
    monto_final: number;
    estado: EstadoCuotaTransporte;

    // QR activo (si existe)
    alias_qr: string | null;
    qr_estado: EstadoQRTransporte | null;
    qr_expiracion: string | null;
    fecha_pago: string | null;
    monto_pagado: number | null;
    tiene_qr_activo: boolean;
}

export interface ResumenCuotasTransporte {
    total: number;
    pagadas: number;
    pendientes: number;
    vencidas: number;
    monto_pendiente: number;
}

// =============================================
// RESPUESTA GENERAR QR (individual)
// =============================================

export interface QRTransporteGeneradoData {
    imagenQr: string;
    alias: string;
    monto: number;
    mes: string;
    estudiante: string;
    bancoDestino: string;
    cuentaDestino: string;
    qr_expiracion: string;
    fechaVencimiento: string;
    qr_existente?: boolean;
}

// =============================================
// RESPUESTA ESTADO QR (individual)
// =============================================

export type EstadoQRSIPTransporte =
    | 'PENDIENTE'
    | 'PAGADO'
    | 'GENERADO'
    | 'EXPIRADO'
    | 'SIN_QR';

export interface EstadoQRTransporteResponse {
    estado: EstadoQRSIPTransporte;
    qr_expiracion: string | null;
    en_nuestra_bd?: boolean;
    message: string;
}

// =============================================
// QR FAMILIAR (varios hijos / varias cuotas)
// =============================================

export interface QRFamiliarTransporteData {
    imagenQr: string;
    alias: string;
    monto_total: number;
    hijos: {
        nombres: string;
        apellidos: string;
        meses: string[];
        monto: number;
    }[];
    qr_expiracion: string;
    pago_ids: number[];
}

export interface EstadoQRMultipleTransporteResponse {
    success: boolean;
    estado: EstadoQRSIPTransporte;
    qr_expiracion: string | null;
    cuotas: {
        pago_id: number;
        mes: string;
        monto: number;
        estado: string;
    }[];
    message: string;
}

// =============================================
// CONFIG DE ESTADO (para la UI) — mismos colores que mensualidades
// =============================================

export interface EstadoCuotaTransporteConfig {
    label: string;
    color: string;
    bgColor: string;
    gradient: string;
}

export const ESTADO_CUOTA_TRANSPORTE_CONFIG: Record<EstadoCuotaTransporte, EstadoCuotaTransporteConfig> = {
    pendiente: {
        label: 'Pendiente',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    },
    pagado: {
        label: 'Pagado',
        color: '#10b981',
        bgColor: '#d1fae5',
        gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    pagado_parcial: {
        label: 'Pago parcial',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    },
    vencido: {
        label: 'Vencido',
        color: '#ef4444',
        bgColor: '#fee2e2',
        gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    },
    cancelado: {
        label: 'Cancelado',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    },
    anulado: {
        label: 'Anulado',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    },
};

// =============================================
// MESES Y TRADUCCIÓN ROBUSTA
// =============================================

const DICCIONARIO_MESES: Record<string, string> = {
    // Español
    enero: 'Enero',
    febrero: 'Febrero',
    marzo: 'Marzo',
    abril: 'Abril',
    mayo: 'Mayo',
    junio: 'Junio',
    julio: 'Julio',
    agosto: 'Agosto',
    septiembre: 'Septiembre',
    setiembre: 'Septiembre',
    octubre: 'Octubre',
    noviembre: 'Noviembre',
    diciembre: 'Diciembre',

    // Inglés (procedente de PostgreSQL TO_CHAR u otros)
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',

    // Números
    '1': 'Enero',
    '01': 'Enero',
    '2': 'Febrero',
    '02': 'Febrero',
    '3': 'Marzo',
    '03': 'Marzo',
    '4': 'Abril',
    '04': 'Abril',
    '5': 'Mayo',
    '05': 'Mayo',
    '6': 'Junio',
    '06': 'Junio',
    '7': 'Julio',
    '07': 'Julio',
    '8': 'Agosto',
    '08': 'Agosto',
    '9': 'Septiembre',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre',
};

/**
 * Formatea cualquier valor de mes (inglés, español, número, 'July 2026', '2026-09') a español legible
 */
export function formatMesTransporte(mes: string | null | undefined): string {
    if (!mes) return 'Cuota';
    const trimmed = String(mes).trim();

    // Si viene como "July 2026" o "Septiembre 2026"
    const partes = trimmed.split(/\s+/);
    if (partes.length >= 2) {
        const nombreMes = DICCIONARIO_MESES[partes[0].toLowerCase()] || (partes[0].charAt(0).toUpperCase() + partes[0].slice(1));
        const resto = partes.slice(1).join(' ');
        return `${nombreMes} ${resto}`;
    }

    // Si viene como fecha ISO "2026-09" o "2026-09-10"
    if (/^\d{4}-\d{2}/.test(trimmed)) {
        const partesFecha = trimmed.split('-');
        const anio = partesFecha[0];
        const numMes = partesFecha[1];
        const nombreMes = DICCIONARIO_MESES[numMes] || numMes;
        return `${nombreMes} ${anio}`;
    }

    // Si coincide directamente en el diccionario
    if (DICCIONARIO_MESES[trimmed.toLowerCase()]) {
        return DICCIONARIO_MESES[trimmed.toLowerCase()];
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// Proxy seguro para MESES_LABELS que nunca devuelve undefined
export const MESES_LABELS: Record<string, string> = new Proxy(DICCIONARIO_MESES, {
    get(target, prop: string | symbol) {
        if (typeof prop !== 'string') return undefined;
        return formatMesTransporte(prop);
    }
});

// =============================================
// HELPERS
// =============================================

export function formatFechaPagoTransporte(fecha: string | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export function puedePagarTransporte(c: CuotaTransporteHijo): boolean {
    return (
        (c.estado === 'pendiente' || c.estado === 'vencido') &&
        !c.tiene_qr_activo
    );
}

export function calcularProgresoTransporte(resumen: ResumenCuotasTransporte): number {
    if (resumen.total === 0) return 0;
    return Math.round((resumen.pagadas / resumen.total) * 100);
}