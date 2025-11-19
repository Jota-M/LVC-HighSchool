import api from '../lib/api';

// ============== INTERFACES ==============
export interface NivelAcademico {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  orden: number;
  edad_minima?: number;
  edad_maxima?: number;
  activo: boolean;
  color?: string;
  icono?: string;
  total_grados?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  grados?: Grado[];
}

export interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  nivel_nombre?: string;
  nivel_codigo?: string;
  total_paralelos?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface NivelFormData {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden?: number;
  edad_minima?: number;
  edad_maxima?: number;
  activo?: boolean;
  color?: string;
  icono?: string;
}

export interface GradoFormData {
  nivel_academico_id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

export interface NivelesResponse {
  success: boolean;
  data: {
    niveles: NivelAcademico[];
  };
}

export interface NivelResponse {
  success: boolean;
  data: {
    nivel: NivelAcademico;
  };
  message?: string;
}

export interface GradosResponse {
  success: boolean;
  data: {
    grados: Grado[];
  };
}

export interface GradoResponse {
  success: boolean;
  data: {
    grado: Grado;
  };
  message?: string;
}

// ============== SERVICIO DE NIVELES ==============
class NivelesService {
  // Listar niveles académicos
  async listarNiveles(params?: { activo?: boolean }): Promise<NivelesResponse> {
    const { data } = await api.get<NivelesResponse>('/nivel-academico', { params });
    return data;
  }

  // Obtener nivel por ID
  async obtenerNivelPorId(id: number): Promise<NivelAcademico> {
    const { data } = await api.get<NivelResponse>(`/nivel-academico/${id}`);
    return data.data.nivel;
  }

  // Crear nivel
  async crearNivel(nivel: NivelFormData): Promise<NivelResponse> {
    const { data } = await api.post<NivelResponse>('/nivel-academico', nivel);
    return data;
  }

  // Actualizar nivel
  async actualizarNivel(id: number, nivel: Partial<NivelFormData>): Promise<NivelResponse> {
    const { data } = await api.put<NivelResponse>(`/nivel-academico/${id}`, nivel);
    return data;
  }

  // Eliminar nivel
  async eliminarNivel(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/nivel-academico/${id}`);
    return data;
  }

  // ============== MÉTODOS DE GRADOS ==============
  
  // Listar grados (con filtros opcionales)
  async listarGrados(params?: { 
    nivel_academico_id?: number; 
    activo?: boolean 
  }): Promise<GradosResponse> {
    const { data } = await api.get<GradosResponse>('/grado', { params });
    return data;
  }

  // Obtener grado por ID
  async obtenerGradoPorId(id: number): Promise<Grado> {
    const { data } = await api.get<GradoResponse>(`/grado/${id}`);
    return data.data.grado;
  }

  // Crear grado
  async crearGrado(grado: GradoFormData): Promise<GradoResponse> {
    const { data } = await api.post<GradoResponse>('/grado', grado);
    return data;
  }

  // Actualizar grado
  async actualizarGrado(id: number, grado: Partial<GradoFormData>): Promise<GradoResponse> {
    const { data } = await api.put<GradoResponse>(`/grado/${id}`, grado);
    return data;
  }

  // Eliminar grado
  async eliminarGrado(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/grado/${id}`);
    return data;
  }

  // ============== MÉTODOS AUXILIARES ==============

  // Obtener niveles con sus grados
  async obtenerNivelesConGrados(): Promise<NivelAcademico[]> {
    const nivelesRes = await this.listarNiveles();
    const gradosRes = await this.listarGrados();

    const niveles = nivelesRes.data.niveles;
    const grados = gradosRes.data.grados;

    // Agrupar grados por nivel
    return niveles.map(nivel => ({
      ...nivel,
      grados: grados.filter(grado => grado.nivel_academico_id === nivel.id)
    }));
  }

  // Validar que el nombre no esté vacío
  validarNombre(nombre: string): string | null {
    if (!nombre || nombre.trim().length === 0) {
      return 'El nombre es requerido';
    }
    if (nombre.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return null;
  }

  // Generar código automático basado en el nombre
  generarCodigo(nombre: string): string {
    return nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
  }

  // Obtener color por defecto según el orden
  obtenerColorPorDefecto(orden: number): string {
    const colores = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
    return colores[orden % colores.length];
  }

  // Obtener icono por defecto según el orden
  obtenerIconoPorDefecto(orden: number): string {
    const iconos = ['🎨', '📚', '🎓', '🔬', '🎭', '⚽'];
    return iconos[orden % iconos.length];
  }
}

export default new NivelesService();