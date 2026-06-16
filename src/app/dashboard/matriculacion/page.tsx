// pages/Matriculacion.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  useTheme,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  keyframes,
  ToggleButtonGroup,
  ToggleButton,
  alpha
} from '@mui/material';
import {
  PersonAdd as MatricularIcon,
  List as ListIcon,
  Assessment as StatsIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGestionAcademica } from '@/hooks/useRegistroCompleto';
import { EstudiantesElegiblesTable } from '@/components/matriculacion/EstudiantesElegiblesTable';
import { MatriculasTable } from '@/components/matriculacion/MatriculasTable';
import { EstadisticasMatricula } from '@/components/matriculacion/EstadisticasMatricula';
import { useEstudiantesElegibles, useMatriculasPorPeriodo, useEstadisticasMatricula } from '@/hooks/useMatriculacion';

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

export const Matriculacion: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);

  // Hooks de gestión académica
  const {
    periodos,
    periodoActivo,
    isLoadingPeriodos,
    isLoadingPeriodoActivo,
  } = useGestionAcademica();

  // Hooks de matriculación
  const {
    estudiantes: estudiantesElegibles,
    paginacion: paginacionElegibles,
    isLoading: isLoadingElegibles,
    filters: filtersElegibles,
    actualizarFiltros: actualizarFiltrosElegibles,
  } = useEstudiantesElegibles(periodoSeleccionado);

  const {
    matriculas,
    paginacion: paginacionMatriculas,
    isLoading: isLoadingMatriculas,
    filters: filtersMatriculas,
    actualizarFiltros: actualizarFiltrosMatriculas,
  } = useMatriculasPorPeriodo(periodoSeleccionado);

  const {
    estadisticas,
    isLoading: isLoadingEstadisticas,
  } = useEstadisticasMatricula(periodoSeleccionado);

  // Establecer periodo activo por defecto
  useEffect(() => {
    if (periodoActivo && !periodoSeleccionado) {
      setPeriodoSeleccionado(periodoActivo.id);
    }
  }, [periodoActivo, periodoSeleccionado]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMatricular = (estudianteId: number) => {
    router.push(`/dashboard/matriculacion/matricular/${estudianteId}`);
  };

  const handleVerMatricula = (matriculaId: number) => {
    router.push(`/dashboard/matriculacion/${matriculaId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 3
            }}>
              {/* IZQUIERDA: TÍTULO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolIcon
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
                    Matriculación de Estudiantes
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
                  Gestiona las matrículas de estudiantes por periodo académico.
                </Typography>
              </Box>

              {/* DERECHA: SELECTOR DE PERIODO */}
              <FormControl
                sx={{
                  minWidth: { xs: '100%', md: 300 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? '#facc15' : '#0288d1',
                    }
                  }
                }}
              >
                <InputLabel sx={{
                  '&.Mui-focused': {
                    color: isDark ? '#facc15' : '#0288d1',
                  }
                }}>Periodo Académico</InputLabel>
                <Select
                  value={periodoSeleccionado || ''}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value as number)}
                  label="Periodo Académico"
                  disabled={isLoadingPeriodos}
                >
                  {periodos.map((periodo) => (
                    <MenuItem key={periodo.id} value={periodo.id}>
                      {periodo.nombre}
                      {periodo.activo && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: isDark ? '#facc15' : '#0288d1',
                            color: isDark ? '#000' : '#fff',
                          }}
                        >
                          ACTIVO
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Alerta si no hay periodo seleccionado */}
            {!periodoSeleccionado && !isLoadingPeriodos && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                  color: isDark ? '#facc15' : '#0288d1',
                  '& .MuiAlert-icon': {
                    color: isDark ? '#facc15' : '#0288d1',
                  }
                }}
              >
                Selecciona un periodo académico para comenzar
              </Alert>
            )}

            {/* Tabs con Slider en Mobile y Toggle */}
            {periodoSeleccionado && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: { xs: 'wrap', md: 'nowrap' }
              }}>
                {/* Tabs con scroll horizontal en mobile */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    borderRadius: "16px",
                    background: isDark
                      ? "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)"
                      : "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
                    p: { xs: 0.5, md: 1 }, // 🔥 Menos padding en mobile
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      minHeight: { xs: 36, md: 48 }, // 🔥 Más pequeño en mobile

                      "& .MuiTabs-scrollButtons": {
                        color: isDark ? "#000" : "#fff",
                        "&.Mui-disabled": { opacity: 0.3 },
                      },

                      "& .MuiTab-root": {
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        minHeight: { xs: 36, md: 48 }, // 🔥 Tabs más compactos
                        fontSize: { xs: "0.7rem", md: "1rem" }, // 🔥 Texto más pequeño en mobile
                        px: { xs: 1.2, md: 3 }, // 🔥 Menos espacio horizontal
                        color: isDark ? "#000" : "#fff",
                        whiteSpace: "nowrap",
                      },

                      "& .Mui-selected": {
                        color: "#fff",
                      },

                      "& .MuiTabs-indicator": {
                        backgroundColor: "#fff",
                        height: { xs: 2, md: 3 }, // 🔥 Indicador más delgado en mobile
                        borderRadius: "3px 3px 0 0",
                      },
                    }}
                  >
                    <Tab
                      icon={<MatricularIcon sx={{ fontSize: { xs: 16, md: 24 } }} />} // 🔥 Ícono más chiquito
                      iconPosition="start"
                      label="Elegibles"
                    />

                    <Tab
                      icon={<ListIcon sx={{ fontSize: { xs: 16, md: 24 } }} />}
                      iconPosition="start"
                      label="Matrículas"
                    />

                    <Tab
                      icon={<StatsIcon sx={{ fontSize: { xs: 16, md: 24 } }} />}
                      iconPosition="start"
                      label="Estadísticas"
                    />
                  </Tabs>
                </Box>


                {/* Toggle View Mode - Solo en tabs 0 y 1 */}
                {(activeTab === 0 || activeTab === 1) && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      borderRadius: { xs: 8, md: 12 },
                      flexShrink: 0,
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: { xs: 8, md: 10 },
                        px: { xs: 1.5, md: 2.5 },
                        py: { xs: 0.8, md: 1.5 },
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: { xs: '0.7rem', md: '0.9rem' },
                        '&.Mui-selected': {
                          bgcolor: isDark ? '#facc15' : '#0288d1',
                          color: isDark ? '#000' : '#fff',
                          '&:hover': {
                            bgcolor: isDark ? '#f59e0b' : '#01579b',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards">
                      <ViewModuleIcon sx={{ mr: { xs: 0.5, md: 1 }, fontSize: { xs: 16, md: 20 } }} />
                      Cards
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableRowsIcon sx={{ mr: { xs: 0.5, md: 1 }, fontSize: { xs: 16, md: 20 } }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Box>
            )}
          </Box>
        </Fade>

        {/* Loading State */}
        {(isLoadingPeriodos || isLoadingPeriodoActivo) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
          </Box>
        )}

        {/* Tab Panels */}
        {periodoSeleccionado && (
          <>
            <TabPanel value={activeTab} index={0}>
              <Fade in timeout={700}>
                <Box>
                  <EstudiantesElegiblesTable
                    estudiantes={estudiantesElegibles}
                    isLoading={isLoadingElegibles}
                    page={filtersElegibles.page || 1}
                    rowsPerPage={filtersElegibles.limit || 20}
                    totalItems={paginacionElegibles?.total || 0}
                    onPageChange={(page) => actualizarFiltrosElegibles({ page })}
                    onRowsPerPageChange={(limit) => actualizarFiltrosElegibles({ limit, page: 1 })}
                    onSearch={(search) => actualizarFiltrosElegibles({ search, page: 1 })}
                    onMatricular={handleMatricular}
                    viewMode={viewMode}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Fade in timeout={700}>
                <Box>
                  <MatriculasTable
                    matriculas={matriculas}
                    isLoading={isLoadingMatriculas}
                    page={filtersMatriculas.page || 1}
                    rowsPerPage={filtersMatriculas.limit || 20}
                    totalItems={paginacionMatriculas?.total || 0}
                    onPageChange={(page) => actualizarFiltrosMatriculas({ page })}
                    onRowsPerPageChange={(limit) => actualizarFiltrosMatriculas({ limit, page: 1 })}
                    onSearch={(search) => actualizarFiltrosMatriculas({ search, page: 1 })}
                    onView={handleVerMatricula}
                    viewMode={viewMode}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Fade in timeout={700}>
                <Box>
                  <EstadisticasMatricula
                    estadisticas={estadisticas}
                    isLoading={isLoadingEstadisticas}
                  />
                </Box>
              </Fade>
            </TabPanel>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Matriculacion;
