'use client';
// app/dashboard/estudiante/home/page.tsx
// Página principal del portal estudiantil con estética institucional unificada

import React, { useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
  Paper, LinearProgress, Grid, Button, Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// Hooks
import { useAuth } from '@/context/AuthContext';
import {
  usePerfilEstudiante,
  usePeriodosEstudiante,
  useMisMaterias,
  useBoletinEstudiante,
  useTareasEstudiante,
  useAsistenciaEstudiante,
  useHorarioEstudiante,
} from '@/hooks/useEstudiante';

// ─────────────────────────────────────────────────────────────
// ANIMACIONES Y KEYFRAMES
// ─────────────────────────────────────────────────────────────

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.35; transform: scale(0.9); }
`;

const ticker = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// ─────────────────────────────────────────────────────────────
// PALETA DINÁMICA DUAL (IDÉNTICA A TAREAS Y EXÁMENES)
// ─────────────────────────────────────────────────────────────

const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';
  return { theme, isDark, accentColor, accentColorEnd, gradBg, textOnAccent };
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const saludoData = (): { texto: string; emoji: string; Icon: React.ElementType } => {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Buenos días', emoji: '☀️', Icon: WbSunnyIcon };
  if (h < 19) return { texto: 'Buenas tardes', emoji: '🌤️', Icon: WbSunnyIcon };
  return { texto: 'Buenas noches', emoji: '🌙', Icon: NightsStayIcon };
};

// ─────────────────────────────────────────────────────────────
// SELECTOR DE TRIMESTRE (ESTILO INSTITUCIONAL DE TAREAS)
// ─────────────────────────────────────────────────────────────

interface SelectorTrimestreProps {
  periodos: { id: number; nombre: string; fecha_inicio?: string; fecha_fin?: string }[];
  periodoActivo: number | null;
  onChange: (id: number) => void;
  isLoading: boolean;
  accentColor: string;
  isDark: boolean;
}

const SelectorTrimestre: React.FC<SelectorTrimestreProps> = ({
  periodos,
  periodoActivo,
  onChange,
  isLoading,
  accentColor,
  isDark,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" width={130} height={36} sx={{ borderRadius: '12px' }} />
        ))}
      </Box>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {periodos.map(p => {
        const isSelected = p.id === periodoActivo;
        const esVigente = Boolean(p.fecha_inicio && p.fecha_fin && p.fecha_inicio <= hoy && p.fecha_fin >= hoy);

        return (
          <Chip
            key={p.id}
            clickable
            onClick={() => onChange(p.id)}
            icon={esVigente ? <VerifiedIcon sx={{ fontSize: '15px !important' }} /> : undefined}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>{p.nombre}</span>
                {esVigente && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      px: 0.7,
                      py: 0.1,
                      borderRadius: '6px',
                      bgcolor: isSelected ? (isDark ? '#000' : '#fff') : accentColor,
                      color: isSelected ? accentColor : (isDark ? '#000' : '#fff'),
                    }}
                  >
                    ACTIVO
                  </Box>
                )}
              </Box>
            }
            sx={{
              height: 38,
              px: 1.2,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
              backgroundColor: isSelected
                ? accentColor
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
              color: isSelected ? (isDark ? '#000' : '#fff') : 'text.primary',
              border: `1.5px solid ${isSelected ? accentColor : alpha(isDark ? '#fff' : '#000', 0.08)}`,
              boxShadow: isSelected ? `0 4px 14px ${alpha(accentColor, 0.3)}` : 'none',
              '& .MuiChip-icon': {
                color: isSelected ? (isDark ? '#000' : '#fff') : accentColor,
              },
              '&:hover': {
                backgroundColor: isSelected ? accentColor : alpha(accentColor, 0.12),
                borderColor: accentColor,
                transform: 'translateY(-1px)',
              },
            }}
          />
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// KPI CARD MODERNO (IDÉNTICO A TAREAS Y EVALUACIONES)
// ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  icon: React.ElementType;
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  color,
  icon: Icon,
  delay = 0,
  trend,
  loading,
  onClick,
}) => {
  const { isDark } = usePalette();

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: { xs: 1.8, sm: 2.2 },
        borderRadius: '16px',
        border: `2px solid ${alpha(color, isDark ? 0.28 : 0.2)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, rgba(15, 23, 42, 0.75) 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, #ffffff 100%)`,
        boxShadow: isDark
          ? `0 6px 20px rgba(0,0,0,0.35)`
          : `0 3px 12px ${alpha(color, 0.08)}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeUp} 0.4s ease-out ${delay}ms both`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-3px)',
          borderColor: color,
          boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
        } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, 0.16),
            color: color,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend === 'up' && <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />}
            {trend === 'down' && <TrendingDownIcon sx={{ fontSize: 20, color: '#ef4444' }} />}
          </Box>
        )}
      </Box>

      {loading ? (
        <>
          <Skeleton variant="text" width={60} height={42} />
          <Skeleton variant="text" width={100} height={18} />
        </>
      ) : (
        <>
          <Typography
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: color,
              mb: 0.4,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {label}
          </Typography>

          {sublabel && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                color: 'text.disabled',
                fontWeight: 600,
                mt: 0.3,
                display: 'block',
              }}
            >
              {sublabel}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// TARJETA DE MÓDULO (ESTILO INSTITUCIONAL CON GLASSMORPHISM)
// ─────────────────────────────────────────────────────────────

interface ModuloCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  accentColor: string;
  href: string;
  delay?: number;
  stats?: { label: string; value: string | number; color?: string }[];
  progressBar?: { value: number; label?: string };
  actionLabel?: string;
  loading?: boolean;
}

