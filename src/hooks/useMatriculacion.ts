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
  MatriculaDetalleResponse,
  TransferenciaParalelo,
  CambioEstado,
  SubirDocumentosData,
} from '@/types/matriculacionTypes';

// ============================================================
// HOOK: Acciones principales (crear, rematricular, actualizar, retirar, PDF)
// ============================================================
export const useMatriculacion = (periodoAcademicoId?: number) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidarQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['estudiantes-elegibles'] });
    queryClient.invalidateQueries({ queryKey: ['matriculas'] });
    queryClient.invalidateQueries({ queryKey: ['estadisticas-matricula'] });
  };

  const matricularMutation = useMutation({
    mutationFn: ({ estudianteId, data }: { estudianteId: number; data: MatriculacionData }) =>
      matriculacionService.matricularEstudiante(estudianteId, data),
    onSuccess: (response) => {
      invalidarQueries();
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

  const rematricularMutation = useMutation({
    mutationFn: ({ estudianteId, data }: { estudianteId: number; data: RematriculacionData }) =>
      matriculacionService.rematricularEstudiante(estudianteId, data),
    onSuccess: (response) => {
      invalidarQueries();
      enqueueSnackbar(response.message || 'Re-matrícula exitosa', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al re-matricular', { variant: 'error' });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ matriculaId, data }: { matriculaId: number; data: MatriculaUpdate }) =>
      matriculacionService.actualizarMatricula(matriculaId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['matricula'] });
      enqueueSnackbar(response.message || 'Matrícula actualizada', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al actualizar', { variant: 'error' });
    },
  });

  const retirarMutation = useMutation({
    mutationFn: ({ matriculaId, data }: { matriculaId: number; data: RetiroMatricula }) =>
      matriculacionService.retirarMatricula(matriculaId, data),
    onSuccess: (response) => {
      invalidarQueries();
      queryClient.invalidateQueries({ queryKey: ['matricula'] });
      enqueueSnackbar(response.message || 'Matrícula retirada', { variant: 'info' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al retirar matrícula', { variant: 'error' });
    },
  });

  const descargarPDFMutation = useMutation({
    mutationFn: (matriculaId: number) => matriculacionService.descargarPDF(matriculaId),
    onSuccess: () => {
      enqueueSnackbar('PDF descargado exitosamente', { variant: 'success', autoHideDuration: 3000 });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al descargar PDF', { variant: 'error' });
    },
  });

  return {
    matricular: matricularMutation.mutate,
    matricularAsync: matricularMutation.mutateAsync,
    rematricular: rematricularMutation.mutate,
    rematricularAsync: rematricularMutation.mutateAsync,
    actualizar: actualizarMutation.mutate,
    actualizarAsync: actualizarMutation.mutateAsync,
    retirar: retirarMutation.mutate,
    retirarAsync: retirarMutation.mutateAsync,
    descargarPDF: descargarPDFMutation.mutate,

    isMatriculando: matricularMutation.isPending,
    isRematriculando: rematricularMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isRetirando: retirarMutation.isPending,
    isDescargandoPDF: descargarPDFMutation.isPending,
  };
};

// ============================================================
// HOOK: Detalle de una matrícula + acciones del detalle
// ============================================================
export const useMatricula = (matriculaId: number | null) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, error, refetch } = useQuery<MatriculaDetalleResponse>({
    queryKey: ['matricula', matriculaId],
    queryFn: () => matriculacionService.obtenerMatricula(matriculaId!),
    enabled: !!matriculaId,
    staleTime: 1000 * 60,
  });

  const transferirMutation = useMutation({
    mutationFn: (payload: TransferenciaParalelo) =>
      matriculacionService.transferirParalelo(matriculaId!, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['matricula', matriculaId] });
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      enqueueSnackbar(response.message || 'Estudiante transferido', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al transferir', { variant: 'error' });
    },
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: (payload: CambioEstado) =>
      matriculacionService.cambiarEstado(matriculaId!, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['matricula', matriculaId] });
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-matricula'] });
      enqueueSnackbar(response.message || 'Estado actualizado', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al cambiar estado', { variant: 'error' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: () => matriculacionService.eliminarMatricula(matriculaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      enqueueSnackbar('Matrícula eliminada', { variant: 'info' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar', { variant: 'error' });
    },
  });

  return {
    matricula: data?.matricula ?? null,
    documentos: data?.documentos ?? [],
    historial: data?.historial ?? [],
    isLoading,
    error,
    refetch,

    transferir: transferirMutation.mutate,
    transferirAsync: transferirMutation.mutateAsync,
    cambiarEstado: cambiarEstadoMutation.mutate,
    cambiarEstadoAsync: cambiarEstadoMutation.mutateAsync,
    eliminar: eliminarMutation.mutate,
    eliminarAsync: eliminarMutation.mutateAsync,

    isTransfiriendo: transferirMutation.isPending,
    isCambiandoEstado: cambiarEstadoMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};

// ============================================================
// HOOK: Documentos de una matrícula
// ============================================================
export const useMatriculaDocumentos = (matriculaId: number | null) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: documentos = [], isLoading, refetch } = useQuery({
    queryKey: ['matricula-documentos', matriculaId],
    queryFn: () => matriculacionService.listarDocumentos(matriculaId!),
    enabled: !!matriculaId,
    staleTime: 1000 * 60,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['matricula-documentos', matriculaId] });
    queryClient.invalidateQueries({ queryKey: ['matricula', matriculaId] });
  };

  const subirMutation = useMutation({
    mutationFn: (payload: SubirDocumentosData) =>
      matriculacionService.subirDocumentos(matriculaId!, payload),
    onSuccess: (docs) => {
      invalidar();
      enqueueSnackbar(`${docs.length} documento(s) subido(s)`, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al subir documentos', { variant: 'error' });
    },
  });

  const verificarMutation = useMutation({
    mutationFn: (docId: number) => matriculacionService.verificarDocumento(docId),
    onSuccess: () => {
      invalidar();
      enqueueSnackbar('Documento verificado', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al verificar', { variant: 'error' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (docId: number) => matriculacionService.eliminarDocumento(docId),
    onSuccess: () => {
      invalidar();
      enqueueSnackbar('Documento eliminado', { variant: 'info' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar documento', { variant: 'error' });
    },
  });

  return {
    documentos,
    isLoading,
    refetch,
    subir: subirMutation.mutate,
    subirAsync: subirMutation.mutateAsync,
    verificar: verificarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isSubiendo: subirMutation.isPending,
    isVerificando: verificarMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};

// ============================================================
// HOOK: Estudiantes elegibles
// ============================================================
export const useEstudiantesElegibles = (
  periodoAcademicoId: number | null,
  initialFilters: any = {}
) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery<EstudiantesElegiblesResponse>({
    queryKey: ['estudiantes-elegibles', periodoAcademicoId, filters],
    queryFn: () => matriculacionService.listarEstudiantesElegibles(periodoAcademicoId!, filters),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 2,
  });

  const actualizarFiltros = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    estudiantes: data?.estudiantes ?? [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters,
    actualizarFiltros,
    refetch,
  };
};

// ============================================================
// HOOK: Disponibilidad de paralelo
// ============================================================
export const useDisponibilidadParalelo = (
  paraleloId: number | null,
  periodoAcademicoId: number | null
) => {
  const { data, isLoading, error } = useQuery<DisponibilidadParalelo>({
    queryKey: ['disponibilidad-paralelo', paraleloId, periodoAcademicoId],
    queryFn: () => matriculacionService.verificarDisponibilidad(paraleloId!, periodoAcademicoId!),
    enabled: !!paraleloId && !!periodoAcademicoId,
    staleTime: 1000 * 30,
  });

  return {
    disponibilidad: data,
    isLoading,
    error,
    puedeMatricular: data?.capacidad.puede_matricular ?? false,
    capacidadInfo: data?.capacidad ?? null,
  };
};

// ============================================================
// HOOK: Matrículas por periodo
// ============================================================
export const useMatriculasPorPeriodo = (
  periodoAcademicoId: number | null,
  initialFilters: Omit<MatriculasFilters, 'periodo_academico_id'> = {}
) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery<MatriculasResponse>({
    queryKey: ['matriculas', periodoAcademicoId, filters],
    queryFn: () => matriculacionService.obtenerMatriculasPorPeriodo(periodoAcademicoId!, filters),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 2,
  });

  const actualizarFiltros = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    matriculas: data?.matriculas ?? [],
    paginacion: data?.paginacion,
    isLoading,
    error,
    filters,
    actualizarFiltros,
    refetch,
  };
};

// ============================================================
// HOOK: Estadísticas
// ============================================================
export const useEstadisticasMatricula = (periodoAcademicoId: number | null) => {
  const { data, isLoading, error } = useQuery<EstadisticasMatricula>({
    queryKey: ['estadisticas-matricula', periodoAcademicoId],
    queryFn: () => matriculacionService.obtenerEstadisticas(periodoAcademicoId!),
    enabled: !!periodoAcademicoId,
    staleTime: 1000 * 60 * 5,
  });

  return { estadisticas: data, isLoading, error };
};

// ============================================================
// HOOK: PDF
// ============================================================
export const useMatriculaPDF = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isDownloading, setIsDownloading] = useState(false);

  const descargarPDF = useCallback(async (matriculaId: number) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar('Generando PDF...', { variant: 'info' });
      await matriculacionService.descargarPDF(matriculaId);
      enqueueSnackbar('PDF descargado exitosamente', { variant: 'success', autoHideDuration: 3000 });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error al descargar PDF', { variant: 'error' });
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, [enqueueSnackbar]);

  const verPreview = useCallback((matriculaId: number) => {
    try {
      matriculacionService.verPDFPreview(matriculaId);
    } catch {
      enqueueSnackbar('Error al abrir PDF', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  return { descargarPDF, verPreview, isDownloading };
};