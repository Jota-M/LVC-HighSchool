// hooks/useDocumentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import documentosService from '@/services/documentosService';
import { DocumentoUpload, DocumentoVerificar } from '@/types/documentosTypes';

export const useDocumentos = (matriculaId: number | null) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Query para obtener documentos
  const {
    data: documentos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['matricula-documentos', matriculaId],
    queryFn: () => documentosService.obtenerDocumentosPorMatricula(matriculaId!),
    enabled: !!matriculaId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation para subir documento
  const subirMutation = useMutation({
    mutationFn: (documento: DocumentoUpload) =>
      documentosService.subirDocumento(matriculaId!, documento),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['matricula-documentos', matriculaId],
      });
      enqueueSnackbar('Documento subido exitosamente', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al subir documento',
        { variant: 'error' }
      );
    },
  });

  // Mutation para verificar documento
  const verificarMutation = useMutation({
    mutationFn: ({
      documentoId,
      datos,
    }: {
      documentoId: number;
      datos?: DocumentoVerificar;
    }) => documentosService.verificarDocumento(matriculaId!, documentoId, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['matricula-documentos', matriculaId],
      });
      enqueueSnackbar('Documento verificado exitosamente', {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al verificar documento',
        { variant: 'error' }
      );
    },
  });

  // Mutation para eliminar documento
  const eliminarMutation = useMutation({
    mutationFn: (documentoId: number) =>
      documentosService.eliminarDocumento(matriculaId!, documentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['matricula-documentos', matriculaId],
      });
      enqueueSnackbar('Documento eliminado exitosamente', {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al eliminar documento',
        { variant: 'error' }
      );
    },
  });

  return {
    // Datos
    documentos: documentos || [],
    isLoading,
    error,

    // Acciones
    subirDocumento: subirMutation.mutate,
    verificarDocumento: verificarMutation.mutate,
    eliminarDocumento: eliminarMutation.mutate,

    // Estados de las mutaciones
    isSubiendo: subirMutation.isPending,
    isVerificando: verificarMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
};