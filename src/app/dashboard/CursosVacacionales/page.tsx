// pages/CursosVacacionales/Dashboard.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  useTheme,
  Fade,
  keyframes,
  alpha,
  Grid,
} from '@mui/material';
import {
  BeachAccess as BeachIcon,
  Assessment as StatsIcon,
  Add as AddIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { usePeriodoActivo, useEstadisticasPeriodo } from '@/hooks/useCursosVacacionales';
import { DashboardStats } from '@/components/cursosVacacionales/DashboardStats';
import { CursosPopulares } from '@/components/cursosVacacionales/CursosPopulares';
import { InscripcionesRecientes } from '@/components/cursosVacacionales/InscripcionesRecientes';
import { PeriodoInfo } from '@/components/cursosVacacionales/PeriodoInfo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const CursosVacacionales: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  // Obtener periodo activo
  const { periodo, isLoading: loadingPeriodo, hayPeriodoActivo } = usePeriodoActivo();

  // Obtener estadísticas del periodo
  const { estadisticas, isLoading: loadingEstadisticas } = useEstadisticasPeriodo(periodo?.id || null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGestionarPeriodos = () => {
    router.push('/dashboard/CursosVacacionales/periodos');
  };

  const handleGestionarCursos = () => {
    router.push('/dashboard/CursosVacacionales/cursos');
  };

  const handleGestionarInscripciones = () => {
    router.push('/dashboard/CursosVacacionales/inscripciones');
  };
  const handleCertificados = () => {
    router.push('/dashboard/CursosVacacionales/certificados');
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BeachIcon
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
                      animation: 'fadeIn 1s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Cursos Vacacionales
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  Gestiona periodos, cursos e inscripciones para programas vacacionales.
                </Typography>
              </Box>

              {/* DERECHA: BOTONES DE ACCIÓN */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleGestionarPeriodos}
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#facc15' : '#0288d1',
                    '&:hover': {
                      borderColor: isDark ? '#f59e0b' : '#01579b',
                      bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                    },
                  }}
                >
                  Periodos
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleGestionarCursos}
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#facc15' : '#0288d1',
                    '&:hover': {
                      borderColor: isDark ? '#f59e0b' : '#01579b',
                      bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                    },
                  }}
                >
                  Cursos
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleCertificados}
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#facc15' : '#0288d1',
                    '&:hover': {
                      borderColor: isDark ? '#f59e0b' : '#01579b',
                      bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                    },
                  }}
                >
                  Certificados
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<ListIcon />}
                  onClick={handleGestionarInscripciones}
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                        : '0 8px 24px rgba(2, 136, 209, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Inscripciones
                </Button>
              </Box>
            </Box>

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
              <Tab icon={<StatsIcon />} iconPosition="start" label="Dashboard" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panel */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              {/* Info del Periodo Activo */}
              {hayPeriodoActivo && periodo && (
                <Box sx={{ mb: 4 }}>
                  <PeriodoInfo periodo={periodo} />
                </Box>
              )}

              {!hayPeriodoActivo && !loadingPeriodo && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: isDark ? alpha('#facc15', 0.05) : alpha('#0288d1', 0.05),
                    borderRadius: '20px',
                    mb: 4,
                  }}
                >
                  <BeachIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    No hay periodo vacacional activo
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Crea un nuevo periodo para comenzar a gestionar cursos e inscripciones.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleGestionarPeriodos}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    Crear Periodo
                  </Button>
                </Box>
              )}

              {/* Estadísticas Generales */}
              {hayPeriodoActivo && estadisticas && (
                <>
                  <DashboardStats estadisticas={estadisticas} isLoading={loadingEstadisticas} />

                  {/* Grid de Cursos Populares e Inscripciones Recientes */}
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid size={{xs:12, lg:6}} >
                      <CursosPopulares periodoId={periodo?.id || 0} />
                    </Grid>
                    <Grid size={{xs:12, lg:6}}>
                      <InscripcionesRecientes periodoId={periodo?.id || 0} />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </Fade>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CursosVacacionales;