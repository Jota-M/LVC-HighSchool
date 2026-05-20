// hooks/useIngresos.ts - HOOK DE INGOS
import { useState, useEffect, useCallback } from 'react';
import ingresosService from '../services/ingresos';
import type {
  TipoIngreso,
  Ingreso,
  ResumenPorCategoria,
  ResumenPorMetodoPago,
  IngresoDiario,
  EstadisticasIngresos,
  FiltrosTipoIngreso,
  FiltrosIngreso,
  FiltrosResumen,
} from '../types/ingresos';

interface UseIngresosOptions {
  autoLoad?: boolean;
  loadTipos?: boolean;
  loadIngresos?: boolean;
  loadEstadisticas?: boolean;
}

interface UseIngresosReturn {
  tipos: TipoIngreso[];
  ingresos: Ingreso[];
  resumenCategorias: ResumenPorCategoria[];
  resumenMetodosPago: ResumenPorMetodoPago[];
  ingresosDiarios: IngresoDiario[];
  estadisticas: EstadisticasIngresos | null;

  loading: boolean;
  loadingTipos: boolean;
  loadingIngresos: boolean;
  loadingReportes: boolean;
  error: string | null;

  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  cargarTipos: (filtros?: FiltrosTipoIngreso) => Promise<void>;
  crearTipo: (data: any) => Promise<TipoIngreso>;
  actualizarTipo: (id: number, data: any) => Promise<TipoIngreso>;

  cargarIngresos: (filtros?: FiltrosIngreso) => Promise<void>;
  cargarIngresoPorId: (id: number) => Promise<Ingreso | null>;
  crearIngreso: (data: any, comprobante?: File) => Promise<Ingreso>;
  verificarIngreso: (id: number) => Promise<Ingreso>;
  anularIngreso: (id: number, motivo: string) => Promise<Ingreso>;

  cargarResumenCategorias: (filtros?: FiltrosResumen) => Promise<void>;
  cargarResumenMetodosPago: (filtros?: FiltrosResumen) => Promise<void>;
  cargarIngresosDiarios: (filtros?: FiltrosResumen) => Promise<void>;
  cargarEstadisticas: (filtros?: FiltrosResumen) => Promise<void>;

  refetch: () => Promise<void>;
  obtenerTipoPorId: (id: number) => TipoIngreso | undefined;
  obtenerIngresoPorId: (id: number) => Ingreso | undefined;
}

