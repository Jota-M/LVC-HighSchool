'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, alpha, useTheme,
  Paper, Grid, IconButton, Tooltip, Fade, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText,
  TextField, CircularProgress,
  ListItemButton
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';

// Componentes del módulo
import GradoSelector from '../../../components/plan-estudio/GradoSelector';
import PlanEstudiosStats from '../../../components/plan-estudio/PlanEstudiosStats';
import MateriaCard from '../../../components/plan-estudio/MateriaCard';
import AsignarMateriasDialog from '../../../components/plan-estudio/AsignarMateriasDialog';
import EmptyState from '../../../components/plan-estudio/EmptyState';

// Hook y servicios
import { usePlanEstudios } from '../../../hooks/usePlanEstudios';
import { useMaterias } from '../../../hooks/useMaterias';
import { GradoMateria } from '../../../services/planEstudios';

const PlanEstudios: React.FC = () => {
  const theme = useTheme();
  
  // Hooks
  const {
    niveles, grados, materiasAsignadas, materiasDisponibles, gradoSeleccionado,
    resumen, loading, loadingMaterias,
    seleccionarGrado, asignarMultiples, actualizarAsignacion, removerMateria,
    copiarPlanEstudios, refetchMaterias
  } = usePlanEstudios();

  const { areas } = useMaterias({ autoLoad: true });

  // Estados locales para diálogos
  const [openAsignar, setOpenAsignar] = useState(false);
  const [openCopiar, setOpenCopiar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [editingMateria, setEditingMateria] = useState<GradoMateria | null>(null);
  const [editForm, setEditForm] = useState({ nota_minima: 51, peso: '' });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // Handlers
  const handleAsignar = async (materiaIds: number[]) => {
    try {
      await asignarMultiples(materiaIds);
      showSnackbar(`🎉 ${materiaIds.length} materia(s) asignada(s) exitosamente`, 'success');
    } catch {
      showSnackbar('❌ Error al asignar materias', 'error');
      throw new Error();
    }
  };

  const handleRemover = async (materia: GradoMateria) => {
    if (!window.confirm(`¿Remover "${materia.materia_nombre}" del plan de estudios?`)) return;
    try {
      await removerMateria(materia.id);
      showSnackbar('🗑️ Materia removida del plan', 'info');
    } catch {
      showSnackbar('❌ Error al remover materia', 'error');
    }
  };

  const handleEditar = (materia: GradoMateria) => {
    setEditingMateria(materia);
    setEditForm({
      nota_minima: materia.nota_minima_aprobacion,
      peso: materia.peso_porcentual?.toString() || ''
    });
    setOpenEditar(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editingMateria) return;
    try {
      await actualizarAsignacion(editingMateria.id, {
        nota_minima_aprobacion: editForm.nota_minima,
        peso_porcentual: editForm.peso ? parseFloat(editForm.peso) : undefined
      });
      setOpenEditar(false);
      showSnackbar('✨ Configuración actualizada', 'success');
    } catch {
      showSnackbar('❌ Error al actualizar', 'error');
    }
  };

  const handleCopiar = async (gradoOrigenId: number) => {
    try {
      await copiarPlanEstudios(gradoOrigenId);
      setOpenCopiar(false);
      showSnackbar('📋 Plan de estudios copiado exitosamente', 'success');
    } catch {
      showSnackbar('❌ Error al copiar plan', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Contar materias por grado (para el selector)
  const materiasCountPorGrado: Record<number, number> = {};
  // Esto se podría optimizar con una llamada al backend

  return (
    <Box sx={{ 
      minHeight: '100vh',
      
      p: { xs: 2, md: 3 }
    }}>
      {/* Header Principal */}
      <Fade in timeout={600}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <SchoolIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight="800">Plan de Estudios</Typography>
                  <SparkleIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                </Box>
                <Typography color="text.secondary">
                  Gestiona las materias asignadas a cada grado académico
                </Typography>
              </Box>
            </Box>

            {gradoSeleccionado && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Actualizar">
                  <IconButton onClick={refetchMaterias} disabled={loadingMaterias}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => setOpenCopiar(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Copiar de otro grado
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAsignar(true)}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  Asignar Materias
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Contenido Principal */}
      <Grid container spacing={3}>
        {/* Panel Izquierdo - Selector de Grados */}
        <Grid size={{xs:12, md:4, lg:3}}>
          <Fade in timeout={700}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <GradoSelector
                niveles={niveles}
                grados={grados}
                gradoSeleccionado={gradoSeleccionado}
                onSelectGrado={seleccionarGrado}
                loading={loading}
                materiasCount={materiasCountPorGrado}
              />
            </Box>
          </Fade>
        </Grid>

        {/* Panel Derecho - Contenido del Plan */}
        <Grid size={{xs:12, md:8, lg:9}} >
          <Fade in timeout={800}>
            <Box>
              {!gradoSeleccionado ? (
                <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <EmptyState type="no-grado" />
                </Paper>
              ) : (
                <>
                  {/* Stats del Grado */}
                  <PlanEstudiosStats
                    grado={gradoSeleccionado}
                    resumen={resumen}
                    loading={loadingMaterias}
                  />

                  {/* Grid de Materias */}
                  <Paper sx={{ borderRadius: 4, overflow: 'hidden', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" fontWeight="700">
                        📋 Materias del Plan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {materiasAsignadas.length} materias
                      </Typography>
                    </Box>

                    {loadingMaterias ? (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                          Cargando materias...
                        </Typography>
                      </Box>
                    ) : materiasAsignadas.length === 0 ? (
                      <EmptyState type="no-materias" onAction={() => setOpenAsignar(true)} />
                    ) : (
                      <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 2
                      }}>
                        {materiasAsignadas.map((materia, index) => (
                          <MateriaCard
                            key={materia.id}
                            materia={materia}
                            index={index}
                            onEdit={handleEditar}
                            onDelete={handleRemover}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </>
              )}
            </Box>
          </Fade>
        </Grid>
      </Grid>

      {/* Dialog: Asignar Materias */}
      <AsignarMateriasDialog
        open={openAsignar}
        onClose={() => setOpenAsignar(false)}
        onAsignar={handleAsignar}
        materiasDisponibles={materiasDisponibles}
        areas={areas}
        gradoNombre={gradoSeleccionado?.nombre || ''}
        loading={loadingMaterias}
      />

      {/* Dialog: Copiar Plan */}
      <Dialog open={openCopiar} onClose={() => setOpenCopiar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Copiar Plan de Estudios</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Selecciona el grado del cual copiar las materias a <strong>{gradoSeleccionado?.nombre}</strong>
          </Typography>
          <List>
            {grados.filter(g => g.id !== gradoSeleccionado?.id).map(grado => (
              <ListItemButton 
                key={grado.id} 
                onClick={() => handleCopiar(grado.id)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText 
                  primary={grado.nombre} 
                  secondary={grado.nivel_nombre} 
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopiar(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Editar Configuración */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)}>
        <DialogTitle>
          Configurar {editingMateria?.materia_nombre}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nota mínima de aprobación"
            type="number"
            value={editForm.nota_minima}
            onChange={(e) => setEditForm({ ...editForm, nota_minima: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 100, step: 0.5 }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Peso porcentual (%)"
            type="number"
            value={editForm.peso}
            onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })}
            inputProps={{ min: 0, max: 100 }}
            helperText="Opcional: para promedio ponderado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarEdicion}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlanEstudios;