// src/app/dashboard/docente/estudiantes/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Fade,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Tooltip,
  Badge,
  Paper,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  PeopleAlt as PeopleIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  MenuBook as BookIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { useMisEstudiantesDocente } from '@/hooks/useMisEstudiantesDocente';
import { Estudiante } from '@/types/estudianteTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export default function MisEstudiantesPage() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    estudiantes,
    cursos,
    paginacion,
    isLoading,
    isFetching,
    actualizarFiltros,
  } = useMisEstudiantesDocente({
    limit: 12,
  });

  const accent = isDark ? '#facc15' : '#0288d1';

  // Manejar cambio en búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    actualizarFiltros({ search: val, page: 1 });
  };

  // Manejar cambio en filtro de curso
  const handleCursoChange = (value: string) => {
    setCursoSeleccionado(value);
    if (value === 'todos') {
      actualizarFiltros({ grado_id: undefined, paralelo_id: undefined, page: 1 });
    } else {
      const [gId, pId] = value.split('-').map(Number);
      actualizarFiltros({ grado_id: gId, paralelo_id: pId, page: 1 });
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    actualizarFiltros({ page });
  };

  const handleView = (estudianteId: number) => {
    router.push(`/dashboard/docente/estudiantes/${estudianteId}`);
  };

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} años` : '-';
  };

  const getInitials = (nombres?: string, paterno?: string) => {
    return `${nombres?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase();
  };

  // Opciones únicas de grado + paralelo
  const opcionesCursos = React.useMemo(() => {
    const mapa = new Map<string, { grado_id: number; paralelo_id: number; label: string }>();
    cursos.forEach((c) => {
      const key = `${c.grado_id}-${c.paralelo_id}`;
      if (!mapa.has(key)) {
        mapa.set(key, {
          grado_id: c.grado_id,
          paralelo_id: c.paralelo_id,
          label: `${c.grado_nombre} "${c.paralelo_nombre}"`,
        });
      }
    });
    return Array.from(mapa.values());
  }, [cursos]);

  // Columnas para la vista en tabla
  const columns: GridColDef[] = [
    {
      field: 'codigo',
      headerName: 'Código',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.12)' : 'rgba(2, 136, 209, 0.1)',
            color: accent,
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
            width: 38,
            height: 38,
            bgcolor: accent,
            color: isDark ? '#000' : '#fff',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {!params.row.foto_url &&
            getInitials(params.row.nombres, params.row.apellido_paterno)}
        </Avatar>
      ),
    },
    {
      field: 'nombres',
      headerName: 'Nombre Completo',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.apellidos || `${params.row.apellido_paterno || ''} ${params.row.apellido_materno || ''}`}{' '}
            {params.row.nombres}
          </Typography>
          {params.row.ci && (
            <Typography variant="caption" color="text.secondary">
              CI: {params.row.ci}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'cursos_asignados',
      headerName: 'Curso / Paralelo',
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <SchoolIcon sx={{ fontSize: 16, color: accent }} />
          <Typography variant="body2" fontWeight={500}>
            {params.value || 'Asignado'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value || '-'}</Typography>
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
          color={params.value ? 'success' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acción',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => {
            e.stopPropagation();
            handleView(params.row.id);
          }}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            borderColor: alpha(accent, 0.4),
            color: accent,
            '&:hover': {
              borderColor: accent,
              backgroundColor: alpha(accent, 0.1),
            },
          }}
        >
          Ver Perfil
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 3,
                }}
              >
                {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SchoolIcon
                      sx={{
                        color: isDark ? '#facc15' : '#0288d1',
                        fontSize: 36,
                        animation: `${bounce} 1.5s infinite`,
                      }}
                    />
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 800,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'fadeIn 1s ease-out',
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateY(-10px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      Mis Estudiantes
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      letterSpacing: 0.3,
                      animation: 'fadeInText 1.2s ease-out',
                      '@keyframes fadeInText': {
                        from: { opacity: 0, transform: 'translateY(5px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    Consulta y supervisa la información académica y los tutores de tus estudiantes asignados.
                  </Typography>
                </Box>

                {/* DERECHA: TOGGLE VIEW */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' },
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  }}
                >
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      borderRadius: '12px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '10px',
                        px: 2,
                        py: 1,
                        '&.Mui-selected': {
                          bgcolor: isDark ? '#facc15' : '#0288d1',
                          color: isDark ? '#000' : '#fff',
                          '&:hover': {
                            bgcolor: isDark ? '#f59e0b' : '#01579b',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards" sx={{ fontSize: { xs: '0.75rem', md: '0.95rem' } }}>
                      <ViewModuleIcon sx={{ mr: 0.5, fontSize: { xs: 16, md: 20 } }} />
                      Cards
                    </ToggleButton>
                    <ToggleButton value="table" sx={{ fontSize: { xs: '0.75rem', md: '0.95rem' } }}>
                      <TableRowsIcon sx={{ mr: 0.5, fontSize: { xs: 16, md: 20 } }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Box>

            {/* Barra de Búsqueda y Filtros */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 4,
                borderRadius: '20px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', md: 'center' },
              }}
            >
              {/* Buscador */}
              <TextField
                fullWidth
                size="medium"
                placeholder="Buscar por nombre, apellido, código o CI..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
                    },
                  },
                }}
                sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
              />

              {/* Selector de Cursos del Docente */}
              <FormControl sx={{ minWidth: { xs: '100%', md: 240 } }}>
                <Select
                  value={cursoSeleccionado}
                  onChange={(e) => handleCursoChange(e.target.value)}
                  size="medium"
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <ClassIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.1),
                    },
                  }}
                >
                  <MenuItem value="todos">Todos mis cursos</MenuItem>
                  {opcionesCursos.map((opt) => (
                    <MenuItem key={`${opt.grado_id}-${opt.paralelo_id}`} value={`${opt.grado_id}-${opt.paralelo_id}`}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Conteo */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  bgcolor: alpha(accent, 0.1),
                  color: accent,
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {paginacion.total} estudiante{paginacion.total !== 1 ? 's' : ''}
              </Box>
            </Paper>

            {/* Contenido principal */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
                <CircularProgress sx={{ color: accent }} />
              </Box>
            ) : estudiantes.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: '24px',
                  border: `2px dashed ${alpha(theme.palette.divider, 0.15)}`,
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  No se encontraron estudiantes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm
                    ? 'No hay estudiantes que coincidan con la búsqueda actual.'
                    : 'No tienes estudiantes asignados con los filtros seleccionados.'}
                </Typography>
              </Paper>
            ) : viewMode === 'cards' ? (
              <>
                {/* Vista en Tarjetas */}
                <Grid container spacing={3}>
                  {estudiantes.map((estudiante) => {
                    const initials = getInitials(estudiante.nombres, estudiante.apellido_paterno);
                    const fullName = `${estudiante.apellidos || `${estudiante.apellido_paterno} ${estudiante.apellido_materno || ''}`} ${estudiante.nombres}`;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={estudiante.id}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: '22px',
                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                            backdropFilter: 'blur(20px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              boxShadow: isDark
                                ? `0 16px 32px ${alpha(accent, 0.15)}`
                                : `0 16px 32px ${alpha('#000', 0.08)}`,
                              borderColor: alpha(accent, 0.5),
                            },
                          }}
                        >
                          {/* Banner sutil superior */}
                          <Box
                            sx={{
                              height: 60,
                              background: isDark
                                ? 'linear-gradient(135deg, rgba(250,204,21,0.15) 0%, rgba(245,158,11,0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(2,136,209,0.12) 0%, rgba(1,87,155,0.04) 100%)',
                              position: 'relative',
                              px: 2,
                              pt: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Chip
                              label={estudiante.activo ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={estudiante.activo ? 'success' : 'default'}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                height: 22,
                              }}
                            />
                            <Chip
                              label={estudiante.codigo}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                height: 22,
                                bgcolor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
                                color: accent,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ p: 2.5, pt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Avatar */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4, mb: 1.5 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <Box
                                    sx={{
                                      bgcolor: accent,
                                      color: isDark ? '#000' : '#fff',
                                      width: 22,
                                      height: 22,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                    }}
                                  >
                                    <SchoolIcon sx={{ fontSize: 13 }} />
                                  </Box>
                                }
                              >
                                <Avatar
                                  src={estudiante.foto_url || undefined}
                                  sx={{
                                    width: 72,
                                    height: 72,
                                    border: '4px solid',
                                    borderColor: isDark ? '#0f172a' : '#fff',
                                    bgcolor: accent,
                                    color: isDark ? '#000' : '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.4rem',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                  }}
                                >
                                  {!estudiante.foto_url && initials}
                                </Avatar>
                              </Badge>
                            </Box>

                            {/* Nombre del estudiante */}
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                                {fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  color: accent,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1.2,
                                  py: 0.3,
                                  borderRadius: '8px',
                                  bgcolor: alpha(accent, 0.1),
                                }}
                              >
                                {estudiante.cursos_asignados || 'Estudiante'}
                              </Typography>
                            </Box>

                            {/* Datos rápidos en badges/filas */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5, flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <CakeIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.78rem' }}>
                                  Edad: <strong>{calculateAge(estudiante.fecha_nacimiento)}</strong>
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <BadgeIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.78rem' }}>
                                  CI: <strong>{estudiante.ci || 'No especificado'}</strong>
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <PhoneIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.78rem' }}>
                                  Teléfono: <strong>{estudiante.telefono || 'No especificado'}</strong>
                                </Typography>
                              </Box>
                            </Box>

                            {/* Botón Ver Información */}
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<ViewIcon />}
                              onClick={() => handleView(estudiante.id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '14px',
                                py: 1,
                                bgcolor: isDark ? 'rgba(250,204,21,0.15)' : 'rgba(2,136,209,0.12)',
                                color: accent,
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: accent,
                                  color: isDark ? '#000' : '#fff',
                                  boxShadow: `0 4px 14px ${alpha(accent, 0.4)}`,
                                },
                              }}
                            >
                              Ver Perfil y Tutores
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Paginación */}
                {paginacion.totalPages > 1 && (
                  <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={paginacion.totalPages}
                      page={paginacion.page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      shape="rounded"
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
                )}
              </>
            ) : (
              <>
                {/* Vista en Tabla */}
                <Paper
                  elevation={0}
                  sx={{
                    height: 600,
                    borderRadius: '22px',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <DataGrid
                    rows={estudiantes}
                    columns={columns}
                    loading={isFetching}
                    pagination
                    paginationMode="server"
                    rowCount={paginacion.total}
                    paginationModel={{
                      page: paginacion.page - 1,
                      pageSize: paginacion.limit,
                    }}
                    onPaginationModelChange={(model) => {
                      actualizarFiltros({ page: model.page + 1, limit: model.pageSize });
                    }}
                    pageSizeOptions={[12, 24, 48]}
                    disableRowSelectionOnClick
                    onRowClick={(params) => handleView(params.row.id)}
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-cell': {
                        borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.08)'
                          : 'rgba(2, 136, 209, 0.06)',
                        borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                        fontWeight: 700,
                      },
                      '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isDark
                            ? 'rgba(250, 204, 21, 0.04)'
                            : 'rgba(2, 136, 209, 0.04)',
                        },
                      },
                    }}
                  />
                </Paper>
              </>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
