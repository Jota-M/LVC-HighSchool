'use client';
// app/dashboard/padre/home/page.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
  Grid, Paper, LinearProgress, Divider,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';

// Icons
import AssignmentIcon        from '@mui/icons-material/Assignment';
import SchoolIcon            from '@mui/icons-material/School';
import CalendarMonthIcon     from '@mui/icons-material/CalendarMonth';
import PsychologyIcon        from '@mui/icons-material/Psychology';
import FamilyRestroomIcon    from '@mui/icons-material/FamilyRestroom';
import RefreshIcon           from '@mui/icons-material/Refresh';
import WarningAmberIcon      from '@mui/icons-material/WarningAmber';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import TrendingUpIcon        from '@mui/icons-material/TrendingUp';
import TrendingDownIcon      from '@mui/icons-material/TrendingDown';
import ArrowForwardIosIcon   from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon        from '@mui/icons-material/AccessTime';
import WbSunnyIcon           from '@mui/icons-material/WbSunny';
import NightsStayIcon        from '@mui/icons-material/NightsStay';
import NotificationsIcon     from '@mui/icons-material/Notifications';
import ErrorOutlineIcon      from '@mui/icons-material/ErrorOutline';

// Hooks — reutilizamos los que ya existen en el proyecto
import { useAuth }                        from '@/context/AuthContext';
import { useHijosDelPadre }               from '@/hooks/usePadreAsistencia';
import { useResumenAsistencia }           from '@/hooks/usePadreAsistencia';
import { usePeriodosEvaluacion, useBoletinNotas } from '@/hooks/usePadreNotas';
import { useTareasHijo }                  from '@/hooks/usePadreTareas';
import { useObservacionesHijo }           from '@/hooks/useSeguimientoPadre';

