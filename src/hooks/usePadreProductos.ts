// hooks/usePadreProductos.ts
// Calca exactamente hooks/usePadrePagos.ts adaptado a pedidos de productos

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    getCatalogo,
    getHijosConProductos,
    getPedidosHijo,
    getMisPedidos as getMisPedidosService,
    crearPedido as crearPedidoService,
    crearPedidoLibre as crearPedidoLibreService,
    getPedido,
    generarQRPedido,
    getEstadoQRPedido,
} from '@/services/padreProductosService';
import type {
    Producto,
    PedidoProducto,
    ItemPedido,
    QRProductoGeneradoData,
    EstadoQRProductoResponse,
    FiltrosProducto,
    HijoProductoInfo,
} from '@/types/productos';

// ⚠️ Solo confirmar si es un pago real — no confiar en cualquier PAGADO suelto
function esPagoReal(estado: EstadoQRProductoResponse): boolean {
    return String(estado?.estado ?? '').toUpperCase() === 'PAGADO';
}

// =============================================
// HOOK: HIJOS CON RESUMEN DE PEDIDOS (pantalla de selección)
// =============================================
export const useHijosConProductos = () => {
    const [hijos, setHijos] = useState<HijoProductoInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getHijosConProductos();
            setHijos(data.hijos);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar tus hijos');
            toast.error(err.response?.data?.message || 'Error al cargar tus hijos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { hijos, isLoading, error, refrescar: cargar };
};


// =============================================
// HOOK: CATÁLOGO
// =============================================
export const useCatalogoProductos = (filtros?: FiltrosProducto) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCatalogo(filtros);
            setProductos(data.productos);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el catálogo');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filtros)]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { productos, loading, error, recargar: cargar };
};

// =============================================
// HOOK: CARRITO (client-side, no persiste en backend hasta crear el pedido)
// =============================================
export const useCarritoProductos = () => {
    const [items, setItems] = useState<ItemPedido[]>([]);

    const agregarItem = useCallback((item: ItemPedido) => {
        setItems((prev: ItemPedido[]) => {
            const existente = prev.find((i: ItemPedido) => i.producto_variante_id === item.producto_variante_id);
            if (existente) {
                return prev.map((i: ItemPedido) =>
                    i.producto_variante_id === item.producto_variante_id
                        ? { ...i, cantidad: i.cantidad + item.cantidad }
                        : i
                );
            }
            return [...prev, item];
        });
    }, []);

    const quitarItem = useCallback((productoVarianteId: number) => {
        setItems((prev: ItemPedido[]) => prev.filter((i: ItemPedido) => i.producto_variante_id !== productoVarianteId));
    }, []);

    const actualizarCantidad = useCallback((productoVarianteId: number, cantidad: number) => {
        if (cantidad <= 0) {
            setItems((prev: ItemPedido[]) => prev.filter((i: ItemPedido) => i.producto_variante_id !== productoVarianteId));
            return;
        }
        setItems((prev: ItemPedido[]) => prev.map((i: ItemPedido) => (i.producto_variante_id === productoVarianteId ? { ...i, cantidad } : i)));
    }, []);

    const vaciarCarrito = useCallback(() => setItems([]), []);

    const total = items.reduce((sum: number, i: ItemPedido) => sum + (i.precio_unitario ?? 0) * i.cantidad, 0);

    return { items, agregarItem, quitarItem, actualizarCantidad, vaciarCarrito, total };
};

// =============================================
// HOOK: PEDIDOS DE UN HIJO
// =============================================
export const usePedidosHijo = (estudianteId: number | null) => {
    const [pedidos, setPedidos] = useState<PedidoProducto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        if (!estudianteId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getPedidosHijo(estudianteId);
            setPedidos(data.pedidos);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    }, [estudianteId]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const crearPedido = useCallback(
        async (items: ItemPedido[]) => {
            if (!estudianteId) throw new Error('Falta el estudiante');
            const pedido = await crearPedidoService(estudianteId, {
                items: items.map((i: ItemPedido) => ({ producto_variante_id: i.producto_variante_id, cantidad: i.cantidad })),
            });
            await cargar();
            return pedido;
        },
        [estudianteId, cargar]
    );

    return { pedidos, loading, error, recargar: cargar, crearPedido };
};

