// types/niveles.types.ts

/**
 * Interfaz principal del Nivel Académico
 */
export interface NivelAcademico {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  orden: number;
  edad_minima?: number;
  edad_maxima?: number;
  activo: boolean;
  color?: string;
  icono?: string;
  total_grados?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  grados?: Grado[];
}

/**
 * Interfaz del Grado
 */
export interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  nivel_nombre?: string;
  nivel_codigo?: string;
  total_paralelos?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Datos para crear/actualizar un nivel
 */
export interface NivelFormData {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden?: number;
  edad_minima?: number;
  edad_maxima?: number;
  activo?: boolean;
  color?: string;
  icono?: string;
}

/**
 * Datos para crear/actualizar un grado
 */
export interface GradoFormData {
  nivel_academico_id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

/**
 * Respuesta de la API al listar niveles
 */
export interface NivelesResponse {
  success: boolean;
  data: {
    niveles: NivelAcademico[];
  };
}

/**
 * Respuesta de la API para un nivel individual
 */
export interface NivelResponse {
  success: boolean;
  data: {
    nivel: NivelAcademico;
  };
  message?: string;
}

/**
 * Respuesta de la API al listar grados
 */
export interface GradosResponse {
  success: boolean;
  data: {
    grados: Grado[];
  };
}

/**
 * Respuesta de la API para un grado individual
 */
export interface GradoResponse {
  success: boolean;
  data: {
    grado: Grado;
  };
  message?: string;
}

/**
 * Filtros para niveles académicos
 */
export interface NivelFiltros {
  activo?: boolean;
}

/**
 * Filtros para grados
 */
export interface GradoFiltros {
  nivel_academico_id?: number;
  activo?: boolean;
}

/**
 * Estados posibles de un nivel o grado
 */
export enum EstadoAcademico {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Respuesta estándar de error de la API
 */
export interface ApiError {
  success: false;
  message: string;
  error?: any;
}

/**
 * Opciones para el hook useNiveles
 */
export interface UseNivelesOptions {
  autoLoad?: boolean;
  incluirGrados?: boolean;
}

/**
 * Configuración de colores predeterminados
 */
export const COLORES_NIVELES = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#95E1D3', // Verde claro
  '#F38181', // Rosa
  '#AA96DA', // Púrpura
  '#FCBAD3'  // Rosa claro
] as const;

/**
 * Configuración de iconos predeterminados
 */
export const ICONOS_NIVELES = [
  '🎨', // Arte
  '📚', // Libros
  '🎓', // Graduación
  '🔬', // Ciencia
  '🎭', // Teatro
  '⚽'  // Deportes
] as const;

/**
 * Configuración de validación para niveles
 */
export interface NivelValidacion {
  nombre: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  codigo: {
    minLength: number;
    maxLength: number;
    required: boolean;
    pattern?: RegExp;
  };
  edades: {
    min: number;
    max: number;
    validarRango: boolean;
  };
}

/**
 * Configuración de validación para grados
 */
export interface GradoValidacion {
  nombre: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  codigo: {
    minLength: number;
    maxLength: number;
    required: boolean;
    pattern?: RegExp;
  };
}

// Constantes de validación
export const NIVEL_VALIDACION: NivelValidacion = {
  nombre: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  codigo: {
    minLength: 2,
    maxLength: 20,
    required: false,
    pattern: /^[A-Z0-9-]+$/i,
  },
  edades: {
    min: 0,
    max: 25,
    validarRango: true,
  },
};

export const GRADO_VALIDACION: GradoValidacion = {
  nombre: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  codigo: {
    minLength: 2,
    maxLength: 20,
    required: false,
    pattern: /^[A-Z0-9-]+$/i,
  },
};

// Mensajes de error comunes
export const NIVEL_ERRORES = {
  NOMBRE_REQUERIDO: 'El nombre del nivel es requerido',
  CODIGO_REQUERIDO: 'El código del nivel es requerido',
  EDAD_MAXIMA_INVALIDA: 'La edad máxima debe ser mayor a la edad mínima',
  NIVEL_NO_ENCONTRADO: 'Nivel académico no encontrado',
  TIENE_GRADOS: 'No se puede eliminar un nivel académico con grados asociados',
  YA_EXISTE: 'Ya existe un nivel académico con ese nombre o código',
};

export const GRADO_ERRORES = {
  NOMBRE_REQUERIDO: 'El nombre del grado es requerido',
  CODIGO_REQUERIDO: 'El código del grado es requerido',
  GRADO_NO_ENCONTRADO: 'Grado no encontrado',
  TIENE_PARALELOS: 'No se puede eliminar un grado con paralelos asociados',
  YA_EXISTE: 'Ya existe un grado con ese código en este nivel académico',
  NIVEL_INVALIDO: 'El nivel académico especificado no existe',
};

// Mensajes de éxito
export const NIVEL_MENSAJES = {
  CREADO: 'Nivel académico creado exitosamente',
  ACTUALIZADO: 'Nivel académico actualizado exitosamente',
  ELIMINADO: 'Nivel académico eliminado exitosamente',
};

export const GRADO_MENSAJES = {
  CREADO: 'Grado creado exitosamente',
  ACTUALIZADO: 'Grado actualizado exitosamente',
  ELIMINADO: 'Grado eliminado exitosamente',
};

/**
 * Estructura jerárquica completa
 */
export interface EstructuraAcademica {
  niveles: NivelAcademico[];
  totalNiveles: number;
  totalGrados: number;
  estadisticas: {
    totalEstudiantes: number;
    totalMaterias: number;
    promedioGradosPorNivel: number;
  };
}