// types/matriculacion.types.ts

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
  
  // Matrícula actual (si existe)
  matricula_actual_id: number | null;
  matricula_estado: string | null;
  periodo_actual: string | null;
  paralelo_actual: string | null;
  grado_actual: string | null;
  
  // Última matrícula
  ultima_matricula: {
    periodo: string;
    grado: string;
    paralelo: string;
    estado: string;
  } | null;
}

export interface EstudiantesElegiblesResponse {
  estudiantes: EstudianteElegible[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

export interface MatriculaResponse {
  id: number;
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string | null;
  estudiante_fecha_nacimiento: string;
  estudiante_ci: string | null;
  estudiante_foto: string | null;
  estudiante_telefono: string | null;
  
  periodo_id: number;
  periodo_nombre: string;
  periodo_codigo: string;
  periodo_fecha_inicio: string;
  periodo_fecha_fin: string;
  
  paralelo_id: number;
  paralelo_nombre: string;
  aula: string | null;
  capacidad_maxima: number;
  
  grado_id: number;
  grado_nombre: string;
  
  nivel_id: number;
  nivel_nombre: string;
  
  turno_nombre: string;
  
  numero_matricula: string;
  fecha_matricula: string;
  estado: 'activo' | 'retirado' | 'trasladado' | 'graduado' | 'suspendido' | 'congelado';
  es_repitente: boolean;
  es_becado: boolean;
  porcentaje_beca: number | null;
  tipo_beca: string | null;
  observaciones: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface DocumentoMatricula {
  tipo_documento: string;
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

export interface MatriculasFilters {
  page?: number;
  limit?: number;
  search?: string;
  periodo_academico_id?: number;
  paralelo_id?: number;
  grado_id?: number;
  nivel_academico_id?: number;
  estado?: 'activo' | 'retirado' | 'trasladado' | 'graduado' | 'suspendido' | 'congelado';
}

export interface MatriculasResponse {
  matriculas: MatriculaResponse[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
  }>;
}

export interface MatriculaUpdate {
  paralelo_id?: number;
  es_becado?: boolean;
  porcentaje_beca?: number | null;
  tipo_beca?: string | null;
  observaciones?: string | null;
}

export interface RetiroMatricula {
  motivo_retiro: string;
}

// Tipos para documentos
export const TIPOS_DOCUMENTO_MATRICULA = [
  'cedula_estudiante',
  'certificado_nacimiento',
  'certificado_nacimiento_Padre',
  'libreta_notas',
  'otro',
] as const;

export type TipoDocumentoMatricula = typeof TIPOS_DOCUMENTO_MATRICULA[number];

export interface DocumentoArchivo {
  id: number;
  tipo_documento: TipoDocumentoMatricula;
  nombre_archivo: string;
  url_archivo: string;
  verificado: boolean;
  observaciones: string | null;
  created_at: string;
}

// Para el formulario
export interface MatriculacionFormData {
  // Matrícula
  periodo_academico_id: number | null;
  paralelo_id: number | null;
  es_repitente: boolean;
  es_becado: boolean;
  porcentaje_beca: number | null;
  tipo_beca: string;
  observaciones: string;
  
  // Documentos
  documentos: Array<{
    tipo_documento: TipoDocumentoMatricula;
    file: File | null;
    observaciones: string;
  }>;
}

// Response del endpoint de matriculación
export interface MatriculacionResponse {
  success: boolean;
  message: string;
  data: {
    matricula: MatriculaResponse;
    documentos?: DocumentoArchivo[];
  };
}