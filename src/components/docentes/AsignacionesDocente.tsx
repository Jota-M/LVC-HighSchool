// components/docentes/AsignacionesDocente.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper,
  Divider,
  Stack,
  Fade,
  Zoom,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  CalendarMonth as CalendarIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import { useAsignacionesDocente } from '@/hooks/useAsignacionesDocente';
import asignacionDocenteService from '@/services/asignacionDocenteService';
import docenteService from '@/services/docenteService';
import { toast } from 'react-hot-toast';
import {
  CrearAsignacionDTO,
  ActualizarAsignacionDTO,
  CambiarDocenteDTO,
  GradoMateria,
  Paralelo,
  PeriodoAcademico,
  AsignacionDocente,
} from '@/types/asignacionDocenteTypes';
import { Docente } from '@/types/docenteTypes';

// ──────────────────────────────────────────────
// Tab panel interno (solo para el dialog edición)
// ──────────────────────────────────────────────
interface EditTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const EditTabPanel: React.FC<EditTabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export const AsignacionesDocente: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Estado general ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [editTab, setEditTab] = useState(0);

  // ── Datos catálogo ──
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [gradoMaterias, setGradoMaterias] = useState<GradoMateria[]>([]);
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);

  // ── Nueva asignación ──
  const [nuevaAsignacion, setNuevaAsignacion] = useState<CrearAsignacionDTO>({
    docente_id: 0,
    grado_materia_id: 0,
    paralelo_id: 0,
    periodo_academico_id: 0,
    es_titular: true,
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  // ── Edición ──
  const [asignacionEditando, setAsignacionEditando] = useState<AsignacionDocente | null>(null);
  const [datosEdicion, setDatosEdicion] = useState<ActualizarAsignacionDTO>({
    es_titular: true,
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });
  const [nuevoDocenteId, setNuevoDocenteId] = useState<number>(0);

  // ── Hook principal ──
  const {
    asignaciones,
    paginacion,
    isLoading,
    isUpdating,
    filters,
    actualizarFiltros,
    crear,
    actualizar,
    cambiarDocente,
    eliminar,
  } = useAsignacionesDocente({ periodo_academico_id: periodoSeleccionado || undefined });

  // ──────────────────────────────────────────────
  // Carga inicial
  // ──────────────────────────────────────────────
  useEffect(() => { cargarDatosIniciales(); }, []);

  useEffect(() => {
    if (periodoSeleccionado) {
      actualizarFiltros({ periodo_academico_id: periodoSeleccionado, page: 1 });
    }
  }, [periodoSeleccionado]);

  const cargarDatosIniciales = async () => {
    setIsLoadingData(true);
    try {
      const [periodosData, gradoMateriasData, docentesData] = await Promise.all([
        asignacionDocenteService.datosAcademicos.obtenerPeriodos(true),
        asignacionDocenteService.datosAcademicos.obtenerGradoMaterias(),
        docenteService.listar({ activo: true, limit: 1000 }),
      ]);

      setPeriodos(periodosData);
      setGradoMaterias(gradoMateriasData);
      setDocentes(docentesData.data.docentes);

      const periodoActivo = periodosData.find((p: PeriodoAcademico) => p.activo);
      if (periodoActivo) setPeriodoSeleccionado(periodoActivo.id);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setIsLoadingData(false);
    }
  };

  const cargarParalelos = async (gradoId: number) => {
    try {
      const periodo = periodos.find(p => p.id === periodoSeleccionado);
      const anio = periodo ? new Date(periodo.fecha_inicio).getFullYear() : undefined;
      const paralelosData = await asignacionDocenteService.datosAcademicos.obtenerParalelosPorGrado(
        gradoId, anio,
      );
      setParalelos(paralelosData);
    } catch (error) {
      toast.error('Error al cargar paralelos');
    }
  };

  // ──────────────────────────────────────────────
  // Handlers — Crear
  // ──────────────────────────────────────────────
  const handleOpenDialog = () => {
    if (!periodoSeleccionado) { toast.error('Selecciona un periodo académico primero'); return; }
    setNuevaAsignacion({
      docente_id: 0,
      grado_materia_id: 0,
      paralelo_id: 0,
      periodo_academico_id: periodoSeleccionado,
      es_titular: true,
      fecha_inicio: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setParalelos([]);
    setNuevaAsignacion({
      docente_id: 0,
      grado_materia_id: 0,
      paralelo_id: 0,
      periodo_academico_id: periodoSeleccionado || 0,
      es_titular: true,
      fecha_inicio: new Date().toISOString().split('T')[0],
    });
  };

  const handleInputChange = (field: keyof CrearAsignacionDTO, value: any) => {
    setNuevaAsignacion(prev => ({ ...prev, [field]: value }));
    if (field === 'grado_materia_id' && value) {
      const gm = gradoMaterias.find(g => g.id === value);
      if (gm) {
        setParalelos([]);
        setNuevaAsignacion(prev => ({ ...prev, grado_materia_id: value, paralelo_id: 0 }));
        cargarParalelos(gm.grado_id);
      }
    }
  };

  const handleCrearAsignacion = async () => {
    if (!nuevaAsignacion.docente_id) { toast.error('Selecciona un docente'); return; }
    if (!nuevaAsignacion.grado_materia_id) { toast.error('Selecciona una materia'); return; }
    if (!nuevaAsignacion.paralelo_id) { toast.error('Selecciona un paralelo'); return; }
    const success = await crear(nuevaAsignacion);
    if (success) handleCloseDialog();
  };

  // ──────────────────────────────────────────────
  // Handlers — Editar
  // ──────────────────────────────────────────────
  const handleOpenEditDialog = (asignacion: AsignacionDocente) => {
    setAsignacionEditando(asignacion);
    setDatosEdicion({
      es_titular: asignacion.es_titular,
      fecha_inicio: asignacion.fecha_inicio ?? '',
      fecha_fin: asignacion.fecha_fin ?? '',
      activo: asignacion.activo,
    });
    setNuevoDocenteId(asignacion.docente_id);
    setEditTab(0);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setAsignacionEditando(null);
    setNuevoDocenteId(0);
  };

  const handleGuardarEdicion = async () => {
    if (!asignacionEditando) return;

    // Construir solo los campos que cambiaron
    const payload: ActualizarAsignacionDTO = {};
    if (datosEdicion.es_titular !== asignacionEditando.es_titular) payload.es_titular = datosEdicion.es_titular;
    if (datosEdicion.activo !== asignacionEditando.activo) payload.activo = datosEdicion.activo;
    if ((datosEdicion.fecha_inicio ?? '') !== (asignacionEditando.fecha_inicio ?? '')) payload.fecha_inicio = datosEdicion.fecha_inicio || undefined;
    if ((datosEdicion.fecha_fin ?? '') !== (asignacionEditando.fecha_fin ?? '')) payload.fecha_fin = datosEdicion.fecha_fin || undefined;

    const success = await actualizar(asignacionEditando.id, payload);
    if (success) handleCloseEditDialog();
  };

  const handleCambiarDocente = async () => {
    if (!asignacionEditando) return;
    if (!nuevoDocenteId || nuevoDocenteId === asignacionEditando.docente_id) {
      toast.error('Selecciona un docente diferente');
      return;
    }
    const success = await cambiarDocente(asignacionEditando.id, { nuevo_docente_id: nuevoDocenteId });
    if (success) handleCloseEditDialog();
  };

  // ──────────────────────────────────────────────
  // Helpers visuales / tokens de estilo
  // ──────────────────────────────────────────────
  const accentColor = isDark ? '#facc15' : '#0288d1';

  // — tokens reutilizados en ambos dialogs —
  const brand = accentColor;
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const primaryBtn = {
    borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none' as const,
    background: brand, color: isDark ? '#000' : '#fff',
    boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
    '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
    '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
  };

  const cancelBtn = {
    borderRadius: '10px', color: 'text.secondary', px: 2,
    textTransform: 'none' as const, fontWeight: 600,
    '&:hover': { background: 'rgba(255,255,255,0.05)' },
  };

  const outlineBtn = {
    borderRadius: '10px', color: 'text.secondary',
    border: `1px solid ${borderField}`, px: 2,
    textTransform: 'none' as const, fontWeight: 600,
    '&:hover': { borderColor: brand, color: brand, background: alpha(brand, 0.06) },
  };

  const gradientBtn = {
    background: isDark
      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    color: isDark ? '#000' : '#fff',
    fontWeight: 600,
    textTransform: 'none' as const,
    borderRadius: '12px',
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <Box>

      {/* ── Filtros ── */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mb: 4, borderRadius: '20px',
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha('#0288d1', 0.1)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
          border: `1px solid ${alpha(accentColor, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon sx={{ color: accentColor }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Filtros</Typography>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Periodo Académico"
              value={periodoSeleccionado || ''}
              onChange={(e) => setPeriodoSeleccionado(parseInt(e.target.value))}
              sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              disabled={isLoadingData}
              size="small"
            >
              {periodos.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.nombre}
                    {p.activo && (
                      <Chip label="Activo" size="small" color="success"
                        sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={!periodoSeleccionado}
              size="large"
              sx={{
                ...gradientBtn, px: 3,
                boxShadow: `0 4px 12px ${alpha(accentColor, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${alpha(accentColor, 0.4)}`,
                },
              }}
            >
              Nueva Asignación
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ── Lista ── */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : asignaciones.length === 0 ? (
        <Fade in>
          <Paper elevation={0} sx={{
            p: 8, borderRadius: '20px', textAlign: 'center',
            background: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
          }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No hay asignaciones</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {periodoSeleccionado
                ? 'No se encontraron asignaciones para el periodo seleccionado.'
                : 'Selecciona un periodo académico para ver las asignaciones.'}
            </Typography>
            {periodoSeleccionado && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}
                sx={{ ...gradientBtn, px: 4, py: 1.5 }}>
                Crear Primera Asignación
              </Button>
            )}
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {asignaciones.map((asignacion, index) => {
            const color = asignacion.materia_color || '#0288d1';
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={asignacion.id}>
                <Zoom in style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card sx={{
                    borderRadius: '20px',
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
                      : `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
                    border: `2px solid ${alpha(color, asignacion.activo ? 0.3 : 0.15)}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: asignacion.activo ? 1 : 0.65,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 32px ${alpha(color, 0.4)}`,
                      borderColor: alpha(color, 0.6),
                    },
                  }}>
                    {/* Fondo decorativo */}
                    <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.08, transform: 'rotate(-15deg)' }}>
                      <SchoolIcon sx={{ fontSize: 150 }} />
                    </Box>

                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>

                      {/* Badge inactivo */}
                      {!asignacion.activo && (
                        <Chip label="Inactiva" size="small" color="default"
                          sx={{ position: 'absolute', top: 12, right: 12, fontSize: '0.7rem' }} />
                      )}

                      {/* Header: avatar + materia + acciones */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                        <Avatar sx={{
                          bgcolor: color, width: 56, height: 56,
                          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                        }}>
                          <SchoolIcon sx={{ fontSize: 28 }} />
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                            {asignacion.materia_nombre}
                          </Typography>
                          <Chip
                            label={asignacion.materia_codigo}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.7rem', fontWeight: 600,
                              backgroundColor: alpha(color, 0.2),
                              color,
                            }}
                          />
                        </Box>

                        {/* Botones editar / eliminar */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar asignación">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(asignacion)}
                              sx={{
                                color: accentColor,
                                backgroundColor: alpha(accentColor, 0.1),
                                '&:hover': { backgroundColor: alpha(accentColor, 0.2), transform: 'scale(1.1)' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar asignación">
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (window.confirm('¿Eliminar esta asignación?')) eliminar(asignacion.id);
                              }}
                              sx={{
                                color: '#ef4444',
                                backgroundColor: alpha('#ef4444', 0.1),
                                '&:hover': { backgroundColor: alpha('#ef4444', 0.2), transform: 'scale(1.1)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2, opacity: 0.1 }} />

                      <Stack spacing={2}>
                        {/* Docente */}
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha('#10b981', 0.15) }}>
                              <PersonIcon sx={{ fontSize: 18, color: '#10b981' }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {asignacion.docente_nombres} {asignacion.docente_apellidos}
                            </Typography>
                          </Box>
                          {asignacion.es_titular && (
                            <Chip
                              label="Docente Titular"
                              icon={<CheckIcon sx={{ fontSize: 16 }} />}
                              size="small"
                              sx={{
                                ml: 5, height: 24, fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: alpha('#10b981', 0.15), color: '#10b981',
                                border: `1px solid ${alpha('#10b981', 0.3)}`,
                              }}
                            />
                          )}
                        </Box>

                        {/* Grado / paralelo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha('#3b82f6', 0.15) }}>
                            <ClassIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {asignacion.nivel_nombre} - {asignacion.grado_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Paralelo {asignacion.paralelo_nombre} • {asignacion.turno_nombre}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Horas / estudiantes */}
                        <Box sx={{ display: 'flex', gap: 3, pt: 1 }}>
                          {asignacion.horas_semanales && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {asignacion.horas_semanales}h/sem
                              </Typography>
                            </Box>
                          )}
                          {asignacion.total_estudiantes !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GroupsIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {asignacion.total_estudiantes} estudiantes
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Paginación ── */}
      {paginacion.totalPages > 1 && (
        <Paper elevation={0} sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4, p: 2, borderRadius: '16px',
          background: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
        }}>
          <Button disabled={paginacion.page === 1} onClick={() => actualizarFiltros({ page: paginacion.page - 1 })}
            startIcon={<PrevIcon />} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Anterior
          </Button>
          <Box sx={{ px: 3, py: 1, borderRadius: '10px', backgroundColor: alpha(accentColor, 0.1), border: `1px solid ${alpha(accentColor, 0.3)}` }}>
            <Typography sx={{ fontWeight: 700 }}>Página {paginacion.page} de {paginacion.totalPages}</Typography>
          </Box>
          <Button disabled={paginacion.page === paginacion.totalPages} onClick={() => actualizarFiltros({ page: paginacion.page + 1 })}
            endIcon={<NextIcon />} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Siguiente
          </Button>
        </Paper>
      )}

      {/* ════════════════════════════════════════
          DIALOG — NUEVA ASIGNACIÓN
      ════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4 }}>
                Nueva asignación docente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', flexShrink: 0, background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Asignar docente
                </Typography>
              </Box>
            </Box>
            <Box onClick={handleCloseDialog} sx={{ width: 32, height: 32, borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`, color: 'text.secondary', transition: 'all 0.15s', '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={2.5}>
            {/* Docente */}
            <TextField fullWidth select required label="Docente"
              value={nuevaAsignacion.docente_id}
              onChange={(e) => handleInputChange('docente_id', parseInt(e.target.value))}
              sx={fieldSx}
            >
              <MenuItem value={0} disabled><em>Selecciona un docente</em></MenuItem>
              {docentes.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.nombres} {d.apellidos}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {d.codigo}{d.especialidad && ` • ${d.especialidad}`}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Materia */}
            <TextField fullWidth select required label="Materia y Grado"
              value={nuevaAsignacion.grado_materia_id}
              onChange={(e) => handleInputChange('grado_materia_id', parseInt(e.target.value))}
              sx={fieldSx}
            >
              <MenuItem value={0} disabled><em>Selecciona una materia</em></MenuItem>
              {gradoMaterias.map((gm) => (
                <MenuItem key={gm.id} value={gm.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{gm.materia_nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">{gm.nivel_nombre} - {gm.grado_nombre}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Paralelo */}
            <TextField fullWidth select required label="Paralelo"
              value={nuevaAsignacion.paralelo_id}
              onChange={(e) => handleInputChange('paralelo_id', parseInt(e.target.value))}
              disabled={!nuevaAsignacion.grado_materia_id || paralelos.length === 0}
              sx={fieldSx}
            >
              <MenuItem value={0} disabled>
                <em>{!nuevaAsignacion.grado_materia_id ? 'Selecciona una materia primero' : paralelos.length === 0 ? 'No hay paralelos para este periodo' : 'Selecciona un paralelo'}</em>
              </MenuItem>
              {paralelos.map((p) => (
                <MenuItem key={p.id} value={p.id}>Paralelo {p.nombre} - {p.turno_nombre}</MenuItem>
              ))}
            </TextField>

            {/* Fecha inicio */}
            <TextField fullWidth type="date" label="Fecha de Inicio"
              value={nuevaAsignacion.fecha_inicio}
              onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            {/* ¿Titular? */}
            <Box sx={{ p: 2, borderRadius: R, backgroundColor: alpha(brand, 0.05), border: `1px solid ${alpha(brand, 0.2)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>¿Es docente titular?</Typography>
                  <Typography variant="caption" color="text.secondary">El docente titular es el responsable principal</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[{ v: true, label: 'Sí', c: '#10b981' }, { v: false, label: 'No', c: '#ef4444' }].map(({ v, label, c }) => (
                    <Button key={label} variant={nuevaAsignacion.es_titular === v ? 'contained' : 'outlined'} size="small"
                      onClick={() => handleInputChange('es_titular', v)}
                      sx={{ borderRadius: '8px', minWidth: 60, ...(nuevaAsignacion.es_titular === v && { background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)` }) }}>
                      {label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseDialog} sx={cancelBtn}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrearAsignacion} sx={primaryBtn}>
            Crear asignación
          </Button>
        </Box>
      </Dialog>

      {/* ════════════════════════════════════════
          DIALOG — EDITAR ASIGNACIÓN
      ════════════════════════════════════════ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4 }}>
                {asignacionEditando
                  ? `${asignacionEditando.materia_nombre} · ${asignacionEditando.nivel_nombre} ${asignacionEditando.grado_nombre} P.${asignacionEditando.paralelo_nombre}`
                  : 'Editar asignación'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', flexShrink: 0, background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Editar asignación
                </Typography>
              </Box>
            </Box>
            <Box onClick={handleCloseEditDialog} sx={{ width: 32, height: 32, borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`, color: 'text.secondary', transition: 'all 0.15s', '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={editTab}
          onChange={(_, v) => setEditTab(v)}
          sx={{
            px: 3,
            borderBottom: `1px solid ${borderField}`,
            '& .MuiTabs-indicator': { backgroundColor: brand, height: 2 },
            '& .Mui-selected': { color: `${brand} !important` },
            '& .MuiTab-root': { color: 'text.secondary', textTransform: 'none', fontWeight: 600, minHeight: 48 },
          }}
        >
          <Tab icon={<ToggleOnIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Datos generales" />
          <Tab icon={<SwapIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Cambiar docente" />
        </Tabs>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3 }}>

          {/* ── Tab 0: datos generales ── */}
          <EditTabPanel value={editTab} index={0}>
            <Stack spacing={2.5}>

              {/* es_titular */}
              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha(brand, 0.05), border: `1px solid ${alpha(brand, 0.2)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Docente titular</Typography>
                    <Typography variant="caption" color="text.secondary">Responsable principal de la materia</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[{ v: true, label: 'Sí', c: '#10b981' }, { v: false, label: 'No', c: '#ef4444' }].map(({ v, label, c }) => (
                      <Button key={label} variant={datosEdicion.es_titular === v ? 'contained' : 'outlined'} size="small"
                        onClick={() => setDatosEdicion(p => ({ ...p, es_titular: v }))}
                        sx={{ borderRadius: '8px', minWidth: 60, ...(datosEdicion.es_titular === v && { background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)` }) }}>
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Estado activo */}
              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha(datosEdicion.activo ? '#10b981' : '#ef4444', 0.06), border: `1px solid ${alpha(datosEdicion.activo ? '#10b981' : '#ef4444', 0.25)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Estado de la asignación</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {datosEdicion.activo ? 'La asignación está activa y visible' : 'La asignación está desactivada'}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={datosEdicion.activo ?? true}
                        onChange={(e) => setDatosEdicion(p => ({ ...p, activo: e.target.checked }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' },
                        }}
                      />
                    }
                    label={<Chip label={datosEdicion.activo ? 'Activa' : 'Inactiva'} size="small" color={datosEdicion.activo ? 'success' : 'default'} sx={{ fontWeight: 600 }} />}
                    labelPlacement="start"
                    sx={{ mr: 0 }}
                  />
                </Box>
              </Box>

              {/* Fechas */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="date" label="Fecha de inicio"
                    value={datosEdicion.fecha_inicio || ''}
                    onChange={(e) => setDatosEdicion(p => ({ ...p, fecha_inicio: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth type="date" label="Fecha de fin (opcional)"
                    value={datosEdicion.fecha_fin || ''}
                    onChange={(e) => setDatosEdicion(p => ({ ...p, fecha_fin: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                    sx={fieldSx}
                    helperText="Déjalo vacío si no tiene fecha límite"
                  />
                </Grid>
              </Grid>

            </Stack>
          </EditTabPanel>

          {/* ── Tab 1: cambiar docente ── */}
          <EditTabPanel value={editTab} index={1}>
            <Stack spacing={2.5}>

              {/* Docente actual */}
              <Box sx={{ p: 2.5, borderRadius: R, backgroundColor: alpha('#10b981', 0.07), border: `1px solid ${alpha('#10b981', 0.25)}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  Docente actual
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {asignacionEditando?.docente_nombres} {asignacionEditando?.docente_apellidos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asignacionEditando?.especialidad ?? 'Sin especialidad registrada'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <SwapIcon sx={{ color: 'text.secondary' }} />
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* Nuevo docente */}
              <TextField
                fullWidth select label="Nuevo docente"
                value={nuevoDocenteId}
                onChange={(e) => setNuevoDocenteId(parseInt(e.target.value))}
                sx={fieldSx}
                helperText="Selecciona el docente que tomará esta asignación"
              >
                <MenuItem value={0} disabled><em>Selecciona el nuevo docente</em></MenuItem>
                {docentes
                  .filter(d => d.id !== asignacionEditando?.docente_id)
                  .map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.nombres} {d.apellidos}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.codigo}{d.especialidad && ` • ${d.especialidad}`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </TextField>

              <Alert severity="info" sx={{ borderRadius: R, background: alpha(brand, 0.08), color: brand, border: `1px solid ${alpha(brand, 0.2)}`, '& .MuiAlert-icon': { color: brand } }}>
                Al cambiar el docente se registrará el reemplazo en el historial. La asignación continuará con los mismos datos de materia y paralelo.
              </Alert>

            </Stack>
          </EditTabPanel>

        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseEditDialog} sx={cancelBtn}>Cancelar</Button>

          {editTab === 0 ? (
            <Button
              onClick={handleGuardarEdicion}
              variant="contained"
              disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={primaryBtn}
            >
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          ) : (
            <Button
              onClick={handleCambiarDocente}
              variant="contained"
              disabled={isUpdating || !nuevoDocenteId || nuevoDocenteId === asignacionEditando?.docente_id}
              startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <SwapIcon />}
              sx={primaryBtn}
            >
              {isUpdating ? 'Cambiando...' : 'Confirmar cambio'}
            </Button>
          )}
        </Box>
      </Dialog>

    </Box>
  );
};

export default AsignacionesDocente;