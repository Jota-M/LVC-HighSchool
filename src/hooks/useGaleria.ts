// hooks/useGaleria.ts
import { useState, useEffect, useCallback } from 'react';
import galeriaService from '../services/galeriaService';
import type {
    FotoGaleria,
    FiltrosGaleria,
    CrearFotoDTO,
    ActualizarFotoDTO,
} from '../types/galeriaTypes';

interface UseGaleriaOptions extends FiltrosGaleria {
    autoLoad?: boolean;
}

interface UseGaleriaReturn {
    fotos: FotoGaleria[];
    vigentes: FotoGaleria[];
    loading: boolean;
    loadingVigentes: boolean;
    error: string | null;
    total: number;
    page: number;
    limit: number;
    totalPaginas: number;
    filtros: FiltrosGaleria;
    setFiltros: (filtros: FiltrosGaleria | ((prev: FiltrosGaleria) => FiltrosGaleria)) => void;
    refetch: () => Promise<void>;
    fetchVigentes: () => Promise<void>;
    crearFoto: (data: CrearFotoDTO) => Promise<FotoGaleria>;
    actualizarFoto: (id: number, data: ActualizarFotoDTO) => Promise<FotoGaleria>;
    toggleActivo: (id: number) => Promise<FotoGaleria>;
    eliminarFoto: (id: number) => Promise<void>;
    cambiarPagina: (newPage: number) => void;
}

export const useGaleria = (options: UseGaleriaOptions = {}): UseGaleriaReturn => {
    const {
        autoLoad = true,
        activo: initialActivo,
        vigente: initialVigente,
        page: initialPage = 1,
        limit: initialLimit = 12,
    } = options;

    const [filtros, setFiltros] = useState<FiltrosGaleria>({
        activo: initialActivo,
        vigente: initialVigente,
        page: initialPage,
        limit: initialLimit,
    });

    const [fotos, setFotos] = useState<FotoGaleria[]>([]);
    const [vigentes, setVigentes] = useState<FotoGaleria[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loading, setLoading] = useState(autoLoad);
    const [loadingVigentes, setLoadingVigentes] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFotos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await galeriaService.listar(filtros);
            if (res.success && res.data) {
                setFotos(res.data.fotos || []);
                setTotal(res.data.total || 0);
                setTotalPaginas(res.data.total_paginas || 1);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar la galería institucional');
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const fetchVigentes = useCallback(async () => {
        setLoadingVigentes(true);
        try {
            const res = await galeriaService.vigentes();
            if (res.success && res.data) {
                setVigentes(res.data.fotos || []);
            }
        } catch (err: any) {
            console.error('Error al cargar fotos vigentes:', err);
        } finally {
            setLoadingVigentes(false);
        }
    }, []);

    useEffect(() => {
        if (autoLoad) {
            fetchFotos();
        }
    }, [autoLoad, fetchFotos]);

    const crearFoto = useCallback(
        async (data: CrearFotoDTO) => {
            const res = await galeriaService.crear(data);
            await fetchFotos();
            return res.data.foto;
        },
        [fetchFotos]
    );

    const actualizarFoto = useCallback(
        async (id: number, data: ActualizarFotoDTO) => {
            const res = await galeriaService.actualizar(id, data);
            await fetchFotos();
            return res.data.foto;
        },
        [fetchFotos]
    );

    const toggleActivo = useCallback(
        async (id: number) => {
            const res = await galeriaService.toggleActivo(id);
            await fetchFotos();
            return res.data.foto;
        },
        [fetchFotos]
    );

    const eliminarFoto = useCallback(
        async (id: number) => {
            await galeriaService.eliminar(id);
            await fetchFotos();
        },
        [fetchFotos]
    );

    const cambiarPagina = useCallback((newPage: number) => {
        setFiltros((prev) => ({ ...prev, page: newPage }));
    }, []);

    return {
        fotos,
        vigentes,
        loading,
        loadingVigentes,
        error,
        total,
        page: filtros.page || 1,
        limit: filtros.limit || 12,
        totalPaginas,
        filtros,
        setFiltros,
        refetch: fetchFotos,
        fetchVigentes,
        crearFoto,
        actualizarFoto,
        toggleActivo,
        eliminarFoto,
        cambiarPagina,
    };
};

export default useGaleria;
