// src/components/preinscripciones/PreinscripcionCard.tsx
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Avatar,
  Badge,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  ChevronRight as ChevronRightIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Preinscripcion, EstadoPreinscripcion } from '@/types/preinscripcionTypes';
import { useRouter } from 'next/navigation';
import { preinscripcionService } from '@/services/preinscripcionService';

interface PreinscripcionCardProps {
  preinscripcion: Preinscripcion;
  onRevisar: (id: number) => void;
  onEliminar: (id: number) => void;
  onPromover?: (id: number) => void;
  onCambiarEstado?: (id: number, estado: EstadoPreinscripcion, observaciones?: string) => Promise<void>;
  onSnackbar?: (message: string, severity?: 'success' | 'error') => void;
}

// ─── Configuración de estados ────────────────────────────────────────────────
const getEstadoConfig = (estado: string) => {
  const e = (estado || '').toLowerCase();
  const configs: Record<
    string,
    { label: string; color: string; bg: string; icon: React.ReactElement }
  > = {
    iniciada: {
      label: 'Iniciada',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.12)',
      icon: <AccessTimeIcon sx={{ fontSize: 13 }} />,
    },
    datos_completos: {
      label: 'Datos Completos',
      color: '#0288d1',
      bg: 'rgba(2, 136, 209, 0.12)',
      icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
    },
    documentos_pendientes: {
      label: 'Docs Pendientes',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
    },
    en_revision: {
      label: 'En Revisión',
      color: '#9c27b0',
      bg: 'rgba(156, 39, 176, 0.12)',
      icon: <VisibilityIcon sx={{ fontSize: 13 }} />,
    },
    documentos_aprobados: {
      label: 'Docs Aprobados',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
    },
    aprobada: {
      label: 'Aprobada',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
    },
    rechazada: {
      label: 'Rechazada',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      icon: <CancelIcon sx={{ fontSize: 13 }} />,
    },
    convertida: {
      label: 'Convertida',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      icon: <PersonAddIcon sx={{ fontSize: 13 }} />,
    },
    en_espera: {
      label: 'En Espera',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
    },
  };
  return (
    configs[e] || {
      label: estado || 'Iniciada',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.12)',
      icon: <AccessTimeIcon sx={{ fontSize: 13 }} />,
    }
  );
};

// ─── Helpers de nivel y turno ────────────────────────────────────────────────
const getNivelColor = (grado?: string) => {
  const g = (grado || '').toLowerCase();
  if (g.includes('kínder') || g.includes('kinder') || g.includes('inicial')) return '#ec4899';
  if (g.includes('primaria')) return '#3b82f6';
  if (g.includes('secundaria')) return '#8b5cf6';
  return '#10b981';
};

const getIniciales = (nombre?: string) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ').filter(Boolean);
  if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
};

