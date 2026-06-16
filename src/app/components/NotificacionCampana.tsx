'use client';
// components/NotificacionCampana.tsx  v2
// Al hacer click en una notif → navega a /dashboard/notificaciones?id=X
// El color sigue la paleta del sistema: amarillo dark / azul claro

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, IconButton, Badge, Typography, Divider, Chip,
  CircularProgress, Tooltip, alpha, useTheme, Fade,
  Popper, Paper, ClickAwayListener, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';

import NotificationsOutlinedIcon     from '@mui/icons-material/NotificationsOutlined';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import DoneAllRoundedIcon             from '@mui/icons-material/DoneAllRounded';
import OpenInNewRoundedIcon           from '@mui/icons-material/OpenInNewRounded';
import FiberManualRecordIcon          from '@mui/icons-material/FiberManualRecord';
import CheckCircleRoundedIcon         from '@mui/icons-material/CheckCircleRounded';

import { useBandeja, useContadorNoLeidas } from '@/hooks/useNotificaciones';
import { NotificacionBandeja, TIPOS_NOTIFICACION } from '@/types/notificacionTypes';

// ── Animaciones ──────────────────────────────────────────────────────
const shake = keyframes`
  0%,100% { transform: rotate(0deg); }
  15%      { transform: rotate(14deg); }
  30%      { transform: rotate(-11deg); }
  45%      { transform: rotate(8deg); }
  60%      { transform: rotate(-5deg); }
  75%      { transform: rotate(3deg); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
`;
const slideRow = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ── Helpers ──────────────────────────────────────────────────────────
const getTipoConfig = (tipo: string) =>
  TIPOS_NOTIFICACION.find(t => t.value === tipo) ?? TIPOS_NOTIFICACION[0];

const tiempoCorto = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1)  return 'Ahora';
  if (d < 60) return `${d}m`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const PRIORIDAD_COLOR: Record<string, string> = {
  urgente: '#ef4444',
  alta:    '#f59e0b',
  normal:  '#0288d1',
  baja:    '#6b7280',
};

