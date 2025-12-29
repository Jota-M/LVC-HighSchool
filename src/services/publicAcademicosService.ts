// services/publicAcademicos.service.ts
import api from '@/lib/api';

export interface PeriodoAcademicoPublico {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  permite_inscripciones: boolean;
}

export interface GradoPublico {
  id: number;
  nombre: string;
  codigo: string;
  nivel_academico_id: number;
  nivel_nombre: string;
  orden: number;
}

export interface TurnoPublico {
  id: number;
  nombre: string;
  codigo: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface NivelAcademicoPublico {
  id: number;
  nombre: string;
  codigo: string;
  orden: number;
  edad_minima: number;
  edad_maxima: number;
}

export const publicAcademicosService = {
  /**
   * Obtener periodo académico activo (PÚBLICO - sin auth)
   */
  async obtenerPeriodoActivo(): Promise<{ data: { periodo: PeriodoAcademicoPublico } }> {
    const response = await api.get('/public/academicos/periodo-activo');
    return response.data;
  },

  /**
   * Listar grados activos (PÚBLICO - sin auth)
   */
  async listarGrados(): Promise<{ data: { grados: GradoPublico[] } }> {
    const response = await api.get('/public/academicos/grados');
    return response.data;
  },

  /**
   * Listar turnos activos (PÚBLICO - sin auth)
   */
  async listarTurnos(): Promise<{ data: { turnos: TurnoPublico[] } }> {
    const response = await api.get('/public/academicos/turnos');
    return response.data;
  },

  /**
   * Listar niveles académicos (PÚBLICO - sin auth)
   */
  async listarNiveles(): Promise<{ data: { niveles: NivelAcademicoPublico[] } }> {
    const response = await api.get('/public/academicos/niveles');
    return response.data;
  },
};

export default publicAcademicosService;