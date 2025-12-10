// hooks/useRegistroCompleto.ts
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { RegistroCompleto, RegistroCompletoResponse } from '@/types/estudianteTypes';
import { registroCompletoService, gestionAcademicaService } from '@/services/estudiantesService';
import { useSnackbar } from 'notistack';

export const useRegistroCompleto = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<RegistroCompletoResponse['data'] | null>(null);

  const registrarMutation = useMutation({
    mutationFn: (data: RegistroCompleto) => registroCompletoService.registrar(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      if (response.data.credenciales_estudiante || response.data.credenciales_tutores) {
        setCredencialesGeneradas(response.data);
      }
      enqueueSnackbar(response.message || 'Registro completado exitosamente', { 
        variant: 'success',
        autoHideDuration: 5000,
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error en el registro completo', { 
        variant: 'error',
        autoHideDuration: 8000,
      });
    },
  });

  const limpiarCredenciales = () => setCredencialesGeneradas(null);

  return {
    registrar: registrarMutation.mutate,
    isRegistrando: registrarMutation.isPending,
    error: registrarMutation.error,
    credencialesGeneradas,
    limpiarCredenciales,
  };
};

// =============================================
// HOOK: Gestión Académica (para selectores)
// =============================================
export const useGestionAcademica = () => {
  const { enqueueSnackbar } = useSnackbar();

  // ✅ PERIODOS - SIN initialData
  const { 
    data: periodos = [], 
    isLoading: isLoadingPeriodos,
    error: errorPeriodos 
  } = useQuery({
    queryKey: ['periodos-academicos'],
    queryFn: async () => {
      console.log('🔄 Fetching PERIODOS...');
      const resultado = await gestionAcademicaService.obtenerPeriodos();
      console.log('✅ Periodos obtenidos:', resultado);
      return Array.isArray(resultado) ? resultado : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10,   // 10 minutos (antes cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ PERIODO ACTIVO
  const { 
    data: periodoActivo,
    isLoading: isLoadingPeriodoActivo 
  } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: async () => {
      console.log('🔄 Fetching PERIODO ACTIVO...');
      const resultado = await gestionAcademicaService.obtenerPeriodoActivo();
      console.log('✅ Periodo activo:', resultado);
      return resultado;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ GRADOS - SIN initialData
  const { 
    data: grados = [], 
    isLoading: isLoadingGrados,
    error: errorGrados 
  } = useQuery({
    queryKey: ['grados'],
    queryFn: async () => {
      console.log('🔄 Fetching GRADOS...');
      const resultado = await gestionAcademicaService.obtenerGrados();
      console.log('✅ Grados obtenidos:', resultado);
      return Array.isArray(resultado) ? resultado : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Log de errores
  if (errorPeriodos) console.error('❌ Error periodos:', errorPeriodos);
  if (errorGrados) console.error('❌ Error grados:', errorGrados);

  // ✅ NUEVO: Query para obtener TODOS los paralelos de un periodo/año
  const obtenerTodosLosParalelos = useCallback(async (anio: number) => {
    try {
      console.log('🔍 Obteniendo todos los paralelos del año:', anio);
      const todosLosParalelos = [];
      
      for (const grado of grados) {
        const paralelos = await gestionAcademicaService.obtenerParalelos(grado.id, anio);
        todosLosParalelos.push(...paralelos);
      }
      
      console.log('✅ Total paralelos cargados:', todosLosParalelos.length);
      return todosLosParalelos;
    } catch (error: any) {
      console.error('❌ Error al cargar paralelos:', error);
      enqueueSnackbar('Error al cargar paralelos', { variant: 'error' });
      return [];
    }
  }, [grados, enqueueSnackbar]);

  // ✅ MEMOIZADO: Paralelos (dinámicos por grado)
  const obtenerParalelos = useCallback(async (gradoId: number, anio?: number) => {
    try {
      return await gestionAcademicaService.obtenerParalelos(gradoId, anio);
    } catch (error: any) {
      enqueueSnackbar('Error al cargar paralelos', { variant: 'error' });
      return [];
    }
  }, [enqueueSnackbar]);

  // ✅ MEMOIZADO: Verificar capacidad
  const verificarCapacidad = useCallback(async (paraleloId: number, periodoId: number) => {
    try {
      return await gestionAcademicaService.verificarCapacidad(paraleloId, periodoId);
    } catch (error: any) {
      enqueueSnackbar('Error al verificar capacidad', { variant: 'error' });
      return null;
    }
  }, [enqueueSnackbar]);

  return {
    periodos: periodos || [],
    periodoActivo,
    grados: grados || [],
    isLoadingPeriodos,
    isLoadingPeriodoActivo,
    isLoadingGrados,
    obtenerParalelos,
    obtenerTodosLosParalelos,
    verificarCapacidad,
  };
};