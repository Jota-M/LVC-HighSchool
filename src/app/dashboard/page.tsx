// pages/Dashboard.tsx - OPTIMIZADO con colores Amarillo/Azul
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDashboard } from '@/hooks/useDashboard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  
  const { data, loading, error, refetch, stats } = useDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getIconoActividad = (accion: string) => {
    const iconos: Record<string, any> = {
      crear: PersonAddIcon,
      actualizar: EditIcon,
      eliminar: DeleteIcon,
      login: CheckCircleIcon,
    };
    for (const [key, Icon] of Object.entries(iconos)) {
      if (accion.toLowerCase().includes(key)) return Icon;
    }
    return VisibilityIcon;
  };

  const formatFecha = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Colores Amarillo/Azul según modo
  const primaryGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';
  
  const primaryColor = isDark ? '#facc15' : '#0288d1';

  // Datos simulados para gráfica de tendencia
  const trendData = [
    { name: 'Ene', value: stats.totalEstudiantes * 0.85 },
    { name: 'Feb', value: stats.totalEstudiantes * 0.88 },
    { name: 'Mar', value: stats.totalEstudiantes * 0.92 },
    { name: 'Abr', value: stats.totalEstudiantes * 0.95 },
    { name: 'May', value: stats.totalEstudiantes },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: primaryColor, mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Cargando dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '16px' }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const estadisticas = [
    {
      titulo: 'Total Estudiantes',
      valor: stats.totalEstudiantes,
      activos: stats.estudiantesActivos,
      icon: SchoolIcon,
      cambio: 12.5,
      gradient: primaryGradient,
      color: primaryColor,
    },
    {
      titulo: 'Total Docentes',
      valor: stats.totalDocentes,
      activos: stats.docentesActivos,
      icon: PersonIcon,
      cambio: 5.2,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      color: '#a78bfa',
    },
    {
      titulo: 'Total Usuarios',
      valor: stats.totalUsuarios,
      activos: stats.usuariosActivos,
      icon: PeopleIcon,
      cambio: 8.7,
      gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      color: '#34d399',
    },
    {
      titulo: 'Matrículas Activas',
      valor: stats.matriculasActivas,
      activos: stats.matriculasActivas,
      icon: AssignmentIcon,
      cambio: -2.3,
      gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      color: '#fb923c',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: primaryGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Panel de Administración
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary' }}>
                Resumen general del sistema educativo
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              {data?.periodo && (
                <Chip
                  icon={<CalendarIcon sx={{ fontSize: 18 }} />}
                  label={data.periodo.nombre}
                  sx={{
                    height: 40,
                    px: 2,
                    background: isDark
                      ? alpha(primaryColor, 0.15)
                      : alpha(primaryColor, 0.1),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? alpha(primaryColor, 0.3) : alpha(primaryColor, 0.2)}`,
                    color: primaryColor,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: primaryColor },
                  }}
                />
              )}
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  background: isDark
                    ? alpha(primaryColor, 0.15)
                    : alpha(primaryColor, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? alpha(primaryColor, 0.3) : alpha(primaryColor, 0.2)}`,
                  '&:hover': {
                    background: isDark
                      ? alpha(primaryColor, 0.25)
                      : alpha(primaryColor, 0.15),
                  },
                }}
              >
                <RefreshIcon
                  sx={{
                    color: primaryColor,
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {estadisticas.map((stat, index) => {
            const Icon = stat.icon;
            const porcentajeActivos = stat.valor > 0 ? Math.round((stat.activos / stat.valor) * 100) : 0;
            const isTrendingUp = stat.cambio >= 0;

            return (
              <Grid size={{xs:12, sm:6, lg:3}}key={index}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark
                        ? `0 12px 40px ${alpha(stat.color, 0.2)}`
                        : `0 12px 40px ${alpha(stat.color, 0.15)}`,
                      border: `1px solid ${alpha(stat.color, 0.3)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: stat.gradient,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                              fontSize: '0.7rem',
                            }}
                          >
                            {stat.titulo}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              color: isDark ? '#fff' : '#000',
                              fontWeight: 700,
                              mt: 1,
                              fontSize: '2rem',
                            }}
                          >
                            {stat.valor.toLocaleString()}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '14px',
                            background: stat.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px ${alpha(stat.color, 0.4)}`,
                          }}
                        >
                          <Icon sx={{ fontSize: 28, color: '#fff' }} />
                        </Box>
                      </Box>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                background: isTrendingUp
                                  ? alpha('#10b981', 0.1)
                                  : alpha('#f59e0b', 0.1),
                              }}
                            >
                              {isTrendingUp ? (
                                <ArrowUpwardIcon sx={{ fontSize: 14, color: '#10b981' }} />
                              ) : (
                                <ArrowDownwardIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                              )}
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: isTrendingUp ? '#10b981' : '#f59e0b',
                                  ml: 0.5,
                                }}
                              >
                                {Math.abs(stat.cambio)}%
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                            }}
                          >
                            {stat.activos} activos
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={porcentajeActivos}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              background: stat.gradient,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={2.5}>
          {/* Gráfica de Tendencia */}
          <Grid size={{xs:12, lg:8}}>
            <Card
              sx={{
                background: isDark ? 'rgba(26, 26, 46, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: 420,
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 700, mb: 0.5 }}>
                    Tendencia de Estudiantes
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Últimos 5 meses
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                        style={{ fontSize: '0.75rem' }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                        style={{ fontSize: '0.75rem' }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: '12px',
                          color: isDark ? '#fff' : '#000',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={primaryColor}
                        strokeWidth={3}
                        fill="url(#colorTrend)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución por Grado */}
          <Grid size={{xs:12, lg:4}}>
            <Card
              sx={{
                background: isDark ? 'rgba(26, 26, 46, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: 420,
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 700, mb: 0.5 }}>
                    Por Grado
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Distribución actual
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {data?.estudiantes?.distribucion_por_grado && data.estudiantes.distribucion_por_grado.length > 0 ? (
                    <Stack spacing={2}>
                      {data.estudiantes.distribucion_por_grado.map((item: any, index: number) => {
                        const colors = [primaryColor, '#a78bfa', '#34d399', '#fb923c'];
                        const color = colors[index % colors.length];
                        const porcentaje = ((item.cantidad / stats.totalEstudiantes) * 100).toFixed(1);

                        return (
                          <Box key={index}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>
                                {item.grado}
                              </Typography>
                              <Typography variant="body2" sx={{ color: color, fontWeight: 700 }}>
                                {item.cantidad}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={parseFloat(porcentaje)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                '& .MuiLinearProgress-bar': {
                                  background: color,
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mt: 0.5, display: 'block' }}
                            >
                              {porcentaje}% del total
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                        No hay datos
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Actividad Reciente */}
          <Grid size={{xs:12}}>
            <Card
              sx={{
                background: isDark ? 'rgba(26, 26, 46, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 700, mb: 0.5 }}>
                    Actividad Reciente
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Últimos eventos del sistema
                  </Typography>
                </Box>

                <List sx={{ p: 0 }}>
                  {data?.actividad && data.actividad.length > 0 ? (
                    data.actividad.slice(0, 5).map((item, index) => {
                      const Icon = getIconoActividad(item.accion);
                      const colors = [primaryColor, '#a78bfa', '#34d399', '#fb923c'];
                      const color = colors[index % colors.length];

                      return (
                        <React.Fragment key={item.id}>
                          <ListItem
                            sx={{
                              px: 0,
                              py: 2,
                              '&:hover': {
                                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                                  boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                                }}
                              >
                                <Icon sx={{ fontSize: 20 }} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>
                                  {item.mensaje}
                                </Typography>
                              }
                              secondary={
                                <Typography component="span" variant="body2">
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}
                                    >
                                      {item.username}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
                                    >
                                      · {formatFecha(item.created_at)}
                                    </Typography>
                                  </Stack>
                                </Typography>
                              }
                            />

                            <Chip
                              label={item.resultado}
                              size="small"
                              sx={{
                                background:
                                  item.resultado === 'exitoso'
                                    ? alpha('#10b981', 0.1)
                                    : alpha('#f59e0b', 0.1),
                                color: item.resultado === 'exitoso' ? '#10b981' : '#f59e0b',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            />
                          </ListItem>
                          {index < data.actividad.length - 1 && (
                            <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} />
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <Typography variant="body2" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', textAlign: 'center', py: 4 }}>
                      No hay actividad reciente
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;