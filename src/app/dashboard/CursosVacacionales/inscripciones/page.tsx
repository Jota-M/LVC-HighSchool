// pages/CursosVacacionales/Inscripciones.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Fade,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack,
  Assessment as AssessmentIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useInscripcionesVacacionales } from '@/hooks/useCursosVacacionales';
import { InscripcionesTable } from '@/components/cursosVacacionales/InscripcionesTable';
import { InscripcionFormModal } from '@/components/cursosVacacionales/InscripcionFormModal';
import { InscripcionVacacional } from '@/types/cursoVacacionalTypes';

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

export const Inscripciones: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inscripcionToDelete, setInscripcionToDelete] = useState<InscripcionVacacional | null>(null);

  // Hook de inscripciones
  const {
    inscripciones,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isEliminando,
  } = useInscripcionesVacacionales();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    router.push('/dashboard/CursosVacacionales');
  };

  const handleNuevaInscripcion = () => {
    setFormModalOpen(true);
  };

  const handleView = (inscripcion: InscripcionVacacional) => {
    router.push(`/dashboard/CursosVacacionales/inscripciones/${inscripcion.id}`);
  };

  const handleDeleteClick = (inscripcion: InscripcionVacacional) => {
    setInscripcionToDelete(inscripcion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (inscripcionToDelete) {
      eliminar(inscripcionToDelete.id);
      setDeleteDialogOpen(false);
      setInscripcionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInscripcionToDelete(null);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
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

  const handleFilterChange = (
    periodo_vacacional_id?: number,
    curso_vacacional_id?: number,
    estado?: string,
    pago_verificado?: boolean
  ) => {
    actualizarFiltros({
      periodo_vacacional_id,
      curso_vacacional_id,
      estado: estado as any,
      pago_verificado,
      page: 1,
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
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
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  sx={{
                    mb: 2,
                    color: isDark ? '#facc15' : '#0288d1',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                    },
                  }}
                >
                  Volver al Dashboard
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PersonAddIcon
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
                    Inscripciones
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
                  Gestiona las inscripciones de estudiantes a los cursos vacacionales.
                </Typography>
              </Box>

              {/* DERECHA: BOTÓN NUEVO */}
              {activeTab === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' },
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleNuevaInscripcion}
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
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
                    Nueva Inscripción
                  </Button>
                </Box>
              )}
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
              <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Inscripciones" />
              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Reportes" />
            </Tabs>
          </Box>
        </Fade>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <InscripcionesTable
                inscripciones={inscripciones}
                isLoading={isLoading}
                page={filters.page || 1}
                rowsPerPage={filters.limit || 10}
                totalItems={paginacion?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSearch={handleSearch}
                onView={handleView}
                onDelete={handleDeleteClick}
                onFilterChange={handleFilterChange}
              />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Reportes de Inscripciones
              </Typography>
              <Typography color="text.secondary">
                Sección de reportes en desarrollo...
              </Typography>
            </Box>
          </Fade>
        </TabPanel>
      </Container>

      {/* Modal de Formulario */}
      <InscripcionFormModal open={formModalOpen} onClose={handleCloseFormModal} />

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
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar inscripción?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la inscripción de{' '}
            <strong>
              {inscripcionToDelete?.nombres} {inscripcionToDelete?.apellido_paterno}
            </strong>
            ?
            <Box sx={{ mt: 2, color: 'warning.main' }}>
              ⚠️ Esta acción liberará un cupo en el curso.
            </Box>
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
            disabled={isEliminando}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isEliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inscripciones;