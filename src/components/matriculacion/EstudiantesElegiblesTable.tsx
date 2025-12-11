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
  Card,
  Grid,
  Stack,
  Divider,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as MatricularIcon,
} from '@mui/icons-material';
import { EstudianteElegible } from '@/types/matriculacionTypes';
import { parse } from 'date-fns';



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
  viewMode?: 'cards' | 'table';
}

// Card Individual
const EstudianteCard: React.FC<{
  estudiante: EstudianteElegible;
  onMatricular: (id: number) => void;
  index: number;
}> = ({ estudiante, onMatricular, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    <Card
      sx={{
        borderRadius: 4,
        transition: 'all 0.3s ease',
        animation: `slideIn 0.5s ease ${index * 0.1}s both`,
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        }
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header con Avatar y Botón */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Avatar
              src={estudiante.foto_url || undefined}
              alt={estudiante.nombres}
              sx={{ 
                width: { xs: 48, md: 56 }, 
                height: { xs: 48, md: 56 },
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              {estudiante.nombres.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {estudiante.nombres}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {estudiante.apellido_paterno} {estudiante.apellido_materno}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<MatricularIcon />}
            onClick={() => onMatricular(estudiante.id)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              px: { xs: 1.5, md: 2 },
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
              flexShrink: 0,
              ml: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            Matricular
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Info */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              CÓDIGO
            </Typography>
            <Chip
              label={estudiante.codigo}
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', md: '0.75rem' } }}
            />
          </Box>

          {estudiante.ci && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                CI
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {estudiante.ci}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              EDAD
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {calcularEdad(estudiante.fecha_nacimiento)} años
            </Typography>
          </Box>

          {(estudiante.telefono || estudiante.email) && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  CONTACTO
                </Typography>
                {estudiante.telefono && (
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.85rem' } }}>
                    📞 {estudiante.telefono}
                  </Typography>
                )}
                {estudiante.email && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                    ✉️ {estudiante.email}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {estudiante.ultima_matricula && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  ÚLTIMA MATRÍCULA
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.85rem' } }}>
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
                  sx={{ mt: 0.5, fontSize: { xs: '0.65rem', md: '0.7rem' }, height: { xs: 18, md: 20 } }}
                />
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

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
  viewMode = 'table'
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

  // Vista de Cards
  if (viewMode === 'cards') {
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
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Estudiantes Elegibles
            </Typography>
            <Chip
              label={`${totalItems} estudiante${totalItems !== 1 ? 's' : ''}`}
              color="primary"
              sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
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

        {/* Cards Grid */}
        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid size={{xs:12, sm:6, md:4}} key={index}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          ) : estudiantes.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay estudiantes elegibles para matricular
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {estudiantes.map((estudiante, index) => (
                <Grid size={{xs:12, sm:6, md:4}} key={estudiante.id}>
                  <EstudianteCard
                    estudiante={estudiante}
                    onMatricular={onMatricular}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        />
      </Paper>
    );
  }

  // Vista de Tabla (código original, simplificado para responsive)
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
      <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Estudiantes Elegibles
          </Typography>
          <Chip
            label={`${totalItems} estudiante${totalItems !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
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
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>CI</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Última Matrícula</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', md: '0.875rem' } }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}><Skeleton /></TableCell>
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
                <TableRow key={estudiante.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                      <Avatar
                        src={estudiante.foto_url || undefined}
                        sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}
                      >
                        {estudiante.nombres.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {estudiante.nombres} {estudiante.apellido_paterno}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Chip label={estudiante.codigo} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {estudiante.ci || '-'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {calcularEdad(estudiante.fecha_nacimiento)} años
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {estudiante.telefono || estudiante.email || 'Sin contacto'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {estudiante.ultima_matricula ? (
                      <Typography variant="caption">
                        {estudiante.ultima_matricula.grado} - {estudiante.ultima_matricula.paralelo}
                      </Typography>
                    ) : (
                      'Primera matrícula'
                    )}
                  </TableCell>
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
                        fontSize: { xs: '0.7rem', md: '0.875rem' },
                        px: { xs: 1, md: 2 },
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
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
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      />
    </Paper>
  );
};