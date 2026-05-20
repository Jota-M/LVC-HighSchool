// hooks/useTransporte.ts - HOOK DE TRANSPORTE ESCOLAR
import { useState, useEffect, useCallback } from 'react';
import transporteService from '../services/transporte';
import type {
  RutaTransporte,
  ParadaRuta,
  AsignacionTransporte,
  PagoTransporte,
  EstadisticasRuta,
  EstadisticasAsignacion,
  EstadoCuentaTransporte,
  FiltrosRuta,
  FiltrosAsignacion,
  FiltrosPagoTransporte
} from '../types/transporte';

interface UseTransporteOptions {
  autoLoad?: boolean;
  loadRutas?: boolean;
  loadAsignaciones?: boolean;
  loadPagos?: boolean;
}

interface UseTransporteReturn {
  // Datos
  rutas: RutaTransporte[];
  paradas: ParadaRuta[];
  asignaciones: AsignacionTransporte[];
  pagosTransporte: PagoTransporte[];
  estadisticasRutas: EstadisticasRuta | null;
  estadisticasAsignaciones: EstadisticasAsignacion | null;
  estadoCuenta: EstadoCuentaTransporte | null;
  
  // Estados de carga
  loading: boolean;
  loadingRutas: boolean;
  loadingParadas: boolean;
  loadingAsignaciones: boolean;
  loadingPagos: boolean;
  loadingEstadisticas: boolean;
  error: string | null;
  
  // Paginación
  paginacionRutas: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  paginacionAsignaciones: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  paginacionPagos: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  
  // Métodos de rutas
  cargarRutas: (filtros?: FiltrosRuta) => Promise<void>;
  cargarRutaPorId: (id: number) => Promise<RutaTransporte | null>;
  crearRuta: (data: any) => Promise<RutaTransporte>;
  actualizarRuta: (id: number, data: any) => Promise<RutaTransporte>;
  eliminarRuta: (id: number) => Promise<void>;
  cargarEstadisticasRutas: () => Promise<void>;
  
  // Métodos de paradas
  cargarParadas: (rutaId: number) => Promise<void>;
  crearParada: (rutaId: number, data: any) => Promise<ParadaRuta>;
  actualizarParada: (rutaId: number, paradaId: number, data: any) => Promise<ParadaRuta>;
  eliminarParada: (rutaId: number, paradaId: number) => Promise<void>;
  reordenarParadas: (rutaId: number, paradas: Array<{ id: number; orden: number }>) => Promise<void>;
  limpiarParadas: () => void;
  
  // Métodos de asignaciones
  cargarAsignaciones: (filtros?: FiltrosAsignacion) => Promise<void>;
  cargarAsignacionPorId: (id: number) => Promise<AsignacionTransporte | null>;
  crearAsignacion: (data: any) => Promise<AsignacionTransporte>;
  actualizarAsignacion: (id: number, data: any) => Promise<AsignacionTransporte>;
  cambiarEstadoAsignacion: (id: number, estado: string, motivo?: string) => Promise<AsignacionTransporte>;
  eliminarAsignacion: (id: number) => Promise<void>;
  generarCuotas: (asignacionId: number, cantidadMeses?: number) => Promise<void>;
  cargarEstadisticasAsignaciones: (periodoAcademicoId: number) => Promise<void>;
  
  // Métodos de pagos
  cargarPagosTransporte: (filtros?: FiltrosPagoTransporte) => Promise<void>;
  registrarPagoTransporte: (id: number, data: any, comprobante?: File) => Promise<PagoTransporte>;
  anularPagoTransporte: (id: number, motivo: string) => Promise<void>;
  cargarEstadoCuenta: (estudianteId: number, periodoAcademicoId?: number) => Promise<void>;
  calcularRecargos: (porcentaje?: number) => Promise<void>;
  centralizarPago: (pagoId: number) => Promise<void>;
  
  // Utilidades
  refetch: () => Promise<void>;
  obtenerRutaPorId: (id: number) => RutaTransporte | undefined;
  obtenerAsignacionPorId: (id: number) => AsignacionTransporte | undefined;
  obtenerPagoTransportePorId: (id: number) => PagoTransporte | undefined;
}

