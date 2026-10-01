// hooks/usePeriodosPublicos.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PeriodoPublico {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface PeriodosData {
  periodos: PeriodoPublico[];
  periodoActivo: PeriodoPublico | null;
}

async function fetchPeriodosData(): Promise<PeriodosData> {
  const { data } = await api.get('/periodo-academico', {
    params: { limit: 50 },
  });

  const periodos: PeriodoPublico[] = data.data?.periodos ?? [];
  const periodoActivo =
    periodos.find((p) => p.activo) ?? (periodos.length > 0 ? periodos[0] : null);

  return { periodos, periodoActivo };
}

// ─────────────────────────────────────────────────
// HOOK principal
// ─────────────────────────────────────────────────
export const usePeriodosPublicos = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PeriodosData>({
    queryKey: ['periodos-academicos-lista'],
    queryFn: async () => {
      const res = await fetchPeriodosData();
      if (res.periodoActivo) {
        // Mantener sincronizado el periodo activo en caché global para otros componentes
        queryClient.setQueryData(['periodo-academico-activo'], res.periodoActivo);
      }
      return res;
    },
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 1,
  });

  // Si ya tenemos en caché el periodo activo de otra consulta (ej. dashboard docente home)
  const cachedPeriodoActivo = queryClient.getQueryData<PeriodoPublico | null>([
    'periodo-academico-activo',
  ]);

  const periodoActivo = data?.periodoActivo ?? cachedPeriodoActivo ?? null;
  const periodos = data?.periodos ?? (periodoActivo ? [periodoActivo] : []);

  return {
    periodos,
    periodoActivo,
    isLoading,
  };
};