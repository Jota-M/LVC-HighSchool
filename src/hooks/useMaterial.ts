// hooks/useMaterial.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  tipoMaterialService,
  unidadTematicaService,
  temaService,
  materialAcademicoService,
  comentarioMaterialService,
  favoritoMaterialService,
  progresoEstudianteService,
  temaQuizService,
} from '@/services/materialService';
import {
  TipoMaterial,
  UnidadTematica,
  Tema,
  MaterialAcademico,
  MaterialTema,
  TemarioItem,
  ComentarioMaterial,
  FavoritoMaterial,
  ProgresoEstudiante,
  EstadisticasMaterial,
  Paginacion,
  UnidadFiltros,
  TemaFiltros,
  MaterialFiltros,
  CrearUnidadTematicaDTO,
  ActualizarUnidadTematicaDTO,
  CrearTemaDTO,
  ActualizarTemaDTO,
  CrearMaterialDTO,
  ActualizarMaterialDTO,
  PublicarMaterialDTO,
  VincularTemaDTO,
  RegistrarAccesoDTO,
  CrearComentarioDTO,
  ActualizarProgresoDTO,
  ResumenProgresoTema,
  ResumenQuizTema,
  RespuestaQuizDTO,
  QuizPreguntaCompleta,
  QuizPregunta,
  ResultadoPregunta,
  IntentoQuiz,
} from '@/types/materialTypes';

// =============================================
// HOOK: TIPOS DE MATERIAL (catálogo)
// =============================================
interface UnidadResumen {
  unidad_id: number;
  numero_unidad: number;
  unidad_titulo: string;
  unidad_descripcion?: string;
}

export const useTiposMaterial = () => {
  const [tipos, setTipos] = useState<TipoMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    tipoMaterialService.listar()
      .then(res => setTipos(res.data.tipos))
      .catch(() => toast.error('Error al cargar tipos de material'))
      .finally(() => setIsLoading(false));
  }, []);

  return { tipos, isLoading };
};

// =============================================
// HOOK: UNIDADES TEMÁTICAS
// =============================================

