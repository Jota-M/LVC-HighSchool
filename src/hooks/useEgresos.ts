// hooks/useEgresos.ts - HOOK DE EGRESOS
import { useState, useEffect, useCallback } from 'react';
import egresosService from '../services/egresos';
import type {
    TipoEgreso,
    Egreso,
    ResumenPorCategoriaEgreso,
    ResumenPorMetodoPagoEgreso,
    EgresoDiario,
    EstadisticasEgresos,
    FiltrosTipoEgreso,
    FiltrosEgreso,
    FiltrosResumenEgreso,
} from '../types/egresos';

interface UseEgresosOptions {
    autoLoad?: boolean;
    loadTipos?: boolean;
    loadEgresos?: boolean;
    loadEstadisticas?: boolean;
}

interface UseEgresosReturn {
    tipos: TipoEgreso[];
    egresos: Egreso[];
    resumenCategorias: ResumenPorCategoriaEgreso[];
    resumenMetodosPago: ResumenPorMetodoPagoEgreso[];
    egresosDiarios: EgresoDiario[];
    estadisticas: EstadisticasEgresos | null;

    loading: boolean;
    loadingTipos: boolean;
    loadingEgresos: boolean;
    loadingReportes: boolean;
    error: string | null;

    paginacion: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null;

    cargarTipos: (filtros?: FiltrosTipoEgreso) => Promise<void>;
    crearTipo: (data: any) => Promise<TipoEgreso>;
    actualizarTipo: (id: number, data: any) => Promise<TipoEgreso>;

    cargarEgresos: (filtros?: FiltrosEgreso) => Promise<void>;
    cargarEgresoPorId: (id: number) => Promise<Egreso | null>;
    crearEgreso: (data: any, comprobante?: File) => Promise<Egreso>;
    verificarEgreso: (id: number) => Promise<Egreso>;
    anularEgreso: (id: number, motivo: string) => Promise<Egreso>;

    cargarResumenCategorias: (filtros?: FiltrosResumenEgreso) => Promise<void>;
    cargarResumenMetodosPago: (filtros?: FiltrosResumenEgreso) => Promise<void>;
    cargarEgresosDiarios: (filtros?: FiltrosResumenEgreso) => Promise<void>;
    cargarEstadisticas: (filtros?: FiltrosResumenEgreso) => Promise<void>;

    refetch: () => Promise<void>;
    obtenerTipoPorId: (id: number) => TipoEgreso | undefined;
    obtenerEgresoPorId: (id: number) => Egreso | undefined;
}

