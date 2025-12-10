// services/asignacionDocenteService.ts - ACTUALIZACIÓN COMPLETA

import api from '@/lib/api';
import {
  AsignacionDocente,
  AsignacionesFiltros,
  AsignacionesListResponse,
  AsignacionResponse,
  CrearAsignacionDTO,
  ActualizarAsignacionDTO,
  CambiarDocenteDTO,
  AsignacionMasivaDTO,
  AsignacionMasivaResponse,
  CopiarPeriodoDTO,
  CopiarPeriodoResponse,
  AsignacionesPorDocenteResponse,
  AsignacionesPorParaleloResponse,
  GradoMateria,
  Materia,
  Paralelo,
  PeriodoAcademico,
} from '@/types/asignacionDocenteTypes';

// =============================================
// ASIGNACIONES DOCENTE - CRUD
// =============================================

export const asignacionesDocenteService = {
  // ... tus métodos existentes de asignaciones ...
  async crear(data: CrearAsignacionDTO): Promise<AsignacionDocente> {
    const response = await api.post('/asignacion-docente', data);
    return response.data.data.asignacion;
  },

  async asignarMasivo(data: AsignacionMasivaDTO): Promise<AsignacionMasivaResponse> {
    const response = await api.post('/asignacion-docente/masivo', data);
    return response.data;
  },

  async copiarDePeriodo(data: CopiarPeriodoDTO): Promise<CopiarPeriodoResponse> {
    const response = await api.post('/asignacion-docente/copiar-periodo', data);
    return response.data;
  },

  async listar(filters: AsignacionesFiltros = {}): Promise<AsignacionesListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.docente_id) params.append('docente_id', filters.docente_id.toString());
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.materia_id) params.append('materia_id', filters.materia_id.toString());
    if (filters.paralelo_id) params.append('paralelo_id', filters.paralelo_id.toString());
    if (filters.periodo_academico_id) params.append('periodo_academico_id', filters.periodo_academico_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());

    const response = await api.get(`/asignacion-docente?${params}`);
    return response.data;
  },

  async listarPorDocente(docenteId: number, periodoId?: number): Promise<AsignacionesPorDocenteResponse> {
    const params = new URLSearchParams();
    if (periodoId) params.append('periodo_academico_id', periodoId.toString());

    const response = await api.get(`/asignacion-docente/docente/${docenteId}?${params}`);
    return response.data;
  },

  async listarPorParalelo(paraleloId: number, periodoId: number): Promise<AsignacionesPorParaleloResponse> {
    const params = new URLSearchParams();
    params.append('periodo_academico_id', periodoId.toString());

    const response = await api.get(`/asignacion-docente/paralelo/${paraleloId}?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<AsignacionDocente> {
    const response = await api.get(`/asignacion-docente/${id}`);
    return response.data.data.asignacion;
  },

  async actualizar(id: number, data: ActualizarAsignacionDTO): Promise<AsignacionDocente> {
    const response = await api.put(`/asignacion-docente/${id}`, data);
    return response.data.data.asignacion;
  },

  async cambiarDocente(id: number, data: CambiarDocenteDTO): Promise<AsignacionDocente> {
    const response = await api.put(`/asignacion-docente/${id}/cambiar-docente`, data);
    return response.data.data.asignacion;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/asignacion-docente/${id}`);
  },
};

// =============================================
// DATOS AUXILIARES - OPTIMIZADO
// =============================================

