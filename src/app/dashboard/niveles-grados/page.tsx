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
  Collapse,
  Badge,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const API_URL = 'http://localhost:3000/api';

const NivelesGrados = () => {
  interface Grado {
  id: number;
  nivel_academico_id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
}

interface NivelAcademico {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  color?: string;
  icon?: string;
  grados?: Grado[]; // <-- aquí
}

  const theme = useTheme();
  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [editingNivel, setEditingNivel] = useState<NivelAcademico | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNivel, setExpandedNivel] = useState<number | null>(null);
  const [openNivelDialog, setOpenNivelDialog] = useState(false);
  const [openGradoDialog, setOpenGradoDialog] = useState(false);
  const [editingGrado, setEditingGrado] = useState<{ nivel_id: number; grado: Grado | null }>({
  nivel_id: 0,
  grado: null
});
type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const [snackbar, setSnackbar] = useState<SnackbarState>({
  open: false,
  message: '',
  severity: 'success'
});
  const [nivelFormData, setNivelFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0,
    color: '#4ECDC4',
    icon: '📚'
  });
  const [gradoFormData, setGradoFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0
  });

  // Cargar niveles desde el backend
  useEffect(() => {
    fetchNiveles();
  }, []);

  const fetchNiveles = async () => {
  try {
    setLoading(true);
    const nivelesRes = await fetch(`${API_URL}/niveles-academicos`);
    const gradosRes = await fetch(`${API_URL}/grados`);
    if (!nivelesRes.ok || !gradosRes.ok) throw new Error('Error al cargar datos');

    const nivelesData = await nivelesRes.json();
    const gradosData = await gradosRes.json();

    // Asignar grados a cada nivel
    const nivelesConGrados = nivelesData.map((nivel: NivelAcademico) => ({
      ...nivel,
      grados: gradosData.filter((grado: Grado) => grado.nivel_academico_id === nivel.id)
    }));

    setNiveles(nivelesConGrados);
  } catch (error) {
    console.error(error);
    setSnackbar({ 
      open: true, 
      message: '❌ Error al cargar niveles académicos', 
      severity: 'error' 
    });
  } finally {
    setLoading(false);
  }
};
  // Handlers para Niveles
 const handleOpenNivelDialog = (nivel: NivelAcademico | null = null) => {
    if (nivel) {
      setEditingNivel(nivel);
      setNivelFormData({
        nombre: nivel.nombre,
        descripcion: nivel.descripcion || '',
        orden: nivel.orden || 0,
        color: nivel.color || '#4ECDC4',
        icon: nivel.icon || '📚'
      });
    } else {
      setEditingNivel(null);
      setNivelFormData({ 
        nombre: '', 
        descripcion: '', 
        orden: niveles.length + 1,
        color: '#4ECDC4', 
        icon: '📚' 
      });
    }
    setOpenNivelDialog(true);
  };

  const handleSaveNivel = async () => {
    if (!nivelFormData.nombre.trim()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa el nombre del nivel', 
        severity: 'error' 
      });
      return;
    }

    try {
      const url = editingNivel 
        ? `${API_URL}/niveles-academicos/${editingNivel.id}`
        : `${API_URL}/niveles-academicos`;
      
      const method = editingNivel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nivelFormData)
      });

      if (!response.ok) throw new Error('Error al guardar nivel');

      setSnackbar({ 
        open: true, 
        message: editingNivel ? '✨ Nivel actualizado exitosamente' : '🎉 Nivel creado exitosamente',
        severity: 'success' 
      });
      
      setOpenNivelDialog(false);
      fetchNiveles();
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Error al guardar nivel', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteNivel = async (id: number) => {
  if (!window.confirm('¿Estás seguro de eliminar este nivel? Se eliminarán todos sus grados.')) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/niveles-academicos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar nivel');
    setNiveles(niveles.filter(n => n.id !== id));
    setSnackbar({ open: true, message: '🗑️ Nivel eliminado', severity: 'info' });
  } catch (error) {
    console.error(error);
    setSnackbar({ open: true, message: '❌ Error al eliminar el nivel', severity: 'error' });
  }
};
  // Handlers para Grados
  const handleOpenGradoDialog = (nivel_id: number, grado: Grado | null = null) => {
  if (grado) {
    setEditingGrado({ nivel_id, grado });
    setGradoFormData({
      nombre: grado.nombre,
      descripcion: grado.descripcion || '',
      orden: grado.orden
    });
  } else {
    const nivel = niveles.find(n => n.id === nivel_id);
    const gradosCount = nivel?.grados?.length || 0;
    setEditingGrado({ nivel_id, grado: null });
    setGradoFormData({
      nombre: '',
      descripcion: '',
      orden: gradosCount + 1
    });
  }
  setOpenGradoDialog(true);
};
  const handleSaveGrado = async () => {
    if (!gradoFormData.nombre.trim()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa el nombre del grado', 
        severity: 'error' 
      });
      return;
    }

    try {
      const url = editingGrado.grado 
        ? `${API_URL}/grados/${editingGrado.grado.id}`
        : `${API_URL}/grados`;
      
      const method = editingGrado.grado ? 'PUT' : 'POST';
      
      const payload = {
        ...gradoFormData,
        nivel_academico_id: editingGrado.nivel_id
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al guardar grado');

      setSnackbar({
        open: true,
        message: editingGrado.grado ? '✨ Grado actualizado' : '🎉 Grado creado',
        severity: 'success'
      });
      
      setOpenGradoDialog(false);
      fetchNiveles();
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Error al guardar grado', 
        severity: 'error' 
      });
    }
  };

const handleDeleteGrado = async (grado_id: number) => {
  if (!window.confirm('¿Estás seguro de eliminar este grado?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/grados/${grado_id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar grado');

    setSnackbar({ 
      open: true, 
      message: '🗑️ Grado eliminado', 
      severity: 'info' 
    });
    fetchNiveles();
  } catch (error) {
    console.error('Error:', error);
    setSnackbar({ 
      open: true, 
      message: '❌ Error al eliminar grado', 
      severity: 'error' 
    });
  }
};

const toggleExpand = (nivelId: number) => {
  setExpandedNivel(expandedNivel === nivelId ? null : nivelId);
};



  // Cálculos de estadísticas (datos estáticos para estudiantes y materias)
  const totalGrados = niveles.reduce((sum, n) => sum + (n.grados?.length || 0), 0);
  const totalEstudiantes = 465; // Dato estático
  const totalMaterias = 142; // Dato estático

  const colores = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
  const iconos = ['🎨', '📚', '🎓', '🔬', '🎭', '⚽'];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} />
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
                <AccountTreeIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Niveles y Grados
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Estructura académica jerárquica de tu institución
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenNivelDialog()}
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
              Crear Nivel
            </Button>
          </Box>

          {/* Cards de Estadísticas Globales */}
          <Grid container spacing={3}>
            <Grid size={{xs:12, sm:6, md:3}}>
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
                      <SchoolIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" fontWeight="600" color="text.secondary">
                        Niveles Académicos
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                        {niveles.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

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
                        Total Grados
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#4ECDC4' }}>
                        {totalGrados}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{xs:12, sm:6, md:3}}>
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
                        Estudiantes
                      </Typography>
                      <Typography variant="h3" fontWeight="800" color="primary.main">
                        {totalEstudiantes}
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14 }} />
                        +12% este año
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{xs:12, sm:6, md:3}}>
              <Card sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                borderRadius: 3,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      bgcolor: 'secondary.main',
                      width: 56,
                      height: 56,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}`
                    }}>
                      <GradeIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" fontWeight="600" color="text.secondary">
                        Materias Totales
                      </Typography>
                      <Typography variant="h3" fontWeight="800" color="secondary.main">
                        {totalMaterias}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Niveles con Grados */}
      <Grid container spacing={3}>
        {niveles.map((nivel, index) => {
          const isExpanded = expandedNivel === nivel.id;
          const gradosCount = nivel.grados?.length || 0;

          return (
            <Grid size={{xs:12}} key={nivel.id}>
              <Fade in timeout={800 + index * 100}>
                <Card sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isExpanded
                    ? `0 16px 48px ${alpha(nivel.color || theme.palette.primary.main, 0.25)}`
                    : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  border: isExpanded
                    ? `2px solid ${nivel.color}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${alpha(nivel.color || theme.palette.primary.main, 0.2)}`,
                  }
                }}>
                  {/* Header del Nivel */}
                  <Box
                    onClick={() => toggleExpand(nivel.id)}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      background: isExpanded
                        ? `linear-gradient(135deg, ${alpha(nivel.color || theme.palette.primary.main, 0.15)} 0%, ${alpha(nivel.color || theme.palette.primary.main, 0.05)} 100%)`
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(nivel.color || theme.palette.primary.main, 0.1)} 0%, ${alpha(nivel.color || theme.palette.primary.main, 0.03)} 100%)`,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{
                          width: 64,
                          height: 64,
                          bgcolor: nivel.color,
                          fontSize: '2rem',
                          boxShadow: `0 8px 16px ${alpha(nivel.color || theme.palette.primary.main, 0.4)}`,
                          transition: 'all 0.3s ease',
                          transform: isExpanded ? 'rotate(360deg) scale(1.1)' : 'none'
                        }}>
                          {nivel.icon || '📚'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h5" fontWeight="700">
                              {nivel.nombre}
                            </Typography>
                            <Badge
                              badgeContent={gradosCount}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  minWidth: 24,
                                  height: 24
                                }
                              }}
                            >
                              <Chip
                                label="Grados"
                                size="small"
                                sx={{ bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.2) }}
                              />
                            </Badge>
                          </Box>
                          {nivel.descripcion && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {nivel.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Agregar grado">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenGradoDialog(nivel.id);
                            }}
                            sx={{
                              bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.1),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: nivel.color,
                                color: 'white',
                                transform: 'rotate(90deg) scale(1.2)',
                              }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar nivel">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNivelDialog(nivel);
                            }}
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
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar nivel">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNivel(nivel.id);
                            }}
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
                            <DeleteIcon />
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

                  {/* Grados Colapsables */}
                  <Collapse in={isExpanded} timeout={500}>
                    <Divider />
                    <Box sx={{ p: 3, bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.02) }}>
                      {!nivel.grados || nivel.grados.length === 0 ? (
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
                            No hay grados registrados
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Comienza agregando grados a este nivel académico
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenGradoDialog(nivel.id)}
                            sx={{
                              bgcolor: nivel.color,
                              '&:hover': { bgcolor: nivel.color, filter: 'brightness(0.9)' }
                            }}
                          >
                            Agregar Primer Grado
                          </Button>
                        </Paper>
                      ) : (
                        <Grid container spacing={2}>
                          {nivel.grados.map((grado, gradoIndex) => (
                            <Grid size={{xs:12, sm:6, lg:3}} key={grado.id}>
                              <Card
                                sx={{
                                  height: '100%',
                                  borderRadius: 2,
                                  border: `2px solid ${alpha(nivel.color || theme.palette.primary.main, 0.3)}`,
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    transform: 'translateY(-8px) scale(1.03)',
                                    boxShadow: `0 12px 24px ${alpha(nivel.color || theme.palette.primary.main, 0.3)}`,
                                    borderColor: nivel.color,
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 2.5 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                                        {grado.nombre}
                                      </Typography>
                                      {grado.descripcion && (
                                        <Typography variant="caption" color="text.secondary">
                                          {grado.descripcion}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Avatar
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.2),
                                        color: nivel.color,
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {grado.orden || gradoIndex + 1}
                                    </Avatar>
                                  </Box>

                                  <Divider sx={{ my: 1.5 }} />

                                  <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <GroupsIcon sx={{ fontSize: 18 }} />
                                        Estudiantes
                                      </Typography>
                                      <Chip
                                        label={Math.floor(Math.random() * 40) + 20}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.15),
                                          color: nivel.color,
                                          fontWeight: 'bold'
                                        }}
                                      />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <GradeIcon sx={{ fontSize: 18 }} />
                                        Materias
                                      </Typography>
                                      <Chip
                                        label={Math.floor(Math.random() * 10) + 5}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.15),
                                          color: nivel.color,
                                          fontWeight: 'bold'
                                        }}
                                      />
                                    </Box>

                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                        Capacidad
                                      </Typography>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.random() * 100}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          bgcolor: alpha(nivel.color || theme.palette.primary.main, 0.1),
                                          '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            bgcolor: nivel.color
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Stack>

                                  <Divider sx={{ my: 1.5 }} />

                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    <Tooltip title="Editar grado">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenGradoDialog(nivel.id, grado)}
                                        sx={{
                                          bgcolor: alpha(theme.palette.info.main, 0.1),
                                          transition: 'all 0.3s ease',
                                          '&:hover': {
                                            bgcolor: theme.palette.info.main,
                                            color: 'white',
                                            transform: 'rotate(15deg) scale(1.2)',
                                          }
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar grado">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteGrado(grado.id)}
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
                          ))}
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

      {niveles.length === 0 && (
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
            <SchoolIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="700" gutterBottom>
              ¡Comienza tu estructura académica!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Crea niveles académicos (Inicial, Primaria, Secundaria) y organiza tus grados de manera jerárquica.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenNivelDialog()}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Crear Primer Nivel
            </Button>
          </Paper>
        </Fade>
      )}

      {/* Dialog para Crear/Editar Nivel */}
      <Dialog
        open={openNivelDialog}
        onClose={() => setOpenNivelDialog(false)}
        maxWidth="sm"
        fullWidth
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
              bgcolor: editingNivel ? 'warning.main' : 'success.main',
              width: 48,
              height: 48
            }}>
              {editingNivel ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800">
                {editingNivel ? '✏️ Editar Nivel Académico' : '➕ Nuevo Nivel Académico'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingNivel ? 'Modifica la información del nivel' : 'Crea un nuevo nivel educativo'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Nombre del Nivel"
                value={nivelFormData.nombre}
                onChange={(e) => setNivelFormData({ ...nivelFormData, nombre: e.target.value })}
                placeholder="Ej: Educación Primaria"
                variant="outlined"
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={nivelFormData.descripcion}
                onChange={(e) => setNivelFormData({ ...nivelFormData, descripcion: e.target.value })}
                placeholder="Describe el nivel académico"
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                type="number"
                label="Orden"
                value={nivelFormData.orden}
                onChange={(e) => setNivelFormData({ ...nivelFormData, orden: parseInt(e.target.value) || 0 })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                Color Identificador
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colores.map((color) => (
                  <Tooltip key={color} title={color}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        cursor: 'pointer',
                        border: nivelFormData.color === color ? `3px solid ${theme.palette.text.primary}` : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          boxShadow: `0 4px 12px ${alpha(color, 0.5)}`
                        }
                      }}
                      onClick={() => setNivelFormData({ ...nivelFormData, color })}
                    >
                      {nivelFormData.color === color && <CheckCircleIcon sx={{ color: 'white' }} />}
                    </Avatar>
                  </Tooltip>
                ))}
              </Box>
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                Ícono Representativo
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {iconos.map((icon) => (
                  <Tooltip key={icon} title={icon}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(nivelFormData.color, 0.2),
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        border: nivelFormData.icon === icon ? `3px solid ${nivelFormData.color}` : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: alpha(nivelFormData.color, 0.4)
                        }
                      }}
                      onClick={() => setNivelFormData({ ...nivelFormData, icon })}
                    >
                      {icon}
                    </Avatar>
                  </Tooltip>
                ))}
              </Box>
            </Grid>

            <Grid size={{xs:12}}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💡 <strong>Vista previa:</strong>
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: nivelFormData.color, fontSize: '1.5rem' }}>
                    {nivelFormData.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {nivelFormData.nombre || 'Nombre del nivel'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orden: {nivelFormData.orden}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenNivelDialog(false)}
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
            onClick={handleSaveNivel}
            variant="contained"
            size="large"
            startIcon={editingNivel ? <EditIcon /> : <AddIcon />}
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
            {editingNivel ? 'Actualizar Nivel' : 'Crear Nivel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Crear/Editar Grado */}
      <Dialog
        open={openGradoDialog}
        onClose={() => setOpenGradoDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              bgcolor: editingGrado.grado ? 'warning.main' : 'success.main',
              width: 48,
              height: 48
            }}>
              {editingGrado.grado ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800">
                {editingGrado.grado ? '✏️ Editar Grado' : '➕ Nuevo Grado'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {niveles.find(n => n.id === editingGrado.nivel_id)?.nombre}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Nombre del Grado"
                value={gradoFormData.nombre}
                onChange={(e) => setGradoFormData({ ...gradoFormData, nombre: e.target.value })}
                placeholder="Ej: 1ro de Primaria"
                variant="outlined"
                InputProps={{
                  startAdornment: <ClassIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={gradoFormData.descripcion}
                onChange={(e) => setGradoFormData({ ...gradoFormData, descripcion: e.target.value })}
                placeholder="Describe el grado"
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                type="number"
                label="Orden"
                value={gradoFormData.orden}
                onChange={(e) => setGradoFormData({ ...gradoFormData, orden: parseInt(e.target.value) || 0 })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{xs:12}} >
              <Box sx={{
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✨ <strong>Tip:</strong> Usa nombres descriptivos como "1ro de Primaria", "Kinder A", "5to de Secundaria"
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenGradoDialog(false)}
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
            onClick={handleSaveGrado}
            variant="contained"
            size="large"
            startIcon={editingGrado.grado ? <EditIcon /> : <AddIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.5)}`,
              }
            }}
          >
            {editingGrado.grado ? 'Actualizar Grado' : 'Crear Grado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default NivelesGrados;