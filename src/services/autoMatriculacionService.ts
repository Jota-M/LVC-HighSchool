// services/autoMatriculacionService.ts
import api from '@/lib/api';
import {
  ValidacionCredenciales,
  ValidacionResponse,
  OpcionesMatriculaResponse,
  AutoMatriculacionData,
  AutoMatriculacionResponse,
} from '@/types/autoMatriculacionTypes';

export const autoMatriculacionService = {
  /**
   * Validar estudiante con código y CI
   */
  async validarEstudiante(credenciales: ValidacionCredenciales): Promise<ValidacionResponse> {
    const response = await api.post('/auto-matriculacion/validar', credenciales);
    return response.data;
  },

  /**
   * Obtener opciones de matrícula (grados y paralelos disponibles)
   */
  async obtenerOpciones(codigo: string, ci: string): Promise<OpcionesMatriculaResponse> {
    const response = await api.get('/auto-matriculacion/opciones', {
      params: { codigo, ci },
    });
    return response.data;
  },

  /**
   * Auto-matricular estudiante
   */
  async matricular(data: AutoMatriculacionData): Promise<AutoMatriculacionResponse> {
    const response = await api.post('/auto-matriculacion/matricular', data);
    return response.data;
  },
};

export default autoMatriculacionService;