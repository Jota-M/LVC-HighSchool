// components/cursosVacacionales/CursosTable.tsx
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
  LinearProgress,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CheckCircle,
  Cancel,
  Image as ImageIcon,
} from '@mui/icons-material';
import { CursoVacacional } from '@/types/cursoVacacionalTypes';
import { usePeriodosVacacionales } from '@/hooks/useCursosVacacionales';
import { format } from 'date-fns';

interface CursosTableProps {
  cursos: CursoVacacional[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onView: (curso: CursoVacacional) => void;
  onEdit: (curso: CursoVacacional) => void;
  onDelete: (curso: CursoVacacional) => void;
  onFilterChange: (periodo_vacacional_id?: number, grado_id?: number, activo?: boolean, con_cupos?: boolean) => void;
}

export const CursosTable: React.FC<CursosTableProps> = ({
  cursos,
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
  onFilterChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchValue, setSearchValue] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState<string>('todos');
  const [activoFilter, setActivoFilter] = useState<string>('todos');
  const [conCupos, setConCupos] = useState(false);

  const { periodos } = usePeriodosVacacionales({ activo: true });

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
      undefined,
      activoFilter === 'todos' ? undefined : activoFilter === 'activo',
      conCupos
    );
  };

  const handleActivoFilterChange = (event: any) => {
    const value = event.target.value;
    setActivoFilter(value);
    onFilterChange(
      periodoFilter === 'todos' ? undefined : parseInt(periodoFilter),
      undefined,
      value === 'todos' ? undefined : value === 'activo',
      conCupos
    );
  };

  const handleConCuposChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setConCupos(value);
    onFilterChange(
      periodoFilter === 'todos' ? undefined : parseInt(periodoFilter),
      undefined,
      activoFilter === 'todos' ? undefined : activoFilter === 'activo',
      value
    );
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'd/MM/yyyy');
    } catch {
      return fecha;
    }
  };

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return '#ef4444';
    if (porcentaje >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
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
            placeholder="Buscar por nombre o código..."
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={activoFilter}
              label="Estado"
              onChange={handleActivoFilterChange}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={conCupos}
                onChange={handleConCuposChange}
                color="primary"
              />
            }
            label="Solo con cupos"
            sx={{ whiteSpace: 'nowrap' }}
          />
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
              <TableCell sx={{ fontWeight: 700 }}>Foto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Curso</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fechas</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Horario</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cupos</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Costo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(rowsPerPage)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : cursos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No se encontraron cursos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cursos.map((curso) => {
                const porcentajeOcupacion = (curso.cupos_ocupados / curso.cupos_totales) * 100;
                const ocupacionColor = getOcupacionColor(porcentajeOcupacion);

                return (
                  <TableRow
                    key={curso.id}
                    sx={{
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                      },
                    }}
                  >
                    {/* ⬇️ COLUMNA DE FOTO */}
                    <TableCell>
                      <Avatar
                        src={curso.foto_url || undefined}
                        alt={curso.nombre}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '12px',
                          bgcolor: curso.foto_url ? 'transparent' : alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                        variant="rounded"
                      >
                        {!curso.foto_url && <ImageIcon />}
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {curso.nombre}
                        </Typography>
                        {curso.codigo && (
                          <Typography variant="caption" color="text.secondary">
                            {curso.codigo}
                          </Typography>
                        )}
                        {curso.grado_nombre && (
                          <Chip
                            label={curso.grado_nombre}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.1),
                              color: '#3b82f6',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {curso.periodo_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {curso.periodo_tipo === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatFecha(curso.fecha_inicio)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        al {formatFecha(curso.fecha_fin)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {curso.hora_inicio && curso.hora_fin ? (
                        <>
                          <Typography variant="caption" display="block">
                            {curso.hora_inicio.slice(0, 5)} - {curso.hora_fin.slice(0, 5)}
                          </Typography>
                          {curso.dias_semana && (
                            <Typography variant="caption" color="text.secondary">
                              {curso.dias_semana}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No definido
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {curso.cupos_ocupados} / {curso.cupos_totales}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={porcentajeOcupacion}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: isDark
                              ? alpha('#fff', 0.1)
                              : alpha('#000', 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: ocupacionColor,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: ocupacionColor, fontWeight: 600 }}
                        >
                          {porcentajeOcupacion.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Bs. {curso.costo.toLocaleString('es-BO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {curso.activo ? (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 16 }} />}
                          label="Activo"
                          size="small"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: '#10b981',
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<Cancel sx={{ fontSize: 16 }} />}
                          label="Inactivo"
                          size="small"
                          sx={{
                            bgcolor: alpha('#6b7280', 0.1),
                            color: '#6b7280',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: '#6b7280',
                            },
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => onView(curso)}
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
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(curso)}
                            sx={{
                              color: isDark ? '#facc15' : '#0288d1',
                              '&:hover': {
                                bgcolor: isDark
                                  ? alpha('#facc15', 0.1)
                                  : alpha('#0288d1', 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(curso)}
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
  );
};