const ModuloCard: React.FC<ModuloCardProps> = ({
  title,
  subtitle,
  badge,
  badgeColor,
  icon: Icon,
  accentColor,
  href,
  delay = 0,
  stats = [],
  progressBar,
  actionLabel = 'Ingresar al módulo',
  loading,
}) => {
  const router = useRouter();
  const { isDark } = usePalette();

  return (
    <Paper
      elevation={0}
      onClick={() => router.push(href)}
      sx={{
        p: { xs: 2.2, sm: 2.8 },
        borderRadius: '20px',
        border: `1.5px solid ${alpha(accentColor, isDark ? 0.22 : 0.16)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(accentColor, 0.08)} 0%, rgba(15, 23, 42, 0.8) 100%)`
          : `linear-gradient(135deg, ${alpha(accentColor, 0.05)} 0%, #ffffff 100%)`,
        boxShadow: isDark
          ? '0 8px 28px rgba(0,0,0,0.3)'
          : `0 4px 16px ${alpha(accentColor, 0.08)}`,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeUp} 0.45s ease-out ${delay}ms both`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: accentColor,
          boxShadow: `0 12px 32px ${alpha(accentColor, isDark ? 0.25 : 0.18)}`,
          '& .btn-arrow': {
            transform: 'translateX(4px)',
            color: accentColor,
          },
        },
      }}
    >
      {/* ── Barra decorativa superior ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.2)})`,
        }}
      />

      <Box>
        {/* ── Encabezado de la tarjeta ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(accentColor, 0.15),
                color: accentColor,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.25, letterSpacing: -0.3 }}
              >
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.2, fontWeight: 500 }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>

          {badge && (
            <Chip
              size="small"
              label={badge}
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 800,
                borderRadius: '8px',
                bgcolor: alpha(badgeColor || accentColor, 0.15),
                color: badgeColor || accentColor,
                border: `1px solid ${alpha(badgeColor || accentColor, 0.35)}`,
              }}
            />
          )}
        </Box>

        {/* ── Métricas internas ── */}
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2, my: 1.5 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={70} height={36} />)}
          </Box>
        ) : stats.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              gap: 1.2,
              p: 1.5,
              borderRadius: '14px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
              mb: progressBar ? 1.8 : 1,
            }}
          >
            {stats.map((s, idx) => (
              <Box key={idx} sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: s.color || accentColor,
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', mt: 0.2, display: 'block' }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : null}

        {/* ── Barra de Progreso Opcional ── */}
        {progressBar && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.72rem' }}>
                {progressBar.label || 'Progreso de avance'}
              </Typography>
              <Typography variant="caption" fontWeight={900} sx={{ color: accentColor, fontSize: '0.75rem' }}>
                {progressBar.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(progressBar.value, 0), 100)}
              sx={{
                height: 7,
                borderRadius: 4,
                bgcolor: alpha(accentColor, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.6)})`,
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── Pie con botón de acceso ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.8,
          mt: 'auto',
          borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            fontSize: '0.82rem',
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
          }}
        >
          {actionLabel}
        </Typography>

        <IconButton
          size="small"
          className="btn-arrow"
          sx={{
            bgcolor: alpha(accentColor, 0.1),
            color: accentColor,
            transition: 'all 0.25s ease',
            p: 0.8,
            borderRadius: '10px',
          }}
        >
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// TICKER DINÁMICO DE EVALUACIONES PRÓXIMAS
// ─────────────────────────────────────────────────────────────

interface TickerItem {
  evaluacion_id: number;
  evaluacion_nombre: string;
  materia_nombre: string;
  dias_restantes: number | null | undefined;
}

const TickerProximas: React.FC<{
  tareas: TickerItem[];
  isDark: boolean;
  onItemClick: (id: number) => void;
}> = ({ tareas, isDark, onItemClick }) => {
  if (tareas.length === 0) return null;
  const items = [...tareas, ...tareas]; // duplicar para flujo infinito

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: '14px',
        border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
        background: isDark ? alpha('#f59e0b', 0.08) : alpha('#f59e0b', 0.05),
        display: 'flex',
        alignItems: 'center',
        height: 40,
      }}
    >
      <Box
        sx={{
          px: 1.8,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          bgcolor: isDark ? alpha('#f59e0b', 0.22) : alpha('#f59e0b', 0.15),
          borderRight: `1px solid ${alpha('#f59e0b', 0.3)}`,
          flexShrink: 0,
        }}
      >
        <BoltIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
        <Typography variant="caption" fontWeight={800} sx={{ color: '#f59e0b', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
          Por Vencer
        </Typography>
      </Box>

      <Box sx={{ overflow: 'hidden', flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3.5,
            animation: `${ticker} ${Math.max(tareas.length * 6, 15)}s linear infinite`,
            width: 'max-content',
            px: 2,
            cursor: 'pointer',
          }}
        >
          {items.map((t, i) => (
            <Box
              key={i}
              onClick={() => onItemClick(t.evaluacion_id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem', color: 'text.primary' }}>
                {t.evaluacion_nombre}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                ({t.materia_nombre})
              </Typography>
              {t.dias_restantes != null && (
                <Chip
                  size="small"
                  label={t.dias_restantes === 0 ? '¡Vence hoy!' : t.dias_restantes === 1 ? 'Mañana' : `${t.dias_restantes} días`}
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: t.dias_restantes <= 1 ? alpha('#ef4444', 0.18) : alpha('#f59e0b', 0.18),
                    color: t.dias_restantes <= 1 ? '#ef4444' : '#f59e0b',
                    borderRadius: '6px',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// HERO PRINCIPAL DEL ESTUDIANTE (CON IDENTIDAD DE TAREAS/EXÁMENES)
// ─────────────────────────────────────────────────────────────

interface HeroProps {
  perfil: any;
  accentColor: string;
  gradBg: string;
  isDark: boolean;
  onRefresh: () => void;
  loading: boolean;
  alertas: { tipo: 'err' | 'warn'; mensaje: string }[];
}

const HeroEstudiante: React.FC<HeroProps> = ({
  perfil,
  accentColor,
  gradBg,
  isDark,
  onRefresh,
  loading,
  alertas,
}) => {
  const { texto, emoji } = saludoData();
  const iniciales = perfil?.nombres?.charAt(0) ?? '?';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: { xs: 2.2, sm: 3 },
        borderRadius: '22px',
        border: `1.5px solid ${alpha(accentColor, isDark ? 0.28 : 0.2)}`,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(accentColor, 0.12)} 0%, rgba(15, 23, 42, 0.85) 100%)`
          : `linear-gradient(135deg, ${alpha(accentColor, 0.07)} 0%, #ffffff 100%)`,
        boxShadow: isDark
          ? `0 10px 30px rgba(0,0,0,0.4)`
          : `0 6px 20px ${alpha(accentColor, 0.08)}`,
        animation: `${fadeUp} 0.45s ease-out both`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
        }}
      >
        {/* IZQUIERDA: AVATAR Y DATOS DEL ESTUDIANTE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.2, minWidth: 0 }}>
          {loading ? (
            <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
          ) : (
            <Avatar
              src={perfil?.foto_url ?? undefined}
              sx={{
                width: { xs: 58, sm: 68 },
                height: { xs: 58, sm: 68 },
                fontWeight: 900,
                fontSize: { xs: '1.4rem', sm: '1.7rem' },
                bgcolor: alpha(accentColor, 0.2),
                color: accentColor,
                border: `2.5px solid ${accentColor}`,
                boxShadow: `0 4px 16px ${alpha(accentColor, 0.3)}`,
                flexShrink: 0,
              }}
            >
              {iniciales}
            </Avatar>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <SchoolIcon
                sx={{
                  color: accentColor,
                  fontSize: 22,
                  animation: `${bounce} 2s infinite ease-in-out`,
                }}
              />
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: 'text.secondary',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                }}
              >
                {emoji} {texto}
              </Typography>
            </Box>

            {loading ? (
              <>
                <Skeleton variant="text" width={220} height={36} />
                <Skeleton variant="text" width={180} height={22} />
              </>
            ) : (
              <>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.2rem' },
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    lineHeight: 1.15,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {perfil?.nombres ?? 'Estudiante'} {perfil?.apellidos ?? ''}
                </Typography>

                {/* Chips de Curso, Paralelo, Turno, etc. */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
                  {perfil?.grado_nombre && (
                    <Chip
                      size="small"
                      label={`${perfil.grado_nombre} "${perfil.paralelo_nombre || 'A'}"`}
                      sx={{
                        height: 24,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: alpha(accentColor, 0.16),
                        color: accentColor,
                        border: `1px solid ${alpha(accentColor, 0.3)}`,
                        borderRadius: '8px',
                      }}
                    />
                  )}

                  {perfil?.nivel_academico && (
                    <Chip
                      size="small"
                      label={perfil.nivel_academico}
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                        borderRadius: '8px',
                      }}
                    />
                  )}

                  {perfil?.turno && (
                    <Chip
                      size="small"
                      label={`Turno ${perfil.turno}`}
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                        borderRadius: '8px',
                      }}
                    />
                  )}

                  {perfil?.es_becado && (
                    <Chip
                      size="small"
                      icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label="Becado"
                      sx={{
                        height: 24,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: alpha('#8b5cf6', 0.18),
                        color: '#a78bfa',
                        border: `1px solid ${alpha('#8b5cf6', 0.35)}`,
                        borderRadius: '8px',
                        '& .MuiChip-icon': { color: '#a78bfa' },
                      }}
                    />
                  )}

                  {perfil?.codigo_estudiante && (
                    <Chip
                      size="small"
                      label={`ID ${perfil.codigo_estudiante}`}
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* DERECHA: ALERTAS ACTIVAS Y BOTÓN DE REFRESH */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', alignSelf: { xs: 'stretch', md: 'center' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
          {alertas.length > 0 && (
            <Stack direction="row" spacing={1}>
              {alertas.map((a, idx) => (
                <Chip
                  key={idx}
                  icon={a.tipo === 'err' ? <WarningAmberIcon sx={{ fontSize: '15px !important' }} /> : <AccessTimeIcon sx={{ fontSize: '15px !important' }} />}
                  label={a.mensaje}
                  size="small"
                  sx={{
                    height: 32,
                    fontWeight: 800,
                    fontSize: 12,
                    bgcolor: a.tipo === 'err' ? (isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1)) : (isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1)),
                    color: a.tipo === 'err' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#fbbf24' : '#d97706'),
                    border: `1.5px solid ${alpha(a.tipo === 'err' ? '#ef4444' : '#f59e0b', 0.35)}`,
                    borderRadius: '10px',
                    '& .MuiChip-icon': { color: a.tipo === 'err' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#fbbf24' : '#d97706') },
                  }}
                />
              ))}
            </Stack>
          )}

          <Tooltip title="Actualizar datos académicos">
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{
                borderRadius: '14px',
                border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.06),
                color: accentColor,
                p: 1.2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(accentColor, 0.2),
                  transform: 'rotate(180deg)',
                },
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function EstudianteHomePage() {
  const router = useRouter();
  const { isDark, accentColor, gradBg } = usePalette();

  // ── Hooks de datos ──
  const { perfil, isLoading: loadingPerfil } = usePerfilEstudiante();
  const {
    periodos,
    periodoActivo,
    setPeriodoActivo,
    isLoading: loadingPeriodos,
  } = usePeriodosEstudiante();

  const {
    materias,
    isLoading: loadingMaterias,
    refrescar: refrescarMaterias,
  } = useMisMaterias(periodoActivo ?? undefined);

  const {
    boletin,
    aprobadas,
    reprobadas,
    promedio,
    isLoading: loadingBoletin,
    refrescar: refrescarBoletin,
  } = useBoletinEstudiante(periodoActivo);

  const {
    resumen: resumenTareas,
    proximasAvencer,
    isLoading: loadingTareas,
    refrescar: refrescarTareas,
  } = useTareasEstudiante({ periodo_evaluacion_id: periodoActivo ?? undefined });

  const {
    reporte: reporteAsistencia,
    isLoading: loadingAsistencia,
    refrescar: refrescarAsistencia,
  } = useAsistenciaEstudiante();

  const {
    horario,
    isLoading: loadingHorario,
    refrescar: refrescarHorario,
  } = useHorarioEstudiante();

  // Función global para actualizar toda la información
  const handleRefreshAll = useCallback(() => {
    refrescarMaterias();
    refrescarBoletin();
    refrescarTareas();
    refrescarAsistencia();
    refrescarHorario();
  }, [refrescarMaterias, refrescarBoletin, refrescarTareas, refrescarAsistencia, refrescarHorario]);

  // ── Estadísticas y estados calculados ──

  // Asistencia global acumulada
  const asistenciaGlobal = useMemo(() => {
    if (!reporteAsistencia.length) return null;
    const sum = reporteAsistencia.reduce((a, r) => a + (r.porcentaje_asistencia ?? 0), 0);
    return Math.round(sum / reporteAsistencia.length);
  }, [reporteAsistencia]);

  // Materias con asistencia comprometida (< 75%)
  const materiasRiesgoAsistencia = useMemo(
    () => reporteAsistencia.filter(r => r.porcentaje_asistencia < 75).length,
    [reporteAsistencia]
  );

  // Progreso promedio de los temarios de las materias
  const progresoTemario = useMemo(() => {
    if (!materias.length) return 0;
    const sum = materias.reduce((a, m) => a + (m.progreso_promedio ?? 0), 0);
    return Math.round(sum / materias.length);
  }, [materias]);

  // Total de materiales académicos disponibles
  const totalMateriales = useMemo(() => {
    return materias.reduce((acc, m) => acc + (m.total_materiales || 0), 0);
  }, [materias]);

  // Identificar si el estudiante tiene una clase presencial/virtual en curso en este momento
  const claseAhora = useMemo(() => {
    if (!horario) return null;
    const hoy = new Date().getDay(); // 0=Dom, 1=Lun ... 6=Sab
    if (hoy === 0 || hoy === 6) return null;
    const diaData = horario.grilla.find(d => d.dia_numero === hoy);
    if (!diaData) return null;
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    return diaData.bloques.find(b => {
      if (b.es_recreo || !b.materia_nombre) return false;
      const [hh, mm] = (b.hora_inicio ?? '0:0').split(':').map(Number);
      const [eh, em] = (b.hora_fin ?? '0:0').split(':').map(Number);
      return (hh * 60 + mm) <= ahora && ahora < (eh * 60 + em);
    }) ?? null;
  }, [horario]);

  // Resumen de alertas para el Header
  const alertasHeader = useMemo(() => {
    const list: { tipo: 'err' | 'warn'; mensaje: string }[] = [];
    if ((resumenTareas?.atrasados ?? 0) > 0) {
      list.push({
        tipo: 'err',
        mensaje: `${resumenTareas.atrasados} atrasada${resumenTareas.atrasados > 1 ? 's' : ''}`,
      });
    }
    if (proximasAvencer && proximasAvencer.length > 0) {
      list.push({
        tipo: 'warn',
        mensaje: `${proximasAvencer.length} por vencer`,
      });
    }
    return list;
  }, [resumenTareas, proximasAvencer]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══ 1. HERO INSTITUCIONAL ══ */}
        <HeroEstudiante
          perfil={perfil}
          accentColor={accentColor}
          gradBg={gradBg}
          isDark={isDark}
          onRefresh={handleRefreshAll}
          loading={loadingPerfil}
          alertas={alertasHeader}
        />

        {/* ══ 2. SELECTOR DE TRIMESTRE (PANEL ESTILO TAREAS) ══ */}
        {periodos.length > 0 && (
          <Fade in timeout={350}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                p: 1.6,
                mb: 3,
                borderRadius: '18px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.07)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 22, color: accentColor }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                  Trimestre de evaluación:
                </Typography>
              </Box>

              <SelectorTrimestre
                periodos={periodos}
                periodoActivo={periodoActivo}
                onChange={setPeriodoActivo}
                isLoading={loadingPeriodos}
                accentColor={accentColor}
                isDark={isDark}
              />
            </Box>
          </Fade>
        )}

        {/* ══ 3. CLASE EN CURSO AHORA (SI APLICA) ══ */}
        {claseAhora && (
          <Fade in timeout={400}>
            <Paper
              elevation={0}
              onClick={() => router.push('/dashboard/estudiante/horario')}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                gap: 2,
                border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                  : `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, #ffffff 100%)`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha('#10b981', 0.25)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={900}
                    sx={{
                      color: '#10b981',
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      display: 'block',
                    }}
                  >
                    Clase en curso ahora
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {claseAhora.etiqueta_personalizada || claseAhora.materia_nombre}
                    {claseAhora.aula && (
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, ml: 1, fontSize: '0.85rem' }}>
                        · Aula {claseAhora.aula}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: '#10b981', fontSize: '0.82rem' }}>
                  {claseAhora.hora_inicio?.slice(0, 5)} – {claseAhora.hora_fin?.slice(0, 5)}
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 16, color: '#10b981', ml: 0.5 }} />
              </Box>
            </Paper>
          </Fade>
        )}

        {/* ══ 4. TICKER DE PRÓXIMAS ACTIVIDADES Y EXÁMENES ══ */}
        {proximasAvencer.length > 0 && !loadingTareas && (
          <Box sx={{ mb: 3 }}>
            <TickerProximas
              tareas={proximasAvencer.map(t => ({
                evaluacion_id: t.evaluacion_id,
                evaluacion_nombre: t.evaluacion_nombre,
                materia_nombre: t.materia_nombre,
                dias_restantes: t.dias_restantes,
              }))}
              isDark={isDark}
              onItemClick={(id) => router.push(`/dashboard/estudiante/tareas/${id}`)}
            />
          </Box>
        )}

        {/* ══ 5. KPIS ACADÉMICOS (ESTILO TAREAS Y EVALUACIONES) ══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Promedio General */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <KpiCard
              label="Promedio General"
              value={promedio != null ? promedio : '—'}
              sublabel={promedio >= 70 ? 'Rendimiento sobresaliente' : promedio >= 51 ? 'Aprobado regular' : 'Requiere refuerzo'}
              color={promedio == null ? (isDark ? '#9ca3af' : '#6b7280') : promedio >= 70 ? '#10b981' : promedio >= 51 ? '#f59e0b' : '#ef4444'}
              icon={SchoolIcon}
              trend={promedio != null ? (promedio >= 70 ? 'up' : 'down') : undefined}
              loading={loadingBoletin}
              onClick={() => router.push('/dashboard/estudiante/notas')}
              delay={0}
            />
          </Grid>

          {/* Tareas & Evaluaciones */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <KpiCard
              label="Tareas Pendientes"
              value={resumenTareas?.pendientes ?? '0'}
              sublabel={`${resumenTareas?.entregados ?? 0} entregadas de ${resumenTareas?.total ?? 0}`}
              color="#f59e0b"
              icon={AssignmentIcon}
              loading={loadingTareas}
              onClick={() => router.push('/dashboard/estudiante/tareas')}
              delay={60}
            />
          </Grid>

          {/* Asistencia Global */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <KpiCard
              label="Asistencia Global"
              value={asistenciaGlobal != null ? `${asistenciaGlobal}%` : '—'}
              sublabel={asistenciaGlobal != null && asistenciaGlobal >= 85 ? 'Asistencia regular y óptima' : materiasRiesgoAsistencia > 0 ? `${materiasRiesgoAsistencia} materias con faltas` : 'Registro actualizado'}
              color={asistenciaGlobal == null ? '#3b82f6' : asistenciaGlobal >= 85 ? '#10b981' : asistenciaGlobal >= 75 ? '#3b82f6' : '#ef4444'}
              icon={EventAvailableIcon}
              loading={loadingAsistencia}
              onClick={() => router.push('/dashboard/estudiante/asistencia')}
              delay={120}
            />
          </Grid>

          {/* Progreso del Temario / Materias */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <KpiCard
              label="Avance del Temario"
              value={`${progresoTemario}%`}
              sublabel={`${materias.length} materias activas`}
              color="#8b5cf6"
              icon={AutoStoriesIcon}
              loading={loadingMaterias}
              onClick={() => router.push('/dashboard/estudiante/materias')}
              delay={180}
            />
          </Grid>
        </Grid>

        {/* ══ 6. GRID DE MÓDULOS PRINCIPALES (TARJETAS GLASSMORPHISM) ══ */}
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            fontSize: '1.15rem',
            letterSpacing: -0.3,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: accentColor,
            }}
          />
          Módulos y Actividades Académicas
        </Typography>

        <Grid container spacing={2.5} sx={{ pb: 4 }}>
          {/* MÓDULO: TAREAS Y ACTIVIDADES */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Tareas y Actividades"
              subtitle="Entregas de trabajos prácticos y tareas"
              badge={
                (resumenTareas?.atrasados ?? 0) > 0
                  ? `${resumenTareas.atrasados} atrasadas`
                  : (resumenTareas?.pendientes ?? 0) > 0
                    ? `${resumenTareas.pendientes} pendientes`
                    : 'Al día'
              }
              badgeColor={(resumenTareas?.atrasados ?? 0) > 0 ? '#ef4444' : (resumenTareas?.pendientes ?? 0) > 0 ? '#f59e0b' : '#10b981'}
              icon={AssignmentIcon}
              accentColor="#f59e0b"
              href="/dashboard/estudiante/tareas"
              delay={0}
              loading={loadingTareas}
              stats={[
                { label: 'Total', value: resumenTareas?.total ?? 0 },
                { label: 'Pendientes', value: resumenTareas?.pendientes ?? 0, color: '#f59e0b' },
                { label: 'Entregadas', value: resumenTareas?.entregados ?? 0, color: '#10b981' },
              ]}
              progressBar={
                resumenTareas?.total
                  ? {
                    value: Math.round((resumenTareas.entregados / resumenTareas.total) * 100),
                    label: 'Tasa de entregas completadas',
                  }
                  : undefined
              }
              actionLabel="Ver mis tareas asignadas"
            />
          </Grid>

          {/* MÓDULO: EXÁMENES VIRTUALES Y QUIZZES */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Exámenes y Quizzes"
              subtitle="Evaluaciones en línea y pruebas virtuales"
              badge="En línea"
              badgeColor="#ec4899"
              icon={ComputerRoundedIcon}
              accentColor="#ec4899"
              href="/dashboard/estudiante/tareas"
              delay={60}
              loading={loadingTareas}
              stats={[
                { label: 'Modalidad', value: 'Virtual', color: '#ec4899' },
                { label: 'Corrección', value: 'Gemini IA', color: '#8b5cf6' },
                { label: 'Alertas', value: proximasAvencer.length, color: '#ec4899' },
              ]}
              progressBar={{
                value: 100,
                label: 'Plataforma de evaluación lista',
              }}
              actionLabel="Ir a exámenes y evaluaciones"
            />
          </Grid>

          {/* MÓDULO: BOLETÍN Y NOTAS */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Calificaciones y Boletín"
              subtitle="Dimensiones Ser, Saber, Hacer, Decidir"
              badge={reprobadas > 0 ? `${reprobadas} en riesgo` : promedio != null ? `Promedio ${promedio}` : undefined}
              badgeColor={reprobadas > 0 ? '#ef4444' : '#10b981'}
              icon={SchoolIcon}
              accentColor="#10b981"
              href="/dashboard/estudiante/notas"
              delay={120}
              loading={loadingBoletin}
              stats={[
                { label: 'Promedio', value: promedio ?? '—', color: '#10b981' },
                { label: 'Aprobadas', value: aprobadas, color: '#10b981' },
                { label: 'Reprobadas', value: reprobadas, color: reprobadas > 0 ? '#ef4444' : '#6b7280' },
              ]}
              progressBar={
                materias.length > 0
                  ? {
                    value: Math.round((aprobadas / materias.length) * 100),
                    label: 'Porcentaje de aprobación',
                  }
                  : undefined
              }
              actionLabel="Consultar libreta de notas"
            />
          </Grid>

          {/* MÓDULO: MIS MATERIAS Y MATERIALES */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Mis Materias y Temario"
              subtitle="Recursos de estudio, bibliografía y unidades"
              badge={`${materias.length} asignaturas`}
              badgeColor="#8b5cf6"
              icon={AutoStoriesIcon}
              accentColor="#8b5cf6"
              href="/dashboard/estudiante/materias"
              delay={180}
              loading={loadingMaterias}
              stats={[
                { label: 'Materias', value: materias.length },
                { label: 'Materiales', value: totalMateriales, color: '#8b5cf6' },
                { label: 'Avance', value: `${progresoTemario}%`, color: '#10b981' },
              ]}
              progressBar={{
                value: progresoTemario,
                label: 'Avance global de los temas',
              }}
              actionLabel="Explorar materias y temas"
            />
          </Grid>

          {/* MÓDULO: ASISTENCIA */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Registro de Asistencia"
              subtitle="Puntualidad, atrasos y justificaciones"
              badge={asistenciaGlobal != null && asistenciaGlobal >= 85 ? 'Óptima' : materiasRiesgoAsistencia > 0 ? `${materiasRiesgoAsistencia} bajas` : undefined}
              badgeColor={asistenciaGlobal != null && asistenciaGlobal >= 85 ? '#10b981' : '#ef4444'}
              icon={EventAvailableIcon}
              accentColor="#3b82f6"
              href="/dashboard/estudiante/asistencia"
              delay={240}
              loading={loadingAsistencia}
              stats={[
                { label: 'Presente', value: reporteAsistencia.reduce((a, r) => a + r.presentes, 0), color: '#10b981' },
                { label: 'Faltas', value: reporteAsistencia.reduce((a, r) => a + r.ausentes, 0), color: '#ef4444' },
                { label: 'Tardanzas', value: reporteAsistencia.reduce((a, r) => a + r.tardanzas, 0), color: '#f59e0b' },
              ]}
              progressBar={
                asistenciaGlobal != null
                  ? {
                    value: asistenciaGlobal,
                    label: 'Porcentaje global de asistencia',
                  }
                  : undefined
              }
              actionLabel="Revisar detalle de asistencias"
            />
          </Grid>

          {/* MÓDULO: HORARIO ESCOLAR */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuloCard
              title="Mi Horario Escolar"
              subtitle="Distribución semanal de períodos de clase"
              badge={claseAhora ? 'En clase ahora' : horario ? `${horario.total_celdas} clases/sem` : undefined}
              badgeColor={claseAhora ? '#10b981' : accentColor}
              icon={CalendarMonthIcon}
              accentColor={accentColor}
              href="/dashboard/estudiante/horario"
              delay={300}
              loading={loadingHorario}
              stats={[
                { label: 'Días', value: horario?.grilla.length ?? 5 },
                { label: 'Clases/Sem', value: horario?.total_celdas ?? 0, color: accentColor },
                { label: 'Estado', value: claseAhora ? 'En curso' : 'Libre', color: claseAhora ? '#10b981' : '#6b7280' },
              ]}
              actionLabel="Ver grilla horaria semanal"
            />
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}