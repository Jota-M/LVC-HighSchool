// types/seguimientoPedagogicoTypes.ts

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type NivelRelevancia = 'informativo' | 'requiere_atencion' | 'urgente';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface CategoriaObservacion {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  color: string;
  icono: string;
  orden: number;
  activo: boolean;
  created_at: string;
  total_plantillas?: number;
}

export interface PlantillaObservacion {
  id: number;
  categoria_observacion_id: number;
  texto: string;
  nivel_relevancia: NivelRelevancia;
  orden: number;
  activo: boolean;
  // Joins
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
}

export interface ObservacionPedagogica {
  id: number;
  codigo_observacion: string;
  docente_id: number;
  matricula_id: number;
  asignacion_docente_id?: number | null;
  periodo_academico_id: number;
  categoria_observacion_id: number;
  nivel_relevancia: NivelRelevancia;
  descripcion: string;
  fecha_ocurrencia: string;
  plantilla_id?: number | null;
  visible_para_padre: boolean;
  fecha_publicacion?: string | null;
  publicado_por?: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Joins
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
  estudiante_codigo?: string;
  estudiante_foto?: string | null;
  docente_nombres?: string;
  docente_apellido?: string;
  materia_nombre?: string;
  periodo_nombre?: string;
  publicado_por_username?: string;
  plantilla_texto?: string | null;
  total_acuses?: number;
  ultimo_acuse?: string | null;
}

export interface AcuseReciboPadre {
  id: number;
  observacion_pedagogica_id: number;
  padre_familia_id: number;
  fecha_lectura: string;
  comentario_padre?: string | null;
  created_at: string;
  // Joins
  padre_nombres?: string;
  padre_apellidos?: string;
  parentesco?: string;
}

export interface HistorialObservacion {
  id: number;
  observacion_pedagogica_id: number;
  campo_modificado: string;
  valor_anterior?: string | null;
  valor_nuevo?: string | null;
  usuario_id?: number | null;
  comentario?: string | null;
  created_at: string;
  usuario_username?: string;
}

// Línea de tiempo (stored procedure)
export interface LineaTiempoItem {
  observacion_id: number;
  codigo_observacion: string;
  fecha_ocurrencia: string;
  categoria_nombre: string;
  categoria_color: string;
  nivel_relevancia: NivelRelevancia;
  descripcion: string;
  materia_nombre?: string | null;
  docente_nombres: string;
  visible_para_padre: boolean;
  fecha_publicacion?: string | null;
  acuse_leido: boolean;
  fecha_lectura?: string | null;
  comentario_padre?: string | null;
}

// Resumen por asignación docente (stored procedure)
export interface ResumenEstudianteAsignacion {
  matricula_id: number;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_codigo: string;
  total_obs: number;
  informativos: number;
  requieren_atencion: number;
  urgentes: number;
  visibles_padre: number;
  no_acusados: number;
  ultima_obs_fecha?: string | null;
}

// ============================================
// DTOs
// ============================================

export interface CrearObservacionDTO {
  matricula_id: number;
  asignacion_docente_id?: number;
  periodo_academico_id: number;
  categoria_observacion_id: number;
  nivel_relevancia?: NivelRelevancia;
  descripcion: string;
  fecha_ocurrencia?: string;
  plantilla_id?: number;
  visible_para_padre?: boolean;
}

export interface ActualizarObservacionDTO {
  categoria_observacion_id?: number;
  nivel_relevancia?: NivelRelevancia;
  descripcion?: string;
  fecha_ocurrencia?: string;
}

export interface CambiarVisibilidadDTO {
  visible_para_padre: boolean;
}

export interface RegistrarAcuseDTO {
  observacion_pedagogica_id: number;
  padre_familia_id: number;
  comentario_padre?: string;
}

// ============================================
// FILTROS
// ============================================

export interface ObservacionFiltros {
  page?: number;
  limit?: number;
  matricula_id?: number;
  docente_id?: number;
  asignacion_docente_id?: number;
  periodo_academico_id?: number;
  categoria_observacion_id?: number;
  nivel_relevancia?: NivelRelevancia;
  visible_para_padre?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================

export interface ObservacionesListResponse {
  success: boolean;
  data: {
    observaciones: ObservacionPedagogica[];
    paginacion: Paginacion;
  };
}

export interface ObservacionDetalleResponse {
  success: boolean;
  data: {
    observacion: ObservacionPedagogica;
    historial: HistorialObservacion[];
    acuses: AcuseReciboPadre[];
  };
}

export interface LineaTiempoResponse {
  success: boolean;
  data: {
    observaciones: LineaTiempoItem[];
    total: number;
  };
}

export interface ResumenAsignacionResponse {
  success: boolean;
  data: {
    resumen: ResumenEstudianteAsignacion[];
    total: number;
  };
}

export interface CategoriasResponse {
  success: boolean;
  data: { categorias: CategoriaObservacion[] };
}

export interface PlantillasResponse {
  success: boolean;
  data: { plantillas: PlantillaObservacion[] };
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

export const NIVELES_RELEVANCIA: {
  value: NivelRelevancia;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}[] = [
  {
    value:   'informativo',
    label:   'Informativo',
    color:   '#2563eb',
    bgColor: '#dbeafe',
    icon:    'ℹ️',
  },
  {
    value:   'requiere_atencion',
    label:   'Requiere Atención',
    color:   '#d97706',
    bgColor: '#fef3c7',
    icon:    '⚠️',
  },
  {
    value:   'urgente',
    label:   'Urgente',
    color:   '#dc2626',
    bgColor: '#fee2e2',
    icon:    '🚨',
  },
];

export const getNivelRelevancia = (nivel: NivelRelevancia) =>
  NIVELES_RELEVANCIA.find(n => n.value === nivel) ?? NIVELES_RELEVANCIA[0];