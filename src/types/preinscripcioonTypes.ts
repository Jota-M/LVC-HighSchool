// src/app/dashboard/preinscripciones/types/preinscripcion.types.ts

export type EstadoPreinscripcion = 
  | 'iniciada'
  | 'datos_completos'
  | 'documentos_pendientes'
  | 'en_revision'
  | 'documentos_aprobados'
  | 'aprobada'
  | 'rechazada'
  | 'convertida';

export type GradoSolicitado = 
  | 'TERCERO DE PRIMARIA'
  | 'PRIMERO_SEC'
  | 'SEGUNDO_SEC'
  | 'TERCERO_SEC'
  | 'CUARTO_SEC'
  | 'QUINTO_SEC'
  | 'SEXTO_SEC';

export interface Preinscripcion {
  id: number;
  codigo_inscripcion: string;
  estado?: EstadoPreinscripcion;
  estudiante_nombre: string;
  estudiante_ci: string;
  estudiante_foto?: string;
  grado_solicitado: GradoSolicitado;
  tutor_nombre: string;
  tutor_telefono: string;
  created_at: string;
}

export interface PreinscripcionStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
}

export interface PreinscripcionFilters {
  searchTerm: string;
  estadoFilter: string;
  gradoFilter: string;
}

export interface EstadoConfig {
  label: string;
  color: string;
  bgcolor: string;
  icon: React.ReactElement;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PreinscripcionesResponse {
  preinscripciones: Preinscripcion[];
  total: number;
}