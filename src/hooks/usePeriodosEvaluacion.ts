// hooks/usePeriodosEvaluacion.ts
import { useState, useEffect, useCallback } from 'react';
import { periodoEvaluacionService } from '../services/periodoEvaluacion';
import {
  PeriodoEvaluacion,
  PeriodoEvaluacionFormData,
  PeriodoEvaluacionFilters,
  PeriodoConEstado,
  EstadoPeriodo
} from '../types/periodoEvaluacion';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function calcularEstado(periodo: PeriodoEvaluacion): PeriodoConEstado {
  const hoy = new Date();
  const inicio = new Date(periodo.fecha_inicio);
  const fin = new Date(periodo.fecha_fin);

  let estado: EstadoPeriodo;
  let diasRestantes: number | undefined;
  let porcentajeAvance: number | undefined;

  if (hoy < inicio) {
    estado = 'proximo';
    diasRestantes = Math.ceil((inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    porcentajeAvance = 0;
  } else if (hoy > fin) {
    estado = 'finalizado';
    porcentajeAvance = 100;
  } else {
    estado = 'activo';
    const totalDias = fin.getTime() - inicio.getTime();
    const transcurridos = hoy.getTime() - inicio.getTime();
    porcentajeAvance = Math.round((transcurridos / totalDias) * 100);
    diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  return { ...periodo, estado, diasRestantes, porcentajeAvance };
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------
interface UsePeriodosEvaluacionOptions {
  periodoAcademicoId?: number;
  soloActivos?: boolean;
}

export function usePeriodosEvaluacion(options: UsePeriodosEvaluacionOptions = {}) {
  const { periodoAcademicoId, soloActivos } = options;

  const [periodos, setPeriodos] = useState<PeriodoConEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: PeriodoEvaluacionFilters = {};
      if (periodoAcademicoId) filters.periodo_academico_id = periodoAcademicoId;
      if (soloActivos !== undefined) filters.activo = soloActivos;

      const data = await periodoEvaluacionService.listar(filters);
      setPeriodos(data.map(calcularEstado));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar períodos');
    } finally {
      setLoading(false);
    }
  }, [periodoAcademicoId, soloActivos]);

  useEffect(() => { cargar(); }, [cargar]);

  const crearPeriodo = useCallback(async (data: PeriodoEvaluacionFormData) => {
    const nuevo = await periodoEvaluacionService.crear(data);
    setPeriodos(prev => [...prev, calcularEstado(nuevo)].sort((a, b) => a.orden - b.orden));
    return nuevo;
  }, []);

  const actualizarPeriodo = useCallback(async (id: number, data: Partial<PeriodoEvaluacionFormData>) => {
    const actualizado = await periodoEvaluacionService.actualizar(id, data);
    setPeriodos(prev =>
      prev.map(p => p.id === id ? calcularEstado(actualizado) : p)
         .sort((a, b) => a.orden - b.orden)
    );
    return actualizado;
  }, []);

  const toggleActivo = useCallback(async (id: number, activo: boolean) => {
    const actualizado = await periodoEvaluacionService.toggleActivo(id, activo);
    setPeriodos(prev => prev.map(p => p.id === id ? calcularEstado(actualizado) : p));
    return actualizado;
  }, []);

  // Estadísticas
  const estadisticas = {
    total: periodos.length,
    activos: periodos.filter(p => p.estado === 'activo').length,
    proximos: periodos.filter(p => p.estado === 'proximo').length,
    finalizados: periodos.filter(p => p.estado === 'finalizado').length,
    periodoActual: periodos.find(p => p.estado === 'activo') || null,
  };

  return {
    periodos,
    loading,
    error,
    cargar,
    crearPeriodo,
    actualizarPeriodo,
    toggleActivo,
    estadisticas,
  };
}