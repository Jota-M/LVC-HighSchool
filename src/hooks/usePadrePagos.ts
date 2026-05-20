// hooks/usePadrePagos.ts
// Hooks para el módulo de pagos del padre de familia

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
// HOOK: HIJOS CON RESUMEN DE PAGOS
// Página principal /dashboard/padre/pagos
// =============================================
export const useHijosConPagos = () => {
  const [hijos, setHijos]       = useState<HijoPagoInfo[]>([]);
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
// Página /dashboard/padre/pagos/[estudianteId]
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

  // Separadas por estado para facilitar la UI
  const pagadas    = mensualidades.filter(m => m.estado === 'pagado');
  const pendientes = mensualidades.filter(m => m.estado === 'pendiente' || m.estado === 'vencido');
  const otras      = mensualidades.filter(m => !['pagado', 'pendiente', 'vencido'].includes(m.estado));

  return {
    mensualidades,
    resumen,
    pagadas,
    pendientes,
    otras,
    isLoading,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: GENERAR Y GESTIONAR QR
// Página /dashboard/padre/pagos/[estudianteId]/pagar/[mensualidadId]
// =============================================
export const useQRPago = (
  mensualidadId: number | null,
  autoGenerar: boolean = true  // ← nuevo flag, por defecto true para no romper nada
) => {
  const [qrData, setQrData]               = useState<QRGeneradoData | null>(null);
  const [estadoQR, setEstadoQR]           = useState<EstadoQRResponse | null>(null);
  const [isGenerando, setIsGenerando]     = useState(false);
  const [isCancelando, setIsCancelando]   = useState(false);
  const [isVerificando, setIsVerificando] = useState(false);
  const [pagado, setPagado]               = useState(false);
 
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
 
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
 
  const verificarEstado = useCallback(async () => {
    if (!mensualidadId) return;
    setIsVerificando(true);
    try {
      const estado = await getEstadoQR(mensualidadId);
      setEstadoQR(estado);
      if (estado.estado === 'PAGADO') {
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
  }, [mensualidadId]);
 
  const iniciarPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      if (!mensualidadId) return;
      try {
        const estado = await getEstadoQR(mensualidadId);
        setEstadoQR(estado);
        if (estado.estado === 'PAGADO') {
          setPagado(true);
          detenerPolling();
          toast.success('¡Pago confirmado! Tu mensualidad está al día.');
        }
      } catch {
        // Silencioso
      }
    }, 5000);
  }, [mensualidadId]);
 
  const detenerPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);
 
  // Iniciar polling solo cuando hay QR activo
  useEffect(() => {
    if (qrData && !pagado) {
      iniciarPolling();
    } else {
      detenerPolling();
    }
    return () => detenerPolling();
  }, [qrData, pagado, iniciarPolling, detenerPolling]);
 
  // ── Auto-generar solo si autoGenerar=true ──────────────────────────
  // Para la página /pagar/[id] → autoGenerar: true (comportamiento original)
  // Para la página /pagar (múltiple) → autoGenerar: false (control manual)
  useEffect(() => {
    if (mensualidadId && autoGenerar) {
      generarQR();
    }
    return () => detenerPolling();
  }, [mensualidadId, autoGenerar]);
 
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
      toast.error(
        error.response?.data?.message || 'Error al cancelar el QR'
      );
    } finally {
      setIsCancelando(false);
    }
  }, [mensualidadId, detenerPolling]);
 
  // Limpiar estado al cambiar de mensualidad
  useEffect(() => {
    setQrData(null);
    setEstadoQR(null);
    setPagado(false);
    detenerPolling();
  }, [mensualidadId]);
 
  return {
    qrData,
    estadoQR,
    pagado,
    isGenerando,
    isCancelando,
    isVerificando,
    generarQR,
    cancelarQR,
    verificarEstado,
  };
};
export const useQRMultiple = () => {
  const [qrData, setQrData]             = useState<QRMultipleData | null>(null);
  const [estadoQR, setEstadoQR]         = useState<EstadoQRMultipleResponse | null>(null);
  const [isGenerando, setIsGenerando]   = useState(false);
  const [isCancelando, setIsCancelando] = useState(false);
  const [pagado, setPagado]             = useState(false);
 
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
 
  // ── Generar QR múltiple ───────────────────────────────────────────
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
 
  // ── Polling cada 5 segundos ───────────────────────────────────────
  const iniciarPolling = useCallback(() => {
    if (pollingRef.current || !qrData?.alias) return;
    pollingRef.current = setInterval(async () => {
      try {
        const estado = await getEstadoQRMultiple(qrData.alias);
        setEstadoQR(estado);
        if (estado.estado === 'PAGADO') {
          setPagado(true);
          detenerPolling();
          toast.success(`¡${qrData.cantidad_meses} mensualidades pagadas! Tu cuenta está al día.`);
        }
      } catch {
        // Silencioso
      }
    }, 5000);
  }, [qrData?.alias]);
 
  const detenerPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);
 
  // Iniciar polling cuando hay QR y no está pagado
  useEffect(() => {
    if (qrData && !pagado) {
      iniciarPolling();
    } else {
      detenerPolling();
    }
    return () => detenerPolling();
  }, [qrData, pagado, iniciarPolling, detenerPolling]);
 
  // ── Cancelar QR múltiple ──────────────────────────────────────────
  // Cancela todos los pago_mensualidad que tengan ese alias
  const cancelarQR = useCallback(async () => {
    if (!qrData?.mensualidad_ids) return;
    setIsCancelando(true);
    detenerPolling();
    try {
      // Cancelar cada mensualidad usando el endpoint individual existente
      await Promise.all(
        qrData.mensualidad_ids.map(id =>
          api.delete(`/padre/mensualidad/${id}/cancelar-qr`)
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
 
  // ── Limpiar al desmontar ──────────────────────────────────────────
  const resetear = useCallback(() => {
    detenerPolling();
    setQrData(null);
    setEstadoQR(null);
    setPagado(false);
  }, [detenerPolling]);
   return {
    qrData,
    estadoQR,
    pagado,
    isGenerando,
    isCancelando,
    generarQR,
    cancelarQR,
    resetear,
  };
};
