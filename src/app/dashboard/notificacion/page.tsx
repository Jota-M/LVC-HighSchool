'use client';
// app/dashboard/notificaciones/page.tsx  v2
// — Foto visible en la tarjeta expandida
// — Si llega ?id=X, esa notif aparece destacada y auto-expandida
// — Paleta: amarillo dark / azul celeste light (igual que Estudiantes)

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, IconButton, Chip, Tooltip,
  CircularProgress, Fade, alpha, useTheme, Button,
  Tab, Tabs, keyframes as muiKeyframes,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useSearchParams } from 'next/navigation';

import NotificationsRoundedIcon       from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon              from '@mui/icons-material/DoneAllRounded';
import RefreshRoundedIcon              from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon          from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon           from '@mui/icons-material/ExpandMoreRounded';
import AccessTimeRoundedIcon           from '@mui/icons-material/AccessTimeRounded';
import PriorityHighRoundedIcon         from '@mui/icons-material/PriorityHighRounded';
import AttachFileRoundedIcon           from '@mui/icons-material/AttachFileRounded';
import FiberManualRecordIcon           from '@mui/icons-material/FiberManualRecord';
import ImageRoundedIcon                from '@mui/icons-material/ImageRounded';
import CampaignRoundedIcon             from '@mui/icons-material/CampaignRounded';

import { useBandeja }                  from '@/hooks/useNotificaciones';
import { NotificacionBandeja, TIPOS_NOTIFICACION, PRIORIDADES } from '@/types/notificacionTypes';

// ── Animaciones ──────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const highlightPulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0px transparent; }
  30%      { box-shadow: 0 0 0 6px var(--accent-alpha); }
  70%      { box-shadow: 0 0 0 3px var(--accent-alpha); }
`;
const bounce = keyframes`
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

// ── Helpers ──────────────────────────────────────────────────────────
const getTipo   = (t: string) => TIPOS_NOTIFICACION.find(x => x.value === t) ?? TIPOS_NOTIFICACION[0];
const getPrio   = (p: string) => PRIORIDADES.find(x => x.value === p) ?? PRIORIDADES[1];

