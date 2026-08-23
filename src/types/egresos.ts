// types/egresos.ts - SISTEMA DE EGRESOS

// ============== ENUMS ==============

export type MetodoPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta';
export type EstadoEgreso = 'registrado' | 'verificado' | 'anulado';
export type CategoriaEgreso =
    | 'personal'
    | 'operativo'
    | 'administrativo'
    | 'otro';
export type ReferenciaEgreso =
    | 'docente'
    | 'ruta_transporte'
    | 'proveedor'
    | 'otro';

// ============== INTERFACES PRINCIPALES ==============

export interface TipoEgreso {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: CategoriaEgreso;
    requiere_docente: boolean;
    activo: boolean;
    color?: string;
    orden?: number;
    created_at: string;
    updated_at: string;
}

export interface Egreso {
    id: number;
    codigo_egreso: string;
    tipo_egreso_id: number;
    fecha_egreso: string;
    periodo_academico_id?: number;
    docente_id?: number;
    referencia_tipo?: ReferenciaEgreso;
    referencia_id?: number;
    referencia_codigo?: string;
    concepto: string;
    descripcion?: string;
    monto: number;
    monto_neto: number;
    metodo_pago: MetodoPago;
    numero_comprobante?: string;
    comprobante_url?: string;
    banco?: string;
    numero_referencia?: string;
    beneficiario?: string;
    requiere_factura: boolean;
    factura_recibida: boolean;
    numero_factura?: string;
    nit_proveedor?: string;
    observaciones?: string;
    estado: EstadoEgreso;
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
    tipo_egreso_nombre?: string;
    tipo_egreso_codigo?: string;
    tipo_egreso_categoria?: CategoriaEgreso;
    tipo_egreso_color?: string;
    docente_codigo?: string;
    docente_nombres?: string;
    docente_apellido_paterno?: string;
    docente_apellido_materno?: string;
    periodo_nombre?: string;
    periodo_codigo?: string;
    registrado_por_username?: string;
    verificado_por_username?: string;
    anulado_por_username?: string;
}

// ============== INTERFACES DE ESTADÍSTICAS ==============

export interface ResumenPorCategoriaEgreso {
    categoria: CategoriaEgreso;
    tipo_egreso: string;
    color?: string;
    cantidad_transacciones: number;
    monto_neto: number;
    promedio_egreso: number;
}

export interface ResumenPorMetodoPagoEgreso {
    metodo_pago: MetodoPago;
    cantidad_transacciones: number;
    total_monto: number;
}

export interface EgresoDiario {
    fecha: string;
    cantidad_transacciones: number;
    total_monto: number;
    efectivo: number;
    transferencia: number;
    qr: number;
    tarjeta: number;
}

export interface EstadisticasEgresos {
    total_egresos: number;
    monto_total: number;
    promedio_egreso: number;
    egreso_maximo: number;
    egreso_minimo: number;
    docentes_pagados: number;
    dias_con_egresos: number;
}

// ============== INTERFACES DE REQUESTS ==============

export interface CrearTipoEgresoRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: CategoriaEgreso;
    requiere_docente?: boolean;
    activo?: boolean;
    color?: string;
    orden?: number;
}

export interface ActualizarTipoEgresoRequest {
    nombre?: string;
    descripcion?: string;
    categoria?: CategoriaEgreso;
    requiere_docente?: boolean;
    activo?: boolean;
    color?: string;
    orden?: number;
}

export interface CrearEgresoRequest {
    tipo_egreso_id: number;
    fecha_egreso?: string;
    periodo_academico_id?: number;
    docente_id?: number;
    referencia_tipo?: ReferenciaEgreso;
    referencia_id?: number;
    referencia_codigo?: string;
    concepto: string;
    descripcion?: string;
    monto: number;
    metodo_pago: MetodoPago;
    numero_comprobante?: string;
    banco?: string;
    numero_referencia?: string;
    beneficiario?: string;
    requiere_factura?: boolean;
    factura_recibida?: boolean;
    numero_factura?: string;
    nit_proveedor?: string;
    observaciones?: string;
}

export interface AnularEgresoRequest {
    motivo: string;
}

// ============== INTERFACES DE RESPONSES ==============

export interface TiposEgresoResponse {
    success: boolean;
    data: {
        tipos: TipoEgreso[];
    };
}

