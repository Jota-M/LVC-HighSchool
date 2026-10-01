'use client';
// components/estudiante/examenes/TomarExamen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, TextField, Stack, Chip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, LinearProgress, IconButton, Tooltip, alpha, useTheme, Grid
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  AccessTimeRounded as TimeIcon,
  CheckCircleRounded as DoneIcon,
  CloudUploadRounded as UploadIcon,
  AttachFileRounded as FileIcon,
  WarningAmberRounded as WarningIcon,
  SendRounded as SendIcon,
  ArrowBackRounded as BackIcon,
  NavigateBeforeRounded as PrevIcon,
  NavigateNextRounded as NextIcon,
  BookmarkBorderRounded as BookmarkBorderIcon,
  BookmarkRounded as BookmarkIcon,
  RestartAltRounded as ResetIcon,
  StarRounded as StarIcon,
  HelpOutlineRounded as HelpIcon,
  CheckRounded as CheckIcon,
  AssignmentRounded as ExamIcon,
  GradeRounded as GradeIcon,
  VisibilityRounded as VisibilityIcon,
  DownloadRounded as DownloadIcon,
  CloseRounded as CloseIcon,
  ImageRounded as ImageIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useTomarExamen } from '@/hooks/useExamen';
import { useRouter } from 'next/navigation';

