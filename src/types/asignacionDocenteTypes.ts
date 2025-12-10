// types/asignacionDocenteTypes.ts

// ============================================
// INTERFAZ PRINCIPAL - ASIGNACIÓN DOCENTE
// ============================================

export interface AsignacionDocente {
  id: number;
  docente_id: number;
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular: boolean;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Datos relacionados (joins)
  docente_codigo?: string;
  docente_nombres?: string;
  docente_apellidos?: string;
  docente_foto?: string;
  docente_email?: string;
  docente_telefono?: string;
  especialidad?: string;
  
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

// ============================================
// CARGA HORARIA DEL DOCENTE
// ============================================

export interface CargaHoraria {
  total_horas: number;
  total_asignaciones: number;
  total_paralelos: number;
}

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

export interface CrearAsignacionDTO {
  docente_id: number;
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular?: boolean;
  fecha_inicio?: string;
}

export interface ActualizarAsignacionDTO {
  es_titular?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
}

export interface CambiarDocenteDTO {
  nuevo_docente_id: number;
}

export interface AsignacionMasivaDTO {
  asignaciones: CrearAsignacionDTO[];
  periodo_academico_id: number;
}

export interface CopiarPeriodoDTO {
  periodo_origen_id: number;
  periodo_destino_id: number;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface AsignacionResponse {
  success: boolean;
  message: string;
  data: {
    asignacion: AsignacionDocente;
  };
}

export interface AsignacionesListResponse {
  success: boolean;
  data: {
    asignaciones: AsignacionDocente[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AsignacionesPorDocenteResponse {
  success: boolean;
  data: {
    asignaciones: AsignacionDocente[];
    carga_horaria: CargaHoraria | null;
  };
}

export interface AsignacionesPorParaleloResponse {
  success: boolean;
  data: {
    asignaciones: AsignacionDocente[];
  };
}

export interface AsignacionMasivaResponse {
  success: boolean;
  message: string;
  data: {
    exitosas: AsignacionDocente[];
    fallidas: Array<{
      error: string;
      [key: string]: any;
    }>;
    omitidas: Array<{
      razon: string;
      [key: string]: any;
    }>;
  };
}

export interface CopiarPeriodoResponse {
  success: boolean;
  message: string;
  data: {
    asignaciones: AsignacionDocente[];
  };
}

// ============================================
// FILTROS Y PAGINACIÓN
// ============================================

export interface AsignacionesFiltros {
  page?: number;
  limit?: number;
  docente_id?: number;
  grado_id?: number;
  materia_id?: number;
  paralelo_id?: number;
  periodo_academico_id?: number;
  activo?: boolean;
}

// ============================================
// DATOS PARA SELECTORES
// ============================================

export interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  grado_nombre: string;
  materia_nombre: string;
  materia_codigo: string;
  nivel_nombre: string;
  
  // Campos de materia
  horas_semanales: number;
  creditos?: number;
  es_obligatoria?: boolean;
  tiene_laboratorio?: boolean;
  materia_color?: string;
  materia_descripcion?: string;
  
  // Campos de grado_materia
  orden: number;
  nota_minima_aprobacion?: number;
  peso_porcentual?: number | null;
  activo: boolean;
  
  // Campos del área
  area_nombre?: string;
  area_color?: string;
}

// Nueva interfaz para la respuesta agrupada
export interface GradoConMaterias {
  grado_id: number;
  grado_codigo?: string;
  grado_nombre: string;
  grado_orden: number;
  nivel_id: number;
  nivel_codigo?: string;
  nivel_nombre: string;
  nivel_orden: number;
  materias: GradoMateria[];
}

export interface GradoMateriasResponse {
  success: boolean;
  data: {
    grados: GradoConMaterias[];
    total_grados: number;
    total_materias: number;
  };
}

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  color?: string;
  horas_semanales: number;
}

export interface Paralelo {
  id: number;
  nombre: string;
  grado_id: number;
  turno_id: number;
  capacidad: number;
  turno_nombre?: string;
  grado_nombre?: string;
}

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}