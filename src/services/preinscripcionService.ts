// services/preinscripcion.service.ts
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
  PreInscripcionMultipleResponse,
} from '@/types/preinscripcionTypes';

export const preinscripcionService = {
  /**
   * Crear una nueva preinscripción (simple)
   */
  async crear(
data: PreInscripcionDTO, p0: { estudiante: { rude: string; fecha_nacimiento: string; nombres: string; apellido_paterno: string; apellido_materno: string; ci: string; lugar_nacimiento: string; genero: string; direccion: string; zona: string; ciudad: string; telefono: string; email: string; contacto_emergencia: string; tiene_discapacidad: boolean; tipo_discapacidad: string; institucion_procedencia: string; ultimo_grado_cursado: string; grado_solicitado: string; repite_grado: boolean; turno_solicitado: string; }; representante: { fecha_nacimiento: string | null; otro_parentesco: string; tipo_representante: string; nombres: string; apellido_paterno: string; apellido_materno: string; ci: string; genero: string; parentesco: string; telefono: string; celular: string; email: string; direccion: string; ocupacion: string; lugar_trabajo: string; telefono_trabajo: string; estado_civil: string; nivel_educacion: string; vive_con_estudiante: boolean; es_tutor_principal: boolean; }; preinscripcion_info: { periodo_academico_id: number; grado_id: number; turno_id: number; }; }, archivos: {
  foto_estudiante?: File;
  cedula_estudiante?: File;
  certificado_nacimiento?: File;
  libreta_notas?: File;
  cedula_representante?: File;
}  ): Promise<PreInscripcionResponse> {
    try {
      const formData = new FormData();
      
      formData.append('estudiante', JSON.stringify(data.estudiante));
      formData.append('representante', JSON.stringify(data.representante));
      
      // 🆕 Info de preinscripción (cupos)
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
   * 🆕 Buscar padre por CI
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
   * 🆕 Verificar disponibilidad de cupos
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
   * Listar preinscripciones con filtros
   */
  async listar(filters: PreInscripcionFilters = {}): Promise<PreInscripcionesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);

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
   * Obtener preinscripción por ID
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
   * Cambiar estado de preinscripción
   */
  async cambiarEstado(
    id: number,
    data: CambiarEstadoRequest
  ): Promise<PreInscripcionResponse> {
    try {
      const response = await api.patch<PreInscripcionResponse>(
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
   * Eliminar preinscripción
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
      rude?: string; // 🆕
      fecha_nacimiento?: string;
      lugar_nacimiento?: string;
      genero?: string;
      direccion?: string;
      zona?: string;
      ciudad?: string;
      telefono?: string;
      email?: string;
      contacto_emergencia?: string;
      // telefono_emergencia eliminado ❌
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
};

export default preinscripcionService;