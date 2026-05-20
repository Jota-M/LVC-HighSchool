// hooks/usePadreTareas.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { getTareas } from '@/services/padreTareasService';
import type {
  TareaHijo, ResumenTareas, FiltrosTareas, EstadoTarea,
} from '@/types/padreTareasTypes';
import type { HijoInfo } from '@/types/padreAsistenciaTypes';

export const useTareasHijo = (hijo: HijoInfo | null) => {
  const [todas, setTodas]           = useState<TareaHijo[]>([]);
  const [resumen, setResumen]       = useState<ResumenTareas>({ total: 0, entregados: 0, pendientes: 0, atrasados: 0, ausentes: 0 });
  const [filtros, setFiltros]       = useState<FiltrosTareas>({});
  const [isLoading, setIsLoading]   = useState(false);

  const cargar = useCallback(async (opts?: { periodo_evaluacion_id?: number | null }) => {
    if (!hijo?.matricula_id) return;
    setIsLoading(true);
    try {
      const res = await getTareas(hijo.matricula_id, {
        periodo_evaluacion_id: opts?.periodo_evaluacion_id ?? filtros.periodo_evaluacion_id,
      });
      setTodas(res.data.tareas);
      setResumen(res.data.resumen);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Error al cargar las tareas');
      }
      setTodas([]);
      setResumen({ total: 0, entregados: 0, pendientes: 0, atrasados: 0, ausentes: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [hijo?.matricula_id, filtros.periodo_evaluacion_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizarFiltros = useCallback((nuevos: Partial<FiltrosTareas>) => {
    setFiltros(prev => ({ ...prev, ...nuevos }));
  }, []);

  // Filtros aplicados en el frontend (estado, materia, búsqueda)
  const tareasFiltradas = useMemo(() => {
    let lista = [...todas];

    if (filtros.estado) {
      lista = lista.filter(t => t.estado_calculado === filtros.estado);
    }
    if (filtros.materia) {
      lista = lista.filter(t => t.materia_nombre === filtros.materia);
    }
    if (filtros.busqueda?.trim()) {
      const b = filtros.busqueda.toLowerCase();
      lista = lista.filter(t =>
        t.evaluacion_nombre.toLowerCase().includes(b) ||
        t.materia_nombre.toLowerCase().includes(b)
      );
    }

    return lista;
  }, [todas, filtros]);

  // Materias únicas para el selector
  const materias = useMemo(
    () => [...new Set(todas.map(t => t.materia_nombre))].sort(),
    [todas]
  );

  return {
    tareas: tareasFiltradas,
    resumen,
    filtros,
    isLoading,
    materias,
    actualizarFiltros,
    cargar,
    refrescar: () => cargar(),
  };
};