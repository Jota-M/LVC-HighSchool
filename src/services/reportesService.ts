import api from '@/lib/api';
import type {
  ReporteParaleloParams,
  ReporteEstudianteParams,
  ReporteEstadisticoMatriculaParams,
  ReportePreInscripcionIndividualParams,
  ReportePreInscripcionListadoParams,
  ReportePreInscripcionEstadisticoParams,
} from '@/types/reportesTypes';

export const reportesService = {
  // ==========================================
  // 📚 REPORTES DE MATRÍCULAS
  // ==========================================

  /**
   * Descarga reporte grupal de un paralelo
   */
  async descargarReporteParalelo(params: ReporteParaleloParams): Promise<Blob> {
    const response = await api.get('/reportes/matricula/paralelo', {
      params: {
        paralelo_id: params.paralelo_id,
        periodo_id: params.periodo_id,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Descarga reporte individual de un estudiante
   */
  async descargarReporteEstudiante(params: ReporteEstudianteParams): Promise<Blob> {
    const response = await api.get('/reportes/matricula/estudiante', {
      params: {
        estudiante_id: params.estudiante_id,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Descarga reporte estadístico comparativo de matrículas
   */
  async descargarReporteEstadistico(
    params: ReporteEstadisticoMatriculaParams
  ): Promise<Blob> {
    const response = await api.get('/reportes/matricula/estadistico', {
      params: {
        periodo_id: params.periodo_id,
        nivel_id: params.nivel_id,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  // ==========================================
  // 📝 REPORTES DE PRE-INSCRIPCIONES
  // ==========================================

  /**
   * Descarga reporte individual de una pre-inscripción
   */
  async descargarReportePreInscripcionIndividual(
    params: ReportePreInscripcionIndividualParams
  ): Promise<Blob> {
    const response = await api.get('/reportes/preinscripcion/individual', {
      params: {
        id: params.id,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Descarga listado de pre-inscripciones con filtros
   */
  async descargarReportePreInscripcionListado(
    params: ReportePreInscripcionListadoParams
  ): Promise<Blob> {
    const response = await api.get('/reportes/preinscripcion/listado', {
      params: {
        estado: params.estado,
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Descarga reporte estadístico de pre-inscripciones
   */
  async descargarReportePreInscripcionEstadistico(
    params: ReportePreInscripcionEstadisticoParams
  ): Promise<Blob> {
    const response = await api.get('/reportes/preinscripcion/estadistico', {
      params: {
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        formato: params.formato || 'pdf',
      },
      responseType: 'blob',
    });
    return response.data;
  },
};