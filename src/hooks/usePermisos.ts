// hooks/usePermisos.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { permisoService, rolService, usuarioRolService } from '@/services/permisosService';
import {
  Permiso,
  Rol,
  UsuarioRol,
  PermisosAgrupados,
  PermisosFiltros,
  RolesFiltros,
  CrearPermisoDTO,
  ActualizarPermisoDTO,
  CrearRolDTO,
  ActualizarRolDTO,
} from '@/types/permisosTypes';

// =============================================
// HOOK: PERMISOS
// Lista, crea, edita y elimina permisos
// =============================================

export const usePermisos = (filtrosIniciales: PermisosFiltros = {}) => {
  const [permisos,  setPermisos]  = useState<Permiso[]>([]);
  const [agrupado,  setAgrupado]  = useState<PermisosAgrupados>({});
  const [modulos,   setModulos]   = useState<string[]>([]);
  const [total,     setTotal]     = useState(0);
  const [filters,   setFilters]   = useState<PermisosFiltros>(filtrosIniciales);
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Carga la lista + módulos disponibles ──────────────────
  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resPermisos, resModulos] = await Promise.all([
        permisoService.listar(filters),
        permisoService.listarModulos(),
      ]);
      setPermisos(resPermisos.data.permisos);
      setAgrupado(resPermisos.data.agrupado);
      setTotal(resPermisos.data.total);
      setModulos(resModulos.data.modulos);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar permisos');
      setPermisos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<PermisosFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos }));
  }, []);

  // ── CRUD ──────────────────────────────────────────────────

  const crear = useCallback(async (data: CrearPermisoDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await permisoService.crear(data);
      toast.success('Permiso creado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear permiso';
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarPermisoDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await permisoService.actualizar(id, data);
      toast.success('Permiso actualizado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar permiso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await permisoService.eliminar(id);
      toast.success('Permiso eliminado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      // 409 → está asignado a un rol
      const msg = error.response?.data?.message || 'Error al eliminar permiso';
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    permisos,
    agrupado,
    modulos,
    total,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    crear,
    actualizar,
    eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: ROLES
// Lista, crea, edita, elimina roles
// =============================================

export const useRoles = (filtrosIniciales: RolesFiltros = {}) => {
  const [roles,     setRoles]     = useState<Rol[]>([]);
  const [total,     setTotal]     = useState(0);
  const [filters,   setFilters]   = useState<RolesFiltros>(filtrosIniciales);
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await rolService.listar(filters);
      setRoles(res.data.roles);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<RolesFiltros>) => {
    setFilters(prev => ({ ...prev, ...nuevos }));
  }, []);

  const crear = useCallback(async (data: CrearRolDTO): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await rolService.crear(data);
      toast.success('Rol creado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear rol';
      toast.error(msg.includes('Ya existe') ? 'Ya existe un rol con ese nombre' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const actualizar = useCallback(async (
    id: number,
    data: ActualizarRolDTO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await rolService.actualizar(id, data);
      toast.success('Rol actualizado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const status = error.response?.status;
      const msg    = error.response?.data?.message || 'Error al actualizar rol';
      toast.error(status === 403 ? 'Los roles del sistema no se pueden modificar' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await rolService.eliminar(id);
      toast.success('Rol eliminado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      const status = error.response?.status;
      const msg    = error.response?.data?.message || 'Error al eliminar rol';
      if (status === 403) toast.error('Los roles del sistema no se pueden eliminar');
      else if (status === 409) toast.error('El rol tiene usuarios asignados, no se puede eliminar');
      else toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  return {
    roles,
    total,
    filters,
    isLoading,
    isSubmitting,
    actualizarFiltros,
    crear,
    actualizar,
    eliminar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: PERMISOS DE UN ROL (checkbox matrix)
// Carga los permisos del rol + todos los permisos
// del sistema para mostrar el matrix completo
// =============================================

export const useRolPermisos = (rol_id: number | null) => {
  const [rol,           setRol]           = useState<Rol | null>(null);
  const [permisosRol,   setPermisosRol]   = useState<number[]>([]);   // IDs asignados al rol
  const [agrupado,      setAgrupado]      = useState<PermisosAgrupados>({});
  const [todosPermisos, setTodosPermisos] = useState<Permiso[]>([]);  // todos los del sistema
  const [todosAgrupados, setTodosAgrupados] = useState<PermisosAgrupados>({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carga paralela: permisos del rol + todos los permisos del sistema
  const cargar = useCallback(async () => {
    if (!rol_id) return;
    setIsLoading(true);
    try {
      const [resRol, resTodos] = await Promise.all([
        rolService.obtenerPermisos(rol_id),
        permisoService.listar(),
      ]);
      setRol(resRol.data.rol);
      setPermisosRol(resRol.data.permisos.map(p => p.id));
      setAgrupado(resRol.data.agrupado);
      setTodosPermisos(resTodos.data.permisos);
      setTodosAgrupados(resTodos.data.agrupado);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar permisos del rol');
    } finally {
      setIsLoading(false);
    }
  }, [rol_id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Toggle local inmediato (optimista) — el usuario ve el cambio al instante
  const togglePermiso = useCallback((permiso_id: number) => {
    setPermisosRol(prev =>
      prev.includes(permiso_id)
        ? prev.filter(id => id !== permiso_id)
        : [...prev, permiso_id]
    );
  }, []);

  // Seleccionar / deseleccionar todos los de un módulo
  const toggleModulo = useCallback((modulo: string, seleccionar: boolean) => {
    const idsModulo = (todosAgrupados[modulo] ?? []).map(p => p.id);
    setPermisosRol(prev => {
      if (seleccionar) {
        return Array.from(new Set([...prev, ...idsModulo]));
      } else {
        return prev.filter(id => !idsModulo.includes(id));
      }
    });
  }, [todosAgrupados]);

  // Guarda el estado actual del matrix → PUT /roles/:id/permisos
  const guardar = useCallback(async (): Promise<boolean> => {
    if (!rol_id) return false;
    setIsSubmitting(true);
    try {
      await rolService.syncPermisos(rol_id, { permiso_ids: permisosRol });
      toast.success('Permisos del rol actualizados exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar permisos');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [rol_id, permisosRol, cargar]);

  // ¿Todos los permisos de un módulo están seleccionados?
  const moduloCompleto = useCallback((modulo: string): boolean => {
    const ids = (todosAgrupados[modulo] ?? []).map(p => p.id);
    return ids.length > 0 && ids.every(id => permisosRol.includes(id));
  }, [todosAgrupados, permisosRol]);

  // ¿Algunos permisos del módulo están seleccionados? (estado indeterminate del checkbox)
  const moduloParcial = useCallback((modulo: string): boolean => {
    const ids = (todosAgrupados[modulo] ?? []).map(p => p.id);
    return ids.some(id => permisosRol.includes(id)) && !ids.every(id => permisosRol.includes(id));
  }, [todosAgrupados, permisosRol]);

  const permisosGuardados = Object.values(agrupado).flat().map(p => p.id);
  const haycambios = permisosRol.length !== permisosGuardados.length
    ? true
    : !permisosRol.every(id => permisosGuardados.includes(id));

  return {
    rol,
    permisosRol,       // IDs de permisos actualmente seleccionados
    agrupado,          // permisos actualmente guardados en el rol
    todosPermisos,
    todosAgrupados,    // todos los permisos del sistema agrupados por módulo
    isLoading,
    isSubmitting,
    hayambios: haycambios,
    togglePermiso,
    toggleModulo,
    moduloCompleto,
    moduloParcial,
    guardar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: ROLES DE UN USUARIO
// Carga los roles del usuario y permite sync bulk
// =============================================

export const useUsuarioRoles = (usuario_id: number | null) => {
  const [rolesUsuario,  setRolesUsuario]  = useState<UsuarioRol[]>([]);
  const [rolesIds,      setRolesIds]      = useState<number[]>([]);   // IDs seleccionados
  const [todosRoles,    setTodosRoles]    = useState<Rol[]>([]);
  const [permisosEfectivos, setPermisosEfectivos] = useState<Permiso[]>([]);
  const [permisosAgrupados, setPermisosAgrupados] = useState<PermisosAgrupados>({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuario_id) return;
    setIsLoading(true);
    try {
      const [resUsuarioRoles, resTodosRoles, resPermisos] = await Promise.all([
        usuarioRolService.getRolesDeUsuario(usuario_id),
        rolService.listar(),
        usuarioRolService.getPermisosEfectivos(usuario_id),
      ]);
      setRolesUsuario(resUsuarioRoles.data.roles);
      setRolesIds(resUsuarioRoles.data.roles.map(r => r.rol_id));
      setTodosRoles(resTodosRoles.data.roles);
      setPermisosEfectivos(resPermisos.data.permisos);
      setPermisosAgrupados(resPermisos.data.agrupado);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar roles del usuario');
    } finally {
      setIsLoading(false);
    }
  }, [usuario_id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Toggle local del rol seleccionado
  const toggleRol = useCallback((rol_id: number) => {
    setRolesIds(prev =>
      prev.includes(rol_id)
        ? prev.filter(id => id !== rol_id)
        : [...prev, rol_id]
    );
  }, []);

  // Guarda el estado actual → PUT /usuarios/:id/roles
  const guardar = useCallback(async (): Promise<boolean> => {
    if (!usuario_id) return false;
    setIsSubmitting(true);
    try {
      await usuarioRolService.syncRoles(usuario_id, { rol_ids: rolesIds });
      toast.success('Roles del usuario actualizados exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar roles');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [usuario_id, rolesIds, cargar]);

  return {
    rolesUsuario,
    rolesIds,            // IDs de roles actualmente seleccionados
    todosRoles,
    permisosEfectivos,   // permisos efectivos del usuario (read-only, informativo)
    permisosAgrupados,
    isLoading,
    isSubmitting,
    toggleRol,
    guardar,
    refrescar: cargar,
  };
};

// =============================================
// HOOK: PERMISOS EFECTIVOS DEL USUARIO LOGUEADO
// Útil para guardar en contexto/auth y usar en
// guards de navegación y renderizado condicional
// =============================================

export const usePermisosEfectivos = (usuario_id: number | null) => {
  const [permisos,  setPermisos]  = useState<Permiso[]>([]);
  const [agrupado,  setAgrupado]  = useState<PermisosAgrupados>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!usuario_id) return;
    setIsLoading(true);
    usuarioRolService.getPermisosEfectivos(usuario_id)
      .then(res => {
        setPermisos(res.data.permisos);
        setAgrupado(res.data.agrupado);
      })
      .catch(() => {
        // No muestra toast — puede ejecutarse en background al cargar la app
        setPermisos([]);
      })
      .finally(() => setIsLoading(false));
  }, [usuario_id]);

  // Helper: comprueba si el usuario tiene un permiso específico
  // Uso: tienePermiso('notas.leer')
  const tienePermiso = useCallback((nombre: string): boolean => {
    return permisos.some(p => p.nombre === nombre);
  }, [permisos]);

  // Helper: comprueba si el usuario tiene ALGUNO de los permisos indicados
  const tieneAlguno = useCallback((...nombres: string[]): boolean => {
    return nombres.some(n => permisos.some(p => p.nombre === n));
  }, [permisos]);

  // Helper: comprueba si el usuario tiene TODOS los permisos indicados
  const tieneTodos = useCallback((...nombres: string[]): boolean => {
    return nombres.every(n => permisos.some(p => p.nombre === n));
  }, [permisos]);

  return {
    permisos,
    agrupado,
    isLoading,
    tienePermiso,
    tieneAlguno,
    tieneTodos,
  };
};