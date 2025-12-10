// src/app/dashboard/docentes/[id]/page.tsx - VERSIÓN MEJORADA
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Avatar,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Fade,
  Zoom,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Description as CVIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  WorkOutline as WorkIcon,
  Psychology as PsychologyIcon,
  AttachMoney as MoneyIcon,
  Groups as GroupsIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useDocenteDetalle } from '@/hooks/useDocenteDetalle';
import { toast } from 'react-hot-toast';
import docenteService from '@/services/docenteService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export default function DocenteDetalle() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const docenteId = Number(idParam);
  
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  if (!idParam || isNaN(docenteId) || docenteId <= 0) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
            <WarningIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
              Error: ID inválido
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => router.push('/dashboard/docentes')}
              startIcon={<BackIcon />}
            >
              Volver a lista de docentes
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const {
    docente,
    estadisticas,
    asignaciones,
    isLoading,
    isLoadingAsignaciones,
    periodoSeleccionado,
    cambiarPeriodo,
    refrescar,
  } = useDocenteDetalle(docenteId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    router.push(`/dashboard/docentes/${docenteId}/editar`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await docenteService.eliminar(docenteId);
      toast.success('Docente eliminado exitosamente');
      router.push('/dashboard/docentes');
    } catch (error: any) {
      console.error('Error al eliminar docente:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar docente';
      
      if (mensaje.includes('asignaciones activas')) {
        toast.error('No se puede eliminar un docente con asignaciones activas');
      } else {
        toast.error(mensaje);
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await docenteService.crearUsuario(docenteId, {
        username: username || undefined,
        password: password || undefined,
        email: email || undefined,
      });

      toast.success('Usuario creado exitosamente');
      
      const { usuario } = response.data;
      toast.success(
        `Username: ${usuario.username}\nContraseña: ${usuario.password_temporal}`,
        { duration: 10000 }
      );

      setCreateUserDialogOpen(false);
      refrescar();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const getContratoColor = (tipo?: string | null) => {
    switch (tipo) {
      case 'planta': return '#10b981';
      case 'contrato': return '#3b82f6';
      case 'honorarios': return '#f59e0b';
      case 'medio_tiempo': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getContratoLabel = (tipo?: string | null) => {
    switch (tipo) {
      case 'planta': return 'Planta';
      case 'contrato': return 'Contrato';
      case 'honorarios': return 'Honorarios';
      case 'medio_tiempo': return 'Medio Tiempo';
      default: return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px', mb: 3 }} />
          <Skeleton variant="rectangular" height={500} sx={{ borderRadius: '24px' }} />
        </Container>
      </Box>
    );
  }

  if (!docente) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
            <SchoolIcon sx={{ fontSize: 100, color: 'text.disabled', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Docente no encontrado
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => router.back()}
              size="large"
              sx={{ borderRadius: '12px' }}
            >
              Volver
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4,
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in={true}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.back()}
              sx={{
                mb: 2,
                color: isDark ? '#facc15' : '#0288d1',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                },
              }}
            >
              Volver
            </Button>
          </Box>
        </Fade>

        {/* Card Principal con Perfil */}
        <Fade in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: '24px',
              overflow: 'hidden',
              background: isDark
                ? alpha('#1e293b', 0.8)
                : alpha('#ffffff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Banner superior con gradiente */}
            <Box
              sx={{
                height: 140,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#facc15', 0.2)} 0%, ${alpha('#f59e0b', 0.1)} 100%)`
                  : `linear-gradient(135deg, ${alpha('#0288d1', 0.2)} 0%, ${alpha('#01579b', 0.1)} 100%)`,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={handleEdit}
                  sx={{
                    backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.2),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.3),
                    },
                  }}
                >
                  <EditIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                </IconButton>
                <IconButton
                  onClick={handleDeleteClick}
                  sx={{
                    backgroundColor: alpha('#ef4444', 0.2),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha('#ef4444', 0.3),
                    },
                  }}
                >
                  <DeleteIcon sx={{ color: '#ef4444' }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ px: 4, pb: 4, mt: -8 }}>
              <Grid container spacing={4}>
                {/* Avatar y badges */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={docente.foto_url || undefined}
                      sx={{
                        width: 180,
                        height: 180,
                        margin: '0 auto',
                        mb: 2,
                        border: `5px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 8px 24px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                        fontSize: 60,
                        fontWeight: 700,
                      }}
                    >
                      {docente.nombres.charAt(0)}{docente.apellido_paterno.charAt(0)}
                    </Avatar>
                    
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                      <Chip
                        icon={docente.activo ? <CheckIcon /> : undefined}
                        label={docente.activo ? 'Activo' : 'Inactivo'}
                        color={docente.activo ? 'success' : 'error'}
                        sx={{ 
                          borderRadius: '10px',
                          fontWeight: 600,
                          height: 28,
                        }}
                      />
                    </Stack>

                    <Chip
                      label={getContratoLabel(docente.tipo_contrato)}
                      sx={{
                        backgroundColor: getContratoColor(docente.tipo_contrato),
                        color: '#fff',
                        borderRadius: '10px',
                        fontWeight: 600,
                        height: 28,
                        mb: 2,
                      }}
                    />

                    <Stack spacing={1} sx={{ mt: 3 }}>
                      {docente.cv_url && (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<CVIcon />}
                          href={docente.cv_url}
                          target="_blank"
                          sx={{
                            borderRadius: '12px',
                            borderWidth: 2,
                            fontWeight: 600,
                            '&:hover': {
                              borderWidth: 2,
                            },
                          }}
                        >
                          Ver CV
                        </Button>
                      )}

                      {!docente.usuario_id && (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AccountIcon />}
                          onClick={() => setCreateUserDialogOpen(true)}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          }}
                        >
                          Crear Usuario
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                {/* Información principal */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {docente.nombres} {docente.apellidos}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Chip 
                        label={docente.codigo} 
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      />
                    </Box>

                    <Stack spacing={2}>
                      {docente.ci && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#3b82f6', 0.15),
                            }}
                          >
                            <AccountIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              CI
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {docente.ci}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {docente.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#ef4444', 0.15),
                            }}
                          >
                            <EmailIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {docente.email}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {docente.celular && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#10b981', 0.15),
                            }}
                          >
                            <PhoneIcon sx={{ fontSize: 20, color: '#10b981' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Celular
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {docente.celular}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {docente.direccion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#f59e0b', 0.15),
                            }}
                          >
                            <HomeIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Dirección
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {docente.direccion}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {docente.especialidad && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#8b5cf6', 0.15),
                            }}
                          >
                            <SchoolIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Especialidad
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {docente.especialidad}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {docente.fecha_contratacion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#06b6d4', 0.15),
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 20, color: '#06b6d4' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Fecha de Contratación
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {new Date(docente.fecha_contratacion).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                {/* Estadísticas */}
                <Grid size={{ xs: 12, md: 3 }}>
                  {estadisticas && (
                    <Box sx={{ pt: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Estadísticas
                      </Typography>
                      
                      <Stack spacing={2}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: '16px',
                            background: isDark
                              ? `linear-gradient(135deg, ${alpha('#facc15', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
                              : `linear-gradient(135deg, ${alpha('#0288d1', 0.15)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
                            border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 800, color: isDark ? '#facc15' : '#0288d1' }}>
                              {estadisticas.asignaciones_activas}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Asignaciones activas
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, ${alpha('#059669', 0.05)} 100%)`,
                            border: `2px solid ${alpha('#10b981', 0.3)}`,
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center' }}>
                            <GroupsIcon sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981' }}>
                              {estadisticas.paralelos_asignados}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Paralelos asignados
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.15)} 0%, ${alpha('#d97706', 0.05)} 100%)`,
                            border: `2px solid ${alpha('#f59e0b', 0.3)}`,
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                              {estadisticas.materias_diferentes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Materias diferentes
                            </Typography>
                          </CardContent>
                        </Card>
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Fade>

        {/* Tabs con contenido */}
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              background: isDark
                ? alpha('#1e293b', 0.8)
                : alpha('#ffffff', 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                px: 3,
                pt: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 56,
                },
                '& .Mui-selected': {
                  color: isDark ? '#facc15' : '#0288d1',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#facc15' : '#0288d1',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label="Asignaciones" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Información Profesional" icon={<WorkIcon />} iconPosition="start" />
            </Tabs>

            <Divider />

            <Box sx={{ p: 3 }}>
              {/* Tab de Asignaciones */}
              <TabPanel value={activeTab} index={0}>
                {isLoadingAsignaciones ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: '16px' }} />
                    ))}
                  </Stack>
                ) : asignaciones.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      borderRadius: '20px',
                      border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      Sin asignaciones
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Este docente no tiene asignaciones activas
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1.5,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 600,
                      }}
                    >
                      Crear Asignación
                    </Button>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {asignaciones.map((asignacion, index) => (
                      <Grid size={{ xs: 12 }} key={asignacion.id}>
                        <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: '20px',
                              background: isDark
                                ? `linear-gradient(135deg, ${alpha(asignacion.materia_color || '#0288d1', 0.15)} 0%, ${alpha(asignacion.materia_color || '#0288d1', 0.05)} 100%)`
                                : `linear-gradient(135deg, ${alpha(asignacion.materia_color || '#0288d1', 0.1)} 0%, ${alpha(asignacion.materia_color || '#0288d1', 0.05)} 100%)`,
                              border: `2px solid ${alpha(asignacion.materia_color || '#0288d1', 0.3)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 28px ${alpha(asignacion.materia_color || '#0288d1', 0.3)}`,
                                borderColor: alpha(asignacion.materia_color || '#0288d1', 0.6),
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: asignacion.materia_color || '#0288d1',
                                        width: 48,
                                        height: 48,
                                        boxShadow: `0 4px 12px ${alpha(asignacion.materia_color || '#0288d1', 0.4)}`,
                                      }}
                                    >
                                      <SchoolIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {asignacion.materia_nombre}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {asignacion.nivel_nombre} - {asignacion.grado_nombre} | Paralelo {asignacion.paralelo_nombre}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                    <Chip
                                      size="small"
                                      label={asignacion.turno_nombre}
                                      sx={{
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        backgroundColor: alpha('#3b82f6', 0.15),
                                        color: '#3b82f6',
                                      }}
                                    />
                                    <Chip
                                      size="small"
                                      icon={asignacion.es_titular ? <CheckIcon /> : undefined}
                                      label={asignacion.es_titular ? 'Titular' : 'Auxiliar'}
                                      sx={{
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        backgroundColor: asignacion.es_titular 
                                          ? alpha('#10b981', 0.15)
                                          : alpha('#6b7280', 0.15),
                                        color: asignacion.es_titular ? '#10b981' : '#6b7280',
                                      }}
                                    />
                                    {asignacion.total_estudiantes !== undefined && (
                                      <Chip
                                        size="small"
                                        icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                                        label={`${asignacion.total_estudiantes} estudiantes`}
                                        sx={{
                                          borderRadius: '8px',
                                          fontWeight: 600,
                                          backgroundColor: alpha('#f59e0b', 0.15),
                                          color: '#f59e0b',
                                        }}
                                      />
                                    )}
                                    {asignacion.horas_semanales && (
                                      <Chip
                                        size="small"
                                        icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                                        label={`${asignacion.horas_semanales}h/semana`}
                                        sx={{
                                          borderRadius: '8px',
                                          fontWeight: 600,
                                          backgroundColor: alpha('#8b5cf6', 0.15),
                                          color: '#8b5cf6',
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Tab de Información Profesional */}
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  {/* Formación Académica */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha('#8b5cf6', 0.15),
                        }}
                      >
                        <PsychologyIcon sx={{ fontSize: 24, color: '#8b5cf6' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Formación Académica
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: isDark
                          ? alpha('#1e293b', 0.5)
                          : alpha('#f8fafc', 0.8),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Título Profesional
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {docente.titulo_profesional || 'No especificado'}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: isDark
                          ? alpha('#1e293b', 0.5)
                          : alpha('#f8fafc', 0.8),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Título de Postgrado
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {docente.titulo_postgrado || 'No especificado'}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: isDark
                          ? alpha('#1e293b', 0.5)
                          : alpha('#f8fafc', 0.8),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Nivel de Formación
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                        {docente.nivel_formacion || 'No especificado'}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: isDark
                          ? alpha('#1e293b', 0.5)
                          : alpha('#f8fafc', 0.8),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Años de Experiencia
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {docente.experiencia_anios || 0} años
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Información Contractual */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha('#10b981', 0.15),
                        }}
                      >
                        <MoneyIcon sx={{ fontSize: 24, color: '#10b981' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Información Contractual
                      </Typography>
                    </Box>
                  </Grid>

                  {docente.salario_mensual && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, ${alpha('#059669', 0.05)} 100%)`,
                          border: `2px solid ${alpha('#10b981', 0.3)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Salario Mensual
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                          Bs. {Number(docente.salario_mensual).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Card>
                    </Grid>
                  )}

                  {docente.numero_cuenta && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: isDark
                            ? alpha('#1e293b', 0.5)
                            : alpha('#f8fafc', 0.8),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Número de Cuenta
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {docente.numero_cuenta}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
            </Box>
          </Paper>
        </Fade>

        {/* Dialog de eliminación mejorado */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '20px',
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#ef4444', 0.15) }}>
              <WarningIcon sx={{ color: '#ef4444' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ¿Eliminar docente?
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography sx={{ mb: 2 }}>
              ¿Estás seguro de que deseas eliminar a <strong>{docente.nombres} {docente.apellidos}</strong>?
              Esta acción no se puede deshacer.
            </Typography>
            {estadisticas && estadisticas.asignaciones_activas > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: alpha('#ef4444', 0.1),
                  border: `2px solid ${alpha('#ef4444', 0.3)}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <WarningIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444', mb: 0.5 }}>
                    ⚠️ No se puede eliminar
                  </Typography>
                  <Typography variant="body2">
                    Este docente tiene <strong>{estadisticas.asignaciones_activas} asignación(es) activa(s)</strong>.
                    Debes desasignarlas primero.
                  </Typography>
                </Box>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '10px', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              disabled={estadisticas ? estadisticas.asignaciones_activas > 0 : false}
              sx={{ 
                borderRadius: '10px', 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de crear usuario mejorado */}
        <Dialog 
          open={createUserDialogOpen} 
          onClose={() => setCreateUserDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15) }}>
              <AccountIcon sx={{ color: '#8b5cf6' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Crear Usuario de Acceso
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generar credenciales para {docente.nombres}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setCreateUserDialogOpen(false)}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Username (opcional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                helperText="Se generará automáticamente si se deja vacío"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth
                type="password"
                label="Contraseña (opcional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Se generará automáticamente si se deja vacía"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth
                type="email"
                label="Email (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Se usará el email del docente si se deja vacío"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha('#3b82f6', 0.1),
                  border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  💡 <strong>Nota:</strong> Las credenciales generadas se mostrarán una sola vez.
                  Asegúrate de guardarlas.
                </Typography>
              </Paper>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setCreateUserDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '10px', fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser} 
              variant="contained"
              sx={{ 
                borderRadius: '10px', 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              }}
            >
              Crear Usuario
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}