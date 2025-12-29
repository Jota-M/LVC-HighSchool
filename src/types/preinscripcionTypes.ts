// types/preinscripcionTypes.ts
import { Dayjs } from 'dayjs';

// =============================================
// 🆕 INTERFACES PARA CUPOS
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
  
  periodo_nombre?: string;
  grado_nombre?: string;
  turno_nombre?: string;
  nivel_academico_nombre?: string;
  porcentaje_ocupacion?: number;
}

export interface VerificarDisponibilidadResponse {
  success: boolean;
  data: {
    tiene_cupos: boolean;
    cupo: CupoPreinscripcion | null;
  };
}

// =============================================
// 🆕 INTERFAZ PARA PREINSCRIPCIÓN INFO
// =============================================
export interface PreInscripcionInfo {
  periodo_academico_id: number | null;
  grado_id: number | null;
  turno_id: number | null;
}

// =============================================
// INTERFACES BASE
// =============================================

export interface PreInscripcion {
  id: number;
  codigo_inscripcion: string;
  periodo_academico_id: number | null;
  nivel_academico_id: number | null;
  grado_id: number | null;
  turno_preferido_id: number | null;
  cupo_preinscripcion_id: number | null;
  tiene_cupo_asignado: boolean;
  estado: EstadoPreInscripcion;
  fecha_inicio: string;
  fecha_limite: string | null;
  fecha_aprobacion: string | null;
  fecha_conversion: string | null;
  estudiante_id: number | null;
  matricula_id: number | null;
  aprobada_por: number | null;
  convertida_por: number | null;
  observaciones: string | null;
  motivo_rechazo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  estudiante_nombre?: string;
  estudiante_ci?: string;
  estudiante_foto?: string;
  grado_solicitado?: string;
  tutor_nombre?: string;
  tutor_telefono?: string;
  grado_nombre?: string;
  turno_nombre?: string;
  cupos_disponibles?: number;
}

export type EstadoPreInscripcion = 
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

