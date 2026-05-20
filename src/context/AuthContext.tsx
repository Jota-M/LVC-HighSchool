'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credential: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadUser();
    return () => { isMounted = false; };
  }, []);

  const login = async (credential: string, password: string) => {
  await authService.login({ credential, password });
  // En vez de usar el user del login, pedir el user completo
  const fullUser = await authService.getCurrentUser();
  setUser(fullUser);
  // ahora fullUser tiene roles y permisos
};

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setUser(null);
    router.replace('/login');
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user?.roles) return false;
    return user.roles.some((role) => roles.includes(role.nombre));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.permisos) return false;
    return user.permisos.some((p) => p.nombre === permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}