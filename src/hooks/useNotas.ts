// hooks/useNotas.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  misMateriasNotasService,
  dimensionesService,
  periodosEvaluacionService,
  evaluacionesService,
  adjuntosService,
  rubricaService,
  calificacionesService,
  notasCalculoService,
  temarioService 
} from '@/services/notasService';
import {
  MateriaDocenteNotas,
  DimensionEvaluacion,
  PeriodoEvaluacion,
  Evaluacion,
  CalificacionEstudiante,
  NotaDimension,
  CalificacionPeriodo,
  CrearEvaluacionDTO,
  ActualizarEvaluacionDTO,
  CriterioRubrica,
  RegistroCalificacionItem,
  EvaluacionFiltros,
  CodigoDimension,
  TemaConEvaluaciones,
  DIMENSIONES_CONFIG,
  DIMENSIONES_ORDEN,
  DimensionConfigItem,
} from '@/types/notasTypes';

// =============================================
// HOOK: MIS MATERIAS
// =============================================

export const useMisMateriasNotas = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['docente-mis-materias-notas'],
    queryFn: async () => {
      try {
        const res = await misMateriasNotasService.getMisMaterias();
        return {
          materias: (res.data?.materias ?? []) as MateriaDocenteNotas[],
          sinMaterias: false,
        };
      } catch (error: any) {
        if (error.response?.status === 404) {
          return { materias: [] as MateriaDocenteNotas[], sinMaterias: true };
        }
        toast.error(error.response?.data?.message || 'Error al cargar tus materias');
        return { materias: [] as MateriaDocenteNotas[], sinMaterias: true };
      }
    },
    staleTime: 1000 * 60 * 3, // 3 min de caché fresca
  });

  const materias = data?.materias ?? [];
  const sinMaterias = data?.sinMaterias ?? false;

  const incrementarEvaluaciones = useCallback((asignacion_id: number, periodo_evaluacion_id: number) => {
    queryClient.setQueryData(['docente-mis-materias-notas'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        materias: old.materias.map((m: MateriaDocenteNotas) =>
          m.asignacion_id === asignacion_id && m.periodo_evaluacion_id === periodo_evaluacion_id
            ? { ...m, total_evaluaciones: m.total_evaluaciones + 1 }
            : m
        ),
      };
    });
  }, [queryClient]);

  const actualizarNotasFinal = useCallback((
    asignacion_id: number,
    periodo_evaluacion_id: number,
    aprobados: number,
    reprobados: number
  ) => {
    queryClient.setQueryData(['docente-mis-materias-notas'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        materias: old.materias.map((m: MateriaDocenteNotas) =>
          m.asignacion_id === asignacion_id && m.periodo_evaluacion_id === periodo_evaluacion_id
            ? { ...m, estudiantes_con_nota_final: aprobados + reprobados, aprobados, reprobados }
            : m
        ),
      };
    });
  }, [queryClient]);

  return {
    materias,
    isLoading,
    sinMaterias,
    incrementarEvaluaciones,
    actualizarNotasFinal,
    refrescar: () => refetch(),
  };
};
// =============================================
// HOOK: TEMARIO CON EVALUACIONES (nuevo)
// =============================================
export const useTemario = (
  grado_materia_id?: number,
  periodo_evaluacion_id?: number
) => {
  const [temario, setTemario]     = useState<TemaConEvaluaciones[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!grado_materia_id) { setTemario([]); return; }
    setIsLoading(true);
    try {
      const res = await temarioService.getTemario(grado_materia_id, periodo_evaluacion_id);
      setTemario(res.data.temario);
    } catch {
      setTemario([]);
    } finally {
      setIsLoading(false);
    }
  }, [grado_materia_id, periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Estructura útil para el selector: unidades → temas
  const unidades = useMemo(() => {
    const map = new Map<number, { id: number; titulo: string; numero: number; temas: TemaConEvaluaciones[] }>();
    temario.forEach(t => {
      if (!map.has(t.unidad_id)) {
        map.set(t.unidad_id, {
          id:     t.unidad_id,
          titulo: t.unidad_titulo,
          numero: t.numero_unidad,
          temas:  [],
        });
      }
      map.get(t.unidad_id)!.temas.push(t);
    });
    return Array.from(map.values()).sort((a, b) => a.numero - b.numero);
  }, [temario]);

  return { temario, unidades, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: DIMENSIONES
// =============================================

export const useDimensiones = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dimensiones-evaluacion'],
    queryFn: async () => {
      try {
        const res = await dimensionesService.listar();
        return (res.data?.dimensiones ?? []) as DimensionEvaluacion[];
      } catch (err) {
        console.error('Error al cargar dimensiones:', err);
        return [] as DimensionEvaluacion[];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 min de caché fresca
  });

  const dimensiones = data ?? [];

  const dimensionesConfig = useMemo<Record<CodigoDimension, DimensionConfigItem>>(() => {
    const config: Record<CodigoDimension, DimensionConfigItem> = {
      SER: { ...DIMENSIONES_CONFIG.SER },
      SAB: { ...DIMENSIONES_CONFIG.SAB },
      HAC: { ...DIMENSIONES_CONFIG.HAC },
      AUT: { ...DIMENSIONES_CONFIG.AUT },
    };

    if (dimensiones.length > 0) {
      dimensiones.forEach(d => {
        const cod = d.codigo as CodigoDimension;
        if (config[cod]) {
          config[cod] = {
            ...config[cod],
            label: d.nombre || config[cod].label,
            porcentaje: Number(d.porcentaje_ponderacion) || config[cod].porcentaje,
            color: d.color || config[cod].color,
            descripcion: d.descripcion || config[cod].descripcion,
          };
        }
      });
    }

    return config;
  }, [dimensiones]);

  const dimensionesOrden = useMemo<CodigoDimension[]>(() => {
    if (dimensiones.length > 0) {
      return [...dimensiones]
        .filter(d => d.activo !== false)
        .sort((a, b) => a.orden - b.orden)
        .map(d => d.codigo as CodigoDimension);
    }
    return DIMENSIONES_ORDEN;
  }, [dimensiones]);

  const getDimension = useCallback((id: number) => dimensiones.find(d => d.id === id), [dimensiones]);
  const getDimensionByCodigo = useCallback((c: CodigoDimension) => dimensiones.find(d => d.codigo === c), [dimensiones]);

  return {
    dimensiones,
    isLoading,
    refetch,
    getDimension,
    getDimensionByCodigo,
    dimensionesConfig,
    dimensionesOrden,
  };
};

// =============================================
// HOOK: PERÍODOS DE EVALUACIÓN
// =============================================

export const usePeriodosEvaluacion = (periodo_academico_id?: number) => {
  const [periodos, setPeriodos]   = useState<PeriodoEvaluacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    periodosEvaluacionService.listar(periodo_academico_id, true)
      .then(res => setPeriodos(res.data.periodos))
      .catch(() => toast.error('Error al cargar períodos'))
      .finally(() => setIsLoading(false));
  }, [periodo_academico_id]);

  return { periodos, isLoading };
};

