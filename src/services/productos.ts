// services/productos.ts - Módulo de venta de uniformes/deportivos (admin)
import api from '../lib/api';
import type {
    ProductoFormData,
    VarianteFormData,
    RegistrarPagoDirectoRequest,
    ProductosResponse,
    ProductoResponse,
    VarianteResponse,
    PedidosProductoResponse,
    PedidoProductoResponse,
    PagoProductoResponse,
    FiltrosProducto,
    FiltrosPedidoProducto,
} from '../types/productos';

class ProductosService {
    // ============== CATÁLOGO ==============

    async listarProductos(filtros?: FiltrosProducto): Promise<ProductosResponse> {
        const { data } = await api.get<ProductosResponse>('/api/productos', { params: filtros });
        return data;
    }

    async obtenerProducto(id: number): Promise<ProductoResponse> {
        const { data } = await api.get<ProductoResponse>(`/api/productos/${id}`);
        return data;
    }

    async crearProducto(producto: ProductoFormData | FormData): Promise<ProductoResponse> {
        const headers = producto instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
        const { data } = await api.post<ProductoResponse>('/api/productos', producto, { headers });
        return data;
    }

    async actualizarProducto(id: number, producto: Partial<ProductoFormData> | FormData): Promise<ProductoResponse> {
        const headers = producto instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
        const { data } = await api.put<ProductoResponse>(`/api/productos/${id}`, producto, { headers });
        return data;
    }

    async eliminarFoto(id: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.delete(`/api/productos/${id}/foto`);
        return data;
    }

    async eliminarProducto(id: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.delete(`/api/productos/${id}`);
        return data;
    }

    async agregarVariante(productoId: number, variante: VarianteFormData): Promise<VarianteResponse> {
        const { data } = await api.post<VarianteResponse>(`/api/productos/${productoId}/variantes`, variante);
        return data;
    }

    // ============== PEDIDOS ==============

    async obtenerPedido(id: number): Promise<PedidoProductoResponse> {
        const { data } = await api.get<PedidoProductoResponse>(`/api/pedido-producto/${id}`);
        return data;
    }

    async listarPedidosPorEstudiante(estudianteId: number, filtros?: FiltrosPedidoProducto): Promise<PedidosProductoResponse> {
        const { data } = await api.get<PedidosProductoResponse>(`/api/estudiante/${estudianteId}/pedidos-producto`, {
            params: filtros,
        });
        return data;
    }

    async marcarEntregado(pedidoId: number): Promise<PedidoProductoResponse> {
        const { data } = await api.patch<PedidoProductoResponse>(`/api/pedido-producto/${pedidoId}/entregar`);
        return data;
    }

    // ============== PAGOS ==============

    async registrarPagoDirecto(pedidoId: number, pago: RegistrarPagoDirectoRequest): Promise<PagoProductoResponse> {
        const { data } = await api.post<PagoProductoResponse>(`/api/pedido-producto/${pedidoId}/pago-directo`, pago);
        return data;
    }

    // ============== HELPERS (client-side) ==============

    calcularStockDisponible(stockTotal: number, stockReservado: number): number {
        return stockTotal - stockReservado;
    }

    validarStockSuficiente(stockDisponible: number, cantidadSolicitada: number): { valido: boolean; razon?: string } {
        if (cantidadSolicitada <= 0) return { valido: false, razon: 'La cantidad debe ser mayor a 0' };
        if (stockDisponible < cantidadSolicitada) {
            return { valido: false, razon: `Stock insuficiente (disponible: ${stockDisponible})` };
        }
        return { valido: true };
    }
}

export default new ProductosService();