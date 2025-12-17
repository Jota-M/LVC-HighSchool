// hooks/useRegistroCompleto.ts
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { RegistroCompleto, RegistroCompletoResponse } from '@/types/estudianteTypes';
import { registroCompletoService, gestionAcademicaService } from '@/services/estudiantesService';
import { useSnackbar } from 'notistack';

// =============================================
// HOOK: Registro Completo (3 modos)
// =============================================

export const useRegistroCompleto = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<RegistroCompletoResponse['data'] | null>(null);

  const registrarMutation = useMutation({
    mutationFn: (data: RegistroCompleto) => {
      console.log('🚀 Hook: Iniciando registro con modo:', data.modo);
      return registroCompletoService.registrar(data);
    },
    onSuccess: (response) => {
      console.log('✅ Hook: Registro exitoso', response);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      
      // Guardar credenciales si existen
      if (response.data.credenciales_estudiantes || response.data.credenciales_tutores) {
        setCredencialesGeneradas(response.data);
      }
      
      enqueueSnackbar(response.message || 'Registro completado exitosamente', { 
        variant: 'success',
        autoHideDuration: 5000,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Hook: Error en registro', error);
      enqueueSnackbar(error.message || 'Error en el registro completo', { 
        variant: 'error',
        autoHideDuration: 8000,
      });
    },
  });

  const limpiarCredenciales = useCallback(() => {
    setCredencialesGeneradas(null);
  }, []);

  return {
    registrar: registrarMutation.mutate,
    isRegistrando: registrarMutation.isPending,
    error: registrarMutation.error,
    credencialesGeneradas,
    limpiarCredenciales,
  };
};

// =============================================
// HOOK: Búsqueda de Padre/Tutor
// =============================================

export const useBuscarPadre = () => {
  const { enqueueSnackbar } = useSnackbar();

  const buscarMutation = useMutation({
    mutationFn: (ci: string) => registroCompletoService.buscarPadrePorCI(ci),
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Error al buscar padre/tutor', { 
        variant: 'error' 
      });
    },
  });

  return {
    buscarPadre: buscarMutation.mutate,
    isBuscando: buscarMutation.isPending,
    padre: buscarMutation.data?.data.padre || null,
    encontrado: buscarMutation.data?.data.encontrado || false,
    error: buscarMutation.error,
  };
};

// =============================================
// HOOK: Gestión Académica
// =============================================

export const useGestionAcademica = () => {
  const { enqueueSnackbar } = useSnackbar();

  // PERIODOS
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
    gcTime: 1000 * 60 * 10,   // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // PERIODO ACTIVO
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

  // GRADOS
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

  // NIVELES
  const { 
    data: niveles = [], 
    isLoading: isLoadingNiveles,
  } = useQuery({
    queryKey: ['niveles-academicos'],
    queryFn: async () => {
      console.log('🔄 Fetching NIVELES...');
      const resultado = await gestionAcademicaService.obtenerNiveles();
      console.log('✅ Niveles obtenidos:', resultado);
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

  // Obtener todos los paralelos de un año
  const obtenerTodosLosParalelos = useCallback(async (anio: number) => {
    try {
      console.log('🔍 Obteniendo TODOS los paralelos del año:', anio);
      const paralelos = await gestionAcademicaService.obtenerTodosLosParalelos(anio);
      console.log('✅ Total paralelos cargados:', paralelos.length);
      return paralelos;
    } catch (error: any) {
      console.error('❌ Error al cargar paralelos:', error);
      enqueueSnackbar('Error al cargar paralelos', { variant: 'error' });
      return [];
    }
  }, [enqueueSnackbar]);

  // Obtener paralelos por grado
  const obtenerParalelos = useCallback(async (gradoId: number, anio?: number) => {
    try {
      return await gestionAcademicaService.obtenerParalelos(gradoId, anio);
    } catch (error: any) {
      enqueueSnackbar('Error al cargar paralelos', { variant: 'error' });
      return [];
    }
  }, [enqueueSnackbar]);

  // Verificar capacidad de paralelo
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
    niveles: niveles || [],
    isLoadingPeriodos,
    isLoadingPeriodoActivo,
    isLoadingGrados,
    isLoadingNiveles,
    obtenerParalelos,
    obtenerTodosLosParalelos,
    verificarCapacidad,
  };
};