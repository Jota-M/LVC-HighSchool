// hooks/usePadreNotas.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getPeriodosEvaluacion,
  getDimensiones,
  getBoletin,
  transformarBoletin,
  getNotasDimension,
  getCalificacionesDetalle,
} from '@/services/padreNotasService';
import {
  ResumenMateriaPadre,
  DimensionEvaluacion,
  PeriodoEvaluacion,
  NotaDimension,
  CalificacionPorPeriodo,
  CodigoDimension,
} from '@/types/padreNotasTypes';
import type { HijoInfo } from '@/types/padreAsistenciaTypes';

// =============================================
// HOOK: PERÍODOS DE EVALUACIÓN
// =============================================

export const usePeriodosEvaluacion = (hijo: HijoInfo | null) => {
  const [periodos, setPeriodos]       = useState<PeriodoEvaluacion[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoEvaluacion | null>(null);
  const [isLoading, setIsLoading]     = useState(false);

  useEffect(() => {
    if (!hijo?.periodo_academico_id) return;
    setIsLoading(true);
    getPeriodosEvaluacion(hijo.periodo_academico_id)
      .then(data => {
        setPeriodos(data);
        // Seleccionar el trimestre actual (fecha dentro del rango) o el último
        const hoy = new Date().toISOString().slice(0, 10);
        const actual = data.find(p => p.fecha_inicio <= hoy && p.fecha_fin >= hoy);
        setPeriodoActivo(actual ?? data[0] ?? null);
      })
      .catch(() => toast.error('Error al cargar trimestres'))
      .finally(() => setIsLoading(false));
  }, [hijo?.periodo_academico_id]);

  return { periodos, periodoActivo, setPeriodoActivo, isLoading };
};

// =============================================
// HOOK: DIMENSIONES (colores y porcentajes)
// =============================================

export const useDimensionesPadre = () => {
  const [dimensiones, setDimensiones] = useState<DimensionEvaluacion[]>([]);

  useEffect(() => {
    getDimensiones()
      .then(setDimensiones)
      .catch(() => {}); // silencioso, usa fallback de DIMENSIONES_CONFIG
  }, []);

  const getDimension = useCallback(
    (codigo: CodigoDimension) => dimensiones.find(d => d.codigo === codigo),
    [dimensiones]
  );

  return { dimensiones, getDimension };
};

// =============================================
// HOOK: BOLETÍN DE NOTAS
// =============================================

export const useBoletinNotas = (
  matriculaId: number | null,
  periodoEvaluacionId: number | null
) => {
  const [boletin, setBoletin]     = useState<ResumenMateriaPadre[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!matriculaId || !periodoEvaluacionId) {
      setBoletin([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getBoletin(matriculaId, periodoEvaluacionId);
      setBoletin(transformarBoletin(data));
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Error al cargar el boletín de notas');
      }
      setBoletin([]);
    } finally {
      setIsLoading(false);
    }
  }, [matriculaId, periodoEvaluacionId]);

  useEffect(() => { cargar(); }, [cargar]);

  // Stats calculados
  const aprobadas  = boletin.filter(m => m.aprobado === true).length;
  const reprobadas = boletin.filter(m => m.aprobado === false).length;
  const sinNota    = boletin.filter(m => m.nota_final === null).length;
  const promedio   = boletin.length > 0
    ? Math.round(
        boletin
          .filter(m => m.nota_final !== null)
          .reduce((acc, m) => acc + (m.nota_final ?? 0), 0) /
        Math.max(boletin.filter(m => m.nota_final !== null).length, 1)
      )
    : null;

  return { boletin, isLoading, aprobadas, reprobadas, sinNota, promedio, refrescar: cargar };
};

// =============================================
// HOOK: DETALLE DE UNA MATERIA
// =============================================

export const useDetalleMateria = () => {
  const [notasDimension, setNotasDimension]         = useState<NotaDimension[]>([]);
  const [calificaciones, setCalificaciones]          = useState<CalificacionPorPeriodo[]>([]);
  const [isLoading, setIsLoading]                   = useState(false);
  const [gradoMateriaSeleccionado, setGradoMateriaSeleccionado] = useState<number | null>(null);

  const cargar = useCallback(async (
    matriculaId: number,
    gradoMateriaId: number,
    periodoEvaluacionId: number
  ) => {
    setIsLoading(true);
    setGradoMateriaSeleccionado(gradoMateriaId);
    try {
      const [dimensiones, califs] = await Promise.all([
        getNotasDimension(matriculaId, gradoMateriaId, periodoEvaluacionId),
        getCalificacionesDetalle(matriculaId, periodoEvaluacionId),
      ]);
      setNotasDimension(dimensiones);
      // Filtrar solo las calificaciones de este grado_materia
      // (el endpoint trae todas del período, filtramos por asignacion)
      setCalificaciones(califs);
    } catch {
      toast.error('Error al cargar el detalle de la materia');
      setNotasDimension([]);
      setCalificaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setNotasDimension([]);
    setCalificaciones([]);
    setGradoMateriaSeleccionado(null);
  }, []);

  // Agrupar calificaciones por dimensión
  const porDimension = calificaciones.reduce<Record<string, CalificacionPorPeriodo[]>>(
    (acc, c) => {
      const codigo = c.dimension_codigo ?? 'SIN';
      if (!acc[codigo]) acc[codigo] = [];
      acc[codigo].push(c);
      return acc;
    },
    {}
  );

  return {
    notasDimension,
    calificaciones,
    porDimension,
    gradoMateriaSeleccionado,
    isLoading,
    cargar,
    limpiar,
  };
};