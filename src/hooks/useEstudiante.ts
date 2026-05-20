// hooks/useEstudiante.ts
// Hooks del portal estudiantil

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import estudianteService from '@/services/estudianteService';
import type {
  PerfilEstudiante, MateriaResumen, TemarioItem,
  MaterialEstudiante, MaterialDetalleEstudiante, FavoritoEstudiante,
  ProgresoTema, BoletinMateria, NotasPorMateria,
  HorarioEstudiante, TareaEstudiante, ResumenTareas,
  AsistenciaResumen, AsistenciaDetalle, Paginacion, EstadoTarea,
} from '@/types/estudiante';
import { getPeriodosEvaluacion } from '@/services/padreNotasService';

export const usePeriodosEstudiante = () => {
  const [periodos, setPeriodos]           = useState<{ id: number; nombre: string; fecha_inicio: string; fecha_fin: string }[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<number | null>(null);
  const [isLoading, setIsLoading]         = useState(false);

  useEffect(() => {
    setIsLoading(true);
    estudianteService.getPeriodosEvaluacion()
      .then(res => {
        const data = res.data.periodos;
        setPeriodos(data);
        const hoy    = new Date().toISOString().slice(0, 10);
        const actual = data.find(p => p.fecha_inicio <= hoy && p.fecha_fin >= hoy);
        setPeriodoActivo(actual?.id ?? data[0]?.id ?? null);
      })
      .catch(() => toast.error('Error al cargar trimestres'))
      .finally(() => setIsLoading(false));
  }, []);

  return { periodos, periodoActivo, setPeriodoActivo, isLoading };
};
// ── PERFIL ─────────────────────────────────────────────────────
export const usePerfilEstudiante = () => {
  const [perfil, setPerfil]       = useState<PerfilEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    estudianteService.getPerfil()
      .then(res => setPerfil(res.data.perfil))
      .catch(() => toast.error('Error al cargar tu perfil'))
      .finally(() => setIsLoading(false));
  }, []);

  return { perfil, isLoading };
};

// ── MATERIAS ───────────────────────────────────────────────────
export const useMisMaterias = (periodo_evaluacion_id?: number) => {
  const [materias, setMaterias]   = useState<MateriaResumen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getMisMaterias(periodo_evaluacion_id);
      setMaterias(res.data.materias);
    } catch (error: any) {
      if (error.response?.status !== 404) toast.error('Error al cargar tus materias');
      setMaterias([]);
    } finally {
      setIsLoading(false);
    }
  }, [periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);
  return { materias, isLoading, refrescar: cargar };
};

// ── TEMARIO ────────────────────────────────────────────────────
export const useTemarioEstudiante = (grado_materia_id: number | null) => {
  const [temario, setTemario]     = useState<TemarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!grado_materia_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getTemario(grado_materia_id);
      setTemario(res.data.temario);
    } catch {
      toast.error('Error al cargar el temario');
      setTemario([]);
    } finally {
      setIsLoading(false);
    }
  }, [grado_materia_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const porUnidad = temario.reduce<{
    unidad: Pick<TemarioItem, 'unidad_id'|'numero_unidad'|'unidad_titulo'|'unidad_descripcion'|'fecha_inicio_prevista'|'fecha_fin_prevista'>;
    temas: TemarioItem[];
  }[]>((acc, item) => {
    const existing = acc.find(g => g.unidad.unidad_id === item.unidad_id);
    if (existing) {
      if (item.tema_id) existing.temas.push(item);
    } else {
      acc.push({
        unidad: {
          unidad_id: item.unidad_id, numero_unidad: item.numero_unidad,
          unidad_titulo: item.unidad_titulo, unidad_descripcion: item.unidad_descripcion,
          fecha_inicio_prevista: item.fecha_inicio_prevista, fecha_fin_prevista: item.fecha_fin_prevista,
        },
        temas: item.tema_id ? [item] : [],
      });
    }
    return acc;
  }, []);

  const totalTemas       = temario.filter(t => t.tema_id !== null).length;
  const completados      = temario.filter(t => t.estado_progreso === 'completado').length;
  const porcentajeGeneral = totalTemas > 0 ? Math.round((completados / totalTemas) * 100) : 0;

  return { temario, porUnidad, isLoading, totalTemas, completados, porcentajeGeneral, refrescar: cargar };
};

// ── MATERIALES ─────────────────────────────────────────────────
export const useMaterialesEstudiante = (
  asignacion_docente_id: number | null,
  opciones: { tipo_material_id?: number; tema_id?: number; limit?: number } = {}
) => {
  const [materiales, setMateriales]     = useState<MaterialEstudiante[]>([]);
  const [paginacion, setPaginacion]     = useState<Paginacion>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage]                 = useState(1);
  const [isLoading, setIsLoading]       = useState(false);

  const cargar = useCallback(async () => {
    if (!asignacion_docente_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getMateriales(asignacion_docente_id, {
        ...opciones, page, limit: opciones.limit ?? 20,
      });
      setMateriales(res.data.materiales);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      if (error.response?.status === 403) toast.error('No tienes acceso a esta materia');
      else toast.error('Error al cargar materiales');
      setMateriales([]);
    } finally {
      setIsLoading(false);
    }
  }, [asignacion_docente_id, page, opciones.tipo_material_id, opciones.tema_id, opciones.limit]);

  useEffect(() => { cargar(); }, [cargar]);
  return { materiales, paginacion, page, setPage, isLoading, refrescar: cargar };
};

