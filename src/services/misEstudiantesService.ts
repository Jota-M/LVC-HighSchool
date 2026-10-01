// services/misEstudiantesService.ts
import api from '@/lib/api';
import { Estudiante } from '@/types/estudianteTypes';

export interface CursoDocenteFiltro {
  grado_id: number;
  grado_nombre: string;
  paralelo_id: number;
  paralelo_nombre: string;
  materia_id?: number;
  materia_nombre?: string;
  asignacion_id?: number;
}

export interface MisEstudiantesFiltros {
  page?: number;
  limit?: number;
  search?: string;
  grado_id?: number;
  paralelo_id?: number;
  asignacion_id?: number;
}

export interface MisEstudiantesResponse {
  docente: {
    id: number;
    nombre_completo: string;
  };
  estudiantes: (Estudiante & { cursos_asignados?: string })[];
  cursos: CursoDocenteFiltro[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const misEstudiantesService = {
  async listar(filters: MisEstudiantesFiltros = {}): Promise<MisEstudiantesResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.paralelo_id) params.append('paralelo_id', filters.paralelo_id.toString());
    if (filters.asignacion_id) params.append('asignacion_id', filters.asignacion_id.toString());

    const response = await api.get(`/docentes/mis-estudiantes?${params}`);
    return response.data.data;
  },

  async obtenerPorId(id: number): Promise<Estudiante> {
    const response = await api.get(`/docentes/mis-estudiantes/${id}`);
    return response.data.data.estudiante;
  },
};
