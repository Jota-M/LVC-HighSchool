// services/materialService.ts
import api from '@/lib/api';
import {
  TiposMaterialResponse,
  UnidadesListResponse,
  UnidadResponse,
  TemarioResponse,
  TemasListResponse,
  TemaResponse,
  MaterialesListResponse,
  MaterialResponse,
  EstadisticasResponse,
  ComentariosResponse,
  FavoritosResponse,
  ProgresoResponse,
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
  MaterialAcademico,
  UnidadTematica,
  Tema,
  ComentarioMaterial,
  FavoritoMaterial,
  ResumenProgresoResponse,
  QuizPregunta,
  QuizPreguntaCompleta,
  ResponderQuizResponse,
  MiResultadoResponse,
  ResumenQuizResponse,
  RespuestaQuizDTO,
  QuizListResponse,
  QuizCompletoResponse,
  GenerarQuizResponse
} from '@/types/materialTypes';

// =============================================
// TIPOS DE MATERIAL
// =============================================

export const tipoMaterialService = {
  async listar(): Promise<TiposMaterialResponse> {
    const response = await api.get('/materiales/tipos');
    return response.data;
  },
};

// =============================================
// UNIDADES TEMÁTICAS
// =============================================

export const unidadTematicaService = {
  async listar(filters: UnidadFiltros = {}): Promise<UnidadesListResponse> {
    const params = new URLSearchParams();
    if (filters.grado_materia_id) params.append('grado_materia_id', filters.grado_materia_id.toString());
    if (filters.periodo_evaluacion_id) params.append('periodo_evaluacion_id', filters.periodo_evaluacion_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/materiales/unidades?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<UnidadResponse> {
    const response = await api.get(`/materiales/unidades/${id}`);
    return response.data;
  },

  async getTemario(
    grado_materia_id: number,
    periodo_evaluacion_id?: number
  ): Promise<TemarioResponse> {
    const params = periodo_evaluacion_id
      ? `?periodo_evaluacion_id=${periodo_evaluacion_id}`
      : '';
    const response = await api.get(`/materiales/unidades/temario/${grado_materia_id}${params}`);
    return response.data;
  },

  async crear(
    data: CrearUnidadTematicaDTO
  ): Promise<{ success: boolean; message: string; data: { unidad: UnidadTematica } }> {
    const response = await api.post('/materiales/unidades', data);
    return response.data;
  },

  async actualizar(
    id: number,
    data: ActualizarUnidadTematicaDTO
  ): Promise<{ success: boolean; message: string; data: { unidad: UnidadTematica } }> {
    const response = await api.put(`/materiales/unidades/${id}`, data);
    return response.data;
  },

  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/materiales/unidades/${id}`);
    return response.data;
  },
};

// =============================================
// TEMAS
// =============================================

export const temaService = {
  async listar(filters: TemaFiltros = {}): Promise<TemasListResponse> {
    const params = new URLSearchParams();
    if (filters.unidad_tematica_id) params.append('unidad_tematica_id', filters.unidad_tematica_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.nivel_dificultad) params.append('nivel_dificultad', filters.nivel_dificultad);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/materiales/temas?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<TemaResponse> {
    const response = await api.get(`/materiales/temas/${id}`);
    return response.data;
  },

  async crear(
    data: CrearTemaDTO
  ): Promise<{ success: boolean; message: string; data: { tema: Tema } }> {
    const response = await api.post('/materiales/temas', data);
    return response.data;
  },

  async actualizar(
    id: number,
    data: ActualizarTemaDTO
  ): Promise<{ success: boolean; message: string; data: { tema: Tema } }> {
    const response = await api.put(`/materiales/temas/${id}`, data);
    return response.data;
  },

  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/materiales/temas/${id}`);
    return response.data;
  },

  async generarContenido(
    id: number,
    forzar = false
  ): Promise<{ success: boolean; message: string; data: { tema: Tema; generado: boolean } }> {
    const query = forzar ? '?forzar=true' : '';
    const response = await api.post(`/materiales/temas/${id}/generar-contenido${query}`);
    return response.data;
  },
};

// =============================================
// MATERIALES ACADÉMICOS
// =============================================

export const materialAcademicoService = {
  async listar(filters: MaterialFiltros = {}): Promise<MaterialesListResponse> {
    const params = new URLSearchParams();
    if (filters.asignacion_docente_id) params.append('asignacion_docente_id', filters.asignacion_docente_id.toString());
    if (filters.tipo_material_id) params.append('tipo_material_id', filters.tipo_material_id.toString());
    if (filters.tema_id) params.append('tema_id', filters.tema_id.toString());
    if (filters.visible_para_estudiantes !== undefined)
      params.append('visible_para_estudiantes', filters.visible_para_estudiantes.toString());
    if (filters.es_destacado !== undefined) params.append('es_destacado', filters.es_destacado.toString());
    if (filters.solo_publicados) params.append('solo_publicados', 'true');
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/materiales?${params}`);
    return response.data;
  },

  async buscar(
    q: string,
    asignacion_docente_id?: number,
    tipo_material_id?: number,
    solo_visibles = true
  ): Promise<{ success: boolean; data: { materiales: MaterialAcademico[]; total: number } }> {
    const params = new URLSearchParams({ q, solo_visibles: solo_visibles.toString() });
    if (asignacion_docente_id) params.append('asignacion_docente_id', asignacion_docente_id.toString());
    if (tipo_material_id) params.append('tipo_material_id', tipo_material_id.toString());

    const response = await api.get(`/materiales/buscar?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<MaterialResponse> {
    const response = await api.get(`/materiales/${id}`);
    return response.data;
  },

  async getEstadisticas(
    id: number,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<EstadisticasResponse> {
    const params = new URLSearchParams();
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);
    const query = params.toString() ? `?${params}` : '';
    const response = await api.get(`/materiales/${id}/estadisticas${query}`);
    return response.data;
  },

  async getDestacados(
    asignacion_docente_id: number,
    limite = 5
  ): Promise<{ success: boolean; data: { materiales: MaterialAcademico[] } }> {
    const response = await api.get(
      `/materiales/destacados?asignacion_docente_id=${asignacion_docente_id}&limite=${limite}`
    );
    return response.data;
  },

  async crear(data: CrearMaterialDTO): Promise<{ success: boolean; message: string; data: { material: MaterialAcademico } }> {
    const formData = new FormData();

    formData.append('asignacion_docente_id', data.asignacion_docente_id.toString());
    formData.append('tipo_material_id', data.tipo_material_id.toString());
    formData.append('titulo', data.titulo);
    formData.append('es_enlace_externo', data.es_enlace_externo.toString());

    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.url_externa) formData.append('url_externa', data.url_externa);
    if (data.visible_para_estudiantes !== undefined)
      formData.append('visible_para_estudiantes', data.visible_para_estudiantes.toString());
    if (data.fecha_publicacion) formData.append('fecha_publicacion', data.fecha_publicacion);
    if (data.fecha_despublicacion) formData.append('fecha_despublicacion', data.fecha_despublicacion);
    if (data.requiere_descarga !== undefined)
      formData.append('requiere_descarga', data.requiere_descarga.toString());
    if (data.es_destacado !== undefined)
      formData.append('es_destacado', data.es_destacado.toString());
    if (data.temas) formData.append('temas', JSON.stringify(data.temas));
    if (data.archivo) formData.append('archivo', data.archivo);

    const response = await api.post('/materiales', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async actualizar(
    id: number,
    data: ActualizarMaterialDTO
  ): Promise<{ success: boolean; message: string; data: { material: MaterialAcademico } }> {
    if (data.archivo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'archivo') {
          formData.append(key, value.toString());
        }
      });
      formData.append('archivo', data.archivo);
      const response = await api.put(`/materiales/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await api.put(`/materiales/${id}`, data);
    return response.data;
  },

  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/materiales/${id}`);
    return response.data;
  },

  async publicar(
    id: number,
    data: PublicarMaterialDTO = {}
  ): Promise<{ success: boolean; message: string; data: { material: MaterialAcademico } }> {
    const response = await api.patch(`/materiales/${id}/publicar`, data);
    return response.data;
  },

  async vincularTema(
    id: number,
    data: VincularTemaDTO
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/materiales/${id}/temas`, data);
    return response.data;
  },

  async desvincularTema(
    id: number,
    tema_id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/materiales/${id}/temas/${tema_id}`);
    return response.data;
  },

  async registrarAcceso(
    id: number,
    data: RegistrarAccesoDTO
  ): Promise<{ success: boolean }> {
    const response = await api.post(`/materiales/${id}/acceso`, data);
    return response.data;
  },
};

// =============================================
// COMENTARIOS
// =============================================

