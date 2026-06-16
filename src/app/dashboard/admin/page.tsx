'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Chip,
  Avatar,
  alpha,
  LinearProgress,
  Stack,
  keyframes,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  AccessTime as ClockIcon,
  BarChart as ChartIcon,
  WbSunny as SunIcon,
  NightsStay as MoonIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';
import { useDashboard } from '@/hooks/useDashboard';

// ─── animations ──────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const useAccent = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return {
    isDark,
    accent: isDark ? '#facc15' : '#0288d1',
    accentDark: isDark ? '#f59e0b' : '#01579b',
    gradient: isDark
      ? 'linear-gradient(135deg, #facc15, #f59e0b)'
      : 'linear-gradient(135deg, #0288d1, #01579b)',
  };
};

// ─── BentoCard ────────────────────────────────────────────────────────────────

const BentoCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  accent?: string;
  sx?: object;
}> = ({ children, delay = 0, accent: hoverAccent, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      sx={{
        borderRadius: '20px',
        p: '1.5rem',
        background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
        transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        animation: `${slideUp} 0.45s ease both`,
        animationDelay: `${delay}ms`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: hoverAccent ? alpha(hoverAccent, 0.4) : undefined,
          boxShadow: hoverAccent
            ? `0 10px 28px ${alpha(hoverAccent, isDark ? 0.15 : 0.12)}`
            : `0 8px 20px ${isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.09)'}`,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

// ─── CardLabel (small eyebrow) ────────────────────────────────────────────────

const CardLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 600,
      color: 'text.secondary',
      display: 'block',
      mb: 0.75,
      fontSize: '0.68rem',
    }}
  >
    {children}
  </Typography>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: number;
  active: number;
  icon: React.ElementType;
  color: string;
  trend: number;
  delay: number;
}> = ({ label, value, active, icon: Icon, color, trend, delay }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const up = trend >= 0;
  const pct = value > 0 ? Math.round((active / value) * 100) : 0;

  return (
    <BentoCard delay={delay} accent={color}>
      {/* icon + trend */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '1.5rem' }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '12px',
            bgcolor: alpha(color, isDark ? 0.18 : 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.25,
            px: 1, py: 0.4, borderRadius: '8px',
            bgcolor: up ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
          }}
        >
          {up
            ? <ArrowUpIcon sx={{ fontSize: 12, color: '#10b981' }} />
            : <ArrowDownIcon sx={{ fontSize: 12, color: '#f59e0b' }} />}
          <Typography variant="caption" fontWeight={700} sx={{ color: up ? '#10b981' : '#f59e0b', fontSize: '0.7rem' }}>
            {Math.abs(trend)}%
          </Typography>
        </Box>
      </Box>

      {/* big number */}
      <Typography
        sx={{
          fontSize: '2.1rem', fontWeight: 800, lineHeight: 1,
          color: isDark ? '#fff' : '#0f172a',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.toLocaleString()}
      </Typography>

      <Typography variant="body2" fontWeight={600} color="text.primary" mt={0.4} mb={1.25}>
        {label}
      </Typography>

      {/* progress */}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5, borderRadius: 3,
          bgcolor: alpha(color, isDark ? 0.15 : 0.1),
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color },
          mb: 0.5,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {active.toLocaleString()} activos · {pct}%
      </Typography>
    </BentoCard>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { isDark, accent, accentDark, gradient } = useAccent();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch, stats } = useDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 800);
  };

  const getActivityIcon = (accion: string): React.ElementType => {
    if (accion.toLowerCase().includes('crear')) return PersonAddIcon;
    if (accion.toLowerCase().includes('actualizar')) return EditIcon;
    if (accion.toLowerCase().includes('eliminar')) return DeleteIcon;
    if (accion.toLowerCase().includes('login')) return CheckCircleIcon;
    return VisibilityIcon;
  };

  const timeAgo = (fecha: string) => {
    const m = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const hora = new Date().getHours();
  const greeting = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const GreetIcon = hora < 12 ? SunIcon : hora < 19 ? CloudIcon : MoonIcon;

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" gap={2}>
        <CircularProgress sx={{ color: accent }} size={44} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>Cargando datos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: '14px' }}
          action={<IconButton size="small" onClick={handleRefresh}><RefreshIcon /></IconButton>}>
          {error}
        </Alert>
      </Container>
    );
  }

  const statCards = [
    { label: 'Estudiantes', value: stats.totalEstudiantes, active: stats.estudiantesActivos, icon: SchoolIcon, color: accent, trend: 12.5 },
    { label: 'Docentes', value: stats.totalDocentes, active: stats.docentesActivos, icon: PersonIcon, color: '#a78bfa', trend: 5.2 },
    { label: 'Usuarios', value: stats.totalUsuarios, active: stats.usuariosActivos, icon: PeopleIcon, color: '#34d399', trend: 8.7 },
    { label: 'Matrículas', value: stats.matriculasActivas, active: stats.matriculasActivas, icon: AssignmentIcon, color: '#fb923c', trend: -2.3 },
  ];

  const distribucion: { grado: string; cantidad: number }[] = data?.estudiantes?.distribucion_por_grado || [];
  const totalDist = distribucion.reduce((s, d) => s + d.cantidad, 0) || 1;
  const distColors = [accent, '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];
  const actividad = (data?.actividad || []).slice(0, 6);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── HEADER ── */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 2, mb: 4.5,
            animation: `${slideUp} 0.35s ease both`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <GreetIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.4rem', md: '1.9rem' },
                  fontWeight: 800, lineHeight: 1.1,
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {greeting}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Panel de Administración
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
            {data?.periodo && (
              <Chip
                icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                label={data.periodo.nombre}
                size="small"
                sx={{
                  height: 32, px: 0.5,
                  bgcolor: alpha(accent, 0.1),
                  border: `1px solid ${alpha(accent, 0.22)}`,
                  color: accent, fontWeight: 600, fontSize: '0.72rem',
                  '& .MuiChip-icon': { color: accent },
                }}
              />
            )}
            <IconButton
              onClick={handleRefresh} disabled={refreshing} size="small"
              sx={{
                width: 34, height: 34, borderRadius: '10px',
                bgcolor: alpha(accent, 0.08),
                border: `1px solid ${alpha(accent, 0.2)}`,
                '&:hover': { bgcolor: alpha(accent, 0.15) },
              }}
            >
              <RefreshIcon
                sx={{
                  color: accent, fontSize: 17,
                  animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                }}
              />
            </IconButton>
          </Box>
        </Box>

        {/* ── BENTO GRID ── */}
        <Box
          sx={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          }}
        >

          {/* Row 1 — 4 stat cards */}
          {statCards.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 55} />
          ))}

          {/* Row 2 left — Distribución grados (span 2) */}
          <BentoCard
            delay={240}
            sx={{ gridColumn: { xs: '1', sm: '1 / 3', lg: '1 / 3' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <CardLabel>Distribución</CardLabel>
                <Typography variant="h6" fontWeight={700}>Por grado</Typography>
              </Box>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChartIcon sx={{ color: accent, fontSize: 18 }} />
              </Box>
            </Box>

            {distribucion.length > 0 ? (
              <Stack spacing={1.75}>
                {distribucion.slice(0, 5).map((item, i) => {
                  const pct = Math.round((item.cantidad / totalDist) * 100);
                  const c = distColors[i % distColors.length];
                  return (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '65%' }}>
                          {item.grado}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: c, fontVariantNumeric: 'tabular-nums' }}>
                            {item.cantidad}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ minWidth: 28, textAlign: 'right' }}>
                            {pct}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: alpha(c, 0.1),
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: c },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                <Typography variant="body2" color="text.disabled">Sin datos disponibles</Typography>
              </Box>
            )}
          </BentoCard>

          {/* Row 2 right — Resumen del periodo (span 2) */}
          <BentoCard
            delay={295}
            accent={accent}
            sx={{ gridColumn: { xs: '1', sm: '1 / 3', lg: '3 / 5' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <CardLabel>Periodo vigente</CardLabel>
                <Typography variant="h6" fontWeight={700}>
                  {data?.periodo?.nombre || 'Sin periodo activo'}
                </Typography>
              </Box>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarIcon sx={{ color: accent, fontSize: 18 }} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Estudiantes activos', value: stats.estudiantesActivos, total: stats.totalEstudiantes, color: accent },
                { label: 'Docentes activos', value: stats.docentesActivos, total: stats.totalDocentes, color: '#a78bfa' },
                { label: 'Usuarios activos', value: stats.usuariosActivos, total: stats.totalUsuarios, color: '#34d399' },
                { label: 'Matrículas', value: stats.matriculasActivas, total: stats.matriculasActivas, color: '#fb923c' },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 100;
                return (
                  <Box
                    key={item.label}
                    sx={{
                      p: '1rem', borderRadius: '14px',
                      bgcolor: alpha(item.color, isDark ? 0.1 : 0.06),
                      border: `1px solid ${alpha(item.color, isDark ? 0.18 : 0.12)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1.65rem', fontWeight: 800, color: item.color,
                        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.value.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.3} mb={1}>
                      {item.label}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 4, borderRadius: 2,
                        bgcolor: alpha(item.color, 0.12),
                        '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: item.color },
                        mb: 0.4,
                      }}
                    />
                    <Typography variant="caption" color="text.disabled">{pct}% del total</Typography>
                  </Box>
                );
              })}
            </Box>
          </BentoCard>

          {/* Row 3 — Actividad reciente (full span) */}
          <BentoCard
            delay={350}
            sx={{ gridColumn: { xs: '1', sm: '1 / 3', lg: '1 / 5' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <CardLabel>Sistema</CardLabel>
                <Typography variant="h6" fontWeight={700}>Actividad reciente</Typography>
              </Box>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockIcon sx={{ color: accent, fontSize: 18 }} />
              </Box>
            </Box>

            {actividad.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                  gap: '0.75rem',
                }}
              >
                {actividad.map((item: any, i: number) => {
                  const Icon = getActivityIcon(item.accion);
                  const c = distColors[i % distColors.length];
                  const isOk = item.resultado === 'exitoso';
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex', gap: 1.25, p: '0.875rem',
                        borderRadius: '14px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : alpha(c, 0.025),
                        transition: 'background 0.18s',
                        '&:hover': {
                          bgcolor: alpha(c, isDark ? 0.08 : 0.06),
                          borderColor: alpha(c, 0.25),
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34, height: 34, flexShrink: 0,
                          bgcolor: alpha(c, 0.14),
                        }}
                      >
                        <Icon sx={{ color: c, fontSize: 17 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.mensaje}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {item.username}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">·</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {timeAgo(item.created_at)}
                          </Typography>
                          <Box
                            sx={{
                              px: 0.75, py: 0.15, borderRadius: '6px',
                              bgcolor: isOk ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: isOk ? '#10b981' : '#f59e0b', fontWeight: 700, fontSize: '0.63rem' }}
                            >
                              {isOk ? 'OK' : 'Error'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1 }}>
                <ClockIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.disabled">Sin actividad reciente</Typography>
              </Box>
            )}
          </BentoCard>

        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;