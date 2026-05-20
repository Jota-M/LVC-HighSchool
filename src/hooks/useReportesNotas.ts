// hooks/useReportesNotas.ts
import { useState, useCallback } from 'react';
import { toast }                 from 'react-hot-toast';
import {
  descargarBoletin,
  descargarReporteEvaluacion,
  descargarReporteDimension,
  descargarComparativoTrimestralNotas,
  descargarEstudianteNotas,
  descargarResumenClaseNotas,
  FormatoReporte,
  BoletinParams,
  EvaluacionReporteParams,
  DimensionReporteParams,
  ComparativoTrimestralParams,
  EstudianteNotasParams,
  ResumenClaseNotasParams,
} from '@/services/reportesNotasService';

type TipoDescargaNotas =
  | 'boletin'
  | 'evaluacion'
  | 'dimension'
  | 'comparativo_trimestral'
  | 'estudiante'
  | 'resumen_clase'
  | null;

const useReportesNotas = () => {
  const [descargando, setDescargando] = useState<{ tipo: TipoDescargaNotas; formato: FormatoReporte | null }>({
    tipo: null, formato: null,
  });

  const ejecutar = useCallback(async (
    tipo: Exclude<TipoDescargaNotas, null>,
    formato: FormatoReporte,
    fn: () => Promise<void>,
    label: string
  ) => {
    setDescargando({ tipo, formato });
    try {
      await fn();
      toast.success(`${label} descargado (${formato.toUpperCase()})`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Error al generar ${label}`);
    } finally {
      setDescargando({ tipo: null, formato: null });
    }
  }, []);

  // ── 1. Boletín ────────────────────────────────────────────
  const exportarBoletin = useCallback((
    params: Omit<BoletinParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('boletin', formato,
    () => descargarBoletin({ ...params, formato }),
    'Boletín de notas'
  ), [ejecutar]);

  // ── 2. Por evaluación ─────────────────────────────────────
  const exportarEvaluacion = useCallback((
    params: Omit<EvaluacionReporteParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('evaluacion', formato,
    () => descargarReporteEvaluacion({ ...params, formato }),
    'Reporte por evaluación'
  ), [ejecutar]);

  // ── 3. Por dimensión ──────────────────────────────────────
  const exportarDimension = useCallback((
    params: Omit<DimensionReporteParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('dimension', formato,
    () => descargarReporteDimension({ ...params, formato }),
    'Reporte por dimensión'
  ), [ejecutar]);

  // ── 4. Comparativo trimestral ─────────────────────────────
  const exportarComparativoTrimestral = useCallback((
    params: Omit<ComparativoTrimestralParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('comparativo_trimestral', formato,
    () => descargarComparativoTrimestralNotas({ ...params, formato }),
    'Comparativo trimestral'
  ), [ejecutar]);

  // ── 5. Estudiante individual ──────────────────────────────
  const exportarEstudiante = useCallback((
    params: Omit<EstudianteNotasParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('estudiante', formato,
    () => descargarEstudianteNotas({ ...params, formato }),
    'Reporte del estudiante'
  ), [ejecutar]);

  // ── 6. Resumen clase ──────────────────────────────────────
  const exportarResumenClase = useCallback((
    params: Omit<ResumenClaseNotasParams, 'formato'>,
    formato: FormatoReporte
  ) => ejecutar('resumen_clase', formato,
    () => descargarResumenClaseNotas({ ...params, formato }),
    'Resumen de la clase'
  ), [ejecutar]);

  // ── Helpers de estado ─────────────────────────────────────
  const estaDescargando = descargando.tipo !== null;
  const descargandoTipo = (t: TipoDescargaNotas) => descargando.tipo === t;

  return {
    exportarBoletin,
    exportarEvaluacion,
    exportarDimension,
    exportarComparativoTrimestral,
    exportarEstudiante,
    exportarResumenClase,
    estaDescargando,
    descargando,
    descargandoTipo,
  };
};

export default useReportesNotas;