// ── MATERIAL DETALLE ───────────────────────────────────────────
export const useMaterialDetalleEstudiante = (material_id: number | null) => {
  const [material, setMaterial]   = useState<MaterialDetalleEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!material_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getMaterialDetalle(material_id);
      setMaterial(res.data.material);
    } catch {
      toast.error('Error al cargar el material');
    } finally {
      setIsLoading(false);
    }
  }, [material_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const registrarAcceso = useCallback(async (
    tipo: 'visualizacion' | 'descarga' | 'compartido' | 'impresion' = 'visualizacion'
  ) => {
    if (!material_id) return;
    await estudianteService.registrarAcceso(material_id, { tipo_accion: tipo, dispositivo: 'web' }).catch(() => {});
  }, [material_id]);

  return { material, isLoading, registrarAcceso, refrescar: cargar };
};

// ── FAVORITOS ──────────────────────────────────────────────────
export const useFavoritosEstudiante = () => {
  const [favoritos, setFavoritos] = useState<FavoritoEstudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getFavoritos();
      setFavoritos(res.data.favoritos);
    } catch {
      toast.error('Error al cargar favoritos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggle = useCallback(async (material_id: number, notas?: string) => {
    setToggling(material_id);
    try {
      const res = await estudianteService.toggleFavorito(material_id, notas);
      toast.success(res.data.accion === 'agregado' ? 'Agregado a favoritos' : 'Removido de favoritos');
      await cargar();
      return res.data.accion;
    } catch {
      toast.error('Error al gestionar favorito');
      return null;
    } finally {
      setToggling(null);
    }
  }, [cargar]);

  const esFavorito = useCallback(
    (material_id: number) => favoritos.some(f => f.material_academico_id === material_id),
    [favoritos]
  );

  return { favoritos, isLoading, toggling, toggle, esFavorito, refrescar: cargar };
};

