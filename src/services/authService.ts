import api from '../lib/api';

export interface LoginCredentials {
  credential: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  verificado: boolean;
  roles: Array<{
    id: number;
    nombre: string;
    descripcion: string;
  }>;
  permisos: Array<{
    id: number;
    modulo: string;
    accion: string;
    nombre: string;
  }>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    // console.log('📦 RESPUESTA COMPLETA /auth/me:', JSON.stringify(data, null, 2));
    return data.data.user;
  } catch (error) {
    return null;
  }
}

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  hasRole(user: User | null, roles: string[]): boolean {
    if (!user?.roles) return false;
    return user.roles.some((role) => roles.includes(role.nombre));
  }

  hasPermission(user: User | null, permission: string): boolean {
    if (!user?.permisos) return false;
    return user.permisos.some((p) => p.nombre === permission);
  }
}

export default new AuthService();