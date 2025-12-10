// hooks/usePreinscripcionDetalle.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import preinscripcionService from '@/services/preinscripcionService';
import { PreInscripcionDetalle, EstadoPreInscripcion } from '@/types/preinscripcionTypes';

export const usePreinscripcionDetalle = (id: string | string[]) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [preinscripcion, setPreinscripcion] = useState<PreInscripcionDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de los pasos
  const [activeStep, setActiveStep] = useState(0);
  const [notasDocumentos, setNotasDocumentos] = useState('');
  const [notasVerificacionDatos, setNotasVerificacionDatos] = useState('');
  const [notasDecisionFinal, setNotasDecisionFinal] = useState('');
  const [decisionFinal, setDecisionFinal] = useState<EstadoPreInscripcion | ''>('');

  // Estados de acciones
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  const fetchPreinscripcion = async () => {
    try {
      setLoading(true);
      const preId = Array.isArray(id) ? id[0] : id;
      const data = await preinscripcionService.obtenerPorId(parseInt(preId));
      setPreinscripcion(data);
      setError(null);

      // Determinar paso según estado
      const estadoPaso = determinarPasoSegunEstado(data.estado);
      setActiveStep(estadoPaso);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPreinscripcion();
    }
  }, [id]);

  // ==========================================
  // DETERMINAR PASO SEGÚN ESTADO
  // ==========================================
  const determinarPasoSegunEstado = (estado: EstadoPreInscripcion): number => {
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
    return mapeo[estado] || 0;
  };

  // ==========================================
  // CAMBIAR ESTADO
  // ==========================================
  const cambiarEstado = async (nuevoEstado: EstadoPreInscripcion, observaciones?: string) => {
    if (!preinscripcion) return;

    try {
      setSaving(true);
      await preinscripcionService.cambiarEstado(
        preinscripcion.id,
        { estado: nuevoEstado, observaciones }
      );
      
      enqueueSnackbar('Estado actualizado correctamente', { variant: 'success' });
      await fetchPreinscripcion(); // Recargar datos
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // APROBAR DOCUMENTOS (Paso 1)
  // ==========================================
  const aprobarDocumentos = async () => {
    await cambiarEstado('documentos_aprobados', notasDocumentos);
    setActiveStep(1);
  };

  // ==========================================
  // APROBAR DATOS (Paso 2)
  // ==========================================
  const aprobarDatos = async () => {
    await cambiarEstado('entrevista_pendiente', notasVerificacionDatos);
    setActiveStep(2); // Ir a agendar entrevista
  };

  // ==========================================
  // CONFIRMAR DECISIÓN FINAL (Paso 3)
  // ==========================================
  const confirmarDecision = async () => {
    if (!decisionFinal) {
      enqueueSnackbar('Debes seleccionar una decisión', { variant: 'warning' });
      return;
    }

    await cambiarEstado(decisionFinal as EstadoPreInscripcion, notasDecisionFinal);
    
    enqueueSnackbar(
      `Decisión confirmada: ${decisionFinal === 'aprobada' ? 'APROBADA' : 'RECHAZADA'}`,
      { variant: decisionFinal === 'aprobada' ? 'success' : 'info' }
    );

    // Si fue aprobada, redirigir a conversión
    if (decisionFinal === 'aprobada') {
      setTimeout(() => {
        router.push(`/dashboard/preinscripciones/convertir/${preinscripcion?.id}`);
      }, 2000);
    } else {
      setTimeout(() => {
        router.push('/dashboard/preinscripciones');
      }, 2000);
    }
  };

  // ==========================================
  // CONVERTIR A ESTUDIANTE OFICIAL
  // ==========================================
  const convertirAEstudiante = async (paralelo_id: number, periodo_academico_id: number) => {
    if (!preinscripcion) return;

    try {
      setConverting(true);
      const resultado = await preinscripcionService.convertirAEstudiante(
        preinscripcion.id,
        { paralelo_id, periodo_academico_id }
      );

      enqueueSnackbar(
        `¡Estudiante creado! Código: ${resultado.data.estudiante.codigo}`,
        { variant: 'success' }
      );

      setTimeout(() => {
        router.push('/dashboard/estudiantes');
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al convertir';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setConverting(false);
    }
  };

  // ==========================================
  // RECHAZAR PREINSCRIPCIÓN
  // ==========================================
  const rechazar = async (motivo: string) => {
    await cambiarEstado('rechazada', motivo);
    
    setTimeout(() => {
      router.push('/dashboard/preinscripciones');
    }, 2000);
  };

  // ==========================================
  // SOLICITAR DOCUMENTOS ADICIONALES
  // ==========================================
  const solicitarDocumentos = async (observaciones: string) => {
    await cambiarEstado('documentos_pendientes', observaciones);
    
    enqueueSnackbar('Se ha solicitado documentación adicional', { variant: 'info' });
  };

  return {
    // Datos
    preinscripcion,
    loading,
    error,
    
    // Estados de paso
    activeStep,
    setActiveStep,
    
    // Notas
    notasDocumentos,
    setNotasDocumentos,
    notasVerificacionDatos,
    setNotasVerificacionDatos,
    notasDecisionFinal,
    setNotasDecisionFinal,
    decisionFinal,
    setDecisionFinal,
    
    // Acciones
    aprobarDocumentos,
    aprobarDatos,
    confirmarDecision,
    convertirAEstudiante,
    rechazar,
    solicitarDocumentos,
    cambiarEstado,
    fetchPreinscripcion,
    
    // Estados de carga
    saving,
    converting,
  };
};