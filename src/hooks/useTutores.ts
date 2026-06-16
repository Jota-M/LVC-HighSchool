import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { tutoresService } from '@/services/estudiantesService';

export const useTutores = (estudianteId: number) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['estudiante', estudianteId] });
  };

  // Agregar tutor nuevo: crea padre_familia + asigna relación
  const agregarNuevoMutation = useMutation({
    mutationFn: async ({ datosTutor, datosRelacion }: { datosTutor: any; datosRelacion: any }) => {
      const padre = await tutoresService.crearPadreFamilia(datosTutor);
      await tutoresService.asignar(estudianteId, {
        padre_familia_id: padre.id,
        ...datosRelacion,
      });
    },
    onSuccess: () => { invalidar(); enqueueSnackbar('Tutor agregado exitosamente', { variant: 'success' }); },
    onError: (error: Error) => { enqueueSnackbar(error.message || 'Error al agregar tutor', { variant: 'error' }); },
  });

  // Asignar tutor que ya existe en el sistema
  const asignarExistenteMutation = useMutation({
    mutationFn: (payload: any) => tutoresService.asignar(estudianteId, payload),
    onSuccess: () => { invalidar(); enqueueSnackbar('Tutor asignado exitosamente', { variant: 'success' }); },
    onError: (error: Error) => { enqueueSnackbar(error.message || 'Error al asignar tutor', { variant: 'error' }); },
  });

  // Editar tutor: actualiza padre_familia Y la relación en paralelo
  const editarMutation = useMutation({
    mutationFn: async ({ padreId, relacionId, datosTutor, datosRelacion }: {
      padreId: number; relacionId: number; datosTutor: any; datosRelacion: any;
    }) => {
      await Promise.all([
        tutoresService.actualizarPadreFamilia(padreId, datosTutor),
        tutoresService.actualizarRelacion(estudianteId, relacionId, datosRelacion),
      ]);
    },
    onSuccess: () => { invalidar(); enqueueSnackbar('Tutor actualizado exitosamente', { variant: 'success' }); },
    onError: (error: Error) => { enqueueSnackbar(error.message || 'Error al actualizar tutor', { variant: 'error' }); },
  });

  // Remover tutor del estudiante (no elimina padre_familia)
  const removerMutation = useMutation({
    mutationFn: (relacionId: number) => tutoresService.remover(estudianteId, relacionId),
    onSuccess: () => { invalidar(); enqueueSnackbar('Tutor removido exitosamente', { variant: 'success' }); },
    onError: (error: Error) => { enqueueSnackbar(error.message || 'Error al remover tutor', { variant: 'error' }); },
  });

  return {
    agregarTutorNuevo: agregarNuevoMutation.mutateAsync,
    asignarTutorExistente: asignarExistenteMutation.mutateAsync,
    editarTutor: editarMutation.mutateAsync,
    removerTutor: removerMutation.mutateAsync,
    buscarTutorPorCI: tutoresService.buscarPorCI,
    isAgregando: agregarNuevoMutation.isPending,
    isAsignando: asignarExistenteMutation.isPending,
    isEditando: editarMutation.isPending,
    isRemoviendo: removerMutation.isPending,
  };
};