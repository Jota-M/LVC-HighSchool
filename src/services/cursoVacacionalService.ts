// services/cursoVacacionalService.ts
import api from '@/lib/api';
import {
  PaqueteVacacional,
  PeriodoVacacional,
  PeriodoVacacionalCreate,
  PeriodoVacacionalUpdate,
  PeriodoVacacionalFilters,
  PeriodosResponse,
  CursoVacacional,
  CursoVacacionalFilters,
  CursosResponse,
  InscripcionVacacional,
  InscripcionVacacionalFilters,
  InscripcionesResponse,
  EstadisticasPeriodo,
  CambiarEstadoInscripcion,
  FormInscripcionPublica,
  FormCursoVacacional,
  InscripcionGrupalResponse,
  InscripcionVacacionalUpdate
} from '@/types/cursoVacacionalTypes';

// =============================================
// PAQUETES VACACIONALES
// =============================================
export const paquetesVacacionalesService = {
  async listar(): Promise<PaqueteVacacional[]> {
    const response = await api.get('/cursos-vacacionales/publico/paquetes');
    return response.data.data;
  },

  async obtenerPorId(id: number): Promise<PaqueteVacacional> {
    const response = await api.get(`/cursos-vacacionales/publico/paquetes/${id}`);
    return response.data.data;
  },
};

