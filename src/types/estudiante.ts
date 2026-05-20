// types/estudiante.ts
// Todas las interfaces del portal estudiantil

// ── Perfil ────────────────────────────────────────────────────
// src/types/estudiante.ts

export interface MaterialAsignadoEstudiante {
  id:                      number;
  material_id:             number | null;
  codigo_material:         string | null;
  titulo:                  string | null;
  titulo_final:            string;              // ← AGREGAR
  descripcion?:            string | null;
  tipo_nombre:             string | null;
  tipo_codigo:             string | null;
  tipo_icono:              string | null;
  tipo_color:              string | null;
  url_archivo?:            string | null;
  url_externa?:            string | null;
  url_final:               string | null;       // ← AGREGAR
  es_enlace_externo:       boolean;
  es_destacado:            boolean;
  origen:                  'gemini' | 'manual' | 'automatico' | 'web_search';
  tipo_recurso:            'interno' | 'externo'; // ← AGREGAR
  url_recurso_externo?:    string | null;       // ← AGREGAR
  titulo_recurso_externo?: string | null;       // ← AGREGAR
  origen_externo?:         string | null;       // ← AGREGAR
  mensaje_docente?:        string | null;
  visto_por_estudiante:    boolean;
  fecha_vista?:            string | null;
  materia_nombre:          string;
  materia_codigo:          string;
  docente_nombres:         string;
  docente_apellido:        string;
  asignacion_docente_id:   number;
  created_at:              string;
}
export interface PerfilEstudiante {
  estudiante_id:       number;
  codigo_estudiante:   string;
  nombres:             string;
  apellidos:           string;
  ci?:                 string;
  fecha_nacimiento?:   string;
  genero?:             string;
  email?:              string;
  telefono?:           string;
  foto_url?:           string | null;
  tiene_discapacidad:  boolean;
  tipo_discapacidad?:  string | null;
  matricula_id:        number;
  numero_matricula:    string;
  estado_matricula:    string;
  es_repitente:        boolean;
  es_becado:           boolean;
  porcentaje_beca?:    number;
  paralelo_nombre:     string;
  grado_nombre:        string;
  nivel_academico:     string;
  turno:               string;
  turno_hora_inicio:   string;
  turno_hora_fin:      string;
  periodo_academico:   string;
  periodo_inicio:      string;
  periodo_fin:         string;
}

// ── Materias ──────────────────────────────────────────────────
export interface MateriaResumen {
  asignacion_docente_id: number;
  grado_materia_id:      number;
  materia_id:            number;
  materia_codigo:        string;
  materia_nombre:        string;
  materia_descripcion?:  string | null;
  horas_semanales?:      number;
  materia_color?:        string | null;
  area_conocimiento?:    string;
  docente_id:            number;
  docente_nombres:       string;
  docente_apellidos:     string;
  docente_foto?:         string | null;
  docente_email?:        string;
  periodo_evaluacion_id?: number | null;
  trimestre_nombre?:     string | null;
  trimestre_orden?:      number | null;
  total_materiales:      number;
  total_temas:           number;
  temas_completados:     number;
  progreso_promedio:     number;
  nota_final?:           number | null;
  aprobado?:             boolean | null;
  estado_nota?:          string | null;
  asistencias_presentes: number;
  asistencias_ausentes:  number;
  asistencias_total:     number;
}

export interface TemarioItem {
  unidad_id:                  number;
  numero_unidad:              number;
  unidad_titulo:              string;
  unidad_descripcion?:        string | null;
  fecha_inicio_prevista?:     string | null;
  fecha_fin_prevista?:        string | null;
  tema_id:                    number | null;
  numero_tema:                number | null;
  tema_titulo:                string | null;
  tema_descripcion?:          string | null;
  nivel_dificultad?:          string | null;
  duracion_estimada?:         number | null;
  es_obligatorio:             boolean;
  palabras_clave?:            string[] | null;
  materiales_disponibles:     number;
  estado_progreso:            'no_iniciado' | 'en_progreso' | 'completado' | 'revisando';
  porcentaje_avance:          number;
  tiempo_dedicado:            number;
  progreso_fecha_inicio?:     string | null;
  progreso_fecha_completado?: string | null;
}

// ── Materiales ────────────────────────────────────────────────
export interface MaterialEstudiante {
  id:                    number;
  codigo_material:       string;
  titulo:                string;
  descripcion?:          string | null;
  es_enlace_externo:     boolean;
  url_archivo?:          string | null;
  url_externa?:          string | null;
  nombre_archivo?:       string | null;
  tamano_bytes?:         number | null;
  tipo_mime?:            string | null;
  requiere_descarga:     boolean;
  es_destacado:          boolean;
  contador_vistas:       number;
  contador_descargas:    number;
  fecha_publicacion:     string;
  version:               number;
  tipo_material_nombre:  string;
  tipo_material_icono:   string;
  tipo_material_color:   string;
  es_favorito:           boolean;
  ya_accedido:           boolean;
  total_comentarios:     number;
  temas?: { tema_id: number; tema_titulo: string; es_principal: boolean }[];
}

export interface MaterialDetalleEstudiante extends MaterialEstudiante {
  materia_nombre:    string;
  materia_color?:    string | null;
  docente_nombres:   string;
  docente_apellidos: string;
  matricula_id:      number;
  temas: {
    tema_id:        number;
    tema_titulo:    string;
    numero_tema:    number;
    unidad_titulo:  string;
    numero_unidad:  number;
    es_principal:   boolean;
    orden:          number;
  }[];
}

