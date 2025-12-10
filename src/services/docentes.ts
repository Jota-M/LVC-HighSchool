import api from '../lib/api';

// ============== INTERFACES ==============
export interface Docente {
  id: number;
  usuario_id?: number;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  apellidos: string;
  ci: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  titulo_profesional?: string;
  titulo_postgrado?: string;
  especialidad?: string;
  nivel_formacion?: 'bachiller' | 'licenciatura' | 'maestria' | 'doctorado';
  experiencia_anios?: number;
  salario_mensual?: number;
  numero_cuenta?: string;
  fecha_contratacion?: string;
  fecha_retiro?: string;
  tipo_contrato?: 'planta' | 'contrato' | 'honorarios' | 'medio_tiempo';
  foto_url?: string;
  cv_url?: string;
  activo: boolean;
  username?: string;
  total_asignaciones?: number;
  created_at: string;
  updated_at: string;
}

export interface DocenteFormData {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci: string;
  fecha_nacimiento?: string;
  genero?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  titulo_profesional?: string;
  titulo_postgrado?: string;
  especialidad?: string;
  nivel_formacion?: string;
  experiencia_anios?: number;
  salario_mensual?: number;
  numero_cuenta?: string;
  fecha_contratacion?: string;
  tipo_contrato?: string;
}

export interface AsignacionDocente {
  id: number;
  docente_id: number;
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo: boolean;
  // Datos relacionados
  docente_codigo?: string;
  docente_nombres?: string;
  docente_apellidos?: string;
  docente_foto?: string;
  materia_nombre?: string;
  materia_codigo?: string;
  materia_color?: string;
  horas_semanales?: number;
  grado_nombre?: string;
  nivel_nombre?: string;
  paralelo_nombre?: string;
  turno_nombre?: string;
  periodo_nombre?: string;
  total_estudiantes?: number;
}

export interface AsignacionFormData {
  docente_id: number;
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular?: boolean;
  fecha_inicio?: string;
}

export interface DocenteEstadisticas {
  asignaciones_activas: number;
  paralelos_asignados: number;
  materias_diferentes: number;
}

export interface CargaHoraria {
  total_horas: number;
  total_asignaciones: number;
  total_paralelos: number;
}

export interface RegistroCompletoData {
  docente: DocenteFormData;
  crear_usuario?: boolean;
  credenciales?: {
    username?: string;
    password?: string;
    email?: string;
  };
  asignaciones?: AsignacionFormData[];
}

