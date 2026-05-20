// types/asistenciaTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type EstadoAsistencia =
  | 'presente'
  | 'ausente'
  | 'tardanza'
  | 'justificado'
  | 'falta_parcial';

export type EstadoPermiso = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export type MotivoPermiso =
  | 'cita_medica'
  | 'enfermedad'
  | 'viaje_familiar'
  | 'tramite_personal'
  | 'emergencia_familiar'
  | 'actividad_deportiva'
  | 'actividad_cultural'
  | 'otro';

export type DispositivoAsistencia = 'web' | 'movil' | 'tablet' | 'qr';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface SolicitudPermiso {
  id: number;
  codigo_solicitud: string;
  estudiante_id: number;
  padre_familia_id?: number | null;
  asignacion_docente_id?: number | null;
  fecha_ausencia: string;
  es_dia_completo: boolean;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo: MotivoPermiso;
  descripcion?: string | null;
  archivo_adjunto_url?: string | null;
  estado: EstadoPermiso;
  revisado_por?: number | null;
  fecha_revision?: string | null;
  motivo_rechazo?: string | null;
  observaciones_revisor?: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
  estudiante_codigo?: string;
  estudiante_foto?: string;
  padre_nombres?: string;
  padre_apellidos?: string;
  padre_telefono?: string;
  materia_nombre?: string;
  revisado_por_username?: string;
}

export interface HistorialPermiso {
  id: number;
  solicitud_permiso_id: number;
  estado_anterior?: string | null;
  estado_nuevo: string;
  usuario_id?: number | null;
  comentario?: string | null;
  created_at: string;
  usuario_username?: string;
}

export interface Asistencia {
  id: number;
  matricula_id: number;
  asignacion_docente_id: number;
  fecha: string;
  estado: EstadoAsistencia;
  solicitud_permiso_id?: number | null;
  justificacion?: string | null;
  marcado_por: number;
  hora_marcacion: string;
  dispositivo?: DispositivoAsistencia | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
  estudiante_codigo?: string;
  materia_nombre?: string;
  marcado_por_username?: string;
  permiso_codigo?: string;
}

// Ítem de la lista del día (puede no tener asistencia registrada aún)
export interface EstudianteDia {
  id?: number;                  // id del registro asistencia (null si no marcado)
  estado?: EstadoAsistencia;    // null si no marcado
  hora_marcacion?: string;
  observaciones?: string;
  solicitud_permiso_id?: number | null;
  matricula_id: number;
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_foto?: string | null;
}

// ============================================
// DTOs
// ============================================

export interface CrearSolicitudPermisoDTO {
  estudiante_id: number;
  padre_familia_id?: number;
  asignacion_docente_id?: number;
  fecha_ausencia: string;
  es_dia_completo?: boolean;
  hora_inicio?: string;
  hora_fin?: string;
  motivo: MotivoPermiso;
  descripcion?: string;
  archivo_adjunto_url?: string;
}

export interface CambiarEstadoPermisoDTO {
  estado: 'aprobada' | 'rechazada' | 'cancelada';
  motivo_rechazo?: string;
  observaciones_revisor?: string;
}

export interface CrearAsistenciaDTO {
  matricula_id: number;
  asignacion_docente_id: number;
  fecha: string;
  estado: EstadoAsistencia;
  solicitud_permiso_id?: number;
  justificacion?: string;
  dispositivo?: DispositivoAsistencia;
  observaciones?: string;
}

export interface RegistroMasivoItem {
  matricula_id: number;
  estado: EstadoAsistencia;
  solicitud_permiso_id?: number;
  justificacion?: string;
  observaciones?: string;
}

export interface RegistrarMasivoDTO {
  asignacion_docente_id: number;
  fecha: string;
  dispositivo?: DispositivoAsistencia;
  registros: RegistroMasivoItem[];
}