export interface TipoEgresoResponse {
    success: boolean;
    data: {
        tipo: TipoEgreso;
    };
    message?: string;
}

export interface EgresosResponse {
    success: boolean;
    data: {
        egresos: Egreso[];
        paginacion?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface EgresoResponse {
    success: boolean;
    data: {
        egreso: Egreso;
    };
    message?: string;
}

export interface ResumenCategoriasEgresoResponse {
    success: boolean;
    data: {
        resumen: ResumenPorCategoriaEgreso[];
    };
}

export interface ResumenMetodosPagoEgresoResponse {
    success: boolean;
    data: {
        resumen: ResumenPorMetodoPagoEgreso[];
    };
}

export interface EgresosDiariosResponse {
    success: boolean;
    data: {
        egresos: EgresoDiario[];
    };
}

export interface EstadisticasEgresoResponse {
    success: boolean;
    data: {
        estadisticas: EstadisticasEgresos;
    };
}

// ============== INTERFACES DE FILTROS ==============

export interface FiltrosTipoEgreso {
    activo?: boolean;
    categoria?: CategoriaEgreso;
}

export interface FiltrosEgreso {
    page?: number;
    limit?: number;
    search?: string;
    tipo_egreso_id?: number;
    periodo_academico_id?: number;
    docente_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    metodo_pago?: MetodoPago;
    estado?: EstadoEgreso;
    referencia_tipo?: ReferenciaEgreso;
}

export interface FiltrosResumenEgreso {
    periodo_academico_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
}

// ============== UTILIDADES DE TIPO ==============

export const METODOS_PAGO_EGRESO: Record<MetodoPago, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia Bancaria',
    qr: 'QR',
    tarjeta: 'Tarjeta'
};

export const ESTADOS_EGRESO: Record<EstadoEgreso, string> = {
    registrado: 'Registrado',
    verificado: 'Verificado',
    anulado: 'Anulado'
};

export const CATEGORIAS_EGRESO: Record<CategoriaEgreso, string> = {
    personal: 'Personal (planillas)',
    operativo: 'Operativo',
    administrativo: 'Administrativo',
    otro: 'Otro'
};

export const COLORES_CATEGORIA_EGRESO: Record<CategoriaEgreso, string> = {
    personal: '#ef4444',        // Rojo - planilla docente/admin
    operativo: '#f97316',       // Naranja - servicios, mantenimiento, transporte
    administrativo: '#8b5cf6',  // Púrpura - impuestos, legal, marketing
    otro: '#6b7280'             // Gris - otros
};

export const ICONOS_CATEGORIA_EGRESO: Record<CategoriaEgreso, string> = {
    personal: '🧑‍🏫',
    operativo: '🛠️',
    administrativo: '📋',
    otro: '📦'
};

export const DESCRIPCION_CATEGORIA_EGRESO: Record<CategoriaEgreso, string> = {
    personal: 'Sueldos de docentes y personal administrativo',
    operativo: 'Servicios básicos, mantenimiento, material y transporte',
    administrativo: 'Impuestos, trámites legales, marketing y eventos',
    otro: 'Egresos no clasificados'
};

// ============== FUNCIONES HELPER ==============

export const getCategoriaEgresoLabel = (categoria: CategoriaEgreso): string => {
    return CATEGORIAS_EGRESO[categoria] || 'Desconocido';
};

export const getCategoriaEgresoColor = (categoria: CategoriaEgreso): string => {
    return COLORES_CATEGORIA_EGRESO[categoria] || '#6b7280';
};

export const getCategoriaEgresoIcon = (categoria: CategoriaEgreso): string => {
    return ICONOS_CATEGORIA_EGRESO[categoria] || '📦';
};

export const getCategoriaEgresoDescripcion = (categoria: CategoriaEgreso): string => {
    return DESCRIPCION_CATEGORIA_EGRESO[categoria] || '';
};

export const getCategoriasEgresoValidas = (): CategoriaEgreso[] => {
    return Object.keys(CATEGORIAS_EGRESO) as CategoriaEgreso[];
};

export const isCategoriaEgresoValida = (categoria: string): categoria is CategoriaEgreso => {
    return categoria in CATEGORIAS_EGRESO;
};