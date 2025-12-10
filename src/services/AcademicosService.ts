// services/academicos.ts
import api from '../lib/api';

// ============== INTERFACES ==============

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  codigo?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  permite_inscripciones?: boolean;
  permite_calificaciones?: boolean;
  cerrado?: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface Turno {
  id: number;
  nombre: string;
  codigo?: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface NivelAcademico {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden: number;
  edad_minima?: number;
  edad_maxima?: number;
  activo: boolean;
  color?: string;
  icono?: string;
  created_at: string;
  updated_at: string;
}

export interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  nivel_nombre?: string;
  nivel_codigo?: string;
  created_at: string;
  updated_at: string;
}

export interface Paralelo {
  id: number;
  grado_id: number;
  turno_id: number;
  nombre: string;
  capacidad_maxima: number;
  capacidad_minima?: number;
  anio: number;
  aula?: string;
  activo: boolean;
  grado_nombre?: string;
  nivel_nombre?: string;
  turno_nombre?: string;
  turno_codigo?: string;
  estudiantes_matriculados?: number;
  created_at: string;
  updated_at: string;
}

export interface AreaConocimiento {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  created_at: string;
}

export interface Materia {
  id: number;
  area_conocimiento_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria: boolean;
  tiene_laboratorio: boolean;
  color?: string;
  activo: boolean;
  area_nombre?: string;
  created_at: string;
  updated_at: string;
}

export interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  orden?: number;
  activo: boolean;
  nota_minima_aprobacion?: number;
  peso_porcentual?: number;
  // Datos relacionados
  grado_nombre?: string;
  nivel_nombre?: string;
  materia_nombre?: string;
  materia_codigo?: string;
  materia_color?: string;
  horas_semanales?: number;
  es_obligatoria?: boolean;
  area_nombre?: string;
  created_at: string;
  updated_at: string;
}

// ============== RESPONSES ==============

interface PeriodosResponse {
  success: boolean;
  data: {
    periodos: PeriodoAcademico[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface PeriodoResponse {
  success: boolean;
  data: {
    periodo: PeriodoAcademico;
  };
}

interface TurnosResponse {
  success: boolean;
  data: {
    turnos: Turno[];
  };
}

interface NivelesResponse {
  success: boolean;
  data: {
    niveles: NivelAcademico[];
  };
}

interface GradosResponse {
  success: boolean;
  data: {
    grados: Grado[];
  };
}

interface ParalelosResponse {
  success: boolean;
  data: {
    paralelos: Paralelo[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface MateriasResponse {
  success: boolean;
  data: {
    materias: Materia[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface GradoMateriasResponse {
  success: boolean;
  data: {
    grado_materias: GradoMateria[];
    paginacion?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// ============== SERVICIO ==============

class AcademicosService {
  // ========== PERIODOS ACADÉMICOS ==========
  
  async listarPeriodos(params?: {
    page?: number;
    limit?: number;
    activo?: boolean;
  }): Promise<PeriodosResponse> {
    const { data } = await api.get<PeriodosResponse>('/periodo-academico', { params });
    return data;
  }

  async obtenerPeriodoActivo(): Promise<PeriodoResponse> {
    const { data } = await api.get<PeriodoResponse>('/periodo-academico/activo');
    return data;
  }

  async obtenerPeriodoPorId(id: number): Promise<PeriodoResponse> {
    const { data } = await api.get<PeriodoResponse>(`/periodo-academico/${id}`);
    return data;
  }

  // ========== TURNOS ==========
  
  async listarTurnos(params?: { activo?: boolean }): Promise<TurnosResponse> {
    const { data } = await api.get<TurnosResponse>('/turno', { params });
    return data;
  }

  // ========== NIVELES ACADÉMICOS ==========
  
  async listarNiveles(params?: { activo?: boolean }): Promise<NivelesResponse> {
    const { data } = await api.get<NivelesResponse>('/nivel-academico', { params });
    return data;
  }

  // ========== GRADOS ==========
  
  async listarGrados(params?: {
    nivel_academico_id?: number;
    activo?: boolean;
  }): Promise<GradosResponse> {
    const { data } = await api.get<GradosResponse>('/grado', { params });
    return data;
  }

  // ========== PARALELOS ==========
  
  async listarParalelos(params?: {
    grado_id?: number;
    turno_id?: number;
    anio?: number;
    activo?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ParalelosResponse> {
    const { data } = await api.get<ParalelosResponse>('/paralelo', { params });
    return data;
  }

  async obtenerParaleloPorId(id: number): Promise<{ success: boolean; data: { paralelo: Paralelo } }> {
    const { data } = await api.get(`/paralelo/${id}`);
    return data;
  }

  // ========== MATERIAS ==========
  
  async listarMaterias(params?: {
    area_conocimiento_id?: number;
    activo?: boolean;
    page?: number;
    limit?: number;
  }): Promise<MateriasResponse> {
    const { data } = await api.get<MateriasResponse>('/materia', { params });
    return data;
  }

  // ========== GRADO-MATERIAS ==========
  
  async listarGradoMaterias(params?: {
    grado_id?: number;
    materia_id?: number;
    activo?: boolean;
    page?: number;
    limit?: number;
  }): Promise<GradoMateriasResponse> {
    const { data } = await api.get<GradoMateriasResponse>('/grado-materia', { params });
    return data;
  }

  async obtenerGradoMateriaPorId(id: number): Promise<{ success: boolean; data: { grado_materia: GradoMateria } }> {
    const { data } = await api.get(`/grado-materia/${id}`);
    return data;
  }

  async obtenerMateriasPorGrado(gradoId: number): Promise<GradoMateriasResponse> {
    const { data } = await api.get<GradoMateriasResponse>(`/grado/${gradoId}/materias`);
    return data;
  }

  // ========== UTILIDADES ==========
  
  getTurnoLabel(turno?: Turno): string {
    if (!turno) return 'Sin turno';
    return turno.nombre;
  }

  getNivelLabel(nivel?: NivelAcademico): string {
    if (!nivel) return 'Sin nivel';
    return nivel.nombre;
  }

  getGradoCompleto(grado?: Grado): string {
    if (!grado) return 'Sin grado';
    return grado.nivel_nombre ? `${grado.nivel_nombre} - ${grado.nombre}` : grado.nombre;
  }

  getParaleloCompleto(paralelo?: Paralelo): string {
    if (!paralelo) return 'Sin paralelo';
    return `${paralelo.grado_nombre || 'Grado'} "${paralelo.nombre}" - ${paralelo.turno_nombre || 'Turno'}`;
  }

  isPeriodoVigente(periodo: PeriodoAcademico): boolean {
    const hoy = new Date();
    const inicio = new Date(periodo.fecha_inicio);
    const fin = new Date(periodo.fecha_fin);
    return hoy >= inicio && hoy <= fin;
  }

  getDiasRestantes(periodo: PeriodoAcademico): number {
    const hoy = new Date();
    const fin = new Date(periodo.fecha_fin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getEstadoPeriodo(periodo: PeriodoAcademico): 'activo' | 'proximo' | 'finalizado' {
    const hoy = new Date();
    const inicio = new Date(periodo.fecha_inicio);
    const fin = new Date(periodo.fecha_fin);
    
    if (hoy < inicio) return 'proximo';
    if (hoy > fin) return 'finalizado';
    return 'activo';
  }
}

export default new AcademicosService();