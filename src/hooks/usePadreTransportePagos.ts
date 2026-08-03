// hooks/usePadreTransportePagos.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    getHijosConTransporte,
    getCuotasTransporteHijo,
    generarQRTransporte,
    getEstadoQRTransporte,
    cancelarQRTransporte,
    generarQRFamiliarTransporte,
    getEstadoQRMultipleTransporte,
} from '@/services/padreTransportePagosService';
import type {
    HijoTransporteInfo,
    CuotaTransporteHijo,
    ResumenCuotasTransporte,
    QRTransporteGeneradoData,
    EstadoQRTransporteResponse,
    QRFamiliarTransporteData,
    EstadoQRMultipleTransporteResponse,
} from '@/types/padreTransportePagosTypes';

// =============================================
// HELPER: determina si un estado PAGADO es real
// Mismo criterio que mensualidades — evita falsos
// positivos con QRs viejos en SIP
// =============================================
function esPagoRealTransporte(
    estado: EstadoQRTransporteResponse | EstadoQRMultipleTransporteResponse
): boolean {
    const data = estado as any;
    const estadoQr = String(data.estado ?? '').toUpperCase();
    const cuotas = Array.isArray(data.cuotas) ? data.cuotas : [];
    const hayCuotasPagadas = cuotas.length > 0
        && cuotas.every((c: any) => String(c.estado ?? '').toLowerCase() === 'pagado');

    return (
        estadoQr === 'PAGADO'
        || data.pagado === true
        || data.en_nuestra_bd === true
        || hayCuotasPagadas
    );
}

