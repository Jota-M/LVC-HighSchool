// pages/EstudianteDetalle.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  useTheme,
  Fade,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Description as DocumentIcon,
  Timeline as TimelineIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  Accessible as AccessibleIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useEstudiante } from '@/hooks/useEstudiantes';
import { DocumentosTab } from '@/components/estudiantes/DocumentosTab';

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

export const EstudianteDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const { estudiante, isLoading } = useEstudiante(id ? parseInt(id) : null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #090B26, #000000)'
            : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!estudiante) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #090B26, #000000)'
            : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
        }}
      >
        <Alert severity="error">Estudiante no encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box>
            {/* Header con botón de regresar */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/dashboard/estudiantes')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: isDark ? '#facc15' : '#0288d1',
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
              {/* Banner superior */}
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
                      src={estudiante.foto_url || undefined}
                      sx={{
                        width: 150,
                        height: 150,
                        border: '6px solid',
                        borderColor: isDark ? '#0f172a' : '#fff',
                        fontSize: '3rem',
                        fontWeight: 700,
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      {!estudiante.foto_url &&
                        `${estudiante.nombres.charAt(0)}${estudiante.apellido_paterno.charAt(0)}`}
                    </Avatar>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        {estudiante.nombres} {estudiante.apellidos}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={estudiante.codigo}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        />
                        <Chip
                          label={estudiante.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={estudiante.activo ? 'success' : 'error'}
                        />
                        {estudiante.usuario_id && (
                          <Chip label="Con usuario" size="small" color="info" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton
                      onClick={() => router.push(`/dashboard/estudiantes/${id}/editar`)}
                      sx={{
                        bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.2)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Info rápida */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid size={{xs:12, md:3}} >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Edad
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {calculateAge(estudiante.fecha_nacimiento)} años
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{xs:12, md:3}} >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BadgeIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          CI
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {estudiante.ci || 'No especificado'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{xs:12, md:3}} >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Teléfono
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {estudiante.telefono || 'No especificado'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{xs:12, md:3}} >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Matrículas
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {estudiante.total_matriculas || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
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
                  '& .Mui-selected': {
                    color: isDark ? '#facc15' : '#0288d1',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                  },
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label="Perfil" />
                <Tab icon={<PeopleIcon />} iconPosition="start" label="Tutores" />
                <Tab icon={<SchoolIcon />} iconPosition="start" label="Matrículas" />
                <Tab icon={<DocumentIcon />} iconPosition="start" label="Documentos" />
                <Tab icon={<TimelineIcon />} iconPosition="start" label="Historial" />
              </Tabs>

              <Divider />

              <Box sx={{ p: 4 }}>
                {/* Tab: Perfil */}
                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={3}>
                    <Grid size={{xs:12, md:3}} >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                          Información Personal
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Nombres completos
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.nombres}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Apellidos
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.apellidos}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Fecha de nacimiento
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Lugar de nacimiento
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.lugar_nacimiento || 'No especificado'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Género
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.genero === 'masculino'
                                ? 'Masculino'
                                : estudiante.genero === 'femenino'
                                ? 'Femenino'
                                : 'No especificado'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid size={{xs:12, md:6}} >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                          Contacto y Ubicación
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HomeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Dirección
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {estudiante.direccion || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Zona / Ciudad
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.zona && estudiante.ciudad
                                ? `${estudiante.zona}, ${estudiante.ciudad}`
                                : estudiante.zona || estudiante.ciudad || 'No especificado'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Teléfono
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {estudiante.telefono || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Email
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {estudiante.email || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Emergencia */}
                    {(estudiante.contacto_emergencia || estudiante.telefono_emergencia) && (
                      <Grid size={{xs:12}}>
                        <Alert
                          severity="warning"
                          icon={<PhoneIcon />}
                          sx={{ borderRadius: '16px' }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            Contacto de Emergencia
                          </Typography>
                          <Typography variant="body2">
                            {estudiante.contacto_emergencia} - {estudiante.telefono_emergencia}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}

                    {/* Discapacidad */}
                    {estudiante.tiene_discapacidad && (
                      <Grid size={{xs:12}}>
                        <Alert severity="info" icon={<AccessibleIcon />} sx={{ borderRadius: '16px' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Información Especial
                          </Typography>
                          <Typography variant="body2">
                            Tipo de discapacidad: {estudiante.tipo_discapacidad}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}

                    {/* Observaciones */}
                    {estudiante.observaciones && (
                      <Grid size={{xs:12}}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                            Observaciones
                          </Typography>
                          <Typography variant="body1">{estudiante.observaciones}</Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                {/* Tab: Tutores */}
                <TabPanel value={activeTab} index={1}>
                  {estudiante.tutores && estudiante.tutores.length > 0 ? (
                    <Grid container spacing={3}>
                      {estudiante.tutores.map((tutor: any, index: number) => (
                        <Grid size={{xs:12, md:6}} key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" fontWeight={700}>
                                {tutor.nombres} {tutor.apellido_paterno}
                              </Typography>
                              {tutor.es_tutor_principal && (
                                <Chip label="Principal" size="small" color="primary" />
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  CI
                                </Typography>
                                <Typography variant="body2">{tutor.ci}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Parentesco
                                </Typography>
                                <Typography variant="body2">{tutor.parentesco || 'No especificado'}</Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Teléfono / Celular
                                </Typography>
                                <Typography variant="body2">
                                  {tutor.telefono || tutor.celular || 'No especificado'}
                                </Typography>
                              </Box>

                              {tutor.email && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Email
                                  </Typography>
                                  <Typography variant="body2">{tutor.email}</Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">No hay tutores registrados</Alert>
                  )}
                </TabPanel>

                {/* Tab: Matrículas */}
                <TabPanel value={activeTab} index={2}>
                  {estudiante.matriculas && estudiante.matriculas.length > 0 ? (
                    <Grid container spacing={3}>
                      {estudiante.matriculas.map((matricula: any, index: number) => (
                        <Grid size={{xs:12, md:6}} key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" fontWeight={700}>
                                {matricula.periodo}
                              </Typography>
                              <Chip label={matricula.estado} size="small" color="success" />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography variant="body2">
                                <strong>Grado:</strong> {matricula.grado}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Paralelo:</strong> {matricula.paralelo}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Turno:</strong> {matricula.turno}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">No hay matrículas registradas</Alert>
                  )}
                </TabPanel>

                {/* Tab: Documentos */}
                <TabPanel value={activeTab} index={3}>
                  <DocumentosTab 
                    estudianteId={parseInt(id!)} 
                    matriculas={estudiante.matriculas || []} 
                  />
                </TabPanel>

                {/* Tab: Historial */}
                <TabPanel value={activeTab} index={4}>
                  <Alert severity="info">Sección de historial en desarrollo</Alert>
                </TabPanel>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default EstudianteDetalle;