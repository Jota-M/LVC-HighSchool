// src/components/preinscripciones/CuposTab.tsx

import React, { useState } from 'react';
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
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useCupos } from '@/hooks/useCupos';
import { CupoFormDialog } from '@/components/cupos/CupoFormDialog';
import { CupoDetalleDialog } from '@/components/cupos/CupoDetalleDialog';
import { CuposFiltros } from '@/components/cupos/CuposFiltros';
import { StatCard } from '@/components/preinscripciones/StatCard';

interface CuposTabProps {
  onSnackbar: (message: string, severity?: 'success' | 'error') => void;
}

export const CuposTab: React.FC<CuposTabProps> = ({ onSnackbar }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const {
    cupos,
    loading,
    error,
    filters,
    stats,
    setFilters,
    fetchCupos,
    deleteCupo,
  } = useCupos();

  const [openForm, setOpenForm] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedCupo, setSelectedCupo] = useState<any>(null);

  const handleCreate = () => {
    setSelectedCupo(null);
    setOpenForm(true);
  };

  const handleEdit = (cupo: any) => {
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

  const handleViewDetalle = (cupo: any) => {
    setSelectedCupo(cupo);
    setOpenDetalle(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedCupo(null);
    fetchCupos();
  };

  const getOcupacionColor = (pct: number) => {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f59e0b';
    return '#10b981';
  };

  const statCards = [
    {
      title: 'Total Cupos',
      value: stats.total_cupos,
      subtitle: 'Configurados en el sistema',
      color: accent,
      icon: <EventSeatIcon />,
      trend: '+0%',
    },
    {
      title: 'Disponibles',
      value: stats.cupos_disponibles,
      subtitle: 'Listos para asignar',
      color: '#10b981',
      icon: <PeopleIcon />,
      trend: '+0%',
    },
    {
      title: 'Ocupados',
      value: stats.cupos_ocupados,
      subtitle: 'Ya asignados',
      color: '#9c27b0',
      icon: <SchoolIcon />,
      trend: '+0%',
    },
    {
      title: 'Activos',
      value: stats.cupos_activos,
      subtitle: 'Periodos vigentes',
      color: '#0288d1',
      icon: <CheckCircleIcon />,
      trend: '+0%',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400} gap={2} flexDirection="column">
        <CircularProgress size={48} sx={{ color: accent }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Cargando cupos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Sub-header con botones de acción */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Gestión de Cupos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los cupos por periodo, grado y turno
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Actualizar">
            <IconButton
              onClick={fetchCupos}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${alpha(accent, 0.3)}`,
                color: alpha(accent, 0.8),
                backgroundColor: alpha(accent, 0.07),
                '&:hover': { backgroundColor: alpha(accent, 0.15), borderColor: accent, color: accent },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 8px 24px rgba(250,204,21,0.3)'
                  : '0 8px 24px rgba(2,136,209,0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nuevo Cupo
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Filtros */}
      <Box mb={4}>
        <CuposFiltros
          filters={filters}
          onFilterChange={(partial) => setFilters({ ...filters, ...partial })}
          resultCount={cupos.length}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Grid de cupos */}
      <Grid container spacing={3}>
        {cupos.map((cupo) => {
          const pct = (cupo.cupos_ocupados / cupo.cupos_totales) * 100;
          const ocupColor = getOcupacionColor(pct);

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cupo.id}>
              <Fade in timeout={300}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '20px',
                    border: `1px solid ${cupo.activo ? alpha(accent, 0.2) : alpha(theme.palette.divider, 0.2)}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 12px 24px ${alpha(cupo.activo ? accent : '#888', 0.2)}`,
                      borderColor: cupo.activo ? alpha(accent, 0.5) : alpha(theme.palette.divider, 0.4),
                    },
                  }}
                >
                  {/* Barra superior de color */}
                  <Box
                    sx={{
                      height: 6,
                      background: cupo.activo
                        ? isDark
                          ? 'linear-gradient(90deg, #facc15, #f59e0b)'
                          : 'linear-gradient(90deg, #0288d1, #01579b)'
                        : alpha(theme.palette.divider, 0.5),
                    }}
                  />

                  <Box sx={{ p: 3 }}>
                    {/* Header de la card */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2.5,
                      }}
                    >
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                          {cupo.grado_nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cupo.turno_nombre} • {cupo.periodo_nombre}
                        </Typography>
                      </Box>
                      <Chip
                        label={cupo.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: cupo.activo ? alpha('#10b981', 0.15) : alpha('#888', 0.15),
                          color: cupo.activo ? '#10b981' : '#888',
                        }}
                      />
                    </Box>

                    {/* Barra de ocupación */}
                    <Box
                      sx={{
                        mb: 2.5,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: alpha(ocupColor, 0.06),
                        border: `1px solid ${alpha(ocupColor, 0.15)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Ocupación
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: ocupColor }}>
                          {cupo.cupos_ocupados}/{cupo.cupos_totales}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(pct, 100)}
                        sx={{
                          height: 8,
                          borderRadius: '4px',
                          bgcolor: alpha(ocupColor, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: '4px',
                            backgroundColor: ocupColor,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                        {pct.toFixed(1)}% ocupado • {cupo.cupos_disponibles} disponibles
                      </Typography>
                    </Box>

                    {/* Acciones */}
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetalle(cupo)}
                          sx={{
                            border: `2px solid ${alpha(accent, 0.4)}`,
                            color: accent,
                            borderRadius: '10px',
                            '&:hover': { bgcolor: accent, color: isDark ? '#000' : '#fff' },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(cupo)}
                          sx={{
                            border: `2px solid ${alpha('#10b981', 0.4)}`,
                            color: '#10b981',
                            borderRadius: '10px',
                            '&:hover': { bgcolor: '#10b981', color: '#fff' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={cupo.cupos_ocupados > 0 ? 'No se puede eliminar: tiene cupos asignados' : 'Eliminar'}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(cupo.id)}
                            disabled={cupo.cupos_ocupados > 0}
                            sx={{
                              border: `2px solid ${cupo.cupos_ocupados > 0 ? alpha(theme.palette.divider, 0.3) : alpha('#ef4444', 0.4)}`,
                              color: cupo.cupos_ocupados > 0 ? 'text.disabled' : '#ef4444',
                              borderRadius: '10px',
                              '&:hover': {
                                bgcolor: cupo.cupos_ocupados > 0 ? 'transparent' : '#ef4444',
                                color: cupo.cupos_ocupados > 0 ? 'text.disabled' : '#fff',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty state */}
      {cupos.length === 0 && !loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400} flexDirection="column" gap={2}>
          <EventSeatIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">No hay cupos registrados</Typography>
          <Typography variant="body2" color="text.secondary">Crea el primer cupo para comenzar</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              mt: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            Crear Cupo
          </Button>
        </Box>
      )}

      {/* Dialogs */}
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
          handleEdit(selectedCupo);
        }}
      />
    </Box>
  );
};