// services/periodoEvaluacion.ts
import api from '../lib/api';
import {
  PeriodoEvaluacion,
  PeriodoEvaluacionFormData,
  PeriodoEvaluacionFilters
} from '../types/periodoEvaluacion';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ListarResponse {
  periodos: PeriodoEvaluacion[];
}

export const periodoEvaluacionService = {

  listar: async (filters?: PeriodoEvaluacionFilters): Promise<PeriodoEvaluacion[]> => {
    const params = new URLSearchParams();
    if (filters?.periodo_academico_id) {
      params.append('periodo_academico_id', String(filters.periodo_academico_id));
    }
    if (filters?.activo !== undefined) {
      params.append('activo', String(filters.activo));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get<ApiResponse<ListarResponse>>(`/notas/periodos${query}`);
    return res.data.data.periodos;
  },

  obtenerPorId: async (id: number): Promise<PeriodoEvaluacion> => {
    const res = await api.get<ApiResponse<{ periodo: PeriodoEvaluacion }>>(`/notas/periodos/${id}`);
    return res.data.data.periodo;
  },

  crear: async (data: PeriodoEvaluacionFormData): Promise<PeriodoEvaluacion> => {
    const res = await api.post<ApiResponse<{ periodo: PeriodoEvaluacion }>>('/notas/periodos', data);
    return res.data.data.periodo;
  },

  actualizar: async (id: number, data: Partial<PeriodoEvaluacionFormData>): Promise<PeriodoEvaluacion> => {
    const res = await api.put<ApiResponse<{ periodo: PeriodoEvaluacion }>>(`/notas/periodos/${id}`, data);
    return res.data.data.periodo;
  },

  toggleActivo: async (id: number, activo: boolean): Promise<PeriodoEvaluacion> => {
    const res = await api.put<ApiResponse<{ periodo: PeriodoEvaluacion }>>(`/notas/periodos/${id}`, { activo });
    return res.data.data.periodo;
  },
};