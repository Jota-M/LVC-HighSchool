'use client';
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import InfoCard from "@/app/components/DashAdmin/InfoCard";
import {
  School,
  People,
  Schedule,
  Class,
  ExpandMore,
  ExpandLess,
  Edit,
  CalendarToday,
  Add,
  UploadFile,
  FileDownload,
  GroupAdd,
  Visibility,
  AutoAwesome,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  Chip,
  Collapse,
  Paper,
  Tooltip,
  TextField,
  MenuItem,
  Container,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Animaciones personalizadas
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
  0% { opacity: 0; transform: translateY(-40px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInLeft = keyframes`
  0% { opacity: 0; transform: translateX(-40px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

interface Grade {
  name: string;
  students: number;
  paralelos: string[];
  activeParalelo: string;
}

interface Section {
  title: string;
  grades: Grade[];
  color: string;
  gradient: string;
}

interface GradeSectionProps {
  section: Section;
  openByDefault?: boolean;
  index: number;
}

const GradeSection: React.FC<GradeSectionProps> = ({
  section,
  openByDefault = false,
  index,
}) => {
  const [open, setOpen] = useState(openByDefault);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const toggle = () => setOpen(!open);

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        mt: 3,
        borderRadius: 4,
        overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
        border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
        backdropFilter: "blur(10px)",
        position: "relative",
        opacity: 0,
        animation: `${scaleIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.1}s`,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: section.color,
          boxShadow: `0 15px 40px ${section.color}30`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${section.color}, ${section.gradient})`,
          backgroundSize: "200% 100%",
          animation: isHovered ? `${shimmer} 2s linear infinite` : "none",
        },
      }}
    >
      {/* Header mejorado */}
      <Box
        onClick={toggle}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2.5,
          cursor: "pointer",
          background: isDark
            ? `linear-gradient(135deg, ${section.color}20, transparent)`
            : `linear-gradient(135deg, ${section.color}10, transparent)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${section.color}30, transparent)`,
            transition: "left 0.6s ease",
          },
          "&:hover::before": {
            left: "100%",
          },
        }}
      >
        {/* Icono mejorado */}
        <Box
          sx={{
            position: "relative",
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              background: `${section.color}30`,
              animation: isHovered ? `${pulse} 2s ease-in-out infinite` : "none",
            }}
          />
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${section.color}, ${section.gradient})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${section.color}50`,
              transition: "all 0.4s ease",
              transform: isHovered ? "rotate(360deg) scale(1.1)" : "rotate(0deg) scale(1)",
            }}
          >
            <School sx={{ color: "#fff", fontSize: "1.5rem" }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: "1.3rem",
              color: isDark ? "#fff" : "text.primary",
              mb: 0.5,
            }}
          >
            {section.title}
          </Typography>
          <Chip
            label={`${section.grades.length} grados`}
            size="small"
            sx={{
              background: `${section.color}20`,
              color: section.color,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Añadir nuevo grado" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
              }}
              sx={{
                background: `${section.color}20`,
                color: section.color,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: section.color,
                  color: "#fff",
                  transform: "rotate(90deg) scale(1.1)",
                },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              transition: "transform 0.3s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              display: "flex",
              color: section.color,
            }}
          >
            <ExpandMore />
          </Box>
        </Box>
      </Box>

      {/* Contenido expandible */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, py: 3 }}>
          <Grid container spacing={2}>
            {section.grades.map((grade, i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    borderColor: "transparent",
                    background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                    position: "relative",
                    overflow: "hidden",
                    opacity: 0,
                    animation: `${fadeInLeft} 0.5s ease forwards ${i * 0.1}s`,
                    transition: "all 0.3s ease",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: `linear-gradient(180deg, ${section.color}, ${section.gradient})`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover": {
                      borderColor: section.color,
                      background: isDark ? `${section.color}10` : `${section.color}08`,
                      transform: "translateX(5px)",
                      "&::before": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    {/* Información del grado */}
                    <Grid size={{xs:12, md:4}} >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `${section.color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: section.color,
                          }}
                        >
                          <School sx={{ fontSize: "1.2rem" }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {grade.name}
                          </Typography>
                          <Chip
                            label={`${grade.students} estudiantes`}
                            size="small"
                            icon={<People sx={{ fontSize: "0.9rem" }} />}
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              background: `${section.color}15`,
                              color: section.color,
                              mt: 0.5,
                              "& .MuiChip-icon": {
                                color: section.color,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {/* Paralelos */}
                    <Grid size={{xs:12, md:5}}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
                        PARALELOS ACTIVOS
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {grade.paralelos.map((p, j) => {
                          const isActive = grade.activeParalelo === p;
                          return (
                            <Chip
                              key={j}
                              label={`Paralelo ${p}`}
                              size="small"
                              sx={{
                                fontWeight: isActive ? "bold" : "normal",
                                background: isActive
                                  ? `linear-gradient(135deg, ${section.color}, ${section.gradient})`
                                  : isDark ? "rgba(255,255,255,0.05)" : "#e0e0e0",
                                color: isActive ? "#fff" : "text.secondary",
                                border: isActive ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#ccc"}`,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: isActive
                                    ? `0 4px 15px ${section.color}60`
                                    : "0 2px 8px rgba(0,0,0,0.1)",
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Grid>

                    {/* Acciones */}
                    <Grid size={{xs:12, md:3}}>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                        <Tooltip title="Ver calendario" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              color: colors.blueAccent[500],
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: `${colors.blueAccent[500]}20`,
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <CalendarToday fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver estudiantes" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              color: colors.greenAccent[500],
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: `${colors.greenAccent[500]}20`,
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar grado" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              color: "#ff9800",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(255, 152, 0, 0.2)",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      bgcolor: "background.paper",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: `0 4px 15px ${colors.primary[500]}20`,
      },
      "&.Mui-focused": {
        boxShadow: `0 4px 20px ${colors.primary[500]}30`,
      },
    },
  };

  const periodos = [
    { value: "2024", label: "Gestión 2024" },
    { value: "2025", label: "Gestión 2025" },
  ];

  const structure: Section[] = [
    {
      title: "Educación Inicial",
      color: colors.greenAccent[500],
      gradient: colors.greenAccent[400],
      grades: [
        { name: "Pre Kinder", students: 89, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "Kinder", students: 94, paralelos: ["A", "B", "C"], activeParalelo: "C" },
      ],
    },
    {
      title: "Educación Primaria",
      color: "#facc15",
      gradient: "#fde047",
      grades: [
        { name: "1er Primaria", students: 89, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "2do Primaria", students: 94, paralelos: ["A", "B", "C"], activeParalelo: "C" },
        { name: "3er Primaria", students: 87, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "4to Primaria", students: 91, paralelos: ["A", "B", "C"], activeParalelo: "B" },
        { name: "5to Primaria", students: 88, paralelos: ["A", "B", "C"], activeParalelo: "B" },
        { name: "6to Primaria", students: 92, paralelos: ["A", "B", "C"], activeParalelo: "A" },
      ],
    },
    {
      title: "Educación Secundaria",
      color: colors.blueAccent[500],
      gradient: colors.blueAccent[400],
      grades: [
        { name: "1ro Secundaria", students: 178, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "2do Secundaria", students: 165, paralelos: ["A", "B", "C"], activeParalelo: "B" },
        { name: "3ro Secundaria", students: 172, paralelos: ["A", "B"], activeParalelo: "A" },
        { name: "4to Secundaria", students: 158, paralelos: ["A", "B"], activeParalelo: "B" },
        { name: "5to Secundaria", students: 149, paralelos: ["A", "B"], activeParalelo: "A" },
        { name: "6to Secundaria", students: 142, paralelos: ["A", "B"], activeParalelo: "B" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo decorativo animado */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(1, 87, 155, 0.1), transparent)"
            : "radial-gradient(circle, rgba(187, 222, 251, 0.3), transparent)",
          animation: `${pulse} 8s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />

      {/* Encabezado mejorado */}
      <Box
        sx={{
          opacity: 0,
          animation: `${fadeInDown} 0.8s ease forwards`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${colors.primary[500]}50`,
              animation: `${float} 3s ease-in-out infinite`,
            }}
          >
            <Schedule sx={{ color: "#fff", fontSize: "1.8rem" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Gestión de Horarios y Paralelos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Configura la estructura académica: grados, paralelos, horarios y asignación de aulas.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Barra de acciones mejorada */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          opacity: 0,
          animation: `${fadeInUp} 0.8s ease forwards 0.2s`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Periodo Académico"
            name="periodo"
            sx={{ ...fieldStyle, width: { xs: "100%", md: "250px" } }}
            defaultValue="2025"
          >
            {periodos.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              sx={{
                borderRadius: 3,
                borderWidth: 2,
                fontWeight: 600,
                borderColor: colors.blueAccent[500],
                color: colors.blueAccent[500],
                "&:hover": {
                  borderWidth: 2,
                  borderColor: colors.blueAccent[400],
                  background: `${colors.blueAccent[500]}10`,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Importar
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              sx={{
                borderRadius: 3,
                borderWidth: 2,
                fontWeight: 600,
                borderColor: colors.greenAccent[500],
                color: colors.greenAccent[500],
                "&:hover": {
                  borderWidth: 2,
                  borderColor: colors.greenAccent[400],
                  background: `${colors.greenAccent[500]}10`,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupAdd />}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
                boxShadow: `0 4px 15px ${colors.primary[500]}40`,
                "&:hover": {
                  boxShadow: `0 6px 25px ${colors.primary[500]}50`,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Crear Paralelo
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tarjetas informativas mejoradas */}
      <Grid container spacing={3} sx={{ opacity: 0, animation: `${fadeInUp} 0.8s ease forwards 0.4s` }}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <InfoCard
            title="Total de Grados"
            value={12}
            icon={<School />}
            color="primary"
            subtitle="Incluye básica y media"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <InfoCard
            title="Paralelos Activos"
            value={24}
            icon={<Class />}
            color="success"
            subtitle="Paralelos registrados"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <InfoCard
            title="Docentes Asignados"
            value={15}
            icon={<People />}
            color="info"
            subtitle="Con horarios activos"
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}} >
          <InfoCard
            title="Horarios Configurados"
            value={18}
            icon={<Schedule />}
            color="warning"
            subtitle="Por revisar duplicados"
          />
        </Grid>
      </Grid>

      {/* Secciones académicas */}
      {structure.map((sec, idx) => (
        <GradeSection key={idx} section={sec} openByDefault={idx === 0} index={idx} />
      ))}
    </Box>
  );
}