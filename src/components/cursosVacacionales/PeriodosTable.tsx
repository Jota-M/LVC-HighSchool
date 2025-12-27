// components/cursosVacacionales/PeriodosTable.tsx
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  WbSunny,
  AcUnit,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { PeriodoVacacional } from '@/types/cursoVacacionalTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PeriodosTableProps {
  periodos: PeriodoVacacional[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onEdit: (periodo: PeriodoVacacional) => void;
  onDelete: (periodo: PeriodoVacacional) => void;
  onFilterChange: (tipo?: 'verano' | 'invierno', anio?: number, activo?: boolean) => void;
}

export const PeriodosTable: React.FC<PeriodosTableProps> = ({
  periodos,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onEdit,
  onDelete,
  onFilterChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchValue, setSearchValue] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [activoFilter, setActivoFilter] = useState<string>('todos');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleTipoFilterChange = (event: any) => {
    const value = event.target.value;
    setTipoFilter(value);
    onFilterChange(
      value === 'todos' ? undefined : value,
      undefined,
      activoFilter === 'todos' ? undefined : activoFilter === 'activo'
    );
  };

  const handleActivoFilterChange = (event: any) => {
    const value = event.target.value;
    setActivoFilter(value);
    onFilterChange(
      tipoFilter === 'todos' ? undefined : tipoFilter as 'verano' | 'invierno',
      undefined,
      value === 'todos' ? undefined : value === 'activo'
    );
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'd/MM/yyyy HH:mm');
    } catch {
      return fecha;
    }
  };

  const getTipoConfig = (tipo: string) => {
    return tipo === 'verano'
      ? { icon: <WbSunny sx={{ fontSize: 18 }} />, color: '#f59e0b', label: 'Verano' }
      : { icon: <AcUnit sx={{ fontSize: 18 }} />, color: '#3b82f6', label: 'Invierno' };
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
          {/* Búsqueda */}
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

          {/* Filtro Tipo */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipoFilter}
              label="Tipo"
              onChange={handleTipoFilterChange}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="verano">Verano</MenuItem>
              <MenuItem value="invierno">Invierno</MenuItem>
            </Select>
          </FormControl>

          {/* Filtro Estado */}
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
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Año</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Inscripciones</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cursos</TableCell>
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
            ) : periodos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No se encontraron periodos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              periodos.map((periodo) => {
                const tipoConfig = getTipoConfig(periodo.tipo);
                return (
                  <TableRow
                    key={periodo.id}
                    sx={{
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {periodo.nombre}
                        </Typography>
                        {periodo.codigo && (
                          <Typography variant="caption" color="text.secondary">
                            {periodo.codigo}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={tipoConfig.icon}
                        label={tipoConfig.label}
                        size="small"
                        sx={{
                          bgcolor: alpha(tipoConfig.color, 0.1),
                          color: tipoConfig.color,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: tipoConfig.color,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {periodo.anio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatFecha(periodo.fecha_inicio)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        al {formatFecha(periodo.fecha_fin)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatFecha(periodo.fecha_inicio_inscripciones)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        al {formatFecha(periodo.fecha_fin_inscripciones)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${periodo.total_cursos || 0} cursos`}
                        size="small"
                        sx={{
                          bgcolor: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {periodo.activo ? (
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
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(periodo)}
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
                            onClick={() => onDelete(periodo)}
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