const formatearFechaHora = (fecha?: string) => {
  if (!fecha) return 'Sin fecha';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return 'Sin fecha';
    const f = d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const h = d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${f} · ${h}`;
  } catch {
    return 'Sin fecha';
  }
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const PreinscripcionCard: React.FC<PreinscripcionCardProps> = ({
  preinscripcion,
  onRevisar,
  onEliminar,
  onPromover,
  onCambiarEstado,
  onSnackbar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const estadoCfg = getEstadoConfig(preinscripcion.estado);
  const nivelColor = getNivelColor(preinscripcion.grado_nombre || preinscripcion.grado_solicitado);
  const esEnEspera = preinscripcion.estado === 'en_espera';
  const puedeConvertir =
    preinscripcion.estado === 'aprobada' && preinscripcion.tiene_cupo_asignado;

  // Menú contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Modal de Cambiar Estado
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPreinscripcion>(
    (preinscripcion.estado?.toLowerCase() as EstadoPreinscripcion) || 'iniciada'
  );
  const [observacionesEstado, setObservacionesEstado] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Modal de Reenviar Confirmación
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleConvertir = () =>
    router.push(`/dashboard/preinscripciones/convertir/${preinscripcion.id}`);

  // Generar texto exacto institucional de confirmación
  const textoConfirmacion = React.useMemo(() => {
    const estudiante = preinscripcion.estudiante_nombre || 'Postulante';
    const tutor = preinscripcion.tutor_nombre || 'Padre/Madre/Tutor';
    const codigo = preinscripcion.codigo_inscripcion || `PRE-${preinscripcion.id}`;
    const grado = preinscripcion.grado_nombre || preinscripcion.grado_solicitado?.replace(/_/g, ' ') || '';
    const turno = preinscripcion.turno_nombre || '';
    const periodo = preinscripcion.periodo_nombre || 'Gestión 2026';

    const lineas = [
      `📝 *¡Registro de Preinscripción Recibido!*`,
      `🏫 *Unidad Educativa Particular La Voz de Cristo*`,
      ``,
      `Estimado(a) *${tutor}*,`,
      ``,
      `Hemos recibido correctamente la postulación de:`,
      `👤 Estudiante: *${estudiante}*`,
      `📋 Código de seguimiento: *${codigo}*`,
    ];

    if (grado) lineas.push(`📚 Curso / Grado: *${grado}*`);
    if (turno) lineas.push(`⏰ Turno solicitado: *${turno}*`);
    if (periodo) lineas.push(`📅 Gestión académica: *${periodo}*`);

    lineas.push(
      ``,
      `📌 *Próximos pasos:*`,
      `Una vez revisada la información y documentación enviada, el equipo de secretaría académica se comunicará con usted por este medio oficial para coordinar los siguientes pasos de la postulación.`,
      ``,
      `📞 _Secretaría: +591 69624189_`,
      `_Mensaje institucional automático._`
    );

    return lineas.join('\n');
  }, [preinscripcion]);

  // Enviar vía backend (Bot WhatsApp de la institución)
  const handleEnviarViaBot = async () => {
    try {
      setEnviandoWhatsApp(true);
      const res = await preinscripcionService.reenviarWhatsApp(
        preinscripcion.id,
        undefined,
        'confirmacion'
      );
      if (res?.success) {
        onSnackbar?.('¡Confirmación de preinscripción enviada por WhatsApp con éxito!', 'success');
        setModalConfirmacionOpen(false);
      } else {
        throw new Error(res?.message || 'No se pudo enviar vía WhatsApp');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Error al conectar con el servicio de WhatsApp';
      onSnackbar?.(errMsg, 'error');
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(textoConfirmacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Color de borde de la tarjeta
  const cardBorderColor = esEnEspera
    ? alpha('#f59e0b', 0.4)
    : preinscripcion.estado === 'rechazada'
      ? alpha('#ef4444', 0.35)
      : preinscripcion.estado === 'aprobada'
        ? alpha('#10b981', 0.4)
        : alpha(isDark ? '#fff' : '#000', 0.08);

  const cardAccent = esEnEspera
    ? '#f59e0b'
    : preinscripcion.estado === 'rechazada'
      ? '#ef4444'
      : preinscripcion.estado === 'aprobada'
        ? '#10b981'
        : accentColor;

  return (
    <>
      <Fade in timeout={300}>
        <Card
          sx={{
            height: '100%',
            borderRadius: '18px',
            border: `1px solid ${cardBorderColor}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: `0 10px 22px ${alpha(cardAccent, 0.18)}`,
              borderColor: cardAccent,
              '& .btn-gestionar': {
                backgroundColor: alpha(cardAccent, 0.15),
                borderColor: cardAccent,
                transform: 'translateX(2px)',
              },
            },
          }}
          onClick={() => onRevisar(preinscripcion.id)}
        >
          {/* ── Badge de Turno arriba a la izquierda (Estilo Reserva Cupos) ── */}
          <Chip
            label={
              preinscripcion.turno_nombre
                ? preinscripcion.turno_nombre.toLowerCase().includes('mañana')
                  ? '☀️ Turno Mañana'
                  : '🌅 Turno Tarde'
                : preinscripcion.tiene_cupo_asignado
                  ? '✅ Con Cupo'
                  : esEnEspera
                    ? `⏳ Espera #${preinscripcion.posicion_espera || 1}`
                    : 'Turno no def.'
            }
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1,
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22,
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
              color: accentColor,
              border: `1px solid ${alpha(accentColor, 0.25)}`,
            }}
          />

          {/* ── Chips de Estado y Gestión arriba a la derecha ── */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
            <Chip
              icon={estadoCfg.icon}
              label={
                esEnEspera
                  ? `Puesto #${preinscripcion.posicion_espera || 1}`
                  : estadoCfg.label
              }
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: estadoCfg.bg,
                color: estadoCfg.color,
                border: `1px solid ${alpha(estadoCfg.color, 0.25)}`,
                '& .MuiChip-icon': { ml: 0.4 },
              }}
            />
            <Chip
              label={preinscripcion.periodo_nombre?.split(' ')[0] || '2026'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                color: 'text.secondary',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              }}
            />
          </Box>

          {/* ── Cuerpo de la Tarjeta ── */}
          <CardContent sx={{ p: 2.2, pt: 4.8, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Avatar mediano centrado con badge de nivel */}
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title={`Grado: ${preinscripcion.grado_nombre || preinscripcion.grado_solicitado}`}>
                    <Chip
                      icon={<SchoolIcon sx={{ fontSize: 11, color: '#fff' }} />}
                      label={
                        (preinscripcion.grado_nombre || preinscripcion.grado_solicitado || 'Grado')
                          .split(' ')[0]
                          .replace(/_/g, ' ')
                      }
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        bgcolor: nivelColor,
                        color: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': { ml: 0.4, color: '#ffffff' },
                      }}
                    />
                  </Tooltip>
                }
              >
                <Avatar
                  src={preinscripcion.estudiante_foto || undefined}
                  sx={{
                    width: 72,
                    height: 72,
                    margin: '0 auto',
                    bgcolor: cardAccent,
                    color: isDark ? '#000' : '#fff',
                    border: `3px solid ${alpha(cardAccent, 0.2)}`,
                    boxShadow: `0 6px 14px ${alpha(cardAccent, 0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                  }}
                >
                  {!preinscripcion.estudiante_foto && getIniciales(preinscripcion.estudiante_nombre)}
                </Avatar>
              </Badge>
            </Box>

            {/* Nombre del Estudiante */}
            <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.3 }}>
              {preinscripcion.estudiante_nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.78rem' }}>
              {preinscripcion.grado_nombre || preinscripcion.grado_solicitado?.replace(/_/g, ' ')}{' '}
              {preinscripcion.turno_nombre ? `· Turno ${preinscripcion.turno_nombre}` : ''}
            </Typography>

            {/* Chips de CI y Código Monospace */}
            <Box sx={{ my: 0.8, display: 'flex', justifyContent: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Chip
                label={`CI: ${preinscripcion.estudiante_ci || 'S/N'}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  height: 22,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                }}
              />
              <Chip
                label={preinscripcion.codigo_inscripcion || `PRE-${preinscripcion.id}`}
                size="small"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 22,
                  backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                  color: accentColor,
                }}
              />
            </Box>

            {/* Botón de acción directa centrado .btn-gestionar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              {puedeConvertir ? (
                <Button
                  className="btn-gestionar"
                  size="small"
                  variant="contained"
                  startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertir();
                  }}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    px: 1.8,
                    py: 0.4,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Convertir a Estudiante
                </Button>
              ) : esEnEspera && onPromover ? (
                <Button
                  className="btn-gestionar"
                  size="small"
                  variant="contained"
                  startIcon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPromover(preinscripcion.id);
                  }}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    px: 1.8,
                    py: 0.4,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Promover de Espera
                </Button>
              ) : (
                <Button
                  className="btn-gestionar"
                  size="small"
                  variant="outlined"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevisar(preinscripcion.id);
                  }}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    px: 1.8,
                    py: 0.4,
                    borderColor: alpha(accentColor, 0.35),
                    color: accentColor,
                    transition: 'all 0.2s ease',
                  }}
                >
                  Revisar Expediente
                </Button>
              )}
            </Box>

            {/* Información adicional y pie de card */}
            <Box
              sx={{
                mt: 'auto',
                pt: 1.5,
                borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8,
                textAlign: 'left',
              }}
            >
              {/* Tutor */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Tutor:
                </Typography>
                <Typography variant="caption" fontWeight={700} noWrap sx={{ ml: 'auto', fontSize: '0.74rem', maxWidth: '62%' }}>
                  {preinscripcion.tutor_nombre}
                </Typography>
              </Box>

              {/* Teléfono / WhatsApp */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="caption" sx={{ fontSize: 13, lineHeight: 1 }}>📱</Typography>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Contacto:
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                  {preinscripcion.tutor_telefono || 'Sin teléfono'}
                </Typography>
              </Box>

              {/* Fecha y Hora de Registro */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Registro:
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.74rem' }}>
                  {formatearFechaHora(preinscripcion.created_at || preinscripcion.fecha_inicio)}
                </Typography>
              </Box>

              {/* Indicador de Cupo / Estado */}
              {preinscripcion.tiene_cupo_asignado ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                  <Typography variant="caption" fontWeight={700} color="#10b981" sx={{ fontSize: '0.72rem' }}>
                    Cupo escolar asignado
                  </Typography>
                </Box>
              ) : esEnEspera ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <HourglassEmptyIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                  <Typography variant="caption" fontWeight={700} color="#f59e0b" sx={{ fontSize: '0.72rem' }}>
                    Puesto #{preinscripcion.posicion_espera || 1} en lista de espera
                  </Typography>
                </Box>
              ) : preinscripcion.estado === 'rechazada' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CancelIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                  <Typography variant="caption" fontWeight={700} color="#ef4444" sx={{ fontSize: '0.72rem' }}>
                    Postulación rechazada
                  </Typography>
                </Box>
              ) : null}

              {/* Barra de Acciones con IconButtons (Estilo Reserva Cupos) */}
              <Stack
                direction="row"
                spacing={0.8}
                justifyContent="center"
                sx={{ pt: 1, borderTop: `1px dashed ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 🆕 BOTÓN REENVIAR CONFIRMACIÓN (WHATSAPP) */}
                <Tooltip title="Reenviar confirmación de formulario (WhatsApp)">
                  <IconButton
                    size="small"
                    onClick={() => setModalConfirmacionOpen(true)}
                    sx={{
                      bgcolor: alpha('#16a34a', 0.12),
                      color: '#16a34a',
                      borderRadius: '8px',
                      p: 0.7,
                      '&:hover': {
                        bgcolor: alpha('#16a34a', 0.25),
                        transform: 'scale(1.08)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <WhatsAppIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {/* Ver expediente */}
                <Tooltip title="Revisar expediente completo">
                  <IconButton
                    size="small"
                    onClick={() => onRevisar(preinscripcion.id)}
                    sx={{
                      bgcolor: alpha(accentColor, 0.1),
                      color: accentColor,
                      borderRadius: '8px',
                      p: 0.7,
                      '&:hover': { bgcolor: alpha(accentColor, 0.2), transform: 'scale(1.08)' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {/* Si puede convertir */}
                {puedeConvertir && (
                  <Tooltip title="Convertir a estudiante oficial">
                    <IconButton
                      size="small"
                      onClick={handleConvertir}
                      sx={{
                        bgcolor: alpha('#10b981', 0.12),
                        color: '#10b981',
                        borderRadius: '8px',
                        p: 0.7,
                        '&:hover': { bgcolor: alpha('#10b981', 0.25), transform: 'scale(1.08)' },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Si está en espera */}
                {esEnEspera && onPromover && (
                  <Tooltip title="Promover de lista de espera a cupo">
                    <IconButton
                      size="small"
                      onClick={() => onPromover(preinscripcion.id)}
                      sx={{
                        bgcolor: alpha('#f59e0b', 0.15),
                        color: '#f59e0b',
                        borderRadius: '8px',
                        p: 0.7,
                        '&:hover': { bgcolor: alpha('#f59e0b', 0.3), transform: 'scale(1.08)' },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EventAvailableIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Eliminar */}
                <Tooltip title="Eliminar preinscripción">
                  <IconButton
                    size="small"
                    onClick={() => onEliminar(preinscripcion.id)}
                    sx={{
                      bgcolor: alpha('#ef4444', 0.1),
                      color: '#ef4444',
                      borderRadius: '8px',
                      p: 0.7,
                      '&:hover': { bgcolor: alpha('#ef4444', 0.25), transform: 'scale(1.08)' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {/* Menú de opciones */}
                <Tooltip title="Más opciones">
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{
                      bgcolor: alpha(isDark ? '#fff' : '#000', 0.05),
                      color: 'text.secondary',
                      borderRadius: '8px',
                      p: 0.7,
                      '&:hover': { bgcolor: alpha(isDark ? '#fff' : '#000', 0.1) },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </CardContent>

          {/* ── Menú de opciones adicionales ── */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { borderRadius: '14px', minWidth: 210, mt: 1 },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setModalConfirmacionOpen(true);
              }}
            >
              <ListItemIcon>
                <WhatsAppIcon fontSize="small" sx={{ color: '#16a34a' }} />
              </ListItemIcon>
              <ListItemText sx={{ color: '#16a34a', fontWeight: 600 }}>
                Reenviar confirmación
              </ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onRevisar(preinscripcion.id);
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver expediente</ListItemText>
            </MenuItem>

            {onCambiarEstado && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setNuevoEstado((preinscripcion.estado?.toLowerCase() as EstadoPreinscripcion) || 'iniciada');
                  setObservacionesEstado(preinscripcion.observaciones || '');
                  setModalEstadoOpen(true);
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" sx={{ color: accentColor }} />
                </ListItemIcon>
                <ListItemText sx={{ fontWeight: 600 }}>Cambiar estado</ListItemText>
              </MenuItem>
            )}

            {puedeConvertir && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleConvertir();
                }}
              >
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" sx={{ color: '#10b981' }} />
                </ListItemIcon>
                <ListItemText sx={{ color: '#10b981', fontWeight: 700 }}>
                  Convertir a estudiante
                </ListItemText>
              </MenuItem>
            )}

            {esEnEspera && onPromover && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onPromover(preinscripcion.id);
                }}
              >
                <ListItemIcon>
                  <EventAvailableIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                </ListItemIcon>
                <ListItemText sx={{ color: '#d97706', fontWeight: 700 }}>
                  Promover de espera
                </ListItemText>
              </MenuItem>
            )}

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onEliminar(preinscripcion.id);
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Fade>

      {/* ── MODAL: REENVIAR MENSAJE DE CONFIRMACIÓN (ESTILO NÓMINA DE ESTUDIANTES) ── */}
      <Dialog
        open={modalConfirmacionOpen}
        onClose={() => !enviandoWhatsApp && setModalConfirmacionOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101dff' : '#ffffff',
            border: `1.5px solid ${isDark ? 'rgba(22, 163, 74, 0.25)' : 'rgba(22, 163, 74, 0.3)'}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(22, 163, 74, 0.08), 0 32px 64px rgba(0,0,0,0.85)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* ── Header idéntico a ModalNominaAsegurados ── */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: 2.5,
            pb: 2,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            background: isDark ? 'rgba(22, 163, 74, 0.12)' : 'rgba(22, 163, 74, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha('#16a34a', 0.85),
                  mb: 0.4,
                }}
              >
                Notificación Oficial · Confirmación de Preinscripción
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '9px',
                    flexShrink: 0,
                    background: alpha('#16a34a', 0.18),
                    border: '1px solid rgba(22, 163, 74, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhatsAppIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.1, color: 'text.primary' }}>
                  Reenviar Confirmación
                </Typography>
              </Box>
            </Box>

            {/* Botón de Cierre estilizado */}
            <Box
              onClick={() => !enviandoWhatsApp && setModalConfirmacionOpen(false)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                cursor: enviandoWhatsApp ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': {
                  background: alpha('#16a34a', 0.15),
                  borderColor: alpha('#16a34a', 0.4),
                  color: '#16a34a',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Chips de Resumen del Postulante */}
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1 }}>
            <Chip
              size="small"
              icon={<PersonIcon sx={{ fontSize: 13 }} />}
              label={preinscripcion.estudiante_nombre}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
                borderRadius: '8px',
                '& .MuiChip-icon': { ml: 0.4, color: accentColor },
              }}
            />
            <Chip
              size="small"
              label={`Tutor: ${preinscripcion.tutor_nombre || 'Sin nombre'}`}
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '8px',
              }}
            />
            <Chip
              size="small"
              icon={<WhatsAppIcon sx={{ fontSize: 13 }} />}
              label={preinscripcion.tutor_telefono || 'Sin teléfono'}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: alpha('#16a34a', 0.14),
                color: '#16a34a',
                border: '1px solid rgba(22,163,74,0.3)',
                borderRadius: '8px',
                '& .MuiChip-icon': { ml: 0.4, color: '#16a34a' },
              }}
            />
            <Chip
              size="small"
              label={preinscripcion.codigo_inscripcion || `PRE-${preinscripcion.id}`}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderRadius: '8px',
              }}
            />
          </Box>
        </Box>

        {/* ── Contenido ── */}
        <Box sx={{ p: { xs: 2.5, md: 3 }, pt: 2.5 }}>
          {/* Mensaje Informativo */}
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              📚 {preinscripcion.grado_nombre || preinscripcion.grado_solicitado?.replace(/_/g, ' ')}{' '}
              {preinscripcion.turno_nombre ? `· Turno ${preinscripcion.turno_nombre}` : ''}
            </Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
              ✓ Plantilla oficial de recepción de formulario
            </Typography>
          </Box>

          {/* Vista previa del mensaje tipo Chat Bubble */}
          <Box
            sx={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(22, 163, 74, 0.3)' : 'rgba(22, 163, 74, 0.25)'}`,
              bgcolor: isDark ? '#0c1523' : '#f0fdf4',
            }}
          >
            {/* Cabecera del chat */}
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)',
                borderBottom: `1px solid ${isDark ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                  }}
                />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#16a34a', fontSize: '0.72rem' }}>
                  Mensaje Institucional U.E.P. La Voz de Cristo
                </Typography>
              </Box>

              <Button
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
                onClick={handleCopiarTexto}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  py: 0.2,
                  px: 1,
                  color: copiado ? '#16a34a' : 'text.secondary',
                  borderRadius: '6px',
                }}
              >
                {copiado ? '¡Copiado!' : 'Copiar'}
              </Button>
            </Box>

            {/* Texto del mensaje */}
            <Box
              sx={{
                p: 2,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.55,
                color: isDark ? '#e2e8f0' : '#14532d',
                maxHeight: 250,
                overflowY: 'auto',
              }}
            >
              {textoConfirmacion}
            </Box>
          </Box>
        </Box>

        {/* ── FOOTER: Solo Cancelar y Reenviar Confirmación ── */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setModalConfirmacionOpen(false)}
            disabled={enviandoWhatsApp}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              px: 2.5,
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.secondary',
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              enviandoWhatsApp ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <SendIcon sx={{ fontSize: 16 }} />
              )
            }
            onClick={handleEnviarViaBot}
            disabled={enviandoWhatsApp || !preinscripcion.tutor_telefono}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              px: 3,
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                boxShadow: '0 6px 18px rgba(22, 163, 74, 0.45)',
              },
            }}
          >
            {enviandoWhatsApp ? 'Enviando notificación...' : 'Reenviar Confirmación'}
          </Button>
        </Box>
      </Dialog>

      {/* ── MODAL: CAMBIAR ESTADO DE PREINSCRIPCIÓN ── */}
      <Dialog
        open={modalEstadoOpen}
        onClose={() => !guardandoEstado && setModalEstadoOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101d' : '#ffffff',
            border: `1.5px solid ${alpha(accentColor, 0.3)}`,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ color: accentColor }} />
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
              Actualizar Estado
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setModalEstadoOpen(false)} disabled={guardandoEstado}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Postulante: <strong>{preinscripcion.estudiante_nombre}</strong>
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="select-estado-label">Nuevo Estado</InputLabel>
            <Select
              labelId="select-estado-label"
              value={nuevoEstado}
              label="Nuevo Estado"
              onChange={(e) => setNuevoEstado(e.target.value as EstadoPreinscripcion)}
            >
              <MenuItem value="iniciada">Iniciada</MenuItem>
              <MenuItem value="datos_completos">Datos Completos</MenuItem>
              <MenuItem value="documentos_pendientes">Documentos Pendientes</MenuItem>
              <MenuItem value="en_revision">En Revisión</MenuItem>
              <MenuItem value="documentos_aprobados">Documentos Aprobados</MenuItem>
              <MenuItem value="aprobada">Aprobada</MenuItem>
              <MenuItem value="rechazada">Rechazada</MenuItem>
              <MenuItem value="en_espera">En Lista de Espera</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Observaciones / Motivo (opcional)"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={observacionesEstado}
            onChange={(e) => setObservacionesEstado(e.target.value)}
            placeholder="Ingrese observaciones o motivo del cambio..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button
            variant="text"
            onClick={() => setModalEstadoOpen(false)}
            disabled={guardandoEstado}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!onCambiarEstado) return;
              try {
                setGuardandoEstado(true);
                await onCambiarEstado(preinscripcion.id, nuevoEstado, observacionesEstado);
                onSnackbar?.(`Estado actualizado a "${nuevoEstado}" exitosamente`, 'success');
                setModalEstadoOpen(false);
              } catch (err: any) {
                onSnackbar?.(err.message || 'Error al actualizar estado', 'error');
              } finally {
                setGuardandoEstado(false);
              }
            }}
            disabled={guardandoEstado}
            sx={{
              bgcolor: accentColor,
              color: isDark ? '#000' : '#fff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { bgcolor: alpha(accentColor, 0.85) },
            }}
          >
            {guardandoEstado ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambio'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PreinscripcionCard;