// hooks/useDimensionesEvaluacion.ts
import { useState, useEffect, useCallback } from 'react';
import { dimensionEvaluacionService } from '../services/dimensionEvaluacion';
import { DimensionEvaluacion, DimensionEvaluacionFormData } from '@/types/dimensionevaluacion';

export function useDimensionesEvaluacion() {
  const [dimensiones, setDimensiones] = useState<DimensionEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dimensionEvaluacionService.listar();
      setDimensiones(data.sort((a, b) => a.orden - b.orden));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar dimensiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearDimension = useCallback(async (data: DimensionEvaluacionFormData) => {
    const nueva = await dimensionEvaluacionService.crear(data);
    setDimensiones(prev => [...prev, nueva].sort((a, b) => a.orden - b.orden));
    return nueva;
  }, []);

  const actualizarDimension = useCallback(async (id: number, data: Partial<DimensionEvaluacionFormData>) => {
    const actualizada = await dimensionEvaluacionService.actualizar(id, data);
    setDimensiones(prev =>
      prev.map(d => d.id === id ? actualizada : d).sort((a, b) => a.orden - b.orden)
    );
    return actualizada;
  }, []);

  const toggleActivo = useCallback(async (id: number, activo: boolean) => {
    const actualizada = await dimensionEvaluacionService.toggleActivo(id, activo);
    setDimensiones(prev => prev.map(d => d.id === id ? actualizada : d));
    return actualizada;
  }, []);

  // Suma de porcentajes de dimensiones activas
  const sumaPorcentajes = dimensiones
    .filter(d => d.activo)
    .reduce((sum, d) => sum + Number(d.porcentaje_ponderacion), 0);

  const esValida = Math.round(sumaPorcentajes) === 100;

  return {
    dimensiones,
    loading,
    error,
    cargar,
    crearDimension,
    actualizarDimension,
    toggleActivo,
    sumaPorcentajes,
    esValida,
  };
}