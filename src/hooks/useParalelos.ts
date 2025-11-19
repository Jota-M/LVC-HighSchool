import { useState, useEffect, useCallback } from 'react';
import paralelosService, { Paralelo, ParaleloFormData, Turno } from '../services/paralelos';

interface UseParalelosOptions {
  autoLoad?: boolean;
  grado_id?: number;
  turno_id?: number;
  anio?: number;
  activo?: boolean;
}

interface UseParalelosReturn {
  paralelos: Paralelo[];
  turnos: Turno[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  crearParalelo: (data: ParaleloFormData) => Promise<void>;
  actualizarParalelo: (id: number, data: Partial<ParaleloFormData>) => Promise<void>;
  eliminarParalelo: (id: number) => Promise<void>;
  estadisticas: {
    totalParalelos: number;
    totalEstudiantes: number;
    promedioEstudiantes: number;
    paralelosLlenos: number;
    paralelosBajoMinimo: number;
    capacidadTotal: number;
    tasaOcupacion: number;
  };
}

export const useParalelos = (options: UseParalelosOptions = {}): UseParalelosReturn => {
  const {
    autoLoad = true,
    grado_id,
    turno_id,
    anio,
    activo
  } = options;

  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar paralelos
      const paralelosRes = await paralelosService.listarParalelos({
        grado_id,
        turno_id,
        anio,
        activo
      });
      setParalelos(paralelosRes.data.paralelos);

      // Cargar turnos
      try {
        const turnosRes = await paralelosService.listarTurnos();
        setTurnos(turnosRes.data.turnos);
      } catch (err) {
        // Si no existe el endpoint de turnos, usar valores por defecto
        console.warn('Endpoint de turnos no disponible, usando valores por defecto');
        setTurnos([
          { id: 1, nombre: 'Mañana', codigo: 'M' },
          { id: 2, nombre: 'Tarde', codigo: 'T' },
          { id: 3, nombre: 'Noche', codigo: 'N' }
        ]);
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar paralelos';
      setError(errorMessage);
      console.error('Error fetching paralelos:', err);
    } finally {
      setLoading(false);
    }
  }, [grado_id, turno_id, anio, activo]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  // ============== MÉTODOS ==============

  const crearParalelo = async (data: ParaleloFormData) => {
    try {
      setLoading(true);
      setError(null);
      await paralelosService.crearParalelo(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear paralelo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarParalelo = async (id: number, data: Partial<ParaleloFormData>) => {
    try {
      setLoading(true);
      setError(null);
      await paralelosService.actualizarParalelo(id, data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar paralelo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarParalelo = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await paralelosService.eliminarParalelo(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar paralelo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const estadisticas = paralelosService.obtenerEstadisticas(paralelos);

  return {
    paralelos,
    turnos,
    loading,
    error,
    refetch: fetchData,
    crearParalelo,
    actualizarParalelo,
    eliminarParalelo,
    estadisticas
  };
};