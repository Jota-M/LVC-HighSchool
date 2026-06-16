// types/matriculacionTypes.ts

// ============================================================
// ESTUDIANTES ELEGIBLES
// ============================================================
export interface EstudianteElegible {
  id: number;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  fecha_nacimiento: string;
  ci: string | null;
  foto_url: string | null;
  telefono: string | null;
  email: string | null;
  matricula_actual_id: number | null;
  matricula_estado: string | null;
  periodo_actual: string | null;
  paralelo_actual: string | null;
  grado_actual: string | null;
  ultima_matricula: {
    periodo: string;
    grado: string;
    paralelo: string;
    estado: string;
  } | null;
}

export interface EstudiantesElegiblesResponse {
  estudiantes: EstudianteElegible[];
  paginacion: Paginacion;
}

// ============================================================
// PAGINACIÓN
// ============================================================
export interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// MATRÍCULA - CREAR
// ============================================================
export interface MatriculaCreate {
  paralelo_id: number;
  periodo_academico_id: number;
  numero_matricula?: string;
  fecha_matricula?: string;
  es_repitente?: boolean;
  es_becado?: boolean;
  porcentaje_beca?: number | null;
  tipo_beca?: string | null;
  observaciones?: string | null;
}

// ============================================================
// MATRÍCULA - RESPUESTA BASE (listado)
// ============================================================
export interface MatriculaResponse {
  id: number;
  numero_matricula: string;
  fecha_matricula: string;
  fecha_retiro: string | null;
  motivo_retiro: string | null;
  estado: EstadoMatricula;
  es_repitente: boolean;
  es_becado: boolean;
  porcentaje_beca: number | null;
  tipo_beca: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;

  // Estudiante
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string | null;
  estudiante_fecha_nacimiento: string;
  estudiante_ci: string | null;
  estudiante_foto: string | null;
  estudiante_telefono: string | null;

  // Periodo
  periodo_id: number;
  periodo_nombre: string;
  periodo_codigo: string;
  periodo_fecha_inicio: string;
  periodo_fecha_fin: string;

  // Paralelo / Grado
  paralelo_id: number;
  paralelo_nombre: string;
  aula: string | null;
  capacidad_maxima: number;
  grado_id: number;
  grado_nombre: string;
  nivel_id: number;
  nivel_nombre: string;
  turno_nombre: string;
}

// ============================================================
// MATRÍCULA - DETALLE COMPLETO (GET /:id)
// ============================================================
export interface MatriculaDetalle extends MatriculaResponse {
  // Datos extra del estudiante
  estudiante_fecha_nacimiento: string;
  estudiante_direccion: string | null;
  estudiante_zona: string | null;
  estudiante_ciudad: string | null;
  estudiante_username: string | null;
  estudiante_email: string | null;

  // Turno con horario
  turno_hora_inicio: string | null;
  turno_hora_fin: string | null;

  // Usuario que registró
  usuario_registrador: string | null;
  usuario_email: string | null;
}

export interface MatriculaDetalleResponse {
  matricula: MatriculaDetalle;
  documentos: MatriculaDocumento[];
  historial: HistorialMatricula[];
}

// ============================================================
// HISTORIAL DE CAMBIOS
// ============================================================
export interface HistorialMatricula {
  accion: string;
  mensaje: string;
  created_at: string;
  datos_anteriores: Record<string, any> | null;
  datos_nuevos: Record<string, any> | null;
  usuario: string | null;
}

// ============================================================
// DOCUMENTO DE MATRÍCULA
// ============================================================
export const TIPOS_DOCUMENTO_MATRICULA = [
  'cedula_estudiante',
  'certificado_nacimiento',
  'certificado_nacimiento_padre',
  'libreta_notas',
  'foto_carnet',
  'otro',
] as const;

export type TipoDocumentoMatricula = typeof TIPOS_DOCUMENTO_MATRICULA[number];

export interface MatriculaDocumento {
  id: number;
  matricula_id: number;
  tipo_documento: TipoDocumentoMatricula | string;
  nombre_archivo: string;
  url_archivo: string;
  verificado: boolean;
  fecha_verificacion: string | null;
  verificado_por_username: string | null;
  observaciones: string | null;
  created_at: string;
}

