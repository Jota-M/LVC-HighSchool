'use client';
import '@fontsource/roboto';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Fade,
  Zoom,
  Slide,
  InputAdornment,
  Badge,
} from '@mui/material';
import Link from 'next/link';
import { tokens } from '@/app/dashboard/theme';
import { useState } from 'react';

// Icons
import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BoltIcon from '@mui/icons-material/Bolt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportIcon from '@mui/icons-material/Report';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// === DATA ===
const stats = [
  {
    title: 'Total de Solicitudes',
    value: '247',
    subtitle: '+23% más que el año pasado',
    color: '#2196f3',
    icon: <GroupIcon sx={{ fontSize: 38 }} />,
    trend: '+23%',
  },
  {
    title: 'Pendientes de Revisión',
    value: '45',
    href: '/dashboard/preinscripciones/revicion',
    subtitle: 'Promedio: 3.2 días',
    color: '#fbc02d',
    icon: <HourglassEmptyIcon sx={{ fontSize: 38 }} />,
    trend: '-8%',
  },
  {
    title: 'Aprobadas',
    value: '189',
    subtitle: 'Tasa: 76.5%',
    color: '#2e7d32',
    icon: <CheckCircleIcon sx={{ fontSize: 38 }} />,
    trend: '+15%',
  },
  {
    title: 'Rechazadas',
    value: '13',
    subtitle: 'Tasa: 5.3%',
    color: '#d32f2f',
    icon: <CancelIcon sx={{ fontSize: 38 }} />,
    trend: '-12%',
  },
];

