'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Paper,
  Fade,
  Zoom,
  Slide,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { tokens } from '@/app/dashboard/theme';

// Icons
import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportIcon from '@mui/icons-material/Report';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const API_URL = 'http://localhost:3000/api/preinscripcion';

type Preinscripcion = {
  preinscripcion_id: number;
  estado?: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno: string;
  estudiante_ci: string;
  estudiante_grado_solicitado: string;
  representante_nombres: string;
  representante_apellido_paterno: string;
  representante_apellido_materno: string;
  representante_ci: string;
  certificado_nacimiento?: string;
  libreta_notas?: string;
  cedula_estudiante?: string;
  cedula_representante?: string;
  fecha_subida?: string;
};

const getEstadoConfig = (estado?: string) => {
  const configs: Record<string, { label: string; color: string; bgcolor: string }> = {
    'pendiente': { label: 'Pendiente', color: '#fbc02d', bgcolor: '#fff9c4' },
    'en_revision': { label: 'En Revisión', color: '#0288d1', bgcolor: '#b3e5fc' },
    'aprobado': { label: 'Aprobado', color: '#2e7d32', bgcolor: '#c8e6c9' },
    'rechazado': { label: 'Rechazado', color: '#d32f2f', bgcolor: '#ffcdd2' },
    'documentos_incompletos': { label: 'Documentos Faltantes', color: '#ff6f00', bgcolor: '#ffe0b2' },
  };
  return configs[estado?.toLowerCase() || ''] || { label: 'Desconocido', color: '#757575', bgcolor: '#e0e0e0' };
};

const getGradoLabel = (grado?: string) => {
  const grados: Record<string, string> = {
    'PRIMERO_SEC': '1ro Secundaria',
    'SEGUNDO_SEC': '2do Secundaria',
    'TERCERO_SEC': '3ro Secundaria',
    'CUARTO_SEC': '4to Secundaria',
    'QUINTO_SEC': '5to Secundaria',
    'SEXTO_SEC': '6to Secundaria',
  };
  return grados[grado || ''] || grado || '';
};