// ─────────────────────────────────────────────────────────────
// Keyframes
// ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -1200px 0; }
  100% { background-position:  1200px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
`;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const saludo = (): { texto: string; Icon: React.ElementType } => {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Buenos días',   Icon: WbSunnyIcon };
  if (h < 19) return { texto: 'Buenas tardes', Icon: WbSunnyIcon };
  return          { texto: 'Buenas noches',  Icon: NightsStayIcon };
};

// ─────────────────────────────────────────────────────────────
// MODULE CARD — tarjeta grande para cada sección
// ─────────────────────────────────────────────────────────────

interface ModuleCardProps {
  title:       string;
  subtitle:    string;
  icon:        React.ElementType;
  gradient:    string;
  glowColor:   string;
  href:        string;
  delay?:      number;
  badge?:      { label: string; color: 'warning' | 'error' | 'success' | 'info' };
  stats?:      { label: string; value: string | number; sub?: string; trend?: 'up' | 'down' | 'neutral' }[];
  isLoading?:  boolean;
  children?:   React.ReactNode;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title, subtitle, icon: Icon, gradient, glowColor,
  href, delay = 0, badge, stats = [], isLoading, children,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  return (
    <Paper
      onClick={() => router.push(href)}
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '20px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05)}`,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))'
          : '#fff',
        boxShadow: isDark
          ? `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 ${alpha('#fff', 0.06)}`
          : `0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 #fff`,
        animation: `${fadeUp} 0.5s ease-out ${delay}ms both`,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? `0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px ${alpha(glowColor, 0.3)}`
            : `0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px ${alpha(glowColor, 0.2)}`,
          '& .arrow-icon': { opacity: 1, transform: 'translateX(4px)' },
          '& .module-icon-box': { transform: 'scale(1.08) rotate(-4deg)' },
        },
      }}
    >
      {/* Shimmer decorativo */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.025 : 0.07)}, transparent)`,
        backgroundSize: '1200px 100%',
        animation: `${shimmer} 5s linear infinite`,
      }} />

      {/* Glow de fondo sutil */}
      <Box sx={{
        position: 'absolute', top: -40, right: -40,
        width: 140, height: 140, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(glowColor, isDark ? 0.12 : 0.07)}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            className="module-icon-box"
            sx={{
              width: 46, height: 46, borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: gradient,
              boxShadow: `0 6px 16px ${alpha(glowColor, 0.4)}`,
              flexShrink: 0,
              transition: 'transform 0.3s ease',
              animation: `${float} 4s ease-in-out infinite`,
            }}
          >
            <Icon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, letterSpacing: -0.3 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {badge && (
            <Chip
              size="small"
              label={badge.label}
              icon={badge.color === 'error' || badge.color === 'warning'
                ? <WarningAmberIcon sx={{ fontSize: '13px !important' }} />
                : <CheckCircleIcon sx={{ fontSize: '13px !important' }} />
              }
              sx={{
                height: 22, fontWeight: 800, fontSize: '0.68rem', borderRadius: 1.5,
                ...(badge.color === 'warning' && {
                  bgcolor: isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1),
                  color: isDark ? '#fbbf24' : '#d97706',
                  border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                  '& .MuiChip-icon': { color: isDark ? '#fbbf24' : '#d97706' },
                }),
                ...(badge.color === 'error' && {
                  bgcolor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
                  color: isDark ? '#f87171' : '#dc2626',
                  border: `1px solid ${alpha('#ef4444', 0.3)}`,
                  '& .MuiChip-icon': { color: isDark ? '#f87171' : '#dc2626' },
                }),
                ...(badge.color === 'success' && {
                  bgcolor: isDark ? alpha('#10b981', 0.18) : alpha('#10b981', 0.1),
                  color: isDark ? '#34d399' : '#059669',
                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                  '& .MuiChip-icon': { color: isDark ? '#34d399' : '#059669' },
                }),
                ...(badge.color === 'info' && {
                  bgcolor: isDark ? alpha('#3b82f6', 0.18) : alpha('#3b82f6', 0.1),
                  color: isDark ? '#60a5fa' : '#2563eb',
                  border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                  '& .MuiChip-icon': { color: isDark ? '#60a5fa' : '#2563eb' },
                }),
              }}
            />
          )}
          <ArrowForwardIosIcon
            className="arrow-icon"
            sx={{ fontSize: 13, color: 'text.disabled', opacity: 0, transition: 'all 0.2s ease' }}
          />
        </Box>
      </Box>

      {/* Stats row */}
      {isLoading ? (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={52} sx={{ flex: 1, borderRadius: 2 }} />)}
        </Box>
      ) : stats.length > 0 ? (
        <Box sx={{
          display: 'flex', gap: 1, mt: 1,
          p: 1.5, borderRadius: '12px',
          bgcolor: isDark ? alpha('#fff', 0.035) : alpha('#000', 0.02),
          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04)}`,
        }}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1, color: glowColor, fontSize: '1.15rem' }}>
                    {s.value}
                  </Typography>
                  {s.trend === 'up'   && <TrendingUpIcon   sx={{ fontSize: 14, color: '#10b981' }} />}
                  {s.trend === 'down' && <TrendingDownIcon  sx={{ fontSize: 14, color: '#ef4444' }} />}
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.62rem', display: 'block', lineHeight: 1.2 }}>
                  {s.label}
                </Typography>
                {s.sub && (
                  <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'text.disabled', lineHeight: 1 }}>
                    {s.sub}
                  </Typography>
                )}
              </Box>
            </React.Fragment>
          ))}
        </Box>
      ) : null}

      {/* Contenido adicional */}
      {children && <Box sx={{ mt: 1.5 }}>{children}</Box>}
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// BARRA DE ASISTENCIA MINI
// ─────────────────────────────────────────────────────────────

