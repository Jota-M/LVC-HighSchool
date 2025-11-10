'use client';
import React, { useState } from 'react';
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
  AvatarGroup,
  LinearProgress,
  Collapse
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Tipos
interface NivelAcademico {
  id: number;
  nombre: string;
  color: string;
  icon: string;
}

interface Grado {
  id: number;
  nombre: string;
  nivel_academico_id: number;
  nivel?: NivelAcademico;
}

interface Paralelo {
  id: number;
  nombre: string;
  grado_id: number;
  estudiantes?: number;
  docente?: string;
  turno?: 'Mañana' | 'Tarde' | 'Noche';
  aula?: string;
}

interface GradoConParalelos extends Grado {
  paralelos: Paralelo[];
}

// Datos de ejemplo
const niveles: NivelAcademico[] = [
  { id: 1, nombre: 'Educación Inicial', color: '#FF6B6B', icon: '🎨' },
  { id: 2, nombre: 'Educación Primaria', color: '#4ECDC4', icon: '📚' },
  { id: 3, nombre: 'Educación Secundaria', color: '#95E1D3', icon: '🎓' },
];

const grados: Grado[] = [
  { id: 1, nombre: 'Pre-Kinder', nivel_academico_id: 1, nivel: niveles[0] },
  { id: 2, nombre: 'Kinder', nivel_academico_id: 1, nivel: niveles[0] },
  { id: 3, nombre: '1ro de Primaria', nivel_academico_id: 2, nivel: niveles[1] },
  { id: 4, nombre: '2do de Primaria', nivel_academico_id: 2, nivel: niveles[1] },
  { id: 5, nombre: '3ro de Primaria', nivel_academico_id: 2, nivel: niveles[1] },
  { id: 9, nombre: '1ro de Secundaria', nivel_academico_id: 3, nivel: niveles[2] },
  { id: 10, nombre: '2do de Secundaria', nivel_academico_id: 3, nivel: niveles[2] },
];

const initialParalelos: Paralelo[] = [
  { id: 1, nombre: 'A', grado_id: 3, estudiantes: 32, docente: 'Prof. María García', turno: 'Mañana', aula: '101' },
  { id: 2, nombre: 'B', grado_id: 3, estudiantes: 30, docente: 'Prof. Juan Pérez', turno: 'Mañana', aula: '102' },
  { id: 3, nombre: 'C', grado_id: 3, estudiantes: 28, docente: 'Prof. Ana López', turno: 'Tarde', aula: '103' },
  { id: 4, nombre: 'A', grado_id: 4, estudiantes: 35, docente: 'Prof. Carlos Ruiz', turno: 'Mañana', aula: '201' },
  { id: 5, nombre: 'B', grado_id: 4, estudiantes: 33, docente: 'Prof. Laura Martínez', turno: 'Tarde', aula: '202' },
  { id: 6, nombre: 'A', grado_id: 9, estudiantes: 40, docente: 'Prof. Roberto Sánchez', turno: 'Mañana', aula: '301' },
  { id: 7, nombre: 'B', grado_id: 9, estudiantes: 38, docente: 'Prof. Patricia Gómez', turno: 'Mañana', aula: '302' },
  { id: 8, nombre: 'C', grado_id: 9, estudiantes: 42, docente: 'Prof. Miguel Torres', turno: 'Tarde', aula: '303' },
  { id: 9, nombre: 'D', grado_id: 9, estudiantes: 39, docente: 'Prof. Sandra Flores', turno: 'Tarde', aula: '304' },
];

