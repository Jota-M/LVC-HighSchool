// hooks/usePagos.ts - VERSIÓN FINAL 10 MESES
import { useState, useEffect, useCallback } from 'react';
import pagosService from '../services/pagos';
import type {
  CostoMensualidad,
  Mensualidad,
  PagoMensualidad,
  PagoAnualCompleto,
  EstadoPagosEstudiante,
  IngresosPorPeriodo,
  EstudianteMoroso,
  ResumenPagos,
  FiltrosCostoMensualidad,
  FiltrosMensualidad,
  FiltrosPagoMensualidad,
  FiltrosPagoAnual,
  FiltrosEstadoPagos,
  FiltrosIngresos,
  FiltrosMorosos
} from '../types/pagos';

interface UsePagosOptions {
  autoLoad?: boolean;
  loadCostos?: boolean;
  loadMensualidades?: boolean;
  loadPagos?: boolean;
  loadPagosAnuales?: boolean;
}

// 🔧 NUEVA: Interfaz para información del sistema
interface InfoSistema {
  cantidad_meses: number;
  descuento_pago_completo: number;
  meses_gratis: number;
  primer_mes: string;
  ultimo_mes: string;
  descripcion: string;
  beneficio: string;
}

interface UsePagosReturn {
  // Datos
  costos: CostoMensualidad[];
  mensualidades: Mensualidad[];
  pagos: PagoMensualidad[];
  pagosAnuales: PagoAnualCompleto[];
  estadoEstudiantes: EstadoPagosEstudiante[];
  ingresos: IngresosPorPeriodo[];
  morosos: EstudianteMoroso[];
  resumen: ResumenPagos | null;
  infoSistema: InfoSistema | null; // 🔧 NUEVO
  
  // Estados de carga
  loading: boolean;
  loadingCostos: boolean;
  loadingMensualidades: boolean;
  loadingPagos: boolean;
  loadingPagosAnuales: boolean;
  loadingReportes: boolean;
  error: string | null;
  
  // Paginación
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  
  // Métodos CRUD
  cargarCostos: (filtros?: FiltrosCostoMensualidad) => Promise<void>;
  cargarMensualidades: (filtros?: FiltrosMensualidad) => Promise<void>;
  cargarMensualidadesPorMatricula: (matriculaId: number) => Promise<void>;
  cargarPagos: (filtros?: FiltrosPagoMensualidad) => Promise<void>;
  cargarPagosAnuales: (filtros?: FiltrosPagoAnual) => Promise<void>;
  
  // Métodos de reportes
  cargarEstadoEstudiantes: (filtros?: FiltrosEstadoPagos) => Promise<void>;
  cargarIngresos: (filtros?: FiltrosIngresos) => Promise<void>;
  cargarMorosos: (filtros?: FiltrosMorosos) => Promise<void>;
  cargarResumen: (periodoAcademicoId: number) => Promise<void>;
  cargarInfoSistema: () => void; // 🔧 NUEVO
  
  // Acciones
  registrarPago: (data: any) => Promise<PagoMensualidad>;
  registrarPagoAnual: (data: any) => Promise<PagoAnualCompleto>;
  anularPago: (id: number, motivo: string) => Promise<void>;
  generarMensualidades: (data: any) => Promise<void>;
  limpiarMensualidades: () => void; 
  
  // Utilidades
  refetch: () => Promise<void>;
  obtenerMensualidadPorId: (id: number) => Mensualidad | undefined;
  obtenerPagoPorId: (id: number) => PagoMensualidad | undefined;
}

