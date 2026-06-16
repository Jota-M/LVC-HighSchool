'use client';
import React, { useState } from 'react';
import {
  Box, Button, Typography, Fade, Snackbar, Alert, alpha, useTheme,
  Grid, Paper, CircularProgress, keyframes
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchoolIcon from '@mui/icons-material/School';

import { useNiveles } from '../../../hooks/useNiveles';
import { useDashboard } from '../../../hooks/useDashboard';
import { useMaterias } from '../../../hooks/useMaterias';
import { NivelesStats } from '../../../components/niveles/NivelesStats';
import { NivelCard } from '../../../components/niveles/NivelCard';
import { NivelFormDialog } from '../../../components/niveles/NivelFormDialog';
import { GradoFormDialog } from '../../../components/niveles/GradoFormDialog';
import { NivelAcademico, Grado, NivelFormData, GradoFormData } from '../../../services/niveles';

// ─── Paleta dinámica ──────────────────────────────────────────────────────────
function usePalette() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary       = isDark ? '#facc15' : '#0288d1';
  const secondary     = isDark ? '#f59e0b' : '#01579b';
  const gradient      = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const textOnPrimary = isDark ? '#000' : '#fff';
  return { isDark, primary, secondary, gradient, textOnPrimary };
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const NivelesGrados: React.FC = () => {
  const { isDark, primary, secondary, gradient, textOnPrimary } = usePalette();

  const [openNivelDialog, setOpenNivelDialog] = useState(false);
  const [openGradoDialog, setOpenGradoDialog] = useState(false);
  const [editingNivel, setEditingNivel] = useState<NivelAcademico | null>(null);
  const [editingGrado, setEditingGrado] = useState<{ nivel_id: number; grado: Grado | null }>({ nivel_id: 0, grado: null });
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { niveles, grados, loading, error, crearNivel, actualizarNivel, eliminarNivel, crearGrado, actualizarGrado, eliminarGrado } =
    useNiveles({ incluirGrados: true });
  const { stats } = useDashboard();
  const { paginacion: paginacionMaterias } = useMaterias({ limit: 1 });

  // ── Handlers Niveles ──
  const handleOpenNivelDialog = (nivel: NivelAcademico | null = null) => { setEditingNivel(nivel); setOpenNivelDialog(true); };
  const handleCloseNivelDialog = () => { setOpenNivelDialog(false); setEditingNivel(null); };

  const handleSaveNivel = async (data: NivelFormData) => {
    try {
      if (editingNivel) { await actualizarNivel(editingNivel.id, data); showSnackbar('✨ Nivel actualizado exitosamente', 'success'); }
      else { await crearNivel(data); showSnackbar('🎉 Nivel creado exitosamente', 'success'); }
    } catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || err.message || 'Error al guardar'}`, 'error'); throw err; }
  };

  const handleDeleteNivel = async (id: number) => {
    const nivel = niveles.find(n => n.id === id);
    if (!window.confirm(`¿Estás seguro de eliminar el nivel "${nivel?.nombre}"?\n\n⚠️ Se eliminarán todos sus grados. Esta acción no se puede deshacer.`)) return;
    try { await eliminarNivel(id); showSnackbar('🗑️ Nivel eliminado exitosamente', 'info'); }
    catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error al eliminar nivel'}`, 'error'); }
  };

  // ── Handlers Grados ──
  const handleOpenGradoDialog = (nivel_id: number, grado: Grado | null = null) => { setEditingGrado({ nivel_id, grado }); setOpenGradoDialog(true); };
  const handleCloseGradoDialog = () => { setOpenGradoDialog(false); setEditingGrado({ nivel_id: 0, grado: null }); };

  const handleSaveGrado = async (data: GradoFormData) => {
    try {
      if (editingGrado.grado) { await actualizarGrado(editingGrado.grado.id, data); showSnackbar('✨ Grado actualizado exitosamente', 'success'); }
      else { await crearGrado(data); showSnackbar('🎉 Grado creado exitosamente', 'success'); }
    } catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || err.message || 'Error al guardar'}`, 'error'); throw err; }
  };

  const handleDeleteGrado = async (grado_id: number) => {
    const grado = grados.find(g => g.id === grado_id);
    if (!window.confirm(`¿Estás seguro de eliminar el grado "${grado?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`)) return;
    try { await eliminarGrado(grado_id); showSnackbar('🗑️ Grado eliminado exitosamente', 'info'); }
    catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error al eliminar grado'}`, 'error'); }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') =>
    setSnackbar({ open: true, message, severity });

  const totalGrados = niveles.reduce((sum, n) => sum + (n.grados?.length || 0), 0);

  if (loading && niveles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} sx={{ color: primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ px: 3, maxWidth: 'xl', mx: 'auto' }}>
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* Header */}
            <Box sx={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 }, mb: 3
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountTreeIcon sx={{
                    color: primary, fontSize: { xs: 22, md: 36 },
                    animation: `${bounce} 1.5s infinite`,
                  }} />
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, fontWeight: 800,
                    background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: 'fadeIn 1s ease-out',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(-10px)' },
                      to:   { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}>
                    Niveles y Grados
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                  Estructura académica jerárquica de tu institución.
                </Typography>
              </Box>

              <Button variant="contained" size="large" startIcon={<AddIcon />}
                onClick={() => handleOpenNivelDialog()}
                sx={{
                  borderRadius: { xs: '8px', md: '12px' }, px: { xs: 2, md: 4 }, py: { xs: 0.8, md: 1.5 },
                  fontSize: { xs: '0.75rem', md: '1rem' }, fontWeight: 700, textTransform: 'none',
                  background: gradient, color: textOnPrimary,
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(primary, 0.4)}`, filter: 'brightness(1.08)' },
                  transition: 'all .25s',
                }}>
                Crear Nivel
              </Button>
            </Box>

            <NivelesStats
              totalNiveles={niveles.length}
              totalGrados={totalGrados}
              totalEstudiantes={stats.totalEstudiantes}
              totalMaterias={paginacionMaterias.total}
            />
          </Box>
        </Fade>

        {/* Lista de niveles */}
        <Grid container spacing={3}>
          {niveles.length === 0 ? (
            <Grid size={{xs:12}}>
              <Fade in timeout={1000}>
                <Paper elevation={0} sx={{
                  p: 6, textAlign: 'center',
                  bgcolor: alpha(primary, 0.05),
                  border: `2px dashed ${alpha(primary, 0.3)}`,
                  borderRadius: 3,
                }}>
                  <SchoolIcon sx={{ fontSize: 80, color: primary, mb: 2, animation: `${bounce} 2s infinite` }} />
                  <Typography variant="h4" fontWeight="700" gutterBottom>
                    ¡Comienza tu estructura académica!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                    Crea niveles académicos (Inicial, Primaria, Secundaria) y organiza tus grados de manera jerárquica.
                  </Typography>
                  <Button variant="contained" size="large" startIcon={<AddIcon />}
                    onClick={() => handleOpenNivelDialog()}
                    sx={{
                      borderRadius: '12px', px: 4, py: 1.5, fontSize: '1.1rem',
                      fontWeight: 'bold', textTransform: 'none',
                      background: gradient, color: textOnPrimary,
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(primary, 0.4)}` },
                    }}>
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

        <NivelFormDialog open={openNivelDialog} onClose={handleCloseNivelDialog} onSave={handleSaveNivel} editingNivel={editingNivel} loading={loading} niveles={niveles} />
        <GradoFormDialog open={openGradoDialog} onClose={handleCloseGradoDialog} onSave={handleSaveGrado} editingGrado={editingGrado} loading={loading} niveles={niveles} />

        <Snackbar open={snackbar.open} autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} TransitionComponent={Fade}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled"
            sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity="error" variant="filled">{error}</Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default NivelesGrados;