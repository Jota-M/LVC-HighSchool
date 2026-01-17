// hooks/useConversionPreinscripcion.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import preinscripcionService from '@/services/preinscripcionService';
import api from '@/lib/api';

// =============================================
// TIPOS
// =============================================
interface Periodo {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface Grado {
  id: number;
  nombre: string;
  nivel_academico_id: number;
  nivel_nombre: string;
  nivel_codigo: string;
  codigo: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Paralelo {
  id: number;
  nombre: string;
  grado_id: number;
  grado_nombre: string;
  grado_codigo: string;
  turno_id: number;
  turno_nombre: string;
  turno_codigo: string;
  capacidad_maxima: number;
  capacidad_minima: number;
  total_estudiantes: string;
  anio: number;
  aula?: string;
  activo: boolean;
  nivel_nombre: string;
}

interface Preinscripcion {
  id: number;
  codigo_inscripcion: string;
  estado: string;
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    ci: string | null;
    fecha_nacimiento: string;
    grado_solicitado: string;
    foto_url?: string;
  };
  tutor: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    telefono: string;
  };
}

interface Credenciales {
  username: string;
  password: string;
  email: string;
  debe_cambiar_password: boolean;
}

interface ConversionResponse {
  success: boolean;
  message: string;
  data: {
    estudiante: {
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
      foto_url?: string;
    };
    matricula: {
      id: number;
      numero_matricula: string;
      estado: string;
    };
    credenciales_estudiante?: Credenciales;
    credenciales_padre?: Credenciales;
    documentos_migrados?: number;
  };
}

