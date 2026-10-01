// services/examenService.ts
import api from '@/lib/api';
import type {
  PreguntaExamen,
  ConfigurarExamenDTO,
  GenerarExamenIADTO,
  EstudianteIntentoItem,
  DetalleIntentoDocente,
  IniciarExamenResponse,
  RespuestaExamen,
  IntentoExamen,
} from '@/types/examenTypes';

export const examenService = {
  // ==========================================
  // DOCENTE
  // ==========================================

  /**
   * Genera un borrador de preguntas con Gemini IA directamente (sin evaluación previa).
   */
  async generarIADirecto(data: GenerarExamenIADTO & { temaTitulo?: string } = {}): Promise<{ success: boolean; data: { preguntas: PreguntaExamen[] } }> {
    const response = await api.post('/examenes/generar-ia-directo', data);
    return response.data;
  },

  /**
   * Genera un borrador de preguntas con Gemini IA sin guardar en la BD.
   */
  async generarIA(evaluacionId: number, data: GenerarExamenIADTO = {}): Promise<{ success: boolean; data: { preguntas: PreguntaExamen[] } }> {
    const response = await api.post(`/examenes/${evaluacionId}/generar-ia`, data);
    return response.data;
  },

  /**
   * Obtiene la lista completa de preguntas (vista docente, con respuestas).
   */
  async listarPreguntas(evaluacionId: number): Promise<{ success: boolean; data: { preguntas: PreguntaExamen[] } }> {
    const response = await api.get(`/examenes/${evaluacionId}/preguntas`);
    return response.data;
  },

  /**
   * Guarda o actualiza el set completo de preguntas.
   */
  async guardarPreguntas(evaluacionId: number, preguntas: PreguntaExamen[]): Promise<{ success: boolean; message: string; data: { preguntas: PreguntaExamen[] } }> {
    const response = await api.put(`/examenes/${evaluacionId}/preguntas`, { preguntas });
    return response.data;
  },

  /**
   * Activa la modalidad virtual con duración, fechas e intentos.
   */
  async publicarVirtual(evaluacionId: number, config: ConfigurarExamenDTO): Promise<{ success: boolean; message: string; data: { evaluacion: any } }> {
    const response = await api.post(`/examenes/${evaluacionId}/publicar-virtual`, config);
    return response.data;
  },

  /**
   * Cambia la evaluación de vuelta a modalidad presencial.
   */
  async desactivarVirtual(evaluacionId: number): Promise<{ success: boolean; message: string; data: { evaluacion: any } }> {
    const response = await api.post(`/examenes/${evaluacionId}/desactivar-virtual`);
    return response.data;
  },

  /**
   * Obtiene la configuración de la evaluación virtual.
   */
  async obtenerConfiguracion(evaluacionId: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/examenes/${evaluacionId}/configuracion`);
    return response.data;
  },

  /**
   * Lista los intentos de los alumnos y estado de calificación para el docente.
   */
  async listarIntentos(evaluacionId: number): Promise<{ success: boolean; data: { intentos: EstudianteIntentoItem[] } }> {
    const response = await api.get(`/examenes/${evaluacionId}/intentos`);
    return response.data;
  },

  /**
   * Detalle completo de un intento para calificar respuestas subjetivas.
   */
  async obtenerDetalleIntento(intentoId: number): Promise<{ success: boolean; data: DetalleIntentoDocente }> {
    const response = await api.get(`/examenes/intentos/${intentoId}`);
    return response.data;
  },

  /**
   * Califica manualmente una respuesta subjetiva (desarrollo / respuesta corta).
   */
  async calificarRespuestaManual(
    respuestaId: number,
    data: { puntaje_obtenido: number; retroalimentacion?: string }
  ): Promise<{ success: boolean; message: string; data: { intento: IntentoExamen } }> {
    const response = await api.put(`/examenes/respuestas/${respuestaId}/calificar`, data);
    return response.data;
  },

  /**
   * Reinicia el intento de un estudiante puntual para permitirle volver a dar el examen.
   */
  async reiniciarIntento(intentoId: number): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await api.post(`/examenes/intentos/${intentoId}/reiniciar`);
    return response.data;
  },

  /**
   * Limpia todos los intentos y envíos de una evaluación completa.
   */
  async limpiarTodosIntentos(evaluacionId: number): Promise<{ success: boolean; message: string; data?: { total_eliminados: number } }> {
    const response = await api.post(`/examenes/${evaluacionId}/limpiar-intentos`);
    return response.data;
  },

  // ==========================================
  // ESTUDIANTE
  // ==========================================

  /**
   * Inicia o retoma el intento del estudiante.
   */
  async iniciarIntento(evaluacionId: number, matriculaId?: number | null): Promise<{ success: boolean; data: IniciarExamenResponse }> {
    const response = await api.post(`/examenes/${evaluacionId}/iniciar`, {
      matricula_id: matriculaId ?? undefined,
    });
    return response.data;
  },

  /**
   * Autosave de respuesta dada por el estudiante.
   */
  async guardarRespuesta(
    respuestaId: number,
    data: { respuesta_opcion?: number | null; respuesta_texto?: string | null }
  ): Promise<{ success: boolean; data: RespuestaExamen }> {
    const response = await api.put(`/examenes/respuestas/${respuestaId}`, data);
    return response.data;
  },

  /**
   * Sube un archivo adjunto (imagen o PDF) para respuestas de desarrollo.
   */
  async subirArchivoRespuesta(
    respuestaId: number,
    file: File
  ): Promise<{ success: boolean; message: string; data: RespuestaExamen }> {
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await api.post(`/examenes/respuestas/${respuestaId}/archivo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Finaliza y entrega formalmente el examen.
   */
  async entregarIntento(intentoId: number): Promise<{ success: boolean; message: string; data: IntentoExamen }> {
    const response = await api.post(`/examenes/intentos/${intentoId}/entregar`);
    return response.data;
  },
};

export default examenService;
