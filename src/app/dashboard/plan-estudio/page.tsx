'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, alpha, useTheme,
  Paper, Grid, IconButton, Tooltip, Fade, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText,
  TextField, CircularProgress, ListItemButton, Container, Avatar,
  Divider, Zoom, keyframes
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  AutoAwesome as SparkleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
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
  const isDark = theme.palette.mode === 'dark';
  
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
  const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  `;
  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4,
      
    }}>
      <Container maxWidth="xl">
        {/* Header Principal Mejorado */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 3 
            }}>
              {/* IZQUIERDA: TÍTULO */}
              <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon
                sx={{
                  color: isDark ? '#facc15' : '#0288d1',
                  fontSize: 36,
                  animation: `${bounce} 1.5s infinite`,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'fadeIn 1s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                Plan de estudios
              </Typography>
              </Box>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  letterSpacing: 0.3,
                  animation: 'fadeInText 1.2s ease-out',
                  '@keyframes fadeInText': {
                    from: { opacity: 0, transform: 'translateY(5px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                Gestiona las matrículas de estudiantes por periodo académico.
              </Typography>
            </Box>
            </Box>

            {/* Barra de acciones */}
            {gradoSeleccionado && (
              <Zoom in={true}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 2,
                    background: isDark
                      ? alpha('#1e293b', 0.8)
                      : alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Tooltip title="Actualizar">
                    <IconButton 
                      onClick={refetchMaterias} 
                      disabled={loadingMaterias}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={() => setOpenCopiar(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Copiar Plan
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAsignar(true)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                      boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Asignar Materias
                  </Button>
                </Paper>
              </Zoom>
            )}
          </Box>
        </Fade>

        {/* Contenido Principal */}
        <Grid container spacing={3}>
          {/* Panel Izquierdo - Selector de Grados */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
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
          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <Fade in timeout={800}>
              <Box>
                {!gradoSeleccionado ? (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      borderRadius: '24px', 
                      overflow: 'hidden',
                      background: isDark
                        ? alpha('#1e293b', 0.8)
                        : alpha('#ffffff', 0.9),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
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
                    <Paper 
                      elevation={0}
                      sx={{ 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        p: 3,
                        background: isDark
                          ? alpha('#1e293b', 0.8)
                          : alpha('#ffffff', 0.9),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          📋 Materias del Plan
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {materiasAsignadas.length} materias
                        </Typography>
                      </Box>

                      {loadingMaterias ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <CircularProgress size={60} thickness={4} />
                          <Typography color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
                            Cargando materias...
                          </Typography>
                        </Box>
                      ) : materiasAsignadas.length === 0 ? (
                        <EmptyState type="no-materias" onAction={() => setOpenAsignar(true)} />
                      ) : (
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: 3
                        }}>
                          {materiasAsignadas.map((materia, index) => (
                            <Zoom 
                              key={materia.id}
                              in={true}
                              style={{ transitionDelay: `${index * 50}ms` }}
                            >
                              <Box>
                                <MateriaCard
                                  materia={materia}
                                  index={index}
                                  onEdit={handleEditar}
                                  onDelete={handleRemover}
                                />
                              </Box>
                            </Zoom>
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

        {/* Dialog: Copiar Plan Mejorado */}
        <Dialog 
          open={openCopiar} 
          onClose={() => setOpenCopiar(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: isDark
                ? alpha('#0f172a', 0.98)
                : alpha('#ffffff', 0.98),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#8b5cf6', 0.15),
                  width: 48,
                  height: 48,
                }}
              >
                <CopyIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Copiar Plan de Estudios
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Duplicar materias desde otro grado
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpenCopiar(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <Divider />
          
          <DialogContent sx={{ pt: 3 }}>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Selecciona el grado del cual copiar las materias a <strong>{gradoSeleccionado?.nombre}</strong>
            </Typography>
            <List sx={{ 
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {grados.filter(g => g.id !== gradoSeleccionado?.id).map((grado, index) => (
                <ListItemButton 
                  key={grado.id} 
                  onClick={() => handleCopiar(grado.id)}
                  sx={{ 
                    py: 2,
                    borderBottom: index < grados.filter(g => g.id !== gradoSeleccionado?.id).length - 1 
                      ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                      : 'none',
                    '&:hover': {
                      backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                    }
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {grado.nombre}
                      </Typography>
                    }
                    secondary={grado.nivel_nombre} 
                  />
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenCopiar(false)}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Editar Configuración Mejorado */}
        <Dialog 
          open={openEditar} 
          onClose={() => setOpenEditar(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: isDark
                ? alpha('#0f172a', 0.98)
                : alpha('#ffffff', 0.98),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#10b981', 0.15),
                  width: 48,
                  height: 48,
                }}
              >
                <SchoolIcon sx={{ color: '#10b981', fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Configurar Materia
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {editingMateria?.materia_nombre}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpenEditar(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <Divider />
          
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Nota mínima de aprobación"
                type="number"
                value={editForm.nota_minima}
                onChange={(e) => setEditForm({ ...editForm, nota_minima: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth
                label="Peso porcentual (%)"
                type="number"
                value={editForm.peso}
                onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })}
                inputProps={{ min: 0, max: 100 }}
                helperText="Opcional: para promedio ponderado"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setOpenEditar(false)}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGuardarEdicion}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Mejorado */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Zoom}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 600,
              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
            }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PlanEstudios;