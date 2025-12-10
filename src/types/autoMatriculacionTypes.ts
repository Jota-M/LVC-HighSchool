// types/autoMatriculacion.types.ts

export interface ValidacionCredenciales {
  codigo: string;
  ci: string;
}

export interface EstudianteValidado {
  ci: string;
  id: number;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_url: string | null;
  email: string | null;
  telefono: string | null;
}

export interface UltimaMatricula {
  id: number;
  periodo_nombre: string;
  periodo_codigo: string;
  grado_nombre: string;
  paralelo_nombre: string;
  turno_nombre: string;
  estado: string;
  fecha_matricula: string;
}

export interface PeriodoActivo {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  permite_inscripciones: boolean;
}

export interface ValidacionResponse {
  success: boolean;
  message: string;
  data: {
    estudiante: EstudianteValidado;
    ultima_matricula: UltimaMatricula | null;
    periodo_activo: PeriodoActivo | null;
    ya_matriculado: boolean;
  };
}

export interface GradoDisponible {
  id: number;
  nombre: string;
  orden: number;
  nivel_nombre: string;
}

export interface ParaleloDisponible {
  id: number;
  nombre: string;
  grado_id: number;
  grado_nombre: string;
  turno_nombre: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_maxima: number;
  matriculas_actuales: number;
  disponibles: number;
  porcentaje_ocupacion: string;
  aula: string | null;
}

export interface OpcionesMatriculaResponse {
  success: boolean;
  data: {
    periodo_activo: PeriodoActivo;
    grados: GradoDisponible[];
    paralelos: ParaleloDisponible[];
  };
}

export interface AutoMatriculacionData {
  codigo: string;
  ci: string;
  paralelo_id: number;
}

export interface AutoMatriculacionResponse {
  success: boolean;
  message: string;
  data: {
    matricula: {
      id: number;
      numero_matricula: string;
      fecha_matricula: string;
      estado: string;
      grado_nombre: string;
      paralelo_nombre: string;
      turno_nombre: string;
    };
  };
}