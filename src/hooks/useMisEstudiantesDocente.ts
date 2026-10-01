// hooks/useMisEstudiantesDocente.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  misEstudiantesService,
  MisEstudiantesFiltros,
  MisEstudiantesResponse,
} from '@/services/misEstudiantesService';
import { Estudiante } from '@/types/estudianteTypes';

export const useMisEstudiantesDocente = (initialFilters: MisEstudiantesFiltros = {}) => {
  const [localFilters, setLocalFilters] = useState<MisEstudiantesFiltros>({
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  const filtersKey = useMemo(() => JSON.stringify(localFilters), [localFilters]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<MisEstudiantesResponse>({
    queryKey: ['docente-mis-estudiantes', localFilters],
    queryFn: () => misEstudiantesService.listar(localFilters),
    staleTime: 1000 * 60 * 3, // 3 minutos
  });

  const actualizarFiltros = useCallback((newFilters: Partial<MisEstudiantesFiltros>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setLocalFilters({ page: 1, limit: 12 });
  }, []);

  return {
    docente: data?.docente,
    estudiantes: data?.estudiantes || [],
    cursos: data?.cursos || [],
    paginacion: data?.paginacion || { total: 0, page: 1, limit: 12, totalPages: 1 },
    isLoading,
    isFetching,
    error,
    filters: localFilters,
    actualizarFiltros,
    limpiarFiltros,
    refetch,
  };
};

export const useMiEstudianteDocenteDetalle = (id: number | null) => {
  const {
    data: estudiante,
    isLoading,
    error,
    refetch,
  } = useQuery<Estudiante>({
    queryKey: ['docente-estudiante-detalle', id],
    queryFn: () => misEstudiantesService.obtenerPorId(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });

  return {
    estudiante,
    isLoading,
    error,
    refetch,
  };
};
