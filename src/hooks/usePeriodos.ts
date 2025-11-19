import { useState, useEffect, useCallback } from 'react';
import periodosService, { PeriodoAcademico, PeriodoFormData } from '../services/periodos';

interface UsePeriodosOptions {
  autoLoad?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  cerrado?: boolean;
}

interface UsePeriodosReturn {
  periodos: PeriodoAcademico[];
  periodoActivo: PeriodoAcademico | null;
  loading: boolean;
  error: string | null;
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  refetch: () => Promise<void>;
  crear: (data: PeriodoFormData) => Promise<void>;
  actualizar: (id: number, data: Partial<PeriodoFormData>) => Promise<void>;
  eliminar: (id: number) => Promise<void>;
  cerrar: (id: number) => Promise<void>;
  activar: (id: number) => Promise<void>;
}

export const usePeriodos = (options: UsePeriodosOptions = {}): UsePeriodosReturn => {

  const {
    autoLoad = true,
    page = 1,
    limit = 10,
    search,
    activo,
    cerrado
  } = options;

  // Estados
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAcademico | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [paginacion, setPaginacion] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // ------------------------------------------------
  // Cargar periodos
  // ------------------------------------------------
  const fetchPeriodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await periodosService.listar({
        page,
        limit,
        search,
        activo,
        cerrado
      });

      console.log("response listar()", response);

      const fetchedPeriodos = response.data?.periodos || [];
      const fetchedPaginacion = response.data?.paginacion || { total: 0, page, limit, totalPages: 0 };

      setPeriodos(fetchedPeriodos);
      setPaginacion(fetchedPaginacion);

      // cargar activo
      const active = await periodosService.obtenerActivo();
      setPeriodoActivo(active || null);

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al cargar periodos";
      setError(msg);
      console.error("Error fetching periodos:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activo, cerrado]);

  // autocarga
  useEffect(() => {
    if (autoLoad) fetchPeriodos();
  }, [autoLoad, fetchPeriodos]);

  // ------------------------------------------------
  // Crear periodo
  // ------------------------------------------------
  const crear = async (data: PeriodoFormData) => {
    try {
      setLoading(true);
      setError(null);

      await periodosService.crear(data);
      await fetchPeriodos();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al crear periodo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Actualizar periodo
  // ------------------------------------------------
  const actualizar = async (id: number, data: Partial<PeriodoFormData>) => {
    try {
      setLoading(true);
      setError(null);

      await periodosService.actualizar(id, data);
      await fetchPeriodos();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al actualizar periodo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Eliminar periodo
  // ------------------------------------------------
  const eliminar = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      await periodosService.eliminar(id);
      await fetchPeriodos();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al eliminar periodo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Cerrar periodo
  // ------------------------------------------------
  const cerrar = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      await periodosService.cerrar(id);
      await fetchPeriodos();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al cerrar periodo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Activar periodo (el backend activa uno y desactiva el resto)
  // ------------------------------------------------
  const activar = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      await periodosService.activar(id); // llamado correcto
      await fetchPeriodos();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al activar periodo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Retorno final del hook
  // ------------------------------------------------
  return {
    periodos,
    periodoActivo,
    loading,
    error,
    paginacion,
    refetch: fetchPeriodos,
    crear,
    actualizar,
    eliminar,
    cerrar,
    activar
  };
};