export interface PreEstudiante {
  id: number;
  pre_inscripcion_id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  fecha_nacimiento: string;
  ci: string | null;
  rude: string | null;
  lugar_nacimiento: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  direccion: string | null;
  zona: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  contacto_emergencia: string | null;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string | null;
  institucion_procedencia: string | null;
  ultimo_grado_cursado: string | null;
  grado_solicitado: string | null;
  repite_grado: boolean;
  turno_solicitado: string | null;
  datos_verificados: boolean;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreTutor {
  id: number;
  pre_inscripcion_id: number;
  tipo_representante: string | null;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string;
  fecha_nacimiento: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  parentesco: string | null;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  telefono: string;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  ocupacion: string | null;
  lugar_trabajo: string | null;
  telefono_trabajo: string | null;
  estado_civil: string | null;
  nivel_educacion: string | null;
  datos_verificados: boolean;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreDocumento {
  id: number;
  pre_inscripcion_id: number;
  tipo_documento: TipoDocumentoPreInscripcion;
  es_obligatorio: boolean;
  nombre_archivo: string | null;
  url_archivo: string | null;
  tamano_bytes: number | null;
  tipo_mime: string | null;
  subido: boolean;
  fecha_subida: string | null;
  verificado: boolean;
  fecha_verificacion: string | null;
  verificado_por: number | null;
  observaciones: string | null;
  requiere_correccion: boolean;
  motivo_correccion: string | null;
  created_at: string;
  updated_at: string;
}

export type TipoDocumentoPreInscripcion = 
  | 'cedula_estudiante'
  | 'certificado_nacimiento'
  | 'libreta_notas'
  | 'cedula_tutor'
  | 'otro';

// =============================================
// INTERFACES PARA FORMULARIOS
// =============================================

export interface PreEstudianteForm {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  rude: string;
  fecha_nacimiento: Dayjs | null;
  lugar_nacimiento: string;
  genero: string;
  direccion: string;
  zona: string;
  ciudad: string;
  telefono: string;
  email: string;
  contacto_emergencia: string;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string;
  institucion_procedencia: string;
  ultimo_grado_cursado: string;
  grado_solicitado: string; // ✅ Texto legible (ej: "PRE-K")
  repite_grado: boolean;
  turno_solicitado: string; // ✅ Texto legible (ej: "MAÑANA")
}

export interface PreTutorForm {
  otro_parentesco: string;
  tipo_representante: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: Dayjs | null;
  genero: string;
  parentesco: string;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ocupacion: string;
  lugar_trabajo: string;
  telefono_trabajo: string;
  estado_civil: string;
  nivel_educacion: string;
  vive_con_estudiante: boolean;
  es_tutor_principal: boolean;
}

export interface PreInscripcionFormData {
  estudiante: PreEstudianteForm;
  representante: PreTutorForm;
  documentos: {
    foto_estudiante: File | null;
    cedula_estudiante: File | null;
    certificado_nacimiento: File | null;
    libreta_notas: File | null;
    cedula_representante: File | null;
  };
  // 🆕 IMPORTANTE: Ahora es parte del formData
  preinscripcion_info: PreInscripcionInfo;
}

// =============================================
// 🆕 MODO MÚLTIPLE
// =============================================

export type ModoRegistro = 'nuevo' | 'padre_existente' | 'multiple';

export interface BuscarPadreRequest {
  ci: string;
}

export interface BuscarPadreResponse {
  success: boolean;
  data?: {
    encontrado: boolean;
    padre?: {
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
      lugar_trabajo: string | null;
      tiene_hijos_matriculados: boolean;
      hijos?: Array<{
        id: number;
        nombres: string;
        apellido_paterno: string;
        codigo: string;
        grado_actual: string;
        paralelo: string;
      }>;
    };
    mensaje?: string;
  };
  message?: string;
}

export interface PreInscripcionMultipleFormData {
  modo: ModoRegistro;
  padre_id?: number;
  representante: PreTutorForm;
  estudiantes: PreEstudianteForm[];
  documentos_estudiantes: {
    [estudianteIndex: number]: {
      foto_estudiante: File | null;
      cedula_estudiante: File | null;
      certificado_nacimiento: File | null;
      libreta_notas: File | null;
    };
  };
  documentos_representante: {
    cedula_representante: File | null;
  };
  // 🆕 Info de preinscripción compartida
  preinscripcion_info: PreInscripcionInfo;
}

// =============================================
// INTERFACES PARA API
// =============================================

export interface PreInscripcionDTO {
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    rude: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    genero: string;
    direccion: string;
    zona: string;
    ciudad: string;
    telefono: string;
    email: string;
    contacto_emergencia: string;
    tiene_discapacidad: boolean;
    tipo_discapacidad: string;
    institucion_procedencia: string;
    ultimo_grado_cursado: string;
    grado_solicitado: string; // ✅ Texto para referencia
    repite_grado: boolean;
    turno_solicitado: string; // ✅ Texto para referencia
  };
  representante: {
    tipo_representante: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    fecha_nacimiento: string | null;
    genero: string;
    parentesco: string;
    telefono: string;
    celular: string;
    email: string;
    direccion: string;
    ocupacion: string;
    lugar_trabajo: string;
    telefono_trabajo: string;
    estado_civil: string;
    nivel_educacion: string;
    vive_con_estudiante: boolean;
    es_tutor_principal: boolean;
  };
  // 🆕 CRÍTICO: IDs numéricos para el backend (REQUERIDO)
  preinscripcion_info: {
    periodo_academico_id: number; // ✅ Requerido, no puede ser null
    grado_id: number;             // ✅ Requerido, no puede ser null
    turno_id: number;             // ✅ Requerido, no puede ser null
  };
}

// 🆕 Interfaz separada para el estado interno del formulario (permite null)
export interface PreInscripcionFormState extends Omit<PreInscripcionDTO, 'preinscripcion_info'> {
  preinscripcion_info: PreInscripcionInfo; // ← Esta permite null
}

export interface PreInscripcionResponse {
  success: boolean;
  message: string;
  data?: {
    preinscripcion: {
      id: number;
      codigo_inscripcion: string;
      estado: EstadoPreInscripcion;
      foto_url: string | null;
      cupo_asignado?: boolean;
      mensaje_cupo?: string;
    };
  };
  error?: string;
}

export interface PreInscripcionMultipleDTO {
  modo: ModoRegistro;
  padre_id?: number;
  representante?: {
    tipo_representante: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    fecha_nacimiento: string | null;
    genero: string;
    parentesco: string;
    telefono: string;
    celular: string;
    email: string;
    direccion: string;
    ocupacion: string;
    lugar_trabajo: string;
    telefono_trabajo: string;
    estado_civil: string;
    nivel_educacion: string;
    vive_con_estudiante: boolean;
    es_tutor_principal: boolean;
  };
  estudiantes: Array<{
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    rude: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    genero: string;
    direccion: string;
    zona: string;
    ciudad: string;
    telefono: string;
    email: string;
    contacto_emergencia: string;
    tiene_discapacidad: boolean;
    tipo_discapacidad: string;
    institucion_procedencia: string;
    ultimo_grado_cursado: string;
    grado_solicitado: string;
    repite_grado: boolean;
    turno_solicitado: string;
  }>;
  // 🆕 Info de preinscripción
  preinscripcion_info: {
    periodo_academico_id: number;
    grado_id: number;
    turno_id: number;
  };
}

export interface PreInscripcionMultipleResponse {
  success: boolean;
  message: string;
  data?: {
    preinscripciones: Array<{
      id: number;
      codigo_inscripcion: string;
      estado: EstadoPreInscripcion;
      foto_url: string | null;
      estudiante_nombres: string;
    }>;
    total_creadas: number;
    padre_id: number;
    cedula_compartida?: boolean;
  };
  error?: string;
}

export interface PreInscripcionDetalle {
  id: number;
  codigo_inscripcion: string;
  estado: EstadoPreInscripcion;
  periodo_academico_id: number | null;
  nivel_academico_id: number | null;
  grado_id: number | null;
  turno_preferido_id: number | null;
  cupo_preinscripcion_id: number | null;
  tiene_cupo_asignado: boolean;
  fecha_inicio: string;
  fecha_aprobacion: string | null;
  fecha_conversion: string | null;
  created_at?: string;
  updated_at?: string;
  observaciones: string | null;
  motivo_rechazo: string | null;
  aprobada_por?: number | null;
  convertida_por?: number | null;
  estudiante_id?: number | null;
  matricula_id?: number | null;
  grado_nombre?: string;
  turno_nombre?: string;
  periodo_nombre?: string;
  cupos_totales?: number;
  cupos_disponibles?: number;
  estudiante: PreEstudiante;
  tutor: PreTutor;
  documentos: PreDocumento[];
  cupo?: CupoPreinscripcion;
}

export interface PreInscripcionesResponse {
  success: boolean;
  data: {
    preinscripciones: PreInscripcion[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PreInscripcionFilters {
  estado?: EstadoPreInscripcion;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CambiarEstadoRequest {
  estado: EstadoPreInscripcion;
  observaciones?: string;
}

export interface ConvertirEstudianteRequest {
  paralelo_id: number;
  periodo_academico_id: number;
}

export interface ConvertirEstudianteResponse {
  success: boolean;
  message: string;
  data: {
    estudiante: {
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
      foto_url?: string;
    };
    matricula: {
      id: number;
      numero_matricula: string;
      estado: string;
    };
    credenciales_estudiante?: {
      username: string;
      password: string;
      email: string;
      debe_cambiar_password: boolean;
    };
    credenciales_padre?: {
      username: string;
      password: string;
      email: string;
      debe_cambiar_password: boolean;
    };
    documentos_migrados?: number;
  };
}

// =============================================
// TIPOS DE PASOS DEL FORMULARIO
// =============================================

export type PasoFormulario = 0 | 1 | 2 | 3;

export interface ErroresFormulario {
  [key: string]: string;
}

// =============================================
// CONSTANTES
// =============================================

export const ESTADOS_PREINSCRIPCION: Record<EstadoPreInscripcion, { label: string; color: string }> = {
  iniciada: { label: 'Iniciada', color: '#757575' },
  datos_completos: { label: 'Datos Completos', color: '#2196f3' },
  documentos_pendientes: { label: 'Documentos Pendientes', color: '#ff9800' },
  en_revision: { label: 'En Revisión', color: '#9c27b0' },
  documentos_aprobados: { label: 'Documentos Aprobados', color: '#00bcd4' },
  entrevista_pendiente: { label: 'Entrevista Pendiente', color: '#ff5722' },
  entrevista_programada: { label: 'Entrevista Programada', color: '#673ab7' },
  entrevista_completada: { label: 'Entrevista Completada', color: '#3f51b5' },
  aprobada: { label: 'Aprobada', color: '#4caf50' },
  rechazada: { label: 'Rechazada', color: '#f44336' },
  convertida: { label: 'Convertida', color: '#8bc34a' },
  expirada: { label: 'Expirada', color: '#9e9e9e' },
  cancelada: { label: 'Cancelada', color: '#607d8b' },
};

export const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const GRADOS_SOLICITADOS = [
  { value: 'PRE-KINDER', label: 'Pre-Kinder' },
  { value: 'KINDER', label: 'Kinder' },
  { value: 'PRIMERO_PRIMARIA', label: 'Primero de Primaria' },
  { value: 'SEGUNDO_PRIMARIA', label: 'Segundo de Primaria' },
  { value: 'TERCERO_PRIMARIA', label: 'Tercero de Primaria' },
  { value: 'CUARTO_PRIMARIA', label: 'Cuarto de Primaria' },
  { value: 'QUINTO_PRIMARIA', label: 'Quinto de Primaria' },
  { value: 'SEXTO_PRIMARIA', label: 'Sexto de Primaria' },
  { value: 'PRIMERO_SECUNDARIA', label: 'Primero de Secundaria' },
  { value: 'SEGUNDO_SECUNDARIA', label: 'Segundo de Secundaria' },
  { value: 'TERCERO_SECUNDARIA', label: 'Tercero de Secundaria' },
  { value: 'CUARTO_SECUNDARIA', label: 'Cuarto de Secundaria' },
  { value: 'QUINTO_SECUNDARIA', label: 'Quinto de Secundaria' },
  { value: 'SEXTO_SECUNDARIA', label: 'Sexto de Secundaria' },
];

export const TIPOS_REPRESENTANTE = [
  { value: 'Ambos Padres', label: 'Ambos Padres' },
  { value: 'Padre o Madre', label: 'Padre o Madre' },
  { value: 'Tutor Legal', label: 'Tutor Legal' },
];

export const TURNOS_SOLICITADOS = [
  { value: 'MAÑANA', label: 'Mañana' },
  { value: 'TARDE', label: 'Tarde' },
];