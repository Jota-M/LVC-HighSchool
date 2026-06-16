// services/asignacionDocenteService.ts

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

export const asignacionesDocenteService = {
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
    if (filters.periodo_academico_id)
      params.append('periodo_academico_id', filters.periodo_academico_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());

    const response = await api.get(`/asignacion-docente?${params}`);
    return response.data;
  },

  async listarPorDocente(
    docenteId: number,
    periodoId?: number,
  ): Promise<AsignacionesPorDocenteResponse> {
    const params = new URLSearchParams();
    if (periodoId) params.append('periodo_academico_id', periodoId.toString());

    const response = await api.get(`/asignacion-docente/docente/${docenteId}?${params}`);
    return response.data;
  },

  async listarPorParalelo(
    paraleloId: number,
    periodoId: number,
  ): Promise<AsignacionesPorParaleloResponse> {
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

export const datosAcademicosService = {
  async obtenerTodasLasGradoMaterias(activo: boolean = true): Promise<GradoMateria[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/grado-materia/todas?${params}`);

      if (response.data.success && response.data.data?.grados) {
        const todasLasMaterias: GradoMateria[] = [];

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

        return todasLasMaterias;
      }

      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grado-materias:', error.response?.data || error);
      return [];
    }
  },

  async obtenerGradoMateriasPorGrado(
    gradoId: number,
    activo: boolean = true,
  ): Promise<GradoMateria[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/grado-materia/grado/${gradoId}?${params}`);

      if (response.data.data?.materias) return response.data.data.materias;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener grado-materias del grado:', error.response?.data || error);
      return [];
    }
  },

  async obtenerGradoMaterias(gradoId?: number): Promise<GradoMateria[]> {
    if (gradoId) return this.obtenerGradoMateriasPorGrado(gradoId, true);
    return this.obtenerTodasLasGradoMaterias(true);
  },

  async obtenerMaterias(activo: boolean = true): Promise<Materia[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/materia?${params}`);

      if (response.data.data?.materias) return response.data.data.materias;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.materias) return response.data.materias;
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener materias:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener materias');
    }
  },

  // ✅ FIX: acepta anio para filtrar paralelos del periodo en curso
  async obtenerParalelosPorGrado(
    gradoId: number,
    anio?: number,
    activo: boolean = true,
  ): Promise<Paralelo[]> {
    try {
      const params = new URLSearchParams();
      params.append('grado_id', gradoId.toString());
      if (anio) params.append('anio', anio.toString()); // 👈 filtro por año
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/paralelo?${params}`);

      if (response.data.data?.paralelos) return response.data.data.paralelos;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.paralelos) return response.data.paralelos;
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener paralelos:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Error al obtener paralelos');
    }
  },

  async obtenerPeriodos(activo?: boolean): Promise<PeriodoAcademico[]> {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) params.append('activo', activo.toString());

      const response = await api.get(`/periodo-academico?${params}`);

      if (response.data.data?.periodos) return response.data.data.periodos;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
      if (response.data.periodos) return response.data.periodos;
      if (Array.isArray(response.data)) return response.data;

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
};

export default {
  ...asignacionesDocenteService,
  datosAcademicos: datosAcademicosService,
};