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
  PersonAdd as PersonAddIcon,
  SupervisorAccount as SupervisorAccountIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Usuario } from '@/services/usuariosService';
import UsuariosCardView from '@/components/usuarios/UsuariosCardView';
import UsuariosStats from '@/components/usuarios/UsuariosStats';
import UsuarioFormDialog from '@/components/usuarios/UsuarioFormDialog';
import UsuarioDeleteDialog from '@/components/usuarios/UsuarioDeleteDialog';
import UsuarioResetPasswordDialog from '@/components/usuarios/UsuarioResetPasswordDialog';
import UsuarioActividadDialog from '@/components/usuarios/UsuarioActividadDialog';

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

export const Usuarios: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Estados para diálogos
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [actividadOpen, setActividadOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Hook de usuarios
  const {
    usuarios,
    paginacion,
    isLoading,
    filters,
    actualizarFiltros,
    eliminar,
    isDeleting,
    refetch,
  } = useUsuarios();

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

  const handleFilterChange = (rol: string, activo: boolean | null) => {
    actualizarFiltros({ rol: rol || undefined, activo: activo ?? undefined, page: 1 });
  };

  const handleNuevoUsuario = () => {
    setSelectedUsuario(null);
    setFormOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormOpen(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUsuario) {
      eliminar(selectedUsuario.id);
      setDeleteOpen(false);
      setSelectedUsuario(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setSelectedUsuario(null);
  };

  const handleResetPassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setResetPasswordOpen(true);
  };

  const handleVerActividad = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setActividadOpen(true);
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    // Implementar toggle activo
    console.log('Toggle activo:', usuario);
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

            {/* CONTENEDOR QUE SEPARA TITULO + PÁRRAFO / CONTROLES */}
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

              {/* IZQUIERDA: USUARIOS + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SupervisorAccountIcon
                    sx={{
                      color: isDark ? '#facc15' : '#0288d1',
                      fontSize: { xs: 20, md: 36 },
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
                    Usuarios
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.7rem', md: '1em' },
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    animation: 'fadeInText 1.2s ease-out',
                    '@keyframes fadeInText': {
                      from: { opacity: 0, transform: 'translateY(5px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  Gestiona usuarios, roles y permisos del sistema
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
                {/* Toggle View Mode */}
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

                {/* BOTÓN NUEVO USUARIO */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNuevoUsuario}
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
                  Nuevo Usuario
                </Button>
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
              <Tab icon={<ListIcon />} iconPosition="start" label="Lista de Usuarios" />
              <Tab icon={<StatsIcon />} iconPosition="start" label="Estadísticas" />
            </Tabs>

          </Box>
        </Fade>


        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={700}>
            <Box>
              <UsuariosCardView
                usuarios={usuarios}
                isLoading={isLoading}
                page={filters.page || 1}
                rowsPerPage={filters.limit || 12}
                totalItems={paginacion?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onResetPassword={handleResetPassword}
                onVerActividad={handleVerActividad}
                onToggleActivo={handleToggleActivo}
                viewMode={viewMode}
              />
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={700}>
            <Box>
              <UsuariosStats />
            </Box>
          </Fade>
        </TabPanel>
      </Container>

      {/* Diálogos */}
      <UsuarioFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
        onSuccess={() => {
          refetch();
        }}
      />

      <UsuarioDeleteDialog
        open={deleteOpen}
        onClose={handleDeleteCancel}
        usuario={selectedUsuario}
        onSuccess={() => {
          refetch();
        }}
      />

      <UsuarioResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => {
          setResetPasswordOpen(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
        onSuccess={() => {
          // Mostrar mensaje de éxito
        }}
      />

      <UsuarioActividadDialog
        open={actividadOpen}
        onClose={() => {
          setActividadOpen(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
      />
    </Box>
  );
};

export default Usuarios;