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
  Menu,
  MenuItem,
  Alert,
  Avatar,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';

import ProtectedRoute from '../../../components/ProtectedRoute';
import estudiantesService, { Estudiante } from '../../../services/estudiantesService';
import EstudianteFormDialog from '../../../components/estudiantes/EstudianteFormDialog';
import EstudianteDeleteDialog from '../../../components/estudiantes/EstudianteDeleteDialog';
import EstudianteDetalleDialog from '../../../components/estudiantes/EstudianteDetalleDialog';

export default function EstudiantesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Estados
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Paginación y filtros
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState<boolean | null>(null);

  // Diálogos
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  // Menú de acciones
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuEstudiante, setMenuEstudiante] = useState<Estudiante | null>(null);

  // Cargar estudiantes
  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await estudiantesService.listar({
        page: page + 1,
        limit: pageSize,
        search: searchTerm || undefined,
        genero: generoFilter || undefined,
        activo: activoFilter !== null ? activoFilter : undefined,
      });

      setEstudiantes(response.data.estudiantes);
      setTotalRows(response.data.paginacion.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstudiantes();
  }, [page, pageSize, searchTerm, generoFilter, activoFilter]);

  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, estudiante: Estudiante) => {
    setAnchorEl(event.currentTarget);
    setMenuEstudiante(estudiante);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEstudiante(null);
  };

  const handleEdit = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setDeleteOpen(true);
    handleMenuClose();
  };

  const handleVerDetalle = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setDetalleOpen(true);
    handleMenuClose();
  };

  // Columnas de la tabla
  const columns: GridColDef[] = [
    {
      field: 'foto_url',
      headerName: 'Foto',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          src={params.value || '/default-avatar.png'}
          alt={params.row.nombres}
          sx={{
            width: 40,
            height: 40,
            border: '2px solid #0288d1',
          }}
        />
      ),
    },
    {
      field: 'nombres',
      headerName: 'Nombres',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'apellidos',
      headerName: 'Apellidos',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'documento_identidad',
      headerName: 'Documento',
      width: 130,
    },
    {
      field: 'genero',
      headerName: 'Género',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Masculino' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 120,
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 100,
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
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermissions={['estudiantes.leer']}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Gestión de Estudiantes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra los estudiantes del sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedEstudiante(null);
              setFormOpen(true);
            }}
            sx={{
              background: 'linear-gradient(90deg, #0288d1, #01579b)',
              px: 3,
              py: 1.5,
            }}
          >
            Nuevo Estudiante
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
        <Paper sx={{ p: 2, mb: 2, backgroundColor: isDark ? '#1a1f2e' : '#fff' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar por nombre, apellido o documento..."
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
              label="Género"
              value={generoFilter}
              onChange={(e) => setGeneroFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>

            <TextField
              select
              label="Estado"
              value={activoFilter === null ? '' : activoFilter.toString()}
              onChange={(e) =>
                setActivoFilter(e.target.value === '' ? null : e.target.value === 'true')
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
                setGeneroFilter('');
                setActivoFilter(null);
              }}
            >
              Limpiar
            </Button>
          </Box>
        </Paper>

        {/* Tabla */}
        <Paper sx={{ height: 600, backgroundColor: isDark ? '#1a1f2e' : '#fff' }}>
          <DataGrid
            rows={estudiantes}
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
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => menuEstudiante && handleVerDetalle(menuEstudiante)}>
            <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
            Ver Detalles
          </MenuItem>
          <MenuItem onClick={() => menuEstudiante && handleEdit(menuEstudiante)}>
            <EditIcon sx={{ mr: 1, fontSize: 20 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={() => menuEstudiante && handleDelete(menuEstudiante)} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Eliminar
          </MenuItem>
        </Menu>

        {/* Diálogos */}
        

        <EstudianteDeleteDialog
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedEstudiante(null);
          }}
          estudiante={selectedEstudiante}
          onSuccess={() => {
            setSuccess('Estudiante eliminado exitosamente');
            cargarEstudiantes();
          }}
        />

        <EstudianteDetalleDialog
          open={detalleOpen}
          onClose={() => {
            setDetalleOpen(false);
            setSelectedEstudiante(null);
          }}
          estudiante={selectedEstudiante}
        />
      </Box>
    </ProtectedRoute>
  );
}