// ── Fila dentro del panel ────────────────────────────────────────────
const NotifRow: React.FC<{
  notif: NotificacionBandeja;
  accentColor: string;
  isDark: boolean;
  index: number;
  onClick: () => void;
}> = ({ notif, accentColor, isDark, index, onClick }) => {
  const tipo     = getTipoConfig(notif.tipo);
  const prioClr  = PRIORIDAD_COLOR[notif.prioridad] ?? accentColor;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', gap: 1.5, px: 2, py: 1.6,
        cursor: 'pointer',
        bgcolor: !notif.leido
          ? isDark ? alpha(accentColor, 0.07) : alpha(accentColor, 0.05)
          : 'transparent',
        borderLeft: `3px solid ${notif.leido ? 'transparent' : prioClr}`,
        animation: `${slideRow} 0.22s ease-out ${index * 0.04}s both`,
        transition: 'background 0.15s',
        '&:hover': {
          bgcolor: isDark ? alpha('#fff', 0.05) : alpha(accentColor, 0.08),
        },
      }}
    >
      {/* Ícono tipo */}
      <Box sx={{
        width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
        bgcolor: alpha(tipo.color, 0.13),
        border: `1.5px solid ${alpha(tipo.color, 0.25)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19, mt: 0.2,
        position: 'relative',
      }}>
        {tipo.icon}
        {!notif.leido && (
          <Box sx={{
            position: 'absolute', top: -3, right: -3,
            width: 9, height: 9, borderRadius: '50%',
            bgcolor: prioClr,
            border: `2px solid ${isDark ? '#0f1117' : '#ffffff'}`,
          }} />
        )}
      </Box>

      {/* Texto */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2"
            fontWeight={notif.leido ? 400 : 700}
            noWrap sx={{ fontSize: 12.5, maxWidth: '78%', color: 'text.primary' }}>
            {notif.titulo}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', flexShrink: 0 }}>
            {tiempoCorto(notif.recibido_en)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{
          fontSize: 11.5, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.2,
        }}>
          {notif.mensaje}
        </Typography>

        {/* Thumbnail si tiene foto */}
        {notif.foto_url && (
          <Box
            component="img"
            src={notif.foto_url}
            alt=""
            sx={{
              mt: 0.8, height: 44, width: 'auto', maxWidth: 80,
              borderRadius: '7px', objectFit: 'cover',
              border: `1px solid ${alpha(tipo.color, 0.2)}`,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// ── Componente principal ─────────────────────────────────────────────
export default function NotificacionCampana() {
  const theme      = useTheme();
  const isDark     = theme.palette.mode === 'dark';
  const router     = useRouter();
  const anchorRef  = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Paleta dinámica igual que Estudiantes
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentDark  = isDark ? '#f59e0b' : '#01579b';

  const { count, refrescar: refrescarContador } = useContadorNoLeidas();
  const { notificaciones, noLeidas, isLoading, marcarLeido, marcarTodasLeidas, refrescar } = useBandeja();

  const handleToggle = () => {
    if (!open) refrescar();
    setOpen(p => !p);
  };

  // Click en una notif → marcar leída + navegar con ?id=X para destacarla
  const handleClickNotif = async (notif: NotificacionBandeja) => {
    setOpen(false);
    if (!notif.leido) {
      await marcarLeido(notif.notificacion_id);
      refrescarContador();
    }
    router.push(`/dashboard/notificacion?id=${notif.notificacion_id}`);
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    refrescarContador();
  };

  const handleVerTodas = () => {
    setOpen(false);
    router.push('/dashboard/notificacion');
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative' }}>

        {/* Botón campana */}
        <Tooltip title="Notificaciones" arrow>
          <IconButton
            ref={anchorRef}
            onClick={handleToggle}
            sx={{
              color: isDark ? '#b0bec5' : '#607d8b',
              '&:hover': {
                bgcolor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
                color: accentColor,
              },
              ...(count > 0 && { animation: `${shake} 2.8s ease-in-out 1s` }),
            }}
          >
            <Badge
              badgeContent={count}
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  background: `linear-gradient(135deg, #ef4444, #dc2626)`,
                  color: '#fff', fontSize: 9, fontWeight: 800,
                  minWidth: 16, height: 16, padding: '0 4px',
                  border: `2px solid ${isDark ? '#020518' : '#ffffff'}`,
                },
              }}
            >
              {count > 0
                ? <NotificationsActiveRoundedIcon fontSize="small" />
                : <NotificationsOutlinedIcon fontSize="small" />
              }
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Panel flotante */}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          transition
          style={{ zIndex: 1400 }}
          modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={160}>
              <Paper elevation={0} sx={{
                width: 390, maxHeight: 540,
                borderRadius: '18px',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha(accentColor, 0.2)}`,
                boxShadow: isDark
                  ? `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${alpha(accentColor, 0.1)}`
                  : `0 24px 64px rgba(0,0,0,0.13), 0 0 0 1px ${alpha(accentColor, 0.08)}`,
                bgcolor: isDark ? '#0f1117' : '#ffffff',
                overflow: 'hidden',
                animation: `${popIn} 0.2s ease-out`,
              }}>

                {/* Header */}
                <Box sx={{
                  px: 2.5, py: 2,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha(accentColor, 0.12)}, ${alpha(accentDark, 0.06)})`
                    : `linear-gradient(135deg, ${alpha(accentColor, 0.07)}, ${alpha(accentDark, 0.04)})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha(accentColor, 0.12)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                      width: 30, height: 30, borderRadius: '9px',
                      background: `linear-gradient(135deg, ${accentColor}, ${accentDark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <NotificationsActiveRoundedIcon sx={{ fontSize: 16, color: isDark ? '#000' : '#fff' }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: 14 }}>
                      Notificaciones
                    </Typography>
                    {noLeidas > 0 && (
                      <Chip label={`${noLeidas} nuevas`} size="small" sx={{
                        height: 18, fontSize: 9.5, fontWeight: 800,
                        background: `linear-gradient(135deg, ${accentColor}, ${accentDark})`,
                        color: isDark ? '#000' : '#fff',
                        '& .MuiChip-label': { px: 1 },
                      }} />
                    )}
                  </Box>

                  {noLeidas > 0 && (
                    <Tooltip title="Marcar todas como leídas">
                      <IconButton size="small" onClick={handleMarcarTodas} sx={{
                        color: accentColor,
                        '&:hover': { bgcolor: alpha(accentColor, 0.1) },
                      }}>
                        <DoneAllRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Lista */}
                <Box sx={{ overflowY: 'auto', maxHeight: 430,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: alpha(accentColor, 0.3), borderRadius: 4 },
                }}>
                  {isLoading ? (
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={26} sx={{ color: accentColor }} />
                      <Typography variant="caption" color="text.disabled">Cargando...</Typography>
                    </Box>
                  ) : notificaciones.length === 0 ? (
                    <Box sx={{ py: 7, textAlign: 'center' }}>
                      <Typography fontSize={38} sx={{ mb: 1 }}>🔔</Typography>
                      <Typography variant="body2" fontWeight={700} color="text.secondary">
                        Sin notificaciones
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Acá van a aparecer los comunicados
                      </Typography>
                    </Box>
                  ) : (
                    notificaciones.slice(0, 8).map((notif, i) => (
                      <React.Fragment key={notif.destinatario_id}>
                        <NotifRow
                          notif={notif}
                          accentColor={accentColor}
                          isDark={isDark}
                          index={i}
                          onClick={() => handleClickNotif(notif)}
                        />
                        {i < Math.min(notificaciones.length, 8) - 1 && (
                          <Divider sx={{ opacity: 0.35, mx: 2 }} />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </Box>

                {/* Footer */}
                <Box
                  onClick={handleVerTodas}
                  sx={{
                    px: 2.5, py: 1.4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7,
                    cursor: 'pointer',
                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha(accentColor, 0.12)}`,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(accentColor, 0.05)}, transparent)`
                      : `linear-gradient(135deg, ${alpha(accentColor, 0.04)}, transparent)`,
                    color: accentColor,
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: alpha(accentColor, 0.08) },
                  }}
                >
                  <Typography variant="body2" fontWeight={800} sx={{ fontSize: 12.5 }}>
                    Ver todas las notificaciones
                  </Typography>
                  <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}