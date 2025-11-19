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
  TextField,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';

import { useMaterias } from '../../../hooks/useMaterias';
import { MateriasStats } from '../../../components/materias/MateriasStats';
import { AreasGrid } from '../../../components/materias/AreasGrid';
import { MateriasTable } from '../../../components/materias/MateriasTable';
import { AreaFormDialog } from '../../../components/materias/AreaFormDialog';
import { MateriaFormDialog } from '../../../components/materias/MateriaFormDialog';
import { AreaConocimiento, Materia, AreaFormData, MateriaFormData } from '../../../services/materias';

const Materias: React.FC = () => {
  const theme = useTheme();

  // Estados locales
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<number | undefined>(undefined);
  const [openAreaDialog, setOpenAreaDialog] = useState(false);
  const [openMateriaDialog, setOpenMateriaDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaConocimiento | null>(null);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Hook personalizado
  const {
    areas,
    materias,
    paginacion,
    loading,
    error,
    refetch,
    crearArea,
    actualizarArea,
    eliminarArea,
    crearMateria,
    actualizarMateria,
    eliminarMateria
  } = useMaterias({
    page,
    limit,
    search,
    area_conocimiento_id: selectedAreaFilter
  });

  // ============== HANDLERS DE ÁREAS ==============

  const handleOpenAreaDialog = (area: AreaConocimiento | null = null) => {
    setEditingArea(area);
    setOpenAreaDialog(true);
  };

  const handleCloseAreaDialog = () => {
    setOpenAreaDialog(false);
    setEditingArea(null);
  };

  const handleSaveArea = async (data: AreaFormData) => {
    try {
      if (editingArea) {
        await actualizarArea(editingArea.id, data);
        showSnackbar('✨ Área actualizada exitosamente', 'success');
      } else {
        await crearArea(data);
        showSnackbar('🎉 Área creada exitosamente', 'success');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al guardar';
      showSnackbar(`❌ ${message}`, 'error');
      throw err;
    }
  };

  const handleDeleteArea = async (id: number) => {
    const area = areas.find((a: { id: number; }) => a.id === id);
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el área "${area?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await eliminarArea(id);
      showSnackbar('🗑️ Área eliminada exitosamente', 'info');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar área';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  // ============== HANDLERS DE MATERIAS ==============

  const handleOpenMateriaDialog = (materia: Materia | null = null) => {
    setEditingMateria(materia);
    setOpenMateriaDialog(true);
  };

  const handleCloseMateriaDialog = () => {
    setOpenMateriaDialog(false);
    setEditingMateria(null);
  };

  const handleSaveMateria = async (data: MateriaFormData) => {
    try {
      if (editingMateria) {
        await actualizarMateria(editingMateria.id, data);
        showSnackbar('✨ Materia actualizada exitosamente', 'success');
      } else {
        await crearMateria(data);
        showSnackbar('🎉 Materia creada exitosamente', 'success');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al guardar';
      showSnackbar(`❌ ${message}`, 'error');
      throw err;
    }
  };

  const handleDeleteMateria = async (id: number) => {
    const materia = materias.find((m: { id: number; }) => m.id === id);
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar la materia "${materia?.nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await eliminarMateria(id);
      showSnackbar('🗑️ Materia eliminada exitosamente', 'info');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar materia';
      showSnackbar(`❌ ${message}`, 'error');
    }
  };

  // ============== UTILIDADES ==============

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Cálculos de estadísticas
  const totalHoras = materias.reduce((sum, m) => sum + (m.horas_semanales ?? 0), 0);
  const totalCreditos = materias.reduce((sum, m) => sum + (m.creditos ?? 0), 0);


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
                <MenuBookIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Gestión de Materias
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  Administra áreas de conocimiento y materias
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CategoryIcon />}
                onClick={() => handleOpenAreaDialog()}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                Nueva Área
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => handleOpenMateriaDialog()}
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
                Nueva Materia
              </Button>
            </Stack>
          </Box>

          {/* Estadísticas */}
          <MateriasStats
            totalAreas={areas.length}
            totalMaterias={paginacion.total}
            totalHoras={totalHoras}
            totalCreditos={totalCreditos}
          />
        </Box>
      </Fade>

      {/* Tabs y Búsqueda */}
      <Fade in timeout={700}>
        <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  minHeight: 48
                }
              }}
            >
              <Tab label="📚 Materias" />
              <Tab label="📂 Áreas de Conocimiento" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar materias por nombre o código..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Contenido por Tab */}
      <Fade in timeout={800}>
        <Box>
          {tabValue === 0 ? (
            <MateriasTable
              materias={materias}
              loading={loading}
              onEdit={handleOpenMateriaDialog}
              onDelete={handleDeleteMateria}
            />
          ) : (
            <AreasGrid
              areas={areas}
              onEdit={handleOpenAreaDialog}
              onDelete={handleDeleteArea}
              onSelectArea={(areaId: React.SetStateAction<number | undefined>) => {
                setSelectedAreaFilter(areaId);
                setTabValue(0);
              }}
            />
          )}
        </Box>
      </Fade>

      {/* Dialogs */}
      <AreaFormDialog
        open={openAreaDialog}
        onClose={handleCloseAreaDialog}
        onSave={handleSaveArea}
        editingArea={editingArea}
        loading={loading}
        areas={areas}
      />

      <MateriaFormDialog
        open={openMateriaDialog}
        onClose={handleCloseMateriaDialog}
        onSave={handleSaveMateria}
        editingMateria={editingMateria}
        loading={loading}
        areas={areas}
      />

      {/* Snackbar */}
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

export default Materias;