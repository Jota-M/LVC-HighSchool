// hooks/usePadreAsistencia.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getHijosDelPadre,
  getResumenAsistencia,
  getHistorialAsistencia,
  getPermisosDelHijo,
  getDetallePermiso,
  crearPermiso,
  cancelarPermiso,
} from '@/services/padreAsistenciaService';
import {
  HijoInfo,
  ResumenAsistenciaHijo,
  AsistenciaHijo,
  SolicitudPermisoHijo,
  HistorialPermisoItem,
  CrearPermisoHijoDTO,
  FiltrosHistorialAsistencia,
  FiltrosPermisosHijo,
  Paginacion,
} from '@/types/padreAsistenciaTypes';

// =============================================
// HOOK: HIJOS DEL PADRE
// =============================================

export const useHijosDelPadre = () => {
  const [hijos, setHijos]           = useState<HijoInfo[]>([]);
  const [hijoActivo, setHijoActivo] = useState<HijoInfo | null>(null);
  const [isLoading, setIsLoading]   = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getHijosDelPadre();
      setHijos(res.data.hijos);
      if (res.data.hijos.length > 0 && !hijoActivo) {
        setHijoActivo(res.data.hijos[0]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar los datos del estudiante');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { hijos, hijoActivo, setHijoActivo, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: RESUMEN DE ASISTENCIA DEL HIJO
// =============================================

export const useResumenAsistencia = (matriculaId: number | null) => {
  const [resumen, setResumen]     = useState<ResumenAsistenciaHijo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async (id: number, opts?: { fecha_inicio?: string; fecha_fin?: string }) => {
    setIsLoading(true);
    try {
      const data = await getResumenAsistencia(id, opts);
      setResumen(data);
    } catch (error: any) {
      // 404 puede significar que no hay registros aún — no es error crítico
      if (error.response?.status !== 404) {
        toast.error('Error al cargar el resumen de asistencia');
      }
      setResumen(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (matriculaId) cargar(matriculaId);
  }, [matriculaId, cargar]);

  const materiasEnRiesgo = resumen?.por_materia.filter(m => m.en_riesgo) ?? [];

  return { resumen, isLoading, materiasEnRiesgo, refrescar: (opts?: any) => matriculaId && cargar(matriculaId, opts) };
};

// =============================================
// HOOK: HISTORIAL DE ASISTENCIA
// =============================================

export const useHistorialAsistencia = (matriculaIdInicial: number | null) => {
  const [asistencias, setAsistencias]   = useState<AsistenciaHijo[]>([]);
  const [paginacion, setPaginacion]     = useState<Paginacion>({ total: 0, page: 1, limit: 15, totalPages: 0 });
  const [isLoading, setIsLoading]       = useState(false);
  const [filtros, setFiltros]           = useState<FiltrosHistorialAsistencia>({
    matricula_id:  matriculaIdInicial ?? 0,
    page:          1,
    limit:         15,
  });

  const cargar = useCallback(async (f: FiltrosHistorialAsistencia) => {
    if (!f.matricula_id) return;
    setIsLoading(true);
    try {
      const { asistencias: data, paginacion: pag } = await getHistorialAsistencia(f);
      setAsistencias(data);
      setPaginacion(pag);
    } catch (error: any) {
      toast.error('Error al cargar el historial de asistencia');
      setAsistencias([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filtros.matricula_id) cargar(filtros);
  }, [filtros, cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosHistorialAsistencia>) => {
    setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const cambiarPagina = useCallback((page: number) => {
    setFiltros(prev => ({ ...prev, page }));
  }, []);

  // Actualizar matricula_id cuando cambia el hijo activo
  const setMatriculaId = useCallback((id: number) => {
    setFiltros(prev => ({ ...prev, matricula_id: id, page: 1 }));
  }, []);

  return {
    asistencias,
    paginacion,
    filtros,
    isLoading,
    actualizarFiltros,
    cambiarPagina,
    setMatriculaId,
    refrescar: () => cargar(filtros),
  };
};

// =============================================
// HOOK: PERMISOS DEL HIJO
// =============================================

export const usePermisosHijo = (estudianteId: number | null) => {
  const [solicitudes, setSolicitudes]   = useState<SolicitudPermisoHijo[]>([]);
  const [paginacion, setPaginacion]     = useState<Paginacion>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filtros, setFiltros]           = useState<FiltrosPermisosHijo>({ page: 1, limit: 10 });
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!estudianteId) return;
    setIsLoading(true);
    try {
      const { solicitudes: data, paginacion: pag } = await getPermisosDelHijo(estudianteId, filtros);
      setSolicitudes(data);
      setPaginacion(pag);
    } catch (error: any) {
      toast.error('Error al cargar los permisos');
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  }, [estudianteId, filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosPermisosHijo>) => {
    setFiltros(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const crear = useCallback(async (
    data: CrearPermisoHijoDTO,
    archivo?: File
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await crearPermiso(data, archivo);
      toast.success('Solicitud de permiso enviada correctamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al enviar la solicitud';
      toast.error(msg.includes('Ya existe') ? 'Ya existe una solicitud activa para esa fecha' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const cancelar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await cancelarPermiso(id);
      toast.success('Solicitud cancelada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar la solicitud');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const pendientes  = solicitudes.filter(s => s.estado === 'pendiente');
  const aprobados   = solicitudes.filter(s => s.estado === 'aprobada');
  const rechazados  = solicitudes.filter(s => s.estado === 'rechazada');

  return {
    solicitudes,
    paginacion,
    filtros,
    isLoading,
    isSubmitting,
    pendientes,
    aprobados,
    rechazados,
    actualizarFiltros,
    crear,
    cancelar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: DETALLE DE UN PERMISO
// =============================================

export const useDetallePermiso = (id: number | null) => {
  const [solicitud, setSolicitud]   = useState<SolicitudPermisoHijo | null>(null);
  const [historial, setHistorial]   = useState<HistorialPermisoItem[]>([]);
  const [isLoading, setIsLoading]   = useState(false);

  useEffect(() => {
    if (!id) { setSolicitud(null); setHistorial([]); return; }
    setIsLoading(true);
    getDetallePermiso(id)
      .then(({ solicitud: s, historial: h }) => { setSolicitud(s); setHistorial(h); })
      .catch(() => toast.error('Error al cargar el detalle del permiso'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { solicitud, historial, isLoading };
};