export interface FavoritoEstudiante {
  material_academico_id: number;
  matricula_id:          number;
  notas_personales?:     string | null;
  created_at:            string;
  material_titulo:       string;
  material_descripcion?: string | null;
  url_archivo?:          string | null;
  url_externa?:          string | null;
  es_enlace_externo?:    boolean;
  tipo_material_nombre:  string;
  tipo_material_icono:   string;
  tipo_material_color:   string;
}

// ── Progreso ──────────────────────────────────────────────────
export interface ProgresoTema {
  tema_id:           number;
  tema_titulo?:      string;
  unidad_titulo?:    string;
  estado:            'no_iniciado' | 'en_progreso' | 'completado' | 'revisando';
  porcentaje_avance: number;
  tiempo_dedicado:   number;
  fecha_completado?: string | null;
}

// ── Notas ─────────────────────────────────────────────────────
export interface BoletinMateria {
  nota_auto: null;
  materia_nombre:   string;
  materia_codigo:   string;
  nota_ser?:        number | null;
  nota_saber?:      number | null;
  nota_hacer?:      number | null;
  nota_final?:      number | null;
  nota_minima:      number;
  aprobado?:        boolean | null;
  estado_periodo?:  string | null;
}

export interface NotaDimension {
  id:                      number;
  nota_promedio:           number;
  total_evaluaciones:      number;
  dimension_nombre:        string;
  dimension_codigo:        string;
  porcentaje_ponderacion:  number;
  dimension_color:         string;
}

export interface EvaluacionConNota {
  id:                  number;
  evaluacion_nombre:   string;
  tipo?:               string;
  fecha?:              string;
  puntaje_maximo:      number;
  peso_en_dimension:   number;
  descripcion?:        string;
  instrucciones?:      string;
  fecha_limite?:       string;
  foto_url?:           string;
  pdf_url?:            string;
  dimension_nombre:    string;
  dimension_codigo:    string;
  dimension_color:     string;
  puntaje_obtenido?:   number | null;
  esta_ausente?:       boolean;
  observacion?:        string;
  nota_sobre_100?:     number | null;
}

export interface NotasPorMateria {
  dimensiones:  NotaDimension[];
  evaluaciones: EvaluacionConNota[];
  nota_final: {
    nota_final?: number;
    aprobado?:   boolean;
    estado?:     string;
  } | null;
}

// ── Horario ───────────────────────────────────────────────────
export interface BloqueHorario {
  dia_semana:       number;
  bloque_numero:    number;
  bloque_nombre:    string;
  hora_inicio:      string;
  hora_fin:         string;
  es_recreo:        boolean;
  materia_id?:      number;
  materia_nombre?:  string;
  materia_color?:   string | null;
  materia_codigo?:  string;
  docente_id?:      number;
  docente_nombres?: string;
  docente_apellidos?: string;
  docente_foto?:    string | null;
  aula?:            string | null;
  celda_color?:     string | null;
}

export interface DiaHorario {
  dia_numero: number;
  dia_nombre: string;
  bloques:    BloqueHorario[];
}

export interface HorarioEstudiante {
  horario_id:    number;
  nombre?:       string;
  publicado_en?: string;
  observaciones?: string;
  dias:          Record<number, string>;
  grilla:        DiaHorario[];
  total_celdas:  number;
}

// ── Tareas / Evaluaciones ─────────────────────────────────────
export type EstadoTarea = 'pendiente' | 'entregado' | 'atrasado' | 'ausente';

export interface TareaEstudiante {
  evaluacion_id:        number;
  evaluacion_nombre:    string;
  tipo?:                string;
  descripcion?:         string | null;
  instrucciones?:       string | null;
  foto_url?:            string | null;
  pdf_url?:             string | null;
  fecha_evaluacion?:    string | null;
  fecha_limite?:        string | null;
  puntaje_maximo:       number;
  peso_en_dimension:    number;
  publicado_en?:        string;
  dimension_id:         number;
  dimension_nombre:     string;
  dimension_codigo:     string;
  dimension_color:      string;
  porcentaje_ponderacion: number;
  materia_nombre:       string;
  materia_codigo:       string;
  materia_color?:       string | null;
  periodo_nombre:       string;
  periodo_evaluacion_id: number;
  periodo_orden:        number;
  calificacion_id?:     number | null;
  puntaje_obtenido?:    number | null;
  esta_ausente?:        boolean;
  observacion_docente?: string | null;
  fecha_registro?:      string | null;
  nota_sobre_100?:      number | null;
  estado_calculado:     EstadoTarea;
  dias_restantes?:      number | null;
}

export interface ResumenTareas {
  total:      number;
  entregados: number;
  pendientes: number;
  atrasados:  number;
  ausentes:   number;
}

// ── Asistencia ────────────────────────────────────────────────
export interface AsistenciaResumen {
  asignacion_id:         number;
  materia_nombre:        string;
  total_clases:          number;
  presentes:             number;
  ausentes:              number;
  tardanzas:             number;
  justificados:          number;
  faltas_parciales:      number;
  porcentaje_asistencia: number;
}

export interface AsistenciaDetalle {
  id:             number;
  fecha:          string;
  estado:         'presente' | 'ausente' | 'tardanza' | 'justificado' | 'falta_parcial';
  hora_marcacion?: string;
  justificacion?:  string;
  observaciones?:  string;
  materia_nombre:  string;
  materia_color?:  string | null;
  permiso_codigo?: string;
  permiso_motivo?: string;
}

// ── Paginación ────────────────────────────────────────────────
export interface Paginacion {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}