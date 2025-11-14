'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Grid,
  Fade,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Paper,
  Badge,
  LinearProgress,
  Collapse,
  CircularProgress,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = "http://localhost:3000/api";
interface Nivel {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface Turno {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Paralelo {
  id: number;
  grado_id: number;
  nombre: string;
  turno_id: number;
  capacidad_maxima: number;
  anio: number;
}
interface ParaleloConEstudiantes extends Paralelo {
  total_estudiantes: number;
}
interface ParaleloConExtras extends Paralelo {
  total_estudiantes: number; // para el chip
  turno_nombre: string;      // para mostrar nombre del turno
  hora_inicio?: string;      // opcional
  hora_fin?: string;         // opcional
}
const Paralelos = () => {
  const theme = useTheme();
  
  // Estados principales
   const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [expandedGrado, setExpandedGrado] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [editingParalelo, setEditingParalelo] = useState<{
    grado_id: number;
    paralelo: Paralelo | null;
  }>({
    grado_id: 0,
    paralelo: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const [formData, setFormData] = useState<Paralelo>({
    id: 0,
    nombre: '',
    grado_id: 0,
    turno_id: 0,
    capacidad_maxima: 30,
    anio: new Date().getFullYear()
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paralelosRes, nivelesRes, gradosRes, turnosRes, estadisticasRes] = await Promise.all([
        fetch(`${API_URL}/paralelos`),
        fetch(`${API_URL}/niveles-academicos`),
        fetch(`${API_URL}/grados`),
        fetch(`${API_URL}/turnos`),
        fetch(`${API_URL}/paralelos/estadisticas`)
      ]);

      const paralelosData = await paralelosRes.json();
      const nivelesData = await nivelesRes.json();
      const gradosData = await gradosRes.json();
      const turnosData = await turnosRes.json();
      const estadisticasData = await estadisticasRes.json();

      setParalelos(paralelosData);
      setNiveles(nivelesData);
      setGrados(gradosData);
      setTurnos(turnosData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSnackbar({
        open: true,
        message: '❌ Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleOpenDialog = (grado_id: number, paralelo: Paralelo | null = null) => {
    if (paralelo) {
      setEditingParalelo({ grado_id, paralelo });
      setFormData(paralelo);
    } else {
      setEditingParalelo({ grado_id, paralelo: null });
      setFormData({
        id: 0,
        nombre: '',
        grado_id,
        turno_id: 0,
        capacidad_maxima: 30,
        anio: new Date().getFullYear()
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.grado_id || !formData.turno_id) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa todos los campos requeridos', 
        severity: 'error' 
      });
      return;
    }

    try {
      if (editingParalelo.paralelo) {
        // Actualizar
        const response = await fetch(`${API_URL}/paralelos/${editingParalelo.paralelo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Error al actualizar');
        
        setSnackbar({ 
          open: true, 
          message: '✨ Paralelo actualizado exitosamente', 
          severity: 'success' 
        });
      } else {
        // Crear
        const response = await fetch(`${API_URL}/paralelos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Error al crear');
        
        setSnackbar({ 
          open: true, 
          message: '🎉 Paralelo creado exitosamente', 
          severity: 'success' 
        });
      }

      setOpenDialog(false);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error guardando paralelo:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Error al guardar el paralelo', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm('¿Estás seguro de eliminar este paralelo?')) return;

  try {
    const response = await fetch(`${API_URL}/paralelos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar');

    setSnackbar({ 
      open: true, 
      message: '🗑️ Paralelo eliminado', 
      severity: 'info' 
    });
    loadData();
  } catch (error) {
    console.error('Error eliminando paralelo:', error);
    setSnackbar({ 
      open: true, 
      message: '❌ Error al eliminar el paralelo', 
      severity: 'error' 
    });
  }
};


  // Organizar datos por grado
type GradoConParalelos = Grado & {
  paralelos: ParaleloConExtras[];
  nivel?: Nivel;
};
const paralelosConExtras: ParaleloConExtras[] = paralelos.map(p => {
  const turno = turnos.find(t => t.id === p.turno_id);
  return {
    ...p,
    total_estudiantes: Math.floor(Math.random() * 30) + 5, // valor estático
    turno_nombre: turno?.nombre || 'Desconocido',
    hora_inicio: turno?.hora_inicio,
    hora_fin: turno?.hora_fin
  };
});
const gradosConParalelos: GradoConParalelos[] = grados.map(grado => ({
  ...grado,
  paralelos: paralelosConExtras.filter(p => p.grado_id === grado.id),
  nivel: niveles.find(n => n.id === grado.nivel_academico_id)
}));

  const paralelosConEstudiantes: ParaleloConEstudiantes[] = paralelos.map(p => ({
  ...p,
  total_estudiantes: Math.floor(Math.random() * 30) + 5 // valor entre 5 y 34
}));
  const gradosFiltrados = selectedNivel
    ? gradosConParalelos.filter(g => g.nivel_academico_id === selectedNivel)
    : gradosConParalelos;


  // Obtener colores e íconos para niveles
  const getNivelColor = (orden:number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'];
    return colors[orden % colors.length] || '#95E1D3';
  };

  const getNivelIcon = (orden:number) => {
    const icons = ['🎨', '📚', '🔬', '🎓', '🏆', '🌟'];
    return icons[orden % icons.length] || '📖';
  };

  const getTurnoColor = (turnoNombre:string):string => {
    if (!turnoNombre) return theme.palette.grey[500];
    if (turnoNombre.toLowerCase().includes('mañana')) return '#FFD93D';
    if (turnoNombre.toLowerCase().includes('tarde')) return '#FF9A3C';
    if (turnoNombre.toLowerCase().includes('noche')) return '#6C5CE7';
    return theme.palette.grey[500];
  };

   const getTurnoIcon  = (turnoNombre: string): string => {
    if (!turnoNombre) return '⏰';
    if (turnoNombre.toLowerCase().includes('mañana')) return '☀️';
    if (turnoNombre.toLowerCase().includes('tarde')) return '🌤️';
    if (turnoNombre.toLowerCase().includes('noche')) return '🌙';
    return '⏰';
  };

  const letrasParalelos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando datos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Premium */}
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
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <PeopleAltIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Paralelos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Organiza las secciones de cada grado académico
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Cards de Estadísticas */}
          {estadisticas && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{xs:12, sm:6, md:3}}>
                <Card sx={{
                  background: `linear-gradient(135deg, ${alpha('#4ECDC4', 0.15)} 0%, ${alpha('#4ECDC4', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#4ECDC4', 0.3)}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha('#4ECDC4', 0.3)}`,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: '#4ECDC4',
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha('#4ECDC4', 0.4)}`
                      }}>
                        <ClassIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight="600" color="text.secondary">
                          Total Paralelos
                        </Typography>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#4ECDC4' }}>
                          {estadisticas.total_paralelos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          En {grados.length} grados
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}} >
                <Card sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                      }}>
                        <GroupsIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight="600" color="text.secondary">
                          Total Estudiantes
                        </Typography>
                        <Typography variant="h3" fontWeight="800" color="primary.main">
                          {estadisticas.total_estudiantes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Inscritos actualmente
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}} >
                <Card sx={{
                  background: `linear-gradient(135deg, ${alpha('#FF6B6B', 0.15)} 0%, ${alpha('#FF6B6B', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#FF6B6B', 0.3)}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha('#FF6B6B', 0.3)}`,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: '#FF6B6B',
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha('#FF6B6B', 0.4)}`
                      }}>
                        <PersonIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight="600" color="text.secondary">
                          Promedio/Paralelo
                        </Typography>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                          {estadisticas.promedio_estudiantes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estudiantes por sección
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}}>
                <Card sx={{
                  background: `linear-gradient(135deg, ${alpha('#95E1D3', 0.15)} 0%, ${alpha('#95E1D3', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#95E1D3', 0.3)}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha('#95E1D3', 0.3)}`,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: '#95E1D3',
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha('#95E1D3', 0.4)}`
                      }}>
                        <WarningAmberIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight="600" color="text.secondary">
                          Paralelos Llenos
                        </Typography>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#95E1D3' }}>
                          {estadisticas.paralelos_llenos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Capacidad completa
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filtro por Nivel */}
          <Card sx={{
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: alpha(theme.palette.primary.main, 0.03)
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterListIcon color="primary" />
                <Typography variant="body1" fontWeight="600">
                  Filtrar por Nivel:
                </Typography>
                <Chip
                  label="Todos"
                  onClick={() => setSelectedNivel(null)}
                  color={selectedNivel === null ? 'primary' : 'default'}
                  sx={{
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
                {niveles.map((nivel) => {
                  const color = getNivelColor(nivel.orden);
                  const icon = getNivelIcon(nivel.orden);
                  return (
                    <Chip
                      key={nivel.id}
                      icon={<span>{icon}</span>}
                      label={nivel.nombre}
                      onClick={() => setSelectedNivel(nivel.id)}
                      sx={{
                        bgcolor: selectedNivel === nivel.id ? color : alpha(color, 0.1),
                        color: selectedNivel === nivel.id ? 'white' : color,
                        fontWeight: 'bold',
                        border: `2px solid ${color}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: color,
                          color: 'white',
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Grados con Paralelos */}
      <Grid container spacing={3}>
        {gradosFiltrados.map((grado,index) => {
          const isExpanded = expandedGrado === grado.id;
          const nivel = grado.nivel;
          const nivelColor = getNivelColor(nivel?.orden ?? 0);
          const nivelIcon = getNivelIcon(nivel?.orden ?? 0);
          return (
            <Grid size={{xs:12}} key={grado.id}>
              <Fade in timeout={800 + index * 100}>
                <Card sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isExpanded
                    ? `0 16px 48px ${alpha(nivelColor, 0.25)}`
                    : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  border: isExpanded
                    ? `2px solid ${nivelColor}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${alpha(nivelColor, 0.2)}`,
                  }
                }}>
                  {/* Header del Grado */}
                  <Box
                    onClick={() => setExpandedGrado(isExpanded ? null : grado.id)}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      background: isExpanded
                        ? `linear-gradient(135deg, ${alpha(nivelColor, 0.15)} 0%, ${alpha(nivelColor, 0.05)} 100%)`
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(nivelColor, 0.1)} 0%, ${alpha(nivelColor, 0.03)} 100%)`,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{
                          width: 56,
                          height: 56,
                          bgcolor: nivelColor,
                          fontSize: '1.8rem',
                          boxShadow: `0 8px 16px ${alpha(nivelColor, 0.4)}`,
                          transition: 'all 0.3s ease',
                          transform: isExpanded ? 'scale(1.1)' : 'none'
                        }}>
                          {nivelIcon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h5" fontWeight="700">
                              {grado.nombre}
                            </Typography>
                            <Chip
                              label={nivel?.nombre ?? 'Sin nivel'}
                              size="small"
                              sx={{
                                bgcolor: alpha(nivelColor, 0.2),
                                color: nivelColor,
                                fontWeight: 'bold'
                              }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Badge
                              badgeContent={grado.paralelos.length}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }
                              }}
                            >
                              <Chip
                                icon={<ClassIcon />}
                                label="Paralelos"
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: nivelColor }}
                              />
                            </Badge>
                            <Chip
                              icon={<GroupsIcon />}
                               label={`${grado.paralelos.reduce((sum, p) => sum + (p.total_estudiantes || 0), 0)} estudiantes`}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: nivelColor }}
                            />
                          </Stack>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Agregar paralelo">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(grado.id);
                            }}
                            sx={{
                              bgcolor: alpha(nivelColor, 0.1),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: nivelColor,
                                color: 'white',
                                transform: 'rotate(90deg) scale(1.2)',
                              }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          sx={{
                            transition: 'all 0.3s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'none'
                          }}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>

                  {/* Paralelos */}
                  <Collapse in={isExpanded} timeout={500}>
                    <Divider />
                    <Box sx={{ p: 3, bgcolor: alpha(nivelColor, 0.02) }}>
                      {grado.paralelos.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.warning.main, 0.05),
                            border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                            borderRadius: 2
                          }}
                        >
                          <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay paralelos registrados
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Comienza agregando paralelos (A, B, C) a este grado
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog(grado.id)}
                            sx={{
                              bgcolor: nivelColor,
                              '&:hover': { bgcolor: nivelColor, filter: 'brightness(0.9)' }
                            }}
                          >
                            Agregar Primer Paralelo
                          </Button>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {grado.paralelos.map((paralelo, paraleloIndex) => {
                            const totalEstudiantes = paralelo.total_estudiantes || 0;
                            const capacidad = (totalEstudiantes / paralelo.capacidad_maxima) * 100;
                            const isLleno = capacidad >= 90;

                            return (
                              <Grid size={{xs:12, sm:6, md:4}}  key={paralelo.id}>
                                <Card
                                  sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    border: `2px solid ${isLleno ? '#FF6B6B' : alpha(nivelColor, 0.3)}`,
                                    background: `linear-gradient(135deg, ${alpha(nivelColor, 0.05)} 0%, ${alpha(nivelColor, 0.02)} 100%)`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: `fadeInScale 0.5s ease ${paraleloIndex * 0.08}s both`,
                                    '@keyframes fadeInScale': {
                                      from: {
                                        opacity: 0,
                                        transform: 'scale(0.9)'
                                      },
                                      to: {
                                        opacity: 1,
                                        transform: 'scale(1)'
                                      }
                                    },
                                    '&:hover': {
                                      transform: 'translateY(-12px) scale(1.03)',
                                      boxShadow: `0 16px 32px ${alpha(nivelColor, 0.3)}`,
                                      borderColor: nivelColor,
                                    }
                                  }}
                                >
                                  <CardContent sx={{ p: 3 }}>
                                    {/* Header del Paralelo */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Avatar
                                            sx={{
                                              width: 48,
                                              height: 48,
                                              bgcolor: nivelColor,
                                              fontSize: '1.5rem',
                                              fontWeight: 'bold',
                                              boxShadow: `0 4px 12px ${alpha(nivelColor, 0.4)}`
                                            }}
                                          >
                                            {paralelo.nombre}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="h5" fontWeight="800">
                                              Paralelo {paralelo.nombre}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {grado.nombre}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                      {isLleno && (
                                        <Tooltip title="Paralelo con capacidad máxima">
                                          <Chip
                                            icon={<WarningAmberIcon />}
                                            label="LLENO"
                                            size="small"
                                            sx={{
                                              bgcolor: alpha('#FF6B6B', 0.2),
                                              color: '#FF6B6B',
                                              fontWeight: 'bold',
                                              animation: 'pulse 2s ease-in-out infinite',
                                              '@keyframes pulse': {
                                                '0%, 100%': { opacity: 1 },
                                                '50%': { opacity: 0.7 }
                                              }
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Información del Paralelo */}
                                    <Stack spacing={2}>
                                      {/* Estudiantes */}
                                      <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <GroupsIcon sx={{ fontSize: 18 }} />
                                            Estudiantes
                                          </Typography>
                                          <Typography variant="h6" fontWeight="700" sx={{ color: nivelColor }}>
                                            {totalEstudiantes}/{paralelo.capacidad_maxima}
                                          </Typography>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={Math.min(capacidad, 100)}
                                          sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(nivelColor, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                              borderRadius: 4,
                                              bgcolor: isLleno ? '#FF6B6B' : nivelColor,
                                              transition: 'all 0.3s ease'
                                            }
                                          }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                          {capacidad.toFixed(0)}% de capacidad
                                        </Typography>
                                      </Box>

                                      {/* Turno y Horario */}
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          bgcolor: alpha(getTurnoColor(paralelo.turno_nombre), 0.1),
                                          borderRadius: 2,
                                          border: `1px solid ${alpha(getTurnoColor(paralelo.turno_nombre), 0.3)}`
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Avatar
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              bgcolor: 'transparent',
                                              fontSize: '1.5rem'
                                            }}
                                          >
                                            {getTurnoIcon(paralelo.turno_nombre)}
                                          </Avatar>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Turno
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" sx={{ color: getTurnoColor(paralelo.turno_nombre) }}>
                                              {paralelo.turno_nombre}
                                            </Typography>
                                            {paralelo.hora_inicio && paralelo.hora_fin && (
                                              <Typography variant="caption" color="text.secondary">
                                                {paralelo.hora_inicio.slice(0, 5)} - {paralelo.hora_fin.slice(0, 5)}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>

                                      {/* Año */}
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          bgcolor: alpha(nivelColor, 0.1),
                                          borderRadius: 2,
                                          border: `1px solid ${alpha(nivelColor, 0.3)}`,
                                          textAlign: 'center'
                                        }}
                                      >
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Año Académico
                                        </Typography>
                                        <Typography variant="h6" fontWeight="700" sx={{ color: nivelColor }}>
                                          {paralelo.anio}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Acciones */}
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                      <Tooltip title="Ver detalles">
                                        <IconButton
                                          size="small"
                                          sx={{
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                              bgcolor: theme.palette.info.main,
                                              color: 'white',
                                              transform: 'scale(1.2)',
                                            }
                                          }}
                                        >
                                          <AssignmentIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Editar paralelo">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleOpenDialog(grado.id, paralelo)}
                                          sx={{
                                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                              bgcolor: theme.palette.warning.main,
                                              color: 'white',
                                              transform: 'rotate(15deg) scale(1.2)',
                                            }
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Eliminar paralelo">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDelete(paralelo.id)}
                                          sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
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
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {gradosFiltrados.length === 0 && (
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              mt: 4,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
              borderRadius: 3
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="700" gutterBottom>
              {selectedNivel ? 'No hay grados en este nivel' : '¡Comienza creando grados!'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {selectedNivel
                ? 'Primero necesitas crear grados en la sección de Niveles y Grados'
                : 'Necesitas crear niveles y grados antes de poder gestionar paralelos'}
            </Typography>
            {selectedNivel && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => setSelectedNivel(null)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Ver Todos los Niveles
              </Button>
            )}
          </Paper>
        </Fade>
      )}

      {/* Dialog para Crear/Editar Paralelo */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
              bgcolor: editingParalelo.paralelo ? 'warning.main' : 'success.main',
              width: 48,
              height: 48
            }}>
              {editingParalelo.paralelo ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800">
                {editingParalelo.paralelo ? '✏️ Editar Paralelo' : '➕ Nuevo Paralelo'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {grados.find(g => g.id === formData.grado_id)?.nombre || 'Selecciona un grado'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Selector de Grado (solo al crear) */}
            {!editingParalelo.paralelo && (
              <Grid size={{xs:12}} >
                <FormControl fullWidth>
                  <InputLabel>Grado</InputLabel>
                  <Select
                    value={formData.grado_id}
                    onChange={(e) => setFormData({ ...formData, grado_id: e.target.value })}
                    label="Grado"
                    sx={{ borderRadius: 2 }}
                  >
                    {grados.map((grado) => (
                      <MenuItem key={grado.id} value={grado.id}>
                        {grado.nombre} - {niveles.find(n => n.id === grado.nivel_academico_id)?.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Selector de Letra */}
            <Grid size={{xs:12}}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1.5 }}>
                Identificación del Paralelo
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {letrasParalelos.map((letra) => (
                  <Tooltip key={letra} title={`Paralelo ${letra}`}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: formData.nombre === letra ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                        color: formData.nombre === letra ? 'white' : theme.palette.primary.main,
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: formData.nombre === letra ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                        }
                      }}
                      onClick={() => setFormData({ ...formData, nombre: letra })}
                    >
                      {letra}
                    </Avatar>
                  </Tooltip>
                ))}
              </Box>
              {formData.nombre && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Seleccionado: <strong>Paralelo {formData.nombre}</strong>
                </Alert>
              )}
            </Grid>

            {/* Capacidad Máxima */}
            <Grid size={{xs:12}} >
              <TextField
                fullWidth
                type="number"
                label="Capacidad Máxima"
                value={formData.capacidad_maxima}
                onChange={(e) => setFormData({ ...formData, capacidad_maxima: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <GroupsIcon sx={{ mr: 1, color: 'action.active' }} />,
                  inputProps: { min: 1, max: 50 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Año */}
            <Grid size={{xs:12, md:6}} >
              <TextField
                fullWidth
                type="number"
                label="Año Académico"
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })}
                placeholder="Ej: 2025"
                InputProps={{
                  inputProps: { min: 2020, max: 2030 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Turno */}
            <Grid size={{xs:12}} >
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1.5 }}>
                Turno
              </Typography>
              <Grid container spacing={2}>
                {turnos.map((turno) => (
                  <Grid size={{xs:12, sm:4}}  key={turno.id}>
                    <Card
                      onClick={() => setFormData({ ...formData, turno_id: turno.id })}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: `2px solid ${formData.turno_id === turno.id ? getTurnoColor(turno.nombre) : 'transparent'}`,
                        bgcolor: formData.turno_id === turno.id ? alpha(getTurnoColor(turno.nombre), 0.1) : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: getTurnoColor(turno.nombre),
                          bgcolor: alpha(getTurnoColor(turno.nombre), 0.15),
                          boxShadow: `0 8px 16px ${alpha(getTurnoColor(turno.nombre), 0.3)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {getTurnoIcon(turno.nombre)}
                      </Typography>
                      <Typography variant="body1" fontWeight="700" sx={{ color: getTurnoColor(turno.nombre) }}>
                        {turno.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {turno.hora_inicio?.slice(0, 5)} - {turno.hora_fin?.slice(0, 5)}
                      </Typography>
                      {formData.turno_id === turno.id && (
                        <CheckCircleIcon sx={{ mt: 1, color: getTurnoColor(turno.nombre) }} />
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Preview */}
            <Grid size={{xs:12}} >
              <Divider sx={{ my: 1 }} />
              <Box sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  💡 <strong>Vista previa:</strong>
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📋 <strong>Paralelo {formData.nombre || '?'}</strong> - {grados.find(g => g.id === formData.grado_id)?.nombre || 'Sin grado'}
                  </Typography>
                  <Typography variant="body2">
                    👥 Capacidad máxima: {formData.capacidad_maxima} estudiantes
                  </Typography>
                  <Typography variant="body2">
                    {getTurnoIcon(turnos.find(t => t.id === formData.turno_id)?.nombre ?? '')} 
                    Turno {turnos.find(t => t.id === formData.turno_id)?.nombre || 'No seleccionado'}
                  </Typography>
                  <Typography variant="body2">
                    📅 Año {formData.anio}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
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
            startIcon={editingParalelo.paralelo ? <EditIcon /> : <AddIcon />}
            disabled={!formData.nombre || !formData.grado_id || !formData.turno_id}
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
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            {editingParalelo.paralelo ? 'Actualizar Paralelo' : 'Crear Paralelo'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Paralelos;