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
  MatriculaDetalleResponse,
  TransferenciaParalelo,
  CambioEstado,
  SubirDocumentosData,
  MatriculaDocumento,
} from '@/types/matriculacionTypes';

class MatriculacionService {

  // ============================================================
  // CONSULTAS
  // ============================================================

  async listarEstudiantesElegibles(
    periodoAcademicoId: number,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      incluir_con_matricula?: boolean;
    } = {}
  ): Promise<EstudiantesElegiblesResponse> {
    const { data } = await api.get('/matriculacion/estudiantes-elegibles', {
      params: { periodo_academico_id: periodoAcademicoId, ...filters },
    });
    return data.data;
  }

  async verificarDisponibilidad(
    paraleloId: number,
    periodoAcademicoId: number
  ): Promise<DisponibilidadParalelo> {
    const { data } = await api.get('/matriculacion/verificar-disponibilidad', {
      params: { paralelo_id: paraleloId, periodo_academico_id: periodoAcademicoId },
    });
    return data.data;
  }

  async obtenerMatriculasPorPeriodo(
    periodoAcademicoId: number,
    filters: Omit<MatriculasFilters, 'periodo_academico_id'> = {}
  ): Promise<MatriculasResponse> {
    const { data } = await api.get(`/matriculacion/periodo/${periodoAcademicoId}`, {
      params: filters,
    });
    return data.data;
  }

  async obtenerEstadisticas(periodoAcademicoId: number): Promise<EstadisticasMatricula> {
    const { data } = await api.get(`/matriculacion/estadisticas/${periodoAcademicoId}`);
    return data.data;
  }

  /**
   * GET /api/matriculacion/:id
   * Detalle completo: matrícula + documentos + historial
   */
  async obtenerMatricula(matriculaId: number): Promise<MatriculaDetalleResponse> {
    const { data } = await api.get(`/matriculacion/${matriculaId}`);
    return data.data;
  }

  /**
   * GET /api/matriculacion/:id/documentos
   */
  async listarDocumentos(matriculaId: number): Promise<MatriculaDocumento[]> {
    const { data } = await api.get(`/matriculacion/${matriculaId}/documentos`);
    return data.data.documentos;
  }

  // ============================================================
  // CREACIÓN
  // ============================================================

  async matricularEstudiante(
    estudianteId: number,
    data: MatriculacionData
  ): Promise<MatriculacionResponse> {
    const formData = new FormData();

    formData.append('matricula', JSON.stringify(data.matricula));

    if (data.documentos && data.documentos.length > 0) {
      formData.append('documentos', JSON.stringify(data.documentos));
    }

    if (data.documentos_archivos && data.documentos_archivos.length > 0) {
      data.documentos_archivos.forEach((doc) => {
        formData.append('documentos', doc.file);
      });
    }

    const { data: response } = await api.post(
      `/matriculacion/matricular/${estudianteId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response;
  }

  async rematricularEstudiante(
    estudianteId: number,
    data: RematriculacionData
  ): Promise<MatriculacionResponse> {
    const { data: response } = await api.post(
      `/matriculacion/rematricular/${estudianteId}`,
      data
    );
    return response;
  }

  /**
   * POST /api/matriculacion/:id/documentos
   * Subir docs a matrícula ya existente
   */
  async subirDocumentos(
    matriculaId: number,
    payload: SubirDocumentosData
  ): Promise<MatriculaDocumento[]> {
    const formData = new FormData();

    payload.files.forEach((file) => formData.append('documentos', file));
    formData.append('documentos', JSON.stringify(payload.metadata));

    const { data } = await api.post(
      `/matriculacion/${matriculaId}/documentos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data.documentos;
  }

  // ============================================================
  // ACTUALIZACIÓN
  // ============================================================

  async actualizarMatricula(
    matriculaId: number,
    data: MatriculaUpdate
  ): Promise<MatriculacionResponse> {
    const { data: response } = await api.put(`/matriculacion/${matriculaId}`, data);
    return response;
  }

  /**
   * PATCH /api/matriculacion/:id/transferir
   */
  async transferirParalelo(
    matriculaId: number,
    data: TransferenciaParalelo
  ): Promise<MatriculacionResponse> {
    const { data: response } = await api.patch(
      `/matriculacion/${matriculaId}/transferir`,
      data
    );
    return response;
  }

  /**
   * PATCH /api/matriculacion/:id/retirar
   */
  async retirarMatricula(
    matriculaId: number,
    data: RetiroMatricula
  ): Promise<MatriculacionResponse> {
    const { data: response } = await api.patch(
      `/matriculacion/${matriculaId}/retirar`,
      data
    );
    return response;
  }

  /**
   * PATCH /api/matriculacion/:id/estado
   */
  async cambiarEstado(
    matriculaId: number,
    data: CambioEstado
  ): Promise<MatriculacionResponse> {
    const { data: response } = await api.patch(
      `/matriculacion/${matriculaId}/estado`,
      data
    );
    return response;
  }

  /**
   * PATCH /api/matriculacion/documentos/:doc_id/verificar
   */
  async verificarDocumento(docId: number): Promise<MatriculaDocumento> {
    const { data } = await api.patch(`/matriculacion/documentos/${docId}/verificar`);
    return data.data.documento;
  }

  // ============================================================
  // ELIMINACIÓN
  // ============================================================

  /**
   * DELETE /api/matriculacion/documentos/:doc_id
   */
  async eliminarDocumento(docId: number): Promise<void> {
    await api.delete(`/matriculacion/documentos/${docId}`);
  }

  /**
   * DELETE /api/matriculacion/:id
   */
  async eliminarMatricula(matriculaId: number): Promise<void> {
    await api.delete(`/matriculacion/${matriculaId}`);
  }

  // ============================================================
  // PDF
  // ============================================================

  async descargarPDF(matriculaId: number): Promise<void> {
    const response = await api.get(`/matricula/${matriculaId}/pdf`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let filename = `Matricula_${matriculaId}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/i);
      if (match?.[1]) filename = match[1];
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  verPDFPreview(matriculaId: number): void {
    this.abrirPDFEnNuevaPestaña(matriculaId);
  }

  async abrirPDFEnNuevaPestaña(matriculaId: number): Promise<void> {
    const response = await api.get(`/matricula/${matriculaId}/pdf/preview`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (!newWindow) throw new Error('Permite ventanas emergentes para ver el PDF');
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  }
}

export default new MatriculacionService();