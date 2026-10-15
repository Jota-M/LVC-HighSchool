// services/preinscripcionService.ts
import api from '@/lib/api';
import {
  PreInscripcionDTO,
  PreInscripcionResponse,
  PreInscripcionesResponse,
  PreInscripcionDetalle,
  PreInscripcionFilters,
  CambiarEstadoRequest,
  ConvertirEstudianteRequest,
  ConvertirEstudianteResponse,
  BuscarPadreResponse,
  VerificarDisponibilidadResponse,
  ExportarRequest,
  EstadoPreinscripcion,
  Preinscripcion,
} from '@/types/preinscripcionTypes';

/**
 * Mapea la respuesta del backend al formato del dashboard
 */
const mapPreinscripcion = (p: any): Preinscripcion => ({
  id: p.id,
  codigo_inscripcion: p.codigo_inscripcion,
  estado: p.estado,
  
  // Info de cupos
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
  fecha_inicio: p.fecha_inicio || p.created_at,
  fecha_limite: p.fecha_limite || null,
  created_at: p.created_at,
  updated_at: p.updated_at || p.created_at,
  deleted_at: p.deleted_at || null,
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

export const preinscripcionService = {
  /**
   * Crear una nueva preinscripción
   */
  async crear(
    data: PreInscripcionDTO,
    archivos: {
      foto_estudiante?: File;
      cedula_estudiante?: File;
      certificado_nacimiento?: File;
      libreta_notas?: File;
      cedula_representante?: File;
    } = {}
  ): Promise<PreInscripcionResponse> {
    try {
      const formData = new FormData();
      
      formData.append('estudiante', JSON.stringify(data.estudiante));
      formData.append('representante', JSON.stringify(data.representante));
      
      if (data.preinscripcion_info) {
        formData.append('preinscripcion_info', JSON.stringify(data.preinscripcion_info));
      }
      
      if (archivos.foto_estudiante) {
        formData.append('foto_estudiante', archivos.foto_estudiante);
      }
      if (archivos.cedula_estudiante) {
        formData.append('cedula_estudiante', archivos.cedula_estudiante);
      }
      if (archivos.certificado_nacimiento) {
        formData.append('certificado_nacimiento', archivos.certificado_nacimiento);
      }
      if (archivos.libreta_notas) {
        formData.append('libreta_notas', archivos.libreta_notas);
      }
      if (archivos.cedula_representante) {
        formData.append('cedula_representante', archivos.cedula_representante);
      }

      const response = await api.post<PreInscripcionResponse>(
        '/preinscripcion',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error en preinscripcionService.crear:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear la preinscripción'
      );
    }
  },

  /**
   * Crear preinscripción familiar múltiple (JSON limpio, multi-estudiante y multi-tutor)
   */
  async crearMultiple(data: {
    periodo_academico_id?: number | null;
    estudiantes: any[];
    tutores: any[];
    relaciones?: any[];
  }): Promise<{ success: boolean; message: string; data: { preinscripciones: any[]; total_creadas: number } }> {
    try {
      const response = await api.post('/preinscripcion/multiple', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en preinscripcionService.crearMultiple:', error);
      throw new Error(
        error.response?.data?.message || 'Error al procesar la preinscripción familiar'
      );
    }
  },

  /**
   * Buscar padre por CI
   */
  async buscarPadrePorCI(ci: string): Promise<BuscarPadreResponse> {
    try {
      const response = await api.get<BuscarPadreResponse>(
        `/preinscripcion/buscar-padre/${ci}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al buscar padre'
      );
    }
  },

  /**
   * Verificar disponibilidad de cupos
   */
  async verificarDisponibilidad(
    grado_id: number,
    turno_id: number,
    periodo_academico_id: number
  ): Promise<VerificarDisponibilidadResponse> {
    try {
      const params = new URLSearchParams({
        grado_id: grado_id.toString(),
        turno_id: turno_id.toString(),
        periodo_academico_id: periodo_academico_id.toString(),
      });

      const response = await api.get<VerificarDisponibilidadResponse>(
        `/cupos/disponibilidad?${params}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al verificar disponibilidad'
      );
    }
  },

  /**
   * Listar preinscripciones con filtros (compatibilidad genérica)
   */
  async listar(filters: PreInscripcionFilters = {}): Promise<PreInscripcionesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.estado || filters.estadoFilter) params.append('estado', (filters.estado || filters.estadoFilter)!);
      if (filters.grado || filters.gradoFilter) params.append('grado', (filters.grado || filters.gradoFilter)!);
      if (filters.turno || filters.turnoFilter) params.append('turno', (filters.turno || filters.turnoFilter)!);
      if (filters.periodo || filters.periodoFilter) params.append('periodo', (filters.periodo || filters.periodoFilter)!);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search || filters.searchTerm) params.append('search', (filters.search || filters.searchTerm)!);

      const response = await api.get<PreInscripcionesResponse>(
        `/preinscripcion?${params}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al listar preinscripciones'
      );
    }
  },

  /**
   * Listar todas las preinscripciones para Dashboard Admin con mapeo
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
  },

  /**
   * Obtener preinscripción por ID con detalles completos
   */
  async obtenerPorId(id: number): Promise<PreInscripcionDetalle> {
    try {
      const response = await api.get(`/preinscripcion/${id}`);
      return response.data.data?.preinscripcion || response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener preinscripción'
      );
    }
  },

  /**
   * Alias de obtenerPorId para dashboard
   */
  async obtenerPreinscripcion(id: number): Promise<any> {
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
  },

  /**
   * Cambiar estado de preinscripción
   */
  async cambiarEstado(
    id: number,
    data: CambiarEstadoRequest
  ): Promise<any> {
    try {
      const response = await api.patch(
        `/preinscripcion/${id}/estado`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al cambiar estado'
      );
    }
  },

  /**
   * Reenviar notificación de WhatsApp (ADMIN)
   */
  async reenviarWhatsApp(id: number, observaciones?: string): Promise<any> {
    try {
      const response = await api.post(`/preinscripcion/${id}/reenviar-whatsapp`, {
        observaciones,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al reenviar mensaje de WhatsApp'
      );
    }
  },

  /**
   * Promover estudiante de Lista de Espera a Cupo Directo (ADMIN)
   */
  async promoverDeListaEspera(id: number, motivo?: string): Promise<any> {
    try {
      const response = await api.post(`/preinscripcion/${id}/promover-espera`, { motivo });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al promover de lista de espera'
      );
    }
  },

  /**
   * Convertir preinscripción a estudiante oficial
   */
  async convertirAEstudiante(
    id: number,
    data: ConvertirEstudianteRequest
  ): Promise<ConvertirEstudianteResponse> {
    try {
      const response = await api.post<ConvertirEstudianteResponse>(
        `/preinscripcion/${id}/convertir`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al convertir preinscripción'
      );
    }
  },

  /**
   * Eliminar preinscripción (libera cupo automáticamente)
   */
  async eliminar(id: number): Promise<void> {
    try {
      await api.delete(`/preinscripcion/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al eliminar preinscripción'
      );
    }
  },

  /**
   * Alias de eliminar para el dashboard
   */
  async eliminarPreinscripcion(id: number): Promise<any> {
    return this.eliminar(id);
  },

  /**
   * Buscar preinscripción por código (PÚBLICO)
   */
  async buscarPorCodigo(codigo: string): Promise<PreInscripcionDetalle> {
    try {
      const response = await api.get(`/preinscripcion/buscar/${codigo}`);
      return response.data.data?.preinscripcion || response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al buscar preinscripción'
      );
    }
  },

  /**
   * Actualizar datos del estudiante (PÚBLICO)
   */
  async actualizarDatosEstudiante(
    preinscripcionId: number,
    datos: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno?: string;
      ci?: string;
      rude?: string;
      fecha_nacimiento?: string;
      lugar_nacimiento?: string;
      genero?: string;
      direccion?: string;
      zona?: string;
      ciudad?: string;
      telefono?: string;
      email?: string;
      contacto_emergencia?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.put(
        `/preinscripcion/${preinscripcionId}/estudiante`,
        datos
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar datos del estudiante'
      );
    }
  },

  /**
   * Actualizar datos del tutor (PÚBLICO)
   */
  async actualizarDatosTutor(
    preinscripcionId: number,
    datos: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno?: string;
      ci: string;
      parentesco?: string;
      telefono: string;
      celular?: string;
      email?: string;
      direccion?: string;
      ocupacion?: string;
      lugar_trabajo?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.put(
        `/preinscripcion/${preinscripcionId}/tutor`,
        datos
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar datos del tutor'
      );
    }
  },

  /**
   * Re-subir documento observado (PÚBLICO)
   */
  async resubirDocumento(
    preinscripcionId: number,
    tipoDocumento: string,
    archivo: File
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append(tipoDocumento, archivo);

      const response = await api.put(
        `/preinscripcion/${preinscripcionId}/documento/${tipoDocumento}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al subir documento'
      );
    }
  },

  /**
   * Marcar documento como observado (ADMIN)
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
      const response = await api.patch(
        `/preinscripcion/documento/${documentoId}/observar`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al marcar documento'
      );
    }
  },

  /**
   * Obtener estadísticas
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
  },

  /**
   * Exportar a Excel
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
  },

  /**
   * Exportar a PDF
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
  },

  /**
   * Utilidades de validación
   */
  puedeEditar(estado?: EstadoPreinscripcion): boolean {
    const estadosEditables: EstadoPreinscripcion[] = [
      'iniciada', 
      'datos_completos', 
      'documentos_pendientes',
      'rechazada',
    ];
    return estado ? estadosEditables.includes(estado) : false;
  },

  puedeEliminar(estado?: EstadoPreinscripcion): boolean {
    const estadosEliminables: EstadoPreinscripcion[] = [
      'iniciada', 
      'rechazada',
      'cancelada',
    ];
    return estado ? estadosEliminables.includes(estado) : false;
  },

  puedeAprobar(estado?: EstadoPreinscripcion): boolean {
    const estadosAprobables: EstadoPreinscripcion[] = [
      'en_revision',
      'documentos_aprobados',
      'entrevista_completada',
    ];
    return estado ? estadosAprobables.includes(estado) : false;
  },

  puedeConvertir(estado?: EstadoPreinscripcion): boolean {
    return estado === 'aprobada';
  }
};

export default preinscripcionService;