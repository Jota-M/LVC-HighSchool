// types/estudianteTypes.ts

// ============================================
// MODOS DE REGISTRO (simplificado a 3)
// ============================================
export type ModoRegistro = 'nuevo' | 'existente' | 'multiple';

// ============================================
// ENTIDADES BASE
// ============================================

export interface Estudiante {
  rude: string;
  id: number;
  usuario_id: number | null;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  apellidos: string;
  fecha_nacimiento: string;
  ci: string | null;
  lugar_nacimiento: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  direccion: string | null;
  zona: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  contacto_emergencia: string | null;
  telefono_emergencia: string | null;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string | null;
  observaciones: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  username?: string;
  usuario_email?: string;
  total_matriculas?: number;
  
  // ⚠️ CAMPOS OPCIONALES - Solo vienen del endpoint de matriculación
  matricula_actual_id?: number | null;
  matricula_estado?: string | null;
  grado_actual?: string | null;
  paralelo_actual?: string | null;
  periodo_actual?: string | null;
  turno_actual?: string | null;
  ultima_matricula?: {
    periodo: string;
    grado: string;
    paralelo: string;
    estado: string;
  } | null;
  
  // Relaciones completas (opcional)
  matriculas?: Matricula[];
  tutores?: Tutor[];
}

export interface EstudianteCreate {
  nombres: string;
  rude: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  ci?: string;
  lugar_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  zona?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  contacto_emergencia?: string;
  // telefono_emergencia?: string;
  tiene_discapacidad?: boolean;
  tipo_discapacidad?: string;
  observaciones?: string;
}

export interface EstudianteUpdate extends Partial<EstudianteCreate> {
  activo?: boolean;
}

export interface Tutor {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  parentesco: string | null;
  ocupacion: string | null;
  lugar_trabajo: string | null;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  autorizado_recoger: boolean;
  puede_autorizar_salidas: boolean;
  recibe_notificaciones: boolean;
  prioridad_contacto: number;
  observaciones: string | null;
}

export interface TutorCreate {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci: string;
  fecha_nacimiento?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  // lugar_trabajo?: string;
  // telefono_trabajo?: string;
  parentesco?: string;
  estado_civil?: string;
  // nivel_educacion?: string;
  es_tutor_principal?: boolean;
  vive_con_estudiante?: boolean;
  autorizado_recoger?: boolean;
  puede_autorizar_salidas?: boolean;
  recibe_notificaciones?: boolean;
  prioridad_contacto?: number;
  observaciones?: string;
}

export interface PadreEncontrado {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string;
  telefono: string;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  ocupacion: string | null;
  tiene_hijos_matriculados: boolean;
  hijos?: Array<{
    id: number;
    nombres: string;
    apellido_paterno: string;
    grado_actual: string;
    paralelo: string;
  }>;
}

// ============================================
// CREDENCIALES Y MATRÍCULA
// ============================================

export interface CredencialesUsuario {
  username?: string;
  password?: string;
  email?: string;
}

export interface MatriculaCreate {
  periodo_academico_id: number;
  paralelo_id: number;
  numero_matricula?: string;
  fecha_matricula?: string;
  es_repitente?: boolean;
  es_becado?: boolean;
  porcentaje_beca?: number;
  tipo_beca?: string;
  observaciones?: string;
}

export interface Matricula {
  id: number;
  numero_matricula: string;
  periodo: string;
  grado: string;
  paralelo: string;
  turno: string;
  estado: string;
  fecha_matricula: string;
}

// ============================================
// REGISTRO COMPLETO - BASE
// ============================================

interface RegistroCompletoBase {
  modo: ModoRegistro;
  crear_usuario_estudiante: boolean;
  crear_usuarios_tutores: boolean;
  credenciales_estudiante?: CredencialesUsuario;
  credenciales_tutores?: CredencialesUsuario[];
  matricula?: MatriculaCreate;
  documentos_archivos?: Array<{
    estudiante_index: any;
    file: File;
    tipo_documento: string;
    observaciones?: string;
  }>;
}

// ============================================
// MODO 1: NUEVO (nuevo tutor + 1 estudiante)
// ============================================

export interface RegistroNuevo extends RegistroCompletoBase {
  modo: 'nuevo';
  estudiante: EstudianteCreate;
  foto?: File | null;
  tutores: TutorCreate[]; // Mínimo 1 tutor
}

// ============================================
// MODO 2: EXISTENTE (tutor existente + 1 estudiante)
// ============================================

export interface RegistroExistente extends RegistroCompletoBase {
  modo: 'existente';
  padre_existente_id: number;
  estudiante: EstudianteCreate;
  foto?: File | null;
}

// ============================================
// MODO 3: MULTIPLE (nuevo tutor + varios estudiantes)
// ============================================

export interface RegistroMultiple extends RegistroCompletoBase {
  modo: 'multiple';
  estudiantes: EstudianteCreate[]; // Máximo 5
  fotos?: (File | null)[]; // Una por estudiante
  tutores: TutorCreate[]; // Mínimo 1 tutor
  matriculas?: MatriculaCreate[]; // Opcional, una por estudiante
  credenciales_estudiantes?: CredencialesUsuario[]; // Una por estudiante
}

// ============================================
// UNION TYPE PRINCIPAL
// ============================================

export type RegistroCompleto = RegistroNuevo | RegistroExistente | RegistroMultiple;

// ============================================
// RESPUESTA DEL BACKEND
// ============================================

export interface RegistroCompletoResponse {
  success: boolean;
  message: string;
  data: {
    modo: ModoRegistro;
    estudiantes: Array<{
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
      foto_url: string | null;
      usuario_id: number | null;
    }>;
    tutores: Array<{
      id: number;
      nombres: string;
      apellidos: string;
      telefono: string | null;
      usuario_id: number | null;
    }>;
    matriculas?: Array<{
      id: number;
      numero_matricula: string;
      estado: string;
    }>;
    credenciales_estudiantes?: Array<{
      nombre_completo: string;
      username: string;
      password: string;
      email: string;
    }>;
    credenciales_tutores?: Array<{
      nombre_completo: string;
      username: string;
      password: string;
      email: string;
    }>;
  };
}

// ============================================
// GESTIÓN ACADÉMICA
// ============================================

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface NivelAcademico {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
}

export interface Grado {
  id: number;
  nombre: string;
  nivel: string;
  nivel_id: number;
  orden: number;
  activo: boolean;
}

export interface Paralelo {
  id: number;
  nombre: string;
  grado_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  turno_id: number;
  turno_nombre: string;
  capacidad_maxima: number;
  anio: number;
  activo: boolean;
  matriculas_actuales?: number;
  disponible?: boolean;
}

export interface CapacidadParalelo {
  paralelo_id: number;
  capacidad_maxima: number;
  matriculas_actuales: number;
  disponible: boolean;
}

// ============================================
// FILTROS Y LISTADOS
// ============================================

export interface EstudianteFilters {
  page?: number;
  limit?: number;
  search?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  activo?: boolean;
  grado_id?: number;
  paralelo_id?: number;
}

export interface EstudiantesResponse {
  estudiantes: Estudiante[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EstudianteStats {
  total: number;
  activos: number;
  inactivos: number;
  masculino: number;
  femenino: number;
  con_discapacidad: number;
  con_usuario: number;
  sin_usuario: number;
  promedio_edad?: number;
  distribucion_por_grado?: {
    grado: string;
    cantidad: number;
  }[];
}