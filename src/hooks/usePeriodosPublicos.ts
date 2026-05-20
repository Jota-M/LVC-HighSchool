// hooks/usePeriodosPublicos.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PeriodoPublico {
  id: number;
  nombre: string;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

// ─────────────────────────────────────────────────
// ESTRATEGIA:
// Intenta los endpoints en orden hasta que uno
// responda 200. Así funciona para cualquier rol.
// ─────────────────────────────────────────────────

async function fetchPeriodoActivo(): Promise<PeriodoPublico | null> {
  // Opción A: endpoint dedicado para periodo activo (más limpio)
  try {
    const { data } = await api.get('/periodo-academico/publico/activo');
    return data.data.periodo ?? data.data ?? null;
  } catch {}

  // Opción B: el perfil del usuario ya trae el periodo activo
  try {
    const { data } = await api.get('/auth/me');
    const periodo = data.data?.periodo_activo ?? data.data?.user?.periodo_activo;
    if (periodo) return periodo;
  } catch {}

  // Opción C: endpoint estándar (puede fallar con 403 para roles bajos)
  try {
    const { data } = await api.get('/periodo-academico/activo');
    return data.data.periodo ?? data.data ?? null;
  } catch {}

  return null;
}

async function fetchPeriodos(): Promise<PeriodoPublico[]> {
  // Opción A: endpoint público de lista
  try {
    const { data } = await api.get('/periodo-academico/publico');
    return data.data.periodos ?? data.data ?? [];
  } catch {}

  // Opción B: endpoint estándar con activo=true
  try {
    const { data } = await api.get('/periodo-academico', {
      params: { activo: true },
    });
    return data.data.periodos ?? data.data ?? [];
  } catch {}

  return [];
}

// ─────────────────────────────────────────────────
// HOOK principal
// ─────────────────────────────────────────────────
export const usePeriodosPublicos = () => {
  const { data: periodoActivo, isLoading: loadingActivo } = useQuery<PeriodoPublico | null>({
    queryKey: ['periodo-activo-publico'],
    queryFn: fetchPeriodoActivo,
    staleTime: 1000 * 60 * 10,
    retry: false, // no reintentar 403
  });

  const { data: periodos, isLoading: loadingLista } = useQuery<PeriodoPublico[]>({
    queryKey: ['periodos-publicos'],
    queryFn: fetchPeriodos,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // Si la lista falla pero tenemos el activo, lo usamos como lista
  const periodosList: PeriodoPublico[] =
    periodos && periodos.length > 0
      ? periodos
      : periodoActivo
      ? [periodoActivo]
      : [];

  return {
    periodos: periodosList,
    periodoActivo: periodoActivo ?? null,
    isLoading: loadingActivo || loadingLista,
  };
};