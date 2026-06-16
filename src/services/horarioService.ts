// services/horarioService.ts
import api from '@/lib/api';
import type {
  BloqueHorario, BloqueHorarioCreate, BloqueHorarioUpdate,
  Horario, HorarioCreate, HorarioUpdate,
  HorarioDetalle, HorarioDetalleCreate, HorarioDetalleUpdate,
  GradoMateria, AsignacionDocente,
  HorariosFilters, BloquesFilters, HorarioEstado,
} from '@/types/horariotypes';

class HorarioService {

  // =============================================
  // BLOQUES HORARIOS
  // =============================================

  async listarBloques(filters: BloquesFilters = {}): Promise<BloqueHorario[]> {
    const { data } = await api.get('/horarios/bloques', { params: filters });
    return data.data.bloques;
  }

  async crearBloque(payload: BloqueHorarioCreate): Promise<BloqueHorario> {
    const { data } = await api.post('/horarios/bloques', payload);
    return data.data.bloque;
  }

  async actualizarBloque(id: number, payload: BloqueHorarioUpdate): Promise<BloqueHorario> {
    const { data } = await api.put(`/horarios/bloques/${id}`, payload);
    return data.data.bloque;
  }

  async eliminarBloque(id: number): Promise<void> {
    await api.delete(`/horarios/bloques/${id}`);
  }

  // =============================================
  // HORARIOS (cabecera)
  // =============================================

  async listarHorarios(filters: HorariosFilters = {}): Promise<Horario[]> {
    // Remove undefined params before sending
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    );
    const { data } = await api.get('/horarios', { params: cleanFilters });
    return data.data.horarios;
  }

  async obtenerHorario(id: number): Promise<Horario & { detalle: HorarioDetalle[] }> {
    const { data } = await api.get(`/horarios/${id}`);
    return data.data.horario;
  }

  async crearHorario(payload: HorarioCreate): Promise<Horario> {
    const { data } = await api.post('/horarios', payload);
    return data.data.horario;
  }

  async actualizarHorario(id: number, payload: HorarioUpdate): Promise<Horario> {
    const { data } = await api.put(`/horarios/${id}`, payload);
    return data.data.horario;
  }

  async cambiarEstado(id: number, estado: HorarioEstado): Promise<Horario> {
    const { data } = await api.patch(`/horarios/${id}/estado`, { estado });
    return data.data.horario;
  }

  async eliminarHorario(id: number): Promise<void> {
    await api.delete(`/horarios/${id}`);
  }

  // =============================================
  // HORARIO DETALLE (celdas)
  // =============================================

  async agregarCelda(horarioId: number, payload: HorarioDetalleCreate): Promise<HorarioDetalle> {
    const { data } = await api.post(`/horarios/${horarioId}/detalle`, payload);
    return data.data.celda;
  }

  async actualizarCelda(
    horarioId: number,
    detId: number,
    payload: HorarioDetalleUpdate
  ): Promise<HorarioDetalle> {
    const { data } = await api.put(`/horarios/${horarioId}/detalle/${detId}`, payload);
    return data.data.celda;
  }

  async eliminarCelda(horarioId: number, detId: number): Promise<void> {
    await api.delete(`/horarios/${horarioId}/detalle/${detId}`);
  }

  // =============================================
  // AUXILIARES (para CeldaModal)
  // =============================================

  /** Materias disponibles para un grado */
  async listarGradoMaterias(gradoId: number): Promise<GradoMateria[]> {
    const { data } = await api.get(`/grado-materia/grado/${gradoId}`, {
      params: { activo: true },
    });
    return data.data.materias ?? data.data.grado_materias ?? data.data ?? [];
  }

  /** Asignaciones de docentes para un paralelo + período (opcionalmente filtrado por materia) */
  async listarAsignaciones(
    paraleloId: number,
    periodoId: number,
    gradoMateriaId?: number
  ): Promise<AsignacionDocente[]> {
    const params: Record<string, unknown> = {
      paralelo_id: paraleloId,
      periodo_academico_id: periodoId,
      activo: true,
    };
    if (gradoMateriaId) params.grado_materia_id = gradoMateriaId;
    const { data } = await api.get('/asignacion-docente', { params });
    return data.data.asignaciones ?? data.data ?? [];
  }

  // =============================================
  // VISTAS ESPECIALES
  // =============================================
  async obtenerAsignacionTitular(
    gradoMateriaId: number,
    paraleloId: number,
    periodoId: number
  ): Promise<AsignacionDocente | null> {
    const { data } = await api.get('/asignacion-docente/titular', {
      params: {
        grado_materia_id: gradoMateriaId,
        paralelo_id: paraleloId,
        periodo_academico_id: periodoId,
      },
    });
    return data.data.asignacion ?? null;
  }
  async horarioDocente(
    docenteId: number,
    periodoId: number,
    estado = 'publicado'
  ): Promise<HorarioDetalle[]> {
    const { data } = await api.get(`/horarios/docente/${docenteId}`, {
      params: { periodo_academico_id: periodoId, estado },
    });
    return data.data.detalle;
  }

  async horarioParalelo(
    paraleloId: number,
    periodoId: number,
    estado = 'publicado'
  ): Promise<HorarioDetalle[]> {
    const { data } = await api.get(`/horarios/paralelo/${paraleloId}`, {
      params: { periodo_academico_id: periodoId, estado },
    });
    return data.data.detalle;
  }
}

export default new HorarioService();