export const usePagos = (options: UsePagosOptions = {}): UsePagosReturn => {
  const {
    autoLoad = false,
    loadCostos = false,
    loadMensualidades = false,
    loadPagos = false,
    loadPagosAnuales = false
  } = options;

  // Estados de datos
  const [costos, setCostos] = useState<CostoMensualidad[]>([]);
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([]);
  const [pagos, setPagos] = useState<PagoMensualidad[]>([]);
  const [pagosAnuales, setPagosAnuales] = useState<PagoAnualCompleto[]>([]);
  const [estadoEstudiantes, setEstadoEstudiantes] = useState<EstadoPagosEstudiante[]>([]);
  const [ingresos, setIngresos] = useState<IngresosPorPeriodo[]>([]);
  const [morosos, setMorosos] = useState<EstudianteMoroso[]>([]);
  const [resumen, setResumen] = useState<ResumenPagos | null>(null);
  const [infoSistema, setInfoSistema] = useState<InfoSistema | null>(null); // 🔧 NUEVO

  // Estados de carga
  const [loadingCostos, setLoadingCostos] = useState(false);
  const [loadingMensualidades, setLoadingMensualidades] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [loadingPagosAnuales, setLoadingPagosAnuales] = useState(false);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const loading = loadingCostos || loadingMensualidades || loadingPagos || 
                  loadingPagosAnuales || loadingReportes;

  // ============== MÉTODOS DE CARGA ==============
  
  const cargarCostos = useCallback(async (filtros?: FiltrosCostoMensualidad) => {
    try {
      setLoadingCostos(true);
      setError(null);
      const response = await pagosService.listarCostos(filtros);
      setCostos(response.data.costos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar costos';
      setError(errorMsg);
      setCostos([]);
    } finally {
      setLoadingCostos(false);
    }
  }, []);

  const cargarMensualidades = useCallback(async (filtros?: FiltrosMensualidad) => {
    try {
      setLoadingMensualidades(true);
      setError(null);
      const response = await pagosService.listarMensualidades(filtros);
      setMensualidades(response.data.mensualidades || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar mensualidades';
      setError(errorMsg);
      setMensualidades([]);
    } finally {
      setLoadingMensualidades(false);
    }
  }, []);

  const cargarMensualidadesPorMatricula = useCallback(async (matriculaId: number) => {
    try {
      setLoadingMensualidades(true);
      setError(null);
      const response = await pagosService.obtenerMensualidadesPorMatricula(matriculaId);
      setMensualidades(response.data.mensualidades || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar mensualidades';
      setError(errorMsg);
      setMensualidades([]);
    } finally {
      setLoadingMensualidades(false);
    }
  }, []);

  const cargarPagos = useCallback(async (filtros?: FiltrosPagoMensualidad) => {
    try {
      setLoadingPagos(true);
      setError(null);
      const response = await pagosService.listarPagos(filtros);
      setPagos(response.data.pagos || []);
      if (response.data.paginacion) {
        setPaginacion(response.data.paginacion);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar pagos';
      setError(errorMsg);
      setPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  }, []);

  const cargarPagosAnuales = useCallback(async (filtros?: FiltrosPagoAnual) => {
    try {
      setLoadingPagosAnuales(true);
      setError(null);
      const response = await pagosService.listarPagosAnuales(filtros);
      setPagosAnuales(response.data.pagos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar pagos anuales';
      setError(errorMsg);
      setPagosAnuales([]);
    } finally {
      setLoadingPagosAnuales(false);
    }
  }, []);

  // ============== MÉTODOS DE REPORTES ==============

  const cargarEstadoEstudiantes = useCallback(async (filtros?: FiltrosEstadoPagos) => {
    try {
      setLoadingReportes(true);
      setError(null);
      const response = await pagosService.obtenerEstadoPagosEstudiantes(filtros);
      setEstadoEstudiantes(response.data.estudiantes || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar estado de estudiantes';
      setError(errorMsg);
      setEstadoEstudiantes([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarIngresos = useCallback(async (filtros?: FiltrosIngresos) => {
    try {
      setLoadingReportes(true);
      setError(null);
      const response = await pagosService.obtenerIngresos(filtros);
      setIngresos(response.data.ingresos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar ingresos';
      setError(errorMsg);
      setIngresos([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarMorosos = useCallback(async (filtros?: FiltrosMorosos) => {
    try {
      setLoadingReportes(true);
      setError(null);
      const response = await pagosService.obtenerMorosos(filtros);
      setMorosos(response.data.morosos || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar morosos';
      setError(errorMsg);
      setMorosos([]);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  const cargarResumen = useCallback(async (periodoAcademicoId: number) => {
    try {
      setLoadingReportes(true);
      setError(null);
      const response = await pagosService.obtenerResumen(periodoAcademicoId);
      setResumen(response.data.resumen);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar resumen';
      setError(errorMsg);
      setResumen(null);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  // 🔧 NUEVO: Cargar información del sistema
  const cargarInfoSistema = useCallback(() => {
    try {
      const info = pagosService.obtenerInfoSistema();
      setInfoSistema(info);
    } catch (err: any) {
      console.error('Error al cargar info del sistema:', err);
      setInfoSistema(null);
    }
  }, []);

  // ============== MÉTODOS DE ACCIONES ==============

  const registrarPago = useCallback(async (data: any): Promise<PagoMensualidad> => {
    try {
      setError(null);
      const response = await pagosService.registrarPago(data);
      // Recargar mensualidades después de registrar pago
      if (data.mensualidad_id) {
        const mensualidad = mensualidades.find(m => m.id === data.mensualidad_id);
        if (mensualidad?.matricula_id) {
          await cargarMensualidadesPorMatricula(mensualidad.matricula_id);
        }
      }
      return response.data.pago;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al registrar pago';
      setError(errorMsg);
      throw err;
    }
  }, [mensualidades, cargarMensualidadesPorMatricula]);

  const registrarPagoAnual = useCallback(async (data: any): Promise<PagoAnualCompleto> => {
    try {
      setError(null);
      const response = await pagosService.registrarPagoAnual(data);
      // Recargar mensualidades después de registrar pago anual
      if (data.matricula_id) {
        await cargarMensualidadesPorMatricula(data.matricula_id);
      }
      return response.data.pago;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al registrar pago anual';
      setError(errorMsg);
      throw err;
    }
  }, [cargarMensualidadesPorMatricula]);

  const anularPago = useCallback(async (id: number, motivo: string) => {
    try {
      setError(null);
      await pagosService.anularPago(id, { motivo });
      // Recargar pagos
      await cargarPagos();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al anular pago';
      setError(errorMsg);
      throw err;
    }
  }, [cargarPagos]);

  const generarMensualidades = useCallback(async (data: any) => {
    try {
      setError(null);
      await pagosService.generarMensualidades(data);
      // Recargar mensualidades
      if (data.matricula_id) {
        await cargarMensualidadesPorMatricula(data.matricula_id);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al generar mensualidades';
      setError(errorMsg);
      throw err;
    }
  }, [cargarMensualidadesPorMatricula]);

  const limpiarMensualidades = useCallback(() => {
    console.log('🧹 Limpiando mensualidades del estado');
    setMensualidades([]);
    setError(null);
  }, []);

  // ============== REFETCH ==============

  const refetch = useCallback(async () => {
    const promises = [];
    if (loadCostos) promises.push(cargarCostos());
    if (loadMensualidades) promises.push(cargarMensualidades());
    if (loadPagos) promises.push(cargarPagos());
    if (loadPagosAnuales) promises.push(cargarPagosAnuales());
    await Promise.all(promises);
  }, [
    loadCostos, loadMensualidades, loadPagos, loadPagosAnuales,
    cargarCostos, cargarMensualidades, cargarPagos, cargarPagosAnuales
  ]);

  // ============== AUTO-LOAD ==============

  useEffect(() => {
    // 🔧 Cargar info del sistema al montar
    cargarInfoSistema();

    if (autoLoad) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ============== UTILIDADES ==============

  const obtenerMensualidadPorId = (id: number) => mensualidades.find(m => m.id === id);
  const obtenerPagoPorId = (id: number) => pagos.find(p => p.id === id);

  return {
    // Datos
    costos,
    mensualidades,
    pagos,
    pagosAnuales,
    estadoEstudiantes,
    ingresos,
    morosos,
    resumen,
    infoSistema, // 🔧 NUEVO
    
    // Estados
    loading,
    loadingCostos,
    loadingMensualidades,
    loadingPagos,
    loadingPagosAnuales,
    loadingReportes,
    error,
    paginacion,
    
    // Métodos
    cargarCostos,
    cargarMensualidades,
    cargarMensualidadesPorMatricula,
    cargarPagos,
    cargarPagosAnuales,
    cargarEstadoEstudiantes,
    cargarIngresos,
    cargarMorosos,
    cargarResumen,
    cargarInfoSistema, // 🔧 NUEVO
    registrarPago,
    registrarPagoAnual,
    anularPago,
    limpiarMensualidades,
    generarMensualidades,
    refetch,
    obtenerMensualidadPorId,
    obtenerPagoPorId
  };
};