import api from '../lib/api';

// ============== INTERFACES ==============

export interface Turno {
  id: number;
  nombre: string;
  codigo: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export interface Paralelo {
  id: number;
  grado_id: number;
  turno_id: number;
  nombre: string;
  capacidad_maxima: number;
  capacidad_minima: number;
  anio: number;
  aula?: string;
  activo: boolean;
  grado_nombre?: string;
  grado_codigo?: string;
  nivel_nombre?: string;
  turno_nombre?: string;
  turno_codigo?: string;
  total_estudiantes?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ParaleloFormData {
  grado_id: number;
  turno_id: number;
  nombre: string;
  capacidad_maxima?: number;
  capacidad_minima?: number;
  anio: number;
  aula?: string;
  activo?: boolean;
}

export interface ParalelosResponse {
  success: boolean;
  data: {
    paralelos: Paralelo[];
  };
}

export interface ParaleloResponse {
  success: boolean;
  data: {
    paralelo: Paralelo;
  };
  message?: string;
}

export interface TurnosResponse {
  success: boolean;
  data: {
    turnos: Turno[];
  };
}

// ============== SERVICIO ==============
class ParalelosService {
  
  // ===== PARALELOS =====
  
  async listarParalelos(params?: {
    grado_id?: number;
    turno_id?: number;
    anio?: number;
    activo?: boolean;
  }): Promise<ParalelosResponse> {
    const { data } = await api.get<ParalelosResponse>('/paralelo', { params });
    return data;
  }

  async obtenerParaleloPorId(id: number): Promise<Paralelo> {
    const { data } = await api.get<ParaleloResponse>(`/paralelo/${id}`);
    return data.data.paralelo;
  }

  async crearParalelo(paralelo: ParaleloFormData): Promise<ParaleloResponse> {
    const { data } = await api.post<ParaleloResponse>('/paralelo', paralelo);
    return data;
  }

  async actualizarParalelo(id: number, paralelo: Partial<ParaleloFormData>): Promise<ParaleloResponse> {
    const { data } = await api.put<ParaleloResponse>(`/paralelo/${id}`, paralelo);
    return data;
  }

  async eliminarParalelo(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/paralelo/${id}`);
    return data;
  }

  // ===== TURNOS (asumiendo endpoint similar) =====
  
  async listarTurnos(): Promise<TurnosResponse> {
    const { data } = await api.get<TurnosResponse>('/turno');
    return data;
  }

  // ===== UTILIDADES =====
  
  calcularOcupacion(total_estudiantes: number, capacidad_maxima: number): number {
    if (capacidad_maxima === 0) return 0;
    return Math.round((total_estudiantes / capacidad_maxima) * 100);
  }

  estaLleno(total_estudiantes: number, capacidad_maxima: number): boolean {
    return this.calcularOcupacion(total_estudiantes, capacidad_maxima) >= 90;
  }

  estaBajoMinimo(total_estudiantes: number, capacidad_minima: number): boolean {
    return total_estudiantes < capacidad_minima;
  }

  puedeAceptarMasEstudiantes(total_estudiantes: number, capacidad_maxima: number): boolean {
    return total_estudiantes < capacidad_maxima;
  }

  getLugaresDisponibles(total_estudiantes: number, capacidad_maxima: number): number {
    return Math.max(0, capacidad_maxima - total_estudiantes);
  }

  getEstadoCapacidad(total_estudiantes: number, capacidad_minima: number, capacidad_maxima: number): {
    estado: 'vacio' | 'bajo' | 'optimo' | 'lleno' | 'sobrepasado';
    color: string;
    mensaje: string;
  } {
    if (total_estudiantes === 0) {
      return {
        estado: 'vacio',
        color: '#9E9E9E',
        mensaje: 'Sin estudiantes'
      };
    }
    
    if (total_estudiantes < capacidad_minima) {
      return {
        estado: 'bajo',
        color: '#FF9800',
        mensaje: 'Por debajo del mínimo'
      };
    }
    
    if (total_estudiantes > capacidad_maxima) {
      return {
        estado: 'sobrepasado',
        color: '#F44336',
        mensaje: 'Capacidad excedida'
      };
    }
    
    const ocupacion = this.calcularOcupacion(total_estudiantes, capacidad_maxima);
    
    if (ocupacion >= 90) {
      return {
        estado: 'lleno',
        color: '#FF6B6B',
        mensaje: 'Casi lleno'
      };
    }
    
    return {
      estado: 'optimo',
      color: '#4CAF50',
      mensaje: 'Capacidad óptima'
    };
  }

  generarNombresParalelos(): string[] {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  }

  validarCapacidades(capacidad_minima: number, capacidad_maxima: number): string | null {
    if (capacidad_minima >= capacidad_maxima) {
      return 'La capacidad mínima debe ser menor a la capacidad máxima';
    }
    if (capacidad_minima < 5) {
      return 'La capacidad mínima debe ser al menos 5 estudiantes';
    }
    if (capacidad_maxima > 50) {
      return 'La capacidad máxima no puede exceder 50 estudiantes';
    }
    return null;
  }

  agruparPorGrado(paralelos: Paralelo[]): Map<number, Paralelo[]> {
    const grupos = new Map<number, Paralelo[]>();
    
    paralelos.forEach(paralelo => {
      if (!grupos.has(paralelo.grado_id)) {
        grupos.set(paralelo.grado_id, []);
      }
      grupos.get(paralelo.grado_id)!.push(paralelo);
    });
    
    return grupos;
  }

  obtenerEstadisticas(paralelos: Paralelo[]): {
    totalParalelos: number;
    totalEstudiantes: number;
    promedioEstudiantes: number;
    paralelosLlenos: number;
    paralelosBajoMinimo: number;
    capacidadTotal: number;
    tasaOcupacion: number;
  } {
    const totalParalelos = paralelos.length;
    const totalEstudiantes = paralelos.reduce((sum, p) => sum + (p.total_estudiantes || 0), 0);
    const capacidadTotal = paralelos.reduce((sum, p) => sum + p.capacidad_maxima, 0);
    const paralelosLlenos = paralelos.filter(p => this.estaLleno(p.total_estudiantes || 0, p.capacidad_maxima)).length;
    const paralelosBajoMinimo = paralelos.filter(p => this.estaBajoMinimo(p.total_estudiantes || 0, p.capacidad_minima)).length;

    return {
      totalParalelos,
      totalEstudiantes,
      promedioEstudiantes: totalParalelos > 0 
  ? Math.round((totalEstudiantes / totalParalelos) * 10) / 10 
  : 0,
      paralelosLlenos,
      paralelosBajoMinimo,
      capacidadTotal,
      tasaOcupacion: capacidadTotal > 0 ? Math.round((totalEstudiantes / capacidadTotal) * 100) : 0
    };
  }
}

export default new ParalelosService();