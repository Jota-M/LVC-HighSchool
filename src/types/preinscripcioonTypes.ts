// src/app/dashboard/preinscripciones/types/preinscripcion.types.ts

export type EstadoPreinscripcion = 
  | 'iniciada'
  | 'datos_completos'
  | 'documentos_pendientes'
  | 'en_revision'
  | 'documentos_aprobados'
  | 'entrevista_pendiente'
  | 'entrevista_programada'
  | 'entrevista_completada'
  | 'aprobada'
  | 'rechazada'
  | 'convertida'
  | 'expirada'
  | 'cancelada';

export type GradoSolicitado = 
  | 'PRE-KINDER'
  | 'KINDER'
  | 'PRIMERO_PRIMARIA'
  | 'SEGUNDO_PRIMARIA'
  | 'TERCERO_PRIMARIA'
  | 'CUARTO_PRIMARIA'
  | 'QUINTO_PRIMARIA'
  | 'SEXTO_PRIMARIA'
  | 'PRIMERO_SECUNDARIA'
  | 'SEGUNDO_SECUNDARIA'
  | 'TERCERO_SECUNDARIA'
  | 'CUARTO_SECUNDARIA'
  | 'QUINTO_SECUNDARIA'
  | 'SEXTO_SECUNDARIA';

// =============================================
// 🆕 CUPO
// =============================================
export interface CupoPreinscripcion {
  id: number;
  periodo_academico_id: number;
  grado_id: number;
  turno_id: number;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  
  // Joins
  periodo_nombre?: string;
  grado_nombre?: string;
  turno_nombre?: string;
  nivel_academico_nombre?: string;
  porcentaje_ocupacion?: number;
}

// =============================================
// PREINSCRIPCIÓN (ACTUALIZADA)
// =============================================
export interface Preinscripcion {
  id: number;
  codigo_inscripcion: string;
  estado: EstadoPreinscripcion;
  
  // 🆕 Info de cupos
  periodo_academico_id: number | null;
  nivel_academico_id: number | null;
  grado_id: number | null;
  turno_preferido_id: number | null;
  cupo_preinscripcion_id: number | null;
  tiene_cupo_asignado: boolean;
  
  // Estudiante
  estudiante_nombre: string;
  estudiante_ci: string;
  estudiante_foto?: string;
  grado_solicitado: string;
  
  // Tutor
  tutor_nombre: string;
  tutor_telefono: string;
  
  // Joins adicionales
  grado_nombre?: string;
  turno_nombre?: string;
  periodo_nombre?: string;
  cupos_disponibles?: number;
  
  // Fechas
  created_at: string;
  fecha_aprobacion?: string | null;
  fecha_conversion?: string | null;
  
  // Metadatos
  observaciones?: string | null;
  motivo_rechazo?: string | null;
  aprobada_por?: number | null;
  convertida_por?: number | null;
  estudiante_id?: number | null;
  matricula_id?: number | null;
}

// =============================================
// ESTADÍSTICAS (ACTUALIZADA)
// =============================================
export interface PreinscripcionStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  convertidas: number;
  
  // 🆕 Stats de cupos
  con_cupo_asignado: number;
  sin_cupo_asignado: number;
  
  // Por periodo
  por_periodo?: {
    periodo_nombre: string;
    total: number;
    con_cupo: number;
  }[];
}

// =============================================
// FILTROS (ACTUALIZADA)
// =============================================
export interface PreinscripcionFilters {
  searchTerm: string;
  estadoFilter: string;
  gradoFilter: string;
  turnoFilter: string; // 🆕
  periodoFilter: string; // 🆕
  conCupoFilter: string; // 🆕 'todos' | 'con_cupo' | 'sin_cupo'
}

// =============================================
// CONFIGURACIÓN DE ESTADOS
// =============================================
export interface EstadoConfig {
  label: string;
  color: string;
  bgcolor: string;
  icon: React.ReactElement;
  descripcion?: string;
}

// =============================================
// API RESPONSES
// =============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PreinscripcionesResponse {
  preinscripciones: Preinscripcion[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PreinscripcionDetalle extends Preinscripcion {
  estudiante: {
    id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    ci: string | null;
    rude: string | null;
    fecha_nacimiento: string;
    genero: string | null;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    foto_url: string | null;
  };
  tutor: {
    id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    ci: string;
    telefono: string;
    celular: string | null;
    email: string | null;
    parentesco: string | null;
  };
  documentos: Array<{
    id: number;
    tipo_documento: string;
    nombre_archivo: string | null;
    url_archivo: string | null;
    subido: boolean;
    verificado: boolean;
    requiere_correccion: boolean;
    motivo_correccion: string | null;
  }>;
  cupo?: CupoPreinscripcion;
}

// =============================================
// REQUESTS
// =============================================
export interface CambiarEstadoRequest {
  estado: EstadoPreinscripcion;
  observaciones?: string;
}

export interface ConvertirEstudianteRequest {
  paralelo_id: number;
  periodo_academico_id: number;
}

export interface ExportarRequest {
  estado?: string;
  grado?: string;
  turno?: string;
  periodo?: string;
  formato: 'excel' | 'pdf';
}