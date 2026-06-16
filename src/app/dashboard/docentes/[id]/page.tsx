// src/app/dashboard/docentes/[id]/page.tsx
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
  Stack,
  Fade,
  IconButton,
  Alert,
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
  Badge as BadgeIcon,
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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
            <WarningIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
              Error: ID inválido
            </Typography>
            <Button variant="contained" onClick={() => router.push('/dashboard/docentes')} startIcon={<BackIcon />}>
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
    refrescar,
  } = useDocenteDetalle(docenteId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const handleEdit = () => router.push(`/dashboard/docentes/${docenteId}/editar`);
  const handleDeleteClick = () => setDeleteDialogOpen(true);

  const handleDeleteConfirm = async () => {
    try {
      await docenteService.eliminar(docenteId);
      toast.success('Docente eliminado exitosamente');
      router.push('/dashboard/docentes');
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al eliminar docente';
      toast.error(mensaje.includes('asignaciones activas')
        ? 'No se puede eliminar un docente con asignaciones activas'
        : mensaje);
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
      toast.success(`Username: ${usuario.username}\nContraseña: ${usuario.password_temporal}`, { duration: 10000 });
      setCreateUserDialogOpen(false);
      refrescar();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const getContratoColor = (tipo?: string | null) => {
    const map: Record<string, string> = {
      planta: '#10b981',
      contrato: '#3b82f6',
      honorarios: '#f59e0b',
      medio_tiempo: '#8b5cf6',
    };
    return map[tipo ?? ''] ?? '#6b7280';
  };

  const getContratoLabel = (tipo?: string | null) => {
    const map: Record<string, string> = {
      planta: 'Planta',
      contrato: 'Contrato',
      honorarios: 'Honorarios',
      medio_tiempo: 'Medio Tiempo',
    };
    return map[tipo ?? ''] ?? 'N/A';
  };

  const accentColor = isDark ? '#facc15' : '#0288d1';

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '24px', mb: 3 }} />
          <Skeleton variant="rectangular" height={500} sx={{ borderRadius: '24px' }} />
        </Container>
      </Box>
    );
  }

  if (!docente) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
            <SchoolIcon sx={{ fontSize: 100, color: 'text.disabled', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Docente no encontrado</Typography>
            <Button variant="contained" onClick={() => router.back()} size="large" sx={{ borderRadius: '12px' }}>
              Volver
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box>
            {/* Botón volver */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => router.back()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: accentColor,
                }}
              >
                Volver a la lista
              </Button>
            </Box>

            {/* Card de perfil principal */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                mb: 3,
              }}
            >
              {/* Banner sólido */}
              <Box
                sx={{
                  height: 150,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  position: 'relative',
                }}
              />

              {/* Contenido del perfil */}
              <Box sx={{ px: 4, pb: 4 }}>
                {/* Avatar y acciones */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mt: -8,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                    <Avatar
                      src={docente.foto_url || undefined}
                      sx={{
                        width: 150,
                        height: 150,
                        border: '6px solid',
                        borderColor: isDark ? '#0f172a' : '#fff',
                        fontSize: '3rem',
                        fontWeight: 700,
                        bgcolor: accentColor,
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      {!docente.foto_url && `${docente.nombres.charAt(0)}${docente.apellido_paterno.charAt(0)}`}
                    </Avatar>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        {docente.nombres} {docente.apellidos}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={docente.codigo}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)',
                            color: accentColor,
                          }}
                        />
                        <Chip
                          label={docente.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={docente.activo ? 'success' : 'error'}
                        />
                        <Chip
                          label={getContratoLabel(docente.tipo_contrato)}
                          size="small"
                          sx={{
                            bgcolor: alpha(getContratoColor(docente.tipo_contrato), 0.15),
                            color: getContratoColor(docente.tipo_contrato),
                            fontWeight: 600,
                          }}
                        />
                        {docente.usuario_id && (
                          <Chip label="Con usuario" size="small" color="info" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {docente.cv_url && (
                      <Button
                        variant="outlined"
                        startIcon={<CVIcon />}
                        href={docente.cv_url}
                        target="_blank"
                        size="small"
                        sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}
                      >
                        Ver CV
                      </Button>
                    )}
                    {!docente.usuario_id && (
                      <Button
                        variant="contained"
                        startIcon={<AccountIcon />}
                        onClick={() => setCreateUserDialogOpen(true)}
                        size="small"
                        sx={{
                          borderRadius: '10px',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        }}
                      >
                        Crear Usuario
                      </Button>
                    )}
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        bgcolor: isDark ? 'rgba(250,204,21,0.1)' : 'rgba(2,136,209,0.1)',
                        '&:hover': { bgcolor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleDeleteClick}
                      sx={{
                        bgcolor: 'rgba(239,68,68,0.1)',
                        color: '#ef4444',
                        '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Info rápida en fila */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {docente.email && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body1" fontWeight={600}>{docente.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {docente.celular && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Celular</Typography>
                          <Typography variant="body1" fontWeight={600}>{docente.celular}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {docente.ci && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BadgeIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">CI</Typography>
                          <Typography variant="body1" fontWeight={600}>{docente.ci}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {estadisticas && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Asignaciones activas</Typography>
                          <Typography variant="body1" fontWeight={600}>{estadisticas.asignaciones_activas}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {docente.especialidad && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Especialidad</Typography>
                          <Typography variant="body1" fontWeight={600}>{docente.especialidad}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {docente.fecha_contratacion && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Contratación</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {new Date(docente.fecha_contratacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {estadisticas && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupsIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Paralelos</Typography>
                          <Typography variant="body1" fontWeight={600}>{estadisticas.paralelos_asignados}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {estadisticas && (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Materias</Typography>
                          <Typography variant="body1" fontWeight={600}>{estadisticas.materias_diferentes}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>

            {/* Tabs de contenido */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  pt: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 48,
                  },
                  '& .Mui-selected': { color: accentColor },
                  '& .MuiTabs-indicator': { backgroundColor: accentColor },
                }}
              >
                <Tab icon={<AssignmentIcon />} iconPosition="start" label="Asignaciones" />
                <Tab icon={<WorkIcon />} iconPosition="start" label="Información Profesional" />
              </Tabs>

              <Divider />

              <Box sx={{ p: 4 }}>
                {/* Tab: Asignaciones */}
                <TabPanel value={activeTab} index={0}>
                  {isLoadingAsignaciones ? (
                    <Stack spacing={2}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: '16px' }} />
                      ))}
                    </Stack>
                  ) : asignaciones.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: '20px',
                        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Sin asignaciones</Typography>
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
                          textTransform: 'none',
                        }}
                      >
                        Crear Asignación
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {asignaciones.map((asignacion) => (
                        <Grid size={{ xs: 12, md: 6 }} key={asignacion.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              border: `1px solid ${alpha(asignacion.materia_color || accentColor, 0.25)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 24px ${alpha(asignacion.materia_color || accentColor, 0.2)}`,
                                borderColor: alpha(asignacion.materia_color || accentColor, 0.5),
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: asignacion.materia_color || accentColor,
                                  width: 44,
                                  height: 44,
                                }}
                              >
                                <SchoolIcon sx={{ fontSize: 20 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {asignacion.materia_nombre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {asignacion.nivel_nombre} — {asignacion.grado_nombre} | Paralelo {asignacion.paralelo_nombre}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={asignacion.turno_nombre}
                                sx={{
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  bgcolor: alpha('#3b82f6', 0.12),
                                  color: '#3b82f6',
                                }}
                              />
                              <Chip
                                size="small"
                                label={asignacion.es_titular ? 'Titular' : 'Auxiliar'}
                                sx={{
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  bgcolor: asignacion.es_titular ? alpha('#10b981', 0.12) : alpha('#6b7280', 0.12),
                                  color: asignacion.es_titular ? '#10b981' : '#6b7280',
                                }}
                              />
                              {asignacion.total_estudiantes !== undefined && (
                                <Chip
                                  size="small"
                                  icon={<GroupsIcon sx={{ fontSize: 14 }} />}
                                  label={`${asignacion.total_estudiantes} estudiantes`}
                                  sx={{
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    bgcolor: alpha('#f59e0b', 0.12),
                                    color: '#f59e0b',
                                  }}
                                />
                              )}
                              {asignacion.horas_semanales && (
                                <Chip
                                  size="small"
                                  icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                                  label={`${asignacion.horas_semanales}h/sem`}
                                  sx={{
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    bgcolor: alpha('#8b5cf6', 0.12),
                                    color: '#8b5cf6',
                                  }}
                                />
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>

                {/* Tab: Información Profesional */}
                <TabPanel value={activeTab} index={1}>
                  <Grid container spacing={3}>
                    {/* Formación Académica */}
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <PsychologyIcon sx={{ color: '#8b5cf6' }} />
                        <Typography variant="h6" fontWeight={700}>Formación Académica</Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Título Profesional</Typography>
                        <Typography variant="body1" fontWeight={600}>{docente.titulo_profesional || 'No especificado'}</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Título de Postgrado</Typography>
                        <Typography variant="body1" fontWeight={600}>{docente.titulo_postgrado || 'No especificado'}</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Nivel de Formación</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{docente.nivel_formacion || 'No especificado'}</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" color="text.secondary">Años de Experiencia</Typography>
                        <Typography variant="body1" fontWeight={600}>{docente.experiencia_anios || 0} años</Typography>
                      </Paper>
                    </Grid>

                    {docente.direccion && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info" icon={<HomeIcon />} sx={{ borderRadius: '16px' }}>
                          <Typography variant="subtitle2" fontWeight={600}>Dirección</Typography>
                          <Typography variant="body2">{docente.direccion}</Typography>
                        </Alert>
                      </Grid>
                    )}

                    {/* Información Contractual */}
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, mt: 1 }}>
                        <MoneyIcon sx={{ color: '#10b981' }} />
                        <Typography variant="h6" fontWeight={700}>Información Contractual</Typography>
                      </Box>
                    </Grid>

                    {docente.salario_mensual && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                            bgcolor: alpha('#10b981', 0.05),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">Salario Mensual</Typography>
                          <Typography variant="h5" fontWeight={800} sx={{ color: '#10b981' }}>
                            Bs. {Number(docente.salario_mensual).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {docente.numero_cuenta && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                          <Typography variant="caption" color="text.secondary">Número de Cuenta</Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {docente.numero_cuenta}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* Dialog eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', minWidth: 400 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#ef4444', 0.15) }}>
            <WarningIcon sx={{ color: '#ef4444' }} />
          </Avatar>
          <Typography variant="h6" fontWeight={700}>¿Eliminar docente?</Typography>
          <IconButton onClick={() => setDeleteDialogOpen(false)} sx={{ ml: 'auto' }}>
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
            <Alert
              severity="error"
              icon={<WarningIcon />}
              sx={{ borderRadius: '12px' }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>No se puede eliminar</Typography>
              <Typography variant="body2">
                Este docente tiene <strong>{estadisticas.asignaciones_activas} asignación(es) activa(s)</strong>. Debes desasignarlas primero.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={estadisticas ? estadisticas.asignaciones_activas > 0 : false}
            sx={{ borderRadius: '10px', fontWeight: 600 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog crear usuario */}
      <Dialog
        open={createUserDialogOpen}
        onClose={() => setCreateUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15) }}>
            <AccountIcon sx={{ color: '#8b5cf6' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>Crear Usuario de Acceso</Typography>
            <Typography variant="caption" color="text.secondary">Generar credenciales para {docente.nombres}</Typography>
          </Box>
          <IconButton onClick={() => setCreateUserDialogOpen(false)} sx={{ ml: 'auto' }}>
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
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              Las credenciales generadas se mostrarán una sola vez. Asegúrate de guardarlas.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setCreateUserDialogOpen(false)} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>
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
    </Box>
  );
}