export const useEgresos = (options: UseEgresosOptions = {}): UseEgresosReturn => {
    const {
        autoLoad = false,
        loadTipos = false,
        loadEgresos = false,
        loadEstadisticas = false,
    } = options;

    const [tipos, setTipos] = useState<TipoEgreso[]>([]);
    const [egresos, setEgresos] = useState<Egreso[]>([]);
    const [resumenCategorias, setResumenCategorias] = useState<ResumenPorCategoriaEgreso[]>([]);
    const [resumenMetodosPago, setResumenMetodosPago] = useState<ResumenPorMetodoPagoEgreso[]>([]);
    const [egresosDiarios, setEgresosDiarios] = useState<EgresoDiario[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasEgresos | null>(null);

    const [loadingTipos, setLoadingTipos] = useState(false);
    const [loadingEgresos, setLoadingEgresos] = useState(false);
    const [loadingReportes, setLoadingReportes] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [paginacion, setPaginacion] = useState<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null>(null);

    const loading = loadingTipos || loadingEgresos || loadingReportes;

    const cargarTipos = useCallback(async (filtros?: FiltrosTipoEgreso) => {
        try {
            setLoadingTipos(true);
            setError(null);

            const response = await egresosService.listarTipos(filtros);
            setTipos(response.data.tipos || []);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar tipos de egreso';
            setError(errorMsg);
            setTipos([]);
        } finally {
            setLoadingTipos(false);
        }
    }, []);

    const crearTipo = useCallback(async (data: any): Promise<TipoEgreso> => {
        try {
            setError(null);

            const response = await egresosService.crearTipo(data);
            await cargarTipos();

            return response.data.tipo;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al crear tipo de egreso';
            setError(errorMsg);
            throw err;
        }
    }, [cargarTipos]);

    const actualizarTipo = useCallback(async (id: number, data: any): Promise<TipoEgreso> => {
        try {
            setError(null);

            const response = await egresosService.actualizarTipo(id, data);
            await cargarTipos();

            return response.data.tipo;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al actualizar tipo de egreso';
            setError(errorMsg);
            throw err;
        }
    }, [cargarTipos]);

    const cargarEgresos = useCallback(async (filtros?: FiltrosEgreso) => {
        try {
            setLoadingEgresos(true);
            setError(null);

            const response = await egresosService.listarEgresos(filtros);
            setEgresos(response.data.egresos || []);

            if (response.data.paginacion) {
                setPaginacion(response.data.paginacion);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar egresos';
            setError(errorMsg);
            setEgresos([]);
        } finally {
            setLoadingEgresos(false);
        }
    }, []);

    const cargarEgresoPorId = useCallback(async (id: number): Promise<Egreso | null> => {
        try {
            setLoadingEgresos(true);
            setError(null);

            const response = await egresosService.obtenerEgresoPorId(id);
            return response.data.egreso;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar egreso';
            setError(errorMsg);
            return null;
        } finally {
            setLoadingEgresos(false);
        }
    }, []);

    const crearEgreso = useCallback(async (data: any, comprobante?: File): Promise<Egreso> => {
        try {
            setError(null);

            const response = await egresosService.crearEgreso(data, comprobante);
            await cargarEgresos();

            return response.data.egreso;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al crear egreso';
            setError(errorMsg);
            throw err;
        }
    }, [cargarEgresos]);

    const verificarEgreso = useCallback(async (id: number): Promise<Egreso> => {
        try {
            setError(null);

            const response = await egresosService.verificarEgreso(id);
            await cargarEgresos();

            return response.data.egreso;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al verificar egreso';
            setError(errorMsg);
            throw err;
        }
    }, [cargarEgresos]);

    const anularEgreso = useCallback(async (id: number, motivo: string): Promise<Egreso> => {
        try {
            setError(null);

            const response = await egresosService.anularEgreso(id, { motivo });
            await cargarEgresos();

            return response.data.egreso;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al anular egreso';
            setError(errorMsg);
            throw err;
        }
    }, [cargarEgresos]);

    const cargarResumenCategorias = useCallback(async (filtros?: FiltrosResumenEgreso) => {
        try {
            setLoadingReportes(true);
            setError(null);

            const response = await egresosService.obtenerResumenPorCategoria(filtros);
            setResumenCategorias(response.data.resumen || []);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar resumen por categorías';
            setError(errorMsg);
            setResumenCategorias([]);
        } finally {
            setLoadingReportes(false);
        }
    }, []);

    const cargarResumenMetodosPago = useCallback(async (filtros?: FiltrosResumenEgreso) => {
        try {
            setLoadingReportes(true);
            setError(null);

            const response = await egresosService.obtenerResumenPorMetodoPago(filtros);
            setResumenMetodosPago(response.data.resumen || []);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar resumen por métodos de pago';
            setError(errorMsg);
            setResumenMetodosPago([]);
        } finally {
            setLoadingReportes(false);
        }
    }, []);

    const cargarEgresosDiarios = useCallback(async (filtros?: FiltrosResumenEgreso) => {
        try {
            setLoadingReportes(true);
            setError(null);

            const response = await egresosService.obtenerEgresosDiarios(filtros);
            setEgresosDiarios(response.data.egresos || []);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cargar egresos diarios';
            setError(errorMsg);
            setEgresosDiarios([]);
        } finally {
            setLoadingReportes(false);
        }
    }, []);

    const cargarEstadisticas = useCallback(async (filtros?: FiltrosResumenEgreso) => {
        try {
            setLoadingReportes(true);
            setError(null);

            const response = await egresosService.obtenerEstadisticas(filtros);
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
        if (loadEgresos) promises.push(cargarEgresos());
        if (loadEstadisticas) promises.push(cargarEstadisticas());

        await Promise.all(promises);
    }, [
        loadTipos,
        loadEgresos,
        loadEstadisticas,
        cargarTipos,
        cargarEgresos,
        cargarEstadisticas,
    ]);

    useEffect(() => {
        if (autoLoad) {
            refetch();
        }
    }, [autoLoad, refetch]);

    const obtenerTipoPorId = (id: number) => tipos.find((tipo) => tipo.id === id);
    const obtenerEgresoPorId = (id: number) => egresos.find((egreso) => egreso.id === id);

    return {
        tipos,
        egresos,
        resumenCategorias,
        resumenMetodosPago,
        egresosDiarios,
        estadisticas,

        loading,
        loadingTipos,
        loadingEgresos,
        loadingReportes,
        error,
        paginacion,

        cargarTipos,
        crearTipo,
        actualizarTipo,

        cargarEgresos,
        cargarEgresoPorId,
        crearEgreso,
        verificarEgreso,
        anularEgreso,

        cargarResumenCategorias,
        cargarResumenMetodosPago,
        cargarEgresosDiarios,
        cargarEstadisticas,

        refetch,
        obtenerTipoPorId,
        obtenerEgresoPorId,
    };
};