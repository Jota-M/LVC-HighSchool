// hooks/useDocentePerfil.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DocentePerfil {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
  email?: string;
  foto_url?: string;
  especialidad?: string;
}

async function fetchDocentePerfil(): Promise<DocentePerfil> {
  const { data } = await api.get('/docentes/mi-perfil');
  return data.data.docente;
}

export function useDocentePerfil() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['docente-mi-perfil'],
    queryFn: fetchDocentePerfil,
    staleTime: 1000 * 60 * 10, // 10 min — el perfil casi nunca cambia
    retry: 1,
  });

  return {
    docente: data ?? null,
    docenteId: data?.id ?? null, // ← esto es lo que necesitaba la página
    isLoadingPerfil: isLoading,
    errorPerfil: error,
  };
}