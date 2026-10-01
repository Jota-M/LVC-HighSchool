'use client';
// components/docente/materiales/QuizTema.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Chip, Button, alpha, CircularProgress,
  Skeleton, TextField, Collapse, IconButton, Tooltip,
  Avatar, Tabs, Tab, InputAdornment, ButtonGroup,
  Dialog, DialogContent, DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Quiz as QuizIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  AssignmentTurnedIn as DoneIcon,
  HourglassEmpty as PendingIcon,
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import {
  useQuizTema,
  useResumenQuizTema,
  useEstudiantesQuizTema,
  useConfigQuizTema
} from '@/hooks/useMaterial';
import type { EstudianteQuizItem, QuizPreguntaCompleta, GuardarPreguntaQuizDTO } from '@/types/materialTypes';
import ConfigQuizModal from './ConfigQuizModal';
import EstudianteDetalleQuizModal from './EstudianteDetalleQuizModal';
import PreguntaQuizModal from './PreguntaQuizModal';

interface QuizTemaProps {
  tema_id: number;
  paralelo_id: number;
  periodo_academico_id: number;
  accent: string;
  accentDark: string;
  isDark: boolean;
}

type FiltroEstudiantes = 'todos' | 'resolvieron' | 'pendientes';

export const QuizTema: React.FC<QuizTemaProps> = ({
  tema_id, paralelo_id, periodo_academico_id, accent, accentDark, isDark,
}) => {
  const {
    preguntas,
    isLoading: loadingPreguntas,
    generando,
    generar,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    refrescar: refrescarPreguntas
  } = useQuizTema(tema_id);
  const { resumen, isLoading: loadingResumen, refrescar: refrescarResumen } = useResumenQuizTema(tema_id, paralelo_id, periodo_academico_id);
  const {
    estudiantes,
    total: totalEstudiantes,
    totalResolvieron,
    totalPendientes,
    isLoading: loadingEstudiantes,
    refrescar: refrescarEstudiantes
  } = useEstudiantesQuizTema(tema_id, paralelo_id, periodo_academico_id);

  const {
    config,
    isLoading: loadingConfig,
    guardando: guardandoConfig,
    guardarConfig,
    toggleActivo,
    refrescar: refrescarConfig
  } = useConfigQuizTema(tema_id, paralelo_id);

  const [expandido, setExpandido] = useState(false);
  const [tabActivo, setTabActivo] = useState<'estudiantes' | 'preguntas'>('estudiantes');
  const [cantidad, setCantidad] = useState(5);
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  // Modales
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<EstudianteQuizItem | null>(null);
  const [modalPreguntaOpen, setModalPreguntaOpen] = useState(false);
  const [preguntaAEditar, setPreguntaAEditar] = useState<QuizPreguntaCompleta | null>(null);
  const [eliminandoPreguntaId, setEliminandoPreguntaId] = useState<number | null>(null);
  const [dlgEliminarPregunta, setDlgEliminarPregunta] = useState<QuizPreguntaCompleta | null>(null);

  // Mensajes rotativos del overlay de carga del quiz
  const [quizLoadingMsgIdx, setQuizLoadingMsgIdx] = useState(0);
  const QUIZ_LOADING_MSGS = [
    'Analizando el contenido del tema…',
    'Generando preguntas con Gemini IA…',
    'Redactando opciones de respuesta…',
    'Verificando coherencia de las preguntas…',
    'Preparando explicaciones didácticas…',
    'Finalizando el cuestionario…',
  ];

  useEffect(() => {
    if (!generando) { setQuizLoadingMsgIdx(0); return; }
    const interval = setInterval(() => {
      setQuizLoadingMsgIdx(i => (i + 1) % QUIZ_LOADING_MSGS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [generando]);

  // Filtros de estudiantes
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstudiantes>('todos');

  const handleAbrirCrearPregunta = () => {
    setPreguntaAEditar(null);
    setModalPreguntaOpen(true);
  };

  const handleAbrirEditarPregunta = (e: React.MouseEvent, p: QuizPreguntaCompleta) => {
    e.stopPropagation();
    setPreguntaAEditar(p);
    setModalPreguntaOpen(true);
  };

  const handleEliminarPregunta = (e: React.MouseEvent, p: QuizPreguntaCompleta) => {
    e.stopPropagation();
    setDlgEliminarPregunta(p);
  };

  const confirmarEliminarPregunta = async () => {
    if (!dlgEliminarPregunta) return;
    setEliminandoPreguntaId(dlgEliminarPregunta.id);
    try {
      await eliminarPregunta(dlgEliminarPregunta.id);
    } finally {
      setEliminandoPreguntaId(null);
      setDlgEliminarPregunta(null);
    }
  };

  const handleGuardarPregunta = async (data: GuardarPreguntaQuizDTO) => {
    if (preguntaAEditar) {
      return await actualizarPregunta(preguntaAEditar.id, data);
    } else {
      return await crearPregunta(data);
    }
  };

  const tieneQuiz = preguntas.length > 0;
  const isCerrado = config?.activo === false;

  // Estado calculado visual
  const estadoBadge = useMemo(() => {
    if (!config) return null;
    if (!config.activo) {
      return { label: 'Cerrado', color: '#dc2626', icon: <LockIcon sx={{ fontSize: '13px !important' }} /> };
    }
    if (config.estado_calculado === 'vencido') {
      return { label: 'Vencido', color: '#d97706', icon: <EventIcon sx={{ fontSize: '13px !important' }} /> };
    }
    if (config.estado_calculado === 'programado') {
      return { label: 'Programado', color: '#2563eb', icon: <EventIcon sx={{ fontSize: '13px !important' }} /> };
    }
    return { label: 'Abierto', color: '#16a34a', icon: <LockOpenIcon sx={{ fontSize: '13px !important' }} /> };
  }, [config]);

  // Filtrado de estudiantes
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(e => {
      // Filtro por tab/estado
      if (filtroEstado === 'resolvieron' && !e.ha_resuelto) return false;
      if (filtroEstado === 'pendientes' && e.ha_resuelto) return false;

      // Filtro por búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const nom = `${e.estudiante_nombres} ${e.estudiante_apellidos}`.toLowerCase();
        const cod = (e.estudiante_codigo || '').toLowerCase();
        const mat = (e.numero_matricula || '').toLowerCase();
        return nom.includes(q) || cod.includes(q) || mat.includes(q);
      }
      return true;
    });
  }, [estudiantes, filtroEstado, busqueda]);

  const refrescarTodo = () => {
    refrescarPreguntas();
    refrescarResumen();
    refrescarEstudiantes();
    refrescarConfig();
  };

  return (
    <Box sx={{
      mt: 2, borderRadius: '14px', overflow: 'hidden',
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      position: 'relative',
    }}>
      {/* ── Overlay de carga del Quiz ── */}
      {generando && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2.5,
            borderRadius: '14px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            bgcolor: isDark ? 'rgba(9,16,29,0.90)' : 'rgba(255,255,255,0.90)',
            '@keyframes quiz-pulse-ring': {
              '0%': { transform: 'scale(0.85)', opacity: 0.7 },
              '50%': { transform: 'scale(1.15)', opacity: 0.2 },
              '100%': { transform: 'scale(0.85)', opacity: 0.7 },
            },
            '@keyframes quiz-spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
            '@keyframes quiz-fade-up': {
              from: { opacity: 0, transform: 'translateY(5px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {/* Orb */}
          <Box sx={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[1, 2].map(n => (
              <Box key={n} sx={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1.5px solid ${alpha('#a855f7', 0.3 / n)}`,
                animation: `quiz-pulse-ring ${1.6 + n * 0.5}s ease-in-out ${n * 0.2}s infinite`,
              }} />
            ))}
            <Box sx={{
              position: 'absolute', inset: 6, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#a855f7',
              borderRightColor: alpha('#6366f1', 0.45),
              animation: 'quiz-spin 1s linear infinite',
            }} />
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 22px rgba(168,85,247,0.5)',
            }}>
              <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
          </Box>

          {/* Texto */}
          <Box sx={{ textAlign: 'center', maxWidth: 280, px: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 0.6 }}>
              Generando cuestionario con IA
            </Typography>
            <Typography
              key={quizLoadingMsgIdx}
              sx={{ fontSize: '0.78rem', color: 'text.secondary', animation: 'quiz-fade-up 0.35s ease both' }}
            >
              {QUIZ_LOADING_MSGS[quizLoadingMsgIdx]}
            </Typography>
          </Box>

          {/* Barra */}
          <Box sx={{
            width: 180, height: 3, borderRadius: '99px',
            bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07),
            overflow: 'hidden',
            '@keyframes quiz-bar': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(280%)' },
            },
          }}>
            <Box sx={{
              width: '40%', height: '100%', borderRadius: '99px',
              background: 'linear-gradient(90deg, #a855f7, #6366f1)',
              animation: 'quiz-bar 1.5s ease-in-out infinite',
            }} />
          </Box>

          <Typography sx={{ fontSize: '0.67rem', color: 'text.disabled', fontStyle: 'italic' }}>
            Puede tardar unos segundos…
          </Typography>
        </Box>
      )}

      {/* ── Header Principal ── */}
      <Box
        onClick={() => setExpandido(p => !p)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2, cursor: 'pointer', flexWrap: 'wrap', gap: 1.5,
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '9px',
            bgcolor: alpha('#a855f7', 0.1), color: '#a855f7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QuizIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>
                Quiz de repaso
              </Typography>
              {estadoBadge && (
                <Chip
                  icon={estadoBadge.icon}
                  label={estadoBadge.label}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
                    bgcolor: alpha(estadoBadge.color, 0.1), color: estadoBadge.color,
                    border: `1px solid ${alpha(estadoBadge.color, 0.25)}`
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', mt: 0.2 }}>
              {loadingPreguntas ? 'Cargando…' : tieneQuiz ? `${preguntas.length} preguntas` : 'Sin quiz generado'}
              {config?.limite_intentos ? ` · Límite: ${config.limite_intentos} intento${config.limite_intentos > 1 ? 's' : ''}` : ' · Intentos ilimitados'}
            </Typography>
          </Box>
        </Box>

        {/* Acciones del Header */}
        <Box
          onClick={e => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {/* Resumen rápido de notas */}
          {!loadingResumen && resumen && resumen.total_intentaron > 0 && (
            <Chip
              icon={<TrophyIcon sx={{ fontSize: '13px !important' }} />}
              label={`Prom. ${resumen.promedio_puntaje}% · ${resumen.total_intentaron}/${resumen.total_estudiantes}`}
              size="small"
              sx={{
                height: 24, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px',
                bgcolor: alpha(accent, 0.1), color: accent,
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            />
          )}

          {/* Botón rápido de Cerrar / Abrir Quiz */}
          <Button
            size="small"
            variant={isCerrado ? 'contained' : 'outlined'}
            onClick={toggleActivo}
            disabled={guardandoConfig}
            startIcon={
              guardandoConfig ? (
                <CircularProgress size={12} color="inherit" />
              ) : isCerrado ? (
                <LockOpenIcon sx={{ fontSize: 14 }} />
              ) : (
                <LockIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              height: 28, borderRadius: '8px', textTransform: 'none',
              fontWeight: 700, fontSize: '0.72rem', px: 1.25,
              ...(isCerrado ? {
                bgcolor: '#16a34a', color: '#fff',
                '&:hover': { bgcolor: '#15803d' }
              } : {
                borderColor: alpha('#dc2626', 0.4), color: '#dc2626',
                '&:hover': { bgcolor: alpha('#dc2626', 0.06), borderColor: '#dc2626' }
              })
            }}
          >
            {isCerrado ? 'Abrir quiz' : 'Cerrar quiz'}
          </Button>

          {/* Botón Configuración de Fechas / Intentos */}
          <Tooltip title="Configurar fechas, cierre e intentos">
            <IconButton
              size="small"
              onClick={() => setModalConfigOpen(true)}
              sx={{
                width: 28, height: 28, borderRadius: '8px',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                color: 'text.secondary',
                '&:hover': { bgcolor: alpha(accent, 0.08), color: accent }
              }}
            >
              <SettingsIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Icono de Expandir / Colapsar */}
          <IconButton
            size="small"
            onClick={() => setExpandido(p => !p)}
            sx={{ width: 28, height: 28, color: 'text.disabled' }}
          >
            {expandido ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* ── Contenido Expandido ── */}
      <Collapse in={expandido} timeout="auto">
        <Box sx={{
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        }}>
          {/* Navegación por pestañas: Estudiantes vs Preguntas */}
          <Box sx={{ px: 3, pt: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}` }}>
            <Tabs
              value={tabActivo}
              onChange={(_, v) => setTabActivo(v)}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40, py: 1, px: 2, fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'none', color: 'text.secondary',
                  '&.Mui-selected': { color: accent }
                },
                '& .MuiTabs-indicator': { bgcolor: accent, height: 2.5, borderRadius: '2px' }
              }}
            >
              <Tab
                value="estudiantes"
                icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label={`Estudiantes (${totalResolvieron}/${totalEstudiantes})`}
              />
              <Tab
                value="preguntas"
                icon={<QuizIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label={`Preguntas (${preguntas.length})`}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 1: ESTUDIANTES Y RESULTADOS                          */}
            {/* ══════════════════════════════════════════════════════════ */}
            {tabActivo === 'estudiantes' && (
              <Box>
                {/* Resumen estadístico */}
                {!loadingResumen && resumen && (
                  <Box sx={{
                    p: 1.75, mb: 2.5, borderRadius: '12px',
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                    display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap',
                  }}>
                    {[
                      { label: 'Total estudiantes', val: resumen.total_estudiantes, color: 'text.primary' },
                      { label: 'Resolvieron', val: `${resumen.total_intentaron}`, color: accent },
                      { label: 'Promedio general', val: `${resumen.promedio_puntaje}%`, color: '#2563eb' },
                      { label: 'Aprobados (≥51%)', val: resumen.aprobados, color: '#16a34a' },
                      { label: 'Pendientes', val: totalPendientes, color: '#dc2626' },
                    ].map(s => (
                      <Box key={s.label}>
                        <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                          {s.val}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.4 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Toolbar: Buscador y Filtros */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 1.5, mb: 2, flexWrap: 'wrap'
                }}>
                  {/* Buscador */}
                  <TextField
                    size="small"
                    placeholder="Buscar estudiante o RUDE…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: '100%', sm: 260 },
                      '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.78rem' }
                    }}
                  />

                  {/* Filtros de estado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ButtonGroup size="small" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                      {[
                        { key: 'todos' as FiltroEstudiantes, label: `Todos (${totalEstudiantes})` },
                        { key: 'resolvieron' as FiltroEstudiantes, label: `Resolvieron (${totalResolvieron})` },
                        { key: 'pendientes' as FiltroEstudiantes, label: `Pendientes (${totalPendientes})` },
                      ].map(f => (
                        <Button
                          key={f.key}
                          variant={filtroEstado === f.key ? 'contained' : 'outlined'}
                          onClick={() => setFiltroEstado(f.key)}
                          sx={{
                            fontSize: '0.72rem', textTransform: 'none', fontWeight: 600,
                            ...(filtroEstado === f.key ? {
                              bgcolor: accent, color: isDark ? '#000' : '#fff',
                              '&:hover': { bgcolor: alpha(accent, 0.85) }
                            } : {
                              borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                              color: 'text.secondary'
                            })
                          }}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </ButtonGroup>

                    <Tooltip title="Actualizar lista">
                      <IconButton
                        size="small"
                        onClick={refrescarEstudiantes}
                        disabled={loadingEstudiantes}
                        sx={{
                          width: 32, height: 32, borderRadius: '8px',
                          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`
                        }}
                      >
                        <RefreshIcon sx={{ fontSize: 16, animation: loadingEstudiantes ? 'spin 1s infinite' : 'none' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Lista de estudiantes */}
                {loadingEstudiantes ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '10px' }} />
                    ))}
                  </Box>
                ) : estudiantesFiltrados.length === 0 ? (
                  <Box sx={{
                    p: 4, textAlign: 'center', borderRadius: '12px',
                    bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01),
                    border: `1px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                      {busqueda ? 'No se encontraron estudiantes que coincidan con la búsqueda.'
                        : filtroEstado === 'resolvieron' ? 'Ningún estudiante ha resuelto el quiz todavía.'
                          : filtroEstado === 'pendientes' ? '¡Todos los estudiantes han resuelto el quiz!'
                            : 'No hay estudiantes matriculados en este curso.'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {estudiantesFiltrados.map(est => {
                      const haResuelto = est.ha_resuelto;
                      const puntaje = est.mejor_puntaje ?? 0;
                      const esAprobado = puntaje >= 51;
                      const pColor = puntaje >= 70 ? '#16a34a' : puntaje >= 51 ? '#d97706' : '#dc2626';

                      return (
                        <Box
                          key={est.matricula_id}
                          sx={{
                            p: 1.5, px: 2, borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 1.5,
                            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                            bgcolor: isDark ? alpha('#fff', 0.015) : '#fff',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isDark ? alpha('#fff', 0.035) : alpha('#000', 0.015),
                              borderColor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)
                            }
                          }}
                        >
                          {/* Info del alumno */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={est.estudiante_foto || undefined}
                              sx={{
                                width: 36, height: 36,
                                bgcolor: alpha(accent, 0.12),
                                color: accent,
                                fontWeight: 700,
                                fontSize: '0.82rem'
                              }}
                            >
                              {est.estudiante_nombres?.[0] || 'E'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>
                                {est.estudiante_apellidos}, {est.estudiante_nombres}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.2 }}>
                                RUDE/Código: {est.estudiante_codigo || 'S/C'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Estado y Acciones */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            {haResuelto ? (
                              <>
                                {/* Chip de nota */}
                                <Box sx={{ textAlign: 'right' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'flex-end' }}>
                                    <Chip
                                      label={`${puntaje}%`}
                                      size="small"
                                      sx={{
                                        height: 22, fontSize: '0.72rem', fontWeight: 800, borderRadius: '6px',
                                        bgcolor: alpha(pColor, 0.12), color: pColor,
                                        border: `1px solid ${alpha(pColor, 0.3)}`
                                      }}
                                    />
                                    <Typography sx={{
                                      fontSize: '0.68rem', fontWeight: 700,
                                      color: esAprobado ? '#16a34a' : '#dc2626'
                                    }}>
                                      {esAprobado ? 'Aprobado' : 'Reprobado'}
                                    </Typography>
                                  </Box>
                                  <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.2 }}>
                                    {est.total_intentos} intento{est.total_intentos !== 1 ? 's' : ''}
                                    {est.ultimo_intento_fecha && (
                                      <> · {new Date(est.ultimo_intento_fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</>
                                    )}
                                  </Typography>
                                </Box>

                                {/* Botón ver respuestas */}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                                  onClick={() => setEstudianteSeleccionado(est)}
                                  sx={{
                                    borderRadius: '8px', textTransform: 'none',
                                    fontSize: '0.72rem', fontWeight: 600, height: 28, px: 1.25,
                                    borderColor: alpha('#a855f7', 0.4), color: '#a855f7',
                                    '&:hover': { bgcolor: alpha('#a855f7', 0.06), borderColor: '#a855f7' }
                                  }}
                                >
                                  Ver respuestas
                                </Button>
                              </>
                            ) : (
                              <Chip
                                icon={<PendingIcon sx={{ fontSize: '13px !important' }} />}
                                label="Sin resolver"
                                size="small"
                                sx={{
                                  height: 22, fontSize: '0.68rem', fontWeight: 600, borderRadius: '6px',
                                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                                  color: 'text.disabled'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 2: PREGUNTAS DEL QUIZ                                */}
            {/* ══════════════════════════════════════════════════════════ */}
            {tabActivo === 'preguntas' && (
              <Box>
                {/* Controles: Añadir manual + Generar con IA */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  mb: 2.5, flexWrap: 'wrap', gap: 1.5,
                  p: 1.5, borderRadius: '10px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`
                }}>
                  {/* Botón Añadir Pregunta Manual */}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    onClick={handleAbrirCrearPregunta}
                    sx={{
                      bgcolor: accent,
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      height: 36,
                      px: 2,
                      '&:hover': { bgcolor: alpha(accent, 0.88), boxShadow: 'none' }
                    }}
                  >
                    Añadir pregunta
                  </Button>

                  {/* Controles IA */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      size="small" type="number" label="Nº preguntas"
                      value={cantidad}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 1;
                        setCantidad(Math.min(20, Math.max(1, v)));
                      }}
                      inputProps={{ min: 1, max: 20 }}
                      sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36 } }}
                    />
                    <Button
                      variant="outlined" size="small"
                      startIcon={generando ? <CircularProgress size={13} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                      onClick={() => generar(cantidad)}
                      disabled={generando}
                      sx={{
                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', height: 36,
                        borderColor: alpha('#a855f7', 0.4), color: '#a855f7',
                        '&:hover': { bgcolor: alpha('#a855f7', 0.06), borderColor: '#a855f7' },
                      }}>
                      {generando ? 'Generando…' : tieneQuiz ? 'Regenerar con IA' : 'Generar con IA'}
                    </Button>
                  </Box>
                </Box>

                {/* Lista de preguntas */}
                {loadingPreguntas ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: '8px' }} />)}
                  </Box>
                ) : !tieneQuiz ? (
                  <Box sx={{
                    textAlign: 'center', py: 4, px: 2,
                    borderRadius: '10px',
                    border: `1px dashed ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                    bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01)
                  }}>
                    <QuizIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
                      Aún no hay preguntas para este tema
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Puedes añadir preguntas manualmente o generarlas de forma asistida con Inteligencia Artificial.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                      onClick={handleAbrirCrearPregunta}
                      sx={{
                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.76rem',
                        borderColor: alpha(accent, 0.5), color: accent,
                        '&:hover': { bgcolor: alpha(accent, 0.08), borderColor: accent }
                      }}
                    >
                      Añadir primera pregunta
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {preguntas.map((p, idx) => (
                      <Box key={p.id} sx={{
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                        '&:hover': {
                          borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
                        }
                      }}>
                        <Box
                          onClick={() => setPreguntaAbierta(prev => prev === p.id ? null : p.id)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.25, cursor: 'pointer',
                            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01) },
                          }}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                            bgcolor: alpha(accent, 0.1), color: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.68rem', fontWeight: 800,
                          }}>
                            {idx + 1}
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, pr: 1 }}>
                            {p.pregunta}
                          </Typography>

                          {/* Acciones Editar y Eliminar */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Editar pregunta" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => handleAbrirEditarPregunta(e, p)}
                                sx={{
                                  p: 0.5,
                                  color: 'text.secondary',
                                  '&:hover': { color: accent, bgcolor: alpha(accent, 0.1) }
                                }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar pregunta" arrow>
                              <IconButton
                                size="small"
                                disabled={eliminandoPreguntaId === p.id}
                                onClick={(e) => handleEliminarPregunta(e, p)}
                                sx={{
                                  p: 0.5,
                                  color: 'text.secondary',
                                  '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.1) }
                                }}
                              >
                                {eliminandoPreguntaId === p.id ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>

                          {preguntaAbierta === p.id
                            ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                            : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
                        </Box>

                        <Collapse in={preguntaAbierta === p.id} timeout="auto">
                          <Box sx={{ px: 2, pb: 1.5, pl: 6 }}>
                            {p.opciones.map((op, i) => {
                              const esCorrecta = i === p.respuesta_correcta;
                              return (
                                <Box key={i} sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  py: 0.4, fontSize: '0.78rem',
                                  color: esCorrecta ? '#16a34a' : 'text.secondary',
                                  fontWeight: esCorrecta ? 700 : 400,
                                }}>
                                  {esCorrecta
                                    ? <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                                    : <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.15)}` }} />}
                                  {op}
                                </Box>
                              );
                            })}
                            {p.explicacion && (
                              <Typography sx={{
                                mt: 1, fontSize: '0.74rem', color: 'text.disabled',
                                fontStyle: 'italic', lineHeight: 1.5,
                              }}>
                                💡 {p.explicacion}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>

      {/* ── Modal de Configuración ── */}
      <ConfigQuizModal
        open={modalConfigOpen}
        onClose={() => setModalConfigOpen(false)}
        config={config}
        onGuardar={guardarConfig}
        accent={accent}
        isDark={isDark}
      />

      {/* ── Modal de Detalle de Respuestas del Alumno ── */}
      <EstudianteDetalleQuizModal
        open={Boolean(estudianteSeleccionado)}
        onClose={() => setEstudianteSeleccionado(null)}
        estudiante={estudianteSeleccionado}
        preguntasDocente={preguntas}
        accent={accent}
        isDark={isDark}
      />

      {/* ── Modal Añadir / Editar Pregunta ── */}
      <PreguntaQuizModal
        open={modalPreguntaOpen}
        onClose={() => {
          setModalPreguntaOpen(false);
          setPreguntaAEditar(null);
        }}
        preguntaEditar={preguntaAEditar}
        onGuardar={handleGuardarPregunta}
        accent={accent}
        isDark={isDark}
      />

      {/* ── Dialog: Confirmar eliminar pregunta ── */}
      <Dialog
        open={!!dlgEliminarPregunta}
        onClose={() => !eliminandoPreguntaId && setDlgEliminarPregunta(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101d' : '#ffffff',
            border: `1.5px solid ${alpha('#dc2626', 0.35)}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(220,38,38,0.08), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.2)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          background: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)',
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
              background: alpha('#dc2626', 0.15),
              border: `1px solid ${alpha('#dc2626', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DeleteIcon sx={{ color: '#dc2626', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#dc2626', mb: 0.2 }}>
                CUESTIONARIO · ELIMINAR PREGUNTA
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.15, color: 'text.primary' }}>
                ¿Eliminar esta pregunta?
              </Typography>
            </Box>
          </Box>
          <Box
            onClick={() => !eliminandoPreguntaId && setDlgEliminarPregunta(null)}
            sx={{
              width: 30, height: 30, borderRadius: '8px', cursor: eliminandoPreguntaId ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'text.secondary',
              '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.08) },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{
            p: 2, borderRadius: '12px',
            bgcolor: isDark ? alpha('#dc2626', 0.07) : alpha('#dc2626', 0.04),
            border: `1px solid ${alpha('#dc2626', 0.18)}`,
            mb: 1.5,
          }}>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.5 }}>
              "{dlgEliminarPregunta?.pregunta.slice(0, 100)}{(dlgEliminarPregunta?.pregunta.length ?? 0) > 100 ? '…' : ''}"
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Esta acción eliminará permanentemente la pregunta y sus opciones del cuestionario. Los intentos previos de los estudiantes <strong>no se verán afectados</strong>.
          </Typography>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          gap: 1,
        }}>
          <Button
            onClick={() => setDlgEliminarPregunta(null)}
            disabled={!!eliminandoPreguntaId}
            variant="outlined"
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminarPregunta}
            disabled={!!eliminandoPreguntaId}
            variant="contained"
            startIcon={eliminandoPreguntaId ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
            }}
          >
            {eliminandoPreguntaId ? 'Eliminando…' : 'Sí, eliminar pregunta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizTema;