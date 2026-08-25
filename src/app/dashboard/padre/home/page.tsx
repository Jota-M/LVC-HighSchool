'use client';
// app/dashboard/padre/home/page.tsx

import React, { useCallback } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
  Grid, Paper, LinearProgress, Divider, Badge, keyframes,
} from '@mui/material';
import { useRouter } from 'next/navigation';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Hooks
import { useAuth } from '@/context/AuthContext';
import { useHijosDelPadre } from '@/hooks/usePadreAsistencia';
import { useResumenAsistencia } from '@/hooks/usePadreAsistencia';
import { usePeriodosEvaluacion, useBoletinNotas } from '@/hooks/usePadreNotas';
import { useTareasHijo } from '@/hooks/usePadreTareas';
import { useObservacionesHijo } from '@/hooks/useSeguimientoPadre';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const saludo = (): { texto: string; Icon: React.ElementType } => {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Buenos días', Icon: WbSunnyIcon };
  if (h < 19) return { texto: 'Buenas tardes', Icon: WbSunnyIcon };
  return { texto: 'Buenas noches', Icon: NightsStayIcon };
};

// ─────────────────────────────────────────────────────────────
// SELECTOR DE HIJO — mismo patrón que HijoCard de /padre/horario
// ─────────────────────────────────────────────────────────────

interface SelectorHijoProps {
  hijos: any[];
  hijoActivo: any;
  onSeleccionar: (h: any) => void;
  isLoading: boolean;
  accentColor: string;
  isDark: boolean;
}

