'use client';
// components/docente/inicial/PanelEvaluacionInicial.tsx
// Panel de Calificaciones para Nivel Inicial:
// 1. Calificación de Prácticas con valoración cualitativa rápida: "Muy Bien", "Bien", "Regular", "Necesita Apoyo".
// 2. Listas de Cotejo por Campos de Desarrollo con abreviaturas oficiales (ED, DA, DO, DP) y edición/eliminación de indicadores.
// 3. Modales con el diseño y tokens idénticos a NuevoHorarioModal.
// 4. Informes Descriptivos con redacción IA y descarga de boletín.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, Chip, Tooltip, CircularProgress,
  Dialog, DialogContent, DialogActions, TextField, Grid,
  Avatar, Stack, useTheme, alpha, Fade, Paper, IconButton,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  AutoAwesomeRounded as SparklesIcon,
  PictureAsPdfRounded as PdfIcon,
  EditNoteRounded as EditNoteIcon,
  AddCircleOutlineRounded as AddIcon,
  PsychologyRounded as BrainIcon,
  DirectionsRunRounded as MotorIcon,
  FavoriteRounded as HeartIcon,
  RecordVoiceOverRounded as VoiceIcon,
  MenuBookRounded as BookIcon,
  PhotoCameraRounded as CameraIcon,
  OpenInNewRounded as OpenInNewIcon,
  CheckCircleRounded as CheckCircleIcon,
  AssignmentRounded as TaskIcon,
  CloseRounded as CloseIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  CommentRounded as CommentIcon,
  TableChartRounded as TableChartIcon,
  SearchRounded as SearchIcon,
  VisibilityRounded as VisibilityIcon,
  SwapHorizRounded as SwapIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { inicialService } from '@/services/inicialService';
import {
  evaluacionesService,
  calificacionesService,
  entregasService,
} from '@/services/notasService';
import {
  NivelLogro, IndicadorLogro, MatrizCotejoData, InformeCualitativo, EstudianteInicial,
} from '@/types/inicialTypes';
import type { MateriaDocenteNotas, Evaluacion } from '@/types/notasTypes';

export interface PanelEvaluacionInicialProps {
  paraleloId?: number;
  periodoId?: number;
  gradoId?: number;
  paraleloNombre?: string;
  gradoNombre?: string;
  turnoNombre?: string;
  periodoNombre?: string;
  materia?: MateriaDocenteNotas;
  asignacionId?: number;
  onVolver?: () => void;
}

// Escala cualitativa para calificar las prácticas de Inicial
export const ESCALA_CUALITATIVA_INICIAL = [
  {
    key: 'muy_bien',
    label: 'Muy Bien',
    icon: '🌟',
    color: '#16a34a',
    desc: 'Logro pleno de la actividad con autonomía',
  },
  {
    key: 'bien',
    label: 'Bien',
    icon: '👍',
    color: '#0288d1',
    desc: 'Realizó la práctica satisfactoriamente',
  },
  {
    key: 'regular',
    label: 'Regular',
    icon: '🌱',
    color: '#f59e0b',
    desc: 'En proceso de desarrollo / completó parcialmente',
  },
  {
    key: 'apoyo',
    label: 'Necesita Apoyo',
    icon: '💡',
    color: '#8b5cf6',
    desc: 'Requiere acompañamiento adicional en casa o aula',
  },
];

const ICONOS_CAMPOS: Record<string, React.ReactElement> = {
  'INI-COM': <VoiceIcon fontSize="small" />,
  'INI-CON': <BrainIcon fontSize="small" />,
  'INI-BIO': <MotorIcon fontSize="small" />,
  'INI-SOC': <HeartIcon fontSize="small" />,
};

interface CalificacionPracticaItem {
  matricula_id: number;
  estudiante_id: number;
  nombres: string;
  apellidos: string;
  foto_url?: string;
  codigo_rude?: string;
  calificacion_id?: number | null;
  nivel_cualitativo: string | null;
  observacion: string;
  tiene_entrega_archivo: boolean;
  archivo_url?: string;
  comentario_familia?: string;
}

