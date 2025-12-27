// hooks/useInscripcionPublica.ts
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import cursoVacacionalService from '@/services/cursoVacacionalService';
import { FormInscripcionPublica } from '@/types/cursoVacacionalTypes';

export const useInscripcionPublica = () => {
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (data: FormInscripcionPublica) =>
      cursoVacacionalService.inscripciones.inscribirPublico(data),
    onSuccess: () => {
      enqueueSnackbar(
        '¡Inscripción exitosa! En breve recibirás confirmación',
        { variant: 'success' }
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al inscribirse',
        { variant: 'error' }
      );
    },
  });

  return {
    inscribirPublico: mutation.mutateAsync,
    isInscribiendo: mutation.isPending,
  };
};
