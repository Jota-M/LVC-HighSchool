// types/inicialTypes.ts

export interface NivelLogro {
  id: number;
  nombre: string;
  codigo: string; // 'ED' | 'DA' | 'DO' | 'DP'
  descripcion: string;
  orden: number;
  color: string;
  activo: boolean;
}

export interface IndicadorLogro {
  id: number;
  grado_materia_id: number;
  materia_id?: number;
  campo_codigo?: string;
  campo_nombre?: string;
  periodo_evaluacion_id?: number | null;
  periodo_nombre?: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface RegistroCotejo {
  id?: number;
  matricula_id: number;
  indicador_logro_id: number;
  periodo_evaluacion_id: number;
  nivel_logro_id: number | null;
  observaciones?: string | null;
  nivel_codigo?: string;
  nivel_nombre?: string;
  nivel_color?: string;
}

export interface EstudianteInicial {
  matricula_id: number;
  codigo_rude?: string;
  estudiante_id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  apellidos: string;
  genero?: string;
  ci?: string;
  foto_url?: string;
}

export interface MatrizCotejoData {
  paralelo: {
    id: number;
    nombre: string;
    grado_id: number;
    grado_nombre: string;
    nivel_academico_id: number;
  };
  estudiantes: EstudianteInicial[];
  indicadores: IndicadorLogro[];
  registros: RegistroCotejo[];
  campos?: Array<{
    grado_materia_id: number;
    campo_orden?: number;
    materia_id?: number;
    campo_codigo: string;
    campo_nombre: string;
  }>;
}

export interface InformeCualitativo {
  id?: number;
  matricula_id: number;
  periodo_evaluacion_id: number;
  texto: string;
  generado_por_ia: boolean;
  estado: 'borrador' | 'publicado' | 'pendiente';
  fecha_publicacion?: string;
  updated_at?: string;
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
  codigo_rude?: string;
  observaciones_docente?: string;
  message?: string;
}

// ── Actividad del Temario Inicial ─────────────────────────────────────────────
export type TipoActividad = 'video' | 'imagen' | 'actividad' | 'juego';

export interface ElementoInteractivo {
  id: number;
  nombre: string;
  emoji: string;
  pista?: string;
  es_correcta?: boolean;
  // Para juego arrastrar
  zona_correcta?: string;
  categoria?: string;
}

export interface ZonaArrastrar {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
}

export interface ContenidoInteractivoInicial {
  tipo_interaccion: 'memorama' | 'adivinanza' | 'arrastrar' | 'tarjetas_exploracion';
  instruccion: string;
  elementos: ElementoInteractivo[];
  zonas?: ZonaArrastrar[];  // Solo para arrastrar
  reto_en_casa?: string;
  recompensa?: string;
}

export interface PropuestaActividadIA {
  titulo: string;
  descripcion: string;
  tipo: TipoActividad;
  emoji: string;
  color_fondo: string;
  sugerencia_youtube_query?: string;
  contenido_interactivo: ContenidoInteractivoInicial;
}

export interface ActividadInicial {
  id: number;
  grado_materia_id: number;
  campo_codigo: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string | null;
  url?: string | null;
  emoji: string;
  color_fondo: string;
  contenido_interactivo?: ContenidoInteractivoInicial | null;
  orden: number;
  activo: boolean;
  creado_por?: number | null;
  grado_id?: number;
  grado_nombre?: string;
  created_at: string;
  updated_at: string;
}
