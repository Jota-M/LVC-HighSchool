// components/matriculacion/EstadisticasMatricula.tsx
'use client';
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  EmojiEvents as BecaIcon,
  Replay as RepiteIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { EstadisticasMatricula as EstadisticasType } from '@/types/matriculacionTypes';

interface Props {
  estadisticas: EstadisticasType | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 12px 24px rgba(0, 0, 0, 0.4)'
            : '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: 0.1,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={80} height={40} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export const EstadisticasMatricula: React.FC<Props> = ({ estadisticas, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porcentajeActivas = estadisticas?.resumen.total_matriculas
    ? ((estadisticas.resumen.activas / estadisticas.resumen.total_matriculas) * 100).toFixed(1)
    : 0;

  const porcentajeBecados = estadisticas?.resumen.total_matriculas
    ? ((estadisticas.resumen.becados / estadisticas.resumen.total_matriculas) * 100).toFixed(1)
    : 0;

  return (
    <Box>
      {/* Cards de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs:12, sm:6, md:4}} >
          <StatCard
            title="Total Matrículas"
            value={estadisticas?.resumen.total_matriculas || 0}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="#0288d1"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:4}}>
          <StatCard
            title="Matrículas Activas"
            value={estadisticas?.resumen.activas || 0}
            icon={<ActiveIcon sx={{ fontSize: 32 }} />}
            color="#4caf50"
            subtitle={`${porcentajeActivas}% del total`}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:4}}>
          <StatCard
            title="Estudiantes Retirados"
            value={estadisticas?.resumen.retirados || 0}
            icon={<InactiveIcon sx={{ fontSize: 32 }} />}
            color="#f44336"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:4}}>
          <StatCard
            title="Estudiantes Becados"
            value={estadisticas?.resumen.becados || 0}
            icon={<BecaIcon sx={{ fontSize: 32 }} />}
            color="#ff9800"
            subtitle={`${porcentajeBecados}% del total`}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:4}}>
          <StatCard
            title="Estudiantes Repitentes"
            value={estadisticas?.resumen.repitentes || 0}
            icon={<RepiteIcon sx={{ fontSize: 32 }} />}
            color="#9c27b0"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{xs:12, sm:6, md:4}}>
          <StatCard
            title="Paralelos Activos"
            value={estadisticas?.resumen.paralelos_con_estudiantes || 0}
            icon={<ClassIcon sx={{ fontSize: 32 }} />}
            color="#00bcd4"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Distribución por grado */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Distribución por Grado
        </Typography>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Skeleton width="30%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '10px' }} />
            </Box>
          ))
        ) : estadisticas?.por_grado.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay datos de distribución por grado
          </Typography>
        ) : (
          estadisticas?.por_grado.map((item, index) => {
            const porcentaje = estadisticas.resumen.total_matriculas
              ? ((item.total / estadisticas.resumen.total_matriculas) * 100).toFixed(1)
              : 0;

            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.grado}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.total} estudiantes ({porcentaje}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Number(porcentaje)}
                  sx={{
                    height: 10,
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '10px',
                      background: isDark
                        ? 'linear-gradient(90deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(90deg, #0288d1 0%, #01579b 100%)',
                    },
                  }}
                />
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
};