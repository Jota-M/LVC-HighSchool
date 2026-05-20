// hooks/useNotificaciones.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { notificacionService, bandejaService } from '@/services/notificacionService';
import {
  NotificacionInstitucional,
  NotificacionBandeja,
  ResumenEnvioCanal,
  NotificacionFiltros,
  CrearNotificacionDTO,
  Paginacion,
} from '@/types/notificacionTypes';

// =============================================
// HOOK: LISTADO (secretaria / admin)
// =============================================

export const useNotificaciones = (filtrosIniciales: NotificacionFiltros = {}) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionInstitucional[]>([]);
  const [paginacion, setPaginacion]         = useState<Paginacion>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFilters]               = useState<NotificacionFiltros>({ page: 1, limit: 20, ...filtrosIniciales });
  const [isLoading, setIsLoading]           = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificacionService.listar(filters);
      setNotificaciones(res.data.notificaciones);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar notificaciones');
      setNotificaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<NotificacionFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  // Crear en borrador
  const crear = useCallback(async (data: CrearNotificacionDTO): Promise<NotificacionInstitucional | null> => {
    setIsSubmitting(true);
    try {
      const res = await notificacionService.crear(data);
      toast.success('Notificación creada como borrador');
      await cargar();
      return res.data.notificacion;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear notificación');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  // Crear y enviar en un paso
  const crearYEnviar = useCallback(async (data: CrearNotificacionDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await notificacionService.crearYEnviar(data);
      toast.success('✅ Notificación creada y enviando a los destinatarios');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar notificación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  // Enviar borrador existente
  const enviar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await notificacionService.enviar(id);
      toast.success('📨 Notificación enviando en segundo plano');
      // Actualizar estado local optimistamente
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, estado: 'enviando' } : n)
      );
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await notificacionService.eliminar(id);
      toast.success('Notificación eliminada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    notificaciones,
    paginacion,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    crear,
    crearYEnviar,
    enviar,
    eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: DETALLE + RESUMEN DE ENVÍOS
// =============================================

export const useNotificacionDetalle = (id: number | null) => {
  const [notificacion, setNotificacion] = useState<NotificacionInstitucional | null>(null);
  const [resumen, setResumen]           = useState<ResumenEnvioCanal[]>([]);
  const [isLoading, setIsLoading]       = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await notificacionService.obtenerPorId(id);
      setNotificacion(res.data.notificacion);
      setResumen(res.data.resumen);
    } catch {
      toast.error('Error al cargar notificación');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Polling del resumen mientras está enviando
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (notificacion?.estado === 'enviando') {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await notificacionService.resumenEnvios(notificacion.id);
          setResumen(res.data.resumen);
          // Si ya terminó, recargar todo y detener polling
          const detalle = await notificacionService.obtenerPorId(notificacion.id);
          if (detalle.data.notificacion.estado !== 'enviando') {
            setNotificacion(detalle.data.notificacion);
            clearInterval(pollingRef.current!);
          }
        } catch { /* silencioso */ }
      }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [notificacion?.estado, notificacion?.id]);

  return { notificacion, resumen, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: BANDEJA INTERNA (campana 🔔)
// Usado por TODOS los roles (docente, padre, estudiante, etc.)
// =============================================

export const useBandeja = () => {
  const [notificaciones, setNotificaciones] = useState<NotificacionBandeja[]>([]);
  const [noLeidas, setNoLeidas]             = useState(0);
  const [isLoading, setIsLoading]           = useState(false);
  const [page, setPage]                     = useState(1);
  const [hayMas, setHayMas]                 = useState(false);
  const LIMIT = 20;

  const cargar = useCallback(async (soloNoLeidas = false, resetPage = true) => {
    const p = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setIsLoading(true);
    try {
      const res = await bandejaService.obtener({
        solo_no_leidas: soloNoLeidas,
        page: p,
        limit: LIMIT,
      });
      if (resetPage) {
        setNotificaciones(res.data.notificaciones);
      } else {
        setNotificaciones(prev => [...prev, ...res.data.notificaciones]);
      }
      setNoLeidas(res.data.no_leidas);
      setHayMas(res.data.notificaciones.length === LIMIT);
    } catch {
      toast.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { cargar(); }, []);

  const marcarLeido = useCallback(async (notificacion_id: number) => {
    try {
      await bandejaService.marcarLeido(notificacion_id);
      // Actualizar estado local optimistamente
      setNotificaciones(prev =>
        prev.map(n =>
          n.notificacion_id === notificacion_id
            ? { ...n, leido: true, leido_en: new Date().toISOString() }
            : n
        )
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    const noLeidasList = notificaciones.filter(n => !n.leido);
    await Promise.allSettled(
      noLeidasList.map(n => bandejaService.marcarLeido(n.notificacion_id))
    );
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    setNoLeidas(0);
  }, [notificaciones]);

  const cargarMas = useCallback(() => {
    const siguiente = page + 1;
    setPage(siguiente);
    cargar(false, false);
  }, [page, cargar]);

  return {
    notificaciones,
    noLeidas,
    isLoading,
    hayMas,
    marcarLeido,
    marcarTodasLeidas,
    cargarMas,
    refrescar: () => cargar(false, true),
  };
};

// =============================================
// HOOK: CONTADOR NO LEÍDAS (para el ícono campana en navbar)
// Hace polling cada 60 segundos
// =============================================

export const useContadorNoLeidas = () => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await bandejaService.obtener({ solo_no_leidas: true, limit: 1 });
      setCount(res.data.no_leidas);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 300_000); // cada 5 minutos
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, refrescar: fetchCount };
};