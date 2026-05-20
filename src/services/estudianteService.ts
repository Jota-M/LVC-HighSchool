// services/estudianteService.ts
// Servicio frontend — mapea 1:1 con routes/estudiantedRoutes.js

import api from '@/lib/api';
import type {
  PerfilEstudiante,
  MateriaResumen,
  TemarioItem,
  MaterialEstudiante,
  MaterialDetalleEstudiante,
  FavoritoEstudiante,
  ProgresoTema,
  BoletinMateria,
  NotasPorMateria,
  HorarioEstudiante,
  TareaEstudiante,
  ResumenTareas,
  AsistenciaResumen,
  AsistenciaDetalle,
  Paginacion,
  EstadoTarea,
  MaterialAsignadoEstudiante 
} from '@/types/estudiante';

// ── Re-exportar tipos útiles para los consumidores ────────────
export type {
  PerfilEstudiante, MateriaResumen, TemarioItem,
  MaterialEstudiante, MaterialDetalleEstudiante, FavoritoEstudiante,
  ProgresoTema, BoletinMateria, NotasPorMateria,
  HorarioEstudiante, TareaEstudiante, ResumenTareas,
  AsistenciaResumen, AsistenciaDetalle, Paginacion, EstadoTarea,
};

// ── Helpers ────────────────────────────────────────────────────
const toQS = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════
export const estudianteService = {

   // ── MATERIALES ASIGNADOS POR DOCENTE ────────────────────────
  async getMaterialesAsignados() {
    const res = await api.get('/estudianted/materiales-asignados');
    return res.data as {
      success: boolean;
      data: {
        materiales: MaterialAsignadoEstudiante[];
        total:      number;
        pendientes: number;
      };
    };
  },
 
  async marcarMaterialVisto(id: number) {
    const res = await api.patch(`/estudianted/materiales-asignados/${id}/visto`);
    return res.data as { success: boolean; message: string };
  },
 
  async getMaterialesAsignadosPendientes() {
    const res = await api.get('/estudianted/materiales-asignados/pendientes');
    return res.data as { success: boolean; data: { total: number } };
  },

  // ── PERFIL ────────────────────────────────────────────────────
  async getPerfil() {
    const res = await api.get('/estudianted/perfil');
    return res.data as { success: boolean; data: { perfil: PerfilEstudiante } };
  },

  // ── MATERIAS ──────────────────────────────────────────────────
  async getMisMaterias(periodo_evaluacion_id?: number) {
    const q = periodo_evaluacion_id ? `?periodo_evaluacion_id=${periodo_evaluacion_id}` : '';
    const res = await api.get(`/estudianted/mis-materias${q}`);
    return res.data as { success: boolean; data: { total: number; materias: MateriaResumen[] } };
  },

  async getTemario(grado_materia_id: number) {
    const res = await api.get(`/estudianted/mis-materias/${grado_materia_id}/temario`);
    return res.data as { success: boolean; data: { temario: TemarioItem[] } };
  },

  // ── MATERIALES ────────────────────────────────────────────────
  async getMateriales(
    asignacion_docente_id: number,
    opts: { tipo_material_id?: number; tema_id?: number; page?: number; limit?: number } = {}
  ) {
    const q = toQS({
      tipo_material_id: opts.tipo_material_id,
      tema_id:          opts.tema_id,
      page:             opts.page,
      limit:            opts.limit,
    });
    const res = await api.get(`/estudianted/materiales/${asignacion_docente_id}${q}`);
    return res.data as {
      success: boolean;
      data: { materiales: MaterialEstudiante[]; paginacion: Paginacion };
    };
  },

  async buscarMateriales(q: string, tipo_material_id?: number) {
    const params = toQS({ q, tipo_material_id });
    const res = await api.get(`/estudianted/materiales/buscar${params}`);
    return res.data as { success: boolean; data: { materiales: MaterialEstudiante[]; total: number } };
  },

  async getMaterialDetalle(material_id: number) {
    const res = await api.get(`/estudianted/material/${material_id}`);
    return res.data as { success: boolean; data: { material: MaterialDetalleEstudiante } };
  },

  async registrarAcceso(
    material_id: number,
    data: {
      tipo_accion:        'visualizacion' | 'descarga' | 'compartido' | 'impresion';
      dispositivo?:       'web' | 'movil' | 'tablet';
      duracion_segundos?: number;
      completado?:        boolean;
    }
  ) {
    await api.post(`/estudianted/material/${material_id}/acceso`, data);
  },

  async toggleFavorito(material_id: number, notas_personales?: string) {
    const res = await api.post(`/estudianted/material/${material_id}/favorito`, { notas_personales });
    return res.data as {
      success: boolean;
      message: string;
      data: { accion: 'agregado' | 'removido' };
    };
  },

  async getFavoritos() {
    const res = await api.get('/estudianted/favoritos');
    return res.data as { success: boolean; data: { favoritos: FavoritoEstudiante[]; total: number } };
  },

  // ── COMENTARIOS ───────────────────────────────────────────────
  async getComentarios(material_id: number, solo_dudas = false) {
    const q = solo_dudas ? '?solo_dudas=true' : '';
    const res = await api.get(`/estudianted/material/${material_id}/comentarios${q}`);
    return res.data as { success: boolean; data: { comentarios: any[] } };
  },

  async crearComentario(
    material_id: number,
    data: { contenido: string; comentario_padre_id?: number; es_duda?: boolean }
  ) {
    const res = await api.post(`/estudianted/material/${material_id}/comentarios`, data);
    return res.data as { success: boolean; message: string; data: { comentario: any } };
  },

  async actualizarComentario(material_id: number, comentario_id: number, contenido: string) {
    const res = await api.put(
      `/estudianted/material/${material_id}/comentarios/${comentario_id}`,
      { contenido }
    );
    return res.data as { success: boolean; message: string };
  },

  // ── PROGRESO ──────────────────────────────────────────────────
  async getProgreso(grado_materia_id: number) {
    const res = await api.get(`/estudianted/progreso/${grado_materia_id}`);
    return res.data as { success: boolean; data: { progreso: ProgresoTema[] } };
  },

  async actualizarProgreso(
    tema_id: number,
    data: { estado?: string; porcentaje_avance?: number; tiempo_dedicado?: number }
  ) {
    const res = await api.put(`/estudianted/progreso/${tema_id}`, data);
    return res.data as { success: boolean; message: string };
  },

  // ── NOTAS ─────────────────────────────────────────────────────
  async getBoletin(periodo_evaluacion_id: number) {
    const res = await api.get(`/estudianted/notas/boletin/${periodo_evaluacion_id}`);
    return res.data as { success: boolean; data: { boletin: BoletinMateria[] } };
  },

  async getNotasPorMateria(grado_materia_id: number, periodo_evaluacion_id: number) {
    const res = await api.get(`/estudianted/notas/${grado_materia_id}/${periodo_evaluacion_id}`);
    return res.data as { success: boolean; data: NotasPorMateria };
  },

  // ── HORARIO ───────────────────────────────────────────────────
  /** GET /api/estudiante/horario — sin parámetros, se resuelve desde el JWT */
  async getHorario() {
    const res = await api.get('/estudianted/horario');
    return res.data as { success: boolean; data: { horario: HorarioEstudiante } };
  },

  // ── TAREAS ────────────────────────────────────────────────────
  /**
   * GET /api/estudiante/tareas
   * @param periodo_evaluacion_id  Filtra por trimestre (opcional)
   * @param estado                 'pendiente' | 'entregado' | 'atrasado' | 'ausente'
   */
  async getTareas(opts: { periodo_evaluacion_id?: number; estado?: EstadoTarea } = {}) {
    const q = toQS({
      periodo_evaluacion_id: opts.periodo_evaluacion_id,
      estado:                opts.estado,
    });
    const res = await api.get(`/estudianted/tareas${q}`);
    return res.data as {
      success: boolean;
      data: { tareas: TareaEstudiante[]; resumen: ResumenTareas };
    };
  },

  // ── ASISTENCIA ────────────────────────────────────────────────
  async getAsistenciaResumen(opts: {
    asignacion_docente_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  } = {}) {
    const q = toQS(opts as any);
    const res = await api.get(`/estudianted/asistencia${q}`);
    return res.data as { success: boolean; data: { reporte: AsistenciaResumen[] } };
  },

  async getAsistenciaDetalle(opts: {
    asignacion_docente_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  } = {}) {
    const q = toQS(opts as any);
    const res = await api.get(`/estudianted/asistencia/detalle${q}`);
    return res.data as { success: boolean; data: { detalle: AsistenciaDetalle[]; total: number } };
  },
  async getPeriodosEvaluacion() {
  const res = await api.get('/estudianted/periodos-evaluacion');
  return res.data as {
    success: boolean;
    data: { periodos: { id: number; nombre: string; fecha_inicio: string; fecha_fin: string; orden: number }[] }
  };
},
};

export default estudianteService;