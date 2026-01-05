// components/cursosVacacionales/InscripcionesTable.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  useTheme,
  alpha,
  Typography,
  Avatar,
  Button,
  Menu,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CheckCircle,
  HourglassEmpty,
  School,
  Cancel,
  VerifiedUser,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { InscripcionVacacional, EstadoInscripcionVacacional } from '@/types/cursoVacacionalTypes';
import { 
  usePeriodosVacacionales, 
  useCursosVacacionales, 
  useInscripcionesVacacionales,
  useInscripcionPDF 
} from '@/hooks/useCursosVacacionales';
import { format } from 'date-fns';

interface InscripcionesTableProps {
  inscripciones: InscripcionVacacional[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (inscripcion: InscripcionVacacional) => void;
  onDelete: (inscripcion: InscripcionVacacional) => void;
  onFilterChange: (periodo_vacacional_id?: number, curso_vacacional_id?: number, estado?: string, pago_verificado?: boolean) => void;
}

export const InscripcionesTable: React.FC<InscripcionesTableProps> = ({
  inscripciones,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onView,
  onDelete,
  onFilterChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchValue, setSearchValue] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState<string>('todos');
  const [cursoFilter, setCursoFilter] = useState<string>('todos');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [pagoFilter, setPagoFilter] = useState<string>('todos');
  
  // Menú desplegable para PDF
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInscripcion, setSelectedInscripcion] = useState<number | null>(null);

  // Hooks
  const { periodos } = usePeriodosVacacionales({ activo: true });
  const { cursos } = useCursosVacacionales({ activo: true });
  const { verificarPago, cambiarEstado, isVerificandoPago } = useInscripcionesVacacionales();
  const { descargarPDF, previsualizarPDF, isDownloading } = useInscripcionPDF();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handlePeriodoFilterChange = (event: any) => {
    const value = event.target.value;
    setPeriodoFilter(value);
    onFilterChange(
      value === 'todos' ? undefined : parseInt(value),
      cursoFilter === 'todos' ? undefined : parseInt(cursoFilter),
      estadoFilter === 'todos' ? undefined : estadoFilter,
      pagoFilter === 'todos' ? undefined : pagoFilter === 'verificado'
    );
  };

  const handleCursoFilterChange = (event: any) => {
    const value = event.target.value;
    setCursoFilter(value);
    onFilterChange(
      periodoFilter === 'todos' ? undefined : parseInt(periodoFilter),
      value === 'todos' ? undefined : parseInt(value),
      estadoFilter === 'todos' ? undefined : estadoFilter,
      pagoFilter === 'todos' ? undefined : pagoFilter === 'verificado'
    );
  };

  const handleEstadoFilterChange = (event: any) => {
    const value = event.target.value;
    setEstadoFilter(value);
    onFilterChange(
      periodoFilter === 'todos' ? undefined : parseInt(periodoFilter),
      cursoFilter === 'todos' ? undefined : parseInt(cursoFilter),
      value === 'todos' ? undefined : value,
      pagoFilter === 'todos' ? undefined : pagoFilter === 'verificado'
    );
  };

  const handlePagoFilterChange = (event: any) => {
    const value = event.target.value;
    setPagoFilter(value);
    onFilterChange(
      periodoFilter === 'todos' ? undefined : parseInt(periodoFilter),
      cursoFilter === 'todos' ? undefined : parseInt(cursoFilter),
      estadoFilter === 'todos' ? undefined : estadoFilter,
      value === 'todos' ? undefined : value === 'verificado'
    );
  };

  const handleVerificarPago = (inscripcionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    verificarPago(inscripcionId);
  };

  // Manejo del menú PDF
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, inscripcionId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInscripcion(inscripcionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInscripcion(null);
  };