const SelectorHijo: React.FC<SelectorHijoProps> = ({ hijos, hijoActivo, onSeleccionar, isLoading, accentColor, isDark }) => {
  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
      {[1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" width={170} height={80} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
  );

  if (hijos.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {hijos.map((h) => {
        const activo = h.estudiante_id === hijoActivo?.estudiante_id;
        const iniciales = `${h.nombres?.charAt(0) ?? ''}${h.apellidos?.charAt(0) ?? ''}`.toUpperCase();

        return (
          <Box
            key={h.estudiante_id}
            onClick={() => onSeleccionar(h)}
            sx={{
              cursor: 'pointer',
              p: 1.5,
              borderRadius: 3,
              minWidth: { xs: 140, sm: 170 },
              maxWidth: { xs: 160, sm: 200 },
              border: `2px solid ${activo ? accentColor : alpha(accentColor, 0.15)}`,
              bgcolor: activo
                ? isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.07)
                : isDark ? '#ffffff06' : '#fafafa',
              transition: 'all 0.18s',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: accentColor,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(accentColor, 0.18)}`,
              },
            }}
          >
            {activo && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: accentColor, borderRadius: '12px 12px 0 0' }} />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <CheckCircleIcon sx={{ fontSize: 12, color: '#10b981', bgcolor: isDark ? '#1a1a1a' : '#fff', borderRadius: '50%' }} />
                }
              >
                <Avatar
                  src={h.foto_url ?? undefined}
                  sx={{
                    width: 38, height: 38,
                    bgcolor: activo ? accentColor : alpha(accentColor, 0.2),
                    color: activo ? (isDark ? '#000' : '#fff') : accentColor,
                    fontWeight: 800, fontSize: '0.9rem',
                  }}
                >
                  {iniciales}
                </Avatar>
              </Badge>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, color: activo ? accentColor : 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {h.nombres.split(' ')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2, display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {h.apellidos}
                </Typography>
                {h.grado_nombre && (
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: accentColor, fontWeight: 600, lineHeight: 1 }}>
                    {h.grado_nombre} "{h.paralelo_nombre}"
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// MODULE CARD — Paper con gradiente/borde accentColor, como los paneles de horario
// ─────────────────────────────────────────────────────────────

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
  accentColor: string;
  isDark: boolean;
  delay?: number;
  badge?: { label: string; color: 'warning' | 'error' | 'success' | 'info' };
  stats?: { label: string; value: string | number; color?: string; trend?: 'up' | 'down' | 'neutral' }[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title, subtitle, icon: Icon, href, accentColor, isDark, delay = 0, badge, stats = [], isLoading, children,
}) => {
  const router = useRouter();

  const badgePalette = {
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#10b981',
    info: '#3b82f6',
  };
  const badgeColor = badge ? badgePalette[badge.color] : null;

  const accentColor2 = isDark ? '#f59e0b' : '#01579b';

  return (
    <Paper
      onClick={() => router.push(href)}
      sx={{
        p: 3.5,
        borderRadius: 3.5,
        cursor: 'pointer',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(accentColor, isDark ? 0.2 : 0.15)}`,
        background: isDark
          ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
          : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
        boxShadow: isDark
          ? '0 4px 18px rgba(0,0,0,0.3)'
          : `0 4px 18px ${alpha(accentColor, 0.08)}`,
        transition: 'all 0.2s',
        animation: `fadeUp 0.4s ease-out ${delay}ms both`,
        '@keyframes fadeUp': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          borderColor: accentColor,
          transform: 'translateY(-4px)',
          boxShadow: `0 14px 34px ${alpha(accentColor, 0.22)}`,
          '& .arrow-icon': { opacity: 1, transform: 'translateX(4px)' },
        },
      }}
    >
      {/* Franja de acento superior */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor2})`,
      }} />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})`,
            boxShadow: `0 6px 16px ${alpha(accentColor, 0.4)}`,
            flexShrink: 0,
          }}>
            <Icon sx={{ fontSize: 30, color: isDark ? '#000' : '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25, fontSize: '1.15rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {badge && badgeColor && (
            <Chip
              size="small"
              label={badge.label}
              icon={badge.color === 'error' || badge.color === 'warning'
                ? <WarningAmberIcon sx={{ fontSize: '15px !important' }} />
                : <CheckCircleIcon sx={{ fontSize: '15px !important' }} />
              }
              sx={{
                height: 26, fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5,
                bgcolor: alpha(badgeColor, isDark ? 0.18 : 0.1),
                color: badgeColor,
                '& .MuiChip-icon': { color: badgeColor },
              }}
            />
          )}
          <ArrowForwardIosIcon
            className="arrow-icon"
            sx={{ fontSize: 15, color: 'text.disabled', opacity: 0, transition: 'all 0.2s' }}
          />
        </Box>
      </Box>

      {/* Mini stats — panel con fondo tintado, para que las tarjetas no se vean tan planas */}
      {isLoading ? (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={72} sx={{ flex: 1, borderRadius: 2.5 }} />)}
        </Box>
      ) : stats.length > 0 ? (
        <Box sx={{
          display: 'flex', gap: 1,
          p: 2, borderRadius: 2.5,
          bgcolor: isDark ? alpha(accentColor, 0.05) : alpha(accentColor, 0.04),
          border: `1px solid ${alpha(accentColor, isDark ? 0.14 : 0.1)}`,
        }}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha(accentColor, 0.14) }} />}
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                  <Typography variant="h5" fontWeight={900} sx={{ color: s.color ?? accentColor, lineHeight: 1, fontSize: '1.6rem' }}>
                    {s.value}
                  </Typography>
                  {s.trend === 'up' && <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} />}
                  {s.trend === 'down' && <TrendingDownIcon sx={{ fontSize: 18, color: '#ef4444' }} />}
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.78rem', mt: 0.25 }}>
                  {s.label}
                </Typography>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      ) : null}

      {children && <Box sx={{ mt: 1.5 }}>{children}</Box>}
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────
// BARRA DE ASISTENCIA MINI
// ─────────────────────────────────────────────────────────────

