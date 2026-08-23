// components/transporte/GestionAsignaciones.tsx - VERSIÓN CON BUSCADOR DE ESTUDIANTES
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Zoom,
  Paper,
  Divider,
  Stack,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AssignmentInd as AssignmentIcon,
  PlaylistAddCheck as GenerarIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon,
  FilterList as FilterIcon,
  SwapHoriz as SwapIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { usePeriodos } from '@/hooks/usePeriodos';
import transporteService from '@/services/transporte';
import type { AsignacionTransporte, CrearAsignacionRequest } from '@/types/transporte';
import type { Estudiante } from '@/types/estudianteTypes';

export const GestionAsignaciones: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    asignaciones,
    rutas,
    paradas,
    loadingAsignaciones,
    loadingRutas,
    cargarAsignaciones,
    cargarRutas,
    cargarParadas,
    limpiarParadas,
    crearAsignacion,
    actualizarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
    generarCuotas,
  } = useTransporte({
    autoLoad: true,
    loadAsignaciones: true,
    loadRutas: true,
  });

  // Hook para periodos académicos
  const { periodos, periodoActivo } = usePeriodos();

  // Hook para buscar estudiantes
  const {
    estudiantes,
    isLoading: loadingEstudiantes,
    actualizarFiltros
  } = useEstudiantes();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionTransporte | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    ruta_id: '',
    periodo_academico_id: '',
  });

  // Estado para el estudiante seleccionado en el formulario
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  const [formData, setFormData] = useState<CrearAsignacionRequest>({
    estudiante_id: 0,
    ruta_id: 0,
    parada_id: undefined,
    periodo_academico_id: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: undefined,
    costo_mensual: 0,
    usa_ida: true,
    usa_retorno: true,
    contacto_emergencia: '',
    telefono_emergencia: '',
    observaciones: '',
  });

  // Establecer periodo activo por defecto cuando cargue
  useEffect(() => {
    if ((!formData.periodo_academico_id || formData.periodo_academico_id === 0) && (periodoActivo?.id || periodos.length > 0)) {
      setFormData(prev => ({
        ...prev,
        periodo_academico_id: periodoActivo?.id || periodos[0]?.id || 1,
      }));
    }
  }, [periodoActivo, periodos, formData.periodo_academico_id]);

  // Cargar paradas cuando cambia la ruta
  useEffect(() => {
    if (formData.ruta_id) {
      cargarParadas(formData.ruta_id);

      // Auto-completar costo mensual si se selecciona una ruta
      const rutaSeleccionada = rutas.find(r => r.id === formData.ruta_id);
      if (rutaSeleccionada && !modoEdicion) {
        setFormData(prev => ({
          ...prev,
          costo_mensual: rutaSeleccionada.costo_mensual
        }));
      }
    } else {
      limpiarParadas();
    }
  }, [formData.ruta_id, rutas, modoEdicion]);

  const limpiarFormulario = () => {
    setFormData({
      estudiante_id: 0,
      ruta_id: 0,
      parada_id: undefined,
      periodo_academico_id: periodoActivo?.id || periodos[0]?.id || 1,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: undefined,
      costo_mensual: 0,
      usa_ida: true,
      usa_retorno: true,
      contacto_emergencia: '',
      telefono_emergencia: '',
      observaciones: '',
    });
    setEstudianteSeleccionado(null);
    setModoEdicion(false);
    setAsignacionSeleccionada(null);
    limpiarParadas();
  };

  const handleNuevaAsignacion = () => {
    limpiarFormulario();
    setOpenDialog(true);
  };

  const handleEditarAsignacion = (asignacion: AsignacionTransporte) => {
    setAsignacionSeleccionada(asignacion);
    setFormData({
      estudiante_id: asignacion.estudiante_id,
      ruta_id: asignacion.ruta_id,
      parada_id: asignacion.parada_id,
      periodo_academico_id: asignacion.periodo_academico_id || periodoActivo?.id || 1,
      fecha_inicio: asignacion.fecha_inicio,
      fecha_fin: asignacion.fecha_fin,
      costo_mensual: asignacion.costo_mensual,
      usa_ida: asignacion.usa_ida,
      usa_retorno: asignacion.usa_retorno,
      contacto_emergencia: asignacion.contacto_emergencia || '',
      telefono_emergencia: asignacion.telefono_emergencia || '',
      observaciones: asignacion.observaciones || '',
    });

    // Crear un objeto estudiante para mostrar en el formulario
    setEstudianteSeleccionado({
      id: asignacion.estudiante_id,
      nombres: asignacion.estudiante_nombres,
      apellido_paterno: asignacion.estudiante_apellido_paterno,
      codigo: asignacion.estudiante_codigo,
      foto: asignacion.estudiante_foto,
    } as unknown as Estudiante);

    setModoEdicion(true);
    setOpenDialog(true);
  };

  const handleVerDetalles = (asignacion: AsignacionTransporte) => {
    setAsignacionSeleccionada(asignacion);
    setOpenDetalles(true);
  };

  const handleEliminarAsignacion = async (asignacion: AsignacionTransporte) => {
    if (confirm(`¿Está seguro de eliminar la asignación del estudiante "${asignacion.estudiante_nombres}"?`)) {
      try {
        await eliminarAsignacion(asignacion.id);
        alert('Asignación eliminada exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al eliminar la asignación');
      }
    }
  };

  const handleCambiarEstado = async (asignacion: AsignacionTransporte, nuevoEstado: string) => {
    const motivo = prompt('Ingrese el motivo del cambio de estado (opcional):');
    try {
      await cambiarEstadoAsignacion(asignacion.id, nuevoEstado, motivo || undefined);
      alert('Estado actualizado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar el estado');
    }
  };

  const handleGenerarCuotas = async (asignacion: AsignacionTransporte) => {
    if (asignacion.total_cuotas && asignacion.total_cuotas > 0) {
      if (!confirm('Esta asignación ya tiene cuotas generadas. ¿Desea continuar?')) {
        return;
      }
    }

    try {
      await generarCuotas(asignacion.id);   // 👈 sin segundo argumento
      alert('Cuotas generadas exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al generar cuotas');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        name === 'ruta_id' || name === 'parada_id' || name === 'costo_mensual' || name === 'periodo_academico_id'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Buscar estudiante
  const handleBuscarEstudiante = useCallback((value: string) => {
    const searchValue = value.trim();
    if (searchValue.length >= 2) {
      actualizarFiltros({
        search: searchValue,
        limit: 10,
        activo: true
      });
    }
  }, [actualizarFiltros]);

  // Seleccionar estudiante
  const handleSeleccionarEstudiante = useCallback((estudiante: Estudiante | null) => {
    setEstudianteSeleccionado(estudiante);
    setFormData(prev => ({
      ...prev,
      estudiante_id: estudiante?.id || 0
    }));
  }, []);

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.estudiante_id) {
      alert('Debe seleccionar un estudiante');
      return;
    }

    if (!formData.ruta_id) {
      alert('Debe seleccionar una ruta');
      return;
    }

    if (!formData.costo_mensual || formData.costo_mensual <= 0) {
      alert('El costo mensual debe ser mayor a 0');
      return;
    }

    try {
      if (modoEdicion && asignacionSeleccionada) {
        await actualizarAsignacion(asignacionSeleccionada.id, formData);
        alert('Asignación actualizada exitosamente');
      } else {
        await crearAsignacion(formData);
        alert('Asignación creada exitosamente');
      }
      setOpenDialog(false);
      limpiarFormulario();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la asignación');
    }
  };

  const handleFiltrar = () => {
    cargarAsignaciones({
      search: filtros.search,
      estado: filtros.estado || undefined,
      ruta_id: filtros.ruta_id ? parseInt(filtros.ruta_id) : undefined,
      periodo_academico_id: filtros.periodo_academico_id ? parseInt(filtros.periodo_academico_id) : undefined,
    });
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Función para obtener el icono de estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckIcon />;
      case 'suspendido':
        return <PauseIcon />;
      case 'cancelado':
        return <CancelIcon />;
      case 'finalizado':
        return <CheckIcon />;
      default:
        return <CheckIcon />;
    }
  };

  // Función para obtener el color de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return '#10b981';
      case 'suspendido':
        return '#f59e0b';
      case 'cancelado':
        return '#ef4444';
      case 'finalizado':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <Box>
      {/* Header con filtros mejorado */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '20px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
          border: `2px solid ${alpha(yellowColor, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: yellowColor,
                color: '#000',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha(yellowColor, 0.4)}`,
              }}
            >
              <BusIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Asignaciones de Transporte
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las asignaciones de estudiantes a rutas
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevaAsignacion}
            size="large"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(yellowColor, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nueva Asignación
          </Button>
        </Box>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        {/* Filtros mejorados */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FilterIcon sx={{ color: yellowColor }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filtros de búsqueda
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Buscar estudiante"
              placeholder="Código, nombre..."
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Periodo"
              value={filtros.periodo_academico_id}
              onChange={(e) => setFiltros({ ...filtros, periodo_academico_id: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            >
              <MenuItem value="">Todos los periodos</MenuItem>
              {periodos.map((p) => (
                <MenuItem key={p.id} value={p.id.toString()}>
                  {p.nombre} {p.activo ? '• Activo' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Ruta"
              value={filtros.ruta_id}
              onChange={(e) => setFiltros({ ...filtros, ruta_id: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            >
              <MenuItem value="">Todas las rutas</MenuItem>
              {rutas.map((ruta) => (
                <MenuItem key={ruta.id} value={ruta.id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusIcon sx={{ fontSize: 16 }} />
                    {ruta.nombre}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Estado"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">✓ Activo</MenuItem>
              <MenuItem value="suspendido">⏸ Suspendido</MenuItem>
              <MenuItem value="cancelado">✕ Cancelado</MenuItem>
              <MenuItem value="finalizado">⚑ Finalizado</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFiltrar}
              sx={{
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                color: '#000',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid de cards mejorado */}
      {loadingAsignaciones ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: yellowColor }} />
        </Box>
      ) : asignaciones.length === 0 ? (
        <Fade in={true}>
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: '20px',
              textAlign: 'center',
              background: isDark
                ? alpha(theme.palette.background.paper, 0.5)
                : alpha(theme.palette.background.paper, 0.8),
              border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
            }}
          >
            <BusIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No hay asignaciones
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No se encontraron asignaciones con los filtros seleccionados
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNuevaAsignacion}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                color: '#000',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Crear Primera Asignación
            </Button>
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {asignaciones.map((asignacion, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={asignacion.id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(getEstadoColor(asignacion.estado), 0.15)} 0%, ${alpha(getEstadoColor(asignacion.estado), 0.05)} 100%)`
                      : `linear-gradient(135deg, ${alpha(getEstadoColor(asignacion.estado), 0.1)} 0%, ${alpha(getEstadoColor(asignacion.estado), 0.05)} 100%)`,
                    border: `2px solid ${alpha(getEstadoColor(asignacion.estado), 0.3)}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 32px ${alpha(getEstadoColor(asignacion.estado), 0.4)}`,
                      borderColor: alpha(getEstadoColor(asignacion.estado), 0.6),
                    },
                  }}
                >
                  {/* Icono decorativo de fondo */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -20,
                      top: -20,
                      opacity: 0.08,
                      transform: 'rotate(-15deg)',
                    }}
                  >
                    <BusIcon sx={{ fontSize: 150 }} />
                  </Box>

                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                    {/* Header con estudiante */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                      <Avatar
                        src={asignacion.estudiante_foto}
                        sx={{
                          width: 56,
                          height: 56,
                          border: `3px solid ${alpha(getEstadoColor(asignacion.estado), 0.3)}`,
                          boxShadow: `0 4px 12px ${alpha(getEstadoColor(asignacion.estado), 0.4)}`,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 28 }} />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                          {asignacion.estudiante_nombres} {asignacion.estudiante_apellido_paterno}
                        </Typography>
                        <Chip
                          label={asignacion.estudiante_codigo}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: alpha(yellowColor, 0.2),
                            color: yellowColor,
                          }}
                        />
                      </Box>

                      <Chip
                        icon={getEstadoIcon(asignacion.estado)}
                        label={transporteService.getEstadoAsignacionLabel(asignacion.estado)}
                        size="small"
                        sx={{
                          height: 28,
                          fontWeight: 600,
                          backgroundColor: alpha(getEstadoColor(asignacion.estado), 0.2),
                          color: getEstadoColor(asignacion.estado),
                          border: `1px solid ${alpha(getEstadoColor(asignacion.estado), 0.3)}`,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.1 }} />

                    {/* Información de la ruta */}
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#3b82f6', 0.15),
                            }}
                          >
                            <BusIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {asignacion.ruta_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ruta de transporte
                            </Typography>
                          </Box>
                        </Box>

                        {/* Servicio */}
                        <Box sx={{ display: 'flex', gap: 1, ml: 5 }}>
                          {asignacion.usa_ida && (
                            <Chip
                              label="Ida"
                              size="small"
                              icon={<SwapIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: alpha('#10b981', 0.15),
                                color: '#10b981',
                              }}
                            />
                          )}
                          {asignacion.usa_retorno && (
                            <Chip
                              label="Retorno"
                              size="small"
                              icon={<SwapIcon sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />}
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: alpha('#8b5cf6', 0.15),
                                color: '#8b5cf6',
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Parada */}
                      {asignacion.parada_nombre && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#f59e0b', 0.15),
                            }}
                          >
                            <LocationIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {asignacion.parada_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Parada asignada
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Costo mensual */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: alpha(yellowColor, 0.15),
                          }}
                        >
                          <MoneyIcon sx={{ fontSize: 18, color: yellowColor }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: yellowColor, lineHeight: 1.2 }}>
                            {transporteService.formatearMonto(asignacion.costo_mensual)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Costo mensual
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progreso de cuotas */}
                      {asignacion.total_cuotas && asignacion.total_cuotas > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Progreso de cuotas
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {asignacion.cuotas_pagadas || 0} / {asignacion.total_cuotas}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={((asignacion.cuotas_pagadas || 0) / asignacion.total_cuotas) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha('#10b981', 0.2),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                              },
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {asignacion.cuotas_vencidas && asignacion.cuotas_vencidas > 0 && (
                              <Chip
                                icon={<WarningIcon sx={{ fontSize: 14 }} />}
                                label={`${asignacion.cuotas_vencidas} vencidas`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: alpha('#ef4444', 0.15),
                                  color: '#ef4444',
                                }}
                              />
                            )}
                            {asignacion.cuotas_pendientes && asignacion.cuotas_pendientes > 0 && (
                              <Chip
                                label={`${asignacion.cuotas_pendientes} pendientes`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: alpha('#f59e0b', 0.15),
                                  color: '#f59e0b',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Stack>

                    <Divider sx={{ my: 2, opacity: 0.1 }} />

                    {/* Acciones */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleVerDetalles(asignacion)}
                          sx={{
                            backgroundColor: alpha('#3b82f6', 0.1),
                            color: '#3b82f6',
                            '&:hover': {
                              backgroundColor: alpha('#3b82f6', 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generar cuotas">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleGenerarCuotas(asignacion)}
                            disabled={asignacion.estado !== 'activo'}
                            sx={{
                              backgroundColor: alpha('#10b981', 0.1),
                              color: '#10b981',
                              '&:hover': {
                                backgroundColor: alpha('#10b981', 0.2),
                                transform: 'scale(1.1)',
                              },
                              '&.Mui-disabled': {
                                opacity: 0.5,
                              },
                            }}
                          >
                            <GenerarIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEditarAsignacion(asignacion)}
                          sx={{
                            backgroundColor: alpha(yellowColor, 0.1),
                            color: yellowColor,
                            '&:hover': {
                              backgroundColor: alpha(yellowColor, 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleEliminarAsignacion(asignacion)}
                          sx={{
                            backgroundColor: alpha('#ef4444', 0.1),
                            color: '#ef4444',
                            '&:hover': {
                              backgroundColor: alpha('#ef4444', 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de creación/edición con BUSCADOR DE ESTUDIANTES */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          limpiarFormulario();
        }}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: isDark
              ? alpha('#0f172a', 0.98)
              : alpha('#ffffff', 0.98),
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: yellowColor,
                color: '#000',
                width: 48,
                height: 48,
              }}
            >
              {modoEdicion ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {modoEdicion ? 'Editar Asignación' : 'Nueva Asignación'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {modoEdicion ? 'Actualiza los datos de la asignación' : 'Asigna un estudiante a una ruta de transporte'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => { setOpenDialog(false); limpiarFormulario(); }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* BUSCADOR DE ESTUDIANTES */}
            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: alpha('#3b82f6', 0.05),
                border: `1px solid ${alpha('#3b82f6', 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                ESTUDIANTE
              </Typography>

              <Autocomplete
                options={estudiantes}
                value={estudianteSeleccionado}
                getOptionLabel={(option) =>
                  `${option.codigo} - ${option.nombres} ${option.apellido_paterno}`
                }
                loading={loadingEstudiantes}
                disabled={modoEdicion}
                onChange={(_, newValue) => handleSeleccionarEstudiante(newValue)}
                onInputChange={(_, newValue) => handleBuscarEstudiante(newValue)}
                filterOptions={(x) => x}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={modoEdicion ? "Estudiante Asignado" : "Buscar Estudiante *"}
                    placeholder="Busca por código o nombre..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <>
                          {loadingEstudiantes ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      },
                    }}
                    helperText={modoEdicion ? "No se puede cambiar el estudiante en modo edición" : "Busca y selecciona un estudiante activo"}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Avatar
                          src={option.foto}
                          sx={{
                            bgcolor: yellowColor,
                            color: '#000',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {option.nombres.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight={600}>
                            {option.nombres} {option.apellido_paterno}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Código: {option.codigo}
                            {option.grado_nombre && ` • ${option.grado_nombre}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="No se encontraron estudiantes"
              />

              {/* Preview del estudiante seleccionado */}
              {estudianteSeleccionado && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: alpha(yellowColor, 0.1),
                    border: `1px solid ${alpha(yellowColor, 0.2)}`,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={estudianteSeleccionado.foto}
                      sx={{
                        width: 48,
                        height: 48,
                        border: `2px solid ${yellowColor}`,
                      }}
                    >
                      {estudianteSeleccionado.nombres.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>
                        {estudianteSeleccionado.nombres} {estudianteSeleccionado.apellido_paterno}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Código: {estudianteSeleccionado.codigo}
                      </Typography>
                    </Box>
                    <Chip
                      label="Seleccionado"
                      size="small"
                      sx={{
                        ml: 'auto',
                        backgroundColor: alpha('#10b981', 0.2),
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Paper>

            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: alpha(yellowColor, 0.05),
                border: `1px solid ${alpha(yellowColor, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                RUTA Y PARADA
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Ruta *"
                    name="ruta_id"
                    value={formData.ruta_id}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  >
                    <MenuItem value={0}>Seleccione una ruta</MenuItem>
                    {rutas.map((ruta) => (
                      <MenuItem key={ruta.id} value={ruta.id}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ruta.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transporteService.formatearMonto(ruta.costo_mensual)} • {ruta.numero_placa}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Parada"
                    name="parada_id"
                    value={formData.parada_id || ''}
                    onChange={handleChange}
                    disabled={!formData.ruta_id || paradas.length === 0}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  >
                    <MenuItem value="">Sin parada específica</MenuItem>
                    {paradas.map((parada) => (
                      <MenuItem key={parada.id} value={parada.id}>
                        {parada.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: alpha('#10b981', 0.05),
                border: `1px solid ${alpha('#10b981', 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                PERÍODO Y COSTO
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Periodo Académico *"
                    name="periodo_academico_id"
                    value={formData.periodo_academico_id || ''}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  >
                    {periodos.map((periodo) => (
                      <MenuItem key={periodo.id} value={periodo.id}>
                        {periodo.nombre} ({periodo.codigo}) {periodo.activo ? '• Activo' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Fecha de Inicio"
                    name="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Fecha de Fin"
                    name="fecha_fin"
                    type="date"
                    value={formData.fecha_fin || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Costo Mensual (Bs) *"
                    name="costo_mensual"
                    type="number"
                    value={formData.costo_mensual}
                    onChange={handleChange}
                    required
                    helperText="Costo que pagará el estudiante mensualmente"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: alpha('#8b5cf6', 0.05),
                border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                SERVICIOS
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: `2px solid ${formData.usa_ida ? '#10b981' : alpha(theme.palette.divider, 0.3)}`,
                      backgroundColor: formData.usa_ida ? alpha('#10b981', 0.1) : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#10b981',
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => setFormData({ ...formData, usa_ida: !formData.usa_ida })}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SwapIcon sx={{ color: formData.usa_ida ? '#10b981' : 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Servicio de Ida
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Del hogar al colegio
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: `2px solid ${formData.usa_retorno ? '#8b5cf6' : alpha(theme.palette.divider, 0.3)}`,
                      backgroundColor: formData.usa_retorno ? alpha('#8b5cf6', 0.1) : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => setFormData({ ...formData, usa_retorno: !formData.usa_retorno })}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SwapIcon sx={{ color: formData.usa_retorno ? '#8b5cf6' : 'text.secondary', transform: 'rotate(180deg)' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Servicio de Retorno
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Del colegio al hogar
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: alpha('#ef4444', 0.05),
                border: `1px solid ${alpha('#ef4444', 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                CONTACTO DE EMERGENCIA
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre del Contacto"
                    name="contacto_emergencia"
                    value={formData.contacto_emergencia}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Teléfono de Emergencia"
                    name="telefono_emergencia"
                    value={formData.telefono_emergencia}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <TextField
              fullWidth
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Información adicional sobre la asignación..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              limpiarFormulario();
            }}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '12px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={!estudianteSeleccionado || !formData.ruta_id}
            sx={{
              borderRadius: '12px',
              px: 4,
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                boxShadow: `0 6px 16px ${alpha(yellowColor, 0.4)}`,
              },
              '&.Mui-disabled': {
                opacity: 0.6,
              }
            }}
          >
            {modoEdicion ? 'Actualizar Asignación' : 'Crear Asignación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles (sin cambios) */}
      <Dialog
        open={openDetalles}
        onClose={() => setOpenDetalles(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: isDark
              ? alpha('#0f172a', 0.98)
              : alpha('#ffffff', 0.98),
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: asignacionSeleccionada
              ? `linear-gradient(135deg, ${alpha(getEstadoColor(asignacionSeleccionada.estado), 0.2)} 0%, ${alpha(getEstadoColor(asignacionSeleccionada.estado), 0.05)} 100%)`
              : 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: asignacionSeleccionada ? getEstadoColor(asignacionSeleccionada.estado) : yellowColor,
                color: '#fff',
              }}
            >
              <ViewIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Detalles de Asignación
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpenDetalles(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {asignacionSeleccionada && (
            <Stack spacing={3}>
              {/* Estudiante */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
                  border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={asignacionSeleccionada.estudiante_foto}
                    sx={{ width: 64, height: 64 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {asignacionSeleccionada.estudiante_nombres} {asignacionSeleccionada.estudiante_apellido_paterno}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Código: {asignacionSeleccionada.estudiante_codigo}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Ruta y Parada */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
                  border: `1px solid ${alpha(yellowColor, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <BusIcon sx={{ color: yellowColor }} />
                  <Typography variant="h6" fontWeight={700}>
                    {asignacionSeleccionada.ruta_nombre}
                  </Typography>
                </Box>
                {asignacionSeleccionada.parada_nombre && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <LocationIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="body2">
                      {asignacionSeleccionada.parada_nombre}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {asignacionSeleccionada.usa_ida && (
                    <Chip label="Ida" size="small" sx={{ backgroundColor: alpha('#10b981', 0.2), color: '#10b981' }} />
                  )}
                  {asignacionSeleccionada.usa_retorno && (
                    <Chip label="Retorno" size="small" sx={{ backgroundColor: alpha('#8b5cf6', 0.2), color: '#8b5cf6' }} />
                  )}
                </Box>
              </Paper>

              {/* Costo y Período */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: alpha('#10b981', 0.05),
                      border: `1px solid ${alpha('#10b981', 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <MoneyIcon sx={{ color: '#10b981', fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700} color="#10b981">
                      {transporteService.formatearMonto(asignacionSeleccionada.costo_mensual)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Costo mensual
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: alpha(getEstadoColor(asignacionSeleccionada.estado), 0.05),
                      border: `1px solid ${alpha(getEstadoColor(asignacionSeleccionada.estado), 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    {getEstadoIcon(asignacionSeleccionada.estado)}
                    <Typography variant="h6" fontWeight={700} sx={{ color: getEstadoColor(asignacionSeleccionada.estado), mt: 1 }}>
                      {transporteService.getEstadoAsignacionLabel(asignacionSeleccionada.estado)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estado actual
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Período */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha('#8b5cf6', 0.05),
                  border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon sx={{ color: '#8b5cf6' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Período de Servicio
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {transporteService.formatearFecha(asignacionSeleccionada.fecha_inicio)}
                  {asignacionSeleccionada.fecha_fin && ` - ${transporteService.formatearFecha(asignacionSeleccionada.fecha_fin)}`}
                </Typography>
              </Paper>

              {/* Cuotas */}
              {asignacionSeleccionada.total_cuotas && asignacionSeleccionada.total_cuotas > 0 && (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`,
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Estado de Cuotas
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {asignacionSeleccionada.cuotas_pagadas || 0} / {asignacionSeleccionada.total_cuotas}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={((asignacionSeleccionada.cuotas_pagadas || 0) / asignacionSeleccionada.total_cuotas) * 100}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: alpha('#10b981', 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip
                      label={`${asignacionSeleccionada.cuotas_pagadas || 0} Pagadas`}
                      size="small"
                      sx={{ backgroundColor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 600 }}
                    />
                    <Chip
                      label={`${asignacionSeleccionada.cuotas_pendientes || 0} Pendientes`}
                      size="small"
                      sx={{ backgroundColor: alpha('#f59e0b', 0.2), color: '#f59e0b', fontWeight: 600 }}
                    />
                    {asignacionSeleccionada.cuotas_vencidas && asignacionSeleccionada.cuotas_vencidas > 0 && (
                      <Chip
                        label={`${asignacionSeleccionada.cuotas_vencidas} Vencidas`}
                        size="small"
                        sx={{ backgroundColor: alpha('#ef4444', 0.2), color: '#ef4444', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Paper>
              )}

              {/* Deuda */}
              {asignacionSeleccionada.deuda_total && asignacionSeleccionada.deuda_total > 0 && (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: alpha('#ef4444', 0.05),
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    textAlign: 'center',
                  }}
                >
                  <WarningIcon sx={{ color: '#ef4444', fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight={700} color="#ef4444">
                    {transporteService.formatearMonto(asignacionSeleccionada.deuda_total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Deuda total pendiente
                  </Typography>
                </Paper>
              )}

              {/* Contacto de emergencia */}
              {asignacionSeleccionada.contacto_emergencia && (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: alpha('#ef4444', 0.05),
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Contacto de Emergencia
                  </Typography>
                  <Typography variant="body2">
                    {asignacionSeleccionada.contacto_emergencia}
                  </Typography>
                  {asignacionSeleccionada.telefono_emergencia && (
                    <Typography variant="body2" color="text.secondary">
                      Tel: {asignacionSeleccionada.telefono_emergencia}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Acciones de cambio de estado */}
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Cambiar Estado
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PauseIcon />}
                      onClick={() => handleCambiarEstado(asignacionSeleccionada, 'suspendido')}
                      disabled={asignacionSeleccionada.estado !== 'activo'}
                      sx={{
                        borderRadius: '12px',
                        borderColor: '#f59e0b',
                        color: '#f59e0b',
                        '&:hover': {
                          borderColor: '#f59e0b',
                          backgroundColor: alpha('#f59e0b', 0.1),
                        },
                      }}
                    >
                      Suspender
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => handleCambiarEstado(asignacionSeleccionada, 'cancelado')}
                      sx={{
                        borderRadius: '12px',
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': {
                          borderColor: '#ef4444',
                          backgroundColor: alpha('#ef4444', 0.1),
                        },
                      }}
                    >
                      Cancelar
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDetalles(false)}
            variant="contained"
            sx={{
              borderRadius: '12px',
              px: 4,
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 600,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionAsignaciones;