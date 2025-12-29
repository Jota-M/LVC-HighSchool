// src/app/dashboard/preinscripciones/services/preinscripcionService.ts

import api from '@/lib/api';
import { 
  Preinscripcion, 
  PreinscripcionDetalle,
  EstadoPreinscripcion,
  CambiarEstadoRequest,
  ConvertirEstudianteRequest,
  ExportarRequest,
} from '../types/preinscripcioonTypes';

/**
 * Mapea la respuesta del backend al formato del dashboard
 */
const mapPreinscripcion = (p: any): Preinscripcion => ({
  id: p.id,
  codigo_inscripcion: p.codigo_inscripcion,
  estado: p.estado,
  
  // 🆕 Info de cupos
  periodo_academico_id: p.periodo_academico_id,
  nivel_academico_id: p.nivel_academico_id,
  grado_id: p.grado_id,
  turno_preferido_id: p.turno_preferido_id,
  cupo_preinscripcion_id: p.cupo_preinscripcion_id,
  tiene_cupo_asignado: p.tiene_cupo_asignado || false,
  
  // Estudiante
  estudiante_nombre: p.estudiante_nombre || 'Sin nombre',
  estudiante_ci: p.estudiante_ci || p.ci || 'Sin CI',
  estudiante_foto: p.estudiante_foto || p.foto_url,
  grado_solicitado: p.grado_solicitado || '',
  
  // Tutor
  tutor_nombre: p.tutor_nombre || 'Sin nombre',
  tutor_telefono: p.tutor_telefono || 'Sin teléfono',
  
  // Joins
  grado_nombre: p.grado_nombre,
  turno_nombre: p.turno_nombre,
  periodo_nombre: p.periodo_nombre,
  cupos_disponibles: p.cupos_disponibles,
  
  // Fechas
  created_at: p.created_at,
  fecha_aprobacion: p.fecha_aprobacion,
  fecha_conversion: p.fecha_conversion,
  
  // Metadatos
  observaciones: p.observaciones,
  motivo_rechazo: p.motivo_rechazo,
  aprobada_por: p.aprobada_por,
  convertida_por: p.convertida_por,
  estudiante_id: p.estudiante_id,
  matricula_id: p.matricula_id,
});

/**
 * Servicio para gestionar preinscripciones (Dashboard Admin)
 */
class PreinscripcionService {
  
  /**
   * ✅ Listar todas las preinscripciones con filtros
   */
  async listarPreinscripciones(params?: { 
    estado?: string; 
    grado?: string;
    turno?: string;
    periodo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const { data } = await api.get('/preinscripcion', { params });
      
      const preinscripciones = data.data?.preinscripciones?.map(mapPreinscripcion) || [];
      
      return {
        ...data,
        data: {
          preinscripciones,
          paginacion: data.data?.paginacion || {
            total: preinscripciones.length,
            page: 1,
            limit: 50,
            totalPages: 1,
          }
        }
      };
    } catch (error: any) {
      console.error('❌ Error al listar preinscripciones:', error);
      throw new Error(error.response?.data?.message || 'Error al listar preinscripciones');
    }
  }

  /**
   * ✅ Obtener preinscripción por ID con detalles completos
   */
  async obtenerPreinscripcion(id: number): Promise<PreinscripcionDetalle> {
    try {
      const { data } = await api.get(`/preinscripcion/${id}`);
      
      const preinscripcion = data.data?.preinscripcion || data.data;
      
      return {
        ...mapPreinscripcion(preinscripcion),
        estudiante: preinscripcion.estudiante,
        tutor: preinscripcion.tutor,
        documentos: preinscripcion.documentos || [],
        cupo: preinscripcion.cupo,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preinscripción');
    }
  }

  /**
   * ✅ Cambiar estado de preinscripción
   */
  async cambiarEstado(
    id: number, 
    data: CambiarEstadoRequest
  ): Promise<any> {
    try {
      const response = await api.patch(`/preinscripcion/${id}/estado`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado');
    }
  }

  /**
   * ✅ Convertir preinscripción a estudiante oficial
   */
  async convertirAEstudiante(
    id: number,
    data: ConvertirEstudianteRequest
  ): Promise<any> {
    try {
      const response = await api.post(`/preinscripcion/${id}/convertir`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al convertir preinscripción');
    }
  }

  /**
   * ✅ Eliminar preinscripción (libera cupo automáticamente)
   */
  async eliminarPreinscripcion(id: number): Promise<any> {
    try {
      const { data } = await api.delete(`/preinscripcion/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar preinscripción');
    }
  }

  /**
   * 🆕 Marcar documento como observado
   */
  async marcarDocumentoObservado(
    documentoId: number,
    data: {
      requiere_correccion: boolean;
      motivo_correccion?: string;
      observaciones?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.patch(`/preinscripcion/documento/${documentoId}/observar`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar documento');
    }
  }

  /**
   * ✅ Obtener estadísticas (incluye stats de cupos)
   */
  async obtenerEstadisticas(params?: { 
    periodo?: string; 
    grado?: string;
  }): Promise<any> {
    try {
      const { data } = await api.get('/preinscripcion/estadisticas', { params });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  /**
   * ✅ Exportar a Excel
   */
  async exportarExcel(params: ExportarRequest): Promise<Blob> {
    try {
      const { data } = await api.get('/preinscripcion/export/excel', {
        params,
        responseType: 'blob'
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar');
    }
  }

  /**
   * 🆕 Exportar a PDF
   */
  async exportarPDF(params: ExportarRequest): Promise<Blob> {
    try {
      const { data } = await api.get('/preinscripcion/export/pdf', {
        params,
        responseType: 'blob'
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar PDF');
    }
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Valida si se puede editar una preinscripción
   */
  puedeEditar(estado?: EstadoPreinscripcion): boolean {
    const estadosEditables: EstadoPreinscripcion[] = [
      'iniciada', 
      'datos_completos', 
      'documentos_pendientes',
      'rechazada',
    ];
    return estado ? estadosEditables.includes(estado) : false;
  }

  /**
   * Valida si se puede eliminar una preinscripción
   */
  puedeEliminar(estado?: EstadoPreinscripcion): boolean {
    const estadosEliminables: EstadoPreinscripcion[] = [
      'iniciada', 
      'rechazada',
      'cancelada',
    ];
    return estado ? estadosEliminables.includes(estado) : false;
  }

  /**
   * Valida si se puede aprobar una preinscripción
   */
  puedeAprobar(estado?: EstadoPreinscripcion): boolean {
    const estadosAprobables: EstadoPreinscripcion[] = [
      'en_revision',
      'documentos_aprobados',
      'entrevista_completada',
    ];
    return estado ? estadosAprobables.includes(estado) : false;
  }

  /**
   * Valida si se puede convertir una preinscripción
   */
  puedeConvertir(estado?: EstadoPreinscripcion): boolean {
    return estado === 'aprobada';
  }
}

export default new PreinscripcionService();