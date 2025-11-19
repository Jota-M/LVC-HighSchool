import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Avatar,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface NivelesStatsProps {
  totalNiveles: number;
  totalGrados: number;
  totalEstudiantes?: number;
  totalMaterias?: number;
}

export const NivelesStats: React.FC<NivelesStatsProps> = ({
  totalNiveles,
  totalGrados,
  totalEstudiantes = 0,
  totalMaterias = 0
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Niveles Académicos */}
      <Grid  size={{xs:12, sm:6, md:3}}>
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
                <SchoolIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Niveles Académicos
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                  {totalNiveles}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Grados */}
      <Grid  size={{xs:12, sm:6, md:3}}>
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
                  Total Grados
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#4ECDC4' }}>
                  {totalGrados}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Estudiantes */}
      <Grid  size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
          }
        }}>
          <CardActionArea sx={{ height: '100%' }}>
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
                    Estudiantes
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="primary.main">
                    {totalEstudiantes}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                    +12% este año
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>

      {/* Materias */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }
        }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  bgcolor: 'secondary.main',
                  width: 56,
                  height: 56,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}`
                }}>
                  <GradeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" fontWeight="600" color="text.secondary">
                    Materias Totales
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="secondary.main">
                    {totalMaterias}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  );
};