const solicitudes = [
  {
    id: '001',
    nombre: 'Carlos Morales García',
    grado: '8vo EGB',
    fecha: '14/01/2024',
    hora: '09:22',
    estado: 'Aprobado',
    evaluador: 'L. Rodríguez',
    color: '#2e7d32',
    iniciales: 'CM',
  },
  {
    id: '002',
    nombre: 'Lucía Martínez López',
    grado: '1er BGU',
    fecha: '13/01/2024',
    hora: '16:45',
    estado: 'Documentos',
    evaluador: 'J. Silva',
    color: '#fbc02d',
    iniciales: 'LM',
  },
  {
    id: '003',
    nombre: 'Diego Ramírez Torres',
    grado: '9no EGB',
    fecha: '12/01/2024',
    hora: '11:30',
    estado: 'Entrevista',
    evaluador: 'M. González',
    color: '#0288d1',
    iniciales: 'DR',
  },
  {
    id: '004',
    nombre: 'Sofía Flores Vega',
    grado: '6to EGB',
    fecha: '11/01/2024',
    hora: '08:15',
    estado: 'No Aprobado',
    evaluador: 'C. Herrera',
    color: '#d32f2f',
    iniciales: 'SF',
  },
];

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  type Filter = { type: string; value: string };
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  const handleAddFilter = (type: string, value: string) => {
    if (!activeFilters.find((f) => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, { type, value }]);
    }
  };

  const handleRemoveFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.palette.mode === 'dark' 
          ? 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(46, 125, 50, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* ======================== */}
        {/* TITULO + ACCIONES HEADER */}
        {/* ======================== */}
        <Fade in timeout={800}>
          <Grid container spacing={2} mb={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h4"
                color={colors.grey[100]}
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #2196f3 0%, #21CBF3 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 3s ease infinite',
                  '@keyframes gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                  backgroundSize: '200% auto',
                }}
              >
                Gestión de Preinscripciones
              </Typography>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}
            >
              <Button
                variant="contained"
                color="success"
                startIcon={<CloudDownloadIcon />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 3,
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                  },
                }}
              >
                Exportar Todo
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<BoltIcon />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 3,
                  boxShadow: '0 4px 14px rgba(156, 39, 176, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                  },
                }}
              >
                Acciones Masivas
              </Button>
            </Grid>
          </Grid>
        </Fade>

        {/* ======================== */}
        {/* CARDS RESUMEN */}
        {/* ======================== */}
        <Grid container spacing={2} mb={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Zoom in timeout={600 + index * 100}>
                <Box
                   component={Link}
                    href={stat.href || '#'}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${stat.color}18, ${colors.primary[400]})`
                      : `linear-gradient(135deg, ${stat.color}25, ${colors.primary[400]})`,
                    borderRadius: 3,
                    p: 3,
                    boxShadow: hoveredCard === index
                      ? `0 12px 28px ${stat.color}44`
                      : theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(0,0,0,0.4)'
                      : '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    border: `1px solid ${hoveredCard === index ? stat.color + '44' : 'transparent'}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                      opacity: hoveredCard === index ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}${theme.palette.mode === 'dark' ? '33' : '25'}`,
                      color: stat.color,
                      width: 64,
                      height: 64,
                      mr: 2.5,
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === index ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                      boxShadow: hoveredCard === index ? `0 4px 12px ${stat.color}44` : 'none',
                    }}
                  >
                    {stat.icon}
                  </Avatar>

                  <Box sx={{ zIndex: 1 }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={colors.grey[100]}
                      sx={{ fontSize: { xs: '1.4rem', md: '1.6rem' } }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body1"
                      color={colors.grey[200]}
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      {stat.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        color={stat.trend.startsWith('+') ? colors.greenAccent[400] : colors.redAccent[400]}
                        sx={{ 
                          fontStyle: 'italic', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <TrendingUpIcon sx={{ 
                          fontSize: 16,
                          transform: stat.trend.startsWith('-') ? 'rotate(180deg)' : 'none',
                        }} />
                        {stat.trend}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* ======================== */}
        {/* FILTROS MODERNOS */}
        {/* ======================== */}
        <Slide in direction="up" timeout={800}>
          <Paper
            sx={{
              backgroundColor: colors.primary[400],
              borderRadius: 4,
              mb: 3,
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[500] + '66' : 'transparent'}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header de Filtros */}
            <Box sx={{ 
              p: 2.5, 
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[500]}88, ${colors.primary[400]})`
                : `linear-gradient(135deg, ${colors.primary[300]}33, ${colors.primary[400]})`,
              borderBottom: `1px solid ${colors.primary[500]}44`,
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ 
                    bgcolor: colors.blueAccent[700], 
                    width: 36, 
                    height: 36,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}>
                    <FilterListIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color={colors.grey[100]}>
                      Filtros de Búsqueda
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]}>
                      {activeFilters.length} filtro{activeFilters.length !== 1 ? 's' : ''} activo{activeFilters.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Stack>
                {activeFilters.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearAllFilters}
                    sx={{
                      color: colors.redAccent[400],
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: colors.redAccent[700] + '22',
                      }
                    }}
                  >
                    Limpiar todo
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Filtros Activos */}
            {activeFilters.length > 0 && (
              <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {activeFilters.map((filter, index) => (
                    <Chip
                      key={index}
                      label={`${filter.type}: ${filter.value}`}
                      onDelete={() => handleRemoveFilter(index)}
                      deleteIcon={<ClearIcon />}
                      sx={{
                        bgcolor: colors.blueAccent[700] + '33',
                        color: colors.blueAccent[400],
                        fontWeight: 500,
                        borderRadius: 2,
                        border: `1px solid ${colors.blueAccent[700]}66`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: colors.blueAccent[700] + '55',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${colors.blueAccent[700]}44`,
                        },
                        '& .MuiChip-deleteIcon': {
                          color: colors.blueAccent[400],
                          '&:hover': {
                            color: colors.blueAccent[300],
                          }
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Controles de Filtro */}
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField 
                    fullWidth 
                    placeholder="Buscar por nombre, grado o evaluador..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: colors.grey[300] }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '66' : colors.primary[300] + '33',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${colors.blueAccent[700]}33`,
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '88' : colors.primary[300] + '44',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3.5 }}>
                  <FormControl fullWidth size="small">
                    <Select 
                      defaultValue="Todos" 
                      displayEmpty
                      sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '66' : colors.primary[300] + '33',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${colors.blueAccent[700]}33`,
                        }
                      }}
                    >
                      <MenuItem value="Todos">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleIcon sx={{ fontSize: 18, color: colors.grey[400] }} />
                          <span>Todos los estados</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="Aprobado">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                          <span>Aprobado</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="Pendiente">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <HourglassEmptyIcon sx={{ fontSize: 18, color: '#fbc02d' }} />
                          <span>Pendiente</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="Rechazado">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CancelIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                          <span>Rechazado</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3.5 }}>
                  <FormControl fullWidth size="small">
                    <Select 
                      defaultValue="Todos" 
                      displayEmpty
                      sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '66' : colors.primary[300] + '33',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${colors.blueAccent[700]}33`,
                        }
                      }}
                    >
                      <MenuItem value="Todos">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SchoolIcon sx={{ fontSize: 18, color: colors.grey[400] }} />
                          <span>Todos los grados</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="8vo EGB">8vo EGB</MenuItem>
                      <MenuItem value="1er BGU">1er BGU</MenuItem>
                      <MenuItem value="6to EGB">6to EGB</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>

        {/* ======================== */}
        {/* VISTA MOBILE - CARDS */}
        {/* ======================== */}
        {isMobile ? (
          <Stack spacing={2} mb={4}>
            {solicitudes.map((s, idx) => (
              <Zoom in timeout={700 + idx * 100} key={s.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[400],
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[500] : 'transparent'}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 24px ${s.color}33`
                        : `0 8px 24px ${s.color}22`,
                      borderColor: s.color + '44',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: s.color, 
                        width: 56, 
                        height: 56,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      }}
                    >
                      {s.iniciales}
                    </Avatar>
                    <Box flex={1}>
                      <Typography 
                        variant="h6" 
                        color={colors.grey[100]}
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {s.nombre}
                      </Typography>
                      <Chip
                        label={s.estado}
                        size="small"
                        sx={{
                          bgcolor: `${s.color}${theme.palette.mode === 'dark' ? '25' : '30'}`,
                          color: s.color,
                          fontWeight: 600,
                          boxShadow: `0 2px 8px ${s.color}33`,
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2, borderColor: colors.primary[500], opacity: 0.3 }} />

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SchoolIcon sx={{ color: colors.grey[300], fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color={colors.grey[300]}>Grado</Typography>
                        <Typography variant="body2" color={colors.grey[100]} fontWeight={500}>
                          {s.grado}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CalendarTodayIcon sx={{ color: colors.grey[300], fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color={colors.grey[300]}>Fecha de Solicitud</Typography>
                        <Typography variant="body2" color={colors.grey[100]} fontWeight={500}>
                          {s.fecha} - {s.hora}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PersonIcon sx={{ color: colors.grey[300], fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color={colors.grey[300]}>Evaluador</Typography>
                        <Typography variant="body2" color={colors.grey[100]} fontWeight={500}>
                          {s.evaluador}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2, borderColor: colors.primary[500], opacity: 0.3 }} />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Editar
                    </Button>
                    <IconButton color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              </Zoom>
            ))}
          </Stack>
        ) : (
          
          <Fade in timeout={1000}>
            <Paper
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                mb: 4,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[500] + '66' : 'transparent'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Header de Tabla */}
              <Box sx={{ 
                p: 2.5, 
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${colors.primary[500]}88, ${colors.primary[400]})`
                  : `linear-gradient(135deg, ${colors.primary[300]}33, ${colors.primary[400]})`,
                borderBottom: `1px solid ${colors.primary[500]}44`,
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ 
                      bgcolor: colors.greenAccent[700], 
                      width: 36, 
                      height: 36,
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
                    }}>
                      <GroupIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600} color={colors.grey[100]}>
                        Lista de Solicitudes
                      </Typography>
                      <Typography variant="caption" color={colors.grey[300]}>
                        {solicitudes.length} estudiantes registrados
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton 
                    size="small"
                    sx={{
                      color: colors.grey[300],
                      '&:hover': {
                        bgcolor: colors.primary[500] + '66',
                        transform: 'rotate(90deg)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Tabla */}
              <Box
                sx={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: colors.primary[500] + '33',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: colors.grey[700],
                    borderRadius: 4,
                    '&:hover': {
                      backgroundColor: colors.grey[600],
                    }
                  },
                }}
              >
                <Box component="table" sx={{ 
                  width: '100%', 
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  minWidth: 700,
                }}>
                  <Box component="thead">
                    <Box component="tr">
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Estudiante
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Grado
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Fecha
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Estado
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Evaluador
                      </th>
                      <th style={{
                        textAlign: 'right',
                        padding: '20px 24px',
                        color: colors.grey[300],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backgroundColor: colors.primary[400],
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                      }}>
                        Acciones
                      </th>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {solicitudes.map((s, idx) => (
                      <Box
                        component="tr"
                        key={s.id}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        sx={{
                          backgroundColor: hoveredRow === idx 
                            ? theme.palette.mode === 'dark'
                              ? colors.primary[500] + '44'
                              : colors.primary[300] + '22'
                            : 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: s.color,
                            opacity: hoveredRow === idx ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }
                        }}
                      >
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                        }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              sx={{ 
                                bgcolor: s.color,
                                width: 44,
                                height: 44,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                boxShadow: hoveredRow === idx ? `0 4px 12px ${s.color}55` : `0 2px 8px ${s.color}33`,
                                transition: 'all 0.3s ease',
                                transform: hoveredRow === idx ? 'scale(1.1)' : 'scale(1)',
                              }}
                            >
                              {s.iniciales}
                            </Avatar>
                            <Box>
                              <Typography 
                                color={colors.grey[100]} 
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.95rem',
                                  mb: 0.3,
                                  transition: 'color 0.3s ease',
                                }}
                              >
                                {s.nombre}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: colors.grey[400],
                                  fontSize: '0.75rem',
                                }}
                              >
                                ID: {s.id}
                              </Typography>
                            </Box>
                          </Stack>
                        </td>
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                        }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <SchoolIcon sx={{ fontSize: 18, color: colors.blueAccent[400] }} />
                            <Typography 
                              color={colors.grey[200]}
                              sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                            >
                              {s.grado}
                            </Typography>
                          </Stack>
                        </td>
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                        }}>
                          <Box>
                            <Typography 
                              color={colors.grey[100]}
                              sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.3 }}
                            >
                              {s.fecha}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: colors.grey[400], fontSize: '0.75rem' }}
                            >
                              {s.hora}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                        }}>
                          <Chip
                            label={s.estado}
                            size="small"
                            sx={{
                              bgcolor: `${s.color}${theme.palette.mode === 'dark' ? '22' : '25'}`,
                              color: s.color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              border: `1.5px solid ${s.color}44`,
                              transition: 'all 0.3s ease',
                              transform: hoveredRow === idx ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: hoveredRow === idx ? `0 4px 12px ${s.color}44` : 'none',
                            }}
                          />
                        </td>
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                        }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: '0.7rem',
                                bgcolor: colors.primary[500],
                                color: colors.grey[100],
                              }}
                            >
                              {s.evaluador.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography 
                              color={colors.grey[200]}
                              sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                            >
                              {s.evaluador}
                            </Typography>
                          </Stack>
                        </td>
                        <td style={{ 
                          padding: '20px 24px',
                          borderBottom: `1px solid ${colors.primary[500]}33`,
                          textAlign: 'right',
                        }}>
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton 
                              size="small"
                              sx={{
                                color: colors.blueAccent[400],
                                bgcolor: hoveredRow === idx ? colors.blueAccent[700] + '22' : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: colors.blueAccent[700] + '33',
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${colors.blueAccent[700]}44`,
                                }
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                            <IconButton 
                              size="small"
                              sx={{
                                color: colors.greenAccent[400],
                                bgcolor: hoveredRow === idx ? colors.greenAccent[700] + '22' : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: colors.greenAccent[700] + '33',
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${colors.greenAccent[700]}44`,
                                }
                              }}
                            >
                              <EditIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                            <IconButton 
                              size="small"
                              sx={{
                                color: colors.redAccent[400],
                                bgcolor: hoveredRow === idx ? colors.redAccent[700] + '22' : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: colors.redAccent[700] + '33',
                                  transform: 'scale(1.1) rotate(10deg)',
                                  boxShadow: `0 4px 12px ${colors.redAccent[700]}44`,
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Stack>
                        </td>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Footer de Tabla */}
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${colors.primary[500]}44`,
                background: theme.palette.mode === 'dark'
                  ? colors.primary[500] + '22'
                  : colors.primary[300] + '11',
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color={colors.grey[300]}>
                    Mostrando {solicitudes.length} de 247 solicitudes
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      size="small" 
                      disabled
                      sx={{ 
                        minWidth: 32,
                        color: colors.grey[400],
                      }}
                    >
                      ‹
                    </Button>
                    <Button 
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        bgcolor: colors.blueAccent[700],
                        color: 'white',
                        '&:hover': {
                          bgcolor: colors.blueAccent[600],
                        }
                      }}
                    >
                      1
                    </Button>
                    <Button 
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        color: colors.grey[300],
                        '&:hover': {
                          bgcolor: colors.primary[500] + '44',
                        }
                      }}
                    >
                      2
                    </Button>
                    <Button 
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        color: colors.grey[300],
                        '&:hover': {
                          bgcolor: colors.primary[500] + '44',
                        }
                      }}
                    >
                      3
                    </Button>
                    <Button 
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        color: colors.grey[300],
                      }}
                    >
                      ›
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Fade>
        )}

        
        <Slide in direction="up" timeout={1200}>
          <Box>
            <Typography 
              variant="h6" 
              color={colors.grey[100]} 
              mb={2}
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Acciones Rápidas
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<WarningIcon />}
                  fullWidth
                  sx={{ 
                    height: 60, 
                    borderRadius: 3, 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(211, 47, 47, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                  }}
                >
                  Revisión Prioritaria
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EventIcon />}
                  fullWidth
                  sx={{ 
                    height: 60, 
                    borderRadius: 3, 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(33, 150, 243, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                  }}
                >
                  Agendar Entrevistas
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<NotificationsIcon />}
                  fullWidth
                  sx={{ 
                    height: 60, 
                    borderRadius: 3, 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(251, 192, 45, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(251, 192, 45, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                  }}
                >
                  Enviar Notificaciones
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ReportIcon />}
                  fullWidth
                  sx={{ 
                    height: 60, 
                    borderRadius: 3, 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(46, 125, 50, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                  }}
                >
                  Generar Reportes
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Slide>
      </Box>
    </Box>
  );
}