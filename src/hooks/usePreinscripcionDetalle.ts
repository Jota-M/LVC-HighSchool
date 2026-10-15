// hooks/usePreinscripcionDetalle.ts

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import preinscripcionService from '@/services/preinscripcionService';
import { PreInscripcionDetalle, EstadoPreInscripcion } from '@/types/preinscripcionTypes';

export const usePreinscripcionDetalle = (id: string | string[]) => {
  const router = useRouter();
  const [preinscripcion, setPreinscripcion] = useState<PreInscripcionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados de los pasos
  const [activeStep, setActiveStep] = useState(0);
  const [notasDocumentos, setNotasDocumentos] = useState('');
  const [notasVerificacionDatos, setNotasVerificacionDatos] = useState('');
  const [notasDecisionFinal, setNotasDecisionFinal] = useState('');
  const [decisionFinal, setDecisionFinal] = useState<EstadoPreInscripcion | ''>('');

  // 🆕 Estados para cupos
  const [cuposDisponibles, setCuposDisponibles] = useState<any[]>([]);
  const [cupoSeleccionado, setCupoSeleccionado] = useState<number | null>(null);
  const [verificandoCupo, setVerificandoCupo] = useState(false);

  // =============================================
  // DETERMINAR PASO SEGÚN ESTADO
  // =============================================
  const determinarPasoSegunEstado = (estado: EstadoPreInscripcion): number => {
    const estadoLower = estado?.toLowerCase();
    const mapeo: Record<string, number> = {
      'en_espera': 0,
      'datos_completos': 0,
      'en_revision': 0,
      'documentos_aprobados': 0,
      'documentos_pendientes': 0,
      'iniciada': 0,
      'entrevista_pendiente': 1,
      'entrevista_programada': 1,
      'entrevista_completada': 2,
      'aprobada': 2,
      'rechazada': 2,
    };
    return mapeo[estadoLower] || 0;
  };

  // =============================================
  // CARGAR PREINSCRIPCIÓN
  // =============================================
  const fetchPreinscripcion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const preId = Array.isArray(id) ? id[0] : id;
      const data = await preinscripcionService.obtenerPorId(parseInt(preId));
      setPreinscripcion(data);
      
      // Determinar paso activo según el estado
      const estadoPaso = determinarPasoSegunEstado(data.estado);
      setActiveStep(estadoPaso);
      
      // 🆕 Si ya tiene cupo asignado, establecerlo
      if (data.cupo_preinscripcion_id) {
        setCupoSeleccionado(data.cupo_preinscripcion_id);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar la preinscripción');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPreinscripcion();
    }
  }, [id, fetchPreinscripcion]);

  // =============================================
  // 🆕 VERIFICAR CUPOS DISPONIBLES
  // =============================================
  const verificarCuposDisponibles = useCallback(async () => {
    if (!preinscripcion?.grado_id || !preinscripcion?.turno_preferido_id || !preinscripcion?.periodo_academico_id) {
      return;
    }

    try {
      setVerificandoCupo(true);
      
      const response = await preinscripcionService.verificarDisponibilidad(
        preinscripcion.grado_id,
        preinscripcion.turno_preferido_id,
        preinscripcion.periodo_academico_id
      );

      if (response.data?.tiene_cupos && response.data?.cupo) {
        setCuposDisponibles([response.data.cupo]);
        
        // Si no tiene cupo asignado, seleccionar automáticamente el disponible
        if (!preinscripcion.tiene_cupo_asignado) {
          setCupoSeleccionado(response.data.cupo.id);
        }
      } else {
        setCuposDisponibles([]);
      }
    } catch (err: any) {
      console.error('Error al verificar cupos:', err);
    } finally {
      setVerificandoCupo(false);
    }
  }, [preinscripcion]);

  useEffect(() => {
    if (preinscripcion && activeStep === 2) {
      verificarCuposDisponibles();
    }
  }, [preinscripcion, activeStep, verificarCuposDisponibles]);

  // =============================================
  // CAMBIAR ESTADO
  // =============================================
  const cambiarEstado = useCallback(async (
    nuevoEstado: EstadoPreInscripcion,
    observaciones?: string,
    notificarWhatsapp: boolean = true
  ) => {
    if (!preinscripcion) return;

    try {
      await preinscripcionService.cambiarEstado(preinscripcion.id, {
        estado: nuevoEstado,
        observaciones,
        notificarWhatsapp,
      });
      
      await fetchPreinscripcion();
    } catch (err: any) {
      throw new Error(err.message || 'Error al cambiar estado');
    }
  }, [preinscripcion, fetchPreinscripcion]);

  // =============================================
  // REENVIAR NOTIFICACIÓN WHATSAPP
  // =============================================
  const reenviarWhatsApp = useCallback(async (observaciones?: string) => {
    if (!preinscripcion) return;

    try {
      const res = await preinscripcionService.reenviarWhatsApp(preinscripcion.id, observaciones);
      await fetchPreinscripcion();
      return res;
    } catch (err: any) {
      throw new Error(err.message || 'Error al reenviar mensaje de WhatsApp');
    }
  }, [preinscripcion, fetchPreinscripcion]);

  // =============================================
  // APROBAR DATOS PERSONALES
  // =============================================
  const aprobarDatos = useCallback(async () => {
    setSaving(true);
    try {
      await cambiarEstado('entrevista_pendiente', notasVerificacionDatos);
      setActiveStep(1);
    } catch (err: any) {
      alert(err.message || 'Error al aprobar datos');
    } finally {
      setSaving(false);
    }
  }, [notasVerificacionDatos, cambiarEstado]);

  // =============================================
  // RECHAZAR PREINSCRIPCIÓN
  // =============================================
  const rechazar = useCallback(async (motivo: string) => {
    setSaving(true);
    try {
      await cambiarEstado('rechazada', motivo);
      router.push('/dashboard/preinscripciones');
    } catch (err: any) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [cambiarEstado, router]);

  // =============================================
  // 🆕 CONFIRMAR DECISIÓN FINAL (CON CUPO)
  // =============================================
  const confirmarDecision = useCallback(async () => {
    if (!decisionFinal) {
      throw new Error('Debe seleccionar una decisión final');
    }

    if (decisionFinal === 'aprobada' && !preinscripcion?.tiene_cupo_asignado && cuposDisponibles.length === 0) {
      throw new Error('No hay cupos disponibles. No se puede aprobar sin un cupo asignado.');
    }

    setSaving(true);
    try {
      await cambiarEstado(decisionFinal, notasDecisionFinal);
      router.push('/dashboard/preinscripciones');
    } catch (err: any) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [decisionFinal, preinscripcion, cuposDisponibles, notasDecisionFinal, cambiarEstado, router]);

  // =============================================
  // PROMOVER DE LISTA DE ESPERA
  // =============================================
  const promoverEspera = useCallback(async (motivo?: string) => {
    if (!preinscripcion) return;
    setSaving(true);
    try {
      await preinscripcionService.promoverDeListaEspera(preinscripcion.id, motivo);
      await fetchPreinscripcion();
    } catch (err: any) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [preinscripcion, fetchPreinscripcion]);

  return {
    preinscripcion,
    loading,
    error,
    saving,
    activeStep,
    setActiveStep,
    
    // Notas
    notasVerificacionDatos,
    setNotasVerificacionDatos,
    notasDecisionFinal,
    setNotasDecisionFinal,
    
    // Decisión final
    decisionFinal,
    setDecisionFinal,
    
    // 🆕 Cupos
    cuposDisponibles,
    cupoSeleccionado,
    setCupoSeleccionado,
    verificandoCupo,
    verificarCuposDisponibles,
    
    // Acciones
    aprobarDatos,
    cambiarEstado,
    reenviarWhatsApp,
    rechazar,
    confirmarDecision,
    promoverEspera,
    fetchPreinscripcion,
  };
};