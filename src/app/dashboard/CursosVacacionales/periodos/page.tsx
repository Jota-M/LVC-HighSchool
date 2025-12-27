// pages/CursosVacacionales/Periodos.tsx
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
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { usePeriodosVacacionales } from '@/hooks/useCursosVacacionales';
import { PeriodosTable } from '@/components/cursosVacacionales/PeriodosTable';
import { PeriodoFormModal } from '@/components/cursosVacacionales/PeriodoFormModal';
import { PeriodoVacacional } from '@/types/cursoVacacionalTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Periodos: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [periodoToEdit, setPeriodoToEdit] = useState<PeriodoVacacional | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState<PeriodoVacacional | null>(null);

  // Hook de periodos
  const {
    periodos,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isDeleting,
  } = usePeriodosVacacionales();

  const handleBack = () => {
    router.push('/dashboard/CursosVacacionales');
  };

  const handleNuevoPeriodo = () => {
    setPeriodoToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (periodo: PeriodoVacacional) => {
    setPeriodoToEdit(periodo);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (periodo: PeriodoVacacional) => {
    setPeriodoToDelete(periodo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (periodoToDelete) {
      eliminar(periodoToDelete.id);
      setDeleteDialogOpen(false);
      setPeriodoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPeriodoToDelete(null);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setPeriodoToEdit(null);
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

  const handleFilterChange = (tipo?: 'verano' | 'invierno', anio?: number, activo?: boolean) => {
    actualizarFiltros({ tipo, anio, activo, page: 1 });
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
                  <CalendarIcon
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
                    Periodos Vacacionales
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
                  Gestiona los periodos de verano e invierno para los cursos vacacionales.
                </Typography>
              </Box>

              {/* DERECHA: BOTÓN NUEVO */}
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
                  onClick={handleNuevoPeriodo}
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
                  Nuevo Periodo
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Tabla de Periodos */}
        <Fade in timeout={700}>
          <Box>
            <PeriodosTable
              periodos={periodos}
              isLoading={isLoading}
              page={filters.page || 1}
              rowsPerPage={filters.limit || 10}
              totalItems={paginacion?.total || 0}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSearch={handleSearch}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onFilterChange={handleFilterChange}
            />
          </Box>
        </Fade>
      </Container>

      {/* Modal de Formulario */}
      <PeriodoFormModal
        open={formModalOpen}
        onClose={handleCloseFormModal}
        periodo={periodoToEdit}
      />

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
          ¿Eliminar periodo?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el periodo{' '}
            <strong>{periodoToDelete?.nombre}</strong>?
            {periodoToDelete?.total_cursos && periodoToDelete.total_cursos > 0 && (
              <Box sx={{ mt: 2, color: 'error.main' }}>
                ⚠️ Este periodo tiene {periodoToDelete.total_cursos} curso(s) asociado(s).
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

export default Periodos;