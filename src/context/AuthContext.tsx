'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { useRouter, usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      console.log('🔄 AuthContext: Cargando usuario...');
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          console.log('✅ AuthContext: Usuario cargado', currentUser);
          setUser(currentUser);
        }
      } catch (error) {
        console.log('❌ AuthContext: Error al cargar usuario', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          console.log('🏁 AuthContext: Carga finalizada, loading = false');
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credential: string, password: string) => {
    console.log('🔐 AuthContext: Intentando login...');
    const response = await authService.login({ credential, password });
    setUser(response.data.user);
    console.log('✅ AuthContext: Login exitoso', response.data.user);
    
    // Determinar ruta según rol
    const roles = response.data.user.roles?.map(r => r.nombre) || [];
    let targetPath = '/dashboard';
    
    if (roles.includes('padre')) {
      targetPath = '/dashboard/padre/principal';
    } else if (roles.includes('profesor')) {
      targetPath = '/dashboard/profesor/home';
    } else if (roles.includes('admin') || roles.includes('super_admin')) {
      targetPath = '/dashboard';
    }
    
    console.log('🚀 AuthContext: Redirigiendo a', targetPath);
    window.location.href = targetPath;
  };

  const logout = async () => {
    console.log('👋 AuthContext: Cerrando sesión...');
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setUser(null);
    window.location.href = '/login';
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
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