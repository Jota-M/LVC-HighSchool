import { useState, useEffect, useCallback } from 'react';
import materiasService, {
  AreaConocimiento,
  Materia,
  AreaFormData,
  MateriaFormData,
  GradoMateriaFormData
} from '../services/materias';

interface UseMateriasOptions {
  autoLoad?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  area_conocimiento_id?: number;
  activo?: boolean;
}

interface UseMateriasReturn {
  // Áreas
  areas: AreaConocimiento[];
  
  // Materias
  materias: Materia[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Métodos
  refetch: () => Promise<void>;
  
  // Áreas
  crearArea: (data: AreaFormData) => Promise<void>;
  actualizarArea: (id: number, data: Partial<AreaFormData>) => Promise<void>;
  eliminarArea: (id: number) => Promise<void>;
  
  // Materias
  crearMateria: (data: MateriaFormData) => Promise<void>;
  actualizarMateria: (id: number, data: Partial<MateriaFormData>) => Promise<void>;
  eliminarMateria: (id: number) => Promise<void>;
  
  // Prerequisitos
  agregarPrerequisito: (materia_id: number, prerequisito_id: number) => Promise<void>;
  eliminarPrerequisito: (materia_id: number, prerequisito_id: number) => Promise<void>;
  
  // Asignaciones
  asignarMateriaGrado: (data: GradoMateriaFormData) => Promise<void>;
  removerMateriaGrado: (id: number) => Promise<void>;
}

export const useMaterias = (options: UseMateriasOptions = {}): UseMateriasReturn => {
  const {
    autoLoad = true,
    page = 1,
    limit = 10,
    search,
    area_conocimiento_id,
    activo
  } = options;

  const [areas, setAreas] = useState<AreaConocimiento[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  // En hooks/useMaterias.ts

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    // Cargar áreas
    const areasRes = await materiasService.listarAreas();
    setAreas(areasRes.data.areas);

    // Cargar materias
    const materiasRes = await materiasService.listarMaterias({
      page,
      limit,
      search,
      area_conocimiento_id,
      activo
    });

    // ADAPTAR LA RESPUESTA ✅
    // Si la respuesta es un array directo
    if (Array.isArray(materiasRes)) {
      setMaterias(materiasRes);
      setPaginacion({
        total: materiasRes.length,
        page: 1,
        limit: materiasRes.length,
        totalPages: 1
      });
    } else {
      // Si tiene la estructura esperada
      setMaterias(materiasRes.data.materias);
      setPaginacion(materiasRes.data.paginacion);
    }

  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos';
    setError(errorMessage);
    console.error('Error fetching materias:', err);
  } finally {
    setLoading(false);
  }
}, [page, limit, search, area_conocimiento_id, activo]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  // ============== MÉTODOS DE ÁREAS ==============

  const crearArea = async (data: AreaFormData) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.crearArea(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarArea = async (id: number, data: Partial<AreaFormData>) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.actualizarArea(id, data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarArea = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.eliminarArea(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============== MÉTODOS DE MATERIAS ==============

  const crearMateria = async (data: MateriaFormData) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.crearMateria(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear materia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarMateria = async (id: number, data: Partial<MateriaFormData>) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.actualizarMateria(id, data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar materia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarMateria = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.eliminarMateria(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar materia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============== PREREQUISITOS ==============

  const agregarPrerequisito = async (materia_id: number, prerequisito_id: number) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.agregarPrerequisito(materia_id, prerequisito_id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al agregar prerequisito';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarPrerequisito = async (materia_id: number, prerequisito_id: number) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.eliminarPrerequisito(materia_id, prerequisito_id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar prerequisito';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============== ASIGNACIONES ==============

  const asignarMateriaGrado = async (data: GradoMateriaFormData) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.asignarMateriaGrado(data);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al asignar materia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removerMateriaGrado = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await materiasService.removerMateriaGrado(id);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al remover materia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    areas,
    materias,
    paginacion,
    loading,
    error,
    refetch: fetchData,
    crearArea,
    actualizarArea,
    eliminarArea,
    crearMateria,
    actualizarMateria,
    eliminarMateria,
    agregarPrerequisito,
    eliminarPrerequisito,
    asignarMateriaGrado,
    removerMateriaGrado
  };
};