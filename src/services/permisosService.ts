// services/permisosService.ts
import api from '@/lib/api';
import {
  PermisosListResponse,
  PermisoResponse,
  ModulosResponse,
  RolesListResponse,
  RolResponse,
  RolPermisosResponse,
  SyncPermisosResponse,
  UsuarioRolesListResponse,
  PermisosEfectivosResponse,
  MensajeResponse,
  PermisosFiltros,
  RolesFiltros,
  CrearPermisoDTO,
  ActualizarPermisoDTO,
  CrearRolDTO,
  ActualizarRolDTO,
  SyncPermisosDTO,
  SyncRolesDTO,
} from '@/types/permisosTypes';

// =============================================
// PERMISOS
// =============================================

export const permisoService = {

  /**
   * Lista todos los permisos, opcionalmente filtrados por módulo o búsqueda.
   * Devuelve también `agrupado` (Record<modulo, Permiso[]>) listo para el frontend.
   * GET /api/permisos?modulo=notas&search=leer
   */
  async listar(filters: PermisosFiltros = {}): Promise<PermisosListResponse> {
    const params = new URLSearchParams();
    if (filters.modulo) params.append('modulo', filters.modulo);
    if (filters.search) params.append('search', filters.search);

    const q = params.toString();
    const response = await api.get(`/permisoss${q ? `?${q}` : ''}`);
    return response.data;
  },

  /**
   * Lista los módulos disponibles (para selects y filtros del frontend).
   * GET /api/permisos/modulos
   */
  async listarModulos(): Promise<ModulosResponse> {
    const response = await api.get('/permisoss/modulos');
    return response.data;
  },

  /**
   * Obtiene un permiso por ID.
   * GET /api/permisos/:id
   */
  async obtenerPorId(id: number): Promise<PermisoResponse> {
    const response = await api.get(`/permisoss/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo permiso.
   * Convención de nombre: "modulo.accion" (ej: "notas.leer")
   * POST /api/permisos
   */
  async crear(
    data: CrearPermisoDTO
  ): Promise<{ success: boolean; message: string; data: { permiso: import('@/types/permisosTypes').Permiso } }> {
    const response = await api.post('/permisoss', data);
    return response.data;
  },

  /**
   * Actualiza un permiso existente.
   * PUT /api/permisos/:id
   */
  async actualizar(
    id: number,
    data: ActualizarPermisoDTO
  ): Promise<{ success: boolean; message: string; data: { permiso: import('@/types/permisosTypes').Permiso } }> {
    const response = await api.put(`/permisoss/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un permiso. Falla con 409 si está asignado a algún rol.
   * DELETE /api/permisos/:id
   */
  async eliminar(id: number): Promise<MensajeResponse> {
    const response = await api.delete(`/permisoss/${id}`);
    return response.data;
  },
};

// =============================================
// ROLES
// =============================================

export const rolService = {

  /**
   * Lista todos los roles con contadores de permisos y usuarios.
   * GET /api/roles?es_sistema=true&search=admin
   */
  async listar(filters: RolesFiltros = {}): Promise<RolesListResponse> {
    const params = new URLSearchParams();
    if (filters.es_sistema !== undefined) params.append('es_sistema', String(filters.es_sistema));
    if (filters.search)                   params.append('search',     filters.search);

    const q = params.toString();
    const response = await api.get(`/roles${q ? `?${q}` : ''}`);
    return response.data;
  },

  /**
   * Obtiene un rol por ID.
   * GET /api/roles/:id
   */
  async obtenerPorId(id: number): Promise<RolResponse> {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Obtiene los permisos de un rol, agrupados por módulo.
   * GET /api/roles/:id/permisos
   */
  async obtenerPermisos(rol_id: number): Promise<RolPermisosResponse> {
    const response = await api.get(`/roles/${rol_id}/permisos`);
    return response.data;
  },

  /**
   * Crea un nuevo rol (no de sistema).
   * POST /api/roles
   */
  async crear(
    data: CrearRolDTO
  ): Promise<{ success: boolean; message: string; data: { rol: import('@/types/permisosTypes').Rol } }> {
    const response = await api.post('/roles', data);
    return response.data;
  },

  /**
   * Actualiza un rol. Falla con 403 si es de sistema.
   * PUT /api/roles/:id
   */
  async actualizar(
    id: number,
    data: ActualizarRolDTO
  ): Promise<{ success: boolean; message: string; data: { rol: import('@/types/permisosTypes').Rol } }> {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un rol. Falla con 403 si es sistema, 409 si tiene usuarios.
   * DELETE /api/roles/:id
   */
  async eliminar(id: number): Promise<MensajeResponse> {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  /**
   * Reemplaza TODOS los permisos del rol de una sola vez (operación bulk).
   * Es la operación principal del "checkbox matrix" del frontend.
   * PUT /api/roles/:id/permisos
   * Body: { permiso_ids: [1, 2, 3] }
   */
  async syncPermisos(rol_id: number, data: SyncPermisosDTO): Promise<SyncPermisosResponse> {
    const response = await api.put(`/roles/${rol_id}/permisos`, data);
    return response.data;
  },

  /**
   * Agrega un permiso puntual a un rol (toggle individual).
   * POST /api/roles/:id/permisos/:permiso_id
   */
  async agregarPermiso(rol_id: number, permiso_id: number): Promise<MensajeResponse> {
    const response = await api.post(`/roles/${rol_id}/permisos/${permiso_id}`);
    return response.data;
  },

  /**
   * Quita un permiso puntual de un rol (toggle individual).
   * DELETE /api/roles/:id/permisos/:permiso_id
   */
  async quitarPermiso(rol_id: number, permiso_id: number): Promise<MensajeResponse> {
    const response = await api.delete(`/roles/${rol_id}/permisos/${permiso_id}`);
    return response.data;
  },
};

// =============================================
// USUARIO-ROLES
// =============================================

export const usuarioRolService = {

  /**
   * Roles asignados a un usuario con detalle completo.
   * GET /api/usuarios/:usuario_id/roles
   */
  async getRolesDeUsuario(usuario_id: number): Promise<UsuarioRolesListResponse> {
    const response = await api.get(`/usuarios/${usuario_id}/roles`);
    return response.data;
  },

  /**
   * Todos los permisos efectivos del usuario (unión de todos sus roles).
   * Útil para saber qué puede hacer el usuario logueado.
   * GET /api/usuarios/:usuario_id/permisos
   */
  async getPermisosEfectivos(usuario_id: number): Promise<PermisosEfectivosResponse> {
    const response = await api.get(`/usuarios/${usuario_id}/permisos`);
    return response.data;
  },

  /**
   * Reemplaza TODOS los roles del usuario de una sola vez (bulk).
   * PUT /api/usuarios/:usuario_id/roles
   * Body: { rol_ids: [1, 2] }
   */
  async syncRoles(usuario_id: number, data: SyncRolesDTO): Promise<UsuarioRolesListResponse> {
    const response = await api.put(`/usuarios/${usuario_id}/roles`, data);
    return response.data;
  },

  /**
   * Asigna un rol puntual a un usuario (toggle individual).
   * POST /api/usuarios/:usuario_id/roles/:rol_id
   */
  async asignarRol(usuario_id: number, rol_id: number): Promise<MensajeResponse> {
    const response = await api.post(`/usuarios/${usuario_id}/roles/${rol_id}`);
    return response.data;
  },

  /**
   * Quita un rol puntual de un usuario (toggle individual).
   * DELETE /api/usuarios/:usuario_id/roles/:rol_id
   */
  async quitarRol(usuario_id: number, rol_id: number): Promise<MensajeResponse> {
    const response = await api.delete(`/usuarios/${usuario_id}/roles/${rol_id}`);
    return response.data;
  },
};

export default {
  permisos:    permisoService,
  roles:       rolService,
  usuarioRol:  usuarioRolService,
};