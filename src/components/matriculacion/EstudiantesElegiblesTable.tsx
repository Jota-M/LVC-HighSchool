// components/matriculacion/EstudiantesElegiblesTable.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  Typography,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as MatricularIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { EstudianteElegible } from '@/types/matriculacionTypes';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  estudiantes: EstudianteElegible[];
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearch: (search: string) => void;
  onMatricular: (estudianteId: number) => void;
}

export const EstudiantesElegiblesTable: React.FC<Props> = ({
  estudiantes,
  isLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onMatricular,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = parse(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header con búsqueda */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Estudiantes Elegibles
          </Typography>
          <Chip
            label={`${totalItems} estudiante${totalItems !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, código o CI..."
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            },
          }}
        />
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Última Matrícula</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Skeleton loading
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : estudiantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay estudiantes elegibles para matricular
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              estudiantes.map((estudiante) => (
                <TableRow
                  key={estudiante.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  {/* Estudiante */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={estudiante.foto_url || undefined}
                        alt={estudiante.nombres}
                        sx={{ width: 40, height: 40 }}
                      >
                        {estudiante.nombres.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {estudiante.nombres} {estudiante.apellido_paterno}
                        </Typography>
                        {estudiante.apellido_materno && (
                          <Typography variant="caption" color="text.secondary">
                            {estudiante.apellido_materno}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Código */}
                  <TableCell>
                    <Chip
                      label={estudiante.codigo}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </TableCell>

                  {/* CI */}
                  <TableCell>
                    <Typography variant="body2">
                      {estudiante.ci || <em style={{ color: 'gray' }}>Sin CI</em>}
                    </Typography>
                  </TableCell>

                  {/* Edad */}
                  <TableCell>
                    <Typography variant="body2">
                      {calcularEdad(estudiante.fecha_nacimiento)} años
                    </Typography>
                  </TableCell>

                  {/* Contacto */}
                  <TableCell>
                    <Box>
                      {estudiante.telefono && (
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          📞 {estudiante.telefono}
                        </Typography>
                      )}
                      {estudiante.email && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', fontSize: '0.75rem' }}
                        >
                          ✉️ {estudiante.email}
                        </Typography>
                      )}
                      {!estudiante.telefono && !estudiante.email && (
                        <Typography variant="caption" color="text.secondary">
                          Sin contacto
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Última Matrícula */}
                  <TableCell>
                    {estudiante.ultima_matricula ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {estudiante.ultima_matricula.grado} - {estudiante.ultima_matricula.paralelo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {estudiante.ultima_matricula.periodo}
                        </Typography>
                        <Chip
                          label={estudiante.ultima_matricula.estado}
                          size="small"
                          color={
                            estudiante.ultima_matricula.estado === 'activo' ? 'success' :
                            estudiante.ultima_matricula.estado === 'graduado' ? 'info' :
                            'default'
                          }
                          sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Primera matrícula
                      </Typography>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<MatricularIcon />}
                      onClick={() => onMatricular(estudiante.id)}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Matricular
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      />
    </Paper>
  );
};