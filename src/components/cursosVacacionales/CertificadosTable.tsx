// components/cursosVacacionales/CertificadosTable.tsx
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
  Menu,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CardMembership as CertificadoIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle,
} from '@mui/icons-material';
import { InscripcionVacacional } from '@/types/cursoVacacionalTypes';
import { usePeriodosVacacionales } from '@/hooks/useCursosVacacionales';
import { format } from 'date-fns';

interface CertificadosTableProps {
  inscripciones: InscripcionVacacional[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (inscripcion: InscripcionVacacional) => void;
  onDescargarCertificado: (inscripcionId: number) => void;
  onPrevisualizarCertificado: (inscripcionId: number) => void;
  onFilterChange: (periodo_vacacional_id?: number) => void;
  isGenerating: boolean;
}

export const CertificadosTable: React.FC<CertificadosTableProps> = ({
  inscripciones,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onView,
  onDescargarCertificado,
  onPrevisualizarCertificado,
  onFilterChange,
  isGenerating,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchValue, setSearchValue] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState<string>('todos');

  // Menú desplegable para certificado
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInscripcion, setSelectedInscripcion] = useState<number | null>(null);

  // Hooks
  const { periodos } = usePeriodosVacacionales({ activo: true });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handlePeriodoFilterChange = (event: any) => {
    const value = event.target.value;
    setPeriodoFilter(value);
    onFilterChange(value === 'todos' ? undefined : parseInt(value));
  };

  // Manejo del menú certificado
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, inscripcionId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInscripcion(inscripcionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInscripcion(null);
  };

  const handleDescargar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedInscripcion) {
      onDescargarCertificado(selectedInscripcion);
    }
    handleMenuClose();
  };

  const handlePrevisualizar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedInscripcion) {
      onPrevisualizarCertificado(selectedInscripcion);
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, CI, código..."
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
                <MenuItem value="todos">Todos los periodos</MenuItem>
                {periodos.map((periodo) => (
                  <MenuItem key={periodo.id} value={periodo.id.toString()}>
                    {periodo.nombre}
                  </MenuItem>
                ))}
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
                <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Curso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Completado</TableCell>
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
                  </TableRow>
                ))
              ) : inscripciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CertificadoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" variant="h6">
                      No hay cursos completados
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Los certificados estarán disponibles cuando los estudiantes completen sus cursos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inscripciones.map((inscripcion) => {
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
                              bgcolor: alpha('#10b981', 0.2),
                              color: '#10b981',
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
                        <Typography variant="body2">
                          {inscripcion.periodo_nombre}
                        </Typography>
                        {inscripcion.periodo_tipo && (
                          <Chip
                            label={inscripcion.periodo_tipo}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              textTransform: 'capitalize',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          Inicio: {inscripcion.curso_fecha_inicio ? formatFecha(inscripcion.curso_fecha_inicio) : '-'}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Fin: {inscripcion.curso_fecha_fin ? formatFecha(inscripcion.curso_fecha_fin) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 14 }} />}
                          label="Completado"
                          size="small"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: '#10b981',
                            },
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {formatFecha(inscripcion.updated_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {/* Botón Certificado */}
                          <Tooltip title="Generar certificado">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, inscripcion.id)}
                              disabled={isGenerating}
                              sx={{
                                color: isDark ? '#facc15' : '#0288d1',
                                '&:hover': {
                                  bgcolor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                                },
                              }}
                            >
                              <CertificadoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Botón Ver detalles */}
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

      {/* Menú Certificado desplegable */}
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
          onClick={handlePrevisualizar}
          disabled={isGenerating}
          sx={{ gap: 2 }}
        >
          <PrintIcon fontSize="small" />
          Ver Certificado
        </MenuItem>
        <MenuItem
          onClick={handleDescargar}
          disabled={isGenerating}
          sx={{ gap: 2 }}
        >
          <DownloadIcon fontSize="small" />
          Descargar PDF
        </MenuItem>
      </Menu>
    </>
  );
};