export interface ActualizarAsistenciaDTO {
  estado?: EstadoAsistencia;
  justificacion?: string;
  observaciones?: string;
  solicitud_permiso_id?: number;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface SolicitudesListResponse {
  success: boolean;
  data: {
    solicitudes: SolicitudPermiso[];
    paginacion: Paginacion;
  };
}

export interface SolicitudResponse {
  success: boolean;
  data: {
    solicitud: SolicitudPermiso;
    historial: HistorialPermiso[];
  };
}

export interface AsistenciasListResponse {
  success: boolean;
  data: {
    asistencias: Asistencia[];
    paginacion: Paginacion;
  };
}

export interface ListaDiaResponse {
  success: boolean;
  data: {
    lista: EstudianteDia[];
    total: number;
    ya_marcados: number;
    pendientes: number;
  };
}

export interface ReporteAsistencia {
  asignacion_id: number;
  materia_nombre: string;
  total_clases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  faltas_parciales: number;
  porcentaje_asistencia: number;
}

export interface ReporteResponse {
  success: boolean;
  data: {
    reporte: ReporteAsistencia[];
  };
}

// ============================================
// FILTROS
// ============================================

export interface SolicitudPermisoFiltros {
  page?: number;
  limit?: number;
  estudiante_id?: number;
  padre_familia_id?: number;
  estado?: EstadoPermiso;
  fecha_inicio?: string;
  fecha_fin?: string;
  asignacion_docente_id?: number;
}

export interface AsistenciaFiltros {
  page?: number;
  limit?: number;
  matricula_id?: number;
  asignacion_docente_id?: number;
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoAsistencia;
}

// ============================================
// PAGINACIÓN
// ============================================

export interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// CONSTANTES PARA UI
// ============================================

export const ESTADOS_ASISTENCIA: {
  value: EstadoAsistencia;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'presente',     label: 'Presente',       color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'ausente',      label: 'Ausente',        color: '#dc2626', bgColor: '#fee2e2' },
  { value: 'tardanza',     label: 'Tardanza',       color: '#d97706', bgColor: '#fef3c7' },
  { value: 'justificado',  label: 'Justificado',    color: '#2563eb', bgColor: '#dbeafe' },
  { value: 'falta_parcial',label: 'Falta Parcial',  color: '#7c3aed', bgColor: '#ede9fe' },
];

export const ESTADOS_PERMISO: {
  value: EstadoPermiso;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'pendiente',  label: 'Pendiente',  color: '#d97706', bgColor: '#fef3c7' },
  { value: 'aprobada',   label: 'Aprobada',   color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'rechazada',  label: 'Rechazada',  color: '#dc2626', bgColor: '#fee2e2' },
  { value: 'cancelada',  label: 'Cancelada',  color: '#6b7280', bgColor: '#f3f4f6' },
];

export const MOTIVOS_PERMISO: { value: MotivoPermiso; label: string; icon: string }[] = [
  { value: 'cita_medica',          label: 'Cita Médica',           icon: '🏥' },
  { value: 'enfermedad',           label: 'Enfermedad',            icon: '🤒' },
  { value: 'viaje_familiar',       label: 'Viaje Familiar',        icon: '✈️'  },
  { value: 'tramite_personal',     label: 'Trámite Personal',      icon: '📋' },
  { value: 'emergencia_familiar',  label: 'Emergencia Familiar',   icon: '🚨' },
  { value: 'actividad_deportiva',  label: 'Actividad Deportiva',   icon: '⚽' },
  { value: 'actividad_cultural',   label: 'Actividad Cultural',    icon: '🎭' },
  { value: 'otro',                 label: 'Otro',                  icon: '📝' },
];

// Detalle de asistencia de UN estudiante dentro del reporte de clase
export interface EstudianteReporteClase {
  matricula_id:          number;
  estudiante_id:         number;
  estudiante_codigo:     string;
  estudiante_nombres:    string;
  estudiante_apellidos:  string;
  estudiante_foto?:      string | null;
  total_clases:          number;
  presentes:             number;
  ausentes:              number;
  tardanzas:             number;
  justificados:          number;
  faltas_parciales:      number;
  porcentaje_asistencia: number;
}
 
// Totales agregados de la clase
export interface ResumenClase {
  total_dias_registrados: number;
  total_estudiantes:      number;
  total_registros:        number;
  presentes:              number;
  ausentes:               number;
  tardanzas:              number;
  justificados:           number;
  faltas_parciales:       number;
  promedio_asistencia:    number;
  estudiantes_criticos:   number; // con asistencia < 70%
}
 
export interface ReporteClaseResponse {
  success: boolean;
  data: {
    resumen:      ResumenClase;
    estudiantes:  EstudianteReporteClase[];
  };
}
 
export interface CorregirAsistenciaDTO {
  estado:                EstadoAsistencia;
  justificacion?:        string;
  observaciones?:        string;
  solicitud_permiso_id?: number;
}