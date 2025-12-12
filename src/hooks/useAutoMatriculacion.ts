// hooks/useAutoMatriculacion.ts
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import autoMatriculacionService from '@/services/autoMatriculacionService';
import {
  ValidacionCredenciales,
  ValidacionResponse,
  AutoMatriculacionData,
  ActualizarDatosPayload,
} from '@/types/autoMatriculacionTypes';

export const useAutoMatriculacion = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [credenciales, setCredenciales] = useState<ValidacionCredenciales | null>(null);
  const [datosEstudiante, setDatosEstudiante] = useState<ValidacionResponse['data'] | null>(null);

  // =============================================
  // MUTATION: Validar estudiante
  // =============================================
  const validarMutation = useMutation({
    mutationFn: (creds: ValidacionCredenciales) =>
      autoMatriculacionService.validarEstudiante(creds),
    onSuccess: (response, variables) => {
      setCredenciales({ codigo: variables.codigo, ci: variables.ci });
      setDatosEstudiante(response.data);
      enqueueSnackbar(response.message || 'Estudiante validado correctamente', {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al validar estudiante',
        { variant: 'error' }
      );
    },
  });

  // =============================================
  // QUERY: Obtener opciones de matrícula
  // =============================================
  const {
    data: opciones,
    isLoading: isLoadingOpciones,
    error: errorOpciones,
  } = useQuery({
    queryKey: ['opciones-matricula', credenciales?.codigo, credenciales?.ci],
    queryFn: () =>
      autoMatriculacionService.obtenerOpciones(
        credenciales!.codigo,
        credenciales!.ci
      ),
    enabled: !!credenciales?.codigo && !!credenciales?.ci && !!datosEstudiante,
    staleTime: 1000 * 60 * 5,
  });

  // =============================================
  // MUTATION: Actualizar datos del estudiante
  // =============================================
  const actualizarDatosMutation = useMutation({
    mutationFn: (payload: ActualizarDatosPayload) =>
      autoMatriculacionService.actualizarDatos(payload),
    onSuccess: (response) => {
      // Actualizar datos locales
      if (datosEstudiante) {
        setDatosEstudiante({
          ...datosEstudiante,
          estudiante: {
            ...datosEstudiante.estudiante,
            ...response.data.estudiante,
          },
        });
      }
      enqueueSnackbar(
        response.message || 'Datos actualizados correctamente',
        { variant: 'success' }
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al actualizar datos',
        { variant: 'error' }
      );
    },
  });

  // =============================================
  // MUTATION: Auto-matricular
  // =============================================
  const matricularMutation = useMutation({
    mutationFn: (data: AutoMatriculacionData) =>
      autoMatriculacionService.matricular(data),
    onSuccess: (response) => {
      enqueueSnackbar(
        response.message || '¡Matrícula exitosa!',
        {
          variant: 'success',
          autoHideDuration: 8000,
        }
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al procesar la matrícula',
        {
          variant: 'error',
          autoHideDuration: 8000,
        }
      );
    },
  });

  const resetear = () => {
    setCredenciales(null);
    setDatosEstudiante(null);
  };

  return {
    // Acciones
    validar: validarMutation.mutate,
    actualizarDatos: actualizarDatosMutation.mutate,
    matricular: matricularMutation.mutate,
    resetear,

    // Estados
    isValidando: validarMutation.isPending,
    isActualizando: actualizarDatosMutation.isPending,
    isMatriculando: matricularMutation.isPending,
    isLoadingOpciones,

    // Datos
    datosEstudiante,
    opciones: opciones?.data,
    matriculaExitosa: matricularMutation.data,

    // Errores
    errorValidacion: validarMutation.error,
    errorActualizacion: actualizarDatosMutation.error,
    errorOpciones,
    errorMatriculacion: matricularMutation.error,
  };
};