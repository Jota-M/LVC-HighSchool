// services/padreProductosService.ts
// Llamadas axios al backend para la compra de uniformes/deportivos por el padre
// Calca exactamente el estilo de services/padrePagosService.ts

import api from '@/lib/api';
import type {
    Producto,
    PedidoProducto,
    CrearPedidoRequest,
    QRProductoGeneradoData,
    EstadoQRProductoResponse,
    FiltrosProducto,
    FiltrosPedidoProducto,
    HijoProductoInfo,
} from '@/types/productos';

// =============================================
// 0. HIJOS CON RESUMEN DE PEDIDOS
// GET /padre-p/productos/mis-hijos
// =============================================
export const getHijosConProductos = async (): Promise<{ hijos: HijoProductoInfo[]; total: number }> => {
    const res = await api.get('/padre-p/productos/mis-hijos');
    return res.data.data;
};


// =============================================
// 1. CATÁLOGO DISPONIBLE
// GET /padre-p/productos
// =============================================
export const getCatalogo = async (filtros?: FiltrosProducto): Promise<{ productos: Producto[]; total: number }> => {
    const res = await api.get('/padre-p/productos', { params: filtros });
    return res.data.data;
};

export const getProducto = async (id: number): Promise<Producto> => {
    const res = await api.get(`/padre-p/productos/${id}`);
    return res.data.data.producto;
};

// =============================================
// 2. PEDIDOS DE UN HIJO
// GET /padre-p/hijos/:estudiante_id/pedidos-producto
// =============================================
export const getPedidosHijo = async (
    estudianteId: number,
    filtros?: FiltrosPedidoProducto
): Promise<{ pedidos: PedidoProducto[]; total: number }> => {
    const res = await api.get(`/padre-p/hijos/${estudianteId}/pedidos-producto`, { params: filtros });
    return res.data.data;
};

// =============================================
// 3. CREAR PEDIDO LIBRE (hijo OPCIONAL)
// POST /padre-p/pedidos-producto
// =============================================
export const crearPedidoLibre = async (
    request: CrearPedidoRequest & { estudiante_id?: number }
): Promise<PedidoProducto> => {
    const res = await api.post('/padre-p/pedidos-producto', request);
    return res.data.data.pedido;
};

// =============================================
// 3c. MIS PEDIDOS (todos del padre logueado)
// GET /padre-p/pedidos-producto
// =============================================
export const getMisPedidos = async (
    filtros?: { estado?: string }
): Promise<{ pedidos: PedidoProducto[]; total: number }> => {
    const res = await api.get('/padre-p/pedidos-producto', { params: filtros });
    return res.data.data;
};

// =============================================
// 3b. CREAR PEDIDO PARA UN HIJO ESPECÍFICO (ruta legacy)
// POST /padre-p/hijos/:estudiante_id/pedidos-producto
// =============================================
export const crearPedido = async (
    estudianteId: number,
    request: CrearPedidoRequest
): Promise<PedidoProducto> => {
    const res = await api.post(`/padre-p/hijos/${estudianteId}/pedidos-producto`, request);
    return res.data.data.pedido;
};

// =============================================
// 4. OBTENER UN PEDIDO
// GET /padre-p/pedido-producto/:id
// =============================================
export const getPedido = async (pedidoId: number): Promise<PedidoProducto> => {
    const res = await api.get(`/padre-p/pedido-producto/${pedidoId}`);
    return res.data.data.pedido;
};

// =============================================
// 5. GENERAR QR PARA UN PEDIDO
// POST /padre-p/pedido-producto/:id/generar-qr
// El backend devuelve { success, message, data: { imagenQr, alias, ... } }
// o { success, qr_existente: true, message, data: { ... } } si ya había un QR activo
// =============================================
export const generarQRPedido = async (pedidoId: number): Promise<QRProductoGeneradoData> => {
    const res = await api.post(`/padre-p/pedido-producto/${pedidoId}/generar-qr`);
    return { ...res.data.data, qr_existente: res.data.qr_existente ?? res.data.data?.qr_existente };
};

// =============================================
// 6. ESTADO DEL QR (POLLING)
// GET /padre-p/pedido-producto/:id/estado-qr
// =============================================
export const getEstadoQRPedido = async (pedidoId: number): Promise<EstadoQRProductoResponse> => {
    const res = await api.get(`/padre-p/pedido-producto/${pedidoId}/estado-qr`);
    return res.data;
};