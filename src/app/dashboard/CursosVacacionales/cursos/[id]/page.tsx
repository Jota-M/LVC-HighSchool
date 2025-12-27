// pages/CursosVacacionales/CursoDetalle.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  useTheme,
  Fade,
  keyframes,
  alpha,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  School,
  CalendarMonth,
  AccessTime,
  AttachMoney,
  People,
  LocationOn,
  Description,
  CheckCircle,
  Cancel,
  TrendingUp,
  WbSunny,
  AcUnit,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useCursoVacacional } from '@/hooks/useCursosVacacionales';
import { useQuery } from '@tanstack/react-query';
import cursoVacacionalService from '@/services/cursoVacacionalService';
import { InscripcionVacacional } from '@/types/cursoVacacionalTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const CursoDetalle: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const cursoId = params?.id ? parseInt(params.id as string) : null;
  const [activeTab, setActiveTab] = useState(0);

  // Hooks
  const { curso, isLoading } = useCursoVacacional(cursoId);

  // Obtener estudiantes inscritos (solo ACTIVOS - los que están cursando)
  const { data: estudiantes, isLoading: loadingEstudiantes } = useQuery<InscripcionVacacional[]>({
    queryKey: ['estudiantes-curso', cursoId],
    queryFn: () => cursoVacacionalService.cursos.listarEstudiantes(cursoId!, 'activo'),
    enabled: !!cursoId,
  });

  // Obtener todas las inscripciones para mostrar estadísticas
  const { data: todasInscripciones } = useQuery<InscripcionVacacional[]>({
    queryKey: ['todas-inscripciones-curso', cursoId],
    queryFn: async () => {
      const response = await cursoVacacionalService.inscripciones.listar({
        curso_vacacional_id: cursoId!,
        limit: 1000,
      });
      return response.inscripciones;
    },
    enabled: !!cursoId,
  });

  const handleBack = () => {
    router.push('/dashboard/cursos-vacacionales/cursos');
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVerInscripcion = (inscripcionId: number) => {
    router.push(`/dashboard/cursos-vacacionales/inscripciones/${inscripcionId}`);
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd 'de' MMMM 'de' yyyy");
    } catch {
      return fecha;
    }
  };

  const formatFechaCorta = (fecha: string) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy');
    } catch {
      return fecha;
    }
  };

  const getInitials = (nombres: string, apellido: string) => {
    return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography>Cargando...</Typography>
        </Container>
      </Box>
    );
  }

  if (!curso) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography>Curso no encontrado</Typography>
        </Container>
      </Box>
    );
  }

  const porcentajeOcupacion = (curso.cupos_ocupados / curso.cupos_totales) * 100;
  const ocupacionColor = porcentajeOcupacion >= 90 ? '#ef4444' : porcentajeOcupacion >= 70 ? '#f59e0b' : '#10b981';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                mb: 2,
                color: isDark ? '#facc15' : '#0288d1',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                },
              }}
            >
              Volver a Cursos
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <School
                sx={{
                  color: isDark ? '#facc15' : '#0288d1',
                  fontSize: 36,
                  animation: `${bounce} 1.5s infinite`,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Detalle del Curso
              </Typography>
            </Box>

            {/* Info Card Header */}
            <Card
              sx={{
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.2),
                      color: isDark ? '#facc15' : '#0288d1',
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    <School fontSize="large" />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {curso.nombre}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {curso.codigo && (
                        <Chip
                          label={curso.codigo}
                          size="small"
                          sx={{
                            bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {curso.activo ? (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 16 }} />}
                          label="Activo"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: '#10b981',
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<Cancel sx={{ fontSize: 16 }} />}
                          label="Inactivo"
                          sx={{
                            bgcolor: alpha('#6b7280', 0.1),
                            color: '#6b7280',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: '#6b7280',
                            },
                          }}
                        />
                      )}
                      {curso.grado_nombre && (
                        <Chip
                          label={curso.grado_nombre}
                          size="small"
                          sx={{
                            bgcolor: alpha('#3b82f6', 0.1),
                            color: '#3b82f6',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Estadísticas Rápidas */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: ocupacionColor }}>
                        {curso.cupos_ocupados}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Inscritos
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {curso.cupos_disponibles}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Disponibles
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Barra de Progreso */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Ocupación del Curso
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: ocupacionColor }}>
                      {porcentajeOcupacion.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={porcentajeOcupacion}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        backgroundColor: ocupacionColor,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                borderRadius: '16px',
                p: 1,
                backdropFilter: 'blur(20px)',
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                },
                '& .Mui-selected': {
                  color: isDark ? '#fff' : '#fff',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#fff' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label="Información General" />
              <Tab label={`Estudiantes Activos (${estudiantes?.length || 0})`} />
              <Tab label="Todas las Inscripciones" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Información del Curso */}
            <Grid size={{xs:12, md:6}}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha('#3b82f6', 0.1),
                        color: '#3b82f6',
                      }}
                    >
                      <School />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Información del Curso
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        NOMBRE DEL CURSO
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {curso.nombre}
                      </Typography>
                    </Box>

                    {curso.descripcion && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Description sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DESCRIPCIÓN
                          </Typography>
                        </Box>
                        <Typography variant="body2">{curso.descripcion}</Typography>
                      </Box>
                    )}

                    {curso.materia_nombre && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          MATERIA
                        </Typography>
                        <Typography variant="body1">{curso.materia_nombre}</Typography>
                      </Box>
                    )}

                    {curso.aula && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            AULA
                          </Typography>
                        </Box>
                        <Typography variant="body1">{curso.aula}</Typography>
                      </Box>
                    )}

                    {curso.requisitos && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          REQUISITOS
                        </Typography>
                        <Typography variant="body2">{curso.requisitos}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Periodo */}
            <Grid size={{xs:12, md:6}}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: curso.periodo_tipo === 'verano' ? alpha('#f59e0b', 0.1) : alpha('#3b82f6', 0.1),
                        color: curso.periodo_tipo === 'verano' ? '#f59e0b' : '#3b82f6',
                      }}
                    >
                      {curso.periodo_tipo === 'verano' ? <WbSunny /> : <AcUnit />}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Periodo
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        PERIODO VACACIONAL
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {curso.periodo_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {curso.periodo_tipo === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
                      </Typography>
                    </Box>

                    {curso.periodo_fecha_inicio && curso.periodo_fecha_fin && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          FECHAS DEL PERIODO
                        </Typography>
                        <Typography variant="body2">
                          Del {formatFechaCorta(curso.periodo_fecha_inicio)} al{' '}
                          {formatFechaCorta(curso.periodo_fecha_fin)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Horarios */}
            <Grid size={{xs:12, md:6}}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha('#10b981', 0.1),
                        color: '#10b981',
                      }}
                    >
                      <AccessTime />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Horarios
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          FECHAS DEL CURSO
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Del {formatFechaCorta(curso.fecha_inicio)} al {formatFechaCorta(curso.fecha_fin)}
                      </Typography>
                    </Box>

                    {curso.dias_semana && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          DÍAS DE CLASE
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {curso.dias_semana.split(',').map((dia, index) => (
                              <Chip
                                key={index}
                                label={dia.trim()}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#10b981', 0.1),
                                  color: '#10b981',
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    )}

                    {curso.hora_inicio && curso.hora_fin && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            HORARIO
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {curso.hora_inicio.slice(0, 5)} - {curso.hora_fin.slice(0, 5)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Costos y Cupos */}
            <Grid size={{xs:12, md:6}}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha('#f59e0b', 0.1),
                        color: '#f59e0b',
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Costos y Cupos
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <AttachMoney sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          COSTO DEL CURSO
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
                        Bs.{' '}
                        {curso.costo.toLocaleString('es-BO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          CUPOS
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{xs:4}}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              {curso.cupos_totales}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Totales
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{xs:4}}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: ocupacionColor }}>
                              {curso.cupos_ocupados}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ocupados
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{xs:4}}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                              {curso.cupos_disponibles}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Disponibles
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha('#10b981', 0.1),
                    color: '#10b981',
                  }}
                >
                  <School />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Estudiantes Activos - Cursando Actualmente
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Estudiantes con estado "Activo" que están asistiendo al curso
                  </Typography>
                </Box>
                <Chip
                  label={`${estudiantes?.length || 0} activos`}
                  sx={{
                    bgcolor: alpha('#10b981', 0.1),
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {loadingEstudiantes ? (
                <Typography>Cargando estudiantes...</Typography>
              ) : !estudiantes || estudiantes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    No hay estudiantes activos
                  </Typography>
                  <Typography color="text.secondary">
                    Los estudiantes aparecerán aquí cuando su inscripción cambie a estado "Activo"
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {estudiantes.map((estudiante, index) => (
                    <ListItem
                      key={estudiante.id}
                      sx={{
                        borderRadius: '12px',
                        mb: 1,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                        },
                      }}
                      onClick={() => handleVerInscripcion(estudiante.id)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha('#10b981', 0.2),
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(estudiante.nombres, estudiante.apellido_paterno)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {index + 1}. {estudiante.nombres} {estudiante.apellido_paterno}{' '}
                            {estudiante.apellido_materno}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {estudiante.codigo_inscripcion}
                            </Typography>
                            {estudiante.ci && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                CI: {estudiante.ci}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Card
            sx={{
              borderRadius: '20px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha('#3b82f6', 0.1),
                    color: '#3b82f6',
                  }}
                >
                  <People />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Todas las Inscripciones ({todasInscripciones?.length || 0})
                </Typography>
              </Box>

              {/* Resumen por estado */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { estado: 'pendiente', label: 'Pendientes', color: '#f59e0b' },
                  { estado: 'pago_verificado', label: 'Verificados', color: '#3b82f6' },
                  { estado: 'activo', label: 'Activos', color: '#10b981' },
                  { estado: 'completado', label: 'Completados', color: '#8b5cf6' },
                  { estado: 'retirado', label: 'Retirados', color: '#6b7280' },
                  { estado: 'rechazado', label: 'Rechazados', color: '#ef4444' },
                ].map((item) => {
                  const count = todasInscripciones?.filter(i => i.estado === item.estado).length || 0;
                  return (
                    <Grid size={{xs:6, sm:4, md:2}} key={item.estado}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: alpha(item.color, 0.1),
                          border: `1px solid ${alpha(item.color, 0.2)}`,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 800, color: item.color }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Lista completa */}
              {!todasInscripciones || todasInscripciones.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No hay inscripciones registradas para este curso
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {todasInscripciones.map((inscripcion, index) => {
                    const estadoConfig = {
                      pendiente: { color: '#f59e0b', label: 'Pendiente' },
                      pago_verificado: { color: '#3b82f6', label: 'Verificado' },
                      activo: { color: '#10b981', label: 'Activo' },
                      completado: { color: '#8b5cf6', label: 'Completado' },
                      retirado: { color: '#6b7280', label: 'Retirado' },
                      rechazado: { color: '#ef4444', label: 'Rechazado' },
                    }[inscripcion.estado] || { color: '#6b7280', label: inscripcion.estado };

                    return (
                      <ListItem
                        key={inscripcion.id}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                          },
                        }}
                        onClick={() => handleVerInscripcion(inscripcion.id)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(estadoConfig.color, 0.2),
                              color: estadoConfig.color,
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(inscripcion.nombres, inscripcion.apellido_paterno)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {index + 1}. {inscripcion.nombres} {inscripcion.apellido_paterno}{' '}
                                {inscripcion.apellido_materno}
                              </Typography>
                              <Chip
                                label={estadoConfig.label}
                                size="small"
                                sx={{
                                  bgcolor: alpha(estadoConfig.color, 0.1),
                                  color: estadoConfig.color,
                                  fontWeight: 600,
                                  height: 20,
                                  fontSize: '0.7rem',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {inscripcion.codigo_inscripcion}
                              </Typography>
                              {inscripcion.ci && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  CI: {inscripcion.ci}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CursoDetalle;