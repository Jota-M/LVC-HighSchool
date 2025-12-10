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
  permite_inscripciones: boolean;
  permite_calificaciones: boolean;
  cerrado: boolean;
}

export interface Turno {
  id: number;
  nombre: string;
  codigo?: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  color?: string;
}

export interface NivelAcademico {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
}

export interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  codigo?: string;
  orden: number;
  activo: boolean;
  nivel_nombre?: string;
}

export interface Paralelo {
  id: number;
  grado_id: number;
  turno_id: number;
  nombre: string;
  capacidad_maxima: number;
  anio: number;
  aula?: string;
  activo: boolean;
  grado_nombre?: string;
  turno_nombre?: string;
}

export interface Materia {
  id: number;
  area_conocimiento_id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria: boolean;
  tiene_laboratorio: boolean;
  color?: string;
  activo: boolean;
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
  materia_nombre?: string;
  materia_codigo?: string;
  materia_color?: string;
  grado_nombre?: string;
  nivel_nombre?: string;
  horas_semanales?: number;
}

// ============== SERVICIO ==============
class AcademicosService {
  // ========== PERIODOS ACADÉMICOS ==========
  async listarPeriodos(params?: { activo?: boolean; cerrado?: boolean }): Promise<any> {
    const { data } = await api.get('/periodo-academico', { params });
    return data;
  }

  async obtenerPeriodoActivo(): Promise<any> {
    const { data } = await api.get('/periodo-academico/activo');
    return data;
  }

  async obtenerPeriodo(id: number): Promise<any> {
    const { data } = await api.get(`/periodo-academico/${id}`);
    return data;
  }

  // ========== TURNOS ==========
  async listarTurnos(params?: { activo?: boolean }): Promise<any> {
    const { data } = await api.get('/turno', { params });
    return data;
  }

  // ========== NIVELES ACADÉMICOS ==========
  async listarNiveles(params?: { activo?: boolean }): Promise<any> {
    const { data } = await api.get('/nivel-academico', { params });
    return data;
  }

  // ========== GRADOS ==========
  async listarGrados(params?: { nivel_academico_id?: number; activo?: boolean }): Promise<any> {
    const { data } = await api.get('/grado', { params });
    return data;
  }

  // ========== PARALELOS ==========
  async listarParalelos(params?: {
    grado_id?: number;
    turno_id?: number;
    anio?: number;
    activo?: boolean;
  }): Promise<any> {
    const { data } = await api.get('/paralelo', { params });
    return data;
  }

  // ========== MATERIAS ==========
  async listarMaterias(params?: { activo?: boolean }): Promise<any> {
    const { data } = await api.get('/materia', { params });
    return data;
  }

  // ========== GRADO-MATERIA ==========
  async listarGradoMaterias(params?: {
    grado_id?: number;
    materia_id?: number;
    activo?: boolean;
  }): Promise<any> {
    const { data } = await api.get('/grado-materia', { params });
    return data;
  }

  async obtenerMateriasPorGrado(gradoId: number): Promise<any> {
    const { data } = await api.get(`/grado-materia/grado/${gradoId}`);
    return data;
  }

  // ========== UTILIDADES ==========
  getTurnoColor(nombre: string): string {
    const colors: Record<string, string> = {
      'mañana': '#2196f3',
      'tarde': '#ff9800',
      'noche': '#9c27b0'
    };
    return colors[nombre.toLowerCase()] || '#grey';
  }

  formatTurno(turno: Turno): string {
    return `${turno.nombre} (${turno.hora_inicio} - ${turno.hora_fin})`;
  }

  formatGrado(grado: Grado): string {
    return grado.nivel_nombre ? `${grado.nivel_nombre} - ${grado.nombre}` : grado.nombre;
  }

  formatParalelo(paralelo: Paralelo): string {
    const grado = paralelo.grado_nombre || '';
    const turno = paralelo.turno_nombre || '';
    return `${grado} "${paralelo.nombre}" - ${turno}`;
  }
}

export default new AcademicosService();