// ── PROGRESO ───────────────────────────────────────────────────
export const useProgresoEstudiante = (grado_materia_id: number | null) => {
  const [progreso, setProgreso]         = useState<ProgresoTema[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!grado_materia_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getProgreso(grado_materia_id);
      setProgreso(res.data.progreso);
    } catch {
      toast.error('Error al cargar progreso');
    } finally {
      setIsLoading(false);
    }
  }, [grado_materia_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizar = useCallback(async (
    tema_id: number,
    data: { estado?: string; porcentaje_avance?: number; tiempo_dedicado?: number }
  ) => {
    setIsSubmitting(true);
    try {
      await estudianteService.actualizarProgreso(tema_id, data);
      await cargar();
      return true;
    } catch {
      toast.error('Error al actualizar progreso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const porcentajeGeneral = progreso.length > 0
    ? Math.round(progreso.reduce((acc, p) => acc + Number(p.porcentaje_avance), 0) / progreso.length)
    : 0;
  const completados = progreso.filter(p => p.estado === 'completado').length;

  return { progreso, isLoading, isSubmitting, porcentajeGeneral, completados, totalTemas: progreso.length, actualizar, refrescar: cargar };
};

// ── COMENTARIOS ────────────────────────────────────────────────
export const useComentariosEstudiante = (material_id: number | null, solo_dudas = false) => {
  const [comentarios, setComentarios]   = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!material_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getComentarios(material_id, solo_dudas);
      setComentarios(res.data.comentarios);
    } catch {
      toast.error('Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  }, [material_id, solo_dudas]);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = useCallback(async (data: { contenido: string; comentario_padre_id?: number; es_duda?: boolean }) => {
    if (!material_id) return false;
    setIsSubmitting(true);
    try {
      await estudianteService.crearComentario(material_id, data);
      toast.success(data.es_duda ? 'Duda enviada' : 'Comentario publicado');
      await cargar();
      return true;
    } catch {
      toast.error('Error al publicar comentario');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [material_id, cargar]);

  const actualizar = useCallback(async (comentario_id: number, contenido: string) => {
    if (!material_id) return false;
    setIsSubmitting(true);
    try {
      await estudianteService.actualizarComentario(material_id, comentario_id, contenido);
      toast.success('Comentario actualizado');
      await cargar();
      return true;
    } catch {
      toast.error('Error al actualizar comentario');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [material_id, cargar]);

  return { comentarios, isLoading, isSubmitting, crear, actualizar, refrescar: cargar };
};

// ── NOTAS — BOLETÍN ────────────────────────────────────────────
export const useBoletinEstudiante = (periodo_evaluacion_id: number | null) => {
  const [boletin, setBoletin]     = useState<BoletinMateria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!periodo_evaluacion_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getBoletin(periodo_evaluacion_id);
      setBoletin(res.data.boletin);
    } catch {
      toast.error('Error al cargar boletín');
    } finally {
      setIsLoading(false);
    }
  }, [periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const aprobadas = boletin.filter(b => b.aprobado === true).length;
  const reprobadas = boletin.filter(b => b.aprobado === false).length;
  const promedio = boletin.length > 0
    ? Math.round(boletin.reduce((acc, b) => acc + (b.nota_final ?? 0), 0) / boletin.length)
    : 0;

  return { boletin, isLoading, aprobadas, reprobadas, promedio, refrescar: cargar };
};

// ── NOTAS — POR MATERIA ────────────────────────────────────────
export const useNotasPorMateriaEstudiante = (
  grado_materia_id: number | null,
  periodo_evaluacion_id: number | null
) => {
  const [notas, setNotas]         = useState<NotasPorMateria | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!grado_materia_id || !periodo_evaluacion_id) return;
    setIsLoading(true);
    try {
      const res = await estudianteService.getNotasPorMateria(grado_materia_id, periodo_evaluacion_id);
      setNotas(res.data);
    } catch {
      toast.error('Error al cargar notas');
    } finally {
      setIsLoading(false);
    }
  }, [grado_materia_id, periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);
  return { notas, isLoading, refrescar: cargar };
};

// ── HORARIO ────────────────────────────────────────────────────
export const useHorarioEstudiante = () => {
  const [horario, setHorario]     = useState<HorarioEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getHorario();
      setHorario(res.data.horario);
    } catch (error: any) {
      if (error.response?.status !== 404) toast.error('Error al cargar el horario');
      setHorario(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Día actual (1=Lunes … 6=Sábado, 0/7=Domingo → null)
  const diaCursor = (() => {
    const d = new Date().getDay(); // 0=Dom, 1=Lun … 6=Sab
    return d === 0 ? null : d;
  })();

  return { horario, isLoading, diaCursor, refrescar: cargar };
};

// ── TAREAS ─────────────────────────────────────────────────────
export const useTareasEstudiante = (opts: {
  periodo_evaluacion_id?: number;
  estado?: EstadoTarea;
} = {}) => {
  const [tareas, setTareas]           = useState<TareaEstudiante[]>([]);
  const [resumen, setResumen]         = useState<ResumenTareas>({ total: 0, entregados: 0, pendientes: 0, atrasados: 0, ausentes: 0 });
  const [isLoading, setIsLoading]     = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getTareas(opts);
      setTareas(res.data.tareas);
      setResumen(res.data.resumen);
    } catch {
      toast.error('Error al cargar tareas');
    } finally {
      setIsLoading(false);
    }
  }, [opts.periodo_evaluacion_id, opts.estado]);

  useEffect(() => { cargar(); }, [cargar]);

  // Agrupar por materia para la vista agrupada
  const porMateria = tareas.reduce<Record<string, TareaEstudiante[]>>((acc, t) => {
    const key = t.materia_nombre;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  // Próximas a vencer (pendientes con fecha_limite en los próximos 3 días)
  const proximasAvencer = tareas.filter(t =>
    t.estado_calculado === 'pendiente' &&
    t.dias_restantes !== null &&
    t.dias_restantes !== undefined &&
    t.dias_restantes <= 3 &&
    t.dias_restantes >= 0
  );

  return { tareas, resumen, isLoading, porMateria, proximasAvencer, refrescar: cargar };
};

// ── ASISTENCIA ─────────────────────────────────────────────────
export const useAsistenciaEstudiante = (opts: {
  asignacion_docente_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
} = {}) => {
  const [reporte, setReporte]     = useState<AsistenciaResumen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getAsistenciaResumen(opts);
      setReporte(res.data.reporte);
    } catch {
      toast.error('Error al cargar asistencia');
    } finally {
      setIsLoading(false);
    }
  }, [opts.asignacion_docente_id, opts.fecha_inicio, opts.fecha_fin]);

  useEffect(() => { cargar(); }, [cargar]);
  return { reporte, isLoading, refrescar: cargar };
};

export const useAsistenciaDetalleEstudiante = (opts: {
  asignacion_docente_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
} = {}) => {
  const [detalle, setDetalle]     = useState<AsistenciaDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await estudianteService.getAsistenciaDetalle(opts);
      setDetalle(res.data.detalle);
    } catch {
      toast.error('Error al cargar detalle de asistencia');
    } finally {
      setIsLoading(false);
    }
  }, [opts.asignacion_docente_id, opts.fecha_inicio, opts.fecha_fin]);

  useEffect(() => { cargar(); }, [cargar]);
  return { detalle, isLoading, refrescar: cargar };
};