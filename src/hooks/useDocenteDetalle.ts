// hooks/useDocenteDetalle.ts
import { useState, useEffect, useCallback } from 'react';
import docenteService from '@/services/docenteService';
import asignacionDocenteService from '@/services/asignacionDocenteService';
import { Docente, DocenteEstadisticas } from '@/types/docenteTypes';
import { AsignacionDocente } from '@/types/asignacionDocenteTypes';
import { toast } from 'react-hot-toast';

export const useDocenteDetalle = (docenteId: number) => {
  const [docente, setDocente] = useState<Docente | null>(null);
  const [estadisticas, setEstadisticas] = useState<DocenteEstadisticas | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAsignaciones, setIsLoadingAsignaciones] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);

  // =============================================
  // CARGAR DATOS DEL DOCENTE
  // =============================================
  const cargarDocente = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await docenteService.obtenerPorId(docenteId);
      setDocente(response.docente);
      setEstadisticas(response.estadisticas);
    } catch (error: any) {
      console.error('❌ Error al cargar docente:', error);
      toast.error(error.response?.data?.message || 'Error al cargar docente');
      setDocente(null);
      setEstadisticas(null);
    } finally {
      setIsLoading(false);
    }
  }, [docenteId]);

  // =============================================
  // CARGAR ASIGNACIONES DEL DOCENTE
  // =============================================
  const cargarAsignaciones = useCallback(async (periodoId?: number) => {
    setIsLoadingAsignaciones(true);
    try {
      const response = await asignacionDocenteService.listarPorDocente(
        docenteId,
        periodoId || undefined
      );
      setAsignaciones(response.data.asignaciones);
    } catch (error: any) {
      console.error('❌ Error al cargar asignaciones:', error);
      toast.error(error.response?.data?.message || 'Error al cargar asignaciones');
      setAsignaciones([]);
    } finally {
      setIsLoadingAsignaciones(false);
    }
  }, [docenteId]);

  // Cargar docente al montar
  useEffect(() => {
    cargarDocente();
  }, [cargarDocente]);

  // Cargar asignaciones cuando cambie el periodo
  useEffect(() => {
    cargarAsignaciones(periodoSeleccionado || undefined);
  }, [cargarAsignaciones, periodoSeleccionado]);

  // =============================================
  // CAMBIAR PERIODO
  // =============================================
  const cambiarPeriodo = useCallback((periodoId: number | null) => {
    setPeriodoSeleccionado(periodoId);
  }, []);

  // =============================================
  // REFRESCAR DATOS
  // =============================================
  const refrescar = useCallback(() => {
    cargarDocente();
    cargarAsignaciones(periodoSeleccionado || undefined);
  }, [cargarDocente, cargarAsignaciones, periodoSeleccionado]);

  return {
    // Estado
    docente,
    estadisticas,
    asignaciones,
    isLoading,
    isLoadingAsignaciones,
    periodoSeleccionado,

    // Acciones
    cambiarPeriodo,
    refrescar,
  };
};

export default useDocenteDetalle;