export default function PreinscripcionesDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [preinscripciones, setPreinscripciones] = useState<Preinscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [gradoFilter, setGradoFilter] = useState('todos');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const fetchPreinscripciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar las preinscripciones');
      const data = await response.json();
      setPreinscripciones(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreinscripciones();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const stats = {
    total: preinscripciones.length,
    pendientes: preinscripciones.filter(p => ['pendiente', 'en_revision'].includes(p.estado?.toLowerCase() || '')).length,
    aprobadas: preinscripciones.filter(p => p.estado?.toLowerCase() === 'aprobado').length,
    rechazadas: preinscripciones.filter(p => p.estado?.toLowerCase() === 'rechazado').length,
  };

  const filteredPreinscripciones = preinscripciones.filter(p => {
    const fullName = `${p.estudiante_nombres} ${p.estudiante_apellido_paterno} ${p.estudiante_apellido_materno}`;
    const matchSearch = searchTerm === '' || fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.estudiante_ci.includes(searchTerm);
    const matchEstado = estadoFilter === 'todos' || p.estado?.toLowerCase() === estadoFilter.toLowerCase();
    const matchGrado = gradoFilter === 'todos' || p.estudiante_grado_solicitado === gradoFilter;
    return matchSearch && matchEstado && matchGrado;
  });

  const deletePreinscripcion = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta preinscripción?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      await fetchPreinscripciones();
      showSnackbar('Preinscripción eliminada', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showSnackbar(message, 'error');
    }
  };

  const goToRevision = (id: number) => {
    router.push(`/dashboard/preinscripciones/detalle/${id}`);
  };

  const cardStats = [
    { title: 'Total de Solicitudes', value: stats.total, subtitle: `${preinscripciones.length} registros`, color: '#2196f3', icon: <GroupIcon sx={{ fontSize: 38 }} />, trend: '+23%' },
    { title: 'Pendientes', value: stats.pendientes, subtitle: 'Requieren revisión', color: '#fbc02d', icon: <HourglassEmptyIcon sx={{ fontSize: 38 }} />, trend: '-8%' },
    { title: 'Aprobadas', value: stats.aprobadas, subtitle: `Tasa: ${stats.total > 0 ? ((stats.aprobadas / stats.total) * 100).toFixed(1) : 0}%`, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 38 }} />, trend: '+15%' },
    { title: 'Rechazadas', value: stats.rechazadas, subtitle: `Tasa: ${stats.total > 0 ? ((stats.rechazadas / stats.total) * 100).toFixed(1) : 0}%`, color: '#d32f2f', icon: <CancelIcon sx={{ fontSize: 38 }} />, trend: '-12%' },
  ];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h6" color={colors.grey[100]} mt={3}>
          Cargando preinscripciones...
        </Typography>
      </Box>
    );
  }

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
        {/* HEADER */}
        <Fade in timeout={800}>
          <Grid container spacing={2} mb={3} alignItems="center">
            <Grid size={{xs:12, md:6}}>
              <Typography
                variant="h4"
                color={colors.grey[100]}
                sx={{
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

            <Grid size={{xs:12, md:6}} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<RefreshIcon />}
                onClick={fetchPreinscripciones}
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
                Actualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudDownloadIcon />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 3,
                  boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                  },
                }}
              >
                Exportar
              </Button>
            </Grid>
          </Grid>
        </Fade>

        {/* CARDS ESTADÍSTICAS */}
        <Grid container spacing={2} mb={4}>
          {cardStats.map((stat, index) => (
            <Grid size={{xs:12, sm:6, md:3}} key={index}>
              <Zoom in timeout={600 + index * 100}>
                <Box
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
                    <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} sx={{ fontSize: { xs: '1.4rem', md: '1.6rem' } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[200]} sx={{ fontWeight: 500, mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]} sx={{ fontStyle: 'italic' }}>
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* FILTROS */}
        <Slide in direction="up" timeout={800}>
          <Paper sx={{
            backgroundColor: colors.primary[400],
            borderRadius: 4,
            mb: 3,
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[500] + '66' : 'transparent'}`,
          }}>
            <Box sx={{ 
              p: 2.5, 
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[500]}88, ${colors.primary[400]})`
                : `linear-gradient(135deg, ${colors.primary[300]}33, ${colors.primary[400]})`,
              borderBottom: `1px solid ${colors.primary[500]}44`,
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: colors.blueAccent[700], width: 36, height: 36, boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)' }}>
                  <FilterListIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} color={colors.grey[100]}>
                    Filtros de Búsqueda
                  </Typography>
                  <Typography variant="caption" color={colors.grey[300]}>
                    {filteredPreinscripciones.length} resultado{filteredPreinscripciones.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{xs:6, md:3.5}}>
                  <TextField 
                    fullWidth 
                    placeholder="Buscar por nombre o CI..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 6px 16px ${colors.blueAccent[700]}33`,
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{xs:6, md:3.5}}>
                  <FormControl fullWidth size="small">
                    <Select 
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22',
                      }}
                    >
                      <MenuItem value="todos">Todos los estados</MenuItem>
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="en_revision">En Revisión</MenuItem>
                      <MenuItem value="aprobado">Aprobado</MenuItem>
                      <MenuItem value="rechazado">Rechazado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{xs:6, md:3.5}}>
                  <FormControl fullWidth size="small">
                    <Select 
                      value={gradoFilter}
                      onChange={(e) => setGradoFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22',
                      }}
                    >
                      <MenuItem value="todos">Todos los grados</MenuItem>
                      <MenuItem value="PRIMERO_SEC">1ro Secundaria</MenuItem>
                      <MenuItem value="SEGUNDO_SEC">2do Secundaria</MenuItem>
                      <MenuItem value="TERCERO_SEC">3ro Secundaria</MenuItem>
                      <MenuItem value="CUARTO_SEC">4to Secundaria</MenuItem>
                      <MenuItem value="QUINTO_SEC">5to Secundaria</MenuItem>
                      <MenuItem value="SEXTO_SEC">6to Secundaria</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>

        {/* TABLA */}
        {isMobile ? (
          <Stack spacing={2} mb={4}>
            {filteredPreinscripciones.map((p, idx) => {
              const config = getEstadoConfig(p.estado);
              const iniciales = `${p.estudiante_nombres[0]}${p.estudiante_apellido_paterno[0]}`;
              
              return (
                <Zoom in timeout={700 + idx * 100} key={p.preinscripcion_id}>
                  <Paper sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[400],
                    boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: config.color, width: 56, height: 56 }}>
                        {iniciales}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" color={colors.grey[100]} sx={{ fontWeight: 600, mb: 0.5 }}>
                          {`${p.estudiante_nombres} ${p.estudiante_apellido_paterno}`}
                        </Typography>
                        <Chip label={config.label} size="small" sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 600 }} />
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <SchoolIcon sx={{ color: colors.grey[300], fontSize: 20 }} />
                        <Typography variant="body2" color={colors.grey[100]}>{getGradoLabel(p.estudiante_grado_solicitado)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <PersonIcon sx={{ color: colors.grey[300], fontSize: 20 }} />
                        <Typography variant="body2" color={colors.grey[100]}>CI: {p.estudiante_ci}</Typography>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" startIcon={<RateReviewIcon />} onClick={() => goToRevision(p.preinscripcion_id)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Revisar
                      </Button>
                      <IconButton color="error" size="small" onClick={() => deletePreinscripcion(p.preinscripcion_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                </Zoom>
              );
            })}
          </Stack>
        ) : (
          <Fade in timeout={1000}>
            <Paper sx={{
              borderRadius: 4,
              overflow: 'hidden',
              mb: 4,
              boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
            }}>
              <Box sx={{ 
                p: 2.5, 
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${colors.primary[500]}88, ${colors.primary[400]})`
                  : `linear-gradient(135deg, ${colors.primary[300]}33, ${colors.primary[400]})`,
              }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: colors.greenAccent[700], width: 36, height: 36 }}>
                    <GroupIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color={colors.grey[100]}>
                      Lista de Solicitudes
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]}>
                      {filteredPreinscripciones.length} estudiantes
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 900 }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        Estudiante
                      </Box>
                      <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        CI
                      </Box>
                      <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        Grado
                      </Box>
                      <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        Fecha
                      </Box>
                      <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        Estado
                      </Box>
                      <Box component="th" sx={{ p: 2.5, textAlign: 'center', fontWeight: 600, color: colors.grey[300], fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: colors.primary[400] }}>
                        Acciones
                      </Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {filteredPreinscripciones.map((p, idx) => {
                      const config = getEstadoConfig(p.estado);
                      const iniciales = `${p.estudiante_nombres[0]}${p.estudiante_apellido_paterno[0]}`;
                      
                      return (
                        <Box
                          component="tr"
                          key={p.preinscripcion_id}
                          onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                          sx={{
                            backgroundColor: hoveredRow === idx 
                              ? theme.palette.mode === 'dark' ? colors.primary[500] + '44' : colors.primary[300] + '22'
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
                              backgroundColor: config.color,
                              opacity: hoveredRow === idx ? 1 : 0,
                              transition: 'opacity 0.3s ease',
                            }
                          }}
                        >
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33` }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar 
                                sx={{ 
                                  bgcolor: config.color,
                                  width: 44,
                                  height: 44,
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  boxShadow: hoveredRow === idx ? `0 4px 12px ${config.color}55` : `0 2px 8px ${config.color}33`,
                                  transition: 'all 0.3s ease',
                                  transform: hoveredRow === idx ? 'scale(1.1)' : 'scale(1)',
                                }}
                              >
                                {iniciales}
                              </Avatar>
                              <Box>
                                <Typography color={colors.grey[100]} sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.3 }}>
                                  {`${p.estudiante_nombres} ${p.estudiante_apellido_paterno} ${p.estudiante_apellido_materno}`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.grey[400], fontSize: '0.75rem' }}>
                                  ID: {p.preinscripcion_id}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33` }}>
                            <Typography color={colors.grey[200]} sx={{ fontWeight: 500 }}>
                              {p.estudiante_ci}
                            </Typography>
                          </Box>
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33` }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <SchoolIcon sx={{ fontSize: 18, color: colors.blueAccent[400] }} />
                              <Typography color={colors.grey[200]} sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                {getGradoLabel(p.estudiante_grado_solicitado)}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33` }}>
                            <Box>
                              <Typography color={colors.grey[100]} sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.3 }}>
                                {p.fecha_subida ? new Date(p.fecha_subida).toLocaleDateString() : '---'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.grey[400], fontSize: '0.75rem' }}>
                                {p.fecha_subida ? new Date(p.fecha_subida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              </Typography>
                            </Box>
                          </Box>
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33` }}>
                            <Chip
                              label={config.label}
                              size="small"
                              sx={{
                                bgcolor: `${config.color}${theme.palette.mode === 'dark' ? '22' : '25'}`,
                                color: config.color,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: `1.5px solid ${config.color}44`,
                                transition: 'all 0.3s ease',
                                transform: hoveredRow === idx ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: hoveredRow === idx ? `0 4px 12px ${config.color}44` : 'none',
                              }}
                            />
                          </Box>
                          <Box component="td" sx={{ p: 2.5, borderBottom: `1px solid ${colors.primary[500]}33`, textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton 
                                size="small"
                                onClick={() => goToRevision(p.preinscripcion_id)}
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
                                <RateReviewIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <IconButton 
                                size="small"
                                onClick={() => deletePreinscripcion(p.preinscripcion_id)}
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
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${colors.primary[500]}44`,
                background: theme.palette.mode === 'dark' ? colors.primary[500] + '22' : colors.primary[300] + '11',
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color={colors.grey[300]}>
                    Mostrando {filteredPreinscripciones.length} de {preinscripciones.length} solicitudes
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* ACCIONES RÁPIDAS */}
        <Slide in direction="up" timeout={1200}>
          <Box>
            <Typography 
              variant="h6" 
              color={colors.grey[100]} 
              mb={2}
              sx={{ fontWeight: 600, letterSpacing: 0.5 }}
            >
              Acciones Rápidas
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12, sm:6, md:3}}>
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
                      '&::before': { left: '100%' }
                    },
                  }}
                >
                  Revisión Prioritaria
                </Button>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}}>
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
                      '&::before': { left: '100%' }
                    },
                  }}
                >
                  Agendar Entrevistas
                </Button>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}}>
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
                      '&::before': { left: '100%' }
                    },
                  }}
                >
                  Enviar Notificaciones
                </Button>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}} >
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
                      '&::before': { left: '100%' }
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}