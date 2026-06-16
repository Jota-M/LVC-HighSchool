// src/app/dashboard/preinscripciones/page.tsx

'use client';

import React, { useState } from 'react';
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

// Hooks
import { usePreinscripciones } from '../../../hooks/usePreinscripciones';

// Preinscripciones components
import { StatCard } from '@/components/preinscripciones/StatCard';
import { FilterSection } from '@/components/preinscripciones/FilterSection';
import { PreinscripcionCard } from '@/components/preinscripciones/PreinscripcionCard';
import { CuposTab } from '@/components/preinscripciones/CuposTab';

// ─── helpers ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
  </div>
);

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;

// ─── page ────────────────────────────────────────────────────────────────────

export default function PreinscripcionesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
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
    exportToExcel,
    exportToPDF,
  } = usePreinscripciones();

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta preinscripción? Esto liberará el cupo asignado.')) return;
    try {
      await deletePreinscripcion(id);
      showSnackbar('Preinscripción eliminada correctamente');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Error al eliminar', 'error');
    }
  };

  const handleExport = async () => {
    try {
      await exportToExcel();
      showSnackbar('Exportación exitosa');
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

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={3}>
        <CircularProgress size={64} thickness={4} sx={{ color: accent }} />
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          Cargando preinscripciones...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" mb={2}>Error al cargar las preinscripciones</Typography>
        <Typography variant="body2" color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── HEADER ── */}
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
              {/* Título */}
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
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Preinscripciones
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                  Gestiona solicitudes de inscripción y cupos disponibles
                </Typography>
              </Box>

              {/* Acciones — solo en tab 0 */}
              {activeTab === 0 && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Tooltip title="Actualizar">
                    <IconButton onClick={fetchPreinscripciones} sx={iconBtnSx}>
                      <RefreshIcon />
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
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 8px 24px rgba(250,204,21,0.3)'
                          : '0 8px 24px rgba(2,136,209,0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nueva
                  </Button>
                </Stack>
              )}
            </Box>

            {/* TABS */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                borderRadius: '16px',
                p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#00000099' : '#ffffff99',
                },
                '& .Mui-selected': {
                  color: `${isDark ? '#000' : '#fff'} !important`,
                  fontWeight: 700,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Preinscripciones" />
              <Tab icon={<EventSeatIcon />} iconPosition="start" label="Gestión de Cupos" />
            </Tabs>
          </Box>
        </Fade>

        {/* ── TAB 0: PREINSCRIPCIONES ── */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <Grid container spacing={3} mb={4}>
                {statCards.map((stat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
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

              <Grid container spacing={3}>
                {filteredPreinscripciones.map((p) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                    <PreinscripcionCard
                      preinscripcion={p}
                      onRevisar={(id) => router.push(`/dashboard/preinscripciones/detalle/${id}`)}
                      onEliminar={handleDelete}
                    />
                  </Grid>
                ))}
              </Grid>

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

        {/* ── TAB 1: CUPOS ── */}
        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box>
              <CuposTab onSnackbar={showSnackbar} />
            </Box>
          </Fade>
        </TabPanel>

      </Container>

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