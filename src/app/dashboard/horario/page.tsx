'use client';
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import InfoCard from "@/app/components/DashAdmin/InfoCard";
import {
  School,
  Category,
  LibraryBooks,
  Add,
  ExpandMore,
  ExpandLess,
  Edit,
  FileDownload,
  UploadFile,
  WorkspacePremium,
  Delete,
  Visibility,
  TrendingUp,
  AutoAwesome,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Tooltip,
  TextField,
  MenuItem,
  Fade,
  Zoom,
} from "@mui/material";
import { keyframes } from "@mui/system";

// 🎨 Animaciones personalizadas
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

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 35px currentColor; }
`;

// 🧩 Tipos de datos
interface Subject {
  name: string;
  credits: number;
  type: "Obligatoria" | "Electiva";
}

interface CategorySection {
  title: string;
  description: string;
  color: string;
  gradientColor: string;
  icon: React.ReactNode;
  subjects: Subject[];
}

interface CategoryProps {
  section: CategorySection;
  openByDefault?: boolean;
  index: number;
}

// 🧩 Componente de categoría de materias mejorado
const CategoryCard: React.FC<CategoryProps> = ({ section, openByDefault = false, index }) => {
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
          background: `linear-gradient(90deg, ${section.color}, ${section.gradientColor})`,
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
              background: `linear-gradient(135deg, ${section.color}, ${section.gradientColor})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${section.color}50`,
              transition: "all 0.4s ease",
              transform: isHovered ? "rotate(360deg) scale(1.1)" : "rotate(0deg) scale(1)",
            }}
          >
            <Box component="span" sx={{ color: "#fff", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {section.icon}
            </Box>
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
            label={`${section.subjects.length} materias`}
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
          <Tooltip title="Añadir nueva materia" arrow>
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
          {/* Descripción */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: isDark ? `${section.color}10` : `${section.color}05`,
              borderLeft: `4px solid ${section.color}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {section.description}
            </Typography>
          </Box>

          {/* Lista de materias mejorada */}
          <Grid container spacing={2}>
            {section.subjects.map((subject, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
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
                      background: `linear-gradient(180deg, ${section.color}, ${section.gradientColor})`,
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          lineHeight: 1.4,
                          color: isDark ? "#fff" : "text.primary",
                        }}
                      >
                        {subject.name}
                      </Typography>
                    </Box>
                    
                    {/* Acciones */}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Ver detalles" arrow>
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
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar" arrow>
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
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Información adicional */}
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Chip
                      label={`${subject.credits} créditos`}
                      size="small"
                      icon={<WorkspacePremium sx={{ fontSize: "1rem" }} />}
                      sx={{
                        background: `${section.color}15`,
                        color: section.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        "& .MuiChip-icon": {
                          color: section.color,
                        },
                      }}
                    />
                    <Chip
                      label={subject.type}
                      size="small"
                      sx={{
                        background: subject.type === "Obligatoria"
                          ? `${colors.greenAccent[500]}20`
                          : `${colors.blueAccent[500]}20`,
                        color: subject.type === "Obligatoria"
                          ? colors.greenAccent[500]
                          : colors.blueAccent[500],
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
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

  const categories: CategorySection[] = [
    {
      title: "Nivel Inicial",
      description: "Vida-Tierra-Territorio, Comunidad y Sociedades, Cosmos y Pensamiento",
      color: colors.greenAccent[500],
      gradientColor: colors.greenAccent[400],
      icon: <Category />,
      subjects: [
        { name: "Desarrollo bio-psicomotris (Ciencias Naturales)", credits: 6, type: "Obligatoria" },
        { name: "Desarrollo de la Comunicacion, lenguaje y Artes (Musica, APV, CS, Recreación)", credits: 5, type: "Obligatoria" },
        { name: "Desarrollo sociocultural afectivo y espiritual", credits: 4, type: "Obligatoria" },
        { name: "Desarrollo de conocimiento y de la produccion (Matematicas-Tecnica Tecnologica)", credits: 4, type: "Obligatoria" },
      ],
    },
    {
      title: "Nivel Primario",
      description: "Música, Artes Plásticas, Talleres",
      color: "#facc15",
      gradientColor: "#fde047",
      icon: <LibraryBooks />,
      subjects: [
        { name: "COMUNICACION Y LENGUAJES LENGUA ORIGINNARIA Y EXTRANGERA", credits: 3, type: "Electiva" },
        { name: "CIENCIAS SOCIALES", credits: 2, type: "Electiva" },
        { name: "ARTES PLÁSTICAS Y VISUALES", credits: 2, type: "Electiva" },
        { name: "EDUCACIÓN FISICA Y DEPORTES", credits: 2, type: "Electiva" },
        { name: "EDUCACIÓN MUSICAL", credits: 2, type: "Electiva" },
        { name: "MATEMATICA", credits: 2, type: "Electiva" },
        { name: "TÉCNICA TECNOLÓGICA", credits: 2, type: "Electiva" },
        { name: "CIENCIAS NATURALES", credits: 2, type: "Electiva" },
        { name: "VALORES ESPIRITUALIDADES Y RELIGIONES", credits: 2, type: "Electiva" },
      ],
    },
    {
      title: "Nivel Secundario",
      description: "Fisica, Quimica, Historia",
      color: colors.blueAccent[500],
      gradientColor: colors.blueAccent[400],
      icon: <School />,
      subjects: [
        { name: "Deportes", credits: 2, type: "Obligatoria" },
        { name: "Recreación", credits: 1, type: "Electiva" },
        { name: "Salud y Bienestar", credits: 2, type: "Obligatoria" },
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
            <LibraryBooks sx={{ color: "#fff", fontSize: "1.8rem" }} />
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
              Gestión de Materias 📚
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Configura las materias del currículo académico, créditos y requisitos por grado.
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
              startIcon={<Add />}
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
              Nueva Materia
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tarjetas informativas mejoradas */}
      <Grid container spacing={3} sx={{ opacity: 0, animation: `${fadeInUp} 0.8s ease forwards 0.4s` }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Total Materias"
            value={48}
            icon={<LibraryBooks />}
            color="primary"
            subtitle="Activas en currículo"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Materias Básicas"
            value={12}
            icon={<Category />}
            color="success"
            subtitle="Obligatorias"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Materias Electivas"
            value={18}
            icon={<TrendingUp />}
            color="warning"
            subtitle="Opcionales"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <InfoCard
            title="Créditos Totales"
            value={156}
            icon={<WorkspacePremium />}
            color="secondary"
            subtitle="Por año académico"
          />
        </Grid>
      </Grid>

      {/* Categorías de materias */}
      {categories.map((cat, idx) => (
        <CategoryCard key={idx} section={cat} openByDefault={idx === 0} index={idx} />
      ))}
    </Box>
  );
}