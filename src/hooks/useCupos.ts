// src/hooks/useCupos.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';

export interface Cupo {
  id: number;
  periodo_academico_id: number;
  grado_id: number;
  turno_id: number;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  
  // Joins
  periodo_nombre?: string;
  grado_nombre?: string;
  turno_nombre?: string;
  nivel_academico_nombre?: string;
  porcentaje_ocupacion?: number;
}

export interface CupoFilters {
  periodo_academico_id?: string;
  grado_id?: string;
  turno_id?: string;
  solo_activos: boolean;
}

export interface CupoStats {
  total_cupos: number;
  cupos_disponibles: number;
  cupos_ocupados: number;
  cupos_activos: number;
}

export const useCupos = () => {
  const [cupos, setCupos] = useState<Cupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CupoFilters>({
    periodo_academico_id: undefined,
    grado_id: undefined,
    turno_id: undefined,
    solo_activos: true,
  });

  // =============================================
  // CALCULAR ESTADÍSTICAS
  // =============================================
  const stats: CupoStats = useMemo(() => {
    const total_cupos = cupos.reduce((sum, c) => sum + c.cupos_totales, 0);
    const cupos_ocupados = cupos.reduce((sum, c) => sum + c.cupos_ocupados, 0);
    const cupos_disponibles = cupos.reduce((sum, c) => sum + c.cupos_disponibles, 0);
    const cupos_activos = cupos.filter(c => c.activo).length;

    return {
      total_cupos,
      cupos_disponibles,
      cupos_ocupados,
      cupos_activos,
    };
  }, [cupos]);

  // =============================================
  // OBTENER CUPOS
  // =============================================
  const fetchCupos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filters.periodo_academico_id) params.periodo_academico_id = filters.periodo_academico_id;
      if (filters.grado_id) params.grado_id = filters.grado_id;
      if (filters.turno_id) params.turno_id = filters.turno_id;
      params.solo_activos = filters.solo_activos;

      const response = await api.get('/cupos', { params });
      
      setCupos(response.data.data?.cupos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar cupos');
      console.error('❌ Error al cargar cupos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // =============================================
  // CREAR CUPO
  // =============================================
  const createCupo = useCallback(async (data: {
    periodo_academico_id: number;
    grado_id: number;
    turno_id: number;
    cupos_totales: number;
    observaciones?: string;
  }) => {
    try {
      const response = await api.post('/cupos', data);
      await fetchCupos();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al crear cupo');
    }
  }, [fetchCupos]);

  // =============================================
  // ACTUALIZAR CUPO
  // =============================================
  const updateCupo = useCallback(async (
    id: number,
    data: {
      cupos_totales?: number;
      activo?: boolean;
      observaciones?: string;
    }
  ) => {
    try {
      const response = await api.put(`/cupos/${id}`, data);
      await fetchCupos();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al actualizar cupo');
    }
  }, [fetchCupos]);

  // =============================================
  // ELIMINAR CUPO
  // =============================================
  const deleteCupo = useCallback(async (id: number) => {
    try {
      await api.delete(`/cupos/${id}`);
      await fetchCupos();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al eliminar cupo');
    }
  }, [fetchCupos]);

  // =============================================
  // OBTENER CUPO POR ID
  // =============================================
  const getCupoById = useCallback(async (id: number) => {
    try {
      const response = await api.get(`/cupos/${id}`);
      return response.data.data?.cupo;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al obtener cupo');
    }
  }, []);

  // =============================================
  // VERIFICAR DISPONIBILIDAD (público)
  // =============================================
  const verificarDisponibilidad = useCallback(async (
    grado_id: number,
    turno_id: number,
    periodo_academico_id: number
  ) => {
    try {
      const response = await api.get('/cupos/disponibilidad', {
        params: { grado_id, turno_id, periodo_academico_id }
      });
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al verificar disponibilidad');
    }
  }, []);

  // =============================================
  // OBTENER RESUMEN POR PERIODO
  // =============================================
  const getResumenPorPeriodo = useCallback(async (periodo_id: number) => {
    try {
      const response = await api.get(`/cupos/resumen/${periodo_id}`);
      return response.data.data?.resumen || [];
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al obtener resumen');
    }
  }, []);

  // =============================================
  // CARGAR AL MONTAR
  // =============================================
  useEffect(() => {
    fetchCupos();
  }, [fetchCupos]);

  return {
    cupos,
    loading,
    error,
    filters,
    stats,
    setFilters,
    fetchCupos,
    createCupo,
    updateCupo,
    deleteCupo,
    getCupoById,
    verificarDisponibilidad,
    getResumenPorPeriodo,
  };
};