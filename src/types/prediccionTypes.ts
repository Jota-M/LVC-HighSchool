// types/prediccionTypes.ts — actualizado para dimensiones SAB/HAC/complementaria
// + candidato_notificacion_padre (modal de confirmación docente → padre)

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type NivelRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';
export type Clasificacion = 'ED' | 'DA' | 'DO' | 'DP';
export type NivelConfianza = 'muy_baja' | 'baja' | 'media' | 'alta' | 'muy_alta';

// ============================================
// CONFIG PERÍODO
// ============================================

export interface ConfigPeriodo {
  total_semanas: number;
  ponderaciones: {
    SAB: number;
    HAC: number;
    SER?: number;
    AUT?: number;
    [key: string]: number | undefined;
  };
}

// ============================================
// MATERIAL DEL REPOSITORIO
// ============================================

export interface MaterialDisponible {
  id: number;
  titulo: string;
  tipo: string;
  tipo_codigo: string;
  tema_id?: number | null;
  tema_titulo?: string | null;
  descripcion?: string | null;
  es_destacado: boolean;
  url?: string | null;
}

export interface RecursoRecomendado {
  material_id?: number | null;
  titulo: string;
  tipo: string;
  tema_titulo?: string | null;
  url?: string | null;
  razon: string;
}

// ============================================
// RESULTADO DEL MODELO ML
// ============================================

export interface ConfianzaPrediccion {
  nivel: NivelConfianza;
  porcentaje_periodo: number;
  mensaje: string;
}

export interface ResultadoModelo {
  probabilidad_reprobar: number;
  nivel_riesgo: NivelRiesgo;
  nota_estimada_final: number;
  clasificacion_estimada: Clasificacion;
  factores_riesgo: string[];
  factores_positivos: string[];
  confianza: ConfianzaPrediccion;
}

export interface AnalisisGemini {
  explicacion: string;
  recomendaciones: string[];
  recursos_sugeridos: RecursoRecomendado[];
  alerta_urgente: boolean;
  mensaje_alerta?: string | null;
}

// ============================================
// NOTIFICACIÓN GENERADA
// ============================================

export interface NotificacionAlerta {
  notificacionId: number;
  codigo: string;
}

// ============================================
// CANDIDATO A NOTIFICACIÓN AL PADRE
// ============================================
// Se arma en el backend cuando nivel_riesgo === 'critico', pero NO se envía
// solo. El docente debe confirmar desde el modal (ModalNotificarPadre) para
// que se dispare POST /api/prediccion/notificar-padre.

export interface CandidatoNotificacionPadre {
  matricula_id: number;
  estudiante_id: number;
  materia_nombre: string;
  nivel_riesgo: NivelRiesgo;
  nota_estimada: number;
  asistencia_pct: number;
  recomendaciones: string[];
  // Presente en los candidatos que vienen de /clase (ya conoce el nombre).
  // En /estudiante no viene del backend — se arma en el frontend con el
  // nombre del estudiante ya seleccionado.
  nombre_completo?: string;
  mensaje_sugerido?: string | null;
}

// ============================================
// META — DATOS DE CONTEXTO (actualizado)
// ============================================

export interface PrediccionMeta {
  total_clases: number;
  clases_asistidas: number;

  // Nuevo — separado por dimensión
  n_notas_sab: number;   // Saber: exámenes, pruebas
  n_notas_hac: number;   // Hacer: prácticas, tareas, proyectos
  nota_complementaria_pct: number;   // Aporte real de SER+AUT ponderado
  peso_complementario: number;   // Cuánto pesa SER+AUT en el total (ej: 0.15)

  // Legacy — mantenidos por compatibilidad con código existente
  n_notas_practicas?: number;
  n_notas_examenes?: number;

  materiales_consultados: number;
  periodo_nombre: string;
  semana_actual: number;
  total_semanas: number;

  historial_disponible?: boolean;  // true si hay datos de trimestres anteriores
  racha_trims_riesgo?: number;   // cuántos trimestres consecutivos en riesgo

}

// ============================================
// RESPUESTA PREDICCIÓN INDIVIDUAL
// ============================================

