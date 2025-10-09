'use client';
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/app/dashboard/theme";
import InfoCard from "@/app/components/DashAdmin/InfoCard";
import { School, People, Schedule, Class } from '@mui/icons-material';
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
import {
  ExpandMore,
  ExpandLess,
  Edit,
  CalendarToday,
  Add,
  UploadFile,
  FileDownload,
  GroupAdd,
} from "@mui/icons-material";

interface Grade {
  name: string;
  students: number;
  paralelos: string[];
  activeParalelo: string;
}

interface Section {
  title: string;
  grades: Grade[];
}

interface GradeSectionProps {
  section: Section;
  openByDefault?: boolean;
}

const GradeSection: React.FC<GradeSectionProps> = ({
  section,
  openByDefault = false,
}) => {
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
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 1.5,
          bgcolor:
            theme.palette.mode === "dark"
              ? colors.primary[900]
              : colors.primary[100],
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <School sx={{ mr: 1, color: colors.greenAccent[500] }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          {section.title}
        </Typography>
        {open ? <ExpandLess /> : <ExpandMore />}
        <Tooltip title="Añadir nuevo grado">
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
          {section.grades.map((grade, i) => (
            <Paper
              key={i}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? colors.primary[400]
                      : colors.grey[300],
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid 
                size={{xs:12,md:4}}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    <School
                      sx={{ mr: 1, color: colors.greenAccent[400], mb: "-2px" }}
                    />
                    {grade.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 3 }}
                  >
                    {grade.students} estudiantes
                  </Typography>
                </Grid>

                <Grid
                size={{xs:12,md:5}}
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mt: { xs: 1, md: 0 },
                  }}
                >
                  {grade.paralelos.map((p, j) => {
                    const isActive = grade.activeParalelo === p;
                    return (
                      <Chip
                        key={j}
                        label={`Paralelo ${p}`}
                        size="small"
                        color={isActive ? "primary" : "default"}
                        sx={{
                          fontWeight: isActive ? "bold" : "normal",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: isActive
                              ? colors.primary[600]
                              : colors.grey[300],
                          },
                        }}
                      />
                    );
                  })}
                </Grid>

                <Grid
                  size={{xs:12,md:3}}
                  sx={{ textAlign: { xs: "left", md: "right" } }}
                >
                  <Tooltip title="Ver calendario">
                    <IconButton size="small" color="info">
                      <CalendarToday fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver estudiantes">
                    <IconButton size="small" color="success">
                      <People fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar grado">
                    <IconButton size="small" color="warning">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
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

  const currencies = [
    { value: "2024", label: "Gestión 2024" },
    { value: "2025", label: "Gestión 2025" },
  ];

  const structure = [
    {
      title: "Educacion Inicial",
      grades:[
      { name: "Pre Kinder", students: 89, paralelos: ["A", "B", "C"], activeParalelo: "A" },
      { name: "Kinder", students: 94, paralelos: ["A", "B", "C"], activeParalelo: "C" },
      ]
    },
    {
      title: "Educación Primaria",
      grades: [
        { name: "1er Primaria", students: 89, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "2do Primaria", students: 94, paralelos: ["A", "B", "C"], activeParalelo: "C" },
        { name: "3er Primaria", students: 87, paralelos: ["A", "B", "C"], activeParalelo: "A" },
        { name: "4to Primaria", students: 91, paralelos: ["A", "B", "C"], activeParalelo: "B" },
        { name: "4to Primaria", students: 91, paralelos: ["A", "B", "C"], activeParalelo: "B" },
      ],
    },
    {
      title: "Educación Secundaria",
      grades: [
        { name: "1ro Secundaria", students: 178, paralelos: ["A", "B", "C"], activeParalelo: "A" },
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 🔹 Encabezado principal */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="h3" fontWeight="bold" >
          Gestión de Horarios y Paralelos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configura la estructura académica: grados, paralelos, horarios y asignación de aulas.
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
          {currencies.map((option) => (
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
            Importar Horarios
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
            startIcon={<GroupAdd />}
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Crear Paralelo
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
  <InfoCard
    title="Total de Grados"
    value={12}
    icon={<School />}
    color="primary"
    subtitle="Incluye básica y media"
  />
  <InfoCard
    title="Paralelos Activos"
    value={24}
    icon={<Class />}
    color="success"
    subtitle="Paralelos registrados"
  />
  <InfoCard
    title="Docentes Asignados"
    value={15}
    icon={<People />}
    color="info"
    subtitle="Con horarios activos"
  />
  <InfoCard
    title="Horarios Configurados"
    value={18}
    icon={<Schedule />}
    color="warning"
    subtitle="Por revisar duplicados"
  />
</Box>
      {/* 🔹 Secciones académicas */}
      {structure.map((sec, idx) => (
        <GradeSection key={idx} section={sec} openByDefault={idx === 0} />
      ))}
    </Box>
  );
}
