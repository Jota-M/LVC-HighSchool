// hooks/useSeguimientoPedagogico.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { catalogoService, observacionService, acuseService } from '@/services/seguimientoPedagogicoService';
import {
  ObservacionPedagogica,
  CategoriaObservacion,
  PlantillaObservacion,
  LineaTiempoItem,
  ResumenEstudianteAsignacion,
  HistorialObservacion,
  AcuseReciboPadre,
  ObservacionFiltros,
  CrearObservacionDTO,
  ActualizarObservacionDTO,
  Paginacion,
} from '@/types/seguimientoPedagogicoTypes';

// =============================================
// HOOK: CATÁLOGO (categorías + plantillas)
// =============================================
// Carga las categorías y sus plantillas una sola vez.
// Se usa al abrir el formulario de nueva observación.

export const useCatalogoObservacion = () => {
  const [categorias, setCategorias]   = useState<CategoriaObservacion[]>([]);
  const [plantillas, setPlantillas]   = useState<PlantillaObservacion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setIsLoading(true);
      try {
        const [catRes, plRes] = await Promise.all([
          catalogoService.getCategorias(),
          catalogoService.getPlantillas(),       // todas, filtraremos en el cliente
        ]);
        setCategorias(catRes.data.categorias);
        setPlantillas(plRes.data.plantillas);
      } catch {
        toast.error('Error al cargar el catálogo de observaciones');
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  // Filtrar plantillas por categoría seleccionada (en cliente, sin llamada extra)
  const plantillasPorCategoria = useCallback(
    (categoria_id: number) => plantillas.filter(p => p.categoria_observacion_id === categoria_id),
    [plantillas]
  );

  return { categorias, plantillas, plantillasPorCategoria, isLoading };
};

// =============================================
// HOOK: LISTADO DE OBSERVACIONES
// =============================================

export const useObservaciones = (filtrosIniciales: ObservacionFiltros = {}) => {
  const [observaciones, setObservaciones] = useState<ObservacionPedagogica[]>([]);
  const [paginacion, setPaginacion]       = useState<Paginacion>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFilters]             = useState<ObservacionFiltros>({ page: 1, limit: 20, ...filtrosIniciales });
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await observacionService.listar(filters);
      setObservaciones(res.data.observaciones);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar observaciones');
      setObservaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<ObservacionFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const crear = useCallback(async (data: CrearObservacionDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.crear(data);
      toast.success('Observación registrada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear observación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarObservacionDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.actualizar(id, data);
      toast.success('Observación actualizada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar observación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const cambiarVisibilidad = useCallback(async (
    id: number,
    visible: boolean
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.cambiarVisibilidad(id, { visible_para_padre: visible });
      toast.success(visible ? 'Observación publicada al padre' : 'Observación ocultada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar visibilidad');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.eliminar(id);
      toast.success('Observación eliminada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar observación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    observaciones,
    paginacion,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    crear,
    actualizar,
    cambiarVisibilidad,
    eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: DETALLE DE OBSERVACIÓN
// =============================================

export const useObservacionDetalle = (id: number | null) => {
  const [observacion, setObservacion] = useState<ObservacionPedagogica | null>(null);
  const [historial, setHistorial]     = useState<HistorialObservacion[]>([]);
  const [acuses, setAcuses]           = useState<AcuseReciboPadre[]>([]);
  const [isLoading, setIsLoading]     = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    observacionService.obtenerPorId(id)
      .then(res => {
        setObservacion(res.data.observacion);
        setHistorial(res.data.historial);
        setAcuses(res.data.acuses);
      })
      .catch(() => toast.error('Error al cargar la observación'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { observacion, historial, acuses, isLoading };
};

// =============================================
// HOOK: LÍNEA DE TIEMPO DEL ESTUDIANTE
// =============================================
// Usada en el perfil del estudiante para el docente/admin.
// Muestra todas las observaciones en orden cronológico.

export const useLineaTiempo = () => {
  const [observaciones, setObservaciones] = useState<LineaTiempoItem[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [filtrosActivos, setFiltrosActivos] = useState<{
    matricula_id?: number;
    periodo_academico_id?: number;
    categoria_id?: number;
    nivel_relevancia?: string;
    solo_visibles_padre?: boolean;
  }>({});

  const cargar = useCallback(async (params: {
    matricula_id: number;
    periodo_academico_id?: number;
    categoria_id?: number;
    nivel_relevancia?: string;
    solo_visibles_padre?: boolean;
  }) => {
    setIsLoading(true);
    setFiltrosActivos(params);
    try {
      const res = await observacionService.getLineaTiempo(params);
      setObservaciones(res.data.observaciones);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar línea de tiempo');
      setObservaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refrescar = useCallback(() => {
    if (filtrosActivos.matricula_id) cargar(filtrosActivos as any);
  }, [filtrosActivos, cargar]);

  // Conteos rápidos para los chips de filtro
  const conteos = {
    total:              observaciones.length,
    informativos:       observaciones.filter(o => o.nivel_relevancia === 'informativo').length,
    requieren_atencion: observaciones.filter(o => o.nivel_relevancia === 'requiere_atencion').length,
    urgentes:           observaciones.filter(o => o.nivel_relevancia === 'urgente').length,
    no_leidos:          observaciones.filter(o => !o.acuse_leido && o.visible_para_padre).length,
  };

  return { observaciones, isLoading, conteos, cargar, refrescar };
};

// =============================================
// HOOK: RESUMEN POR ASIGNACIÓN (vista de lista de estudiantes)
// =============================================
// El docente ve cuántas observaciones tiene cada estudiante
// de su paralelo/materia: totales, urgentes, no leídas, etc.

export const useResumenPorAsignacion = () => {
  const [resumen, setResumen]         = useState<ResumenEstudianteAsignacion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const asignacionRef                 = useRef<number | null>(null);
  const periodoRef                    = useRef<number | undefined>(undefined);

  const cargar = useCallback(async (
    asignacion_docente_id: number,
    periodo_academico_id?: number
  ) => {
    asignacionRef.current = asignacion_docente_id;
    periodoRef.current    = periodo_academico_id;
    setIsLoading(true);
    try {
      const res = await observacionService.getResumenPorAsignacion(
        asignacion_docente_id,
        periodo_academico_id
      );
      setResumen(res.data.resumen);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar resumen');
      setResumen([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refrescar = useCallback(() => {
    if (asignacionRef.current) cargar(asignacionRef.current, periodoRef.current);
  }, [cargar]);

  // Estudiantes que tienen al menos una observación urgente sin acusar
  const estudiantesUrgentes = resumen.filter(e => e.urgentes > 0);
  const estudiantesConPendientes = resumen.filter(e => e.no_acusados > 0);

  return {
    resumen,
    isLoading,
    estudiantesUrgentes,
    estudiantesConPendientes,
    cargar,
    refrescar,
  };
};

// =============================================
// HOOK: CREAR OBSERVACIÓN (con plantilla)
// =============================================
// Maneja el estado del formulario, incluyendo
// la selección de plantilla como punto de partida.

export const useCrearObservacion = (onExito?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const crear = useCallback(async (data: CrearObservacionDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.crear(data);
      toast.success('Observación registrada exitosamente');
      onExito?.();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar observación');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onExito]);

  return { crear, isSubmitting };
};

// =============================================
// HOOK: CAMBIAR VISIBILIDAD (acción puntual)
// =============================================

export const useCambiarVisibilidad = (onExito?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const publicar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.cambiarVisibilidad(id, { visible_para_padre: true });
      toast.success('Observación publicada al padre de familia');
      onExito?.();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onExito]);

  const ocultar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await observacionService.cambiarVisibilidad(id, { visible_para_padre: false });
      toast.success('Observación ocultada');
      onExito?.();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al ocultar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onExito]);

  return { publicar, ocultar, isSubmitting };
};