// src/app/dashboard/cupos/page.tsx

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Dialog,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useCupos } from '@/hooks/useCupos';
import { CupoFormDialog } from '@/components/cupos/CupoFormDialog';
import { CupoDetalleDialog } from '@/components/cupos/CupoDetalleDialog';
import { CuposFiltros } from '@/components/cupos/CuposFiltros';

export default function CuposPage() {
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
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedCupo(null);
    setOpenForm(true);
  };

  const handleEdit = (cupo: any) => {
    setSelectedCupo(cupo);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este cupo? Las preinscripciones activas impedirán la eliminación.')) {
      return;
    }

    try {
      await deleteCupo(id);
      showSnackbar('Cupo eliminado correctamente', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Error al eliminar cupo', 'error');
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

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'error';
    if (porcentaje >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* HEADER */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Gestión de Cupos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra los cupos disponibles por periodo, grado y turno
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Actualizar">
              <IconButton 
                onClick={fetchCupos}
                sx={{ 
                  bgcolor: 'success.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'success.dark' }
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
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 3,
              }}
            >
              Nuevo Cupo
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ESTADÍSTICAS */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea15 0%, #667eea05 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#667eea20', borderRadius: 2, p: 1.5 }}>
                  <SchoolIcon sx={{ color: '#667eea', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#667eea">
                    {stats.total_cupos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cupos
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4facfe15 0%, #4facfe05 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#4facfe20', borderRadius: 2, p: 1.5 }}>
                  <PeopleIcon sx={{ color: '#4facfe', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#4facfe">
                    {stats.cupos_disponibles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disponibles
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f093fb15 0%, #f093fb05 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#f093fb20', borderRadius: 2, p: 1.5 }}>
                  <EventIcon sx={{ color: '#f093fb', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#f093fb">
                    {stats.cupos_ocupados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ocupados
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #fa709a15 0%, #fa709a05 100%)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: '#fa709a20', borderRadius: 2, p: 1.5 }}>
                  <SchoolIcon sx={{ color: '#fa709a', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#fa709a">
                    {stats.cupos_activos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activos
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTROS */}
      <CuposFiltros 
        filters={filters}
        onFilterChange={(partialFilters) => setFilters({ ...filters, ...partialFilters })}
        resultCount={cupos.length}
      />

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* LISTA DE CUPOS */}
      <Grid container spacing={3}>
        {cupos.map((cupo) => {
          const porcentajeOcupacion = (cupo.cupos_ocupados / cupo.cupos_totales) * 100;
          
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cupo.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  transition: 'all 0.3s',
                  border: '2px solid',
                  borderColor: cupo.activo ? '#667eea40' : '#ccc',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{ 
                  height: 6, 
                  background: cupo.activo 
                    ? 'linear-gradient(90deg, #667eea, #764ba2)' 
                    : '#ccc',
                }} />
                
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} mb={0.5}>
                        {cupo.grado_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cupo.turno_nombre} • {cupo.periodo_nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={cupo.activo ? 'Activo' : 'Inactivo'} 
                      size="small"
                      color={cupo.activo ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  {/* BARRA DE PROGRESO */}
                  <Box mb={2}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Ocupación
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={getOcupacionColor(porcentajeOcupacion) + '.main'}>
                        {cupo.cupos_ocupados}/{cupo.cupos_totales}
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={porcentajeOcupacion}
                      color={getOcupacionColor(porcentajeOcupacion)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 2,
                        bgcolor: '#f0f0f0',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={0.5}>
                      {porcentajeOcupacion.toFixed(1)}% ocupado • {cupo.cupos_disponibles} disponibles
                    </Typography>
                  </Box>

                  {/* ACCIONES */}
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewDetalle(cupo)}
                        sx={{ 
                          border: '2px solid #667eea',
                          color: '#667eea',
                          '&:hover': { bgcolor: '#667eea', color: '#fff' }
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
                          border: '2px solid #4facfe',
                          color: '#4facfe',
                          '&:hover': { bgcolor: '#4facfe', color: '#fff' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(cupo.id)}
                        disabled={cupo.cupos_ocupados > 0}
                        sx={{ 
                          border: '2px solid',
                          borderColor: cupo.cupos_ocupados > 0 ? '#ccc' : 'error.main',
                          color: cupo.cupos_ocupados > 0 ? '#ccc' : 'error.main',
                          '&:hover': { 
                            bgcolor: cupo.cupos_ocupados > 0 ? 'transparent' : 'error.main',
                            color: cupo.cupos_ocupados > 0 ? '#ccc' : '#fff'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* EMPTY STATE */}
      {cupos.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <SchoolIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No hay cupos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea el primer cupo para comenzar
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ mt: 3, borderRadius: 3 }}
          >
            Crear Cupo
          </Button>
        </Box>
      )}

      {/* DIALOGS */}
      <CupoFormDialog
        open={openForm}
        cupo={selectedCupo}
        onClose={handleFormClose}
        onSuccess={(message) => {
          showSnackbar(message, 'success');
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

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}