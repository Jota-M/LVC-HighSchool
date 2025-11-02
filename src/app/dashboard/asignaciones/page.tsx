'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Chip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  AvatarGroup,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import { keyframes } from '@mui/system';

const stats = [
  {
    title: 'Docentes Asignados',
    value: '67',
    total: '72',
    progress: 67 / 72,
    icon: <SchoolIcon />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    trend: '+5',
    trendUp: true,
  },
  {
    title: 'Estudiantes Inscritos',
    value: '892',
    total: '950',
    progress: 892 / 950,
    icon: <GroupsIcon />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    trend: '+23',
    trendUp: true,
  },
  {
    title: 'Materias Cubiertas',
    value: '45',
    total: '48',
    progress: 45 / 48,
    icon: <MenuBookIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    trend: '+2',
    trendUp: true,
  },
  {
    title: 'Asignaciones Pendientes',
    value: '12',
    total: '12',
    progress: 12 / 12,
    icon: <WarningAmberIcon />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    trend: '-3',
    trendUp: false,
  },
];

const recentAssignments = [
  {
    teacher: 'Prof. María González',
    subject: 'Matemáticas',
    grade: '3er Grado',
    students: 28,
    time: 'Hace 2 horas',
    avatar: 'MG',
    status: 'completed',
  },
  {
    teacher: 'Prof. Juan Pérez',
    subject: 'Ciencias Naturales',
    grade: '2do Grado',
    students: 25,
    time: 'Hace 5 horas',
    avatar: 'JP',
    status: 'completed',
  },
  {
    teacher: 'Prof. Ana Rodríguez',
    subject: 'Literatura',
    grade: '1er Grado',
    students: 30,
    time: 'Hace 1 día',
    avatar: 'AR',
    status: 'pending',
  },
];

