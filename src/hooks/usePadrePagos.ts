// hooks/usePadrePagos.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  getHijosConPagos,
  getMensualidadesHijo,
  generarQRMensualidad,
  getEstadoQR,
  cancelarQRMensualidad,
  generarQRMultiple,
  getEstadoQRMultiple,
} from '@/services/padrePagosService';
import type {
  HijoPagoInfo,
  MensualidadHijo,
  ResumenMensualidades,
  QRGeneradoData,
  EstadoQRResponse,
  QRMultipleData,
  EstadoQRMultipleResponse,
} from '@/types/padrePagosTypes';
import api from '@/lib/api';

// =============================================
// HELPER: determina si un estado PAGADO es real
// Evita falsos positivos con QRs viejos en SIP
// Un PAGADO es real solo si:
//   - el callback ya llegó y la BD está actualizada (en_nuestra_bd: true)
//   - o SIP devolvió datos_pago con monto (pago real confirmado)
// =============================================
function esPagoReal(estado: EstadoQRResponse | EstadoQRMultipleResponse): boolean {
  if (estado.estado !== 'PAGADO') return false;
  return estado.en_nuestra_bd === true || !!estado.datos_pago?.monto;
}

// =============================================
// HOOK: HIJOS CON RESUMEN DE PAGOS
// =============================================
export const useHijosConPagos = () => {
  const [hijos, setHijos]         = useState<HijoPagoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getHijosConPagos();
      setHijos(data.hijos);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al cargar los datos de tus hijos'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { hijos, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: MENSUALIDADES DE UN HIJO
// =============================================
export const useMensualidadesHijo = (estudianteId: number | null) => {
  const [mensualidades, setMensualidades] = useState<MensualidadHijo[]>([]);
  const [resumen, setResumen] = useState<ResumenMensualidades>({
    total: 0, pagadas: 0, pendientes: 0, vencidas: 0, monto_pendiente: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!estudianteId) return;
    setIsLoading(true);
    try {
      const data = await getMensualidadesHijo(estudianteId);
      setMensualidades(data.mensualidades);
      setResumen(data.resumen);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Error al cargar las mensualidades');
      }
      setMensualidades([]);
    } finally {
      setIsLoading(false);
    }
  }, [estudianteId]);

  useEffect(() => { cargar(); }, [cargar]);

  const pagadas    = mensualidades.filter(m => m.estado === 'pagado');
  const pendientes = mensualidades.filter(m => m.estado === 'pendiente' || m.estado === 'vencido');
  const otras      = mensualidades.filter(m => !['pagado', 'pendiente', 'vencido'].includes(m.estado));

  return { mensualidades, resumen, pagadas, pendientes, otras, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: GENERAR Y GESTIONAR QR INDIVIDUAL
// =============================================
export const useQRPago = (
  mensualidadId: number | null,
  autoGenerar:   boolean = true
) => {
  const [qrData, setQrData]               = useState<QRGeneradoData | null>(null);
  const [estadoQR, setEstadoQR]           = useState<EstadoQRResponse | null>(null);
  const [isGenerando, setIsGenerando]     = useState(false);
  const [isCancelando, setIsCancelando]   = useState(false);
  const [isVerificando, setIsVerificando] = useState(false);
  const [pagado, setPagado]               = useState(false);

  // Usamos un ref para el intervalo Y para el timeout inicial
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef  = useRef<NodeJS.Timeout | null>(null);

  // ── Limpiar todo ────────────────────────────────────────────────
  const detenerPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current);   timeoutRef.current  = null; }
  }, []);

  // ── Generar QR ──────────────────────────────────────────────────
  const generarQR = useCallback(async () => {
    if (!mensualidadId) return;
    setIsGenerando(true);
    try {
      const data = await generarQRMensualidad(mensualidadId);
      setQrData(data);
      if (data.qr_existente) {
        toast('Ya tenías un QR activo para esta mensualidad', { icon: 'ℹ️' });
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
  }, [mensualidadId]);

  // ── Verificar estado (botón manual) ─────────────────────────────
  const verificarEstado = useCallback(async () => {
    if (!mensualidadId) return;
    setIsVerificando(true);
    try {
      const estado = await getEstadoQR(mensualidadId);
      setEstadoQR(estado);

      // ⚠️ Solo confirmar si es un pago real — no confiar en cualquier PAGADO
      if (esPagoReal(estado)) {
        setPagado(true);
        detenerPolling();
        toast.success('¡Pago confirmado! Tu mensualidad está al día.');
      }
      return estado;
    } catch (error: any) {
      console.error('[useQRPago] Error verificando estado:', error.message);
    } finally {
      setIsVerificando(false);
    }
  }, [mensualidadId, detenerPolling]);

  // ── Polling con delay inicial de 15 segundos ─────────────────────
  // El delay evita que el primer check llegue antes de que SIP registre
  // el QR nuevo, y confunda el estado con un QR viejo del mismo alias
  const iniciarPolling = useCallback(() => {
    if (intervalRef.current || timeoutRef.current) return;

    console.log('[useQRPago] Polling iniciará en 15 segundos...');

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      // Primer check inmediato al terminar el delay
      (async () => {
        if (!mensualidadId) return;
        try {
          const estado = await getEstadoQR(mensualidadId);
          setEstadoQR(estado);
          if (esPagoReal(estado)) {
            setPagado(true);
            detenerPolling();
            toast.success('¡Pago confirmado! Tu mensualidad está al día.');
            return;
          }
        } catch { /* silencioso */ }
      })();

      // Luego cada 8 segundos
      intervalRef.current = setInterval(async () => {
        if (!mensualidadId) return;
        try {
          const estado = await getEstadoQR(mensualidadId);
          setEstadoQR(estado);
          if (esPagoReal(estado)) {
            setPagado(true);
            detenerPolling();
            toast.success('¡Pago confirmado! Tu mensualidad está al día.');
          }
        } catch { /* silencioso */ }
      }, 8000);

    }, 15000); // 15 segundos de delay inicial
  }, [mensualidadId, detenerPolling]);

  // Arrancar polling cuando hay QR y no está pagado
  useEffect(() => {
    if (qrData && !pagado) {
      iniciarPolling();
    } else {
      detenerPolling();
    }
    return () => detenerPolling();
  }, [qrData, pagado, iniciarPolling, detenerPolling]);

  // Auto-generar al montar
  useEffect(() => {
    if (mensualidadId && autoGenerar) {
      generarQR();
    }
    return () => detenerPolling();
  }, [mensualidadId, autoGenerar]);

  // ── Cancelar QR ─────────────────────────────────────────────────
  const cancelarQR = useCallback(async () => {
    if (!mensualidadId) return;
    setIsCancelando(true);
    detenerPolling();
    try {
      await cancelarQRMensualidad(mensualidadId);
      setQrData(null);
      setEstadoQR(null);
      toast.success('QR cancelado. Podés generar uno nuevo cuando quieras.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar el QR');
    } finally {
      setIsCancelando(false);
    }
  }, [mensualidadId, detenerPolling]);

  // Limpiar al cambiar de mensualidad
  useEffect(() => {
    setQrData(null);
    setEstadoQR(null);
    setPagado(false);
    detenerPolling();
  }, [mensualidadId]);

  return {
    qrData, estadoQR, pagado,
    isGenerando, isCancelando, isVerificando,
    generarQR, cancelarQR, verificarEstado,
  };
};

