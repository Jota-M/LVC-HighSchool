import React from 'react';
import {
  Grid, Card, CardContent, CardActionArea, Typography, Avatar,
  Box, LinearProgress, Divider, alpha, useTheme, Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { PeriodoAcademico } from '../../services/periodos';
import periodosService from '../../services/periodos';

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
  totalMaterias = 0,
}) => {
  const { primary, secondary, gradient, textOnPrimary } = usePalette();

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
        <Card sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(primary, 0.1)}, ${alpha(secondary, 0.04)})`,
          border: `2px solid ${primary}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative', overflow: 'hidden',
          '&:hover': { transform: 'translateY(-8px) scale(1.02)', boxShadow: `0 20px 40px ${alpha(primary, 0.3)}` },
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0,
            height: '4px', background: gradient,
          },
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: primary, fontWeight: 'bold', letterSpacing: 1 }}>
                  🎯 Periodo Activo
                </Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 1, mb: 0.5 }}>
                  {periodoActivo?.nombre || 'Sin periodo activo'}
                </Typography>
                {periodoActivo && (
                  <Typography variant="body2" color="text.secondary">
                    {periodosService.formatearFecha(periodoActivo.fecha_inicio, 'corto')} -{' '}
                    {periodosService.formatearFecha(periodoActivo.fecha_fin, 'corto')}
                  </Typography>
                )}
              </Box>
              <Avatar sx={{
                background: gradient, width: 56, height: 56,
                boxShadow: `0 4px 12px ${alpha(primary, 0.4)}`,
              }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: textOnPrimary }} />
              </Avatar>
            </Box>

            {periodoActivo && (
              <>
                <Divider sx={{ my: 2, borderColor: alpha(primary, 0.2) }} />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="600">Progreso del periodo</Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: primary }}>
                      {progreso.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progreso} sx={{
                    height: 8, borderRadius: 4, bgcolor: alpha(primary, 0.12),
                    '& .MuiLinearProgress-bar': { borderRadius: 4, background: gradient },
                  }} />
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
        <Card sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(primary, 0.08)}, ${alpha(secondary, 0.03)})`,
          border: `1px solid ${alpha(primary, 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-8px)', boxShadow: `0 16px 32px ${alpha(primary, 0.2)}` },
        }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  background: gradient, width: 64, height: 64,
                  boxShadow: `0 8px 16px ${alpha(primary, 0.35)}`,
                }}>
                  <GroupsIcon sx={{ fontSize: 36, color: textOnPrimary }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Total Estudiantes
                  </Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: primary }}>
                    {totalEstudiantes}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 15, color: '#10B981' }} />
                    <Typography variant="caption" sx={{ color: '#10B981' }}>
                      Activos en el periodo
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>

      {/* Docentes Activos */}
      <Grid size={{xs:12, sm:6, lg:4}}>
        <Card sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(secondary, 0.08)}, ${alpha(primary, 0.03)})`,
          border: `1px solid ${alpha(secondary, 0.25)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-8px)', boxShadow: `0 16px 32px ${alpha(secondary, 0.2)}` },
        }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  background: `linear-gradient(135deg, ${secondary}, ${primary})`,
                  width: 64, height: 64,
                  boxShadow: `0 8px 16px ${alpha(secondary, 0.35)}`,
                }}>
                  <SchoolIcon sx={{ fontSize: 36, color: textOnPrimary }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Docentes Activos
                  </Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: secondary }}>
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