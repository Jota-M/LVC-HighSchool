export const ROLE_ROUTES: Record<string, string> = {
  estudiante:  '/dashboard/estudiante/home',
  docente:     '/dashboard/docente/home',
  padre:       '/dashboard/padre/home',
  secretaria:  '/dashboard/secretaria',
  admin:       '/dashboard/admin',
  super_admin: '/dashboard/admin',
};

export const DEFAULT_ROUTE = '/dashboard/admin';

const PRIORITY = ['super_admin', 'admin', 'secretaria', 'docente', 'padre', 'estudiante'];

export function getRoleBasedRoute(roles: string[]): string {
  for (const role of PRIORITY) {
    if (roles.includes(role)) {
      return ROLE_ROUTES[role] ?? DEFAULT_ROUTE;
    }
  }
  return DEFAULT_ROUTE;
}