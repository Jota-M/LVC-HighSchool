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
  estado: 'confirmada' | 'matriculada' | 'cancelada' | 'vencida';
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
}

export interface ConfirmarReservaPayload {
  estudiantes: Array<{
    estudiante_id: number;
    grado_actual_id: number | null;
    grado_destino_id: number;
    turno_destino_id: number;
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
    reserva_principal: ReservaCupoData;
  };
}
