import React from 'react';
import {
  Grid, Card, CardContent, Typography, Avatar,
  Box, alpha, useTheme, Stack
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// ─── Paleta dinámica ──────────────────────────────────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary       = isDark ? '#facc15' : '#0288d1';
  const secondary     = isDark ? '#f59e0b' : '#01579b';
  const gradient      = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary };
}

interface ParalelosStatsProps {
  totalParalelos: number;
  totalEstudiantes: number;
  promedioEstudiantes: number;
  paralelosLlenos: number;
  paralelosBajoMinimo: number;
  capacidadTotal: number;
  tasaOcupacion: number;
}

export const ParalelosStats: React.FC<ParalelosStatsProps> = ({
  totalParalelos,
  totalEstudiantes,
  promedioEstudiantes,
  paralelosLlenos,
  paralelosBajoMinimo,
  capacidadTotal,
  tasaOcupacion,
}) => {
  const { primary, secondary, gradient, textOnPrimary } = usePalette();

  // ── Fix bug: redondear valores numéricos ──────────────────────────────────
  const safeTotal      = Math.round(Number(totalParalelos)      || 0);
  const safeEstudiantes= Math.round(Number(totalEstudiantes)    || 0);
  const safePromedio = Number(promedioEstudiantes) || 0;
  const safeCapacidad  = Math.round(Number(capacidadTotal)      || 0);
  const safeTasa       = Math.round(Number(tasaOcupacion)       || 0);

  const statsConfig = [
    {
      title: 'Total Paralelos',
      value: safeTotal,
      subtitle: 'Secciones activas',
      icon: ClassIcon,
      color: primary,
      gradient,
      textOn: textOnPrimary,
    },
    {
      title: 'Total Estudiantes',
      value: safeEstudiantes,
      subtitle: `de ${safeCapacidad} cupos`,
      icon: GroupsIcon,
      color: secondary,
      gradient: `linear-gradient(135deg, ${secondary}, ${primary})`,
      textOn: textOnPrimary,
    },
    {
      title: 'Promedio / Paralelo',
      value: safePromedio,
      subtitle: 'Estudiantes',
      icon: PersonIcon,
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      textOn: '#fff',
    },
    {
      title: 'Ocupación',
      value: `${safeTasa}%`,
      subtitle: safeTasa >= 90
        ? 'Alta demanda'
        : paralelosBajoMinimo > 0
        ? `${paralelosBajoMinimo} bajo mínimo`
        : 'Capacidad óptima',
      icon: safeTasa >= 90 ? WarningAmberIcon : TrendingUpIcon,
      color: safeTasa >= 90 ? '#F59E0B' : '#10B981',
      gradient: safeTasa >= 90
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : 'linear-gradient(135deg, #10B981, #059669)',
      textOn: '#fff',
      showWarning: safeTasa >= 90,
    },
  ];

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Grid size={{xs:12, sm:6, md:3}} key={index}>
            <Card sx={{
              background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)}, ${alpha(stat.color, 0.04)})`,
              border: `1px solid ${alpha(stat.color, 0.25)}`,
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 32px ${alpha(stat.color, 0.25)}` },
            }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                  <Avatar sx={{
                    background: stat.gradient,
                    width: { xs: 48, md: 52 }, height: { xs: 48, md: 52 },
                    boxShadow: `0 4px 12px ${alpha(stat.color, 0.4)}`,
                  }}>
                    <Icon sx={{ fontSize: { xs: 24, md: 28 }, color: stat.textOn }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" fontWeight="600" color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="800"
                      sx={{ color: stat.color, fontSize: { xs: '1.8rem', md: '2.4rem' }, lineHeight: 1.1 }}>
                      {stat.value}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                      {stat.showWarning && <WarningAmberIcon sx={{ fontSize: 13, color: stat.color }} />}
                      {paralelosBajoMinimo > 0 && index === 3 && !stat.showWarning && (
                        <TrendingDownIcon sx={{ fontSize: 13, color: stat.color }} />
                      )}
                      <Typography variant="caption"
                        sx={{ color: stat.showWarning ? stat.color : 'text.secondary', fontSize: { xs: '0.65rem', md: '0.72rem' } }}>
                        {stat.subtitle}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};