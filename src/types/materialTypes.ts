// types/materialTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type NivelDificultad = 'basico' | 'intermedio' | 'avanzado';

export type EstadoProgreso = 'no_iniciado' | 'en_progreso' | 'completado' | 'revisando';

export type TipoAccion = 'visualizacion' | 'descarga' | 'compartido' | 'impresion';

export type DispositivoAcceso = 'web' | 'movil' | 'tablet';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface TipoMaterial {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
}

export interface UnidadTematica {
  id: number;
  grado_materia_id: number;
  periodo_evaluacion_id?: number | null;
  numero_unidad: number;
  titulo: string;
  descripcion?: string | null;
  objetivos?: string | null;
  orden: number;
  fecha_inicio_prevista?: string | null;
  fecha_fin_prevista?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;

  // Joins
  materia_nombre?: string;
  materia_codigo?: string;
  grado_nombre?: string;
  periodo_evaluacion_nombre?: string;
  total_temas?: number;
}

export interface Tema {
  id: number;
  unidad_tematica_id: number;
  numero_tema: number;
  titulo: string;
  descripcion?: string | null;
  contenido?: string | null;
  palabras_clave?: string[] | null;
  duracion_estimada?: number | null;
  es_obligatorio: boolean;
  orden: number;
  nivel_dificultad?: NivelDificultad | null;
  activo: boolean;
  created_at: string;
  updated_at: string;

  // Joins
  unidad_titulo?: string;
  numero_unidad?: number;
  total_materiales?: number;
}

export interface MaterialAcademico {
  id: number;
  codigo_material: string;
  asignacion_docente_id: number;
  tipo_material_id: number;
  titulo: string;
  descripcion?: string | null;
  es_enlace_externo: boolean;
  url_archivo?: string | null;
  url_externa?: string | null;
  nombre_archivo?: string | null;
  tamano_bytes?: number | null;
  tipo_mime?: string | null;
  subido_por: number;
  visible_para_estudiantes: boolean;
  fecha_publicacion?: string | null;
  fecha_despublicacion?: string | null;
  requiere_descarga: boolean;
  es_destacado: boolean;
  total_vistas: number;
  total_descargas: number;
  activo: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  tipo_material_nombre?: string;
  tipo_material_icono?: string;
  tipo_material_color?: string;
  materia_nombre?: string;
  materia_codigo?: string;
  grado_nombre?: string;
  docente_nombres?: string;
  docente_apellidos?: string;
  subido_por_username?: string;
  total_comentarios?: number;
  total_favoritos?: number;
}

export interface MaterialTema {
  material_academico_id: number;
  tema_id: number;
  es_principal: boolean;
  orden: number;

  // Joins
  tema_titulo?: string;
  numero_tema?: number;
  unidad_titulo?: string;
  numero_unidad?: number;
}

export interface TemarioItem {
  tema_numero: number;
  unidad_numero: number;
  unidad_id: number;
  numero_unidad: number;
  unidad_titulo: string;
  unidad_descripcion?: string;
  tema_id: number;
  numero_tema: number;
  tema_titulo: string;
  tema_descripcion?: string;
  nivel_dificultad?: NivelDificultad;
  total_materiales: number;
}

export interface AccesoMaterial {
  id: number;
  material_academico_id: number;
  matricula_id?: number | null;
  usuario_id: number;
  tipo_accion: TipoAccion;
  ip_address?: string | null;
  user_agent?: string | null;
  dispositivo: DispositivoAcceso;
  duracion_segundos?: number | null;
  completado: boolean;
  created_at: string;

  // Joins
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
}

export interface ComentarioMaterial {
  id: number;
  material_academico_id: number;
  usuario_id: number;
  comentario_padre_id?: number | null;
  contenido: string;
  es_duda: boolean;
  es_resuelto: boolean;
  resuelto_por?: number | null;
  fecha_resolucion?: string | null;
  editado: boolean;
  fecha_edicion?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;

  // Joins
  autor_username?: string;
  autor_nombres?: string;
  autor_apellidos?: string;
  total_respuestas?: number;

  // Anidado en frontend
  respuestas?: ComentarioMaterial[];
}

export interface FavoritoMaterial {
  material_academico_id: number;
  matricula_id: number;
  notas_personales?: string | null;
  created_at: string;

  // Joins
  material_titulo?: string;
  material_descripcion?: string;
  url_archivo?: string;
  url_externa?: string;
  es_enlace_externo?: boolean;
  tipo_material_nombre?: string;
  tipo_material_icono?: string;
  tipo_material_color?: string;
}

export interface ProgresoEstudiante {
  matricula_id: number;
  tema_id: number;
  estado: EstadoProgreso;
  porcentaje_avance: number;
  fecha_inicio?: string | null;
  fecha_completado?: string | null;
  tiempo_dedicado: number;
  updated_at: string;

  // Joins
  tema_titulo?: string;
  unidad_titulo?: string;
}

export interface EstadisticasMaterial {
  material_id: number;
  titulo: string;
  total_vistas: number;
  total_descargas: number;
  total_compartidos: number;
  total_impresiones: number;
  total_comentarios: number;
  total_favoritos: number;
  promedio_duracion_segundos: number;
  total_completados: number;
}

// ============================================
// DTOs
// ============================================

export interface CrearUnidadTematicaDTO {
  grado_materia_id: number;
  periodo_evaluacion_id?: number;
  numero_unidad: number;
  titulo: string;
  descripcion?: string;
  objetivos?: string;
  orden?: number;
  fecha_inicio_prevista?: string;
  fecha_fin_prevista?: string;
}

