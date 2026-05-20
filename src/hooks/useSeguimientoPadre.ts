// hooks/useSeguimientoPadre.ts
// Igual que usePadreAsistencia — recibe los IDs del hijo activo,
// NO los busca en el user del AuthContext.

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { acuseService } from '@/services/seguimientoPedagogicoService';
import { ObservacionHijo } from '@/types/seguimientoPadreTypes';

// =============================================
// HOOK: OBSERVACIONES DE UN HIJO ESPECÍFICO
// =============================================
// matriculaId     → hijoActivo.matricula_id
// padreFamiliaId  → hijoActivo.padre_familia_id
// Ambos vienen de useHijosDelPadre(), mismo patrón
// que useResumenAsistencia / useBoletinNotas.

export const useObservacionesHijo = (
  matriculaId:     number | null,
  padreFamiliaId:  number | null,
  periodoAcademicoId?: number
) => {
  const [observaciones, setObservaciones] = useState<ObservacionHijo[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [isAcusando, setIsAcusando]       = useState(false);
  const [noLeidas, setNoLeidas]           = useState(0);

  const cargar = useCallback(async () => {
    // Igual que los otros hooks del padre: si no hay IDs no hacemos nada
    if (!matriculaId || !padreFamiliaId) return;

    setIsLoading(true);
    try {
      const res = await acuseService.getObservacionesHijo(
        matriculaId,
        padreFamiliaId,
        periodoAcademicoId
      );
      setObservaciones(res.data.observaciones ?? []);
      setNoLeidas(res.data.no_leidas ?? 0);
    } catch {
      toast.error('Error al cargar observaciones');
      setObservaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [matriculaId, padreFamiliaId, periodoAcademicoId]);

  // Recargar cuando cambia el hijo activo
  useEffect(() => { cargar(); }, [cargar]);

  // Acusar recibo — actualiza localmente para respuesta inmediata en UI
  const acusarRecibo = useCallback(async (
    observacion_pedagogica_id: number,
    comentario?: string
  ): Promise<boolean> => {
    if (!padreFamiliaId) return false;

    setIsAcusando(true);
    try {
      await acuseService.registrar({
        observacion_pedagogica_id,
        padre_familia_id: padreFamiliaId,
        comentario_padre: comentario,
      });
      toast.success('Confirmado — el docente sabrá que lo leíste');

      // Actualizar estado local sin recargar todo
      setObservaciones(prev =>
        prev.map(o =>
          o.id === observacion_pedagogica_id
            ? {
                ...o,
                ya_leido:        true,
                fecha_lectura:   new Date().toISOString(),
                comentario_padre:comentario ?? o.comentario_padre,
              }
            : o
        )
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al confirmar lectura');
      return false;
    } finally {
      setIsAcusando(false);
    }
  }, [padreFamiliaId]);

  // Conteos para los chips de filtro
  const conteos = {
    total:              observaciones.length,
    no_leidas:          noLeidas,
    urgentes:           observaciones.filter(o => o.nivel_relevancia === 'urgente').length,
    requieren_atencion: observaciones.filter(o => o.nivel_relevancia === 'requiere_atencion').length,
    informativos:       observaciones.filter(o => o.nivel_relevancia === 'informativo').length,
  };

  return {
    observaciones,
    isLoading,
    isAcusando,
    conteos,
    acusarRecibo,
    refrescar: cargar,
  };
};