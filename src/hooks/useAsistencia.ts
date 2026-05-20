// hooks/useAsistencia.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { solicitudPermisoService, asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import {
  SolicitudPermiso,
  HistorialPermiso,
  Asistencia,
  EstudianteDia,
  ReporteAsistencia,
  SolicitudPermisoFiltros,
  AsistenciaFiltros,
  CrearSolicitudPermisoDTO,
  CambiarEstadoPermisoDTO,
  CrearAsistenciaDTO,
  RegistroMasivoItem,
  ActualizarAsistenciaDTO,
  Paginacion,
  CorregirAsistenciaDTO,
  EstudianteReporteClase,
  ResumenClase,
} from '@/types/asistenciaTypes';

// =============================================
// HOOK: MIS ASIGNACIONES (docente autenticado)
// =============================================
// Llama a GET /api/asistencia/mis-asignaciones?fecha=X
// El backend resuelve token → usuario_id → docente automáticamente.

export const useMisAsignaciones = () => {
  const [asignaciones, setAsignaciones]       = useState<AsignacionDocente[]>([]);
  const [fecha, setFecha]                     = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading]             = useState(false);
  const [sinAsignaciones, setSinAsignaciones] = useState(false);
 
  // ✅ FIX: ref para que refrescar() siempre lea la fecha más reciente
  const fechaRef = useRef(fecha);
  useEffect(() => { fechaRef.current = fecha; }, [fecha]);
 
  const cargar = useCallback(async (fechaTarget?: string) => {
    const f = fechaTarget ?? fechaRef.current;   // ← usa ref, no closure
    setIsLoading(true);
    setSinAsignaciones(false);
    try {
      const res = await asistenciaService.getMisAsignaciones(f);
      setAsignaciones(res.data.asignaciones);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAsignaciones([]);
        setSinAsignaciones(true);
      } else {
        toast.error(error.response?.data?.message || 'Error al cargar tus materias');
        setAsignaciones([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // ← sin dependencias; usa ref internamente
 
  useEffect(() => { cargar(); }, []);
 
  const cambiarFecha = useCallback((nuevaFecha: string) => {
    setFecha(nuevaFecha);
    cargar(nuevaFecha);
  }, [cargar]);
 
  const marcarCompleta = useCallback((asignacion_id: number) => {
    setAsignaciones(prev =>
      prev.map(a =>
        a.asignacion_id === asignacion_id
          ? { ...a, asistencia_completa: true, total_marcados: a.total_estudiantes, total_pendientes: 0 }
          : a
      )
    );
  }, []);
 
  return {
    asignaciones,
    fecha,
    isLoading,
    sinAsignaciones,
    cambiarFecha,
    marcarCompleta,
    refrescar: () => cargar(), // ← ahora siempre usa fechaRef.current
  };
};

// =============================================
// HOOK: SOLICITUDES DE PERMISO
// =============================================

export const useSolicitudesPermiso = (filtrosIniciales: SolicitudPermisoFiltros = {}) => {
  const [solicitudes, setSolicitudes]     = useState<SolicitudPermiso[]>([]);
  const [paginacion, setPaginacion]       = useState<Paginacion>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters, setFilters]             = useState<SolicitudPermisoFiltros>({ page: 1, limit: 10, ...filtrosIniciales });
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await solicitudPermisoService.listar(filters);
      setSolicitudes(response.data.solicitudes);
      setPaginacion(response.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<SolicitudPermisoFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const crear = useCallback(async (
    data: CrearSolicitudPermisoDTO,
    archivo?: File
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await solicitudPermisoService.crear(data, archivo);
      toast.success('Solicitud de permiso creada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear solicitud';
      toast.error(msg.includes('Ya existe') ? 'Ya existe una solicitud activa para esa fecha' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const cambiarEstado = useCallback(async (
    id: number,
    data: CambiarEstadoPermisoDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await solicitudPermisoService.cambiarEstado(id, data);
      const labels: Record<string, string> = { aprobada: 'aprobada', rechazada: 'rechazada', cancelada: 'cancelada' };
      toast.success(`Solicitud ${labels[data.estado] ?? data.estado} exitosamente`);
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    solicitudes,
    paginacion,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    crear,
    cambiarEstado,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: DETALLE DE SOLICITUD (con historial)
// =============================================

export const useSolicitudDetalle = (id: number | null) => {
  const [solicitud, setSolicitud]   = useState<SolicitudPermiso | null>(null);
  const [historial, setHistorial]   = useState<HistorialPermiso[]>([]);
  const [isLoading, setIsLoading]   = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    solicitudPermisoService.obtenerPorId(id)
      .then(res => {
        setSolicitud(res.data.solicitud);
        setHistorial(res.data.historial);
      })
      .catch(() => toast.error('Error al cargar la solicitud'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { solicitud, historial, isLoading };
};

// =============================================
// HOOK: LISTA DEL DÍA (pase de lista)
// =============================================

export const useListaDia = () => {
  const [lista, setLista]               = useState<EstudianteDia[]>([]);
  const [estadisticas, setEstadisticas] = useState({ total: 0, ya_marcados: 0, pendientes: 0 });
  const [isLoading, setIsLoading]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [marcaciones, setMarcaciones]   = useState<Record<number, RegistroMasivoItem>>({});

  const cargarLista = useCallback(async (asignacion_docente_id: number, fecha: string) => {
    setIsLoading(true);
    try {
      const res = await asistenciaService.getListaDia(asignacion_docente_id, fecha);
      setLista(res.data.lista);
      setEstadisticas({
        total:       res.data.total,
        ya_marcados: res.data.ya_marcados,
        pendientes:  res.data.pendientes,
      });

      // Pre-poblar con los estados ya guardados
      const preloaded: Record<number, RegistroMasivoItem> = {};
      res.data.lista.forEach(est => {
        if (est.estado && est.matricula_id) {
          preloaded[est.matricula_id] = {
            matricula_id:        est.matricula_id,
            estado:              est.estado,
            solicitud_permiso_id: est.solicitud_permiso_id ?? undefined,
            observaciones:       est.observaciones ?? undefined,
          };
        }
      });
      setMarcaciones(preloaded);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar lista del día');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const marcarEstudiante = useCallback((
    matricula_id: number,
    item: Partial<RegistroMasivoItem>
  ) => {
    setMarcaciones(prev => ({
      ...prev,
      [matricula_id]: {
        ...(prev[matricula_id] ?? { matricula_id }),
        ...item,
      } as RegistroMasivoItem,
    }));
  }, []);

  const marcarTodos = useCallback((estado: RegistroMasivoItem['estado']) => {
    const todas: Record<number, RegistroMasivoItem> = {};
    lista.forEach(est => {
      todas[est.matricula_id] = { matricula_id: est.matricula_id, estado };
    });
    setMarcaciones(todas);
  }, [lista]);

  const guardarMasivo = useCallback(async (
    asignacion_docente_id: number,
    fecha: string
  ): Promise<boolean> => {
    const registros = Object.values(marcaciones);
    if (registros.length === 0) {
      toast.error('No hay registros para guardar');
      return false;
    }
    setIsSaving(true);
    try {
      const res = await asistenciaService.registrarMasivo({ asignacion_docente_id, fecha, registros });
      toast.success(`${res.data.total} registros guardados exitosamente`);
      await cargarLista(asignacion_docente_id, fecha);
      return true;
    } catch (error: any) {
      // Error de validación del backend (matrículas de otro paralelo, etc.)
      const msg = error.response?.data?.message || 'Error al guardar asistencia';
      toast.error(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [marcaciones, cargarLista]);

  const limpiarLista = useCallback(() => {
    setLista([]);
    setMarcaciones({});
    setEstadisticas({ total: 0, ya_marcados: 0, pendientes: 0 });
  }, []);

  const porcentajeCompletado = lista.length > 0
    ? Math.round((Object.keys(marcaciones).length / lista.length) * 100)
    : 0;

  return {
    lista,
    estadisticas,
    marcaciones,
    isLoading,
    isSaving,
    porcentajeCompletado,
    cargarLista,
    marcarEstudiante,
    marcarTodos,
    guardarMasivo,
    limpiarLista,
  };
};

// =============================================
// HOOK: REGISTRO Y GESTIÓN DE ASISTENCIA
// =============================================

export const useAsistencia = (filtrosIniciales: AsistenciaFiltros = {}) => {
  const [asistencias, setAsistencias]     = useState<Asistencia[]>([]);
  const [paginacion, setPaginacion]       = useState<Paginacion>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFilters]             = useState<AsistenciaFiltros>({ page: 1, limit: 20, ...filtrosIniciales });
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await asistenciaService.listar(filters);
      setAsistencias(response.data.asistencias);
      setPaginacion(response.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar asistencias');
      setAsistencias([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<AsistenciaFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const registrar = useCallback(async (data: CrearAsistenciaDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await asistenciaService.registrar(data);
      toast.success('Asistencia registrada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar asistencia');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarAsistenciaDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await asistenciaService.actualizar(id, data);
      toast.success('Asistencia actualizada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar asistencia');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    asistencias,
    paginacion,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    registrar,
    actualizar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: REPORTE DE ASISTENCIA
// =============================================

export const useReporteAsistencia = () => {
  const [reporte, setReporte]     = useState<ReporteAsistencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarReporte = useCallback(async (
    matricula_id: number,
    opciones?: { asignacion_docente_id?: number; fecha_inicio?: string; fecha_fin?: string }
  ) => {
    setIsLoading(true);
    try {
      const res = await asistenciaService.getReporte(matricula_id, opciones);
      setReporte(res.data.reporte);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar reporte');
      setReporte([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalGeneral = reporte.reduce(
    (acc, r) => ({
      total_clases:     acc.total_clases     + Number(r.total_clases),
      presentes:        acc.presentes        + Number(r.presentes),
      ausentes:         acc.ausentes         + Number(r.ausentes),
      tardanzas:        acc.tardanzas        + Number(r.tardanzas),
      justificados:     acc.justificados     + Number(r.justificados),
      faltas_parciales: acc.faltas_parciales + Number(r.faltas_parciales),
    }),
    { total_clases: 0, presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0, faltas_parciales: 0 }
  );

  const promedioAsistencia = reporte.length > 0
    ? Math.round(reporte.reduce((acc, r) => acc + Number(r.porcentaje_asistencia), 0) / reporte.length)
    : 0;

  return { reporte, isLoading, totalGeneral, promedioAsistencia, cargarReporte };
};
export const useReporteClase = () => {
  const [estudiantes, setEstudiantes]   = useState<EstudianteReporteClase[]>([]);
  const [resumen, setResumen]           = useState<ResumenClase | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [asignacionActual, setAsignacionActual] = useState<number | null>(null);
  const [filtros, setFiltros]           = useState<{ fecha_inicio?: string; fecha_fin?: string }>({});
 
  const cargar = useCallback(async (
    asignacion_docente_id: number,
    opciones?: { fecha_inicio?: string; fecha_fin?: string }
  ) => {
    setIsLoading(true);
    setAsignacionActual(asignacion_docente_id);
    if (opciones) setFiltros(opciones);
    try {
      const res = await asistenciaService.getReporteClase(asignacion_docente_id, opciones);
      setResumen(res.data.resumen);
      setEstudiantes(res.data.estudiantes);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar reporte de clase');
      setResumen(null);
      setEstudiantes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  const limpiar = useCallback(() => {
    setEstudiantes([]);
    setResumen(null);
    setAsignacionActual(null);
  }, []);
 
  // Recarga con los mismos filtros (útil después de corregir una asistencia)
  const refrescar = useCallback(() => {
    if (asignacionActual) cargar(asignacionActual, filtros);
  }, [asignacionActual, filtros, cargar]);
 
  return { estudiantes, resumen, isLoading, cargar, limpiar, refrescar };
};
 
// =============================================
// HOOK: CORRECCIÓN DE ASISTENCIA INDIVIDUAL
// =============================================
export const useCorregirAsistencia = (onExito?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const corregir = useCallback(async (
    id: number,
    data: CorregirAsistenciaDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await asistenciaService.corregir(id, data);
      toast.success('Asistencia corregida exitosamente');
      onExito?.();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al corregir asistencia';
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onExito]);
 
  return { corregir, isSubmitting };
};