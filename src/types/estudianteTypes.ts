// types/estudiante.types.ts

export interface Estudiante {
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
  alergias: string | null;
  condiciones_medicas: string | null;
  contacto_emergencia: string | null;
  telefono_emergencia: string | null;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string | null;
  observaciones: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Campos adicionales de relaciones
  username?: string;
  usuario_email?: string;
  total_matriculas?: number;
  matriculas?: Matricula[];
  tutores?: Tutor[];
}

export interface EstudianteCreate {
  nombres: string;
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
  telefono_emergencia?: string;
  tiene_discapacidad?: boolean;
  tipo_discapacidad?: string;
  alergias?: string;
  condiciones_medicas?: string;
  observaciones?: string;
}

export interface EstudianteUpdate extends Partial<EstudianteCreate> {
  activo?: boolean;
}

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

export interface Matricula {
  id: number;
  periodo: string;
  grado: string;
  paralelo: string;
  turno: string;
  estado: string;
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

// Para el formulario de registro completo
export interface RegistroCompleto {
  estudiante: EstudianteCreate;
  tutores: TutorCreate[];
  crear_usuario_estudiante: boolean;
  crear_usuarios_tutores: boolean;
  credenciales_estudiante?: CredencialesUsuario;
  credenciales_tutores?: CredencialesUsuario[];
  matricula?: MatriculaCreate;
  documentos?: DocumentoMetadata[];

  // Archivos reales que se subirán
  foto?: File | null;
  documentos_archivos?: Array<{  // ✅ CORRECTO: objeto con file, tipo y observaciones
    file: File;
    tipo_documento: string;
    observaciones?: string;
  }>;
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
  lugar_trabajo?: string;
  telefono_trabajo?: string;
  parentesco?: string;
  estado_civil?: string;
  nivel_educacion?: string;
  es_tutor_principal?: boolean;
  vive_con_estudiante?: boolean;
  autorizado_recoger?: boolean;
  puede_autorizar_salidas?: boolean;
  recibe_notificaciones?: boolean;
  prioridad_contacto?: number;
  observaciones?: string;
}

export interface CredencialesUsuario {
  username?: string;
  password?: string;
  email?: string;
}

export interface MatriculaCreate {
  periodo_academico_id: number;  
  paralelo_id: number;           
  numero_matricula?: string;
  es_repitente?: boolean;
  es_becado?: boolean;
  porcentaje_beca?: number;
  tipo_beca?: string;
  observaciones?: string;
}


export interface DocumentoMetadata {
  tipo_documento: string;
  observaciones?: string;
}

export interface RegistroCompletoResponse {
  success: boolean;
  message: string;
  data: {
    estudiante: {
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
      foto_url: string | null;
      usuario_id: number | null;
    };
    tutores: Array<{
      id: number;
      nombres: string;
      apellidos: string;
      parentesco: string | null;
      telefono: string | null;
      usuario_id: number | null;
    }>;
    matricula?: {
      id: number;
      numero_matricula: string;
      fecha_matricula: string;
      estado: string;
      es_becado: boolean;
    };
    documentos?: Array<{
      id: number;
      tipo_documento: string;
      nombre_archivo: string;
      url_archivo: string;
      verificado: boolean;
    }>;
    credenciales_estudiante?: {
      username: string;
      password: string;
      debe_cambiar_password: boolean;
    };
    credenciales_tutores?: Array<{
      nombre_completo: string;
      username: string;
      password: string;
      email: string;
    }>;
  };
}

// Para los selectores dinámicos de matrícula
export interface PeriodoAcademico {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface Grado {
  id: number;
  nombre: string;
  nivel: string;
  orden: number;
}

export interface Paralelo {
  id: number;
  nombre: string;
  grado_id: number;
  grado_nombre: string;
  turno_id: number;
  turno_nombre: string;
  capacidad_maxima: number;
  matriculas_actuales?: number;
  disponible?: boolean;
  
}

export interface CapacidadParalelo {
  paralelo_id: number;
  capacidad_maxima: number;
  matriculas_actuales: number;
  disponible: boolean;
}