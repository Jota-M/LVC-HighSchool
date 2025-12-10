// types/preinscripcion.types.ts
import { Dayjs } from 'dayjs';

// =============================================
// INTERFACES BASE (mantener las existentes)
// =============================================

export interface PreInscripcion {
  id: number;
  codigo_inscripcion: string;
  periodo_academico_id: number | null;
  nivel_academico_id: number | null;
  grado_id: number | null;
  turno_preferido_id: number | null;
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
// 🆕 NUEVAS INTERFACES PARA MEJORAS
// =============================================

// Modo de registro
export type ModoRegistro = 'nuevo' | 'padre_existente' | 'multiple';

// Búsqueda de padre existente
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
      tiene_hijos_matriculados: boolean;
      hijos?: Array<{
        id: number;
        nombres: string;
        apellido_paterno: string;
        grado_actual: string;
        paralelo: string;
      }>;
    };
  };
  message?: string;
}

// 🆕 Formulario con múltiples estudiantes
export interface PreInscripcionMultipleFormData {
  modo: ModoRegistro;
  padre_id?: number; // Solo si modo === 'padre_existente'
  representante: PreTutorForm;
  estudiantes: PreEstudianteForm[]; // ✅ Array de estudiantes
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
}

// =============================================
// INTERFACES PARA FORMULARIOS (mantener existentes y agregar nuevas)
// =============================================

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
}

export interface PreEstudianteForm {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: Dayjs | null;
  lugar_nacimiento: string;
  genero: string;
  direccion: string;
  zona: string;
  ciudad: string;
  telefono: string;
  email: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string;
  institucion_procedencia: string;
  ultimo_grado_cursado: string;
  grado_solicitado: string;
  repite_grado: boolean;
  turno_solicitado: string;
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

// =============================================
// 🆕 INTERFACES PARA API CON MÚLTIPLES ESTUDIANTES
// =============================================

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
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    genero: string;
    direccion: string;
    zona: string;
    ciudad: string;
    telefono: string;
    email: string;
    contacto_emergencia: string;
    telefono_emergencia: string;
    tiene_discapacidad: boolean;
    tipo_discapacidad: string;
    institucion_procedencia: string;
    ultimo_grado_cursado: string;
    grado_solicitado: string;
    repite_grado: boolean;
    turno_solicitado: string;
  }>;
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
  };
  error?: string;
}

// =============================================
// INTERFACES PARA API (mantener existentes)
// =============================================

export interface PreInscripcionDTO {
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    genero: string;
    direccion: string;
    zona: string;
    ciudad: string;
    telefono: string;
    email: string;
    contacto_emergencia: string;
    telefono_emergencia: string;
    tiene_discapacidad: boolean;
    tipo_discapacidad: string;
    institucion_procedencia: string;
    ultimo_grado_cursado: string;
    grado_solicitado: string;
    repite_grado: boolean;
    turno_solicitado: string;
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
    };
  };
  error?: string;
}

export interface PreInscripcionDetalle {
  id: number;
  codigo_inscripcion: string;
  estado: EstadoPreInscripcion;
  fecha_inicio: string;
  fecha_aprobacion: string | null;
  fecha_conversion: string | null;
  observaciones: string | null;
  motivo_rechazo: string | null;
  estudiante: PreEstudiante;
  tutor: PreTutor;
  documentos: PreDocumento[];
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
    };
    matricula: {
      id: number;
      numero_matricula: string;
      estado: string;
    };
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
// CONSTANTES (mantener existentes)
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

export const PARENTESCOS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'abuelo', label: 'Abuelo' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'tio', label: 'Tío' },
  { value: 'tia', label: 'Tía' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'otro', label: 'Otro' },
];