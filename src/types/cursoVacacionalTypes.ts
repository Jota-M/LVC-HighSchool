// types/cursoVacacionalTypes.ts

// ============================================
// PAQUETE VACACIONAL (NUEVO)
// ============================================
export interface PaqueteVacacional {
  id: number;
  nombre: string;
  cantidad_cursos: number;
  precio: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// PERIODO VACACIONAL
// ============================================
export interface PeriodoVacacional {
  id: number;
  nombre: string;
  codigo: string | null;
  tipo: 'verano' | 'invierno';
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_inicio_inscripciones: string;
  fecha_fin_inscripciones: string;
  activo: boolean;
  permite_inscripciones: boolean;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  total_cursos?: number;
  total_inscritos?: number;
  total_cupos?: number;
}

export interface PeriodoVacacionalCreate {
  nombre: string;
  codigo?: string;
  tipo: 'verano' | 'invierno';
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_inicio_inscripciones: string;
  fecha_fin_inscripciones: string;
  activo?: boolean;
  permite_inscripciones?: boolean;
  descripcion?: string;
}

export interface PeriodoVacacionalUpdate extends Partial<PeriodoVacacionalCreate> {}

// ============================================
// CURSO VACACIONAL (CON FOTO)
// ============================================
export interface CursoVacacional {
  id: number;
  periodo_vacacional_id: number;
  materia_id: number | null;
  grado_id: number | null;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  dias_semana: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  costo: number;
  aula: string | null;
  requisitos: string | null;
  activo: boolean;
  foto_url: string | null;
  foto_public_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  periodo_nombre?: string;
  periodo_tipo?: string;
  periodo_fecha_inicio?: string;
  periodo_fecha_fin?: string;
  grado_nombre?: string;
  materia_nombre?: string;
  total_inscripciones?: number;
}

export interface CursoVacacionalCreate {
  periodo_vacacional_id: number;
  materia_id?: number;
  grado_id?: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_semana?: string;
  hora_inicio?: string;
  hora_fin?: string;
  cupos_totales: number;
  costo: number;
  aula?: string;
  requisitos?: string;
  activo?: boolean;
}

export interface CursoVacacionalUpdate extends Partial<Omit<CursoVacacionalCreate, 'periodo_vacacional_id'>> {}

export interface FormCursoVacacional extends CursoVacacionalCreate {
  foto?: File;
}

// ============================================
// INSCRIPCION VACACIONAL (CON PAQUETES)
// ============================================
export type MetodoPago = 'transferencia' | 'efectivo' | 'qr' | 'tarjeta';

export type EstadoInscripcionVacacional = 
  | 'pendiente' 
  | 'pago_verificado' 
  | 'activo' 
  | 'completado' 
  | 'retirado' 
  | 'rechazado';

export interface InscripcionVacacional {
  id: number;
  codigo_inscripcion: string;
  codigo_grupo: string | null; // NUEVO
  paquete_id: number | null; // NUEVO
  curso_vacacional_id: number;
  
  metodo_pago: MetodoPago;
  recibo_interno: string | null;
  observaciones_pago: string | null;

  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  fecha_nacimiento: string;
  ci: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  telefono: string | null;
  email: string | null;
  
  nombre_tutor: string;
  telefono_tutor: string;
  email_tutor: string | null;
  parentesco_tutor: string | null;
  
  monto_pagado: number;
  numero_comprobante: string | null;
  fecha_pago: string | null;
  comprobante_pago_url: string | null;
  pago_verificado: boolean;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  
  estado: EstadoInscripcionVacacional;
  observaciones: string | null;
  motivo_rechazo: string | null;
  
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  curso_nombre?: string;
  curso_codigo?: string;
  curso_costo?: number;
  curso_fecha_inicio?: string;
  curso_fecha_fin?: string;
  curso_dias_semana?: string;
  curso_hora_inicio?: string;
  curso_hora_fin?: string;
  periodo_nombre?: string;
  periodo_tipo?: string;
  paquete_nombre?: string; // NUEVO
  paquete_cantidad?: number; // NUEVO
  paquete_precio?: number; // NUEVO
  verificado_por_username?: string;
}

// NUEVO: Para inscripciones con múltiples cursos
export interface InscripcionVacacionalCreate {
  cursos: number[]; // Array de IDs de cursos
  paquete_id?: number;
  
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  ci?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  telefono?: string;
  email?: string;
  
  nombre_tutor: string;
  telefono_tutor: string;
  email_tutor?: string;
  parentesco_tutor?: string;
  
  monto_pagado: number;
  metodo_pago?: MetodoPago; // NUEVO
  numero_comprobante?: string;
  fecha_pago?: string;
  observaciones?: string;
  observaciones_pago?: string; // NUEVO
}

export interface InscripcionVacacionalUpdate {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  ci?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  telefono?: string;
  email?: string;
  nombre_tutor?: string;
  telefono_tutor?: string;
  email_tutor?: string;
  parentesco_tutor?: string;
  observaciones?: string;
}

// ============================================
// FILTROS
// ============================================
export interface PeriodoVacacionalFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: 'verano' | 'invierno';
  anio?: number;
  activo?: boolean;
}

export interface CursoVacacionalFilters {
  page?: number;
  limit?: number;
  search?: string;
  periodo_vacacional_id?: number;
  grado_id?: number;
  activo?: boolean;
  con_cupos?: boolean;
}

export interface InscripcionVacacionalFilters {
  page?: number;
  limit?: number;
  search?: string;
  curso_vacacional_id?: number;
  periodo_vacacional_id?: number;
  estado?: EstadoInscripcionVacacional;
  pago_verificado?: boolean;
  codigo_grupo?: string; // NUEVO
}

// ============================================
// RESPUESTAS DE LISTADOS
// ============================================
export interface PeriodosResponse {
  periodos: PeriodoVacacional[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CursosResponse {
  cursos: CursoVacacional[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InscripcionesResponse {
  inscripciones: InscripcionVacacional[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// NUEVO: Respuesta de inscripción grupal
export interface InscripcionGrupalResponse {
  codigo_grupo: string;
  total_cursos: number;
  inscripciones: InscripcionVacacional[];
}

// ============================================
// ESTADISTICAS
// ============================================
export interface EstadisticasPeriodo {
  total_inscripciones: number;
  pendientes: number;
  verificadas: number;
  activas: number;
  completadas: number;
  retiradas: number;
  total_ingresos: string;
  total_estudiantes: number; // NUEVO
}

// ============================================
// FORMULARIOS
// ============================================
export interface FormInscripcionPublica extends InscripcionVacacionalCreate {
  comprobante?: File;
}
export interface FormInscripcionPublica extends InscripcionVacacionalCreate {
  comprobante?: File;
}
export interface FormPeriodoVacacional extends PeriodoVacacionalCreate {}

// ============================================
// ACCIONES
// ============================================
export interface CambiarEstadoInscripcion {
  estado: EstadoInscripcionVacacional;
  motivo_rechazo?: string;
}