const estructuraAcademica = [
  {
    nivel: 'Educación Primaria',
    icon: <SchoolIcon />,
    grados: [
      { nombre: '1er Grado', estudiantes: 145, docentes: 5, completo: true },
      { nombre: '2do Grado', estudiantes: 138, docentes: 5, completo: true },
      { nombre: '3er Grado', estudiantes: 142, docentes: 4, completo: false },
      { nombre: '4to Grado', estudiantes: 135, docentes: 5, completo: true },
      { nombre: '5to Grado', estudiantes: 128, docentes: 4, completo: true },
      { nombre: '6to Grado', estudiantes: 140, docentes: 5, completo: true },
    ],
    color: '#3b82f6',
  },
  {
    nivel: 'Educación Secundaria',
    icon: <GroupsIcon />,
    grados: [
      { nombre: '1er Año', estudiantes: 112, docentes: 8, completo: true },
      { nombre: '2do Año', estudiantes: 108, docentes: 7, completo: false },
      { nombre: '3er Año', estudiantes: 95, docentes: 8, completo: true },
      { nombre: '4to Año', estudiantes: 89, docentes: 7, completo: false },
      { nombre: '5to Año', estudiantes: 82, docentes: 8, completo: true },
      { nombre: '6to Año', estudiantes: 78, docentes: 9, completo: true },
    ],
    color: '#10b981',
  },
];

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export default function AsignacionesDeUsuarios() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box p={{ xs: 2, sm: 3, md: 4, lg: 1 }}>
      {/* Header Section - Mejorado */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 4,
          gap: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Asignaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            Actualizado hace 5 minutos
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel>Año Escolar</InputLabel>
            <Select defaultValue="2024-2025" size="small">
              <MenuItem value="2024-2025">2024-2025</MenuItem>
              <MenuItem value="2023-2024">2023-2024</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nueva Asignación
          </Button>

          <Button
            variant="contained"
            startIcon={<GroupsIcon />}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Asignación Masiva
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - Mejoradas */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Zoom in timeout={300 + index * 100}>
              <Card
                sx={{
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '16px',
                  boxShadow: isDark
                    ? '0 8px 24px rgba(0,0,0,0.4)'
                    : '0 8px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${isDark ? colors.primary[300] : '#e2e8f0'}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDark
                      ? `0 12px 32px rgba(0,0,0,0.5)`
                      : `0 12px 32px ${stat.color}25`,
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        background: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                        fontSize: 28,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Chip
                      icon={stat.trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={stat.trend}
                      size="small"
                      sx={{
                        background: stat.trendUp ? '#10b98115' : '#ef444415',
                        color: stat.trendUp ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        border: 'none',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    {stat.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: colors.grey[100] }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / {stat.total}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isDark ? colors.grey[700] : '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          background: stat.gradient,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: -20,
                        fontWeight: 700,
                        color: stat.color,
                      }}
                    >
                      {Math.round(stat.progress * 100)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Actividad Reciente y Filtros */}
      <Grid container spacing={3} mb={4}>
        {/* Actividad Reciente */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              background: isDark
                ? colors.primary[400]
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: `1px solid ${isDark ? colors.primary[300] : '#e2e8f0'}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[100] }}>
                  Asignaciones Recientes
                </Typography>
                <IconButton size="small">
                  <FilterListIcon />
                </IconButton>
              </Box>

              {recentAssignments.map((assignment, index) => (
                <Fade in key={index} timeout={400 + index * 100}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 2,
                      borderRadius: '12px',
                      background: isDark ? colors.primary[500] : '#f8fafc',
                      border: `1px solid ${isDark ? colors.primary[300] : '#e2e8f0'}`,
                      transition: 'all 0.3s ease',
                      animation: `${slideIn} 0.5s ease ${index * 0.1}s both`,
                      '&:hover': {
                        transform: 'translateX(8px)',
                        background: isDark ? colors.primary[300] : '#f1f5f9',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          fontWeight: 700,
                        }}
                      >
                        {assignment.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[100] }}>
                          {assignment.teacher}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.subject} • {assignment.grade}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`${assignment.students} estudiantes`}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={
                          assignment.status === 'completed' ? (
                            <CheckCircleIcon />
                          ) : (
                            <AccessTimeIcon />
                          )
                        }
                        label={assignment.time}
                        size="small"
                        color={assignment.status === 'completed' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                </Fade>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Acciones Rápidas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: isDark
                ? colors.primary[400]
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: `1px solid ${isDark ? colors.primary[300] : '#e2e8f0'}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[100], mb: 3 }}>
                Acciones Rápidas
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<SearchIcon />}
                sx={{
                  mb: 2,
                  justifyContent: 'flex-start',
                  borderColor: isDark ? colors.primary[300] : '#e2e8f0',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    background: '#3b82f615',
                  },
                }}
              >
                Buscar Asignación
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  mb: 2,
                  justifyContent: 'flex-start',
                  borderColor: isDark ? colors.primary[300] : '#e2e8f0',
                  '&:hover': {
                    borderColor: '#10b981',
                    background: '#10b98115',
                  },
                }}
              >
                Modificar Asignación
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: isDark ? colors.primary[300] : '#e2e8f0',
                  '&:hover': {
                    borderColor: '#f59e0b',
                    background: '#f59e0b15',
                  },
                }}
              >
                Exportar Reporte
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Progreso General
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'conic-gradient(#10b981 0% 85%, #e2e8f0 85% 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isDark ? colors.primary[400] : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      85%
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Casi completo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Faltan 12 asignaciones
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estructura Académica - Mejorada */}
      {estructuraAcademica.map((nivel, nivelIndex) => (
        <Fade in key={nivelIndex} timeout={500 + nivelIndex * 200}>
          <Card
            sx={{
              background: isDark
                ? colors.primary[400]
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
              mb: 3,
              overflow: 'hidden',
              border: `1px solid ${isDark ? colors.primary[300] : '#e2e8f0'}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${nivel.color} 0%, ${nivel.color}80 100%)`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: `${nivel.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: nivel.color,
                    fontSize: 24,
                  }}
                >
                  {nivel.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[100] }}>
                  {nivel.nivel}
                </Typography>
                <Chip
                  label={`${nivel.grados.length} grados`}
                  size="small"
                  sx={{
                    ml: 'auto',
                    background: `${nivel.color}15`,
                    color: nivel.color,
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                {nivel.grados.map((grado, gradoIndex) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={gradoIndex}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: isDark ? colors.primary[500] : '#f8fafc',
                        border: `2px solid ${grado.completo ? nivel.color + '40' : isDark ? colors.primary[300] : '#e2e8f0'}`,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `${scaleIn} 0.4s ease ${gradoIndex * 0.05}s both`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 20px ${nivel.color}20`,
                          borderColor: nivel.color,
                        },
                      }}
                    >
                      {grado.completo && (
                        <CheckCircleIcon
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontSize: 20,
                            color: nivel.color,
                          }}
                        />
                      )}

                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: colors.grey[100],
                          mb: 2,
                        }}
                      >
                        {grado.nombre}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Estudiantes
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grado.estudiantes}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Docentes
                          </Typography>
                          <Chip
                            label={grado.docentes}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              background: grado.completo ? `${nivel.color}20` : '#ef444420',
                              color: grado.completo ? nivel.color : '#ef4444',
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      ))}
    </Box>
  );
}