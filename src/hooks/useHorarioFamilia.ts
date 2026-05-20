// hooks/useHorarioFamilia.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { HorarioDetalle } from '@/types/horariotypes';
import { useHorarioParalelo } from '@/hooks/useHorarioDocente';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface HijoResumen {
  apellidos: any;
  estudiante_id: number;
  codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_url: string | null;
  fecha_nacimiento: string;
  matricula_id: number | null;
  paralelo_id: number | null;
  paralelo_nombre: string | null;
  grado_nombre: string | null;
  nivel_nombre: string | null;
  turno_nombre: string | null;
  aula: string | null;
  estado_matricula: string | null;
  es_becado: boolean;
  es_repitente: boolean;
}

// ─────────────────────────────────────────────
// HOOK: Hijos del padre autenticado
// GET /padre/hijos — el JWT identifica al padre,
// no hace falta ID en la URL
// ─────────────────────────────────────────────
export const useHijosPadre = (periodoId: number | null) => {
  const { data, isLoading, error, refetch } = useQuery<HijoResumen[]>({
    queryKey: ['hijos-padre', periodoId],
    queryFn: async () => {
  const { data } = await api.get('/padre/hijos', {
    params: periodoId ? { periodo_academico_id: periodoId } : undefined,
  });
  console.log('🔍 /padre/hijos raw response:', JSON.stringify(data, null, 2));
  return data.data?.hijos ?? data.data ?? [];
},
    enabled: !!periodoId,
    staleTime: 1000 * 60 * 5,
  });

  return { hijos: data ?? [], isLoading, error, refetch };
};

// ─────────────────────────────────────────────
// HOOK: Horario de un estudiante (vía paralelo)
// ─────────────────────────────────────────────
export const useHorarioEstudiante = (
  paraleloId: number | null,
  periodoId: number | null
) => {
  const result = useHorarioParalelo(paraleloId, periodoId, 'publicado');

  const bloquesConRecreos = [
    ...new Map(
      result.celdas.map((c) => [
        c.bloque_horario_id,
        {
          id: c.bloque_horario_id,
          nombre: c.bloque_nombre,
          numero: c.bloque_numero,
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin,
          es_recreo: c.es_recreo,
        },
      ])
    ).values(),
  ].sort((a, b) => a.numero - b.numero);

  const materiasUnicas = [
    ...new Map(
      result.celdas
        .filter((c) => !c.es_recreo)
        .map((c) => [
          c.materia_id,
          { id: c.materia_id, nombre: c.materia_nombre, color: c.materia_color },
        ])
    ).values(),
  ];

  return {
    ...result,
    bloques: bloquesConRecreos,
    materiasUnicas,
    totalHoras: result.celdas.filter((c) => !c.es_recreo).length,
  };
};