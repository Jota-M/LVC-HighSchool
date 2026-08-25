// components/pagos/EstadoCuentaEstudiantes.tsx - CORREGIDO
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  CircularProgress,
  TextField,
  Grid,
  InputAdornment,
  IconButton,
  Collapse,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  Warning,
  AttachMoney,
  CalendarMonth,
} from '@mui/icons-material';
import { usePagos } from '@/hooks/usePagos';
import { useAcademicos } from '@/hooks/useAcademicos'; // 🔧 AGREGAR
import { EstadoPagosEstudiante, FormatoReporte } from '@/types/pagos';
import { useSnackbar } from 'notistack';

interface RowProps {
  estudiante: EstadoPagosEstudiante;
  isDark: boolean;
}

const EstudianteRow: React.FC<RowProps> = ({ estudiante, isDark }) => {
  const [open, setOpen] = useState(false);

  const porcentajePagado =
    estudiante.total_mensualidades > 0
      ? (estudiante.mensualidades_pagadas / estudiante.total_mensualidades) * 100
      : 0;

  const getColorProgreso = (porcentaje: number) => {
    if (porcentaje >= 80) return '#10b981';
    if (porcentaje >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      <TableRow
        sx={{
          '&:hover': {
            backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
          },
        }}
      >
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight={600}>{estudiante.estudiante_codigo}</Typography>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {estudiante.nombres} {estudiante.apellidos}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {estudiante.grado} - {estudiante.paralelo}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          {estudiante.es_becado && (
            <Chip
              label={`Beca ${estudiante.porcentaje_beca}%`}
              size="small"
              sx={{
                backgroundColor: alpha('#8b5cf6', 0.1),
                color: '#8b5cf6',
                fontWeight: 600,
              }}
            />
          )}
        </TableCell>
        <TableCell>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                {estudiante.mensualidades_pagadas}/{estudiante.total_mensualidades}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {porcentajePagado.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={porcentajePagado}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(getColorProgreso(porcentajePagado), 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getColorProgreso(porcentajePagado),
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight={700} color="#10b981">
            Bs {(Number(estudiante.monto_pagado) || 0).toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight={700} color="#ef4444">
            Bs {(Number(estudiante.monto_pendiente) || 0).toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          {estudiante.mensualidades_vencidas > 0 && (
            <Chip
              icon={<Warning />}
              label={`${estudiante.mensualidades_vencidas} vencidas`}
              size="small"
              sx={{
                backgroundColor: alpha('#ef4444', 0.1),
                color: '#ef4444',
                fontWeight: 600,
              }}
            />
          )}
        </TableCell>
      </TableRow>

      {/* Fila expandible con detalles */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 3, backgroundColor: alpha(isDark ? '#fff' : '#000', 0.02) }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: alpha('#10b981', 0.1),
                      border: `1px solid ${alpha('#10b981', 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Mensualidades Pagadas
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#10b981">
                      {estudiante.mensualidades_pagadas}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: alpha('#f59e0b', 0.1),
                      border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Mensualidades Pendientes
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#f59e0b">
                      {estudiante.mensualidades_pendientes}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: alpha('#10b981', 0.1),
                      border: `1px solid ${alpha('#10b981', 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Total Pagado
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#10b981">
                      Bs {(Number(estudiante.monto_pagado) || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: alpha('#ef4444', 0.1),
                      border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Saldo Pendiente
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#ef4444">
                      Bs {(Number(estudiante.monto_pendiente) || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const EstadoCuentaEstudiantes: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    estadoEstudiantes,
    loadingReportes,
    loadingExportacionReportes,
    cargarEstadoEstudiantes,
    exportarEstadoCuenta
  } = usePagos({});
  const { enqueueSnackbar } = useSnackbar();

  // 🔧 AGREGAR: Obtener período activo, grados y paralelos
  const {
    periodoActivo,
    grados,
    paralelos,
    loading: loadingPeriodo
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: true,
    loadParalelos: true,
    loadMaterias: false,
    loadGradoMaterias: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [gradoId, setGradoId] = useState<number | ''>('');
  const [paraleloId, setParaleloId] = useState<number | ''>('');

  const paralelosFiltrados = gradoId
    ? paralelos.filter((p) => p.grado_id === gradoId)
    : paralelos;

  // 🔧 MODIFICADO: Cargar estado filtrando por curso si se selecciona
  useEffect(() => {
    if (periodoActivo) {
      cargarEstadoEstudiantes({
        periodo_academico_id: periodoActivo.id,
        grado_id: gradoId || undefined,
        paralelo_id: paraleloId || undefined
      });
    }
  }, [periodoActivo, gradoId, paraleloId, cargarEstadoEstudiantes]);

  const estudiantesFiltrados = estadoEstudiantes.filter(
    (est) =>
      est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.estudiante_codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset page to first when filters change
  useEffect(() => {
    setPage(0);
  }, [estudiantesFiltrados]);

  const [page, setPage] = useState(0);
const rowsPerPage = 10;

const handleExportar = async (formato: FormatoReporte) => {
    if (!periodoActivo) {
      enqueueSnackbar('No hay un período académico activo para generar el reporte', { variant: 'warning' });
      return;
    }

    try {
      await exportarEstadoCuenta({
        periodo_academico_id: periodoActivo.id,
        formato,
        grado_id: gradoId || undefined,
        paralelo_id: paraleloId || undefined
      });
      enqueueSnackbar(`Estado de cuenta descargado (${formato.toUpperCase()})`, { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al descargar estado de cuenta';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // 🔧 AGREGAR: Loading mientras carga período
  if (loadingPeriodo) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Cargando período académico...
        </Typography>
      </Box>
    );
  }

  // 🔧 AGREGAR: Validación de período activo
  if (!periodoActivo) {
    return (
      <Alert severity="error" sx={{ borderRadius: '16px', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ⚠️ No hay período académico activo
        </Typography>
        <Typography variant="body2">
          Por favor, activa un período en Configuración → Períodos Académicos
        </Typography>
      </Alert>
    );
  }

  if (loadingReportes) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calcular totales
  const totales = estadoEstudiantes.reduce(
    (acc, est) => ({
      pagado: acc.pagado + est.monto_pagado,
      pendiente: acc.pendiente + est.monto_pendiente,
      total: acc.total + est.monto_total,
    }),
    { pagado: 0, pendiente: 0, total: 0 }
  );

  return (
    <Box>
      {/* 🔧 AGREGAR: Banner con período activo */}
      <Alert
        severity="info"
        icon={<CalendarMonth />}
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
          border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PERÍODO ACADÉMICO
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {periodoActivo.nombre}
            </Typography>
          </Box>
          <Chip
            label={`ID: ${periodoActivo.id}`}
            size="small"
            sx={{
              borderRadius: '8px',
              fontWeight: 700,
              background: isDark ? '#facc15' : '#0288d1',
              color: isDark ? '#000' : '#fff',
            }}
          />
        </Box>
      </Alert>

      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#10b981', 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: alpha('#10b981', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <CheckCircle />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Recaudado
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#10b981">
                    Bs {Number(totales.pagado).toFixed(2)}

                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha('#f59e0b', 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: alpha('#f59e0b', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b',
                  }}
                >
                  <Warning />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Pendiente
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#f59e0b">
                    Bs {(Number(totales.pendiente) || 0).toFixed(2)}

                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: '16px',
              background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#facc15' : '#0288d1',
                  }}
                >
                  <AttachMoney />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monto Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Bs {(Number(totales.total) || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.05) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header con búsqueda */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Estado de Cuenta por Estudiante
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Filtros Grado / Paralelo */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="select-grado-morosos-label">Grado</InputLabel>
                <Select
                  labelId="select-grado-morosos-label"
                  id="select-grado-morosos"
                  value={gradoId}
                  label="Grado"
                  onChange={(e) => {
                    setGradoId(e.target.value as number | '');
                    setParaleloId('');
                  }}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value=""><em>Todos los grados</em></MenuItem>
                  {grados.map((g) => (
                    <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }} disabled={!gradoId}>
                <InputLabel id="select-paralelo-morosos-label">Paralelo</InputLabel>
                <Select
                  labelId="select-paralelo-morosos-label"
                  id="select-paralelo-morosos"
                  value={paraleloId}
                  label="Paralelo"
                  onChange={(e) => setParaleloId(e.target.value as number | '')}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {paralelosFiltrados.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 🔧 CORREGIDO: color e ícono explícitos */}
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('pdf')}
                disabled={loadingExportacionReportes}
                sx={{
                  color: isDark ? '#facc15' : '#0288d1',
                  borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5),
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '& .MuiSvgIcon-root': {
                    color: isDark ? '#facc15' : '#0288d1',
                  },
                  '&:hover': {
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                  },
                  '&.Mui-disabled': {
                    color: alpha(isDark ? '#facc15' : '#0288d1', 0.3),
                    borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                    '& .MuiSvgIcon-root': {
                      color: alpha(isDark ? '#facc15' : '#0288d1', 0.3),
                    },
                  },
                }}
              >
                PDF
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('excel')}
                disabled={loadingExportacionReportes}
                sx={{
                  color: isDark ? '#facc15' : '#0288d1',
                  borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.5),
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '& .MuiSvgIcon-root': {
                    color: isDark ? '#facc15' : '#0288d1',
                  },
                  '&:hover': {
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                  },
                  '&.Mui-disabled': {
                    color: alpha(isDark ? '#facc15' : '#0288d1', 0.3),
                    borderColor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                    '& .MuiSvgIcon-root': {
                      color: alpha(isDark ? '#facc15' : '#0288d1', 0.3),
                    },
                  },
                }}
              >
                Excel
              </Button>
            </Box>
          </Box>

          {/* Tabla */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Código</TableCell>
                  <TableCell>Estudiante</TableCell>
                  <TableCell align="center">Beca</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell align="right">Pagado</TableCell>
                  <TableCell align="right">Pendiente</TableCell>
                  <TableCell align="center">Vencidas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estudiantesFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((estudiante) => (
                  <EstudianteRow
                    key={estudiante.estudiante_id}
                    estudiante={estudiante}
                    isDark={isDark}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={estudiantesFiltrados.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />

          {estudiantesFiltrados.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron resultados
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
