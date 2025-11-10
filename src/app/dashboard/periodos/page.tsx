'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Fade,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Divider,
  Badge,
  Stack,
  CardActionArea
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_URL = 'http://localhost:3000/api/periodos';
// Tipos
interface Periodo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  estudiantes?: number;
  docentes?: number;
  materias?: number;
}

const Periodos: React.FC = () => {
  const theme = useTheme();
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false
  });
  useEffect(() => {
    fetchPeriodos();
  }, []);

  const fetchPeriodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setPeriodos(data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al cargar periodos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
const handleSave = async () => {
  if (!formData.nombre || !formData.fecha_inicio || !formData.fecha_fin) {
    setSnackbar({ 
      open: true, 
      message: '⚠️ Completa todos los campos obligatorios', 
      severity: 'error' 
    });
    return;
  }

  // Validar que la fecha de fin sea posterior a la de inicio
  const startDate = new Date(formData.fecha_inicio);
  const endDate = new Date(formData.fecha_fin);
  
  if (endDate <= startDate) {
    setSnackbar({ 
      open: true, 
      message: '📅 La fecha de fin debe ser posterior a la fecha de inicio', 
      severity: 'error' 
    });
    return;
  }

  // Validar que el nombre no esté vacío o solo espacios
  if (formData.nombre.trim().length === 0) {
    setSnackbar({ 
      open: true, 
      message: '✏️ El nombre del periodo no puede estar vacío', 
      severity: 'error' 
    });
    return;
  }

  try {
    const method = editingPeriodo ? "PUT" : "POST";
    const url = editingPeriodo ? `${API_URL}/${editingPeriodo.id}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al guardar periodo");
    }

    await fetchPeriodos();
    setSnackbar({ 
      open: true, 
      message: editingPeriodo ? '✨ Periodo actualizado exitosamente' : '🎉 Periodo creado exitosamente', 
      severity: 'success' 
    });
    handleCloseDialog();
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    setSnackbar({ 
      open: true, 
      message: `❌ ${message}`, 
      severity: 'error' 
    });
  }
};
  const handleOpenDialog = (periodo: Periodo | null = null) => {
    if (periodo) {
      setEditingPeriodo(periodo);
      setFormData({
        nombre: periodo.nombre,
        fecha_inicio: periodo.fecha_inicio,
        fecha_fin: periodo.fecha_fin,
        activo: periodo.activo
      });
    } else {
      setEditingPeriodo(null);
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', activo: false });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriodo(null);
  };
  const handleDelete = async (id: number) => {
  const periodo = periodos.find(p => p.id === id);
  
  // Crear diálogo de confirmación personalizado
  const confirmDelete = window.confirm(
    `¿Estás seguro de eliminar el periodo "${periodo?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`
  );
  
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar periodo");
    await fetchPeriodos();
    setSnackbar({ 
      open: true, 
      message: '🗑️ Periodo eliminado exitosamente', 
      severity: 'info' 
    });
  } catch (err) {
    console.error(err);
    setSnackbar({ 
      open: true, 
      message: '❌ No se pudo eliminar el periodo', 
      severity: 'error' 
    });
  }
};

  const handleToggleActive = async (id: number) => {
  const periodo = periodos.find(p => p.id === id);
  if (!periodo) return;

  try {
    const newActiveState = !periodo.activo;
    
    // Si se está activando este periodo, desactivar todos los demás primero
    if (newActiveState) {
      const updatePromises = periodos
        .filter(p => p.activo && p.id !== id)
        .map(p => 
          fetch(`${API_URL}/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...p, activo: false })
          })
        );
      
      await Promise.all(updatePromises);
    }

    // Actualizar el periodo seleccionado
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...periodo, activo: newActiveState })
    });

    await fetchPeriodos();
    
    setSnackbar({ 
      open: true, 
      message: newActiveState ? '✅ Periodo activado exitosamente' : '⏸️ Periodo desactivado', 
      severity: 'success' 
    });
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: 'Error al actualizar estado', severity: 'error' });
  }
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (fecha_fin: string) => {
    const today = new Date();
    const endDate = new Date(fecha_fin + 'T00:00:00');
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgress = (fecha_inicio: string, fecha_fin: string) => {
    const today = new Date();
    const start = new Date(fecha_inicio + 'T00:00:00');
    const end = new Date(fecha_fin + 'T00:00:00');
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const activePeriodo = periodos.find(p => p.activo);
  const totalEstudiantes = periodos.reduce((sum, p) => sum + (p.estudiantes || 0), 0);
  const totalDocentes = periodos.reduce((sum, p) => sum + (p.docentes || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Animado con Gradiente */}
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

          {/* Cards de Estadísticas Rápidas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Periodo Activo */}
            <Grid size={{xs:12, md:6, lg:4}}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                  border: `2px solid ${theme.palette.success.main}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.3)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 'bold', letterSpacing: 1 }}>
                        🎯 Periodo Activo
                      </Typography>
                      <Typography variant="h5" fontWeight="700" sx={{ mt: 1, mb: 0.5 }}>
                        {activePeriodo?.nombre || 'Sin periodo activo'}
                      </Typography>
                      {activePeriodo && (
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(activePeriodo.fecha_inicio)} - {formatDate(activePeriodo.fecha_fin)}
                        </Typography>
                      )}
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'success.main', 
                      width: 56, 
                      height: 56,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  
                  {activePeriodo && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="600">
                            Progreso del periodo
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="700">
                            {getProgress(activePeriodo.fecha_inicio, activePeriodo.fecha_fin).toFixed(0)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgress(activePeriodo.fecha_inicio, activePeriodo.fecha_fin)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          <AccessTimeIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          {getDaysRemaining(activePeriodo.fecha_fin)} días restantes
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Total Estudiantes */}
            <Grid size={{xs:12, sm:6, lg:4}}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                }}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 64, 
                        height: 64,
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                      }}>
                        <GroupsIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight="600">
                          Total Estudiantes
                        </Typography>
                        <Typography variant="h3" fontWeight="800" color="primary.main">
                          {activePeriodo?.estudiantes || 0}
                        </Typography>
                        <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <TrendingUpIcon sx={{ fontSize: 16 }} />
                          +8% vs periodo anterior
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Total Docentes */}
            <Grid size={{xs:12, sm:6, lg:4}}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 16px 32px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  }
                }}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'secondary.main', 
                        width: 64, 
                        height: 64,
                        boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                      }}>
                        <SchoolIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight="600">
                          Docentes Activos
                        </Typography>
                        <Typography variant="h3" fontWeight="800" color="secondary.main">
                          {activePeriodo?.docentes || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {activePeriodo?.materias || 0} materias asignadas
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Tabla Mejorada */}
      <Fade in timeout={800}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteIcon />
              Historial de Periodos
              <Chip 
                label={`${periodos.length} registros`} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Visualiza y gestiona todos los periodos académicos
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08)
                }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Periodo Académico</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Fechas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Participantes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periodos.map((periodo, index) => (
                  <TableRow 
                    key={periodo.id}
                    sx={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                      '@keyframes slideIn': {
                        from: {
                          opacity: 0,
                          transform: 'translateX(-30px)'
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'scale(1.01)',
                        boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {periodo.activo && (
                          <Badge 
                            badgeContent="ACTIVO" 
                            color="success"
                            sx={{
                              '& .MuiBadge-badge': {
                                animation: 'blink 2s ease-in-out infinite',
                                '@keyframes blink': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.6 }
                                }
                              }
                            }}
                          >
                            <CalendarMonthIcon color="primary" />
                          </Badge>
                        )}
                        {!periodo.activo && <CalendarMonthIcon color="disabled" />}
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {periodo.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{periodo.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          📅 {formatDate(periodo.fecha_inicio)}
                        </Typography>
                        <Typography variant="body2">
                          🏁 {formatDate(periodo.fecha_fin)}
                        </Typography>
                        {periodo.activo && (
                          <Chip 
                            label={`${getDaysRemaining(periodo.fecha_fin)} días restantes`}
                            size="small"
                            color={getDaysRemaining(periodo.fecha_fin) < 30 ? 'warning' : 'info'}
                            icon={getDaysRemaining(periodo.fecha_fin) < 30 ? <WarningAmberIcon /> : <AccessTimeIcon />}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Estudiantes">
                          <Chip 
                            icon={<GroupsIcon />}
                            label={periodo.estudiantes || 0}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Tooltip>
                        <Tooltip title="Docentes">
                          <Chip 
                            icon={<SchoolIcon />}
                            label={periodo.docentes || 0}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={periodo.activo ? "Desactivar periodo" : "Activar periodo"}>
                        <Chip
                          icon={periodo.activo ? <CheckCircleIcon /> : <CancelIcon />}
                          label={periodo.activo ? 'Activo' : 'Inactivo'}
                          color={periodo.activo ? 'success' : 'default'}
                          onClick={() => handleToggleActive(periodo.id)}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.15)',
                              boxShadow: 3,
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Editar periodo">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(periodo)}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                transform: 'rotate(15deg) scale(1.2)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar periodo">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(periodo.id)}
                            disabled={periodo.activo}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover:not(:disabled)': {
                                bgcolor: theme.palette.error.main,
                                color: 'white',
                                transform: 'scale(1.2)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>

      {/* Dialog Mejorado */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: editingPeriodo ? 'warning.main' : 'success.main',
              width: 48,
              height: 48
            }}>
              {editingPeriodo ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800">
                {editingPeriodo ? '✏️ Editar Periodo' : '➕ Nuevo Periodo Académico'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingPeriodo ? 'Modifica la información del periodo' : 'Crea un nuevo ciclo educativo'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Nombre del Periodo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Gestión 2025 - Primer Semestre"
                variant="outlined"
                InputProps={{
                  startAdornment: <EventNoteIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid size={{xs:12, md:6}} >
              <TextField
                fullWidth
                type="date"
                label="Fecha de Inicio"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value }
                    )}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Fin"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid size={{xs:12}} >
              <Card sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px dashed ${theme.palette.info.main}`,
                borderRadius: 2
              }}>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        color="primary"
                        size="medium"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          Establecer como periodo activo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ⚠️ Solo puede haber un periodo activo. Los demás se desactivarán automáticamente.
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
            
            {/* Información adicional */}
            <Grid size={{xs:12}}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💡 <strong>Tip:</strong> Asegúrate de que las fechas no se solapen con otros periodos activos para evitar conflictos en el sistema.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            size="large"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            size="large"
            startIcon={editingPeriodo ? <EditIcon /> : <AddIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
              }
            }}
          >
            {editingPeriodo ? 'Actualizar Periodo' : 'Crear Periodo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Mejorado */}
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
          icon={
            snackbar.severity === 'success' ? <CheckCircleIcon /> :
            snackbar.severity === 'error' ? <CancelIcon /> :
            <EventNoteIcon />
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Periodos;