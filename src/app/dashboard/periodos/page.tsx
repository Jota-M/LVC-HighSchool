'use client'
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Fade,
  Snackbar,
  Alert,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  keyframes
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { usePeriodos } from '../../../hooks/usePeriodos';
import { PeriodoStats } from '../../../components/periodos/PeriodoStats';
import { PeriodoTable } from '../../../components/periodos/PeriodoTable';
import { PeriodoFormDialog } from '../../../components/periodos/PeriodoFormDialog';
import { PeriodoPagination } from '../../../components/periodos/PeriodoPagination';
import { PeriodoAcademico, PeriodoFormData } from '../../../services/periodos';
import { useDashboard } from '../../../hooks/useDashboard';

// ─── Paleta dinámica (dorado dark / celeste light) ────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary      = isDark ? '#facc15' : '#0288d1';
  const secondary    = isDark ? '#f59e0b' : '#01579b';
  const gradient     = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary };
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const Periodos: React.FC = () => {
  const { isDark, primary, secondary, gradient, textOnPrimary } = usePalette();

  // Estados locales
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined);
  const [filtroCerrado, setFiltroCerrado] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAcademico | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const {
    periodos,
    periodoActivo,
    loading,
    error,
    paginacion,
    refetch,
    crear,
    actualizar,
    eliminar,
    cerrar,
    activar
  } = usePeriodos({ page, limit, search, activo: filtroActivo, cerrado: filtroCerrado });

  const { stats } = useDashboard();

  // Handlers
  const handleOpenDialog = (periodo: PeriodoAcademico | null = null) => {
    setEditingPeriodo(periodo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriodo(null);
  };

  const handleSave = async (data: PeriodoFormData) => {
    try {
      if (editingPeriodo) {
        await actualizar(editingPeriodo.id, data);
        showSnackbar('✨ Periodo actualizado exitosamente', 'success');
      } else {
        await crear(data);
        showSnackbar('🎉 Periodo creado exitosamente', 'success');
      }
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || err.message || 'Error al guardar'}`, 'error');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    const periodo = periodos.find(p => p.id === id);
    if (!window.confirm(`¿Estás seguro de eliminar el periodo "${periodo?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`)) return;
    try {
      await eliminar(id);
      showSnackbar('🗑️ Periodo eliminado exitosamente', 'info');
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error al eliminar periodo'}`, 'error');
    }
  };

  const handleActivar = async (id: number) => {
    try {
      await activar(id);
      showSnackbar('✅ Periodo activado exitosamente', 'success');
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error al cambiar estado'}`, 'error');
    }
  };

  const handleCerrar = async (id: number) => {
    const periodo = periodos.find(p => p.id === id);
    if (!window.confirm(`¿Estás seguro de cerrar el periodo "${periodo?.nombre}"?\n\n🔒 Un periodo cerrado no puede ser modificado ni reactivado.`)) return;
    try {
      await cerrar(id);
      showSnackbar('🔒 Periodo cerrado exitosamente', 'warning');
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error al cerrar periodo'}`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') =>
    setSnackbar({ open: true, message, severity });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); };
  const handleLimitChange  = (newLimit: number) => { setLimit(newLimit); setPage(1); };
  const clearFilters = () => { setSearch(''); setFiltroActivo(undefined); setFiltroCerrado(undefined); setPage(1); };
  const hasActiveFilters = search || filtroActivo !== undefined || filtroCerrado !== undefined;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ px: 3, maxWidth: 'xl', mx: 'auto' }}>

        {/* ── Header ── */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 }, mb: 3
            }}>
              {/* Título */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarMonthIcon sx={{
                    color: primary, fontSize: { xs: 20, md: 36 },
                    animation: `${bounce} 1.5s infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    background: gradient,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: 'fadeIn 1s ease-out',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(-10px)' },
                      to:   { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}>
                    Periodos Académicos
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{
                  fontSize: { xs: '0.7rem', md: '1em' }, fontWeight: 500, letterSpacing: 0.3,
                  animation: 'fadeInText 1.2s ease-out',
                  '@keyframes fadeInText': {
                    from: { opacity: 0, transform: 'translateY(5px)' },
                    to:   { opacity: 1, transform: 'translateY(0)' },
                  },
                }}>
                  Gestiona y supervisa los ciclos educativos de tu institución.
                </Typography>
              </Box>

              {/* Toggle + Botón */}
              <Box sx={{
                display: 'flex', gap: 2, alignItems: 'center',
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
              }}>
                <ToggleButtonGroup
                  value={viewMode} exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  sx={{
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    borderRadius: '12px',
                    '& .MuiToggleButton-root': {
                      border: 'none', borderRadius: '10px',
                      px: 2, py: 1, fontWeight: 600, textTransform: 'none',
                      fontSize: { xs: '0.5rem', md: '1rem' },
                      '&.Mui-selected': {
                        bgcolor: primary, color: textOnPrimary,
                        '&:hover': { bgcolor: secondary },
                      },
                    },
                  }}
                >
                  <ToggleButton value="cards" sx={{ fontSize: { xs: '0.5rem', md: '1rem' } }}>
                    <ViewModuleIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 20 } }} /> Cards
                  </ToggleButton>
                  <ToggleButton value="table" sx={{ fontSize: { xs: '0.5rem', md: '1rem' } }}>
                    <TableRowsIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 20 } }} /> Tabla
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="contained" size="large" startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    fontSize: { xs: '0.6rem', md: '1rem' },
                    borderRadius: { xs: '8px', md: '12px' },
                    textTransform: 'none', fontWeight: 600,
                    px: { xs: 2, md: 4 }, py: { xs: 0.5, md: 1.5 },
                    background: gradient, color: textOnPrimary,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(primary, 0.4)}`,
                      filter: 'brightness(1.08)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Crear Periodo
                </Button>
              </Box>
            </Box>

            {/* Stats */}
            <PeriodoStats
              periodoActivo={periodoActivo}
              totalEstudiantes={stats.totalEstudiantes}
              totalDocentes={stats.totalDocentes}
              totalMaterias={0}
            />
          </Box>
        </Fade>

        {/* ── Filtros ── */}
        <Fade in timeout={700}>
          <Box sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Buscar por nombre o código..."
                value={search} onChange={handleSearchChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary }
                  }
                }}
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ '&.Mui-focused': { color: primary } }}>Estado</InputLabel>
                <Select
                  value={filtroActivo === undefined ? 'all' : filtroActivo ? 'active' : 'inactive'}
                  label="Estado"
                  onChange={(e) => { const v = e.target.value; setFiltroActivo(v === 'all' ? undefined : v === 'active'); setPage(1); }}
                  sx={{ borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary } }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="active">Activos</MenuItem>
                  <MenuItem value="inactive">Inactivos</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ '&.Mui-focused': { color: primary } }}>Cerrado</InputLabel>
                <Select
                  value={filtroCerrado === undefined ? 'all' : filtroCerrado ? 'closed' : 'open'}
                  label="Cerrado"
                  onChange={(e) => { const v = e.target.value; setFiltroCerrado(v === 'all' ? undefined : v === 'closed'); setPage(1); }}
                  sx={{ borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary } }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="open">Abiertos</MenuItem>
                  <MenuItem value="closed">Cerrados</MenuItem>
                </Select>
              </FormControl>

              {hasActiveFilters && (
                <Button variant="outlined" onClick={clearFilters} sx={{
                  minWidth: 120, borderRadius: 2,
                  borderColor: alpha(primary, 0.5), color: primary,
                  '&:hover': { borderColor: primary, bgcolor: alpha(primary, 0.08) }
                }}>
                  Limpiar filtros
                </Button>
              )}
            </Stack>

            {hasActiveFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {search && (
                  <Chip
                    label={`Búsqueda: "${search}"`}
                    onDelete={() => { setSearch(''); setPage(1); }}
                    size="small" icon={<SearchIcon />}
                    sx={{
                      bgcolor: alpha(primary, 0.1), color: primary,
                      '& .MuiChip-deleteIcon': { color: primary }
                    }}
                  />
                )}
                {filtroActivo !== undefined && (
                  <Chip
                    label={filtroActivo ? 'Solo activos' : 'Solo inactivos'}
                    onDelete={() => { setFiltroActivo(undefined); setPage(1); }}
                    size="small"
                    icon={filtroActivo ? <CheckCircleIcon /> : <CancelIcon />}
                    color={filtroActivo ? 'success' : 'default'}
                  />
                )}
                {filtroCerrado !== undefined && (
                  <Chip
                    label={filtroCerrado ? 'Solo cerrados' : 'Solo abiertos'}
                    onDelete={() => { setFiltroCerrado(undefined); setPage(1); }}
                    size="small" icon={<FilterListIcon />}
                    color={filtroCerrado ? 'error' : 'primary'}
                  />
                )}
              </Box>
            )}
          </Box>
        </Fade>

        {/* ── Tabla / Cards ── */}
        <Fade in timeout={800}>
          <Box>
            <PeriodoTable
              periodos={periodos} loading={loading}
              onEdit={handleOpenDialog} onDelete={handleDelete}
              onToggleActivo={handleActivar} onCerrar={handleCerrar}
              viewMode={viewMode}
            />
            {periodos.length > 0 && (
              <PeriodoPagination
                page={paginacion.page} totalPages={paginacion.totalPages}
                limit={paginacion.limit} total={paginacion.total}
                onPageChange={setPage} onLimitChange={handleLimitChange}
              />
            )}
          </Box>
        </Fade>

        {/* Dialog */}
        <PeriodoFormDialog
          open={openDialog} onClose={handleCloseDialog}
          onSave={handleSave} editingPeriodo={editingPeriodo} loading={loading}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open} autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            severity={snackbar.severity} variant="filled"
            sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity="error" variant="filled">{error}</Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default Periodos;