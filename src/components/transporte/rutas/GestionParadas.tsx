// components/transporte/rutas/GestionParadas.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Place as PlaceIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  DirectionsBus as BusIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  SaveRounded as SaveRoundedIcon,
  LocationOn as LocationIcon,
  SwapVert as ReorderIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import type { RutaTransporte, ParadaRuta, CrearParadaRequest, ActualizarParadaRequest } from '@/types/transporte';

interface GestionParadasProps {
  rutaIdInicial?: number;
}

export const GestionParadas: React.FC<GestionParadasProps> = ({ rutaIdInicial }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  const brand = isDark ? '#facc15' : '#f59e0b';
  const brandSoft = isDark ? '#eab308' : '#d97706';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(245,158,11,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(245,158,11,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
      '&.Mui-disabled': { opacity: 0.6 },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const {
    rutas,
    paradas,
    loadingRutas,
    loadingParadas,
    cargarRutas,
    cargarParadas,
    crearParada,
    actualizarParada,
    eliminarParada,
    reordenarParadas,
  } = useTransporte({
    autoLoad: true,
    loadRutas: true,
  });

  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | ''>(rutaIdInicial || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [paradaSeleccionada, setParadaSeleccionada] = useState<ParadaRuta | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState<CrearParadaRequest & { activo?: boolean }>({
    nombre: '',
    direccion: '',
    referencia: '',
    latitud: undefined,
    longitud: undefined,
    orden: 1,
    hora_estimada_ida: '',
    hora_estimada_retorno: '',
    activo: true,
  });

  // Si cambia rutas y no hay ruta seleccionada, seleccionar la primera activa
  useEffect(() => {
    if (!rutaSeleccionadaId && rutas.length > 0) {
      const defaultRuta = rutaIdInicial || rutas[0].id;
      setRutaSeleccionadaId(defaultRuta);
    }
  }, [rutas, rutaIdInicial, rutaSeleccionadaId]);

  // Cargar paradas al cambiar de ruta
  useEffect(() => {
    if (rutaSeleccionadaId) {
      cargarParadas(Number(rutaSeleccionadaId));
    }
  }, [rutaSeleccionadaId, cargarParadas]);

  const rutaActual = rutas.find((r) => r.id === rutaSeleccionadaId);

  const limpiarFormulario = () => {
    const siguienteOrden = paradas.length > 0 ? Math.max(...paradas.map((p) => p.orden)) + 1 : 1;
    setFormData({
      nombre: '',
      direccion: '',
      referencia: '',
      latitud: undefined,
      longitud: undefined,
      orden: siguienteOrden,
      hora_estimada_ida: '',
      hora_estimada_retorno: '',
      activo: true,
    });
    setModoEdicion(false);
    setParadaSeleccionada(null);
  };

  const handleNuevaParada = () => {
    if (!rutaSeleccionadaId) {
      alert('Por favor, selecciona una ruta primero');
      return;
    }
    limpiarFormulario();
    setOpenDialog(true);
  };

  const handleEditarParada = (parada: ParadaRuta) => {
    setParadaSeleccionada(parada);
    setFormData({
      nombre: parada.nombre,
      direccion: parada.direccion || '',
      referencia: parada.referencia || '',
      latitud: parada.latitud,
      longitud: parada.longitud,
      orden: parada.orden,
      hora_estimada_ida: parada.hora_estimada_ida || '',
      hora_estimada_retorno: parada.hora_estimada_retorno || '',
      activo: parada.activo ?? true,
    });
    setModoEdicion(true);
    setOpenDialog(true);
  };

  const handleEliminarParada = async (parada: ParadaRuta) => {
    if (parada.estudiantes_en_parada && parada.estudiantes_en_parada > 0) {
      alert('No se puede eliminar la parada porque tiene estudiantes asignados');
      return;
    }

    if (confirm(`¿Está seguro de eliminar la parada "${parada.nombre}"?`)) {
      try {
        await eliminarParada(Number(rutaSeleccionadaId), parada.id);
        alert('Parada eliminada exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || error.message || 'Error al eliminar la parada');
      }
    }
  };

  const handleMoverOrden = async (index: number, direccion: 'arriba' | 'abajo') => {
    if (!rutaSeleccionadaId || paradas.length <= 1) return;
    const targetIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paradas.length) return;

    const nuevasParadas = [...paradas];
    const temp = nuevasParadas[index];
    nuevasParadas[index] = nuevasParadas[targetIndex];
    nuevasParadas[targetIndex] = temp;

    // Asignar nuevos órdenes secuenciales 1, 2, 3...
    const payload = nuevasParadas.map((p, i) => ({
      id: p.id,
      orden: i + 1,
    }));

    try {
      await reordenarParadas(Number(rutaSeleccionadaId), payload);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al reordenar paradas');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'orden'
        ? parseInt(value) || 1
        : name === 'latitud' || name === 'longitud'
        ? (value === '' ? undefined : parseFloat(value) || 0)
        : name === 'activo'
        ? Boolean(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!rutaSeleccionadaId) return;
    if (!formData.nombre.trim()) {
      alert('El nombre de la parada es obligatorio');
      return;
    }

    setGuardando(true);
    try {
      if (modoEdicion && paradaSeleccionada) {
        await actualizarParada(Number(rutaSeleccionadaId), paradaSeleccionada.id, formData);
        alert('Parada actualizada exitosamente');
      } else {
        await crearParada(Number(rutaSeleccionadaId), formData);
        alert('Parada creada exitosamente');
      }
      setOpenDialog(false);
      limpiarFormulario();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la parada');
    } finally {
      setGuardando(false);
    }
  };

  const paradasFiltradas = paradas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.direccion && p.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.referencia && p.referencia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      {/* ── Encabezado ── */}
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
              Paradas de Transporte
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              Administra los puntos de subida y bajada por cada ruta
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleNuevaParada}
            disabled={!rutaSeleccionadaId}
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
            Nueva Parada
          </Button>
        </Box>
      </Box>

      {/* ── Filtros y selector de ruta ── */}
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
          {/* Selector de ruta */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="select-ruta-label" sx={{ fontWeight: 700 }}>
                Selecciona una Ruta
              </InputLabel>
              <Select
                labelId="select-ruta-label"
                value={rutaSeleccionadaId}
                label="Selecciona una Ruta"
                onChange={(e) => setRutaSeleccionadaId(Number(e.target.value))}
                sx={{
                  borderRadius: '16px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  fontWeight: 700,
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <BusIcon sx={{ color: yellowColor, fontSize: 22, ml: 1 }} />
                  </InputAdornment>
                }
              >
                {rutas.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Chip
                        label={r.codigo}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          background: alpha(yellowColor, 0.15),
                          color: yellowColor,
                        }}
                      />
                      <Typography fontWeight={700}>{r.nombre}</Typography>
                      {r.zona_cobertura && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {r.zona_cobertura}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Buscador de paradas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar parada por nombre, dirección o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        </Grid>
      </Paper>

      {/* ── Banner con información de la ruta seleccionada ── */}
      {rutaActual && (
        <Box
          sx={{
            p: 2.25,
            mb: 3,
            borderRadius: '18px',
            background: alpha(yellowColor, 0.08),
            border: `1px solid ${alpha(yellowColor, 0.25)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: alpha(yellowColor, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusIcon sx={{ color: yellowColor, fontSize: 24 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={rutaActual.codigo}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    background: yellowColor,
                    color: isDark ? '#000' : '#fff',
                  }}
                />
                <Typography variant="h6" fontWeight={800}>
                  {rutaActual.nombre}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {rutaActual.zona_cobertura ? `Zona: ${rutaActual.zona_cobertura}` : 'Sin zona'} • Conductor:{' '}
                {rutaActual.conductor_responsable || 'No asignado'} • {paradas.length} parada{paradas.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleNuevaParada}
            sx={{
              borderColor: yellowColor,
              color: yellowColor,
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { borderColor: yellowColor, background: alpha(yellowColor, 0.1) },
            }}
          >
            Añadir parada a esta ruta
          </Button>
        </Box>
      )}

      {/* ── Contenido de paradas ── */}
      <Fade in>
        <Box>
          {loadingParadas || loadingRutas ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress sx={{ color: yellowColor, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={700}>
                Cargando paradas...
              </Typography>
            </Box>
          ) : !rutaSeleccionadaId ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
              <PlaceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={800}>
                No hay ninguna ruta seleccionada
              </Typography>
              <Typography color="text.secondary">
                Por favor, selecciona una ruta de la lista para ver o gestionar sus paradas.
              </Typography>
            </Paper>
          ) : paradasFiltradas.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
              <PlaceIcon sx={{ fontSize: 64, color: yellowColor, mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {searchTerm ? 'No se encontraron paradas con esa búsqueda' : 'Esta ruta aún no tiene paradas registradas'}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm
                  ? 'Intenta con otro término de búsqueda'
                  : 'Crea los puntos de parada para que los padres y alumnos puedan asignarse con precisión.'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNuevaParada}
                  sx={{
                    background: yellowColor,
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 800,
                    borderRadius: '12px',
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                  }}
                >
                  Crear primera parada
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={2}>
              {paradasFiltradas.map((parada, index) => (
                <Card
                  key={parada.id}
                  sx={{
                    borderRadius: '18px',
                    border: `1px solid ${alpha(yellowColor, 0.18)}`,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(yellowColor, 0.03)} 0%, ${alpha('#000', 0.25)} 100%)`
                      : `linear-gradient(135deg, ${alpha(yellowColor, 0.02)} 0%, ${alpha('#fff', 0.95)} 100%)`,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: yellowColor,
                      boxShadow: `0 8px 24px ${alpha(yellowColor, 0.15)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      {/* Izquierda: badge orden + datos de la parada */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 260 }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            background: alpha(yellowColor, 0.15),
                            border: `1.5px solid ${alpha(yellowColor, 0.4)}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" fontWeight={900} color={yellowColor} sx={{ lineHeight: 1 }}>
                            #{parada.orden}
                          </Typography>
                          <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                            Parada
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={800}>
                              {parada.nombre}
                            </Typography>
                            {!parada.activo && (
                              <Chip label="Inactiva" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            {parada.direccion && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 15, color: yellowColor }} />
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {parada.direccion}
                                </Typography>
                              </Box>
                            )}

                            {parada.referencia && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                Ref: {parada.referencia}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Centro: Horarios y estudiantes */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {(parada.hora_estimada_ida || parada.hora_estimada_retorno) && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: '12px',
                              background: alpha(theme.palette.background.paper, 0.6),
                              border: `1px solid ${borderField}`,
                            }}
                          >
                            {parada.hora_estimada_ida && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ScheduleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                <Typography variant="caption" fontWeight={700}>
                                  Ida: {parada.hora_estimada_ida}
                                </Typography>
                              </Box>
                            )}
                            {parada.hora_estimada_retorno && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ScheduleIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                                <Typography variant="caption" fontWeight={700}>
                                  Retorno: {parada.hora_estimada_retorno}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {parada.estudiantes_en_parada !== undefined && (
                          <Chip
                            icon={<PersonIcon sx={{ fontSize: '15px !important' }} />}
                            label={`${parada.estudiantes_en_parada} alumno${parada.estudiantes_en_parada !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              background: alpha('#3b82f6', 0.12),
                              color: '#3b82f6',
                            }}
                          />
                        )}
                      </Box>

                      {/* Derecha: Acciones y reordenamiento */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Botones mover orden */}
                        <Tooltip title="Mover hacia arriba" arrow>
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => handleMoverOrden(index, 'arriba')}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                background: alpha(theme.palette.background.paper, 0.8),
                                '&:hover': { background: alpha(yellowColor, 0.2) },
                              }}
                            >
                              <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Mover hacia abajo" arrow>
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === paradasFiltradas.length - 1}
                              onClick={() => handleMoverOrden(index, 'abajo')}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                background: alpha(theme.palette.background.paper, 0.8),
                                '&:hover': { background: alpha(yellowColor, 0.2) },
                              }}
                            >
                              <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {/* Editar */}
                        <Tooltip title="Editar parada" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditarParada(parada)}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: alpha(yellowColor, 0.12),
                              color: yellowColor,
                              '&:hover': { background: alpha(yellowColor, 0.25), transform: 'scale(1.08)' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Eliminar */}
                        <Tooltip title="Eliminar parada" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEliminarParada(parada)}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: alpha('#ef4444', 0.12),
                              color: '#ef4444',
                              '&:hover': { background: alpha('#ef4444', 0.25), transform: 'scale(1.08)' },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Fade>

      {/* ── Dialog Crear / Editar Parada ── */}
      <Dialog
        open={openDialog}
        onClose={() => !guardando && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            position: 'relative',
            borderBottom: `1px solid ${borderField}`,
            background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brand, 0.85),
                  mb: 0.4,
                }}
              >
                Ruta: {rutaActual?.nombre}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                {modoEdicion ? 'Editar Parada' : 'Nueva Parada'}
              </Typography>
            </Box>

            <Box
              onClick={() => !guardando && setOpenDialog(false)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                cursor: guardando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                '&:hover': guardando ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Formulario */}
        <DialogContent sx={{ px: 3, py: 2.75 }}>
          <Stack spacing={2.25}>
            {/* Estado activa */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                background: (formData.activo ?? true) ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                border: `1px solid ${(formData.activo ?? true) ? alpha('#10b981', 0.3) : alpha('#ef4444', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" fontWeight={800}>
                Estado: {(formData.activo ?? true) ? 'Parada Activa' : 'Parada Inactiva'}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo ?? true}
                    onChange={(e) => handleChange({ target: { name: 'activo', value: e.target.checked } } as any)}
                    color="success"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre de la parada"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Av. Principal y Calle 5"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceIcon sx={{ color: brand, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Orden de parada"
                  name="orden"
                  type="number"
                  value={formData.orden}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Esquina de la farmacia..."
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Referencia adicional"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  placeholder="Ej: Frente al parque central"
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hora estimada de ida"
                  name="hora_estimada_ida"
                  type="time"
                  value={formData.hora_estimada_ida}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon sx={{ color: '#10b981', fontSize: 16 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hora estimada de retorno"
                  name="hora_estimada_retorno"
                  type="time"
                  value={formData.hora_estimada_retorno}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon sx={{ color: '#ef4444', fontSize: 16 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={guardando}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={guardando}
            startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
              textTransform: 'none',
              background: brand,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            }}
          >
            {guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear parada'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default GestionParadas;