// =============================================
// PERIODOS VACACIONALES
// =============================================
export const periodosVacacionalesService = {
  async listar(filters: PeriodoVacacionalFilters = {}): Promise<PeriodosResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.anio) params.append('anio', filters.anio.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());

    const response = await api.get(`/cursos-vacacionales/periodos?${params}`);
    
    return {
      periodos: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPorId(id: number): Promise<PeriodoVacacional> {
    const response = await api.get(`/cursos-vacacionales/periodos/${id}`);
    return response.data.data;
  },

  async obtenerActivo(): Promise<PeriodoVacacional | null> {
    try {
      const response = await api.get('/cursos-vacacionales/publico/periodo-activo');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  async crear(data: PeriodoVacacionalCreate): Promise<PeriodoVacacional> {
    const response = await api.post('/cursos-vacacionales/periodos', data);
    return response.data.data;
  },

  async actualizar(id: number, data: PeriodoVacacionalUpdate): Promise<PeriodoVacacional> {
    const response = await api.put(`/cursos-vacacionales/periodos/${id}`, data);
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/cursos-vacacionales/periodos/${id}`);
  },

  async obtenerEstadisticas(periodoId: number): Promise<EstadisticasPeriodo> {
    const response = await api.get(`/cursos-vacacionales/periodos/${periodoId}/estadisticas`);
    return response.data.data;
  },
};

// =============================================
// CURSOS VACACIONALES (CON FOTO)
// =============================================
export const cursosVacacionalesService = {
  async listarPublico(filters: CursoVacacionalFilters = {}): Promise<CursosResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.periodo_vacacional_id) {
      params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    }
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.con_cupos !== undefined) params.append('con_cupos', filters.con_cupos.toString());

    const response = await api.get(`/cursos-vacacionales/publico/cursos?${params}`);
    
    return {
      cursos: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPublico(id: number): Promise<CursoVacacional> {
    const response = await api.get(`/cursos-vacacionales/publico/cursos/${id}`);
    return response.data.data;
  },

  async listar(filters: CursoVacacionalFilters = {}): Promise<CursosResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.periodo_vacacional_id) params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.con_cupos !== undefined) params.append('con_cupos', filters.con_cupos.toString());

    const response = await api.get(`/cursos-vacacionales/cursos?${params}`);
    
    return {
      cursos: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPorId(id: number): Promise<CursoVacacional> {
    const response = await api.get(`/cursos-vacacionales/cursos/${id}`);
    return response.data.data;
  },

  async crear(data: FormCursoVacacional): Promise<CursoVacacional> {
    const formData = new FormData();
    
    formData.append('periodo_vacacional_id', data.periodo_vacacional_id.toString());
    formData.append('nombre', data.nombre);
    formData.append('fecha_inicio', data.fecha_inicio);
    formData.append('fecha_fin', data.fecha_fin);
    formData.append('cupos_totales', data.cupos_totales.toString());
    formData.append('costo', data.costo.toString());
    
    if (data.materia_id) formData.append('materia_id', data.materia_id.toString());
    if (data.grado_id) formData.append('grado_id', data.grado_id.toString());
    if (data.codigo) formData.append('codigo', data.codigo);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.dias_semana) formData.append('dias_semana', data.dias_semana);
    if (data.hora_inicio) formData.append('hora_inicio', data.hora_inicio);
    if (data.hora_fin) formData.append('hora_fin', data.hora_fin);
    if (data.aula) formData.append('aula', data.aula);
    if (data.requisitos) formData.append('requisitos', data.requisitos);
    if (data.activo !== undefined) formData.append('activo', data.activo.toString());
    if (data.foto) formData.append('foto', data.foto);

    const response = await api.post('/cursos-vacacionales/cursos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.data;
  },

  async actualizar(id: number, data: FormCursoVacacional): Promise<CursoVacacional> {
    const formData = new FormData();
    
    if (data.nombre) formData.append('nombre', data.nombre);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.fecha_inicio) formData.append('fecha_inicio', data.fecha_inicio);
    if (data.fecha_fin) formData.append('fecha_fin', data.fecha_fin);
    if (data.dias_semana) formData.append('dias_semana', data.dias_semana);
    if (data.hora_inicio) formData.append('hora_inicio', data.hora_inicio);
    if (data.hora_fin) formData.append('hora_fin', data.hora_fin);
    if (data.cupos_totales) formData.append('cupos_totales', data.cupos_totales.toString());
    if (data.costo) formData.append('costo', data.costo.toString());
    if (data.aula) formData.append('aula', data.aula);
    if (data.requisitos) formData.append('requisitos', data.requisitos);
    if (data.activo !== undefined) formData.append('activo', data.activo.toString());
    if (data.foto) formData.append('foto', data.foto);

    const response = await api.put(`/cursos-vacacionales/cursos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/cursos-vacacionales/cursos/${id}`);
  },

  async eliminarFoto(id: number): Promise<CursoVacacional> {
    const response = await api.delete(`/cursos-vacacionales/cursos/${id}/foto`);
    return response.data.data;
  },

  async listarEstudiantes(cursoId: number, estado?: string): Promise<InscripcionVacacional[]> {
    const params = estado ? `?estado=${estado}` : '';
    const response = await api.get(`/cursos-vacacionales/cursos/${cursoId}/estudiantes${params}`);
    return response.data.data;
  },
};
// =============================================
// INSCRIPCIONES CORREGIDO
// =============================================
export const inscripcionesVacacionalesService = {
  async inscribirPublico(data: FormInscripcionPublica): Promise<InscripcionGrupalResponse> {
    const formData = new FormData();

    if (!data.cursos || !Array.isArray(data.cursos) || data.cursos.length === 0) {
      throw new Error('Debe seleccionar al menos un curso');
    }
    formData.append('cursos', JSON.stringify(data.cursos));

    if (data.paquete_id) {
      formData.append('paquete_id', data.paquete_id.toString());
    }

    // Datos del estudiante
    formData.append('nombres', data.nombres);
    formData.append('apellido_paterno', data.apellido_paterno);
    formData.append('fecha_nacimiento', data.fecha_nacimiento);
    
    if (data.apellido_materno) formData.append('apellido_materno', data.apellido_materno);
    if (data.ci) formData.append('ci', data.ci);
    if (data.genero) formData.append('genero', data.genero);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.email) formData.append('email', data.email);

    // Datos del tutor
    formData.append('nombre_tutor', data.nombre_tutor);
    formData.append('telefono_tutor', data.telefono_tutor);
    
    if (data.email_tutor) formData.append('email_tutor', data.email_tutor);
    if (data.parentesco_tutor) formData.append('parentesco_tutor', data.parentesco_tutor);

    // Pago
    formData.append('monto_pagado', data.monto_pagado.toString());
    
    // NUEVO: Método de pago
    if (data.metodo_pago) {
      formData.append('metodo_pago', data.metodo_pago);
    }
    
    // Solo para transferencia/QR
    if (data.numero_comprobante) formData.append('numero_comprobante', data.numero_comprobante);
    if (data.comprobante) formData.append('comprobante', data.comprobante);
    
    if (data.fecha_pago) formData.append('fecha_pago', data.fecha_pago);
    if (data.observaciones) formData.append('observaciones', data.observaciones);
    if (data.observaciones_pago) formData.append('observaciones_pago', data.observaciones_pago);

    const response = await api.post('/cursos-vacacionales/publico/inscribir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  async inscribir(data: FormInscripcionPublica): Promise<InscripcionGrupalResponse> {
    // Misma lógica que inscribirPublico, pero usa /inscripciones
    const formData = new FormData();

    if (!data.cursos || !Array.isArray(data.cursos) || data.cursos.length === 0) {
      throw new Error('Debe seleccionar al menos un curso');
    }
    formData.append('cursos', JSON.stringify(data.cursos));

    if (data.paquete_id) formData.append('paquete_id', data.paquete_id.toString());

    formData.append('nombres', data.nombres);
    formData.append('apellido_paterno', data.apellido_paterno);
    formData.append('fecha_nacimiento', data.fecha_nacimiento);
    
    if (data.apellido_materno) formData.append('apellido_materno', data.apellido_materno);
    if (data.ci) formData.append('ci', data.ci);
    if (data.genero) formData.append('genero', data.genero);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.email) formData.append('email', data.email);

    formData.append('nombre_tutor', data.nombre_tutor);
    formData.append('telefono_tutor', data.telefono_tutor);
    
    if (data.email_tutor) formData.append('email_tutor', data.email_tutor);
    if (data.parentesco_tutor) formData.append('parentesco_tutor', data.parentesco_tutor);

    formData.append('monto_pagado', data.monto_pagado.toString());
    
    // NUEVO: Método de pago
    if (data.metodo_pago) formData.append('metodo_pago', data.metodo_pago);
    
    if (data.numero_comprobante) formData.append('numero_comprobante', data.numero_comprobante);
    if (data.comprobante) formData.append('comprobante', data.comprobante);
    if (data.fecha_pago) formData.append('fecha_pago', data.fecha_pago);
    if (data.observaciones) formData.append('observaciones', data.observaciones);
    if (data.observaciones_pago) formData.append('observaciones_pago', data.observaciones_pago);

    const response = await api.post('/cursos-vacacionales/inscripciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  async listar(filters: InscripcionVacacionalFilters = {}): Promise<InscripcionesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.curso_vacacional_id) params.append('curso_vacacional_id', filters.curso_vacacional_id.toString());
    if (filters.periodo_vacacional_id) params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.pago_verificado !== undefined) params.append('pago_verificado', filters.pago_verificado.toString());
    if (filters.codigo_grupo) params.append('codigo_grupo', filters.codigo_grupo);

    const response = await api.get(`/cursos-vacacionales/inscripciones?${params}`);
    
    return {
      inscripciones: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPorId(id: number): Promise<InscripcionVacacional> {
    const response = await api.get(`/cursos-vacacionales/inscripciones/${id}`);
    return response.data.data;
  },

  async obtenerPorGrupo(codigo_grupo: string): Promise<InscripcionVacacional[]> {
    const response = await api.get(`/cursos-vacacionales/inscripciones/grupo/${codigo_grupo}`);
    return response.data.data;
  },

  async actualizar(id: number, data: InscripcionVacacionalUpdate): Promise<InscripcionVacacional> {
  const response = await api.put(`/cursos-vacacionales/inscripciones/${id}`, data);
  return response.data.data;
},

  async verificarPago(id: number): Promise<InscripcionVacacional> {
    const response = await api.post(`/cursos-vacacionales/inscripciones/${id}/verificar-pago`);
    return response.data.data;
  },

  async cambiarEstado(id: number, data: CambiarEstadoInscripcion): Promise<InscripcionVacacional> {
    const response = await api.put(`/cursos-vacacionales/inscripciones/${id}/cambiar-estado`, data);
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/cursos-vacacionales/inscripciones/${id}`);
  },

};
export const inscripcionPDFService = {
  /**
   * Descarga el PDF del recibo de inscripción
   */
  async descargarPDF(inscripcionId: number): Promise<void> {
    try {
      const response = await api.get(
        `/cursos-vacacionales/inscripciones/${inscripcionId}/pdf`,
        {
          responseType: 'blob',
        }
      );

      // Extraer el nombre del archivo desde los headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Recibo_Inscripcion_${inscripcionId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  },

  /**
   * Abre el PDF en una nueva pestaña para preview
   */
  async previsualizarPDF(inscripcionId: number): Promise<void> {
    try {
      const response = await api.get(
        `/cursos-vacacionales/inscripciones/${inscripcionId}/pdf/preview`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error al previsualizar PDF:', error);
      throw error;
    }
  },

  /**
   * Obtiene la URL del PDF para mostrar en un iframe
   */
  getPDFUrl(inscripcionId: number): string {
    return `/api/cursos-vacacionales/inscripciones/${inscripcionId}/pdf/preview`;
  },
};


export default {
  paquetes: paquetesVacacionalesService,
  periodos: periodosVacacionalesService,
  cursos: cursosVacacionalesService,
  inscripciones: inscripcionesVacacionalesService,
  pdf: inscripcionPDFService,
};