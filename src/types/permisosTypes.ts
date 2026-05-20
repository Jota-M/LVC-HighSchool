// types/permisosTypes.ts

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface Permiso {
  id: number;
  modulo: string;
  accion: string;
  nombre: string;          // convención: "modulo.accion"
  descripcion?: string | null;
  created_at: string;

  // Joins opcionales
  asignado_en?: string;    // fecha en que se asignó al rol (en rol_permisos)
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  es_sistema: boolean;
  created_at: string;
  updated_at: string;

  // Agregados desde el backend
  total_permisos?: number;
  total_usuarios?: number;
}

export interface UsuarioRol {
  id: number;
  usuario_id: number;
  rol_id: number;
  asignado_por?: number | null;
  fecha_asignacion: string;

  // Joins
  rol_nombre?: string;
  rol_descripcion?: string | null;
  rol_es_sistema?: boolean;
  asignado_por_username?: string | null;
}

// Permisos agrupados por módulo (viene del backend y se construye en el hook)
export type PermisosAgrupados = Record<string, Permiso[]>;

// ============================================
// DTOs
// ============================================

export interface CrearPermisoDTO {
  modulo: string;
  accion: string;
  nombre: string;
  descripcion?: string;
}

export interface ActualizarPermisoDTO {
  modulo: string;
  accion: string;
  nombre: string;
  descripcion?: string;
}

export interface CrearRolDTO {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarRolDTO {
  nombre: string;
  descripcion?: string;
}

export interface SyncPermisosDTO {
  permiso_ids: number[];
}

export interface SyncRolesDTO {
  rol_ids: number[];
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface PermisosListResponse {
  success: boolean;
  data: {
    permisos: Permiso[];
    agrupado: PermisosAgrupados;
    total: number;
  };
}

export interface PermisoResponse {
  success: boolean;
  data: { permiso: Permiso };
}

export interface ModulosResponse {
  success: boolean;
  data: { modulos: string[] };
}

export interface RolesListResponse {
  success: boolean;
  data: {
    roles: Rol[];
    total: number;
  };
}

export interface RolResponse {
  success: boolean;
  data: { rol: Rol };
}

export interface RolPermisosResponse {
  success: boolean;
  data: {
    rol: Rol;
    permisos: Permiso[];
    agrupado: PermisosAgrupados;
    total: number;
  };
}

export interface SyncPermisosResponse {
  success: boolean;
  message: string;
  data: {
    permisos: Permiso[];
    agrupado: PermisosAgrupados;
    total: number;
  };
}

export interface UsuarioRolesListResponse {
  success: boolean;
  data: {
    roles: UsuarioRol[];
    total: number;
  };
}

export interface PermisosEfectivosResponse {
  success: boolean;
  data: {
    permisos: Permiso[];
    agrupado: PermisosAgrupados;
    total: number;
  };
}

export interface MensajeResponse {
  success: boolean;
  message: string;
}

// ============================================
// FILTROS
// ============================================

export interface PermisosFiltros {
  modulo?: string;
  search?: string;
}

export interface RolesFiltros {
  es_sistema?: boolean;
  search?: string;
}

// ============================================
// CONSTANTES PARA UI
// ============================================

// Colores por módulo (para badges, chips, íconos)
export const MODULO_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  usuarios:           { label: 'Usuarios',          color: '#2563eb', bgColor: '#dbeafe', icon: '👤' },
  roles:              { label: 'Roles',              color: '#7c3aed', bgColor: '#ede9fe', icon: '🎭' },
  permisos:           { label: 'Permisos',           color: '#0891b2', bgColor: '#cffafe', icon: '🔐' },
  estudiantes:        { label: 'Estudiantes',        color: '#16a34a', bgColor: '#dcfce7', icon: '🎓' },
  docentes:           { label: 'Docentes',           color: '#d97706', bgColor: '#fef3c7', icon: '👨‍🏫' },
  matriculas:         { label: 'Matrículas',         color: '#dc2626', bgColor: '#fee2e2', icon: '📋' },
  pre_inscripciones:  { label: 'Pre-Inscripciones',  color: '#ea580c', bgColor: '#ffedd5', icon: '📝' },
  academico:          { label: 'Académico',           color: '#0d9488', bgColor: '#ccfbf1', icon: '🏫' },
  materias:           { label: 'Materias',            color: '#4f46e5', bgColor: '#e0e7ff', icon: '📚' },
  notas:              { label: 'Notas',               color: '#be185d', bgColor: '#fce7f3', icon: '✏️' },
  evaluacion:         { label: 'Evaluaciones',        color: '#7c3aed', bgColor: '#f3e8ff', icon: '📊' },
  periodo_evaluacion: { label: 'Períodos',            color: '#0284c7', bgColor: '#e0f2fe', icon: '📅' },
  asistencia:         { label: 'Asistencia',          color: '#15803d', bgColor: '#dcfce7', icon: '✅' },
  reportes:           { label: 'Reportes',            color: '#b45309', bgColor: '#fef3c7', icon: '📈' },
  padres:             { label: 'Padres',              color: '#0f766e', bgColor: '#ccfbf1', icon: '👨‍👩‍👧' },
};

// Colores de acción
export const ACCION_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  leer:       { label: 'Leer',       color: '#2563eb', bgColor: '#dbeafe' },
  crear:      { label: 'Crear',      color: '#16a34a', bgColor: '#dcfce7' },
  actualizar: { label: 'Actualizar', color: '#d97706', bgColor: '#fef3c7' },
  eliminar:   { label: 'Eliminar',   color: '#dc2626', bgColor: '#fee2e2' },
  aprobar:    { label: 'Aprobar',    color: '#7c3aed', bgColor: '#ede9fe' },
  convertir:  { label: 'Convertir',  color: '#0891b2', bgColor: '#cffafe' },
  cerrar:     { label: 'Cerrar',     color: '#64748b', bgColor: '#f1f5f9' },
  manual:     { label: 'Manual',     color: '#dc2626', bgColor: '#fee2e2' },
  boletin:    { label: 'Boletín',    color: '#4f46e5', bgColor: '#e0e7ff' },
  exportar:   { label: 'Exportar',   color: '#0d9488', bgColor: '#ccfbf1' },
};

// Helper: obtiene config del módulo con fallback
export function getModuloConfig(modulo: string) {
  return MODULO_CONFIG[modulo] ?? {
    label:   modulo,
    color:   '#6b7280',
    bgColor: '#f3f4f6',
    icon:    '⚙️',
  };
}

// Helper: obtiene config de acción con fallback
export function getAccionConfig(accion: string) {
  return ACCION_CONFIG[accion] ?? {
    label:   accion,
    color:   '#6b7280',
    bgColor: '#f3f4f6',
  };
}