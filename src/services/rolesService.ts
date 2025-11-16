import api from '../lib/api';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  es_sistema: boolean;
  usuarios_count: number;
  permisos: any[];
}

class RolesService {
  async listar(): Promise<Rol[]> {
    const { data } = await api.get('/roles');
    return data.data.roles;
  }

  async obtenerPorId(id: number): Promise<Rol> {
    const { data } = await api.get(`/roles/${id}`);
    return data.data.rol;
  }
}

export default new RolesService();