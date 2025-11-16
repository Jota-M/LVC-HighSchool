import api from '../lib/api';

export interface Usuario {
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

export interface UsuarioFormData {
  username: string;
  email: string;
  password?: string;
  activo?: boolean;
  rolIds: number[];
}

export interface UsuariosResponse {
  success: boolean;
  data: {
    usuarios: Usuario[];
    paginacion: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

class UsuariosService {
  // Listar usuarios con filtros
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    rol?: string;
    activo?: boolean;
  }): Promise<UsuariosResponse> {
    const { data } = await api.get<UsuariosResponse>('/usuarios', { params });
    return data;
  }

  // Obtener usuario por ID
  async obtenerPorId(id: number): Promise<Usuario> {
    const { data } = await api.get(`/usuarios/${id}`);
    return data.data.usuario;
  }

  // Crear usuario
  async crear(usuario: UsuarioFormData) {
    const { data } = await api.post('/usuarios', usuario);
    return data;
  }

  // Actualizar usuario
  async actualizar(id: number, usuario: Partial<UsuarioFormData>) {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  }

  // Eliminar usuario
  async eliminar(id: number) {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
  }

  // Activar/Desactivar usuario
  async toggleActivo(id: number) {
    const { data } = await api.patch(`/usuarios/${id}/toggle-activo`);
    return data;
  }

  // Resetear contraseña
  async resetearPassword(id: number, nuevaPassword: string) {
    const { data } = await api.post(`/usuarios/${id}/reset-password`, {
      nuevaPassword,
    });
    return data;
  }

  // Obtener actividad del usuario
  async obtenerActividad(id: number, limit = 50) {
    const { data } = await api.get(`/usuarios/${id}/actividad`, {
      params: { limit },
    });
    return data;
  }
}

export default new UsuariosService();