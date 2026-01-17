// services/certificadoVacacionalService.ts
import api from '@/lib/api';
import {
  InscripcionVacacionalFilters,
  InscripcionesResponse,
} from '@/types/cursoVacacionalTypes';

const certificadoVacacionalService = {
  /**
   * Lista inscripciones completadas (candidatas para certificado)
   */
  async listarCompletadas(filters: InscripcionVacacionalFilters = {}): Promise<InscripcionesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.periodo_vacacional_id) {
      params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    }

    const response = await api.get(
      `/cursos-vacacionales/inscripciones-completadas?${params}`
    );
    
    return {
      inscripciones: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  /**
   * Descarga el certificado en PDF
   */
  async descargarCertificado(inscripcionId: number): Promise<void> {
    try {
      const response = await api.get(
        `/cursos-vacacionales/inscripciones/${inscripcionId}/certificado`,
        {
          responseType: 'blob',
        }
      );

      // Extraer el nombre del archivo desde los headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Certificado_${inscripcionId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      throw error;
    }
  },

  /**
   * Abre el certificado en una nueva pestaña para preview
   */
  async previsualizarCertificado(inscripcionId: number): Promise<void> {
    try {
      const response = await api.get(
        `/cursos-vacacionales/inscripciones/${inscripcionId}/certificado/preview`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error al previsualizar certificado:', error);
      throw error;
    }
  },

  /**
   * Obtiene la URL del certificado para mostrar en un iframe
   */
  getCertificadoUrl(inscripcionId: number): string {
    return `/api/cursos-vacacionales/inscripciones/${inscripcionId}/certificado/preview`;
  },
};

export default certificadoVacacionalService;