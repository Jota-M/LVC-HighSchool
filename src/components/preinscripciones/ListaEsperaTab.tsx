// src/components/preinscripciones/ListaEsperaTab.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  WhatsApp as WhatsAppIcon,
  Visibility as VisibilityIcon,
  HowToReg as HowToRegIcon,
  HourglassEmpty as HourglassEmptyIcon,
  School as SchoolIcon,
  Delete as DeleteIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  WarningAmber as WarningAmberIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Preinscripcion } from '@/types/preinscripcionTypes';
import { PreinscripcionCard } from './PreinscripcionCard';

interface ListaEsperaTabProps {
  preinscripciones: Preinscripcion[];
  loading: boolean;
  onRevisar: (id: number) => void;
  onPromover: (id: number, motivo?: string) => Promise<void>;
  onEliminar: (id: number) => void;
  onSnackbar: (message: string, severity?: 'success' | 'error') => void;
}

export const ListaEsperaTab: React.FC<ListaEsperaTabProps> = ({
  preinscripciones,
  loading,
  onRevisar,
  onPromover,
  onEliminar,
  onSnackbar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState('todos');
  const [turnoFilter, setTurnoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Modal para promover
  const [modalPromoverOpen, setModalPromoverOpen] = useState(false);
  const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<Preinscripcion | null>(null);
  const [motivoPromocion, setMotivoPromocion] = useState('');
  const [promoviendo, setPromoviendo] = useState(false);

  // Filtrar postulantes que están estrictamente en lista de espera (no alcanzaron cupo disponible)
  const postulantesEspera = useMemo(() => {
    return preinscripciones
      .filter((p) => {
        const estado = (p.estado || '').toLowerCase();
        // Estrictamente postulantes que entraron a lista de espera por falta de cupo
        const esListaEspera =
          estado === 'en_espera' ||
          Boolean((p as any).es_lista_espera) ||
          (Number(p.posicion_espera) > 0 && !p.tiene_cupo_asignado && estado !== 'aprobada' && estado !== 'convertida');

        return esListaEspera && estado !== 'rechazada' && estado !== 'cancelada';
      })
      .sort((a, b) => {
        const posA = Number(a.posicion_espera) || 9999;
        const posB = Number(b.posicion_espera) || 9999;
        if (posA !== posB) return posA - posB;
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
  }, [preinscripciones]);

  // Aplicar filtros
  const filteredList = useMemo(() => {
    return postulantesEspera.filter((p) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nombre = (p.estudiante_nombre || '').toLowerCase();
        const ci = (p.estudiante_ci || '').toLowerCase();
        const cod = (p.codigo_inscripcion || '').toLowerCase();
        const tutor = (p.tutor_nombre || '').toLowerCase();
        if (!nombre.includes(query) && !ci.includes(query) && !cod.includes(query) && !tutor.includes(query)) {
          return false;
        }
      }

      if (gradoFilter !== 'todos') {
        const gNombre = (p.grado_nombre || p.grado_solicitado || '').toLowerCase();
        if (!gNombre.includes(gradoFilter.toLowerCase())) return false;
      }

      if (turnoFilter !== 'todos') {
        const tNombre = (p.turno_nombre || '').toLowerCase();
        if (!tNombre.includes(turnoFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [postulantesEspera, searchTerm, gradoFilter, turnoFilter]);

  // Métricas de espera
  const stats = useMemo(() => {
    const total = postulantesEspera.length;
    const inicial = postulantesEspera.filter((p) => (p.grado_nombre || p.grado_solicitado || '').toLowerCase().includes('kínder') || (p.grado_nombre || p.grado_solicitado || '').toLowerCase().includes('kinder')).length;
    const primaria = postulantesEspera.filter((p) => (p.grado_nombre || p.grado_solicitado || '').toLowerCase().includes('primaria')).length;
    const secundaria = postulantesEspera.filter((p) => (p.grado_nombre || p.grado_solicitado || '').toLowerCase().includes('secundaria')).length;

    return { total, inicial, primaria, secundaria };
  }, [postulantesEspera]);

  // Lista de grados únicos
  const gradosUnicos = useMemo(() => {
    const set = new Set<string>();
    postulantesEspera.forEach((p) => {
      const g = p.grado_nombre || p.grado_solicitado;
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [postulantesEspera]);

  const handleOpenWhatsApp = (telefono?: string, estudiante?: string, posicion?: number) => {
    if (!telefono) return;
    const cleanNum = telefono.replace(/\D/g, '');
    const num = cleanNum.startsWith('591') ? cleanNum : `591${cleanNum}`;
    const msg = encodeURIComponent(
      `Estimado padre/tutor de ${estudiante || 'el postulante'}, nos comunicamos desde la Unidad Educativa Privada La Voz de Cristo respecto a su postulación en Lista de Espera (Turno #${posicion || 1}). Le informamos sobre el estado de disponibilidad de cupos.`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  const handleAbrirModalPromover = (p: Preinscripcion) => {
    setPostulanteSeleccionado(p);
    setMotivoPromocion('Asignación de vacante disponible por disponibilidad o liberación de cupo.');
    setModalPromoverOpen(true);
  };

  const handleConfirmarPromocion = async () => {
    if (!postulanteSeleccionado) return;
    try {
      setPromoviendo(true);
      await onPromover(postulanteSeleccionado.id, motivoPromocion);
      onSnackbar(`¡Postulante ${postulanteSeleccionado.estudiante_nombre} promovido a cupo directo con éxito!`, 'success');
      setModalPromoverOpen(false);
      setPostulanteSeleccionado(null);
    } catch (err: any) {
      onSnackbar(err.message || 'Error al promover postulante', 'error');
    } finally {
      setPromoviendo(false);
    }
  };

  return (
    <Box>
      {/* ── KPIs de Lista de Espera ── */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid rgba(245,158,11,0.25)',
              bgcolor: isDark ? alpha('#f59e0b', 0.04) : '#fffdfa',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', width: 48, height: 48 }}>
              <HourglassEmptyIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Total en Cola
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#f59e0b">
                {stats.total}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: alpha('#ec4899', 0.15), color: '#ec4899', width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Nivel Inicial
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {stats.inicial}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Nivel Primaria
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {stats.primaria}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Nivel Secundaria
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {stats.secundaria}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Barra de Filtros ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por estudiante, CI, código o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: accent, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por Grado</InputLabel>
              <Select
                value={gradoFilter}
                label="Filtrar por Grado"
                onChange={(e) => setGradoFilter(e.target.value)}
                sx={{ borderRadius: '14px' }}
              >
                <MenuItem value="todos">Todos los Grados</MenuItem>
                {gradosUnicos.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Turno</InputLabel>
              <Select
                value={turnoFilter}
                label="Turno"
                onChange={(e) => setTurnoFilter(e.target.value)}
                sx={{ borderRadius: '14px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="mañana">Mañana</MenuItem>
                <MenuItem value="tarde">Tarde</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              sx={{
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                borderRadius: '12px',
                '& .MuiToggleButton-root': {
                  borderRadius: '10px',
                  border: 'none',
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: accent,
                    color: isDark ? '#000' : '#fff',
                    '&:hover': { bgcolor: accent },
                  },
                },
              }}
            >
              <ToggleButton value="table">
                <TableRowsIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="cards">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Vista de Tabla ── */}
      {viewMode === 'table' && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '18px',
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Puesto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Postulante</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grado & Turno</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contacto Tutor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Solicitud</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((p, idx) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={`#${p.posicion_espera || idx + 1}`}
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha('#f59e0b', 0.15),
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {p.estudiante_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CI: {p.estudiante_ci || 'S/N'} • Cód: {p.codigo_inscripcion || `PRE-${p.id}`}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {p.grado_nombre || p.grado_solicitado?.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Turno: {p.turno_nombre || 'No asignado'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{p.tutor_nombre || 'Sin tutor'}</Typography>
                    {p.tutor_telefono ? (
                      <Box
                        component="span"
                        onClick={() => handleOpenWhatsApp(p.tutor_telefono, p.estudiante_nombre, p.posicion_espera || idx + 1)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          color: '#25D366',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          mt: 0.3,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <WhatsAppIcon sx={{ fontSize: 15 }} />
                        {p.tutor_telefono}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Sin teléfono</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<HowToRegIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleAbrirModalPromover(p)}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: '#fff',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                          },
                        }}
                      >
                        Promover a Cupo
                      </Button>

                      <Tooltip title="Ver expediente">
                        <IconButton
                          size="small"
                          onClick={() => onRevisar(p.id)}
                          sx={{
                            border: `1px solid ${alpha(accent, 0.4)}`,
                            color: accent,
                            borderRadius: '10px',
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar de lista">
                        <IconButton
                          size="small"
                          onClick={() => onEliminar(p.id)}
                          sx={{
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            borderRadius: '10px',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Vista de Tarjetas (Estilo Reserva Cupos) ── */}
      {viewMode === 'cards' && (
        <Grid container spacing={3}>
          {filteredList.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
              <PreinscripcionCard
                preinscripcion={p}
                onRevisar={onRevisar}
                onEliminar={onEliminar}
                onPromover={(id) => {
                  const postulante = filteredList.find((item) => item.id === id) || p;
                  handleAbrirModalPromover(postulante);
                }}
                onSnackbar={onSnackbar}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Empty State ── */}
      {filteredList.length === 0 && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={320}
          flexDirection="column"
          gap={1.5}
        >
          <HourglassEmptyIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No hay postulantes en lista de espera
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Todos los aspirantes tienen cupo asignado o no coinciden con los filtros actuales
          </Typography>
        </Box>
      )}

      {/* ── Modal de Promoción Directa (Estilo Nómina de Estudiantes) ── */}
      <Dialog
        open={modalPromoverOpen}
        onClose={() => !promoviendo && setModalPromoverOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101dff' : '#ffffff',
            border: `1.5px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.35)'}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(245, 158, 11, 0.08), 0 32px 64px rgba(0,0,0,0.85)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Header estilo Nómina */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            pt: 2.5,
            pb: 2,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            background: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha('#f59e0b', 0.85),
                  mb: 0.4,
                }}
              >
                Lista de Espera · Promoción Oficial
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '9px',
                    flexShrink: 0,
                    background: alpha('#f59e0b', 0.18),
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HowToRegIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.1, color: 'text.primary' }}>
                  Promover a Cupo Directo
                </Typography>
              </Box>
            </Box>

            {/* Botón de Cierre estilizado */}
            <Box
              onClick={() => !promoviendo && setModalPromoverOpen(false)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                cursor: promoviendo ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': {
                  background: alpha('#f59e0b', 0.15),
                  borderColor: alpha('#f59e0b', 0.4),
                  color: '#f59e0b',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Chips de Resumen del Postulante */}
          {postulanteSeleccionado && (
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                size="small"
                label={postulanteSeleccionado.estudiante_nombre}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#f59e0b', 0.15),
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Chip
                size="small"
                label={`Grado: ${postulanteSeleccionado.grado_nombre || postulanteSeleccionado.grado_solicitado?.replace(/_/g, ' ')}`}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: 'text.secondary',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                }}
              />
              <Chip
                size="small"
                label={`Turno: ${postulanteSeleccionado.turno_nombre || 'No asignado'}`}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: 'text.secondary',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Contenido */}
        <Box sx={{ p: { xs: 2.5, md: 3 }, pt: 2.5 }}>
          {postulanteSeleccionado && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Tutor a cargo: <b>{postulanteSeleccionado.tutor_nombre}</b> {postulanteSeleccionado.tutor_telefono ? `(${postulanteSeleccionado.tutor_telefono})` : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
                  ✓ El sistema reservará formalmente una vacante en el cupo correspondiente y actualizará su estado a Documentos Completos / Con Cupo Asignado.
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Motivo u Observación de la asignación"
                multiline
                rows={3}
                value={motivoPromocion}
                onChange={(e) => setMotivoPromocion(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setModalPromoverOpen(false)}
            disabled={promoviendo}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              px: 2.5,
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmarPromocion}
            disabled={promoviendo}
            startIcon={promoviendo ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <HowToRegIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              px: 3,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              },
            }}
          >
            {promoviendo ? 'Promoviendo...' : 'Confirmar Asignación de Cupo'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};
