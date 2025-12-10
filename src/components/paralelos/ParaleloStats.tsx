import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
  tasaOcupacion
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // IMPORTANTE: Asegurar que los valores sean números
  const safeTotal = Number(totalParalelos) || 0;
  const safeEstudiantes = Number(totalEstudiantes) || 0;
  const safePromedio = Number(promedioEstudiantes) || 0;
  const safeCapacidad = Number(capacidadTotal) || 0;
  const safeTasa = Number(tasaOcupacion) || 0;

  // Colores variados según el tema
  const statsConfig = [
    {
      title: 'Total Paralelos',
      value: safeTotal,
      subtitle: 'Secciones activas',
      icon: ClassIcon,
      color: isDark ? '#a78bfa' : '#7c3aed', // Púrpura
    },
    {
      title: 'Total Estudiantes',
      value: safeEstudiantes,
      subtitle: `de ${safeCapacidad} cupos`,
      icon: GroupsIcon,
      color: isDark ? '#60a5fa' : '#2563eb', // Azul
    },
    {
      title: 'Promedio/Paralelo',
      value: safePromedio,
      subtitle: 'Estudiantes',
      icon: PersonIcon,
      color: isDark ? '#34d399' : '#059669', // Verde
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
      color: safeTasa >= 90 
        ? (isDark ? '#fb923c' : '#ea580c') // Naranja
        : (isDark ? '#facc15' : '#ca8a04'), // Amarillo/Verde
      showWarning: safeTasa >= 90,
    }
  ];

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Grid size={{xs:12, sm:6, md:3}} key={index}>
            <Card sx={{
              background: `linear-gradient(135deg, ${alpha(stat.color, 0.15)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
              border: `2px solid ${alpha(stat.color, 0.3)}`,
              borderRadius: { xs: 2, md: 3 },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 40px ${alpha(stat.color, 0.3)}`,
              }
            }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1.5, md: 2 },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}>
                  <Avatar sx={{
                    bgcolor: stat.color,
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    boxShadow: `0 4px 12px ${alpha(stat.color, 0.4)}`
                  }}>
                    <Icon sx={{ fontSize: { xs: 24, md: 32 } }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="overline" 
                      fontWeight="600" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      fontWeight="800" 
                      sx={{ 
                        color: stat.color,
                        fontSize: { xs: '1.75rem', md: '3rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: stat.showWarning ? stat.color : 'text.secondary',
                        fontSize: { xs: '0.65rem', md: '0.75rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {stat.showWarning && <WarningAmberIcon sx={{ fontSize: { xs: 12, md: 14 } }} />}
                      {paralelosBajoMinimo > 0 && index === 3 && !stat.showWarning && (
                        <TrendingDownIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                      )}
                      {stat.subtitle}
                    </Typography>
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