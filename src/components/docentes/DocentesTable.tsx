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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
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

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docente: Docente) => {
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

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, CI, código, email..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
            },
          }}
        />
      </Box>

      {/* Vista de Cards */}
      {viewMode === 'cards' && (
        <Grid container spacing={3}>
          {isLoading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid size={{xs:12, sm:6, md:4}} key={index}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))
          ) : docentes.length === 0 ? (
            <Grid size={{xs:12}}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron docentes
                </Typography>
              </Box>
            </Grid>
          ) : (
            docentes.map((docente) => (
              <Grid size={{xs:12, sm:6, md:4}} key={docente.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isDark
                        ? '0 12px 40px rgba(250, 204, 21, 0.2)'
                        : '0 12px 40px rgba(2, 136, 209, 0.2)',
                    },
                  }}
                >
                  <CardContent>
                    {/* Header con avatar y menú */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        src={docente.foto_url || undefined}
                        sx={{
                          width: 80,
                          height: 80,
                          border: `3px solid ${isDark ? '#facc15' : '#0288d1'}`,
                        }}
                      >
                        {docente.nombres.charAt(0)}{docente.apellido_paterno.charAt(0)}
                      </Avatar>
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={docente.activo ? 'Activo' : 'Inactivo'}>
                          <Chip
                            size="small"
                            label={docente.activo ? 'Activo' : 'Inactivo'}
                            color={docente.activo ? 'success' : 'error'}
                            sx={{ borderRadius: '8px' }}
                          />
                        </Tooltip>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, docente)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Información del docente */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {docente.nombres} {docente.apellidos}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Código: {docente.codigo}
                    </Typography>

                    {/* Tipo de contrato */}
                    <Chip
                      size="small"
                      label={getContratoLabel(docente.tipo_contrato)}
                      sx={{
                        backgroundColor: getContratoColor(docente.tipo_contrato),
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        mb: 2,
                      }}
                    />

                    {/* Especialidad */}
                    {docente.especialidad && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {docente.especialidad}
                        </Typography>
                      </Box>
                    )}

                    {/* Email */}
                    {docente.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          {docente.email}
                        </Typography>
                      </Box>
                    )}

                    {/* Teléfono */}
                    {docente.celular && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {docente.celular}
                        </Typography>
                      </Box>
                    )}

                    {/* Asignaciones */}
                    {docente.total_asignaciones !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <AssignmentIcon sx={{ fontSize: 18, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {docente.total_asignaciones} asignación(es)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Vista de Tabla */}
      {viewMode === 'table' && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Docente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo Contrato</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from(new Array(8)).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : docentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron docentes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                docentes.map((docente) => (
                  <TableRow key={docente.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={docente.foto_url || undefined} sx={{ width: 40, height: 40 }}>
                          {docente.nombres.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {docente.nombres} {docente.apellidos}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{docente.codigo}</TableCell>
                    <TableCell>{docente.ci}</TableCell>
                    <TableCell>
                      {docente.email && <Typography variant="body2">{docente.email}</Typography>}
                      {docente.celular && <Typography variant="caption" color="text.secondary">{docente.celular}</Typography>}
                    </TableCell>
                    <TableCell>{docente.especialidad || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getContratoLabel(docente.tipo_contrato)}
                        sx={{
                          backgroundColor: getContratoColor(docente.tipo_contrato),
                          color: '#fff',
                          borderRadius: '8px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={docente.activo ? 'Activo' : 'Inactivo'}
                        color={docente.activo ? 'success' : 'error'}
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, docente)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <TablePagination
          component="div"
          count={totalItems}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Filas por página:"
          sx={{
            '& .MuiTablePagination-toolbar': {
              borderRadius: '16px',
              backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
              px: 3,
            },
          }}
        />
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 180,
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