export const useTransporte = (options: UseTransporteOptions = {}): UseTransporteReturn => {
  const {
    autoLoad = false,
    loadRutas = false,
    loadAsignaciones = false,
    loadPagos = false
  } = options;

  // Estados de datos
  const [rutas, setRutas] = useState<RutaTransporte[]>([]);
  const [paradas, setParadas] = useState<ParadaRuta[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionTransporte[]>([]);
  const [pagosTransporte, setPagosTransporte] = useState<PagoTransporte[]>([]);
  const [estadisticasRutas, setEstadisticasRutas] = useState<EstadisticasRuta | null>(null);
  const [estadisticasAsignaciones, setEstadisticasAsignaciones] = useState<EstadisticasAsignacion | null>(null);
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaTransporte | null>(null);

  // Estados de carga
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [loadingParadas, setLoadingParadas] = useState(false);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [paginacionRutas, setPaginacionRutas] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [paginacionAsignaciones, setPaginacionAsignaciones] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [paginacionPagos, setPaginacionPagos] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const loading = loadingRutas || loadingParadas || loadingAsignaciones || 
                  loadingPagos || loadingEstadisticas;

  // ============== MÉTODOS DE RUTAS ==============

  const cargarRutas = useCallback(async (filtros?: FiltrosRuta) => {
    try {
      setLoadingRutas(true);
      setError(null);
      const response = await transporteService.listarRutas(filtros);
      setRutas(response.data.rutas || []);
      if (response.data.paginacion) {
        setPaginacionRutas(response.data.paginacion);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar rutas';
      setError(errorMsg);
      setRutas([]);
    } finally {
      setLoadingRutas(false);
    }
  }, []);

  const cargarRutaPorId = useCallback(async (id: number): Promise<RutaTransporte | null> => {
    try {
      setLoadingRutas(true);
      setError(null);
      const response = await transporteService.obtenerRutaPorId(id);
      return response.data.ruta;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar ruta';
      setError(errorMsg);
      return null;
    } finally {
      setLoadingRutas(false);
    }
  }, []);

  const crearRuta = useCallback(async (data: any): Promise<RutaTransporte> => {
    try {
      setError(null);
      const response = await transporteService.crearRuta(data);
      await cargarRutas();
      return response.data.ruta;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear ruta';
      setError(errorMsg);
      throw err;
    }
  }, [cargarRutas]);

  const actualizarRuta = useCallback(async (id: number, data: any): Promise<RutaTransporte> => {
    try {
      setError(null);
      const response = await transporteService.actualizarRuta(id, data);
      await cargarRutas();
      return response.data.ruta;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar ruta';
      setError(errorMsg);
      throw err;
    }
  }, [cargarRutas]);

  const eliminarRuta = useCallback(async (id: number) => {
    try {
      setError(null);
      await transporteService.eliminarRuta(id);
      await cargarRutas();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar ruta';
      setError(errorMsg);
      throw err;
    }
  }, [cargarRutas]);

  const cargarEstadisticasRutas = useCallback(async () => {
    try {
      setLoadingEstadisticas(true);
      setError(null);
      const response = await transporteService.obtenerEstadisticasRutas();
      setEstadisticasRutas(response.data.estadisticas);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar estadísticas';
      setError(errorMsg);
      setEstadisticasRutas(null);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  // ============== MÉTODOS DE PARADAS ==============

  const cargarParadas = useCallback(async (rutaId: number) => {
    try {
      setLoadingParadas(true);
      setError(null);
      const response = await transporteService.listarParadas(rutaId);
      setParadas(response.data.paradas || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar paradas';
      setError(errorMsg);
      setParadas([]);
    } finally {
      setLoadingParadas(false);
    }
  }, []);

  const crearParada = useCallback(async (rutaId: number, data: any): Promise<ParadaRuta> => {
    try {
      setError(null);
      const response = await transporteService.crearParada(rutaId, data);
      await cargarParadas(rutaId);
      return response.data.parada;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear parada';
      setError(errorMsg);
      throw err;
    }
  }, [cargarParadas]);

  const actualizarParada = useCallback(async (
    rutaId: number,
    paradaId: number,
    data: any
  ): Promise<ParadaRuta> => {
    try {
      setError(null);
      const response = await transporteService.actualizarParada(rutaId, paradaId, data);
      await cargarParadas(rutaId);
      return response.data.parada;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar parada';
      setError(errorMsg);
      throw err;
    }
  }, [cargarParadas]);

  const eliminarParada = useCallback(async (rutaId: number, paradaId: number) => {
    try {
      setError(null);
      await transporteService.eliminarParada(rutaId, paradaId);
      await cargarParadas(rutaId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar parada';
      setError(errorMsg);
      throw err;
    }
  }, [cargarParadas]);

  const reordenarParadas = useCallback(async (
    rutaId: number,
    nuevasParadas: Array<{ id: number; orden: number }>
  ) => {
    try {
      setError(null);
      await transporteService.reordenarParadas(rutaId, { paradas: nuevasParadas });
      await cargarParadas(rutaId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al reordenar paradas';
      setError(errorMsg);
      throw err;
    }
  }, [cargarParadas]);

  const limpiarParadas = useCallback(() => {
    setParadas([]);
    setError(null);
  }, []);

  // ============== MÉTODOS DE ASIGNACIONES ==============

  const cargarAsignaciones = useCallback(async (filtros?: FiltrosAsignacion) => {
    try {
      setLoadingAsignaciones(true);
      setError(null);
      const response = await transporteService.listarAsignaciones(filtros);
      setAsignaciones(response.data.asignaciones || []);
      if (response.data.paginacion) {
        setPaginacionAsignaciones(response.data.paginacion);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar asignaciones';
      setError(errorMsg);
      setAsignaciones([]);
    } finally {
      setLoadingAsignaciones(false);
    }
  }, []);

  const cargarAsignacionPorId = useCallback(async (id: number): Promise<AsignacionTransporte | null> => {
    try {
      setLoadingAsignaciones(true);
      setError(null);
      const response = await transporteService.obtenerAsignacionPorId(id);
      return response.data.asignacion;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar asignación';
      setError(errorMsg);
      return null;
    } finally {
      setLoadingAsignaciones(false);
    }
  }, []);

  const crearAsignacion = useCallback(async (data: any): Promise<AsignacionTransporte> => {
    try {
      setError(null);
      const response = await transporteService.crearAsignacion(data);
      await cargarAsignaciones();
      return response.data.asignacion;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear asignación';
      setError(errorMsg);
      throw err;
    }
  }, [cargarAsignaciones]);

  const actualizarAsignacion = useCallback(async (id: number, data: any): Promise<AsignacionTransporte> => {
    try {
      setError(null);
      const response = await transporteService.actualizarAsignacion(id, data);
      await cargarAsignaciones();
      return response.data.asignacion;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar asignación';
      setError(errorMsg);
      throw err;
    }
  }, [cargarAsignaciones]);

  const cambiarEstadoAsignacion = useCallback(async (
    id: number,
    estado: string,
    motivo?: string
  ): Promise<AsignacionTransporte> => {
    try {
      setError(null);
      const response = await transporteService.cambiarEstadoAsignacion(id, { estado: estado as any, motivo });
      await cargarAsignaciones();
      return response.data.asignacion;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cambiar estado';
      setError(errorMsg);
      throw err;
    }
  }, [cargarAsignaciones]);

  const eliminarAsignacion = useCallback(async (id: number) => {
    try {
      setError(null);
      await transporteService.eliminarAsignacion(id);
      await cargarAsignaciones();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar asignación';
      setError(errorMsg);
      throw err;
    }
  }, [cargarAsignaciones]);

  const generarCuotas = useCallback(async (asignacionId: number, cantidadMeses?: number) => {
    try {
      setError(null);
      await transporteService.generarCuotas(asignacionId, cantidadMeses ? { cantidad_meses: cantidadMeses } : undefined);
      await cargarAsignaciones();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al generar cuotas';
      setError(errorMsg);
      throw err;
    }
  }, [cargarAsignaciones]);

  const cargarEstadisticasAsignaciones = useCallback(async (periodoAcademicoId: number) => {
    try {
      setLoadingEstadisticas(true);
      setError(null);
      const response = await transporteService.obtenerEstadisticasAsignaciones(periodoAcademicoId);
      setEstadisticasAsignaciones(response.data.estadisticas);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar estadísticas';
      setError(errorMsg);
      setEstadisticasAsignaciones(null);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  // ============== MÉTODOS DE PAGOS ==============

  const cargarPagosTransporte = useCallback(async (filtros?: FiltrosPagoTransporte) => {
    try {
      setLoadingPagos(true);
      setError(null);
      const response = await transporteService.listarPagosTransporte(filtros);
      setPagosTransporte(response.data.pagos || []);
      if (response.data.paginacion) {
        setPaginacionPagos(response.data.paginacion);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar pagos';
      setError(errorMsg);
      setPagosTransporte([]);
    } finally {
      setLoadingPagos(false);
    }
  }, []);

  const registrarPagoTransporte = useCallback(async (
    id: number,
    data: any,
    comprobante?: File
  ): Promise<PagoTransporte> => {
    try {
      setError(null);
      const response = await transporteService.registrarPagoTransporte(id, data, comprobante);
      await cargarPagosTransporte();
      return response.data.pago;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al registrar pago';
      setError(errorMsg);
      throw err;
    }
  }, [cargarPagosTransporte]);

  const anularPagoTransporte = useCallback(async (id: number, motivo: string) => {
    try {
      setError(null);
      await transporteService.anularPagoTransporte(id, { motivo });
      await cargarPagosTransporte();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al anular pago';
      setError(errorMsg);
      throw err;
    }
  }, [cargarPagosTransporte]);

  const cargarEstadoCuenta = useCallback(async (estudianteId: number, periodoAcademicoId?: number) => {
    try {
      setLoadingPagos(true);
      setError(null);
      const response = await transporteService.obtenerEstadoCuenta(estudianteId, periodoAcademicoId);
      setEstadoCuenta(response.data.estadoCuenta);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar estado de cuenta';
      setError(errorMsg);
      setEstadoCuenta(null);
    } finally {
      setLoadingPagos(false);
    }
  }, []);

  const calcularRecargos = useCallback(async (porcentaje?: number) => {
    try {
      setError(null);
      await transporteService.calcularRecargos(porcentaje ? { porcentaje } : undefined);
      await cargarPagosTransporte();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al calcular recargos';
      setError(errorMsg);
      throw err;
    }
  }, [cargarPagosTransporte]);

  const centralizarPago = useCallback(async (pagoId: number) => {
    try {
      setError(null);
      await transporteService.centralizarPago(pagoId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al centralizar pago';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // ============== REFETCH ==============

  const refetch = useCallback(async () => {
    const promises = [];
    if (loadRutas) promises.push(cargarRutas());
    if (loadAsignaciones) promises.push(cargarAsignaciones());
    if (loadPagos) promises.push(cargarPagosTransporte());
    await Promise.all(promises);
  }, [loadRutas, loadAsignaciones, loadPagos, cargarRutas, cargarAsignaciones, cargarPagosTransporte]);

  // ============== AUTO-LOAD ==============

  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ============== UTILIDADES ==============

  const obtenerRutaPorId = (id: number) => rutas.find(r => r.id === id);
  const obtenerAsignacionPorId = (id: number) => asignaciones.find(a => a.id === id);
  const obtenerPagoTransportePorId = (id: number) => pagosTransporte.find(p => p.id === id);

  return {
    // Datos
    rutas,
    paradas,
    asignaciones,
    pagosTransporte,
    estadisticasRutas,
    estadisticasAsignaciones,
    estadoCuenta,
    
    // Estados
    loading,
    loadingRutas,
    loadingParadas,
    loadingAsignaciones,
    loadingPagos,
    loadingEstadisticas,
    error,
    paginacionRutas,
    paginacionAsignaciones,
    paginacionPagos,
    
    // Métodos de rutas
    cargarRutas,
    cargarRutaPorId,
    crearRuta,
    actualizarRuta,
    eliminarRuta,
    cargarEstadisticasRutas,
    
    // Métodos de paradas
    cargarParadas,
    crearParada,
    actualizarParada,
    eliminarParada,
    reordenarParadas,
    limpiarParadas,
    
    // Métodos de asignaciones
    cargarAsignaciones,
    cargarAsignacionPorId,
    crearAsignacion,
    actualizarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
    generarCuotas,
    cargarEstadisticasAsignaciones,
    
    // Métodos de pagos
    cargarPagosTransporte,
    registrarPagoTransporte,
    anularPagoTransporte,
    cargarEstadoCuenta,
    calcularRecargos,
    centralizarPago,
    
    // Utilidades
    refetch,
    obtenerRutaPorId,
    obtenerAsignacionPorId,
    obtenerPagoTransportePorId
  };
};