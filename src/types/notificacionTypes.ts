// types/notificacionTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type TipoNotificacion =
  | 'aviso_general'
  | 'pago_vencido'
  | 'comunicado_grado'
  | 'notificacion_individual';

export type AudienciaNotificacion =
  | 'todos'
  | 'docentes'
  | 'padres'
  | 'estudiantes'
  | 'padres_estudiantes'
  | 'individual';

export type PrioridadNotificacion = 'baja' | 'normal' | 'alta' | 'urgente';

export type EstadoNotificacion =
  | 'borrador'
  | 'programada'
  | 'enviando'
  | 'enviada'
  | 'fallida';

export type CanalNotificacion = 'whatsapp' | 'email' | 'interno';

export type EstadoEnvio =
  | 'pendiente'
  | 'enviado'
  | 'entregado'
  | 'fallido'
  | 'omitido';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface NotificacionInstitucional {
  id: number;
  codigo: string;

  // Contenido
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;

  // Segmentación
  audiencia: AudienciaNotificacion;
  nivel_academico_id?: number | null;
  grado_id?: number | null;
  paralelo_id?: number | null;
  periodo_academico_id?: number | null;
  destinatario_usuario_id?: number | null;

  // Canales
  enviar_whatsapp: boolean;
  enviar_email: boolean;
  enviar_interno: boolean;

  // Programación
  programada_para?: string | null;
  enviada_en?: string | null;

  // Estado
  estado: EstadoNotificacion;

  // Adjuntos
  adjunto_url?: string | null;
  adjunto_nombre?: string | null;
  foto_url?: string | null;
  foto_public_id?: string | null;

  // Auditoría
  creada_por: number;
  created_at: string;
  updated_at: string;

  // Joins
  creada_por_username?: string;
  grado_nombre?: string;
  paralelo_nombre?: string;
  nivel_nombre?: string;
  periodo_nombre?: string;

  // Resumen de envíos (del GROUP BY)
  total_destinatarios?: number;
  enviados?: number;
  fallidos?: number;
  leidos?: number;
}

export interface NotificacionDestinatario {
  id: number;
  notificacion_id: number;
  usuario_id?: number | null;
  nombre_destinatario?: string;
  celular_snapshot?: string | null;
  email_snapshot?: string | null;
  rol_destinatario?: 'docente' | 'padre' | 'estudiante' | 'admin';
  canal: CanalNotificacion;
  estado_envio: EstadoEnvio;
  enviado_en?: string | null;
  error_mensaje?: string | null;
  leido: boolean;
  leido_en?: string | null;
  created_at: string;
}

export interface ResumenEnvioCanal {
  canal: CanalNotificacion;
  total: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
  leidos: number;
}

// Notificación en la bandeja del usuario (canal interno)
// types/notificacionTypes.ts
export interface NotificacionBandeja {
  destinatario_id: number;
  leido: boolean;
  leido_en?: string | null;
  recibido_en: string;
  notificacion_id: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  adjunto_url?: string | null;
  adjunto_nombre?: string | null; // ✅ agregado
  foto_url?: string | null;       // ✅ agregado
  foto_public_id?: string | null; // ✅ agregado
  enviada_en?: string | null;
}

// ============================================
// DTOs
// ============================================

export interface CrearNotificacionDTO {
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  prioridad?: PrioridadNotificacion;
  audiencia: AudienciaNotificacion;

  // Filtros de segmentación (opcionales)
  nivel_academico_id?: number;
  grado_id?: number;
  paralelo_id?: number;
  periodo_academico_id?: number;
  destinatario_usuario_id?: number;

  // Canales
  enviar_whatsapp?: boolean;
  enviar_email?: boolean;
  enviar_interno?: boolean;

  // Programación
  programada_para?: string;

  // Adjuntos
  adjunto_url?: string;
  adjunto_nombre?: string;
  foto?: File; // para multipart/form-data
}

export interface ActualizarNotificacionDTO extends Partial<CrearNotificacionDTO> {}

// ============================================
// RESPUESTAS API
// ============================================

export interface NotificacionesListResponse {
  success: boolean;
  data: {
    notificaciones: NotificacionInstitucional[];
    paginacion: Paginacion;
  };
}

export interface NotificacionResponse {
  success: boolean;
  data: {
    notificacion: NotificacionInstitucional;
    resumen: ResumenEnvioCanal[];
  };
}

export interface BandejaResponse {
  success: boolean;
  data: {
    notificaciones: NotificacionBandeja[];
    no_leidas: number;
  };
}

export interface EnviarResponse {
  success: boolean;
  message: string;
  data: {
    notificacion_id: number;
    estado: string;
  };
}

// ============================================
// FILTROS
// ============================================

export interface NotificacionFiltros {
  page?: number;
  limit?: number;
  tipo?: TipoNotificacion;
  estado?: EstadoNotificacion;
  audiencia?: AudienciaNotificacion;
  fecha_inicio?: string;
  fecha_fin?: string;
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

export const TIPOS_NOTIFICACION: {
  value: TipoNotificacion;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: 'aviso_general',
    label: 'Aviso General',
    icon: '📢',
    color: '#2563eb',
    bgColor: '#dbeafe',
  },
  {
    value: 'pago_vencido',
    label: 'Alerta de Pago',
    icon: '💳',
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
  {
    value: 'comunicado_grado',
    label: 'Comunicado por Grado',
    icon: '📚',
    color: '#7c3aed',
    bgColor: '#ede9fe',
  },
  {
    value: 'notificacion_individual',
    label: 'Notificación Individual',
    icon: '📩',
    color: '#059669',
    bgColor: '#d1fae5',
  },
];

export const AUDIENCIAS: {
  value: AudienciaNotificacion;
  label: string;
  icon: string;
  descripcion: string;
}[] = [
  { value: 'todos',             label: 'Toda la institución', icon: '🏫', descripcion: 'Docentes, padres y estudiantes' },
  { value: 'docentes',          label: 'Solo docentes',       icon: '👨‍🏫', descripcion: 'Todos los docentes activos' },
  { value: 'padres',            label: 'Solo padres',         icon: '👨‍👩‍👧', descripcion: 'Padres de familia con recibe_notificaciones' },
  { value: 'estudiantes',       label: 'Solo estudiantes',    icon: '🎒', descripcion: 'Estudiantes con matrícula activa' },
  { value: 'padres_estudiantes',label: 'Padres y estudiantes',icon: '👨‍👩‍👧‍👦', descripcion: 'Ambos grupos a la vez' },
  { value: 'individual',        label: 'Individual',          icon: '👤', descripcion: 'Una persona específica' },
];

export const PRIORIDADES: {
  value: PrioridadNotificacion;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'baja',    label: 'Baja',     color: '#6b7280', bgColor: '#f3f4f6' },
  { value: 'normal',  label: 'Normal',   color: '#2563eb', bgColor: '#dbeafe' },
  { value: 'alta',    label: 'Alta',     color: '#d97706', bgColor: '#fef3c7' },
  { value: 'urgente', label: 'Urgente',  color: '#dc2626', bgColor: '#fee2e2' },
];

export const ESTADOS_NOTIFICACION: {
  value: EstadoNotificacion;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'borrador',   label: 'Borrador',   color: '#6b7280', bgColor: '#f3f4f6' },
  { value: 'programada', label: 'Programada', color: '#2563eb', bgColor: '#dbeafe' },
  { value: 'enviando',   label: 'Enviando…',  color: '#d97706', bgColor: '#fef3c7' },
  { value: 'enviada',    label: 'Enviada',    color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'fallida',    label: 'Fallida',    color: '#dc2626', bgColor: '#fee2e2' },
];