  const handleDescargarPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedInscripcion) {
      descargarPDF(selectedInscripcion);
    }
    handleMenuClose();
  };

  const handlePrevisualizarPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedInscripcion) {
      previsualizarPDF(selectedInscripcion);
    }
    handleMenuClose();
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy');
    } catch {
      return fecha;
    }
  };

  const getEstadoConfig = (estado: EstadoInscripcionVacacional) => {
    const configs = {
      pendiente: {
        color: '#f59e0b',
        label: 'Pendiente',
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
      },
      pago_verificado: {
        color: '#3b82f6',
        label: 'Verificado',
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
      },
      activo: {
        color: '#10b981',
        label: 'Activo',
        icon: <School sx={{ fontSize: 16 }} />,
      },
      completado: {
        color: '#8b5cf6',
        label: 'Completado',
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
      },
      retirado: {
        color: '#6b7280',
        label: 'Retirado',
        icon: <Cancel sx={{ fontSize: 16 }} />,
      },
      rechazado: {
        color: '#ef4444',
        label: 'Rechazado',
        icon: <Cancel sx={{ fontSize: 16 }} />,
      },
    };
    return configs[estado] || configs.pendiente;
  };

  const getInitials = (nombres: string, apellido: string) => {
    return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
          overflow: 'hidden',
        }}
      >
        {/* Filtros */}
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, CI, teléfono..."
              value={searchValue}
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
                  borderRadius: '12px',
                },
              }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Periodo</InputLabel>
              <Select
                value={periodoFilter}
                label="Periodo"
                onChange={handlePeriodoFilterChange}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {periodos.map((periodo) => (
                  <MenuItem key={periodo.id} value={periodo.id.toString()}>
                    {periodo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Curso</InputLabel>
              <Select
                value={cursoFilter}
                label="Curso"
                onChange={handleCursoFilterChange}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {cursos.map((curso) => (
                  <MenuItem key={curso.id} value={curso.id.toString()}>
                    {curso.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado"
                onChange={handleEstadoFilterChange}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="pago_verificado">Verificado</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="retirado">Retirado</MenuItem>
                <MenuItem value="rechazado">Rechazado</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Pago</InputLabel>
              <Select
                value={pagoFilter}
                label="Pago"
                onChange={handlePagoFilterChange}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="verificado">Verificados</MenuItem>
                <MenuItem value="pendiente">Pendientes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Tabla */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Curso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tutor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pago</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Inscripción</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : inscripciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No se encontraron inscripciones
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inscripciones.map((inscripcion) => {
                  const estadoConfig = getEstadoConfig(inscripcion.estado);
                  return (
                    <TableRow
                      key={inscripcion.id}
                      sx={{
                        '&:hover': {
                          bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => onView(inscripcion)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(estadoConfig.color, 0.2),
                              color: estadoConfig.color,
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          >
                            {getInitials(inscripcion.nombres, inscripcion.apellido_paterno)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {inscripcion.nombres} {inscripcion.apellido_paterno}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {inscripcion.codigo_inscripcion}
                            </Typography>
                            {inscripcion.ci && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                CI: {inscripcion.ci}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inscripcion.curso_nombre}
                        </Typography>
                        {inscripcion.curso_codigo && (
                          <Typography variant="caption" color="text.secondary">
                            {inscripcion.curso_codigo}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{inscripcion.nombre_tutor}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inscripcion.telefono_tutor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Bs. {inscripcion.monto_pagado.toLocaleString('es-BO', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                          {inscripcion.pago_verificado ? (
                            <Chip
                              icon={<VerifiedUser sx={{ fontSize: 14 }} />}
                              label="Verificado"
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: alpha('#10b981', 0.1),
                                color: '#10b981',
                                '& .MuiChip-icon': {
                                  fontSize: 14,
                                  color: '#10b981',
                                },
                              }}
                            />
                          ) : (
                            <Button
                              color='secondary'
                              variant="outlined"
                              size="small"
                              onClick={(e) => handleVerificarPago(inscripcion.id, e)}
                              disabled={isVerificandoPago}
                              sx={{
                                mt: 0.5,
                                fontSize: '0.7rem',
                                textTransform: 'none',
                                minWidth: 'auto',
                                px: 1,
                                py: 0.25,
                              }}
                            >
                              Verificar
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={estadoConfig.icon}
                          label={estadoConfig.label}
                          size="small"
                          sx={{
                            bgcolor: alpha(estadoConfig.color, 0.1),
                            color: estadoConfig.color,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: estadoConfig.color,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatFecha(inscripcion.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {/* ✅ BOTÓN PDF NUEVO */}
                          <Tooltip title="Recibo PDF">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, inscripcion.id)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  bgcolor: alpha('#ef4444', 0.1),
                                },
                              }}
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(inscripcion);
                              }}
                              sx={{
                                color: '#3b82f6',
                                '&:hover': {
                                  bgcolor: alpha('#3b82f6', 0.1),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(inscripcion);
                              }}
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  bgcolor: alpha('#ef4444', 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
          }}
        />
      </Card>

      {/* ✅ MENÚ PDF DESPLEGABLE */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 200,
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
          },
        }}
      >
        <MenuItem 
          onClick={handlePrevisualizarPDF}
          disabled={isDownloading}
          sx={{ gap: 2 }}
        >
          <PrintIcon fontSize="small" />
          Ver Recibo
        </MenuItem>
        <MenuItem 
          onClick={handleDescargarPDF}
          disabled={isDownloading}
          sx={{ gap: 2 }}
        >
          <DownloadIcon fontSize="small" />
          Descargar PDF
        </MenuItem>
      </Menu>
    </>
  );
};