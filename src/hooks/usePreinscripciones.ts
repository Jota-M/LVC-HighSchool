// src/hooks/usePreinscripciones.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  setTurnoFilter: (turno: string) => void; // 🆕
  setPeriodoFilter: (periodo: string) => void; // 🆕
  setConCupoFilter: (conCupo: string) => void; // 🆕
  fetchPreinscripciones: () => Promise<void>;
  deletePreinscripcion: (id: number) => Promise<void>;
  changeEstado: (id: number, estado: EstadoPreinscripcion, observaciones?: string) => Promise<void>;
  exportToExcel: () => Promise<void>;
  exportToPDF: () => Promise<void>; // 🆕
}

export const usePreinscripciones = (): UsePreinscripcionesReturn => {
  const [preinscripciones, setPreinscripciones] = useState<Preinscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFiltersState] = useState<PreinscripcionFilters>({
    searchTerm: '',
    estadoFilter: 'todos',
    gradoFilter: 'todos',
    turnoFilter: 'todos', // 🆕
    periodoFilter: 'todos', // 🆕
    conCupoFilter: 'todos', // 🆕
  });

  // =============================================
  // CALCULAR ESTADÍSTICAS (ACTUALIZADO)
  // =============================================
  const stats: PreinscripcionStats = useMemo(() => {
    const total = preinscripciones.length;
    
    const pendientes = preinscripciones.filter(p => 
      ['iniciada', 'datos_completos', 'documentos_pendientes', 'en_revision']
        .includes(p.estado?.toLowerCase() || '')
    ).length;
    
    const aprobadas = preinscripciones.filter(p => 
      ['aprobada', 'documentos_aprobados'].includes(p.estado?.toLowerCase() || '')
    ).length;
    
    const rechazadas = preinscripciones.filter(p => 
      p.estado?.toLowerCase() === 'rechazada'
    ).length;
    
    const convertidas = preinscripciones.filter(p =>
      p.estado?.toLowerCase() === 'convertida'
    ).length;
    
    // 🆕 Stats de cupos
    const con_cupo_asignado = preinscripciones.filter(p => 
      p.tiene_cupo_asignado === true
    ).length;
    
    const sin_cupo_asignado = total - con_cupo_asignado;
    
    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      convertidas,
      con_cupo_asignado,
      sin_cupo_asignado,
    };
  }, [preinscripciones]);

  // =============================================
  // APLICAR FILTROS (ACTUALIZADO)
  // =============================================
  const filteredPreinscripciones = useMemo(() => {
    return preinscripciones.filter(p => {
      // Búsqueda por texto
      const matchSearch = filters.searchTerm === '' || 
        p.estudiante_nombre?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
        p.estudiante_ci?.includes(filters.searchTerm) ||
        p.codigo_inscripcion?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Filtro por estado
      const matchEstado = filters.estadoFilter === 'todos' || 
        p.estado?.toLowerCase() === filters.estadoFilter.toLowerCase();
      
      // Filtro por grado
      const matchGrado = filters.gradoFilter === 'todos' || 
        p.grado_solicitado === filters.gradoFilter ||
        p.grado_nombre === filters.gradoFilter;
      
      // 🆕 Filtro por turno
      const matchTurno = filters.turnoFilter === 'todos' ||
        p.turno_nombre === filters.turnoFilter;
      
      // 🆕 Filtro por periodo
      const matchPeriodo = filters.periodoFilter === 'todos' ||
        p.periodo_nombre === filters.periodoFilter;
      
      // 🆕 Filtro por cupo
      const matchCupo = filters.conCupoFilter === 'todos' ||
        (filters.conCupoFilter === 'con_cupo' && p.tiene_cupo_asignado) ||
        (filters.conCupoFilter === 'sin_cupo' && !p.tiene_cupo_asignado);
      
      return matchSearch && matchEstado && matchGrado && matchTurno && matchPeriodo && matchCupo;
    });
  }, [preinscripciones, filters]);

  // =============================================
  // OBTENER PREINSCRIPCIONES
  // =============================================
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
      console.error('❌ Error al cargar preinscripciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================
  // ELIMINAR PREINSCRIPCIÓN (LIBERA CUPO)
  // =============================================
  const deletePreinscripcion = useCallback(async (id: number) => {
    try {
      await preinscripcionService.eliminarPreinscripcion(id);
      await fetchPreinscripciones();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      throw new Error(message);
    }
  }, [fetchPreinscripciones]);

  // =============================================
  // CAMBIAR ESTADO
  // =============================================
  const changeEstado = useCallback(async (
    id: number, 
    estado: EstadoPreinscripcion,
    observaciones?: string
  ) => {
    try {
      await preinscripcionService.cambiarEstado(id, { estado, observaciones });
      await fetchPreinscripciones();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      throw new Error(message);
    }
  }, [fetchPreinscripciones]);

  // =============================================
  // EXPORTAR A EXCEL
  // =============================================
  const exportToExcel = useCallback(async () => {
    try {
      const blob = await preinscripcionService.exportarExcel({
        estado: filters.estadoFilter !== 'todos' ? filters.estadoFilter : undefined,
        grado: filters.gradoFilter !== 'todos' ? filters.gradoFilter : undefined,
        turno: filters.turnoFilter !== 'todos' ? filters.turnoFilter : undefined,
        periodo: filters.periodoFilter !== 'todos' ? filters.periodoFilter : undefined,
        formato: 'excel',
      });

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

  // =============================================
  // 🆕 EXPORTAR A PDF
  // =============================================
  const exportToPDF = useCallback(async () => {
    try {
      const blob = await preinscripcionService.exportarPDF({
        estado: filters.estadoFilter !== 'todos' ? filters.estadoFilter : undefined,
        grado: filters.gradoFilter !== 'todos' ? filters.gradoFilter : undefined,
        turno: filters.turnoFilter !== 'todos' ? filters.turnoFilter : undefined,
        periodo: filters.periodoFilter !== 'todos' ? filters.periodoFilter : undefined,
        formato: 'pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preinscripciones_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar PDF';
      throw new Error(message);
    }
  }, [filters]);

  // =============================================
  // ACTUALIZAR FILTROS
  // =============================================
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

  // 🆕 Nuevos setters
  const setTurnoFilter = useCallback((turno: string) => {
    setFiltersState(prev => ({ ...prev, turnoFilter: turno }));
  }, []);

  const setPeriodoFilter = useCallback((periodo: string) => {
    setFiltersState(prev => ({ ...prev, periodoFilter: periodo }));
  }, []);

  const setConCupoFilter = useCallback((conCupo: string) => {
    setFiltersState(prev => ({ ...prev, conCupoFilter: conCupo }));
  }, []);

  // =============================================
  // CARGAR DATOS AL MONTAR
  // =============================================
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
    setTurnoFilter,
    setPeriodoFilter,
    setConCupoFilter,
    fetchPreinscripciones,
    deletePreinscripcion,
    changeEstado,
    exportToExcel,
    exportToPDF,
  };
};