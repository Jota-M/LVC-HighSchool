// hooks/useProductos.ts
import { useState, useEffect, useCallback } from 'react';
import productosService from '../services/productos';
import type {
    Producto,
    ProductoFormData,
    VarianteFormData,
    FiltrosProducto,
} from '../types/productos';

interface UseProductosOptions extends FiltrosProducto {
    autoLoad?: boolean;
}

interface UseProductosReturn {
    productos: Producto[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    crearProducto: (data: ProductoFormData | FormData) => Promise<Producto>;
    actualizarProducto: (id: number, data: Partial<ProductoFormData> | FormData) => Promise<Producto>;
    eliminarProducto: (id: number) => Promise<void>;
    agregarVariante: (productoId: number, data: VarianteFormData) => Promise<void>;
}

export const useProductos = (options: UseProductosOptions = {}): UseProductosReturn => {
    const { autoLoad = true, categoria, nivel_academico_id, activo } = options;

    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(autoLoad);
    const [error, setError] = useState<string | null>(null);

    const fetchProductos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await productosService.listarProductos({ categoria, nivel_academico_id, activo });
            setProductos(res.data.productos);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoria, nivel_academico_id, activo]);

    useEffect(() => {
        if (autoLoad) fetchProductos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad, categoria, nivel_academico_id, activo]);

    const crearProducto = useCallback(async (data: ProductoFormData | FormData) => {
        const res = await productosService.crearProducto(data);
        await fetchProductos();
        return res.data.producto;
    }, [fetchProductos]);

    const actualizarProducto = useCallback(async (id: number, data: Partial<ProductoFormData> | FormData) => {
        const res = await productosService.actualizarProducto(id, data);
        await fetchProductos();
        return res.data.producto;
    }, [fetchProductos]);

    const eliminarProducto = useCallback(async (id: number) => {
        await productosService.eliminarProducto(id);
        await fetchProductos();
    }, [fetchProductos]);

    const agregarVariante = useCallback(async (productoId: number, data: VarianteFormData) => {
        await productosService.agregarVariante(productoId, data);
        await fetchProductos();
    }, [fetchProductos]);

    return {
        productos,
        loading,
        error,
        refetch: fetchProductos,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        agregarVariante,
    };
};