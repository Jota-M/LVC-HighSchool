// services/inicialService.ts
import api from '@/lib/api';
import {
  NivelLogro,
  IndicadorLogro,
  MatrizCotejoData,
  InformeCualitativo,
  ActividadInicial,
} from '@/types/inicialTypes';

export const inicialService = {
  // Catálogo de niveles (ED, DA, DO, DP)
  async getNivelesLogro(): Promise<NivelLogro[]> {
    const res = await api.get('/api/inicial/niveles-logro');
    return res.data.data;
  },

  // Indicadores
  async getIndicadores(params: { gradoMateriaId?: number; gradoId?: number; periodoEvaluacionId?: number }): Promise<IndicadorLogro[]> {
    const res = await api.get('/api/inicial/indicadores', { params });
    return res.data.data;
  },

  async crearIndicador(data: { grado_materia_id: number; descripcion: string; orden?: number; periodo_evaluacion_id?: number | null }) {
    const res = await api.post('/api/inicial/indicadores', data);
    return res.data.data;
  },

  async actualizarIndicador(id: number, data: Partial<IndicadorLogro>) {
    const res = await api.put(`/api/inicial/indicadores/${id}`, data);
    return res.data.data;
  },

  async eliminarIndicador(id: number) {
    const res = await api.delete(`/api/inicial/indicadores/${id}`);
    return res.data;
  },

  // Matriz de cotejo
  async getMatrizCotejo(paraleloId: number, periodoId: number, gradoMateriaId?: number): Promise<MatrizCotejoData> {
    const res = await api.get(`/api/inicial/cotejo/paralelo/${paraleloId}/periodo/${periodoId}`, {
      params: gradoMateriaId ? { gradoMateriaId } : undefined
    });
    return res.data.data;
  },

  async guardarCotejoBulk(registros: Array<{
    matricula_id: number;
    indicador_logro_id: number;
    periodo_evaluacion_id: number;
    nivel_logro_id: number | null;
    observaciones?: string | null;
  }>) {
    const res = await api.post('/api/inicial/cotejo/bulk', { registros });
    return res.data;
  },

  async getCotejoEstudiante(matriculaId: number, periodoId: number) {
    const res = await api.get(`/api/inicial/cotejo/estudiante/${matriculaId}/periodo/${periodoId}`);
    return res.data.data;
  },

  // Informes cualitativos
  async getInforme(matriculaId: number, periodoId: number): Promise<InformeCualitativo | null> {
    const res = await api.get(`/api/inicial/informe/${matriculaId}/${periodoId}`);
    return res.data.data;
  },

  async getInformesParalelo(paraleloId: number, periodoId: number): Promise<InformeCualitativo[]> {
    const res = await api.get(`/api/inicial/informe/paralelo/${paraleloId}/periodo/${periodoId}`);
    return res.data.data;
  },

  async getCentralizadorInformes(paraleloId: number) {
    const res = await api.get(`/api/inicial/centralizador/paralelo/${paraleloId}`);
    return res.data.data;
  },

  async generarInformeIA(
    matriculaId: number,
    periodoId: number,
    options?: { observacionesDocente?: string; esFinal?: boolean } | string
  ): Promise<InformeCualitativo> {
    const body = typeof options === 'string' ? { observacionesDocente: options } : (options || {});
    const res = await api.post(`/api/inicial/informe/${matriculaId}/${periodoId}/generar-ia`, body);
    return res.data.data;
  },

  // Alias para retrocompatibilidad
  async generarBorradorIA(
    matriculaId: number,
    periodoId: number,
    options?: { observacionesDocente?: string; esFinal?: boolean } | string
  ): Promise<InformeCualitativo> {
    return this.generarInformeIA(matriculaId, periodoId, options);
  },

  async guardarInforme(
    matriculaIdOrData: number | { matricula_id: number; periodo_evaluacion_id: number; texto: string; observaciones_docente?: string; estado?: 'borrador' | 'publicado' },
    periodoId?: number,
    data?: { texto: string; estado?: 'borrador' | 'publicado'; generado_por_ia?: boolean; observaciones_docente?: string }
  ): Promise<InformeCualitativo> {
    if (typeof matriculaIdOrData === 'object') {
      const obj = matriculaIdOrData;
      const res = await api.put(`/api/inicial/informe/${obj.matricula_id}/${obj.periodo_evaluacion_id}`, obj);
      return res.data.data;
    }
    const res = await api.put(`/api/inicial/informe/${matriculaIdOrData}/${periodoId}`, data);
    return res.data.data;
  },

  async publicarInforme(matriculaId: number, periodoId: number): Promise<InformeCualitativo> {
    const res = await api.post(`/api/inicial/informe/${matriculaId}/${periodoId}/publicar`);
    return res.data.data;
  },

  // Boletín / Libreta Cualitativa (PDF o Excel)
  async descargarBoletin(matriculaId: number, periodoId: number, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const res = await api.get(`/api/inicial/boletin/${matriculaId}/${periodoId}`, {
      params: { formato },
      responseType: 'blob'
    });
    return res.data;
  },

  async descargarBoletinPDF(matriculaId: number, periodoId: number): Promise<Blob> {
    return this.descargarBoletin(matriculaId, periodoId, 'pdf');
  },

  // Reporte Matriz de Listas de Cotejo (PDF / Excel)
  async descargarMatrizCotejoReporte(
    paraleloId: number,
    periodoId: number,
    formato: 'pdf' | 'excel' = 'pdf',
    params?: { materiaCodigo?: string; gradoMateriaId?: number; campoCodigo?: string }
  ): Promise<Blob> {
    const res = await api.get(`/api/inicial/cotejo/paralelo/${paraleloId}/periodo/${periodoId}/reporte`, {
      params: { formato, ...params },
      responseType: 'blob'
    });
    return res.data;
  },

  // Reporte Centralizador de Informes Cualitativos (PDF / Excel)
  async descargarCentralizadorInformesReporte(paraleloId: number, periodoId: number, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const res = await api.get(`/api/inicial/centralizador/paralelo/${paraleloId}/periodo/${periodoId}/reporte`, {
      params: { formato },
      responseType: 'blob'
    });
    return res.data;
  },

  // Asignación titular en bloque
  async asignarTitular(data: { docente_id: number; paralelo_id: number; periodo_academico_id: number }) {
    const res = await api.post('/api/inicial/asignacion-titular', data);
    return res.data;
  },

  // ── Actividades del Temario Inicial ──────────────────────────────────────
  async getActividades(params: { gradoId?: number; gradoMateriaId?: number; campoCodigo?: string }): Promise<ActividadInicial[]> {
    const res = await api.get('/api/inicial/actividades', { params });
    return res.data.data;
  },

  async crearActividad(data: {
    grado_materia_id: number;
    campo_codigo: string;
    tipo: 'video' | 'imagen' | 'actividad' | 'juego';
    titulo: string;
    descripcion?: string;
    url?: string;
    emoji?: string;
    color_fondo?: string;
    contenido_interactivo?: any;
  }): Promise<ActividadInicial> {
    const res = await api.post('/api/inicial/actividades', data);
    return res.data.data;
  },

  async actualizarActividad(id: number, data: Partial<ActividadInicial>): Promise<ActividadInicial> {
    const res = await api.put(`/api/inicial/actividades/${id}`, data);
    return res.data.data;
  },

  async eliminarActividad(id: number): Promise<void> {
    await api.delete(`/api/inicial/actividades/${id}`);
  },

  async generarActividadesIA(data: {
    campoCodigo: string;
    campoNombre: string;
    tema: string;
    gradoNombre?: string;
    formato?: 'juego' | 'actividad';
    tipoJuego?: 'memorama' | 'adivinanza' | 'arrastrar' | 'tarjetas' | 'mixto';
    cantidad?: number;
  }): Promise<any[]> {
    const res = await api.post('/api/inicial/actividades/generar-ia', data);
    return res.data.data;
  },
};
