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
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  keyframes
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { useMaterias } from '../../../hooks/useMaterias';
import { MateriasStats } from '../../../components/materias/MateriasStats';
import { AreasGrid } from '../../../components/materias/AreasGrid';
import { MateriasTable } from '../../../components/materias/MateriasTable';
import { AreaFormDialog } from '../../../components/materias/AreaFormDialog';
import { MateriaFormDialog } from '../../../components/materias/MateriaFormDialog';
import { AreaConocimiento, Materia, AreaFormData, MateriaFormData } from '../../../services/materias';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const Materias: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Estados locales
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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
  const totalHoras = materias.reduce((sum, m) => sum + (Number(m.horas_semanales) || 0), 0);
  const totalCreditos = materias.reduce((sum, m) => sum + (Number(m.creditos) || 0), 0);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ px: 3, maxWidth: 'xl', mx: 'auto' }}>
        {/* Header Premium */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              mb: 3
            }}>
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MenuBookIcon
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
                    Gestión de Materias
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
                  Administra áreas de conocimiento y materias del plan educativo.
                </Typography>
              </Box>

              {/* DERECHA: BOTONES */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CategoryIcon />}
                  onClick={() => handleOpenAreaDialog()}
                  sx={{
                    borderRadius: { xs: 2, md: 3 },
                    px: { xs: 2, md: 3 },
                    py: { xs: 1, md: 1.5 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', md: '1rem' },
                    fontWeight: 'bold',
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#facc15' : '#0288d1',
                    '&:hover': {
                      borderColor: isDark ? '#f59e0b' : '#01579b',
                      bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                    }
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
                    borderRadius: { xs: 2, md: 3 },
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', md: '1.1rem' },
                    fontWeight: 'bold',
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                      : '0 8px 24px rgba(2, 136, 209, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 12px 32px rgba(250, 204, 21, 0.4)'
                        : '0 12px 32px rgba(2, 136, 209, 0.4)',
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
          <Paper sx={{ 
            borderRadius: 3, 
            mb: 3, 
            overflow: 'hidden',
            bgcolor: isDark ? alpha('#fff', 0.05) : '#fff'
          }}>
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              px: 3, 
              pt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Tabs 
                value={tabValue} 
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    fontWeight: 600,
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: isDark ? '#facc15' : '#0288d1'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1'
                  }
                }}
              >
                <Tab label="📚 Materias" />
                <Tab label="📂 Áreas de Conocimiento" />
              </Tabs>

              {/* Toggle solo en tab de Materias */}
              {tabValue === 0 && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  sx={{
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    borderRadius: { xs: 8, md: 12 },
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: { xs: 8, md: 10 },
                      px: { xs: 1.5, md: 2.5 },
                      py: { xs: 0.8, md: 1.5 },
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: { xs: '0.7rem', md: '0.9rem' },
                      '&.Mui-selected': {
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        '&:hover': {
                          bgcolor: isDark ? '#f59e0b' : '#01579b',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="cards">
                    <ViewModuleIcon sx={{ mr: { xs: 0.5, md: 1 }, fontSize: { xs: 16, md: 20 } }} />
                    Cards
                  </ToggleButton>
                  <ToggleButton value="table">
                    <TableRowsIcon sx={{ mr: { xs: 0.5, md: 1 }, fontSize: { xs: 16, md: 20 } }} />
                    Tabla
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? '#facc15' : '#0288d1',
                      }
                    }
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
                viewMode={viewMode}
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
    </Box>
  );
};

export default Materias;