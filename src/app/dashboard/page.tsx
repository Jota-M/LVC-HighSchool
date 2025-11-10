// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  alpha,
  AvatarGroup,
  Fade,
  Grow,
  Slide,
} from '@mui/material';
import {
  School,
  People,
  MenuBook,
  TrendingUp,
  Notifications,
  CalendarToday,
  CheckCircle,
  Warning,
  Info,
  EmojiEvents,
  Schedule,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Star,
  LocalFireDepartment,
  Bolt,
} from '@mui/icons-material';

export default function AdminDashboard() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const stats = [
    {
      title: 'Total Estudiantes',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: School,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      lightBg: alpha(theme.palette.primary.main, 0.1),
      shadowColor: alpha(theme.palette.primary.main, 0.4),
    },
    {
      title: 'Profesores Activos',
      value: '87',
      change: '+3',
      trend: 'up',
      icon: People,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
      lightBg: alpha(theme.palette.secondary.main, 0.1),
      shadowColor: alpha(theme.palette.secondary.main, 0.4),
    },
    {
      title: 'Cursos Activos',
      value: '56',
      change: '+8',
      trend: 'up',
      icon: MenuBook,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
      lightBg: alpha(theme.palette.success.main, 0.1),
      shadowColor: alpha(theme.palette.success.main, 0.4),
    },
    {
      title: 'Asistencia Hoy',
      value: '94.3%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
      lightBg: alpha(theme.palette.warning.main, 0.1),
      shadowColor: alpha(theme.palette.warning.main, 0.4),
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Nuevo estudiante registrado',
      detail: 'María González - 3er Grado',
      time: 'Hace 15 min',
      type: 'success',
      icon: CheckCircle,
      avatar: 'MG',
    },
    {
      id: 2,
      action: 'Calificaciones actualizadas',
      detail: 'Matemáticas - 5to Grado',
      time: 'Hace 1 hora',
      type: 'info',
      icon: Info,
      avatar: 'CA',
    },
    {
      id: 3,
      action: 'Evento programado',
      detail: 'Reunión de padres - 20 Nov',
      time: 'Hace 2 horas',
      type: 'warning',
      icon: Warning,
      avatar: 'EP',
    },
    {
      id: 4,
      action: 'Nueva tarea asignada',
      detail: 'Ciencias Naturales - 4to Grado',
      time: 'Hace 3 horas',
      type: 'info',
      icon: Info,
      avatar: 'NT',
    },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Reunión de Profesores', date: '08 Nov', time: '10:00 AM', attendees: 25 },
    { id: 2, title: 'Examen Final - Matemáticas', date: '12 Nov', time: '09:00 AM', attendees: 180 },
    { id: 3, title: 'Día del Estudiante', date: '15 Nov', time: 'Todo el día', attendees: 1247 },
    { id: 4, title: 'Reunión de Padres', date: '20 Nov', time: '03:00 PM', attendees: 150 },
  ];

  const topPerformers = [
    { 
      id: 1, 
      name: 'Carlos Mendoza', 
      grade: '6to Grado', 
      avg: 98.5, 
      position: 1,
      subjects: ['Matemáticas', 'Ciencias', 'Historia'],
      streak: 15,
    },
    { 
      id: 2, 
      name: 'Ana Rodríguez', 
      grade: '5to Grado', 
      avg: 97.8, 
      position: 2,
      subjects: ['Literatura', 'Arte', 'Música'],
      streak: 12,
    },
    { 
      id: 3, 
      name: 'Luis Torres', 
      grade: '4to Grado', 
      avg: 96.9, 
      position: 3,
      subjects: ['Deportes', 'Ciencias', 'Inglés'],
      streak: 10,
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: alpha(theme.palette.success.main, 0.15),
          color: theme.palette.success.main,
          darkBg: alpha(theme.palette.success.main, 0.25),
        };
      case 'warning':
        return {
          bg: alpha(theme.palette.warning.main, 0.15),
          color: theme.palette.warning.main,
          darkBg: alpha(theme.palette.warning.main, 0.25),
        };
      case 'info':
      default:
        return {
          bg: alpha(theme.palette.info.main, 0.15),
          color: theme.palette.info.main,
          darkBg: alpha(theme.palette.info.main, 0.25),
        };
    }
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getMedalGradient = (position: number) => {
    switch (position) {
      case 1:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 2:
        return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 3:
        return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header con efecto glassmorphism */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          borderBottom: 1,
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backdropFilter: 'blur(20px)',
          color: 'white',
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Fade in={mounted} timeout={800}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    mb: 0.5,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}>
                    🎓 Colegio San Ignacio
                  </Typography>
                  <Chip 
                    icon={<Bolt sx={{ fontSize: 16 }} />}
                    label="En vivo"
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 'bold',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'capitalize' }}>
                    📅 {currentDate}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    🕐 {currentTime}
                  </Typography>
                </Box>
              </Box>
            </Fade>
            <Fade in={mounted} timeout={1000}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  sx={{ 
                    color: 'white',
                    bgcolor: alpha('#fff', 0.1),
                    '&:hover': { bgcolor: alpha('#fff', 0.2) },
                    transition: 'all 0.3s',
                  }}
                >
                  <Badge 
                    badgeContent={4} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        animation: 'bounce 1s infinite',
                        '@keyframes bounce': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.2)' },
                        },
                      },
                    }}
                  >
                    <Notifications />
                  </Badge>
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" fontWeight="600">
                      Admin Principal
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      ⭐ Administrador
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main', 
                      fontWeight: 'bold',
                      border: '3px solid',
                      borderColor: alpha('#fff', 0.3),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    AP
                  </Avatar>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 4 }}>
        {/* Stats Cards con animaciones */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Grow in={mounted} timeout={600 + index * 150}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
                      : 'white',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${stat.shadowColor}`,
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 3,
                          background: stat.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 16px ${stat.shadowColor}`,
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'rotate(10deg) scale(1.1)',
                          },
                        }}
                      >
                        <stat.icon sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                      <Chip
                        icon={stat.trend === 'up' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                        label={stat.change}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.15),
                          color: 'success.main',
                          fontWeight: 'bold',
                          height: 28,
                          '& .MuiChip-icon': {
                            color: 'success.main',
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      color="text.primary"
                      sx={{
                        background: stat.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Two Column Layout */}
        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Slide direction="right" in={mounted} timeout={800}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  height: '100%',
                  background: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.paper, 0.6)
                    : 'white',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalFireDepartment sx={{ color: 'error.main', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Actividad Reciente
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {recentActivities.map((activity, index) => (
                      <Fade in={mounted} timeout={1000 + index * 100} key={activity.id}>
                        <Box>
                          <ListItem
                            sx={{
                              borderRadius: 3,
                              mb: 1,
                              px: 2,
                              py: 1.5,
                              transition: 'all 0.3s',
                              bgcolor: 'transparent',
                              '&:hover': { 
                                bgcolor: getActivityColor(activity.type).bg,
                                transform: 'translateX(8px)',
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  background: `linear-gradient(135deg, ${getActivityColor(activity.type).color} 0%, ${alpha(getActivityColor(activity.type).color, 0.7)} 100%)`,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  boxShadow: `0 4px 12px ${alpha(getActivityColor(activity.type).color, 0.4)}`,
                                }}
                              >
                                {activity.avatar}
                              </Avatar>
                            </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                                {activity.action}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                component="div" // 👈 Esto evita el <p>
                                variant="body2"
                                color="text.secondary"
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.detail}
                                  </Typography>
                                  <Chip 
                                    label={activity.time}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: alpha(theme.palette.text.secondary, 0.08),
                                    }}
                                  />
                                </Box>
                              </Typography>
                            }
                          />
  
                          </ListItem>
                          {index < recentActivities.length - 1 && (
                            <Divider sx={{ mx: 2, opacity: 0.3 }} />
                          )}
                        </Box>
                      </Fade>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Right Column */}
          <Grid size={{xs:12, lg:4}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Upcoming Events */}
              <Slide direction="left" in={mounted} timeout={800}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.paper, 0.6)
                      : 'white',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                      <CalendarToday sx={{ color: 'primary.main', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Próximos Eventos
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {upcomingEvents.map((event, index) => (
                        <Fade in={mounted} timeout={1200 + index * 100} key={event.id}>
                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                              borderLeft: '4px solid',
                              borderColor: 'primary.main',
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                              {event.title}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                  {event.date} • {event.time}
                                </Typography>
                              </Box>
                              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10 } }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>+{event.attendees}</Avatar>
                              </AvatarGroup>
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Slide>

              {/* Top Performers */}
              <Slide direction="left" in={mounted} timeout={1000}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.paper, 0.6)
                      : 'white',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                      <EmojiEvents sx={{ color: 'warning.main', fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Mejores Estudiantes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {topPerformers.map((student, index) => (
                        <Fade in={mounted} timeout={1400 + index * 100} key={student.id}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '50%',
                                  background: getMedalGradient(student.position),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 24,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    transform: 'scale(1.1) rotate(10deg)',
                                  },
                                }}
                              >
                                {getMedalEmoji(student.position)}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="600" noWrap>
                                    {student.name}
                                  </Typography>
                                  <Chip
                                    icon={<Star sx={{ fontSize: 12 }} />}
                                    label={`${student.streak} días`}
                                    size="small"
                                    sx={{ 
                                      height: 20,
                                      fontSize: '0.65rem',
                                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                                      color: 'warning.main',
                                      '& .MuiChip-icon': { color: 'warning.main' },
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {student.grade}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${student.avg}%`}
                                sx={{
                                  background: getMedalGradient(student.position),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={student.avg}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.action.hover, 0.5),
                                '& .MuiLinearProgress-bar': {
                                  background: getMedalGradient(student.position),
                                  borderRadius: 4,
                                  transition: 'all 1s ease-out',
                                },
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                              {student.subjects.map((subject, idx) => (
                                <Chip
                                  key={idx}
                                  label={subject}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}