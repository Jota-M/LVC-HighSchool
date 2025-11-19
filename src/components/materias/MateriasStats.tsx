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
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface MateriasStatsProps {
  totalAreas: number;
  totalMaterias: number;
  totalHoras?: number;
  totalCreditos?: number;
}

export const MateriasStats: React.FC<MateriasStatsProps> = ({
  totalAreas,
  totalMaterias,
  totalHoras = 0,
  totalCreditos = 0
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Áreas de Conocimiento */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha('#8B5CF6', 0.15)} 0%, ${alpha('#8B5CF6', 0.05)} 100%)`,
          border: `2px solid ${alpha('#8B5CF6', 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha('#8B5CF6', 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: '#8B5CF6',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha('#8B5CF6', 0.4)}`
              }}>
                <CategoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Áreas de Conocimiento
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#8B5CF6' }}>
                  {totalAreas}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Materias */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.15)} 0%, ${alpha('#3B82F6', 0.05)} 100%)`,
          border: `2px solid ${alpha('#3B82F6', 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha('#3B82F6', 0.3)}`,
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: '#3B82F6',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.4)}`
              }}>
                <MenuBookIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" fontWeight="600" color="text.secondary">
                  Total Materias
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#3B82F6' }}>
                  {totalMaterias}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Horas Semanales */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
          border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.warning.main, 0.3)}`,
          }
        }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  bgcolor: 'warning.main',
                  width: 56,
                  height: 56,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`
                }}>
                  <AccessTimeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" fontWeight="600" color="text.secondary">
                    Carga Horaria
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="warning.main">
                    {totalHoras}h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    por semana
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>

      {/* Total Créditos */}
      <Grid size={{xs:12, sm:6, md:3}}>
        <Card sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
          border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.3)}`,
          }
        }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  bgcolor: 'success.main',
                  width: 56,
                  height: 56,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`
                }}>
                  <EmojiEventsIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" fontWeight="600" color="text.secondary">
                    Total Créditos
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="success.main">
                    {totalCreditos}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                    Acumulados
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