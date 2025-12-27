// services/cursoVacacionalService.ts
import api from '@/lib/api';
import {
  PeriodoVacacional,
  PeriodoVacacionalCreate,
  PeriodoVacacionalUpdate,
  PeriodoVacacionalFilters,
  PeriodosResponse,
  CursoVacacional,
  CursoVacacionalCreate,
  CursoVacacionalUpdate,
  CursoVacacionalFilters,
  CursosResponse,
  InscripcionVacacional,
  InscripcionVacacionalCreate,
  InscripcionVacacionalUpdate,
  InscripcionVacacionalFilters,
  InscripcionesResponse,
  EstadisticasPeriodo,
  CambiarEstadoInscripcion,
  FormInscripcionPublica,
} from '@/types/cursoVacacionalTypes';

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

    console.log('🔍 [PERIODOS] Llamando API con params:', params.toString());

    const response = await api.get(`/cursos-vacacionales/periodos?${params}`);
    
    console.log('📦 [PERIODOS] Response:', response.data);
    
    // ✅ FIX: Estructura correcta
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
// CURSOS VACACIONALES
// =============================================
export const cursosVacacionalesService = {
  // ✅ FIX: listarPublico
  async listarPublico(filters: CursoVacacionalFilters = {}): Promise<CursosResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    
    // ✅ Solo agregar si existe
    if (filters.periodo_vacacional_id) {
      params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    }
    
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.con_cupos !== undefined) params.append('con_cupos', filters.con_cupos.toString());

    console.log('🔍 [PUBLIC] Llamando API con params:', params.toString());

    const response = await api.get(`/cursos-vacacionales/publico/cursos?${params}`);
    
    console.log('📦 [PUBLIC] Response:', response.data);
    
    // ✅ FIX: Retornar estructura correcta
    return {
      cursos: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  // PUBLICO: Ver detalle (sin autenticación)
  async obtenerPublico(id: number): Promise<CursoVacacional> {
    const response = await api.get(`/cursos-vacacionales/publico/cursos/${id}`);
    return response.data.data;
  },

  // ✅ FIX: listar (ADMIN)
  async listar(filters: CursoVacacionalFilters = {}): Promise<CursosResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.periodo_vacacional_id) params.append('periodo_vacacional_id', filters.periodo_vacacional_id.toString());
    if (filters.grado_id) params.append('grado_id', filters.grado_id.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.con_cupos !== undefined) params.append('con_cupos', filters.con_cupos.toString());

    console.log('🔍 [ADMIN] Llamando API con params:', params.toString());

    const response = await api.get(`/cursos-vacacionales/cursos?${params}`);
    
    console.log('📦 [ADMIN] Response:', response.data);
    
    // ✅ FIX: Retornar estructura correcta
    return {
      cursos: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPorId(id: number): Promise<CursoVacacional> {
    const response = await api.get(`/cursos-vacacionales/cursos/${id}`);
    return response.data.data;
  },

  async crear(data: CursoVacacionalCreate): Promise<CursoVacacional> {
    const response = await api.post('/cursos-vacacionales/cursos', data);
    return response.data.data;
  },

  async actualizar(id: number, data: CursoVacacionalUpdate): Promise<CursoVacacional> {
    const response = await api.put(`/cursos-vacacionales/cursos/${id}`, data);
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/cursos-vacacionales/cursos/${id}`);
  },

  async listarEstudiantes(cursoId: number, estado?: string): Promise<InscripcionVacacional[]> {
    const params = estado ? `?estado=${estado}` : '';
    const response = await api.get(`/cursos-vacacionales/cursos/${cursoId}/estudiantes${params}`);
    return response.data.data;
  },

  async generarReporte(cursoId: number, formato?: 'excel' | 'pdf'): Promise<Blob> {
    const params = formato ? `?formato=${formato}` : '';
    const response = await api.get(`/cursos-vacacionales/cursos/${cursoId}/reporte${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// =============================================
// INSCRIPCIONES
// =============================================
export const inscripcionesVacacionalesService = {
  // PUBLICO: Inscribirse (sin autenticación)
  async inscribirPublico(data: FormInscripcionPublica): Promise<InscripcionVacacional> {
    const formData = new FormData();

    // Datos del estudiante
    formData.append('curso_vacacional_id', data.curso_vacacional_id.toString());
    formData.append('nombres', data.nombres);
    formData.append('apellido_paterno', data.apellido_paterno);
    if (data.apellido_materno) formData.append('apellido_materno', data.apellido_materno);
    formData.append('fecha_nacimiento', data.fecha_nacimiento);
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
    if (data.numero_comprobante) formData.append('numero_comprobante', data.numero_comprobante);
    if (data.fecha_pago) formData.append('fecha_pago', data.fecha_pago);
    if (data.observaciones) formData.append('observaciones', data.observaciones);

    // Comprobante
    if (data.comprobante) {
      formData.append('comprobante', data.comprobante);
    }

    const response = await api.post('/cursos-vacacionales/publico/inscribir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  // ADMIN: Inscribir desde dashboard
  async inscribir(data: FormInscripcionPublica): Promise<InscripcionVacacional> {
    const formData = new FormData();

    // Datos del estudiante
    formData.append('curso_vacacional_id', data.curso_vacacional_id.toString());
    formData.append('nombres', data.nombres);
    formData.append('apellido_paterno', data.apellido_paterno);
    if (data.apellido_materno) formData.append('apellido_materno', data.apellido_materno);
    formData.append('fecha_nacimiento', data.fecha_nacimiento);
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
    if (data.numero_comprobante) formData.append('numero_comprobante', data.numero_comprobante);
    if (data.fecha_pago) formData.append('fecha_pago', data.fecha_pago);
    if (data.observaciones) formData.append('observaciones', data.observaciones);

    // Comprobante
    if (data.comprobante) {
      formData.append('comprobante', data.comprobante);
    }

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

    const response = await api.get(`/cursos-vacacionales/inscripciones?${params}`);
    
    // ✅ FIX: Estructura correcta
    return {
      inscripciones: response.data.data,
      paginacion: response.data.paginacion
    };
  },

  async obtenerPorId(id: number): Promise<InscripcionVacacional> {
    const response = await api.get(`/cursos-vacacionales/inscripciones/${id}`);
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

// =============================================
// EXPORTAR TODOS LOS SERVICIOS
// =============================================
export default {
  periodos: periodosVacacionalesService,
  cursos: cursosVacacionalesService,
  inscripciones: inscripcionesVacacionalesService,
};