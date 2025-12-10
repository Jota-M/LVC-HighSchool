// hooks/useMatriculacion.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import matriculacionService from '@/services/matriculacionService';
import {
  EstudiantesElegiblesResponse,
  MatriculacionData,
  RematriculacionData,
  MatriculasResponse,
  MatriculasFilters,
  EstadisticasMatricula,
  MatriculaUpdate,
  RetiroMatricula,
  DisponibilidadParalelo,
} from '@/types/matriculacionTypes';

// =============================================
// HOOK PRINCIPAL: Gestión de matriculación
// =============================================
export const useMatriculacion = (periodoAcademicoId?: number) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // =============================================
  // MUTATION: Matricular estudiante
  // =============================================
  const matricularMutation = useMutation({
    mutationFn: ({ estudianteId, data }: { estudianteId: number; data: MatriculacionData }) =>
      matriculacionService.matricularEstudiante(estudianteId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes-elegibles'] });
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-matricula'] });
      enqueueSnackbar(response.message || 'Matrícula creada exitosamente', {
        variant: 'success',
        autoHideDuration: 5000,
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al crear matrícula', {
        variant: 'error',
        autoHideDuration: 8000,
      });
    },
  });

  // =============================================
  // MUTATION: Re-matricular estudiante
  // =============================================
  const rematricularMutation = useMutation({
    mutationFn: ({ estudianteId, data }: { estudianteId: number; data: RematriculacionData }) =>
      matriculacionService.rematricularEstudiante(estudianteId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes-elegibles'] });
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-matricula'] });
      enqueueSnackbar(response.message || 'Re-matrícula exitosa', {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al re-matricular', {
        variant: 'error',
      });
    },
  });

  // =============================================
  // MUTATION: Actualizar matrícula
  // =============================================
  const actualizarMutation = useMutation({
    mutationFn: ({ matriculaId, data }: { matriculaId: number; data: MatriculaUpdate }) =>
      matriculacionService.actualizarMatricula(matriculaId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      enqueueSnackbar(response.message || 'Matrícula actualizada', {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar', {
        variant: 'error',
      });
    },
  });

  // =============================================
  // MUTATION: Retirar matrícula
  // =============================================
  const retirarMutation = useMutation({
    mutationFn: ({ matriculaId, data }: { matriculaId: number; data: RetiroMatricula }) =>
      matriculacionService.retirarMatricula(matriculaId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-matricula'] });
      enqueueSnackbar(response.message || 'Matrícula retirada', {
        variant: 'info',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al retirar matrícula', {
        variant: 'error',
      });
    },
  });

  // =============================================
  // 📄 MUTATION: Descargar PDF - NUEVO
  // =============================================
  const descargarPDFMutation = useMutation({
    mutationFn: (matriculaId: number) => 
      matriculacionService.descargarPDF(matriculaId),
    onSuccess: () => {
      enqueueSnackbar('PDF descargado exitosamente', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al descargar PDF',
        { variant: 'error' }
      );
    },
  });

  return {
    // Acciones
    matricular: matricularMutation.mutate,
    rematricular: rematricularMutation.mutate,
    actualizar: actualizarMutation.mutate,
    retirar: retirarMutation.mutate,
    descargarPDF: descargarPDFMutation.mutate,

    // Estados
    isMatriculando: matricularMutation.isPending,
    isRematriculando: rematricularMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isRetirando: retirarMutation.isPending,
    isDescargandoPDF: descargarPDFMutation.isPending,
  };
};

// =============================================
// HOOK: Estudiantes elegibles
// =============================================
export const useEstudiantesElegibles = (
  periodoAcademicoId: number | null,
  initialFilters: any = {}
) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery<EstudiantesElegiblesResponse>({
    queryKey: ['estudiantes-elegibles', periodoAcademicoId, filters],
    queryFn: () =>
      matriculacionService.listarEstudiantesElegibles(periodoAcademicoId!, filters),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const actualizarFiltros = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    estudiantes: data?.estudiantes || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters,
    actualizarFiltros,
    refetch,
  };
};

// =============================================
// HOOK: Disponibilidad de paralelo
// =============================================
export const useDisponibilidadParalelo = (
  paraleloId: number | null,
  periodoAcademicoId: number | null
) => {
  const { data, isLoading, error } = useQuery<DisponibilidadParalelo>({
    queryKey: ['disponibilidad-paralelo', paraleloId, periodoAcademicoId],
    queryFn: () =>
      matriculacionService.verificarDisponibilidad(paraleloId!, periodoAcademicoId!),
    enabled: !!paraleloId && !!periodoAcademicoId,
    staleTime: 1000 * 30, // 30 segundos
  });

  return {
    disponibilidad: data,
    isLoading,
    error,
    puedeMatricular: data?.capacidad.puede_matricular ?? false,
  };
};

// =============================================
// HOOK: Matrículas por periodo
// =============================================
export const useMatriculasPorPeriodo = (
  periodoAcademicoId: number | null,
  initialFilters: Omit<MatriculasFilters, 'periodo_academico_id'> = {}
) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery<MatriculasResponse>({
    queryKey: ['matriculas', periodoAcademicoId, filters],
    queryFn: () =>
      matriculacionService.obtenerMatriculasPorPeriodo(periodoAcademicoId!, filters),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 2,
  });

  const actualizarFiltros = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    matriculas: data?.matriculas || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters,
    actualizarFiltros,
    refetch,
  };
};

// =============================================
// HOOK: Estadísticas de matrícula
// =============================================
export const useEstadisticasMatricula = (periodoAcademicoId: number | null) => {
  const { data, isLoading, error } = useQuery<EstadisticasMatricula>({
    queryKey: ['estadisticas-matricula', periodoAcademicoId],
    queryFn: () => matriculacionService.obtenerEstadisticas(periodoAcademicoId!),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    estadisticas: data,
    isLoading,
    error,
  };
};

// =============================================
// 📄 HOOK: Gestión de PDF - NUEVO
// =============================================
export const useMatriculaPDF = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isDownloading, setIsDownloading] = useState(false);

  const descargarPDF = useCallback(async (matriculaId: number) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar('Generando PDF...', { variant: 'info' });
      
      await matriculacionService.descargarPDF(matriculaId);
      
      enqueueSnackbar('PDF descargado exitosamente', { 
        variant: 'success',
        autoHideDuration: 3000 
      });
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al descargar PDF',
        { variant: 'error' }
      );
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, [enqueueSnackbar]);

  const verPreview = useCallback((matriculaId: number) => {
    try {
      matriculacionService.verPDFPreview(matriculaId);
    } catch (error: any) {
      console.error('Error al abrir PDF:', error);
      enqueueSnackbar('Error al abrir PDF', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  return {
    descargarPDF,
    verPreview,
    isDownloading,
  };
};