import React from 'react';
import {
  Grid, Card, CardContent, CardActionArea, Typography, Avatar,
  Box, alpha, useTheme, Stack
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary       = isDark ? '#facc15' : '#0288d1';
  const secondary     = isDark ? '#f59e0b' : '#01579b';
  const gradient      = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { primary, secondary, gradient, textOnPrimary };
}

interface NivelesStatsProps {
  totalNiveles: number;
  totalGrados: number;
  totalEstudiantes?: number;
  totalMaterias?: number;
}

export const NivelesStats: React.FC<NivelesStatsProps> = ({
  totalNiveles, totalGrados, totalEstudiantes = 0, totalMaterias = 0
}) => {
  const { primary, secondary, gradient, textOnPrimary } = usePalette();

  const stats = [
    {
      title: 'Niveles Académicos', value: totalNiveles,
      icon: SchoolIcon,
      color: primary,
      grad: gradient,
      textOn: textOnPrimary,
    },
    {
      title: 'Total Grados', value: totalGrados,
      icon: ClassIcon,
      color: secondary,
      grad: `linear-gradient(135deg, ${secondary}, ${primary})`,
      textOn: textOnPrimary,
    },
    {
      title: 'Estudiantes', value: totalEstudiantes,
      icon: GroupsIcon,
      color: '#10B981',
      grad: 'linear-gradient(135deg, #10B981, #059669)',
      textOn: '#fff',
      caption: '+12% este año',
    },
    {
      title: 'Materias Totales', value: totalMaterias,
      icon: GradeIcon,
      color: '#8B5CF6',
      grad: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      textOn: '#fff',
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Grid size={{xs:12, sm:6, md:3}} key={i}>
            <Card sx={{
              background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)}, ${alpha(stat.color, 0.04)})`,
              border: `1px solid ${alpha(stat.color, 0.25)}`,
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-8px) scale(1.02)', boxShadow: `0 20px 40px ${alpha(stat.color, 0.25)}` },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: stat.grad, width: 56, height: 56, boxShadow: `0 4px 12px ${alpha(stat.color, 0.4)}` }}>
                    <Icon sx={{ fontSize: 32, color: stat.textOn }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" fontWeight="600" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ color: stat.color, lineHeight: 1.1 }}>
                      {stat.value}
                    </Typography>
                    {stat.caption && (
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: stat.color }} />
                        <Typography variant="caption" sx={{ color: stat.color }}>{stat.caption}</Typography>
                      </Stack>
                    )}
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