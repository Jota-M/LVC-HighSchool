// src/components/preinscripciones/CuposTab.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Alert,
  CircularProgress,
  alpha,
  Fade,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  EventSeat as EventSeatIcon,
  Group as GroupIcon,
  Verified as VerifiedIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  PeopleAlt as PeopleAltIcon,
  HowToReg as HowToRegIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { useCupos, Cupo } from '@/hooks/useCupos';
import { CupoFormDialog } from '@/components/cupos/CupoFormDialog';
import { CupoDetalleDialog } from '@/components/cupos/CupoDetalleDialog';
import { ModalPostulantesCurso } from '@/components/preinscripciones/ModalPostulantesCurso';
import { getNivelColor, usePalette } from '@/components/reservaCupo/admin/common';
import { Preinscripcion } from '@/types/preinscripcionTypes';
import reservaCupoService, { BalanceCuposAseguradosData } from '@/services/reservaCupoService';
import api from '@/lib/api';

interface CuposTabProps {
  onSnackbar: (message: string, severity?: 'success' | 'error') => void;
  preinscripciones?: Preinscripcion[];
  onRevisar?: (id: number) => void;
}

export const CuposTab: React.FC<CuposTabProps> = ({
  onSnackbar,
  preinscripciones = [],
  onRevisar = () => {},
}) => {
  const { isDark, gold: accentColor, gradBg } = usePalette();

  const {
    cupos,
    loading,
    error,
    filters,
    stats,
    setFilters,
    fetchCupos,
    deleteCupo,
    sincronizarCupos,
  } = useCupos();

  // Diálogos de Cupo
  const [openForm, setOpenForm] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedCupo, setSelectedCupo] = useState<Cupo | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Modal de Postulantes del Curso
  const [modalPostulantesOpen, setModalPostulantesOpen] = useState(false);
  const [cupoParaModal, setCupoParaModal] = useState<Cupo | null>(null);

  // Filtros locales
  const [searchTerm, setSearchTerm] = useState('');
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);

  // Balance de continuidad de estudiantes regulares
  const [balanceAsegurados, setBalanceAsegurados] = useState<BalanceCuposAseguradosData | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const cargarBalance = async () => {
    setLoadingBalance(true);
    try {
      const data = await reservaCupoService.obtenerBalanceCuposAsegurados(2027);
      setBalanceAsegurados(data);
    } catch (err) {
      console.warn('Advertencia al cargar balance de continuidad:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    cargarBalance();

    const loadCatalogos = async () => {
      try {
        const [periodosRes, gradosRes, turnosRes] = await Promise.all([
          api.get('/public/academicos/periodo-activo'),
          api.get('/public/academicos/grados'),
          api.get('/public/academicos/turnos'),
        ]);
        setPeriodos(periodosRes.data.data?.periodo ? [periodosRes.data.data.periodo] : []);
        setGrados(gradosRes.data.data?.grados || []);
        setTurnos(turnosRes.data.data?.turnos || []);
      } catch (err) {
        console.error('Error al cargar catálogos para filtros:', err);
      }
    };
    loadCatalogos();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await sincronizarCupos(
        filters.periodo_academico_id ? Number(filters.periodo_academico_id) : undefined
      );
      await cargarBalance();
      onSnackbar(res?.message || 'Cupos sincronizados exitosamente con paralelos y reservas de continuidad', 'success');
    } catch (err: any) {
      onSnackbar(err.message || 'Error al sincronizar cupos', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = () => {
    setSelectedCupo(null);
    setOpenForm(true);
  };

  const handleEdit = (cupo: Cupo) => {
    setSelectedCupo(cupo);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este cupo? Las preinscripciones activas impedirán la eliminación.')) return;
    try {
      await deleteCupo(id);
      onSnackbar('Cupo eliminado correctamente', 'success');
    } catch (err: any) {
      onSnackbar(err.message || 'Error al eliminar cupo', 'error');
    }
  };

  const handleAbrirPostulantes = (cupo: Cupo) => {
    setCupoParaModal(cupo);
    setModalPostulantesOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedCupo(null);
    fetchCupos();
    cargarBalance();
  };

  const getOcupacionColor = (pct: number) => {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f59e0b';
    return '#10b981';
  };

  // Filtrado de cupos por texto
  const cuposFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return cupos;
    const q = searchTerm.toLowerCase();
    return cupos.filter(
      (c) =>
        (c.grado_nombre || '').toLowerCase().includes(q) ||
        (c.turno_nombre || '').toLowerCase().includes(q) ||
        (c.nivel_academico_nombre || '').toLowerCase().includes(q)
    );
  }, [cupos, searchTerm]);

  // Cómputo global de vacantes sobrantes de regulares y prioridad hermano
  const { totalSobrantesRegularesGlobal, totalPostulantesPreinscritosGlobal } = useMemo(() => {
    let sobrantes = 0;
    cupos.forEach((c) => {
      const bal = balanceAsegurados?.grados?.find((g) => g.grado_destino_id === c.grado_id);
      const conf = c.regulares_confirmados ?? bal?.total_confirmados ?? 0;
      const herm = Number(c.hermanos_confirmados || 0);
      sobrantes += Math.max(0, c.cupos_totales - conf - herm);
    });
    return {
      totalSobrantesRegularesGlobal: sobrantes,
      totalPostulantesPreinscritosGlobal: preinscripciones.length,
    };
  }, [cupos, balanceAsegurados, preinscripciones]);

  const activeFiltersCount = [
    filters.periodo_academico_id,
    filters.grado_id,
    filters.turno_id,
    !filters.solo_activos ? 'inactivos' : null,
    searchTerm.trim() ? 'search' : null,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      periodo_academico_id: undefined,
      grado_id: undefined,
      turno_id: undefined,
      solo_activos: true,
    });
  };

  // Datos para el modal del cupo activo (con regulares y hermanos)
  const modalData = useMemo(() => {
    if (!cupoParaModal) return null;
    const balGrado = balanceAsegurados?.grados?.find(
      (g) =>
        g.grado_destino_id === cupoParaModal.grado_id ||
        g.grado_nombre?.toLowerCase() === cupoParaModal.grado_nombre?.toLowerCase()
    );

    let regInscritos = balGrado?.total_asegurados || 0;
    let regConfirmados = cupoParaModal.regulares_confirmados ?? balGrado?.total_confirmados ?? 0;

    const esManana = (cupoParaModal.turno_nombre || '').toLowerCase().includes('mañana') || (cupoParaModal.turno_nombre || '').toLowerCase().includes('manana');
    const esTarde = (cupoParaModal.turno_nombre || '').toLowerCase().includes('tarde');

    if (esManana && balGrado?.turnos?.manana?.asegurados) {
      regInscritos = balGrado.turnos.manana.asegurados;
      if (cupoParaModal.regulares_confirmados === undefined) regConfirmados = balGrado.turnos.manana.confirmados;
    } else if (esTarde && balGrado?.turnos?.tarde?.asegurados) {
      regInscritos = balGrado.turnos.tarde.asegurados;
      if (cupoParaModal.regulares_confirmados === undefined) regConfirmados = balGrado.turnos.tarde.confirmados;
    }

    const aforoTotal = cupoParaModal.cupos_totales || 25;
    const hermanosConfirmados = Number(cupoParaModal.hermanos_confirmados || 0);
    // Descontar tanto regulares confirmados como prioridad hermano
    const cuposSobrantes = Math.max(0, aforoTotal - regConfirmados - hermanosConfirmados);

    const postulantesCurso = preinscripciones.filter((p) => {
      const matchGrado = p.grado_id === cupoParaModal.grado_id;
      const matchTurno = !cupoParaModal.turno_id || !p.turno_preferido_id || p.turno_preferido_id === cupoParaModal.turno_id;
      return matchGrado && matchTurno;
    });

    return {
      aforoTotal,
      regularesInscritos: regInscritos,
      regularesConfirmados: regConfirmados,
      hermanosConfirmados,
      cuposSobrantes,
      postulantes: postulantesCurso,
    };
  }, [cupoParaModal, balanceAsegurados, preinscripciones]);

  return (
    <Box>
      {/* ══ HEADER PRINCIPAL ══ */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradBg,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 6px 16px ${alpha(accentColor, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <EventSeatIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={800}>
                Gestión de Cupos, Aforo y Vacantes Libres
              </Typography>
              <Chip
                size="small"
                label="Cálculo Continuidad & Postulantes"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha(accentColor, 0.15),
                  color: accentColor,
                  border: `1px solid ${alpha(accentColor, 0.3)}`,
                  fontSize: '0.68rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Calcula los cupos que sobran de alumnos regulares (confirmados vs aforo) y gestiona los postulantes preinscritos por curso. Haz clic en cualquier tarjeta para ver la nómina de postulantes.
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={() => {
                fetchCupos();
                cargarBalance();
              }}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${alpha(accentColor, 0.3)}`,
                color: alpha(accentColor, 0.9),
                backgroundColor: alpha(accentColor, 0.08),
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.18),
                  borderColor: accentColor,
                  color: accentColor,
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.2,
              py: 0.9,
              borderColor: alpha(accentColor, 0.4),
              color: accentColor,
              backgroundColor: alpha(accentColor, 0.05),
              '&:hover': {
                borderColor: accentColor,
                backgroundColor: alpha(accentColor, 0.12),
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Aforo'}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 2.6,
              py: 0.9,
              background: gradBg,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(accentColor, 0.3)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 22px ${alpha(accentColor, 0.45)}`,
              },
              transition: 'all 0.2s ease',
            }}
          >
            Nuevo Cupo
          </Button>
        </Stack>
      </Box>

      {/* ══ 4 KPIS GLOBALES ACTUALIZADOS ══ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* KPI 1: Aforo Total */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-3px)', borderColor: '#3b82f6' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
              <EventSeatIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Aforo Total Colegio
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#3b82f6', my: 0.2, fontSize: '1.6rem' }}>
              {loading ? '...' : stats.total_cupos}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Capacidad máxima en paralelos
            </Typography>
          </Paper>
        </Grid>

        {/* KPI 2: Sobran de Regulares (Cálculo clave) */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha('#10b981', 0.35)}`,
              boxShadow: isDark ? '0 2px 10px rgba(16, 185, 129, 0.12)' : '0 2px 10px rgba(16, 185, 129, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-3px)', borderColor: '#10b981' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Sobran de Regulares
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={900} sx={{ color: '#10b981', my: 0.2, fontSize: '1.6rem' }}>
              {loadingBalance ? '...' : totalSobrantesRegularesGlobal}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Vacantes liberadas para nuevos
            </Typography>
          </Paper>
        </Grid>

        {/* KPI 3: Postulantes Preinscritos */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha('#f59e0b', 0.35)}`,
              boxShadow: isDark ? '0 2px 10px rgba(245, 158, 11, 0.12)' : '0 2px 10px rgba(245, 158, 11, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-3px)', borderColor: '#f59e0b' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
              <GroupIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Postulantes Preinscritos
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#f59e0b', my: 0.2, fontSize: '1.6rem' }}>
              {totalPostulantesPreinscritosGlobal}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Nuevos postulantes en sistema
            </Typography>
          </Paper>
        </Grid>

        {/* KPI 4: Cursos / Cupos Activos */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha(accentColor, 0.35)}`,
              boxShadow: isDark ? `0 2px 10px ${alpha(accentColor, 0.12)}` : `0 2px 10px ${alpha(accentColor, 0.05)}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-3px)', borderColor: accentColor },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
              <VerifiedIcon sx={{ fontSize: 18, color: accentColor }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: accentColor, textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Cursos Parametrizados
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: accentColor, my: 0.2, fontSize: '1.6rem' }}>
              {loading ? '...' : stats.cupos_activos}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Grados y turnos con aforo activo
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ══ BARRA DE FILTROS ══ */}
      <Box
        sx={{
          p: { xs: 2, md: 2.2 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por grado o turno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& fieldset': { borderColor: alpha(isDark ? '#fff' : '#000', 0.1) },
                  '&:hover fieldset': { borderColor: alpha(accentColor, 0.4) },
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Periodo</InputLabel>
              <Select
                value={filters.periodo_academico_id || ''}
                label="Periodo"
                onChange={(e) => setFilters({ ...filters, periodo_academico_id: e.target.value || undefined })}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                }}
              >
                <MenuItem value="">Todos los periodos</MenuItem>
                {periodos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 2.2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Grado</InputLabel>
              <Select
                value={filters.grado_id || ''}
                label="Grado"
                onChange={(e) => setFilters({ ...filters, grado_id: e.target.value || undefined })}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                }}
              >
                <MenuItem value="">Todos los grados</MenuItem>
                {grados.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 1.8 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Turno</InputLabel>
              <Select
                value={filters.turno_id || ''}
                label="Turno"
                onChange={(e) => setFilters({ ...filters, turno_id: e.target.value || undefined })}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                }}
              >
                <MenuItem value="">Todos los turnos</MenuItem>
                {turnos.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.solo_activos}
                    onChange={(e) => setFilters({ ...filters, solo_activos: e.target.checked })}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" fontWeight={700} sx={{ userSelect: 'none' }}>
                    Activos
                  </Typography>
                }
                sx={{ m: 0 }}
              />

              {activeFiltersCount > 0 && (
                <Tooltip title="Limpiar todos los filtros">
                  <Button
                    size="small"
                    onClick={resetFilters}
                    startIcon={<ClearIcon fontSize="inherit" />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      borderRadius: '10px',
                      color: 'text.secondary',
                      p: 0.5,
                      minWidth: 'auto',
                    }}
                  >
                    Limpiar
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
          {error}
        </Alert>
      )}

      {/* ══ GRID DE TARJETAS DE CURSO CON CÁLCULO CLAVE ══ */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rectangular"
                height={340}
                sx={{ borderRadius: '18px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
              />
            </Grid>
          ))}
        </Grid>
      ) : cuposFiltrados.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '18px',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <EventSeatIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No se encontraron cupos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
            No hay registros de aforo para los criterios aplicados. Haz clic en Crear Nuevo Cupo para habilitar vacantes.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              background: gradBg,
              color: isDark ? '#000' : '#fff',
              mt: 1,
            }}
          >
            Crear Nuevo Cupo
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {cuposFiltrados.map((cupo) => {
            const nivelColor = getNivelColor(cupo.nivel_academico_nombre || cupo.grado_nombre);

            // Obtener balance de continuidad del curso
            const balGrado = balanceAsegurados?.grados?.find(
              (g) =>
                g.grado_destino_id === cupo.grado_id ||
                g.grado_nombre?.toLowerCase() === cupo.grado_nombre?.toLowerCase()
            );

            let regInscritos = balGrado?.total_asegurados || 0;
            let regConfirmados = cupo.regulares_confirmados ?? balGrado?.total_confirmados ?? 0;

            const esManana = (cupo.turno_nombre || '').toLowerCase().includes('mañana') || (cupo.turno_nombre || '').toLowerCase().includes('manana');
            const esTarde = (cupo.turno_nombre || '').toLowerCase().includes('tarde');

            if (esManana && balGrado?.turnos?.manana?.asegurados) {
              regInscritos = balGrado.turnos.manana.asegurados;
              if (cupo.regulares_confirmados === undefined) regConfirmados = balGrado.turnos.manana.confirmados;
            } else if (esTarde && balGrado?.turnos?.tarde?.asegurados) {
              regInscritos = balGrado.turnos.tarde.asegurados;
              if (cupo.regulares_confirmados === undefined) regConfirmados = balGrado.turnos.tarde.confirmados;
            }

            // Hermanos confirmados (de reserva_cupo_hermano - Prioridad Hermano)
            const hermanosConfirmados = Number(cupo.hermanos_confirmados || 0);

            // Aforo total
            const aforo = cupo.cupos_totales;

            // 🌟 CÁLCULO CLAVE: Cupos que sobran tras descontar regulares confirmados Y prioridad hermanos
            // Ejemplo: Aforo 25, regulares confirmados 0 (p.ej. primera sección), prioridad hermanos 5 -> Quedan 20 cupos sobrantes para nuevos postulantes
            const cuposSobrantes = Math.max(0, aforo - regConfirmados - hermanosConfirmados);

            // Postulantes preinscritos que aplicaron a este grado y turno
            const postulantesCurso = preinscripciones.filter((p) => {
              const matchGrado = p.grado_id === cupo.grado_id;
              const matchTurno = !cupo.turno_id || !p.turno_preferido_id || p.turno_preferido_id === cupo.turno_id;
              return matchGrado && matchTurno;
            });

            const postConCupo = postulantesCurso.filter((p) => p.tiene_cupo_asignado || (p as any).tiene_cupo || p.estado === 'aprobada').length;
            const postEnEspera = postulantesCurso.filter((p) => p.estado === 'en_espera').length;

            // Vacantes que aún quedan libres para nuevos ingresos
            const vacantesLibresFinales = Math.max(0, cuposSobrantes - postConCupo);

            // Ocupación total sobre aforo (Regulares confirmados + prioridad hermanos confirmados + nuevos con cupo)
            const ocupadosTotales = regConfirmados + hermanosConfirmados + postConCupo;
            const pctOcupacionTotal = aforo > 0 ? (ocupadosTotales / aforo) * 100 : 0;
            const ocupColor = getOcupacionColor(pctOcupacionTotal);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cupo.id}>
                <Fade in timeout={300}>
                  <Card
                    onClick={() => handleAbrirPostulantes(cupo)}
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1px solid ${alpha(nivelColor, cupo.activo ? 0.35 : 0.15)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      opacity: cupo.activo ? 1 : 0.75,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: nivelColor,
                        boxShadow: `0 10px 26px ${alpha(nivelColor, 0.25)}`,
                        '& .btn-ver-postulantes': {
                          background: gradBg,
                          color: isDark ? '#000' : '#fff',
                          borderColor: 'transparent',
                        },
                      },
                    }}
                  >
                    {/* Badge de Nivel arriba a la izquierda */}
                    <Chip
                      label={cupo.nivel_academico_nombre || (cupo.grado_nombre?.toLowerCase().includes('secund') ? 'Secundaria' : cupo.grado_nombre?.toLowerCase().includes('inicial') || cupo.grado_nombre?.toLowerCase().includes('kinder') ? 'Inicial' : 'Primaria')}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        fontWeight: 800,
                        fontSize: '0.62rem',
                        height: 20,
                        backgroundColor: alpha(nivelColor, 0.12),
                        color: nivelColor,
                        border: `1px solid ${alpha(nivelColor, 0.25)}`,
                      }}
                    />

                    {/* Chips de Sobrantes y Estado arriba a la derecha */}
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={`${cuposSobrantes} para nuevos`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: alpha('#10b981', 0.18),
                          color: '#10b981',
                          border: `1px solid ${alpha('#10b981', 0.35)}`,
                        }}
                      />
                      <Chip
                        label={cupo.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: cupo.activo
                            ? alpha('#10b981', 0.15)
                            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          color: cupo.activo ? '#10b981' : 'text.disabled',
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2, pt: 4.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Avatar circular con gradiente del nivel */}
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            margin: '0 auto',
                            background: `linear-gradient(135deg, ${nivelColor}, ${alpha(nivelColor, 0.75)})`,
                            color: '#ffffff',
                            boxShadow: `0 4px 12px ${alpha(nivelColor, 0.25)}`,
                            border: `2px solid ${alpha(nivelColor, 0.2)}`,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                      </Box>

                      {/* Título de Grado */}
                      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '1rem', lineHeight: 1.2, mb: 0.2 }}>
                        {cupo.grado_nombre}
                      </Typography>

                      {/* Turno y Periodo */}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', mb: 1.5 }}>
                        {cupo.turno_nombre} • {cupo.periodo_nombre}
                      </Typography>

                      {/* ══ BLOQUE CLAVE: DESGLOSE DE CONTINUIDAD & CUPOS QUE SOBRAN ══ */}
                      <Box
                        sx={{
                          p: 1.4,
                          borderRadius: '14px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          textAlign: 'left',
                          mb: 1.2,
                        }}
                      >
                        {/* Continuidad de regulares */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                            Aforo Total
                          </Typography>
                          <Typography variant="caption" fontWeight={800}>
                            {aforo} cupos
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                            Regulares (Inscritos / Conf.)
                          </Typography>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#0288d1' }}>
                            {regInscritos} / {regConfirmados}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                            Prioridad Hermanos
                          </Typography>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#e11d48' }}>
                            {hermanosConfirmados} confirmados
                          </Typography>
                        </Box>

                        {/* CAJA DESTACADA: SOBRAN PARA NUEVOS */}
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: isDark ? alpha('#10b981', 0.12) : '#ecfdf5',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block' }}>
                              Sobran para Nuevos
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'text.secondary' }}>
                              Tras regulares y hermanos
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={900} sx={{ color: '#10b981', lineHeight: 1 }}>
                            {cuposSobrantes}
                          </Typography>
                        </Box>

                        {/* Estado de Postulantes Preinscritos */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.3 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', display: 'block' }}>
                              Preinscritos
                            </Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.82rem', color: postulantesCurso.length > 0 ? '#f59e0b' : 'text.secondary' }}>
                              {postulantesCurso.length} postulantes
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', display: 'block' }}>
                              Vacantes Libres
                            </Typography>
                            <Typography variant="body2" fontWeight={900} sx={{ fontSize: '0.86rem', color: vacantesLibresFinales > 0 ? '#10b981' : '#ef4444' }}>
                              {vacantesLibresFinales} libres
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Barra de progreso de aforo total */}
                      <Box sx={{ mb: 1.5, textAlign: 'left' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                            Ocupación Total del Aforo
                          </Typography>
                          <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.65rem', color: ocupColor }}>
                            {ocupadosTotales} / {aforo} ({pctOcupacionTotal.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(pctOcupacionTotal, 100)}
                          sx={{
                            height: 5,
                            borderRadius: 2.5,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2.5,
                              bgcolor: ocupColor,
                            },
                          }}
                        />
                      </Box>

                      {/* ══ BOTÓN DESTACADO: VER POSTULANTES (CLICK EN TARJETA) ══ */}
                      <Button
                        className="btn-ver-postulantes"
                        fullWidth
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirPostulantes(cupo);
                        }}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          py: 0.8,
                          mt: 'auto',
                          mb: 1,
                          borderColor: alpha(accentColor, 0.45),
                          color: accentColor,
                          bgcolor: alpha(accentColor, 0.05),
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Ver Postulantes ({postulantesCurso.length})
                      </Button>

                      {/* Acciones auxiliares: Editar / Eliminar */}
                      <Stack direction="row" spacing={1} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Editar aforo y cupo">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(cupo)}
                            sx={{
                              borderRadius: '10px',
                              border: `1px solid ${alpha('#10b981', 0.4)}`,
                              color: '#10b981',
                              bgcolor: alpha('#10b981', 0.05),
                              '&:hover': { bgcolor: '#10b981', color: '#fff' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            cupo.cupos_ocupados > 0
                              ? 'No se puede eliminar: tiene cupos asignados'
                              : 'Eliminar cupo'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(cupo.id)}
                              disabled={cupo.cupos_ocupados > 0}
                              sx={{
                                borderRadius: '10px',
                                border: `1px solid ${
                                  cupo.cupos_ocupados > 0
                                    ? alpha(isDark ? '#fff' : '#000', 0.1)
                                    : alpha('#ef4444', 0.4)
                                }`,
                                color: cupo.cupos_ocupados > 0 ? 'text.disabled' : '#ef4444',
                                bgcolor: cupo.cupos_ocupados > 0 ? 'transparent' : alpha('#ef4444', 0.05),
                                '&:hover': {
                                  bgcolor: cupo.cupos_ocupados > 0 ? 'transparent' : '#ef4444',
                                  color: cupo.cupos_ocupados > 0 ? 'text.disabled' : '#fff',
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ══ MODAL DE POSTULANTES DEL CURSO (CLICK EN TARJETA) ══ */}
      {modalData && (
        <ModalPostulantesCurso
          open={modalPostulantesOpen}
          onClose={() => {
            setModalPostulantesOpen(false);
            setCupoParaModal(null);
          }}
          cupo={cupoParaModal}
          postulantes={modalData.postulantes}
          aforoTotal={modalData.aforoTotal}
          regularesInscritos={modalData.regularesInscritos}
          regularesConfirmados={modalData.regularesConfirmados}
          hermanosConfirmados={modalData.hermanosConfirmados}
          cuposSobrantes={modalData.cuposSobrantes}
          onRevisar={(id) => {
            setModalPostulantesOpen(false);
            onRevisar(id);
          }}
          onCupoUpdated={() => {
            fetchCupos();
            cargarBalance();
          }}
        />
      )}

      {/* ══ DIALOGS DE CREACIÓN Y EDICIÓN DE CUPO ══ */}
      <CupoFormDialog
        open={openForm}
        cupo={selectedCupo}
        onClose={handleFormClose}
        onSuccess={(message) => {
          onSnackbar(message, 'success');
          handleFormClose();
        }}
      />

      <CupoDetalleDialog
        open={openDetalle}
        cupo={selectedCupo}
        onClose={() => setOpenDetalle(false)}
        onEdit={() => {
          setOpenDetalle(false);
          if (selectedCupo) handleEdit(selectedCupo);
        }}
      />
    </Box>
  );
};