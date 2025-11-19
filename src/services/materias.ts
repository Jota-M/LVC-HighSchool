import api from '../lib/api';

// ============== INTERFACES ==============

export interface AreaConocimiento {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  total_materias?: number;
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
  area_color?: string;
  total_grados?: number;
  prerequisitos?: MateriaPrerequisito[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MateriaPrerequisito {
  id: number;
  materia_id: number;
  prerequisito_id: number;
  codigo: string;
  nombre: string;
  area_conocimiento_id: number;
}

export interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  orden: number;
  activo: boolean;
  nota_minima_aprobacion: number;
  peso_porcentual?: number;
  grado_nombre?: string;
  materia_codigo?: string;
  materia_nombre?: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria?: boolean;
  tiene_laboratorio?: boolean;
  area_nombre?: string;
  area_color?: string;
  created_at: string;
  updated_at: string;
}

// Form Data Interfaces
export interface AreaFormData {
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}

export interface MateriaFormData {
  area_conocimiento_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria?: boolean;
  tiene_laboratorio?: boolean;
  color?: string;
  activo?: boolean;
}

export interface GradoMateriaFormData {
  grado_id: number;
  materia_id: number;
  orden?: number;
  activo?: boolean;
  nota_minima_aprobacion?: number;
  peso_porcentual?: number;
}

// Response Interfaces
export interface AreasResponse {
  success: boolean;
  data: {
    areas: AreaConocimiento[];
  };
}

export interface AreaResponse {
  success: boolean;
  data: {
    area: AreaConocimiento;
  };
  message?: string;
}

export interface MateriasResponse {
  success: boolean;
  data: {
    materias: Materia[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface MateriaResponse {
  success: boolean;
  data: {
    materia: Materia;
  };
  message?: string;
}

export interface GradoMateriasResponse {
  success: boolean;
  data: {
    materias: GradoMateria[];
  };
}

// ============== SERVICIO DE ÁREAS DE CONOCIMIENTO ==============
class MateriasService {
  
  // ===== ÁREAS DE CONOCIMIENTO =====
  
  async listarAreas(): Promise<AreasResponse> {
    const { data } = await api.get<AreasResponse>('/area-conocimiento');
    return data;
  }

  async obtenerAreaPorId(id: number): Promise<AreaConocimiento> {
    const { data } = await api.get<AreaResponse>(`/area-conocimiento/${id}`);
    return data.data.area;
  }

  async crearArea(area: AreaFormData): Promise<AreaResponse> {
    const { data } = await api.post<AreaResponse>('/area-conocimiento', area);
    return data;
  }

  async actualizarArea(id: number, area: Partial<AreaFormData>): Promise<AreaResponse> {
    const { data } = await api.put<AreaResponse>(`/area-conocimiento/${id}`, area);
    return data;
  }

  async eliminarArea(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/area-conocimiento/${id}`);
    return data;
  }

  // ===== MATERIAS =====
  
  async listarMaterias(params?: {
    page?: number;
    limit?: number;
    search?: string;
    area_conocimiento_id?: number;
    activo?: boolean;
    es_obligatoria?: boolean;
  }): Promise<MateriasResponse> {
    const { data } = await api.get<MateriasResponse>('/materias', { params });
    return data;
  }

  async obtenerMateriaPorId(id: number): Promise<Materia> {
    const { data } = await api.get<MateriaResponse>(`/materias/${id}`);
    return data.data.materia;
  }

  async crearMateria(materia: MateriaFormData): Promise<MateriaResponse> {
    const { data } = await api.post<MateriaResponse>('/materias', materia);
    return data;
  }

  async actualizarMateria(id: number, materia: Partial<MateriaFormData>): Promise<MateriaResponse> {
    const { data } = await api.put<MateriaResponse>(`/materias/${id}`, materia);
    return data;
  }

  async eliminarMateria(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/materias/${id}`);
    return data;
  }

  // ===== PREREQUISITOS =====
  
  async agregarPrerequisito(materia_id: number, prerequisito_id: number): Promise<any> {
    const { data } = await api.post(`/materias/${materia_id}/prerequisitos`, {
      prerequisito_id
    });
    return data;
  }

  async eliminarPrerequisito(materia_id: number, prerequisito_id: number): Promise<any> {
    const { data } = await api.delete(`/materias/${materia_id}/prerequisitos/${prerequisito_id}`);
    return data;
  }

  async listarPrerequisitos(materia_id: number): Promise<MateriaPrerequisito[]> {
    const { data } = await api.get(`/materias/${materia_id}/prerequisitos`);
    return data.data.prerequisitos;
  }

  // ===== GRADO-MATERIA =====
  
  async asignarMateriaGrado(asignacion: GradoMateriaFormData): Promise<any> {
    const { data } = await api.post('/grado-materia', asignacion);
    return data;
  }

  async listarMateriasPorGrado(grado_id: number, activo?: boolean): Promise<GradoMateriasResponse> {
    const { data } = await api.get<GradoMateriasResponse>(`/grado-materia/grado/${grado_id}`, {
      params: { activo }
    });
    return data;
  }

  async actualizarAsignacion(id: number, datos: Partial<GradoMateriaFormData>): Promise<any> {
    const { data } = await api.put(`/grado-materia/${id}`, datos);
    return data;
  }

  async removerMateriaGrado(id: number): Promise<any> {
    const { data } = await api.delete(`/grado-materia/${id}`);
    return data;
  }

  async reordenarMaterias(grado_id: number, materias: number[]): Promise<any> {
    const { data } = await api.put(`/grado-materia/grado/${grado_id}/reordenar`, {
      materias
    });
    return data;
  }

  // ===== UTILIDADES =====
  
  generarCodigoMateria(nombre: string, area: string): string {
    const nombreCode = nombre.substring(0, 3).toUpperCase();
    const areaCode = area.substring(0, 2).toUpperCase();
    return `${areaCode}${nombreCode}`;
  }

  calcularCargaHoraria(materias: Materia[]): number {
    return materias.reduce((total, m) => total + (m.horas_semanales || 0), 0);
  }

  calcularTotalCreditos(materias: Materia[]): number {
    return materias.reduce((total, m) => total + (m.creditos || 0), 0);
  }

  obtenerColorPorDefecto(index: number): string {
    const colores = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];
    return colores[index % colores.length];
  }
}

export default new MateriasService();