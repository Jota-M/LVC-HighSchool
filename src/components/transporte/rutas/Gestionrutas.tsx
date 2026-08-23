// components/transporte/GestionRutas.tsx
'use client';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogContent,
  MenuItem,
  useTheme,
  alpha,
  Fade,
  useMediaQuery,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  FormControl,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsBus as BusIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  SaveRounded as SaveRoundedIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import type { RutaTransporte, CrearRutaRequest } from '@/types/transporte';
import { RutaCard } from './RutaCard';
import { RutasTable } from './Rutastable';
import { RutaForm } from './Rutaform';
import { RutaDetallesDialog } from './Rutadetallesdialog';
import { EmptyState } from './EmptyState';
import { RutasStats } from './Rutasstats';

export const GestionRutas: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // ── tokens (mismos que ProductoFormDialog / RutaDetallesDialog) ───────────
  const brand = isDark ? '#facc15' : '#f59e0b';
  const brandSoft = isDark ? '#eab308' : '#d97706';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(245,158,11,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(245,158,11,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  const {
    rutas,
    loadingRutas,
    cargarRutas,
    crearRuta,
    actualizarRuta,
    eliminarRuta,
  } = useTransporte({
    autoLoad: true,
    loadRutas: true,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaTransporte | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [vistaActual, setVistaActual] = useState<'grid' | 'table'>(isMobile ? 'grid' : 'table');
  const [searchTerm, setSearchTerm] = useState('');

  const [filtros, setFiltros] = useState({
    search: '',
    activo: 'true',
  });

  const [formData, setFormData] = useState<CrearRutaRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    zona_cobertura: '',
    punto_inicio: '',
    punto_fin: '',
    horario_ida: '',
    horario_retorno: '',
    capacidad_maxima: 40,
    costo_mensual: 0,
    conductor_responsable: '',
    telefono_conductor: '',
    placa_vehiculo: '',
    modelo_vehiculo: '',
    anio_vehiculo: undefined,
    color: '',
    activo: true,
    observaciones: '',
  });

  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      zona_cobertura: '',
      punto_inicio: '',
      punto_fin: '',
      horario_ida: '',
      horario_retorno: '',
      capacidad_maxima: 40,
      costo_mensual: 0,
      conductor_responsable: '',
      telefono_conductor: '',
      placa_vehiculo: '',
      modelo_vehiculo: '',
      anio_vehiculo: undefined,
      color: '',
      activo: true,
      observaciones: '',
    });
    setModoEdicion(false);
    setRutaSeleccionada(null);
  };

  const handleNuevaRuta = () => {
    limpiarFormulario();
    setOpenDialog(true);
  };

  const handleEditarRuta = (ruta: RutaTransporte) => {
    setRutaSeleccionada(ruta);
    setFormData({
      codigo: ruta.codigo,
      nombre: ruta.nombre,
      descripcion: ruta.descripcion || '',
      zona_cobertura: ruta.zona_cobertura || '',
      punto_inicio: ruta.punto_inicio || '',
      punto_fin: ruta.punto_fin || '',
      horario_ida: ruta.horario_ida || '',
      horario_retorno: ruta.horario_retorno || '',
      capacidad_maxima: ruta.capacidad_maxima,
      costo_mensual: ruta.costo_mensual,
      conductor_responsable: ruta.conductor_responsable || '',
      telefono_conductor: ruta.telefono_conductor || '',
      placa_vehiculo: ruta.placa_vehiculo || '',
      modelo_vehiculo: ruta.modelo_vehiculo || '',
      anio_vehiculo: ruta.anio_vehiculo,
      color: ruta.color || '',
      activo: ruta.activo ?? true,
      observaciones: ruta.observaciones || '',
    });
    setModoEdicion(true);
    setOpenDialog(true);
  };

  const handleVerDetalles = (ruta: RutaTransporte) => {
    setRutaSeleccionada(ruta);
    setOpenDetalles(true);
  };

  const handleEditarDesdeDetalles = () => {
    if (rutaSeleccionada) {
      setOpenDetalles(false);
      handleEditarRuta(rutaSeleccionada);
    }
  };

  const handleEliminarRuta = async (ruta: RutaTransporte) => {
    if (ruta.estudiantes_asignados && ruta.estudiantes_asignados > 0) {
      alert('No se puede eliminar la ruta porque tiene estudiantes asignados');
      return;
    }

    if (confirm(`¿Está seguro de eliminar la ruta "${ruta.nombre}"?`)) {
      try {
        await eliminarRuta(ruta.id);
        alert('Ruta eliminada exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al eliminar la ruta');
      }
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacidad_maxima' || name === 'costo_mensual' || name === 'anio_vehiculo'
        ? (value === '' ? undefined : parseFloat(value) || 0)
        : name === 'activo'
        ? Boolean(value)
        : value,
    }));
  }, []);

  const handleCerrarDialog = () => {
    if (guardando) return;
    setOpenDialog(false);
    limpiarFormulario();
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      if (modoEdicion && rutaSeleccionada) {
        await actualizarRuta(rutaSeleccionada.id, formData);
        alert('Ruta actualizada exitosamente');
      } else {
        await crearRuta(formData);
        alert('Ruta creada exitosamente');
      }
      setOpenDialog(false);
      limpiarFormulario();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la ruta');
    } finally {
      setGuardando(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    setTimeout(() => {
      setFiltros(prev => ({ ...prev, search: value }));
      cargarRutas({ search: value, activo: filtros.activo === 'true' ? true : filtros.activo === 'false' ? false : undefined });
    }, 500);
  };

  const handleFiltrar = () => {
    cargarRutas({
      search: filtros.search,
      activo: filtros.activo === 'true' ? true : filtros.activo === 'false' ? false : undefined,
    });
  };

  const rutasFiltradas = rutas;

  return (
    <Box>
      {/* Header principal */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                mb: 0.5,
                background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.6)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Gestión de Rutas
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              Sistema de administración de transporte escolar
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleNuevaRuta}
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.8)} 100%)`,
              color: isDark ? '#000' : '#fff',
              fontWeight: 900,
              px: 4,
              py: 1.5,
              borderRadius: '16px',
              fontSize: '0.95rem',
              boxShadow: `0 8px 24px ${alpha(yellowColor, 0.35)}`,
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(yellowColor, 0.9)} 0%, ${yellowColor} 100%)`,
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(yellowColor, 0.45)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Nueva Ruta
          </Button>
        </Box>
      </Box>

      {/* Estadísticas */}
      {/* <RutasStats rutas={rutasFiltradas} /> */}

      {/* Filtros y controles */}
      <Paper
        sx={{
          p: 3,
          borderRadius: '24px',
          mb: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.05)} 0%, ${alpha('#000', 0.2)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.03)} 0%, ${alpha('#fff', 0.8)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.15)}`,
          boxShadow: `0 4px 12px ${alpha(yellowColor, 0.1)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Buscar por código, nombre, zona..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: yellowColor, fontSize: 24 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '16px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  fontWeight: 600,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={filtros.activo}
                onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
                size="medium"
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon sx={{ color: 'text.secondary', fontSize: 20, ml: 1 }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: '16px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  fontWeight: 700,
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="true">Activas</MenuItem>
                <MenuItem value="false">Inactivas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFiltrar}
              sx={{
                background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.8)} 100%)`,
                color: isDark ? '#000' : '#fff',
                fontWeight: 800,
                borderRadius: '16px',
                height: 56,
                fontSize: '0.9rem',
                textTransform: 'none',
              }}
            >
              Filtrar
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <ToggleButtonGroup
              value={vistaActual}
              exclusive
              onChange={(e, newView) => newView && setVistaActual(newView)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '16px',
                  border: `2px solid ${alpha(yellowColor, 0.2)}`,
                  fontWeight: 800,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(yellowColor, 0.15),
                    color: yellowColor,
                    borderColor: yellowColor,
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon sx={{ mr: 0.5 }} />
                {!isMobile && 'Cards'}
              </ToggleButton>
              <ToggleButton value="table">
                <ListViewIcon sx={{ mr: 0.5 }} />
                {!isMobile && 'Tabla'}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenido principal */}
      <Fade in>
        <Box>
          {vistaActual === 'grid' || isMobile ? (
            <Grid container spacing={3}>
              {loadingRutas ? (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" fontWeight={700}>
                      Cargando rutas...
                    </Typography>
                  </Box>
                </Grid>
              ) : rutasFiltradas.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <EmptyState
                    type={rutas.length === 0 ? 'no-data' : 'no-results'}
                    onAction={rutas.length === 0 ? handleNuevaRuta : handleFiltrar}
                  />
                </Grid>
              ) : (
                rutasFiltradas.map((ruta) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ruta.id}>
                    <RutaCard
                      ruta={ruta}
                      onView={handleVerDetalles}
                      onEdit={handleEditarRuta}
                      onDelete={handleEliminarRuta}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            <RutasTable
              rutas={rutasFiltradas}
              loading={loadingRutas}
              page={1}
              rowsPerPage={25}
              totalItems={rutasFiltradas.length}
              onPageChange={() => { }}
              onRowsPerPageChange={() => { }}
              onView={handleVerDetalles}
              onEdit={handleEditarRuta}
              onDelete={handleEliminarRuta}
            />
          )}
        </Box>
      </Fade>

      {/* ── Dialog de creación/edición (mismo lenguaje visual que ProductoFormDialog) ── */}
      <Dialog
        open={openDialog}
        onClose={handleCerrarDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* ── HEADER ── */}
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden', flexShrink: 0,
            borderBottom: `1px solid ${borderField}`,
            background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
          }}
        >
          {/* watermark decorativo sutil */}
          <BusIcon
            sx={{
              position: 'absolute', right: -14, top: -18, fontSize: 120,
              color: brand, opacity: isDark ? 0.05 : 0.06, transform: 'rotate(-12deg)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: alpha(brand, 0.85), mb: 0.4,
                }}
              >
                {modoEdicion ? `Editando · ${rutaSeleccionada?.codigo}` : 'Nueva ruta de transporte'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                    background: alpha(brand, 0.15),
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <BusIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  {modoEdicion ? 'Editar ruta' : 'Nueva ruta'}
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={handleCerrarDialog}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: guardando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                opacity: guardando ? 0.4 : 1,
                transition: 'all 0.15s',
                '&:hover': guardando ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 2.75 }}>
          <RutaForm formData={formData} onChange={handleChange} modoEdicion={modoEdicion} />
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleCerrarDialog}
            disabled={guardando}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={guardando}
            startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.5, background: brand, color: isDark ? '#000' : '#fff' },
            }}
          >
            {guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear ruta'}
          </Button>
        </Box>
      </Dialog>

      {/* Dialog de detalles */}
      <RutaDetallesDialog
        open={openDetalles}
        ruta={rutaSeleccionada}
        onClose={() => setOpenDetalles(false)}
        onEdit={handleEditarDesdeDetalles}
      />
    </Box>
  );
};

export default GestionRutas;