interface TomarExamenProps {
  evaluacionId: number;
  matriculaId: number | null;
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.85; transform: scale(1.02); }
`;

const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // En modo oscuro: amarillo/dorado institucional (#facc15 / #f59e0b) como en Docente Horario
  // En modo claro: azul institucional (#0288d1 / #01579b) como en Docente Horario y resto de módulos
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';
  return { isDark, accentColor, accentColorEnd, gradBg, textOnAccent };
};

export const TomarExamen: React.FC<TomarExamenProps> = ({ evaluacionId, matriculaId }) => {
  const { isDark, accentColor, gradBg, textOnAccent } = usePalette();
  const router = useRouter();

  const {
    datosExamen,
    respuestasLocales,
    isLoading,
    enviando,
    subiendoArchivo,
    autosave,
    subirArchivo,
    entregar,
    errorMensaje,
  } = useTomarExamen(evaluacionId, matriculaId);

  // Estados de navegación y revisión
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [marcadasParaRevisar, setMarcadasParaRevisar] = useState<Record<number, boolean>>({});

  // Temporizador regresivo
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null);
  const [modalConfirmarOpen, setModalConfirmarOpen] = useState(false);
  const [examenFinalizado, setExamenFinalizado] = useState(false);
  const [intentoFinalizado, setIntentoFinalizado] = useState<any>(null);

  // Modal para previsualizar foto y descargar
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string>('');
  const [modalPreviewTitulo, setModalPreviewTitulo] = useState<string>('');
  const [modalPreviewNombreArchivo, setModalPreviewNombreArchivo] = useState<string>('');

  const esImagen = (urlOrName?: string | null): boolean => {
    if (!urlOrName) return false;
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(urlOrName) || urlOrName.startsWith('data:image/');
  };

  const abrirPrevisualizacion = (url: string, tituloModal: string, nombreArchivo?: string) => {
    setModalPreviewUrl(url);
    setModalPreviewTitulo(tituloModal);
    setModalPreviewNombreArchivo(nombreArchivo || 'foto_resolucion.jpg');
    setModalPreviewOpen(true);
  };

  const handleDescargarArchivo = async (url: string, nombreArchivo: string = 'foto_resolucion.jpg') => {
    try {
      let downloadUrl = url;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/') && !downloadUrl.includes('fl_attachment')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Error al obtener archivo');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Descargando imagen...');
    } catch {
      let fallbackUrl = url;
      if (fallbackUrl.includes('cloudinary.com') && fallbackUrl.includes('/upload/') && !fallbackUrl.includes('fl_attachment')) {
        fallbackUrl = fallbackUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.target = '_blank';
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const preguntas = datosExamen?.preguntas || [];
  const evaluacion = datosExamen?.evaluacion;
  const preguntaActual = preguntas[preguntaActualIndex];

  // Contenedores dinámicos adaptados a modo oscuro (amarillo degradado) y modo claro (azul degradado institucional)
  const containerCardSx = {
    borderRadius: '16px',
    border: `1.5px solid ${alpha(accentColor, isDark ? 0.22 : 0.2)}`,
    background: isDark
      ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.03)} 40%, rgba(15, 23, 42, 0.75) 100%)`
      : `linear-gradient(135deg, ${alpha('#0288d1', 0.08)} 0%, ${alpha('#01579b', 0.03)} 50%, #ffffff 100%)`,
    boxShadow: isDark
      ? `0 8px 32px rgba(0, 0, 0, 0.45), 0 0 1px ${alpha(accentColor, 0.3)}`
      : `0 8px 24px ${alpha(accentColor, 0.08)}, 0 1px 3px rgba(0,0,0,0.05)`,
    overflow: 'hidden',
  };

  const headerBarSx = {
    px: 2.5,
    py: 1.6,
    borderBottom: `1px solid ${alpha(accentColor, isDark ? 0.15 : 0.15)}`,
    background: isDark
      ? `linear-gradient(90deg, ${alpha(accentColor, 0.08)} 0%, transparent 100%)`
      : `linear-gradient(90deg, ${alpha(accentColor, 0.08)} 0%, transparent 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // Inicializar tiempo restante y estado finalizado
  useEffect(() => {
    if (datosExamen?.segundos_restantes !== null && datosExamen?.segundos_restantes !== undefined) {
      setSegundosRestantes(datosExamen.segundos_restantes);
    }
    if (datosExamen?.ya_finalizado) {
      setExamenFinalizado(true);
      setIntentoFinalizado(datosExamen.intento);
    }
  }, [datosExamen]);

  // Intervalo de reloj
  useEffect(() => {
    if (segundosRestantes === null || segundosRestantes <= 0 || examenFinalizado) return;

    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleEntregaAutomatica();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [segundosRestantes, examenFinalizado]);

  const handleEntregaAutomatica = async () => {
    const resultado = await entregar();
    if (resultado) {
      setIntentoFinalizado(resultado);
      setExamenFinalizado(true);
    }
  };

  const handleConfirmarEntrega = async () => {
    setModalConfirmarOpen(false);
    const resultado = await entregar();
    if (resultado) {
      setIntentoFinalizado(resultado);
      setExamenFinalizado(true);
    }
  };

  // Formato MM:SS o HH:MM:SS
  const formatTiempo = (segundos: number) => {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determinar si una pregunta está respondida
  const estaRespondida = (pId: number) => {
    const r = respuestasLocales[pId];
    if (!r) return false;
    if (r.opcion !== undefined && r.opcion !== null) return true;
    if (r.texto && r.texto.trim() !== '') return true;
    if (r.archivo_url) return true;
    return false;
  };

  // Contar respondidas
  const totalRespondidas = useMemo(() => {
    return preguntas.filter(p => estaRespondida(p.id)).length;
  }, [preguntas, respuestasLocales]);

  // Toggle marcar para revisar
  const toggleMarcarRevisar = (pId: number) => {
    setMarcadasParaRevisar(prev => ({
      ...prev,
      [pId]: !prev[pId],
    }));
  };

  // Limpiar respuesta actual
  const limpiarRespuestaActual = () => {
    if (!preguntaActual) return;
    autosave(preguntaActual.id, {
      respuesta_opcion: null,
      respuesta_texto: '',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={42} sx={{ color: accentColor, mb: 2 }} />
        <Typography variant="body1" fontWeight={700} color="text.secondary">
          Cargando tu examen virtual...
        </Typography>
      </Box>
    );
  }

  // Error de programación o no disponible
  if (errorMensaje && !datosExamen) {
    return (
      <Paper sx={{
        ...containerCardSx,
        maxWidth: 580, mx: 'auto', p: 4, textAlign: 'center', mt: 6,
      }}>
        <Box sx={{
          width: 68, height: 68, borderRadius: '50%',
          bgcolor: alpha(accentColor, 0.15), color: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2,
        }}>
          <TimeIcon sx={{ fontSize: 38 }} />
        </Box>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
          Examen no disponible
        </Typography>

        <Alert severity="warning" sx={{ borderRadius: '12px', mb: 3, textAlign: 'left', fontSize: 14 }}>
          {errorMensaje}
        </Alert>

        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<BackIcon />}
          sx={{ background: gradBg, color: textOnAccent, borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 3.5, py: 1.2 }}
        >
          Volver a mis evaluaciones
        </Button>
      </Paper>
    );
  }

  // Si ya entregó el examen
  if (examenFinalizado) {
    const puntaje = intentoFinalizado?.puntaje_obtenido ?? datosExamen?.intento?.puntaje_obtenido;
    const completo = intentoFinalizado?.calificado_completo ?? datosExamen?.intento?.calificado_completo;

    return (
      <Paper sx={{
        ...containerCardSx,
        maxWidth: 640, mx: 'auto', p: 4.5, textAlign: 'center', mt: 4,
      }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: '50%',
          bgcolor: alpha(accentColor, 0.15), color: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
        }}>
          <DoneIcon sx={{ fontSize: 44 }} />
        </Box>

        <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
          ¡Examen Entregado!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, maxWidth: 460, mx: 'auto' }}>
          Tus respuestas han sido registradas formalmente en el sistema escolar.
        </Typography>

        {completo && puntaje !== null && puntaje !== undefined ? (
          <Paper sx={{
            p: 3, borderRadius: '14px', mb: 3.5,
            bgcolor: alpha(accentColor, 0.12), border: `1.5px solid ${alpha(accentColor, 0.35)}`,
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>
              Puntaje Obtenido
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ color: accentColor }}>
              {puntaje} / {datosExamen?.evaluacion?.puntaje_maximo || 100} pts
            </Typography>
          </Paper>
        ) : (
          <Alert severity="info" sx={{ borderRadius: '12px', mb: 3.5, textAlign: 'left', fontSize: 13.5 }}>
            Este examen contiene preguntas que requieren revisión del docente. Tu nota final se publicará una vez concluida la calificación.
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={() => router.back()}
          startIcon={<BackIcon />}
          sx={{ background: gradBg, color: textOnAccent, borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.3 }}
        >
          Volver a mis evaluaciones
        </Button>
      </Paper>
    );
  }

  const tiempoCritico = segundosRestantes !== null && segundosRestantes < 300;
  const letrasOpcion = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const respActual = preguntaActual ? respuestasLocales[preguntaActual.id] || {} : {};
  const esObjetiva = preguntaActual?.tipo === 'opcion_multiple' || preguntaActual?.tipo === 'verdadero_falso';
  const esMarcadaActual = preguntaActual ? Boolean(marcadasParaRevisar[preguntaActual.id]) : false;

  return (
    <Box sx={{ width: '100%', pb: 6 }}>

      {/* ══ HEADER INSTITUCIONAL DOCENTE ══ */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Tooltip title="Volver a mis evaluaciones">
            <IconButton
              size="small"
              onClick={() => router.back()}
              sx={{
                borderRadius: '10px',
                border: `1px solid ${alpha(accentColor, 0.3)}`,
                bgcolor: alpha(accentColor, 0.08),
                color: accentColor,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: accentColor,
                  bgcolor: alpha(accentColor, 0.18),
                },
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            Volver a mis evaluaciones
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ExamIcon
            sx={{
              color: accentColor,
              fontSize: { xs: 32, md: 38 },
              animation: `${bounce} 2s infinite ease-in-out`,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.6rem', sm: '2rem', md: '2.25rem' },
              fontWeight: 800,
              background: gradBg,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {evaluacion?.nombre || 'Examen Virtual'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Lee cada pregunta con atención antes de responder — tu progreso se guarda automáticamente.
          </Typography>
          <Chip
            label={`${preguntas.length} preguntas`}
            size="small"
            sx={{ fontWeight: 700, fontSize: 11, height: 24, bgcolor: alpha(accentColor, 0.14), color: accentColor }}
          />
          <Chip
            label={`${evaluacion?.puntaje_maximo || 100} pts`}
            size="small"
            sx={{ fontWeight: 700, fontSize: 11, height: 24, bgcolor: alpha(accentColor, 0.08), color: accentColor }}
          />
          <Chip
            label="Modalidad Virtual"
            size="small"
            sx={{ fontWeight: 700, fontSize: 11, height: 24, bgcolor: alpha(accentColor, 0.12), color: accentColor }}
          />
        </Box>
      </Box>

      {/* ══ GRID PRINCIPAL 2 COLUMNAS (ALINEADO Y EXPANDIDO SIN ESPACIOS VACÍOS) ══ */}
      <Grid container spacing={3} alignItems="stretch">

        {/* ── COLUMNA IZQUIERDA: PANEL LATERAL DE NAVEGACIÓN Y CONTROL ── */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <Paper sx={{ ...containerCardSx }}>
              {/* Header de la tarjeta */}
              <Box sx={{ ...headerBarSx }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GradeIcon sx={{ fontSize: 18, color: accentColor }} />
                  Estado del Examen
                </Typography>
                <Chip
                  label={totalRespondidas === preguntas.length ? 'Completo' : 'En progreso'}
                  size="small"
                  sx={{
                    fontSize: 10.5, height: 22, fontWeight: 800,
                    bgcolor: totalRespondidas === preguntas.length ? alpha('#10b981', 0.2) : alpha(accentColor, 0.18),
                    color: totalRespondidas === preguntas.length ? '#10b981' : accentColor,
                  }}
                />
              </Box>

              <Box sx={{ p: 2.5 }}>
                {/* Cronómetro adaptativo */}
                {segundosRestantes !== null && (
                  <Box sx={{
                    p: 2, borderRadius: '12px', mb: 2.5,
                    bgcolor: tiempoCritico ? alpha('#ef4444', 0.15) : alpha(accentColor, 0.08),
                    border: `1.5px solid ${tiempoCritico ? alpha('#ef4444', 0.5) : alpha(accentColor, 0.25)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon sx={{
                        color: tiempoCritico ? '#ef4444' : accentColor,
                        fontSize: 22,
                        animation: tiempoCritico ? `${pulse} 1s infinite` : 'none',
                      }} />
                      <Typography variant="body2" fontWeight={800} color={tiempoCritico ? 'error.main' : 'text.primary'}>
                        Tiempo restante
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={900} sx={{
                      color: tiempoCritico ? '#ef4444' : accentColor,
                      fontFamily: 'monospace',
                      letterSpacing: 0.5,
                    }}>
                      {formatTiempo(segundosRestantes)}
                    </Typography>
                  </Box>
                )}

                {/* Barra de Progreso */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: accentColor }}>
                      {totalRespondidas} / {preguntas.length} respondidas
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={preguntas.length ? (totalRespondidas / preguntas.length) * 100 : 0}
                    sx={{
                      height: 8, borderRadius: 4,
                      bgcolor: alpha(accentColor, 0.15),
                      '& .MuiLinearProgress-bar': { background: gradBg, borderRadius: 4 },
                    }}
                  />
                </Box>

                {/* Mapa de Preguntas */}
                <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(accentColor, 0.12)}` }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Mapa de Preguntas
                  </Typography>

                  {/* Leyenda */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accentColor }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Respondida</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2) }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Sin responder</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isDark ? '#38bdf8' : accentColor }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Actual</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <BookmarkIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Por revisar</Typography>
                    </Box>
                  </Box>

                  {/* Cuadrícula interactiva 5 columnas */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                    {preguntas.map((p, idx) => {
                      const esActual = idx === preguntaActualIndex;
                      const respondida = estaRespondida(p.id);
                      const marcada = marcadasParaRevisar[p.id];

                      return (
                        <Tooltip key={p.id} title={`Pregunta ${idx + 1} (${p.tipo.replace('_', ' ')})`} arrow>
                          <Box
                            onClick={() => setPreguntaActualIndex(idx)}
                            sx={{
                              height: 38,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              fontWeight: 800,
                              fontSize: 13,
                              transition: 'all 0.15s ease-in-out',
                              border: esActual
                                ? `2px solid ${isDark ? '#38bdf8' : accentColor}`
                                : respondida
                                  ? `1.5px solid ${alpha(accentColor, 0.6)}`
                                  : `1px solid ${alpha(accentColor, isDark ? 0.15 : 0.2)}`,
                              bgcolor: esActual
                                ? isDark ? alpha('#38bdf8', 0.25) : accentColor
                                : respondida
                                  ? alpha(accentColor, isDark ? 0.22 : 0.12)
                                  : isDark ? alpha('#fff', 0.02) : '#ffffff',
                              color: esActual
                                ? (isDark ? '#38bdf8' : '#ffffff')
                                : respondida
                                  ? accentColor
                                  : 'text.secondary',
                              boxShadow: esActual
                                ? isDark ? '0 0 10px rgba(56, 189, 248, 0.4)' : `0 2px 8px ${alpha(accentColor, 0.4)}`
                                : 'none',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                borderColor: accentColor,
                                bgcolor: esActual
                                  ? isDark ? alpha('#38bdf8', 0.35) : accentColor
                                  : alpha(accentColor, 0.18),
                              },
                            }}
                          >
                            {idx + 1}
                            {marcada && (
                              <Box sx={{
                                position: 'absolute', top: 2, right: 2,
                                width: 6, height: 6, borderRadius: '50%',
                                bgcolor: '#f59e0b',
                              }} />
                            )}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>

                {/* Resumen numérico */}
                <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${alpha(accentColor, 0.12)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="caption" color="text.secondary">Respondidas</Typography>
                    <Typography variant="caption" fontWeight={800} color={accentColor}>{totalRespondidas}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="caption" color="text.secondary">Sin responder</Typography>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">{preguntas.length - totalRespondidas}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Puntaje total</Typography>
                    <Typography variant="caption" fontWeight={800}>{evaluacion?.puntaje_maximo || 100} pts</Typography>
                  </Box>
                </Box>

                {/* Botón Entregar Examen */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setModalConfirmarOpen(true)}
                  sx={{
                    mt: 2.5,
                    background: gradBg,
                    color: textOnAccent,
                    borderRadius: '10px',
                    py: 1.3,
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    boxShadow: `0 4px 18px ${alpha(accentColor, 0.35)}`,
                    '&:hover': {
                      boxShadow: `0 6px 24px ${alpha(accentColor, 0.5)}`,
                    },
                  }}
                >
                  Entregar Examen
                </Button>
              </Box>
            </Paper>

          </Box>
        </Grid>

        {/* ── COLUMNA DERECHA: TARJETA INTERACTIVA DE PREGUNTA QUE OCUPA TODO EL ESPACIO RESTANTE ── */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          {preguntaActual ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: { md: 560 },
              gap: 2,
            }}>

              {/* Barra de Etiquetas de la Pregunta */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Pregunta ${preguntaActualIndex + 1} de ${preguntas.length}`}
                    sx={{
                      fontWeight: 800,
                      fontSize: 12,
                      bgcolor: alpha(accentColor, 0.15),
                      color: accentColor,
                      border: `1.5px solid ${alpha(accentColor, 0.35)}`,
                    }}
                  />
                  <Chip
                    label={preguntaActual.tipo.replace('_', ' ')}
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: 'capitalize',
                      bgcolor: alpha(accentColor, 0.1),
                      color: accentColor,
                      border: `1px solid ${alpha(accentColor, 0.25)}`,
                    }}
                  />
                </Box>

                <Chip
                  icon={<StarIcon sx={{ fontSize: '15px !important', color: `${accentColor} !important` }} />}
                  label={`${preguntaActual.puntos} pts`}
                  variant="outlined"
                  sx={{ fontWeight: 800, borderColor: alpha(accentColor, 0.4), color: accentColor }}
                />
              </Box>

              {/* Tarjeta Principal de la Pregunta con Degradado y Expansión Completa */}
              <Paper sx={{
                ...containerCardSx,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>

                {/* Encabezado sutil con guía */}
                <Box sx={{ ...headerBarSx }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                    <HelpIcon sx={{ fontSize: 16, color: accentColor }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
                      Lee atentamente la consigna antes de responder
                    </Typography>
                  </Box>

                  <Chip
                    label={esMarcadaActual ? 'Por revisar' : 'Activa'}
                    size="small"
                    sx={{
                      fontSize: 10, height: 20, fontWeight: 700,
                      bgcolor: esMarcadaActual ? alpha('#f59e0b', 0.2) : alpha(accentColor, 0.08),
                      color: esMarcadaActual ? '#f59e0b' : 'text.secondary',
                    }}
                  />
                </Box>

                {/* Contenido Principal: Ocupa todo el espacio intermedio */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Enunciado con buen tamaño y contraste */}
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 3.5, lineHeight: 1.5, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                    {preguntaActual.pregunta}
                  </Typography>

                  {/* ── OPCIONES OBJETIVAS (Opción múltiple / V-F) ── */}
                  {esObjetiva && (
                    <Stack spacing={2} sx={{ flex: 1, mb: 3 }}>
                      {(preguntaActual.opciones || []).map((op, oIdx) => {
                        const seleccionada = respActual.opcion === oIdx;
                        const letra = letrasOpcion[oIdx] || String(oIdx + 1);

                        return (
                          <Box
                            key={oIdx}
                            onClick={() => autosave(preguntaActual.id, { respuesta_opcion: oIdx })}
                            role="button"
                            tabIndex={0}
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              border: `2px solid ${
                                seleccionada
                                  ? accentColor
                                  : alpha(accentColor, isDark ? 0.18 : 0.2)
                              }`,
                              background: seleccionada
                                ? isDark
                                  ? `linear-gradient(90deg, ${alpha(accentColor, 0.2)} 0%, ${alpha(accentColor, 0.06)} 100%)`
                                  : `linear-gradient(90deg, ${alpha(accentColor, 0.14)} 0%, ${alpha(accentColor, 0.04)} 100%)`
                                : isDark
                                  ? `linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)`
                                  : `linear-gradient(90deg, #ffffff 0%, ${alpha(accentColor, 0.02)} 100%)`,
                              transition: 'all 0.18s ease-in-out',
                              boxShadow: seleccionada
                                ? `0 2px 14px ${alpha(accentColor, isDark ? 0.25 : 0.2)}`
                                : 'none',
                              '&:hover': {
                                borderColor: accentColor,
                                background: seleccionada
                                  ? alpha(accentColor, isDark ? 0.24 : 0.18)
                                  : alpha(accentColor, isDark ? 0.1 : 0.05),
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            {/* Letra identificadora (A, B, C...) con fondo de acento al seleccionar */}
                            <Box sx={{
                              width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, fontSize: 14,
                              bgcolor: seleccionada ? accentColor : alpha(accentColor, isDark ? 0.12 : 0.08),
                              color: seleccionada ? textOnAccent : accentColor,
                              border: `1px solid ${alpha(accentColor, seleccionada ? 0.8 : 0.3)}`,
                              transition: 'all 0.18s',
                            }}>
                              {letra}
                            </Box>

                            {/* Divisor vertical sutil */}
                            <Box sx={{ width: '1.5px', height: 22, bgcolor: alpha(accentColor, 0.2) }} />

                            {/* Texto de la opción */}
                            <Typography variant="body1" sx={{ fontWeight: seleccionada ? 700 : 500, flex: 1, userSelect: 'none', fontSize: '1.05rem' }}>
                              {op}
                            </Typography>

                            {/* Checkmark indicador */}
                            {seleccionada && (
                              <Box sx={{
                                width: 24, height: 24, borderRadius: '8px',
                                bgcolor: accentColor, color: textOnAccent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <CheckIcon sx={{ fontSize: 17, fontWeight: 900 }} />
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}

                  {/* ── RESPUESTA ABIERTA / DESARROLLO ── */}
                  {(preguntaActual.tipo === 'desarrollo' || preguntaActual.tipo === 'respuesta_corta') && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={preguntaActual.tipo === 'desarrollo' ? 7 : 3}
                        placeholder="Escribe tu respuesta aquí con claridad..."
                        value={respActual.texto ?? ''}
                        onChange={(e) => autosave(preguntaActual.id, { respuesta_texto: e.target.value })}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            fontSize: 15,
                            p: 2,
                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha(accentColor, 0.02),
                            border: `1.5px solid ${alpha(accentColor, isDark ? 0.25 : 0.2)}`,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: accentColor,
                              borderWidth: '2px',
                            },
                          },
                        }}
                      />

                      {/* Subida de archivo si se requiere */}
                      {preguntaActual.requiere_archivo && (
                        <Box sx={{ mt: 2.5 }}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Archivo adjunto requerido (imagen de tu resolución o PDF):
                          </Typography>

                          {respActual.archivo_url ? (
                            <Box sx={{
                              p: 2, borderRadius: '14px',
                              bgcolor: alpha(accentColor, isDark ? 0.12 : 0.08),
                              border: `1.5px solid ${alpha(accentColor, 0.4)}`,
                              display: 'flex', flexDirection: 'column', gap: 1.5,
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                  {esImagen(respActual.archivo_url) ? (
                                    <Box
                                      component="img"
                                      src={respActual.archivo_url}
                                      alt="Miniatura de tu resolución"
                                      onClick={() => abrirPrevisualizacion(
                                        respActual.archivo_url!,
                                        `Resolución - Pregunta #${preguntaActual.orden || preguntaActualIndex + 1}`,
                                        `pregunta_${preguntaActual.orden || preguntaActualIndex + 1}_resolucion.jpg`
                                      )}
                                      sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        border: `1.5px solid ${alpha(accentColor, 0.6)}`,
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        transition: 'transform 0.15s ease',
                                        '&:hover': { transform: 'scale(1.05)' },
                                      }}
                                    />
                                  ) : (
                                    <FileIcon sx={{ color: accentColor, fontSize: 32 }} />
                                  )}
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={800} color={accentColor}>
                                      Archivo adjuntado correctamente
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Resolución registrada para esta pregunta
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Acciones: Previsualizar, Descargar, Reemplazar */}
                                <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', alignItems: 'center' }}>
                                  {esImagen(respActual.archivo_url) && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                                      onClick={() => abrirPrevisualizacion(
                                        respActual.archivo_url!,
                                        `Resolución - Pregunta #${preguntaActual.orden || preguntaActualIndex + 1}`,
                                        `pregunta_${preguntaActual.orden || preguntaActualIndex + 1}_resolucion.jpg`
                                      )}
                                      sx={{
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                        color: '#ffffff',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
                                          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.55)',
                                          transform: 'translateY(-1px)',
                                        },
                                      }}
                                    >
                                      Previsualizar foto
                                    </Button>
                                  )}
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => handleDescargarArchivo(
                                      respActual.archivo_url!,
                                      `pregunta_${preguntaActual.orden || preguntaActualIndex + 1}_resolucion.jpg`
                                    )}
                                    sx={{
                                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                      color: '#ffffff',
                                      borderRadius: '10px',
                                      fontWeight: 800,
                                      textTransform: 'none',
                                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                                        boxShadow: '0 6px 18px rgba(16, 185, 129, 0.55)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    Descargar foto
                                  </Button>
                                  <Button
                                    component="label"
                                    size="small"
                                    variant="contained"
                                    disabled={subiendoArchivo[preguntaActual.id]}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: '10px',
                                      fontWeight: 800,
                                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                      color: '#ffffff',
                                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    Reemplazar
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*,application/pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) subirArchivo(preguntaActual.id, file);
                                      }}
                                    />
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={subiendoArchivo[preguntaActual.id] ? <CircularProgress size={16} /> : <UploadIcon />}
                              disabled={subiendoArchivo[preguntaActual.id]}
                              sx={{
                                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                borderStyle: 'dashed', py: 2, width: '100%',
                                borderColor: alpha(accentColor, 0.4), color: accentColor,
                              }}
                            >
                              {subiendoArchivo[preguntaActual.id] ? 'Subiendo archivo...' : 'Seleccionar archivo de respaldo (PDF o Imagen)'}
                              <input
                                type="file"
                                hidden
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) subirArchivo(preguntaActual.id, file);
                                }}
                              />
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                </Box>

                {/* ── ACCIONES INFERIORES DE LA TARJETA (Ancladas abajo) ── */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 3, py: 2,
                  borderTop: `1px solid ${alpha(accentColor, 0.15)}`,
                  bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.03),
                }}>
                  <Button
                    size="small"
                    startIcon={esMarcadaActual ? <BookmarkIcon sx={{ color: '#f59e0b' }} /> : <BookmarkBorderIcon />}
                    onClick={() => toggleMarcarRevisar(preguntaActual.id)}
                    sx={{
                      textTransform: 'none',
                      color: esMarcadaActual ? '#f59e0b' : 'text.secondary',
                      fontWeight: 700,
                      borderRadius: '8px',
                      '&:hover': { bgcolor: alpha('#f59e0b', 0.1) },
                    }}
                  >
                    {esMarcadaActual ? 'Marcada para revisar' : 'Marcar para revisar'}
                  </Button>

                  <Button
                    size="small"
                    startIcon={<ResetIcon />}
                    onClick={limpiarRespuestaActual}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) },
                    }}
                  >
                    Limpiar respuesta
                  </Button>
                </Box>

              </Paper>

              {/* ── BARRA DE NAVEGACIÓN INFERIOR ── */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PrevIcon />}
                  disabled={preguntaActualIndex === 0}
                  onClick={() => setPreguntaActualIndex(prev => Math.max(0, prev - 1))}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5, py: 1,
                    borderColor: alpha(accentColor, 0.4),
                    color: accentColor,
                    '&:hover': {
                      borderColor: accentColor,
                      bgcolor: alpha(accentColor, 0.1),
                    },
                  }}
                >
                  Anterior
                </Button>

                {/* Indicador de bolitas centrado */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  {preguntas.slice(0, Math.min(10, preguntas.length)).map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setPreguntaActualIndex(i)}
                      sx={{
                        width: i === preguntaActualIndex ? 18 : 7,
                        height: 7,
                        borderRadius: 4,
                        bgcolor: i === preguntaActualIndex ? accentColor : alpha(accentColor, 0.25),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                  {preguntas.length > 10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 700 }}>
                      +{preguntas.length - 10}
                    </Typography>
                  )}
                </Box>

                {preguntaActualIndex < preguntas.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<NextIcon />}
                    onClick={() => setPreguntaActualIndex(prev => Math.min(preguntas.length - 1, prev + 1))}
                    sx={{
                      background: gradBg,
                      color: textOnAccent,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 3, py: 1,
                      boxShadow: `0 4px 14px ${alpha(accentColor, 0.3)}`,
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={() => setModalConfirmarOpen(true)}
                    sx={{
                      background: gradBg,
                      color: textOnAccent,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 3, py: 1,
                      boxShadow: `0 4px 14px ${alpha(accentColor, 0.3)}`,
                    }}
                  >
                    Finalizar
                  </Button>
                )}
              </Box>

            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              No se encontraron preguntas configuradas para este examen.
            </Alert>
          )}
        </Grid>

      </Grid>

      {/* ── MODAL DE CONFIRMACIÓN DE ENTREGA ── */}
      <Dialog open={modalConfirmarOpen} onClose={() => setModalConfirmarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          ¿Entregar Examen?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Has respondido <strong>{totalRespondidas} de {preguntas.length} preguntas</strong>.
          </Typography>

          {totalRespondidas < preguntas.length && (
            <Alert severity="warning" sx={{ borderRadius: '10px', mb: 2, fontSize: 13 }}>
              Tienes <strong>{preguntas.length - totalRespondidas} preguntas sin responder</strong>. Una vez entregado, no podrás volver a completarlas.
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary">
            Recuerda que este examen solo permite un único intento formal.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalConfirmarOpen(false)} sx={{ textTransform: 'none' }}>
            Continuar respondiendo
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmarEntrega}
            disabled={enviando}
            startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{ background: gradBg, color: textOnAccent, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {enviando ? 'Entregando...' : 'Sí, Entregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL DE PREVISUALIZACIÓN DE FOTO DEL EXAMEN ── */}
      <Dialog
        open={modalPreviewOpen}
        onClose={() => setModalPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: `1.5px solid ${alpha(accentColor, 0.3)}`,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon sx={{ color: accentColor }} />
            <Typography variant="subtitle1" fontWeight={800}>
              {modalPreviewTitulo || 'Previsualización de Foto'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDescargarArchivo(modalPreviewUrl, modalPreviewNombreArchivo)}
              sx={{
                borderRadius: '10px',
                fontWeight: 800,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                },
              }}
            >
              Descargar foto
            </Button>
            <IconButton onClick={() => setModalPreviewOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: isDark ? alpha('#000', 0.35) : '#f8fafc',
            minHeight: 320,
          }}
        >
          {modalPreviewUrl ? (
            <Box
              component="img"
              src={modalPreviewUrl}
              alt="Previsualización"
              sx={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se pudo cargar la imagen.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TomarExamen;
