// components/cursosVacacionales/PeriodoInfo.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarMonth,
  EventAvailable,
  TrendingUp,
  AcUnit,
  WbSunny,
} from '@mui/icons-material';
import { PeriodoVacacional } from '@/types/cursoVacacionalTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PeriodoInfoProps {
  periodo: PeriodoVacacional;
}

export const PeriodoInfo: React.FC<PeriodoInfoProps> = ({ periodo }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'd/MM/yyyy HH:mm');
    } catch {
      return fecha;
    }
  };

  const getTipoIcon = () => {
    return periodo.tipo === 'verano' ? (
      <WbSunny sx={{ fontSize: 40, color: '#f59e0b' }} />
    ) : (
      <AcUnit sx={{ fontSize: 40, color: '#3b82f6' }} />
    );
  };

  const getTipoColor = () => {
    return periodo.tipo === 'verano' ? '#f59e0b' : '#3b82f6';
  };

  return (
    <Card
      sx={{
        borderRadius: '24px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${alpha(getTipoColor(), 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${alpha(getTipoColor(), 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '20px',
              bgcolor: alpha(getTipoColor(), 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getTipoIcon()}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {periodo.nombre}
              </Typography>
              
              <Chip
                label={periodo.tipo === 'verano' ? 'Verano' : 'Invierno'}
                sx={{
                  bgcolor: alpha(getTipoColor(), 0.1),
                  color: getTipoColor(),
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: 0.5,
                }}
              />

              {periodo.activo && (
                <Chip
                  label="Activo"
                  size="small"
                  color="success"
                  sx={{
                    fontWeight: 600,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              )}

              {periodo.permite_inscripciones && (
                <Chip
                  label="Inscripciones Abiertas"
                  size="small"
                  sx={{
                    bgcolor: alpha('#10b981', 0.1),
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            {periodo.codigo && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Código: {periodo.codigo}
              </Typography>
            )}

            {periodo.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {periodo.descripcion}
              </Typography>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12, sm:6, md:3}} >
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonth sx={{ fontSize: 20, color: getTipoColor() }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Periodo del Curso
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatFecha(periodo.fecha_inicio)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                hasta
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatFecha(periodo.fecha_fin)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}} >
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventAvailable sx={{ fontSize: 20, color: '#10b981' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Inscripciones
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatFecha(periodo.fecha_inicio_inscripciones)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                hasta
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatFecha(periodo.fecha_fin_inscripciones)}
              </Typography>
            </Box>
          </Grid>

          {periodo.total_cursos !== undefined && (
            <Grid size={{xs:12, sm:6, md:3}} >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ fontSize: 20, color: '#3b82f6' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Cursos Disponibles
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {periodo.total_cursos}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  cursos activos
                </Typography>
              </Box>
            </Grid>
          )}

          {periodo.total_inscritos !== undefined && (
            <Grid size={{xs:12, sm:6, md:3}} >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ fontSize: 20, color: '#10b981' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total Inscritos
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {periodo.total_inscritos}
                </Typography>
                {periodo.total_cupos && (
                  <Typography variant="caption" color="text.secondary">
                    de {periodo.total_cupos} cupos
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};