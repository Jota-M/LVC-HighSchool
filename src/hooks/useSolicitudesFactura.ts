// hooks/useSolicitudesFactura.ts
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface SolicitudFactura {
    id: number;
    pago_mensualidad_id: number;
    pago_mensualidad_ids?: number[];
    transaccion_id?: string;
    estado: 'pendiente' | 'completada';
    factura_url?: string;
    fecha_solicitud: string;
    fecha_subida?: string;
    mes_correspondiente: string;
    codigo_pago: string;
    monto_pagado: number;
    monto_total?: number;
    cantidad_cuotas?: number;
    meses_cubiertos?: string[];
}

type SolicitudMap = Record<number, SolicitudFactura>;

export function useSolicitudesFactura() {
    const [solicitudes, setSolicitudes] = useState<SolicitudFactura[]>([]);
    const [solicitudMap, setSolicitudMap] = useState<SolicitudMap>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/padre-p/solicitudes-factura');

            if (data.success) {
                const lista: SolicitudFactura[] = data.data.solicitudes;
                setSolicitudes(lista);

                const map: SolicitudMap = {};
                lista.forEach(s => {
                    map[s.pago_mensualidad_id] = s;
                    if (s.pago_mensualidad_ids && Array.isArray(s.pago_mensualidad_ids)) {
                        s.pago_mensualidad_ids.forEach(pid => {
                            map[pid] = s;
                        });
                    }
                });
                setSolicitudMap(map);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const solicitarFactura = useCallback(async (pago_id: number): Promise<boolean> => {
        const { data } = await api.post(`/padre-p/pago/${pago_id}/solicitar-factura`);

        if (data.success) {
            await cargar();
            return true;
        }
        throw new Error(data.message);
    }, [cargar]);

    /**
     * Descarga el comprobante digital de un pago como PDF.
     * Usa la instancia `api` (axios) para que el token JWT
     * se adjunte automáticamente via interceptor.
     * Abre el PDF en una nueva pestaña.
     */
    const descargarRecibo = useCallback(async (pago_id: number): Promise<void> => {
        const response = await api.get(`/padre-p/pago/${pago_id}/recibo-pdf`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectUrl;
        link.target = '_blank';
        link.click();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    }, []);

    return { solicitudes, solicitudMap, isLoading, error, cargar, solicitarFactura, descargarRecibo };
}