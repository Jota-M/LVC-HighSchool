// src/app/dashboard/preinscripciones/hooks/usePreinscripciones.ts

import { useState, useEffect, useCallback } from 'react';
import preinscripcionService from '../services/preinscripcionnService';
import { 
  Preinscripcion, 
  PreinscripcionStats, 
  PreinscripcionFilters,
  EstadoPreinscripcion 
} from '../types/preinscripcioonTypes';

interface UsePreinscripcionesReturn {
  preinscripciones: Preinscripcion[];
  filteredPreinscripciones: Preinscripcion[];
  stats: PreinscripcionStats;
  loading: boolean;
  error: string | null;
  filters: PreinscripcionFilters;
  setFilters: (filters: Partial<PreinscripcionFilters>) => void;
  setSearchTerm: (term: string) => void;
  setEstadoFilter: (estado: string) => void;
  setGradoFilter: (grado: string) => void;
  fetchPreinscripciones: () => Promise<void>;
  deletePreinscripcion: (id: number) => Promise<void>;
  changeEstado: (id: number, estado: EstadoPreinscripcion) => Promise<void>;
  exportToExcel: () => Promise<void>;
}

export const usePreinscripciones = (): UsePreinscripcionesReturn => {
  const [preinscripciones, setPreinscripciones] = useState<Preinscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PreinscripcionFilters>({
    searchTerm: '',
    estadoFilter: 'todos',
    gradoFilter: 'todos',
  });

  // Calcular estadísticas
  const stats: PreinscripcionStats = {
    total: preinscripciones.length,
    pendientes: preinscripciones.filter(p => 
      ['iniciada', 'datos_completos', 'documentos_pendientes', 'en_revision']
        .includes(p.estado?.toLowerCase() || '')
    ).length,
    aprobadas: preinscripciones.filter(p => 
      ['aprobada', 'documentos_aprobados'].includes(p.estado?.toLowerCase() || '')
    ).length,
    rechazadas: preinscripciones.filter(p => 
      p.estado?.toLowerCase() === 'rechazada'
    ).length,
  };

  // Aplicar filtros
  const filteredPreinscripciones = preinscripciones.filter(p => {
    const matchSearch = filters.searchTerm === '' || 
      p.estudiante_nombre?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
      p.estudiante_ci?.includes(filters.searchTerm) ||
      p.codigo_inscripcion?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchEstado = filters.estadoFilter === 'todos' || 
      p.estado?.toLowerCase() === filters.estadoFilter.toLowerCase();
    
    const matchGrado = filters.gradoFilter === 'todos' || 
      p.grado_solicitado === filters.gradoFilter;
    
    return matchSearch && matchEstado && matchGrado;
  });

  // Obtener preinscripciones
  const fetchPreinscripciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preinscripcionService.listarPreinscripciones();
      
      const data = response.data?.preinscripciones || [];
      setPreinscripciones(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las preinscripciones';
      setError(message);
      console.error('Error al cargar preinscripciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar preinscripción
  const deletePreinscripcion = useCallback(async (id: number) => {
    try {
      await preinscripcionService.eliminarPreinscripcion(id);
      await fetchPreinscripciones();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      throw new Error(message);
    }
  }, [fetchPreinscripciones]);

  // Cambiar estado
  const changeEstado = useCallback(async (id: number, estado: EstadoPreinscripcion) => {
    try {
      await preinscripcionService.cambiarEstado(id, estado);
      await fetchPreinscripciones();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      throw new Error(message);
    }
  }, [fetchPreinscripciones]);

  // Exportar a Excel
  const exportToExcel = useCallback(async () => {
    try {
      const blob = await preinscripcionService.exportarExcel({
        estado: filters.estadoFilter !== 'todos' ? filters.estadoFilter : undefined,
        grado: filters.gradoFilter !== 'todos' ? filters.gradoFilter : undefined,
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preinscripciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar';
      throw new Error(message);
    }
  }, [filters]);

  // Actualizar filtros
  const setFilters = useCallback((newFilters: Partial<PreinscripcionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setFiltersState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setEstadoFilter = useCallback((estado: string) => {
    setFiltersState(prev => ({ ...prev, estadoFilter: estado }));
  }, []);

  const setGradoFilter = useCallback((grado: string) => {
    setFiltersState(prev => ({ ...prev, gradoFilter: grado }));
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    fetchPreinscripciones();
  }, [fetchPreinscripciones]);

  return {
    preinscripciones,
    filteredPreinscripciones,
    stats,
    loading,
    error,
    filters,
    setFilters,
    setSearchTerm,
    setEstadoFilter,
    setGradoFilter,
    fetchPreinscripciones,
    deletePreinscripcion,
    changeEstado,
    exportToExcel,
  };
};