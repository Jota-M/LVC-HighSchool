// services/dimensionEvaluacion.ts
import api from '../lib/api';
import { DimensionEvaluacion, DimensionEvaluacionFormData } from '@/types/dimensionevaluacion';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const dimensionEvaluacionService = {

  listar: async (): Promise<DimensionEvaluacion[]> => {
    const res = await api.get<ApiResponse<{ dimensiones: DimensionEvaluacion[] }>>('/notas/dimensiones');
    return res.data.data.dimensiones;
  },

  crear: async (data: DimensionEvaluacionFormData): Promise<DimensionEvaluacion> => {
    const res = await api.post<ApiResponse<{ dimension: DimensionEvaluacion }>>('/notas/dimensiones', data);
    return res.data.data.dimension;
  },

  actualizar: async (id: number, data: Partial<DimensionEvaluacionFormData>): Promise<DimensionEvaluacion> => {
    const res = await api.put<ApiResponse<{ dimension: DimensionEvaluacion }>>(`/notas/dimensiones/${id}`, data);
    return res.data.data.dimension;
  },

  toggleActivo: async (id: number, activo: boolean): Promise<DimensionEvaluacion> => {
    const res = await api.put<ApiResponse<{ dimension: DimensionEvaluacion }>>(`/notas/dimensiones/${id}`, { activo });
    return res.data.data.dimension;
  },
};