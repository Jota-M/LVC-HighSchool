// types/docenteTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type Genero = 'masculino' | 'femenino' | 'otro';

export type TipoContrato = 'planta' | 'contrato' | 'honorarios' | 'medio_tiempo';

export type NivelFormacion = 'bachiller' | 'tecnico' | 'licenciatura' | 'diplomado' | 'especialidad' | 'maestria' | 'doctorado';

export type TipoPostgrado = 'diplomado' | 'maestria' | 'doctorado' | 'especialidad' | 'otro';

export interface PostgradoItem {
  tipo: TipoPostgrado;
  nombre: string;
}

export const TIPOS_POSTGRADO: { value: TipoPostgrado; label: string; color: string; bg: string }[] = [
  { value: 'diplomado', label: 'Diplomado', color: '#0284c7', bg: '#e0f2fe' },
  { value: 'maestria', label: 'Maestría', color: '#7c3aed', bg: '#ede9fe' },
  { value: 'doctorado', label: 'Doctorado', color: '#dc2626', bg: '#fee2e2' },
  { value: 'especialidad', label: 'Especialidad', color: '#059669', bg: '#d1fae5' },
  { value: 'otro', label: 'Otro', color: '#4b5563', bg: '#f3f4f6' },
];

/**
 * Parsea el campo titulo_postgrado (JSON o texto plano) a un array de PostgradoItem
 */
export function parsePostgrados(raw?: string | null): PostgradoItem[] {
  if (!raw || !raw.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          tipo: item.tipo || 'diplomado',
          nombre: item.nombre || (typeof item === 'string' ? item : '')
        })).filter(i => i.nombre.trim() !== '');
      }
    } catch {
      // Fallback a texto plano
    }
  }

  // Si es texto plano separado por comas o saltos de línea
  return trimmed
    .split(/[\n,]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(nombre => {
      const lower = nombre.toLowerCase();
      let tipo: TipoPostgrado = 'diplomado';
      if (lower.includes('maestr')) tipo = 'maestria';
      else if (lower.includes('doctor')) tipo = 'doctorado';
      else if (lower.includes('especial')) tipo = 'especialidad';
      return { tipo, nombre };
    });
}

/**
 * Convierte un array de PostgradoItem a string para guardar en la BD
 */
export function formatPostgrados(items: PostgradoItem[]): string {
  if (!items || items.length === 0) return '';
  return JSON.stringify(items);
}

// ============================================
// INTERFAZ PRINCIPAL - DOCENTE
// ============================================

export interface Docente {
  id: number;
  usuario_id?: number | null;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  apellidos: string;
  ci: string;
  fecha_nacimiento?: string | null;
  genero?: Genero | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  direccion?: string | null;
  titulo_profesional?: string | null;
  titulo_postgrado?: string | null;
  especialidad?: string | null;
  salario_mensual?: number | null;
  numero_cuenta?: string | null;
  fecha_contratacion?: string | null;
  fecha_retiro?: string | null;
  tipo_contrato?: TipoContrato | null;
  foto_url?: string | null;
  cv_url?: string | null;
  nivel_formacion?: NivelFormacion | null;
  experiencia_anios?: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Datos relacionados (joins)
  username?: string;
  usuario_email?: string;
  total_asignaciones?: number;
}

// ============================================
// ESTADÍSTICAS DEL DOCENTE
// ============================================

export interface DocenteEstadisticas {
  asignaciones_activas: number;
  paralelos_asignados: number;
  materias_diferentes: number;
}

// ============================================
// DTOs - DATA TRANSFER OBJECTS
// ============================================

export interface CrearDocenteDTO {
  docente: {
    codigo?: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
    ci: string;
    fecha_nacimiento?: string;
    genero?: Genero;
    telefono?: string;
    celular?: string;
    email?: string;
    direccion?: string;
    titulo_profesional?: string;
    titulo_postgrado?: string;
    especialidad?: string;
    salario_mensual?: number;
    numero_cuenta?: string;
    fecha_contratacion?: string;
    tipo_contrato?: TipoContrato;
    nivel_formacion?: NivelFormacion;
    experiencia_anios?: number;
  };
  crear_usuario?: boolean;
  credenciales?: {
    username?: string;
    password?: string;
    email?: string;
  };
  asignaciones?: AsignacionInicial[];
}

export interface AsignacionInicial {
  grado_materia_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  es_titular?: boolean;
  fecha_inicio?: string;
}

export interface ActualizarDocenteDTO {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  ci?: string;
  fecha_nacimiento?: string;
  genero?: Genero;
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  titulo_profesional?: string;
  titulo_postgrado?: string;
  especialidad?: string;
  salario_mensual?: number;
  numero_cuenta?: string;
  fecha_contratacion?: string;
  fecha_retiro?: string;
  tipo_contrato?: TipoContrato;
  nivel_formacion?: NivelFormacion;
  experiencia_anios?: number;
  activo?: boolean;
}

export interface CrearUsuarioDocenteDTO {
  username?: string;
  password?: string;
  email?: string;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface DocenteResponse {
  success: boolean;
  message: string;
  data: {
    docente: Docente;
    estadisticas?: DocenteEstadisticas;
  };
}

export interface DocentesListResponse {
  success: boolean;
  data: {
    docentes: Docente[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface RegistroCompletoResponse {
  success: boolean;
  message: string;
  data: {
    docente: {
      id: number;
      codigo: string;
      nombres: string;
      apellidos: string;
      ci: string;
      email?: string;
      especialidad?: string;
      foto_url?: string;
      cv_url?: string;
      usuario_id?: number;
    };
    credenciales?: {
      username: string;
      password: string;
      email: string;
      debe_cambiar_password: boolean;
    };
    asignaciones?: any[];
  };
}

export interface CrearUsuarioResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: number;
      username: string;
      password_temporal: string;
      email: string;
      debe_cambiar_password: boolean;
    };
  };
}

// ============================================
// FILTROS Y PAGINACIÓN
// ============================================

export interface DocentesFiltros {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  tipo_contrato?: TipoContrato;
  especialidad?: string;
  simple?: boolean;
}

// ============================================
// FORM DATA
// ============================================

export interface DocenteFormData extends Omit<Docente, 'id' | 'codigo' | 'apellidos' | 'created_at' | 'updated_at' | 'deleted_at'> {
  foto?: File | null;
  cv?: File | null;
}

// ============================================
// UI STATE
// ============================================

export interface DocenteUIState {
  selectedDocente: Docente | null;
  isModalOpen: boolean;
  viewMode: 'cards' | 'table';
  filterDrawerOpen: boolean;
}

// ============================================
// CONSTANTES
// ============================================

export const GENEROS: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const TIPOS_CONTRATO: { value: TipoContrato; label: string }[] = [
  { value: 'planta', label: 'Planta' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'honorarios', label: 'Honorarios' },
  { value: 'medio_tiempo', label: 'Medio Tiempo' },
];

export const NIVELES_FORMACION: { value: NivelFormacion; label: string }[] = [
  { value: 'bachiller', label: 'Bachiller' },
  { value: 'tecnico', label: 'Técnico Superior' },
  { value: 'licenciatura', label: 'Licenciatura' },
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'especialidad', label: 'Especialidad' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
];