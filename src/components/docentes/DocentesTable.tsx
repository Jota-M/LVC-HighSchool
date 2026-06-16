// components/docentes/DocentesTable.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  alpha,
  useTheme,
  Tooltip,
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
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { Docente } from '@/types/docenteTypes';

interface DocentesCardViewProps {
  docentes: Docente[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (docente: Docente) => void;
  onEdit: (docente: Docente) => void;
  onDelete: (docente: Docente) => void;
  viewMode: 'cards' | 'table';
  onFilterChange?: (tipoContrato?: string, especialidad?: string) => void;
}

export const DocentesCardView: React.FC<DocentesCardViewProps> = ({
  docentes,
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
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docente: Docente) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDocente(docente);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocente(null);
  };

  const handleMenuAction = (action: 'view' | 'edit' | 'delete') => {
    if (selectedDocente) {
      switch (action) {
        case 'view':
          onView(selectedDocente);
          break;
        case 'edit':
          onEdit(selectedDocente);
          break;
        case 'delete':
          onDelete(selectedDocente);
          break;
      }
    }
    handleMenuClose();
  };

  const getInitials = (nombres: string, apellido: string) => {
    return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getContratoColor = (tipo?: string | null) => {
    switch (tipo) {
      case 'planta': return '#4caf50';
      case 'contrato': return '#2196f3';
      case 'honorarios': return '#ff9800';
      case 'medio_tiempo': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getContratoLabel = (tipo?: string | null) => {
    switch (tipo) {
      case 'planta': return 'Planta';
      case 'contrato': return 'Contrato';
      case 'honorarios': return 'Honorarios';
      case 'medio_tiempo': return 'Medio Tiempo';
      default: return 'N/A';
    }
  };

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Columnas para la tabla (DataGrid)
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
      field: 'especialidad',
      headerName: 'Especialidad',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" noWrap>
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 130,
      valueGetter: (value: any, row: Docente) => row.celular,
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
      field: 'tipo_contrato',
      headerName: 'Tipo Contrato',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={getContratoLabel(params.value)}
          sx={{
            backgroundColor: getContratoColor(params.value),
            color: '#fff',
            fontWeight: 700,
            borderRadius: '8px',
          }}
        />
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
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Buscar por nombre, CI, código, email..."
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
      </Box>

      {/* Estado vacío */}
      {!isLoading && docentes.length === 0 ? (
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
            No se encontraron docentes
          </Typography>
        </Box>
      ) : viewMode === 'table' ? (
        <Paper
          sx={{
            height: 600,
            borderRadius: '20px',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <DataGrid
            rows={docentes}
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
      ) : (
        <>
          {/* Vista de Cards */}
          <Grid container spacing={3}>
            {docentes.map((docente) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={docente.id}>
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
                    onClick={() => onView(docente)}
                  >
                    {/* Badge de estado */}
                    <Chip
                      label={docente.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={docente.activo ? 'success' : 'error'}
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
                      onClick={(e) => handleMenuOpen(e, docente)}
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
                      <MoreVertIcon />
                    </IconButton>

                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      {/* Avatar */}
                      <Avatar
                        src={docente.foto_url || undefined}
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
                        {!docente.foto_url && getInitials(docente.nombres, docente.apellido_paterno)}
                      </Avatar>

                      {/* Nombre */}
                      <Typography variant="h6" fontWeight={800} gutterBottom>
                        {docente.nombres}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {docente.apellidos}
                      </Typography>

                      {/* Código */}
                      <Chip
                        label={docente.codigo}
                        size="small"
                        sx={{
                          mt: 1,
                          mb: 1,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      />

                      {/* Tipo de contrato */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          size="small"
                          label={getContratoLabel(docente.tipo_contrato)}
                          sx={{
                            backgroundColor: getContratoColor(docente.tipo_contrato),
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: '8px',
                          }}
                        />
                      </Box>

                      {/* Botones de acción directos */}
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(docente);
                            }}
                            sx={{
                              backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                              '&:hover': {
                                backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.2),
                              },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(docente);
                            }}
                            sx={{
                              backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                              '&:hover': {
                                backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

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
                        {docente.ci && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              CI: {docente.ci}
                            </Typography>
                          </Box>
                        )}

                        {/* Especialidad */}
                        {docente.especialidad && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap>
                              {docente.especialidad}
                            </Typography>
                          </Box>
                        )}

                        {/* Teléfono */}
                        {docente.celular && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap>
                              {docente.celular}
                            </Typography>
                          </Box>
                        )}

                        {/* Email */}
                        {docente.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap sx={{ maxWidth: '100%' }}>
                              {docente.email}
                            </Typography>
                          </Box>
                        )}

                        {/* Asignaciones */}
                        {docente.total_asignaciones !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon sx={{ fontSize: 16, color: isDark ? '#facc15' : '#0288d1' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {docente.total_asignaciones} asignación(es)
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

      {/* Menú contextual */}
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
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};