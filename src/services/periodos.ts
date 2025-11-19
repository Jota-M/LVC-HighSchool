import api from '../lib/api';

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  cerrado: boolean;
  permite_inscripciones: boolean;
  permite_calificaciones: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PeriodoFormData {
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  permite_inscripciones?: boolean;
  permite_calificaciones?: boolean;
  observaciones?: string;
}

export interface PeriodosResponse {
  success: boolean;
  data: {
    periodos: PeriodoAcademico[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PeriodoResponse {
  success: boolean;
  data: {
    periodo: PeriodoAcademico;
  };
  message?: string;
}

class PeriodosService {
  // Listar periodos con filtros y paginación
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
    cerrado?: boolean;
  }): Promise<PeriodosResponse> {
    const { data } = await api.get<PeriodosResponse>('/periodo-academico', { params });
    return data;
  }

  // Obtener periodo por ID
  async obtenerPorId(id: number): Promise<PeriodoAcademico> {
    const { data } = await api.get<PeriodoResponse>(`/periodo-academico${id}`);
    return data.data.periodo;
  }

  // Obtener periodo activo
  async obtenerActivo(): Promise<PeriodoAcademico | null> {
    try {
      const { data } = await api.get<PeriodoResponse>('/periodo-academico/activo');
      return data.data.periodo;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Crear periodo
  async crear(periodo: PeriodoFormData): Promise<PeriodoResponse> {
    const { data } = await api.post<PeriodoResponse>('/periodo-academico', periodo);
    return data;
  }

  // Actualizar periodo
  async actualizar(id: number, periodo: Partial<PeriodoFormData>): Promise<PeriodoResponse> {
    const { data } = await api.put<PeriodoResponse>(`/periodo-academico/${id}`, periodo);
    return data;
  }

  // Eliminar periodo (soft delete)
  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/periodo-academico/${id}`);
    return data;
  }

  // Cerrar periodo
  async cerrar(id: number): Promise<PeriodoResponse> {
    const { data } = await api.patch<PeriodoResponse>(`/periodo-academico/${id}/cerrar`);
    return data;
  }

  // Activar/Desactivar periodo
  async activar(id: number) {
  const { data } = await api.patch(`/periodo-academico/${id}/activar`);
  return data;
}

  // Validar solapamiento de fechas (útil para el frontend)
  validarFechas(fecha_inicio: string, fecha_fin: string, periodos: PeriodoAcademico[], excludeId?: number): string | null {
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (fin <= inicio) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Verificar solapamiento con otros periodos
    const overlap = periodos.find(p => {
      if (excludeId && p.id === excludeId) return false;
      
      const pInicio = new Date(p.fecha_inicio);
      const pFin = new Date(p.fecha_fin);

      return (
        (inicio <= pInicio && fin >= pInicio) ||
        (inicio <= pFin && fin >= pFin) ||
        (inicio >= pInicio && fin <= pFin)
      );
    });

    if (overlap) {
      return `Las fechas se solapan con el periodo: ${overlap.nombre}`;
    }

    return null;
  }

  // Calcular días restantes
  calcularDiasRestantes(fecha_fin: string): number {
  const today = new Date();
  const endDate = new Date(fecha_fin); // ✔️ quitar T00:00:00
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


  // Calcular progreso del periodo
  calcularProgreso(fecha_inicio: string, fecha_fin: string): number {
    const today = new Date();
    const start = new Date(fecha_inicio + 'T00:00:00');
    const end = new Date(fecha_fin + 'T00:00:00');
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }

  // Formatear fecha
  formatearFecha(dateString: string, formato: 'corto' | 'largo' = 'largo'): string {
  const date = new Date(dateString); // ✔️ USAR LA FECHA DIRECTA SIN AGREGAR T00:00:00

  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  if (formato === 'corto') {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}
}

export default new PeriodosService();