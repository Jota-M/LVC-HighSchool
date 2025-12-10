import api from '../lib/api';

// ============== INTERFACES ==============
export interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  orden?: number;
  activo: boolean;
  nota_minima_aprobacion: number;
  peso_porcentual?: number;
  // Datos de materia
  materia_codigo: string;
  materia_nombre: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria: boolean;
  tiene_laboratorio: boolean;
  // Datos de área
  area_nombre?: string;
  area_color?: string;
  created_at: string;
  updated_at: string;
}

export interface GradoConMaterias {
  id: number;
  nombre: string;
  codigo?: string;
  nivel_nombre: string;
  nivel_codigo?: string;
  orden: number;
  materias: GradoMateria[];
  total_materias: number;
  total_horas: number;
  total_creditos: number;
}

export interface AsignacionFormData {
  grado_id: number;
  materia_id: number;
  orden?: number;
  activo?: boolean;
  nota_minima_aprobacion?: number;
  peso_porcentual?: number;
}

export interface AsignacionUpdateData {
  orden?: number;
  activo?: boolean;
  nota_minima_aprobacion?: number;
  peso_porcentual?: number;
}

export interface MateriaDisponible {
  area_conocimiento_id: number;
  tiene_laboratorio: any;
  id: number;
  codigo: string;
  nombre: string;
  horas_semanales?: number;
  creditos?: number;
  es_obligatoria: boolean;
  area_nombre?: string;
  area_color?: string;
  ya_asignada?: boolean;
}

// ============== RESPONSES ==============
interface GradoMateriasResponse {
  success: boolean;
  data: { materias: GradoMateria[] };
}

interface AsignacionResponse {
  success: boolean;
  message: string;
  data: { asignacion: GradoMateria };
}

interface BaseResponse {
  success: boolean;
  message: string;
}

// ============== SERVICIO ==============
class PlanEstudiosService {
  // Obtener materias asignadas a un grado
  async obtenerMateriasPorGrado(gradoId: number, activo?: boolean): Promise<GradoMateria[]> {
    const params: Record<string, any> = {};
    if (activo !== undefined) params.activo = activo;
    
    const { data } = await api.get<GradoMateriasResponse>(`/grado-materia/grado/${gradoId}`, { params });
    return data.data.materias;
  }

  // Asignar materia a grado
  async asignarMateria(datos: AsignacionFormData): Promise<AsignacionResponse> {
    const { data } = await api.post<AsignacionResponse>('/grado-materia', datos);
    return data;
  }

  // Asignar múltiples materias a un grado
  async asignarMultiplesMaterias(gradoId: number, materiaIds: number[]): Promise<BaseResponse> {
    const promesas = materiaIds.map((materiaId, index) => 
      this.asignarMateria({
        grado_id: gradoId,
        materia_id: materiaId,
        orden: index + 1
      })
    );
    
    await Promise.all(promesas);
    return { success: true, message: `${materiaIds.length} materias asignadas` };
  }

  // Actualizar asignación
  async actualizarAsignacion(id: number, datos: AsignacionUpdateData): Promise<AsignacionResponse> {
    const { data } = await api.put<AsignacionResponse>(`/grado-materia/${id}`, datos);
    return data;
  }

  // Remover materia de grado
  async removerMateria(id: number): Promise<BaseResponse> {
    const { data } = await api.delete<BaseResponse>(`/grado-materia/${id}`);
    return data;
  }

  // Reordenar materias
  async reordenarMaterias(gradoId: number, materiaIds: number[]): Promise<BaseResponse> {
    const { data } = await api.put<BaseResponse>(`/grado-materia/grado/${gradoId}/reordenar`, {
      materias: materiaIds
    });
    return data;
  }

  // Obtener materias disponibles (no asignadas a un grado)
  async obtenerMateriasDisponibles(gradoId: number): Promise<MateriaDisponible[]> {
    // Obtener todas las materias
    const { data: materiasRes } = await api.get('/materias', { params: { limit: 1000, activo: true } });
    const todasMaterias = materiasRes.data?.materias || materiasRes.data || [];
    
    // Obtener materias ya asignadas
    const asignadas = await this.obtenerMateriasPorGrado(gradoId);
    const idsAsignados = new Set(asignadas.map(m => m.materia_id));
    
    // Marcar cuáles están asignadas
    return todasMaterias.map((m: any) => ({
      ...m,
      ya_asignada: idsAsignados.has(m.id)
    }));
  }

  // Obtener resumen del plan de estudios de un grado
  async obtenerResumenGrado(gradoId: number): Promise<{
    total_materias: number;
    total_horas: number;
    total_creditos: number;
    materias_obligatorias: number;
    materias_electivas: number;
  }> {
    const materias = await this.obtenerMateriasPorGrado(gradoId, true);
    
    return {
      total_materias: materias.length,
      total_horas: materias.reduce((sum, m) => sum + (m.horas_semanales || 0), 0),
      total_creditos: materias.reduce((sum, m) => sum + (m.creditos || 0), 0),
      materias_obligatorias: materias.filter(m => m.es_obligatoria).length,
      materias_electivas: materias.filter(m => !m.es_obligatoria).length
    };
  }

  // Copiar plan de estudios de un grado a otro
  async copiarPlanEstudios(gradoOrigenId: number, gradoDestinoId: number): Promise<BaseResponse> {
    const materiasOrigen = await this.obtenerMateriasPorGrado(gradoOrigenId);
    
    const promesas = materiasOrigen.map((m, index) => 
      this.asignarMateria({
        grado_id: gradoDestinoId,
        materia_id: m.materia_id,
        orden: index + 1,
        nota_minima_aprobacion: m.nota_minima_aprobacion,
        peso_porcentual: m.peso_porcentual
      }).catch(() => null) // Ignorar si ya existe
    );
    
    const resultados = await Promise.all(promesas);
    const exitosos = resultados.filter(r => r !== null).length;
    
    return { 
      success: true, 
      message: `${exitosos} materias copiadas al nuevo grado` 
    };
  }
}

export default new PlanEstudiosService();