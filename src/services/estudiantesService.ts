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
  NivelAcademico,
  PadreEncontrado,
} from '@/types/estudianteTypes';

// =============================================
// ESTUDIANTES - CRUD BÁSICO
// =============================================

export const estudiantesService = {
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

  async obtenerPorId(id: number): Promise<Estudiante> {
    const response = await api.get(`/estudiante/${id}`);
    return response.data.data.estudiante;
  },

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

  async eliminar(id: number): Promise<void> {
    await api.delete(`/estudiante/${id}`);
  },

  async eliminarFoto(id: number): Promise<void> {
    await api.delete(`/estudiante/${id}/foto`);
  },

  async obtenerEstadisticas(): Promise<EstudianteStats> {
    const response = await api.get('/estudiante/estadisticas');
    return response.data.data;
  },
};

// =============================================
// REGISTRO COMPLETO (3 MODOS)
// =============================================

export const registroCompletoService = {
  /**
   * 🔍 Buscar padre/tutor por CI
   */
  async buscarPadrePorCI(ci: string): Promise<{ 
    success: boolean; 
    message: string; 
    data: { 
      encontrado: boolean; 
      padre: PadreEncontrado | null 
    } 
  }> {
    try {
      const response = await api.get(`/registro-completo/buscar-padre/${ci}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar padre/tutor');
    }
  },

  /**
   * 📝 Registrar estudiante(s) según modo
   * 
   * MODO 1 (nuevo): nuevo tutor + 1 estudiante
   * MODO 2 (existente): tutor existente + 1 estudiante  
   * MODO 3 (multiple): nuevo tutor + varios estudiantes (máx 5)
   */
  async registrar(data: RegistroCompleto): Promise<RegistroCompletoResponse> {
  const formData = new FormData();

  console.log('📤 Preparando datos para enviar:', data);

  // ========================================
  // 1. MODO
  // ========================================
  formData.append('modo', data.modo);

  // ========================================
  // 2. FLAGS DE USUARIOS
  // ========================================
  formData.append('crear_usuario_estudiante', String(data.crear_usuario_estudiante));
  formData.append('crear_usuarios_tutores', String(data.crear_usuarios_tutores));

  // ========================================
  // 3. DATOS SEGÚN MODO
  // ========================================

  if (data.modo === 'nuevo') {
    // MODO 1: Nuevo tutor + 1 estudiante
    formData.append('estudiante', JSON.stringify(data.estudiante));
    if (data.foto) formData.append('foto', data.foto);
    formData.append('tutores', JSON.stringify(data.tutores));

    // 🔧 FIX: Credenciales (backend espera "credenciales_estudiantes" plural)
    if (data.credenciales_estudiante) {
      formData.append('credenciales_estudiantes', JSON.stringify(data.credenciales_estudiante));
    }
    if (data.credenciales_tutores && data.credenciales_tutores.length > 0) {
      formData.append('credenciales_tutores', JSON.stringify(data.credenciales_tutores));
    }

    // 🔧 FIX: Matrícula (backend espera "matriculas" plural)
    if (data.matricula) {
      formData.append('matriculas', JSON.stringify(data.matricula));
      console.log('📋 Matrícula incluida (modo nuevo):', data.matricula);
    }

    console.log('✅ MODO NUEVO preparado');
  } 
  
  else if (data.modo === 'existente') {
    // MODO 2: Tutor existente + 1 estudiante
    formData.append('estudiante', JSON.stringify(data.estudiante));
    if (data.foto) formData.append('foto', data.foto);
    formData.append('padre_existente_id', data.padre_existente_id.toString());

    // 🔧 FIX: Credenciales (backend espera "credenciales_estudiantes" plural)
    if (data.credenciales_estudiante) {
      formData.append('credenciales_estudiantes', JSON.stringify(data.credenciales_estudiante));
    }

    // 🔧 FIX: Matrícula (backend espera "matriculas" plural)
    if (data.matricula) {
      formData.append('matriculas', JSON.stringify(data.matricula));
      console.log('📋 Matrícula incluida (modo existente):', data.matricula);
    }

    console.log('✅ MODO EXISTENTE preparado - Padre ID:', data.padre_existente_id);
  } 
  
  else if (data.modo === 'multiple') {
    // MODO 3: Nuevo tutor + varios estudiantes
    formData.append('estudiantes', JSON.stringify(data.estudiantes));
    formData.append('tutores', JSON.stringify(data.tutores));

    // Fotos múltiples: foto_0, foto_1, foto_2...
    if (data.fotos) {
      data.fotos.forEach((foto, index) => {
        if (foto) {
          formData.append(`foto_${index}`, foto);
          console.log(`📷 Agregando foto_${index}`);
        }
      });
    }

    // Matrículas múltiples (opcional)
    if (data.matriculas && data.matriculas.length > 0) {
      formData.append('matriculas', JSON.stringify(data.matriculas));
      console.log('📋 Matrículas incluidas (modo múltiple):', data.matriculas.length);
    }

    // Credenciales múltiples estudiantes (opcional)
    if (data.credenciales_estudiantes && data.credenciales_estudiantes.length > 0) {
      formData.append('credenciales_estudiantes', JSON.stringify(data.credenciales_estudiantes));
    }

    // Credenciales tutores
    if (data.credenciales_tutores && data.credenciales_tutores.length > 0) {
      formData.append('credenciales_tutores', JSON.stringify(data.credenciales_tutores));
    }

    console.log('✅ MODO MULTIPLE preparado - Estudiantes:', data.estudiantes.length);
  }

  // ========================================
  // 4. DOCUMENTOS (común para todos)
  // ========================================
  if (data.documentos_archivos && data.documentos_archivos.length > 0) {
    const documentosMetadata: any[] = [];
    
    data.documentos_archivos.forEach((archivo) => {
      formData.append('documentos', archivo.file);
      documentosMetadata.push({
        tipo_documento: archivo.tipo_documento,
        observaciones: archivo.observaciones || null,
        estudiante_index: archivo.estudiante_index, // 🆕 Para modo múltiple
      });
    });
    
    formData.append('documentos_metadata', JSON.stringify(documentosMetadata));
    console.log('📄 Documentos incluidos:', data.documentos_archivos.length);
  }

  // ========================================
  // 5. DEBUG: Mostrar todo lo que se envía
  // ========================================
  console.log('📦 Contenido del FormData:');
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: [File] ${value.name} (${(value.size / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  // ========================================
  // 6. ENVIAR PETICIÓN
  // ========================================
  try {
    const response = await api.post('/registro-completo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('✅ Respuesta exitosa:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al registrar:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Error al registrar');
  }
}
};

// =============================================
// TUTORES
// =============================================

export const tutoresService = {
  async obtenerPorEstudiante(estudianteId: number) {
    const response = await api.get(`/estudiante/${estudianteId}/tutores`);
    return response.data.data.tutores;
  },

  async buscarPorCI(ci: string) {
    const response = await api.get(`/registro-completo/buscar-padre/${ci}`);
    return response.data.data;
  },

  async crearPadreFamilia(data: any) {
    const response = await api.post('/padre-familia', data);
    return response.data.data.tutor;
  },

  async asignar(estudianteId: number, payload: any) {
    const response = await api.post(`/estudiante/${estudianteId}/tutores`, payload);
    return response.data.data.relacion;
  },

  async actualizarPadreFamilia(padreId: number, data: any) {
    const response = await api.put(`/padre-familia/${padreId}`, data);
    return response.data.data.tutor;
  },

  async actualizarRelacion(estudianteId: number, relacionId: number, data: any) {
    const response = await api.put(`/estudiante/${estudianteId}/tutores/${relacionId}`, data);
    return response.data.data.relacion;
  },

  async remover(estudianteId: number, relacionId: number) {
    await api.delete(`/estudiante/${estudianteId}/tutores/${relacionId}`);
  },
};

// =============================================
// GESTIÓN ACADÉMICA
// =============================================

export const gestionAcademicaService = {
  async obtenerPeriodos(): Promise<PeriodoAcademico[]> {
    try {
      const response = await api.get('/periodo-academico', {
        params: { activo: true }
      });

      if (response.data.data?.periodos) return response.data.data.periodos;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.periodos) return response.data.periodos;
      if (Array.isArray(response.data)) return response.data;
      
      console.warn('⚠️ Estructura de respuesta no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener periodos:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener periodos');
    }
  },

  async obtenerPeriodoActivo(): Promise<PeriodoAcademico | null> {
    try {
      const response = await api.get('/periodo-academico/activo');
      
      if (response.data.data?.periodo) return response.data.data.periodo;
      if (response.data.data) return response.data.data;
      
      return response.data || null;
    } catch (error: any) {
      console.warn('⚠️ No hay periodo activo:', error.response?.data?.message);
      return null;
    }
  },

  async obtenerNiveles(): Promise<NivelAcademico[]> {
    try {
      const response = await api.get('/nivel-academico', {
        params: { activo: true }
      });

      if (response.data.data?.niveles) return response.data.data.niveles;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.niveles) return response.data.niveles;
      if (Array.isArray(response.data)) return response.data;

      console.warn('⚠️ Estructura de niveles no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener niveles:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener niveles');
    }
  },

  async obtenerGrados(nivelId?: number): Promise<Grado[]> {
    try {
      const params: any = { activo: true };
      if (nivelId) params.nivel_academico_id = nivelId;

      const response = await api.get('/grado', { params });

      if (response.data.data?.grados) return response.data.data.grados;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.grados) return response.data.grados;
      if (Array.isArray(response.data)) return response.data;

      console.warn('⚠️ Estructura de grados no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grados:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener grados');
    }
  },

  async obtenerTodosLosParalelos(anio: number, activo: boolean = true): Promise<Paralelo[]> {
    try {
      const response = await api.get('/paralelo/todos', {
        params: { anio, activo }
      });

      if (response.data.data?.paralelos) return response.data.data.paralelos;
      if (Array.isArray(response.data.data)) return response.data.data;
      if (response.data.paralelos) return response.data.paralelos;
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener paralelos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener paralelos');
    }
  },

  async obtenerParalelos(gradoId: number, anio?: number): Promise<Paralelo[]> {
    try {
      const params: any = { 
        grado_id: gradoId, 
        activo: true 
      };
      if (anio) params.anio = anio;

      const response = await api.get('/paralelo', { params });

      if (response.data.data?.paralelos) return response.data.data.paralelos;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.paralelos) return response.data.paralelos;
      if (Array.isArray(response.data)) return response.data;

      console.warn('⚠️ Estructura de paralelos no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener paralelos:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener paralelos');
    }
  },

  async verificarCapacidad(paraleloId: number, periodoId: number): Promise<CapacidadParalelo | null> {
    try {
      const response = await api.get('/matricula/capacidad', {
        params: {
          paralelo_id: paraleloId,
          periodo_id: periodoId,
        },
      });

      if (response.data.data?.capacidad) return response.data.data.capacidad;
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