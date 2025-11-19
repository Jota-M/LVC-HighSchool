import { useState, useEffect, useCallback } from 'react';
import nivelesService, { 
  NivelAcademico, 
  Grado, 
  NivelFormData, 
  GradoFormData 
} from '../services/niveles';

interface UseNivelesOptions {
  autoLoad?: boolean;
  incluirGrados?: boolean;
}

interface UseNivelesReturn {
  niveles: NivelAcademico[];
  grados: Grado[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  
  // Métodos de Niveles
  crearNivel: (data: NivelFormData) => Promise<void>;
  actualizarNivel: (id: number, data: Partial<NivelFormData>) => Promise<void>;
  eliminarNivel: (id: number) => Promise<void>;
  
  // Métodos de Grados
  crearGrado: (data: GradoFormData) => Promise<void>;
  actualizarGrado: (id: number, data: Partial<GradoFormData>) => Promise<void>;
  eliminarGrado: (id: number) => Promise<void>;
}

export const useNiveles = (options: UseNivelesOptions = {}): UseNivelesReturn => {
  const { autoLoad = true, incluirGrados = true } = options;

  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar niveles y grados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (incluirGrados) {
        const nivelesConGrados = await nivelesService.obtenerNivelesConGrados();
        setNiveles(nivelesConGrados);
        
        // Extraer todos los grados
        const todosLosGrados = nivelesConGrados.flatMap(nivel => nivel.grados || []);
        setGrados(todosLosGrados);
      } else {
        const response = await nivelesService.listarNiveles();
        setNiveles(response.data.niveles);
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos';
      setError(errorMessage);
      console.error('Error fetching niveles:', err);
    } finally {
      setLoading(false);
    }
  }, [incluirGrados]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  // ============== MÉTODOS DE NIVELES ==============

  const crearNivel = async (data: NivelFormData) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.crearNivel(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear nivel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarNivel = async (id: number, data: Partial<NivelFormData>) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.actualizarNivel(id, data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar nivel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarNivel = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.eliminarNivel(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar nivel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============== MÉTODOS DE GRADOS ==============

  const crearGrado = async (data: GradoFormData) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.crearGrado(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear grado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarGrado = async (id: number, data: Partial<GradoFormData>) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.actualizarGrado(id, data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar grado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarGrado = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await nivelesService.eliminarGrado(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar grado';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    niveles,
    grados,
    loading,
    error,
    refetch: fetchData,
    crearNivel,
    actualizarNivel,
    eliminarNivel,
    crearGrado,
    actualizarGrado,
    eliminarGrado
  };
};