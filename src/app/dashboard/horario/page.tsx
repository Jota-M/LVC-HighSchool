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
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassIcon from '@mui/icons-material/Class';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface Horario {
  id: number;
  paralelo_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  materia_id: number;
  profesor_id: number;
  aula: string;
}

interface HorarioExtendido extends Horario {
  materia_nombre: string;
  materia_color: string;
  profesor_nombre: string;
  paralelo_nombre: string;
  grado_nombre: string;
}

const Horarios = () => {
  const theme = useTheme();
  
  const [horarios, setHorarios] = useState<HorarioExtendido[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedParalelo, setSelectedParalelo] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Horario>({
    id: 0,
    paralelo_id: 0,
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '09:00',
    materia_id: 0,
    profesor_id: 0,
    aula: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const diasSemana = [
    { id: 1, nombre: 'Lunes', corto: 'LUN', icono: '📅', color: '#FF6B6B' },
    { id: 2, nombre: 'Martes', corto: 'MAR', icono: '📆', color: '#4ECDC4' },
    { id: 3, nombre: 'Miércoles', corto: 'MIÉ', icono: '🗓️', color: '#45B7D1' },
    { id: 4, nombre: 'Jueves', corto: 'JUE', icono: '📋', color: '#96CEB4' },
    { id: 5, nombre: 'Viernes', corto: 'VIE', icono: '📊', color: '#FFEAA7' }
  ];

  const horasClase = [
    { inicio: '08:00', fin: '08:45', periodo: 'Primera Hora' },
    { inicio: '08:45', fin: '09:30', periodo: 'Segunda Hora' },
    { inicio: '09:30', fin: '10:15', periodo: 'Tercera Hora' },
    { inicio: '10:15', fin: '10:30', periodo: 'RECREO', esRecreo: true },
    { inicio: '10:30', fin: '11:15', periodo: 'Cuarta Hora' },
    { inicio: '11:15', fin: '12:00', periodo: 'Quinta Hora' },
    { inicio: '12:00', fin: '12:45', periodo: 'Sexta Hora' },
  ];

  const materiasMock = [
    { id: 1, nombre: 'Matemáticas', color: '#3498db', icono: '🔢' },
    { id: 2, nombre: 'Lengua y Literatura', color: '#e74c3c', icono: '📚' },
    { id: 3, nombre: 'Ciencias Naturales', color: '#2ecc71', icono: '🔬' },
    { id: 4, nombre: 'Estudios Sociales', color: '#f39c12', icono: '🌍' },
    { id: 5, nombre: 'Inglés', color: '#9b59b6', icono: '🇬🇧' },
    { id: 6, nombre: 'Educación Física', color: '#1abc9c', icono: '⚽' },
    { id: 7, nombre: 'Arte', color: '#e67e22', icono: '🎨' },
    { id: 8, nombre: 'Música', color: '#34495e', icono: '🎵' },
  ];

  const profesoresMock = [
    { id: 1, nombre: 'Prof. Juan Pérez', especialidad: 'Matemáticas' },
    { id: 2, nombre: 'Prof. María García', especialidad: 'Lengua' },
    { id: 3, nombre: 'Prof. Carlos López', especialidad: 'Ciencias' },
    { id: 4, nombre: 'Prof. Ana Rodríguez', especialidad: 'Inglés' },
    { id: 5, nombre: 'Prof. Luis Martínez', especialidad: 'Ed. Física' },
  ];

  const paralelosMock = [
    { id: 1, nombre: 'Paralelo A', grado: 'Primero de Básica' },
    { id: 2, nombre: 'Paralelo B', grado: 'Primero de Básica' },
    { id: 3, nombre: 'Paralelo A', grado: 'Segundo de Básica' },
  ];

  useEffect(() => {
    const generarHorarios = () => {
      const horariosGenerados: HorarioExtendido[] = [];
      let idCounter = 1;

      paralelosMock.forEach(paralelo => {
        diasSemana.forEach(dia => {
          const clasesDelDia = [0, 1, 2, 4, 5];
          
          clasesDelDia.forEach(indiceHora => {
            const hora = horasClase[indiceHora];
            const materia = materiasMock[Math.floor(Math.random() * materiasMock.length)];
            const profesor = profesoresMock[Math.floor(Math.random() * profesoresMock.length)];

            horariosGenerados.push({
              id: idCounter++,
              paralelo_id: paralelo.id,
              dia_semana: dia.id,
              hora_inicio: hora.inicio,
              hora_fin: hora.fin,
              materia_id: materia.id,
              profesor_id: profesor.id,
              aula: `Aula ${Math.floor(Math.random() * 20) + 1}`,
              materia_nombre: materia.nombre,
              materia_color: materia.color,
              profesor_nombre: profesor.nombre,
              paralelo_nombre: paralelo.nombre,
              grado_nombre: paralelo.grado
            });
          });
        });
      });

      setHorarios(horariosGenerados);
    };

    generarHorarios();
  }, []);

  const estadisticas = {
    totalClases: horarios.length,
    clasesHoy: horarios.filter(h => h.dia_semana === new Date().getDay() || 1).length,
    profesoresActivos: new Set(horarios.map(h => h.profesor_id)).size,
    materiasActivas: new Set(horarios.map(h => h.materia_id)).size,
  };

  const handleSave = () => {
    const nuevaClase: HorarioExtendido = {
      ...formData,
      id: horarios.length + 1,
      materia_nombre: materiasMock.find(m => m.id === formData.materia_id)?.nombre || '',
      materia_color: materiasMock.find(m => m.id === formData.materia_id)?.color || '',
      profesor_nombre: profesoresMock.find(p => p.id === formData.profesor_id)?.nombre || '',
      paralelo_nombre: paralelosMock.find(p => p.id === formData.paralelo_id)?.nombre || '',
      grado_nombre: paralelosMock.find(p => p.id === formData.paralelo_id)?.grado || ''
    };

    setHorarios([...horarios, nuevaClase]);
    setSnackbar({
      open: true,
      message: '✨ Horario guardado exitosamente',
      severity: 'success'
    });
    setOpenDialog(false);
    setActiveTab(0);
    setFormData({
      id: 0,
      paralelo_id: 0,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '09:00',
      materia_id: 0,
      profesor_id: 0,
      aula: ''
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta clase del horario?')) {
      setHorarios(horarios.filter(h => h.id !== id));
      setSnackbar({
        open: true,
        message: '🗑️ Clase eliminada',
        severity: 'info'
      });
    }
  };

  const horariosDia = horarios.filter(h => 
    h.dia_semana === selectedDay &&
    (selectedParalelo === null || h.paralelo_id === selectedParalelo) &&
    (searchTerm === '' || 
     h.materia_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     h.profesor_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ClaseCard = ({ horario }: { horario: HorarioExtendido }) => {
    const materia = materiasMock.find(m => m.id === horario.materia_id);
    
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          border: `2px solid ${alpha(horario.materia_color, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(horario.materia_color, 0.05)} 0%, ${alpha(horario.materia_color, 0.02)} 100%)`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 16px 32px ${alpha(horario.materia_color, 0.3)}`,
            borderColor: horario.materia_color,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${horario.materia_color}, ${alpha(horario.materia_color, 0.6)})`,
          }
        }}
      >
        <CardContent sx={{ p: 2.5, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: horario.materia_color,
                  fontSize: '1.5rem',
                  boxShadow: `0 4px 12px ${alpha(horario.materia_color, 0.4)}`
                }}
              >
                {materia?.icono}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                  {horario.materia_nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {horario.paralelo_nombre} • {horario.grado_nombre}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="600">
                {horario.hora_inicio} - {horario.hora_fin}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {horario.profesor_nombre}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(horario.materia_color, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(horario.materia_color, 0.3)}`,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Aula
              </Typography>
              <Typography variant="h6" fontWeight="700" sx={{ color: horario.materia_color }}>
                {horario.aula}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

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
                <EventAvailableIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => setOpenDialog(true)}
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
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={() => handleDelete(horario.id)}
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
    );
  };

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
          Cargando horarios...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
                <ScheduleIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Horarios Académicos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Gestión inteligente de horarios y distribución de clases
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Imprimir
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Exportar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                  }
                }}
              >
                Nueva Clase
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${alpha('#4ECDC4', 0.15)} 0%, ${alpha('#4ECDC4', 0.05)} 100%)`,
                border: `2px solid ${alpha('#4ECDC4', 0.3)}`,
                borderRadius: 3,
                transition: 'all 0.4s ease',
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
                        Total Clases
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#4ECDC4' }}>
                        {estadisticas.totalClases}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Esta semana
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 3,
                transition: 'all 0.4s ease',
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
                      <CalendarMonthIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" fontWeight="600" color="text.secondary">
                        Clases Hoy
                      </Typography>
                      <Typography variant="h3" fontWeight="800" color="primary.main">
                        {estadisticas.clasesHoy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        En progreso
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${alpha('#FF6B6B', 0.15)} 0%, ${alpha('#FF6B6B', 0.05)} 100%)`,
                border: `2px solid ${alpha('#FF6B6B', 0.3)}`,
                borderRadius: 3,
                transition: 'all 0.4s ease',
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
                        Profesores
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#FF6B6B' }}>
                        {estadisticas.profesoresActivos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: `linear-gradient(135deg, ${alpha('#95E1D3', 0.15)} 0%, ${alpha('#95E1D3', 0.05)} 100%)`,
                border: `2px solid ${alpha('#95E1D3', 0.3)}`,
                borderRadius: 3,
                transition: 'all 0.4s ease',
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
                      <MenuBookIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" fontWeight="600" color="text.secondary">
                        Materias
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ color: '#95E1D3' }}>
                        {estadisticas.materiasActivas}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diferentes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: alpha(theme.palette.primary.main, 0.03),
            mb: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Paralelo</InputLabel>
                    <Select
                      value={selectedParalelo || ''}
                      onChange={(e) => setSelectedParalelo(e.target.value ? Number(e.target.value) : null)}
                      label="Paralelo"
                      sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Todos los paralelos</MenuItem>
                      {paralelosMock.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre} - {p.grado}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Vista:
                    </Typography>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&.Mui-selected': {
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                            }
                          }
                        }
                      }}
                    >
                      <ToggleButton value="grid">
                        <ViewModuleIcon sx={{ mr: 1 }} />
                        Tarjetas
                      </ToggleButton>
                      <ToggleButton value="table">
                        <ViewWeekIcon sx={{ mr: 1 }} />
                        Tabla
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    placeholder="Buscar materia o profesor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: alpha(theme.palette.primary.main, 0.03)
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <ViewWeekIcon color="primary" />
                <Typography variant="body1" fontWeight="600">
                  Día de la semana:
                </Typography>
                {diasSemana.map((dia) => (
                  <Chip
                    key={dia.id}
                    icon={<span style={{ fontSize: '1.2rem' }}>{dia.icono}</span>}
                    label={dia.nombre}
                    onClick={() => setSelectedDay(dia.id)}
                    sx={{
                      bgcolor: selectedDay === dia.id ? dia.color : alpha(dia.color, 0.1),
                      color: selectedDay === dia.id ? 'white' : dia.color,
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      px: 2,
                      py: 2.5,
                      border: `2px solid ${dia.color}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: dia.color,
                        color: 'white',
                        transform: 'scale(1.1)',
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {viewMode === 'grid' ? (
        <Fade in timeout={800}>
          <Box>
            {horasClase.map((hora, index) => {
              const clasesEnHora = horariosDia.filter(
                h => h.hora_inicio === hora.inicio
              );

              if (hora.esRecreo) {
                return (
                  <Card
                    key={index}
                    sx={{
                      mb: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#FFEAA7', 0.2)} 0%, ${alpha('#FDCB6E', 0.1)} 100%)`,
                      border: `2px dashed ${alpha('#FDCB6E', 0.5)}`,
                      textAlign: 'center',
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <Typography variant="h4">☕</Typography>
                      <Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#FDCB6E' }}>
                          {hora.periodo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hora.inicio} - {hora.fin}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              }

              return (
                <Box key={index} sx={{ mb: 4 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}>
                    <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="700">
                        {hora.periodo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hora.inicio} - {hora.fin}
                      </Typography>
                    </Box>
                    <Badge badgeContent={clasesEnHora.length} color="primary">
                      <Chip
                        label="Clases"
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Badge>
                  </Box>

                  {clasesEnHora.length > 0 ? (
                    <Grid container spacing={3}>
                      {clasesEnHora.map((horario, hIndex) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={horario.id}>
                          <Box
                            sx={{
                              animation: `fadeInUp 0.6s ease ${hIndex * 0.1}s both`,
                              '@keyframes fadeInUp': {
                                from: {
                                  opacity: 0,
                                  transform: 'translateY(20px)'
                                },
                                to: {
                                  opacity: 1,
                                  transform: 'translateY(0)'
                                }
                              }
                            }}
                          >
                            <ClaseCard horario={horario} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.grey[500], 0.05),
                        border: `2px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
                        borderRadius: 2
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay clases programadas en este horario
                      </Typography>
                    </Paper>
                  )}
                </Box>
              );
            })}
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={800}>
          <Card sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon />
                        Horario
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBookIcon />
                        Materia
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon />
                        Profesor
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClassIcon />
                        Paralelo
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      Aula
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {horasClase.map((hora, index) => {
                    const clasesEnHora = horariosDia.filter(
                      h => h.hora_inicio === hora.inicio
                    );

                    if (hora.esRecreo) {
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            bgcolor: alpha('#FFEAA7', 0.1),
                            '&:hover': { bgcolor: alpha('#FFEAA7', 0.2) }
                          }}
                        >
                          <TableCell colSpan={6}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 2,
                              py: 1
                            }}>
                              <Typography variant="h6">☕</Typography>
                              <Typography variant="h6" fontWeight="700" sx={{ color: '#FDCB6E' }}>
                                {hora.periodo}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ({hora.inicio} - {hora.fin})
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    if (clasesEnHora.length === 0) {
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            bgcolor: alpha(theme.palette.grey[500], 0.02),
                            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.05) }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {hora.inicio} - {hora.fin}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hora.periodo}
                            </Typography>
                          </TableCell>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary">
                              Sin clases programadas
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return clasesEnHora.map((horario, hIndex) => (
                      <TableRow
                        key={`${index}-${hIndex}`}
                        sx={{
                          bgcolor: hIndex === 0 ? 'background.paper' : alpha(horario.materia_color, 0.02),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha(horario.materia_color, 0.08),
                            transform: 'scale(1.01)',
                            boxShadow: `0 4px 12px ${alpha(horario.materia_color, 0.2)}`
                          }
                        }}
                      >
                        {hIndex === 0 && (
                          <TableCell rowSpan={clasesEnHora.length}>
                            <Typography variant="body2" fontWeight="600">
                              {hora.inicio} - {hora.fin}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hora.periodo}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: horario.materia_color,
                                fontSize: '1.2rem'
                              }}
                            >
                              {materiasMock.find(m => m.id === horario.materia_id)?.icono}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {horario.materia_nombre}
                              </Typography>
                              <Chip
                                label={horario.materia_nombre.split(' ')[0]}
                                size="small"
                                sx={{
                                  bgcolor: alpha(horario.materia_color, 0.15),
                                  color: horario.materia_color,
                                  fontSize: '0.7rem',
                                  height: 20,
                                  mt: 0.5
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {horario.profesor_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {horario.paralelo_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {horario.grado_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={horario.aula}
                            size="small"
                            sx={{
                              bgcolor: alpha(horario.materia_color, 0.15),
                              color: horario.materia_color,
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="info">
                                <EventAvailableIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="warning">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(horario.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}

      {horariosDia.length === 0 && (
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
            <CalendarMonthIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="700" gutterBottom>
              No hay clases programadas
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {diasSemana.find(d => d.id === selectedDay)?.nombre} no tiene clases asignadas
              {selectedParalelo && ' para el paralelo seleccionado'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Agregar Primera Clase
            </Button>
          </Paper>
        </Fade>
      )}

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
              bgcolor: 'primary.main',
              width: 48,
              height: 48
            }}>
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800">
                📅 Nueva Clase en el Horario
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completa la información de la clase
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab label="📋 Información Básica" />
            <Tab label="🕐 Horario" />
            <Tab label="🏫 Ubicación" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Materia</InputLabel>
                  <Select
                    value={formData.materia_id}
                    onChange={(e) => setFormData({ ...formData, materia_id: Number(e.target.value) })}
                    label="Materia"
                    sx={{ borderRadius: 2 }}
                  >
                    {materiasMock.map((materia) => (
                      <MenuItem key={materia.id} value={materia.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: materia.color,
                              fontSize: '1rem'
                            }}
                          >
                            {materia.icono}
                          </Avatar>
                          {materia.nombre}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Profesor</InputLabel>
                  <Select
                    value={formData.profesor_id}
                    onChange={(e) => setFormData({ ...formData, profesor_id: Number(e.target.value) })}
                    label="Profesor"
                    sx={{ borderRadius: 2 }}
                  >
                    {profesoresMock.map((profesor) => (
                      <MenuItem key={profesor.id} value={profesor.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {profesor.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profesor.especialidad}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Paralelo</InputLabel>
                  <Select
                    value={formData.paralelo_id}
                    onChange={(e) => setFormData({ ...formData, paralelo_id: Number(e.target.value) })}
                    label="Paralelo"
                    sx={{ borderRadius: 2 }}
                  >
                    {paralelosMock.map((paralelo) => (
                      <MenuItem key={paralelo.id} value={paralelo.id}>
                        {paralelo.nombre} - {paralelo.grado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 2 }}>
                  Día de la semana
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {diasSemana.map((dia) => (
                    <Chip
                      key={dia.id}
                      icon={<span style={{ fontSize: '1.2rem' }}>{dia.icono}</span>}
                      label={dia.corto}
                      onClick={() => setFormData({ ...formData, dia_semana: dia.id })}
                      sx={{
                        bgcolor: formData.dia_semana === dia.id ? dia.color : alpha(dia.color, 0.1),
                        color: formData.dia_semana === dia.id ? 'white' : dia.color,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        px: 2,
                        py: 2,
                        border: `2px solid ${dia.color}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: dia.color,
                          color: 'white',
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de inicio"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de fin"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    💡 <strong>Sugerencia:</strong> Selecciona horarios de 45 minutos para clases regulares
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Número de Aula"
                  value={formData.aula}
                  onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                  placeholder="Ej: Aula 101, Lab 2, Gimnasio"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon fontSize="small" />
                    <strong>Resumen de la clase:</strong>
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {materiasMock.find(m => m.id === formData.materia_id)?.icono || '📚'}
                      <Typography variant="body2" fontWeight="600">
                        {materiasMock.find(m => m.id === formData.materia_id)?.nombre || 'Materia no seleccionada'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      👤
                      <Typography variant="body2">
                        {profesoresMock.find(p => p.id === formData.profesor_id)?.nombre || 'Profesor no seleccionado'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📅
                      <Typography variant="body2">
                        {diasSemana.find(d => d.id === formData.dia_semana)?.nombre || 'Día no seleccionado'} • {formData.hora_inicio} - {formData.hora_fin}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🏫
                      <Typography variant="body2">
                        {formData.aula || 'Aula no especificada'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}
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
          {activeTab > 0 && (
            <Button
              onClick={() => setActiveTab(activeTab - 1)}
              variant="outlined"
              size="large"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 600
              }}
            >
              Anterior
            </Button>
          )}
          {activeTab < 2 ? (
            <Button
              onClick={() => setActiveTab(activeTab + 1)}
              variant="contained"
              size="large"
              disabled={
                (activeTab === 0 && (!formData.materia_id || !formData.profesor_id || !formData.paralelo_id)) ||
                (activeTab === 1 && (!formData.dia_semana || !formData.hora_inicio || !formData.hora_fin))
              }
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                fontWeight: 700
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              variant="contained"
              size="large"
              startIcon={<CheckCircleIcon />}
              disabled={!formData.aula}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.success.main, 0.5)}`,
                }
              }}
            >
              Guardar Clase
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

export default Horarios;