export const comentarioMaterialService = {
  async listar(
    material_id: number,
    solo_dudas = false
  ): Promise<ComentariosResponse> {
    const query = solo_dudas ? '?solo_dudas=true' : '';
    const response = await api.get(`/materiales/${material_id}/comentarios${query}`);
    return response.data;
  },

  async crear(
    material_id: number,
    data: CrearComentarioDTO
  ): Promise<{ success: boolean; message: string; data: { comentario: ComentarioMaterial } }> {
    const response = await api.post(`/materiales/${material_id}/comentarios`, data);
    return response.data;
  },

  async actualizar(
    material_id: number,
    comentario_id: number,
    contenido: string
  ): Promise<{ success: boolean; message: string; data: { comentario: ComentarioMaterial } }> {
    const response = await api.put(`/materiales/${material_id}/comentarios/${comentario_id}`, { contenido });
    return response.data;
  },

  async marcarResuelto(
    material_id: number,
    comentario_id: number
  ): Promise<{ success: boolean; message: string; data: { comentario: ComentarioMaterial } }> {
    const response = await api.patch(
      `/materiales/${material_id}/comentarios/${comentario_id}/resolver`
    );
    return response.data;
  },

  async eliminar(
    material_id: number,
    comentario_id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/materiales/${material_id}/comentarios/${comentario_id}`);
    return response.data;
  },
};

// =============================================
// FAVORITOS
// =============================================

export const favoritoMaterialService = {
  async listar(matricula_id: number): Promise<FavoritosResponse> {
    const response = await api.get(`/materiales/favoritos?matricula_id=${matricula_id}`);
    return response.data;
  },

  async toggle(
    material_id: number,
    matricula_id: number,
    notas_personales?: string
  ): Promise<{ success: boolean; message: string; data: { accion: 'agregado' | 'removido' } }> {
    const response = await api.post(`/materiales/${material_id}/favorito`, {
      matricula_id,
      notas_personales,
    });
    return response.data;
  },
};

// =============================================
// PROGRESO
// =============================================

export const progresoEstudianteService = {
  async getReporte(
    matricula_id: number,
    grado_materia_id: number
  ): Promise<ProgresoResponse> {
    const response = await api.get(
      `/materiales/progreso?matricula_id=${matricula_id}&grado_materia_id=${grado_materia_id}`
    );
    return response.data;
  },

  async actualizar(
    tema_id: number,
    data: ActualizarProgresoDTO
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/materiales/progreso/${tema_id}`, data);
    return response.data;
  },
  async getResumenPorTema(
    tema_id: number,
    paralelo_id: number,
    periodo_academico_id: number
  ): Promise<ResumenProgresoResponse> {
    const response = await api.get(
      `/materiales/temas/${tema_id}/progreso-resumen?paralelo_id=${paralelo_id}&periodo_academico_id=${periodo_academico_id}`
    );
    return response.data;
  }
};

// =============================================
// QUIZ AUTOMÁTICO (Nivel 2)
// =============================================
export const temaQuizService = {
  /**
   * POST /api/materiales/temas/:id/generar-quiz
   * Genera (o regenera) el quiz de un tema con IA.
   */
  async generar(id: number, cantidad_preguntas = 5): Promise<GenerarQuizResponse> {
    const response = await api.post(`/materiales/temas/${id}/generar-quiz`, { cantidad_preguntas });
    return response.data;
  },

  /**
   * GET /api/materiales/temas/:id/quiz
   * Preguntas sin respuesta correcta (vista estudiante).
   */
  async listar(id: number): Promise<QuizListResponse> {
    const response = await api.get(`/materiales/temas/${id}/quiz`);
    return response.data;
  },

  /**
   * GET /api/materiales/temas/:id/quiz/completo
   * Preguntas con respuesta correcta y explicación (vista docente).
   */
  async listarCompleto(id: number): Promise<QuizCompletoResponse> {
    const response = await api.get(`/materiales/temas/${id}/quiz/completo`);
    return response.data;
  },

  /**
   * POST /api/materiales/temas/:id/quiz/responder
   * Envía respuestas del estudiante y recibe calificación.
   */
  async responder(
    id: number,
    matricula_id: number,
    respuestas: RespuestaQuizDTO[]
  ): Promise<ResponderQuizResponse> {
    const response = await api.post(`/materiales/temas/${id}/quiz/responder`, { matricula_id, respuestas });
    return response.data;
  },

  /**
   * GET /api/materiales/temas/:id/quiz/mi-resultado?matricula_id=X
   * Último intento del estudiante.
   */
  async miResultado(id: number, matricula_id: number): Promise<MiResultadoResponse> {
    const response = await api.get(`/materiales/temas/${id}/quiz/mi-resultado?matricula_id=${matricula_id}`);
    return response.data;
  },

  /**
   * GET /api/materiales/temas/:id/quiz/resumen?paralelo_id=X&periodo_academico_id=Y
   * Resumen agregado para el docente.
   */
  async getResumen(id: number, paralelo_id: number, periodo_academico_id: number): Promise<ResumenQuizResponse> {
    const response = await api.get(
      `/materiales/temas/${id}/quiz/resumen?paralelo_id=${paralelo_id}&periodo_academico_id=${periodo_academico_id}`
    );
    return response.data;
  },
};

export default {
  tipos: tipoMaterialService,
  unidades: unidadTematicaService,
  temas: temaService,
  materiales: materialAcademicoService,
  comentarios: comentarioMaterialService,
  favoritos: favoritoMaterialService,
  progreso: progresoEstudianteService,
};