export interface PrediccionEstudianteResponse {
  success: boolean;
  data: {
    estudiante_id: number;
    materia: string;
    codigo_materia: string;
    trimestre: number;
    semana_actual: number;
    total_semanas: number;
    modelo: ResultadoModelo;
    analisis?: AnalisisGemini | null;
    modelo_usado: string;
    gemini_disponible: boolean;
    _meta: PrediccionMeta;
    notificacion_alerta?: NotificacionAlerta | null;
    candidato_notificacion_padre?: CandidatoNotificacionPadre | null;
  };
}

// ============================================
// SIMULACIÓN DE ESCENARIOS — actualizado
// ============================================

export interface EscenarioSimulacion {
  descripcion: string;
  // Campos existentes
  asistencia_proyectada?: number;
  nota_proxima_practica?: number;   // → HAC (Hacer)
  nota_proximo_examen?: number;   // → SAB (Saber)
  semanas_adicionales?: number;
  // Campo nuevo — permite simular cambio en SER+AUT
  nota_complementaria_pct?: number;
}

export interface ResultadoEscenario {
  descripcion: string;
  probabilidad_reprobar: number;
  nivel_riesgo: NivelRiesgo;
  nota_estimada_final: number;
  cambio_probabilidad: number;
  cambio_nota: number;
  conclusion: string;
}

export interface SimulacionResponse {
  success: boolean;
  data: {
    estudiante_id: number;
    materia: string;
    semana_actual: number;
    total_semanas: number;
    situacion_actual: ResultadoModelo;
    escenarios: ResultadoEscenario[];
    recomendacion_gemini?: string | null;
  };
}

// ============================================
// ANÁLISIS DE CLASE COMPLETA
// ============================================

export interface EstudianteClase {
  estudiante_id: number;
  matricula_id: number;
  nombre_completo: string;
  nivel_riesgo: NivelRiesgo;
  probabilidad_reprobar: number;
  nota_estimada_final: number;
  clasificacion: Clasificacion;
  asistencia_pct: number;
  factores_riesgo: string[];
}

export interface AnalisisClaseGemini {
  diagnostico: string;
  patron_principal: string;
  acciones_grupo: string[];
  acciones_individuales: string;
  alerta_institucional: boolean;
  mensaje_institucional?: string | null;
}

export interface ClaseResponse {
  success: boolean;
  data: {
    total_estudiantes: number;
    en_riesgo_critico: number;
    en_riesgo_alto: number;
    en_riesgo_medio: number;
    sin_riesgo: number;
    promedio_clase: number;
    asistencia_promedio: number;
    pct_riesgo: number;
    estudiantes: EstudianteClase[];
    materia: string;
    semana: number;
    analisis?: AnalisisClaseGemini | null;
    candidatos_notificacion_padre?: CandidatoNotificacionPadre[];
  };
}

// ============================================
// PLAN DE RECUPERACIÓN
// ============================================

export interface PlanSemanal {
  semana: number;
  accion_docente: string;
  accion_estudiante: string;
  meta: string;
  material_id_sugerido?: number | null;
}

export interface PlanRecuperacion {
  objetivo: string;
  plan_semanal: PlanSemanal[];
  nota_proyectada: number;
  involucrar_padres: boolean;
  mensaje_padres?: string | null;
}

export interface PlanRecuperacionResponse {
  success: boolean;
  data: {
    estudiante_id: number;
    materia: string;
    semana_actual: number;
    semanas_restantes: number;
    total_semanas: number;
    nivel_riesgo: NivelRiesgo;
    nota_estimada: number;
    plan?: PlanRecuperacion | null;
    gemini_disponible: boolean;
    mensaje?: string;
  };
}

// ============================================
// DTOs PARA REQUESTS
// ============================================

export interface PrediccionEstudianteDTO {
  matricula_id: number;
  asignacion_docente_id: number;
  periodo_evaluacion_id: number;
}

export interface SimulacionDTO extends PrediccionEstudianteDTO {
  escenarios: EscenarioSimulacion[];
}

export interface NotificarPadreDTO {
  matricula_id: number;
  materia_nombre: string;
  nota_estimada: number;
  asistencia_pct: number;
  recomendaciones?: string[];
  asignacion_docente_id?: number;
}

// ============================================
// HEALTH DEL SERVICIO ML
// ============================================

export interface MLHealthResponse {
  success: boolean;
  disponible: boolean;
  modelos_cargados?: boolean;
  gemini?: boolean;
  version?: string;
  n_features?: number;
  status?: string;
  error?: string;
}

