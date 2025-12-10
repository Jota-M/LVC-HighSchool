// hooks/useAcademicos.ts
import { useState, useEffect, useCallback } from 'react';
import academicosService, {
  PeriodoAcademico, Turno, NivelAcademico, Grado, Paralelo, Materia, GradoMateria
} from '../services/academicos';

interface UseAcademicosOptions {
  autoLoad?: boolean;
  loadPeriodos?: boolean;
  loadTurnos?: boolean;
  loadNiveles?: boolean;
  loadGrados?: boolean;
  loadParalelos?: boolean;
  loadMaterias?: boolean;
  loadGradoMaterias?: boolean;
}

interface UseAcademicosReturn {
  // Datos
  periodos: PeriodoAcademico[];
  periodoActivo: PeriodoAcademico | null;
  turnos: Turno[];
  niveles: NivelAcademico[];
  grados: Grado[];
  paralelos: Paralelo[];
  materias: Materia[];
  gradoMaterias: GradoMateria[];
  
  // Estados
  loading: boolean;
  loadingPeriodos: boolean;
  loadingTurnos: boolean;
  loadingNiveles: boolean;
  loadingGrados: boolean;
  loadingParalelos: boolean;
  loadingMaterias: boolean;
  loadingGradoMaterias: boolean;
  error: string | null;
  
  // Métodos
  refetch: () => Promise<void>;
  cargarPeriodos: () => Promise<void>;
  cargarPeriodoActivo: () => Promise<void>;
  cargarTurnos: () => Promise<void>;
  cargarNiveles: () => Promise<void>;
  cargarGrados: (nivelId?: number) => Promise<void>;
  cargarParalelos: (filters?: { grado_id?: number; turno_id?: number; anio?: number }) => Promise<void>;
  cargarMaterias: () => Promise<void>;
  cargarGradoMaterias: (gradoId?: number) => Promise<void>;
  
  // Utilidades
  obtenerGradoPorId: (id: number) => Grado | undefined;
  obtenerParaleloPorId: (id: number) => Paralelo | undefined;
  obtenerMateriaPorId: (id: number) => Materia | undefined;
  obtenerGradoMateriaPorId: (id: number) => GradoMateria | undefined;
}

