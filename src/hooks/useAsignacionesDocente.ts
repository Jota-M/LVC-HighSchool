// hooks/useAsignacionesDocente.ts
import { useState, useEffect, useCallback } from 'react';
import asignacionDocenteService from '@/services/asignacionDocenteService';
import {
  AsignacionDocente,
  AsignacionesFiltros,
  CrearAsignacionDTO,
  ActualizarAsignacionDTO,
  CambiarDocenteDTO,
  AsignacionMasivaDTO,
  CopiarPeriodoDTO,
} from '@/types/asignacionDocenteTypes';
import { toast } from 'react-hot-toast';

interface PaginacionState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAsignacionesDocente = (filtrosIniciales: AsignacionesFiltros = {}) => {
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [paginacion, setPaginacion] = useState<PaginacionState>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<AsignacionesFiltros>({
    page: 1,
    limit: 20,
    ...filtrosIniciales,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // =============================================
  // LISTAR ASIGNACIONES
  // =============================================
  const cargarAsignaciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await asignacionDocenteService.listar(filters);
      
      setAsignaciones(response.data.asignaciones);
      setPaginacion(response.data.paginacion);
    } catch (error: any) {
      console.error('❌ Error al cargar asignaciones:', error);
      toast.error(error.response?.data?.message || 'Error al cargar asignaciones');
      setAsignaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar asignaciones cuando cambien los filtros
  useEffect(() => {
    cargarAsignaciones();
  }, [cargarAsignaciones]);

  // =============================================
  // ACTUALIZAR FILTROS
  // =============================================
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<AsignacionesFiltros>) => {
    setFilters((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  }, []);

  // =============================================
  // CREAR ASIGNACIÓN
  // =============================================
  const crear = useCallback(async (data: CrearAsignacionDTO): Promise<boolean> => {
    setIsCreating(true);
    try {
      await asignacionDocenteService.crear(data);
      toast.success('Asignación creada exitosamente');
      
      // Recargar lista
      await cargarAsignaciones();
      return true;
    } catch (error: any) {
      console.error('❌ Error al crear asignación:', error);
      
      const mensaje = error.response?.data?.message || 'Error al crear asignación';
      
      // Mensajes específicos
      if (mensaje.includes('Ya existe')) {
        toast.error('Ya existe un docente asignado para esta materia y paralelo');
      } else {
        toast.error(mensaje);
      }
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // ASIGNACIÓN MASIVA
  // =============================================
  const asignarMasivo = useCallback(async (data: AsignacionMasivaDTO): Promise<{
    success: boolean;
    resultados?: {
      exitosas: number;
      fallidas: number;
      omitidas: number;
    };
  }> => {
    setIsCreating(true);
    try {
      const response = await asignacionDocenteService.asignarMasivo(data);
      
      const { exitosas, fallidas, omitidas } = response.data;
      
      toast.success(
        `${exitosas.length} asignaciones creadas. ` +
        (fallidas.length > 0 ? `${fallidas.length} fallidas. ` : '') +
        (omitidas.length > 0 ? `${omitidas.length} omitidas.` : '')
      );
      
      // Recargar lista
      await cargarAsignaciones();
      
      return {
        success: true,
        resultados: {
          exitosas: exitosas.length,
          fallidas: fallidas.length,
          omitidas: omitidas.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Error en asignación masiva:', error);
      toast.error(error.response?.data?.message || 'Error en asignación masiva');
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // COPIAR ASIGNACIONES DE OTRO PERIODO
  // =============================================
  const copiarDePeriodo = useCallback(async (data: CopiarPeriodoDTO): Promise<boolean> => {
    setIsCreating(true);
    try {
      const response = await asignacionDocenteService.copiarDePeriodo(data);
      
      toast.success(
        `${response.data.asignaciones.length} asignaciones copiadas exitosamente`
      );
      
      // Recargar lista
      await cargarAsignaciones();
      return true;
    } catch (error: any) {
      console.error('❌ Error al copiar asignaciones:', error);
      toast.error(error.response?.data?.message || 'Error al copiar asignaciones');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // ACTUALIZAR ASIGNACIÓN
  // =============================================
  const actualizar = useCallback(async (
    id: number,
    data: ActualizarAsignacionDTO
  ): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await asignacionDocenteService.actualizar(id, data);
      toast.success('Asignación actualizada exitosamente');
      
      // Recargar lista
      await cargarAsignaciones();
      return true;
    } catch (error: any) {
      console.error('❌ Error al actualizar asignación:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar asignación');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // CAMBIAR DOCENTE
  // =============================================
  const cambiarDocente = useCallback(async (
    id: number,
    data: CambiarDocenteDTO
  ): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await asignacionDocenteService.cambiarDocente(id, data);
      toast.success('Docente cambiado exitosamente');
      
      // Recargar lista
      await cargarAsignaciones();
      return true;
    } catch (error: any) {
      console.error('❌ Error al cambiar docente:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar docente');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // ELIMINAR ASIGNACIÓN
  // =============================================
  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await asignacionDocenteService.eliminar(id);
      toast.success('Asignación eliminada exitosamente');
      
      // Recargar lista
      await cargarAsignaciones();
      return true;
    } catch (error: any) {
      console.error('❌ Error al eliminar asignación:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar asignación');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [cargarAsignaciones]);

  // =============================================
  // REFRESCAR DATOS
  // =============================================
  const refrescar = useCallback(() => {
    cargarAsignaciones();
  }, [cargarAsignaciones]);

  return {
    // Estado
    asignaciones,
    paginacion,
    filters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Acciones
    actualizarFiltros,
    crear,
    asignarMasivo,
    copiarDePeriodo,
    actualizar,
    cambiarDocente,
    eliminar,
    refrescar,
  };
};

export default useAsignacionesDocente;