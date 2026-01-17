// hooks/useCertificadosVacacionales.ts
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import certificadoVacacionalService from '@/services/certificadoVacacionalService';
import {
  InscripcionVacacional,
  InscripcionVacacionalFilters,
  InscripcionesResponse,
} from '@/types/cursoVacacionalTypes';

// =============================================
// HOOK: Certificados Vacacionales
// =============================================
export const useCertificadosVacacionales = (filters?: InscripcionVacacionalFilters) => {
  const { enqueueSnackbar } = useSnackbar();
  const [localFilters, setLocalFilters] = useState<InscripcionVacacionalFilters>(filters || {});
  const [isGenerating, setIsGenerating] = useState(false);

  // Query para obtener inscripciones completadas
  const { data, isLoading, error, refetch } = useQuery<InscripcionesResponse>({
    queryKey: ['inscripciones-completadas', localFilters],
    queryFn: () => certificadoVacacionalService.listarCompletadas(localFilters),
    staleTime: 1000 * 60 * 2,
  });

  // Actualizar filtros
  const actualizarFiltros = useCallback((newFilters: Partial<InscripcionVacacionalFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Generar y descargar certificado
  const descargarCertificado = useCallback(async (inscripcionId: number) => {
    try {
      setIsGenerating(true);
      await certificadoVacacionalService.descargarCertificado(inscripcionId);
      enqueueSnackbar('Certificado descargado exitosamente', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al descargar certificado',
        { variant: 'error' }
      );
    } finally {
      setIsGenerating(false);
    }
  }, [enqueueSnackbar]);

  // Previsualizar certificado
  const previsualizarCertificado = useCallback(async (inscripcionId: number) => {
    try {
      await certificadoVacacionalService.previsualizarCertificado(inscripcionId);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al previsualizar certificado',
        { variant: 'error' }
      );
    }
  }, [enqueueSnackbar]);

  return {
    inscripciones: data?.inscripciones || [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters: localFilters,
    actualizarFiltros,
    refetch,
    descargarCertificado,
    previsualizarCertificado,
    isGenerating,
  };
};

// =============================================
// HOOK: Detalle de Inscripción para Certificado
// =============================================
export const useInscripcionParaCertificado = (id: number | null) => {
  const { data: inscripcion, isLoading, error } = useQuery<InscripcionVacacional>({
    queryKey: ['inscripcion-certificado', id],
    queryFn: async () => {
      if (!id) throw new Error('ID no válido');
      // Reutilizamos el servicio de inscripciones existente
      const response = await fetch(`/api/cursos-vacacionales/inscripciones/${id}`);
      if (!response.ok) throw new Error('Error al cargar inscripción');
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return {
    inscripcion,
    isLoading,
    error,
    puedeGenerarCertificado: inscripcion?.estado === 'completado',
  };
};