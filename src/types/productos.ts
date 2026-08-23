// types/productos.ts - Módulo de venta de uniformes/deportivos

// ============== ENUMS ==============

export type CategoriaProducto = 'uniforme' | 'deportivo' | 'utiles' | 'otro';
export type EstadoPedidoProducto = 'pendiente_pago' | 'pagado' | 'entregado' | 'cancelado' | 'expirado';
export type MetodoPago = 'efectivo' | 'transferencia' | 'qr' | 'tarjeta';
export type EstadoQR = 'generado' | 'pagado' | 'expirado' | 'cancelado';
export type EstadoQRSIP = 'PENDIENTE' | 'PAGADO' | 'INHABILITADO' | 'SIN_QR';

// ============== INTERFACES PRINCIPALES ==============

export interface ProductoVariante {
    id: number;
    producto_id: number;
    talla?: string;
    color?: string;
    sku?: string;
    precio?: number | null;
    stock_total: number;
    stock_reservado: number;
    stock_disponible: number;
    activo: boolean;
}

export interface Producto {
    id: number;
    codigo: string;
    categoria: CategoriaProducto;
    nombre: string;
    descripcion?: string;
    tiene_variantes: boolean;
    precio_base: number;
    nivel_academico_id?: number | null;
    nivel_nombre?: string;
    foto_url?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
    variantes?: ProductoVariante[];
}

export interface PedidoProductoDetalle {
    id: number;
    pedido_producto_id: number;
    producto_variante_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    producto_nombre?: string;
    producto_categoria?: CategoriaProducto;
    talla?: string;
    color?: string;
}

export interface PedidoProducto {
    id: number;
    codigo_pedido: string;
    matricula_id: number | null;  // null = compra general sin hijo asignado
    padre_familia_id: number;
    periodo_academico_id: number | null;
    monto_total: number;
    estado: EstadoPedidoProducto;
    fecha_pedido: string;
    fecha_limite_pago?: string;
    entregado_en?: string;
    observaciones?: string;
    nombres?: string;
    apellidos?: string;
    estudiante_codigo?: string;
    detalle?: PedidoProductoDetalle[];
}

export interface PagoProducto {
    id: number;
    codigo_pago: string;
    pedido_producto_id: number;
    monto_pagado: number;
    metodo_pago: MetodoPago;
    numero_comprobante?: string;
    comprobante_url?: string;
    fecha_pago: string;
    registrado_por: number;
    anulado: boolean;
    qr_data?: string;
    qr_image_url?: string;
    qr_expiracion?: string;
    qr_estado?: EstadoQR;
    transaccion_id?: string;
}

// ============== REQUESTS ==============

export interface ProductoFormData {
    codigo: string;
    categoria: CategoriaProducto;
    nombre: string;
    descripcion?: string;
    tiene_variantes?: boolean;
    precio_base: number;
    nivel_academico_id?: number;
    foto_url?: string;
    variantes?: VarianteFormData[];
    /** Solo aplica cuando tiene_variantes es false: stock de la variante "por defecto" del producto simple */
    stock_total?: number;
}

export interface VarianteFormData {
    talla?: string;
    color?: string;
    sku?: string;
    precio?: number;
    stock_total?: number;
}

export interface ItemPedido {
    producto_variante_id: number;
    cantidad: number;
    // Campos client-side, no viajan al backend, para mostrar el carrito antes de crear el pedido
    producto_nombre?: string;
    talla?: string;
    color?: string;
    precio_unitario?: number;
}

export interface CrearPedidoRequest {
    items: { producto_variante_id: number; cantidad: number }[];
}

export interface RegistrarPagoDirectoRequest {
    monto_pagado: number;
    metodo_pago: MetodoPago;
    numero_comprobante?: string;
    comprobante_url?: string;
    observaciones?: string;
}

// ============== RESPONSES ==============

export interface ProductosResponse {
    success: boolean;
    data: { productos: Producto[]; total: number };
}

export interface ProductoResponse {
    success: boolean;
    data: { producto: Producto };
    message?: string;
}

export interface VarianteResponse {
    success: boolean;
    data: { variante: ProductoVariante };
    message?: string;
}

export interface PedidosProductoResponse {
    success: boolean;
    data: { pedidos: PedidoProducto[]; total: number };
}

export interface PedidoProductoResponse {
    success: boolean;
    data: { pedido: PedidoProducto };
    message?: string;
}

export interface PagoProductoResponse {
    success: boolean;
    data: { pago: PagoProducto };
    message?: string;
}

// Mismo shape que QRGeneradoData de mensualidad (imagenQr en base64, alias, etc.)
export interface QRProductoGeneradoData {
    imagenQr: string;
    alias: string;
    monto: number;
    estudiante: string;
    bancoDestino?: string;
    cuentaDestino?: string;
    qr_expiracion: string;
    fechaVencimiento?: string;
    qr_existente?: boolean;
}

export interface EstadoQRProductoResponse {
    success: boolean;
    estado: EstadoQRSIP;
    qr_expiracion?: string | null;
    message: string;
}

// ============== HIJOS (para pantalla de selección) ==============

export interface HijoProductoInfo {
    estudiante_id: number;
    estudiante_codigo: string;
    nombres: string;
    apellidos: string;
    foto_url?: string;
    es_tutor_principal: boolean;
    matricula_id: number | null;
    matricula_estado: string | null;
    grado?: string;
    paralelo?: string;
    nivel?: string;
    total_pedidos: number;
    pedidos_pendientes: number;
    pedidos_pagados: number;
    monto_pendiente: number;
}

// ============== FILTROS ==============

export interface FiltrosProducto {
    categoria?: CategoriaProducto;
    nivel_academico_id?: number;
    activo?: boolean;
}

export interface FiltrosPedidoProducto {
    estado?: EstadoPedidoProducto;
}

// ============== UI CONFIG ==============

export interface EstadoPedidoConfig {
    label: string;
    color: string;
    bgColor: string;
}

export const ESTADO_PEDIDO_CONFIG: Record<EstadoPedidoProducto, EstadoPedidoConfig> = {
    pendiente_pago: { label: 'Pendiente de pago', color: '#f59e0b', bgColor: '#fef3c7' },
    pagado: { label: 'Pagado', color: '#10b981', bgColor: '#d1fae5' },
    entregado: { label: 'Entregado', color: '#0288d1', bgColor: '#e0f2fe' },
    cancelado: { label: 'Cancelado', color: '#6b7280', bgColor: '#f3f4f6' },
    expirado: { label: 'Expirado', color: '#ef4444', bgColor: '#fee2e2' },
};

export const CATEGORIAS_PRODUCTO: Record<CategoriaProducto, string> = {
    uniforme: 'Uniforme',
    deportivo: 'Deportivo',
    utiles: 'Útiles escolares',
    otro: 'Otro',
};

// ============== HELPERS ==============

export function puedePagarPedido(pedido: PedidoProducto): boolean {
    return pedido.estado === 'pendiente_pago';
}

export function calcularTotalCarrito(items: ItemPedido[]): number {
    return items.reduce((sum, item) => sum + (item.precio_unitario ?? 0) * item.cantidad, 0);
}

export function calcularCantidadItems(items: ItemPedido[]): number {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
}

export function formatFechaPedido(fecha: string | null | undefined): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}