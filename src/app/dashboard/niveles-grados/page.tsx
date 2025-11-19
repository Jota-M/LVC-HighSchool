'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Fade,
  Snackbar,
  Alert,
  alpha,
  useTheme,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';

import { useNiveles } from '../../../hooks/useNiveles';
import { NivelesStats } from '../../../components/niveles/NivelesStats';
import { NivelCard } from '../../../components/niveles/NivelCard';
import { NivelFormDialog } from '../../../components/niveles/NivelFormDialog';
import { GradoFormDialog } from '../../../components/niveles/GradoFormDialog';
import { NivelAcademico, Grado, NivelFormData, GradoFormData } from '../../../services/niveles';

const NivelesGrados: React.FC = () => {
  const theme = useTheme();

  // Estados locales
  const [openNivelDialog, setOpenNivelDialog] = useState(false);
  const [openGradoDialog, setOpenGradoDialog] = useState(false);
  const [editingNivel, setEditingNivel] = useState<NivelAcademico | null>(null);
  const [editingGrado, setEditingGrado] = useState<{ nivel_id: number; grado: Grado | null }>({
    nivel_id: 0,
    grado: null
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Hook personalizado
  const {
    niveles,
    grados,
    loading,
    error,
    refetch,
    crearNivel,
    actualizarNivel,
    eliminarNivel,
    crearGrado,
    actualizarGrado,
    eliminarGrado
  } = useNiveles({
    incluirGrados: true
  });

  // ============== HANDLERS DE NIVELES ==============

  const handleOpenNivelDialog = (nivel: NivelAcademico | null = null) => {
    setEditingNivel(nivel);
    setOpenNivelDialog(true);
  };

  const handleCloseNivelDialog = () => {
    setOpenNivelDialog(false);
    setEditingNivel(null);
  };

  const handleSaveNivel = async (data: NivelFormData) => {
    try {
      if (editingNivel) {
        await actualizarNivel(editingNivel.id, data);
        showSnackbar('✨ Nivel actualizado exitosamente', 'success');
      } else {
        await crearNivel(data);
        showSnackbar('🎉 Nivel creado exitosamente', 'success');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al guardar';
      showSnackbar(`❌ ${message}`, 'error');
      throw err;
    }
  };

  const handleDeleteNivel = async (id: number) => {
    const nivel = niveles.find(n => n.id === id);
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el nivel "${nivel?.nombre}"?\n\n⚠️ Se eliminarán todos sus grados. Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await eliminarNivel(id);
      showSnackbar('🗑️ Nivel eliminado exitosamente', 'info');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar nivel';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  // ============== HANDLERS DE GRADOS ==============

  const handleOpenGradoDialog = (nivel_id: number, grado: Grado | null = null) => {
    setEditingGrado({ nivel_id, grado });
    setOpenGradoDialog(true);
  };

  const handleCloseGradoDialog = () => {
    setOpenGradoDialog(false);
    setEditingGrado({ nivel_id: 0, grado: null });
  };

  const handleSaveGrado = async (data: GradoFormData) => {
    try {
      if (editingGrado.grado) {
        await actualizarGrado(editingGrado.grado.id, data);
        showSnackbar('✨ Grado actualizado exitosamente', 'success');
      } else {
        await crearGrado(data);
        showSnackbar('🎉 Grado creado exitosamente', 'success');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al guardar';
      showSnackbar(`❌ ${message}`, 'error');
      throw err;
    }
  };

  const handleDeleteGrado = async (grado_id: number) => {
    const grado = grados.find(g => g.id === grado_id);
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el grado "${grado?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await eliminarGrado(grado_id);
      showSnackbar('🗑️ Grado eliminado exitosamente', 'info');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar grado';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  // ============== UTILIDADES ==============

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  // Cálculos de estadísticas
  const totalGrados = niveles.reduce((sum, n) => sum + (n.grados?.length || 0), 0);
  const totalEstudiantes = 465; // TODO: Obtener dato real
  const totalMaterias = 142; // TODO: Obtener dato real

  // Loading state
  if (loading && niveles.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Premium */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                  }
                }}
              >
                <AccountTreeIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Niveles y Grados
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Estructura académica jerárquica de tu institución
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenNivelDialog()}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                }
              }}
            >
              Crear Nivel
            </Button>
          </Box>

          {/* Estadísticas */}
          <NivelesStats
            totalNiveles={niveles.length}
            totalGrados={totalGrados}
            totalEstudiantes={totalEstudiantes}
            totalMaterias={totalMaterias}
          />
        </Box>
      </Fade>

      {/* Lista de Niveles con Grados */}
      <Grid container spacing={3}>
        {niveles.length === 0 ? (
          <Grid size={{xs:12}} >
            <Fade in timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                  borderRadius: 3
                }}
              >
                <SchoolIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="700" gutterBottom>
                  ¡Comienza tu estructura académica!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  Crea niveles académicos (Inicial, Primaria, Secundaria) y organiza tus grados de manera jerárquica.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenNivelDialog()}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Crear Primer Nivel
                </Button>
              </Paper>
            </Fade>
          </Grid>
        ) : (
          niveles.map((nivel, index) => (
            <Grid size={{xs:12}} key={nivel.id}>
              <Fade in timeout={800 + index * 100}>
                <Box>
                  <NivelCard
                    nivel={nivel}
                    onEditNivel={handleOpenNivelDialog}
                    onDeleteNivel={handleDeleteNivel}
                    onAddGrado={handleOpenGradoDialog}
                    onEditGrado={handleOpenGradoDialog}
                    onDeleteGrado={handleDeleteGrado}
                  />
                </Box>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog para Crear/Editar Nivel */}
      <NivelFormDialog
        open={openNivelDialog}
        onClose={handleCloseNivelDialog}
        onSave={handleSaveNivel}
        editingNivel={editingNivel}
        loading={loading}
        niveles={niveles}
      />

      {/* Dialog para Crear/Editar Grado */}
      <GradoFormDialog
        open={openGradoDialog}
        onClose={handleCloseGradoDialog}
        onSave={handleSaveGrado}
        editingGrado={editingGrado}
        loading={loading}
        niveles={niveles}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.2)}`
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Global */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default NivelesGrados;