// ============== RESPONSES ==============
interface DocentesResponse {
  success: boolean;
  data: {
    docentes: Docente[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface DocenteResponse {
  success: boolean;
  data: {
    docente: Docente;
    estadisticas?: DocenteEstadisticas;
  };
}

interface AsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: AsignacionDocente[];
    carga_horaria?: CargaHoraria;
  };
}

// ============== SERVICIO ==============
class DocentesService {
  // ========== DOCENTES ==========
  
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    activo?: boolean;
    tipo_contrato?: string;
    especialidad?: string;
  }): Promise<DocentesResponse> {
    const { data } = await api.get<DocentesResponse>('/docente', { params });
    return data;
  }

  async obtenerPorId(id: number): Promise<DocenteResponse> {
    const { data } = await api.get<DocenteResponse>(`/docente/${id}`);
    return data;
  }

  async registroCompleto(datos: RegistroCompletoData, files?: { foto?: File; cv?: File }): Promise<any> {
    const formData = new FormData();
    formData.append('docente', JSON.stringify(datos.docente));
    formData.append('crear_usuario', String(datos.crear_usuario || false));
    
    if (datos.credenciales) {
      formData.append('credenciales', JSON.stringify(datos.credenciales));
    }
    if (datos.asignaciones) {
      formData.append('asignaciones', JSON.stringify(datos.asignaciones));
    }
    if (files?.foto) {
      formData.append('foto', files.foto);
    }
    if (files?.cv) {
      formData.append('cv', files.cv);
    }

    const { data } = await api.post('/docente/registro-completo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  async actualizar(id: number, datos: Partial<DocenteFormData>, foto?: File): Promise<DocenteResponse> {
    const formData = new FormData();
    Object.entries(datos).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    if (foto) formData.append('foto', foto);

    const { data } = await api.put<DocenteResponse>(`/docente/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/docente/${id}`);
    return data;
  }

  async crearUsuario(id: number, credenciales?: { username?: string; password?: string; email?: string }): Promise<any> {
    const { data } = await api.post(`/docente/${id}/crear-usuario`, credenciales || {});
    return data;
  }

  // ========== ASIGNACIONES ==========

  async listarAsignaciones(params?: {
    docente_id?: number;
    grado_id?: number;
    materia_id?: number;
    paralelo_id?: number;
    periodo_academico_id?: number;
    activo?: boolean;
  }): Promise<AsignacionesResponse> {
    const { data } = await api.get<AsignacionesResponse>('/asignacion-docente', { params });
    return data;
  }

  async obtenerAsignacionesDocente(docenteId: number, periodoId?: number): Promise<AsignacionesResponse> {
    const params = periodoId ? { periodo_academico_id: periodoId } : {};
    const { data } = await api.get<AsignacionesResponse>(`/asignacion-docente/docente/${docenteId}`, { params });
    return data;
  }

  async obtenerDocentesParalelo(paraleloId: number, periodoId: number): Promise<AsignacionesResponse> {
    const { data } = await api.get<AsignacionesResponse>(`/asignacion-docente/paralelo/${paraleloId}`, {
      params: { periodo_academico_id: periodoId }
    });
    return data;
  }

  async asignar(datos: AsignacionFormData): Promise<any> {
    const { data } = await api.post('/asignacion-docente', datos);
    return data;
  }

  async asignarMasivo(asignaciones: AsignacionFormData[], periodoId: number): Promise<any> {
    const { data } = await api.post('/asignacion-docente/masivo', {
      asignaciones,
      periodo_academico_id: periodoId
    });
    return data;
  }

  async actualizarAsignacion(id: number, datos: Partial<AsignacionFormData>): Promise<any> {
    const { data } = await api.put(`/asignacion-docente/${id}`, datos);
    return data;
  }

  async cambiarDocente(asignacionId: number, nuevoDocenteId: number): Promise<any> {
    const { data } = await api.put(`/asignacion-docente/${asignacionId}/cambiar-docente`, {
      nuevo_docente_id: nuevoDocenteId
    });
    return data;
  }

  async eliminarAsignacion(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/asignacion-docente/${id}`);
    return data;
  }

  async copiarDePeriodo(periodoOrigenId: number, periodoDestinoId: number): Promise<any> {
    const { data } = await api.post('/asignacion-docente/copiar-periodo', {
      periodo_origen_id: periodoOrigenId,
      periodo_destino_id: periodoDestinoId
    });
    return data;
  }

  // ========== UTILIDADES ==========

  getNivelFormacionLabel(nivel?: string): string {
    const labels: Record<string, string> = {
      bachiller: 'Bachiller',
      licenciatura: 'Licenciatura',
      maestria: 'Maestría',
      doctorado: 'Doctorado'
    };
    return nivel ? labels[nivel] || nivel : 'No especificado';
  }

  getTipoContratoLabel(tipo?: string): string {
    const labels: Record<string, string> = {
      planta: 'Planta',
      contrato: 'Contrato',
      honorarios: 'Honorarios',
      medio_tiempo: 'Medio Tiempo'
    };
    return tipo ? labels[tipo] || tipo : 'No especificado';
  }

  getTipoContratoColor(tipo?: string): string {
    const colors: Record<string, string> = {
      planta: '#4caf50',
      contrato: '#2196f3',
      honorarios: '#ff9800',
      medio_tiempo: '#9c27b0'
    };
    return tipo ? colors[tipo] || '#grey' : '#grey';
  }
}

export default new DocentesService();