import api from '@/lib/api';
import { Tutor, TutorCreate } from '@/types/estudianteTypes';

export interface TutorConRelacion extends Tutor {
  // Campos de padre_familia (ya en Tutor):
  //   id, nombres, apellido_paterno, apellido_materno, ci,
  //   telefono, celular, email, parentesco, ocupacion
  //   lugar_trabajo, es_tutor_principal, vive_con_estudiante,
  //   autorizado_recoger, puede_autorizar_salidas,
  //   recibe_notificaciones, prioridad_contacto, observaciones
 
  // El id de estudiante_tutor — viene en el SELECT como et.id
  // pero pf.id lo pisa. Necesitamos que el backend lo alias.
  // Por ahora lo dejamos como `relacion_id` si el backend lo expone,
  // o usamos `id` si el backend no lo aliases (ver nota abajo).
  relacion_id?: number;
 
  // Campos extra del tutor como persona
  fecha_nacimiento?: string;
  direccion?: string;
  estado_civil?: string;
  username?: string;
  user_email?: string;
}
 
export interface RelacionTutorUpdate {
  es_tutor_principal?: boolean;
  vive_con_estudiante?: boolean;
  autorizado_recoger?: boolean;
  puede_autorizar_salidas?: boolean;
  recibe_notificaciones?: boolean;
  prioridad_contacto?: number;
  observaciones?: string;
  // Campos de padre_familia que también se pueden editar:
  parentesco?: string;
}
 
export interface PadreFamiliaUpdate {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  ci?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  parentesco?: string;
  estado_civil?: string;
}
 
export interface AsignarTutorPayload {
  padre_familia_id: number;
  es_tutor_principal?: boolean;
  vive_con_estudiante?: boolean;
  autorizado_recoger?: boolean;
  puede_autorizar_salidas?: boolean;
  recibe_notificaciones?: boolean;
  prioridad_contacto?: number;
  observaciones?: string;
  parentesco?: string;
}
 
// ─── Service ─────────────────────────────────────────────────────────────────
 
export const tutoresService = {
 
  /**
   * GET /api/estudiante/:estudianteId/tutores
   * Devuelve los tutores del estudiante con datos mezclados de
   * padre_familia + estudiante_tutor.
   */
  async obtenerPorEstudiante(estudianteId: number): Promise<TutorConRelacion[]> {
    const response = await api.get(`/estudiante/${estudianteId}/tutores`);
    return response.data.data.tutores;
  },
 
  /**
   * Buscar tutor existente por CI antes de crear uno nuevo.
   * Usa el endpoint de registro-completo que ya existe.
   * GET /api/registro-completo/buscar-padre/:ci
   */
  async buscarPorCI(ci: string): Promise<{ encontrado: boolean; padre: any | null }> {
    const response = await api.get(`/registro-completo/buscar-padre/${ci}`);
    return response.data.data;
  },
 
  /**
   * Paso 1 al agregar tutor nuevo:
   * Crear padre_familia con sus datos personales.
   * POST /api/padre-familia  (ruta que debe existir en el backend)
   *
   * NOTA: Si no existe esta ruta, el workaround es usar
   * /registro-completo con modo 'existente' pasando un estudiante vacío,
   * o agregar la ruta. Ver comentario al final del archivo.
   */
  async crearPadreFamilia(data: TutorCreate): Promise<{ id: number }> {
    const response = await api.post('/padre-familia', data);
    return response.data.data.padre;
  },
 
  /**
   * Paso 2 al agregar tutor (nuevo o existente):
   * Crear la relación estudiante_tutor.
   * POST /api/estudiante/:estudianteId/tutores
   * Body: { padre_familia_id, es_tutor_principal, parentesco, ... }
   */
  async asignar(estudianteId: number, payload: AsignarTutorPayload): Promise<any> {
    const response = await api.post(`/estudiante/${estudianteId}/tutores`, payload);
    return response.data.data.relacion;
  },
 
  /**
   * Actualizar datos personales del tutor (padre_familia).
   * PUT /api/padre-familia/:padreId
   */
  async actualizarPadreFamilia(padreId: number, data: PadreFamiliaUpdate): Promise<any> {
    const response = await api.put(`/padre-familia/${padreId}`, data);
    return response.data.data.padre;
  },
 
  /**
   * Actualizar la relación (estudiante_tutor): permisos, principal, etc.
   * PUT /api/estudiante/:estudianteId/tutores/:relacionId
   */
  async actualizarRelacion(
    estudianteId: number,
    relacionId: number,
    data: RelacionTutorUpdate
  ): Promise<any> {
    const response = await api.put(
      `/estudiante/${estudianteId}/tutores/${relacionId}`,
      data
    );
    return response.data.data.relacion;
  },
 
  /**
   * Remover tutor del estudiante (elimina la fila de estudiante_tutor).
   * DELETE /api/estudiante/:estudianteId/tutores/:relacionId
   */
  async remover(estudianteId: number, relacionId: number): Promise<void> {
    await api.delete(`/estudiante/${estudianteId}/tutores/${relacionId}`);
  },
};