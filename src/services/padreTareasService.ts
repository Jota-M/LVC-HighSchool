// services/padreTareasService.ts
import api from '@/lib/api';
import type { TareaHijo, ResumenTareas, EstadoTarea } from '@/types/padreTareasTypes';

export interface TareasResponse {
  success: boolean;
  data: {
    tareas:   TareaHijo[];
    resumen:  ResumenTareas;
  };
}

/**
 * GET /notas/tareas/:matricula_id
 * Requiere permiso: notas.leer
 * El backend valida que la matrícula pertenece a un hijo del padre autenticado.
 */
export const getTareas = async (
  matriculaId: number,
  opciones?: {
    periodo_evaluacion_id?: number | null;
    estado?: EstadoTarea | null;
  }
): Promise<TareasResponse> => {
  const params = new URLSearchParams();
  if (opciones?.periodo_evaluacion_id)
    params.append('periodo_evaluacion_id', opciones.periodo_evaluacion_id.toString());
  if (opciones?.estado)
    params.append('estado', opciones.estado);

  const query = params.toString() ? `?${params}` : '';
  const response = await api.get(`/notas/tareas/${matriculaId}${query}`);
  return response.data;
};