// hooks/useDocentes.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import docenteService from '@/services/docenteService';
import {
  Docente,
  DocentesFiltros,
  ActualizarDocenteDTO,
  CrearUsuarioDocenteDTO,
} from '@/types/docenteTypes';
import { toast } from 'react-hot-toast';

interface PaginacionState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useDocentes = (filtrosIniciales: DocentesFiltros = {}) => {
  const router = useRouter();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [paginacion, setPaginacion] = useState<PaginacionState>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<DocentesFiltros>({
    page: 1,
    limit: 10,
    ...filtrosIniciales,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // =============================================
  // LISTAR DOCENTES
  // =============================================
  const cargarDocentes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await docenteService.listar(filters);
      
      setDocentes(response.data.docentes);
      setPaginacion(response.data.paginacion);
    } catch (error: any) {
      console.error('❌ Error al cargar docentes:', error);
      toast.error(error.response?.data?.message || 'Error al cargar docentes');
      setDocentes([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar docentes cuando cambien los filtros
  useEffect(() => {
    cargarDocentes();
  }, [cargarDocentes]);

  // =============================================
  // ACTUALIZAR FILTROS
  // =============================================
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<DocentesFiltros>) => {
    setFilters((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  }, []);

  // =============================================
  // ELIMINAR DOCENTE
  // =============================================
  const eliminar = useCallback(async (id: number) => {
    setIsDeleting(true);
    try {
      await docenteService.eliminar(id);
      toast.success('Docente eliminado exitosamente');
      
      // Recargar lista
      await cargarDocentes();
    } catch (error: any) {
      console.error('❌ Error al eliminar docente:', error);
      
      const mensaje = error.response?.data?.message || 'Error al eliminar docente';
      
      // Si el error es por asignaciones activas, mostrar mensaje específico
      if (mensaje.includes('asignaciones activas')) {
        toast.error('No se puede eliminar un docente con asignaciones activas');
      } else {
        toast.error(mensaje);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [cargarDocentes]);

  // =============================================
  // ACTUALIZAR DOCENTE
  // =============================================
  const actualizar = useCallback(async (
    id: number,
    data: ActualizarDocenteDTO,
    foto?: File,
    cv?: File
  ): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await docenteService.actualizar(id, data, foto, cv);
      toast.success('Docente actualizado exitosamente');
      
      // Recargar lista
      await cargarDocentes();
      return true;
    } catch (error: any) {
      console.error('❌ Error al actualizar docente:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar docente');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [cargarDocentes]);

  // =============================================
  // CREAR USUARIO PARA DOCENTE
  // =============================================
  const crearUsuario = useCallback(async (
    id: number,
    data: CrearUsuarioDocenteDTO
  ): Promise<{ success: boolean; credenciales?: any }> => {
    try {
      const response = await docenteService.crearUsuario(id, data);
      toast.success('Usuario creado exitosamente');
      
      // Recargar lista
      await cargarDocentes();
      
      return {
        success: true,
        credenciales: response.data.usuario,
      };
    } catch (error: any) {
      console.error('❌ Error al crear usuario:', error);
      toast.error(error.response?.data?.message || 'Error al crear usuario');
      return { success: false };
    }
  }, [cargarDocentes]);

  // =============================================
  // REFRESCAR DATOS
  // =============================================
  const refrescar = useCallback(() => {
    cargarDocentes();
  }, [cargarDocentes]);

  return {
    // Estado
    docentes,
    paginacion,
    filters,
    isLoading,
    isDeleting,
    isUpdating,

    // Acciones
    actualizarFiltros,
    eliminar,
    actualizar,
    crearUsuario,
    refrescar,
  };
};

export default useDocentes;