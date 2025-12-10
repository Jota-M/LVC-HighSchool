import { useState, useEffect, useCallback } from 'react';
import planEstudiosService, {
  GradoMateria,
  AsignacionFormData,
  AsignacionUpdateData,
  MateriaDisponible
} from '../services/planEstudios';
import nivelesService, { Grado, NivelAcademico } from '../services/niveles';

interface UsePlanEstudiosOptions {
  gradoId?: number;
  autoLoad?: boolean;
}

interface UsePlanEstudiosReturn {
  // Datos
  niveles: NivelAcademico[];
  grados: Grado[];
  materiasAsignadas: GradoMateria[];
  materiasDisponibles: MateriaDisponible[];
  gradoSeleccionado: Grado | null;
  
  // Resumen
  resumen: {
    total_materias: number;
    total_horas: number;
    total_creditos: number;
    materias_obligatorias: number;
    materias_electivas: number;
  };
  
  // Estados
  loading: boolean;
  loadingMaterias: boolean;
  error: string | null;
  
  // Métodos de selección
  seleccionarGrado: (grado: Grado) => void;
  
  // Métodos CRUD
  asignarMateria: (data: AsignacionFormData) => Promise<void>;
  asignarMultiples: (materiaIds: number[]) => Promise<void>;
  actualizarAsignacion: (id: number, data: AsignacionUpdateData) => Promise<void>;
  removerMateria: (id: number) => Promise<void>;
  reordenarMaterias: (materiaIds: number[]) => Promise<void>;
  copiarPlanEstudios: (gradoOrigenId: number) => Promise<void>;
  
  // Refetch
  refetch: () => Promise<void>;
  refetchMaterias: () => Promise<void>;
}

export const usePlanEstudios = (options: UsePlanEstudiosOptions = {}): UsePlanEstudiosReturn => {
  const { gradoId, autoLoad = true } = options;

  // Estados principales
  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState<Grado | null>(null);
  const [materiasAsignadas, setMateriasAsignadas] = useState<GradoMateria[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<MateriaDisponible[]>([]);
  
  // Resumen
  const [resumen, setResumen] = useState({
    total_materias: 0,
    total_horas: 0,
    total_creditos: 0,
    materias_obligatorias: 0,
    materias_electivas: 0
  });

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar niveles y grados
  const fetchNivelesYGrados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [nivelesRes, gradosRes] = await Promise.all([
        nivelesService.listarNiveles({ activo: true }),
        nivelesService.listarGrados({ activo: true })
      ]);

      setNiveles(nivelesRes.data.niveles);
      setGrados(gradosRes.data.grados);

      // Si hay gradoId inicial, seleccionarlo
      if (gradoId) {
        const grado = gradosRes.data.grados.find(g => g.id === gradoId);
        if (grado) setGradoSeleccionado(grado);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [gradoId]);

  // Cargar materias del grado seleccionado
  const fetchMateriasGrado = useCallback(async () => {
    if (!gradoSeleccionado) {
      setMateriasAsignadas([]);
      setMateriasDisponibles([]);
      setResumen({ total_materias: 0, total_horas: 0, total_creditos: 0, materias_obligatorias: 0, materias_electivas: 0 });
      return;
    }

    try {
      setLoadingMaterias(true);
      setError(null);

      const [asignadas, disponibles, resumenData] = await Promise.all([
        planEstudiosService.obtenerMateriasPorGrado(gradoSeleccionado.id),
        planEstudiosService.obtenerMateriasDisponibles(gradoSeleccionado.id),
        planEstudiosService.obtenerResumenGrado(gradoSeleccionado.id)
      ]);

      setMateriasAsignadas(asignadas);
      setMateriasDisponibles(disponibles);
      setResumen(resumenData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar materias');
    } finally {
      setLoadingMaterias(false);
    }
  }, [gradoSeleccionado]);

  // Auto-cargar
  useEffect(() => {
    if (autoLoad) fetchNivelesYGrados();
  }, [autoLoad, fetchNivelesYGrados]);

  // Cargar materias cuando cambia el grado
  useEffect(() => {
    fetchMateriasGrado();
  }, [fetchMateriasGrado]);

  // Seleccionar grado
  const seleccionarGrado = (grado: Grado) => {
    setGradoSeleccionado(grado);
  };

  // Asignar materia
  const asignarMateria = async (data: AsignacionFormData) => {
    try {
      setLoadingMaterias(true);
      await planEstudiosService.asignarMateria(data);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar materia');
      throw err;
    } finally {
      setLoadingMaterias(false);
    }
  };

  // Asignar múltiples
  const asignarMultiples = async (materiaIds: number[]) => {
    if (!gradoSeleccionado) return;
    
    try {
      setLoadingMaterias(true);
      await planEstudiosService.asignarMultiplesMaterias(gradoSeleccionado.id, materiaIds);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar materias');
      throw err;
    } finally {
      setLoadingMaterias(false);
    }
  };

  // Actualizar asignación
  const actualizarAsignacion = async (id: number, data: AsignacionUpdateData) => {
    try {
      setLoadingMaterias(true);
      await planEstudiosService.actualizarAsignacion(id, data);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
      throw err;
    } finally {
      setLoadingMaterias(false);
    }
  };

  // Remover materia
  const removerMateria = async (id: number) => {
    try {
      setLoadingMaterias(true);
      await planEstudiosService.removerMateria(id);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al remover materia');
      throw err;
    } finally {
      setLoadingMaterias(false);
    }
  };

  // Reordenar
  const reordenarMaterias = async (materiaIds: number[]) => {
    if (!gradoSeleccionado) return;
    
    try {
      await planEstudiosService.reordenarMaterias(gradoSeleccionado.id, materiaIds);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reordenar');
      throw err;
    }
  };

  // Copiar plan de estudios
  const copiarPlanEstudios = async (gradoOrigenId: number) => {
    if (!gradoSeleccionado) return;
    
    try {
      setLoadingMaterias(true);
      await planEstudiosService.copiarPlanEstudios(gradoOrigenId, gradoSeleccionado.id);
      await fetchMateriasGrado();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al copiar plan');
      throw err;
    } finally {
      setLoadingMaterias(false);
    }
  };

  return {
    niveles,
    grados,
    materiasAsignadas,
    materiasDisponibles,
    gradoSeleccionado,
    resumen,
    loading,
    loadingMaterias,
    error,
    seleccionarGrado,
    asignarMateria,
    asignarMultiples,
    actualizarAsignacion,
    removerMateria,
    reordenarMaterias,
    copiarPlanEstudios,
    refetch: fetchNivelesYGrados,
    refetchMaterias: fetchMateriasGrado
  };
};