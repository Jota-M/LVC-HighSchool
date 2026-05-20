'use client';
// components/docente/asistencia/ResumenAsistencia.tsx
// ✨ PREMIUM VERSION - Dashboard con gráficos premium y animaciones

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ReporteAsistencia } from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES PREMIUM
// ──────────────────────────────────────────────

const countUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.9);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 0 0 currentColor;
  }
  50% { 
    box-shadow: 0 0 0 10px transparent;
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ──────────────────────────────────────────────
// STAT CARD PREMIUM
// ──────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  color: string;
  colorDark: string;
  bgColor: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  trending?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subtitle, 
  color, 
  colorDark,
  bgColor, 
  icon, 
  gradient,
  delay = 0,
  trending = 'neutral',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const displayColor = isDark ? colorDark : color;

  return (
    <Card
      sx={{
        borderRadius: 4,
        animation: `${countUp} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        
        background: isDark
          ? `linear-gradient(145deg, ${alpha(displayColor, 0.15)} 0%, ${alpha(displayColor, 0.05)} 100%)`
          : `linear-gradient(145deg, ${bgColor} 0%, #ffffff 100%)`,
        
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(displayColor, 0.2)}`,
        boxShadow: `0 8px 32px ${alpha(displayColor, 0.15)}`,
        
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 16px 48px ${alpha(displayColor, 0.3)}`,
          border: `1px solid ${alpha(displayColor, 0.4)}`,
          
          '& .stat-icon': {
            transform: 'scale(1.2) rotate(10deg)',
          },
          
          '& .shimmer-overlay': {
            animation: `${shimmer} 2s linear infinite`,
          },
        },
        
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
        },
        
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(displayColor, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Shimmer overlay */}
      <Box
        className="shimmer-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${alpha('#fff', isDark ? 0.05 : 0.2)}, transparent)`,
          backgroundSize: '1000px 100%',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          {/* Icono premium */}
          <Box
            className="stat-icon"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient,
              boxShadow: `0 8px 24px ${alpha(displayColor, 0.4)}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${alpha('#fff', 0.3)} 0%, transparent 70%)`,
                animation: `${rotate} 10s linear infinite`,
              },
            }}
          >
            <Box sx={{ '& svg': { fontSize: 28, color: '#fff', zIndex: 1 } }}>
              {icon}
            </Box>
          </Box>

          {/* Trending indicator */}
          {trending !== 'neutral' && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: trending === 'up' 
                  ? alpha('#10b981', 0.15)
                  : alpha('#ef4444', 0.15),
                border: `1px solid ${alpha(trending === 'up' ? '#10b981' : '#ef4444', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {trending === 'up' ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
              )}
              <Typography variant="caption" fontWeight={800} sx={{ 
                color: trending === 'up' ? '#10b981' : '#ef4444',
                fontSize: 10,
              }}>
                {trending === 'up' ? 'Alto' : 'Bajo'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Valor principal */}
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            mb: 1,
            letterSpacing: -1.5,
          }}
        >
          {value}
        </Typography>

        {/* Label */}
        <Typography 
          variant="body2" 
          fontWeight={700} 
          color="text.primary"
          sx={{ mb: subtitle ? 0.5 : 0 }}
        >
          {label}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontWeight={600}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// BARRA HORIZONTAL POR MATERIA PREMIUM
// ──────────────────────────────────────────────

const FilaMateria: React.FC<{ reporte: ReporteAsistencia; index: number }> = ({ reporte, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isHovered, setIsHovered] = React.useState(false);

  const pct = Number(reporte.porcentaje_asistencia);
  const colorPct = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const gradientPct = pct >= 80 
    ? 'linear-gradient(90deg, #10b981, #34d399)'
    : pct >= 60
      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      : 'linear-gradient(90deg, #ef4444, #f87171)';

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        animation: `${countUp} 0.5s ease-out ${index * 0.1}s both`,
        p: 3,
        borderRadius: 3,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(colorPct, 0.1)} 0%, ${alpha(colorPct, 0.03)} 100%)`
          : `linear-gradient(145deg, ${alpha(colorPct, 0.05)} 0%, #ffffff 100%)`,
        backdropFilter: 'blur(10px)',
        border: `2px solid ${alpha(colorPct, isHovered ? 0.3 : 0.15)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        
        '&:hover': {
          transform: 'translateX(8px)',
          boxShadow: `0 8px 32px ${alpha(colorPct, 0.25)}`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} noWrap sx={{ mb: 0.5 }}>
            {reporte.materia_nombre}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<CalendarMonthIcon sx={{ fontSize: '14px !important' }} />}
              label={`${reporte.total_clases} clases`}
              size="small"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                height: 24,
                bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                borderRadius: 1.5,
              }}
            />
          </Box>
        </Box>

        {/* Porcentaje grande */}
        <Box
          sx={{
            minWidth: 80,
            height: 80,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: gradientPct,
            boxShadow: `0 4px 20px ${alpha(colorPct, 0.4)}`,
            position: 'relative',
            overflow: 'hidden',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, ${alpha('#fff', 0.3)} 0%, transparent 70%)`,
            },
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight={900}
            sx={{ color: '#fff', lineHeight: 1, zIndex: 1 }}
          >
            {pct}%
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ color: alpha('#fff', 0.9), fontSize: 10, fontWeight: 700, zIndex: 1 }}
          >
            Asistencia
          </Typography>
        </Box>
      </Box>

      {/* Mini estadísticas */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Presentes', value: reporte.presentes, color: '#10b981', icon: <CheckCircleRoundedIcon /> },
          { label: 'Ausentes', value: reporte.ausentes, color: '#ef4444', icon: <CancelRoundedIcon /> },
          { label: 'Tardanzas', value: reporte.tardanzas, color: '#f59e0b', icon: <AccessTimeRoundedIcon /> },
          { label: 'Justificados', value: reporte.justificados, color: '#3b82f6', icon: <VerifiedRoundedIcon /> },
        ].map(s => (
          <Box 
            key={s.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: isDark ? alpha(s.color, 0.15) : alpha(s.color, 0.1),
              border: `1px solid ${alpha(s.color, 0.3)}`,
              flex: '1 1 auto',
              minWidth: 'fit-content',
            }}
          >
            <Box sx={{ '& svg': { fontSize: 18, color: s.color } }}>
              {s.icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ color: s.color, lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600 }}>
                {s.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Barra de progreso premium */}
      <Box
        sx={{
          height: 12,
          borderRadius: 6,
          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 6,
            background: gradientPct,
            position: 'relative',
            transformOrigin: 'left',
            animation: `${fillBar} 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`,
            
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.3)}, transparent)`,
              backgroundSize: '200% 100%',
              animation: `${shimmer} 2s linear infinite`,
            },
          }}
        />
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// SKELETON PREMIUM
// ──────────────────────────────────────────────

const ResumenSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={3}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
          <Card 
            sx={{ 
              borderRadius: 4,
              p: 3,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            }}
          >
            <Skeleton variant="rounded" width={56} height={56} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="rectangular" height={40} width="70%" sx={{ mb: 1, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={20} width="90%" sx={{ mb: 0.5, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={16} width="60%" sx={{ borderRadius: 1 }} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────

interface Props {
  reporte: ReporteAsistencia[];
  isLoading?: boolean;
  titulo?: string;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const ResumenAsistencia: React.FC<Props> = ({ reporte, isLoading = false, titulo }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Totales agregados
  const totales = reporte.reduce(
    (acc, r) => ({
      clases: acc.clases + Number(r.total_clases),
      presentes: acc.presentes + Number(r.presentes),
      ausentes: acc.ausentes + Number(r.ausentes),
      tardanzas: acc.tardanzas + Number(r.tardanzas),
      justificados: acc.justificados + Number(r.justificados),
    }),
    { clases: 0, presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0 }
  );

  const promedio = reporte.length > 0
    ? Math.round(reporte.reduce((a, r) => a + Number(r.porcentaje_asistencia), 0) / reporte.length)
    : 0;

  if (isLoading) return <ResumenSkeleton />;

  if (reporte.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(145deg, #fafafa 0%, #f3f4f6 100%)',
          border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark
              ? alpha('#fff', 0.05)
              : alpha('#000', 0.05),
            margin: '0 auto',
            mb: 3,
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          <AutoGraphIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>
          Seleccioná una materia
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Elegí una materia para ver el resumen de asistencia
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header premium */}
      {titulo && (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
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
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: isDark
                ? '0 8px 24px rgba(251, 191, 36, 0.4)'
                : '0 8px 24px rgba(59, 130, 246, 0.4)',
            }}
          >
            <AutoGraphIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={900}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -0.5,
              }}
            >
              {titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Análisis general del período académico
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tarjetas de totales premium */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Total Clases"
            value={totales.clases}
            subtitle="📚 Registradas en el sistema"
            color="#3b82f6"
            colorDark="#60a5fa"
            bgColor="#dbeafe"
            icon={<CalendarMonthIcon />}
            gradient="linear-gradient(135deg, #3b82f6, #60a5fa)"
            delay={0}
            trending="neutral"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Presentes"
            value={totales.presentes}
            subtitle={`✅ ${totales.clases > 0 ? Math.round((totales.presentes / totales.clases) * 100) : 0}% del total`}
            color="#10b981"
            colorDark="#34d399"
            bgColor="#d1fae5"
            icon={<CheckCircleRoundedIcon />}
            gradient="linear-gradient(135deg, #10b981, #34d399)"
            delay={0.1}
            trending="up"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Ausentes"
            value={totales.ausentes}
            subtitle={`⚠️ ${totales.clases > 0 ? Math.round((totales.ausentes / totales.clases) * 100) : 0}% del total`}
            color="#ef4444"
            colorDark="#f87171"
            bgColor="#fee2e2"
            icon={<CancelRoundedIcon />}
            gradient="linear-gradient(135deg, #ef4444, #f87171)"
            delay={0.2}
            trending={totales.ausentes > totales.presentes * 0.2 ? 'down' : 'neutral'}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Tardanzas"
            value={totales.tardanzas}
            subtitle="⏰ Llegadas tarde"
            color="#f59e0b"
            colorDark="#fbbf24"
            bgColor="#fef3c7"
            icon={<AccessTimeRoundedIcon />}
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            delay={0.3}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="% Asistencia"
            value={`${promedio}%`}
            subtitle={
              promedio >= 80
                ? '🏆 Excelente desempeño'
                : promedio >= 70
                  ? '✅ Por encima del mínimo'
                  : '⚠️ Por debajo del mínimo'
            }
            color={promedio >= 80 ? '#10b981' : promedio >= 70 ? '#f59e0b' : '#ef4444'}
            colorDark={promedio >= 80 ? '#34d399' : promedio >= 70 ? '#fbbf24' : '#f87171'}
            bgColor={promedio >= 80 ? '#d1fae5' : promedio >= 70 ? '#fef3c7' : '#fee2e2'}
            icon={promedio >= 70 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            gradient={
              promedio >= 80
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : promedio >= 70
                  ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(135deg, #ef4444, #f87171)'
            }
            delay={0.4}
            trending={promedio >= 70 ? 'up' : 'down'}
          />
        </Grid>
      </Grid>

      {/* Desglose por materia */}
      {reporte.length > 1 && (
        <Box>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 32,
                borderRadius: 2,
                background: isDark
                  ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(180deg, #3b82f6, #2563eb)',
              }}
            />
            <Typography 
              variant="h6" 
              fontWeight={800}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Por Materia
            </Typography>
            <Chip
              label={`${reporte.length} materias`}
              size="small"
              sx={{
                bgcolor: isDark ? alpha('#fbbf24', 0.15) : alpha('#3b82f6', 0.15),
                color: isDark ? '#fbbf24' : '#3b82f6',
                fontWeight: 800,
                fontSize: 11,
                height: 24,
              }}
            />
          </Box>

          <Stack spacing={2}>
            {reporte.map((r, i) => (
              <FilaMateria key={r.asignacion_id} reporte={r} index={i} />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ResumenAsistencia;