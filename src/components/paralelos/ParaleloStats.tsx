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

  return (
    <Grid container spacing={3}>
      {/* Total Paralelos */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha('#4ECDC4', 0.15)} 0%, ${alpha('#4ECDC4', 0.05)} 100%)`,
          border: `2px solid ${alpha('#4ECDC4', 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha('#4ECDC4', 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: '#4ECDC4',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha('#4ECDC4', 0.4)}`
              }}>
                <ClassIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Total Paralelos
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#4ECDC4' }}>
                  {totalParalelos}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Secciones activas
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Estudiantes */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
              }}>
                <GroupsIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Total Estudiantes
                </Typography>
                <Typography variant="h3" fontWeight="800" color="primary.main">
                  {totalEstudiantes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  de {capacidadTotal} cupos
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Promedio por Paralelo */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha('#FF6B6B', 0.15)} 0%, ${alpha('#FF6B6B', 0.05)} 100%)`,
          border: `2px solid ${alpha('#FF6B6B', 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha('#FF6B6B', 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: '#FF6B6B',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha('#FF6B6B', 0.4)}`
              }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Promedio/Paralelo
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                  {promedioEstudiantes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estudiantes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tasa de Ocupación */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50', 0.15)} 0%, ${alpha(tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50', 0.05)} 100%)`,
          border: `2px solid ${alpha(tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50', 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50', 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha(tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50', 0.4)}`
              }}>
                {tasaOcupacion >= 90 ? <WarningAmberIcon sx={{ fontSize: 32 }} /> : <TrendingUpIcon sx={{ fontSize: 32 }} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Ocupación
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: tasaOcupacion >= 90 ? '#FF9800' : '#4CAF50' }}>
                  {tasaOcupacion}%
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: tasaOcupacion >= 90 ? 'error.main' : 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  {tasaOcupacion >= 90 ? (
                    <>
                      <WarningAmberIcon sx={{ fontSize: 14 }} />
                      Alta demanda
                    </>
                  ) : paralelosBajoMinimo > 0 ? (
                    <>
                      <TrendingDownIcon sx={{ fontSize: 14 }} />
                      {paralelosBajoMinimo} bajo mínimo
                    </>
                  ) : (
                    'Capacidad óptima'
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};