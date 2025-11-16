'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';

import ProtectedRoute from '../../../components/ProtectedRoute';
import usuariosService, { Usuario } from '../../../services/usuariosService';
import UsuarioFormDialog from '../../../components/usuarios/UsuarioFormDialog';
import UsuarioDeleteDialog from '../../../components/usuarios/UsuarioDeleteDialog';
import UsuarioResetPasswordDialog from '../../../components/usuarios/UsuarioResetPasswordDialog';
import UsuarioActividadDialog from '../../../components/usuarios/UsuarioActividadDialog';

export default function UsersPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Paginación y filtros
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState<boolean | null>(null);

  // Diálogos
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [actividadOpen, setActividadOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Menú de acciones
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUsuario, setMenuUsuario] = useState<Usuario | null>(null);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await usuariosService.listar({
        page: page + 1,
        limit: pageSize,
        search: searchTerm || undefined,
        rol: rolFilter || undefined,
        activo: activoFilter !== null ? activoFilter : undefined,
      });

      setUsuarios(response.data.usuarios);
      setTotalRows(response.data.paginacion.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [page, pageSize, searchTerm, rolFilter, activoFilter]);

  // Handlers de menú
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, usuario: Usuario) => {
    setAnchorEl(event.currentTarget);
    setMenuUsuario(usuario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUsuario(null);
  };

  // Handlers de acciones
  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDeleteOpen(true);
    handleMenuClose();
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await usuariosService.toggleActivo(usuario.id);
      setSuccess(
        `Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`
      );
      cargarUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
    handleMenuClose();
  };

  const handleResetPassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setResetPasswordOpen(true);
    handleMenuClose();
  };

  const handleVerActividad = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setActividadOpen(true);
    handleMenuClose();
  };

  // Columnas de la tabla
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
          <PersonIcon sx={{ fontSize: 20, color: '#0288d1' }} />
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
    },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value?.map((rol: any) => (
            <Chip
              key={rol.id}
              label={rol.nombre}
              size="small"
              sx={{
                backgroundColor: alpha('#0288d1', 0.1),
                color: '#0288d1',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          ))}
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
          label={params.value ? 'Sí' : 'No'}
          size="small"
          color={params.value ? 'success' : 'warning'}
          variant="outlined"
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
              backgroundColor: alpha('#0288d1', 0.1),
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra los usuarios del sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUsuario(null);
              setFormOpen(true);
            }}
            sx={{
              background: 'linear-gradient(90deg, #0288d1, #01579b)',
              px: 3,
              py: 1.5,
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Filtros */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: isDark ? '#1a1f2e' : '#fff',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar por usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Filtrar por rol"
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
              <MenuItem value="docente">Docente</MenuItem>
              <MenuItem value="estudiante">Estudiante</MenuItem>
              <MenuItem value="padre">Padre</MenuItem>
            </TextField>

            <TextField
              select
              label="Filtrar por estado"
              value={activoFilter === null ? '' : activoFilter.toString()}
              onChange={(e) =>
                setActivoFilter(
                  e.target.value === '' ? null : e.target.value === 'true'
                )
              }
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setRolFilter('');
                setActivoFilter(null);
              }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </Paper>

        {/* Tabla */}
        <Paper
          sx={{
            height: 600,
            backgroundColor: isDark ? '#1a1f2e' : '#fff',
          }}
        >
          <DataGrid
  rows={usuarios}
  columns={columns}
  loading={loading}
  pagination
  paginationMode="server"
  rowCount={totalRows}
  disableRowSelectionOnClick
  paginationModel={{ page, pageSize }}
  onPaginationModelChange={(model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }}
  pageSizeOptions={[5, 10, 25, 50]} // ✅ renamed from rowsPerPageOptions
  sx={{
    border: 'none',
    '& .MuiDataGrid-cell': {
      borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: isDark ? alpha('#0288d1', 0.1) : alpha('#0288d1', 0.05),
      borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
    },
  }}
/>

        </Paper>

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuUsuario && handleEdit(menuUsuario)}>
            <EditIcon sx={{ mr: 1, fontSize: 20 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={() => menuUsuario && handleToggleActivo(menuUsuario)}>
            {menuUsuario?.activo ? (
              <>
                <PersonOffIcon sx={{ mr: 1, fontSize: 20 }} />
                Desactivar
              </>
            ) : (
              <>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                Activar
              </>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => menuUsuario && handleResetPassword(menuUsuario)}
          >
            <LockResetIcon sx={{ mr: 1, fontSize: 20 }} />
            Resetear Contraseña
          </MenuItem>
          <MenuItem onClick={() => menuUsuario && handleVerActividad(menuUsuario)}>
            <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
            Ver Actividad
          </MenuItem>
          <MenuItem
            onClick={() => menuUsuario && handleDelete(menuUsuario)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Eliminar
          </MenuItem>
        </Menu>

        {/* Diálogos */}
        <UsuarioFormDialog
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedUsuario(null);
          }}
          usuario={selectedUsuario}
          onSuccess={() => {
            setSuccess(
              selectedUsuario
                ? 'Usuario actualizado exitosamente'
                : 'Usuario creado exitosamente'
            );
            cargarUsuarios();
          }}
        />

        <UsuarioDeleteDialog
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedUsuario(null);
          }}
          usuario={selectedUsuario}
          onSuccess={() => {
            setSuccess('Usuario eliminado exitosamente');
            cargarUsuarios();
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
            setSuccess('Contraseña reseteada exitosamente');
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
    </ProtectedRoute>
  );
}