export const useAcademicos = (options: UseAcademicosOptions = {}): UseAcademicosReturn => {
  const {
    autoLoad = true,
    loadPeriodos = true,
    loadTurnos = true,
    loadNiveles = true,
    loadGrados = true,
    loadParalelos = true,
    loadMaterias = true,
    loadGradoMaterias = true
  } = options;

  // Estados de datos
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAcademico | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [gradoMaterias, setGradoMaterias] = useState<GradoMateria[]>([]);

  // Estados de carga
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [loadingNiveles, setLoadingNiveles] = useState(false);
  const [loadingGrados, setLoadingGrados] = useState(false);
  const [loadingParalelos, setLoadingParalelos] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingGradoMaterias, setLoadingGradoMaterias] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = loadingPeriodos || loadingTurnos || loadingNiveles || 
                  loadingGrados || loadingParalelos || loadingMaterias || loadingGradoMaterias;

  // Cargar periodos
  const cargarPeriodos = useCallback(async () => {
    try {
      setLoadingPeriodos(true);
      setError(null);
      const response = await academicosService.listarPeriodos({ activo: true });
      setPeriodos(response.data.periodos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar periodos');
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  }, []);

  // Cargar periodo activo
  const cargarPeriodoActivo = useCallback(async () => {
    try {
      const response = await academicosService.obtenerPeriodoActivo();
      setPeriodoActivo(response.data.periodo || null);
    } catch (err: any) {
      console.error('Error al cargar periodo activo:', err);
      setPeriodoActivo(null);
    }
  }, []);

  // Cargar turnos
  const cargarTurnos = useCallback(async () => {
    try {
      setLoadingTurnos(true);
      setError(null);
      const response = await academicosService.listarTurnos({ activo: true });
      setTurnos(response.data.turnos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar turnos');
      setTurnos([]);
    } finally {
      setLoadingTurnos(false);
    }
  }, []);

  // Cargar niveles
  const cargarNiveles = useCallback(async () => {
    try {
      setLoadingNiveles(true);
      setError(null);
      const response = await academicosService.listarNiveles({ activo: true });
      setNiveles(response.data.niveles || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar niveles');
      setNiveles([]);
    } finally {
      setLoadingNiveles(false);
    }
  }, []);

  // Cargar grados
  const cargarGrados = useCallback(async (nivelId?: number) => {
    try {
      setLoadingGrados(true);
      setError(null);
      const params = nivelId ? { nivel_academico_id: nivelId, activo: true } : { activo: true };
      const response = await academicosService.listarGrados(params);
      setGrados(response.data.grados || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar grados');
      setGrados([]);
    } finally {
      setLoadingGrados(false);
    }
  }, []);

  // Cargar paralelos
  const cargarParalelos = useCallback(async (filters?: {
    grado_id?: number;
    turno_id?: number;
    anio?: number;
  }) => {
    try {
      setLoadingParalelos(true);
      setError(null);
      const response = await academicosService.listarParalelos({ ...filters, activo: true });
      setParalelos(response.data.paralelos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar paralelos');
      setParalelos([]);
    } finally {
      setLoadingParalelos(false);
    }
  }, []);

  // Cargar materias
  const cargarMaterias = useCallback(async () => {
    try {
      setLoadingMaterias(true);
      setError(null);
      const response = await academicosService.listarMaterias({ activo: true });
      setMaterias(response.data.materias || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar materias');
      setMaterias([]);
    } finally {
      setLoadingMaterias(false);
    }
  }, []);

  // Cargar grado-materias
  const cargarGradoMaterias = useCallback(async (gradoId?: number) => {
    try {
      setLoadingGradoMaterias(true);
      setError(null);
      
      const params = gradoId ? { grado_id: gradoId, activo: true } : { activo: true };
      const response = await academicosService.listarGradoMaterias(params);
      setGradoMaterias(response.data.grado_materias || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar grado-materias');
      setGradoMaterias([]);
    } finally {
      setLoadingGradoMaterias(false);
    }
  }, []);

  // Refetch todo
  const refetch = useCallback(async () => {
    const promises = [];
    if (loadPeriodos) promises.push(cargarPeriodos(), cargarPeriodoActivo());
    if (loadTurnos) promises.push(cargarTurnos());
    if (loadNiveles) promises.push(cargarNiveles());
    if (loadGrados) promises.push(cargarGrados());
    if (loadParalelos) promises.push(cargarParalelos());
    if (loadMaterias) promises.push(cargarMaterias());
    if (loadGradoMaterias) promises.push(cargarGradoMaterias());
    await Promise.all(promises);
  }, [
    loadPeriodos, loadTurnos, loadNiveles, loadGrados, loadParalelos, loadMaterias, loadGradoMaterias,
    cargarPeriodos, cargarPeriodoActivo, cargarTurnos, cargarNiveles, 
    cargarGrados, cargarParalelos, cargarMaterias, cargarGradoMaterias
  ]);

  // Auto-cargar
  useEffect(() => {
    if (autoLoad) refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // Utilidades
  const obtenerGradoPorId = (id: number) => grados.find(g => g.id === id);
  const obtenerParaleloPorId = (id: number) => paralelos.find(p => p.id === id);
  const obtenerMateriaPorId = (id: number) => materias.find(m => m.id === id);
  const obtenerGradoMateriaPorId = (id: number) => gradoMaterias.find(gm => gm.id === id);

  return {
    periodos,
    periodoActivo,
    turnos,
    niveles,
    grados,
    paralelos,
    materias,
    gradoMaterias,
    loading,
    loadingPeriodos,
    loadingTurnos,
    loadingNiveles,
    loadingGrados,
    loadingParalelos,
    loadingMaterias,
    loadingGradoMaterias,
    error,
    refetch,
    cargarPeriodos,
    cargarPeriodoActivo,
    cargarTurnos,
    cargarNiveles,
    cargarGrados,
    cargarParalelos,
    cargarMaterias,
    cargarGradoMaterias,
    obtenerGradoPorId,
    obtenerParaleloPorId,
    obtenerMateriaPorId,
    obtenerGradoMateriaPorId
  };
};