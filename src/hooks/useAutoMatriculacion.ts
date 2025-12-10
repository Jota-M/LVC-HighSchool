// hooks/useAutoMatriculacion.ts
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import autoMatriculacionService from '@/services/autoMatriculacionService';
import {
  ValidacionCredenciales,
  ValidacionResponse,
  AutoMatriculacionData,
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
      // ✅ CORREGIDO: Guardar credenciales completas para usar en queries posteriores
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
        credenciales!.ci // ✅ Ahora usa el CI guardado
      ),
    enabled: !!credenciales?.codigo && !!credenciales?.ci && !!datosEstudiante,
    staleTime: 1000 * 60 * 5, // 5 minutos
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
    matricular: matricularMutation.mutate,
    resetear,

    // Estados
    isValidando: validarMutation.isPending,
    isMatriculando: matricularMutation.isPending,
    isLoadingOpciones,

    // Datos
    datosEstudiante,
    opciones: opciones?.data,
    matriculaExitosa: matricularMutation.data,

    // Errores
    errorValidacion: validarMutation.error,
    errorOpciones,
    errorMatriculacion: matricularMutation.error,
  };
};