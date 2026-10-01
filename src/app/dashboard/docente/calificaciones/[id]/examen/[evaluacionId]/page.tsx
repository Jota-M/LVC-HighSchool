'use client';
// app/dashboard/docente/calificaciones/[id]/examen/[evaluacionId]/page.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Chip, Paper, Avatar,
  TextField, Button, Stack, CircularProgress, Tooltip,
  IconButton, Divider, Alert, useTheme, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, ToggleButton, ToggleButtonGroup,
  Menu, MenuItem,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import { toast } from 'react-hot-toast';

import { useIntentosDocente, useDetalleIntentoDocente } from '@/hooks/useExamen';
import { evaluacionesService } from '@/services/notasService';
import { Evaluacion } from '@/types/notasTypes';
import { DetallePreguntaRespuesta, EstudianteIntentoItem } from '@/types/examenTypes';

// ─── Helpers de Estilo (Coherencia con Asistencia Resumen) ─────────────────────
const getPctColor = (pct: number) => {
  if (pct >= 85) return '#10b981';
  if (pct >= 51) return '#f59e0b';
  return '#ef4444';
};

const getPctGrad = (pct: number) => {
  if (pct >= 85) return 'linear-gradient(135deg,#10b981,#34d399)';
  if (pct >= 51) return 'linear-gradient(135deg,#f59e0b,#fbbf24)';
  return 'linear-gradient(135deg,#ef4444,#f87171)';
};

// Helper para parsear opciones de manera robusta
function parseOpciones(opciones: any): string[] {
  if (!opciones) return [];
  if (Array.isArray(opciones)) return opciones;
  if (typeof opciones === 'string') {
    try {
      const parsed = JSON.parse(opciones);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [opciones];
    }
  }
  return [];
}

