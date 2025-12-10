// components/dashboard/AdvancedChart.tsx
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
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { GradoDistribucion } from '@/types/dashboardTypes';

interface AdvancedChartProps {
  data: GradoDistribucion[];
  totalEstudiantes: number;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({ data, totalEstudiantes }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const colors = [
    { start: '#3b82f6', end: '#2563eb' },
    { start: '#8b5cf6', end: '#7c3aed' },
    { start: '#10b981', end: '#059669' },
    { start: '#f59e0b', end: '#d97706' },
    { start: '#ef4444', end: '#dc2626' },
    { start: '#06b6d4', end: '#0891b2' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const porcentaje = ((data.cantidad / totalEstudiantes) * 100).toFixed(1);
      return (
        <Box
          sx={{
            background: isDark
              ? alpha('#1e293b', 0.98)
              : alpha('#ffffff', 0.98),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            borderRadius: '16px',
            p: 2,
            boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
            {data.grado}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Estudiantes: <strong>{data.cantidad}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Porcentaje: <strong>{porcentaje}%</strong>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card
      sx={{
        borderRadius: '28px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#1e293b', 0.4)} 0%, ${alpha('#0f172a', 0.7)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
        backdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
        boxShadow: isDark
          ? `0 8px 32px ${alpha('#000', 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.05)}`
          : `0 8px 32px ${alpha('#000', 0.08)}, inset 0 1px 0 ${alpha('#fff', 0.8)}`,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#facc15', 0.08)} 0%, ${alpha('#f59e0b', 0.04)} 100%)`
              : `linear-gradient(135deg, ${alpha('#0288d1', 0.08)} 0%, ${alpha('#01579b', 0.04)} 100%)`,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Distribución por Nivel
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total: {totalEstudiantes.toLocaleString()} estudiantes
              </Typography>
            </Box>
            <Chip
              label={`${data.length} niveles`}
              sx={{
                height: 32,
                fontWeight: 700,
                background: isDark
                  ? alpha('#facc15', 0.15)
                  : alpha('#0288d1', 0.15),
                color: isDark ? '#facc15' : '#0288d1',
                border: `1px solid ${isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3)}`,
              }}
            />
          </Box>
        </Box>

        {/* Gráfica */}
        <Box sx={{ flex: 1, p: 3 }}>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  {data.map((_, index) => {
                    const color = colors[index % colors.length];
                    return (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`colorGradient${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color.start} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color.end} stopOpacity={0.7} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}
                  vertical={false}
                />
                <XAxis
                  dataKey="grado"
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }} />
                <Bar
                  dataKey="cantidad"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1500}
                  animationBegin={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#colorGradient${index})`}
                      style={{
                        filter: `drop-shadow(0 4px 12px ${alpha(colors[index % colors.length].start, 0.4)})`,
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                No hay datos disponibles
              </Typography>
            </Box>
          )}
        </Box>

        {/* Leyenda */}
        <Box
          sx={{
            p: 3,
            pt: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {data.map((item, index) => {
            const color = colors[index % colors.length];
            const porcentaje = ((item.cantidad / totalEstudiantes) * 100).toFixed(1);
            return (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: isDark
                    ? alpha('#fff', 0.04)
                    : alpha('#000', 0.03),
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color.start}, ${color.end})`,
                    boxShadow: `0 2px 8px ${alpha(color.start, 0.4)}`,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {item.grado}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {porcentaje}%
                </Typography>
              </Stack>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};