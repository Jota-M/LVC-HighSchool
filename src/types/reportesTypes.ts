// ==========================================
// TIPOS BASE
// ==========================================
export type FormatoReporte = 'pdf' | 'excel';

export interface ReporteBaseParams {
  formato?: FormatoReporte;
}

// ==========================================
// REPORTES DE MATRÍCULAS
// ==========================================
export interface ReporteParaleloParams extends ReporteBaseParams {
  paralelo_id: number;
  periodo_id: number;
}

export interface ReporteEstudianteParams extends ReporteBaseParams {
  estudiante_id: number;
}

export interface ReporteEstadisticoMatriculaParams extends ReporteBaseParams {
  periodo_id: number;
  nivel_id?: number;
}

// ==========================================
// REPORTES DE PRE-INSCRIPCIONES
// ==========================================
export interface ReportePreInscripcionIndividualParams extends ReporteBaseParams {
  id: number;
}

export interface ReportePreInscripcionListadoParams extends ReporteBaseParams {
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ReportePreInscripcionEstadisticoParams extends ReporteBaseParams {
  fecha_inicio?: string;
  fecha_fin?: string;
}

// ==========================================
// DATOS PARA UI
// ==========================================
export interface ParaleloParaReporte {
  id: number;
  nombre: string;
  grado_nombre: string;
  nivel_nombre: string;
  turno_nombre: string;
  total_estudiantes: number;
  capacidad_maxima: number;
}

export interface EstudianteParaReporte {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nivel_nombre: string;
  grado_nombre: string;
}

export interface PreInscripcionParaReporte {
  id: number;
  codigo_inscripcion: string;
  estudiante_nombre: string;
  estado: string;
  fecha_solicitud: string;
  
}
export interface NivelAcademico {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
}