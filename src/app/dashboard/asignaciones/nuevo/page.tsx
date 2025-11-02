"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Grid,
  Divider,
  Card,
  CardContent,
  Paper,
  LinearProgress,
  Badge,
  Tooltip,
  AvatarGroup,
  Tab,
  Tabs,
  Fade,
  Zoom,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import { keyframes } from "@mui/system";

const materias = [
  {
    id: 1,
    nombre: "Ciencias Naturales",
    emoji: "🧪",
    grado: "1er Grado",
    seccion: "A",
    horasAsignadas: 3,
    horasRequeridas: 5,
    color: "#3b82f6",
    profesor: "María González",
    estudiantes: 28,
    completo: false,
  },
  {
    id: 2,
    nombre: "Lenguaje y Literatura",
    emoji: "📘",
    grado: "1er Grado",
    seccion: "A",
    horasAsignadas: 5,
    horasRequeridas: 5,
    color: "#10b981",
    profesor: "Juan Pérez",
    estudiantes: 28,
    completo: true,
  },
  {
    id: 3,
    nombre: "Matemáticas",
    emoji: "🔢",
    grado: "1er Grado",
    seccion: "B",
    horasAsignadas: 4,
    horasRequeridas: 6,
    color: "#f59e0b",
    profesor: "Ana Rodríguez",
    estudiantes: 25,
    completo: false,
  },
  {
    id: 4,
    nombre: "Educación Física",
    emoji: "⚽",
    grado: "2do Grado",
    seccion: "A",
    horasAsignadas: 2,
    horasRequeridas: 3,
    color: "#8b5cf6",
    profesor: "Carlos Méndez",
    estudiantes: 30,
    completo: false,
  },
];

const diasSemana = [
  { nombre: "Lunes", color: "#3b82f6", horarios: ["8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00"] },
  { nombre: "Martes", color: "#10b981", horarios: ["8:00-9:00", "9:00-10:00", "10:00-11:00"] },
  { nombre: "Miércoles", color: "#f59e0b", horarios: ["8:00-9:00", "9:00-10:00"] },
  { nombre: "Jueves", color: "#ef4444", horarios: ["8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00"] },
  { nombre: "Viernes", color: "#8b5cf6", horarios: ["8:00-9:00", "9:00-10:00", "10:00-11:00"] },
];

const asignacionesDocentes = [
  {
    id: 1,
    nombre: "María González",
    avatar: "MG",
    especialidad: "Matemáticas",
    materias: ["Matemáticas - 1A", "Matemáticas - 1B", "Geometría - 2A"],
    horasSemanales: 20,
    maxHoras: 30,
    estudiantes: 85,
    color: "#3b82f6",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    avatar: "JP",
    especialidad: "Ciencias",
    materias: ["Física - 3A", "Química - 3B"],
    horasSemanales: 15,
    maxHoras: 30,
    estudiantes: 60,
    color: "#10b981",
  },
  {
    id: 3,
    nombre: "Ana Rodríguez",
    avatar: "AR",
    especialidad: "Literatura",
    materias: ["Literatura - 1A", "Literatura - 2A", "Redacción - 3A"],
    horasSemanales: 25,
    maxHoras: 30,
    estudiantes: 90,
    color: "#f59e0b",
  },
];

