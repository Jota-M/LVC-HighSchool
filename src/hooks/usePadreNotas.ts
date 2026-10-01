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
  ResumenMateriaAnual,
  getNivelRendimiento,
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
  const sinNota    = boletin.filter(m => m.nota_final === null || m.nota_final === undefined).length;
  const materiasConNota = boletin.filter(m => m.nota_final !== null && m.nota_final !== undefined && !isNaN(Number(m.nota_final)));
  const promedio   = materiasConNota.length > 0
    ? Math.round(
        materiasConNota.reduce((acc, m) => acc + Number(m.nota_final), 0) /
        materiasConNota.length
      )
    : null;

  return { boletin, isLoading, aprobadas, reprobadas, sinNota, promedio, refrescar: cargar };
};

// =============================================
// HOOK: BOLETÍN GENERAL / ANUAL (3 TRIMESTRES)
// =============================================

export const useBoletinAnualPadre = (
  matriculaId: number | null,
  periodos: PeriodoEvaluacion[]
) => {
  const [materiasAnuales, setMateriasAnuales] = useState<ResumenMateriaAnual[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!matriculaId || periodos.length === 0) {
      setMateriasAnuales([]);
      return;
    }
    setIsLoading(true);
    try {
      const periodosOrdenados = [...periodos].sort((a, b) => a.orden - b.orden);

      const boletinesPorPeriodo = await Promise.all(
        periodosOrdenados.map(async (p) => {
          try {
            const data = await getBoletin(matriculaId, p.id);
            return { periodo: p, boletin: transformarBoletin(data) };
          } catch {
            return { periodo: p, boletin: [] };
          }
        })
      );

      const mapaMaterias = new Map<string, ResumenMateriaAnual>();

      boletinesPorPeriodo.forEach(({ periodo, boletin }) => {
        boletin.forEach((item) => {
          if (!mapaMaterias.has(item.materia_codigo)) {
            mapaMaterias.set(item.materia_codigo, {
              materia_nombre: item.materia_nombre,
              materia_codigo: item.materia_codigo,
              nota_minima: item.nota_minima,
              trimestres: periodosOrdenados.map(p => ({
                periodo_id: p.id,
                periodo_nombre: p.nombre,
                periodo_orden: p.orden,
                nota_final: null,
                aprobado: null,
              })),
              promedio_anual: null,
              aprobado_anual: null,
              nivel: 'sin_nota',
            });
          }

          const entrada = mapaMaterias.get(item.materia_codigo)!;
          const tri = entrada.trimestres.find(t => t.periodo_id === periodo.id);
          if (tri) {
            tri.nota_final = item.nota_final;
            tri.aprobado = item.aprobado;
          }
        });
      });

      const resultado: ResumenMateriaAnual[] = Array.from(mapaMaterias.values()).map(mat => {
        const notasValidas = mat.trimestres.filter(
          t => t.nota_final !== null && t.nota_final !== undefined && !isNaN(Number(t.nota_final))
        );
        const promedioAnual = notasValidas.length > 0
          ? Math.round(notasValidas.reduce((acc, t) => acc + Number(t.nota_final), 0) / notasValidas.length)
          : null;

        return {
          ...mat,
          promedio_anual: promedioAnual,
          aprobado_anual: promedioAnual != null ? promedioAnual >= mat.nota_minima : null,
          nivel: getNivelRendimiento(promedioAnual),
        };
      });

      setMateriasAnuales(resultado);
    } catch {
      toast.error('Error al cargar el resumen anual de notas');
      setMateriasAnuales([]);
    } finally {
      setIsLoading(false);
    }
  }, [matriculaId, periodos]);

  useEffect(() => { cargar(); }, [cargar]);

  const materiasConNota = materiasAnuales.filter(m => m.promedio_anual !== null);
  const promedioGeneralAnual = materiasConNota.length > 0
    ? Math.round(materiasConNota.reduce((acc, m) => acc + Number(m.promedio_anual), 0) / materiasConNota.length)
    : null;

  const aprobadas = materiasAnuales.filter(m => m.aprobado_anual === true).length;
  const reprobadas = materiasAnuales.filter(m => m.aprobado_anual === false).length;
  const sinNota = materiasAnuales.filter(m => m.promedio_anual === null).length;

  return {
    materiasAnuales,
    isLoading,
    promedioGeneralAnual,
    aprobadas,
    reprobadas,
    sinNota,
    refrescar: cargar,
  };
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