export const useIngresos = (options: UseIngresosOptions = {}): UseIngresosReturn => {
  const {
    autoLoad = false,
    loadTipos = false,
    loadIngresos = false,
    loadEstadisticas = false,
  } = options;

  const [tipos, setTipos] = useState<TipoIngreso[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [resumenCategorias, setResumenCategorias] = useState<ResumenPorCategoria[]>([]);
  const [resumenMetodosPago, setResumenMetodosPago] = useState<ResumenPorMetodoPago[]>([]);
  const [ingresosDiarios, setIngresosDiarios] = useState<IngresoDiario[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasIngresos | null>(null);

  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingIngresos, setLoadingIngresos] = useState(false);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paginacion, setPaginacion] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const loading = loadingTipos || loadingIngresos || loadingReportes;

  const cargarTipos = useCallback(async (filtros?: FiltrosTipoIngreso) => {
    try {
      setLoadingTipos(true);
      setError(null);

      const response = await ingresosService.listarTipos(filtros);
      setTipos(response.data.tipos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar tipos de ingreso';
      setError(errorMsg);
      setTipos([]);
    } finally {
      setLoadingTipos(false);
    }
  }, []);

  const crearTipo = useCallback(async (data: any): Promise<TipoIngreso> => {
    try {
      setError(null);

      const response = await ingresosService.crearTipo(data);
      await cargarTipos();

      return response.data.tipo;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear tipo de ingreso';
      setError(errorMsg);
      throw err;
    }
  }, [cargarTipos]);

  const actualizarTipo = useCallback(async (id: number, data: any): Promise<TipoIngreso> => {
    try {
      setError(null);

      const response = await ingresosService.actualizarTipo(id, data);
      await cargarTipos();

      return response.data.tipo;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar tipo de ingreso';
      setError(errorMsg);
      throw err;
    }
  }, [cargarTipos]);

  const cargarIngresos = useCallback(async (filtros?: FiltrosIngreso) => {
    try {
      setLoadingIngresos(true);
      setError(null);

      const response = await ingresosService.listarIngresos(filtros);
      setIngresos(response.data.ingresos || []);

      if (response.data.paginacion) {
        setPaginacion(response.data.paginacion);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar ingresos';
      setError(errorMsg);
      setIngresos([]);
    } finally {
      setLoadingIngresos(false);
    }
  }, []);

  const cargarIngresoPorId = useCallback(async (id: number): Promise<Ingreso | null> => {
    try {
      setLoadingIngresos(true);
      setError(null);

      const response = await ingresosService.obtenerIngresoPorId(id);
      return response.data.ingreso;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar ingreso';
      setError(errorMsg);
      return null;
    } finally {
      setLoadingIngresos(false);
    }
  }, []);

  const crearIngreso = useCallback(async (data: any, comprobante?: File): Promise<Ingreso> => {
    try {
      setError(null);

      const response = await ingresosService.crearIngreso(data, comprobante);
      await cargarIngresos();

      return response.data.ingreso;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear ingreso';
      setError(errorMsg);
      throw err;
    }
  }, [cargarIngresos]);

  const verificarIngreso = useCallback(async (id: number): Promise<Ingreso> => {
    try {
      setError(null);

      const response = await ingresosService.verificarIngreso(id);
      await cargarIngresos();

      return response.data.ingreso;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al verificar ingreso';
      setError(errorMsg);
      throw err;
    }
  }, [cargarIngresos]);

  const anularIngreso = useCallback(async (id: number, motivo: string): Promise<Ingreso> => {
    try {
      setError(null);

      const response = await ingresosService.anularIngreso(id, { motivo });
      await cargarIngresos();

      return response.data.ingreso;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al anular ingreso';
      setError(errorMsg);
      throw err;
    }
  }, [cargarIngresos]);

  const cargarResumenCategorias = useCallback(async (filtros?: FiltrosResumen) => {
    try {
      setLoadingReportes(true);
      setError(null);

      const response = await ingresosService.obtenerResumenPorCategoria(filtros);
      setResumenCategorias(response.data.resumen || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar resumen por categorías';
      setError(errorMsg);
      setResumenCategorias([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarResumenMetodosPago = useCallback(async (filtros?: FiltrosResumen) => {
    try {
      setLoadingReportes(true);
      setError(null);

      const response = await ingresosService.obtenerResumenPorMetodoPago(filtros);
      setResumenMetodosPago(response.data.resumen || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar resumen por métodos de pago';
      setError(errorMsg);
      setResumenMetodosPago([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarIngresosDiarios = useCallback(async (filtros?: FiltrosResumen) => {
    try {
      setLoadingReportes(true);
      setError(null);

      const response = await ingresosService.obtenerIngresosDiarios(filtros);
      setIngresosDiarios(response.data.ingresos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar ingresos diarios';
      setError(errorMsg);
      setIngresosDiarios([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarEstadisticas = useCallback(async (filtros?: FiltrosResumen) => {
    try {
      setLoadingReportes(true);
      setError(null);

      const response = await ingresosService.obtenerEstadisticas(filtros);
      setEstadisticas(response.data.estadisticas);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar estadísticas';
      setError(errorMsg);
      setEstadisticas(null);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (loadTipos) promises.push(cargarTipos());
    if (loadIngresos) promises.push(cargarIngresos());
    if (loadEstadisticas) promises.push(cargarEstadisticas());

    await Promise.all(promises);
  }, [
    loadTipos,
    loadIngresos,
    loadEstadisticas,
    cargarTipos,
    cargarIngresos,
    cargarEstadisticas,
  ]);

  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad, refetch]);

  const obtenerTipoPorId = (id: number) => tipos.find((tipo) => tipo.id === id);
  const obtenerIngresoPorId = (id: number) => ingresos.find((ingreso) => ingreso.id === id);

  return {
    tipos,
    ingresos,
    resumenCategorias,
    resumenMetodosPago,
    ingresosDiarios,
    estadisticas,

    loading,
    loadingTipos,
    loadingIngresos,
    loadingReportes,
    error,
    paginacion,

    cargarTipos,
    crearTipo,
    actualizarTipo,

    cargarIngresos,
    cargarIngresoPorId,
    crearIngreso,
    verificarIngreso,
    anularIngreso,

    cargarResumenCategorias,
    cargarResumenMetodosPago,
    cargarIngresosDiarios,
    cargarEstadisticas,

    refetch,
    obtenerTipoPorId,
    obtenerIngresoPorId,
  };
};