const estudiantesRecientes = [
  {
    nombre: "Juan Pérez Martínez",
    avatar: "JP",
    grado: "1er Grado A",
    padre: "Carlos Pérez",
    telefono: "+1 234 567 8901",
    materias: 8,
    asistencia: 95,
    color: "#f59e0b",
  },
  {
    nombre: "María López García",
    avatar: "ML",
    grado: "2do Grado B",
    padre: "Roberto López",
    telefono: "+1 234 567 8902",
    materias: 8,
    asistencia: 98,
    color: "#10b981",
  },
  {
    nombre: "Carlos Mendoza Silva",
    avatar: "CM",
    grado: "1er Grado A",
    padre: "Ana Mendoza",
    telefono: "+1 234 567 8903",
    materias: 7,
    asistencia: 88,
    color: "#3b82f6",
  },
];

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function HorariosPage() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const [tabValue, setTabValue] = useState(0);
  const [selectedMateria, setSelectedMateria] = useState<typeof materias[number] | null>(null);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState<Record<string, boolean>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleHorario = (dia: string, horario: string) => {
    const key = `${dia}-${horario}`;
    setHorariosSeleccionados(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const stats = [
    {
      title: "Materias Asignadas",
      value: "32/40",
      icon: <SchoolIcon />,
      color: "#3b82f6",
      progress: 80,
    },
    {
      title: "Horas Programadas",
      value: "156/180",
      icon: <ScheduleIcon />,
      color: "#10b981",
      progress: 87,
    },
    {
      title: "Docentes Activos",
      value: "45",
      icon: <PersonIcon />,
      color: "#f59e0b",
      progress: 100,
    },
    {
      title: "Conflictos",
      value: "3",
      icon: <WarningAmberIcon />,
      color: "#ef4444",
      progress: 15,
    },
  ];

  return (
    <Box p={{ xs: 2, sm: 3, md: 4, lg: 1 }}>
      {/* Header con estadísticas */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
              }}
            >
              Gestión de Horarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
              Período: 2024-2025 | Actualizado hace 10 min
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              sx={{
                borderColor: isDark ? colors.primary[300] : "#e2e8f0",
                "&:hover": { borderColor: "#3b82f6", background: "#3b82f615" },
              }}
            >
              Vista de Calendario
            </Button>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Nueva Asignación
            </Button>
          </Box>
        </Box>

        {/* Mini Stats */}
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Zoom in timeout={300 + index * 100}>
                <Card
                  sx={{
                    background: isDark
                      ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                      : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    borderRadius: "12px",
                    border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 20px ${stat.color}25`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "10px",
                          background: `${stat.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        mt: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: isDark ? colors.grey[700] : "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}cc)`,
                          borderRadius: 2,
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabs de navegación */}
      <Box mb={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
            },
            "& .Mui-selected": {
              color: "#3b82f6",
            },
          }}
        >
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Asignar Materias" />
          <Tab icon={<ScheduleIcon />} iconPosition="start" label="Configurar Horarios" />
          <Tab icon={<GroupsIcon />} iconPosition="start" label="Asignaciones Actuales" />
        </Tabs>
      </Box>

      {/* Tab 1: Selección de Materias */}
      {tabValue === 0 && (
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}} >
              <Card
                sx={{
                  background: isDark ? colors.primary[400] : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Materias Disponibles
                  </Typography>

                  <Grid container spacing={2}>
                    {materias.map((materia, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={materia.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: "12px",
                            background: isDark ? colors.primary[500] : "#f8fafc",
                            border: `2px solid ${selectedMateria?.id === materia.id ? materia.color : isDark ? colors.primary[300] : "#e2e8f0"}`,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            animation: `${slideIn} 0.5s ease ${index * 0.1}s both`,
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: `0 8px 20px ${materia.color}20`,
                              borderColor: materia.color,
                            },
                          }}
                          onClick={() => setSelectedMateria(materia)}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: "12px",
                                  background: `${materia.color}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "1.5rem",
                                }}
                              >
                                {materia.emoji}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="700">
                                  {materia.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {materia.grado} - Sección {materia.seccion}
                                </Typography>
                              </Box>
                            </Box>

                            {materia.completo ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Completo"
                                size="small"
                                sx={{
                                  background: "#10b98115",
                                  color: "#10b981",
                                  fontWeight: 700,
                                }}
                              />
                            ) : (
                              <Chip
                                icon={<WarningAmberIcon />}
                                label="Pendiente"
                                size="small"
                                sx={{
                                  background: "#f59e0b15",
                                  color: "#f59e0b",
                                  fontWeight: 700,
                                }}
                              />
                            )}
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Profesor
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {materia.profesor}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Estudiantes
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {materia.estudiantes}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Horas
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight="700"
                                sx={{ color: materia.completo ? "#10b981" : materia.color }}
                              >
                                {materia.horasAsignadas}/{materia.horasRequeridas}
                              </Typography>
                            </Box>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={(materia.horasAsignadas / materia.horasRequeridas) * 100}
                            sx={{
                              mt: 2,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: isDark ? colors.grey[700] : "#e2e8f0",
                              "& .MuiLinearProgress-bar": {
                                background: `linear-gradient(90deg, ${materia.color}, ${materia.color}cc)`,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Tab 2: Configuración de Horarios */}
      {tabValue === 1 && (
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <Card
                sx={{
                  background: isDark ? colors.primary[400] : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Horarios Semanales
                    </Typography>
                    {selectedMateria && (
                      <Chip
                        label={`Configurando: ${selectedMateria.nombre}`}
                        sx={{
                          background: `${selectedMateria.color}15`,
                          color: selectedMateria.color,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>

                  {diasSemana.map((dia, diaIndex) => (
                    <Box
                      key={dia.nombre}
                      sx={{
                        mb: 3,
                        animation: `${fadeIn} 0.5s ease ${diaIndex * 0.1}s both`,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: dia.color,
                            boxShadow: `0 0 10px ${dia.color}`,
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight="700">
                          {dia.nombre}
                        </Typography>
                        <Chip
                          label={`${dia.horarios.length} bloques`}
                          size="small"
                          sx={{
                            background: `${dia.color}15`,
                            color: dia.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {dia.horarios.map((horario, index) => {
                          const key = `${dia.nombre}-${horario}`;
                          const isSelected = horariosSeleccionados[key];

                          return (
                            <Chip
                              key={index}
                              label={horario}
                              icon={<AccessTimeIcon />}
                              onClick={() => toggleHorario(dia.nombre, horario)}
                              sx={{
                                px: 2,
                                py: 2.5,
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                background: isSelected
                                  ? `linear-gradient(135deg, ${dia.color} 0%, ${dia.color}cc 100%)`
                                  : isDark
                                  ? colors.primary[500]
                                  : "#f8fafc",
                                color: isSelected ? "#fff" : colors.grey[100],
                                border: `2px solid ${isSelected ? dia.color : isDark ? colors.primary[300] : "#e2e8f0"}`,
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: `0 4px 12px ${dia.color}30`,
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${dia.color} 0%, ${dia.color}aa 100%)`
                                    : `${dia.color}10`,
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  ))}

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<AutorenewIcon />}
                      sx={{
                        borderColor: isDark ? colors.primary[300] : "#e2e8f0",
                        "&:hover": { borderColor: "#ef4444", background: "#ef444415" },
                      }}
                    >
                      Reiniciar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
                        },
                      }}
                    >
                      Confirmar Asignación
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Tab 3: Asignaciones Actuales */}
      {tabValue === 2 && (
        <Fade in timeout={500}>
          <Grid container spacing={3}>
            {/* Docentes */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  background: isDark ? colors.primary[400] : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Docentes Asignados
                    </Typography>
                    <Chip
                      label={`${asignacionesDocentes.length} activos`}
                      sx={{
                        background: "#3b82f615",
                        color: "#3b82f6",
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  {asignacionesDocentes.map((docente, index) => (
                    <Paper
                      key={docente.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: "12px",
                        background: isDark ? colors.primary[500] : "#f8fafc",
                        border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                        transition: "all 0.3s ease",
                        animation: `${slideIn} 0.5s ease ${index * 0.1}s both`,
                        "&:hover": {
                          transform: "translateX(8px)",
                          boxShadow: `0 4px 12px ${docente.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: `linear-gradient(135deg, ${docente.color} 0%, ${docente.color}cc 100%)`,
                              fontSize: "1.2rem",
                              fontWeight: 700,
                            }}
                          >
                            {docente.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="700">
                              {docente.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {docente.especialidad}
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" gap={1}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              sx={{
                                background: isDark ? colors.primary[400] : "#fff",
                                "&:hover": { background: "#3b82f615", color: "#3b82f6" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              sx={{
                                background: isDark ? colors.primary[400] : "#fff",
                                "&:hover": { background: "#ef444415", color: "#ef4444" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {docente.materias.map((materia, idx) => (
                          <Chip
                            key={idx}
                            label={materia}
                            size="small"
                            sx={{
                              background: `${docente.color}15`,
                              color: docente.color,
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Horas semanales
                          </Typography>
                          <Typography variant="body1" fontWeight="700">
                            {docente.horasSemanales}/{docente.maxHoras}h
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary" display="block">
                            Estudiantes
                          </Typography>
                          <Typography variant="body1" fontWeight="700">
                            {docente.estudiantes}
                          </Typography>
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={(docente.horasSemanales / docente.maxHoras) * 100}
                        sx={{
                          mt: 2,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isDark ? colors.grey[700] : "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            background: `linear-gradient(90deg, ${docente.color}, ${docente.color}cc)`,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Paper>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Estudiantes */}
            <Grid size={{xs:12, lg:6}}>
              <Card
                sx={{
                  background: isDark ? colors.primary[400] : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Estudiantes Registrados
                    </Typography>
                    <Chip
                      label={`${estudiantesRecientes.length} recientes`}
                      sx={{
                        background: "#10b98115",
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  {estudiantesRecientes.map((estudiante, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: "12px",
                        background: isDark ? colors.primary[500] : "#f8fafc",
                        border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                        transition: "all 0.3s ease",
                        animation: `${slideIn} 0.5s ease ${index * 0.1}s both`,
                        "&:hover": {
                          transform: "translateX(8px)",
                          boxShadow: `0 4px 12px ${estudiante.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: `linear-gradient(135deg, ${estudiante.color} 0%, ${estudiante.color}cc 100%)`,
                              fontSize: "1.2rem",
                              fontWeight: 700,
                            }}
                          >
                            {estudiante.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="700">
                              {estudiante.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {estudiante.grado}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip
                          label={`${estudiante.materias} materias`}
                          size="small"
                          sx={{
                            background: `${estudiante.color}15`,
                            color: estudiante.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          background: isDark ? colors.primary[400] : "#fff",
                          border: `1px solid ${isDark ? colors.primary[300] : "#e2e8f0"}`,
                          mb: 2,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Padre/Tutor
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="600">
                          {estudiante.padre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📞 {estudiante.telefono}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Asistencia
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="700"
                            sx={{
                              color: estudiante.asistencia >= 95 ? "#10b981" : estudiante.asistencia >= 85 ? "#f59e0b" : "#ef4444",
                            }}
                          >
                            {estudiante.asistencia}%
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1}>
                          <Tooltip title="Ver Horario">
                            <IconButton
                              size="small"
                              sx={{
                                background: isDark ? colors.primary[400] : "#fff",
                                "&:hover": { background: "#3b82f615", color: "#3b82f6" },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              sx={{
                                background: isDark ? colors.primary[400] : "#fff",
                                "&:hover": { background: "#10b98115", color: "#10b981" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={estudiante.asistencia}
                        sx={{
                          mt: 2,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isDark ? colors.grey[700] : "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            background:
                              estudiante.asistencia >= 95
                                ? "linear-gradient(90deg, #10b981, #10b981cc)"
                                : estudiante.asistencia >= 85
                                ? "linear-gradient(90deg, #f59e0b, #f59e0bcc)"
                                : "linear-gradient(90deg, #ef4444, #ef4444cc)",
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Paper>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Box>
  );
}