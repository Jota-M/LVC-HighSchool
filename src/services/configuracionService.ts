// services/configuracionService.ts
import api from '@/lib/api';

// =============================================
// TIPOS
// =============================================

export interface Perfil {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  verificado: boolean;
  ultimo_acceso: string;
  created_at: string;
  roles: Array<{
    id: number;
    nombre: string;
    descripcion: string;
  }>;
}

export interface Sesion {
  id: number;
  ip_address: string;
  user_agent: string;
  dispositivo: string;
  ubicacion: string;
  expires_at: string;
  created_at: string;
  activa: boolean;
}

export interface Actividad {
  id: number;
  accion: string;
  modulo: string;
  tabla_afectada: string;
  resultado: 'exitoso' | 'fallido' | 'pendiente';
  mensaje: string;
  ip_address: string;
  created_at: string;
}

export interface CambiarPasswordData {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface ActualizarPerfilData {
  email: string;
}

// =============================================
// SERVICIO DE CONFIGURACIÓN
// =============================================

export const configuracionService = {
  // ============================================================================
  // PERFIL
  // ============================================================================

  /**
   * Obtener datos del perfil del usuario actual
   */
  async obtenerPerfil(): Promise<Perfil> {
    const response = await api.get('/configuracion/perfil');
    return response.data.data.perfil;
  },

  /**
   * Actualizar email del usuario
   */
  async actualizarPerfil(data: ActualizarPerfilData): Promise<Perfil> {
    const response = await api.put('/configuracion/perfil', data);
    return response.data.data.usuario;
  },

  // ============================================================================
  // CONTRASEÑA
  // ============================================================================

  /**
   * Cambiar contraseña del usuario actual
   */
  async cambiarPassword(data: CambiarPasswordData): Promise<void> {
    await api.put('/configuracion/cambiar-password', data);
  },

  // ============================================================================
  // SESIONES
  // ============================================================================

  /**
   * Obtener sesiones activas del usuario
   */
  async obtenerSesiones(): Promise<Sesion[]> {
    const response = await api.get('/configuracion/sesiones');
    return response.data.data.sesiones;
  },

  /**
   * Cerrar una sesión específica
   */
  async cerrarSesion(sesionId: number): Promise<void> {
    await api.delete(`/configuracion/sesiones/${sesionId}`);
  },

  /**
   * Cerrar todas las sesiones excepto la actual
   */
  async cerrarTodasSesiones(): Promise<number> {
    const response = await api.delete('/configuracion/sesiones');
    return response.data.data.sesiones_cerradas;
  },

  // ============================================================================
  // ACTIVIDAD
  // ============================================================================

  /**
   * Obtener actividad reciente del usuario
   */
  async obtenerActividad(limit = 20, offset = 0): Promise<{
    actividades: Actividad[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await api.get('/configuracion/actividad', {
      params: { limit, offset }
    });
    return response.data.data;
  },
};

export default configuracionService;