export const PanelEvaluacionInicial: React.FC<PanelEvaluacionInicialProps> = (props) => {
  const paraleloId = Number(props.paraleloId ?? props.materia?.paralelo_id ?? 0);
  const periodoId = Number(props.periodoId ?? props.materia?.periodo_evaluacion_id ?? 0);
  const gradoId = Number(props.gradoId ?? props.materia?.grado_id ?? 0);
  const asignacionId = Number(props.asignacionId ?? props.materia?.asignacion_id ?? 0);
  const paraleloNombre = props.paraleloNombre ?? props.materia?.paralelo_nombre ?? '';
  const gradoNombre = props.gradoNombre ?? props.materia?.grado_nombre ?? '';
  const periodoNombre = props.periodoNombre ?? props.materia?.periodo_nombre ?? props.materia?.trimestre_nombre;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Tokens (mismo sistema visual que NuevoHorarioModal) ─────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const gold = brand;
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  const onGrad = isDark ? '#000' : '#fff';
  const cardBorder = `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`;
  const cardBg = isDark ? alpha('#fff', 0.02) : '#ffffff';
  const cardShadow = isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 16px rgba(0,0,0,0.06)';
  const lineColor = isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06);

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const modalPaperSx = {
    borderRadius: '20px !important',
    overflow: 'hidden',
    background: bgModal,
    border: `1.5px solid ${brandBorder}`,
    boxShadow: isDark
      ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
      : `0 32px 64px rgba(0,0,0,0.18)`,
  };

  // ── Estados generales ──
  const [tabPrincipal, setTabPrincipal] = useState<number>(1); // Inicia por defecto en Listas de Cotejo del Área
  const [loading, setLoading] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);

  // ── Estados TAB 0: Calificación de Prácticas ──
  const [practicas, setPracticas] = useState<Evaluacion[]>([]);
  const [practicaSelId, setPracticaSelId] = useState<number | null>(null);
  const [calificacionesPractica, setCalificacionesPractica] = useState<CalificacionPracticaItem[]>([]);
  const [loadingPracticaDetalle, setLoadingPracticaDetalle] = useState(false);
  const [cambiosPracticas, setCambiosPracticas] = useState<Record<number, { nivel: string | null; obs: string }>>({});
  const [modalEvidenciaUrl, setModalEvidenciaUrl] = useState<string | null>(null);

  // ── Estados TAB 1: Listas de Cotejo ──
  const [niveles, setNiveles] = useState<NivelLogro[]>([]);
  const [matriz, setMatriz] = useState<MatrizCotejoData | null>(null);
  const [campoActivoIdx, setCampoActivoIdx] = useState<number>(0);
  const [mostrarSelectorAreas, setMostrarSelectorAreas] = useState<boolean>(false);
  const [cambiosCotejo, setCambiosCotejo] = useState<Record<string, { nivel_id: number | null; obs: string }>>({});

  // Modales de Indicadores
  const [dialogNuevoInd, setDialogNuevoInd] = useState<boolean>(false);
  const [nuevaDescInd, setNuevaDescInd] = useState<string>('');

  const [indAEditar, setIndAEditar] = useState<IndicadorLogro | null>(null);
  const [editDescInd, setEditDescInd] = useState<string>('');

  const [indAEliminar, setIndAEliminar] = useState<IndicadorLogro | null>(null);
  const [eliminandoInd, setEliminandoInd] = useState<boolean>(false);

  // ── Estados TAB 2: Informes Descriptivos ──
  const [informes, setInformes] = useState<InformeCualitativo[]>([]);
  const [estudianteSel, setEstudianteSel] = useState<EstudianteInicial | null>(null);
  const [textoInforme, setTextoInforme] = useState<string>('');
  const [observacionesDocente, setObservacionesDocente] = useState<string>('');
  const [generandoIA, setGenerandoIA] = useState<boolean>(false);
  const [vistaInformes, setVistaInformes] = useState<'individual' | 'general'>('general');
  const [busquedaGeneral, setBusquedaGeneral] = useState<string>('');

  // ── Carga inicial de datos ──
  const cargarDatos = useCallback(async () => {
    if (!paraleloId || !periodoId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const promises: [Promise<any>, Promise<any>, Promise<any>, Promise<any>] = [
        inicialService.getNivelesLogro(),
        inicialService.getMatrizCotejo(paraleloId, periodoId),
        inicialService.getInformesParalelo(paraleloId, periodoId),
        asignacionId
          ? evaluacionesService.listar({ asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, activo: true, limit: 100 })
          : Promise.resolve({ data: { evaluaciones: [] } }),
      ];

      const [nivelesRes, matrizRes, informesRes, practicasRes] = await Promise.all(promises);

      setNiveles(nivelesRes);
      setMatriz(matrizRes);
      setInformes(informesRes);

      const listaPrac: Evaluacion[] = practicasRes?.data?.evaluaciones ?? [];
      setPracticas(listaPrac);
      if (listaPrac.length > 0 && !practicaSelId) {
        setPracticaSelId(listaPrac[0].id);
      }

      setCambiosCotejo({});
      if (matrizRes.estudiantes.length > 0 && !estudianteSel) {
        setEstudianteSel(matrizRes.estudiantes[0]);
      }
    } catch (err: any) {
      console.error('Error al cargar datos de Inicial:', err);
      toast.error('Error al cargar datos de evaluación');
    } finally {
      setLoading(false);
    }
  }, [paraleloId, periodoId, asignacionId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ── Cargar calificaciones y entregas de la práctica seleccionada ──
  const cargarCalificacionesPractica = useCallback(async (evaluacionId: number) => {
    if (!evaluacionId) return;
    setLoadingPracticaDetalle(true);
    try {
      const [resCal, resEnt] = await Promise.all([
        calificacionesService.listarPorEvaluacion(evaluacionId).catch(() => ({ data: { calificaciones: [] } })),
        entregasService.obtenerEntregasDocente(evaluacionId).catch(() => ({ data: { entregas: [] } })),
      ]);

      const califs = resCal?.data?.calificaciones ?? [];
      const entregas = resEnt?.data?.entregas ?? [];

      const mapaEntregas: Record<number, any> = {};
      entregas.forEach((e: any) => {
        mapaEntregas[e.matricula_id] = e;
      });

      const estudiantesBase = matriz?.estudiantes || [];

      const items: CalificacionPracticaItem[] = (estudiantesBase.length > 0 ? estudiantesBase : califs).map((est: any) => {
        const matId = est.matricula_id;
        const cal = califs.find((c: any) => c.matricula_id === matId);
        const ent = mapaEntregas[matId];

        let nivelGuardado: string | null = null;
        const obs = (cal?.observacion || ent?.observacion_docente || '').toLowerCase();
        if (obs.includes('muy bien') || obs.includes('excelente') || obs.includes('pleno')) {
          nivelGuardado = 'muy_bien';
        } else if (obs.includes('bien') || obs.includes('óptimo') || obs.includes('optimo')) {
          nivelGuardado = 'bien';
        } else if (obs.includes('regular') || obs.includes('proceso') || obs.includes('aceptable')) {
          nivelGuardado = 'regular';
        } else if (obs.includes('apoyo') || obs.includes('desarrollo')) {
          nivelGuardado = 'apoyo';
        } else if (cal?.puntaje_obtenido != null && cal.puntaje_obtenido > 0) {
          nivelGuardado = 'bien';
        }

        const archivoSubido = ent?.archivo_url || (ent?.archivos && ent.archivos[0]?.url) || undefined;

        return {
          matricula_id: matId,
          estudiante_id: est.estudiante_id || est.id,
          nombres: est.nombres,
          apellidos: est.apellidos,
          foto_url: est.foto_url || est.estudiante_foto,
          codigo_rude: est.codigo_rude || est.codigo_estudiante,
          calificacion_id: cal?.calificacion_id || cal?.id || null,
          nivel_cualitativo: nivelGuardado,
          observacion: cal?.observacion || ent?.observacion_docente || '',
          tiene_entrega_archivo: Boolean(archivoSubido),
          archivo_url: archivoSubido,
          comentario_familia: ent?.comentario_estudiante,
        };
      });

      setCalificacionesPractica(items);
      setCambiosPracticas({});
    } catch (e: any) {
      console.error('Error al cargar detalle de práctica:', e);
      toast.error('Error al cargar notas de la práctica');
    } finally {
      setLoadingPracticaDetalle(false);
    }
  }, [matriz]);

  useEffect(() => {
    if (practicaSelId) {
      cargarCalificacionesPractica(practicaSelId);
    }
  }, [practicaSelId, cargarCalificacionesPractica]);

  // ── Cambiar calificación cualitativa de un alumno ──
  const handleSetNivelCualitativo = (matriculaId: number, nivelKey: string) => {
    setCalificacionesPractica(prev => prev.map(item => {
      if (item.matricula_id === matriculaId) {
        const nuevoNivel = item.nivel_cualitativo === nivelKey ? null : nivelKey;
        const nombreNivel = ESCALA_CUALITATIVA_INICIAL.find(e => e.key === nuevoNivel)?.label || '';
        return {
          ...item,
          nivel_cualitativo: nuevoNivel,
          observacion: nuevoNivel ? `${nombreNivel}` : '',
        };
      }
      return item;
    }));

    setCambiosPracticas(prev => {
      const actual = calificacionesPractica.find(c => c.matricula_id === matriculaId);
      const nuevoNivel = actual?.nivel_cualitativo === nivelKey ? null : nivelKey;
      const nombreNivel = ESCALA_CUALITATIVA_INICIAL.find(e => e.key === nuevoNivel)?.label || '';
      return {
        ...prev,
        [matriculaId]: {
          nivel: nuevoNivel,
          obs: nuevoNivel ? nombreNivel : '',
        },
      };
    });
  };

  // ── Cambiar observación textual de un alumno ──
  const handleSetObservacionPractica = (matriculaId: number, obsText: string) => {
    setCalificacionesPractica(prev => prev.map(item =>
      item.matricula_id === matriculaId ? { ...item, observacion: obsText } : item
    ));

    setCambiosPracticas(prev => ({
      ...prev,
      [matriculaId]: {
        nivel: prev[matriculaId]?.nivel ?? calificacionesPractica.find(c => c.matricula_id === matriculaId)?.nivel_cualitativo ?? null,
        obs: obsText,
      },
    }));
  };

  // ── Marcar masivamente a toda la clase ──
  const handleMarcarTodos = (nivelKey: string) => {
    const itemEscala = ESCALA_CUALITATIVA_INICIAL.find(e => e.key === nivelKey);
    if (!itemEscala) return;

    setCalificacionesPractica(prev => prev.map(item => ({
      ...item,
      nivel_cualitativo: nivelKey,
      observacion: itemEscala.label,
    })));

    const nuevosCambios: Record<number, { nivel: string | null; obs: string }> = {};
    calificacionesPractica.forEach(item => {
      nuevosCambios[item.matricula_id] = {
        nivel: nivelKey,
        obs: itemEscala.label,
      };
    });
    setCambiosPracticas(nuevosCambios);
    toast.success(`Toda la clase marcada como "${itemEscala.label}"`);
  };

  // ── Guardar calificaciones de la práctica ──
  const handleGuardarCalificacionesPractica = async () => {
    if (!practicaSelId) return;
    const cambioIds = Object.keys(cambiosPracticas).map(Number);
    if (cambioIds.length === 0) {
      toast('No hay cambios pendientes por guardar', { icon: 'ℹ️' });
      return;
    }

    setGuardando(true);
    try {
      const registros = calificacionesPractica.map(item => {
        const escala = ESCALA_CUALITATIVA_INICIAL.find(e => e.key === item.nivel_cualitativo);
        const obsFinal = item.observacion || (escala ? escala.label : 'Formativa');
        return {
          matricula_id: item.matricula_id,
          puntaje_obtenido: 0,
          esta_ausente: false,
          observacion: obsFinal,
        };
      });

      // Se envía registros para satisfacer el payload esperado
      await calificacionesService.registrarMasivo({
        evaluacion_id: practicaSelId,
        registros,
      } as any);

      toast.success('Calificaciones cualitativas guardadas exitosamente');
      setCambiosPracticas({});
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al guardar calificaciones');
    } finally {
      setGuardando(false);
    }
  };

  // ── Helpers TAB 1 (Listas de Cotejo) ──
  const camposAgrupados = useMemo(() => {
    if (!matriz) return [];

    // 1. Si la matriz nos entrega los campos curriculares del grado:
    if (matriz.campos && matriz.campos.length > 0) {
      return matriz.campos.map(c => ({
        codigo: c.campo_codigo,
        nombre: c.campo_nombre,
        gmId: c.grado_materia_id,
        indicadores: (matriz.indicadores || []).filter(
          i => i.grado_materia_id === c.grado_materia_id || i.campo_codigo === c.campo_codigo
        )
      }));
    }

    // 2. Fallback con los indicadores existentes si aún no vienen campos:
    if (!matriz.indicadores) return [];
    const map = new Map<string, { codigo: string; nombre: string; gmId: number; indicadores: IndicadorLogro[] }>();
    for (const ind of matriz.indicadores) {
      const cod = ind.campo_codigo || 'CAMPO';
      if (!map.has(cod)) {
        map.set(cod, { codigo: cod, nombre: ind.campo_nombre || 'Campo de Desarrollo', gmId: ind.grado_materia_id, indicadores: [] });
      }
      map.get(cod)!.indicadores.push(ind);
    }
    return Array.from(map.values());
  }, [matriz]);

  // Emparejar automáticamente el campo con la materia/card seleccionada por el docente
  const matchedIdx = useMemo(() => {
    if (!props.materia || camposAgrupados.length === 0) return 0;
    const targetCod = (props.materia.materia_codigo || '').trim().toUpperCase();
    const targetNom = (props.materia.materia_nombre || '').trim().toLowerCase();
    const targetGmId = Number(props.materia.grado_materia_id || 0);

    const found = camposAgrupados.findIndex(c => {
      const cCod = (c.codigo || '').trim().toUpperCase();
      const cNom = (c.nombre || '').trim().toLowerCase();
      const cGmId = Number(c.gmId || 0);

      if (targetGmId && cGmId && targetGmId === cGmId) return true;
      if (targetCod && cCod && targetCod === cCod) return true;
      if (targetNom && cNom && (cNom.includes(targetNom) || targetNom.includes(cNom))) return true;
      return false;
    });

    return found >= 0 ? found : 0;
  }, [props.materia, camposAgrupados]);

  // Sincronizar automáticamente el campo activo al área de la card seleccionada
  useEffect(() => {
    if (camposAgrupados.length > 0) {
      setCampoActivoIdx(matchedIdx);
    }
  }, [matchedIdx, camposAgrupados.length]);

  const campoActual = camposAgrupados[campoActivoIdx] || null;

  const getValorCotejo = (matriculaId: number, indicadorId: number) => {
    const key = `${matriculaId}_${indicadorId}`;
    if (key in cambiosCotejo) return cambiosCotejo[key].nivel_id;
    const reg = matriz?.registros.find(
      (r) => r.matricula_id === matriculaId && r.indicador_logro_id === indicadorId
    );
    return reg ? reg.nivel_logro_id : null;
  };

  const setValorCotejo = (matriculaId: number, indicadorId: number, nivelId: number) => {
    const key = `${matriculaId}_${indicadorId}`;
    const nuevoNivel = getValorCotejo(matriculaId, indicadorId) === nivelId ? null : nivelId;
    setCambiosCotejo((prev) => ({ ...prev, [key]: { nivel_id: nuevoNivel, obs: prev[key]?.obs || '' } }));
  };

  const handleGuardarCotejo = async () => {
    const keys = Object.keys(cambiosCotejo);
    if (keys.length === 0 || !paraleloId || !periodoId) {
      if (keys.length === 0) toast('No hay cambios pendientes de guardar', { icon: 'ℹ️' });
      return;
    }
    try {
      setGuardando(true);
      const registros = keys.map((k) => {
        const [matId, indId] = k.split('_').map(Number);
        return {
          matricula_id: matId,
          indicador_logro_id: indId,
          periodo_evaluacion_id: periodoId,
          nivel_logro_id: cambiosCotejo[k].nivel_id,
          observaciones: cambiosCotejo[k].obs || null,
        };
      });
      const res = await inicialService.guardarCotejoBulk(registros);
      toast.success(res.message || 'Evaluaciones guardadas correctamente');
      setCambiosCotejo({});
      setMatriz(await inicialService.getMatrizCotejo(paraleloId, periodoId));
    } catch (err: any) {
      console.error('Error al guardar cotejo:', err);
      toast.error('Error al guardar evaluaciones');
    } finally {
      setGuardando(false);
    }
  };

  // Crear indicador
  const handleCrearIndicador = async () => {
    if (!nuevaDescInd.trim()) {
      toast.error('Por favor escribe la descripción del indicador');
      return;
    }
    if (!campoActual || !campoActual.gmId) {
      toast.error('No se ha podido identificar el campo de desarrollo');
      return;
    }
    if (!paraleloId || !periodoId) {
      toast.error('Falta información de curso o trimestre');
      return;
    }
    try {
      setGuardando(true);
      await inicialService.crearIndicador({
        grado_materia_id: campoActual.gmId,
        descripcion: nuevaDescInd.trim(),
        orden: (campoActual.indicadores?.length || 0) + 1,
        periodo_evaluacion_id: periodoId,
      });
      toast.success('Indicador creado correctamente');
      setNuevaDescInd('');
      setDialogNuevoInd(false);
      setMatriz(await inicialService.getMatrizCotejo(paraleloId, periodoId));
    } catch (err: any) {
      console.error('Error al crear indicador:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al crear indicador');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal editar indicador
  const handleAbrirEditarIndicador = (ind: IndicadorLogro) => {
    setIndAEditar(ind);
    setEditDescInd(ind.descripcion);
  };

  // Guardar edición de indicador
  const handleGuardarEditarIndicador = async () => {
    if (!indAEditar || !editDescInd.trim()) return;
    setGuardando(true);
    try {
      await inicialService.actualizarIndicador(indAEditar.id, {
        descripcion: editDescInd.trim(),
      });
      toast.success('Indicador actualizado');
      setIndAEditar(null);
      setMatriz(await inicialService.getMatrizCotejo(paraleloId, periodoId));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al actualizar indicador');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal eliminar indicador
  const handleAbrirEliminarIndicador = (ind: IndicadorLogro) => {
    setIndAEliminar(ind);
  };

  // Confirmar eliminación de indicador
  const handleConfirmarEliminarIndicador = async () => {
    if (!indAEliminar) return;
    setEliminandoInd(true);
    try {
      await inicialService.eliminarIndicador(indAEliminar.id);
      toast.success('Indicador eliminado');
      setIndAEliminar(null);
      setMatriz(await inicialService.getMatrizCotejo(paraleloId, periodoId));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al eliminar indicador');
    } finally {
      setEliminandoInd(false);
    }
  };

  // ── Helpers TAB 2 (Informes Descriptivos) ──
  useEffect(() => {
    if (!estudianteSel) return;
    const inf = informes.find((i) => i.matricula_id === estudianteSel.matricula_id);
    setTextoInforme(inf?.texto || '');
    setObservacionesDocente(inf?.observaciones_docente || '');
  }, [estudianteSel, informes]);

  const handleGenerarIA = async () => {
    if (!estudianteSel || !periodoId) return;
    try {
      setGenerandoIA(true);
      const res = await inicialService.generarBorradorIA(estudianteSel.matricula_id, periodoId);
      setTextoInforme(res.texto);
      toast.success('Borrador pedagógico generado con IA');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al generar informe con IA');
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleGuardarInforme = async () => {
    if (!estudianteSel || !periodoId) return;
    try {
      setGuardando(true);
      const res = await inicialService.guardarInforme({
        matricula_id: estudianteSel.matricula_id,
        periodo_evaluacion_id: periodoId,
        texto: textoInforme,
        observaciones_docente: observacionesDocente,
      });
      toast.success(res.message || 'Informe guardado');
      setInformes(await inicialService.getInformesParalelo(paraleloId, periodoId));
    } catch (err: any) {
      toast.error('Error al guardar informe');
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarBoletin = async () => {
    if (!estudianteSel || !periodoId) return;
    try {
      toast.loading('Generando boletín PDF...', { id: 'pdf-toast' });
      const blob = await inicialService.descargarBoletinPDF(estudianteSel.matricula_id, periodoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletin_inicial_${estudianteSel.apellidos}_${estudianteSel.nombres}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Boletín descargado', { id: 'pdf-toast' });
    } catch {
      toast.error('Error al descargar el PDF', { id: 'pdf-toast' });
    }
  };

  const handleDescargarReporteGeneral = async (formato: 'pdf' | 'excel') => {
    if (!paraleloId || !periodoId) return;
    try {
      toast.loading(`Generando Reporte General (${formato.toUpperCase()})...`, { id: 'rep-gen-toast' });
      const blob = await inicialService.descargarCentralizadorInformesReporte(paraleloId, periodoId, formato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-general-informes-${paraleloNombre || 'curso'}-T${periodoId}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Reporte General descargado (${formato.toUpperCase()})`, { id: 'rep-gen-toast' });
    } catch {
      toast.error('Error al descargar Reporte General', { id: 'rep-gen-toast' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={30} sx={{ color: gold }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Cargando calificaciones cualitativas de Inicial...
        </Typography>
      </Box>
    );
  }

  const cambiosPracticasCount = Object.keys(cambiosPracticas).length;
  const cambiosCotejoCount = Object.keys(cambiosCotejo).length;

  return (
    <Box sx={{ pb: 6 }}>

      {/* ══ TABS PRINCIPALES (Barra Dorada / Azul con degradé) ══ */}
      <Box sx={{ mb: 3, borderRadius: '16px', background: gradBg, p: { xs: 0.5, md: 1 } }}>
        <Tabs
          value={tabPrincipal}
          onChange={(_, v) => setTabPrincipal(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 38, md: 48 },
            '& .MuiTabs-flexContainer': { flexWrap: 'nowrap' },
            '& .MuiTabs-scrollButtons': { color: onGrad, '&.Mui-disabled': { opacity: 0.3 } },
            '& .MuiTab-root': {
              borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              minWidth: 'max-content', minHeight: { xs: 38, md: 48 },
              fontSize: { xs: '0.8rem', md: '0.95rem' },
              color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
              whiteSpace: 'nowrap',
              '&:hover': { color: onGrad },
            },
            '& .Mui-selected': { color: `${onGrad} !important` },
            '& .MuiTabs-indicator': { backgroundColor: onGrad, height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          {/* TAB 0: Prácticas Cualitativas */}
          <Tab
            icon={<TaskIcon sx={{ fontSize: { xs: 16, md: 19 } }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Calificación de Prácticas</span>
                {cambiosPracticasCount > 0 && (
                  <Box sx={{
                    fontSize: 9, fontWeight: 800, borderRadius: '6px', px: 0.8, py: 0.1, lineHeight: 1.4,
                    bgcolor: isDark ? alpha('#000', 0.35) : alpha('#fff', 0.35), color: onGrad,
                  }}>
                    {cambiosPracticasCount} sin guardar
                  </Box>
                )}
              </Box>
            }
          />

          {/* TAB 1: Listas de Cotejo */}
          <Tab
            icon={<EditNoteIcon sx={{ fontSize: { xs: 16, md: 19 } }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Listas de Cotejo</span>
                {cambiosCotejoCount > 0 && (
                  <Box sx={{
                    fontSize: 9, fontWeight: 800, borderRadius: '6px', px: 0.8, py: 0.1, lineHeight: 1.4,
                    bgcolor: isDark ? alpha('#000', 0.35) : alpha('#fff', 0.35), color: onGrad,
                  }}>
                    {cambiosCotejoCount} sin guardar
                  </Box>
                )}
              </Box>
            }
          />

          {/* TAB 2: Informes Descriptivos */}
          <Tab
            icon={<BrainIcon sx={{ fontSize: { xs: 16, md: 19 } }} />}
            iconPosition="start"
            label="Informes Descriptivos (IA)"
          />
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 0: CALIFICACIÓN DE PRÁCTICAS ("Muy Bien", "Bien", "Regular", etc.)
          ═══════════════════════════════════════════════════════════════════════ */}
      {tabPrincipal === 0 && (
        <Fade in timeout={350}>
          <Box>
            {/* Sub-header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: gold, boxShadow: `0 0 8px ${alpha(gold, 0.6)}` }} />
                <Typography variant="body1" fontWeight={800} sx={{ color: gold }}>
                  Valoración Formativa de Prácticas
                </Typography>
                <Chip
                  label="Sin nota clásica · Escala Cualitativa"
                  size="small"
                  sx={{ bgcolor: alpha(gold, 0.12), color: gold, fontWeight: 700, fontSize: 11 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={guardando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SaveIcon />}
                  disabled={guardando || cambiosPracticasCount === 0}
                  onClick={handleGuardarCalificacionesPractica}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 2.5, py: 0.8,
                    background: gradBg, color: onGrad,
                    boxShadow: `0 4px 12px ${alpha(gold, 0.3)}`,
                  }}
                >
                  {guardando ? 'Guardando...' : `Guardar Calificaciones (${cambiosPracticasCount})`}
                </Button>
              </Box>
            </Box>

            {/* Selector de Práctica */}
            {practicas.length === 0 ? (
              <Box sx={{
                textAlign: 'center', py: 8, px: 3, borderRadius: '18px',
                border: `2px dashed ${alpha(gold, 0.3)}`, bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
              }}>
                <TaskIcon sx={{ fontSize: 44, color: alpha(gold, 0.4), mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: gold, mb: 0.5 }}>
                  Aún no hay prácticas registradas en este trimestre
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 2 }}>
                  Publicá fichas o actividades desde el apartado de <strong>Tareas</strong> para poder valorarlas cualitativamente aquí.
                </Typography>
                {props.onVolver && (
                  <Button variant="outlined" onClick={props.onVolver} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
                    Ir a Tareas de Inicial
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                {/* Carrusel / Chips de selección de práctica */}
                <Box sx={{
                  p: 2, mb: 2.5, borderRadius: '16px', border: cardBorder, bgcolor: cardBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
                }}>
                  <Box sx={{ flex: 1, minWidth: 260 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                      Seleccioná la práctica a calificar:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 } }}>
                      {practicas.map((pr) => {
                        const sel = pr.id === practicaSelId;
                        return (
                          <Chip
                            key={pr.id}
                            label={pr.nombre}
                            onClick={() => setPracticaSelId(pr.id)}
                            sx={{
                              fontWeight: 800, fontSize: 12, py: 2, px: 1, borderRadius: '10px', cursor: 'pointer',
                              bgcolor: sel ? alpha(gold, isDark ? 0.22 : 0.12) : isDark ? alpha('#fff', 0.04) : '#f1f5f9',
                              color: sel ? gold : 'text.primary',
                              border: `1.5px solid ${sel ? gold : 'transparent'}`,
                              '&:hover': { bgcolor: alpha(gold, 0.15) },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Acciones masivas rápidas */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Llenado rápido:
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarcarTodos('muy_bien')}
                      sx={{ textTransform: 'none', fontSize: 11.5, fontWeight: 700, borderRadius: '8px', borderColor: '#16a34a', color: '#16a34a' }}
                    >
                      🌟 Todos Muy Bien
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarcarTodos('bien')}
                      sx={{ textTransform: 'none', fontSize: 11.5, fontWeight: 700, borderRadius: '8px', borderColor: '#0288d1', color: '#0288d1' }}
                    >
                      👍 Todos Bien
                    </Button>
                  </Box>
                </Box>

                {/* Tabla de Calificación Cualitativa de Estudiantes */}
                {loadingPracticaDetalle ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <CircularProgress size={26} sx={{ color: gold }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Cargando alumnos de la práctica...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ borderRadius: '16px', border: cardBorder, overflow: 'hidden', boxShadow: cardShadow, bgcolor: cardBg }}>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: isDark ? '#1a2233' : '#eef6fc', borderBottom: `2px solid ${alpha(gold, 0.2)}` }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, fontSize: 12, minWidth: 220 }}>
                              Párvulo / Alumno
                            </th>
                            <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, fontSize: 12, minWidth: 150 }}>
                              Evidencia Virtual
                            </th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, fontSize: 12, minWidth: 320 }}>
                              Valoración Cualitativa
                            </th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, fontSize: 12, minWidth: 240 }}>
                              Mensaje / Observación
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {calificacionesPractica.map((item) => {
                            return (
                              <tr key={item.matricula_id} style={{ borderBottom: `1px solid ${lineColor}` }}>

                                {/* Alumno */}
                                <td style={{ padding: '10px 16px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <Avatar
                                      src={item.foto_url}
                                      sx={{ width: 36, height: 36, fontSize: 12, fontWeight: 800, background: gradBg, color: onGrad }}
                                    >
                                      {item.nombres?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={800}>
                                        {item.apellidos}, {item.nombres}
                                      </Typography>
                                      <Typography variant="caption" color="text.disabled">
                                        RUDE: {item.codigo_rude || '—'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </td>

                                {/* Evidencia virtual de los papás */}
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                  {item.tiene_entrega_archivo && item.archivo_url ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<CameraIcon sx={{ fontSize: 14 }} />}
                                      onClick={() => setModalEvidenciaUrl(item.archivo_url || null)}
                                      sx={{
                                        textTransform: 'none', fontSize: 11, fontWeight: 700, borderRadius: '8px',
                                        borderColor: '#16a34a', color: '#16a34a', bgcolor: alpha('#16a34a', 0.08),
                                      }}
                                    >
                                      Ver foto enviada
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', fontSize: 11 }}>
                                      Sin evidencia virtual
                                    </Typography>
                                  )}
                                  {item.comentario_familia && (
                                    <Tooltip title={`Mensaje de los papás: "${item.comentario_familia}"`}>
                                      <Chip
                                        icon={<CommentIcon sx={{ fontSize: '10px !important' }} />}
                                        label="Nota de familia"
                                        size="small"
                                        sx={{ height: 18, fontSize: 9.5, mt: 0.4, display: 'block', maxWidth: 120, mx: 'auto' }}
                                      />
                                    </Tooltip>
                                  )}
                                </td>

                                {/* Botones Cualitativos: Muy Bien, Bien, Regular, Necesita Apoyo */}
                                <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                  <Box sx={{ display: 'inline-flex', gap: 0.6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {ESCALA_CUALITATIVA_INICIAL.map((esc) => {
                                      const sel = item.nivel_cualitativo === esc.key;
                                      return (
                                        <Tooltip key={esc.key} title={esc.desc}>
                                          <Box
                                            component="button"
                                            type="button"
                                            onClick={() => handleSetNivelCualitativo(item.matricula_id, esc.key)}
                                            sx={{
                                              display: 'flex', alignItems: 'center', gap: 0.5,
                                              px: 1.4, py: 0.6, borderRadius: '9px',
                                              cursor: 'pointer', border: `1.5px solid ${sel ? esc.color : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                              bgcolor: sel ? esc.color : isDark ? alpha('#fff', 0.02) : '#f8fafc',
                                              color: sel ? '#ffffff' : 'text.primary',
                                              fontWeight: sel ? 800 : 600, fontSize: 12,
                                              boxShadow: sel ? `0 2px 8px ${alpha(esc.color, 0.4)}` : 'none',
                                              transform: sel ? 'scale(1.04)' : 'none',
                                              transition: 'all 0.15s ease',
                                              '&:hover': {
                                                borderColor: esc.color,
                                                bgcolor: sel ? esc.color : alpha(esc.color, isDark ? 0.2 : 0.1),
                                                transform: 'translateY(-1px)',
                                              },
                                            }}
                                          >
                                            <span>{esc.icon}</span>
                                            <span>{esc.label}</span>
                                          </Box>
                                        </Tooltip>
                                      );
                                    })}
                                  </Box>
                                </td>

                                {/* Observación pedagógica */}
                                <td style={{ padding: '10px 16px' }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Mensaje para la familia (ej: Buen trazo, con apoyo)..."
                                    value={item.observacion}
                                    onChange={(e) => handleSetObservacionPractica(item.matricula_id, e.target.value)}
                                    InputProps={{
                                      sx: { fontSize: 12, borderRadius: '8px' },
                                    }}
                                  />
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: LISTAS DE COTEJO (Con abreviaturas oficiales ED, DA, DO, DP y acciones sobre indicadores)
          ═══════════════════════════════════════════════════════════════════════ */}
      {tabPrincipal === 1 && (
        <Fade in timeout={350}>
          <Box>
            {/* Header del Tab */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: gold, boxShadow: `0 0 8px ${alpha(gold, 0.6)}` }} />
                <Typography variant="body1" fontWeight={800} sx={{ color: gold }}>
                  Listas de Cotejo por Campos de Desarrollo
                </Typography>
                <Chip
                  label={`${matriz?.estudiantes.length || 0} párvulos`}
                  size="small"
                  sx={{ bgcolor: alpha(gold, 0.12), color: gold, fontWeight: 700, fontSize: 11 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setDialogNuevoInd(true)}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 12.5,
                    border: `1.5px solid ${alpha(gold, 0.4)}`, color: gold, px: 2,
                    '&:hover': { bgcolor: alpha(gold, 0.08) },
                  }}
                >
                  Nuevo indicador
                </Button>
                <Button
                  startIcon={guardando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SaveIcon />}
                  disabled={guardando || cambiosCotejoCount === 0}
                  onClick={handleGuardarCotejo}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: 12.5,
                    background: gradBg, color: onGrad, px: 2.5,
                    boxShadow: `0 4px 12px ${alpha(gold, 0.3)}`,
                  }}
                >
                  {guardando ? 'Guardando...' : `Guardar Cotejo (${cambiosCotejoCount})`}
                </Button>
              </Box>
            </Box>

            {/* Tarjeta de Área Activa Enfocada (Da sentido a la card seleccionada) */}
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: '16px',
                border: cardBorder,
                bgcolor: cardBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                boxShadow: isDark
                  ? `0 4px 20px rgba(0,0,0,0.3)`
                  : `0 4px 16px rgba(0,0,0,0.04)`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: gradBg,
                    color: onGrad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(gold, 0.35)}`,
                  }}
                >
                  {ICONOS_CAMPOS[campoActual?.codigo || ''] || <BookIcon />}
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 800,
                        color: gold,
                      }}
                    >
                      Área de Calificación
                    </Typography>
                    {campoActual?.codigo && (
                      <Chip
                        label={campoActual.codigo}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10.5,
                          fontWeight: 800,
                          bgcolor: alpha(gold, 0.12),
                          color: gold,
                        }}
                      />
                    )}
                    <Chip
                      label={`${campoActual?.indicadores?.length || 0} indicadores`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10.5,
                        fontWeight: 700,
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', mt: 0.2 }}>
                    {campoActual?.nombre || 'Campo de Desarrollo'}
                  </Typography>
                </Box>
              </Box>

              {/* Botón para cambiar a otra área si el docente lo necesita sin salir */}
              {camposAgrupados.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setMostrarSelectorAreas((prev) => !prev)}
                  startIcon={<SwapIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    borderColor: alpha(gold, 0.35),
                    color: gold,
                    '&:hover': {
                      borderColor: gold,
                      bgcolor: alpha(gold, 0.08),
                    },
                  }}
                >
                  {mostrarSelectorAreas ? 'Fijar esta área' : 'Cambiar de área'}
                </Button>
              )}
            </Box>

            {/* Selector desplegable de áreas (solo si el docente pulsa Cambiar de área) */}
            {mostrarSelectorAreas && camposAgrupados.length > 1 && (
              <Fade in timeout={250}>
                <Box
                  sx={{
                    mb: 2.5,
                    p: 1.5,
                    borderRadius: '14px',
                    border: `1.5px dashed ${alpha(gold, 0.35)}`,
                    bgcolor: isDark ? alpha(gold, 0.04) : alpha(gold, 0.02),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    overflowX: 'auto',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', px: 1, whiteSpace: 'nowrap' }}>
                    Seleccionar otra área:
                  </Typography>
                  {camposAgrupados.map((c, idx) => (
                    <Chip
                      key={c.codigo || idx}
                      icon={ICONOS_CAMPOS[c.codigo] || <BookIcon />}
                      label={c.nombre}
                      onClick={() => {
                        setCampoActivoIdx(idx);
                        setMostrarSelectorAreas(false);
                      }}
                      sx={{
                        fontWeight: 800,
                        fontSize: 12,
                        py: 2,
                        px: 1,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        bgcolor: campoActivoIdx === idx ? alpha(gold, 0.2) : isDark ? alpha('#fff', 0.03) : '#f8fafc',
                        color: campoActivoIdx === idx ? gold : 'text.primary',
                        border: `1.5px solid ${campoActivoIdx === idx ? gold : 'transparent'}`,
                        '&:hover': { bgcolor: alpha(gold, 0.12) },
                      }}
                    />
                  ))}
                </Box>
              </Fade>
            )}

            {/* Leyenda con abreviaturas oficiales (ED, DA, DO, DP) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5, px: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Tocá una abreviatura para marcar o desmarcar la valoración del indicador:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {niveles.map((n) => {
                  return (
                    <Box key={n.codigo} sx={{
                      display: 'flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.3, borderRadius: '8px',
                      bgcolor: alpha(n.color, 0.12), border: `1px solid ${alpha(n.color, 0.3)}`,
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.color }} />
                      <Typography variant="caption" sx={{ color: n.color, fontWeight: 800 }}>
                        {n.codigo}: {n.nombre}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Tabla de Indicadores de Logro */}
            {!campoActual || campoActual.indicadores.length === 0 ? (
              <Box sx={{
                textAlign: 'center', py: 8, borderRadius: '16px',
                border: `2px dashed ${alpha(gold, 0.3)}`, bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
              }}>
                <BookIcon sx={{ fontSize: 44, color: alpha(gold, 0.4), mb: 1 }} />
                <Typography sx={{ color: gold, fontWeight: 800 }}>Sin indicadores en este campo</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 2 }}>
                  Agregá un indicador pedagógico para comenzar a evaluar la lista de cotejo.
                </Typography>
                <Button startIcon={<AddIcon />} onClick={() => setDialogNuevoInd(true)} sx={{ borderRadius: '10px', textTransform: 'none', background: gradBg, color: onGrad, fontWeight: 700 }}>
                  Agregar indicador
                </Button>
              </Box>
            ) : (
              <Box sx={{ borderRadius: '16px', border: cardBorder, overflow: 'hidden', boxShadow: cardShadow, bgcolor: cardBg }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: isDark ? '#1a2233' : '#eef6fc', borderBottom: `2px solid ${alpha(gold, 0.2)}` }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, fontSize: 12, minWidth: 220 }}>
                          Párvulo
                        </th>
                        {campoActual.indicadores.map((ind, i) => (
                          <th key={ind.id} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, fontSize: 12, minWidth: 160 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Tooltip title={ind.descripcion}>
                                <Typography variant="caption" sx={{
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden', fontWeight: 800, lineHeight: 1.3, textAlign: 'center',
                                }}>
                                  {i + 1}. {ind.descripcion}
                                </Typography>
                              </Tooltip>

                              {/* Opciones de Editar y Eliminar sobre el indicador */}
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.4 }}>
                                <Tooltip title="Editar indicador">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAbrirEditarIndicador(ind)}
                                    sx={{
                                      width: 24, height: 24, borderRadius: '6px',
                                      bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1),
                                      color: '#3b82f6',
                                      '&:hover': { bgcolor: '#3b82f6', color: '#fff' },
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar indicador">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAbrirEliminarIndicador(ind)}
                                    sx={{
                                      width: 24, height: 24, borderRadius: '6px',
                                      bgcolor: isDark ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.1),
                                      color: '#ef4444',
                                      '&:hover': { bgcolor: '#ef4444', color: '#fff' },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matriz?.estudiantes.map((est) => {
                        return (
                          <tr key={est.matricula_id} style={{ borderBottom: `1px solid ${lineColor}` }}>
                            <td style={{ padding: '10px 16px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Avatar src={est.foto_url} sx={{ width: 36, height: 36, fontSize: 12, fontWeight: 800, background: gradBg, color: onGrad }}>
                                  {est.nombres.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={800}>
                                    {est.apellidos}, {est.nombres}
                                  </Typography>
                                  <Typography variant="caption" color="text.disabled">
                                    RUDE: {est.codigo_rude || '—'}
                                  </Typography>
                                </Box>
                              </Box>
                            </td>
                            {campoActual.indicadores.map((ind) => {
                              const valorActual = getValorCotejo(est.matricula_id, ind.id);
                              return (
                                <td key={ind.id} style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                  <Box sx={{
                                    display: 'inline-flex', gap: 0.3, p: '2px', borderRadius: '8px',
                                    bgcolor: isDark ? alpha('#fff', 0.03) : '#f1f5f9',
                                  }}>
                                    {/* Botones con Abreviaturas oficiales (ED, DA, DO, DP) */}
                                    {niveles.map((n) => {
                                      const sel = valorActual === n.id;
                                      return (
                                        <Tooltip key={n.codigo} title={`${n.codigo} - ${n.nombre}`} arrow>
                                          <Box
                                            component="button"
                                            type="button"
                                            onClick={() => setValorCotejo(est.matricula_id, ind.id, n.id)}
                                            sx={{
                                              width: 32, height: 27, borderRadius: '6px', border: 'none', cursor: 'pointer',
                                              fontSize: 11.5, fontWeight: sel ? 800 : 600, fontFamily: 'inherit',
                                              bgcolor: sel ? n.color : 'transparent',
                                              color: sel ? '#fff' : isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
                                              boxShadow: sel ? `0 2px 6px ${alpha(n.color, 0.45)}` : 'none',
                                              transform: sel ? 'scale(1.06)' : 'none',
                                              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                              '&:hover': { bgcolor: sel ? n.color : alpha(n.color, 0.15), color: sel ? '#fff' : n.color },
                                            }}
                                          >
                                            {n.codigo}
                                          </Box>
                                        </Tooltip>
                                      );
                                    })}
                                  </Box>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: INFORMES DESCRIPTIVOS CON IA
          ═══════════════════════════════════════════════════════════════════════ */}
      {tabPrincipal === 2 && (
        <Fade in timeout={350}>
          <Box>
            {/* Barra superior de cambio de vista y descargas */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, px: 0.5, flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: gold, boxShadow: `0 0 8px ${alpha(gold, 0.6)}` }} />
                <Typography variant="body1" fontWeight={800} sx={{ color: gold }}>
                  Informes Cualitativos del Desarrollo Integral
                </Typography>
                <Chip
                  label={`${informes.filter(i => i.texto?.trim()).length} de ${matriz?.estudiantes.length || 0} cargados`}
                  size="small"
                  sx={{ bgcolor: alpha(gold, 0.12), color: gold, fontWeight: 700, fontSize: 11 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', borderRadius: '10px', p: 0.4, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${borderField}` }}>
                  <Button
                    size="small"
                    onClick={() => setVistaInformes('general')}
                    sx={{
                      borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: 12, px: 1.6, py: 0.4,
                      bgcolor: vistaInformes === 'general' ? (isDark ? alpha(gold, 0.25) : alpha(gold, 0.15)) : 'transparent',
                      color: vistaInformes === 'general' ? gold : 'text.secondary',
                    }}
                  >
                    📋 Reporte General del Aula
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setVistaInformes('individual')}
                    sx={{
                      borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: 12, px: 1.6, py: 0.4,
                      bgcolor: vistaInformes === 'individual' ? (isDark ? alpha(gold, 0.25) : alpha(gold, 0.15)) : 'transparent',
                      color: vistaInformes === 'individual' ? gold : 'text.secondary',
                    }}
                  >
                    Individual por Párvulo
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PdfIcon />}
                  onClick={() => handleDescargarReporteGeneral('pdf')}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#ef4444', color: '#ef4444' }}
                >
                  Reporte General PDF
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TableChartIcon />}
                  onClick={() => handleDescargarReporteGeneral('excel')}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#10b981', color: '#10b981' }}
                >
                  Excel
                </Button>
              </Box>
            </Box>

            {vistaInformes === 'general' ? (
              /* VISTA GENERAL: TARJETAS CON EL TEXTO REGISTRADO EN EL SISTEMA */
              <Box>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Filtrar por estudiante, RUDE o palabras del texto..."
                    value={busquedaGeneral}
                    onChange={(e) => setBusquedaGeneral(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 340 }, ...fieldSx }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Mostrando texto cualitativo registrado para {gradoNombre} "{paraleloNombre}" · {periodoNombre}
                  </Typography>
                </Box>

                {matriz?.estudiantes.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No hay estudiantes en este curso.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {matriz?.estudiantes
                      .filter((est) => {
                        if (!busquedaGeneral.trim()) return true;
                        const q = busquedaGeneral.toLowerCase();
                        const inf = informes.find((i) => i.matricula_id === est.matricula_id);
                        return (
                          est.nombres.toLowerCase().includes(q) ||
                          est.apellidos.toLowerCase().includes(q) ||
                          (est.codigo_rude && est.codigo_rude.includes(q)) ||
                          (inf?.texto && inf.texto.toLowerCase().includes(q))
                        );
                      })
                      .map((est, idx) => {
                        const inf = informes.find((i) => i.matricula_id === est.matricula_id);
                        const tieneTexto = Boolean(inf?.texto?.trim());
                        const esPublicado = inf?.estado === 'publicado';

                        return (
                          <Grid key={est.matricula_id} size={{ xs: 12, md: 6, lg: 6 }}>
                            <Box
                              sx={{
                                p: 2.2,
                                borderRadius: '16px',
                                border: cardBorder,
                                bgcolor: cardBg,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  borderColor: alpha(gold, 0.4),
                                  boxShadow: `0 6px 18px ${alpha(gold, 0.15)}`,
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  bgcolor: esPublicado ? '#2563eb' : (tieneTexto ? gold : '#94a3b8'),
                                }
                              }}
                            >
                              {/* Header del estudiante */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pl: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                  <Avatar
                                    src={est.foto_url}
                                    sx={{ width: 36, height: 36, fontWeight: 800, fontSize: 13, bgcolor: gold }}
                                  >
                                    {est.nombres.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.92rem', lineHeight: 1.2 }}>
                                      {idx + 1}. {est.apellidos}, {est.nombres}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                                      RUDE: {est.codigo_rude || '—'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Chip
                                    label={esPublicado ? 'Publicado' : (tieneTexto ? 'Borrador' : 'Pendiente')}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      bgcolor: esPublicado ? alpha('#16a34a', 0.15) : (tieneTexto ? alpha(gold, 0.18) : alpha('#94a3b8', 0.15)),
                                      color: esPublicado ? '#16a34a' : (tieneTexto ? gold : '#94a3b8'),
                                      border: `1px solid ${esPublicado ? alpha('#16a34a', 0.3) : (tieneTexto ? alpha(gold, 0.4) : alpha('#94a3b8', 0.3))}`
                                    }}
                                  />
                                  <Tooltip title="Editar informe en modo individual">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEstudianteSel(est);
                                        setVistaInformes('individual');
                                      }}
                                      sx={{ color: gold, bgcolor: alpha(gold, 0.1) }}
                                    >
                                      <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>

                              {/* Texto del informe cualitativo */}
                              <Box
                                sx={{
                                  p: 1.6,
                                  borderRadius: '12px',
                                  bgcolor: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                                  border: `1px solid ${borderField}`,
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color={tieneTexto ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    fontSize: '0.84rem',
                                    lineHeight: 1.55,
                                    fontStyle: tieneTexto ? 'normal' : 'italic',
                                    textAlign: 'justify',
                                  }}
                                >
                                  {inf?.texto || 'Sin informe cualitativo registrado para este período.'}
                                </Typography>

                                {inf?.observaciones_docente && (
                                  <Box sx={{ mt: 1.2, pt: 1, borderTop: `1px dashed ${borderField}` }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: gold, display: 'block', mb: 0.2 }}>
                                      Recomendaciones:
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                                      {inf.observaciones_docente}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                  </Grid>
                )}
              </Box>
            ) : (
              /* VISTA INDIVIDUAL (EXISTENTE) */
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
                  <Box sx={{ p: 2, borderRadius: '16px', border: cardBorder, bgcolor: cardBg, maxHeight: '75vh', overflowY: 'auto' }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                      Párvulos ({matriz?.estudiantes.length || 0})
                    </Typography>
                    <Stack spacing={0.8}>
                      {matriz?.estudiantes.map((est) => {
                        const sel = estudianteSel?.matricula_id === est.matricula_id;
                        const tieneInf = informes.some((i) => i.matricula_id === est.matricula_id && i.texto?.trim());
                        return (
                          <Box
                            key={est.matricula_id}
                            onClick={() => setEstudianteSel(est)}
                            sx={{
                              p: 1.2, borderRadius: '12px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              border: `1.5px solid ${sel ? gold : 'transparent'}`,
                              bgcolor: sel ? alpha(gold, isDark ? 0.18 : 0.1) : isDark ? alpha('#fff', 0.02) : '#f8fafc',
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: alpha(gold, 0.12) },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={est.foto_url} sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 800 }}>
                                {est.nombres.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={800} sx={{ fontSize: 12.5 }}>
                                  {est.apellidos}, {est.nombres}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  RUDE: {est.codigo_rude || '—'}
                                </Typography>
                              </Box>
                            </Box>
                            {tieneInf && <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
                  {estudianteSel ? (
                    <Box sx={{ p: 3, borderRadius: '18px', border: cardBorder, bgcolor: cardBg }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            Informe Descriptivo · {estudianteSel.nombres} {estudianteSel.apellidos}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gradoNombre} "{paraleloNombre}" · {periodoNombre}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            startIcon={generandoIA ? <CircularProgress size={16} /> : <SparklesIcon />}
                            disabled={generandoIA}
                            onClick={handleGenerarIA}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: gold, color: gold }}
                          >
                            Redactar con IA
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PdfIcon />}
                            onClick={handleDescargarBoletin}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                          >
                            Boletín PDF
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={guardando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SaveIcon />}
                            disabled={guardando}
                            onClick={handleGuardarInforme}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, background: gradBg, color: onGrad }}
                          >
                            Guardar Informe
                          </Button>
                        </Box>
                      </Box>

                      <Stack spacing={2.5}>
                        <TextField
                          label="Desarrollo integral del párvulo (Cualitativo)"
                          multiline
                          rows={7}
                          fullWidth
                          value={textoInforme}
                          onChange={(e) => setTextoInforme(e.target.value)}
                          placeholder="Redactá la síntesis cualitativa del desarrollo motriz, cognitivo y socioafectivo..."
                          sx={fieldSx}
                        />
                        <TextField
                          label="Recomendaciones y observaciones para la familia"
                          multiline
                          rows={3}
                          fullWidth
                          value={observacionesDocente}
                          onChange={(e) => setObservacionesDocente(e.target.value)}
                          placeholder="Sugerencias prácticas para continuar apoyando en casa..."
                          sx={fieldSx}
                        />
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography color="text.secondary">Seleccioná un párvulo para redactar su informe.</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALES CON EL ESTILO DE NUEVOHORARIOMODAL
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* ── MODAL: NUEVO INDICADOR (Estilo NuevoHorarioModal) ── */}
      <Dialog
        open={dialogNuevoInd}
        onClose={() => !guardando && setDialogNuevoInd(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: modalPaperSx }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
              }}>
                LISTAS DE COTEJO · EVALUACIÓN INICIAL
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AddIcon sx={{ color: brand, fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Nuevo Indicador de Logro
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => !guardando && setDialogNuevoInd(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
                color: 'text.secondary', transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {camposAgrupados.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel sx={{ color: 'text.secondary', fontWeight: 600 }}>Campo de desarrollo *</InputLabel>
              <Select
                value={campoActivoIdx}
                label="Campo de desarrollo *"
                onChange={(e) => setCampoActivoIdx(Number(e.target.value))}
                disabled={guardando}
                sx={fieldSx}
              >
                {camposAgrupados.map((c, i) => (
                  <MenuItem key={c.codigo || i} value={i} sx={{ fontWeight: 600, fontSize: 13 }}>
                    {c.nombre} ({c.codigo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Descripción del indicador *"
            fullWidth
            multiline
            rows={3}
            placeholder="Ej: Reconoce y nombra los colores primarios en objetos de su entorno..."
            value={nuevaDescInd}
            onChange={(e) => setNuevaDescInd(e.target.value)}
            disabled={guardando}
            sx={fieldSx}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={() => setDialogNuevoInd(false)}
            disabled={guardando}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCrearIndicador}
            disabled={guardando || !nuevaDescInd.trim()}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.8, py: 1,
              background: gradBg, color: onGrad,
              boxShadow: `0 4px 14px ${alpha(brand, 0.35)}`,
              '&:hover': { background: gradBg, opacity: 0.92 },
            }}
          >
            {guardando ? <CircularProgress size={18} sx={{ color: onGrad }} /> : 'Crear Indicador'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: EDITAR INDICADOR (Estilo NuevoHorarioModal) ── */}
      <Dialog
        open={Boolean(indAEditar)}
        onClose={() => !guardando && setIndAEditar(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: modalPaperSx }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
              }}>
                LISTAS DE COTEJO · EVALUACIÓN INICIAL
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <EditIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Editar Indicador de Logro
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => !guardando && setIndAEditar(null)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
                color: 'text.secondary', transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <TextField
            label="Descripción del indicador *"
            fullWidth
            multiline
            rows={3}
            value={editDescInd}
            onChange={(e) => setEditDescInd(e.target.value)}
            disabled={guardando}
            sx={fieldSx}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={() => setIndAEditar(null)}
            disabled={guardando}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEditarIndicador}
            disabled={guardando || !editDescInd.trim()}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.8, py: 1,
              background: gradBg, color: onGrad,
              boxShadow: `0 4px 14px ${alpha(brand, 0.35)}`,
              '&:hover': { background: gradBg, opacity: 0.92 },
            }}
          >
            {guardando ? <CircularProgress size={18} sx={{ color: onGrad }} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: CONFIRMAR ELIMINAR INDICADOR (Estilo NuevoHorarioModal) ── */}
      <Dialog
        open={Boolean(indAEliminar)}
        onClose={() => !eliminandoInd && setIndAEliminar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: modalPaperSx }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: alpha('#ef4444', isDark ? 0.15 : 0.08) }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#ef4444', mb: 0.4,
              }}>
                CONFIRMAR ACCIÓN
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                  background: alpha('#ef4444', 0.15), border: `1px solid ${alpha('#ef4444', 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DeleteIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  ¿Eliminar Indicador?
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => !eliminandoInd && setIndAEliminar(null)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
                color: 'text.secondary', transition: 'all 0.15s',
                '&:hover': { background: alpha('#ef4444', 0.12), borderColor: alpha('#ef4444', 0.4), color: '#ef4444' },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
            Se eliminará el indicador: <strong>"{indAEliminar?.descripcion}"</strong>. Se perderán las marcas de cotejo asociadas a este indicador.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={() => setIndAEliminar(null)}
            disabled={eliminandoInd}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminarIndicador}
            disabled={eliminandoInd}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.8, py: 1,
            }}
          >
            {eliminandoInd ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Eliminar Indicador'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: VISOR DE EVIDENCIA (Estilo NuevoHorarioModal) ── */}
      <Dialog
        open={Boolean(modalEvidenciaUrl)}
        onClose={() => setModalEvidenciaUrl(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: modalPaperSx }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
              }}>
                EVIDENCIA DE FAMILIA
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CameraIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Fotografía / Archivo Entregado
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setModalEvidenciaUrl(null)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
                color: 'text.secondary', transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ textAlign: 'center', py: 3, px: 3 }}>
          {modalEvidenciaUrl && (
            modalEvidenciaUrl.endsWith('.pdf') ? (
              <Button
                variant="contained"
                component="a"
                href={modalEvidenciaUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
                sx={{
                  borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                  background: gradBg, color: onGrad,
                }}
              >
                Abrir PDF en pestaña nueva
              </Button>
            ) : (
              <Box
                component="img"
                src={modalEvidenciaUrl}
                alt="Evidencia fotográfica"
                sx={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '14px', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              />
            )
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}` }}>
          <Button onClick={() => setModalEvidenciaUrl(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PanelEvaluacionInicial;