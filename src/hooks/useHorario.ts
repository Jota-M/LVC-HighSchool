// hooks/useHorario.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import horarioService from '@/services/horarioService';
import type {
  BloqueHorarioCreate, BloqueHorarioUpdate,
  HorarioCreate, HorarioUpdate,
  HorarioDetalleCreate, HorarioDetalleUpdate,
  HorariosFilters, BloquesFilters, HorarioEstado,
} from '@/types/horariotypes';

// =============================================
// HOOK: Bloques horarios (lectura)
// =============================================
export const useBloques = (filters: BloquesFilters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bloques-horario', filters],
    queryFn: () => horarioService.listarBloques(filters),
    staleTime: 1000 * 60 * 5,
  });
  return { bloques: data ?? [], isLoading, error, refetch };
};

// =============================================
// HOOK: Gestión de bloques (CRUD)
// =============================================
export const useGestionBloques = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const crearMutation = useMutation({
    mutationFn: (payload: BloqueHorarioCreate) => horarioService.crearBloque(payload),
    onSuccess: (bloque) => {
      queryClient.invalidateQueries({ queryKey: ['bloques-horario'] });
      enqueueSnackbar(`Bloque "${bloque.nombre}" creado`, { variant: 'success' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al crear bloque', { variant: 'error' }),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BloqueHorarioUpdate }) =>
      horarioService.actualizarBloque(id, payload),
    onSuccess: (bloque) => {
      queryClient.invalidateQueries({ queryKey: ['bloques-horario'] });
      enqueueSnackbar(`Bloque "${bloque.nombre}" actualizado`, { variant: 'success' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar', { variant: 'error' }),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => horarioService.eliminarBloque(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloques-horario'] });
      enqueueSnackbar('Bloque desactivado', { variant: 'info' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar', { variant: 'error' }),
  });

  return {
    crear: crearMutation.mutateAsync,
    actualizar: actualizarMutation.mutateAsync,
    eliminar: eliminarMutation.mutate,
    isCreando: crearMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Lista de horarios con filtros
// =============================================
export const useHorarios = (initialFilters: HorariosFilters = {}) => {
  const [filters, setFilters] = useState<HorariosFilters>(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['horarios', filters],
    queryFn: () => horarioService.listarHorarios(filters),
    staleTime: 1000 * 60 * 2,
  });

  const actualizarFiltros = useCallback((newFilters: Partial<HorariosFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFiltros = useCallback(() => setFilters(initialFilters), [initialFilters]);

  return { horarios: data ?? [], isLoading, error, filters, actualizarFiltros, resetFiltros, refetch };
};

// =============================================
// HOOK: Horario individual (cabecera + detalle)
// =============================================
export const useHorario = (id: number | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['horario', id],
    queryFn: () => horarioService.obtenerHorario(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
  return { horario: data, isLoading, error, refetch };
};

// =============================================
// HOOK: Gestión de horarios (CRUD + estado)
// =============================================
export const useGestionHorarios = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const crearMutation = useMutation({
    mutationFn: (payload: HorarioCreate) => horarioService.crearHorario(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      enqueueSnackbar('Horario creado exitosamente', { variant: 'success' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al crear horario', { variant: 'error' }),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HorarioUpdate }) =>
      horarioService.actualizarHorario(id, payload),
    onSuccess: (h) => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      queryClient.invalidateQueries({ queryKey: ['horario', h.id] });
      enqueueSnackbar('Horario actualizado', { variant: 'success' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar', { variant: 'error' }),
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: HorarioEstado }) =>
      horarioService.cambiarEstado(id, estado),
    onSuccess: (h) => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      queryClient.invalidateQueries({ queryKey: ['horario', h.id] });
      const msg: Record<HorarioEstado, string> = {
        borrador: 'Horario movido a borrador',
        publicado: '¡Horario publicado! Los estudiantes ya pueden verlo',
        archivado: 'Horario archivado',
      };
      enqueueSnackbar(msg[h.estado], {
        variant: h.estado === 'publicado' ? 'success' : 'info',
        autoHideDuration: 5000,
      });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al cambiar estado', { variant: 'error' }),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => horarioService.eliminarHorario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      enqueueSnackbar('Horario eliminado', { variant: 'info' });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar', { variant: 'error' }),
  });

  return {
    crear: crearMutation.mutateAsync,
    actualizar: actualizarMutation.mutateAsync,
    cambiarEstado: cambiarEstadoMutation.mutateAsync,
    eliminar: eliminarMutation.mutateAsync,
    isCreando: crearMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isCambiandoEstado: cambiarEstadoMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Celdas del horario (CRUD)
// =============================================
export const useHorarioCeldas = (horarioId: number | null) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['horario', horarioId] });

  const agregarMutation = useMutation({
    mutationFn: (payload: HorarioDetalleCreate) =>
      horarioService.agregarCelda(horarioId!, payload),
    onSuccess: () => { invalidate(); enqueueSnackbar('Celda asignada', { variant: 'success' }); },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al asignar celda', { variant: 'error' }),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ detId, payload }: { detId: number; payload: HorarioDetalleUpdate }) =>
      horarioService.actualizarCelda(horarioId!, detId, payload),
    onSuccess: () => { invalidate(); enqueueSnackbar('Celda actualizada', { variant: 'success' }); },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar celda', { variant: 'error' }),
  });

  const eliminarMutation = useMutation({
    mutationFn: (detId: number) => horarioService.eliminarCelda(horarioId!, detId),
    onSuccess: () => { invalidate(); enqueueSnackbar('Celda eliminada', { variant: 'info' }); },
    onError: (error: any) =>
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar celda', { variant: 'error' }),
  });

  return {
    agregar: agregarMutation.mutateAsync,
    actualizar: actualizarMutation.mutateAsync,
    eliminar: eliminarMutation.mutateAsync,
    isAgregando: agregarMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isEliminando: eliminarMutation.isPending,
    isBusy: agregarMutation.isPending || actualizarMutation.isPending || eliminarMutation.isPending,
  };
};

// =============================================
// HOOK: Datos auxiliares para CeldaModal
// =============================================
export const useGradoMaterias = (gradoId: number | null) => {
  const { data, isLoading } = useQuery({
    queryKey: ['grado-materias', gradoId],
    queryFn: () => horarioService.listarGradoMaterias(gradoId!),
    enabled: !!gradoId,
    staleTime: 1000 * 60 * 10,
  });
  return { gradoMaterias: data ?? [], isLoading };
};

export const useAsignaciones = (
  paraleloId: number | null,
  periodoId: number | null,
  gradoMateriaId?: number | null
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['asignaciones-docente', paraleloId, periodoId, gradoMateriaId],
    queryFn: () => horarioService.listarAsignaciones(paraleloId!, periodoId!, gradoMateriaId ?? undefined),
    enabled: !!paraleloId && !!periodoId,
    staleTime: 1000 * 60 * 5,
  });
  return { asignaciones: data ?? [], isLoading };
};