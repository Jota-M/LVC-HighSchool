// hooks/useExamen.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import examenService from '@/services/examenService';
import type {
  PreguntaExamen,
  EstudianteIntentoItem,
  DetalleIntentoDocente,
  IniciarExamenResponse,
  RespuestaExamen,
  IntentoExamen,
  ConfigurarExamenDTO,
  GenerarExamenIADTO,
} from '@/types/examenTypes';
import { toast } from 'react-hot-toast';

export const useExamenDocente = (evaluacionId: number | null) => {
  const [preguntas, setPreguntas] = useState<PreguntaExamen[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const cargar = useCallback(async () => {
    if (!evaluacionId) return;
    setIsLoading(true);
    try {
      const [resPregs, resConfig] = await Promise.all([
        examenService.listarPreguntas(evaluacionId),
        examenService.obtenerConfiguracion(evaluacionId),
      ]);
      setPreguntas(resPregs.data.preguntas || []);
      setConfig(resConfig.data || null);
    } catch (error: any) {
      console.error('Error cargando examen:', error);
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const generarConIA = async (params: GenerarExamenIADTO = {}) => {
    if (!evaluacionId) return null;
    setGenerando(true);
    try {
      const res = await examenService.generarIA(evaluacionId, params);
      toast.success('Borrador generado con éxito con IA');
      return res.data.preguntas;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar examen con IA');
      return null;
    } finally {
      setGenerando(false);
    }
  };

  const guardarPreguntas = async (nuevasPreguntas: PreguntaExamen[]) => {
    if (!evaluacionId) return false;
    setGuardando(true);
    try {
      const res = await examenService.guardarPreguntas(evaluacionId, nuevasPreguntas);
      setPreguntas(res.data.preguntas);
      toast.success('Banco de preguntas guardado');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar preguntas');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const activarVirtual = async (cfg: ConfigurarExamenDTO) => {
    if (!evaluacionId) return false;
    setPublicando(true);
    try {
      const res = await examenService.publicarVirtual(evaluacionId, cfg);
      setConfig(res.data.evaluacion);
      toast.success('Modalidad virtual activada');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al activar modalidad virtual');
      return false;
    } finally {
      setPublicando(false);
    }
  };

  const desactivarVirtual = async () => {
    if (!evaluacionId) return false;
    setPublicando(true);
    try {
      const res = await examenService.desactivarVirtual(evaluacionId);
      setConfig(res.data.evaluacion);
      toast.success('Cambiado a modalidad presencial');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al desactivar');
      return false;
    } finally {
      setPublicando(false);
    }
  };

  const limpiarTodosIntentos = async () => {
    if (!evaluacionId) return false;
    try {
      const res = await examenService.limpiarTodosIntentos(evaluacionId);
      toast.success(res.message || 'Todos los intentos fueron eliminados');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al limpiar intentos');
      return false;
    }
  };

  return {
    preguntas,
    setPreguntas,
    config,
    isLoading,
    generando,
    guardando,
    publicando,
    generarConIA,
    guardarPreguntas,
    activarVirtual,
    desactivarVirtual,
    limpiarTodosIntentos,
    refrescar: cargar,
  };
};

export const useIntentosDocente = (evaluacionId: number | null) => {
  const [intentos, setIntentos] = useState<EstudianteIntentoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!evaluacionId) return;
    setIsLoading(true);
    try {
      const res = await examenService.listarIntentos(evaluacionId);
      setIntentos(res.data.intentos || []);
    } catch (error: any) {
      console.error('Error al listar intentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const reiniciarIntento = async (intentoId: number) => {
    try {
      const res = await examenService.reiniciarIntento(intentoId);
      toast.success(res.message || 'Intento reiniciado exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reiniciar el intento');
      return false;
    }
  };

  const limpiarTodosIntentos = async () => {
    if (!evaluacionId) return false;
    try {
      const res = await examenService.limpiarTodosIntentos(evaluacionId);
      toast.success(res.message || 'Todos los intentos fueron eliminados');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al limpiar intentos');
      return false;
    }
  };

  return {
    intentos,
    isLoading,
    refrescar: cargar,
    reiniciarIntento,
    limpiarTodosIntentos,
  };
};

export const useDetalleIntentoDocente = (intentoId: number | null) => {
  const [detalle, setDetalle] = useState<DetalleIntentoDocente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calificando, setCalificando] = useState(false);

  const cargar = useCallback(async () => {
    if (!intentoId) return;
    setIsLoading(true);
    try {
      const res = await examenService.obtenerDetalleIntento(intentoId);
      setDetalle(res.data);
    } catch (error: any) {
      console.error('Error al obtener detalle de intento:', error);
    } finally {
      setIsLoading(false);
    }
  }, [intentoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const calificarRespuesta = async (
    respuestaId: number,
    puntaje_obtenido: number,
    retroalimentacion?: string
  ) => {
    setCalificando(true);
    try {
      await examenService.calificarRespuestaManual(respuestaId, {
        puntaje_obtenido,
        retroalimentacion,
      });
      toast.success('Puntaje registrado');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al calificar respuesta');
      return false;
    } finally {
      setCalificando(false);
    }
  };

  return {
    detalle,
    isLoading,
    calificando,
    calificarRespuesta,
    refrescar: cargar,
  };
};

export const useTomarExamen = (evaluacionId: number | null, matriculaId: number | null) => {
  const [datosExamen, setDatosExamen] = useState<IniciarExamenResponse | null>(null);
  const [respuestasLocales, setRespuestasLocales] = useState<Record<number, { opcion?: number | null; texto?: string | null; archivo_url?: string | null }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState<Record<number, boolean>>({});
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const iniciar = useCallback(async () => {
    if (!evaluacionId) return;
    setIsLoading(true);
    setErrorMensaje(null);
    try {
      const res = await examenService.iniciarIntento(evaluacionId, matriculaId);
      setDatosExamen(res.data);

      // Precargar respuestas locales si ya existían
      const iniciales: Record<number, { opcion?: number | null; texto?: string | null; archivo_url?: string | null }> = {};
      for (const r of res.data.respuestas || []) {
        iniciales[r.pregunta_id] = {
          opcion: r.respuesta_opcion,
          texto: r.respuesta_texto,
          archivo_url: r.archivo_url,
        };
      }
      setRespuestasLocales(iniciales);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al iniciar examen';
      setErrorMensaje(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId, matriculaId]);

  useEffect(() => {
    iniciar();
  }, [iniciar]);

  // Ref para debounce de preguntas de texto
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  // Función de persistencia en el backend
  const persistirEnBackend = async (
    preguntaId: number,
    data: { respuesta_opcion?: number | null; respuesta_texto?: string | null }
  ) => {
    const intentoId = datosExamen?.intento?.id;
    const r = (datosExamen?.respuestas || []).find(x => x.pregunta_id === preguntaId);
    const idParam = r?.id || 0;

    try {
      const payload: any = {
        ...data,
        intento_id: intentoId,
        pregunta_id: preguntaId,
      };
      const res = await examenService.guardarRespuesta(idParam, payload);
      if (res?.data) {
        // Actualizar respuesta en datosExamen para tener el ID sincronizado
        setDatosExamen(prev => {
          if (!prev) return prev;
          const existentes = prev.respuestas || [];
          const idx = existentes.findIndex(x => x.pregunta_id === preguntaId);
          let nuevasRespuestas;
          if (idx >= 0) {
            nuevasRespuestas = [...existentes];
            nuevasRespuestas[idx] = { ...nuevasRespuestas[idx], ...res.data };
          } else {
            nuevasRespuestas = [...existentes, res.data];
          }
          return { ...prev, respuestas: nuevasRespuestas };
        });
      }
    } catch (err: any) {
      console.warn('Error al guardar respuesta en servidor:', err.message);
    }
  };

  // Autosave con actualización inmediata (optimista) en UI
  const autosave = (preguntaId: number, data: { respuesta_opcion?: number | null; respuesta_texto?: string | null }) => {
    // 1. Actualización optimista inmediata para que la UI responda al instante
    setRespuestasLocales(prev => ({
      ...prev,
      [preguntaId]: {
        ...prev[preguntaId],
        opcion: data.respuesta_opcion !== undefined ? data.respuesta_opcion : prev[preguntaId]?.opcion,
        texto: data.respuesta_texto !== undefined ? data.respuesta_texto : prev[preguntaId]?.texto,
      },
    }));

    // 2. Si es cambio de opción (click), persistir de inmediato
    if (data.respuesta_opcion !== undefined) {
      persistirEnBackend(preguntaId, data);
      return;
    }

    // 3. Si es texto, debounce de 400ms para evitar spam al servidor mientras escribe
    if (data.respuesta_texto !== undefined) {
      if (debounceTimers.current[preguntaId]) {
        clearTimeout(debounceTimers.current[preguntaId]);
      }
      debounceTimers.current[preguntaId] = setTimeout(() => {
        persistirEnBackend(preguntaId, data);
      }, 400);
    }
  };

  const subirArchivo = async (preguntaId: number, file: File) => {
    if (!datosExamen?.respuestas) return;
    const r = datosExamen.respuestas.find(x => x.pregunta_id === preguntaId);
    if (!r) return;

    setSubiendoArchivo(prev => ({ ...prev, [preguntaId]: true }));
    try {
      const res = await examenService.subirArchivoRespuesta(r.id, file);
      setRespuestasLocales(prev => ({
        ...prev,
        [preguntaId]: {
          ...prev[preguntaId],
          archivo_url: res.data.archivo_url,
        },
      }));
      toast.success('Archivo adjuntado correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setSubiendoArchivo(prev => ({ ...prev, [preguntaId]: false }));
    }
  };

  const entregar = async (): Promise<IntentoExamen | null> => {
    if (!datosExamen?.intento?.id) return null;
    setEnviando(true);
    try {
      const res = await examenService.entregarIntento(datosExamen.intento.id);
      toast.success('¡Examen entregado exitosamente!');
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al entregar el examen');
      return null;
    } finally {
      setEnviando(false);
    }
  };

  return {
    datosExamen,
    respuestasLocales,
    isLoading,
    enviando,
    subiendoArchivo,
    errorMensaje,
    autosave,
    subirArchivo,
    entregar,
    refrescar: iniciar,
  };
};
