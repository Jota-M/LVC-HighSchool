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
      'datos_completos': 0,
      'documentos_pendientes': 0,
      'en_revision': 0,
      'documentos_aprobados': 1,
      'entrevista_pendiente': 2,
      'entrevista_programada': 2,
      'entrevista_completada': 3,
      'aprobada': 3,
      'rechazada': 3,
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
    if (preinscripcion && activeStep === 3) {
      verificarCuposDisponibles();
    }
  }, [preinscripcion, activeStep, verificarCuposDisponibles]);

  // =============================================
  // CAMBIAR ESTADO
  // =============================================
  const cambiarEstado = useCallback(async (
    nuevoEstado: EstadoPreInscripcion,
    observaciones?: string
  ) => {
    if (!preinscripcion) return;

    try {
      await preinscripcionService.cambiarEstado(preinscripcion.id, {
        estado: nuevoEstado,
        observaciones,
      });
      
      await fetchPreinscripcion();
    } catch (err: any) {
      throw new Error(err.message || 'Error al cambiar estado');
    }
  }, [preinscripcion, fetchPreinscripcion]);

  // =============================================
  // APROBAR DOCUMENTOS
  // =============================================
  const aprobarDocumentos = useCallback(async () => {
    setSaving(true);
    try {
      await cambiarEstado('documentos_aprobados', notasDocumentos);
      setActiveStep(1);
    } catch (err: any) {
      alert(err.message || 'Error al aprobar documentos');
    } finally {
      setSaving(false);
    }
  }, [notasDocumentos, cambiarEstado]);

  // =============================================
  // SOLICITAR CORRECCIÓN DE DOCUMENTOS
  // =============================================
  const solicitarDocumentos = useCallback(async (observaciones: string) => {
    setSaving(true);
    try {
      await cambiarEstado('documentos_pendientes', observaciones);
      alert('✅ Se ha solicitado corrección de documentos. Se notificará al padre de familia.');
      await fetchPreinscripcion();
    } catch (err: any) {
      alert(err.message || 'Error al solicitar documentos');
    } finally {
      setSaving(false);
    }
  }, [cambiarEstado, fetchPreinscripcion]);

  // =============================================
  // APROBAR DATOS PERSONALES
  // =============================================
  const aprobarDatos = useCallback(async () => {
    setSaving(true);
    try {
      await cambiarEstado('entrevista_pendiente', notasVerificacionDatos);
      setActiveStep(2);
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
    if (!confirm('¿Está seguro de rechazar esta preinscripción? Esto liberará el cupo asignado.')) {
      return;
    }

    setSaving(true);
    try {
      await cambiarEstado('rechazada', motivo);
      alert('❌ Preinscripción rechazada. Se ha liberado el cupo y notificado al padre.');
      router.push('/dashboard/preinscripciones');
    } catch (err: any) {
      alert(err.message || 'Error al rechazar');
    } finally {
      setSaving(false);
    }
  }, [cambiarEstado, router]);

  // =============================================
  // 🆕 CONFIRMAR DECISIÓN FINAL (CON CUPO)
  // =============================================
  const confirmarDecision = useCallback(async () => {
    if (!decisionFinal) {
      alert('⚠️ Debe seleccionar una decisión final');
      return;
    }

    if (decisionFinal === 'aprobada' && !preinscripcion?.tiene_cupo_asignado && cuposDisponibles.length === 0) {
      alert('⚠️ No hay cupos disponibles. No se puede aprobar sin un cupo asignado.');
      return;
    }

    if (!confirm(`¿Confirmar decisión: ${decisionFinal.toUpperCase()}?`)) {
      return;
    }

    setSaving(true);
    try {
      await cambiarEstado(decisionFinal, notasDecisionFinal);
      
      if (decisionFinal === 'aprobada') {
        alert('✅ Preinscripción APROBADA. Cupo asignado correctamente. Se ha notificado al padre.');
      } else if (decisionFinal === 'rechazada') {
        alert('❌ Preinscripción RECHAZADA. Cupo liberado. Se ha notificado al padre.');
      } else {
        alert('📋 Se ha solicitado información adicional.');
      }
      
      router.push('/dashboard/preinscripciones');
    } catch (err: any) {
      alert(err.message || 'Error al confirmar decisión');
    } finally {
      setSaving(false);
    }
  }, [decisionFinal, preinscripcion, cuposDisponibles, notasDecisionFinal, cambiarEstado, router]);

  return {
    preinscripcion,
    loading,
    error,
    saving,
    activeStep,
    setActiveStep,
    
    // Notas
    notasDocumentos,
    setNotasDocumentos,
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
    aprobarDocumentos,
    solicitarDocumentos,
    aprobarDatos,
    cambiarEstado,
    rechazar,
    confirmarDecision,
    fetchPreinscripcion,
  };
};