export interface ActualizarUnidadTematicaDTO extends Partial<Omit<CrearUnidadTematicaDTO, 'grado_materia_id'>> {
  activo?: boolean;
}

export interface CrearTemaDTO {
  unidad_tematica_id: number;
  numero_tema: number;
  titulo: string;
  descripcion?: string;
  contenido?: string;
  palabras_clave?: string[];
  duracion_estimada?: number;
  es_obligatorio?: boolean;
  orden?: number;
  nivel_dificultad?: NivelDificultad;
}

export interface ActualizarTemaDTO extends Partial<Omit<CrearTemaDTO, 'unidad_tematica_id'>> {
  activo?: boolean;
}

export interface CrearMaterialDTO {
  asignacion_docente_id: number;
  tipo_material_id: number;
  titulo: string;
  descripcion?: string;
  es_enlace_externo: boolean;
  url_externa?: string;
  visible_para_estudiantes?: boolean;
  fecha_publicacion?: string;
  fecha_despublicacion?: string;
  requiere_descarga?: boolean;
  es_destacado?: boolean;
  temas?: { tema_id: number; es_principal?: boolean; orden?: number }[];
  archivo?: File;
}

export interface ActualizarMaterialDTO {
  tipo_material_id?: number;
  titulo?: string;
  descripcion?: string;
  url_externa?: string;
  visible_para_estudiantes?: boolean;
  fecha_publicacion?: string;
  fecha_despublicacion?: string;
  requiere_descarga?: boolean;
  es_destacado?: boolean;
  archivo?: File;
}

export interface PublicarMaterialDTO {
  fecha_publicacion?: string;
  fecha_despublicacion?: string;
}

export interface VincularTemaDTO {
  tema_id: number;
  es_principal?: boolean;
  orden?: number;
}

export interface RegistrarAccesoDTO {
  tipo_accion: TipoAccion;
  matricula_id?: number;
  dispositivo?: DispositivoAcceso;
  duracion_segundos?: number;
  completado?: boolean;
}

export interface CrearComentarioDTO {
  contenido: string;
  comentario_padre_id?: number;
  es_duda?: boolean;
}

export interface ActualizarProgresoDTO {
  matricula_id: number;
  estado?: EstadoProgreso;
  porcentaje_avance?: number;
  tiempo_dedicado?: number;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TiposMaterialResponse {
  success: boolean;
  data: { tipos: TipoMaterial[] };
}

export interface UnidadesListResponse {
  success: boolean;
  data: {
    unidades: UnidadTematica[];
    paginacion: Paginacion;
  };
}

export interface UnidadResponse {
  success: boolean;
  data: { unidad: UnidadTematica };
}

export interface TemarioResponse {
  success: boolean;
  data: { temario: TemarioItem[] };
}

export interface TemasListResponse {
  success: boolean;
  data: {
    temas: Tema[];
    paginacion: Paginacion;
  };
}

export interface TemaResponse {
  success: boolean;
  data: { tema: Tema };
}

export interface MaterialesListResponse {
  success: boolean;
  data: {
    materiales: MaterialAcademico[];
    paginacion: Paginacion;
  };
}

export interface MaterialResponse {
  success: boolean;
  data: {
    material: MaterialAcademico;
    temas: MaterialTema[];
  };
}

export interface EstadisticasResponse {
  success: boolean;
  data: { estadisticas: EstadisticasMaterial };
}

export interface ComentariosResponse {
  success: boolean;
  data: { comentarios: ComentarioMaterial[] };
}

export interface FavoritosResponse {
  success: boolean;
  data: { favoritos: FavoritoMaterial[] };
}

export interface ProgresoResponse {
  success: boolean;
  data: { progreso: ProgresoEstudiante[] };
}

// ============================================
// FILTROS
// ============================================

export interface UnidadFiltros {
  grado_materia_id?: number;
  periodo_evaluacion_id?: number;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface TemaFiltros {
  unidad_tematica_id?: number;
  activo?: boolean;
  nivel_dificultad?: NivelDificultad;
  page?: number;
  limit?: number;
}

export interface MaterialFiltros {
  asignacion_docente_id?: number;
  tipo_material_id?: number;
  visible_para_estudiantes?: boolean;
  es_destacado?: boolean;
  solo_publicados?: boolean;
  tema_id?: number;
  page?: number;
  limit?: number;
}

// ============================================
// CONSTANTES PARA UI
// ============================================

export const NIVELES_DIFICULTAD: {
  value: NivelDificultad;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { value: 'basico',      label: 'Básico',      color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'intermedio',  label: 'Intermedio',  color: '#d97706', bgColor: '#fef3c7' },
  { value: 'avanzado',    label: 'Avanzado',    color: '#dc2626', bgColor: '#fee2e2' },
];

export const ESTADOS_PROGRESO: {
  value: EstadoProgreso;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}[] = [
  { value: 'no_iniciado', label: 'No iniciado',  color: '#6b7280', bgColor: '#f3f4f6', icon: '⭕' },
  { value: 'en_progreso', label: 'En progreso',  color: '#2563eb', bgColor: '#dbeafe', icon: '🔵' },
  { value: 'completado',  label: 'Completado',   color: '#16a34a', bgColor: '#dcfce7', icon: '✅' },
  { value: 'revisando',   label: 'Revisando',    color: '#d97706', bgColor: '#fef3c7', icon: '🔄' },
];