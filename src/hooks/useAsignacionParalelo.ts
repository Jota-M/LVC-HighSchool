// hooks/useAsignacionParalelo.ts
import { useState, useCallback } from 'react';
import { Paralelo } from '@/types/estudianteTypes';
import { useSnackbar } from 'notistack';

interface CriteriosAsignacion {
  gradoId: number;
  turnoPreferido?: number;
  periodoId: number;
}

interface DisponibilidadParalelo {
  paralelo: Paralelo;
  capacidad: {
    maxima: number;
    ocupada: number;
    disponible: number;
    porcentaje: number;
  };
}

export const useAsignacionParalelo = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isCalculando, setIsCalculando] = useState(false);

  /**
   * Obtiene el grado siguiente basado en la última matrícula
   */
  const obtenerGradoSiguiente = useCallback((ultimaMatricula: any): number | null => {
    if (!ultimaMatricula) return null;
    
    // Lógica para determinar el siguiente grado
    // Esto depende de tu estructura de grados
    // Ejemplo: si tiene grado_id en la matrícula
    return ultimaMatricula.grado_id ? ultimaMatricula.grado_id + 1 : null;
  }, []);

  /**
   * Calcula la disponibilidad de cada paralelo
   */
  const calcularDisponibilidad = useCallback(async (
    paralelos: Paralelo[],
    periodoId: number,
    verificarCapacidad: (paraleloId: number, periodoId: number) => Promise<any>
  ): Promise<DisponibilidadParalelo[]> => {
    const disponibilidades: DisponibilidadParalelo[] = [];

    for (const paralelo of paralelos) {
      try {
        const capacidadInfo = await verificarCapacidad(paralelo.id, periodoId);
        
        if (capacidadInfo && capacidadInfo.capacidad.disponible > 0) {
          disponibilidades.push({
            paralelo,
            capacidad: capacidadInfo.capacidad,
          });
        }
      } catch (error) {
        console.error(`Error al verificar capacidad del paralelo ${paralelo.id}:`, error);
      }
    }

    return disponibilidades;
  }, []);

  /**
   * Asigna automáticamente el mejor paralelo según criterios
   */
  const asignarParaleloAutomatico = useCallback(async (
    criterios: CriteriosAsignacion,
    paralelos: Paralelo[],
    verificarCapacidad: (paraleloId: number, periodoId: number) => Promise<any>
  ): Promise<Paralelo | null> => {
    setIsCalculando(true);
    
    try {
      // 1. Filtrar paralelos del grado solicitado
      let paralelosFiltrados = paralelos.filter(
        p => p.grado_id === criterios.gradoId
      );

      if (paralelosFiltrados.length === 0) {
        enqueueSnackbar('No hay paralelos disponibles para el grado solicitado', {
          variant: 'warning',
        });
        return null;
      }

      // 2. Si hay turno preferido, filtrar por turno
      if (criterios.turnoPreferido) {
        const paralelosTurnoPreferido = paralelosFiltrados.filter(
          p => p.turno_id === criterios.turnoPreferido
        );
        
        // Si hay paralelos en el turno preferido, usarlos
        if (paralelosTurnoPreferido.length > 0) {
          paralelosFiltrados = paralelosTurnoPreferido;
        }
      }

      // 3. Obtener disponibilidad de cada paralelo
      const disponibilidades = await calcularDisponibilidad(
        paralelosFiltrados,
        criterios.periodoId,
        verificarCapacidad
      );

      if (disponibilidades.length === 0) {
        enqueueSnackbar('No hay paralelos con capacidad disponible', {
          variant: 'error',
        });
        return null;
      }

      // 4. Ordenar por criterios de prioridad:
      // a) Turno preferido (si aplica)
      // b) Mayor disponibilidad (para balanceo de carga)
      // c) Menor porcentaje de ocupación
      disponibilidades.sort((a, b) => {
        // Prioridad 1: Turno preferido
        if (criterios.turnoPreferido) {
          if (a.paralelo.turno_id === criterios.turnoPreferido && 
              b.paralelo.turno_id !== criterios.turnoPreferido) {
            return -1;
          }
          if (b.paralelo.turno_id === criterios.turnoPreferido && 
              a.paralelo.turno_id !== criterios.turnoPreferido) {
            return 1;
          }
        }

        // Prioridad 2: Menor porcentaje de ocupación (balanceo)
        return a.capacidad.porcentaje - b.capacidad.porcentaje;
      });

      // 5. Seleccionar el primer paralelo (mejor opción)
      const paraleloSeleccionado = disponibilidades[0].paralelo;

      enqueueSnackbar(
        `Paralelo asignado automáticamente: ${paraleloSeleccionado.grado_nombre} - ${paraleloSeleccionado.nombre}`,
        { variant: 'success' }
      );

      return paraleloSeleccionado;

    } catch (error) {
      console.error('Error en asignación automática:', error);
      enqueueSnackbar('Error al asignar paralelo automáticamente', {
        variant: 'error',
      });
      return null;
    } finally {
      setIsCalculando(false);
    }
  }, [calcularDisponibilidad, enqueueSnackbar]);

  /**
   * Obtiene sugerencias de paralelos (top 3)
   */
  const obtenerSugerenciasParalelos = useCallback(async (
    criterios: CriteriosAsignacion,
    paralelos: Paralelo[],
    verificarCapacidad: (paraleloId: number, periodoId: number) => Promise<any>
  ): Promise<DisponibilidadParalelo[]> => {
    try {
      const paralelosFiltrados = paralelos.filter(
        p => p.grado_id === criterios.gradoId
      );

      const disponibilidades = await calcularDisponibilidad(
        paralelosFiltrados,
        criterios.periodoId,
        verificarCapacidad
      );

      // Ordenar y devolver top 3
      return disponibilidades
        .sort((a, b) => {
          if (criterios.turnoPreferido) {
            if (a.paralelo.turno_id === criterios.turnoPreferido && 
                b.paralelo.turno_id !== criterios.turnoPreferido) {
              return -1;
            }
            if (b.paralelo.turno_id === criterios.turnoPreferido && 
                a.paralelo.turno_id !== criterios.turnoPreferido) {
              return 1;
            }
          }
          return a.capacidad.porcentaje - b.capacidad.porcentaje;
        })
        .slice(0, 3);
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      return [];
    }
  }, [calcularDisponibilidad]);

  return {
    asignarParaleloAutomatico,
    obtenerGradoSiguiente,
    obtenerSugerenciasParalelos,
    isCalculando,
  };
};