// src/app/dashboard/docente/estudiantes/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Avatar,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  useTheme,
  Fade,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  Accessible as AccessibleIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useMiEstudianteDocenteDetalle } from '@/hooks/useMisEstudiantesDocente';
import { TutoresTab } from '@/components/estudiantes/TutoresTab';

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

export default function MiEstudianteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const studentId = id ? parseInt(id, 10) : null;
  const { estudiante, isLoading, error } = useMiEstudianteDocenteDetalle(studentId);

  const accent = isDark ? '#facc15' : '#0288d1';
  const accentGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} años` : '-';
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  if (error || !estudiante) {
    return (
      <Box sx={{ minHeight: '80vh', py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ borderRadius: '16px', mb: 3 }}>
            No se pudo cargar la información del estudiante o no tienes permisos para consultarlo.
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/docente/estudiantes')}
            sx={{ textTransform: 'none', fontWeight: 600, color: accent }}
          >
            Volver a mis estudiantes
          </Button>
        </Container>
      </Box>
    );
  }

  const initials = `${estudiante.nombres?.charAt(0) || ''}${estudiante.apellido_paterno?.charAt(0) || ''}`.toUpperCase();
  const fullName = `${estudiante.nombres} ${estudiante.apellidos || `${estudiante.apellido_paterno} ${estudiante.apellido_materno || ''}`}`;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={400}>
          <Box>
            {/* Header con botón de regresar */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/dashboard/docente/estudiantes')}
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
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mb: 3,
              }}
            >
              {/* Banner superior */}
              <Box
                sx={{
                  height: 150,
                  background: accentGradient,
                  position: 'relative',
                }}
              />

              {/* Contenido del perfil */}
              <Box sx={{ px: 4, pb: 4 }}>
                {/* Avatar y Datos Principales */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'center', md: 'flex-start' },
                    flexDirection: { xs: 'column', md: 'row' },
                    mt: -8,
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      alignItems: { xs: 'center', md: 'flex-end' },
                      flexDirection: { xs: 'column', md: 'row' },
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    <Avatar
                      src={estudiante.foto_url || undefined}
                      sx={{
                        width: 140,
                        height: 140,
                        border: '6px solid',
                        borderColor: isDark ? '#0f172a' : '#fff',
                        fontSize: '2.8rem',
                        fontWeight: 700,
                        bgcolor: accent,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}
                    >
                      {!estudiante.foto_url && initials}
                    </Avatar>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                        {fullName}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', md: 'flex-start' },
                        }}
                      >
                        <Chip
                          label={estudiante.codigo}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.15)',
                            color: accent,
                          }}
                        />
                        <Chip
                          label={estudiante.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={estudiante.activo ? 'success' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                        {estudiante.usuario_id && (
                          <Chip
                            label="Con usuario"
                            size="small"
                            color="info"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        {estudiante.rude && (
                          <Chip
                            label={estudiante.rude}
                            size="small"
                            color="info"
                            sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Info rápida */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '12px',
                          bgcolor: alpha(accent, 0.12),
                          color: accent,
                          display: 'flex',
                        }}
                      >
                        <CakeIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Edad
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {calculateAge(estudiante.fecha_nacimiento)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '12px',
                          bgcolor: alpha(accent, 0.12),
                          color: accent,
                          display: 'flex',
                        }}
                      >
                        <BadgeIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          CI
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {estudiante.ci || 'No especificado'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '12px',
                          bgcolor: alpha(accent, 0.12),
                          color: accent,
                          display: 'flex',
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Teléfono
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {estudiante.telefono || 'No especificado'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '12px',
                          bgcolor: alpha(accent, 0.12),
                          color: accent,
                          display: 'flex',
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Matrículas
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {estudiante.total_matriculas || 0}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Tabs de contenido: Perfil y Tutores únicamente */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  pt: 1.5,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    minHeight: 48,
                    fontSize: '0.95rem',
                  },
                  '& .Mui-selected': {
                    color: accent,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: accent,
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label="Perfil" />
                <Tab icon={<PeopleIcon />} iconPosition="start" label="Tutores" />
              </Tabs>

              <Divider />

              <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                {/* Tab 0: Perfil */}
                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={3}>
                    {/* Información Personal */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                          <PersonIcon sx={{ color: accent }} />
                          <Typography variant="h6" fontWeight={700}>
                            Información Personal
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                              {estudiante.apellidos || `${estudiante.apellido_paterno} ${estudiante.apellido_materno || ''}`}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Fecha de nacimiento
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {estudiante.fecha_nacimiento
                                ? new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })
                                : 'No especificado'}
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

                    {/* Contacto y Ubicación */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                          <HomeIcon sx={{ color: accent }} />
                          <Typography variant="h6" fontWeight={700}>
                            Contacto y Ubicación
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <HomeIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Dirección
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {estudiante.direccion || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
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
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Teléfono
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {estudiante.telefono || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <EmailIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
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

                    {/* Alerta de Emergencia */}
                    {estudiante.contacto_emergencia && (
                      <Grid size={{ xs: 12 }}>
                        <Alert
                          severity="warning"
                          icon={<PhoneIcon />}
                          sx={{ borderRadius: '16px', fontWeight: 500 }}
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            Contacto de Emergencia
                          </Typography>
                          <Typography variant="body2">
                            {estudiante.contacto_emergencia}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}

                    {/* Alerta de Discapacidad */}
                    {estudiante.tiene_discapacidad && (
                      <Grid size={{ xs: 12 }}>
                        <Alert
                          severity="info"
                          icon={<AccessibleIcon />}
                          sx={{ borderRadius: '16px', fontWeight: 500 }}
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            Información Especial
                          </Typography>
                          <Typography variant="body2">
                            Tipo de discapacidad: {estudiante.tipo_discapacidad || 'No especificado'}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}

                    {/* Observaciones */}
                    {estudiante.observaciones && (
                      <Grid size={{ xs: 12 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                            Observaciones
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {estudiante.observaciones}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                {/* Tab 1: Tutores (Solo lectura) */}
                <TabPanel value={activeTab} index={1}>
                  <TutoresTab
                    tutores={estudiante.tutores ?? []}
                    estudianteId={estudiante.id}
                    readOnly={true}
                  />
                </TabPanel>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