export default function MonitoreoExamenPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();

  const routeId = String(params.id ?? '');
  const evaluacionId = Number(params.evaluacionId ?? 0);

  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  // Tokens de diseño coherentes con LVC (DrawerObservaciones / Calificaciones)
  const brand = gold;
  const brandDim = isDark ? 'rgba(250,204,21,0.08)' : 'rgba(2,136,209,0.08)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.22)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const borderField = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  // ── Datos de la evaluación ──
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [cargandoEval, setCargandoEval] = useState(true);

  useEffect(() => {
    if (!evaluacionId) return;
    setCargandoEval(true);
    evaluacionesService.obtenerPorId(evaluacionId)
      .then(res => setEvaluacion(res.data.evaluacion))
      .catch(err => {
        console.error('Error al cargar evaluación:', err);
        toast.error('No se pudo cargar la evaluación');
      })
      .finally(() => setCargandoEval(false));
  }, [evaluacionId]);

  // ── Lista de exámenes virtuales disponibles en este curso ──
  const [evaluacionesVirtuales, setEvaluacionesVirtuales] = useState<Evaluacion[]>([]);
  const [anchorElExamenes, setAnchorElExamenes] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const [asigId, perId] = routeId.split('-').map(Number);
    if (asigId && perId) {
      evaluacionesService.listar({
        asignacion_docente_id: asigId,
        periodo_evaluacion_id: perId,
        activo: true,
        limit: 100,
      }).then(res => {
        const virtuals = (res.data.evaluaciones || []).filter((e: Evaluacion) => e.modalidad === 'virtual');
        setEvaluacionesVirtuales(virtuals);
      }).catch(() => {});
    }
  }, [routeId]);

  // ── Intentos de estudiantes ──
  const {
    intentos,
    isLoading: cargandoIntentos,
    refrescar,
    reiniciarIntento,
    limpiarTodosIntentos,
  } = useIntentosDocente(evaluacionId);

  const [intentoSeleccionadoId, setIntentoSeleccionadoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'completos' | 'sin_iniciar'>('todos');
  const [guardandoTodo, setGuardandoTodo] = useState(false);
  const [tabMovil, setTabMovil] = useState<'lista' | 'revision'>('lista');

  // Diálogos de confirmación de limpieza / reinicio
  const [dialogLimpiarTodosOpen, setDialogLimpiarTodosOpen] = useState(false);
  const [limpiandoTodos, setLimpiandoTodos] = useState(false);

  const [dialogReiniciarEstudianteOpen, setDialogReiniciarEstudianteOpen] = useState(false);
  const [reiniciandoEstudiante, setReiniciandoEstudiante] = useState(false);

  // Modal de visualización de imagen / adjuntos (Lightbox en el mismo lugar)
  const [modalAdjuntoUrl, setModalAdjuntoUrl] = useState<string | null>(null);
  const [modalAdjuntoTipo, setModalAdjuntoTipo] = useState<'imagen' | 'pdf'>('imagen');
  const [modalAdjuntoTitulo, setModalAdjuntoTitulo] = useState<string>('');
  const [zoomNivel, setZoomNivel] = useState<number>(1);
  const [rotacion, setRotacion] = useState<number>(0);

  // Detalle del intento seleccionado
  const {
    detalle,
    isLoading: cargandoDetalle,
    calificando,
    calificarRespuesta,
    refrescar: refrescarDetalle,
  } = useDetalleIntentoDocente(intentoSeleccionadoId);

  // Estados locales temporales de puntaje y feedback por respuesta
  const [calificacionesLocales, setCalificacionesLocales] = useState<Record<number, { puntos: number; feedback: string }>>({});

  // Auto-seleccionar primer intento entregado si existe
  useEffect(() => {
    if (!intentoSeleccionadoId && intentos.length > 0) {
      const entregado = intentos.find(i => i.intento_id && (i.estado_intento === 'entregado' || i.estado_intento === 'expirado'));
      if (entregado?.intento_id) {
        setIntentoSeleccionadoId(entregado.intento_id);
      }
    }
  }, [intentos, intentoSeleccionadoId]);

  // Inicializar respuestas locales cuando carga el detalle
  useEffect(() => {
    if (detalle?.preguntas) {
      const initMap: Record<number, { puntos: number; feedback: string }> = {};
      detalle.preguntas.forEach(p => {
        if (p.respuesta_id) {
          initMap[p.respuesta_id] = {
            puntos: p.puntaje_obtenido ?? 0,
            feedback: p.retroalimentacion || '',
          };
        }
      });
      setCalificacionesLocales(initMap);
    }
  }, [detalle]);

  // Guardar puntuación individual de una pregunta subjetiva
  const handleGuardarPuntosRespuesta = async (p: DetallePreguntaRespuesta) => {
    if (!p.respuesta_id) return;
    const datos = calificacionesLocales[p.respuesta_id] || {
      puntos: p.puntaje_obtenido ?? 0,
      feedback: p.retroalimentacion || '',
    };

    const ok = await calificarRespuesta(p.respuesta_id, Number(datos.puntos), datos.feedback);
    if (ok) {
      toast.success('Puntuación guardada');
      refrescarDetalle();
      refrescar();
    }
  };

  // Guardar la calificación completa de este estudiante y opcionalmente pasar al siguiente
  const handleGuardarTodo = async (pasarAlSiguiente: boolean = false) => {
    if (!detalle?.preguntas) return;
    setGuardandoTodo(true);
    try {
      const subjetivas = detalle.preguntas.filter(p => p.tipo === 'desarrollo' || p.tipo === 'respuesta_corta');
      for (const p of subjetivas) {
        if (p.respuesta_id) {
          const datos = calificacionesLocales[p.respuesta_id] || {
            puntos: p.puntaje_obtenido ?? 0,
            feedback: p.retroalimentacion || '',
          };
          await calificarRespuesta(p.respuesta_id, Number(datos.puntos), datos.feedback);
        }
      }
      toast.success(`Calificación guardada para ${detalle.estudiante_nombres} ${detalle.estudiante_apellidos}`);
      await refrescarDetalle();
      await refrescar();

      if (pasarAlSiguiente && siguienteIntento) {
        setIntentoSeleccionadoId(siguienteIntento);
      }
    } catch (err: any) {
      toast.error('Error al guardar la calificación');
    } finally {
      setGuardandoTodo(false);
    }
  };

  // Confirmar y ejecutar la limpieza de TODOS los intentos del examen
  const handleConfirmarLimpiarTodos = async () => {
    setLimpiandoTodos(true);
    try {
      const ok = await limpiarTodosIntentos();
      if (ok) {
        setDialogLimpiarTodosOpen(false);
        setIntentoSeleccionadoId(null);
      }
    } finally {
      setLimpiandoTodos(false);
    }
  };

  // Confirmar y reiniciar el intento individual del estudiante seleccionado
  const handleConfirmarReiniciarEstudiante = async () => {
    if (!detalle?.id) return;
    setReiniciandoEstudiante(true);
    try {
      const ok = await reiniciarIntento(detalle.id);
      if (ok) {
        setDialogReiniciarEstudianteOpen(false);
        if (siguienteIntento) {
          setIntentoSeleccionadoId(siguienteIntento);
        } else if (anteriorIntento) {
          setIntentoSeleccionadoId(anteriorIntento);
        } else {
          setIntentoSeleccionadoId(null);
        }
      }
    } finally {
      setReiniciandoEstudiante(false);
    }
  };

  // Filtrado de estudiantes
  const intentosFiltrados = useMemo(() => {
    return intentos.filter(item => {
      const nombreCompleto = `${item.estudiante_nombres} ${item.estudiante_apellidos} ${item.estudiante_codigo}`.toLowerCase();
      const cumpleTexto = nombreCompleto.includes(busqueda.toLowerCase());
      if (!cumpleTexto) return false;

      if (filtroEstado === 'pendientes') {
        return item.estado_intento === 'entregado' && !item.calificado_completo;
      }
      if (filtroEstado === 'completos') {
        return item.calificado_completo;
      }
      if (filtroEstado === 'sin_iniciar') {
        return item.estado_intento === 'sin_iniciar' || !item.intento_id;
      }
      return true;
    });
  }, [intentos, busqueda, filtroEstado]);

  const puntajeMaximo = Number(evaluacion?.puntaje_maximo || 100);

  // Métricas estilo Resumen Asistencia
  const totalInscritos = intentos.length;
  const totalEntregados = intentos.filter(i => i.estado_intento === 'entregado' || i.estado_intento === 'expirado').length;
  const totalPendientesRevision = intentos.filter(i => i.respuestas_pendientes_calificar > 0).length;
  const totalCalificadosCompletos = intentos.filter(i => i.calificado_completo).length;
  const totalSinIniciar = Math.max(0, totalInscritos - totalEntregados);

  const totalAprobados = useMemo(() => {
    const umbral = puntajeMaximo * 0.51;
    return intentos.filter(i => i.puntaje_obtenido != null && Number(i.puntaje_obtenido) >= umbral).length;
  }, [intentos, puntajeMaximo]);

  const promedioCalificados = useMemo(() => {
    const calificados = intentos.filter(i => i.calificado_completo && i.puntaje_obtenido != null);
    if (calificados.length === 0) return null;
    const suma = calificados.reduce((acc, curr) => acc + Number(curr.puntaje_obtenido ?? 0), 0);
    return Math.round((suma / calificados.length) * 10) / 10;
  }, [intentos]);

  const porcentajePromedio = useMemo(() => {
    if (promedioCalificados == null || puntajeMaximo <= 0) return 0;
    return Math.round((promedioCalificados / puntajeMaximo) * 100);
  }, [promedioCalificados, puntajeMaximo]);

  // Navegación secuencial entre estudiantes entregados
  const listaEntregados = useMemo(() => {
    return intentos.filter(i => i.intento_id && (i.estado_intento === 'entregado' || i.estado_intento === 'expirado'));
  }, [intentos]);

  const indiceActual = listaEntregados.findIndex(i => i.intento_id === intentoSeleccionadoId);
  const anteriorIntento = indiceActual > 0 ? listaEntregados[indiceActual - 1]?.intento_id : null;
  const siguienteIntento = indiceActual >= 0 && indiceActual < listaEntregados.length - 1 ? listaEntregados[indiceActual + 1]?.intento_id : null;

  // Puntaje total dinámico calculado en tiempo real
  const puntajeTotalActual = useMemo(() => {
    if (!detalle?.preguntas) return 0;
    const sum = detalle.preguntas.reduce((acc, p) => {
      const esSubjetiva = p.tipo === 'desarrollo' || p.tipo === 'respuesta_corta';
      if (esSubjetiva && p.respuesta_id) {
        const local = calificacionesLocales[p.respuesta_id];
        return acc + (local != null ? Number(local.puntos || 0) : Number(p.puntaje_obtenido || 0));
      }
      return acc + Number(p.puntaje_obtenido || 0);
    }, 0);
    return Math.round(sum * 10) / 10;
  }, [detalle, calificacionesLocales]);

  const totalPreguntasPendientesEstudiante = useMemo(() => {
    if (!detalle?.preguntas) return 0;
    return detalle.preguntas.filter(p => {
      const esSubjetiva = p.tipo === 'desarrollo' || p.tipo === 'respuesta_corta';
      if (!esSubjetiva) return false;
      if (!p.respuesta_id) return true;
      const local = calificacionesLocales[p.respuesta_id];
      return local == null && p.puntaje_obtenido == null;
    }).length;
  }, [detalle, calificacionesLocales]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 1.5, sm: 3 }, px: { xs: 1, sm: 2.5, md: 4 }, width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Container maxWidth="xl" disableGutters sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

        {/* ── Volver a planilla de calificaciones y selector de cambio de examen ── */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box
            onClick={() => router.push(`/dashboard/docente/calificaciones/${routeId}`)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.8,
              cursor: 'pointer', color: 'text.secondary', fontSize: { xs: 12, sm: 13 }, fontWeight: 700,
              p: 0.8, borderRadius: '8px',
              transition: 'all 0.15s ease',
              '&:hover': { color: gold, bgcolor: alpha(gold, 0.08) },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            Volver a Planilla de Calificaciones
          </Box>

          {/* Selector para cambiar de examen si existen varios */}
          {evaluacionesVirtuales.length > 1 && (
            <Box>
              <Button
                size="small"
                onClick={(e) => setAnchorElExamenes(e.currentTarget)}
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
                startIcon={<ComputerRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '10px',
                  border: `1.5px solid ${alpha('#10b981', 0.45)}`,
                  bgcolor: isDark ? alpha('#10b981', 0.16) : alpha('#10b981', 0.1),
                  color: isDark ? '#34d399' : '#059669',
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: 'none',
                  py: 0.6,
                  px: 1.8,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isDark ? alpha('#10b981', 0.26) : alpha('#10b981', 0.18),
                    borderColor: '#10b981',
                  },
                }}
              >
                Cambiar examen ({evaluacionesVirtuales.findIndex(e => e.id === evaluacionId) + 1} de {evaluacionesVirtuales.length})
              </Button>

              <Menu
                anchorEl={anchorElExamenes}
                open={Boolean(anchorElExamenes)}
                onClose={() => setAnchorElExamenes(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 290,
                    maxWidth: 380,
                    borderRadius: '16px',
                    bgcolor: isDark ? '#0d1726' : '#ffffff',
                    border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                    boxShadow: isDark
                      ? '0 16px 36px rgba(0,0,0,0.65)'
                      : '0 16px 36px rgba(16,185,129,0.18)',
                    p: 0.8,
                  },
                }}
              >
                <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Exámenes Virtuales Disponibles ({evaluacionesVirtuales.length})
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Selecciona el examen que deseas monitorear:
                  </Typography>
                </Box>
                {evaluacionesVirtuales.map((e) => {
                  const esActual = e.id === evaluacionId;
                  return (
                    <MenuItem
                      key={e.id}
                      selected={esActual}
                      onClick={() => {
                        setAnchorElExamenes(null);
                        if (!esActual) {
                          router.push(`/dashboard/docente/calificaciones/${routeId}/examen/${e.id}`);
                        }
                      }}
                      sx={{
                        borderRadius: '10px',
                        my: 0.3,
                        py: 1.1,
                        px: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.15s ease',
                        bgcolor: esActual ? (isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.12)) : 'transparent',
                        '&:hover': {
                          bgcolor: alpha('#10b981', isDark ? 0.25 : 0.16),
                          transform: 'translateX(3px)',
                        },
                      }}
                    >
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: alpha('#10b981', 0.15),
                        border: `1px solid ${alpha('#10b981', 0.3)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <ComputerRoundedIcon sx={{ fontSize: 17, color: '#10b981' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: esActual ? 800 : 600, color: esActual ? (isDark ? '#6ee7b7' : '#047857') : 'text.primary' }} noWrap>
                          {e.nombre}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.2 }}>
                          /{e.puntaje_maximo} pts {e.duracion_minutos ? `· ${e.duracion_minutos} min` : ''}
                        </Typography>
                      </Box>
                      {esActual ? (
                        <Chip size="small" label="Viendo" sx={{ fontSize: 10, fontWeight: 800, height: 20, bgcolor: '#10b981', color: '#fff' }} />
                      ) : (
                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      )}
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HEADER RESUMEN (Coherencia LVC)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap', gap: 2, mb: 2.5, p: { xs: 1.8, sm: 2.5 }, borderRadius: '16px',
          border: `1.5px solid ${borderField}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          width: '100%', boxSizing: 'border-box',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              bgcolor: brandDim, border: `1px solid ${brandBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoGraphRoundedIcon sx={{ color: gold, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{
                background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.2, mb: 0.3, fontSize: { xs: 17, sm: 20 },
              }}>
                {evaluacion?.nombre ?? 'Examen Virtual'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 12 }}>
                {evaluacion?.materia_nombre ? `${evaluacion.materia_nombre} · ` : ''}
                {evaluacion?.grado_nombre ? `${evaluacion.grado_nombre} "${evaluacion.paralelo_nombre}" · ` : ''}
                <strong>{totalInscritos}</strong> estudiantes · Puntaje máx: <strong>{puntajeMaximo} pts</strong>
                {evaluacion?.duracion_minutos ? ` · ${evaluacion.duracion_minutos} min` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}>
            {/* Botón Limpiar Todos */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setDialogLimpiarTodosOpen(true)}
              disabled={totalEntregados === 0}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 12,
                py: 0.7, px: 1.6,
                borderColor: alpha('#ef4444', isDark ? 0.35 : 0.4),
                color: isDark ? '#f87171' : '#dc2626',
                '&:hover': {
                  borderColor: '#ef4444',
                  bgcolor: alpha('#ef4444', 0.1),
                },
              }}
            >
              Limpiar envíos
            </Button>

            {/* Refrescar */}
            <Tooltip title="Actualizar datos e intentos">
              <IconButton
                size="small"
                onClick={() => {
                  refrescar();
                  if (intentoSeleccionadoId) refrescarDetalle();
                }}
                sx={{
                  borderRadius: '10px',
                  border: `1px solid ${borderField}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: 'text.secondary',
                  '&:hover': { color: gold, borderColor: brandBorder },
                  p: 0.9,
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Badge de Promedio de la Clase - Estilo elegante LVC */}
            <Box sx={{
              px: 2, py: 0.9, borderRadius: '12px',
              border: `1.5px solid ${alpha(getPctColor(porcentajePromedio), 0.35)}`,
              bgcolor: isDark ? alpha(getPctColor(porcentajePromedio), 0.1) : alpha(getPctColor(porcentajePromedio), 0.06),
              display: 'flex', alignItems: 'center', gap: 1.2,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: getPctColor(porcentajePromedio),
                boxShadow: `0 0 8px ${getPctColor(porcentajePromedio)}`,
              }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Promedio del curso
                </Typography>
                <Typography variant="body2" fontWeight={900} sx={{ color: getPctColor(porcentajePromedio), lineHeight: 1.1, fontSize: 13 }}>
                  {promedioCalificados != null ? `${promedioCalificados} pts (${porcentajePromedio}%)` : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            2. STAT CARDS (Sleek, Compact Ribbon)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
          mb: 2.5,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {[
            { label: 'Total Estudiantes', value: totalInscritos, color: '#3b82f6' },
            { label: 'Exámenes Entregados', value: totalEntregados, color: '#8b5cf6' },
            { label: 'Por Calificar', value: totalPendientesRevision, color: '#f59e0b' },
            { label: 'Revisados Completos', value: totalCalificadosCompletos, color: '#10b981' },
            { label: 'Sin Iniciar', value: totalSinIniciar, color: '#64748b' },
            { label: 'Aprobados (≥51%)', value: totalAprobados, color: '#10b981' },
          ].map(s => (
            <Box key={s.label} sx={{
              p: { xs: 1.2, sm: 1.5 },
              borderRadius: '12px',
              border: `1px solid ${isDark ? alpha(s.color, 0.22) : alpha(s.color, 0.2)}`,
              bgcolor: isDark ? alpha(s.color, 0.05) : alpha(s.color, 0.03),
              borderLeft: `3.5px solid ${s.color}`,
              minWidth: 0,
              overflow: 'hidden',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark ? '0 6px 16px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.06)',
              }
            }}>
              <Typography variant="h6" fontWeight={900} sx={{ color: s.color, lineHeight: 1.1, mb: 0.3, fontSize: { xs: 16, sm: 18 } }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: { xs: 10, sm: 11 }, display: 'block', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            3. BARRA DE BÚSQUEDA Y FILTROS (100% Responsivo en móvil)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', gap: 1.5,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 2.5,
          p: { xs: 1.2, sm: 1.5 }, borderRadius: '14px',
          border: `1.5px solid ${borderField}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <TextField
            size="small"
            placeholder="Buscar estudiante por nombre o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
            sx={{
              flex: 1, minWidth: 0, width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: 13,
                bgcolor: bgField,
                '& fieldset': { borderColor: borderField },
                '&:hover fieldset': { borderColor: alpha(brand, 0.4) },
                '&.Mui-focused fieldset': { borderColor: brand },
              }
            }}
          />

          <Box sx={{
            overflowX: 'auto',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            py: 0.2,
          }}>
            <ToggleButtonGroup
              value={filtroEstado}
              exclusive
              onChange={(_, v) => v && setFiltroEstado(v)}
              size="small"
              sx={{
                bgcolor: bgField,
                p: 0.4,
                borderRadius: '10px',
                border: `1px solid ${borderField}`,
                display: 'flex',
                width: 'max-content',
                '& .MuiToggleButton-root': {
                  borderRadius: '8px !important',
                  px: 1.4, py: 0.6,
                  fontWeight: 700,
                  fontSize: 11.5,
                  textTransform: 'none',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: 'text.primary',
                  }
                }
              }}
            >
              <ToggleButton value="todos">Todos ({intentos.length})</ToggleButton>
              <ToggleButton value="pendientes" sx={{ '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.15) + ' !important', color: '#f59e0b !important' } }}>
                ⏳ Por calificar ({totalPendientesRevision})
              </ToggleButton>
              <ToggleButton value="completos" sx={{ '&.Mui-selected': { bgcolor: alpha('#10b981', 0.15) + ' !important', color: '#10b981 !important' } }}>
                ✓ Revisados ({totalCalificadosCompletos})
              </ToggleButton>
              <ToggleButton value="sin_iniciar" sx={{ '&.Mui-selected': { bgcolor: alpha('#64748b', 0.15) + ' !important', color: '#94a3b8 !important' } }}>
                Sin iniciar ({totalSinIniciar})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Selector de Pestañas para Móvil (Lista vs Revisión) ── */}
        <Box sx={{
          display: { xs: 'flex', lg: 'none' },
          mb: 2, bgcolor: bgField, p: 0.5, borderRadius: '12px',
          border: `1px solid ${borderField}`, width: '100%', boxSizing: 'border-box'
        }}>
          <Button
            fullWidth
            onClick={() => setTabMovil('lista')}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              py: 0.8,
              bgcolor: tabMovil === 'lista' ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
              color: tabMovil === 'lista' ? gold : 'text.secondary',
              boxShadow: tabMovil === 'lista' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Estudiantes ({intentosFiltrados.length})
          </Button>
          <Button
            fullWidth
            onClick={() => setTabMovil('revision')}
            disabled={!intentoSeleccionadoId}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              py: 0.8,
              bgcolor: tabMovil === 'revision' ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
              color: tabMovil === 'revision' ? gold : 'text.secondary',
              boxShadow: tabMovil === 'revision' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Revisión {detalle ? `· ${detalle.estudiante_nombres.split(' ')[0]}` : ''}
          </Button>
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            4. WORKSPACE EN 2 PANELES: LISTA ESTUDIANTES + REVISIÓN DETALLADA
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
          gap: 2.5,
          alignItems: 'start',
          width: '100%',
          minWidth: 0,
        }}>

          {/* ── PANEL IZQUIERDO: LISTA DE ESTUDIANTES ── */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: tabMovil === 'lista' ? 'block' : 'none', lg: 'block' },
              p: { xs: 1.5, sm: 2 },
              borderRadius: '14px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              minWidth: 0, width: '100%', boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}` }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Estudiantes ({intentosFiltrados.length})
              </Typography>
            </Box>

            {cargandoIntentos ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ color: gold }} />
              </Box>
            ) : intentosFiltrados.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  No se encontraron estudiantes para este filtro.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: '72vh', overflowY: 'auto', pr: 0.5 }}>
                {intentosFiltrados.map((item, i) => {
                  const tieneIntento = Boolean(item.intento_id);
                  const seleccionado = item.intento_id === intentoSeleccionadoId;
                  const pctItem = puntajeMaximo > 0 ? ((item.puntaje_obtenido ?? 0) / puntajeMaximo) * 100 : 0;
                  const colorItem = tieneIntento ? getPctColor(pctItem) : '#64748b';

                  return (
                    <Box
                      key={item.matricula_id}
                      onClick={() => {
                        if (item.intento_id) {
                          setIntentoSeleccionadoId(item.intento_id);
                          setTabMovil('revision');
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.2,
                        p: 1.3,
                        borderRadius: '12px',
                        cursor: tieneIntento ? 'pointer' : 'default',
                        border: `1.5px solid ${seleccionado
                          ? brandBorder
                          : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)
                        }`,
                        bgcolor: seleccionado
                          ? (isDark ? alpha(gold, 0.12) : alpha(gold, 0.07))
                          : (isDark ? alpha('#fff', 0.015) : '#fcfdfe'),
                        boxShadow: seleccionado
                          ? (isDark ? `0 4px 14px rgba(0,0,0,0.4), inset 3px 0 0 ${gold}` : `0 4px 14px ${alpha(gold, 0.25)}, inset 3px 0 0 ${gold}`)
                          : 'none',
                        transition: 'all 0.16s ease',
                        '&:hover': tieneIntento ? {
                          transform: 'translateX(3px)',
                          borderColor: brandBorder,
                        } : {},
                      }}
                    >
                      {/* Avatar + Nombre + Código */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ minWidth: 20, textAlign: 'center', flexShrink: 0 }}>
                          {i + 1}
                        </Typography>
                        <Avatar
                          src={item.estudiante_foto || undefined}
                          sx={{
                            width: 36, height: 36, fontSize: 12, fontWeight: 800, flexShrink: 0,
                            background: tieneIntento ? getPctGrad(pctItem) : alpha('#64748b', 0.2),
                            color: '#fff',
                            border: `2px solid ${alpha(colorItem, 0.35)}`,
                          }}
                        >
                          {item.estudiante_nombres.charAt(0)}{item.estudiante_apellidos.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={800} noWrap sx={{ fontSize: 13, maxWidth: { xs: 125, sm: 170, md: 'none' } }}>
                            {item.estudiante_apellidos}, {item.estudiante_nombres}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>
                            {item.estudiante_codigo}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Puntaje o Estado */}
                      {tieneIntento ? (
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="body2" fontWeight={900} sx={{ color: colorItem, fontSize: 13, lineHeight: 1 }}>
                            {item.puntaje_obtenido ?? 0} <span style={{ fontSize: 10, color: 'gray' }}>/ {puntajeMaximo}</span>
                          </Typography>
                          <Box sx={{ width: { xs: 45, sm: 60 }, height: 4, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06), mt: 0.5, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${Math.min(100, Math.max(0, pctItem))}%`, background: getPctGrad(pctItem), borderRadius: 2 }} />
                          </Box>
                        </Box>
                      ) : (
                        <Chip
                          label="Sin iniciar"
                          size="small"
                          sx={{ fontSize: 9.5, height: 18, color: 'text.disabled', flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* ── PANEL DERECHO: REVISIÓN DETALLADA DE PREGUNTAS Y RESPUESTAS ── */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: tabMovil === 'revision' ? 'block' : 'none', lg: 'block' },
              p: { xs: 1.8, sm: 3 },
              borderRadius: '14px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#ffffff',
              minWidth: 0, width: '100%', boxSizing: 'border-box',
            }}
          >
            {cargandoDetalle ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <CircularProgress size={30} sx={{ color: gold }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
                  Cargando intento del estudiante...
                </Typography>
              </Box>
            ) : !detalle ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <QuizRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.4), mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800}>
                  Selecciona un estudiante
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mt: 0.5 }}>
                  Elige a un estudiante de la lista izquierda para inspeccionar sus respuestas y calificar sus preguntas abiertas.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTabMovil('lista')}
                  sx={{ display: { xs: 'inline-flex', lg: 'none' }, mt: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Ver lista de estudiantes
                </Button>
              </Box>
            ) : (
              <Box>
                {/* Botón volver a lista en móvil */}
                <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 1.5 }}>
                  <Button
                    size="small"
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => setTabMovil('lista')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                      color: 'text.secondary',
                      p: 0.5,
                    }}
                  >
                    ← Volver a lista de estudiantes
                  </Button>
                </Box>

                {/* Cabecera del Intento del Estudiante */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 2, pb: 2.2, mb: 3,
                  borderBottom: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 46, height: 46, fontSize: 15, fontWeight: 900,
                        background: getPctGrad(puntajeMaximo > 0 ? (puntajeTotalActual / puntajeMaximo) * 100 : 0),
                        color: '#fff',
                        border: `2px solid ${alpha(gold, 0.35)}`,
                      }}
                    >
                      {detalle.estudiante_nombres.charAt(0)}{detalle.estudiante_apellidos.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {detalle.estudiante_apellidos}, {detalle.estudiante_nombres}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Código: {detalle.estudiante_codigo} · Entregado:{' '}
                        {detalle.entregado_en
                          ? new Date(detalle.entregado_en).toLocaleString('es-BO', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })
                          : 'No entregado'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Puntuación, Botón Reiniciar y Flechas */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', fontSize: 10.5, letterSpacing: 0.5 }}>
                        PUNTAJE ACTUAL
                      </Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ color: gold, lineHeight: 1 }}>
                        {puntajeTotalActual} <span style={{ fontSize: '0.85rem', color: 'gray' }}>/ {puntajeMaximo} pts</span>
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    {/* Botón Reiniciar Intento individual */}
                    <Tooltip title="Borrar respuestas y permitir que este estudiante vuelva a rendir el examen desde cero">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setDialogReiniciarEstudianteOpen(true)}
                        sx={{
                          borderRadius: '9px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: 12,
                          py: 0.5,
                          px: 1.4,
                          borderColor: alpha('#ef4444', isDark ? 0.35 : 0.4),
                          color: isDark ? '#f87171' : '#dc2626',
                          '&:hover': {
                            borderColor: '#ef4444',
                            bgcolor: alpha('#ef4444', 0.1),
                          },
                        }}
                      >
                        Reiniciar intento
                      </Button>
                    </Tooltip>

                    {/* Controles secuenciales */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="Estudiante anterior">
                        <span>
                          <IconButton
                            disabled={!anteriorIntento || guardandoTodo}
                            onClick={() => anteriorIntento && setIntentoSeleccionadoId(anteriorIntento)}
                            size="small"
                            sx={{ border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}` }}
                          >
                            <NavigateBeforeRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Siguiente estudiante">
                        <span>
                          <IconButton
                            disabled={!siguienteIntento || guardandoTodo}
                            onClick={() => siguienteIntento && setIntentoSeleccionadoId(siguienteIntento)}
                            size="small"
                            sx={{ border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}` }}
                          >
                            <NavigateNextRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* Lista de Preguntas y Respuestas */}
                <Stack spacing={2.5}>
                  {detalle.preguntas.map((p, index) => {
                    const datosLocales = p.respuesta_id ? calificacionesLocales[p.respuesta_id] : null;
                    const esSubjetiva = p.tipo === 'desarrollo' || p.tipo === 'respuesta_corta';

                    const opcionesList = parseOpciones(p.opciones);
                    const respondio = p.respuesta_opcion !== null && p.respuesta_opcion !== undefined;
                    const indexElegido = respondio ? Number(p.respuesta_opcion) : null;
                    const indexCorrecto = p.respuesta_correcta !== null && p.respuesta_correcta !== undefined ? Number(p.respuesta_correcta) : null;
                    const esAciertoObjetivo = !esSubjetiva && respondio && indexCorrecto !== null && indexElegido === indexCorrecto;
                    const esFalloObjetivo = !esSubjetiva && (!respondio || (indexCorrecto !== null && indexElegido !== indexCorrecto));

                    // Color de borde de la tarjeta según acierto / error
                    let borderColorCard = isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08);
                    let bgColorCard = isDark ? alpha('#fff', 0.015) : '#fafafa';

                    if (!esSubjetiva) {
                      if (esAciertoObjetivo) {
                        borderColorCard = alpha('#10b981', 0.45);
                        bgColorCard = isDark ? 'rgba(16, 185, 129, 0.03)' : '#f0fdf4';
                      } else {
                        borderColorCard = alpha('#ef4444', 0.45);
                        bgColorCard = isDark ? 'rgba(239, 68, 68, 0.03)' : '#fef2f2';
                      }
                    } else {
                      if (p.puntaje_obtenido != null && p.puntaje_obtenido > 0) {
                        borderColorCard = alpha('#10b981', 0.4);
                      } else if (p.puntaje_obtenido === 0) {
                        borderColorCard = alpha('#ef4444', 0.4);
                        bgColorCard = isDark ? 'rgba(239, 68, 68, 0.03)' : '#fef2f2';
                      } else {
                        borderColorCard = alpha('#f59e0b', 0.35);
                      }
                    }

                    return (
                      <Paper
                        key={p.pregunta_id}
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2.2 },
                          borderRadius: '14px',
                          border: `1.5px solid ${borderColorCard}`,
                          bgcolor: bgColorCard,
                          transition: 'all 0.15s ease',
                          overflow: 'hidden',
                          minWidth: 0,
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Cabecera de la pregunta */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 28, height: 28, borderRadius: '8px',
                              bgcolor: !esSubjetiva
                                ? (esAciertoObjetivo ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2))
                                : alpha(gold, 0.2),
                              color: !esSubjetiva
                                ? (esAciertoObjetivo ? '#10b981' : '#ef4444')
                                : gold,
                              fontWeight: 800, fontSize: 13,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${!esSubjetiva
                                ? (esAciertoObjetivo ? alpha('#10b981', 0.4) : alpha('#ef4444', 0.4))
                                : alpha(gold, 0.4)
                              }`,
                            }}>
                              {index + 1}
                            </Box>
                            <Chip
                              label={p.tipo.replace('_', ' ')}
                              size="small"
                              sx={{ fontSize: 10, height: 20, textTransform: 'capitalize', fontWeight: 700 }}
                            />
                          </Box>

                          {/* Badge de Puntos y Estado */}
                          {!esSubjetiva ? (
                            esAciertoObjetivo ? (
                              <Chip
                                icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label={`Correcta · ${p.puntos_maximos} / ${p.puntos_maximos} pts`}
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800, fontSize: 11 }}
                              />
                            ) : (
                              <Chip
                                icon={<CancelRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label={`Incorrecta · 0 / ${p.puntos_maximos} pts`}
                                size="small"
                                color="error"
                                sx={{ fontWeight: 800, fontSize: 11 }}
                              />
                            )
                          ) : (
                            <Chip
                              label={`${datosLocales?.puntos ?? p.puntaje_obtenido ?? 0} / ${p.puntos_maximos} pts`}
                              size="small"
                              color={(datosLocales?.puntos ?? p.puntaje_obtenido ?? 0) > 0 ? 'success' : 'default'}
                              sx={{ fontWeight: 800 }}
                            />
                          )}
                        </Box>

                        {/* Enunciado */}
                        <Typography variant="body1" fontWeight={700} sx={{ mb: 1.8, fontSize: 14, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {p.pregunta}
                        </Typography>

                        {/* ── Render para Preguntas Objetivas (Opción múltiple / V o F) ── */}
                        {!esSubjetiva && opcionesList.length > 0 && (
                          <Stack spacing={1} sx={{ mb: 1.5, width: '100%', minWidth: 0 }}>
                            {opcionesList.map((op, opIndex) => {
                              const esLaElegida = indexElegido === opIndex;
                              const esLaCorrecta = indexCorrecto === opIndex;

                              let bgItem = isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02);
                              let borderItem = `1.5px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`;
                              let textColor = isDark ? '#fff' : 'text.primary';

                              if (esLaElegida && esLaCorrecta) {
                                // Alumno acertó
                                bgItem = isDark ? 'rgba(16, 185, 129, 0.22)' : '#d1fae5';
                                borderItem = '2px solid #10b981';
                                textColor = isDark ? '#34d399' : '#065f46';
                              } else if (esLaElegida && !esLaCorrecta) {
                                // Alumno se equivocó: ¡DESTACADO EN ROJO!
                                bgItem = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2';
                                borderItem = '2px solid #ef4444';
                                textColor = isDark ? '#f87171' : '#991b1b';
                              } else if (!esLaElegida && esLaCorrecta) {
                                // La opción correcta que el alumno no marcó
                                bgItem = isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5';
                                borderItem = '2px dashed #10b981';
                                textColor = isDark ? '#a7f3d0' : '#047857';
                              }

                              return (
                                <Box
                                  key={opIndex}
                                  sx={{
                                    p: { xs: 1.2, sm: 1.3 },
                                    borderRadius: '10px',
                                    border: borderItem,
                                    bgcolor: bgItem,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    gap: { xs: 0.8, sm: 1.5 },
                                    minWidth: 0,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.2,
                                    minWidth: 0,
                                    flex: 1,
                                    width: { xs: '100%', sm: 'auto' },
                                  }}>
                                    <Box sx={{ pt: 0.15, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                      {esLaElegida && esLaCorrecta ? (
                                        <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 19 }} />
                                      ) : esLaElegida && !esLaCorrecta ? (
                                        <CancelRoundedIcon sx={{ color: '#ef4444', fontSize: 19 }} />
                                      ) : esLaCorrecta ? (
                                        <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 19, opacity: 0.8 }} />
                                      ) : (
                                        <Box sx={{
                                          width: 18, height: 18, borderRadius: '50%',
                                          border: `1.5px solid ${isDark ? alpha('#fff', 0.25) : alpha('#000', 0.25)}`,
                                        }} />
                                      )}
                                    </Box>

                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: esLaElegida || esLaCorrecta ? 800 : 500,
                                        color: textColor,
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        minWidth: 0,
                                        flex: 1,
                                      }}
                                    >
                                      {op}
                                    </Typography>
                                  </Box>

                                  {/* Badge de estado de la opción */}
                                  {esLaElegida && esLaCorrecta && (
                                    <Chip
                                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                      label={
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Respuesta del estudiante</Box>
                                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Resp. estudiante</Box>
                                          <span>(Correcta)</span>
                                        </Box>
                                      }
                                      size="small"
                                      color="success"
                                      sx={{
                                        fontSize: 10.5,
                                        height: 'auto',
                                        minHeight: 22,
                                        py: 0.3,
                                        fontWeight: 800,
                                        alignSelf: { xs: 'flex-start', sm: 'center' },
                                        ml: { xs: 3.5, sm: 0 },
                                        maxWidth: '100%',
                                        '& .MuiChip-label': {
                                          whiteSpace: 'normal',
                                          px: 1,
                                          lineHeight: 1.25,
                                        },
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  {esLaElegida && !esLaCorrecta && (
                                    <Chip
                                      icon={<CancelRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                      label={
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Respuesta del estudiante</Box>
                                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Resp. estudiante</Box>
                                          <span>(Incorrecta)</span>
                                        </Box>
                                      }
                                      size="small"
                                      color="error"
                                      sx={{
                                        fontSize: 10.5,
                                        height: 'auto',
                                        minHeight: 22,
                                        py: 0.3,
                                        fontWeight: 800,
                                        alignSelf: { xs: 'flex-start', sm: 'center' },
                                        ml: { xs: 3.5, sm: 0 },
                                        maxWidth: '100%',
                                        '& .MuiChip-label': {
                                          whiteSpace: 'normal',
                                          px: 1,
                                          lineHeight: 1.25,
                                        },
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  {!esLaElegida && esLaCorrecta && (
                                    <Chip
                                      label={
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Respuesta correcta oficial</Box>
                                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Respuesta correcta</Box>
                                        </Box>
                                      }
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: 10.5,
                                        height: 'auto',
                                        minHeight: 22,
                                        py: 0.3,
                                        fontWeight: 700,
                                        borderColor: '#10b981',
                                        color: '#10b981',
                                        alignSelf: { xs: 'flex-start', sm: 'center' },
                                        ml: { xs: 3.5, sm: 0 },
                                        maxWidth: '100%',
                                        '& .MuiChip-label': {
                                          whiteSpace: 'normal',
                                          px: 1,
                                          lineHeight: 1.25,
                                        },
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })}

                            {!respondio && (
                              <Alert severity="error" icon={<CancelRoundedIcon />} sx={{ borderRadius: '10px', py: 0.5, fontWeight: 700, mt: 1 }}>
                                El estudiante no respondió a esta pregunta (0 puntos).
                              </Alert>
                            )}
                          </Stack>
                        )}

                        {/* ── Render para Preguntas Subjetivas (Desarrollo / Respuesta Corta) ── */}
                        {esSubjetiva && (
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                              RESPUESTA DEL ESTUDIANTE:
                            </Typography>

                            <Paper sx={{
                              p: 1.8, borderRadius: '10px',
                              bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                              border: `1.5px solid ${p.puntaje_obtenido === 0
                                ? alpha('#ef4444', 0.35)
                                : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)
                              }`,
                              mb: 1.5,
                            }}>
                              {p.respuesta_texto ? (
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                  {p.respuesta_texto}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                  El estudiante no escribió ninguna respuesta de texto.
                                </Typography>
                              )}

                              {/* ── VISUALIZACIÓN DE ARCHIVO / IMAGEN EN EL MISMO LUGAR ── */}
                              {p.archivo_url && (() => {
                                const isPdf = p.archivo_url.toLowerCase().includes('.pdf');
                                return (
                                  <Box sx={{
                                    mt: 2,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    border: `1.5px solid ${borderField}`,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      borderColor: brandBorder,
                                    }
                                  }}>
                                    {/* Barra superior de la evidencia */}
                                    <Box sx={{
                                      px: 2, py: 1.2,
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                      flexWrap: 'wrap', gap: 1,
                                      bgcolor: brandDim,
                                      borderBottom: `1px solid ${borderField}`,
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                        <Avatar sx={{
                                          width: 28, height: 28,
                                          bgcolor: isPdf ? alpha('#ef4444', 0.15) : alpha(gold, 0.15),
                                          color: isPdf ? '#ef4444' : gold,
                                        }}>
                                          {isPdf ? (
                                            <PictureAsPdfRoundedIcon sx={{ fontSize: 16 }} />
                                          ) : (
                                            <ImageRoundedIcon sx={{ fontSize: 16 }} />
                                          )}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="caption" fontWeight={800} sx={{ display: 'block', lineHeight: 1.1, color: 'text.primary' }}>
                                            {isPdf ? 'Documento adjunto (PDF)' : 'Evidencia fotográfica adjunta'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
                                            Evidencia de procedimiento del estudiante
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={isPdf ? <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => {
                                          setModalAdjuntoUrl(p.archivo_url || null);
                                          setModalAdjuntoTipo(isPdf ? 'pdf' : 'imagen');
                                          setModalAdjuntoTitulo(`Pregunta ${index + 1} · ${detalle.estudiante_nombres} ${detalle.estudiante_apellidos}`);
                                          setZoomNivel(1);
                                          setRotacion(0);
                                        }}
                                        sx={{
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          fontWeight: 800,
                                          fontSize: 11.5,
                                          py: 0.4, px: 1.5,
                                          borderColor: brandBorder,
                                          color: gold,
                                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                          '&:hover': {
                                            borderColor: gold,
                                            bgcolor: alpha(gold, 0.12),
                                          }
                                        }}
                                      >
                                        {isPdf ? 'Abrir PDF en visor' : 'Inspeccionar imagen'}
                                      </Button>
                                    </Box>

                                    {!isPdf ? (
                                      <Box
                                        onClick={() => {
                                          setModalAdjuntoUrl(p.archivo_url || null);
                                          setModalAdjuntoTipo('imagen');
                                          setModalAdjuntoTitulo(`Pregunta ${index + 1} · ${detalle.estudiante_nombres} ${detalle.estudiante_apellidos}`);
                                          setZoomNivel(1);
                                          setRotacion(0);
                                        }}
                                        sx={{
                                          p: 2,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          position: 'relative',
                                          background: isDark
                                            ? 'linear-gradient(180deg, #09101d 0%, #060a14 100%)'
                                            : 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                                          '&:hover .preview-overlay': {
                                            opacity: 1,
                                          },
                                          '&:hover img': {
                                            transform: 'scale(1.015)',
                                          }
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={p.archivo_url}
                                          alt="Evidencia fotográfica"
                                          sx={{
                                            maxHeight: 260,
                                            maxWidth: '100%',
                                            borderRadius: '10px',
                                            objectFit: 'contain',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                            transition: 'transform 0.25s ease',
                                          }}
                                        />
                                        <Box
                                          className="preview-overlay"
                                          sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            bgcolor: 'rgba(9, 16, 29, 0.65)',
                                            backdropFilter: 'blur(3px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1.2,
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease',
                                            color: '#fff',
                                            fontWeight: 800,
                                            fontSize: 13,
                                          }}
                                        >
                                          <Box sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            px: 2, py: 0.9, borderRadius: '20px',
                                            bgcolor: 'rgba(0,0,0,0.65)', border: `1px solid ${alpha(gold, 0.4)}`,
                                            color: gold,
                                          }}>
                                            <ZoomInRoundedIcon sx={{ fontSize: 19 }} />
                                            Haz clic para ampliar con zoom y rotación
                                          </Box>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Archivo PDF adjunto. Haz clic en &quot;Abrir PDF en visor&quot; para inspeccionarlo en pantalla completa.
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })()}
                            </Paper>

                            {/* Criterios o respuesta esperada si existe */}
                            {p.respuesta_esperada && (
                              <Box sx={{
                                p: 1.2, mb: 1.5, borderRadius: '8px',
                                bgcolor: alpha('#10b981', isDark ? 0.08 : 0.06),
                                border: `1px dashed ${alpha('#10b981', 0.35)}`,
                              }}>
                                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, display: 'block' }}>
                                  Respuesta esperada / Criterio de corrección:
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 12.5, mt: 0.2 }}>
                                  {p.respuesta_esperada}
                                </Typography>
                              </Box>
                            )}

                            {/* Panel de Asignación de Calificación Subjetiva */}
                            {datosLocales && (
                              <Box sx={{
                                p: 1.8, borderRadius: '10px',
                                bgcolor: isDark ? alpha('#facc15', 0.04) : alpha('#facc15', 0.08),
                                border: `1px solid ${alpha(gold, 0.25)}`,
                              }}>
                                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.2, color: gold, fontSize: 12.5 }}>
                                  Puntuar respuesta
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                                  <TextField
                                    type="number"
                                    size="small"
                                    label="Puntos"
                                    inputProps={{ min: 0, max: p.puntos_maximos, step: 0.5 }}
                                    value={datosLocales.puntos}
                                    onChange={(e) => {
                                      const val = Math.min(p.puntos_maximos, Math.max(0, parseFloat(e.target.value) || 0));
                                      setCalificacionesLocales(prev => ({
                                        ...prev,
                                        [p.respuesta_id || 0]: { ...datosLocales, puntos: val },
                                      }));
                                    }}
                                    helperText={`Máx: ${p.puntos_maximos} pts`}
                                    sx={{ width: { xs: '100%', sm: 130 } }}
                                  />

                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Retroalimentación para el estudiante"
                                    placeholder="Observaciones..."
                                    value={datosLocales.feedback}
                                    onChange={(e) => {
                                      setCalificacionesLocales(prev => ({
                                        ...prev,
                                        [p.respuesta_id || 0]: { ...datosLocales, feedback: e.target.value },
                                      }));
                                    }}
                                  />

                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={calificando}
                                    onClick={() => handleGuardarPuntosRespuesta(p)}
                                    startIcon={calificando ? <CircularProgress size={14} color="inherit" /> : <SaveRoundedIcon />}
                                    sx={{
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      fontWeight: 800,
                                      fontSize: 12,
                                      py: 1,
                                      px: 2,
                                      background: gradBg,
                                      color: isDark ? '#000' : '#fff',
                                      whiteSpace: 'nowrap',
                                      alignSelf: { xs: 'stretch', sm: 'center' },
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </Stack>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>

                {/* ═════════════════════════════════════════════════════════════════
                    BARRA FIJA INFERIOR DE ACCIONES (Guardar nota y navegar)
                   ═════════════════════════════════════════════════════════════════ */}
                <Paper
                  elevation={3}
                  sx={{
                    mt: 4,
                    p: { xs: 1.8, sm: 2.5 },
                    borderRadius: '16px',
                    border: `1.5px solid ${alpha(gold, 0.35)}`,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, rgba(15, 23, 42, 0.98) 100%)`
                      : `linear-gradient(135deg, ${alpha('#0288d1', 0.06)} 0%, #ffffff 100%)`,
                    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.45)' : '0 6px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '12px',
                      bgcolor: alpha(gold, 0.18), color: gold,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1.5px solid ${alpha(gold, 0.3)}`,
                      flexShrink: 0,
                    }}>
                      <AssignmentTurnedInRoundedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, wordBreak: 'break-word', fontSize: { xs: 14, sm: 16 } }}>
                        Revisión de {detalle.estudiante_nombres} {detalle.estudiante_apellidos}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontWeight: 600, fontSize: { xs: 12, sm: 13.5 } }}>
                        Puntaje final: <strong style={{ color: gold, fontSize: 16 }}>{puntajeTotalActual}</strong> / {puntajeMaximo} pts
                        {totalPreguntasPendientesEstudiante > 0
                          ? ` · (${totalPreguntasPendientesEstudiante} abiertas por calificar)`
                          : ' · (Todas las respuestas calificadas)'
                        }
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
                    width: { xs: '100%', md: 'auto' },
                    justifyContent: { xs: 'stretch', sm: 'flex-end' },
                    '& > *': { flex: { xs: '1 1 100%', sm: 'none' } }
                  }}>
                    {/* Botón Estudiante Anterior */}
                    <Button
                      variant="outlined"
                      disabled={!anteriorIntento || guardandoTodo}
                      onClick={() => anteriorIntento && setIntentoSeleccionadoId(anteriorIntento)}
                      startIcon={<NavigateBeforeRoundedIcon />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 12.5,
                        py: 0.8, px: 1.8,
                        borderColor: isDark ? alpha('#fff', 0.25) : alpha('#000', 0.2),
                        color: isDark ? '#fff' : 'text.primary',
                        '&:hover': { borderColor: gold, color: gold },
                      }}
                    >
                      Anterior
                    </Button>

                    {/* Botón Guardar Calificación */}
                    <Button
                      variant="contained"
                      disabled={guardandoTodo}
                      onClick={() => handleGuardarTodo(false)}
                      startIcon={guardandoTodo ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: 13,
                        py: 0.9, px: 2.2,
                        background: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                        color: isDark ? '#fff' : 'text.primary',
                        border: `1.5px solid ${isDark ? alpha('#fff', 0.25) : alpha('#000', 0.2)}`,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.14),
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      {guardandoTodo ? 'Guardando...' : 'Guardar Calificación'}
                    </Button>

                    {/* Botón Guardar y Siguiente Estudiante */}
                    {siguienteIntento ? (
                      <Button
                        variant="contained"
                        disabled={guardandoTodo}
                        onClick={() => handleGuardarTodo(true)}
                        endIcon={<NavigateNextRoundedIcon />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: 13,
                          py: 0.9, px: 2.4,
                          background: gradBg,
                          color: isDark ? '#000' : '#fff',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            opacity: 0.92,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                          }
                        }}
                      >
                        Guardar y Siguiente Estudiante
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        disabled={guardandoTodo}
                        onClick={() => handleGuardarTodo(false)}
                        startIcon={<CheckCircleRoundedIcon />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: 13,
                          py: 0.9, px: 2.4,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            opacity: 0.92,
                            transform: 'translateY(-1px)',
                          }
                        }}
                      >
                        Finalizar Revisión
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>

        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            5. MODAL VISOR DE ADJUNTOS / IMÁGENES (LIGHTBOX EN EL MISMO LUGAR)
           ═════════════════════════════════════════════════════════════════════ */}
        {/* ═════════════════════════════════════════════════════════════════════
            5. MODAL VISOR DE ADJUNTOS / IMÁGENES (LIGHTBOX MODERNO LVC)
           ═════════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={Boolean(modalAdjuntoUrl)}
          onClose={() => setModalAdjuntoUrl(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px !important',
              bgcolor: bgModal,
              border: `1.5px solid ${brandBorder}`,
              overflow: 'hidden',
              m: { xs: 1, sm: 2 },
              width: { xs: 'calc(100% - 16px)', sm: 'auto' },
              boxShadow: isDark
                ? `0 0 0 1px ${alpha(gold, 0.08)}, 0 32px 64px rgba(0,0,0,0.85)`
                : '0 24px 48px rgba(0,0,0,0.15)',
            }
          }}
        >
          {/* Header del visor con controles */}
          <Box sx={{
            px: { xs: 2, sm: 3 }, py: 1.8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 1.5,
            borderBottom: `1px solid ${borderField}`,
            bgcolor: brandDim,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{
                width: 38, height: 38,
                bgcolor: modalAdjuntoTipo === 'imagen' ? alpha(gold, 0.15) : alpha('#ef4444', 0.15),
                color: modalAdjuntoTipo === 'imagen' ? gold : '#ef4444',
                border: `1px solid ${modalAdjuntoTipo === 'imagen' ? alpha(gold, 0.3) : alpha('#ef4444', 0.3)}`,
              }}>
                {modalAdjuntoTipo === 'imagen' ? (
                  <ImageRoundedIcon fontSize="small" />
                ) : (
                  <PictureAsPdfRoundedIcon fontSize="small" />
                )}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: 'text.primary' }}>
                  {modalAdjuntoTitulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {modalAdjuntoTipo === 'imagen' ? 'Evidencia fotográfica adjunta del estudiante' : 'Documento PDF adjunto del estudiante'}
                </Typography>
              </Box>
            </Box>

            {/* Controles de Zoom, Rotación y Descarga */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              p: 0.5, borderRadius: '12px', border: `1px solid ${borderField}`
            }}>
              {modalAdjuntoTipo === 'imagen' && (
                <>
                  <Tooltip title="Alejar (-)">
                    <span>
                      <IconButton
                        size="small"
                        disabled={zoomNivel <= 0.5}
                        onClick={() => setZoomNivel(z => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                        sx={{
                          borderRadius: '8px',
                          color: 'text.secondary',
                          '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                        }}
                      >
                        <ZoomOutRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Chip
                    label={`${Math.round(zoomNivel * 100)}%`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: 11,
                      minWidth: 54,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      color: gold,
                      border: `1px solid ${alpha(gold, 0.2)}`,
                    }}
                  />

                  <Tooltip title="Acercar (+)">
                    <span>
                      <IconButton
                        size="small"
                        disabled={zoomNivel >= 3.0}
                        onClick={() => setZoomNivel(z => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                        sx={{
                          borderRadius: '8px',
                          color: 'text.secondary',
                          '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                        }}
                      >
                        <ZoomInRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Girar 90°">
                    <IconButton
                      size="small"
                      onClick={() => setRotacion(r => (r + 90) % 360)}
                      sx={{
                        borderRadius: '8px',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                      }}
                    >
                      <RotateRightRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Restablecer">
                    <IconButton
                      size="small"
                      onClick={() => { setZoomNivel(1); setRotacion(0); }}
                      sx={{
                        borderRadius: '8px',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                      }}
                    >
                      <RestartAltRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: borderField }} />
                </>
              )}

              {modalAdjuntoUrl && (
                <Tooltip title="Descargar archivo original">
                  <IconButton
                    size="small"
                    component="a"
                    href={modalAdjuntoUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      borderRadius: '8px',
                      color: 'text.secondary',
                      '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                    }}
                  >
                    <FileDownloadRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Cerrar visor">
                <IconButton
                  size="small"
                  onClick={() => setModalAdjuntoUrl(null)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: alpha('#ef4444', 0.2), color: '#ef4444' },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Viewport del visor */}
          <DialogContent sx={{
            p: 3,
            minHeight: { xs: 360, sm: 480 },
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            background: isDark
              ? 'radial-gradient(ellipse at center, #0f1c3f 0%, #070c18 100%)'
              : 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
          }}>
            {modalAdjuntoTipo === 'imagen' && modalAdjuntoUrl ? (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `scale(${zoomNivel}) rotate(${rotacion}deg)`,
                transformOrigin: 'center center',
                maxWidth: '100%',
              }}>
                <Box
                  component="img"
                  src={modalAdjuntoUrl}
                  alt={modalAdjuntoTitulo}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: '12px',
                    boxShadow: isDark
                      ? '0 24px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.08)'
                      : '0 20px 40px rgba(0, 0, 0, 0.15)',
                    objectFit: 'contain',
                    userSelect: 'none',
                  }}
                />
              </Box>
            ) : modalAdjuntoTipo === 'pdf' && modalAdjuntoUrl ? (
              <Box
                component="iframe"
                src={modalAdjuntoUrl}
                title={modalAdjuntoTitulo}
                sx={{
                  width: '100%',
                  height: '70vh',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                }}
              />
            ) : null}
          </DialogContent>

          {/* Footer con atajo / ayuda */}
          {modalAdjuntoTipo === 'imagen' && (
            <Box sx={{
              px: 3, py: 1.2,
              borderTop: `1px solid ${borderField}`,
              bgcolor: isDark ? 'rgba(9, 16, 29, 0.95)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'text.secondary',
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <FullscreenRoundedIcon sx={{ fontSize: 16, color: gold }} />
                Controles disponibles: Usa los botones de la barra superior para acercar, alejar o rotar la fotografía.
              </Typography>
              <Chip
                label="Visor LVC"
                size="small"
                sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: brandDim, color: gold }}
              />
            </Box>
          )}
        </Dialog>

        {/* ── Modal de confirmación: Limpiar TODOS los intentos ── */}
        <Dialog
          open={dialogLimpiarTodosOpen}
          onClose={() => !limpiandoTodos && setDialogLimpiarTodosOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px !important',
              p: 1,
              bgcolor: bgModal,
              border: `1.5px solid ${alpha('#ef4444', 0.3)}`,
              boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.7)' : '0 20px 40px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteSweepRoundedIcon /> Limpiar todos los intentos
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', fontSize: 13 }}>
              <strong>Acción irreversible:</strong> Se eliminarán las respuestas, archivos y notas de todos los estudiantes que hayan rendido este examen.
            </Alert>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Actualmente hay <strong>{totalEntregados} estudiantes</strong> con intentos registrados. Al confirmar, toda la evaluación quedará en blanco para que el curso pueda rendirla nuevamente desde cero.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setDialogLimpiarTodosOpen(false)}
              disabled={limpiandoTodos}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmarLimpiarTodos}
              disabled={limpiandoTodos}
              startIcon={limpiandoTodos ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepRoundedIcon />}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800 }}
            >
              {limpiandoTodos ? 'Limpiando...' : 'Sí, eliminar todos los intentos'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Modal de confirmación: Reiniciar intento individual ── */}
        <Dialog
          open={dialogReiniciarEstudianteOpen}
          onClose={() => !reiniciandoEstudiante && setDialogReiniciarEstudianteOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px !important',
              p: 1,
              bgcolor: bgModal,
              border: `1.5px solid ${alpha('#ef4444', 0.3)}`,
              boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.7)' : '0 20px 40px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestartAltRoundedIcon /> Reiniciar intento de estudiante
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              ¿Estás seguro de que deseas reiniciar el intento de <strong>{detalle?.estudiante_nombres} {detalle?.estudiante_apellidos}</strong>?
            </Typography>
            <Alert severity="info" sx={{ borderRadius: '10px', fontSize: 12.5 }}>
              Se borrarán sus respuestas y su calificación en la planilla. El estudiante podrá ingresar de nuevo al examen con el tiempo completo.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setDialogReiniciarEstudianteOpen(false)}
              disabled={reiniciandoEstudiante}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmarReiniciarEstudiante}
              disabled={reiniciandoEstudiante}
              startIcon={reiniciandoEstudiante ? <CircularProgress size={16} color="inherit" /> : <RestartAltRoundedIcon />}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800 }}
            >
              {reiniciandoEstudiante ? 'Reiniciando...' : 'Sí, reiniciar intento'}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
