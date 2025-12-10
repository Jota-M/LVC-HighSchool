// services/matriculacionService.ts
import api from '@/lib/api';
import {
  EstudiantesElegiblesResponse,
  MatriculacionData,
  MatriculacionResponse,
  RematriculacionData,
  DisponibilidadParalelo,
  MatriculasResponse,
  MatriculasFilters,
  EstadisticasMatricula,
  MatriculaUpdate,
  RetiroMatricula,
} from '@/types/matriculacionTypes';

export const matriculacionService = {
  // =============================================
  // CONSULTAS
  // =============================================

  /**
   * Listar estudiantes elegibles para matriculación
   */
  async listarEstudiantesElegibles(
    periodoAcademicoId: number,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      incluir_con_matricula?: boolean;
    } = {}
  ): Promise<EstudiantesElegiblesResponse> {
    const params = new URLSearchParams({
      periodo_academico_id: periodoAcademicoId.toString(),
    });

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.incluir_con_matricula !== undefined) {
      params.append('incluir_con_matricula', filters.incluir_con_matricula.toString());
    }

    const response = await api.get(`/matriculacion/estudiantes-elegibles?${params}`);
    return response.data.data;
  },

  /**
   * Verificar disponibilidad de paralelo
   */
  async verificarDisponibilidad(
    paraleloId: number,
    periodoAcademicoId: number
  ): Promise<DisponibilidadParalelo> {
    const response = await api.get('/matriculacion/verificar-disponibilidad', {
      params: {
        paralelo_id: paraleloId,
        periodo_academico_id: periodoAcademicoId,
      },
    });
    return response.data.data;
  },

  /**
   * Obtener matrículas por periodo
   */
  async obtenerMatriculasPorPeriodo(
    periodoAcademicoId: number,
    filters: Omit<MatriculasFilters, 'periodo_academico_id'> = {}
  ): Promise<MatriculasResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.paralelo_id) params.append('paralelo_id', filters.paralelo_id.toString());
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.nivel_academico_id) params.append('nivel_academico_id', filters.nivel_academico_id.toString());
    if (filters.estado) params.append('estado', filters.estado);

    const response = await api.get(`/matriculacion/periodo/${periodoAcademicoId}?${params}`);
    return response.data.data;
  },

  /**
   * Obtener estadísticas de matrícula
   */
  async obtenerEstadisticas(periodoAcademicoId: number): Promise<EstadisticasMatricula> {
    const response = await api.get(`/matriculacion/estadisticas/${periodoAcademicoId}`);
    return response.data.data;
  },

  // =============================================
  // ACCIONES
  // =============================================

  /**
   * Matricular estudiante con documentos
   */
  async matricularEstudiante(
    estudianteId: number,
    data: MatriculacionData
  ): Promise<MatriculacionResponse> {
    const formData = new FormData();

    // 1. Datos de matrícula (JSON)
    formData.append('matricula', JSON.stringify(data.matricula));

    // 2. Metadata de documentos (JSON)
    if (data.documentos && data.documentos.length > 0) {
      formData.append('documentos', JSON.stringify(data.documentos));
    }

    // 3. Archivos de documentos
    if (data.documentos_archivos && data.documentos_archivos.length > 0) {
      data.documentos_archivos.forEach((doc) => {
        formData.append('documentos', doc.file);
      });
    }

    const response = await api.post(`/matriculacion/matricular/${estudianteId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  /**
   * Re-matricular estudiante (sin documentos)
   */
  async rematricularEstudiante(
    estudianteId: number,
    data: RematriculacionData
  ): Promise<MatriculacionResponse> {
    const response = await api.post(`/matriculacion/rematricular/${estudianteId}`, data);
    return response.data;
  },

  /**
   * Actualizar matrícula
   */
  async actualizarMatricula(
    matriculaId: number,
    data: MatriculaUpdate
  ): Promise<MatriculacionResponse> {
    const response = await api.put(`/matriculacion/${matriculaId}`, data);
    return response.data;
  },

  /**
   * Retirar matrícula
   */
  async retirarMatricula(
    matriculaId: number,
    data: RetiroMatricula
  ): Promise<MatriculacionResponse> {
    const response = await api.patch(`/matriculacion/${matriculaId}/retirar`, data);
    return response.data;
  },

  // =============================================
  // 📄 FUNCIONES DE PDF - NUEVAS
  // =============================================

  /**
   * Descargar PDF de matrícula
   * Descarga automáticamente el archivo
   */
  async descargarPDF(matriculaId: number): Promise<void> {
    try {
      const response = await api.get(`/matricula/${matriculaId}/pdf`, {
        responseType: 'blob', // ⚠️ IMPORTANTE: recibir como blob
      });

      // Crear URL temporal del blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer nombre del archivo del header si existe
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Matricula_${matriculaId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  },

  /**
   * Ver PDF en el navegador (nueva pestaña)
   * Abre el PDF en línea sin descargarlo
   */
  verPDFPreview(matriculaId: number): void {
    // Obtener el token de autenticación
    const token = localStorage.getItem('token'); // o sessionStorage, según tu implementación
    
    // Construir URL con token
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseURL}/matricula/${matriculaId}/pdf/preview`;

    // Abrir en nueva pestaña con token en header (si es necesario)
    // Opción 1: Si tu API acepta token en URL (menos seguro pero funcional)
    // window.open(`${url}?token=${token}`, '_blank');

    // Opción 2: Mejor opción - crear un iframe temporal o usar fetch + blob URL
    this.abrirPDFEnNuevaPestaña(matriculaId);
  },

  /**
   * Método auxiliar para abrir PDF con autenticación
   */
  async abrirPDFEnNuevaPestaña(matriculaId: number): Promise<void> {
    try {
      const response = await api.get(`/matricula/${matriculaId}/pdf/preview`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva pestaña
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        throw new Error('Por favor permite ventanas emergentes para ver el PDF');
      }

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000); // 1 minuto
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      throw error;
    }
  },

  /**
   * Obtener URL del PDF para preview
   * (Alternativa si prefieres manejar la URL directamente)
   */
  getPDFUrl(matriculaId: number): string {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseURL}/matricula/${matriculaId}/pdf`;
  },

  /**
   * Obtener URL del PDF preview
   */
  getPDFPreviewUrl(matriculaId: number): string {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseURL}/matricula/${matriculaId}/pdf/preview`;
  },
};

export default matriculacionService;