// =============================================
// HOOK: QR MÚLTIPLE
// =============================================
export const useQRMultiple = () => {
  const [qrData, setQrData]             = useState<QRMultipleData | null>(null);
  const [estadoQR, setEstadoQR]         = useState<EstadoQRMultipleResponse | null>(null);
  const [isGenerando, setIsGenerando]   = useState(false);
  const [isCancelando, setIsCancelando] = useState(false);
  const [pagado, setPagado]             = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef  = useRef<NodeJS.Timeout | null>(null);

  const detenerPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current);   timeoutRef.current  = null; }
  }, []);

  const generarQR = useCallback(async (
    mensualidadIds: number[],
    estudianteId:   number
  ) => {
    setIsGenerando(true);
    setQrData(null);
    setPagado(false);
    try {
      const data = await generarQRMultiple(mensualidadIds, estudianteId);
      setQrData(data);
      toast.success(`QR generado para ${data.cantidad_meses} mensualidades. ¡Escanealo con tu banco!`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'No se pudo generar el QR. Intentá de nuevo.'
      );
    } finally {
      setIsGenerando(false);
    }
  }, []);

  // Polling con delay de 15 segundos — igual que el individual
  const iniciarPolling = useCallback(() => {
    if (intervalRef.current || timeoutRef.current || !qrData?.alias) return;

    console.log('[useQRMultiple] Polling iniciará en 15 segundos...');

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      (async () => {
        if (!qrData?.alias) return;
        try {
          const estado = await getEstadoQRMultiple(qrData.alias);
          setEstadoQR(estado);
          if (esPagoReal(estado)) {
            setPagado(true);
            detenerPolling();
            toast.success(`¡${qrData.cantidad_meses} mensualidades pagadas! Tu cuenta está al día.`);
            return;
          }
        } catch { /* silencioso */ }
      })();

      intervalRef.current = setInterval(async () => {
        if (!qrData?.alias) return;
        try {
          const estado = await getEstadoQRMultiple(qrData.alias);
          setEstadoQR(estado);
          if (esPagoReal(estado)) {
            setPagado(true);
            detenerPolling();
            toast.success(`¡${qrData.cantidad_meses} mensualidades pagadas! Tu cuenta está al día.`);
          }
        } catch { /* silencioso */ }
      }, 8000);

    }, 15000);
  }, [qrData?.alias, qrData?.cantidad_meses, detenerPolling]);

  useEffect(() => {
    if (qrData && !pagado) {
      iniciarPolling();
    } else {
      detenerPolling();
    }
    return () => detenerPolling();
  }, [qrData, pagado, iniciarPolling, detenerPolling]);

  const cancelarQR = useCallback(async () => {
    if (!qrData?.mensualidad_ids) return;
    setIsCancelando(true);
    detenerPolling();
    try {
      await Promise.all(
        qrData.mensualidad_ids.map(id =>
          api.delete(`/padre-p/mensualidad/${id}/cancelar-qr`)
        )
      );
      setQrData(null);
      setEstadoQR(null);
      setPagado(false);
      toast.success('QR cancelado. Podés seleccionar nuevas mensualidades.');
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
    generarQR, cancelarQR, resetear,
  };
};