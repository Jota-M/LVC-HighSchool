'use client';
// components/docente/asistencia/PermisoPendienteCard.tsx
// ✨ PREMIUM VERSION - Diseño premium con notificaciones animadas

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Collapse,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimelineIcon from '@mui/icons-material/Timeline';

import { SolicitudPermiso, MOTIVOS_PERMISO, ESTADOS_PERMISO, HistorialPermiso, CambiarEstadoPermisoDTO } from '@/types/asistenciaTypes';
import { solicitudPermisoService } from '@/services/asistenciaService';

// ──────────────────────────────────────────────
// ANIMACIONES PREMIUM
// ──────────────────────────────────────────────

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-30px) scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: translateX(0) scale(1);
  }
`;

const bellRing = keyframes`
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-14deg); }
  50% { transform: rotate(8deg); }
  60% { transform: rotate(-8deg); }
  70% { transform: rotate(4deg); }
  80% { transform: rotate(-4deg); }
  90% { transform: rotate(0deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  }
  50% { 
    box-shadow: 0 0 0 12px rgba(251, 191, 36, 0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const bounceIn = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0.3);
  }
  50% { 
    transform: scale(1.05);
  }
  70% { 
    transform: scale(0.9);
  }
  100% { 
    opacity: 1;
    transform: scale(1);
  }
`;

// ──────────────────────────────────────────────
// MODAL RECHAZO PREMIUM
// ──────────────────────────────────────────────

const ModalRechazo: React.FC<{
  open: boolean;
  nombre: string;
  onClose: () => void;
  onConfirmar: (motivo: string) => void;
  isLoading: boolean;
}> = ({ open, nombre, onClose, onConfirmar, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [motivo, setMotivo] = useState('');

  const handleConfirmar = () => {
    onConfirmar(motivo);
    setMotivo('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Rechazar solicitud
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Esta acción notificará al padre de familia
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.05),
            border: `1px solid ${alpha('#ef4444', 0.2)}`,
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Estudiante:
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {nombre}
          </Typography>
        </Box>

        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Motivo del rechazo"
          placeholder="Ej: No se presentó documentación válida, falta de justificación, etc."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              fontSize: 14,
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.01),
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ef4444',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ef4444',
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2.5,
            px: 3,
            py: 1,
            fontWeight: 700,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmar}
          disabled={!motivo.trim() || isLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2.5,
            px: 4,
            py: 1,
            background: 'linear-gradient(135deg, #ef4444, #f87171)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              boxShadow: '0 6px 24px rgba(239, 68, 68, 0.5)',
            },
            '&:disabled': {
              background: alpha('#9ca3af', 0.3),
              color: 'text.disabled',
            },
          }}
        >
          {isLoading ? 'Procesando...' : '✓ Confirmar rechazo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ──────────────────────────────────────────────
// CARD INDIVIDUAL DE PERMISO PREMIUM
// ──────────────────────────────────────────────

interface PermisCardProps {
  solicitud: SolicitudPermiso;
  index: number;
  onAprobar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
  isProcessing: boolean;
}

const PermisoCard: React.FC<PermisCardProps> = ({
  solicitud, index, onAprobar, onRechazar, isProcessing,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [expandido, setExpandido] = useState(false);
  const [rechazarOpen, setRechazarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [historial, setHistorial] = useState<HistorialPermiso[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const motivo = MOTIVOS_PERMISO.find(m => m.value === solicitud.motivo);
  const nombreEstudiante = `${solicitud.estudiante_nombres} ${solicitud.estudiante_apellidos}`;
  const iniciales = `${solicitud.estudiante_nombres?.[0]}${solicitud.estudiante_apellidos?.[0]}`;

  const fecha = new Date(solicitud.fecha_ausencia + 'T12:00:00');
  const fechaStr = fecha.toLocaleDateString('es-BO', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    year: 'numeric',
  });

  const hoy = new Date();
  const diffDias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const esUrgente = diffDias <= 1;

  const handleExpandir = async () => {
    const nuevoEstado = !expandido;
    setExpandido(nuevoEstado);
    if (nuevoEstado && historial.length === 0) {
      setLoadingHistorial(true);
      try {
        const res = await solicitudPermisoService.obtenerHistorial(solicitud.id);
        setHistorial(res.data.historial);
      } catch { /* silencioso */ }
      finally { setLoadingHistorial(false); }
    }
  };

  return (
    <>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          borderRadius: 4,
          animation: `${slideIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          
          background: esUrgente
            ? isDark
              ? `linear-gradient(145deg, ${alpha('#f59e0b', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
              : `linear-gradient(145deg, ${alpha('#f59e0b', 0.08)} 0%, #ffffff 100%)`
            : isDark
              ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          
          backdropFilter: 'blur(20px)',
          border: `2px solid ${
            esUrgente 
              ? isDark ? alpha('#f59e0b', 0.5) : alpha('#f59e0b', 0.3)
              : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)
          }`,
          
          boxShadow: esUrgente
            ? `0 8px 32px ${alpha('#f59e0b', 0.3)}`
            : isDark
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
          
          ...(isHovered && {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: esUrgente
              ? `0 12px 40px ${alpha('#f59e0b', 0.4)}`
              : isDark
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.12)',
          }),
          
          ...(esUrgente && {
            animation: `${slideIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both, ${pulseGlow} 2s ease-in-out 1s infinite`,
          }),
        }}
      >
        {/* Franja superior urgente */}
        {esUrgente && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
              backgroundSize: '200% 100%',
              animation: `${shimmer} 2s linear infinite`,
            }}
          />
        )}

        {/* Efecto shimmer en hover */}
        {isHovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.1)}, transparent)`,
              animation: `${shimmer} 1s ease-out`,
              pointerEvents: 'none',
            }}
          />
        )}

        <CardContent sx={{ pb: '16px !important', pt: esUrgente ? 3 : 2.5, px: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {/* Avatar premium */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={solicitud.estudiante_foto ?? undefined}
                sx={{
                  width: 52,
                  height: 52,
                  fontSize: 16,
                  fontWeight: 800,
                  background: esUrgente
                    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  border: `3px solid ${
                    esUrgente
                      ? alpha('#f59e0b', 0.3)
                      : alpha('#3b82f6', 0.3)
                  }`,
                  boxShadow: esUrgente
                    ? '0 4px 16px rgba(251, 191, 36, 0.4)'
                    : '0 4px 16px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  ...(isHovered && {
                    transform: 'scale(1.1) rotate(5deg)',
                  }),
                }}
              >
                {iniciales}
              </Avatar>
              {esUrgente && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
                    animation: `${bounceIn} 0.6s ease-out 0.5s both`,
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: 14, color: '#fff' }} />
                </Box>
              )}
            </Box>

            {/* Info estudiante */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="body1" fontWeight={800} noWrap>
                  {nombreEstudiante}
                </Typography>
                {esUrgente && (
                  <Chip
                    label={diffDias <= 0 ? '¡HOY!' : '¡MAÑANA!'}
                    size="small"
                    icon={<ErrorOutlineIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      bgcolor: alpha('#f59e0b', 0.2),
                      color: '#d97706',
                      fontWeight: 900,
                      fontSize: 10,
                      height: 22,
                      borderRadius: 1.5,
                      border: `1.5px solid ${alpha('#f59e0b', 0.4)}`,
                      animation: `${pulseGlow} 2s ease-in-out infinite`,
                      '& .MuiChip-icon': { color: '#d97706' },
                    }}
                  />
                )}
              </Box>

              {/* Tags de información */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  icon={
                    <Box sx={{ fontSize: 14 }}>
                      {motivo?.icon}
                    </Box>
                  }
                  label={motivo?.label}
                  size="small"
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                    borderRadius: 1.5,
                    height: 24,
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarMonthIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {fechaStr}
                  </Typography>
                </Box>
                {!solicitud.es_dia_completo && (
                  <>
                    <Typography variant="caption" color="text.disabled">·</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {solicitud.hora_inicio}–{solicitud.hora_fin}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>

              {/* Padre de familia */}
              {solicitud.padre_nombres && (
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  }}
                >
                  <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {solicitud.padre_nombres} {solicitud.padre_apellidos}
                  </Typography>
                  {solicitud.padre_telefono && (
                    <>
                      <Typography variant="caption" color="text.disabled" sx={{ mx: 0.5 }}>·</Typography>
                      <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {solicitud.padre_telefono}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* Botón expandir */}
            <IconButton
              size="small"
              onClick={handleExpandir}
              sx={{
                color: 'text.secondary',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06),
                  transform: 'rotate(180deg)',
                },
              }}
            >
              {expandido ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onAprobar(solicitud.id)}
              disabled={isProcessing}
              startIcon={<CheckCircleRoundedIcon />}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                color: '#fff',
                fontWeight: 800,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: 13,
                py: 1.2,
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                },
                '&:active': { transform: 'scale(0.98)' },
                '&:disabled': {
                  background: alpha('#9ca3af', 0.3),
                  color: 'text.disabled',
                },
              }}
            >
              ✓ Aprobar
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setRechazarOpen(true)}
              disabled={isProcessing}
              startIcon={<CancelRoundedIcon />}
              sx={{
                borderColor: '#ef4444',
                borderWidth: 2,
                color: '#ef4444',
                fontWeight: 800,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: 13,
                py: 1.2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#dc2626',
                  bgcolor: alpha('#ef4444', 0.1),
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              ✕ Rechazar
            </Button>
          </Box>

          {/* Detalle expandible */}
          <Collapse in={expandido}>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {/* Código de solicitud */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha('#fbbf24', 0.1)} 0%, ${alpha('#fbbf24', 0.05)} 100%)`
                    : `linear-gradient(135deg, ${alpha('#3b82f6', 0.08)} 0%, ${alpha('#3b82f6', 0.03)} 100%)`,
                  border: `1px solid ${isDark ? alpha('#fbbf24', 0.2) : alpha('#3b82f6', 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.disabled" sx={{ 
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'block',
                  mb: 0.5,
                }}>
                  📋 Código de Solicitud
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={900}
                  sx={{
                    background: isDark
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: 1,
                  }}
                >
                  {solicitud.codigo_solicitud}
                </Typography>
              </Box>

              {/* Descripción */}
              {solicitud.descripcion && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <DescriptionIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ 
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      fontSize: 10,
                      fontWeight: 700,
                    }}>
                      Descripción
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                    }}
                  >
                    {solicitud.descripcion}
                  </Typography>
                </Box>
              )}

              {/* Tipo de ausencia */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                }}
              >
                <Typography variant="caption" color="text.disabled" sx={{ 
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'block',
                  mb: 1,
                }}>
                  Tipo de ausencia
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {solicitud.es_dia_completo
                    ? '📅 Día completo'
                    : `⏰ Parcial: ${solicitud.hora_inicio} – ${solicitud.hora_fin}`}
                </Typography>
              </Box>

              {/* Archivo adjunto */}
              {solicitud.archivo_adjunto_url && (
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  href={solicitud.archivo_adjunto_url}
                  target="_blank"
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                    borderWidth: 2,
                    borderColor: isDark ? '#fbbf24' : '#3b82f6',
                    color: isDark ? '#fbbf24' : '#3b82f6',
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: isDark ? alpha('#fbbf24', 0.1) : alpha('#3b82f6', 0.1),
                    },
                  }}
                >
                  📎 Ver documento adjunto
                </Button>
              )}

              {/* HISTORIAL DE ESTADOS */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                  <Typography variant="caption" color="text.disabled" sx={{
                    textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10, fontWeight: 700,
                  }}>
                    📋 Historial de cambios
                  </Typography>
                </Box>

                {loadingHistorial ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : historial.length === 0 ? (
                  <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
                    Sin historial registrado
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {historial.map((h, i) => {
                      const esUltimo = i === historial.length - 1;
                      const colorNuevo = ESTADOS_PERMISO.find(e => e.value === h.estado_nuevo)?.color ?? '#9ca3af';
                      return (
                        <Box
                          key={h.id}
                          sx={{
                            display: 'flex', gap: 1.5, alignItems: 'flex-start',
                            pl: 1.5,
                            borderLeft: `2px solid ${esUltimo ? colorNuevo : alpha('#9ca3af', 0.3)}`,
                            pb: esUltimo ? 0 : 1,
                          }}
                        >
                          {/* Dot */}
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: colorNuevo,
                            flexShrink: 0, mt: 0.7, ml: -2.15,
                            boxShadow: `0 0 0 2px ${isDark ? '#1a1a2e' : '#fff'}, 0 0 0 3px ${colorNuevo}`,
                          }} />

                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              {h.estado_anterior && (
                                <>
                                  <Chip label={h.estado_anterior} size="small" sx={{
                                    height: 20, fontSize: 10, fontWeight: 700,
                                    bgcolor: alpha(ESTADOS_PERMISO.find(e => e.value === h.estado_anterior)?.color ?? '#9ca3af', 0.15),
                                    color: ESTADOS_PERMISO.find(e => e.value === h.estado_anterior)?.color ?? '#9ca3af',
                                  }} />
                                  <Typography variant="caption" color="text.disabled">→</Typography>
                                </>
                              )}
                              <Chip label={h.estado_nuevo} size="small" sx={{
                                height: 20, fontSize: 10, fontWeight: 800,
                                bgcolor: alpha(colorNuevo, 0.15), color: colorNuevo,
                                border: `1px solid ${alpha(colorNuevo, 0.3)}`,
                              }} />
                            </Box>
                            {h.comentario && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                                {h.comentario}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                              {new Date(h.created_at).toLocaleString('es-BO', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                              {h.usuario_username && ` · ${h.usuario_username}`}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Timestamp */}
              <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', mt: 1 }}>
                Solicitado el {new Date(solicitud.created_at).toLocaleString('es-BO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Stack>
          </Collapse>
        </CardContent>
      </Card>

      {/* Modal de rechazo */}
      <ModalRechazo
        open={rechazarOpen}
        nombre={nombreEstudiante}
        onClose={() => setRechazarOpen(false)}
        onConfirmar={motivo => {
          onRechazar(solicitud.id, motivo);
          setRechazarOpen(false);
        }}
        isLoading={isProcessing}
      />
    </>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

interface Props {
  solicitudes: SolicitudPermiso[];
  isLoading?: boolean;
  isProcessing?: boolean;
  onAprobar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
}

const PermisosPendientes: React.FC<Props> = ({
  solicitudes,
  isLoading = false,
  isProcessing = false,
  onAprobar,
  onRechazar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const urgentes = solicitudes.filter(s => {
    const fecha = new Date(s.fecha_ausencia + 'T12:00:00');
    const hoy = new Date();
    const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 1;
  });

  return (
    <Box>
      {/* Header premium */}
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          p: 3,
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Badge
          badgeContent={solicitudes.length}
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 11,
              height: 22,
              minWidth: 22,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              animation: solicitudes.length > 0 ? `${bellRing} 3s ease-in-out 2s infinite` : 'none',
            },
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: solicitudes.length > 0
                ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                : isDark
                  ? alpha('#fff', 0.05)
                  : alpha('#000', 0.05),
              boxShadow: solicitudes.length > 0
                ? '0 4px 16px rgba(251, 191, 36, 0.4)'
                : 'none',
              animation: solicitudes.length > 0 ? `${bellRing} 3s ease-in-out infinite` : 'none',
            }}
          >
            <NotificationsActiveIcon
              sx={{
                color: solicitudes.length > 0 ? '#fff' : 'text.disabled',
                fontSize: 28,
              }}
            />
          </Box>
        </Badge>

        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            fontWeight={900}
            sx={{
              background: solicitudes.length > 0
                ? isDark
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : 'text.primary',
              WebkitBackgroundClip: solicitudes.length > 0 ? 'text' : 'unset',
              WebkitTextFillColor: solicitudes.length > 0 ? 'transparent' : 'unset',
              letterSpacing: -0.5,
              mb: 0.5,
            }}
          >
            Permisos Pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {solicitudes.length === 0
              ? '✓ Todo al día, sin solicitudes por revisar'
              : `${solicitudes.length} solicitud${solicitudes.length > 1 ? 'es' : ''} esperando tu revisión`}
          </Typography>
        </Box>

        {urgentes.length > 0 && (
          <Chip
            icon={<ErrorOutlineIcon />}
            label={`${urgentes.length} urgente${urgentes.length > 1 ? 's' : ''}`}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 12,
              height: 32,
              borderRadius: 2.5,
              boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
              '& .MuiChip-icon': {
                color: '#fff',
                fontSize: 18,
              },
            }}
          />
        )}
      </Box>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card 
              key={i}
              sx={{ 
                borderRadius: 4,
                p: 3,
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                  }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Box 
                    sx={{ 
                      height: 20,
                      width: '60%',
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                      borderRadius: 1,
                      mb: 1,
                    }} 
                  />
                  <Box 
                    sx={{ 
                      height: 16,
                      width: '40%',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                      borderRadius: 1,
                    }} 
                  />
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      ) : solicitudes.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: 4,
            background: isDark
              ? 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(145deg, #fafafa 0%, #f3f4f6 100%)',
            border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
          <Typography variant="h6" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>
            ¡Excelente trabajo!
          </Typography>
          <Typography variant="body2" color="text.disabled">
            No hay solicitudes de permisos pendientes de revisión
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {/* Urgentes primero */}
          {urgentes.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2.5,
                  bgcolor: alpha('#f59e0b', 0.1),
                  border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 18, color: '#d97706' }} />
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#d97706',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    fontSize: 11,
                  }}
                >
                  ⚡ Urgentes - Requieren atención inmediata
                </Typography>
              </Box>
              {urgentes.map((s, i) => (
                <PermisoCard
                  key={s.id}
                  solicitud={s}
                  index={i}
                  onAprobar={onAprobar}
                  onRechazar={onRechazar}
                  isProcessing={isProcessing}
                />
              ))}

              {solicitudes.length > urgentes.length && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2.5,
                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                    border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                    mt: 2,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Typography 
                    variant="caption" 
                    color="text.disabled"
                    sx={{
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      fontSize: 10,
                    }}
                  >
                    📋 Otras solicitudes
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* El resto */}
          {solicitudes
            .filter(s => !urgentes.includes(s))
            .map((s, i) => (
              <PermisoCard
                key={s.id}
                solicitud={s}
                index={urgentes.length + i}
                onAprobar={onAprobar}
                onRechazar={onRechazar}
                isProcessing={isProcessing}
              />
            ))}
        </Stack>
      )}
    </Box>
  );
};

export default PermisosPendientes;