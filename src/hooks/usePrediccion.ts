// hooks/usePrediccion.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import prediccionService from '@/services/prediccionService';
import {
  ResultadoModelo,
  AnalisisGemini,
  PrediccionMeta,
  NotificacionAlerta,
  CandidatoNotificacionPadre,
  NotificarPadreDTO,
  EstudianteClase,
  AnalisisClaseGemini,
  ResultadoEscenario,
  PlanRecuperacion,
  EscenarioSimulacion,
  MLHealthResponse,
  NivelRiesgo,
  SimulacionOptimoResponse,
  AccionRequerida,
  RestriccionesOptimo,
  SimulacionOptimoV2Response,
} from '@/types/prediccionTypes';

// ============================================
// HOOK: PREDICCIÓN INDIVIDUAL
// ============================================
// Uso:
//   const { predecir, resultado, analisis, isLoading } = usePrediccionEstudiante();
//   await predecir({ matricula_id: 42, asignacion_docente_id: 5, periodo_evaluacion_id: 2 });

export const usePrediccionEstudiante = () => {
  const [resultado, setResultado] = useState<ResultadoModelo | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisGemini | null>(null);
  const [meta, setMeta] = useState<PrediccionMeta | null>(null);
  const [notificacion, setNotificacion] = useState<NotificacionAlerta | null>(null);
  // Candidato a notificación al padre — viene del backend cuando nivel_riesgo
  // es 'critico'. El envío real no es automático, requiere confirmación
  // del docente vía el modal (ver useNotificarPadre).
  const [candidatoNotificacionPadre, setCandidatoNotificacionPadre] =
    useState<CandidatoNotificacionPadre | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predecir = useCallback(async (
    params: {

      matricula_id: number;
      asignacion_docente_id: number;
      periodo_evaluacion_id: number;
    },
    opciones?: {
      incluirGemini?: boolean;
      incluirPlan?: boolean;
      silencioso?: boolean; // no mostrar toast de éxito
    },
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=== usePrediccionEstudiante ===');
      console.log('Params:', JSON.stringify(params));
      const res = await prediccionService.predecirEstudiante(params, {
        incluirGemini: opciones?.incluirGemini ?? true,
        incluirPlan: opciones?.incluirPlan ?? false,
      });

      setResultado(res.data.modelo);
      setAnalisis(res.data.analisis ?? null);
      setMeta(res.data._meta);
      setNotificacion(res.data.notificacion_alerta ?? null);
      setCandidatoNotificacionPadre(res.data.candidato_notificacion_padre ?? null);

      // Mostrar toast según nivel de riesgo
      if (!opciones?.silencioso) {
        const nivel = res.data.modelo.nivel_riesgo;
        if (nivel === 'critico') {
          toast.error(`⚠️ Riesgo CRÍTICO — nota estimada ${res.data.modelo.nota_estimada_final}`);
        } else if (nivel === 'alto') {
          toast(`🟠 Riesgo ALTO — nota estimada ${res.data.modelo.nota_estimada_final}`, {
            icon: '⚠️',
          });
        } else {
          toast.success('Predicción generada correctamente');
        }
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al generar predicción';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setResultado(null);
    setAnalisis(null);
    setMeta(null);
    setNotificacion(null);
    setCandidatoNotificacionPadre(null);
    setError(null);
  }, []);

  // Helpers de UI
  const nivelColor: Record<NivelRiesgo, string> = {
    bajo: '#16a34a',
    medio: '#d97706',
    alto: '#ea580c',
    critico: '#dc2626',
  };

  const colorRiesgo = resultado
    ? nivelColor[resultado.nivel_riesgo]
    : '#6b7280';

  const porcentajePeriodo = meta
    ? Math.round((meta.semana_actual / meta.total_semanas) * 100)
    : 0;

  return {
    resultado,
    analisis,
    meta,
    notificacion,
    candidatoNotificacionPadre,
    isLoading,
    error,
    colorRiesgo,
    porcentajePeriodo,
    predecir,
    limpiar,
  };
};

// ============================================
// HOOK: ANÁLISIS DE CLASE
// ============================================
// Uso:
//   const { analizar, estudiantes, resumen, isLoading } = usePrediccionClase();
//   await analizar({ asignacion_docente_id: 5, periodo_evaluacion_id: 2, paralelo_id: 3 });

export const usePrediccionClase = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteClase[]>([]);
  const [analisisGemini, setAnalisis] = useState<AnalisisClaseGemini | null>(null);
  const [resumen, setResumen] = useState<{
    total_estudiantes: number;
    en_riesgo_critico: number;
    en_riesgo_alto: number;
    en_riesgo_medio: number;
    sin_riesgo: number;
    promedio_clase: number;
    asistencia_promedio: number;
    pct_riesgo: number;
  } | null>(null);
  // Candidatos a notificación al padre — estudiantes en riesgo crítico del
  // análisis de clase. El envío real requiere confirmación del docente.
  const [candidatosNotificacionPadre, setCandidatosNotificacionPadre] =
    useState<CandidatoNotificacionPadre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analizar = useCallback(async (params: {
    asignacion_docente_id: number;
    periodo_evaluacion_id: number;
    paralelo_id: number;
  }, opciones?: { incluirGemini?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=== usePrediccionClase ===');
      console.log('Params:', JSON.stringify(params));
      const res = await prediccionService.predecirClase(params, {
        incluirGemini: opciones?.incluirGemini ?? true,
      });

      const d = res.data;
      setEstudiantes(d.estudiantes);
      setAnalisis(d.analisis ?? null);
      setResumen({
        total_estudiantes: d.total_estudiantes,
        en_riesgo_critico: d.en_riesgo_critico,
        en_riesgo_alto: d.en_riesgo_alto,
        en_riesgo_medio: d.en_riesgo_medio,
        sin_riesgo: d.sin_riesgo,
        promedio_clase: d.promedio_clase,
        asistencia_promedio: d.asistencia_promedio,
        pct_riesgo: d.pct_riesgo,
      });
      setCandidatosNotificacionPadre(d.candidatos_notificacion_padre ?? []);

      if (d.analisis?.alerta_institucional) {
        toast.error('🚨 Alerta institucional generada — revisá las notificaciones');
      } else {
        toast.success(`Análisis completado — ${d.total_estudiantes} estudiantes evaluados`);
      }

      return res.data;
    } catch (err: any) {
      // 409 = análisis ya en progreso (guard backend) — no es un error real
      if (err.response?.status === 409) {
        toast('⏳ Análisis en progreso, esperá un momento…', { icon: 'ℹ️' });
        return null;
      }
      const msg = err.response?.data?.message || 'Error al analizar la clase';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Estudiantes filtrados por nivel de riesgo — útil para la tabla
  const estudiantesPorNivel = useCallback((nivel: NivelRiesgo) => {
    return estudiantes.filter(e => e.nivel_riesgo === nivel);
  }, [estudiantes]);

  const limpiar = useCallback(() => {
    setEstudiantes([]);
    setAnalisis(null);
    setResumen(null);
    setCandidatosNotificacionPadre([]);
    setError(null);
  }, []);

  return {
    estudiantes,
    analisisGemini,
    resumen,
    candidatosNotificacionPadre,
    isLoading,
    error,
    analizar,
    estudiantesPorNivel,
    limpiar,
  };
};

// ============================================
// HOOK: NOTIFICAR AL PADRE (manual, post-confirmación)
// ============================================
// Uso:
//   const { notificar, isLoading } = useNotificarPadre();
//   await notificar({ matricula_id, materia_nombre, nota_estimada, asistencia_pct, recomendaciones });
//
// Se llama SOLO cuando el docente confirma desde ModalNotificarPadre.
// Nunca se dispara automáticamente desde usePrediccionEstudiante / usePrediccionClase.

export const useNotificarPadre = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificar = useCallback(async (candidato: NotificarPadreDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await prediccionService.notificarPadre(candidato);
      toast.success('Notificación enviada al padre/madre');
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo enviar la notificación al padre';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { notificar, isLoading, error };
};

// ============================================
// HOOK: PLAN DE RECUPERACIÓN
// ============================================
// Uso:
//   const { generarPlan, plan, isLoading } = usePlanRecuperacion();
//   await generarPlan({ matricula_id: 42, asignacion_docente_id: 5, periodo_evaluacion_id: 2 });

export const usePlanRecuperacion = () => {
  const [plan, setPlan] = useState<PlanRecuperacion | null>(null);
  const [nivelRiesgo, setNivel] = useState<NivelRiesgo | null>(null);
  const [notaEstimada, setNota] = useState<number | null>(null);
  const [semanasRestantes, setSem] = useState<number | null>(null);
  const [geminiDisponible, setGem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generarPlan = useCallback(async (params: {
    matricula_id: number;
    asignacion_docente_id: number;
    periodo_evaluacion_id: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await prediccionService.planRecuperacion(params);
      const d = res.data;

      setPlan(d.plan ?? null);
      setNivel(d.nivel_riesgo);
      setNota(d.nota_estimada);
      setSem(d.semanas_restantes);
      setGem(d.gemini_disponible);

      if (!d.plan) {
        if (!d.gemini_disponible) {
          toast('Gemini no disponible — configurá la API key para generar el plan', {
            icon: 'ℹ️',
          });
        } else if (d.nivel_riesgo === 'bajo') {
          toast.success('El estudiante no requiere plan de recuperación');
        } else {
          toast('No hay suficiente tiempo para generar un plan útil', { icon: 'ℹ️' });
        }
      } else {
        toast.success(`Plan generado — ${d.plan.plan_semanal.length} semanas`);
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al generar el plan';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setPlan(null);
    setNivel(null);
    setNota(null);
    setSem(null);
    setError(null);
  }, []);

  return {
    plan,
    nivelRiesgo,
    notaEstimada,
    semanasRestantes,
    geminiDisponible,
    isLoading,
    error,
    generarPlan,
    limpiar,
  };
};

// ============================================
// HOOK: SIMULACIÓN DE ESCENARIOS
// ============================================
// Uso:
//   const { simular, escenarios, situacionActual, isLoading } = useSimulacion();
//   await simular({ matricula_id, asignacion_docente_id, periodo_evaluacion_id, escenarios: [...] });

export const useSimulacion = () => {
  const [situacionActual, setSituacion] = useState<ResultadoModelo | null>(null);
  const [escenarios, setEscenarios] = useState<ResultadoEscenario[]>([]);
  const [recomendacion, setRecomendacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escenarios seleccionados para simular (parte del estado local de UI)
  const [escenariosSeleccionados, setSeleccionados] = useState<EscenarioSimulacion[]>([]);

  const simular = useCallback(async (params: {
    matricula_id: number;
    asignacion_docente_id: number;
    periodo_evaluacion_id: number;
  }, opciones?: { incluirGemini?: boolean }) => {
    if (escenariosSeleccionados.length === 0) {
      toast.error('Seleccioná al menos un escenario para simular');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await prediccionService.simular(
        { ...params, escenarios: escenariosSeleccionados },
        { incluirGemini: opciones?.incluirGemini ?? true },
      );

      setSituacion(res.data.situacion_actual);
      setEscenarios(res.data.escenarios);
      setRecomendacion(res.data.recomendacion_gemini ?? null);
      toast.success(`${res.data.escenarios.length} escenarios simulados`);

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al simular escenarios';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [escenariosSeleccionados]);

  const agregarEscenario = useCallback((escenario: EscenarioSimulacion) => {
    setSeleccionados(prev => {
      if (prev.length >= 5) {
        toast.error('Máximo 5 escenarios por simulación');
        return prev;
      }
      return [...prev, escenario];
    });
  }, []);

  const quitarEscenario = useCallback((index: number) => {
    setSeleccionados(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetEscenarios = useCallback(() => {
    setSeleccionados([]);
  }, []);

  const limpiar = useCallback(() => {
    setSituacion(null);
    setEscenarios([]);
    setRecomendacion(null);
    setError(null);
  }, []);

  // El mejor escenario es el que más baja la probabilidad de reprobar
  const mejorEscenario = escenarios.length > 0
    ? escenarios.reduce((best, e) =>
      e.cambio_probabilidad < best.cambio_probabilidad ? e : best
    )
    : null;

  return {
    situacionActual,
    escenarios,
    recomendacion,
    escenariosSeleccionados,
    mejorEscenario,
    isLoading,
    error,
    simular,
    agregarEscenario,
    quitarEscenario,
    resetEscenarios,
    limpiar,
  };
};

// ============================================
// HOOK: HEALTH DEL SERVICIO ML
// ============================================
// Uso:
//   const { health, verificar, isLoading } = useMLHealth();
//   useEffect(() => { verificar(); }, []);

export const useMLHealth = () => {
  const [health, setHealth] = useState<MLHealthResponse | null>(null);
  const [isLoading, setLoading] = useState(false);

  const verificar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prediccionService.health();
      setHealth(res);
    } catch {
      setHealth({ success: false, disponible: false, error: 'Sin conexión al ML' });
    } finally {
      setLoading(false);
    }
  }, []);

  return { health, isLoading, verificar };
};
// ============================================
// HOOK: SIMULACIÓN ÓPTIMA
// ============================================
// Uso:
//   const { calcular, resultado, isLoading } = useSimulacionOptimo();
//
//   // "¿Qué necesito para aprobar?"
//   await calcular({ matricula_id, asignacion_docente_id, periodo_evaluacion_id });
//
//   // "¿Qué necesito para sacar 70?"
//   await calcular({ matricula_id, asignacion_docente_id, periodo_evaluacion_id }, { objetivoNota: 70 });
//
//   // "¿Qué necesito sin contar asistencia?"
//   await calcular({ ... }, { restricciones: { bloquearAsistencia: true } });

export const useSimulacionOptimo = () => {
  const [resultado, setResultado] = useState<SimulacionOptimoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcular = useCallback(async (
    params: {
      matricula_id: number;
      asignacion_docente_id: number;
      periodo_evaluacion_id: number;
    },
    opciones?: {
      objetivoNota?: number;             // default 51
      restricciones?: RestriccionesOptimo;
      silencioso?: boolean;
    },
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await prediccionService.simularOptimo({
        matricula_id: params.matricula_id,
        asignacion_docente_id: params.asignacion_docente_id,
        periodo_evaluacion_id: params.periodo_evaluacion_id,
        objetivo_nota: opciones?.objetivoNota ?? 51,
        restricciones: opciones?.restricciones ?? {},
      });

      setResultado(res.data);

      if (!opciones?.silencioso) {
        if (res.data.alcanzable) {
          toast.success(`Objetivo alcanzable — nota proyectada: ${res.data.nota_proyectada}`);
        } else {
          toast(`Objetivo difícil de alcanzar — máximo posible: ${res.data.nota_maxima_posible}`, {
            icon: '⚠️',
          });
        }
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al calcular simulación óptima';
      setError(msg);
      if (!opciones?.silencioso) toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setResultado(null);
    setError(null);
  }, []);

  // Helpers de UI
  const accionesPorDificultad = useCallback((dificultad: AccionRequerida['dificultad']) => {
    return resultado?.acciones.filter(a => a.dificultad === dificultad) ?? [];
  }, [resultado]);

  const colorDificultad: Record<AccionRequerida['dificultad'], string> = {
    baja: '#16a34a',
    media: '#d97706',
    alta: '#dc2626',
  };

  return {
    resultado,
    isLoading,
    error,
    calcular,
    limpiar,
    accionesPorDificultad,
    colorDificultad,
  };
};
export const useSimulacionOptimoV2 = () => {
  const [resultado, setResultado] = useState<SimulacionOptimoV2Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcular = useCallback(async (
    params: {
      matricula_id: number;
      asignacion_docente_id: number;
      periodo_evaluacion_id: number;
    },
    opciones?: {
      objetivoNota?: number;
      restricciones?: RestriccionesOptimo;
      practicasRestantes?: number;   // del docente — undefined = estimar
      examenesRestantes?: number;   // del docente — undefined = estimar
      silencioso?: boolean;
    },
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await prediccionService.simularOptimoV2({
        matricula_id: params.matricula_id,
        asignacion_docente_id: params.asignacion_docente_id,
        periodo_evaluacion_id: params.periodo_evaluacion_id,
        objetivo_nota: opciones?.objetivoNota ?? 51,
        restricciones: opciones?.restricciones ?? {},
        practicas_restantes: opciones?.practicasRestantes,
        examenes_restantes: opciones?.examenesRestantes,
      });
      setResultado(res.data);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al calcular simulación óptima v2';
      setError(msg);
      if (!opciones?.silencioso) toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => { setResultado(null); setError(null); }, []);
  return { resultado, isLoading, error, calcular, limpiar };
};