// components/dashboard/DistributionChart.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  alpha,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import { BarChart as BarChartIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { GradoDistribucion } from '@/types/dashboardTypes';

interface DistributionChartProps {
  data: GradoDistribucion[];
  totalEstudiantes: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data, totalEstudiantes }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const colors = [
    { light: '#3b82f6', dark: '#facc15' },
    { light: '#8b5cf6', dark: '#f59e0b' },
    { light: '#10b981', dark: '#34d399' },
    { light: '#f59e0b', dark: '#fb923c' },
    { light: '#ef4444', dark: '#f87171' },
    { light: '#06b6d4', dark: '#22d3ee' },
  ];

  const getColorForIndex = (index: number) => {
    const colorPair = colors[index % colors.length];
    return isDark ? colorPair.dark : colorPair.light;
  };

  const maxCantidad = Math.max(...data.map((item) => item.cantidad), 1);

  return (
    <Card
      sx={{
        borderRadius: '24px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            background: isDark ? alpha('#facc15', 0.05) : alpha('#0288d1', 0.05),
            borderBottom: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em',
                }}
              >
                Distribución por Grado
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total: {totalEstudiantes.toLocaleString()} estudiantes
              </Typography>
            </Box>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ p: 3, flex: 1 }}>
          {data && data.length > 0 ? (
            <Stack spacing={3}>
              {data.map((item, index) => {
                const porcentaje = totalEstudiantes > 0 ? (item.cantidad / totalEstudiantes) * 100 : 0;
                const widthPercentage = maxCantidad > 0 ? (item.cantidad / maxCantidad) * 100 : 0;
                const color = getColorForIndex(index);

                return (
                  <Box
                    key={index}
                    sx={{
                      animation: `fadeInLeft 0.6s ease-out ${index * 0.1}s both`,
                      '@keyframes fadeInLeft': {
                        from: {
                          opacity: 0,
                          transform: 'translateX(-30px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  >
                    {/* Label y valor */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
                            boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                          }}
                        >
                          {item.grado}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: color,
                          }}
                        >
                          {item.cantidad.toLocaleString()}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${porcentaje.toFixed(1)}%`}
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: alpha(color, 0.1),
                            color: color,
                            border: `1px solid ${alpha(color, 0.2)}`,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Barra de progreso */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 16,
                        borderRadius: 2,
                        background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${widthPercentage}%`,
                          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                          borderRadius: 2,
                          transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `inset 0 1px 2px ${alpha('#fff', 0.2)}`,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: `linear-gradient(180deg, ${alpha('#fff', 0.2)} 0%, transparent 100%)`,
                            borderRadius: '2px 2px 0 0',
                          },
                        }}
                      />
                    </Box>

                    {/* Detalle inferior */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        {widthPercentage.toFixed(1)}% del máximo
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        {maxCantidad.toLocaleString()} estudiantes
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 4,
              }}
            >
              <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                No hay datos de distribución
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};