// =============================================
// HOOK: EVALUACIONES (con creación completa)
// =============================================

export const useEvaluaciones = (filtrosIniciales: EvaluacionFiltros = {}) => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters]           = useState<EvaluacionFiltros>(filtrosIniciales);

  const cargar = useCallback(async () => {
    if (!filters.asignacion_docente_id || !filters.periodo_evaluacion_id) {
      setEvaluaciones([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await evaluacionesService.listar({ ...filters, activo: true, limit: 100 });
      setEvaluaciones(res.data.evaluaciones);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar evaluaciones');
      setEvaluaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const setFiltros = useCallback((nuevos: Partial<EvaluacionFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos }));
  }, []);

  const crear = useCallback(async (
    data: CrearEvaluacionDTO,
    foto?: File,
    pdf?: File,
    criterios?: CriterioRubrica[]
  ): Promise<Evaluacion | null> => {
    setIsSubmitting(true);

    const pasos: string[]   = [];
    const errores: string[] = [];

    try {
      const res        = await evaluacionesService.crear(data);
      const evaluacion = res.data.evaluacion;
      pasos.push('Evaluación creada');

      if (foto) {
        try {
          await adjuntosService.subirFoto(evaluacion.id, foto);
          pasos.push('Foto subida');
        } catch (err: any) {
          errores.push(`Foto: ${err.response?.data?.message || err.message}`);
        }
      }

      if (pdf) {
        try {
          await adjuntosService.subirPdf(evaluacion.id, pdf);
          pasos.push('PDF subido');
        } catch (err: any) {
          errores.push(`PDF: ${err.response?.data?.message || err.message}`);
        }
      }

      const criteriosValidos = criterios?.filter(c => c.criterio.trim() && c.puntos_posibles > 0);
      if (criteriosValidos && criteriosValidos.length > 0) {
        try {
          await rubricaService.reemplazar(evaluacion.id, criteriosValidos);
          pasos.push(`Rúbrica guardada (${criteriosValidos.length} criterios)`);
        } catch (err: any) {
          errores.push(`Rúbrica: ${err.response?.data?.message || err.message}`);
        }
      }

      if (errores.length === 0) {
        toast.success(pasos.join(' · '));
      } else {
        toast.success(`${pasos[0]} ✓`);
        errores.forEach(e => toast.error(e, { duration: 5000 }));
      }

      await cargar();
      return evaluacion;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la evaluación');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarEvaluacionDTO,
    foto?: File,
    pdf?: File,
    criterios?: CriterioRubrica[]
  ): Promise<boolean> => {
    setIsSubmitting(true);
    const pasos: string[]   = ['Evaluación actualizada'];
    const errores: string[] = [];

    try {
      await evaluacionesService.actualizar(id, data);

      if (foto) {
        try {
          await adjuntosService.subirFoto(id, foto);
          pasos.push('Foto actualizada');
        } catch (err: any) {
          errores.push(`Foto: ${err.response?.data?.message || err.message}`);
        }
      }

      if (pdf) {
        try {
          await adjuntosService.subirPdf(id, pdf);
          pasos.push('PDF actualizado');
        } catch (err: any) {
          errores.push(`PDF: ${err.response?.data?.message || err.message}`);
        }
      }

      const criteriosValidos = criterios?.filter(c => c.criterio.trim() && c.puntos_posibles > 0);
      if (criteriosValidos && criteriosValidos.length > 0) {
        try {
          await rubricaService.reemplazar(id, criteriosValidos);
          pasos.push(`Rúbrica actualizada (${criteriosValidos.length} criterios)`);
        } catch (err: any) {
          errores.push(`Rúbrica: ${err.response?.data?.message || err.message}`);
        }
      }

      if (errores.length === 0) {
        toast.success(pasos.join(' · '));
      } else {
        toast.success(`${pasos[0]} ✓`);
        errores.forEach(e => toast.error(e, { duration: 5000 }));
      }

      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await evaluacionesService.eliminar(id);
      toast.success('Evaluación eliminada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const porDimension = evaluaciones.reduce<Record<string, Evaluacion[]>>((acc, ev) => {
    const codigo = ev.dimension_codigo ?? 'SIN';
    if (!acc[codigo]) acc[codigo] = [];
    acc[codigo].push(ev);
    return acc;
  }, {});

  return {
    evaluaciones,
    porDimension,
    isLoading,
    isSubmitting,
    setFiltros,
    crear,
    actualizar,
    eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: INGRESAR NOTAS
// =============================================

export const useIngresarNotas = () => {
  const [lista, setLista]                       = useState<CalificacionEstudiante[]>([]);
  const [notas, setNotas]                       = useState<Record<number, RegistroCalificacionItem>>({});
  const [isLoading, setIsLoading]               = useState(false);
  const [isSaving, setIsSaving]                 = useState(false);
  const [evaluacionActual, setEvaluacionActual] = useState<Evaluacion | null>(null);

  const cargarLista = useCallback(async (evaluacion: Evaluacion) => {
    setIsLoading(true);
    setEvaluacionActual(evaluacion);
    try {
      const res = await calificacionesService.listarPorEvaluacion(evaluacion.id);
      setLista(res.data.calificaciones);

      const preloaded: Record<number, RegistroCalificacionItem> = {};
      res.data.calificaciones.forEach(c => {
        if (c.puntaje_obtenido !== null && c.puntaje_obtenido !== undefined) {
          preloaded[c.matricula_id] = {
            matricula_id:     c.matricula_id,
            puntaje_obtenido: c.puntaje_obtenido,
            esta_ausente:     c.esta_ausente ?? false,
            observacion:      c.observacion,
          };
        }
      });
      setNotas(preloaded);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar lista de notas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setNota = useCallback((matricula_id: number, datos: Partial<RegistroCalificacionItem>) => {
    setNotas(prev => ({
      ...prev,
      [matricula_id]: {
        ...(prev[matricula_id] ?? { matricula_id, puntaje_obtenido: 0 }),
        ...datos,
      } as RegistroCalificacionItem,
    }));
  }, []);

  const marcarAusente = useCallback((matricula_id: number, ausente: boolean) => {
    setNotas(prev => ({
      ...prev,
      [matricula_id]: {
        ...(prev[matricula_id] ?? { matricula_id }),
        matricula_id,
        puntaje_obtenido: ausente ? 0 : (prev[matricula_id]?.puntaje_obtenido ?? 0),
        esta_ausente:     ausente,
      },
    }));
  }, []);

  const limpiar = useCallback(() => {
    setLista([]);
    setNotas({});
    setEvaluacionActual(null);
  }, []);

  const guardarNotas = useCallback(async (grado_materia_id: number): Promise<boolean> => {
    if (!evaluacionActual) return false;

    // Normalizar y filtrar registros válidos antes de enviar
    const registros = Object.values(notas)
      .filter(r =>
        r.esta_ausente === true ||
        (
          typeof r.puntaje_obtenido === 'number' &&
          !isNaN(r.puntaje_obtenido) &&
          r.puntaje_obtenido >= 0
        )
      )
      .map(r => ({
        matricula_id:     r.matricula_id,
        puntaje_obtenido: r.esta_ausente ? 0 : Number(r.puntaje_obtenido),
        esta_ausente:     r.esta_ausente ?? false,
        observacion:      r.observacion ?? undefined,
      }));

    if (registros.length === 0) {
      toast.error('No hay notas válidas para guardar');
      return false;
    }

    setIsSaving(true);
    try {
      const res = await calificacionesService.registrarMasivo({
        evaluacion_id: evaluacionActual.id,
        registros,
      });

      // Recalcular notas finales en paralelo para todos los estudiantes
      const matriculaIds = [...new Set(registros.map(r => r.matricula_id))];
      await Promise.allSettled(
        matriculaIds.map(mid =>
          notasCalculoService.calcular(mid, grado_materia_id, evaluacionActual.periodo_evaluacion_id)
        )
      );

      toast.success(`${res.data.total} notas guardadas y calculadas`);
      await cargarLista(evaluacionActual);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar notas');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [evaluacionActual, notas, cargarLista]);

  const porcentajeCompletado = lista.length > 0
    ? Math.round((Object.keys(notas).length / lista.length) * 100)
    : 0;

  return {
    lista,
    notas,
    evaluacionActual,
    isLoading,
    isSaving,
    porcentajeCompletado,
    conNota:  Object.values(notas).filter(n => !n.esta_ausente).length,
    ausentes: Object.values(notas).filter(n => n.esta_ausente).length,
    sinNota:  lista.length - Object.keys(notas).length,
    cargarLista,
    setNota,
    marcarAusente,
    guardarNotas,
    limpiar,
  };
};

// =============================================
// HOOK: RESUMEN DE DIMENSIONES
// =============================================

export const useResumenDimensiones = () => {
  const [notas, setNotas]               = useState<NotaDimension[]>([]);
  const [calificacion, setCalificacion] = useState<CalificacionPeriodo | null>(null);
  const [isLoading, setIsLoading]       = useState(false);

  const cargar = useCallback(async (
    matricula_id: number,
    grado_materia_id: number,
    periodo_evaluacion_id: number
  ) => {
    setIsLoading(true);
    try {
      const res = await notasCalculoService.getNotasDimension(
        matricula_id, grado_materia_id, periodo_evaluacion_id
      );
      setNotas(res.data.notas);
    } catch {
      setNotas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setNotas([]);
    setCalificacion(null);
  }, []);

  return { notas, calificacion, isLoading, cargar, limpiar };
};