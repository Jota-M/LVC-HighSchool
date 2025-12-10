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
  keyframes
} from '@mui/material';
import {
  PersonAdd as MatricularIcon,
  List as ListIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon,
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

export const Matriculacion: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
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
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                  fontSize: {xs: '1.5rem', sm: '2rem', md: '2.5rem'},
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
                <Typography variant="body1" color="text.secondary">
                  Gestiona las matrículas de estudiantes por periodo académico
                </Typography>
              </Box>

              {/* Selector de periodo */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl
                  sx={{
                    minWidth: 300,
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <InputLabel>Periodo Académico</InputLabel>
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
            </Box>

            {/* Alerta si no hay periodo seleccionado */}
            {!periodoSeleccionado && !isLoadingPeriodos && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
                Selecciona un periodo académico para comenzar
              </Alert>
            )}

            {/* Tabs */}
            {periodoSeleccionado && (
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
                  color: isDark ? '#000' : '#fff', // color de tabs no seleccionados
                },
                '& .Mui-selected': {
                  color: isDark ? '#fff' : '#fff', // color del tab seleccionado
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#fff' : '#fff', // indicador
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab icon={<MatricularIcon />} iconPosition="start" label="Estudiantes Elegibles" />
                <Tab icon={<ListIcon />} iconPosition="start" label="Matrículas Actuales" />
                <Tab icon={<StatsIcon />} iconPosition="start" label="Estadísticas" />
              </Tabs>
            )}
          </Box>
        </Fade>

        {/* Loading State */}
        {(isLoadingPeriodos || isLoadingPeriodoActivo) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
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