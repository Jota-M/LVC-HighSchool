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
  InfoSistema,
  FiltrosCostoMensualidad,
  FiltrosMensualidad,
  FiltrosPagoMensualidad,
  FiltrosPagoAnual,
  FiltrosEstadoPagos,
  FiltrosIngresos,
  FiltrosMorosos,
  FiltrosExportarEstadoCuenta,
  FiltrosExportarMorosos,
  FiltrosExportarIngresos,
  DescargaReportePagos,
  RegistrarPagoMensualidadRequest,
  RegistrarPagoAnualRequest,
  GenerarMensualidadesRequest,
} from '../types/pagos';

interface UsePagosOptions {
  autoLoad?: boolean;
  loadCostos?: boolean;
  loadMensualidades?: boolean;
  loadPagos?: boolean;
  loadPagosAnuales?: boolean;
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
  infoSistema: InfoSistema | null;

  // Estados de carga
  loading: boolean;
  loadingCostos: boolean;
  loadingMensualidades: boolean;
  loadingPagos: boolean;
  loadingPagosAnuales: boolean;
  loadingReportes: boolean;
  loadingExportacionReportes: boolean;
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

  // Métodos de reportes (datos para vista)
  cargarEstadoEstudiantes: (filtros?: FiltrosEstadoPagos) => Promise<void>;
  cargarIngresos: (filtros?: FiltrosIngresos) => Promise<void>;
  cargarMorosos: (filtros?: FiltrosMorosos) => Promise<void>;
  cargarResumen: (periodoAcademicoId: number) => Promise<void>;
  cargarInfoSistema: () => void;

  // Métodos de exportación PDF / Excel
  exportarEstadoCuenta: (filtros: FiltrosExportarEstadoCuenta) => Promise<DescargaReportePagos>;
  exportarMorosos: (filtros: FiltrosExportarMorosos) => Promise<DescargaReportePagos>;
  exportarIngresos: (filtros: FiltrosExportarIngresos) => Promise<DescargaReportePagos>;

