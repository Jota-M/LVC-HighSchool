import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Avatar,
  Box,
  LinearProgress,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { PeriodoAcademico } from '../../services/periodos';
import periodosService from '../../services/periodos';

interface PeriodoStatsProps {
  periodoActivo: PeriodoAcademico | null;
  totalEstudiantes?: number;
  totalDocentes?: number;
  totalMaterias?: number;
}

export const PeriodoStats: React.FC<PeriodoStatsProps> = ({
  periodoActivo,
  totalEstudiantes = 0,
  totalDocentes = 0,
  totalMaterias = 0
}) => {
  const theme = useTheme();

  const diasRestantes = periodoActivo 
    ? periodosService.calcularDiasRestantes(periodoActivo.fecha_fin)
    : 0;

  const progreso = periodoActivo 
    ? periodosService.calcularProgreso(periodoActivo.fecha_inicio, periodoActivo.fecha_fin)
    : 0;

  return (
    <Grid container spacing={3}>
      {/* Periodo Activo */}
      <Grid size={{xs:12, md:6, lg:4}}>
        <Card 
          sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
            border: `2px solid ${theme.palette.success.main}`,
            borderRadius: 3,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.3)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 'bold', letterSpacing: 1 }}>
                  🎯 Periodo Activo
                </Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 1, mb: 0.5 }}>
                  {periodoActivo?.nombre || 'Sin periodo activo'}
                </Typography>
                {periodoActivo && (
                  <Typography variant="body2" color="text.secondary">
                    {periodosService.formatearFecha(periodoActivo.fecha_inicio, 'corto')} - {periodosService.formatearFecha(periodoActivo.fecha_fin, 'corto')}
                  </Typography>
                )}
              </Box>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: 56, 
                height: 56,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`
              }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            
            {periodoActivo && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="600">
                      Progreso del periodo
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="700">
                      {progreso.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progreso} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    <AccessTimeIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    {diasRestantes} días restantes
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Total Estudiantes */}
      <Grid size={{xs:12, sm:6, lg:4}}>
        <Card 
          sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
            borderRadius: 3,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          }}
        >
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 64, 
                  height: 64,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                }}>
                  <GroupsIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Total Estudiantes
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="primary.main">
                    {totalEstudiantes}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16 }} />
                    Activos en el periodo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>

      {/* Total Docentes */}
      <Grid size={{xs:12, sm:6, lg:4}}>
        <Card 
          sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
            borderRadius: 3,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 16px 32px ${alpha(theme.palette.secondary.main, 0.2)}`,
            }
          }}
        >
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'secondary.main', 
                  width: 64, 
                  height: 64,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                }}>
                  <SchoolIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Docentes Activos
                  </Typography>
                  <Typography variant="h3" fontWeight="800" color="secondary.main">
                    {totalDocentes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {totalMaterias} materias asignadas
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