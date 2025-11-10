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
  Edit,
  FileDownload,
  WorkspacePremium,
  Delete,
  Close,
  Save,
  Search,
  Refresh,
  Schedule,
  Star,
  StarBorder,
} from "@mui/icons-material";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Fade,
  Zoom,
  Grow,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

const API_URL = "http://localhost:3000/api";

interface Materia {
  id?: number;
  codigo?: string;
  nombre: string;
  descripcion: string;
  horas_semanales?: number;
  es_obligatoria?: boolean;
}

interface Periodo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface Nivel {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface Grado {
  id: number;
  nombre: string;
  nivel_academico_id: number;
  descripcion: string;
  orden: number;
}

interface GradoMateria {
  id: number;
  grado_id: number;
  materia_id: number;
  orden: number;
  activo: boolean;
}

export default function GestionMaterias() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [gradoMaterias, setGradoMaterias] = useState<GradoMateria[]>([]);
  
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [expandedNivel, setExpandedNivel] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Materia>({
    codigo: "",
    nombre: "",
    descripcion: "",
    horas_semanales: 4,
    es_obligatoria: true,
  });
  
  const [assignFormData, setAssignFormData] = useState({
    grado_id: "",
    materia_id: "",
    orden: 1,
    activo: true,
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMaterias(),
        loadPeriodos(),
        loadNiveles(),
        loadGrados(),
        loadGradoMaterias(),
      ]);
    } catch (error) {
      showSnackbar("Error al cargar datos del sistema", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterias = async () => {
    try {
      const response = await fetch(`${API_URL}/materias`);
      if (response.ok) {
        const data = await response.json();
        setMaterias(data);
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
      throw error;
    }
  };

  const loadPeriodos = async () => {
    try {
      const response = await fetch(`${API_URL}/periodos`);
      if (response.ok) {
        const data = await response.json();
        setPeriodos(data);
        const activo = data.find((p: Periodo) => p.activo === true);
        if (activo) setSelectedPeriodo(activo.id);
      }
    } catch (error) {
      console.error("Error cargando periodos:", error);
      throw error;
    }
  };

  const loadNiveles = async () => {
    try {
      const response = await fetch(`${API_URL}/niveles-academicos`);
      if (response.ok) {
        const data = await response.json();
        setNiveles(data.sort((a: Nivel, b: Nivel) => a.orden - b.orden));
        if (data.length > 0) setExpandedNivel(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando niveles:", error);
      throw error;
    }
  };

  const loadGrados = async () => {
    try {
      const response = await fetch(`${API_URL}/grados`);
      if (response.ok) {
        const data = await response.json();
        setGrados(data.sort((a: Grado, b: Grado) => a.orden - b.orden));
      }
    } catch (error) {
      console.error("Error cargando grados:", error);
      throw error;
    }
  };

  const loadGradoMaterias = async () => {
    try {
      const response = await fetch(`${API_URL}/grado-materias`);
      if (response.ok) {
        const data = await response.json();
        setGradoMaterias(data);
      }
    } catch (error) {
      console.error("Error cargando grado-materias:", error);
      throw error;
    }
  };

  const handleSaveMateria = async () => {
    if (!formData.nombre.trim()) {
      showSnackbar("El nombre de la materia es obligatorio", "error");
      return;
    }

    if (!formData.codigo?.trim()) {
      showSnackbar("El código de la materia es obligatorio", "error");
      return;
    }

    try {
      const url = editingMateria
        ? `${API_URL}/materias/${editingMateria.id}`
        : `${API_URL}/materias`;
      
      const method = editingMateria ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSnackbar(
          `Materia ${editingMateria ? "actualizada" : "creada"} exitosamente`,
          "success"
        );
        handleCloseDialog();
        await loadMaterias();
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      showSnackbar("Error al guardar la materia", "error");
      console.error(error);
    }
  };

  const handleDeleteMateria = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta materia?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/materias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Materia eliminada exitosamente", "success");
        await loadMaterias();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      showSnackbar("Error al eliminar la materia", "error");
      console.error(error);
    }
  };

  const handleAssignMateria = async () => {
    if (!assignFormData.grado_id || !assignFormData.materia_id) {
      showSnackbar("Debe seleccionar un grado y una materia", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grado-materias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grado_id: parseInt(assignFormData.grado_id),
          materia_id: parseInt(assignFormData.materia_id),
          orden: assignFormData.orden,
          activo: assignFormData.activo,
        }),
      });

      if (response.ok) {
        showSnackbar("Materia asignada exitosamente", "success");
        setOpenAssignDialog(false);
        await loadGradoMaterias();
        resetAssignForm();
      } else {
        throw new Error("Error al asignar");
      }
    } catch (error) {
      showSnackbar("Error al asignar la materia", "error");
      console.error(error);
    }
  };

  const handleDeleteGradoMateria = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta asignación?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grado-materias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Asignación eliminada exitosamente", "success");
        await loadGradoMaterias();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      showSnackbar("Error al eliminar la asignación", "error");
      console.error(error);
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ["ID", "Código", "Nombre", "Descripción", "Horas", "Obligatoria"],
        ...materias.map(m => [
          m.id || "",
          `"${(m.codigo || "").replace(/"/g, '""')}"`,
          `"${m.nombre.replace(/"/g, '""')}"`,
          `"${(m.descripcion || "").replace(/"/g, '""')}"`,
          m.horas_semanales || "",
          m.es_obligatoria ? "Sí" : "No"
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `materias_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSnackbar("Materias exportadas exitosamente", "success");
    } catch (error) {
      showSnackbar("Error al exportar", "error");
      console.error(error);
    }
  };

  const handleOpenDialog = (materia?: Materia) => {
    if (materia) {
      setEditingMateria(materia);
      setFormData(materia);
    } else {
      setEditingMateria(null);
      setFormData({ 
        codigo: "", 
        nombre: "", 
        descripcion: "",
        horas_semanales: 4,
        es_obligatoria: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMateria(null);
    setFormData({ 
      codigo: "", 
      nombre: "", 
      descripcion: "",
      horas_semanales: 4,
      es_obligatoria: true,
    });
  };

  const resetAssignForm = () => {
    setAssignFormData({
      grado_id: "",
      materia_id: "",
      orden: 1,
      activo: true,
    });
  };

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredMaterias = materias.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.codigo && m.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMateriasPorGrado = (gradoId: number) => {
    const asignaciones = gradoMaterias.filter(gm => gm.grado_id === gradoId && gm.activo);
    return asignaciones.map(gm => {
      const materia = materias.find(m => m.id === gm.materia_id);
      return { ...materia, ...gm };
    }).filter(m => m.nombre);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${colors.primary[500]}40`,
            }}
          >
            <LibraryBooks sx={{ color: "#fff", fontSize: "2rem" }} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary">
              Gestión de Materias
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra el currículo académico, asigna materias a grados y configura horarios
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Total Materias"
            value={materias.length}
            icon={<LibraryBooks />}
            color="primary"
            subtitle="Registradas"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Niveles Académicos"
            value={niveles.length}
            icon={<Category />}
            color="success"
            subtitle="Configurados"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Grados Activos"
            value={grados.length}
            icon={<School />}
            color="warning"
            subtitle="En sistema"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Asignaciones"
            value={gradoMaterias.filter(gm => gm.activo).length}
            icon={<WorkspacePremium />}
            color="secondary"
            subtitle="Materia-Grado"
          />
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: { md: "center" } }}>
          <TextField
            select
            label="Periodo Académico"
            value={selectedPeriodo || ""}
            onChange={(e) => setSelectedPeriodo(Number(e.target.value))}
            sx={{ minWidth: 200 }}
            size="small"
          >
            {periodos.length === 0 && (
              <MenuItem disabled>No hay periodos disponibles</MenuItem>
            )}
            {periodos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre} {p.activo && "(Activo)"}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            placeholder="Buscar materias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Recargar datos">
              <IconButton onClick={loadAllData} color="primary" size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownload />}
              onClick={handleExport}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => setOpenAssignDialog(true)}
            >
              Asignar
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nueva
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Materias Cards */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Catálogo de Materias
      </Typography>

      {filteredMaterias.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
          <LibraryBooks sx={{ fontSize: 64, color: colors.grey[500], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? "No se encontraron materias" : "No hay materias registradas"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primera materia"}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {filteredMaterias.map((materia, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={materia.id}>
              <Grow in timeout={300 + index * 100}>
                <Card
                  onMouseEnter={() => setHoveredCard(materia.id || null)}
                  onMouseLeave={() => setHoveredCard(null)}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hoveredCard === materia.id ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: hoveredCard === materia.id 
                      ? `0 12px 40px ${colors.primary[500]}30`
                      : "none",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
                      borderRadius: "12px 12px 0 0",
                      opacity: hoveredCard === materia.id ? 1 : 0,
                      transition: "opacity 0.3s",
                    }
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    {/* Header con código */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Chip 
                        label={materia.codigo} 
                        size="small" 
                        sx={{
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`,
                          color: "#fff",
                          border: "none",
                        }}
                      />
                      {materia.es_obligatoria ? (
                        <Tooltip title="Materia Obligatoria">
                          <Star sx={{ color: colors.greenAccent[500], fontSize: 20 }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Materia Electiva">
                          <StarBorder sx={{ color: colors.grey[500], fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Box>

                    {/* Nombre */}
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 1.5,
                        minHeight: 48,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {materia.nombre}
                    </Typography>

                    {/* Descripción */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        minHeight: 60,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {materia.descripcion || "Sin descripción disponible"}
                    </Typography>

                    {/* Horas semanales */}
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      }}
                    >
                      <Schedule sx={{ fontSize: 18, color: colors.blueAccent[500] }} />
                      <Typography variant="body2" fontWeight="600">
                        {materia.horas_semanales || "N/A"} horas/semana
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions 
                    sx={{ 
                      p: 2, 
                      pt: 0,
                      opacity: hoveredCard === materia.id ? 1 : 0.7,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(materia)}
                      sx={{ 
                        flex: 1,
                        color: colors.blueAccent[500],
                        "&:hover": {
                          bgcolor: `${colors.blueAccent[500]}15`,
                        }
                      }}
                    >
                      Editar
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => materia.id && handleDeleteMateria(materia.id)}
                      sx={{ 
                        color: colors.redAccent[500],
                        "&:hover": {
                          bgcolor: `${colors.redAccent[500]}15`,
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Asignaciones por Nivel */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 5 }}>
        Materias Asignadas por Nivel
      </Typography>

      {niveles.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
          <Category sx={{ fontSize: 64, color: colors.grey[500], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay niveles académicos configurados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura niveles académicos para comenzar a asignar materias
          </Typography>
        </Paper>
      ) : (
        niveles.map((nivel, nivelIndex) => {
          const gradosDelNivel = grados.filter(g => g.nivel_academico_id === nivel.id);
          const isExpanded = expandedNivel === nivel.id;

          return (
            <Fade in key={nivel.id} timeout={400 + nivelIndex * 150}>
              <Paper 
                elevation={0} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3, 
                  overflow: "hidden",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <Box
                  onClick={() => setExpandedNivel(isExpanded ? null : nivel.id)}
                  sx={{
                    p: 3,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isExpanded 
                      ? `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.blueAccent[600]}15)`
                      : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                    transition: "all 0.3s",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${colors.primary[600]}20, ${colors.blueAccent[600]}20)`,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.blueAccent[500]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${colors.primary[500]}30`,
                      }}
                    >
                      <Category sx={{ color: "#fff" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {nivel.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {gradosDelNivel.length} grados {nivel.descripcion ? `• ${nivel.descripcion}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <ExpandMore
                    sx={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                      fontSize: 32,
                      color: colors.primary[500],
                    }}
                  />
                </Box>

                <Collapse in={isExpanded} timeout={400}>
                  <Box sx={{ p: 3, pt: 2 }}>
                    {gradosDelNivel.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <School sx={{ fontSize: 48, color: colors.grey[500], mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No hay grados en este nivel
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        {gradosDelNivel.map((grado, gradoIndex) => {
                          const materiasAsignadas = getMateriasPorGrado(grado.id);
                          
                          return (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={grado.id}>
                              <Zoom in timeout={300 + gradoIndex * 100}>
                                <Paper
                                  sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    height: "100%",
                                    border: `2px solid ${colors.blueAccent[500]}30`,
                                    background: isDark 
                                      ? `linear-gradient(135deg, ${colors.primary[900]}80, ${colors.blueAccent[900]}40)`
                                      : `linear-gradient(135deg, ${colors.primary[900]}, ${colors.blueAccent[900]})`,
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "all 0.3s",
                                    "&:hover": {
                                      transform: "translateY(-4px)",
                                      boxShadow: `0 8px 24px ${colors.blueAccent[500]}25`,
                                    },
                                    "&::before": {
                                      content: '""',
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      height: 4,
                                      background: `linear-gradient(90deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                                    }
                                  }}
                                >
                                  {/* Grado Header */}
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        background: `linear-gradient(135deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: `0 4px 12px ${colors.blueAccent[500]}40`,
                                      }}
                                    >
                                      <School sx={{ color: "#fff", fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="h6" fontWeight="bold">
                                        {grado.nombre}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {materiasAsignadas.length} materias asignadas
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  {/* Materias List */}
                                  {materiasAsignadas.length > 0 ? (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                      {materiasAsignadas.map((materia: any, materiaIndex) => (
                                        <Fade in key={materia.id} timeout={200 + materiaIndex * 100}>
                                          <Box
                                            sx={{
                                              p: 2,
                                              borderRadius: 2,
                                              background: isDark 
                                                ? "rgba(255,255,255,0.05)" 
                                                : "rgba(255,255,255,0.8)",
                                              position: "relative",
                                              transition: "all 0.2s",
                                              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                                              "&:hover": {
                                                transform: "translateX(4px)",
                                                boxShadow: `0 4px 12px ${colors.primary[500]}20`,
                                                "& .delete-btn": {
                                                  opacity: 1,
                                                },
                                              },
                                            }}
                                          >
                                            {/* Materia Content */}
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                              <Box sx={{ flex: 1, pr: 1 }}>
                                                <Typography 
                                                  variant="body2" 
                                                  fontWeight="700"
                                                  sx={{ mb: 0.5 }}
                                                >
                                                  {materia.nombre}
                                                </Typography>
                                                <Typography 
                                                  variant="caption" 
                                                  color="text.secondary"
                                                  sx={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                  }}
                                                >
                                                  {materia.descripcion || "Sin descripción"}
                                                </Typography>
                                              </Box>
                                              <IconButton
                                                className="delete-btn"
                                                size="small"
                                                onClick={() => handleDeleteGradoMateria(materia.id)}
                                                sx={{
                                                  opacity: 0,
                                                  transition: "opacity 0.2s",
                                                  color: colors.redAccent[500],
                                                  p: 0.5,
                                                  "&:hover": {
                                                    bgcolor: `${colors.redAccent[500]}15`,
                                                  }
                                                }}
                                              >
                                                <Delete fontSize="small" />
                                              </IconButton>
                                            </Box>

                                            {/* Chips Info */}
                                            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                                              <Chip
                                                label={`Orden: ${materia.orden}`}
                                                size="small"
                                                sx={{
                                                  height: 24,
                                                  fontSize: "0.7rem",
                                                  fontWeight: 600,
                                                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`,
                                                  color: "#fff",
                                                  border: "none",
                                                }}
                                              />
                                              {materia.horas_semanales && (
                                                <Chip
                                                  icon={<Schedule sx={{ fontSize: 14, color: "#fff !important" }} />}
                                                  label={`${materia.horas_semanales}h/sem`}
                                                  size="small"
                                                  sx={{
                                                    height: 24,
                                                    fontSize: "0.7rem",
                                                    fontWeight: 600,
                                                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[500]})`,
                                                    color: "#fff",
                                                    border: "none",
                                                  }}
                                                />
                                              )}
                                              {materia.es_obligatoria && (
                                                <Chip
                                                  icon={<Star sx={{ fontSize: 14, color: "#fff !important" }} />}
                                                  label="Obligatoria"
                                                  size="small"
                                                  sx={{
                                                    height: 24,
                                                    fontSize: "0.7rem",
                                                    fontWeight: 600,
                                                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[500]})`,
                                                    color: "#fff",
                                                    border: "none",
                                                  }}
                                                />
                                              )}
                                            </Box>
                                          </Box>
                                        </Fade>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Box 
                                      sx={{ 
                                        textAlign: "center", 
                                        py: 4,
                                        borderRadius: 2,
                                        border: `2px dashed ${colors.grey[500]}50`,
                                      }}
                                    >
                                      <LibraryBooks sx={{ fontSize: 40, color: colors.grey[500], mb: 1, opacity: 0.5 }} />
                                      <Typography variant="body2" color="text.secondary">
                                        No hay materias asignadas
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => setOpenAssignDialog(true)}
                                        sx={{ mt: 2 }}
                                      >
                                        Asignar primera materia
                                      </Button>
                                    </Box>
                                  )}
                                </Paper>
                              </Zoom>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </Fade>
          );
        })
      )}

      {/* ========================= DIALOG CREAR/EDITAR MATERIA ========================= */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              {editingMateria ? "Editar Materia" : "Nueva Materia"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Código *"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              helperText="Código único de la materia (ej: MAT-101)"
            />
            <TextField
              fullWidth
              label="Nombre de la Materia *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              helperText="Nombre oficial de la materia"
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              helperText="Descripción opcional de la materia"
            />
            <TextField
              fullWidth
              type="number"
              label="Horas Semanales"
              value={formData.horas_semanales}
              onChange={(e) => setFormData({ ...formData, horas_semanales: Number(e.target.value) })}
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              helperText="Cantidad de horas por semana (1-20)"
            />
            <TextField
              select
              fullWidth
              label="Tipo de Materia"
              value={formData.es_obligatoria ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, es_obligatoria: e.target.value === "true" })}
              helperText="Define si la materia es obligatoria o electiva por defecto"
            >
              <MenuItem value="true">Obligatoria</MenuItem>
              <MenuItem value="false">Electiva</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveMateria}
            variant="contained"
            startIcon={<Save />}
          >
            {editingMateria ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= DIALOG ASIGNAR MATERIA A GRADO ========================= */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              Asignar Materia a Grado
            </Typography>
            <IconButton onClick={() => setOpenAssignDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              select
              fullWidth
              label="Grado *"
              value={assignFormData.grado_id}
              onChange={(e) => setAssignFormData({ ...assignFormData, grado_id: e.target.value })}
              helperText="Seleccione el grado al que desea asignar la materia"
            >
              {grados.length === 0 && (
                <MenuItem disabled>No hay grados disponibles</MenuItem>
              )}
              {grados.map((grado) => {
                const nivelNombre = niveles.find(n => n.id === grado.nivel_academico_id)?.nombre || "";
                return (
                  <MenuItem key={grado.id} value={grado.id}>
                    {grado.nombre} - {nivelNombre}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              select
              fullWidth
              label="Materia *"
              value={assignFormData.materia_id}
              onChange={(e) => setAssignFormData({ ...assignFormData, materia_id: e.target.value })}
              helperText="Seleccione la materia a asignar"
            >
              {materias.length === 0 && (
                <MenuItem disabled>No hay materias disponibles</MenuItem>
              )}
              {materias.map((materia) => (
                <MenuItem key={materia.id} value={materia.id}>
                  {materia.codigo} - {materia.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Orden en la Malla"
              value={assignFormData.orden}
              onChange={(e) => setAssignFormData({ ...assignFormData, orden: Number(e.target.value) })}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
              helperText="Orden de aparición en la malla curricular"
            />

            <TextField
              select
              fullWidth
              label="Estado"
              value={assignFormData.activo ? "true" : "false"}
              onChange={(e) => setAssignFormData({ ...assignFormData, activo: e.target.value === "true" })}
              helperText="Define si la asignación está activa"
            >
              <MenuItem value="true">Activa</MenuItem>
              <MenuItem value="false">Inactiva</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenAssignDialog(false)} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssignMateria}
            variant="contained"
            startIcon={<Save />}
            disabled={!assignFormData.grado_id || !assignFormData.materia_id}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= SNACKBAR NOTIFICATIONS ========================= */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}