const Paralelos: React.FC = () => {
  const theme = useTheme();
  const [paralelos, setParalelos] = useState<Paralelo[]>(initialParalelos);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [expandedGrado, setExpandedGrado] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParalelo, setEditingParalelo] = useState<{ grado_id: number; paralelo: Paralelo | null }>({ grado_id: 0, paralelo: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });
  const [formData, setFormData] = useState({
    nombre: '',
    estudiantes: 0,
    docente: '',
    turno: 'Mañana' as 'Mañana' | 'Tarde' | 'Noche',
    aula: ''
  });

  // Handlers
  const handleOpenDialog = (grado_id: number, paralelo: Paralelo | null = null) => {
    if (paralelo) {
      setEditingParalelo({ grado_id, paralelo });
      setFormData({
        nombre: paralelo.nombre,
        estudiantes: paralelo.estudiantes || 0,
        docente: paralelo.docente || '',
        turno: paralelo.turno || 'Mañana',
        aula: paralelo.aula || ''
      });
    } else {
      setEditingParalelo({ grado_id, paralelo: null });
      setFormData({
        nombre: '',
        estudiantes: 0,
        docente: '',
        turno: 'Mañana',
        aula: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!formData.nombre) {
      setSnackbar({ open: true, message: 'Por favor completa el nombre del paralelo', severity: 'error' });
      return;
    }

    if (editingParalelo.paralelo) {
      // Editar
      setParalelos(paralelos.map(p =>
        p.id === editingParalelo.paralelo!.id
          ? { ...p, ...formData, grado_id: editingParalelo.grado_id }
          : p
      ));
      setSnackbar({ open: true, message: '✨ Paralelo actualizado exitosamente', severity: 'success' });
    } else {
      // Crear
      const newParalelo: Paralelo = {
        id: Math.max(...paralelos.map(p => p.id), 0) + 1,
        grado_id: editingParalelo.grado_id,
        ...formData
      };
      setParalelos([...paralelos, newParalelo]);
      setSnackbar({ open: true, message: '🎉 Paralelo creado exitosamente', severity: 'success' });
    }
    setOpenDialog(false);
  };

  const handleDelete = (id: number) => {
    setParalelos(paralelos.filter(p => p.id !== id));
    setSnackbar({ open: true, message: '🗑️ Paralelo eliminado', severity: 'info' });
  };

  // Organizar datos por nivel y grado
  const gradosConParalelos: GradoConParalelos[] = grados.map(grado => ({
    ...grado,
    paralelos: paralelos.filter(p => p.grado_id === grado.id)
  }));

  const gradosFiltrados = selectedNivel
    ? gradosConParalelos.filter(g => g.nivel_academico_id === selectedNivel)
    : gradosConParalelos;

  // Estadísticas
  const totalParalelos = paralelos.length;
  const totalEstudiantes = paralelos.reduce((sum, p) => sum + (p.estudiantes || 0), 0);
  const promedioEstudiantes = totalParalelos > 0 ? Math.round(totalEstudiantes / totalParalelos) : 0;
  const paralelosMasGrandes = paralelos.filter(p => (p.estudiantes || 0) > 35).length;

  const getTurnoColor = (turno?: string) => {
    switch (turno) {
      case 'Mañana': return '#FFD93D';
      case 'Tarde': return '#FF9A3C';
      case 'Noche': return '#6C5CE7';
      default: return theme.palette.grey[500];
    }
  };

  const getTurnoIcon = (turno?: string) => {
    switch (turno) {
      case 'Mañana': return '☀️';
      case 'Tarde': return '🌤️';
      case 'Noche': return '🌙';
      default: return '⏰';
    }
  };

  const letrasParalelos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'rotate 4s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
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
                        {totalParalelos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        En {grados.length} grados
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
                        Total Estudiantes
                      </Typography>
                      <Typography variant="h3" fontWeight="800" color="primary.main">
                        {totalEstudiantes}
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14 }} />
                        Crecimiento del 8%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

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
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" fontWeight="600" color="text.secondary">
                        Promedio/Paralelo
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                        {promedioEstudiantes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estudiantes por sección
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{xs:12, sm:6, md:3}} >
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
                        {paralelosMasGrandes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Más de 35 estudiantes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
                {niveles.map((nivel) => (
                  <Chip
                    key={nivel.id}
                    icon={<span>{nivel.icon}</span>}
                    label={nivel.nombre}
                    onClick={() => setSelectedNivel(nivel.id)}
                    sx={{
                      bgcolor: selectedNivel === nivel.id ? nivel.color : alpha(nivel.color, 0.1),
                      color: selectedNivel === nivel.id ? 'white' : nivel.color,
                      fontWeight: 'bold',
                      border: `2px solid ${nivel.color}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: nivel.color,
                        color: 'white',
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Grados con Paralelos */}
      <Grid container spacing={3}>
        {gradosFiltrados.map((grado, index) => {
          const isExpanded = expandedGrado === grado.id;
          const nivel = grado.nivel!;

          return (
            <Grid size={{xs:12}} key={grado.id}>
              <Fade in timeout={800 + index * 100}>
                <Card sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isExpanded
                    ? `0 16px 48px ${alpha(nivel.color, 0.25)}`
                    : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  border: isExpanded
                    ? `2px solid ${nivel.color}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${alpha(nivel.color, 0.2)}`,
                  }
                }}>
                  {/* Header del Grado */}
                  <Box
                    onClick={() => setExpandedGrado(isExpanded ? null : grado.id)}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      background: isExpanded
                        ? `linear-gradient(135deg, ${alpha(nivel.color, 0.15)} 0%, ${alpha(nivel.color, 0.05)} 100%)`
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(nivel.color, 0.1)} 0%, ${alpha(nivel.color, 0.03)} 100%)`,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{
                          width: 56,
                          height: 56,
                          bgcolor: nivel.color,
                          fontSize: '1.8rem',
                          boxShadow: `0 8px 16px ${alpha(nivel.color, 0.4)}`,
                          transition: 'all 0.3s ease',
                          transform: isExpanded ? 'scale(1.1)' : 'none'
                        }}>
                          {nivel.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h5" fontWeight="700">
                              {grado.nombre}
                            </Typography>
                            <Chip
                              label={nivel.nombre}
                              size="small"
                              sx={{
                                bgcolor: alpha(nivel.color, 0.2),
                                color: nivel.color,
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
                                sx={{ borderColor: nivel.color }}
                              />
                            </Badge>
                            <Chip
                              icon={<GroupsIcon />}
                              label={`${grado.paralelos.reduce((sum, p) => sum + (p.estudiantes || 0), 0)} estudiantes`}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: nivel.color }}
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
                              bgcolor: alpha(nivel.color, 0.1),
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
                    <Box sx={{ p: 3, bgcolor: alpha(nivel.color, 0.02) }}>
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
                              bgcolor: nivel.color,
                              '&:hover': { bgcolor: nivel.color, filter: 'brightness(0.9)' }
                            }}
                          >
                            Agregar Primer Paralelo
                          </Button>
                        </Paper>
                      ) : (
                        <Grid container spacing={3}>
                          {grado.paralelos.map((paralelo, paraleloIndex) => {
                            const capacidad = (paralelo.estudiantes || 0) / 40 * 100;
                            const isLleno = capacidad > 90;

                            return (
                              <Grid size={{xs:12, sm:6, md:4}} key={paralelo.id}>
                                <Card
                                  sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    border: `2px solid ${isLleno ? '#FF6B6B' : alpha(nivel.color, 0.3)}`,
                                    background: `linear-gradient(135deg, ${alpha(nivel.color, 0.05)} 0%, ${alpha(nivel.color, 0.02)} 100%)`,
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
                                      boxShadow: `0 16px 32px ${alpha(nivel.color, 0.3)}`,
                                      borderColor: nivel.color,
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
                                              bgcolor: nivel.color,
                                              fontSize: '1.5rem',
                                              fontWeight: 'bold',
                                              boxShadow: `0 4px 12px ${alpha(nivel.color, 0.4)}`
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
                                          <Typography variant="h6" fontWeight="700" sx={{ color: nivel.color }}>
                                            {paralelo.estudiantes || 0}/40
                                          </Typography>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={Math.min(capacidad, 100)}
                                          sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(nivel.color, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                              borderRadius: 4,
                                              bgcolor: isLleno ? '#FF6B6B' : nivel.color,
                                              transition: 'all 0.3s ease'
                                            }
                                          }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                          {capacidad.toFixed(0)}% de capacidad
                                        </Typography>
                                      </Box>

                                      {/* Docente */}
                                      {paralelo.docente && (
                                        <Box
                                          sx={{
                                            p: 1.5,
                                            bgcolor: alpha(nivel.color, 0.08),
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(nivel.color, 0.2)}`
                                          }}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                              sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: nivel.color,
                                                fontSize: '0.875rem'
                                              }}
                                            >
                                              <SchoolIcon fontSize="small" />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Docente Titular
                                              </Typography>
                                              <Typography variant="body2" fontWeight="600">
                                                {paralelo.docente}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      )}

                                      {/* Turno y Aula */}
                                      <Grid container spacing={1}>
                                        {paralelo.turno && (
                                          <Grid size={{xs:6}}>
                                            <Box
                                              sx={{
                                                p: 1.5,
                                                bgcolor: alpha(getTurnoColor(paralelo.turno), 0.1),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(getTurnoColor(paralelo.turno), 0.3)}`,
                                                textAlign: 'center'
                                              }}
                                            >
                                              <Typography variant="h4" sx={{ mb: 0.5 }}>
                                                {getTurnoIcon(paralelo.turno)}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Turno
                                              </Typography>
                                              <Typography variant="body2" fontWeight="700" sx={{ color: getTurnoColor(paralelo.turno) }}>
                                                {paralelo.turno}
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        )}
                                        {paralelo.aula && (
                                          <Grid size={{xs:6}}>
                                            <Box
                                              sx={{
                                                p: 1.5,
                                                bgcolor: alpha(nivel.color, 0.1),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(nivel.color, 0.3)}`,
                                                textAlign: 'center'
                                              }}
                                            >
                                              <Typography variant="h4" sx={{ mb: 0.5 }}>
                                                🚪
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Aula
                                              </Typography>
                                              <Typography variant="body2" fontWeight="700" sx={{ color: nivel.color }}>
                                                {paralelo.aula}
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        )}
                                      </Grid>
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
                {grados.find(g => g.id === editingParalelo.grado_id)?.nombre}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Selector de Letra */}
            <Grid size={{xs:12}} >
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

            {/* Número de Estudiantes */}
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="number"
                label="Número de Estudiantes"
                value={formData.estudiantes}
                onChange={(e) => setFormData({ ...formData, estudiantes: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <GroupsIcon sx={{ mr: 1, color: 'action.active' }} />,
                  inputProps: { min: 0, max: 50 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Aula */}
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Aula"
                value={formData.aula}
                onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                placeholder="Ej: 101, A-203"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>🚪</span>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Docente Titular */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Docente Titular"
                value={formData.docente}
                onChange={(e) => setFormData({ ...formData, docente: e.target.value })}
                placeholder="Ej: Prof. María García"
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

            {/* Turno */}
            <Grid size={{xs:12}}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1.5 }}>
                Turno
              </Typography>
              <Grid container spacing={2}>
                {(['Mañana', 'Tarde', 'Noche'] as const).map((turno) => (
                  <Grid size={{xs:12, sm:4}} key={turno}>
                    <Card
                      onClick={() => setFormData({ ...formData, turno })}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: `2px solid ${formData.turno === turno ? getTurnoColor(turno) : 'transparent'}`,
                        bgcolor: formData.turno === turno ? alpha(getTurnoColor(turno), 0.1) : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: getTurnoColor(turno),
                          bgcolor: alpha(getTurnoColor(turno), 0.15),
                          boxShadow: `0 8px 16px ${alpha(getTurnoColor(turno), 0.3)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {getTurnoIcon(turno)}
                      </Typography>
                      <Typography variant="body1" fontWeight="700" sx={{ color: getTurnoColor(turno) }}>
                        {turno}
                      </Typography>
                      {formData.turno === turno && (
                        <CheckCircleIcon sx={{ mt: 1, color: getTurnoColor(turno) }} />
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Preview */}
            <Grid size={{xs:12}}>
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
                    📋 <strong>Paralelo {formData.nombre || '?'}</strong> - {grados.find(g => g.id === editingParalelo.grado_id)?.nombre}
                  </Typography>
                  <Typography variant="body2">
                    👥 {formData.estudiantes} estudiantes
                  </Typography>
                  {formData.docente && (
                    <Typography variant="body2">
                      👨‍🏫 {formData.docente}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {getTurnoIcon(formData.turno)} Turno {formData.turno}
                    {formData.aula && ` - 🚪 Aula ${formData.aula}`}
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
                                 