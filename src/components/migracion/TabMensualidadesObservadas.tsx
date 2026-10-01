// components/migracion/TabMensualidadesObservadas.tsx
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
  TablePagination,
  Grid,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Search,
  WarningAmber,
  ReceiptLong,
  HourglassEmpty,
  AttachMoney,
  Refresh,
  Edit,
  Person,
  FilterList,
  CheckCircle,
  HelpOutline,
  Description,
  Payment,
  School
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  MensualidadObservadaItem,
  MetricasObservadas,
  EstudianteMatrizItem,
  CuotaMatrizItem,
  PagoHistoricoItem
} from '@/services/migracionPagosService';
import { ModalRegistroPagoHistorico } from './ModalRegistroPagoHistorico';

interface Props {
  periodoSeleccionado?: number | '';
  onIrAFichaEstudiante?: (estudianteId: number) => void;
  niveles?: any[];
  grados?: any[];
  paralelos?: any[];
}

export const TabMensualidadesObservadas: React.FC<Props> = ({
  periodoSeleccionado,
  onIrAFichaEstudiante,
  niveles = [],
  grados = [],
  paralelos = []
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  // Estados de datos
  const [items, setItems] = useState<MensualidadObservadaItem[]>([]);
  const [metricas, setMetricas] = useState<MetricasObservadas>({
    total: 0,
    pendientes: 0,
    parciales: 0,
    sin_documento: 0,
    monto_total_observado: 0,
    monto_pagado_observado: 0
  });
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'sin_documento' | 'pendientes' | 'parciales' | 'con_observacion'>('todos');
  const [filtroNivel, setFiltroNivel] = useState<number | ''>('');
  const [filtroGrado, setFiltroGrado] = useState<number | ''>('');
  const [filtroParalelo, setFiltroParalelo] = useState<number | ''>('');
  const [busqueda, setBusqueda] = useState('');

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modal de regularización / edición
  const [modalOpen, setModalOpen] = useState(false);
  const [estudianteModal, setEstudianteModal] = useState<EstudianteMatrizItem | null>(null);
  const [cuotaModal, setCuotaModal] = useState<CuotaMatrizItem | null>(null);
  const [pagoEditarModal, setPagoEditarModal] = useState<PagoHistoricoItem | null>(null);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await migracionPagosService.getMensualidadesObservadas({
        periodo_academico_id: periodoSeleccionado ? Number(periodoSeleccionado) : undefined,
        nivel_id: filtroNivel ? Number(filtroNivel) : undefined,
        grado_id: filtroGrado ? Number(filtroGrado) : undefined,
        paralelo_id: filtroParalelo ? Number(filtroParalelo) : undefined,
        tipo: filtroTipo,
        search: busqueda.trim() || undefined
      });

      if (res.success && res.data) {
        setItems(res.data.items);
        setMetricas(res.data.metricas);
      }
    } catch (err: any) {
      console.error('Error al cargar mensualidades observadas:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al cargar registros observados', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [periodoSeleccionado, filtroNivel, filtroGrado, filtroParalelo, filtroTipo, busqueda, enqueueSnackbar]);

  useEffect(() => {
    cargarDatos();
    setPage(0);
  }, [cargarDatos]);

  // Manejar apertura del modal de regularización
  const abrirModalEditar = (item: MensualidadObservadaItem) => {
    // Reconstruir objeto estudiante compatible con el modal
    const estudianteParaModal: EstudianteMatrizItem = {
      estudiante_id: item.estudiante_id,
      ci: item.estudiante_ci,
      codigo_estudiante: item.estudiante_codigo,
      nombres: item.estudiante_nombres,
      apellido_paterno: item.estudiante_apellido_paterno || '',
      apellido_materno: item.estudiante_apellido_materno || '',
      nombre_completo: item.estudiante_nombre_completo,
      matricula_id: item.matricula_id,
      estado_matricula: 'activo',
      es_becado: item.es_becado,
      porcentaje_beca: item.porcentaje_beca,
      tipo_beca: null,
      cuotas: []
    };

    const pagosCuota: PagoHistoricoItem[] = item.pago_id ? [{
      id: item.pago_id,
      codigo_pago: item.codigo_pago || '',
      mensualidad_id: item.mensualidad_id,
      monto_pagado: Number(item.monto_pagado || item.monto_final),
      metodo_pago: (item.metodo_pago as any) || 'efectivo',
      numero_comprobante: item.numero_comprobante,
      entrego_factura: !!item.entrego_factura,
      numero_factura: item.numero_factura,
      fecha_pago: item.fecha_pago || new Date().toISOString().split('T')[0],
      observaciones: item.pago_observaciones
    }] : [];

    const cuotaParaModal: CuotaMatrizItem = {
      numero_cuota: item.numero_cuota,
      mes: item.mes_correspondiente,
      mensualidad_id: item.mensualidad_id,
      monto_original: Number(item.monto_original),
      monto_beca: Number(item.monto_beca || 0),
      monto_recargo: Number(item.monto_recargo || 0),
      monto_final: Number(item.monto_final),
      estado: item.mensualidad_estado as any,
      observaciones: item.mensualidad_observaciones,
      fecha_vencimiento: item.fecha_vencimiento,
      pagos: pagosCuota
    };

    setEstudianteModal(estudianteParaModal);
    setCuotaModal(cuotaParaModal);
    setPagoEditarModal(pagosCuota.length > 0 ? pagosCuota[0] : null);
    setModalOpen(true);
  };

  // Paginación de items
  const itemsPaginados = useMemo(() => {
    return items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [items, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Tarjetas de Resumen Métrico */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isDark ? alpha('#f59e0b', 0.25) : alpha('#d97706', 0.2),
            background: isDark
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)'
              : 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Total Observadas
                </Typography>
                <Typography variant="h4" fontWeight={800} color={isDark ? '#fbbf24' : '#d97706'} sx={{ my: 0.5 }}>
                  {metricas.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cuotas con notas o alertas
                </Typography>
              </Box>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#f59e0b', 0.2) : alpha('#d97706', 0.1),
                color: isDark ? '#fbbf24' : '#d97706'
              }}>
                <WarningAmber sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isDark ? alpha('#ef4444', 0.25) : alpha('#dc2626', 0.2),
            background: isDark
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)'
              : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Sin Documento / Por Confirmar
                </Typography>
                <Typography variant="h4" fontWeight={800} color={isDark ? '#f87171' : '#dc2626'} sx={{ my: 0.5 }}>
                  {metricas.sin_documento}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Falta N° comprobante o factura
                </Typography>
              </Box>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#ef4444', 0.2) : alpha('#dc2626', 0.1),
                color: isDark ? '#f87171' : '#dc2626'
              }}>
                <ReceiptLong sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isDark ? alpha('#3b82f6', 0.25) : alpha('#2563eb', 0.2),
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Con Notas Especiales
                </Typography>
                <Typography variant="h4" fontWeight={800} color={isDark ? '#60a5fa' : '#2563eb'} sx={{ my: 0.5 }}>
                  {(metricas as any).con_nota || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Observaciones registradas
                </Typography>
              </Box>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#3b82f6', 0.2) : alpha('#2563eb', 0.1),
                color: isDark ? '#60a5fa' : '#2563eb'
              }}>
                <HourglassEmpty sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isDark ? alpha('#10b981', 0.25) : alpha('#059669', 0.2),
            background: isDark
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)'
              : 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Monto Involucrado
                </Typography>
                <Typography variant="h4" fontWeight={800} color={isDark ? '#34d399' : '#059669'} sx={{ my: 0.5 }}>
                  Bs {metricas.monto_total_observado.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pagado: Bs {metricas.monto_pagado_observado.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#059669', 0.1),
                color: isDark ? '#34d399' : '#059669'
              }}>
                <AttachMoney sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Barra de Filtros */}
      <Card sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        p: 2,
        mb: 3
      }}>
        <Grid container spacing={2} alignItems="center">
          {/* Selector de Tipo */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tipo de Observación"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
            >
              <MenuItem value="todos">Todos los registros observados</MenuItem>
              <MenuItem value="sin_documento">⚠️ Sin Documento / Por Confirmar</MenuItem>
              <MenuItem value="con_nota">📝 Con Notas / Observaciones</MenuItem>
            </TextField>
          </Grid>

          {/* Filtro Grado / Curso */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filtrar por Grado"
              value={filtroGrado}
              onChange={(e) => {
                setFiltroGrado(e.target.value === '' ? '' : Number(e.target.value));
                setFiltroParalelo('');
              }}
            >
              <MenuItem value="">Todos los Grados</MenuItem>
              {grados.map((g: any) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Filtro Paralelo */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Paralelo"
              value={filtroParalelo}
              onChange={(e) => setFiltroParalelo(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">Todos</MenuItem>
              {paralelos
                .filter((p: any) => !filtroGrado || p.grado_id === Number(filtroGrado))
                .map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          {/* Buscador */}
          <Grid size={{ xs: 12, sm: 8, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por estudiante, CI o N°..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Botón Refrescar */}
          <Grid size={{ xs: 12, sm: 4, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={cargarDatos}
              disabled={loading}
              sx={{ minHeight: 40, borderRadius: '10px' }}
            >
              <Refresh />
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* 3. Tabla de Mensualidades Observadas */}
      <Card sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        overflow: 'hidden'
      }}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ color: '#f59e0b', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Buscando registros observados y pendientes...
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 56, color: '#10b981', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700}>
              ¡Excelente! No se encontraron mensualidades observadas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 0.5 }}>
              Todas las mensualidades para los filtros seleccionados están al día y cuentan con sus comprobantes o notas correspondientes.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Estudiante</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Curso</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Cuota</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Estado Cuota</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Monto Cuota</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Doc. / Observación</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, textAlign: 'right' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsPaginados.map((r) => {
                    const esSinDoc = r.tipo_observacion === 'sin_documento' || r.tipo_observacion === 'comprobante_por_confirmar';
                    const esPendiente = r.mensualidad_estado === 'pendiente' || r.mensualidad_estado === 'vencido';

                    return (
                      <TableRow
                        key={`${r.mensualidad_id}-${r.pago_id || 'nopay'}`}
                        hover
                        sx={{
                          bgcolor: esSinDoc
                            ? (isDark ? alpha('#f59e0b', 0.06) : alpha('#fef3c7', 0.4))
                            : 'inherit'
                        }}
                      >
                        {/* Estudiante */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {r.estudiante_nombre_completo}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.25, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              CI: {r.estudiante_ci || 'S/N'}
                            </Typography>
                            {r.es_becado && (
                              <Chip
                                size="small"
                                label={`Beca ${r.porcentaje_beca || 100}%`}
                                color="info"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Curso */}
                        <TableCell>
                          <Typography variant="body2">
                            {r.grado_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Paralelo {r.paralelo_nombre}
                          </Typography>
                        </TableCell>

                        {/* Cuota */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Cuota {r.numero_cuota}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {r.mes_correspondiente}
                          </Typography>
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              r.mensualidad_estado === 'pagado'
                                ? 'Pagado'
                                : r.mensualidad_estado === 'pendiente'
                                  ? 'Pendiente'
                                  : r.mensualidad_estado === 'vencido'
                                    ? 'Vencido'
                                    : r.mensualidad_estado === 'pagado_parcial'
                                      ? 'Parcial'
                                      : r.mensualidad_estado
                            }
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              bgcolor: r.mensualidad_estado === 'pagado'
                                ? (isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.15))
                                : r.mensualidad_estado === 'pendiente'
                                  ? (isDark ? alpha('#f59e0b', 0.2) : alpha('#f59e0b', 0.15))
                                  : (isDark ? alpha('#ef4444', 0.2) : alpha('#ef4444', 0.15)),
                              color: r.mensualidad_estado === 'pagado'
                                ? '#10b981'
                                : r.mensualidad_estado === 'pendiente'
                                  ? '#d97706'
                                  : '#ef4444'
                            }}
                          />
                        </TableCell>

                        {/* Monto */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            Bs {Number(r.monto_final).toFixed(2)}
                          </Typography>
                          {r.pago_id && Number(r.monto_pagado) !== Number(r.monto_final) && (
                            <Typography variant="caption" color="text.secondary">
                              Pagó: Bs {Number(r.monto_pagado).toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Documento / Observación */}
                        <TableCell sx={{ maxWidth: 300 }}>
                          {/* Chip de documento si tiene */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                            {r.numero_comprobante && (
                              <Chip
                                size="small"
                                icon={<ReceiptLong sx={{ fontSize: '13px !important' }} />}
                                label={`C-${r.numero_comprobante}`}
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            )}
                            {r.numero_factura && (
                              <Chip
                                size="small"
                                icon={<Description sx={{ fontSize: '13px !important' }} />}
                                label={`Fac-${r.numero_factura}`}
                                color="success"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            )}
                            {esSinDoc && (
                              <Chip
                                size="small"
                                label="⚠️ Sin comprobante/factura"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: isDark ? alpha('#f59e0b', 0.25) : alpha('#f59e0b', 0.2),
                                  color: isDark ? '#fbbf24' : '#b45309'
                                }}
                              />
                            )}
                          </Box>

                          {/* Nota / Observaciones */}
                          {(r.pago_observaciones || r.mensualidad_observaciones) && (
                            <Tooltip title={r.pago_observaciones || r.mensualidad_observaciones || ''}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontStyle: 'italic'
                                }}
                              >
                                {r.pago_observaciones || r.mensualidad_observaciones}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>

                        {/* Acciones */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Regularizar / Editar comprobante y pago">
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                onClick={() => abrirModalEditar(r)}
                                sx={{
                                  minWidth: 32,
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  bgcolor: isDark ? '#f59e0b' : '#d97706',
                                  color: '#000',
                                  '&:hover': {
                                    bgcolor: isDark ? '#fbbf24' : '#b45309'
                                  }
                                }}
                                startIcon={<Edit sx={{ fontSize: '15px !important' }} />}
                              >
                                Regularizar
                              </Button>
                            </Tooltip>

                            {onIrAFichaEstudiante && (
                              <Tooltip title="Ver ficha completa del estudiante">
                                <IconButton
                                  size="small"
                                  onClick={() => onIrAFichaEstudiante(r.estudiante_id)}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
                                    borderRadius: '8px'
                                  }}
                                >
                                  <Person fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </>
        )}
      </Card>

      {/* Modal para editar / regularizar pago */}
      <ModalRegistroPagoHistorico
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          cargarDatos();
          enqueueSnackbar('Pago regularizado exitosamente', { variant: 'success' });
        }}
        estudiante={estudianteModal}
        cuota={cuotaModal}
        pagoEditar={pagoEditarModal}
      />
    </Box>
  );
};

export default TabMensualidadesObservadas;
