// hooks/useCursosVacacionales.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import cursoVacacionalService from '@/services/cursoVacacionalService';
import {
  PeriodoVacacional,
  PeriodoVacacionalCreate,
  PeriodoVacacionalUpdate,
  PeriodoVacacionalFilters,
  PeriodosResponse,
  CursoVacacional,
  CursoVacacionalCreate,
  CursoVacacionalUpdate,
  CursoVacacionalFilters,
  CursosResponse,
  InscripcionVacacional,
  InscripcionVacacionalFilters,
  InscripcionesResponse,
  FormInscripcionPublica,
  CambiarEstadoInscripcion,
  EstadisticasPeriodo,
} from '@/types/cursoVacacionalTypes';

// =============================================
// HOOK: Periodos Vacacionales
// =============================================
export const usePeriodosVacacionales = (filters?: PeriodoVacacionalFilters) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [localFilters, setLocalFilters] = useState<PeriodoVacacionalFilters>(filters || {});

  const { data, isLoading, error, refetch } = useQuery<PeriodosResponse>({
    queryKey: ['periodos-vacacionales', localFilters],
    queryFn: () => cursoVacacionalService.periodos.listar(localFilters),
    staleTime: 1000 * 60 * 5,
  });

  const crearMutation = useMutation({
    mutationFn: (data: PeriodoVacacionalCreate) => cursoVacacionalService.periodos.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodos-vacacionales'] });
      enqueueSnackbar('Periodo creado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al crear periodo', { variant: 'error' });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PeriodoVacacionalUpdate }) =>
      cursoVacacionalService.periodos.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodos-vacacionales'] });
      enqueueSnackbar('Periodo actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar periodo', { variant: 'error' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => cursoVacacionalService.periodos.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodos-vacacionales'] });
      enqueueSnackbar('Periodo eliminado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar periodo', { variant: 'error' });
    },
  });

  const actualizarFiltros = useCallback((newFilters: Partial<PeriodoVacacionalFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    periodos: data?.periodos || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters: localFilters,
    actualizarFiltros,
    refetch,
    crear: crearMutation.mutate,
    actualizar: actualizarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Periodo Activo (público)
// =============================================
export const usePeriodoActivo = () => {
  const { data: periodo, isLoading, error } = useQuery<PeriodoVacacional | null>({
    queryKey: ['periodo-vacacional-activo'],
    queryFn: () => cursoVacacionalService.periodos.obtenerActivo(),
    staleTime: 1000 * 60 * 10,
  });

  return {
    periodo,
    isLoading,
    error,
    hayPeriodoActivo: !!periodo,
  };
};

// =============================================
// HOOK: Detalle de Periodo
// =============================================
export const usePeriodoVacacional = (id: number | null) => {
  const { data: periodo, isLoading, error, refetch } = useQuery<PeriodoVacacional>({
    queryKey: ['periodo-vacacional', id],
    queryFn: () => cursoVacacionalService.periodos.obtenerPorId(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    periodo,
    isLoading,
    error,
    refetch,
  };
};

// =============================================
// HOOK: Estadísticas de Periodo
// =============================================
export const useEstadisticasPeriodo = (periodoId: number | null) => {
  const { data: estadisticas, isLoading, error } = useQuery<EstadisticasPeriodo>({
    queryKey: ['estadisticas-periodo', periodoId],
    queryFn: () => cursoVacacionalService.periodos.obtenerEstadisticas(periodoId!),
    enabled: !!periodoId,
    staleTime: 1000 * 60 * 2,
  });

  return {
    estadisticas,
    isLoading,
    error,
  };
};

// =============================================
// HOOK: Cursos Vacacionales (ADMIN)
// =============================================
export const useCursosVacacionales = (filters?: CursoVacacionalFilters) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [localFilters, setLocalFilters] = useState<CursoVacacionalFilters>(filters || {});

  const { data, isLoading, error, refetch } = useQuery<CursosResponse>({
    queryKey: ['cursos-vacacionales', localFilters],
    queryFn: () => cursoVacacionalService.cursos.listar(localFilters),
    staleTime: 1000 * 60 * 5,
  });

  const crearMutation = useMutation({
    mutationFn: (data: CursoVacacionalCreate) => cursoVacacionalService.cursos.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-vacacionales'] });
      enqueueSnackbar('Curso creado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al crear curso', { variant: 'error' });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CursoVacacionalUpdate }) =>
      cursoVacacionalService.cursos.actualizar(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-vacacionales'] });
      enqueueSnackbar('Curso actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar curso', { variant: 'error' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => cursoVacacionalService.cursos.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-vacacionales'] });
      enqueueSnackbar('Curso eliminado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar curso', { variant: 'error' });
    },
  });

  const actualizarFiltros = useCallback((newFilters: Partial<CursoVacacionalFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    cursos: data?.cursos || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters: localFilters,
    actualizarFiltros,
    refetch,
    crear: crearMutation.mutate,
    actualizar: actualizarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: eliminarMutation.isPending,
  };
};

// =============================================
// ✅ HOOK: Cursos Públicos - CORREGIDO
// =============================================
export const useCursosPublicos = (
  filters?: CursoVacacionalFilters,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error, refetch } = useQuery<CursosResponse>({
    queryKey: ['cursos-publicos', filters],
    queryFn: () => {
      console.log('🔍 [PUBLIC HOOK] Filtros:', filters);
      return cursoVacacionalService.cursos.listarPublico(filters || {});
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });

  return {
    cursos: data?.cursos || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters,
    refetch,
  };
};

// =============================================
// HOOK: Detalle de Curso (público)
// =============================================
export const useCursoPublico = (id: number | null) => {
  const { data: curso, isLoading, error } = useQuery<CursoVacacional>({
    queryKey: ['curso-publico', id],
    queryFn: () => cursoVacacionalService.cursos.obtenerPublico(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    curso,
    isLoading,
    error,
  };
};

// =============================================
// HOOK: Detalle de Curso (admin)
// =============================================
export const useCursoVacacional = (id: number | null) => {
  const { data: curso, isLoading, error, refetch } = useQuery<CursoVacacional>({
    queryKey: ['curso-vacacional', id],
    queryFn: () => cursoVacacionalService.cursos.obtenerPorId(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    curso,
    isLoading,
    error,
    refetch,
  };
};

// =============================================
// HOOK: Inscripciones
// =============================================
export const useInscripcionesVacacionales = (filters?: InscripcionVacacionalFilters) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [localFilters, setLocalFilters] = useState<InscripcionVacacionalFilters>(filters || {});

  const { data, isLoading, error, refetch } = useQuery<InscripcionesResponse>({
    queryKey: ['inscripciones-vacacionales', localFilters],
    queryFn: () => cursoVacacionalService.inscripciones.listar(localFilters),
    staleTime: 1000 * 60 * 2,
  });

  const inscribirPublicoMutation = useMutation({
    mutationFn: (data: FormInscripcionPublica) => cursoVacacionalService.inscripciones.inscribirPublico(data),
    onSuccess: () => {
      enqueueSnackbar('¡Inscripción exitosa! En breve recibirás confirmación', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al inscribirse', { variant: 'error' });
    },
  });

  const inscribirMutation = useMutation({
    mutationFn: (data: FormInscripcionPublica) => cursoVacacionalService.inscripciones.inscribir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones-vacacionales'] });
      enqueueSnackbar('Inscripción creada exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al inscribir', { variant: 'error' });
    },
  });

  const verificarPagoMutation = useMutation({
    mutationFn: (id: number) => cursoVacacionalService.inscripciones.verificarPago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones-vacacionales'] });
      enqueueSnackbar('Pago verificado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al verificar pago', { variant: 'error' });
    },
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarEstadoInscripcion }) =>
      cursoVacacionalService.inscripciones.cambiarEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones-vacacionales'] });
      enqueueSnackbar('Estado actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al cambiar estado', { variant: 'error' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => cursoVacacionalService.inscripciones.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones-vacacionales'] });
      enqueueSnackbar('Inscripción eliminada exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar inscripción', { variant: 'error' });
    },
  });

  const actualizarFiltros = useCallback((newFilters: Partial<InscripcionVacacionalFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    inscripciones: data?.inscripciones || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters: localFilters,
    actualizarFiltros,
    refetch,
    inscribirPublico: inscribirPublicoMutation.mutate,
    inscribir: inscribirMutation.mutate,
    verificarPago: verificarPagoMutation.mutate,
    cambiarEstado: cambiarEstadoMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isInscribiendo: inscribirPublicoMutation.isPending || inscribirMutation.isPending,
    isVerificandoPago: verificarPagoMutation.isPending,
    isCambiandoEstado: cambiarEstadoMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Detalle de Inscripción
// =============================================
export const useInscripcionVacacional = (id: number | null) => {
  const { data: inscripcion, isLoading, error, refetch } = useQuery<InscripcionVacacional>({
    queryKey: ['inscripcion-vacacional', id],
    queryFn: () => cursoVacacionalService.inscripciones.obtenerPorId(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    inscripcion,
    isLoading,
    error,
    refetch,
  };
};