// =============================================
// HOOK PRINCIPAL
// =============================================
export const useConversionPreinscripcion = (preinscripcionId: number) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // =============================================
  // QUERY: Obtener preinscripción
  // =============================================
  const {
    data: preinscripcion,
    isLoading: loadingPreinscripcion,
    error: errorPreinscripcion,
  } = useQuery<Preinscripcion>({
    queryKey: ['preinscripcion', preinscripcionId],
    queryFn: async () => {
      const response = await preinscripcionService.obtenerPorId(preinscripcionId);
      return response as Preinscripcion;
    },
    staleTime: 1000 * 60 * 5,
  });

  // =============================================
  // QUERY: Obtener periodos académicos - CORREGIDO
  // =============================================
  const {
    data: periodos,
    isLoading: loadingPeriodos,
    error: errorPeriodos,
  } = useQuery<Periodo[]>({
    queryKey: ['periodos-academicos'],
    queryFn: async () => {
      try {
        const response = await api.get('/periodo-academico');
        console.log('📅 Response completa de periodos:', response);
        console.log('📅 Response.data:', response.data);
        
        // Intentar diferentes estructuras de respuesta
        let periodosData = null;
        
        if (response.data?.data?.periodos) {
          periodosData = response.data.data.periodos;
        } else if (response.data?.periodos) {
          periodosData = response.data.periodos;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          periodosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          periodosData = response.data;
        }
        
        console.log('📅 Periodos extraídos:', periodosData);
        
        if (!Array.isArray(periodosData)) {
          console.warn('⚠️ Periodos no es un array:', periodosData);
          return [];
        }
        
        return periodosData;
      } catch (error) {
        console.error('❌ Error al cargar periodos:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  // =============================================
  // QUERY: Obtener grados - CORREGIDO
  // =============================================
  const {
    data: grados,
    isLoading: loadingGrados,
    error: errorGrados,
  } = useQuery<Grado[]>({
    queryKey: ['grados'],
    queryFn: async () => {
      try {
        const response = await api.get('/grado');
        console.log('📚 Response de grados:', response.data);
        
        let gradosData = null;
        
        if (response.data?.data?.grados) {
          gradosData = response.data.data.grados;
        } else if (response.data?.grados) {
          gradosData = response.data.grados;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          gradosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          gradosData = response.data;
        }
        
        console.log('📚 Grados extraídos:', gradosData);
        
        if (!Array.isArray(gradosData)) {
          console.warn('⚠️ Grados no es un array:', gradosData);
          return [];
        }
        
        return gradosData;
      } catch (error) {
        console.error('❌ Error al cargar grados:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  // =============================================
  // QUERY: Obtener paralelos disponibles - CORREGIDO
  // =============================================
  const {
    data: paralelos,
    isLoading: loadingParalelos,
    error: errorParalelos,
  } = useQuery<Paralelo[]>({
    queryKey: ['paralelos-disponibles'],
    queryFn: async () => {
      try {
        const response = await api.get('/paralelo');
        console.log('👥 Response de paralelos:', response.data);
        
        let paralelosData = null;
        
        if (response.data?.data?.paralelos) {
          paralelosData = response.data.data.paralelos;
        } else if (response.data?.paralelos) {
          paralelosData = response.data.paralelos;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          paralelosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          paralelosData = response.data;
        }
        
        console.log('👥 Paralelos extraídos:', paralelosData);
        
        if (!Array.isArray(paralelosData)) {
          console.warn('⚠️ Paralelos no es un array:', paralelosData);
          return [];
        }
        
        const paralelosConDisponibilidad = paralelosData
          .map((p: any) => ({
            ...p,
            estudiantes_actuales: parseInt(p.total_estudiantes) || 0,
            disponibles: p.capacidad_maxima - (parseInt(p.total_estudiantes) || 0),
            porcentaje_ocupacion: Math.round(
              ((parseInt(p.total_estudiantes) || 0) / p.capacidad_maxima) * 100
            ),
          }))
          .filter((p: any) => p.disponibles > 0);
        
        console.log('👥 Paralelos con disponibilidad:', paralelosConDisponibilidad);
        
        return paralelosConDisponibilidad;
      } catch (error) {
        console.error('❌ Error al cargar paralelos:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // =============================================
  // MUTATION: Convertir a estudiante
  // =============================================
  const convertirMutation = useMutation<
    ConversionResponse,
    Error,
    { paralelo_id: number; periodo_academico_id: number }
  >({
    mutationFn: async ({ paralelo_id, periodo_academico_id }) => {
      return preinscripcionService.convertirAEstudiante(preinscripcionId, {
        paralelo_id,
        periodo_academico_id,
      });
    },
    onSuccess: (data) => {
      let mensaje = `¡Estudiante creado exitosamente! Código: ${data.data.estudiante.codigo}`;
      
      if (data.data.credenciales_estudiante) {
        mensaje += ' ✅ Usuario de estudiante creado.';
      }
      
      if (data.data.credenciales_padre) {
        mensaje += ' ✅ Usuario de padre creado.';
      }
      
      if (data.data.documentos_migrados && data.data.documentos_migrados > 0) {
        mensaje += ` ✅ ${data.data.documentos_migrados} documento(s) migrado(s).`;
      }
      
      enqueueSnackbar(mensaje, { 
        variant: 'success', 
        autoHideDuration: 8000,
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['preinscripcion', preinscripcionId] });
      queryClient.invalidateQueries({ queryKey: ['preinscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
    onError: (error: any) => {
      console.error('❌ Error en conversión:', error);
      enqueueSnackbar(
        error.message || 'Error al convertir preinscripción',
        { variant: 'error', autoHideDuration: 6000 }
      );
    },
  });

  // =============================================
  // DATOS PROCESADOS
  // =============================================
  const periodosActivos = Array.isArray(periodos) 
    ? periodos.filter(p => p.activo) 
    : [];

  // Debug de estados
  console.log('🔍 Estado del Hook:', {
    periodos,
    periodosActivos,
    grados,
    paralelos,
    loadingPeriodos,
    loadingGrados,
    loadingParalelos,
    errorPeriodos,
    errorGrados,
    errorParalelos,
  });

  return {
    // Datos principales
    preinscripcion,
    periodos: periodosActivos,
    paralelos: paralelos || [],
    grados: grados || [],
    
    // Estados de carga individuales
    loadingPreinscripcion,
    loadingPeriodos,
    loadingGrados,
    loadingParalelos,
    
    // Estado de carga global
    isLoading: loadingPreinscripcion || loadingPeriodos,
    
    // Acciones
    convertir: convertirMutation.mutate,
    isConverting: convertirMutation.isPending,
    conversionExitosa: convertirMutation.data, 
    
    // Errores
    error: errorPreinscripcion,
    errorPeriodos,
    errorGrados,
    errorParalelos,
    errorConversion: convertirMutation.error,
  };
};