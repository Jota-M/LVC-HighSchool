'use client';
import React, { useState } from "react";
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
} from "@mui/material";

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
  icon: React.ReactNode;
  subjects: Subject[];
}

interface CategoryProps {
  section: CategorySection;
  openByDefault?: boolean;
}

// 🧩 Componente de categoría de materias
const CategoryCard: React.FC<CategoryProps> = ({ section, openByDefault = false }) => {
  const [open, setOpen] = useState(openByDefault);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const toggle = () => setOpen(!open);

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 3,
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.default",
        boxShadow: theme.shadows[3],
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box
        onClick={toggle}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 1.5,
          cursor: "pointer",
          bgcolor: section.color,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {section.icon}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", ml: 1 }}>
          {section.title}
        </Typography>
        {open ? <ExpandLess /> : <ExpandMore />}
        <Tooltip title="Añadir nueva materia">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
            }}
            sx={{
              ml: 1,
              color: colors.blueAccent[400],
              "&:hover": { color: colors.blueAccent[300] },
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {section.description}
          </Typography>

          {section.subjects.map((subject, i) => (
            <Paper
              key={i}
              variant="outlined"
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? colors.primary[400]
                      : colors.grey[200],
                },
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {subject.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Créditos: {subject.credits} | {subject.type}
                </Typography>
              </Box>
              <Tooltip title="Editar materia">
                <IconButton size="small" color="warning">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default function Page() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "background.paper",
    },
  };

  const periodos = [
    { value: "2024", label: "Gestión 2024" },
    { value: "2025", label: "Gestión 2025" },
  ];

  const categories: CategorySection[] = [
    {
      title: "Nivel Inicial",
      description: "Vida-Tierra-Territorio, Comunidad y Sociedades, Cosmos y Pensamiento,",
      color: theme.palette.mode === "dark" ? colors.greenAccent[900] : "#d6f5d6",
      icon: <Category sx={{ color: colors.greenAccent[500] }} />,
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
      color: theme.palette.mode === "dark" ? colors.blueAccent[900] : "#fff2cc",
      icon: <LibraryBooks sx={{ color: colors.blueAccent[500] }} />,
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
      color: theme.palette.mode === "dark" ? colors.blueAccent[900] : "#cce5ff",
      icon: <School sx={{ color: colors.blueAccent[400] }} />,
      subjects: [
        { name: "Deportes", credits: 2, type: "Obligatoria" },
        { name: "Recreación", credits: 1, type: "Electiva" },
        { name: "Salud y Bienestar", credits: 2, type: "Obligatoria" },
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 🔹 Encabezado principal */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="h3" fontWeight="bold">
          Gestión de Materias 📚
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configura las materias del currículo académico, créditos y requisitos por grado.
        </Typography>
      </Box>

      {/* 🔹 Barra de acciones */}
      <Box
        sx={{
          justifyContent: "space-between",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          width: "100%",
        }}
      >
        <TextField
          select
          label="Periodo"
          name="periodo"
          sx={{ ...fieldStyle, width: { xs: "100%", md: "20%" } }}
          defaultValue="2025"
        >
          {periodos.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<UploadFile />}
            color="info"
            sx={{ borderRadius: 2 }}
          >
            Importar Materias
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            color="success"
            sx={{ borderRadius: 2 }}
          >
            Exportar Todo
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Nueva Materia
          </Button>
        </Box>
      </Box>

      {/* 🔹 Tarjetas informativas */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
        <InfoCard
          title="Total Materias"
          value={48}
          icon={<LibraryBooks />}
          color="primary"
          subtitle="Activas en currículo"
        />
        <InfoCard
          title="Materias Básicas"
          value={12}
          icon={<Category />}
          color="success"
          subtitle="Obligatorias"
        />
        <InfoCard
          title="Materias Electivas"
          value={18}
          icon={<Add />}
          color="warning"
          subtitle="Opcionales"
        />
        <InfoCard
          title="Créditos Totales"
          value={156}
          icon={<WorkspacePremium />}
          color="secondary"
          subtitle="Por año académico"
        />
      </Box>

      {/* 🔹 Categorías de materias */}
      {categories.map((cat, idx) => (
        <CategoryCard key={idx} section={cat} openByDefault={idx === 0} />
      ))}
    </Box>
  );
}
