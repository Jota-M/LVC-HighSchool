// pages/Estudiantes.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  useTheme,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  keyframes,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as StatsIcon,
  List as ListIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material';
import { School as SchoolIcon } from '@mui/icons-material';
import { EstudiantesStats } from '@/components/estudiantes/EstudiantesStats';
import { EstudiantesCardView } from '@/components/estudiantes/EstudiantesTable';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import { Estudiante } from '@/types/estudianteTypes';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Estudiantes: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null);

  // Hook de estudiantes
  const {
    estudiantes,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isDeleting,
  } = useEstudiantes();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (search: string) => {
    actualizarFiltros({ search, page: 1 });
  };

  const handlePageChange = (page: number) => {
    actualizarFiltros({ page });
  };

  const handleRowsPerPageChange = (limit: number) => {
    actualizarFiltros({ limit, page: 1 });
  };

  const handleView = (estudiante: Estudiante) => {
    router.push(`/dashboard/estudiantes/${estudiante.id}`);
  };

  const handleEdit = (estudiante: Estudiante) => {
    router.push(`/dashboard/estudiantes/${estudiante.id}/editar`);
  };

  const handleDeleteClick = (estudiante: Estudiante) => {
    setEstudianteToDelete(estudiante);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (estudianteToDelete) {
      eliminar(estudianteToDelete.id);
      setDeleteDialogOpen(false);
      setEstudianteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEstudianteToDelete(null);
  };

  const handleNuevoEstudiante = () => {
    router.push('/dashboard/estudiantes/registro-completo');
  };

  const handleFilterChange = (grado_id?: number, paralelo_id?: number) => {
    actualizarFiltros({ grado_id, paralelo_id, page: 1 });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
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
                    Estudiantes
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
                  Administra y supervisa la información académica y el progreso de todos los estudiantes.
                </Typography>
              </Box>

              {/* DERECHA: TOGGLE + BOTÓN */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                {/* Toggle View Mode - Solo en tab de Lista */}
                {activeTab === 0 && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      borderRadius: '12px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '10px',
                        px: 2,
                        py: 1,
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
                    <ToggleButton value="cards" sx={{ fontSize: { xs: '0.5rem', md: '1rem' } }}>
                      <ViewModuleIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 20 } }} />
                      Cards
                    </ToggleButton>
                    <ToggleButton value="table" sx={{ fontSize: { xs: '0.5rem', md: '1rem' } }}>
                      <TableRowsIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 20 } }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                {/* Botón Nuevo Estudiante - Solo en tab de Lista */}
                {activeTab === 0 && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleNuevoEstudiante}
                    sx={{
                      fontSize: { xs: '0.5rem', md: '1rem' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                          : '0 8px 24px rgba(2, 136, 209, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nuevo Estudiante
                  </Button>
                )}
              </Box>
            </Box>


            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                borderRadius: '16px',
                p: 1,
                backdropFilter: 'blur(20px)',
                '& .MuiTab-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  color: isDark ? '#000' : '#fff',
                },
                '& .Mui-selected': {
                  color: isDark ? '#fff' : '#fff',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#fff' : '#fff',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Estudiantes" />
              <Tab icon={<StatsIcon />} iconPosition="start" label="Estadísticas" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <EstudiantesCardView
                estudiantes={estudiantes}
                isLoading={isLoading}
                page={filters.page || 1}
                rowsPerPage={filters.limit || 10}
                totalItems={paginacion?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSearch={handleSearch}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                viewMode={viewMode}
                onFilterChange={handleFilterChange}
              />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box>
              <EstudiantesStats />
            </Box>
          </Fade>
        </TabPanel>
      </Container>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ¿Eliminar estudiante?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>
              {estudianteToDelete?.nombres} {estudianteToDelete?.apellidos}
            </strong>
            ? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Estudiantes;