export const useUnidadesTematicas = (filtrosIniciales: UnidadFiltros = {}) => {
  const [unidades, setUnidades] = useState<UnidadTematica[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion>({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [filters, setFilters] = useState<UnidadFiltros>({ page: 1, limit: 50, ...filtrosIniciales });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await unidadTematicaService.listar(filters);
      setUnidades(res.data.unidades);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar unidades temáticas');
      setUnidades([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<UnidadFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos }));
  }, []);

  const crear = useCallback(async (data: CrearUnidadTematicaDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await unidadTematicaService.crear(data);
      toast.success('Unidad temática creada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear unidad';
      toast.error(msg.includes('Ya existe') ? 'Ya existe una unidad con ese número en esta materia' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarUnidadTematicaDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await unidadTematicaService.actualizar(id, data);
      toast.success('Unidad temática actualizada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar unidad');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await unidadTematicaService.eliminar(id);
      toast.success('Unidad temática eliminada');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar unidad');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    unidades, paginacion, filters, isLoading, isSubmitting,
    actualizarFiltros, crear, actualizar, eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: TEMARIO COMPLETO
// =============================================

export const useTemario = (grado_materia_id: number | null, periodo_evaluacion_id?: number) => {
  const [temario, setTemario] = useState<TemarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!grado_materia_id) return;
    setIsLoading(true);
    try {
      const res = await unidadTematicaService.getTemario(grado_materia_id, periodo_evaluacion_id);
      setTemario(res.data.temario);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar el temario');
      setTemario([]);
    } finally {
      setIsLoading(false);
    }
  }, [grado_materia_id, periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Agrupado por unidad para renderizado fácil
  const porUnidad = temario.reduce<Record<number, { unidad: UnidadResumen; temas: TemarioItem[] }>>(
    (acc, item) => {
      if (!acc[item.unidad_id]) {
        acc[item.unidad_id] = {
          unidad: {
            unidad_id: item.unidad_id,
            numero_unidad: item.unidad_numero, // ← leer de unidad_numero
            unidad_titulo: item.unidad_titulo,
            unidad_descripcion: item.unidad_descripcion ?? undefined,
          },
          temas: [],
        };
      }
      acc[item.unidad_id].temas.push(item);
      return acc;
    },
    {}
  );

  return { temario, porUnidad: Object.values(porUnidad), isLoading, refrescar: cargar };
};

// =============================================
// HOOK: TEMAS
// =============================================

export const useTemas = (filtrosIniciales: TemaFiltros = {}) => {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion>({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [filters, setFilters] = useState<TemaFiltros>({ page: 1, limit: 50, ...filtrosIniciales });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await temaService.listar(filters);
      setTemas(res.data.temas);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar temas');
      setTemas([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<TemaFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos }));
  }, []);

  const crear = useCallback(async (data: CrearTemaDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await temaService.crear(data);
      toast.success('Tema creado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear tema';
      toast.error(msg.includes('Ya existe') ? 'Ya existe un tema con ese número en esta unidad' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarTemaDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await temaService.actualizar(id, data);
      toast.success('Tema actualizado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar tema');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await temaService.eliminar(id);
      toast.success('Tema eliminado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar tema');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);
  const [generandoIA, setGenerandoIA] = useState<number | null>(null);

  const generarContenido = useCallback(async (
    id: number,
    forzar = false
  ): Promise<{ tema: Tema; generado: boolean } | null> => {
    setGenerandoIA(id);
    try {
      const res = await temaService.generarContenido(id, forzar);
      if (res.data.generado) {
        toast.success('Contenido generado con IA');
      }
      await cargar();
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar contenido con IA');
      return null;
    } finally {
      setGenerandoIA(null);
    }
  }, [cargar]);

  return {
    temas, paginacion, filters, isLoading, isSubmitting,
    actualizarFiltros, crear, actualizar, eliminar,
    refrescar: cargar, generarContenido, generandoIA,
  };
};

// =============================================
// HOOK: MATERIALES ACADÉMICOS
// =============================================

export const useMateriales = (filtrosIniciales: MaterialFiltros = {}) => {
  const [materiales, setMateriales] = useState<MaterialAcademico[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters, setFilters] = useState<MaterialFiltros>({ page: 1, limit: 10, ...filtrosIniciales });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await materialAcademicoService.listar(filters);
      setMateriales(res.data.materiales);
      setPaginacion(res.data.paginacion);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar materiales');
      setMateriales([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<MaterialFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos, page: 1 }));
  }, []);

  const crear = useCallback(async (data: CrearMaterialDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await materialAcademicoService.crear(data);
      toast.success('Material creado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear material');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarMaterialDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await materialAcademicoService.actualizar(id, data);
      toast.success('Material actualizado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar material');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await materialAcademicoService.eliminar(id);
      toast.success('Material eliminado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar material');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const publicar = useCallback(async (
    id: number,
    data: PublicarMaterialDTO = {}
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await materialAcademicoService.publicar(id, data);
      toast.success('Material publicado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar material');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    materiales, paginacion, filters, isLoading, isSubmitting,
    actualizarFiltros, crear, actualizar, eliminar, publicar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: DETALLE DE MATERIAL
// =============================================

export const useMaterialDetalle = (id: number | null) => {
  const [material, setMaterial] = useState<MaterialAcademico | null>(null);
  const [temas, setTemas] = useState<MaterialTema[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await materialAcademicoService.obtenerPorId(id);
      setMaterial(res.data.material);
      setTemas(res.data.temas);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar el material');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const vincularTema = useCallback(async (data: VincularTemaDTO): Promise<boolean> => {
    if (!id) return false;
    try {
      await materialAcademicoService.vincularTema(id, data);
      toast.success('Tema vinculado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al vincular tema');
      return false;
    }
  }, [id, cargar]);

  const desvincularTema = useCallback(async (tema_id: number): Promise<boolean> => {
    if (!id) return false;
    try {
      await materialAcademicoService.desvincularTema(id, tema_id);
      toast.success('Tema desvinculado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al desvincular tema');
      return false;
    }
  }, [id, cargar]);

  const registrarAcceso = useCallback(async (data: RegistrarAccesoDTO) => {
    if (!id) return;
    try {
      await materialAcademicoService.registrarAcceso(id, data);
    } catch {
      // Silencioso — no interrumpir la visualización
    }
  }, [id]);

  return {
    material, temas, isLoading,
    vincularTema, desvincularTema, registrarAcceso,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: ESTADÍSTICAS DE MATERIAL
// =============================================

export const useEstadisticasMaterial = (id: number | null) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async (fecha_inicio?: string, fecha_fin?: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await materialAcademicoService.getEstadisticas(id, fecha_inicio, fecha_fin);
      setEstadisticas(res.data.estadisticas);
    } catch {
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  return { estadisticas, isLoading, refrescar: cargar };
};

// =============================================
// HOOK: COMENTARIOS DE UN MATERIAL
// =============================================

export const useComentariosMaterial = (material_id: number | null, solo_dudas = false) => {
  const [comentarios, setComentarios] = useState<ComentarioMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!material_id) return;
    setIsLoading(true);
    try {
      const res = await comentarioMaterialService.listar(material_id, solo_dudas);
      setComentarios(res.data.comentarios);
    } catch {
      toast.error('Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  }, [material_id, solo_dudas]);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = useCallback(async (data: CrearComentarioDTO): Promise<boolean> => {
    if (!material_id) return false;
    setIsSubmitting(true);
    try {
      await comentarioMaterialService.crear(material_id, data);
      toast.success(data.es_duda ? 'Duda enviada' : 'Comentario publicado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar comentario');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [material_id, cargar]);

  const actualizar = useCallback(async (
    comentario_id: number,
    contenido: string
  ): Promise<boolean> => {
    if (!material_id) return false;
    setIsSubmitting(true);
    try {
      await comentarioMaterialService.actualizar(material_id, comentario_id, contenido);
      toast.success('Comentario actualizado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar comentario');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [material_id, cargar]);

  const resolver = useCallback(async (comentario_id: number): Promise<boolean> => {
    if (!material_id) return false;
    try {
      await comentarioMaterialService.marcarResuelto(material_id, comentario_id);
      toast.success('Duda marcada como resuelta');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al resolver duda');
      return false;
    }
  }, [material_id, cargar]);

  const eliminar = useCallback(async (comentario_id: number): Promise<boolean> => {
    if (!material_id) return false;
    try {
      await comentarioMaterialService.eliminar(material_id, comentario_id);
      toast.success('Comentario eliminado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar comentario');
      return false;
    }
  }, [material_id, cargar]);

  return {
    comentarios, isLoading, isSubmitting,
    crear, actualizar, resolver, eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: FAVORITOS DEL ESTUDIANTE
// =============================================

export const useFavoritosMaterial = (matricula_id: number | null) => {
  const [favoritos, setFavoritos] = useState<FavoritoMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!matricula_id) return;
    setIsLoading(true);
    try {
      const res = await favoritoMaterialService.listar(matricula_id);
      setFavoritos(res.data.favoritos);
    } catch {
      toast.error('Error al cargar favoritos');
    } finally {
      setIsLoading(false);
    }
  }, [matricula_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const toggle = useCallback(async (
    material_id: number,
    notas?: string
  ): Promise<'agregado' | 'removido' | null> => {
    if (!matricula_id) return null;
    setToggling(material_id);
    try {
      const res = await favoritoMaterialService.toggle(material_id, matricula_id, notas);
      const accion = res.data.accion;
      toast.success(accion === 'agregado' ? 'Agregado a favoritos' : 'Removido de favoritos');
      await cargar();
      return accion;
    } catch {
      toast.error('Error al gestionar favorito');
      return null;
    } finally {
      setToggling(null);
    }
  }, [matricula_id, cargar]);

  const esFavorito = useCallback(
    (material_id: number) => favoritos.some(f => f.material_academico_id === material_id),
    [favoritos]
  );

  return { favoritos, isLoading, toggling, toggle, esFavorito, refrescar: cargar };
};

// =============================================
// HOOK: PROGRESO DEL ESTUDIANTE
// =============================================

export const useProgresoEstudiante = (
  matricula_id: number | null,
  grado_materia_id: number | null
) => {
  const [progreso, setProgreso] = useState<ProgresoEstudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!matricula_id || !grado_materia_id) return;
    setIsLoading(true);
    try {
      const res = await progresoEstudianteService.getReporte(matricula_id, grado_materia_id);
      setProgreso(res.data.progreso);
    } catch {
      toast.error('Error al cargar progreso');
    } finally {
      setIsLoading(false);
    }
  }, [matricula_id, grado_materia_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizar = useCallback(async (
    tema_id: number,
    data: Omit<ActualizarProgresoDTO, 'matricula_id'>
  ): Promise<boolean> => {
    if (!matricula_id) return false;
    setIsSubmitting(true);
    try {
      await progresoEstudianteService.actualizar(tema_id, { ...data, matricula_id });
      await cargar();
      return true;
    } catch {
      toast.error('Error al actualizar progreso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [matricula_id, cargar]);

  const porcentajeGeneral = progreso.length > 0
    ? Math.round(progreso.reduce((acc, p) => acc + Number(p.porcentaje_avance), 0) / progreso.length)
    : 0;

  const completados = progreso.filter(p => p.estado === 'completado').length;

  return {
    progreso, isLoading, isSubmitting,
    porcentajeGeneral, completados,
    totalTemas: progreso.length,
    actualizar, refrescar: cargar,
  };

};

// =============================================
// HOOK: RESUMEN DE PROGRESO DE UN TEMA (vista docente)
// =============================================

export const useResumenProgresoTema = (
  tema_id: number | null,
  paralelo_id: number | null,
  periodo_academico_id: number | null
) => {
  const [resumen, setResumen] = useState<ResumenProgresoTema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!tema_id || !paralelo_id || !periodo_academico_id) { setResumen(null); return; }
    setIsLoading(true);
    try {
      const res = await progresoEstudianteService.getResumenPorTema(tema_id, paralelo_id, periodo_academico_id);
      setResumen(res.data.resumen);
    } catch {
      setResumen(null);
    } finally {
      setIsLoading(false);
    }
  }, [tema_id, paralelo_id, periodo_academico_id]);

  useEffect(() => { cargar(); }, [cargar]);

  return { resumen, isLoading, refrescar: cargar };
};
// =============================================
// HOOK: QUIZ DE UN TEMA (vista docente - generación y gestión)
// =============================================

export const useQuizTema = (tema_id: number | null) => {
  const [preguntas, setPreguntas] = useState<QuizPreguntaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  const cargar = useCallback(async () => {
    if (!tema_id) return;
    setIsLoading(true);
    try {
      const res = await temaQuizService.listarCompleto(tema_id);
      setPreguntas(res.data.preguntas);
    } catch {
      setPreguntas([]);
    } finally {
      setIsLoading(false);
    }
  }, [tema_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const generar = useCallback(async (cantidad_preguntas = 5): Promise<boolean> => {
    if (!tema_id) return false;
    setGenerando(true);
    try {
      const res = await temaQuizService.generar(tema_id, cantidad_preguntas);
      setPreguntas(res.data.preguntas);
      toast.success(`Quiz generado: ${res.data.total} preguntas`);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar el quiz');
      return false;
    } finally {
      setGenerando(false);
    }
  }, [tema_id]);

  return { preguntas, isLoading, generando, generar, refrescar: cargar };
};

// =============================================
// HOOK: QUIZ DE UN TEMA (vista estudiante - resolver)
// =============================================

export const useResolverQuiz = (tema_id: number | null, matricula_id: number | null) => {
  const [preguntas, setPreguntas] = useState<QuizPregunta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    resultados: ResultadoPregunta[]; correctas: number; total: number; puntaje: number;
  } | null>(null);
  const [ultimoIntento, setUltimoIntento] = useState<IntentoQuiz | null>(null);

  const cargar = useCallback(async () => {
    if (!tema_id) return;
    setIsLoading(true);
    try {
      const res = await temaQuizService.listar(tema_id);
      setPreguntas(res.data.preguntas);

      if (matricula_id) {
        const mi = await temaQuizService.miResultado(tema_id, matricula_id);
        setUltimoIntento(mi.data.intento);
      }
    } catch {
      setPreguntas([]);
    } finally {
      setIsLoading(false);
    }
  }, [tema_id, matricula_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const responder = useCallback(async (respuestas: RespuestaQuizDTO[]): Promise<boolean> => {
    if (!tema_id || !matricula_id) return false;
    setEnviando(true);
    try {
      const res = await temaQuizService.responder(tema_id, matricula_id, respuestas);
      setResultado({
        resultados: res.data.resultados,
        correctas: res.data.correctas,
        total: res.data.total,
        puntaje: res.data.puntaje,
      });
      setUltimoIntento(res.data.intento);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar el quiz');
      return false;
    } finally {
      setEnviando(false);
    }
  }, [tema_id, matricula_id]);

  const reiniciar = useCallback(() => setResultado(null), []);

  return {
    preguntas, isLoading, enviando, resultado, ultimoIntento,
    responder, reiniciar, refrescar: cargar,
  };
};

// =============================================
// HOOK: RESUMEN DE QUIZ DE UN TEMA (vista docente)
// =============================================

export const useResumenQuizTema = (
  tema_id: number | null,
  paralelo_id: number | null,
  periodo_academico_id: number | null
) => {
  const [resumen, setResumen] = useState<ResumenQuizTema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!tema_id || !paralelo_id || !periodo_academico_id) { setResumen(null); return; }
    setIsLoading(true);
    try {
      const res = await temaQuizService.getResumen(tema_id, paralelo_id, periodo_academico_id);
      setResumen(res.data.resumen);
    } catch {
      setResumen(null);
    } finally {
      setIsLoading(false);
    }
  }, [tema_id, paralelo_id, periodo_academico_id]);

  useEffect(() => { cargar(); }, [cargar]);

  return { resumen, isLoading, refrescar: cargar };
};