const MiniAsistenciaBar: React.FC<{ porcentaje: number; color: string; isDark: boolean }> = ({
  porcentaje, color, isDark,
}) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
        Asistencia del período
      </Typography>
      <Typography variant="caption" fontWeight={900} sx={{ color, fontSize: '0.72rem' }}>
        {porcentaje}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.min(porcentaje, 100)}
      sx={{
        height: 6, borderRadius: 3,
        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
        '& .MuiLinearProgress-bar': {
          borderRadius: 3,
          background: porcentaje >= 85
            ? `linear-gradient(90deg, #10b981, #34d399)`
            : porcentaje >= 70
              ? `linear-gradient(90deg, #f59e0b, #fbbf24)`
              : `linear-gradient(90deg, #ef4444, #f87171)`,
        },
      }}
    />
  </Box>
);

// ─────────────────────────────────────────────────────────────
// SELECTOR DE HIJO (multi hijo)
// ─────────────────────────────────────────────────────────────

const SelectorHijo: React.FC<{
  hijos:        any[];
  hijoActivo:   any;
  onSeleccionar:(h: any) => void;
  isLoading:    boolean;
}> = ({ hijos, hijoActivo, onSeleccionar, isLoading }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {[1, 2].map(i => <Skeleton key={i} variant="rounded" width={150} height={52} sx={{ borderRadius: 3 }} />)}
    </Box>
  );

  if (hijos.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {hijos.map(h => {
        const activo = h.estudiante_id === hijoActivo?.estudiante_id;
        return (
          <Box
            key={h.estudiante_id}
            onClick={() => onSeleccionar(h)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.2,
              px: 1.5, py: 1, borderRadius: '12px', cursor: 'pointer',
              border: `2px solid ${activo
                ? (isDark ? '#60a5fa' : '#3b82f6')
                : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07))}`,
              background: activo
                ? isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.06)
                : 'transparent',
              transition: 'all 0.18s ease',
              '&:hover': {
                borderColor: isDark ? '#60a5fa' : '#3b82f6',
                background: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.04),
              },
            }}
          >
            <Avatar
              src={h.foto_url ?? undefined}
              sx={{
                width: 30, height: 30, fontSize: 12, fontWeight: 800,
                bgcolor: activo ? (isDark ? '#2563eb' : '#3b82f6') : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.07)),
              }}
            >
              {h.nombres.charAt(0)}{h.apellidos.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.1, fontSize: '0.8rem' }}>
                {h.nombres.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.63rem' }}>
                {h.grado_nombre} "{h.paralelo_nombre}"
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function PadreHomePage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const { texto: saludoTexto, Icon: SaludoIcon } = saludo();

  // ── Datos globales del padre ──
  const {
    hijos, hijoActivo, setHijoActivo,
    isLoading: loadingHijos, refrescar: refrescarHijos,
  } = useHijosDelPadre();

  // ── Asistencia ──
  const { resumen: resumenAsistencia, isLoading: loadingAsistencia } =
    useResumenAsistencia(hijoActivo?.matricula_id ?? null);

  // ── Notas ──
  const { periodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEvaluacion(hijoActivo);

  const { promedio, aprobadas, reprobadas, sinNota, isLoading: loadingNotas } =
    useBoletinNotas(hijoActivo?.matricula_id ?? null, periodoActivo?.id ?? null);

  // ── Tareas ──
  const { resumen: resumenTareas, isLoading: loadingTareas } =
    useTareasHijo(hijoActivo);

  // ── Seguimiento ──
  const { conteos: conteosObs, isLoading: loadingSeguimiento } =
    useObservacionesHijo(
      hijoActivo?.matricula_id ?? 0,
      hijoActivo?.padre_familia_id ?? 0,
    );

  const handleSeleccionarHijo = useCallback((h: any) => setHijoActivo(h), [setHijoActivo]);

  // ── Alertas globales ──
  const alertas: { texto: string; color: string; Icon: React.ElementType }[] = [];
  if ((resumenTareas?.atrasados ?? 0) > 0)
    alertas.push({ texto: `${resumenTareas!.atrasados} tarea${resumenTareas!.atrasados > 1 ? 's' : ''} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`, color: '#ef4444', Icon: ErrorOutlineIcon });
  if ((conteosObs?.urgentes ?? 0) > 0)
    alertas.push({ texto: `${conteosObs!.urgentes} observación${conteosObs!.urgentes > 1 ? 'es urgentes' : ' urgente'} sin leer`, color: '#f59e0b', Icon: WarningAmberIcon });
  if (reprobadas > 0)
    alertas.push({ texto: `${reprobadas} materia${reprobadas > 1 ? 's' : ''} reprobada${reprobadas > 1 ? 's' : ''}`, color: '#ef4444', Icon: TrendingDownIcon });

  const porcentajeAsistencia = resumenAsistencia?.porcentaje_asistencia_global ?? 0;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.06) 0%, transparent 55%), radial-gradient(ellipse at 20% 100%, rgba(139,92,246,0.04) 0%, transparent 50%)'
        : 'radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.04) 0%, transparent 55%), radial-gradient(ellipse at 20% 100%, rgba(139,92,246,0.02) 0%, transparent 50%)',
    }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══════════ HERO HEADER ══════════ */}
        <Fade in timeout={350}>
          <Box sx={{ pt: 3, mb: 3 }}>
            <Box sx={{
              p: { xs: 2.5, sm: 3.5 }, borderRadius: '24px',
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.02))'
                : 'linear-gradient(145deg, #ffffff, #f8faff)',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#3b82f6', 0.1)}`,
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)'
                : '0 8px 40px rgba(59,130,246,0.08), inset 0 1px 0 #fff',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Shimmer */}
              <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.03 : 0.08)}, transparent)`,
                backgroundSize: '1200px 100%',
                animation: `${shimmer} 5s linear infinite`,
              }} />

              <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: 2, position: 'relative', zIndex: 1,
              }}>
                {/* Saludo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 58, height: 58, fontWeight: 800, fontSize: '1.2rem',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
                      border: `3px solid ${isDark ? alpha('#fff', 0.1) : '#fff'}`,
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      <SaludoIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                        {saludoTexto}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={900} sx={{
                      lineHeight: 1.1, letterSpacing: -0.5,
                      background: isDark
                        ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                        : 'linear-gradient(135deg, #1e293b, #475569)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {user?.username ?? 'Bienvenido'}
                    </Typography>
                    {hijoActivo && (
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
                        Seguimiento de{' '}
                        <Box component="span" sx={{
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                          {hijoActivo.nombres} {hijoActivo.apellidos}
                        </Box>
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Acciones header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Notificaciones (badge de alertas) */}
                  {alertas.length > 0 && (
                    <Chip
                      icon={<NotificationsIcon sx={{ fontSize: '15px !important' }} />}
                      label={`${alertas.length} alerta${alertas.length > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 28, fontWeight: 800, fontSize: '0.72rem', borderRadius: '10px',
                        bgcolor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.09),
                        color: isDark ? '#f87171' : '#dc2626',
                        border: `1px solid ${alpha('#ef4444', 0.28)}`,
                        animation: `${pulse} 2.5s ease-in-out infinite`,
                        '& .MuiChip-icon': { color: isDark ? '#f87171' : '#dc2626' },
                      }}
                    />
                  )}
                  <Tooltip title="Actualizar datos">
                    <IconButton
                      onClick={refrescarHijos}
                      size="small"
                      disabled={loadingHijos}
                      sx={{
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                        borderRadius: '10px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.08),
                          transform: 'rotate(180deg)',
                        },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 18, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Chips info del hijo */}
              {hijoActivo && (
                <Box sx={{
                  mt: 2.5, pt: 2, position: 'relative', zIndex: 1,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
                  display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center',
                }}>
                  {[
                    hijoActivo.nivel_nombre,
                    `${hijoActivo.grado_nombre} "${hijoActivo.paralelo_nombre}"`,
                    hijoActivo.turno_nombre,
                    periodoActivo?.nombre,
                  ].filter(Boolean).map((label, i) => (
                    <Chip key={i} label={label} size="small" sx={{
                      height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: '8px',
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#3b82f6', 0.06),
                      color: isDark ? 'text.secondary' : '#3b82f6',
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#3b82f6', 0.12)}`,
                    }} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>

        {/* ══════════ SELECTOR DE HIJO ══════════ */}
        <SelectorHijo
          hijos={hijos} hijoActivo={hijoActivo}
          onSeleccionar={handleSeleccionarHijo} isLoading={loadingHijos}
        />

        {/* ══════════ ALERTAS RÁPIDAS ══════════ */}
        {alertas.length > 0 && (
          <Fade in timeout={400}>
            <Box sx={{
              mb: 3, p: 2, borderRadius: '16px',
              display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center',
              background: isDark
                ? `linear-gradient(135deg, ${alpha('#ef4444', 0.12)}, ${alpha('#f59e0b', 0.08)})`
                : `linear-gradient(135deg, ${alpha('#ef4444', 0.06)}, ${alpha('#f59e0b', 0.04)})`,
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
              animation: `${fadeUp} 0.5s ease-out 100ms both`,
            }}>
              <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 20, flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#f87171' : '#dc2626', mr: 0.5 }}>
                Requiere atención:
              </Typography>
              {alertas.map((a, i) => (
                <Chip
                  key={i}
                  icon={<a.Icon sx={{ fontSize: '13px !important', color: `${a.color} !important` }} />}
                  label={a.texto}
                  size="small"
                  sx={{
                    height: 24, fontWeight: 700, fontSize: '0.68rem', borderRadius: '8px',
                    bgcolor: alpha(a.color, isDark ? 0.18 : 0.09),
                    color: isDark ? alpha(a.color, 0.9) : a.color,
                    border: `1px solid ${alpha(a.color, 0.25)}`,
                    '& .MuiChip-icon': { color: `${a.color} !important` },
                  }}
                />
              ))}
            </Box>
          </Fade>
        )}

        {/* ══════════ GRID DE MÓDULOS ══════════ */}
        <Grid container spacing={2.5} sx={{ pb: 6 }}>

          {/* ── ASISTENCIA ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <ModuleCard
              title="Asistencia"
              subtitle="Historial y permisos"
              icon={FamilyRestroomIcon}
              gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
              glowColor="#3b82f6"
              href="/dashboard/padre/asistencia"
              delay={0}
              badge={
                (resumenAsistencia?.total_ausentes ?? 0) > 3
                  ? { label: `${resumenAsistencia!.total_ausentes} faltas`, color: 'warning' }
                  : porcentajeAsistencia >= 90
                    ? { label: 'Al día', color: 'success' }
                    : undefined
              }
              stats={[
                {
                  label: 'Asistencias',
                  value: loadingAsistencia ? '…' : (resumenAsistencia?.total_presentes ?? '—'),
                  sub: 'días',
                },
                {
                  label: 'Faltas',
                  value: loadingAsistencia ? '…' : (resumenAsistencia?.total_ausentes ?? '—'),
                  sub: 'totales',
                  trend: (resumenAsistencia?.total_ausentes ?? 0) > 5 ? 'down' : 'neutral',
                },
                {
                  label: 'Tardanzas',
                  value: loadingAsistencia ? '…' : (resumenAsistencia?.total_tardanzas ?? '—'),
                  sub: 'registradas',
                  trend: (resumenAsistencia?.total_tardanzas ?? 0) > 3 ? 'down' : 'neutral',
                },
              ]}
              isLoading={loadingAsistencia || loadingHijos}
            >
              {!loadingAsistencia && resumenAsistencia && (
                <MiniAsistenciaBar
                  porcentaje={resumenAsistencia.porcentaje_asistencia_global}
                  color="#3b82f6"
                  isDark={isDark}
                />
              )}
            </ModuleCard>
          </Grid>

          {/* ── CALIFICACIONES ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <ModuleCard
              title="Calificaciones"
              subtitle="Boletín de notas"
              icon={SchoolIcon}
              gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
              glowColor="#2563eb"
              href="/dashboard/padre/calificaciones"
              delay={80}
              badge={
                reprobadas > 0
                  ? { label: `${reprobadas} reprobada${reprobadas > 1 ? 's' : ''}`, color: 'error' }
                  : promedio != null
                    ? { label: `Prom. ${promedio}`, color: promedio >= 51 ? 'success' : 'error' }
                    : undefined
              }
              stats={[
                {
                  label: 'Promedio',
                  value: loadingNotas ? '…' : (promedio ?? '—'),
                  trend: promedio != null ? (promedio >= 51 ? 'up' : 'down') : undefined,
                },
                {
                  label: 'Aprobadas',
                  value: loadingNotas ? '…' : aprobadas,
                  sub: 'materias',
                  trend: aprobadas > 0 ? 'up' : 'neutral',
                },
                {
                  label: 'Pendientes',
                  value: loadingNotas ? '…' : sinNota,
                  sub: 'sin nota',
                  trend: sinNota > 0 ? 'down' : 'neutral',
                },
              ]}
              isLoading={loadingNotas || loadingHijos || loadingPeriodos}
            >
              {/* Mini barra de progreso de materias aprobadas */}
              {!loadingNotas && (aprobadas + reprobadas + sinNota) > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
                      Materias aprobadas
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#2563eb', fontSize: '0.72rem' }}>
                      {aprobadas}/{aprobadas + reprobadas + sinNota}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(aprobadas / (aprobadas + reprobadas + sinNota)) * 100}
                    sx={{
                      height: 6, borderRadius: 3,
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      },
                    }}
                  />
                </Box>
              )}
            </ModuleCard>
          </Grid>

          {/* ── HORARIO ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <ModuleCard
              title="Horario"
              subtitle="Clases y docentes"
              icon={CalendarMonthIcon}
              gradient="linear-gradient(135deg, #0ea5e9, #0284c7)"
              glowColor="#0ea5e9"
              href="/dashboard/padre/horario"
              delay={160}
              badge={
                hijoActivo?.paralelo_nombre
                  ? { label: 'Ver horario', color: 'info' }
                  : undefined
              }
              isLoading={loadingHijos}
            >
              {/* Info básica del hijo */}
              {hijoActivo && !loadingHijos && (
                <Box sx={{
                  p: 1.5, borderRadius: '10px',
                  bgcolor: isDark ? alpha('#0ea5e9', 0.08) : alpha('#0ea5e9', 0.05),
                  border: `1px solid ${alpha('#0ea5e9', isDark ? 0.2 : 0.12)}`,
                  display: 'flex', flexDirection: 'column', gap: 0.8,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                      {hijoActivo.grado_nombre} — Paralelo {hijoActivo.paralelo_nombre}
                    </Typography>
                  </Box>
                  {hijoActivo.turno_nombre && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                        Turno: {hijoActivo.turno_nombre}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.63rem' }}>
                    Tocá para ver el horario completo con todos los docentes
                  </Typography>
                </Box>
              )}
            </ModuleCard>
          </Grid>

          {/* ── SEGUIMIENTO PEDAGÓGICO ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <ModuleCard
              title="Seguimiento Pedagógico"
              subtitle="Observaciones de docentes"
              icon={PsychologyIcon}
              gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
              glowColor="#8b5cf6"
              href="/dashboard/padre/seguimiento"
              delay={240}
              badge={
                (conteosObs?.urgentes ?? 0) > 0
                  ? { label: `${conteosObs!.urgentes} urgente${conteosObs!.urgentes > 1 ? 's' : ''}`, color: 'error' }
                  : (conteosObs?.no_leidas ?? 0) > 0
                    ? { label: `${conteosObs!.no_leidas} sin leer`, color: 'warning' }
                    : (conteosObs?.total ?? 0) > 0
                      ? { label: 'Al día', color: 'success' }
                      : undefined
              }
              stats={[
                {
                  label: 'Total',
                  value: loadingSeguimiento ? '…' : (conteosObs?.total ?? '—'),
                  sub: 'observaciones',
                },
                {
                  label: 'Sin leer',
                  value: loadingSeguimiento ? '…' : (conteosObs?.no_leidas ?? '—'),
                  trend: (conteosObs?.no_leidas ?? 0) > 0 ? 'down' : 'neutral',
                },
                {
                  label: 'Urgentes',
                  value: loadingSeguimiento ? '…' : (conteosObs?.urgentes ?? '—'),
                  trend: (conteosObs?.urgentes ?? 0) > 0 ? 'down' : 'neutral',
                },
                {
                  label: 'Informativos',
                  value: loadingSeguimiento ? '…' : (conteosObs?.informativos ?? '—'),
                },
              ]}
              isLoading={loadingSeguimiento || loadingHijos}
            >
              {/* Alerta urgente inline */}
              {(conteosObs?.urgentes ?? 0) > 0 && !loadingSeguimiento && (
                <Box sx={{
                  p: 1.25, borderRadius: '10px', display: 'flex', gap: 1, alignItems: 'flex-start',
                  bgcolor: isDark ? alpha('#ef4444', 0.12) : alpha('#ef4444', 0.06),
                  border: `1px solid ${alpha('#ef4444', 0.22)}`,
                }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, color: '#ef4444', mt: 0.1, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: isDark ? '#f87171' : '#dc2626', fontWeight: 700, fontSize: '0.68rem' }}>
                    Hay observaciones urgentes que requieren tu confirmación de lectura.
                  </Typography>
                </Box>
              )}
            </ModuleCard>
          </Grid>

          {/* ── TAREAS ── */}
          <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
            <ModuleCard
              title="Tareas y Trabajos"
              subtitle="Entregas y evaluaciones"
              icon={AssignmentIcon}
              gradient="linear-gradient(135deg, #f59e0b, #d97706)"
              glowColor="#f59e0b"
              href="/dashboard/padre/tareas"
              delay={320}
              badge={
                (resumenTareas?.atrasados ?? 0) > 0
                  ? { label: `${resumenTareas!.atrasados} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`, color: 'error' }
                  : (resumenTareas?.pendientes ?? 0) > 0
                    ? { label: `${resumenTareas!.pendientes} pendiente${resumenTareas!.pendientes > 1 ? 's' : ''}`, color: 'warning' }
                    : undefined
              }
              stats={[
                {
                  label: 'Total',
                  value: loadingTareas ? '…' : (resumenTareas?.total ?? '—'),
                  sub: 'tareas',
                },
                {
                  label: 'Pendientes',
                  value: loadingTareas ? '…' : (resumenTareas?.pendientes ?? '—'),
                  trend: (resumenTareas?.pendientes ?? 0) > 0 ? 'down' : 'neutral',
                },
                {
                  label: 'Entregadas',
                  value: loadingTareas ? '…' : (resumenTareas?.entregados ?? '—'),
                  trend: (resumenTareas?.entregados ?? 0) > 0 ? 'up' : 'neutral',
                },
                {
                  label: 'Atrasadas',
                  value: loadingTareas ? '…' : (resumenTareas?.atrasados ?? '—'),
                  trend: (resumenTareas?.atrasados ?? 0) > 0 ? 'down' : 'neutral',
                },
              ]}
              isLoading={loadingTareas || loadingHijos}
            >
              {/* Mini barra progreso de tareas */}
              {!loadingTareas && (resumenTareas?.total ?? 0) > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
                      Progreso de entrega
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#f59e0b', fontSize: '0.72rem' }}>
                      {resumenTareas!.entregados}/{resumenTareas!.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(resumenTareas!.entregados / resumenTareas!.total) * 100}
                    sx={{
                      height: 6, borderRadius: 3,
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      },
                    }}
                  />
                </Box>
              )}
            </ModuleCard>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}