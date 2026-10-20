// src/app/dashboard/preinscripciones/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Container,
  useTheme,
  Tabs,
  Tab,
  Fade,
  Button,
  IconButton,
  Tooltip,
  Stack,
  keyframes,
  alpha,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';

// Icons
import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Hooks
import { usePreinscripciones } from '../../../hooks/usePreinscripciones';
import api from '@/lib/api';
import { gestionAcademicaService } from '@/services/estudiantesService';

// Preinscripciones components
import { StatCard } from '@/components/preinscripciones/StatCard';
import { FilterSection } from '@/components/preinscripciones/FilterSection';
import { PreinscripcionCard } from '@/components/preinscripciones/PreinscripcionCard';
import { TablaPreinscripciones } from '@/components/preinscripciones/TablaPreinscripciones';
import { ListaEsperaTab } from '@/components/preinscripciones/ListaEsperaTab';
import { CuposTab } from '@/components/preinscripciones/CuposTab';
import { CentroReportesPreinscripcionTab } from '@/components/preinscripciones/CentroReportesPreinscripcionTab';

// ─── helpers ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3.5 }}>{children}</Box>}
  </div>
);

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// ─── page ────────────────────────────────────────────────────────────────────

export default function PreinscripcionesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const gradBg = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  // 0: Lista Preinscripciones, 1: Lista de Espera, 2: Gestión de Cupos y Aforos, 3: Centro de Reportes
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Paramétricas
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);

  // Paginación Tab 0
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    preinscripciones,
    filteredPreinscripciones,
    stats,
    loading,
    error,
    filters,
    setSearchTerm,
    setEstadoFilter,
    setGradoFilter,
    setTurnoFilter,
    setPeriodoFilter,
    setConCupoFilter,
    fetchPreinscripciones,
    deletePreinscripcion,
    changeEstado,
    promoverEspera,
    exportToExcel,
    exportToPDF,
  } = usePreinscripciones();

  // Reset a página 1 cuando los filtros cambian
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Cargar paramétricas (grados y turnos)
  useEffect(() => {
    const cargarParametricas = async () => {
      try {
        const [dataGrados, resTurnos] = await Promise.all([
          gestionAcademicaService.obtenerGrados(),
          api.get('/turno'),
        ]);
        setGrados(dataGrados || []);
        const listaTurnos = Array.isArray(resTurnos.data)
          ? resTurnos.data
          : (resTurnos.data?.data?.turnos || resTurnos.data?.turnos || []);
        setTurnos(listaTurnos || []);
      } catch (err) {
        console.error('Error al cargar grados o turnos:', err);
      }
    };
    cargarParametricas();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta preinscripción? Esto liberará el cupo asignado.')) return;
    try {
      await deletePreinscripcion(id);
      showSnackbar('Preinscripción eliminada correctamente');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al eliminar', 'error');
    }
  };

  const handlePromover = async (id: number, motivo?: string) => {
    try {
      await promoverEspera(id, motivo);
      await fetchPreinscripciones();
      showSnackbar('Postulante promovido exitosamente con vacante asignada');
    } catch (err: any) {
      showSnackbar(err.message || 'Error al promover de lista de espera', 'error');
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      await exportToExcel();
      showSnackbar('Exportación a Excel completada exitosamente');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al exportar', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF();
      showSnackbar('PDF generado exitosamente');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al generar PDF', 'error');
    }
  };

  const paginatedPreinscripciones = pageSize === 0
    ? filteredPreinscripciones
    : filteredPreinscripciones.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredPreinscripciones.length / pageSize) || 1;

  const handlePageChange = (_: React.ChangeEvent<unknown>, val: number) => {
    setPage(val);
    const elem = document.getElementById('preinscripciones-grid-anchor');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const statCards = [
    {
      title: 'Total Solicitudes',
      value: stats.total,
      subtitle: `${stats.total} registros`,
      color: accent,
      icon: <GroupIcon />,
      trend: '+23%',
    },
    {
      title: 'Pendientes',
      value: stats.pendientes,
      subtitle: 'Requieren revisión',
      color: '#9c27b0',
      icon: <HourglassEmptyIcon />,
      trend: '-8%',
    },
    {
      title: 'En Lista de Espera',
      value: stats.en_espera || 0,
      subtitle: `${stats.en_espera || 0} postulantes en cola`,
      color: '#f59e0b',
      icon: <HourglassEmptyIcon />,
      trend: 'Cola de espera',
    },
    {
      title: 'Aprobadas',
      value: stats.aprobadas,
      subtitle: `${stats.total > 0 ? ((stats.aprobadas / stats.total) * 100).toFixed(1) : 0}% tasa`,
      color: '#10b981',
      icon: <CheckCircleIcon />,
      trend: '+15%',
    },
    {
      title: 'Rechazadas',
      value: stats.rechazadas,
      subtitle: `${stats.total > 0 ? ((stats.rechazadas / stats.total) * 100).toFixed(1) : 0}% tasa`,
      color: '#ef4444',
      icon: <CancelIcon />,
      trend: '-12%',
    },
  ];

  const iconBtnSx = {
    borderRadius: '12px',
    border: `1px solid ${alpha(accent, 0.3)}`,
    color: alpha(accent, 0.8),
    backgroundColor: alpha(accent, 0.07),
    '&:hover': { backgroundColor: alpha(accent, 0.15), borderColor: accent, color: accent },
    transition: 'all 0.2s ease',
  };

  if (loading && preinscripciones.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={3}>
        <CircularProgress size={64} thickness={4} sx={{ color: accent }} />
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          Cargando preinscripciones...
        </Typography>
      </Box>
    );
  }

  if (error && preinscripciones.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" mb={2}>Error al cargar las preinscripciones</Typography>
        <Typography variant="body2" color="text.secondary">{error}</Typography>
        <Button variant="outlined" onClick={fetchPreinscripciones} sx={{ mt: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── HEADER PRINCIPAL ── */}
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
              {/* Título & Subtítulo */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentIcon
                    sx={{ color: accent, fontSize: 36, animation: `${bounce} 1.5s infinite` }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Preinscripciones y Admisiones
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                  Gestión integral de solicitudes, lista de espera, cupos escolares, continuidad y centro de reportes
                </Typography>
              </Box>

              {/* Acciones principales de la cabecera */}
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
                {activeTab === 0 && (
                  <ToggleButtonGroup
                    size="small"
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      borderRadius: '12px',
                      '& .MuiToggleButton-root': {
                        borderRadius: '10px',
                        border: 'none',
                        px: 1.5,
                        '&.Mui-selected': {
                          bgcolor: accent,
                          color: isDark ? '#000' : '#fff',
                          '&:hover': { bgcolor: accent },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards">
                      <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableRowsIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={async () => {
                      await fetchPreinscripciones();
                      showSnackbar('Datos actualizados exitosamente');
                    }}
                    disabled={loading}
                    sx={iconBtnSx}
                  >
                    <RefreshIcon sx={{ animation: loading ? `${spin} 1s linear infinite` : 'none' }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Exportar Excel">
                  <IconButton onClick={handleExport} sx={iconBtnSx}>
                    <TableChartIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Exportar PDF">
                  <IconButton onClick={handleExportPDF} sx={iconBtnSx}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/dashboard/preinscripciones/nueva')}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    background: gradBg,
                    color: isDark ? '#000' : '#fff',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(accent, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Nueva Solicitud
                </Button>
              </Stack>
            </Box>

            {/* ══ TABS DE NAVEGACIÓN MODULAR ══ */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                background: gradBg,
                borderRadius: '16px',
                p: 1,
                boxShadow: `0 8px 24px ${alpha(accent, 0.2)}`,
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: '0.92rem',
                  color: isDark ? '#000000a6' : '#ffffffb3',
                  transition: 'all 0.2s',
                  mx: 0.5,
                },
                '& .Mui-selected': {
                  color: `${isDark ? '#000' : '#fff'} !important`,
                  fontWeight: 800,
                  bgcolor: isDark ? alpha('#000', 0.12) : alpha('#fff', 0.15),
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Preinscripciones" />

              <Tab
                icon={
                  <Badge
                    badgeContent={stats.en_espera || 0}
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}
                  >
                    <HourglassEmptyIcon />
                  </Badge>
                }
                iconPosition="start"
                label="Lista de Espera"
              />

              <Tab icon={<EventSeatIcon />} iconPosition="start" label="Gestión de Cupos y Aforo" />

              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Centro de Reportes" />
            </Tabs>
          </Box>
        </Fade>

        {/* ── TAB 0: LISTA DE PREINSCRIPCIONES ── */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={600}>
            <Box>
              <Grid container spacing={3} mb={4}>
                {statCards.map((stat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={stat.title}>
                    <StatCard {...stat} />
                  </Grid>
                ))}
              </Grid>

              <Box mb={4}>
                <FilterSection
                  filters={filters}
                  resultCount={filteredPreinscripciones.length}
                  onSearchChange={setSearchTerm}
                  onEstadoChange={setEstadoFilter}
                  onGradoChange={setGradoFilter}
                  onTurnoChange={setTurnoFilter}
                  onPeriodoChange={setPeriodoFilter}
                  onConCupoChange={setConCupoFilter}
                />
              </Box>

              <Box id="preinscripciones-grid-anchor" sx={{ scrollMarginTop: '100px' }} />

              {viewMode === 'cards' ? (
                <Grid container spacing={3}>
                  {paginatedPreinscripciones.map((p) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                      <PreinscripcionCard
                        preinscripcion={p}
                        onRevisar={(id) => router.push(`/dashboard/preinscripciones/detalle/${id}`)}
                        onEliminar={handleDelete}
                        onPromover={handlePromover}
                        onCambiarEstado={changeEstado}
                        onSnackbar={showSnackbar}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TablaPreinscripciones
                  preinscripciones={paginatedPreinscripciones}
                  onRevisar={(id) => router.push(`/dashboard/preinscripciones/detalle/${id}`)}
                  onEliminar={handleDelete}
                  onPromover={handlePromover}
                />
              )}

              {/* ── BARRA DE PAGINACIÓN Y SELECTOR DE TAMAÑO ── */}
              {filteredPreinscripciones.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 4,
                    p: 2,
                    borderRadius: '16px',
                    border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Mostrando{' '}
                      <strong>
                        {pageSize === 0 ? 1 : (page - 1) * pageSize + 1}
                      </strong>{' '}
                      -{' '}
                      <strong>
                        {pageSize === 0
                          ? filteredPreinscripciones.length
                          : Math.min(page * pageSize, filteredPreinscripciones.length)}
                      </strong>{' '}
                      de <strong>{filteredPreinscripciones.length}</strong> solicitudes
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 2 } }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Por página:
                      </Typography>
                      <Select
                        size="small"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        sx={{
                          height: 32,
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                        }}
                      >
                        <MenuItem value={8}>8</MenuItem>
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={24}>24</MenuItem>
                        <MenuItem value={48}>48</MenuItem>
                        <MenuItem value={0}>Todos</MenuItem>
                      </Select>
                    </Box>
                  </Box>

                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      size="medium"
                      showFirstButton
                      showLastButton
                    />
                  )}
                </Paper>
              )}

              {filteredPreinscripciones.length === 0 && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400} flexDirection="column" gap={2}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.secondary">No se encontraron preinscripciones</Typography>
                  <Typography variant="body2" color="text.secondary">Intenta ajustar los filtros de búsqueda</Typography>
                </Box>
              )}
            </Box>
          </Fade>
        </TabPanel>

        {/* ── TAB 1: LISTA DE ESPERA ── */}
        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={600}>
            <Box>
              <ListaEsperaTab
                preinscripciones={preinscripciones}
                loading={loading}
                onRevisar={(id) => router.push(`/dashboard/preinscripciones/detalle/${id}`)}
                onPromover={handlePromover}
                onEliminar={handleDelete}
                onSnackbar={showSnackbar}
              />
            </Box>
          </Fade>
        </TabPanel>

        {/* ── TAB 2: GESTIÓN DE CUPOS Y AFORO ── */}
        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={600}>
            <Box>
              <CuposTab
                onSnackbar={showSnackbar}
                preinscripciones={preinscripciones}
                onRevisar={(id) => router.push(`/dashboard/preinscripciones/detalle/${id}`)}
              />
            </Box>
          </Fade>
        </TabPanel>

        {/* ── TAB 3: CENTRO DE REPORTES ── */}
        <TabPanel value={activeTab} index={3}>
          <Fade in timeout={600}>
            <Box>
              <CentroReportesPreinscripcionTab
                grados={grados}
                turnos={turnos}
                onSnackbar={showSnackbar}
              />
            </Box>
          </Fade>
        </TabPanel>

      </Container>

      {/* ══ SNACKBAR DE NOTIFICACIONES ══ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}