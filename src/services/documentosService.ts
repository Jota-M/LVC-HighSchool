// services/documentosService.ts
import api from '@/lib/api';
import {
  DocumentosResponse,
  DocumentoResponse,
  DocumentoUpload,
  DocumentoVerificar,
  Documento,
} from '@/types/documentosTypes';

class DocumentosService {
  /**
   * Obtener todos los documentos de una matrícula
   */
  async obtenerDocumentosPorMatricula(matriculaId: number): Promise<Documento[]> {
    const { data } = await api.get<DocumentosResponse>(
      `/matricula/${matriculaId}/documentos`
    );
    return data.data.documentos;
  }

  /**
   * Subir un nuevo documento
   */
  async subirDocumento(
    matriculaId: number,
    documento: DocumentoUpload
  ): Promise<Documento> {
    const formData = new FormData();
    formData.append('documento', documento.archivo);
    formData.append('tipo_documento', documento.tipo_documento);

    const { data } = await api.post<DocumentoResponse>(
      `/matricula/${matriculaId}/documentos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.data.documento;
  }

  /**
   * Verificar un documento
   */
  async verificarDocumento(
    matriculaId: number,
    documentoId: number,
    datos?: DocumentoVerificar
  ): Promise<Documento> {
    const { data } = await api.patch<DocumentoResponse>(
      `/matricula/${matriculaId}/documentos/${documentoId}/verificar`,
      datos || { verificado: true }
    );

    return data.data.documento;
  }

  /**
   * Eliminar un documento
   */
  async eliminarDocumento(
    matriculaId: number,
    documentoId: number
  ): Promise<void> {
    await api.delete(`/matricula/${matriculaId}/documentos/${documentoId}`);
  }

  /**
   * Obtener URL para ver documento
   */
  getUrlDocumento(url: string): string {
    return url;
  }

  /**
   * Descargar documento
   */
  async descargarDocumento(url: string, nombreArchivo: string): Promise<void> {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      throw error;
    }
  }
}

export default new DocumentosService();