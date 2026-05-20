// hooks/useHorarioDocente.ts
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import horarioService from '@/services/horarioService';
import type { HorarioDetalle } from '@/types/horariotypes';

// =============================================
// HOOK: Horario semanal de un docente
// =============================================
export const useHorarioDocente = (
  docenteId: number | null,
  periodoId: number | null,
  estado = 'publicado'
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['horario-docente', docenteId, periodoId, estado],
    queryFn: () => horarioService.horarioDocente(docenteId!, periodoId!, estado),
    enabled: !!docenteId && !!periodoId,
    staleTime: 1000 * 60 * 5,
  });

  // ── Derivados útiles desde el detalle plano ──

  const celdas: HorarioDetalle[] = data ?? [];

  // Días únicos que tiene el docente (ordenados)
  const diasConClases = [...new Set(celdas.map((c) => c.dia_semana))].sort((a, b) => a - b);

  // Bloques únicos reconstruidos desde las celdas (ordenados por numero)
  const bloquesUnicos = [
    ...new Map(
      celdas.map((c) => [
        c.bloque_horario_id,
        {
          id: c.bloque_horario_id,
          nombre: c.bloque_nombre,
          numero: c.bloque_numero,
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin,
          es_recreo: false, // el endpoint de docente no incluye recreos
        },
      ])
    ).values(),
  ].sort((a, b) => a.numero - b.numero);

  // Materias únicas para leyenda
  const materiasUnicas = [
    ...new Map(
      celdas.map((c) => [
        c.materia_id,
        { id: c.materia_id, nombre: c.materia_nombre, color: c.materia_color },
      ])
    ).values(),
  ];

  // Total de horas semanales
  const totalHoras = celdas.length;

  return {
    celdas,
    isLoading,
    error,
    refetch,
    diasConClases,
    bloquesUnicos,
    materiasUnicas,
    totalHoras,
  };
};

// =============================================
// HOOK: Horario de un paralelo (para padre/estudiante)
// =============================================
export const useHorarioParalelo = (
  paraleloId: number | null,
  periodoId: number | null,
  estado = 'publicado'
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['horario-paralelo-publico', paraleloId, periodoId, estado],
    queryFn: () => horarioService.horarioParalelo(paraleloId!, periodoId!, estado),
    enabled: !!paraleloId && !!periodoId,
    staleTime: 1000 * 60 * 5,
  });

  const celdas: HorarioDetalle[] = data ?? [];

  const bloquesUnicos = [
    ...new Map(
      celdas.map((c) => [
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

  const diasConClases = [...new Set(celdas.map((c) => c.dia_semana))].sort((a, b) => a - b);

  return { celdas, bloquesUnicos, diasConClases, isLoading, error, refetch };
};