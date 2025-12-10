// hooks/useDashboard.ts - OPTIMIZADO
import { useState, useEffect, useCallback, useRef } from 'react';
import dashboardService from '../services/dashboardService';
import type { 
  ActividadReciente, 
  DashboardStats, 
  DashboardData 
} from '../types/dashboardTypes';

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: DashboardStats;
}

export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    // Evitar llamadas duplicadas
    if (fetchingRef.current) {
      console.log('⏭️ Ya hay una petición en curso, saltando...');
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const dashboardData = await dashboardService.getDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      console.error('Error al cargar dashboard:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Solo cargar una vez al montar
    fetchDashboardData();

    // Cleanup
    return () => {
      fetchingRef.current = false;
    };
  }, []); // Array vacío - solo al montar

  // Función de refetch que limpia cache
  const refetch = useCallback(async () => {
    dashboardService.clearCache();
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Calcular estadísticas principales con valores por defecto
  const stats: DashboardStats = {
    totalEstudiantes: data?.estudiantesCount?.total ?? 0,
    totalDocentes: data?.docentesCount?.total ?? 0,
    totalUsuarios: data?.usuariosCount?.total ?? 0,
    matriculasActivas: data?.matriculasCount?.activas ?? 0,
    estudiantesActivos: data?.estudiantesCount?.activos ?? 0,
    docentesActivos: data?.docentesCount?.activos ?? 0,
    usuariosActivos: data?.usuariosCount?.activos ?? 0,
  };

  return {
    data,
    loading,
    error,
    refetch,
    stats
  };
};

// Hook simplificado para periodo
export const usePeriodoActivo = () => {
  const [periodo, setPeriodo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Este hook ya no hace fetch, usa los datos del dashboard principal
  return { periodo, loading, error, refetch: async () => {} };
};