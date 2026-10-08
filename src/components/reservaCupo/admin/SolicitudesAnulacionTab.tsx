// src/components/reservaCupo/admin/SolicitudesAnulacionTab.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Skeleton,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Tooltip,
  Fade,
  Alert,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  RestartAlt as RestartAltIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { ReservaCupoData } from '@/types/reservaCupoTypes';
import { getNivelColor, getInitials, usePalette } from './common';

interface SolicitudesAnulacionTabProps {
  solicitudes: ReservaCupoData[];
  loadingSolicitudes: boolean;
  onRefresh: () => void;
  onAbrirAnular: (reserva: ReservaCupoData) => void;
  onAbrirReactivar: (reserva: ReservaCupoData) => void;
  onWhatsApp: (reserva: ReservaCupoData) => void;
  onDescargarPDF: (codigoReserva: string) => void;
}

export const SolicitudesAnulacionTab: React.FC<SolicitudesAnulacionTabProps> = ({
  solicitudes,
  loadingSolicitudes,
  onRefresh,
  onAbrirAnular,
  onAbrirReactivar,
  onWhatsApp,
  onDescargarPDF,
}) => {
  const { theme, isDark, gold: accentColor, gradBg } = usePalette();
  const [search, setSearch] = useState('');

  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.estudiante_nombre_completo || '').toLowerCase().includes(q) ||
      (s.estudiante_ci || '').toLowerCase().includes(q) ||
      (s.codigo_reserva || '').toLowerCase().includes(q) ||
      (s.tutor_nombre || '').toLowerCase().includes(q) ||
      (s.grado_destino_nombre || '').toLowerCase().includes(q)
    );
  });

  return (
    <Box>

      {/* BARRA DE BÚSQUEDA DE SOLICITUDES (Estilo Docente) */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar solicitud por estudiante, CI, código de reserva, grado o tutor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              '& fieldset': {
                borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
              },
              '&:hover fieldset': {
                borderColor: alpha('#f59e0b', 0.4),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#f59e0b',
              },
            },
          }}
        />
      </Box>

      {/* Contenido de Solicitudes */}
      {loadingSolicitudes ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton height={340} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : solicitudesFiltradas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '18px',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#ffffff',
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', opacity: 0.7, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={800} color="text.primary">
            {search ? 'No se encontraron solicitudes que coincidan con la búsqueda' : 'No hay solicitudes de anulación pendientes'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mt: 1 }}>
            {search
              ? 'Intente limpiar el buscador para volver a ver todas las solicitudes pendientes.'
              : 'Todas las reservas de cupo para la Gestión 2027 se encuentran activas y al día. Cuando un padre o tutor solicite la baja desde su recibo digital, aparecerá aquí para su revisión administrativa.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {solicitudesFiltradas.map((s) => {
            const nivelColor = getNivelColor(s.nivel_destino_nombre);
            const cardAccent = '#f59e0b';
            return (
              <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Fade in timeout={300}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1.5px solid ${alpha(cardAccent, isDark ? 0.6 : 0.4)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 6px 16px rgba(245, 158, 11, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(245, 158, 11, 0.22)',
                        borderColor: cardAccent,
                        '& .btn-gestionar': {
                          backgroundColor: alpha(cardAccent, 0.15),
                          borderColor: cardAccent,
                          transform: 'translateX(2px)',
                        },
                      },
                    }}
                  >
                    {/* Badge de Solicitud de Anulación arriba a la izquierda */}
                    <Chip
                      icon={<WarningAmberIcon sx={{ fontSize: 12, color: '#f59e0b !important' }} />}
                      label="Solicitud Anulación"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 22,
                        backgroundColor: alpha(cardAccent, 0.18),
                        color: cardAccent,
                        border: `1px solid ${alpha(cardAccent, 0.35)}`,
                        '& .MuiChip-icon': { ml: 0.4 },
                      }}
                    />

                    {/* Chips de Fecha y Gestión 2027 arriba a la derecha */}
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      <Chip
                        label="2027"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                          backgroundColor: alpha(cardAccent, 0.15),
                          color: cardAccent,
                          border: `1px solid ${alpha(cardAccent, 0.3)}`,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Avatar 64x64 centrado con badge de grado/nivel */}
                      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'center' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Tooltip title={`Grado Destino: ${s.grado_destino_nombre}`}>
                              <Chip
                                icon={<SchoolIcon sx={{ fontSize: 11, color: '#ffffff' }} />}
                                label={s.grado_destino_nombre?.split(' ')[0] || 'Destino'}
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
                            src={s.estudiante_foto_url || undefined}
                            sx={{
                              width: 64,
                              height: 64,
                              margin: '0 auto',
                              bgcolor: cardAccent,
                              color: '#ffffff',
                              border: `3px solid ${alpha(cardAccent, 0.3)}`,
                              boxShadow: `0 6px 14px ${alpha(cardAccent, 0.25)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.3rem',
                            }}
                          >
                            {!s.estudiante_foto_url && getInitials(s.estudiante_nombres, s.estudiante_apellido_paterno)}
                          </Avatar>
                        </Badge>
                      </Box>

                      {/* Nombre del Estudiante */}
                      <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '0.96rem', lineHeight: 1.25, mb: 0.2 }}>
                        {s.estudiante_nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom fontWeight={600} sx={{ fontSize: '0.74rem' }}>
                        {s.grado_destino_nombre} {s.grado_actual_nombre ? `· (Actual: ${s.grado_actual_nombre})` : ''}
                      </Typography>

                      {/* Chips de CI y Código de Reserva Monospace */}
                      <Box sx={{ my: 0.6, display: 'flex', justifyContent: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                        <Chip
                          label={`CI: ${s.estudiante_ci || 'S/N'}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 20,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          }}
                        />
                        <Chip
                          label={s.codigo_reserva}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            backgroundColor: alpha(cardAccent, 0.12),
                            color: cardAccent,
                            border: `1px solid ${alpha(cardAccent, 0.3)}`,
                          }}
                        />
                      </Box>

                      {/* Botón de acción directo .btn-gestionar */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.8 }}>
                        <Button
                          className="btn-gestionar"
                          size="small"
                          variant="outlined"
                          endIcon={<ChevronRightIcon sx={{ fontSize: 15 }} />}
                          onClick={() => onDescargarPDF(s.codigo_reserva)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            px: 1.6,
                            py: 0.35,
                            borderColor: alpha(cardAccent, 0.4),
                            color: cardAccent,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Ver Recibo Digital
                        </Button>
                      </Box>

                      {/* Información de Tutor y Motivo en el Pie de la tarjeta */}
                      <Box
                        sx={{
                          mt: 'auto',
                          pt: 1.2,
                          borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.6,
                          textAlign: 'left',
                        }}
                      >
                        {/* Tutor solicitante */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {s.tutor_parentesco || 'Tutor'}:
                          </Typography>
                          <Typography variant="caption" fontWeight={700} noWrap sx={{ ml: 'auto', fontSize: '0.72rem', maxWidth: '60%' }}>
                            {s.tutor_nombre}
                          </Typography>
                        </Box>

                        {/* Contacto */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <Typography variant="caption" sx={{ fontSize: 12, lineHeight: 1 }}>📱</Typography>
                          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Contacto:
                          </Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', fontSize: '0.72rem' }}>
                            {s.tutor_telefono || 'S/N'}
                          </Typography>
                        </Box>

                        {/* Alerta compacta de motivo expuesto por el tutor */}
                        <Alert
                          severity="warning"
                          icon={<WarningAmberIcon fontSize="inherit" sx={{ color: '#f59e0b' }} />}
                          sx={{
                            py: 0.2,
                            px: 1,
                            fontSize: '0.68rem',
                            borderRadius: '8px',
                            bgcolor: alpha('#f59e0b', 0.1),
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            color: 'text.primary',
                            '& .MuiAlert-message': {
                              width: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            },
                          }}
                        >
                          <strong>Motivo:</strong> {s.motivo_anulacion || 'Sin motivo especificado'}
                        </Alert>

                        {/* Fila compacta de Acciones */}
                        <Box sx={{ display: 'flex', gap: 0.6, pt: 0.6, alignItems: 'center' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                            onClick={() => onAbrirAnular(s)}
                            sx={{
                              borderRadius: '9px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              py: 0.45,
                              px: 0.8,
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                            }}
                          >
                            Anular
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                            onClick={() => onAbrirReactivar(s)}
                            sx={{
                              borderRadius: '9px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              py: 0.45,
                              px: 0.8,
                            }}
                          >
                            Mantener
                          </Button>
                          <Tooltip title="WhatsApp Tutor">
                            <IconButton
                              size="small"
                              onClick={() => onWhatsApp(s)}
                              sx={{
                                bgcolor: alpha('#16a34a', 0.1),
                                color: '#16a34a',
                                borderRadius: '9px',
                                p: 0.6,
                                '&:hover': { bgcolor: alpha('#16a34a', 0.2) },
                              }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver Recibo PDF">
                            <IconButton
                              size="small"
                              onClick={() => onDescargarPDF(s.codigo_reserva)}
                              sx={{
                                bgcolor: alpha('#ef4444', 0.1),
                                color: '#ef4444',
                                borderRadius: '9px',
                                p: 0.6,
                                '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                              }}
                            >
                              <PdfIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