const PRIORIDAD_COLOR: Record<string, string> = {
  urgente: '#ef4444',
  alta:    '#f59e0b',
  normal:  '#0288d1',
  baja:    '#6b7280',
};

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const tiempoRelativo = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1)   return 'Hace un momento';
  if (m < 60)  return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `Hace ${h} h`;
  const dd = Math.floor(h / 24);
  if (dd < 7)  return `Hace ${dd} días`;
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Skeleton ─────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ isDark: boolean; accent: string }> = ({ isDark, accent }) => (
  <Box sx={{
    borderRadius: '18px', p: 2.5, display: 'flex', gap: 2,
    border: `1.5px solid ${isDark ? alpha('#fff', 0.06) : alpha(accent, 0.12)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
  }}>
    <Box sx={{ width: 48, height: 48, borderRadius: '13px', bgcolor: isDark ? alpha('#fff', 0.06) : '#f0f0f0', flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Box sx={{ height: 14, width: '55%', borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.06) : '#eee', mb: 1.2 }} />
      <Box sx={{ height: 12, width: '88%', borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.04) : '#f4f4f4', mb: 0.8 }} />
      <Box sx={{ height: 12, width: '65%', borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.04) : '#f4f4f4' }} />
    </Box>
  </Box>
);

// ── Tarjeta principal ────────────────────────────────────────────────
const NotifCard: React.FC<{
  notif: NotificacionBandeja;
  isDark: boolean;
  accent: string;
  accentDark: string;
  index: number;
  expandida: boolean;
  destacada: boolean;
  onToggle: () => void;
  onLeer: (id: number) => void;
}> = ({ notif, isDark, accent, accentDark, index, expandida, destacada, onToggle, onLeer }) => {
  const cardRef  = useRef<HTMLDivElement>(null);
  const tipo     = getTipo(notif.tipo);
  const prio     = getPrio(notif.prioridad);
  const prioClr  = PRIORIDAD_COLOR[notif.prioridad] ?? accent;
  const esUrgente = notif.prioridad === 'urgente';

  // Auto-scroll a la tarjeta destacada
  useEffect(() => {
    if (destacada && cardRef.current) {
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [destacada]);

  const handleClick = () => {
    onToggle();
    if (!notif.leido) onLeer(notif.notificacion_id);
  };

  return (
    <Box
      ref={cardRef}
      onClick={handleClick}
      sx={{
        borderRadius: '18px',
        border: `2px solid ${
          destacada
            ? accent
            : !notif.leido
              ? alpha(tipo.color, 0.4)
              : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)
        }`,
        bgcolor: destacada
          ? isDark ? alpha(accent, 0.08) : alpha(accent, 0.04)
          : !notif.leido
            ? isDark ? alpha(tipo.color, 0.05) : alpha(tipo.color, 0.02)
            : isDark ? alpha('#fff', 0.02) : '#fff',
        cursor: 'pointer',
        animation: `${slideUp} 0.32s ease-out ${index * 0.05}s both`,
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
        boxShadow: destacada
          ? `0 0 0 4px ${alpha(accent, 0.18)}`
          : !notif.leido
            ? `0 2px 12px ${alpha(tipo.color, 0.1)}`
            : isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
        '&:hover': {
          borderColor: accent,
          boxShadow: `0 0 0 3px ${alpha(accent, 0.13)}`,
        },
        // Borde izquierdo de prioridad
        borderLeft: `5px solid ${prioClr}`,
        overflow: 'hidden',
        '--accent-alpha': alpha(accent, 0.25),
        ...(destacada && {
          animationName: `${highlightPulse}`,
          animationDuration: '1.8s',
          animationDelay: '0.4s',
          animationTimingFunction: 'ease-in-out',
        }),
      }}
    >
      {/* Banda urgente */}
      {esUrgente && !notif.leido && (
        <Box sx={{
          px: 2.5, py: 0.7,
          background: `linear-gradient(90deg, ${alpha('#ef4444', 0.18)}, transparent)`,
          display: 'flex', alignItems: 'center', gap: 0.8,
          borderBottom: `1px solid ${alpha('#ef4444', 0.18)}`,
        }}>
          <PriorityHighRoundedIcon sx={{ fontSize: 13, color: '#ef4444' }} />
          <Typography sx={{ fontSize: 10.5, color: '#ef4444', fontWeight: 800, letterSpacing: 1 }}>
            URGENTE
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

          {/* Ícono animado */}
          <Box sx={{
            width: 50, height: 50, borderRadius: '14px', flexShrink: 0,
            bgcolor: alpha(tipo.color, 0.13),
            border: `2px solid ${alpha(tipo.color, 0.28)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, position: 'relative',
            boxShadow: `0 4px 12px ${alpha(tipo.color, 0.2)}`,
          }}>
            {tipo.icon}
            {!notif.leido && (
              <Box sx={{
                position: 'absolute', top: -4, right: -4,
                width: 12, height: 12, borderRadius: '50%',
                bgcolor: prioClr,
                border: `2.5px solid ${isDark ? '#0f1117' : '#fff'}`,
                boxShadow: `0 0 6px ${alpha(prioClr, 0.6)}`,
              }} />
            )}
          </Box>

          {/* Contenido cabecera */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="subtitle1"
                fontWeight={!notif.leido ? 800 : 500}
                sx={{ fontSize: 14.5, color: 'text.primary', lineHeight: 1.35 }}>
                {notif.titulo}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 0.4 }}>
                {notif.leido
                  ? <CheckCircleRoundedIcon sx={{ fontSize: 14, color: alpha('#16a34a', 0.6) }} />
                  : <FiberManualRecordIcon  sx={{ fontSize: 10, color: prioClr }} />
                }
                <Typography variant="caption" sx={{ fontSize: 10.5, color: 'text.disabled', whiteSpace: 'nowrap' }}>
                  {tiempoRelativo(notif.recibido_en)}
                </Typography>
              </Box>
            </Box>

            {/* Preview colapsado */}
            {!expandida && (
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: 12.5, lineHeight: 1.6, mt: 0.5,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {notif.mensaje}
              </Typography>
            )}

            {/* Chips + expand hint */}
            <Box sx={{ display: 'flex', gap: 0.8, mt: 1.2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip label={tipo.label} size="small" sx={{
                height: 20, fontSize: 10, fontWeight: 700,
                bgcolor: alpha(tipo.color, 0.1), color: tipo.color,
              }} />
              {(notif.prioridad === 'urgente' || notif.prioridad === 'alta') && (
                <Chip label={prio.label} size="small" sx={{
                  height: 20, fontSize: 10, fontWeight: 700,
                  bgcolor: alpha(prioClr, 0.1), color: prioClr,
                }} />
              )}
              {notif.foto_url && (
                <Chip
                  icon={<ImageRoundedIcon sx={{ fontSize: 11, '&.MuiChip-icon': { color: accent } }} />}
                  label="Foto" size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    bgcolor: alpha(accent, 0.08), color: accent,
                  }}
                />
              )}
              {notif.adjunto_url && (
                <Chip
                  icon={<AttachFileRoundedIcon sx={{ fontSize: 11 }} />}
                  label="Adjunto" size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    bgcolor: alpha('#6b7280', 0.1), color: '#6b7280',
                  }}
                />
              )}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.disabled' }}>
                <ExpandMoreRoundedIcon sx={{
                  fontSize: 15, transition: 'transform 0.22s',
                  transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
                <Typography variant="caption" sx={{ fontSize: 10.5 }}>
                  {expandida ? 'Cerrar' : 'Leer completo'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── CONTENIDO EXPANDIDO ─────────────────────────────── */}
        {expandida && (
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              mt: 2.5, pt: 2.5,
              borderTop: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha(accent, 0.15)}`,
              animation: `${fadeIn} 0.22s ease-out`,
            }}
          >
            {/* Texto completo */}
            <Typography variant="body1" sx={{
              fontSize: 14, lineHeight: 1.8,
              color: 'text.primary', whiteSpace: 'pre-wrap',
              p: 2, borderRadius: '12px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha(accent, 0.03),
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha(accent, 0.1)}`,
            }}>
              {notif.mensaje}
            </Typography>

            {/* ── FOTO ─────────────────────────────────────────── */}
            {notif.foto_url && (
              <Box sx={{ mt: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
                  <ImageRoundedIcon sx={{ fontSize: 15, color: accent }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: accent, fontSize: 11.5, letterSpacing: 0.5 }}>
                    IMAGEN ADJUNTA
                  </Typography>
                </Box>
                <Box
                  component="img"
                  src={notif.foto_url}
                  alt="Imagen del comunicado"
                  sx={{
                    width: '100%', maxWidth: 480, display: 'block',
                    borderRadius: '14px', objectFit: 'cover',
                    border: `2px solid ${alpha(accent, 0.25)}`,
                    boxShadow: `0 8px 24px ${alpha(accent, 0.15)}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.01)' },
                  }}
                />
              </Box>
            )}

            {/* ── ADJUNTO URL ───────────────────────────────────── */}
            {notif.adjunto_url && (
              <Box sx={{ mt: 2 }}>
                <Box
                  component="a"
                  href={notif.adjunto_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    px: 2.5, py: 1.2, borderRadius: '10px', textDecoration: 'none',
                    background: `linear-gradient(135deg, ${alpha(accent, 0.12)}, ${alpha(accentDark, 0.08)})`,
                    border: `1.5px solid ${alpha(accent, 0.3)}`,
                    color: accent, fontSize: 13, fontWeight: 700,
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(accent, 0.2)}, ${alpha(accentDark, 0.15)})`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(accent, 0.2)}`,
                    },
                  }}
                >
                  <AttachFileRoundedIcon sx={{ fontSize: 16 }} />
                  Ver adjunto
                </Box>
              </Box>
            )}

            {/* ── METADATOS ────────────────────────────────────── */}
            <Box sx={{
              mt: 2.5, pt: 2,
              borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              display: 'flex', flexWrap: 'wrap', gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11.5 }}>
                  Recibido: {formatFecha(notif.recibido_en)}
                </Typography>
              </Box>
              {notif.leido && notif.leido_en && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ fontSize: 11.5, color: '#16a34a' }}>
                    Leído: {formatFecha(notif.leido_en)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ── PÁGINA ────────────────────────────────────────────────────────────
export default function BandejaNotificacionesPage() {
  const theme       = useTheme();
  const isDark      = theme.palette.mode === 'dark';
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

  // Paleta dinámica igual que Estudiantes
  const accent     = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [tab, setTab]           = useState<'todas' | 'no_leidas'>('todas');
  const [expandidaId, setExpandidaId] = useState<number | null>(highlightId);

  const { notificaciones, noLeidas, isLoading, hayMas, marcarLeido, marcarTodasLeidas, cargarMas, refrescar } = useBandeja();

  // Si hay ?id=X, auto-expandir esa tarjeta
  useEffect(() => {
    if (highlightId) setExpandidaId(highlightId);
  }, [highlightId]);

  const handleToggle = useCallback((notificacion_id: number) => {
    setExpandidaId(prev => prev === notificacion_id ? null : notificacion_id);
  }, []);

  const filtradas = tab === 'no_leidas'
    ? notificaciones.filter(n => !n.leido)
    : notificaciones;

  const totalNoLeidas = notificaciones.filter(n => !n.leido).length;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
            }}>
              {/* Título */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 54, height: 54, borderRadius: '16px',
                  background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 20px ${alpha(accent, 0.4)}`,
                  position: 'relative',
                }}>
                  <CampaignRoundedIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
                  {noLeidas > 0 && (
                    <Box sx={{
                      position: 'absolute', top: -5, right: -5,
                      minWidth: 20, height: 20, borderRadius: '10px', px: 0.5,
                      bgcolor: '#ef4444', color: '#fff',
                      fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${isDark ? '#020518' : '#f8fafc'}`,
                    }}>
                      {noLeidas > 9 ? '9+' : noLeidas}
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800,
                    background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: `${bounce} 1.5s infinite`,
                    display: 'inline-block',
                  }}>
                    Mis Notificaciones
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comunicados de la institución
                  </Typography>
                </Box>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Tooltip title="Refrescar">
                  <IconButton onClick={refrescar} disabled={isLoading} sx={{
                    border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha(accent, 0.25)}`,
                    color: accent,
                    '&:hover': { bgcolor: alpha(accent, 0.08) },
                  }}>
                    <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {noLeidas > 0 && (
                  <Button
                    onClick={marcarTodasLeidas}
                    startIcon={<DoneAllRoundedIcon sx={{ fontSize: 16 }} />}
                    variant="outlined" size="small"
                    sx={{
                      borderRadius: '11px', textTransform: 'none', fontWeight: 700, fontSize: 12.5,
                      borderColor: alpha(accent, 0.45), color: accent,
                      '&:hover': { bgcolor: alpha(accent, 0.07), borderColor: accent },
                    }}>
                    Marcar todas
                  </Button>
                )}
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
              {[
                { label: 'Total',     value: notificaciones.length,                    color: accent },
                { label: 'No leídas', value: totalNoLeidas,                             color: '#ef4444' },
                { label: 'Leídas',    value: notificaciones.length - totalNoLeidas,     color: '#16a34a' },
              ].map(s => (
                <Box key={s.label} sx={{
                  px: 2, py: 1, borderRadius: '11px',
                  bgcolor: alpha(s.color, 0.08),
                  border: `1.5px solid ${alpha(s.color, 0.22)}`,
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <Typography variant="body2" fontWeight={800} sx={{ color: s.color }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* ══ TABS ══ */}
        <Fade in timeout={420}>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                minHeight: 42,
                '& .MuiTabs-indicator': {
                  background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                  height: 3, borderRadius: 2,
                },
                '& .MuiTab-root': {
                  minHeight: 42, textTransform: 'none', fontWeight: 700, fontSize: 13.5,
                  color: 'text.secondary',
                  '&.Mui-selected': { color: accent },
                },
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha(accent, 0.15)}`,
              }}
            >
              <Tab value="todas" label="Todas" />
              <Tab
                value="no_leidas"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    No leídas
                    {totalNoLeidas > 0 && (
                      <Chip label={totalNoLeidas} size="small" sx={{
                        height: 18, fontSize: 10, fontWeight: 800,
                        background: `linear-gradient(135deg, #ef4444, #dc2626)`,
                        color: '#fff',
                        '& .MuiChip-label': { px: 0.8 },
                      }} />
                    )}
                  </Box>
                }
              />
            </Tabs>
          </Box>
        </Fade>

        {/* ══ LISTA ══ */}
        {isLoading && notificaciones.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} isDark={isDark} accent={accent} />)}
          </Box>
        ) : filtradas.length === 0 ? (
          <Fade in timeout={300}>
            <Box sx={{
              textAlign: 'center', py: 12, borderRadius: '20px',
              border: `2px dashed ${alpha(accent, 0.25)}`,
              bgcolor: isDark ? alpha(accent, 0.04) : alpha(accent, 0.03),
            }}>
              <Typography fontSize={52} sx={{ mb: 2 }}>
                {tab === 'no_leidas' ? '✅' : '📭'}
              </Typography>
              <Typography variant="h6" fontWeight={700} color="text.secondary" sx={{ mb: 0.8 }}>
                {tab === 'no_leidas' ? '¡Todo al día!' : 'Sin notificaciones aún'}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {tab === 'no_leidas'
                  ? 'No tenés comunicados pendientes de leer'
                  : 'Acá vas a ver los comunicados de la institución'}
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Fade in timeout={460}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filtradas.map((notif, i) => (
                <NotifCard
                  key={notif.destinatario_id}
                  notif={notif}
                  isDark={isDark}
                  accent={accent}
                  accentDark={accentDark}
                  index={i}
                  expandida={expandidaId === notif.notificacion_id}
                  destacada={highlightId === notif.notificacion_id}
                  onToggle={() => handleToggle(notif.notificacion_id)}
                  onLeer={marcarLeido}
                />
              ))}

              {hayMas && tab === 'todas' && (
                <Box sx={{ pt: 1, pb: 2, textAlign: 'center' }}>
                  <Button
                    onClick={cargarMas}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={14} /> : <ExpandMoreRoundedIcon />}
                    variant="outlined"
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: 13,
                      borderColor: alpha(accent, 0.35), color: accent,
                      '&:hover': { bgcolor: alpha(accent, 0.06), borderColor: accent },
                    }}>
                    {isLoading ? 'Cargando...' : 'Ver más'}
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        )}

      </Container>
    </Box>
  );
}