// pages/Docentes.tsx - VERSIÓN ACTUALIZADA CON 3 TABS
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
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DocentesCardView } from '@/components/docentes/DocentesTable';
import { DocentesStats } from '@/components/docentes/DocentesStats';
import { AsignacionesDocente } from '@/components/docentes/AsignacionesDocente';
import { useDocentes } from '@/hooks/useDocentes';
import { Docente } from '@/types/docenteTypes';
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

export const Docentes: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docenteToDelete, setDocenteToDelete] = useState<Docente | null>(null);

  // Hook de docentes
  const {
    docentes,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isDeleting,
  } = useDocentes();

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

  const handleView = (docente: Docente) => {
    if (!docente.id) return console.error('ID de docente inválido');
    router.push(`/dashboard/docentes/${docente.id}`);
  };

  const handleEdit = (docente: Docente) => {
    if (!docente.id) return console.error('ID de docente inválido');
    router.push(`/dashboard/docentes/${docente.id}/editar`);
  };

  const handleDeleteClick = (docente: Docente) => {
    setDocenteToDelete(docente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (docenteToDelete) {
      eliminar(docenteToDelete.id);
      setDeleteDialogOpen(false);
      setDocenteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocenteToDelete(null);
  };

  const handleNuevoDocente = () => {
    router.push('/dashboard/docentes/registro-completo');
  };

  const handleFilterChange = (tipo_contrato?: string, especialidad?: string) => {
    actualizarFiltros({ 
      tipo_contrato: tipo_contrato as any, 
      especialidad, 
      page: 1 
    });
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

            {/* CONTENEDOR PRINCIPAL DEL HEADER */}
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
                    }}
                  >
                    Docentes
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                  }}
                >
                  Gestiona el personal docente, estadísticas y asignaciones académicas.
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
                      <TableRowsIcon sx={{ mr: 0.5, fontSize: { xs: 12, md: 20 } }}/>
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                {/* Botón Nuevo Docente - Solo en tab de Lista */}
                {activeTab === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNuevoDocente}
                    sx={{
                      fontSize: { xs: '0.6rem', md: '1rem' },
                      borderRadius: { xs: '8px', md: '12px' },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: { xs: 2, md: 4 },
                      py: { xs: 0.5, md: 1.5 },
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
                    Nuevo Docente
                  </Button>
                )}

              </Box>
            </Box>

            {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  width: '100%',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  borderRadius: '16px',
                  p: { xs: 0.5, md: 1 },
                  backdropFilter: 'blur(20px)',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },

                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',

                    /** 👇 AQUI ESTÁ LA CLAVE */
                    minWidth: { xs: 80, md: 'auto' },       // tamaño estático en mobile
                    maxWidth: { xs: 80, md: 'none' },       // para mantener forma compacta

                    fontSize: { xs: '0.5rem', md: '0.8rem' },
                    paddingInline: { xs: 1, md: 2 },
                    minHeight: { xs: 36, md: 48 },

                    color: isDark ? '#000' : '#fff',
                  },

                  '& .MuiTab-root svg': {
                    fontSize: { xs: '1rem', md: '1.3rem' },
                  },

                  '& .Mui-selected': {
                    color: isDark ? '#fff' : '#fff',
                  },

                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#fff' : '#fff',
                    height: { xs: 2, md: 3 },
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Docentes" />
                <Tab icon={<StatsIcon />} iconPosition="start" label="Estadísticas" />
                <Tab icon={<AssignmentIcon />} iconPosition="start" label="Asignaciones" />
              </Tabs>


          </Box>
        </Fade>


        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <DocentesCardView
                docentes={docentes}
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
              <DocentesStats />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={700}>
            <Box>
              <AsignacionesDocente />
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
          ¿Eliminar docente?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>
              {docenteToDelete?.nombres} {docenteToDelete?.apellidos}
            </strong>
            ? Esta acción no se puede deshacer.
            {docenteToDelete?.total_asignaciones && docenteToDelete.total_asignaciones > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                ⚠️ Este docente tiene {docenteToDelete.total_asignaciones} asignación(es) activa(s).
                No podrás eliminarlo hasta que se desasignen.
              </Box>
            )}
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

export default Docentes;