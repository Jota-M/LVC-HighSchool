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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { usePeriodos } from '../../../hooks/usePeriodos';
import { PeriodoStats } from '../../../components/periodos/PeriodoStats';
import { PeriodoTable } from '../../../components/periodos/PeriodoTable';
import { PeriodoFormDialog } from '../../../components/periodos/PeriodoFormDialog';
import { PeriodoPagination } from '../../../components/periodos/PeriodoPagination';
import { PeriodoAcademico, PeriodoFormData } from '../../../services/periodos';

const Periodos: React.FC = () => {
  const theme = useTheme();
  
  // Estados locales
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined);
  const [filtroCerrado, setFiltroCerrado] = useState<boolean | undefined>(undefined);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAcademico | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Hook personalizado
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
} = usePeriodos({
  page,
  limit,
  search,
  activo: filtroActivo,
  cerrado: filtroCerrado
});


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
      const message = err.response?.data?.message || err.message || 'Error al guardar';
      showSnackbar(`❌ ${message}`, 'error');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    const periodo = periodos.find(p => p.id === id);
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el periodo "${periodo?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await eliminar(id);
      showSnackbar('🗑️ Periodo eliminado exitosamente', 'info');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar periodo';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  const handleActivar = async (id: number) => {
  try {
    await activar(id); // <-- nuevo método del hook
    showSnackbar('✅ Periodo activado exitosamente', 'success');
  } catch (err: any) {
    const message = err.response?.data?.message || 'Error al cambiar estado';
    showSnackbar(`❌ ${message}`, 'error');
  }
};


  const handleCerrar = async (id: number) => {
    const periodo = periodos.find(p => p.id === id);
    
    const confirmCerrar = window.confirm(
      `¿Estás seguro de cerrar el periodo "${periodo?.nombre}"?\n\n🔒 Un periodo cerrado no puede ser modificado ni reactivado.`
    );
    
    if (!confirmCerrar) return;

    try {
      await cerrar(id);
      showSnackbar('🔒 Periodo cerrado exitosamente', 'warning');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al cerrar periodo';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset a la primera página
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset a la primera página
  };

  const clearFilters = () => {
    setSearch('');
    setFiltroActivo(undefined);
    setFiltroCerrado(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || filtroActivo !== undefined || filtroCerrado !== undefined;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                  }
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Periodos Académicos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Gestiona los ciclos educativos de tu institución
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                }
              }}
            >
              Crear Periodo
            </Button>
          </Box>

          {/* Estadísticas */}
          <PeriodoStats 
            periodoActivo={periodoActivo}
            totalEstudiantes={0} // TODO: Conectar con datos reales
            totalDocentes={0}    // TODO: Conectar con datos reales
            totalMaterias={0}    // TODO: Conectar con datos reales
          />
        </Box>
      </Fade>

      {/* Filtros y Búsqueda */}
      <Fade in timeout={700}>
        <Box sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroActivo === undefined ? 'all' : filtroActivo ? 'active' : 'inactive'}
                label="Estado"
                onChange={(e) => {
                  const value = e.target.value;
                  setFiltroActivo(value === 'all' ? undefined : value === 'active');
                  setPage(1);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Cerrado</InputLabel>
              <Select
                value={filtroCerrado === undefined ? 'all' : filtroCerrado ? 'closed' : 'open'}
                label="Cerrado"
                onChange={(e) => {
                  const value = e.target.value;
                  setFiltroCerrado(value === 'all' ? undefined : value === 'closed');
                  setPage(1);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="open">Abiertos</MenuItem>
                <MenuItem value="closed">Cerrados</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ minWidth: 120 }}
              >
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
                  size="small"
                  icon={<SearchIcon />}
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
                  size="small"
                  icon={<FilterListIcon />}
                  color={filtroCerrado ? 'error' : 'primary'}
                />
              )}
            </Box>
          )}
        </Box>
      </Fade>

      {/* Tabla */}
      <Fade in timeout={800}>
        <Box>
          <PeriodoTable
            periodos={periodos}
            loading={loading}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
            onToggleActivo={handleActivar}
            onCerrar={handleCerrar}
          />

          {/* Paginación */}
          {periodos.length > 0 && (
            <PeriodoPagination
              page={paginacion.page}
              totalPages={paginacion.totalPages}
              limit={paginacion.limit}
              total={paginacion.total}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
            />
          )}
        </Box>
      </Fade>

      {/* Dialog de Formulario */}
      <PeriodoFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        editingPeriodo={editingPeriodo}
        loading={loading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.2)}`
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Global */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default Periodos;