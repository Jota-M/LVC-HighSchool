// services/notasService.ts
import api from '@/lib/api';
import {
  MateriaDocenteNotas,
  DimensionEvaluacion,
  PeriodoEvaluacion,
  Evaluacion,
  CalificacionEstudiante,
  CalificacionPorPeriodo,
  NotaDimension,
  CalificacionPeriodo,
  BoletinItem,
  CrearEvaluacionDTO,
  ActualizarEvaluacionDTO,
  PublicarEvaluacionDTO,
  RegistrarNotasMasivoDTO,
  EvaluacionFiltros,
  RubricaResponse,
  CriterioRubrica,
  TemaConEvaluaciones,
} from '@/types/notasTypes';

// ──────────────────────────────────────────────
// TIPOS DE RESPUESTA
// ──────────────────────────────────────────────

export interface MisMateriasResponse {
  success: boolean;
  data: {
    docente_usuario_id: number;
    total_materias: number;
    periodo_evaluacion_id: number | null;
    materias: MateriaDocenteNotas[];
  };
}

export interface DimensionesResponse {
  success: boolean;
  data: { dimensiones: DimensionEvaluacion[] };
}

export interface PeriodosResponse {
  success: boolean;
  data: { periodos: PeriodoEvaluacion[] };
}

export interface EvaluacionesResponse {
  success: boolean;
  data: {
    evaluaciones: Evaluacion[];
    paginacion: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface CalificacionesEvaluacionResponse {
  success: boolean;
  data: {
    calificaciones: CalificacionEstudiante[];
    total: number;
    con_nota: number;
    sin_nota: number;
  };
}

// =============================================
// MATERIAS DEL DOCENTE
// =============================================

export const misMateriasNotasService = {
  async getMisMaterias(periodo_evaluacion_id?: number): Promise<MisMateriasResponse> {
    const params = periodo_evaluacion_id ? `?periodo_evaluacion_id=${periodo_evaluacion_id}` : '';
    const response = await api.get(`/notas/mis-materias${params}`);
    return response.data;
  },
};

// =============================================
// DIMENSIONES
// =============================================

export const dimensionesService = {
  async listar(): Promise<DimensionesResponse> {
    const response = await api.get('/notas/dimensiones');
    return response.data;
  },
};
// =============================================
// TEMARIO (nuevo)
// =============================================

export interface TemarioResponse {
  success: boolean;
  data: {
    temario: TemaConEvaluaciones[];
    total_unidades: number;
  };
}

export const temarioService = {
  /**
   * GET /api/notas/temario/:grado_materia_id
   * Devuelve el temario completo con evaluaciones agrupadas.
   * El docente lo usa para poblar el selector de tema al crear una evaluación.
   */
  async getTemario(
    grado_materia_id: number,
    periodo_evaluacion_id?: number
  ): Promise<TemarioResponse> {
    const params = periodo_evaluacion_id
      ? `?periodo_evaluacion_id=${periodo_evaluacion_id}`
      : '';
    const response = await api.get(`/notas/temario/${grado_materia_id}${params}`);
    return response.data;
  },
};
// =============================================
// PERÍODOS DE EVALUACIÓN
// =============================================

export const periodosEvaluacionService = {
  async listar(periodo_academico_id?: number, activo?: boolean): Promise<PeriodosResponse> {
    const params = new URLSearchParams();
    if (periodo_academico_id) params.append('periodo_academico_id', periodo_academico_id.toString());
    if (activo !== undefined)  params.append('activo', activo.toString());
    const response = await api.get(`/notas/periodos?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<{ success: boolean; data: { periodo: PeriodoEvaluacion } }> {
    const response = await api.get(`/notas/periodos/${id}`);
    return response.data;
  },
};

// =============================================
// EVALUACIONES
// =============================================

export const evaluacionesService = {
  async listar(filters: EvaluacionFiltros = {}): Promise<EvaluacionesResponse> {
    const params = new URLSearchParams();
    if (filters.page)                    params.append('page',                    filters.page.toString());
    if (filters.limit)                   params.append('limit',                   filters.limit.toString());
    if (filters.asignacion_docente_id)   params.append('asignacion_docente_id',   filters.asignacion_docente_id.toString());
    if (filters.dimension_evaluacion_id) params.append('dimension_evaluacion_id', filters.dimension_evaluacion_id.toString());
    if (filters.periodo_evaluacion_id)   params.append('periodo_evaluacion_id',   filters.periodo_evaluacion_id.toString());
    if (filters.activo !== undefined)    params.append('activo',                  filters.activo.toString());
    const response = await api.get(`/notas/evaluaciones?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<{ success: boolean; data: { evaluacion: Evaluacion } }> {
    const response = await api.get(`/notas/evaluaciones/${id}`);
    return response.data;
  },

  async crear(data: CrearEvaluacionDTO): Promise<{ success: boolean; message: string; data: { evaluacion: Evaluacion } }> {
    const response = await api.post('/notas/evaluaciones', data);
    return response.data;
  },

  async actualizar(id: number, data: ActualizarEvaluacionDTO): Promise<{ success: boolean; message: string; data: { evaluacion: Evaluacion } }> {
    const response = await api.put(`/notas/evaluaciones/${id}`, data);
    return response.data;
  },

  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/notas/evaluaciones/${id}`);
    return response.data;
  },
};

// =============================================
// ADJUNTOS (foto + PDF)
// =============================================

export const adjuntosService = {

  /**
   * POST /api/notas/evaluaciones/:id/foto
   * Sube o reemplaza la foto del enunciado.
   */
  async subirFoto(evaluacion_id: number, file: File): Promise<{ success: boolean; data: { evaluacion: Evaluacion } }> {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post(`/notas/evaluaciones/${evaluacion_id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async eliminarFoto(evaluacion_id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/notas/evaluaciones/${evaluacion_id}/foto`);
    return response.data;
  },

  /**
   * POST /api/notas/evaluaciones/:id/pdf
   * Sube o reemplaza el PDF de instrucciones.
   */
  async subirPdf(evaluacion_id: number, file: File): Promise<{ success: boolean; data: { evaluacion: Evaluacion } }> {
    const formData = new FormData();
    formData.append('pdf', file);
    const response = await api.post(`/notas/evaluaciones/${evaluacion_id}/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async eliminarPdf(evaluacion_id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/notas/evaluaciones/${evaluacion_id}/pdf`);
    return response.data;
  },

  /**
   * PATCH /api/notas/evaluaciones/:id/publicar
   * Hace la evaluación visible a padres y estudiantes.
   */
  async publicar(evaluacion_id: number, data: PublicarEvaluacionDTO = {}): Promise<{ success: boolean; data: { evaluacion: Evaluacion } }> {
    const response = await api.patch(`/notas/evaluaciones/${evaluacion_id}/publicar`, data);
    return response.data;
  },

  async despublicar(evaluacion_id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/notas/evaluaciones/${evaluacion_id}/despublicar`, {});
    return response.data;
  },
};

// =============================================
// RÚBRICA
// =============================================

export const rubricaService = {

  async listar(evaluacion_id: number): Promise<{ success: boolean; data: RubricaResponse }> {
    const response = await api.get(`/notas/evaluaciones/${evaluacion_id}/rubrica`);
    return response.data;
  },

  /**
   * PUT /api/notas/evaluaciones/:id/rubrica
   * Reemplaza toda la rúbrica en una sola operación.
   * El backend valida que la suma de puntos no supere puntaje_maximo.
   */
  async reemplazar(
    evaluacion_id: number,
    criterios: Omit<CriterioRubrica, 'id' | 'evaluacion_id' | 'activo'>[]
  ): Promise<{ success: boolean; message: string; data: RubricaResponse & { evaluacion_nombre: string; puntaje_maximo: number; suma_rubrica: number } }> {
    const response = await api.put(`/notas/evaluaciones/${evaluacion_id}/rubrica`, { criterios });
    return response.data;
  },
};

// =============================================
// CALIFICACIONES
// =============================================

export const calificacionesService = {
  async listarPorEvaluacion(evaluacion_id: number): Promise<CalificacionesEvaluacionResponse> {
    const response = await api.get(`/notas/calificaciones/evaluacion/${evaluacion_id}`);
    return response.data;
  },

  async listarPorMatriculaPeriodo(
    matricula_id: number,
    periodo_evaluacion_id: number
  ): Promise<{ success: boolean; data: { calificaciones: CalificacionPorPeriodo[] } }> {
    const response = await api.get(
      `/notas/calificaciones/matricula/${matricula_id}/periodo/${periodo_evaluacion_id}`
    );
    return response.data;
  },

  async registrarMasivo(
    data: RegistrarNotasMasivoDTO
  ): Promise<{ success: boolean; message: string; data: { total: number; calificaciones: any[] } }> {
    const response = await api.post('/notas/calificaciones/masivo', data);
    return response.data;
  },
};

// =============================================
// CÁLCULO Y BOLETÍN
// =============================================

export const notasCalculoService = {
  async calcular(
    matricula_id: number,
    grado_materia_id: number,
    periodo_evaluacion_id: number
  ): Promise<{
    success: boolean;
    data: { nota_final: number; notas_dimension: NotaDimension[]; calificacion: CalificacionPeriodo };
  }> {
    const response = await api.post('/notas/calcular', {
      matricula_id, grado_materia_id, periodo_evaluacion_id,
    });
    return response.data;
  },

  async getNotasDimension(
    matricula_id: number,
    grado_materia_id: number,
    periodo_evaluacion_id: number
  ): Promise<{ success: boolean; data: { notas: NotaDimension[] } }> {
    const response = await api.get(
      `/notas/dimension-notas/${matricula_id}/${grado_materia_id}/${periodo_evaluacion_id}`
    );
    return response.data;
  },

  async getBoletin(
    matricula_id: number,
    periodo_evaluacion_id: number
  ): Promise<{ success: boolean; data: { boletin: BoletinItem[] } }> {
    const response = await api.get(`/notas/boletin/${matricula_id}/${periodo_evaluacion_id}`);
    return response.data;
  },

  async cerrarPeriodo(
    matricula_id: number,
    grado_materia_id: number,
    periodo_evaluacion_id: number
  ): Promise<{ success: boolean; message: string; data: { calificacion: CalificacionPeriodo } }> {
    const response = await api.patch('/notas/cerrar-periodo', {
      matricula_id, grado_materia_id, periodo_evaluacion_id,
    });
    return response.data;
  },
};

export default {
  misMaterias:    misMateriasNotasService,
  dimensiones:    dimensionesService,
  periodos:       periodosEvaluacionService,
  evaluaciones:   evaluacionesService,
  adjuntos:       adjuntosService,
  rubrica:        rubricaService,
  calificaciones: calificacionesService,
  calculo:        notasCalculoService,
  temario:       temarioService,
};