// =============================================
// HOOK: PEDIDO LIBRE (sin hijo obligatorio)
// =============================================
export const usePedidoLibre = () => {
    const crearPedido = useCallback(
        async (items: ItemPedido[], estudianteId?: number) => {
            const pedido = await crearPedidoLibreService({
                items: items.map((i: ItemPedido) => ({ producto_variante_id: i.producto_variante_id, cantidad: i.cantidad })),
                ...(estudianteId ? { estudiante_id: estudianteId } : {}),
            });
            return pedido;
        },
        []
    );

    return { crearPedido };
};

// =============================================
// HOOK: MIS PEDIDOS (todos los pedidos del padre logueado)
// =============================================
export const useMisPedidos = (filtros?: { estado?: string }) => {
    const [pedidos, setPedidos] = useState<PedidoProducto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMisPedidosService(filtros);
            setPedidos(data.pedidos);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    }, [filtros?.estado]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { pedidos, loading, error, recargar: cargar };
};

// =============================================
// HOOK: QR DE PAGO PARA UN PEDIDO
// Mismo comportamiento que useQRPago: delay inicial de 15s antes de
// arrancar el polling (para que SIP ya haya registrado el QR nuevo),
// luego chequea cada 8s.
// =============================================
export const useQRPagoProducto = (pedidoId: number | null, autoGenerar: boolean = true) => {
    const [qrData, setQrData] = useState<QRProductoGeneradoData | null>(null);
    const [estadoQR, setEstadoQR] = useState<EstadoQRProductoResponse | null>(null);
    const [isGenerando, setIsGenerando] = useState(false);
    const [isVerificando, setIsVerificando] = useState(false);
    const [pagado, setPagado] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const detenerPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const generarQR = useCallback(async () => {
        if (!pedidoId) return;
        setIsGenerando(true);
        try {
            const data = await generarQRPedido(pedidoId);
            setQrData(data);
            if (data.qr_existente) {
                toast('Ya tenías un QR activo para este pedido', { icon: 'ℹ️' });
            } else {
                toast.success('QR generado. Escanealo con la app de tu banco.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No se pudo generar el QR. Intentá de nuevo.');
        } finally {
            setIsGenerando(false);
        }
    }, [pedidoId]);

    const verificarEstado = useCallback(async () => {
        if (!pedidoId) return;
        setIsVerificando(true);
        try {
            const estado = await getEstadoQRPedido(pedidoId);
            setEstadoQR(estado);
            if (esPagoReal(estado)) {
                setPagado(true);
                detenerPolling();
                toast.success('¡Pago confirmado! Tu pedido está al día.');
            }
            return estado;
        } catch (error: any) {
            console.error('[useQRPagoProducto] Error verificando estado:', error.message);
        } finally {
            setIsVerificando(false);
        }
    }, [pedidoId, detenerPolling]);

    const iniciarPolling = useCallback(() => {
        if (intervalRef.current || timeoutRef.current) return;

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;

            (async () => {
                if (!pedidoId) return;
                try {
                    const estado = await getEstadoQRPedido(pedidoId);
                    setEstadoQR(estado);
                    if (esPagoReal(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago confirmado! Tu pedido está al día.');
                        return;
                    }
                } catch {
                    /* silencioso */
                }
            })();

            intervalRef.current = setInterval(async () => {
                if (!pedidoId) return;
                try {
                    const estado = await getEstadoQRPedido(pedidoId);
                    setEstadoQR(estado);
                    if (esPagoReal(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago confirmado! Tu pedido está al día.');
                    }
                } catch {
                    /* silencioso */
                }
            }, 8000);
        }, 15000);
    }, [pedidoId, detenerPolling]);

    useEffect(() => {
        if (qrData && !pagado) {
            iniciarPolling();
        } else {
            detenerPolling();
        }
        return () => detenerPolling();
    }, [qrData, pagado, iniciarPolling, detenerPolling]);

    useEffect(() => {
        if (pedidoId && autoGenerar) {
            generarQR();
        }
        return () => detenerPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoId, autoGenerar]);

    useEffect(() => {
        setQrData(null);
        setEstadoQR(null);
        setPagado(false);
        detenerPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoId]);

    return { qrData, estadoQR, pagado, isGenerando, isVerificando, generarQR, verificarEstado };
};

// =============================================
// HOOK: DETALLE DE UN PEDIDO
// =============================================
export const usePedidoProducto = (pedidoId: number | null) => {
    const [pedido, setPedido] = useState<PedidoProducto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        if (!pedidoId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getPedido(pedidoId);
            setPedido(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el pedido');
        } finally {
            setLoading(false);
        }
    }, [pedidoId]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { pedido, loading, error, recargar: cargar };
};