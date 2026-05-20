// components/ingresos/GestionTiposIngreso.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Switch,
  FormControlLabel,
  InputAdornment,
  Zoom,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  Palette as PaletteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useIngresos } from '@/hooks/Useingresos';
import ingresosService from '@/services/ingresos';
import type { TipoIngreso, CrearTipoIngresoRequest, ActualizarTipoIngresoRequest } from '@/types/ingresos';
import { keyframes } from '@mui/system';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const GestionTiposIngreso: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const {
    tipos,
    loadingTipos,
    cargarTipos,
    crearTipo,
    actualizarTipo,
  } = useIngresos({
    autoLoad: true,
    loadTipos: true,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoIngreso | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CrearTipoIngresoRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'otros',
    requiere_estudiante: false,
    activo: true,
    color: '#f59e0b',
    orden: 0,
  });

  const yellowColor = isDark ? '#facc15' : '#f59e0b';
  const greenColor = '#10b981';
  const blueColor = '#3b82f6';
  const redColor = '#ef4444';

  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: 'otros',
      requiere_estudiante: false,
      activo: true,
      color: '#f59e0b',
      orden: 0,
    });
    setModoEdicion(false);
    setTipoSeleccionado(null);
  };

  const handleNuevoTipo = () => {
    limpiarFormulario();
    setOpenDialog(true);
  };

  const handleEditarTipo = (tipo: TipoIngreso) => {
    setTipoSeleccionado(tipo);
    setFormData({
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      categoria: tipo.categoria,
      requiere_estudiante: tipo.requiere_estudiante,
      activo: tipo.activo,
      color: tipo.color || '#f59e0b',
      orden: tipo.orden || 0,
    });
    setModoEdicion(true);
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'orden' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (modoEdicion && tipoSeleccionado) {
        // Para actualización, incluimos la categoría
        const updateData: any = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          requiere_estudiante: formData.requiere_estudiante,
          activo: formData.activo,
          color: formData.color,
          orden: formData.orden,
        };
        await actualizarTipo(tipoSeleccionado.id, updateData);
        alert('Tipo de ingreso actualizado exitosamente');
      } else {
        await crearTipo(formData);
        alert('Tipo de ingreso creado exitosamente');
      }
      setOpenDialog(false);
      limpiarFormulario();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el tipo de ingreso');
    }
  };

  // Filtrar tipos según búsqueda
  const tiposFiltrados = tipos.filter((tipo) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tipo.codigo.toLowerCase().includes(searchLower) ||
      tipo.nombre.toLowerCase().includes(searchLower) ||
      (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower)) ||
      ingresosService.getCategoriaIngresoLabel(tipo.categoria).toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      {/* Header con búsqueda */}
      <Card
        sx={{
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.2)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.03)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.3)}`,
          borderRadius: '20px',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Partícula decorativa */}
        <Box
          sx={{
            position: 'absolute',
            right: -50,
            top: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(yellowColor, 0.2)} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  boxShadow: `0 8px 24px ${alpha(yellowColor, 0.4)}`,
                  color: '#000',
                }}
              >
                <CategoryIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Tipos de Ingreso
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Gestiona las categorías de ingresos del sistema
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar tipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNuevoTipo}
                sx={{
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
                  textTransform: 'none',
                  '&:hover': {
                    background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(yellowColor, 0.4)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Nuevo Tipo
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de tipos con diseño mejorado */}
      <Fade in timeout={600}>
        <Card
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `0 4px 24px ${alpha(yellowColor, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.08)} 100%)`
                      : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Estudiante</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTipos ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: `3px solid ${alpha(yellowColor, 0.3)}`,
                            borderTopColor: yellowColor,
                            animation: `${rotate} 1s linear infinite`,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Cargando tipos de ingreso...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : tiposFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 8 }}>
                        <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          {searchTerm ? 'No se encontraron resultados' : 'No hay tipos de ingreso configurados'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando un nuevo tipo de ingreso'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tiposFiltrados.map((tipo, index) => (
                    <Zoom in timeout={300 + index * 50} key={tipo.id}>
                      <TableRow
                        hover
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(yellowColor, 0.04),
                            transform: 'scale(1.01)',
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={tipo.codigo}
                            size="small"
                            sx={{
                              backgroundColor: alpha(tipo.color || yellowColor, 0.15),
                              color: tipo.color || yellowColor,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              border: `1px solid ${alpha(tipo.color || yellowColor, 0.3)}`,
                              fontFamily: 'monospace',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                              {tipo.nombre}
                            </Typography>
                            {tipo.descripcion && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {tipo.descripcion}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const categoria = tipo.categoria ?? 'otros';
                            let color = ingresosService.getCategoriaColor(categoria);
                            if (!color || typeof color !== 'string' || !color.startsWith('#')) {
                              color = '#6b7280';
                            }
                            return (
                              <Chip
                                label={ingresosService.getCategoriaIngresoLabel(categoria)}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(color, 0.15),
                                  color: color,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  borderRadius: '8px',
                                  border: `1px solid ${alpha(color, 0.3)}`,
                                }}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={tipo.requiere_estudiante ? <CheckIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                            label={tipo.requiere_estudiante ? 'Sí' : 'No'}
                            size="small"
                            sx={{
                              backgroundColor: tipo.requiere_estudiante ? alpha(blueColor, 0.15) : alpha('#6b7280', 0.1),
                              color: tipo.requiere_estudiante ? blueColor : 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              border: `1px solid ${tipo.requiere_estudiante ? alpha(blueColor, 0.3) : alpha('#6b7280', 0.2)}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tipo.activo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={{
                              backgroundColor: tipo.activo ? alpha(greenColor, 0.15) : alpha(redColor, 0.1),
                              color: tipo.activo ? greenColor : redColor,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              border: `1px solid ${tipo.activo ? alpha(greenColor, 0.3) : alpha(redColor, 0.3)}`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar tipo" arrow placement="left">
                            <IconButton
                              size="small"
                              onClick={() => handleEditarTipo(tipo)}
                              sx={{
                                color: yellowColor,
                                backgroundColor: alpha(yellowColor, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(yellowColor, 0.2),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <EditIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Zoom>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>

      {/* Dialog de creación/edición mejorado */}
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
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 800,
            fontSize: '1.5rem',
            py: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha('#000', 0.2),
                }}
              >
                <CategoryIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                {modoEdicion ? 'Editar Tipo de Ingreso' : 'Nuevo Tipo de Ingreso'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setOpenDialog(false);
                limpiarFormulario();
              }}
              sx={{ color: '#000' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            {/* Código */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                disabled={modoEdicion}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
                helperText={modoEdicion ? 'El código no puede ser modificado' : 'Código único del tipo'}
              />
            </Grid>

            {/* Nombre */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LabelIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* Categoría - ACTUALIZADO CON LOS VALORES DE LA BD */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Categoría"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="academico">📚 Académico</MenuItem>
                <MenuItem value="transporte">🚌 Transporte</MenuItem>
                <MenuItem value="productos">🛍️ Productos</MenuItem>
                <MenuItem value="eventos">🎉 Eventos</MenuItem>
                <MenuItem value="donaciones">💝 Donaciones</MenuItem>
                <MenuItem value="servicios">⚙️ Servicios</MenuItem>
                <MenuItem value="vacacional">🏖️ Vacacional</MenuItem>
                <MenuItem value="otros">📦 Otros</MenuItem>
              </TextField>
            </Grid>

            {/* Color */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaletteIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                  '& input[type="color"]': {
                    height: 40,
                    cursor: 'pointer',
                  },
                }}
              />
            </Grid>

            {/* Orden */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Orden de visualización"
                name="orden"
                type="number"
                value={formData.orden}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
                helperText="Orden en listados (menor a mayor)"
              />
            </Grid>

            {/* Switches */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiere_estudiante}
                      onChange={handleChange}
                      name="requiere_estudiante"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: blueColor,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: blueColor,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      Requiere Estudiante
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={handleChange}
                      name="activo"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: greenColor,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: greenColor,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      Estado Activo
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Button
            onClick={() => {
              setOpenDialog(false);
              limpiarFormulario();
            }}
            sx={{
              borderRadius: '12px',
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 700,
              borderRadius: '12px',
              px: 4,
              boxShadow: `0 4px 12px ${alpha(yellowColor, 0.3)}`,
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(yellowColor, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {modoEdicion ? '✓ Actualizar' : '+ Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionTiposIngreso;