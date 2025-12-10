import { useState, useEffect, useCallback } from 'react';
import usuariosService, { Usuario, UsuariosResponse } from '@/services/usuariosService';

interface Filters {
  page?: number;
  limit?: number;
  search?: string;
  rol?: string;
  activo?: boolean;
}

interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
    search: '',
    rol: undefined,
    activo: undefined,
  });

  const cargarUsuarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await usuariosService.listar({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        rol: filters.rol || undefined,
        activo: filters.activo,
      });

      setUsuarios(response.data.usuarios);
      setPaginacion(response.data.paginacion);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      console.error('Error al cargar usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const actualizarFiltros = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const eliminar = async (id: number) => {
    try {
      setIsDeleting(true);
      await usuariosService.eliminar(id);
      await cargarUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const refetch = () => {
    cargarUsuarios();
  };

  return {
    usuarios,
    paginacion,
    isLoading,
    isDeleting,
    error,
    filters,
    actualizarFiltros,
    eliminar,
    refetch,
  };
};