export const datosAcademicosService = {
  // ⚡ MÉTODO OPTIMIZADO - UNA SOLA PETICIÓN
  async obtenerTodasLasGradoMaterias(activo: boolean = true): Promise<GradoMateria[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      console.log('⚡ Usando endpoint optimizado /grado-materia/todas');

      const response = await api.get(`/grado-materia/todas?${params}`);

      console.log('📦 Respuesta grado-materias optimizada:', response.data);

      if (response.data.success && response.data.data?.grados) {
        const todasLasMaterias: GradoMateria[] = [];
        
        // Aplanar el array: de { grados: [...] } a un array plano
        response.data.data.grados.forEach((grado: any) => {
          grado.materias.forEach((materia: any) => {
            todasLasMaterias.push({
              id: materia.id,
              grado_id: grado.grado_id,
              materia_id: materia.materia_id,
              grado_nombre: grado.grado_nombre,
              materia_nombre: materia.materia_nombre,
              materia_codigo: materia.materia_codigo,
              nivel_nombre: grado.nivel_nombre,
              horas_semanales: materia.horas_semanales,
              creditos: materia.creditos,
              orden: materia.orden,
              es_obligatoria: materia.es_obligatoria,
              tiene_laboratorio: materia.tiene_laboratorio,
              nota_minima_aprobacion: materia.nota_minima_aprobacion,
              peso_porcentual: materia.peso_porcentual,
              activo: materia.activo,
              materia_color: materia.materia_color,
              materia_descripcion: materia.materia_descripcion,
              area_nombre: materia.area_nombre,
              area_color: materia.area_color,
            });
          });
        });

        console.log(
          `✅ ${todasLasMaterias.length} grado-materias cargadas de ${response.data.data.grados.length} grados en UNA petición`
        );
        return todasLasMaterias;
      }

      console.warn('⚠️ Estructura de respuesta no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grado-materias:', error.response?.data || error);
      console.warn('⚠️ Retornando array vacío de grado-materias');
      return [];
    }
  },

  // Método anterior - Mantener para compatibilidad con casos específicos
  async obtenerGradoMateriasPorGrado(gradoId: number, activo: boolean = true): Promise<GradoMateria[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      console.log(`📚 Obteniendo materias del grado ${gradoId}`);

      const response = await api.get(`/grado-materia/grado/${gradoId}?${params}`);

      console.log('📦 Respuesta grado-materias por grado:', response.data);

      if (response.data.data?.materias) {
        return response.data.data.materias;
      }

      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de grado-materias no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grado-materias del grado:', error.response?.data || error);
      return [];
    }
  },

  // Método unificado - Usa el optimizado por defecto
  async obtenerGradoMaterias(gradoId?: number): Promise<GradoMateria[]> {
    // Si se especifica un gradoId, usar el endpoint específico
    if (gradoId) {
      return this.obtenerGradoMateriasPorGrado(gradoId, true);
    }

    // Si no, usar el endpoint optimizado que trae todo
    return this.obtenerTodasLasGradoMaterias(true);
  },

  // Obtener materias
  async obtenerMaterias(activo: boolean = true): Promise<Materia[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/materia?${params}`);

      console.log('📦 Respuesta materias:', response.data);

      if (response.data.data?.materias) {
        return response.data.data.materias;
      }

      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (response.data.materias) {
        return response.data.materias;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de materias no reconocida:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener materias:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener materias');
    }
  },

  // Obtener paralelos por grado
  async obtenerParalelosPorGrado(gradoId: number, activo: boolean = true): Promise<Paralelo[]> {
    try {
      const params = new URLSearchParams();
      params.append('grado_id', gradoId.toString());
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/paralelo?${params}`);

      console.log('📦 Respuesta paralelos:', response.data);

      if (response.data.data?.paralelos) {
        return response.data.data.paralelos;
      }

      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (response.data.paralelos) {
        return response.data.paralelos;
      }

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

  // Obtener periodos académicos
  async obtenerPeriodos(activo?: boolean): Promise<PeriodoAcademico[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/periodo-academico?${params}`);

      console.log('📦 Respuesta periodos:', response.data);

      if (response.data.data?.periodos) {
        return response.data.data.periodos;
      }

      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (response.data.periodos) {
        return response.data.periodos;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ Estructura de periodos no reconocida:', response.data);
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

      if (response.data.data?.periodo) {
        return response.data.data.periodo;
      }

      if (response.data.data) {
        return response.data.data;
      }

      return response.data || null;
    } catch (error: any) {
      console.warn('⚠️ No hay periodo activo:', error.response?.data?.message);
      return null;
    }
  },
};

// =============================================
// EXPORTAR TODOS LOS SERVICIOS
// =============================================

export default {
  ...asignacionesDocenteService,
  datosAcademicos: datosAcademicosService,
};