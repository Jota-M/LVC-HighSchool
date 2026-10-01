// types/examenTypes.ts

export type TipoPreguntaExamen =
  | 'opcion_multiple'
  | 'verdadero_falso'
  | 'respuesta_corta'
  | 'desarrollo';

export interface PreguntaExamen {
  id: number;
  evaluacion_id?: number;
  tipo: TipoPreguntaExamen;
  pregunta: string;
  opciones: string[] | null;
  respuesta_correcta?: number | null;
  respuesta_esperada?: string | null;
  puntos: number;
  requiere_archivo?: boolean;
  orden?: number;
  activo?: boolean;
  generado_por_ia?: boolean;
}

export interface IntentoExamen {
  id: number;
  evaluacion_id: number;
  matricula_id: number;
  estado: 'en_progreso' | 'entregado' | 'expirado';
  iniciado_en: string;
  entregado_en: string | null;
  puntaje_obtenido: number | null;
  calificado_completo: boolean;
}

export interface RespuestaExamen {
  id: number;
  intento_id: number;
  pregunta_id: number;
  respuesta_opcion?: number | null;
  respuesta_texto?: string | null;
  archivo_url?: string | null;
  archivo_public_id?: string | null;
  es_correcta?: boolean | null;
  puntaje_obtenido?: number | null;
  retroalimentacion?: string | null;
}

export interface IniciarExamenResponse {
  intento: IntentoExamen;
  evaluacion: {
    id: number;
    nombre: string;
    descripcion?: string;
    duracion_minutos: number;
    puntaje_maximo: number;
  };
  segundos_restantes: number | null;
  preguntas: PreguntaExamen[];
  respuestas: RespuestaExamen[];
  ya_finalizado: boolean;
  mensaje?: string;
}

export interface DetallePreguntaRespuesta {
  pregunta_id: number;
  tipo: TipoPreguntaExamen;
  pregunta: string;
  opciones: string[] | null;
  respuesta_correcta?: number | null;
  respuesta_esperada?: string | null;
  puntos_maximos: number;
  requiere_archivo: boolean;
  orden: number;
  respuesta_id?: number | null;
  respuesta_opcion?: number | null;
  respuesta_texto?: string | null;
  archivo_url?: string | null;
  archivo_public_id?: string | null;
  es_correcta?: boolean | null;
  puntaje_obtenido?: number | null;
  retroalimentacion?: string | null;
}

export interface DetalleIntentoDocente extends IntentoExamen {
  evaluacion_nombre: string;
  evaluacion_puntaje_maximo: number;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_codigo: string;
  preguntas: DetallePreguntaRespuesta[];
}

export interface EstudianteIntentoItem {
  matricula_id: number;
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_foto?: string | null;
  intento_id?: number | null;
  estado_intento: 'sin_iniciar' | 'en_progreso' | 'entregado' | 'expirado';
  iniciado_en?: string | null;
  entregado_en?: string | null;
  puntaje_obtenido?: number | null;
  calificado_completo: boolean;
  calificacion_oficial?: number | null;
  respuestas_pendientes_calificar: number;
}

export interface ConfigurarExamenDTO {
  duracion_minutos?: number;
  fecha_hora_inicio?: string | null;
  fecha_hora_fin?: string | null;
  intentos_permitidos?: number;
  orden_aleatorio?: boolean;
}

export interface GenerarExamenIADTO {
  tema_id?: number;
  temaTitulo?: string;
  cantidadOpcionMultiple?: number;
  cantidadVerdaderoFalso?: number;
  cantidadDesarrollo?: number;
  contenidoPersonalizado?: string;
}
