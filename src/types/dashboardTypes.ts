// types/dashboard.types.ts

export interface DashboardStats {
  totalEstudiantes: number;
  totalDocentes: number;
  totalUsuarios: number;
  matriculasActivas: number;
  estudiantesActivos: number;
  docentesActivos: number;
  usuariosActivos: number;
}

export interface EstudianteStats {
  total: number;
  activos: number;
  inactivos: number;
  masculino: number;
  femenino: number;
  con_discapacidad: number;
  con_usuario: number;
  sin_usuario: number;
  promedio_edad: number;
  distribucion_por_grado: GradoDistribucion[];
}

export interface GradoDistribucion {
  grado: string;
  cantidad: number;
}

export interface ActividadReciente {
  id: number;
  usuario_id: number;
  username: string;
  email: string;
  accion: string;
  modulo: string;
  tabla_afectada: string | null;
  registro_id: number | null;
  mensaje: string;
  resultado: 'exitoso' | 'fallido';
  created_at: string;
  ip_address?: string;
}

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  cerrado: boolean;
  permite_inscripciones: boolean;
  permite_calificaciones: boolean;
}

export interface ActividadEstadisticas {
  actividadPorDia: ActividadPorDia[];
  actividadPorModulo: ActividadPorModulo[];
  usuariosMasActivos: UsuarioActivo[];
  accionesMasComunes: AccionComun[];
}

export interface ActividadPorDia {
  fecha: string;
  total: number;
  exitosos: number;
  fallidos: number;
}

export interface ActividadPorModulo {
  modulo: string;
  total: number;
  exitosos: number;
  fallidos: number;
}

export interface UsuarioActivo {
  id: number;
  username: string;
  email: string;
  total_actividades: number;
}

export interface AccionComun {
  accion: string;
  total: number;
}

export interface SesionesEstadisticas {
  total: number;
  porDispositivo: DispositivoStats[];
  usuariosMultiplesSesiones: UsuarioMultiplesSesiones[];
}

export interface DispositivoStats {
  dispositivo: string;
  total: number;
}

export interface UsuarioMultiplesSesiones {
  id: number;
  username: string;
  sesiones_activas: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardData {
  estudiantes: EstudianteStats | null;
  estudiantesCount: { total: number; activos: number };
  docentesCount: { total: number; activos: number };
  usuariosCount: { total: number; activos: number };
  matriculasCount: { total: number; activas: number };
  actividad: ActividadReciente[];
  periodo: PeriodoAcademico | null;
  actividadStats: ActividadEstadisticas | null;
  sesionesStats: SesionesEstadisticas | null;
}