// =============================================
// HOOK: HIJOS CON TRANSPORTE ASIGNADO
// =============================================
export const useHijosConTransporte = () => {
    const [hijos, setHijos] = useState<HijoTransporteInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const cargar = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getHijosConTransporte();
            setHijos(data.hijos);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Error al cargar los datos de transporte de tus hijos'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    return { hijos, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: CUOTAS DE TRANSPORTE DE UN HIJO
// =============================================
export const useCuotasTransporteHijo = (estudianteId: number | null) => {
    const [cuotas, setCuotas] = useState<CuotaTransporteHijo[]>([]);
    const [resumen, setResumen] = useState<ResumenCuotasTransporte>({
        total: 0, pagadas: 0, pendientes: 0, vencidas: 0, monto_pendiente: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const cargar = useCallback(async () => {
        if (!estudianteId) return;
        setIsLoading(true);
        try {
            const data = await getCuotasTransporteHijo(estudianteId);
            setCuotas(data.cuotas);
            setResumen(data.resumen);
        } catch (error: any) {
            if (error.response?.status !== 404) {
                toast.error('Error al cargar las cuotas de transporte');
            }
            setCuotas([]);
        } finally {
            setIsLoading(false);
        }
    }, [estudianteId]);

    useEffect(() => { cargar(); }, [cargar]);

    const pagadas = cuotas.filter(c => c.estado === 'pagado');
    const pendientes = cuotas.filter(c => c.estado === 'pendiente' || c.estado === 'vencido');
    const otras = cuotas.filter(c => !['pagado', 'pendiente', 'vencido'].includes(c.estado));

    return { cuotas, resumen, pagadas, pendientes, otras, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: GENERAR Y GESTIONAR QR INDIVIDUAL
// =============================================
export const useQRPagoTransporte = (
    pagoId: number | null,
    autoGenerar: boolean = true
) => {
    const [qrData, setQrData] = useState<QRTransporteGeneradoData | null>(null);
    const [estadoQR, setEstadoQR] = useState<EstadoQRTransporteResponse | null>(null);
    const [isGenerando, setIsGenerando] = useState(false);
    const [isCancelando, setIsCancelando] = useState(false);
    const [isVerificando, setIsVerificando] = useState(false);
    const [pagado, setPagado] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const detenerPolling = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    }, []);

    const generarQR = useCallback(async () => {
        if (!pagoId) return;
        setIsGenerando(true);
        try {
            const data = await generarQRTransporte(pagoId);
            setQrData(data);
            if (data.qr_existente) {
                toast('Ya tenías un QR activo para esta cuota', { icon: 'ℹ️' });
            } else {
                toast.success('QR generado. Escanealo con la app de tu banco.');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'No se pudo generar el QR. Intentá de nuevo.'
            );
        } finally {
            setIsGenerando(false);
        }
    }, [pagoId]);

    const verificarEstado = useCallback(async () => {
        if (!pagoId) return;
        setIsVerificando(true);
        try {
            const estado = await getEstadoQRTransporte(pagoId);
            setEstadoQR(estado);

            if (esPagoRealTransporte(estado)) {
                setPagado(true);
                detenerPolling();
                toast.success('¡Pago confirmado! Tu cuota de transporte está al día.');
            }
            return estado;
        } catch (error: any) {
            console.error('[useQRPagoTransporte] Error verificando estado:', error.message);
        } finally {
            setIsVerificando(false);
        }
    }, [pagoId, detenerPolling]);

    // Polling con delay inicial de 15 segundos — mismo criterio que mensualidades
    const iniciarPolling = useCallback(() => {
        if (intervalRef.current || timeoutRef.current) return;

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;

            (async () => {
                if (!pagoId) return;
                try {
                    const estado = await getEstadoQRTransporte(pagoId);
                    setEstadoQR(estado);
                    if (esPagoRealTransporte(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago confirmado! Tu cuota de transporte está al día.');
                        return;
                    }
                } catch { /* silencioso */ }
            })();

            intervalRef.current = setInterval(async () => {
                if (!pagoId) return;
                try {
                    const estado = await getEstadoQRTransporte(pagoId);
                    setEstadoQR(estado);
                    if (esPagoRealTransporte(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago confirmado! Tu cuota de transporte está al día.');
                    }
                } catch { /* silencioso */ }
            }, 8000);

        }, 15000);
    }, [pagoId, detenerPolling]);

    useEffect(() => {
        if (qrData && !pagado) {
            iniciarPolling();
        } else {
            detenerPolling();
        }
        return () => detenerPolling();
    }, [qrData, pagado, iniciarPolling, detenerPolling]);

    useEffect(() => {
        if (pagoId && autoGenerar) {
            generarQR();
        }
        return () => detenerPolling();
    }, [pagoId, autoGenerar]);

    const cancelarQR = useCallback(async () => {
        if (!pagoId) return;
        setIsCancelando(true);
        detenerPolling();
        try {
            await cancelarQRTransporte(pagoId);
            setQrData(null);
            setEstadoQR(null);
            toast.success('QR cancelado. Podés generar uno nuevo cuando quieras.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cancelar el QR');
        } finally {
            setIsCancelando(false);
        }
    }, [pagoId, detenerPolling]);

    useEffect(() => {
        setQrData(null);
        setEstadoQR(null);
        setPagado(false);
        detenerPolling();
    }, [pagoId]);

    return {
        qrData, estadoQR, pagado,
        isGenerando, isCancelando, isVerificando,
        generarQR, cancelarQR, verificarEstado,
    };
};

// =============================================
// HOOK: QR FAMILIAR (2+ cuotas, mismo hijo o varios)
// =============================================
export const useQRFamiliarTransporte = () => {
    const [qrData, setQrData] = useState<QRFamiliarTransporteData | null>(null);
    const [estadoQR, setEstadoQR] = useState<EstadoQRMultipleTransporteResponse | null>(null);
    const [isGenerando, setIsGenerando] = useState(false);
    const [isCancelando, setIsCancelando] = useState(false);
    const [pagado, setPagado] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const detenerPolling = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    }, []);

    const generarQR = useCallback(async (pagoIds: number[]) => {
        setIsGenerando(true);
        setQrData(null);
        setPagado(false);
        try {
            const data = await generarQRFamiliarTransporte(pagoIds);
            setQrData(data);
            toast.success(`QR generado para ${pagoIds.length} cuota(s) de transporte`);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'No se pudo generar el QR. Intentá de nuevo.'
            );
        } finally {
            setIsGenerando(false);
        }
    }, []);

    const verificarEstado = useCallback(async () => {
        if (!qrData?.alias) return null;
        try {
            const estado = await getEstadoQRMultipleTransporte(qrData.alias);
            setEstadoQR(estado);

            if (esPagoRealTransporte(estado)) {
                setPagado(true);
                detenerPolling();
                toast.success('¡Pago de transporte confirmado! Tu cuenta está al día.');
            } else {
                toast('El banco todavía no confirmó el pago.', { icon: 'ℹ️' });
            }

            return estado;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No se pudo verificar el pago.');
            return null;
        }
    }, [qrData?.alias, detenerPolling]);

    const iniciarPolling = useCallback(() => {
        if (intervalRef.current || timeoutRef.current || !qrData?.alias) return;

        const alias = qrData.alias;

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;

            (async () => {
                try {
                    const estado = await getEstadoQRMultipleTransporte(alias);
                    setEstadoQR(estado);
                    if (esPagoRealTransporte(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago de transporte confirmado! Tu cuenta está al día.');
                        return;
                    }
                } catch { /* silencioso */ }
            })();

            intervalRef.current = setInterval(async () => {
                try {
                    const estado = await getEstadoQRMultipleTransporte(alias);
                    setEstadoQR(estado);
                    if (esPagoRealTransporte(estado)) {
                        setPagado(true);
                        detenerPolling();
                        toast.success('¡Pago de transporte confirmado! Tu cuenta está al día.');
                    }
                } catch { /* silencioso */ }
            }, 8000);

        }, 15000);
    }, [qrData?.alias, detenerPolling]);

    useEffect(() => {
        if (qrData && !pagado) iniciarPolling();
        else detenerPolling();
        return () => detenerPolling();
    }, [qrData, pagado, iniciarPolling, detenerPolling]);

    // Cancelación: loop de cancelaciones individuales (mismo patrón que mensualidades)
    const cancelarQR = useCallback(async () => {
        if (!qrData?.pago_ids) return;
        setIsCancelando(true);
        detenerPolling();
        try {
            await Promise.all(
                qrData.pago_ids.map(id => cancelarQRTransporte(id))
            );
            setQrData(null);
            setEstadoQR(null);
            setPagado(false);
            toast.success('QR cancelado. Podés seleccionar nuevas cuotas.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cancelar el QR');
        } finally {
            setIsCancelando(false);
        }
    }, [qrData, detenerPolling]);

    const resetear = useCallback(() => {
        detenerPolling();
        setQrData(null);
        setEstadoQR(null);
        setPagado(false);
    }, [detenerPolling]);

    return {
        qrData, estadoQR, pagado,
        isGenerando, isCancelando,
        generarQR, cancelarQR, verificarEstado, resetear,
    };
};