// ============================================
// CONTEXTO DE DIMENSIONES — nuevo
// Usado por TabSimulacion para saber los pesos reales
// ============================================

export interface ContextoDimensiones {
  peso_sab: number;   // 0-1, ej: 0.45
  peso_hac: number;   // 0-1, ej: 0.40
  peso_complementario: number;   // 0-1, ej: 0.15 (SER+AUT)
  tiene_complementario: boolean; // false si el Ministerio los eliminó
  // Situación actual del estudiante
  prom_sab_actual: number | null;
  prom_hac_actual: number | null;
  nota_comp_actual: number;
}

// ============================================
// CONSTANTES PARA UI
// ============================================

export const NIVELES_RIESGO: {
  value: NivelRiesgo;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
    { value: 'bajo', label: 'Bajo', color: '#16a34a', bgColor: '#dcfce7', borderColor: '#86efac' },
    { value: 'medio', label: 'Medio', color: '#d97706', bgColor: '#fef3c7', borderColor: '#fcd34d' },
    { value: 'alto', label: 'Alto', color: '#ea580c', bgColor: '#ffedd5', borderColor: '#fdba74' },
    { value: 'critico', label: 'Crítico', color: '#dc2626', bgColor: '#fee2e2', borderColor: '#fca5a5' },
  ];

export const CLASIFICACIONES: {
  value: Clasificacion;
  label: string;
  rango: string;
  color: string;
}[] = [
    { value: 'ED', label: 'En Desarrollo', rango: '0-50', color: '#dc2626' },
    { value: 'DA', label: 'Desarrollo Acepta.', rango: '51-68', color: '#d97706' },
    { value: 'DO', label: 'Desarrollo Óptimo', rango: '69-84', color: '#2563eb' },
    { value: 'DP', label: 'Desarrollo Pleno', rango: '85-100', color: '#16a34a' },
  ];
export interface RestriccionesOptimo {
  bloquearPracticas?: boolean;
  bloquearExamenes?: boolean;
  bloquearAsistencia?: boolean;
}

export interface AccionRequerida {
  componente: 'practicas' | 'examenes' | 'asistencia';
  label: string;
  valor_actual: number;
  valor_necesario: number;
  delta: number;
  impacto_nota: number;
  dificultad: 'baja' | 'media' | 'alta';
}

export interface SimulacionOptimoResponse {
  objetivo_nota: number;
  nota_actual: number;
  nota_proyectada: number;
  alcanzable: boolean;
  acciones: AccionRequerida[];
  nota_maxima_posible: number;
  mensaje: string;
  modo: string;
}

export interface SimulacionOptimoDTO extends Pick<PrediccionEstudianteDTO, 'matricula_id' | 'asignacion_docente_id' | 'periodo_evaluacion_id'> {
  objetivo_nota?: number;          // default 51
  restricciones?: RestriccionesOptimo;
}

export interface EvaluacionPendienteResponse {
  numero: number;
  tipo: 'practica' | 'examen';
  nota_objetivo: number;
  es_alcanzable: boolean;
}

export interface EscenarioDetalladoResponse {
  id: 'minimo' | 'solo_practicas' | 'con_examen' | 'agresivo';
  titulo: string;
  descripcion: string;
  evaluaciones: EvaluacionPendienteResponse[];
  nota_proyectada: number;
  alcanzable: boolean;
  porcentaje_exito: number;
  mensaje: string;
}

export interface SimulacionOptimoV2Response {
  objetivo_nota: number;
  nota_actual: number;
  nota_maxima_posible: number;
  semanas_restantes: number;
  practicas_restantes_est: number;
  examenes_restantes_est: number;
  techo_practicas: number;
  techo_examenes: number;
  escenarios: EscenarioDetalladoResponse[];
  ya_alcanza: boolean;
  imposible: boolean;
  mensaje_general: string;
}

export interface SimulacionOptimoV2DTO extends Pick<
  PrediccionEstudianteDTO,
  'matricula_id' | 'asignacion_docente_id' | 'periodo_evaluacion_id'
> {
  objetivo_nota?: number;
  restricciones?: RestriccionesOptimo;
  practicas_restantes?: number;   // undefined = estimar por ritmo
  examenes_restantes?: number;   // undefined = estimar por ritmo
}