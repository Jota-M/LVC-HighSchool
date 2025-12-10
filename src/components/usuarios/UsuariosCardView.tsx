import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Select,
  FormControl,
  alpha,
  useTheme,
  Tooltip,
  Badge,
  Fade,
  Paper,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  LockReset as LockResetIcon,
  History as HistoryIcon,
  PersonOff as PersonOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { Usuario } from '@/services/usuariosService';

interface UsuariosCardViewProps {
  usuarios: Usuario[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onFilterChange: (rol: string, activo: boolean | null) => void;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onVerActividad: (usuario: Usuario) => void;
  onToggleActivo: (usuario: Usuario) => void;
  viewMode: 'cards' | 'table';
}

export const UsuariosCardView: React.FC<UsuariosCardViewProps> = ({
  usuarios,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onFilterChange,
  onEdit,
  onDelete,
  onResetPassword,
  onVerActividad,
  onToggleActivo,
  viewMode,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = () => {
    const activo = activoFilter === '' ? null : activoFilter === 'true';
    onFilterChange(rolFilter, activo);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, usuario: Usuario) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUsuario(usuario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUsuario(null);
  };

  const handleAction = (action: string) => {
    if (!selectedUsuario) return;

    switch (action) {
      case 'edit':
        onEdit(selectedUsuario);
        break;
      case 'delete':
        onDelete(selectedUsuario);
        break;
      case 'reset':
        onResetPassword(selectedUsuario);
        break;
      case 'activity':
        onVerActividad(selectedUsuario);
        break;
      case 'toggle':
        onToggleActivo(selectedUsuario);
        break;
    }
    handleMenuClose();
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const getRolColor = (rolNombre: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'super admin': { bg: isDark ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)', text: '#9c27b0' },
      'admin': { bg: isDark ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)', text: '#2196f3' },
      'docente': { bg: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)', text: '#4caf50' },
      'estudiante': { bg: isDark ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)', text: '#ff9800' },
      'padre': { bg: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)', text: '#f44336' },
    };
    return colors[rolNombre.toLowerCase()] || { bg: 'rgba(158, 158, 158, 0.1)', text: '#9e9e9e' };
  };

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  React.useEffect(() => {
    handleFilterChange();
  }, [rolFilter, activoFilter]);

  // Columnas para la vista de tabla
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'username',
      headerName: 'Usuario',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: isDark ? '#facc15' : '#0288d1',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {getInitials(params.value)}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value?.map((rol: any) => {
            const rolColor = getRolColor(rol.nombre);
            return (
              <Chip
                key={rol.id}
                label={rol.nombre}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: rolColor.bg,
                  color: rolColor.text,
                  border: `1px solid ${alpha(rolColor.text, 0.3)}`,
                }}
              />
            );
          })}
        </Box>
      ),
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          size="small"
          color={params.value ? 'success' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'verificado',
      headerName: 'Verificado',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={params.value ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
          label={params.value ? 'Sí' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Fecha Creación',
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        new Date(params.value).toLocaleDateString('es-ES'),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
          sx={{
            '&:hover': {
              backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
            },
          }}
        >
          <MoreIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      {/* Barra de búsqueda y filtros */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' }
      }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Buscar por usuario o email..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
            },
          }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
            displayEmpty
            size="medium"
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value="">Todos los roles</MenuItem>
            <MenuItem value="super admin">Super Admin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="docente">Docente</MenuItem>
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="padre">Padre</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={activoFilter}
            onChange={(e) => setActivoFilter(e.target.value)}
            displayEmpty
            size="medium"
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="true">Activos</MenuItem>
            <MenuItem value="false">Inactivos</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            size="medium"
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value={12}>12 por página</MenuItem>
            <MenuItem value={24}>24 por página</MenuItem>
            <MenuItem value={48}>48 por página</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grid de tarjetas o Tabla */}
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400 
        }}>
          <Typography variant="body1" color="text.secondary">
            Cargando usuarios...
          </Typography>
        </Box>
      ) : usuarios.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400,
          flexDirection: 'column',
          gap: 2
        }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron usuarios
          </Typography>
        </Box>
      ) : viewMode === 'table' ? (
        <>
          {/* Vista de Tabla */}
          <Paper
            sx={{
              height: 600,
              borderRadius: '20px',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <DataGrid
              rows={usuarios}
              columns={columns}
              loading={isLoading}
              pagination
              paginationMode="server"
              rowCount={totalItems}
              disableRowSelectionOnClick
              paginationModel={{ page: page - 1, pageSize: rowsPerPage }}
              onPaginationModelChange={(model) => {
                onPageChange(model.page + 1);
                if (model.pageSize !== rowsPerPage) {
                  onRowsPerPageChange(model.pageSize);
                }
              }}
              pageSizeOptions={[12, 24, 48]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: isDark 
                    ? 'rgba(250, 204, 21, 0.1)' 
                    : 'rgba(2, 136, 209, 0.05)',
                  borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isDark 
                      ? 'rgba(250, 204, 21, 0.05)' 
                      : 'rgba(2, 136, 209, 0.05)',
                  },
                },
              }}
              onRowClick={(params) => onEdit(params.row)}
            />
          </Paper>
        </>
      ) : (
        <>
          {/* Vista de Cards */}
          <Grid container spacing={3}>
            {usuarios.map((usuario) => {
              const primaryRole = usuario.roles?.[0];
              const rolColor = primaryRole ? getRolColor(primaryRole.nombre) : { bg: 'rgba(158, 158, 158, 0.1)', text: '#9e9e9e' };
              
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={usuario.id}>
                  <Fade in timeout={300}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '20px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 24px ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
                          borderColor: isDark ? '#facc15' : '#0288d1',
                        },
                      }}
                      onClick={() => onEdit(usuario)}
                    >
                      {/* Badge de estado */}
                      <Box sx={{ display: 'flex', gap: 1, position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
                        <Chip
                          label={usuario.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={usuario.activo ? 'success' : 'error'}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                        {usuario.verificado && (
                          <Chip
                            icon={<VerifiedUserIcon sx={{ fontSize: 14 }} />}
                            label="Verificado"
                            size="small"
                            color="info"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>

                      {/* Menú de acciones */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, usuario)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                          },
                        }}
                      >
                        <MoreIcon />
                      </IconButton>

                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        {/* Avatar */}
                        <Avatar
                          sx={{
                            width: 90,
                            height: 90,
                            margin: '0 auto 16px',
                            bgcolor: rolColor.text,
                            color: '#fff',
                            fontSize: '2rem',
                            fontWeight: 800,
                            border: `4px solid ${alpha(rolColor.text, 0.2)}`,
                            boxShadow: `0 8px 16px ${alpha(rolColor.text, 0.3)}`,
                          }}
                        >
                          {getInitials(usuario.username)}
                        </Avatar>

                        {/* Nombre */}
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                          {usuario.username}
                        </Typography>

                        {/* Email */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {usuario.email}
                          </Typography>
                        </Box>

                        {/* Roles */}
                        <Box sx={{ 
                          mt: 2, 
                          pt: 2, 
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          textAlign: 'left'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" fontWeight={600}>
                              Roles:
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {usuario.roles?.map((rol) => (
                              <Chip
                                key={rol.id}
                                label={rol.nombre}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: getRolColor(rol.nombre).bg,
                                  color: getRolColor(rol.nombre).text,
                                  border: `1px solid ${alpha(getRolColor(rol.nombre).text, 0.3)}`,
                                }}
                              />
                            ))}
                          </Box>

                          {/* Último acceso */}
                          {usuario.ultimo_acceso && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Último acceso: {new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>

          {/* Paginación */}
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, totalItems)} de {totalItems}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => onPageChange(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '12px',
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  background: isDark 
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)' 
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: 200,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
      >
        <MenuItem onClick={() => handleAction('edit')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('toggle')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            {selectedUsuario?.activo ? <PersonOffIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{selectedUsuario?.activo ? 'Desactivar' : 'Activar'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('reset')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Resetear Contraseña</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('activity')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Actividad</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UsuariosCardView;