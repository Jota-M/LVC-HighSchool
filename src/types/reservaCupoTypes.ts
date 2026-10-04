// types/reservaCupoTypes.ts

export interface TurnoCupo {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  es_turno_actual: boolean;
}

export interface EstudianteRegularInfo {
  id: number;
  codigo: string;
  ci: string;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_url: string | null;
}

export interface GestionActualInfo {
  periodo_id: number;
  periodo_nombre: string;
  grado_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  paralelo_nombre: string | null;
  turno_id: number;
  turno_nombre: string;
}

export interface ProyeccionSiguienteInfo {
  periodo_id: number;
  periodo_nombre: string;
  grado_id: number;
  grado_nombre: string;
  nivel_nombre: string;
  turnos_disponibles: TurnoCupo[];
  turno_sugerido_id: number;
}

export interface ReservaCupoData {
  id: number;
  codigo_reserva: string;
  codigo_recibo: string;
  estudiante_id: number;
  periodo_academico_id: number;
  grado_actual_id: number | null;
  grado_destino_id: number;
  turno_destino_id: number;
  tutor_nombre: string;
  tutor_ci: string;
  tutor_parentesco: string;
  tutor_telefono: string;
  observaciones: string | null;
  motivo_no_continua?: string | null;
  motivo_anulacion?: string | null;
  fecha_solicitud_anulacion?: string | null;
  fecha_anulacion?: string | null;
  fecha_reactivacion?: string | null;
  anulado_por_usuario_id?: number | null;
  reactivado_por_usuario_id?: number | null;
  estado: 'confirmada' | 'no_continua' | 'solicitud_anulacion' | 'anulada' | 'cancelada' | 'matriculada' | 'vencida';
  fecha_reserva: string;
  fecha_reserva_formateada: string;
  fecha_reserva_corta: string;
  estudiante_codigo: string;
  estudiante_ci: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string | null;
  estudiante_nombre_completo: string;
  estudiante_foto_url: string | null;
  periodo_nombre: string;
  grado_actual_nombre: string | null;
  grado_destino_nombre: string;
  nivel_destino_nombre: string;
  turno_destino_nombre: string;
  turno_hora_inicio: string;
  turno_hora_fin: string;
}

export interface ValidarEstudianteResponse {
  success: boolean;
  data: {
    valido: boolean;
    ya_reservado: boolean;
    estado_reserva?: string;
    error_tipo?: string;
    mensaje?: string;
    estudiante?: EstudianteRegularInfo;
    gestion_actual?: GestionActualInfo;
    proyeccion_siguiente?: ProyeccionSiguienteInfo;
    reserva?: ReservaCupoData;
  };
}

// Estudiante agregado a la lista de reserva (con confirmación de continuidad)
export interface EstudianteSeleccionadoParaReserva {
  estudiante: EstudianteRegularInfo;
  gestion_actual: GestionActualInfo;
  proyeccion_siguiente: ProyeccionSiguienteInfo;
  turno_seleccionado_id: number;
  confirma_continuidad: boolean;
  motivo_no_continua?: string;
}

export interface HermanoParaReserva {
  id_temp: string; // ID temporal único para la UI
  hermano_regular_id: number;
  hermano_regular_nombre?: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci?: string;
  fecha_nacimiento: string;
  genero: string;
  grado_solicitado_id: number;
  grado_solicitado_nombre?: string;
  grado_nombre?: string; // Nombre amigable del grado
  turno_solicitado_id: number;
  turno_solicitado_nombre?: string;
  turno_nombre?: string; // Nombre amigable del turno (Mañana/Tarde)
  tiene_cupo_inmediato?: boolean;
  es_lista_espera?: boolean; // Flag directo para UI
  posicion_espera?: number;
  observaciones?: string;
}

export interface ReservaCupoHermanoData {
  id: number;
  codigo_reserva: string;
  codigo_recibo: string;
  hermano_regular_id: number;
  periodo_academico_id: number;
  grado_solicitado_id: number;
  turno_solicitado_id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string | null;
  fecha_nacimiento: string;
  fecha_nacimiento_formateada?: string;
  genero: string | null;
  tutor_nombre: string;
  tutor_ci: string;
  tutor_parentesco: string;
  tutor_telefono: string;
  estado: 'confirmada' | 'en_espera' | 'anulada';
  posicion_espera: number;
  motivo_reasignacion?: string | null;
  observaciones: string | null;
  fecha_reserva: string;
  fecha_reserva_formateada: string;
  fecha_reserva_corta: string;
  nombre_completo: string;
  periodo_nombre: string;
  grado_solicitado_nombre: string;
  grado_nombre?: string;
  nivel_solicitado_nombre: string;
  nivel_nombre?: string;
  turno_solicitado_nombre: string;
  turno_nombre?: string;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  regular_codigo: string;
  regular_ci: string;
  regular_nombre_completo: string;
  regular_nombres?: string;
  regular_apellidos?: string;
  regular_grado_actual?: string;
  regular_foto_url?: string | null;
}

export interface DisponibilidadHermanoResponse {
  periodo_id: number;
  periodo_nombre: string;
  grado_id: number;
  turno_id: number;
  aforo_total: number;
  regulares_protegidos: number;
  hermanos_confirmados: number;
  total_en_espera: number;
  cupos_disponibles: number;
  tiene_cupo_inmediato: boolean;
  estado_asignacion: 'confirmada' | 'en_espera';
  posicion_espera: number;
  turno_alternativo: {
    turno_id: number;
    turno_nombre: string;
    tiene_cupo_inmediato: boolean;
    cupos_disponibles: number;
  } | null;
  mensaje: string;
}

export interface ConfirmarReservaPayload {
  estudiantes: Array<{
    estudiante_id: number;
    grado_actual_id: number | null;
    grado_destino_id: number;
    turno_destino_id: number;
    continua?: boolean;
    confirma_continuidad?: boolean;
    motivo_no_continua?: string;
  }>;
  hermanos?: Array<{
    hermano_regular_id: number;
    grado_solicitado_id: number;
    turno_solicitado_id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
    ci?: string;
    fecha_nacimiento: string;
    genero?: string;
    observaciones?: string;
  }>;
  periodo_academico_id?: number;
  tutor_nombre: string;
  tutor_ci: string;
  tutor_parentesco: string;
  tutor_telefono: string;
  observaciones?: string;
}

export interface ConfirmarReservaResponse {
  success: boolean;
  message: string;
  data: {
    reservas: ReservaCupoData[];
    hermanos?: ReservaCupoHermanoData[];
    reserva_principal: ReservaCupoData | ReservaCupoHermanoData;
  };
}
