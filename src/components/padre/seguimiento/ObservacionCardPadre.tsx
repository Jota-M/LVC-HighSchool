'use client';
// components/padre/seguimiento/ObservacionCardPadre.tsx
// Tarjeta de observación para el padre. Muestra el contenido,
// el estado de lectura, y permite acusar recibo con comentario opcional.

import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Chip, Stack,
  Button, Collapse, TextField, Avatar, Divider,
  Tooltip, CircularProgress, useTheme, alpha,
} from '@mui/material';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import ErrorIcon         from '@mui/icons-material/Error';
import WarningIcon       from '@mui/icons-material/Warning';
import InfoIcon          from '@mui/icons-material/Info';
import SchoolIcon        from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon        from '@mui/icons-material/Person';
import ChatBubbleIcon    from '@mui/icons-material/ChatBubble';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { keyframes }     from '@mui/system';

import { ObservacionHijo }  from '@/types/seguimientoPadreTypes';
import { getNivelRelevancia } from '@/types/seguimientoPedagogicoTypes';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface ObservacionCardPadreProps {
  obs: ObservacionHijo;
  onAcusar: (id: number, comentario?: string) => Promise<boolean>;
  isAcusando: boolean;
  index: number;
}

const ObservacionCardPadre: React.FC<ObservacionCardPadreProps> = ({
  obs, onAcusar, isAcusando, index,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [expandido, setExpandido]       = useState(!obs.ya_leido); // abrir si no leído
  const [mostrarComentario, setMostrarComentario] = useState(false);
  const [comentario, setComentario]     = useState('');
  const [confirmado, setConfirmado]     = useState(obs.ya_leido);

  const meta = getNivelRelevancia(obs.nivel_relevancia);
  const Icon = obs.nivel_relevancia === 'urgente'
    ? ErrorIcon
    : obs.nivel_relevancia === 'requiere_atencion'
      ? WarningIcon
      : InfoIcon;

  const fechaOcurrencia = new Date(obs.fecha_ocurrencia + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const fechaPublicacion = new Date(obs.fecha_publicacion).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const fechaLectura = obs.fecha_lectura
    ? new Date(obs.fecha_lectura).toLocaleDateString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  const handleAcusar = async () => {
    const ok = await onAcusar(obs.id, comentario.trim() || undefined);
    if (ok) {
      setConfirmado(true);
      setMostrarComentario(false);
    }
  };

  // Color del borde izquierdo según urgencia
  const borderLeftColor = obs.nivel_relevancia === 'urgente'
    ? '#dc2626'
    : obs.nivel_relevancia === 'requiere_atencion'
      ? '#d97706'
      : isDark ? alpha('#fff', 0.2) : '#e2e8f0';

  return (
    <Card
      sx={{
        borderRadius: '16px',
        borderLeft:  `4px solid ${borderLeftColor}`,
        border:      `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
        borderLeftWidth: 4,
        background: confirmado
          ? isDark ? alpha('#fff', 0.02) : '#fafafa'
          : isDark ? alpha('#fff', 0.04) : '#fff',
        opacity:    confirmado ? 0.85 : 1,
        transition: 'all 0.3s ease',
        animation:  `${slideIn} 0.4s ease-out ${index * 0.06}s both`,
        '&:hover':  { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
        position:   'relative',
        overflow:   'visible',
      }}
    >
      {/* Badge "NUEVO" si no fue leído */}
      {!confirmado && (
        <Box sx={{
          position: 'absolute',
          top: -8, right: 16,
          bgcolor: obs.nivel_relevancia === 'urgente' ? '#dc2626' : '#8b5cf6',
          color: '#fff',
          fontSize: '0.6rem',
          fontWeight: 800,
          px: 1, py: 0.25,
          borderRadius: '4px',
          letterSpacing: 1,
          zIndex: 1,
        }}>
          NUEVO
        </Box>
      )}

      <CardContent sx={{ p: 0 }}>
        {/* ── Cabecera clickeable ── */}
        <Box
          onClick={() => setExpandido(v => !v)}
          sx={{
            p: 2.5, cursor: 'pointer',
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          {/* Ícono de categoría */}
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: obs.categoria_color
              ? `linear-gradient(135deg, ${alpha(obs.categoria_color, 0.2)}, ${alpha(obs.categoria_color, 0.08)})`
              : alpha('#000', 0.05),
          }}>
            <Icon sx={{ fontSize: 22, color: meta.color }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Chips */}
            <Stack direction="row" spacing={0.75} mb={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={obs.categoria_nombre}
                sx={{
                  bgcolor: obs.categoria_color ? alpha(obs.categoria_color, 0.12) : alpha('#000', 0.06),
                  color:   obs.categoria_color ?? 'text.primary',
                  fontWeight: 700, fontSize: '0.68rem', height: 20,
                }}
              />
              <Chip
                size="small"
                label={meta.label}
                sx={{ bgcolor: meta.bgColor, color: meta.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }}
              />
              {confirmado && (
                <Chip
                  size="small"
                  icon={<CheckCircleIcon sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
                  label={fechaLectura ? `Leído el ${fechaLectura}` : 'Leído'}
                  sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                />
              )}
            </Stack>

            {/* Preview de la descripción */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                lineHeight: 1.55,
                display: '-webkit-box',
                WebkitLineClamp: expandido ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: expandido ? 'visible' : 'hidden',
              }}
            >
              {obs.descripcion}
            </Typography>
          </Box>
        </Box>

        {/* ── Detalle expandido ── */}
        <Collapse in={expandido}>
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Metadatos */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              mb={2.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" display="block" lineHeight={1}>
                    Fecha del hecho
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                    {fechaOcurrencia}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PersonIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" display="block" lineHeight={1}>
                    Registrado por
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {obs.docente_nombre}
                  </Typography>
                </Box>
              </Box>

              {obs.materia_nombre && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <SchoolIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Box>
                    <Typography variant="caption" color="text.disabled" display="block" lineHeight={1}>
                      Materia
                    </Typography>
                    <Typography variant="caption" fontWeight={700}>
                      {obs.materia_nombre}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                <Box>
                  <Typography variant="caption" color="text.disabled" display="block" lineHeight={1}>
                    Publicado
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {fechaPublicacion}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            {/* Comentario previo del padre */}
            {obs.comentario_padre && (
              <Box sx={{
                p: 1.5, borderRadius: '10px', mb: 2,
                bgcolor: isDark ? alpha('#8b5cf6', 0.1) : alpha('#8b5cf6', 0.06),
                border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <ChatBubbleIcon sx={{ fontSize: 13, color: '#8b5cf6' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#8b5cf6' }}>
                    Tu comentario
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                  {obs.comentario_padre}
                </Typography>
              </Box>
            )}

            {/* Sección de acuse de recibo */}
            {!confirmado && (
              <Box>
                {/* Formulario de comentario opcional */}
                <Collapse in={mostrarComentario}>
                  <TextField
                    fullWidth multiline minRows={2} maxRows={4} size="small"
                    placeholder="Dejá un comentario para el docente (opcional)..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                    }}
                  />
                </Collapse>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      isAcusando
                        ? <CircularProgress size={14} color="inherit" />
                        : <MarkEmailReadIcon />
                    }
                    disabled={isAcusando}
                    onClick={handleAcusar}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: '#fff',
                      '&:hover': { transform: 'translateY(-1px)' },
                    }}
                  >
                    {isAcusando ? 'Confirmando...' : 'Confirmar lectura'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ChatBubbleIcon />}
                    onClick={() => setMostrarComentario(v => !v)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderColor: alpha('#8b5cf6', 0.4),
                      color: '#8b5cf6',
                    }}
                  >
                    {mostrarComentario ? 'Sin comentario' : 'Agregar comentario'}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Confirmado: mensaje de cierre */}
            {confirmado && !obs.comentario_padre && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                p: 1.5, borderRadius: '10px',
                bgcolor: isDark ? alpha('#16a34a', 0.1) : alpha('#16a34a', 0.06),
                border: `1px solid ${alpha('#16a34a', 0.2)}`,
              }}>
                <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                  Confirmaste la lectura de esta observación
                  {fechaLectura && ` el ${fechaLectura}`}.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ObservacionCardPadre;