  // Acciones
  registrarPago: (data: RegistrarPagoMensualidadRequest) => Promise<PagoMensualidad>;
  registrarPagoAnual: (data: RegistrarPagoAnualRequest) => Promise<PagoAnualCompleto>;
  anularPago: (id: number, motivo: string) => Promise<void>;
  generarMensualidades: (data: GenerarMensualidadesRequest) => Promise<void>;
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
    loadPagosAnuales = false,
  } = options;

  // ── Estado ─────────────────────────────────────────────────
  const [costos, setCostos]                         = useState<CostoMensualidad[]>([]);
  const [mensualidades, setMensualidades]           = useState<Mensualidad[]>([]);
  const [pagos, setPagos]                           = useState<PagoMensualidad[]>([]);
  const [pagosAnuales, setPagosAnuales]             = useState<PagoAnualCompleto[]>([]);
  const [estadoEstudiantes, setEstadoEstudiantes]   = useState<EstadoPagosEstudiante[]>([]);
  const [ingresos, setIngresos]                     = useState<IngresosPorPeriodo[]>([]);
  const [morosos, setMorosos]                       = useState<EstudianteMoroso[]>([]);
  const [resumen, setResumen]                       = useState<ResumenPagos | null>(null);
  const [infoSistema, setInfoSistema]               = useState<InfoSistema | null>(null);

  const [loadingCostos, setLoadingCostos]           = useState(false);
  const [loadingMensualidades, setLoadingMens]      = useState(false);
  const [loadingPagos, setLoadingPagos]             = useState(false);
  const [loadingPagosAnuales, setLoadingAnuales]    = useState(false);
  const [loadingReportes, setLoadingReportes]       = useState(false);
  const [loadingExportacionReportes, setLoadingExportacionReportes] = useState(false);
  const [error, setError]                           = useState<string | null>(null);
  const [paginacion, setPaginacion]                 = useState<UsePagosReturn['paginacion']>(null);

  const loading =
    loadingCostos || loadingMensualidades || loadingPagos ||
    loadingPagosAnuales || loadingReportes || loadingExportacionReportes;

  // ── Helpers ────────────────────────────────────────────────
  const handleError = (err: unknown, fallback: string) => {
    const error = err as { response?: { data?: { message?: string } } };
    const msg = error.response?.data?.message || fallback;
    setError(msg);
    return msg;
  };

  // ── Métodos de carga ───────────────────────────────────────

  const cargarCostos = useCallback(async (filtros?: FiltrosCostoMensualidad) => {
    try {
      setLoadingCostos(true); setError(null);
      const res = await pagosService.listarCostos(filtros);
      setCostos(res.data.costos || []);
    } catch (err) {
      handleError(err, 'Error al cargar costos'); setCostos([]);
    } finally { setLoadingCostos(false); }
  }, []);

  const cargarMensualidades = useCallback(async (filtros?: FiltrosMensualidad) => {
    try {
      setLoadingMens(true); setError(null);
      const res = await pagosService.listarMensualidades(filtros);
      setMensualidades(res.data.mensualidades || []);
    } catch (err) {
      handleError(err, 'Error al cargar mensualidades'); setMensualidades([]);
    } finally { setLoadingMens(false); }
  }, []);

  const cargarMensualidadesPorMatricula = useCallback(async (matriculaId: number) => {
    try {
      setLoadingMens(true); setError(null);
      const res = await pagosService.obtenerMensualidadesPorMatricula(matriculaId);
      setMensualidades(res.data.mensualidades || []);
    } catch (err) {
      handleError(err, 'Error al cargar mensualidades'); setMensualidades([]);
    } finally { setLoadingMens(false); }
  }, []);

  const cargarPagos = useCallback(async (filtros?: FiltrosPagoMensualidad) => {
    try {
      setLoadingPagos(true); setError(null);
      const res = await pagosService.listarPagos(filtros);
      setPagos(res.data.pagos || []);
      if (res.data.paginacion) setPaginacion(res.data.paginacion);
    } catch (err) {
      handleError(err, 'Error al cargar pagos'); setPagos([]);
    } finally { setLoadingPagos(false); }
  }, []);

  const cargarPagosAnuales = useCallback(async (filtros?: FiltrosPagoAnual) => {
    try {
      setLoadingAnuales(true); setError(null);
      const res = await pagosService.listarPagosAnuales(filtros);
      setPagosAnuales(res.data.pagos || []);
    } catch (err) {
      handleError(err, 'Error al cargar pagos anuales'); setPagosAnuales([]);
    } finally { setLoadingAnuales(false); }
  }, []);

  // ── Métodos de reportes ────────────────────────────────────

  const cargarEstadoEstudiantes = useCallback(async (filtros?: FiltrosEstadoPagos) => {
    try {
      setLoadingReportes(true); setError(null);
      const res = await pagosService.obtenerEstadoPagosEstudiantes(filtros);
      setEstadoEstudiantes(res.data.estudiantes || []);
    } catch (err) {
      handleError(err, 'Error al cargar estado de estudiantes'); setEstadoEstudiantes([]);
    } finally { setLoadingReportes(false); }
  }, []);

  const cargarIngresos = useCallback(async (filtros?: FiltrosIngresos) => {
    try {
      setLoadingReportes(true); setError(null);
      const res = await pagosService.obtenerIngresos(filtros);
      setIngresos(res.data.ingresos || []);
    } catch (err) {
      handleError(err, 'Error al cargar ingresos'); setIngresos([]);
    } finally { setLoadingReportes(false); }
  }, []);

  const cargarMorosos = useCallback(async (filtros?: FiltrosMorosos) => {
    try {
      setLoadingReportes(true); setError(null);
      const res = await pagosService.obtenerMorosos(filtros);
      setMorosos(res.data.morosos || []);
    } catch (err) {
      handleError(err, 'Error al cargar morosos'); setMorosos([]);
    } finally { setLoadingReportes(false); }
  }, []);

  const cargarResumen = useCallback(async (periodoAcademicoId: number) => {
    try {
      setLoadingReportes(true); setError(null);
      const res = await pagosService.obtenerResumen(periodoAcademicoId);
      setResumen(res.data.resumen);
    } catch (err) {
      handleError(err, 'Error al cargar resumen'); setResumen(null);
    } finally { setLoadingReportes(false); }
  }, []);

  const cargarInfoSistema = useCallback(() => {
    try { setInfoSistema(pagosService.obtenerInfoSistema()); }
    catch { setInfoSistema(null); }
  }, []);

  // ── Métodos de exportación (delegados al service) ──────────

  const exportarEstadoCuenta = useCallback(async (filtros: FiltrosExportarEstadoCuenta) => {
    try {
      setLoadingExportacionReportes(true); setError(null);
      return await pagosService.exportarEstadoCuenta(filtros);
    } catch (err) {
      throw new Error(handleError(err, 'Error al descargar estado de cuenta'));
    } finally { setLoadingExportacionReportes(false); }
  }, []);

  const exportarMorosos = useCallback(async (filtros: FiltrosExportarMorosos) => {
    try {
      setLoadingExportacionReportes(true); setError(null);
      return await pagosService.exportarMorosos(filtros);
    } catch (err) {
      throw new Error(handleError(err, 'Error al descargar reporte de morosos'));
    } finally { setLoadingExportacionReportes(false); }
  }, []);

  const exportarIngresos = useCallback(async (filtros: FiltrosExportarIngresos) => {
    try {
      setLoadingExportacionReportes(true); setError(null);
      return await pagosService.exportarIngresos(filtros);
    } catch (err) {
      throw new Error(handleError(err, 'Error al descargar reporte de ingresos'));
    } finally { setLoadingExportacionReportes(false); }
  }, []);

  // ── Acciones ───────────────────────────────────────────────

  const registrarPago = useCallback(
    async (data: RegistrarPagoMensualidadRequest): Promise<PagoMensualidad> => {
      try {
        setError(null);
        const res = await pagosService.registrarPago(data);
        if (data.mensualidad_id) {
          const mens = mensualidades.find((m) => m.id === data.mensualidad_id);
          if (mens?.matricula_id) await cargarMensualidadesPorMatricula(mens.matricula_id);
        }
        return res.data.pago;
      } catch (err) {
        throw new Error(handleError(err, 'Error al registrar pago'));
      }
    },
    [mensualidades, cargarMensualidadesPorMatricula]
  );

  const registrarPagoAnual = useCallback(
    async (data: RegistrarPagoAnualRequest): Promise<PagoAnualCompleto> => {
      try {
        setError(null);
        const res = await pagosService.registrarPagoAnual(data);
        if (data.matricula_id) await cargarMensualidadesPorMatricula(data.matricula_id);
        return res.data.pago;
      } catch (err) {
        throw new Error(handleError(err, 'Error al registrar pago anual'));
      }
    },
    [cargarMensualidadesPorMatricula]
  );

  const anularPago = useCallback(
    async (id: number, motivo: string) => {
      try {
        setError(null);
        await pagosService.anularPago(id, { motivo });
        await cargarPagos();
      } catch (err) {
        throw new Error(handleError(err, 'Error al anular pago'));
      }
    },
    [cargarPagos]
  );

  const generarMensualidades = useCallback(
    async (data: GenerarMensualidadesRequest) => {
      try {
        setError(null);
        await pagosService.generarMensualidades(data);
        if (data.matricula_id) await cargarMensualidadesPorMatricula(data.matricula_id);
      } catch (err) {
        throw new Error(handleError(err, 'Error al generar mensualidades'));
      }
    },
    [cargarMensualidadesPorMatricula]
  );

  const limpiarMensualidades = useCallback(() => {
    setMensualidades([]);
    setError(null);
  }, []);

  // ── Auto-load ──────────────────────────────────────────────

  const refetch = useCallback(async () => {
    const promises: Promise<void>[] = [];
    if (loadCostos)        promises.push(cargarCostos());
    if (loadMensualidades) promises.push(cargarMensualidades());
    if (loadPagos)         promises.push(cargarPagos());
    if (loadPagosAnuales)  promises.push(cargarPagosAnuales());
    await Promise.all(promises);
  }, [loadCostos, loadMensualidades, loadPagos, loadPagosAnuales,
      cargarCostos, cargarMensualidades, cargarPagos, cargarPagosAnuales]);

  useEffect(() => {
    cargarInfoSistema();
    if (autoLoad) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ── Utilidades ─────────────────────────────────────────────

  const obtenerMensualidadPorId = (id: number) => mensualidades.find((m) => m.id === id);
  const obtenerPagoPorId        = (id: number) => pagos.find((p) => p.id === id);

  return {
    // Datos
    costos, mensualidades, pagos, pagosAnuales,
    estadoEstudiantes, ingresos, morosos, resumen, infoSistema,
    // Estados
    loading, loadingCostos, loadingMensualidades: loadingMensualidades,
    loadingPagos, loadingPagosAnuales, loadingReportes,
    loadingExportacionReportes, error, paginacion,
    // Métodos de carga
    cargarCostos, cargarMensualidades, cargarMensualidadesPorMatricula,
    cargarPagos, cargarPagosAnuales,
    // Métodos de reportes
    cargarEstadoEstudiantes, cargarIngresos, cargarMorosos,
    cargarResumen, cargarInfoSistema,
    // Exportación
    exportarEstadoCuenta, exportarMorosos, exportarIngresos,
    // Acciones
    registrarPago, registrarPagoAnual, anularPago,
    generarMensualidades, limpiarMensualidades,
    // Utilidades
    refetch, obtenerMensualidadPorId, obtenerPagoPorId,
  };
};
