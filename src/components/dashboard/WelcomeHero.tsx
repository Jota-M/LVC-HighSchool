// components/dashboard/WelcomeHero.tsx
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
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  Nightlight as NightlightIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

interface WelcomeHeroProps {
  periodo: any;
  onRefresh: () => void;
  refreshing: boolean;
  stats: {
    totalEstudiantes: number;
    totalDocentes: number;
    estudiantesActivos: number;
  };
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  periodo,
  onRefresh,
  refreshing,
  stats,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buenos días', icon: LightModeIcon, color: '#fbbf24' };
    if (hour < 18) return { text: 'Buenas tardes', icon: LightModeIcon, color: '#f59e0b' };
    return { text: 'Buenas noches', icon: NightlightIcon, color: '#8b5cf6' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('es-ES', options);
  };

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '32px',
        background: isDark
          ? `linear-gradient(135deg, ${alpha('#1e293b', 0.6)} 0%, ${alpha('#0f172a', 0.8)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#f8fafc', 0.95)} 100%)`,
        backdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        boxShadow: isDark
          ? `0 20px 60px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.1)}`
          : `0 20px 60px ${alpha('#000', 0.1)}, inset 0 1px 0 ${alpha('#fff', 0.9)}`,
        mb: 4,
      }}
    >
      {/* Orbes decorativos animados */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${alpha('#facc15', 0.15)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha('#0288d1', 0.15)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-30px, -30px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${alpha('#8b5cf6', 0.12)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha('#8b5cf6', 0.12)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      {/* Brillo superior */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(180deg, ${alpha('#fff', 0.12)} 0%, transparent 100%)`,
          borderRadius: '32px 32px 0 0',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
          }}
        >
          {/* Sección izquierda - Saludo */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: `linear-gradient(135deg, ${greeting.color}, ${alpha(greeting.color, 0.7)})`,
                  boxShadow: `0 8px 24px ${alpha(greeting.color, 0.4)}`,
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                }}
              >
                <GreetingIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  {greeting.text}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                >
                  {getCurrentDate()}
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              Bienvenido al panel de administración. Gestiona estudiantes, docentes y todo el sistema
              educativo desde un solo lugar.
            </Typography>

            {/* Quick stats */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }} flexWrap="wrap">
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  background: isDark
                    ? alpha('#facc15', 0.1)
                    : alpha('#0288d1', 0.1),
                  border: `1px solid ${isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <GroupsIcon sx={{ fontSize: 24, color: isDark ? '#facc15' : '#0288d1' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                    Estudiantes Activos
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {stats.estudiantesActivos.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  background: alpha('#10b981', 0.1),
                  border: `1px solid ${alpha('#10b981', 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 24, color: '#10b981' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                    Tasa de Actividad
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {stats.totalEstudiantes > 0
                      ? Math.round((stats.estudiantesActivos / stats.totalEstudiantes) * 100)
                      : 0}
                    %
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Sección derecha - Periodo y acciones */}
          <Box>
            <Stack spacing={2} alignItems="flex-end">
              {periodo && (
                <Chip
                  icon={<CalendarIcon />}
                  label={periodo.nombre}
                  sx={{
                    height: 48,
                    px: 3,
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                    '& .MuiChip-icon': { color: '#fff', fontSize: 24 },
                    border: `2px solid ${alpha('#10b981', 0.3)}`,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}

              <IconButton
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  width: 56,
                  height: 56,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.1)} 100%)`
                    : `linear-gradient(135deg, ${alpha('#0288d1', 0.15)} 0%, ${alpha('#01579b', 0.1)} 100%)`,
                  border: `2px solid ${isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.25)} 0%, ${alpha('#f59e0b', 0.2)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#0288d1', 0.25)} 0%, ${alpha('#01579b', 0.2)} 100%)`,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 28,
                    color: isDark ? '#facc15' : '#0288d1',
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};