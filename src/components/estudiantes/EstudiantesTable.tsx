import React, { useState, useEffect } from 'react';
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
  InputLabel,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Wc as WcIcon,
} from '@mui/icons-material';
import { Estudiante } from '@/types/estudianteTypes';
import { gestionAcademicaService } from '@/services/estudiantesService';

interface EstudiantesCardViewProps {
  estudiantes: Estudiante[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (estudiante: Estudiante) => void;
  onEdit: (estudiante: Estudiante) => void;
  onDelete: (estudiante: Estudiante) => void;
  viewMode: 'cards' | 'table';
  onFilterChange?: (gradoId?: number, paraleloId?: number) => void;
}

export const EstudiantesCardView: React.FC<EstudiantesCardViewProps> = ({
  estudiantes,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onView,
  onEdit,
  onDelete,
  viewMode,
  onFilterChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState('');
  const [gradoFilter, setGradoFilter] = useState<number | ''>('');
  const [paraleloFilter, setParaleloFilter] = useState<number | ''>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  // Estados para los selectores
  const [grados, setGrados] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [loadingGrados, setLoadingGrados] = useState(false);
  const [loadingParalelos, setLoadingParalelos] = useState(false);

  // Cargar grados al montar
  useEffect(() => {
    cargarGrados();
  }, []);

  // Cargar paralelos cuando cambia el grado
  useEffect(() => {
    if (gradoFilter) {
      cargarParalelos(Number(gradoFilter));
    } else {
      setParalelos([]);
      setParaleloFilter('');
    }
  }, [gradoFilter]);

  // Notificar cambios de filtro
  useEffect(() => {
    if (onFilterChange) {
      const grado = gradoFilter ? Number(gradoFilter) : undefined;
      const paralelo = paraleloFilter ? Number(paraleloFilter) : undefined;
      onFilterChange(grado, paralelo);
    }
  }, [gradoFilter, paraleloFilter]);

  const cargarGrados = async () => {
    try {
      setLoadingGrados(true);
      const data = await gestionAcademicaService.obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error('Error al cargar grados:', error);
    } finally {
      setLoadingGrados(false);
    }
  };

  const cargarParalelos = async (gradoId: number) => {
    try {
      setLoadingParalelos(true);
      const data = await gestionAcademicaService.obtenerParalelos(gradoId);
      setParalelos(data);
    } catch (error) {
      console.error('Error al cargar paralelos:', error);
      setParalelos([]);
    } finally {
      setLoadingParalelos(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, estudiante: Estudiante) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEstudiante(estudiante);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEstudiante(null);
  };

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    if (!selectedEstudiante) return;

    switch (action) {
      case 'view':
        onView(selectedEstudiante);
        break;
      case 'edit':
        onEdit(selectedEstudiante);
        break;
      case 'delete':
        onDelete(selectedEstudiante);
        break;
    }
    handleMenuClose();
  };

  const getInitials = (nombres: string, apellido: string) => {
    return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getCursoActual = (estudiante: Estudiante) => {
    if (estudiante.matriculas && estudiante.matriculas.length > 0) {
      const matriculaActiva = estudiante.matriculas.find(m => m.estado === 'activa') || estudiante.matriculas[0];
      return `${matriculaActiva.grado} "${matriculaActiva.paralelo}"`;
    }
    return 'Sin matrícula';
  };

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Columnas para la tabla
  const columns: GridColDef[] = [
    {
      field: 'codigo',
      headerName: 'Código',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
            color: isDark ? '#facc15' : '#0288d1',
          }}
        />
      ),
    },
    {
      field: 'foto',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          src={params.row.foto_url || undefined}
          sx={{
            width: 40,
            height: 40,
            bgcolor: isDark ? '#facc15' : '#0288d1',
            color: isDark ? '#000' : '#fff',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {!params.row.foto_url && getInitials(params.row.nombres, params.row.apellido_paterno)}
        </Avatar>
      ),
    },
    {
      field: 'nombres',
      headerName: 'Nombre Completo',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.apellidos}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'ci',
      headerName: 'CI',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    {
  field: 'edad',
  headerName: 'Edad',
  width: 80,
  headerAlign: 'center',
  align: 'center',
  valueGetter: (value: any, row: Estudiante) => calculateAge(row.fecha_nacimiento),
  renderCell: (params: GridRenderCellParams) => (
    <Chip
      icon={<CakeIcon sx={{ fontSize: 14 }} />}
      label={`${params.value} años`}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  ),
},
    {
      field: 'genero',
      headerName: 'Género',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={<WcIcon sx={{ fontSize: 14 }} />}
          label={params.value === 'masculino' ? 'M' : params.value === 'femenino' ? 'F' : '-'}
          size="small"
          color={params.value === 'masculino' ? 'info' : 'secondary'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value || '-'}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" noWrap>
            {params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          size="small"
          color={params.value ? 'success' : 'error'}
          sx={{ fontWeight: 700 }}
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
        alignItems: { xs: 'stretch', md: 'center' },
        flexWrap: 'wrap'
      }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Buscar por nombre, apellido, código o CI..."
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
          sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={gradoFilter}
            onChange={(e) => setGradoFilter(e.target.value as number | '')}
            displayEmpty
            size="medium"
            disabled={loadingGrados}
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value="">Todos los grados</MenuItem>
            {grados.map((grado) => (
              <MenuItem key={grado.id} value={grado.id}>
                {grado.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={paraleloFilter}
            onChange={(e) => setParaleloFilter(e.target.value as number | '')}
            displayEmpty
            size="medium"
            disabled={!gradoFilter || loadingParalelos}
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value="">Todos los paralelos</MenuItem>
            {paralelos.map((paralelo) => (
              <MenuItem key={paralelo.id} value={paralelo.id}>
                {paralelo.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={generoFilter}
            onChange={(e) => setGeneroFilter(e.target.value)}
            displayEmpty
            size="medium"
            sx={{
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <MenuItem value="">Todos los géneros</MenuItem>
            <MenuItem value="masculino">Masculino</MenuItem>
            <MenuItem value="femenino">Femenino</MenuItem>
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

      {/* Vista Cards o Tabla */}
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400 
        }}>
          <Typography variant="body1" color="text.secondary">
            Cargando estudiantes...
          </Typography>
        </Box>
      ) : estudiantes.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400,
          flexDirection: 'column',
          gap: 2
        }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron estudiantes
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
              rows={estudiantes}
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
              onRowClick={(params) => onView(params.row)}
            />
          </Paper>
        </>
      ) : (
        <>
          {/* Vista de Cards */}
          <Grid container spacing={3}>
            {estudiantes.map((estudiante) => (
              <Grid size={{xs:12, sm:6, md:4, lg:3}} key={estudiante.id}>
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
                    onClick={() => onView(estudiante)}
                  >
                    {/* Badge de estado */}
                    <Chip
                      label={estudiante.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={estudiante.activo ? 'success' : 'error'}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 1,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />

                    {/* Menú de acciones */}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, estudiante)}
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
                      {/* Avatar con badge de curso */}
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          estudiante.matriculas && estudiante.matriculas.length > 0 ? (
                            <Tooltip title={`Curso: ${getCursoActual(estudiante)}`}>
                              <Chip
                                icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                                label={getCursoActual(estudiante).split(' ')[0]}
                                size="small"
                                color="primary"
                                sx={{
                                  height: 24,
                                  fontWeight: 700,
                                  '& .MuiChip-icon': { ml: 0.5 }
                                }}
                              />
                            </Tooltip>
                          ) : null
                        }
                      >
                        <Avatar
                          src={estudiante.foto_url || undefined}
                          sx={{
                            width: 90,
                            height: 90,
                            margin: '0 auto 16px',
                            bgcolor: isDark ? '#facc15' : '#0288d1',
                            color: isDark ? '#000' : '#fff',
                            fontSize: '2rem',
                            fontWeight: 800,
                            border: `4px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
                            boxShadow: `0 8px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                          }}
                        >
                          {!estudiante.foto_url && getInitials(estudiante.nombres, estudiante.apellido_paterno)}
                        </Avatar>
                      </Badge>

                      {/* Nombre */}
                      <Typography variant="h6" fontWeight={800} gutterBottom>
                        {estudiante.nombres}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {estudiante.apellidos}
                      </Typography>

                      {/* Código */}
                      <Chip
                        label={estudiante.codigo}
                        size="small"
                        sx={{
                          mt: 1,
                          mb: 2,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      />

                      {/* Información adicional */}
                      <Box sx={{ 
                        mt: 2, 
                        pt: 2, 
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        textAlign: 'left'
                      }}>
                        {/* CI */}
                        {estudiante.ci && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              CI: {estudiante.ci}
                            </Typography>
                          </Box>
                        )}

                        {/* Edad y género */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CakeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {calculateAge(estudiante.fecha_nacimiento)} años
                          </Typography>
                          <Chip
                            label={estudiante.genero === 'masculino' ? 'M' : estudiante.genero === 'femenino' ? 'F' : '-'}
                            size="small"
                            color={estudiante.genero === 'masculino' ? 'info' : 'secondary'}
                            sx={{ height: 20, fontSize: '0.7rem', ml: 'auto' }}
                          />
                        </Box>

                        {/* Teléfono */}
                        {estudiante.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap>
                              {estudiante.telefono}
                            </Typography>
                          </Box>
                        )}

                        {/* Email */}
                        {estudiante.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap sx={{ maxWidth: '100%' }}>
                              {estudiante.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Paginación solo para Cards */}
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
            borderRadius: '12px',
            minWidth: 180,
            mt: 1,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};