const MiniAsistenciaBar: React.FC<{ porcentaje: number; accentColor: string; isDark: boolean }> = ({ porcentaje, accentColor, isDark }) => {
  const color = porcentaje >= 85 ? '#10b981' : porcentaje >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
          Asistencia del período
        </Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: '0.72rem' }}>
          {porcentaje}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(porcentaje, 100)}
        sx={{
          height: 6, borderRadius: 3,
          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color },
        }}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function PadreHomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const { user } = useAuth();
  const { texto: saludoTexto, Icon: SaludoIcon } = saludo();

  const {
    hijos, hijoActivo, setHijoActivo,
    isLoading: loadingHijos, refrescar: refrescarHijos,
  } = useHijosDelPadre();

  const { resumen: resumenAsistencia, isLoading: loadingAsistencia } =
    useResumenAsistencia(hijoActivo?.matricula_id ?? null);

  const { periodoActivo, isLoading: loadingPeriodos } =
    usePeriodosEvaluacion(hijoActivo);

  const { promedio, aprobadas, reprobadas, sinNota, isLoading: loadingNotas } =
    useBoletinNotas(hijoActivo?.matricula_id ?? null, periodoActivo?.id ?? null);

  const { resumen: resumenTareas, isLoading: loadingTareas } =
    useTareasHijo(hijoActivo);

  const { conteos: conteosObs, isLoading: loadingSeguimiento } =
    useObservacionesHijo(
      hijoActivo?.matricula_id ?? 0,
      hijoActivo?.padre_familia_id ?? 0,
    );

  const handleSeleccionarHijo = useCallback((h: any) => setHijoActivo(h), [setHijoActivo]);

  const alertas: { texto: string; color: string; Icon: React.ElementType }[] = [];
  if ((resumenTareas?.atrasados ?? 0) > 0)
    alertas.push({ texto: `${resumenTareas!.atrasados} tarea${resumenTareas!.atrasados > 1 ? 's' : ''} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`, color: '#ef4444', Icon: ErrorOutlineIcon });
  if ((conteosObs?.urgentes ?? 0) > 0)
    alertas.push({ texto: `${conteosObs!.urgentes} observación${conteosObs!.urgentes > 1 ? 'es urgentes' : ' urgente'} sin leer`, color: '#f59e0b', Icon: WarningAmberIcon });
  if (reprobadas > 0)
    alertas.push({ texto: `${reprobadas} materia${reprobadas > 1 ? 's' : ''} reprobada${reprobadas > 1 ? 's' : ''}`, color: '#ef4444', Icon: TrendingDownIcon });

  const porcentajeAsistencia = resumenAsistencia?.porcentaje_asistencia_global ?? 0;
  const totalMaterias = aprobadas + reprobadas + sinNota;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={450}>
          <Box>

            {/* ── HEADER — mismo patrón que "Horarios de mis Hijos" ── */}
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 46, height: 46, fontWeight: 800, fontSize: '1.05rem',
                      bgcolor: accentColor, color: isDark ? '#000' : '#fff',
                      boxShadow: `0 6px 18px ${alpha(accentColor, 0.4)}`,
                      animation: `${float} 2.5s ease-in-out infinite`,
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <SaludoIcon sx={{ fontSize: 14, color: accentColor }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {saludoTexto}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                        fontWeight: 800,
                        background: isDark
                          ? 'linear-gradient(135deg,#facc15,#f59e0b)'
                          : 'linear-gradient(135deg,#0288d1,#01579b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1,
                      }}
                    >
                      {user?.username ?? 'Bienvenido'}
                    </Typography>
                    {hijoActivo && (
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Seguimiento de{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: accentColor }}>
                          {hijoActivo.nombres} {hijoActivo.apellidos}
                        </Box>
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {alertas.length > 0 && (
                  <Chip
                    icon={<NotificationsIcon sx={{ fontSize: '15px !important' }} />}
                    label={`${alertas.length} alerta${alertas.length > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      height: 28, fontWeight: 800, fontSize: '0.72rem', borderRadius: 2,
                      bgcolor: alpha('#ef4444', isDark ? 0.18 : 0.09),
                      color: isDark ? '#f87171' : '#dc2626',
                    }}
                  />
                )}
                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={refrescarHijos}
                    size="small"
                    disabled={loadingHijos}
                    sx={{
                      bgcolor: alpha(accentColor, isDark ? 0.1 : 0.06),
                      border: `1px solid ${alpha(accentColor, isDark ? 0.18 : 0.12)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': { bgcolor: alpha(accentColor, isDark ? 0.2 : 0.12), transform: 'rotate(180deg)' },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18, color: accentColor }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ── SELECTOR DE HIJO ── */}
            <SelectorHijo
              hijos={hijos} hijoActivo={hijoActivo}
              onSeleccionar={handleSeleccionarHijo} isLoading={loadingHijos}
              accentColor={accentColor} isDark={isDark}
            />

            {/* ── ALERTAS RÁPIDAS ── */}
            {alertas.length > 0 && (
              <Fade in timeout={400}>
                <Paper sx={{
                  mb: 3, p: 2, borderRadius: 3,
                  display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center',
                  border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  background: isDark
                    ? `linear-gradient(135deg,${alpha('#ef4444', 0.1)},${alpha('#f59e0b', 0.06)})`
                    : `linear-gradient(135deg,${alpha('#ef4444', 0.05)},${alpha('#f59e0b', 0.03)})`,
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
                        height: 24, fontWeight: 700, fontSize: '0.68rem', borderRadius: 1.5,
                        bgcolor: alpha(a.color, isDark ? 0.18 : 0.09),
                        color: isDark ? alpha(a.color, 0.9) : a.color,
                        '& .MuiChip-icon': { color: `${a.color} !important` },
                      }}
                    />
                  ))}
                </Paper>
              </Fade>
            )}

            {/* ── GRID DE MÓDULOS ── */}
            <Grid container spacing={2.5}>

              {/* ── ASISTENCIA ── */}
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <ModuleCard
                  title="Asistencia" subtitle="Historial y permisos"
                  icon={FamilyRestroomIcon} href="/dashboard/padre/asistencia"
                  accentColor={accentColor} isDark={isDark} delay={0}
                  badge={
                    (resumenAsistencia?.total_ausentes ?? 0) > 3
                      ? { label: `${resumenAsistencia!.total_ausentes} faltas`, color: 'warning' }
                      : porcentajeAsistencia >= 90 ? { label: 'Al día', color: 'success' } : undefined
                  }
                  stats={[
                    { label: 'Asistencias', value: loadingAsistencia ? '…' : (resumenAsistencia?.total_presentes ?? '—') },
                    { label: 'Faltas', value: loadingAsistencia ? '…' : (resumenAsistencia?.total_ausentes ?? '—'), trend: (resumenAsistencia?.total_ausentes ?? 0) > 5 ? 'down' : 'neutral' },
                    { label: 'Tardanzas', value: loadingAsistencia ? '…' : (resumenAsistencia?.total_tardanzas ?? '—'), trend: (resumenAsistencia?.total_tardanzas ?? 0) > 3 ? 'down' : 'neutral' },
                  ]}
                  isLoading={loadingAsistencia || loadingHijos}
                >
                  {!loadingAsistencia && resumenAsistencia && (
                    <MiniAsistenciaBar porcentaje={resumenAsistencia.porcentaje_asistencia_global} accentColor={accentColor} isDark={isDark} />
                  )}
                </ModuleCard>
              </Grid>

              {/* ── CALIFICACIONES ── */}
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <ModuleCard
                  title="Calificaciones" subtitle="Boletín de notas"
                  icon={SchoolIcon} href="/dashboard/padre/calificaciones"
                  accentColor={accentColor} isDark={isDark} delay={80}
                  badge={
                    reprobadas > 0
                      ? { label: `${reprobadas} reprobada${reprobadas > 1 ? 's' : ''}`, color: 'error' }
                      : promedio != null ? { label: `Prom. ${promedio}`, color: promedio >= 51 ? 'success' : 'error' } : undefined
                  }
                  stats={[
                    { label: 'Promedio', value: loadingNotas ? '…' : (promedio ?? '—'), trend: promedio != null ? (promedio >= 51 ? 'up' : 'down') : undefined },
                    { label: 'Aprobadas', value: loadingNotas ? '…' : aprobadas },
                    { label: 'Pendientes', value: loadingNotas ? '…' : sinNota, trend: sinNota > 0 ? 'down' : 'neutral' },
                  ]}
                  isLoading={loadingNotas || loadingHijos || loadingPeriodos}
                >
                  {!loadingNotas && totalMaterias > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                          Materias aprobadas
                        </Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: accentColor, fontSize: '0.72rem' }}>
                          {aprobadas}/{totalMaterias}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(aprobadas / totalMaterias) * 100}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: accentColor },
                        }}
                      />
                    </Box>
                  )}
                </ModuleCard>
              </Grid>

              {/* ── HORARIO ── */}
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <ModuleCard
                  title="Horario" subtitle="Clases y docentes"
                  icon={CalendarMonthIcon} href="/dashboard/padre/horario"
                  accentColor={accentColor} isDark={isDark} delay={160}
                  badge={hijoActivo?.paralelo_nombre ? { label: 'Ver horario', color: 'info' } : undefined}
                  isLoading={loadingHijos}
                >
                  {hijoActivo && !loadingHijos && (
                    <Box sx={{
                      p: 2, borderRadius: 2.5,
                      bgcolor: alpha(accentColor, isDark ? 0.08 : 0.05),
                      border: `1px solid ${alpha(accentColor, isDark ? 0.2 : 0.12)}`,
                      display: 'flex', flexDirection: 'column', gap: 1,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ fontSize: 17, color: accentColor }} />
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                          {hijoActivo.grado_nombre} — Paralelo {hijoActivo.paralelo_nombre}
                        </Typography>
                      </Box>
                      {hijoActivo.turno_nombre && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 17, color: accentColor }} />
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                            Turno: {hijoActivo.turno_nombre}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                        Tocá para ver el horario completo con todos los docentes
                      </Typography>
                    </Box>
                  )}
                </ModuleCard>
              </Grid>

              {/* ── SEGUIMIENTO PEDAGÓGICO ── */}
              <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
                <ModuleCard
                  title="Seguimiento Pedagógico" subtitle="Observaciones de docentes"
                  icon={PsychologyIcon} href="/dashboard/padre/seguimiento"
                  accentColor={accentColor} isDark={isDark} delay={240}
                  badge={
                    (conteosObs?.urgentes ?? 0) > 0
                      ? { label: `${conteosObs!.urgentes} urgente${conteosObs!.urgentes > 1 ? 's' : ''}`, color: 'error' }
                      : (conteosObs?.no_leidas ?? 0) > 0
                        ? { label: `${conteosObs!.no_leidas} sin leer`, color: 'warning' }
                        : (conteosObs?.total ?? 0) > 0 ? { label: 'Al día', color: 'success' } : undefined
                  }
                  stats={[
                    { label: 'Total', value: loadingSeguimiento ? '…' : (conteosObs?.total ?? '—') },
                    { label: 'Sin leer', value: loadingSeguimiento ? '…' : (conteosObs?.no_leidas ?? '—'), trend: (conteosObs?.no_leidas ?? 0) > 0 ? 'down' : 'neutral' },
                    { label: 'Urgentes', value: loadingSeguimiento ? '…' : (conteosObs?.urgentes ?? '—'), trend: (conteosObs?.urgentes ?? 0) > 0 ? 'down' : 'neutral' },
                    { label: 'Informativos', value: loadingSeguimiento ? '…' : (conteosObs?.informativos ?? '—') },
                  ]}
                  isLoading={loadingSeguimiento || loadingHijos}
                >
                  {(conteosObs?.urgentes ?? 0) > 0 && !loadingSeguimiento && (
                    <Box sx={{
                      p: 1.25, borderRadius: 2, display: 'flex', gap: 1, alignItems: 'flex-start',
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
                  title="Tareas y Trabajos" subtitle="Entregas y evaluaciones"
                  icon={AssignmentIcon} href="/dashboard/padre/tareas"
                  accentColor={accentColor} isDark={isDark} delay={320}
                  badge={
                    (resumenTareas?.atrasados ?? 0) > 0
                      ? { label: `${resumenTareas!.atrasados} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`, color: 'error' }
                      : (resumenTareas?.pendientes ?? 0) > 0
                        ? { label: `${resumenTareas!.pendientes} pendiente${resumenTareas!.pendientes > 1 ? 's' : ''}`, color: 'warning' }
                        : undefined
                  }
                  stats={[
                    { label: 'Total', value: loadingTareas ? '…' : (resumenTareas?.total ?? '—') },
                    { label: 'Pendientes', value: loadingTareas ? '…' : (resumenTareas?.pendientes ?? '—'), trend: (resumenTareas?.pendientes ?? 0) > 0 ? 'down' : 'neutral' },
                    { label: 'Entregadas', value: loadingTareas ? '…' : (resumenTareas?.entregados ?? '—'), trend: (resumenTareas?.entregados ?? 0) > 0 ? 'up' : 'neutral' },
                    { label: 'Atrasadas', value: loadingTareas ? '…' : (resumenTareas?.atrasados ?? '—'), trend: (resumenTareas?.atrasados ?? 0) > 0 ? 'down' : 'neutral' },
                  ]}
                  isLoading={loadingTareas || loadingHijos}
                >
                  {!loadingTareas && (resumenTareas?.total ?? 0) > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                          Progreso de entrega
                        </Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: accentColor, fontSize: '0.72rem' }}>
                          {resumenTareas!.entregados}/{resumenTareas!.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(resumenTareas!.entregados / resumenTareas!.total) * 100}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: accentColor },
                        }}
                      />
                    </Box>
                  )}
                </ModuleCard>
              </Grid>

            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}