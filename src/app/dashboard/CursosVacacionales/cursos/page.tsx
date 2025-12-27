// pages/CursosVacacionales/Cursos.tsx
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
  School as SchoolIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCursosVacacionales } from '@/hooks/useCursosVacacionales';
import { CursosTable } from '@/components/cursosVacacionales/CursosTable';
import { CursoFormModal } from '@/components/cursosVacacionales/CursoFormModal';
import { CursoVacacional } from '@/types/cursoVacacionalTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const Cursos: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [cursoToEdit, setCursoToEdit] = useState<CursoVacacional | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState<CursoVacacional | null>(null);

  // Hook de cursos
  const {
    cursos,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isDeleting,
  } = useCursosVacacionales();

  const handleBack = () => {
    router.push('/dashboard/CursosVacacionales');
  };

  const handleNuevoCurso = () => {
    setCursoToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (curso: CursoVacacional) => {
    setCursoToEdit(curso);
    setFormModalOpen(true);
  };

  const handleView = (curso: CursoVacacional) => {
    router.push(`/dashboard/CursosVacacionales/cursos/${curso.id}`);
  };

  const handleDeleteClick = (curso: CursoVacacional) => {
    setCursoToDelete(curso);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (cursoToDelete) {
      eliminar(cursoToDelete.id);
      setDeleteDialogOpen(false);
      setCursoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCursoToDelete(null);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setCursoToEdit(null);
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

  const handleFilterChange = (periodo_vacacional_id?: number, grado_id?: number, activo?: boolean, con_cupos?: boolean) => {
    actualizarFiltros({ periodo_vacacional_id, grado_id, activo, con_cupos, page: 1 });
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
                    Cursos Vacacionales
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
                  Administra los cursos disponibles para cada periodo vacacional.
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
                  onClick={handleNuevoCurso}
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
                  Nuevo Curso
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Tabla de Cursos */}
        <Fade in timeout={700}>
          <Box>
            <CursosTable
              cursos={cursos}
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
              onFilterChange={handleFilterChange}
            />
          </Box>
        </Fade>
      </Container>

      {/* Modal de Formulario */}
      <CursoFormModal
        open={formModalOpen}
        onClose={handleCloseFormModal}
        curso={cursoToEdit}
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
          ¿Eliminar curso?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el curso{' '}
            <strong>{cursoToDelete?.nombre}</strong>?
            {cursoToDelete?.cupos_ocupados && cursoToDelete.cupos_ocupados > 0 && (
              <Box sx={{ mt: 2, color: 'error.main' }}>
                ⚠️ Este curso tiene {cursoToDelete.cupos_ocupados} estudiante(s) inscrito(s).
                No se puede eliminar un curso con inscripciones activas.
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
            disabled={isDeleting || (cursoToDelete?.cupos_ocupados ?? 0) > 0}
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

export default Cursos;