export interface SubirDocumentosData {
  files: File[];
  metadata: Array<{
    tipo_documento: TipoDocumentoMatricula | string;
    observaciones?: string;
  }>;
}

// ============================================================
// DISPONIBILIDAD DE PARALELO
// ============================================================
export interface DisponibilidadParalelo {
  paralelo: {
    id: number;
    nombre: string;
    grado: string;
    turno: string;
    aula: string | null;
  };
  capacidad: {
    maxima: number;
    ocupada: number;
    disponible: number;
    porcentaje_ocupacion: string;
    puede_matricular: boolean;
  };
}

// ============================================================
// ACCIONES SOBRE MATRÍCULA
// ============================================================
export interface MatriculaUpdate {
  paralelo_id?: number;
  es_becado?: boolean;
  porcentaje_beca?: number | null;
  tipo_beca?: string | null;
  observaciones?: string | null;
}

export interface TransferenciaParalelo {
  nuevo_paralelo_id: number;
  motivo: string;
}

export interface CambioEstado {
  estado: EstadoMatricula;
  motivo?: string;
}

export interface RetiroMatricula {
  motivo_retiro: string;
}

// ============================================================
// ESTADOS
// ============================================================
export type EstadoMatricula =
  | 'activo'
  | 'retirado'
  | 'trasladado'
  | 'anulado'
  | 'suspendido'
  | 'congelado';

export const ESTADOS_MATRICULA: Record<EstadoMatricula, { label: string; color: string }> = {
  activo:     { label: 'Activo',     color: 'success' },
  retirado:   { label: 'Retirado',   color: 'error' },
  trasladado: { label: 'Trasladado', color: 'warning' },
  anulado:    { label: 'Anulado',    color: 'default' },
  suspendido: { label: 'Suspendido', color: 'warning' },
  congelado:  { label: 'Congelado',  color: 'info' },
};

// ============================================================
// ESTADÍSTICAS
// ============================================================
export interface EstadisticasMatricula {
  resumen: {
    total_matriculas: number;
    activas: number;
    retirados: number;
    becados: number;
    repitentes: number;
    paralelos_con_estudiantes: number;
  };
  por_grado: Array<{
    grado: string;
    total: number;
    activos: number;
    retirados: number;
  }>;
  por_paralelo: Array<{
    paralelo: string;
    grado: string;
    turno: string;
    capacidad_maxima: number;
    matriculados: number;
    disponibles: number;
  }>;
}

// ============================================================
// MATRICULACIÓN (crear con documentos)
// ============================================================
export interface DocumentoMatricula {
  tipo_documento: TipoDocumentoMatricula | string;
  observaciones?: string;
}

export interface MatriculacionData {
  matricula: MatriculaCreate;
  documentos?: DocumentoMatricula[];
  documentos_archivos?: Array<{
    file: File;
    tipo_documento: string;
    observaciones?: string;
  }>;
}

export interface RematriculacionData {
  periodo_academico_id: number;
  paralelo_id: number;
  es_repitente?: boolean;
  es_becado?: boolean;
  porcentaje_beca?: number | null;
  tipo_beca?: string | null;
  observaciones?: string | null;
}

// ============================================================
// FILTROS
// ============================================================
export interface MatriculasFilters {
  page?: number;
  limit?: number;
  search?: string;
  periodo_academico_id?: number;
  paralelo_id?: number;
  grado_id?: number;
  nivel_academico_id?: number;
  estado?: EstadoMatricula;
}

// ============================================================
// RESPONSES GENÉRICAS
// ============================================================
export interface MatriculasResponse {
  matriculas: MatriculaResponse[];
  paginacion: Paginacion;
}

export interface MatriculacionResponse {
  success: boolean;
  message: string;
  data: {
    matricula: MatriculaDetalle;
    documentos?: MatriculaDocumento[];
  };
}

// ============================================================
// FORMULARIO
// ============================================================
export interface MatriculacionFormData {
  periodo_academico_id: number | null;
  paralelo_id: number | null;
  es_repitente: boolean;
  es_becado: boolean;
  porcentaje_beca: number | null;
  tipo_beca: string;
  observaciones: string;
  documentos: Array<{
    tipo_documento: TipoDocumentoMatricula | string;
    file: File | null;
    observaciones: string;
  }>;
}