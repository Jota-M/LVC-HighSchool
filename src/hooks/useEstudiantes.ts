// hooks/useEstudiantes.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Estudiante,
  EstudianteCreate,
  EstudianteUpdate,
  EstudianteFilters,
  EstudiantesResponse,
} from '@/types/estudianteTypes';
import { estudiantesService } from '@/services/estudiantesService';
import { useSnackbar } from 'notistack';

export const useEstudiantes = (filters?: EstudianteFilters) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Estado local para filtros
  const [localFilters, setLocalFilters] = useState<EstudianteFilters>(filters || {});

  // =============================================
  // QUERY: Listar estudiantes
  // =============================================
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<EstudiantesResponse>({
    queryKey: ['estudiantes', localFilters],
    queryFn: () => estudiantesService.listar(localFilters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // =============================================
  // MUTATION: Crear estudiante
  // =============================================
  const crearMutation = useMutation({
    mutationFn: ({ data, foto }: { data: EstudianteCreate; foto?: File }) =>
      estudiantesService.crear(data, foto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      enqueueSnackbar('Estudiante creado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al crear estudiante', { variant: 'error' });
    },
  });

  // =============================================
  // MUTATION: Actualizar estudiante
  // =============================================
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data, foto }: { id: number; data: EstudianteUpdate; foto?: File }) =>
      estudiantesService.actualizar(id, data, foto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      enqueueSnackbar('Estudiante actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al actualizar estudiante', { variant: 'error' });
    },
  });

  // =============================================
  // MUTATION: Eliminar estudiante
  // =============================================
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => estudiantesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      enqueueSnackbar('Estudiante eliminado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al eliminar estudiante', { variant: 'error' });
    },
  });

  // =============================================
  // MUTATION: Eliminar foto
  // =============================================
  const eliminarFotoMutation = useMutation({
    mutationFn: (id: number) => estudiantesService.eliminarFoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      enqueueSnackbar('Foto eliminada exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al eliminar foto', { variant: 'error' });
    },
  });

  // =============================================
  // FUNCIONES DE AYUDA
  // =============================================
  const actualizarFiltros = useCallback((newFilters: Partial<EstudianteFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setLocalFilters({});
  }, []);

  return {
    // Datos
    estudiantes: data?.estudiantes || [],
    paginacion: data?.paginacion,
    
    // Estados
    isLoading,
    error,
    
    // Filtros
    filters: localFilters,
    actualizarFiltros,
    limpiarFiltros,
    
    // Acciones
    refetch,
    crear: crearMutation.mutate,
    actualizar: actualizarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    eliminarFoto: eliminarFotoMutation.mutate,
    
    // Estados de mutaciones
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Detalle de estudiante individual
// =============================================
export const useEstudiante = (id: number | null) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: estudiante,
    isLoading,
    error,
    refetch,
  } = useQuery<Estudiante>({
    queryKey: ['estudiante', id],
    queryFn: () => estudiantesService.obtenerPorId(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    estudiante,
    isLoading,
    error,
    refetch,
  };
};