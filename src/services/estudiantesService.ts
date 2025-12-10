// services/estudiantesService.ts
import api from '@/lib/api';
import {
  Estudiante,
  EstudianteCreate,
  EstudianteUpdate,
  EstudianteFilters,
  EstudiantesResponse,
  EstudianteStats,
  RegistroCompleto,
  RegistroCompletoResponse,
  PeriodoAcademico,
  Grado,
  Paralelo,
  CapacidadParalelo,
  Tutor,
} from '@/types/estudianteTypes';

// =============================================
// ESTUDIANTES - CRUD BÁSICO
// =============================================

export const estudiantesService = {
  // Listar estudiantes con filtros y paginación
  async listar(filters: EstudianteFilters = {}): Promise<EstudiantesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.genero) params.append('genero', filters.genero);
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.paralelo_id) params.append('paralelo_id', filters.paralelo_id.toString());

    const response = await api.get(`/estudiante?${params}`);
    return response.data.data;
  },

  // Obtener estudiante por ID
  async obtenerPorId(id: number): Promise<Estudiante> {
    const response = await api.get(`/estudiante/${id}`);
    return response.data.data.estudiante;
  },

  // Crear estudiante simple
  async crear(data: EstudianteCreate, foto?: File): Promise<Estudiante> {
    const formData = new FormData();

    if (foto) {
      formData.append('foto', foto);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post('/estudiante', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.estudiante;
  },

  // Actualizar estudiante
  async actualizar(id: number, data: EstudianteUpdate, foto?: File): Promise<Estudiante> {
    const formData = new FormData();

    if (foto) {
      formData.append('foto', foto);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put(`/estudiante/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.estudiante;
  },

  // Eliminar estudiante
  async eliminar(id: number): Promise<void> {
    await api.delete(`/estudiante/${id}`);
  },

  // Eliminar solo la foto
  async eliminarFoto(id: number): Promise<void> {
    await api.delete(`/estudiante/${id}/foto`);
  },

  // Obtener estadísticas
  async obtenerEstadisticas(): Promise<EstudianteStats> {
    const response = await api.get('/estudiante/estadisticas');
    return response.data.data;
  },
};

// =============================================
// REGISTRO COMPLETO
// =============================================

export const registroCompletoService = {
  async registrar(data: RegistroCompleto): Promise<RegistroCompletoResponse> {
    const formData = new FormData();

    // 1. FOTO DEL ESTUDIANTE
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    // 2. DOCUMENTOS (archivos)
    const documentosMetadata: any[] = [];
    
    if (data.documentos_archivos) {
      data.documentos_archivos.forEach((archivo) => {
        formData.append('documentos', archivo.file);
        documentosMetadata.push({
          tipo_documento: archivo.tipo_documento,
          observaciones: archivo.observaciones || null,
        });
      });
    }

    // 3. DATOS DEL ESTUDIANTE (JSON string)
    formData.append('estudiante', JSON.stringify(data.estudiante));

    // 4. TUTORES (JSON string)
    formData.append('tutores', JSON.stringify(data.tutores));

    // 5. MATRÍCULA (JSON string, solo si está incluida)
    if (data.matricula) {
      formData.append('matricula', JSON.stringify(data.matricula));
    }

    // 6. METADATA DE DOCUMENTOS (JSON string)
    if (documentosMetadata.length > 0) {
      formData.append('documentos', JSON.stringify(documentosMetadata));
    }

    // 7. FLAGS DE USUARIOS
    formData.append('crear_usuario_estudiante', String(data.crear_usuario_estudiante));
    formData.append('crear_usuarios_tutores', String(data.crear_usuarios_tutores));

    // 8. CREDENCIALES (JSON strings)
    if (data.credenciales_estudiante) {
      formData.append('credenciales_estudiante', JSON.stringify(data.credenciales_estudiante));
    }

    if (data.credenciales_tutores) {
      formData.append('credenciales_tutores', JSON.stringify(data.credenciales_tutores));
    }

    const response = await api.post('/registro-completo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

// =============================================
// TUTORES
// =============================================

export const tutoresService = {
  async obtenerPorEstudiante(estudianteId: number): Promise<Tutor[]> {
    const response = await api.get(`/estudiante/${estudianteId}/tutores`);
    return response.data.data.tutores;
  },

  async asignar(estudianteId: number, data: any): Promise<void> {
    await api.post(`/estudiante/${estudianteId}/tutores`, data);
  },

  async actualizar(estudianteId: number, relacionId: number, data: any): Promise<void> {
    await api.put(`/estudiante/${estudianteId}/tutores/${relacionId}`, data);
  },

  async remover(estudianteId: number, relacionId: number): Promise<void> {
    await api.delete(`/estudiante/${estudianteId}/tutores/${relacionId}`);
  },
};

// =============================================
// GESTIÓN ACADÉMICA (para selectores dinámicos)
// =============================================

export const gestionAcademicaService = {
  // Obtener periodos académicos activos
  async obtenerPeriodos(): Promise<PeriodoAcademico[]> {
    try {
      const response = await api.get('/periodo-academico', {
        params: { activo: true }
      });

      console.log('📦 Respuesta completa de periodos:', response.data);

      // ✅ Estructura: { data: { periodos: [...] } }
      if (response.data.data?.periodos) {
        return response.data.data.periodos;
      }
      
      // Fallback: { data: [...] }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback: { periodos: [...] }
      if (response.data.periodos) {
        return response.data.periodos;
      }
      
      // Fallback: [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de respuesta no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener periodos:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener periodos');
    }
  },

  // Obtener periodo activo
  async obtenerPeriodoActivo(): Promise<PeriodoAcademico | null> {
    try {
      const response = await api.get('/periodo-academico/activo');
      
      console.log('📦 Respuesta periodo activo:', response.data);

      // ✅ Estructura: { data: { periodo: {...} } }
      if (response.data.data?.periodo) {
        return response.data.data.periodo;
      }

      // Fallback: { data: {...} }
      if (response.data.data) {
        return response.data.data;
      }
      
      return response.data || null;
    } catch (error: any) {
      console.warn('⚠️ No hay periodo activo:', error.response?.data?.message);
      return null;
    }
  },

  // ✅ CORREGIDO: Obtener grados
  async obtenerGrados(nivelId?: number): Promise<Grado[]> {
    try {
      const params: any = { activo: true };
      if (nivelId) params.nivel_academico_id = nivelId;

      const response = await api.get('/grado', { params });

      console.log('📦 Respuesta grados:', response.data);

      // ✅ Estructura: { data: { grados: [...] } }
      if (response.data.data?.grados) {
        return response.data.data.grados;
      }

      // Fallback: { data: [...] }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback: { grados: [...] }
      if (response.data.grados) {
        return response.data.grados;
      }

      // Fallback: [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de grados no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grados:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener grados');
    }
  },

  // ✅ CORREGIDO: Obtener paralelos
  async obtenerParalelos(gradoId: number, anio?: number): Promise<Paralelo[]> {
    try {
      const params: any = { 
        grado_id: gradoId, 
        activo: true 
      };
      if (anio) params.anio = anio;

      const response = await api.get('/paralelo', { params });

      console.log('📦 Respuesta paralelos:', response.data);

      // ✅ Estructura: { data: { paralelos: [...] } }
      if (response.data.data?.paralelos) {
        return response.data.data.paralelos;
      }

      // Fallback: { data: [...] }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback: { paralelos: [...] }
      if (response.data.paralelos) {
        return response.data.paralelos;
      }

      // Fallback: [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de paralelos no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener paralelos:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener paralelos');
    }
  },

  // Verificar capacidad
  async verificarCapacidad(paraleloId: number, periodoId: number): Promise<CapacidadParalelo | null> {
    try {
      const response = await api.get('/matricula/capacidad', {
        params: {
          paralelo_id: paraleloId,
          periodo_id: periodoId,
        },
      });

      // Manejar diferentes estructuras
      if (response.data.data?.capacidad) {
        return response.data.data.capacidad;
      }

      return response.data.data || response.data || null;
    } catch (error: any) {
      console.error('❌ Error al verificar capacidad:', error.response?.data || error);
      return null;
    }
  },
};

// =============================================
// EXPORTAR TODOS LOS SERVICIOS
// =============================================

export default {
  ...estudiantesService,
  registroCompleto: registroCompletoService,
  tutores: tutoresService,
  gestionAcademica: gestionAcademicaService,
};