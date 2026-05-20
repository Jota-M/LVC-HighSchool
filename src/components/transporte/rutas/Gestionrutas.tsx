// components/transporte/GestionRutas.tsx
'use client';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsBus as BusIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: name === 'capacidad_maxima' || name === 'costo_mensual' || name === 'anio_vehiculo'
      ? parseFloat(value) || 0
      : value,
  }));
}, []);

  const handleSubmit = async () => {
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
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              onView={handleVerDetalles}
              onEdit={handleEditarRuta}
              onDelete={handleEliminarRuta}
            />
          )}
        </Box>
      </Fade>

      {/* Dialog de creación/edición */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          limpiarFormulario();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.8)} 100%)`,
            color: isDark ? '#000' : '#fff',
            fontWeight: 900,
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                backgroundColor: alpha(isDark ? '#000' : '#fff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                {modoEdicion ? 'Editar Ruta' : 'Nueva Ruta'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                {modoEdicion ? `Modificar ${rutaSeleccionada?.codigo}` : 'Completar información'}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => {
              setOpenDialog(false);
              limpiarFormulario();
            }}
            sx={{
              minWidth: 'auto',
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: alpha(isDark ? '#000' : '#fff', 0.15),
              color: 'inherit',
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <RutaForm formData={formData} onChange={handleChange} modoEdicion={modoEdicion} />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              limpiarFormulario();
            }}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              px: 3,
              borderWidth: 2,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, ${alpha(yellowColor, 0.8)} 100%)`,
              color: isDark ? '#000' : '#fff',
              fontWeight: 900,
              px: 4,
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            {modoEdicion ? 'Actualizar Ruta' : 'Crear Ruta'}
          </Button>
        </DialogActions>
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