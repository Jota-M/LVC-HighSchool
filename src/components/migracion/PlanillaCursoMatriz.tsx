// components/migracion/PlanillaCursoMatriz.tsx
'use client';
import React, { useState, useMemo } from 'react';
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
  LinearProgress,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search,
  Payment,
  Receipt,
  Description,
  School,
  Layers,
  AutoAwesome,
  Refresh,
  CheckCircle,
  HelpOutline,
  Edit,
  FilterList,
  MoreVert,
  Code
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  EstudianteMatrizItem,
  CuotaMatrizItem,
  PagoHistoricoItem,
  CursoInfoMatriz
} from '@/services/migracionPagosService';
import { ModalRegistroPagoHistorico } from './ModalRegistroPagoHistorico';
import { ModalGestionBeca } from './ModalGestionBeca';
import { ModalCargaLoteEstudiante } from './ModalCargaLoteEstudiante';
import { ModalImportarJson } from './ModalImportarJson';

interface Props {
  curso: CursoInfoMatriz;
  estudiantes: EstudianteMatrizItem[];
  loading: boolean;
  onRefresh: () => void;
}

const MESES_HEADERS = [
  { num: 1, label: '1. Feb' },
  { num: 2, label: '2. Mar' },
  { num: 3, label: '3. Abr' },
  { num: 4, label: '4. May' },
  { num: 5, label: '5. Jun' },
  { num: 6, label: '6. Jul' },
  { num: 7, label: '7. Ago' },
  { num: 8, label: '8. Sep' },
  { num: 9, label: '9. Oct' },
  { num: 10, label: '10. Nov' },
];

export const PlanillaCursoMatriz: React.FC<Props> = ({
  curso,
  estudiantes,
  loading,
  onRefresh
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'con_deuda' | 'al_dia' | 'becados'>('todos');
  const [generandoCuotas, setGenerandoCuotas] = useState(false);

  // Estados para modales
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalBecaOpen, setModalBecaOpen] = useState(false);
  const [modalLoteOpen, setModalLoteOpen] = useState(false);
  const [modalJsonOpen, setModalJsonOpen] = useState(false);
  const [modoCursoJson, setModoCursoJson] = useState(false);

  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<EstudianteMatrizItem | null>(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<CuotaMatrizItem | null>(null);

  // Estadísticas del curso
  const stats = useMemo(() => {
    let totalCuotas = estudiantes.length * 10;
    let cuotasPagadas = 0;
    let cuotasExoneradas = 0;
    let cuotasPendientes = 0;
    let totalRecaudado = 0;
    let estudiantesBecados = 0;

    for (const est of estudiantes) {
      if (est.es_becado) estudiantesBecados++;
      for (const c of est.cuotas) {
        if (c.estado === 'pagado') {
          cuotasPagadas++;
          const pagadoSum = c.pagos?.reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0) || c.monto_final;
          totalRecaudado += Number(pagadoSum);
        } else if (c.estado === 'cancelado' || (c.monto_beca > 0 && c.monto_final === 0)) {
          cuotasExoneradas++;
        } else {
          cuotasPendientes++;
        }
      }
    }

    const porcentajeCobrado = totalCuotas > 0 ? Math.round(((cuotasPagadas + cuotasExoneradas) / totalCuotas) * 100) : 0;

    return {
      totalEstudiantes: estudiantes.length,
      cuotasPagadas,
      cuotasExoneradas,
      cuotasPendientes,
      porcentajeCobrado,
      totalRecaudado,
      estudiantesBecados
    };
  }, [estudiantes]);

  // Filtrado de estudiantes
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(est => {
      const matchText =
        est.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (est.ci && est.ci.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchText) return false;

      if (filtroEstado === 'becados') return est.es_becado;
      if (filtroEstado === 'con_deuda') {
        return est.cuotas.some(c => c.estado === 'pendiente' || c.estado === 'pagado_parcial');
      }
      if (filtroEstado === 'al_dia') {
        return est.cuotas.every(c => c.estado === 'pagado' || c.estado === 'cancelado');
      }

      return true;
    });
  }, [estudiantes, searchTerm, filtroEstado]);

  const handleAbrirPago = (est: EstudianteMatrizItem, cuota: CuotaMatrizItem) => {
    setEstudianteSeleccionado(est);
    setCuotaSeleccionada(cuota);
    setModalPagoOpen(true);
  };

  const handleAbrirBeca = (est: EstudianteMatrizItem) => {
    setEstudianteSeleccionado(est);
    setModalBecaOpen(true);
  };

  const handleAbrirLote = (est: EstudianteMatrizItem) => {
    setEstudianteSeleccionado(est);
    setModalLoteOpen(true);
  };

  const handleAbrirJsonEstudiante = (est: EstudianteMatrizItem) => {
    setEstudianteSeleccionado(est);
    setModoCursoJson(false);
    setModalJsonOpen(true);
  };

  const handleAbrirJsonCurso = () => {
    setEstudianteSeleccionado(null);
    setModoCursoJson(true);
    setModalJsonOpen(true);
  };

  const handleGenerarPendientes = async () => {
    if (!curso) return;
    setGenerandoCuotas(true);
    try {
      const res = await migracionPagosService.generarCuotasPendientesCurso(curso.paralelo_id, curso.periodo_academico_id);
      enqueueSnackbar(res.message || 'Cuotas pendientes generadas con éxito', { variant: 'success' });
      onRefresh();
    } catch (err: any) {
      console.error('Error al generar cuotas:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al generar cuotas pendientes', { variant: 'error' });
    } finally {
      setGenerandoCuotas(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tarjetas KPI Superiores */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2
      }}>
        <Card sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Estudiantes del Curso
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {stats.totalEstudiantes}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
              <Chip label={`${stats.estudiantesBecados} becados`} size="small" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />
              <Typography variant="caption" color="text.secondary">
                {curso.monto_base_cuota} Bs / cuota
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDark ? alpha('#10b981', 0.3) : alpha('#059669', 0.2),
          background: isDark
            ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="success.main" fontWeight={700} textTransform="uppercase">
              Total Recaudado
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 0.5 }}>
              Bs {stats.totalRecaudado.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {stats.cuotasPagadas} cuotas pagadas
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDark ? alpha('#3b82f6', 0.3) : alpha('#0288d1', 0.2),
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="primary.main" fontWeight={700} textTransform="uppercase">
              Avance de Regularización
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
              {stats.porcentajeCobrado}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={stats.porcentajeCobrado}
              sx={{ height: 6, borderRadius: 3, mt: 1.5 }}
            />
          </CardContent>
        </Card>

        <Card sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDark ? alpha('#f59e0b', 0.3) : alpha('#d97706', 0.2),
          background: isDark
            ? 'linear-gradient(135deg, rgba(120, 53, 15, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="warning.main" fontWeight={700} textTransform="uppercase">
              Cuotas Pendientes
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 0.5 }}>
              {stats.cuotasPendientes}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {stats.cuotasExoneradas} cuotas exoneradas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Barra de Filtros y Acciones */}
      <Card sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        p: 2
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, flex: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar estudiante por nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 350, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label="Todos"
                size="small"
                onClick={() => setFiltroEstado('todos')}
                color={filtroEstado === 'todos' ? 'primary' : 'default'}
                clickable
              />
              <Chip
                label="Con Pendientes"
                size="small"
                onClick={() => setFiltroEstado('con_deuda')}
                color={filtroEstado === 'con_deuda' ? 'warning' : 'default'}
                clickable
              />
              <Chip
                label="Al Día"
                size="small"
                onClick={() => setFiltroEstado('al_dia')}
                color={filtroEstado === 'al_dia' ? 'success' : 'default'}
                clickable
              />
              <Chip
                label="Becados"
                size="small"
                onClick={() => setFiltroEstado('becados')}
                color={filtroEstado === 'becados' ? 'secondary' : 'default'}
                clickable
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Code />}
              onClick={handleAbrirJsonCurso}
              sx={{
                fontWeight: 700,
                borderWidth: '1.5px',
                '&:hover': { borderWidth: '1.5px' }
              }}
            >
              {'{ }'} Pegar JSON Curso
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoAwesome />}
              onClick={handleGenerarPendientes}
              disabled={generandoCuotas || loading}
            >
              {generandoCuotas ? 'Generando...' : 'Generar Cuotas Pendientes'}
            </Button>

            <Tooltip title="Actualizar datos">
              <IconButton onClick={onRefresh} disabled={loading} size="small" sx={{ border: '1px solid', borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1) }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>

      {/* Matriz / Planilla de Cuotas Feb .. Nov */}
      <Card sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        overflow: 'hidden'
      }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  fontWeight: 800,
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  minWidth: 260,
                  position: 'sticky',
                  left: 0,
                  zIndex: 10
                }}>
                  Estudiante / CI
                </TableCell>
                <TableCell sx={{
                  fontWeight: 800,
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  width: 100,
                  textAlign: 'center'
                }}>
                  Acciones
                </TableCell>
                {MESES_HEADERS.map(m => (
                  <TableCell
                    key={m.num}
                    sx={{
                      fontWeight: 800,
                      bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                      textAlign: 'center',
                      minWidth: 105
                    }}
                  >
                    {m.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {estudiantesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron estudiantes para los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                estudiantesFiltrados.map((est, idx) => {
                  return (
                    <TableRow
                      key={est.matricula_id}
                      hover
                      sx={{
                        bgcolor: idx % 2 === 0
                          ? 'transparent'
                          : isDark ? alpha('#fff', 0.015) : alpha('#000', 0.015)
                      }}
                    >
                      {/* Columna Estudiante Fija */}
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          bgcolor: isDark ? '#0f172a' : '#ffffff',
                          zIndex: 5,
                          borderRight: '1px solid',
                          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {est.nombre_completo}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              CI: {est.ci || 'S/N'}
                            </Typography>
                            {est.es_becado && (
                              <Chip
                                label={`Beca ${est.porcentaje_beca || 100}%`}
                                size="small"
                                color="secondary"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Columna Acciones Rápidas (Beca, Lote, JSON) */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Insertar JSON del estudiante">
                            <IconButton
                              size="small"
                              onClick={() => handleAbrirJsonEstudiante(est)}
                              color="primary"
                              sx={{
                                border: '1px solid',
                                borderColor: isDark ? alpha('#6366f1', 0.3) : alpha('#4f46e5', 0.2)
                              }}
                            >
                              <Code fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gestionar Beca / Exoneración">
                            <IconButton
                              size="small"
                              onClick={() => handleAbrirBeca(est)}
                              color={est.es_becado ? 'secondary' : 'default'}
                            >
                              <School fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Carga en Lote (Múltiples meses)">
                            <IconButton
                              size="small"
                              onClick={() => handleAbrirLote(est)}
                              color="success"
                            >
                              <Layers fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      {/* 10 Celdas de Cuotas */}
                      {est.cuotas.map((c) => {
                        const esPagado = c.estado === 'pagado';
                        const esCancelado = c.estado === 'cancelado' || (c.monto_beca > 0 && c.monto_final === 0);
                        const esParcial = c.estado === 'pagado_parcial';
                        const primerPago = c.pagos && c.pagos.length > 0 ? c.pagos[0] : null;

                        // Etiqueta del documento
                        let docLabel = 'Pagado';
                        let docIcon = <CheckCircle sx={{ fontSize: 13 }} />;
                        if (primerPago) {
                          if (primerPago.numero_factura && primerPago.numero_comprobante) {
                            docLabel = `R:${primerPago.numero_comprobante} + F:${primerPago.numero_factura}`;
                          } else if (primerPago.numero_factura) {
                            docLabel = `F: ${primerPago.numero_factura}`;
                            docIcon = <Description sx={{ fontSize: 13 }} />;
                          } else if (primerPago.numero_comprobante) {
                            docLabel = `R: ${primerPago.numero_comprobante}`;
                            docIcon = <Receipt sx={{ fontSize: 13 }} />;
                          } else {
                            docLabel = primerPago.metodo_pago ? primerPago.metodo_pago.toUpperCase() : 'PAGADO';
                          }
                        }

                        return (
                          <TableCell
                            key={c.numero_cuota}
                            sx={{
                              p: 0.75,
                              textAlign: 'center',
                              borderRight: '1px dashed',
                              borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)
                            }}
                          >
                            {esPagado ? (
                              <Tooltip
                                title={
                                  <Box sx={{ p: 0.5 }}>
                                    <Typography variant="caption" fontWeight={700} display="block">
                                      {c.mes.toUpperCase()} - PAGADO
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Monto: Bs {primerPago ? primerPago.monto_pagado : c.monto_final}
                                    </Typography>
                                    {primerPago?.numero_factura && (
                                      <Typography variant="caption" display="block">
                                        Factura N°: {primerPago.numero_factura}
                                      </Typography>
                                    )}
                                    {primerPago?.numero_comprobante && (
                                      <Typography variant="caption" display="block">
                                        Comprobante N°: {primerPago.numero_comprobante}
                                      </Typography>
                                    )}
                                    {primerPago?.fecha_pago && (
                                      <Typography variant="caption" display="block">
                                        Fecha: {primerPago.fecha_pago.substring(0, 10)}
                                      </Typography>
                                    )}
                                    {primerPago?.observaciones && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Nota: {primerPago.observaciones}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mt: 0.5, display: 'block' }}>
                                      👉 Clic para editar o corregir
                                    </Typography>
                                  </Box>
                                }
                                arrow
                              >
                                <Box
                                  onClick={() => handleAbrirPago(est, c)}
                                  sx={{
                                    p: 0.75,
                                    borderRadius: '8px',
                                    bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.12),
                                    border: '1px solid',
                                    borderColor: isDark ? alpha('#10b981', 0.4) : alpha('#10b981', 0.3),
                                    color: isDark ? '#34d399' : '#047857',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      transform: 'scale(1.03)',
                                      bgcolor: isDark ? alpha('#10b981', 0.3) : alpha('#10b981', 0.2)
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    {docIcon}
                                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 85 }}>
                                      {docLabel}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.85, display: 'block' }}>
                                    Bs {primerPago ? primerPago.monto_pagado : c.monto_final}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ) : esCancelado ? (
                              <Tooltip title="Cuota exonerada por beca. Clic para editar" arrow>
                                <Box
                                  onClick={() => handleAbrirPago(est, c)}
                                  sx={{
                                    p: 0.75,
                                    borderRadius: '8px',
                                    bgcolor: isDark ? alpha('#8b5cf6', 0.2) : alpha('#7c3aed', 0.1),
                                    border: '1px solid',
                                    borderColor: isDark ? alpha('#8b5cf6', 0.4) : alpha('#7c3aed', 0.3),
                                    color: isDark ? '#c084fc' : '#6d28d9',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      transform: 'scale(1.03)',
                                      bgcolor: isDark ? alpha('#8b5cf6', 0.3) : alpha('#7c3aed', 0.18)
                                    }
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', display: 'block' }}>
                                    🎓 BECA
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.85 }}>
                                    0 Bs
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ) : (!c.mensualidad_id || c.estado === 'no_aplica' || c.estado === 'no_generado') ? (
                              <Tooltip title={`No aplica cuota para ${c.mes} (ingreso en fecha posterior)`} arrow>
                                <Box
                                  sx={{
                                    p: 0.75,
                                    borderRadius: '8px',
                                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                    border: '1px dashed',
                                    borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                                    color: 'text.disabled',
                                    textAlign: 'center'
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                                    —
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
                                    No aplica
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ) : (
                              <Tooltip title={`Registrar pago histórico para ${c.mes}`} arrow>
                                <Box
                                  onClick={() => handleAbrirPago(est, c)}
                                  sx={{
                                    p: 0.75,
                                    borderRadius: '8px',
                                    bgcolor: isDark ? alpha('#ef4444', 0.08) : alpha('#ef4444', 0.04),
                                    border: '1px solid',
                                    borderColor: isDark ? alpha('#ef4444', 0.2) : alpha('#ef4444', 0.15),
                                    color: isDark ? '#f87171' : '#b91c1c',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      transform: 'scale(1.03)',
                                      bgcolor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
                                      borderColor: 'primary.main',
                                      color: 'primary.main'
                                    }
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', display: 'block' }}>
                                    + Cobrar
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                    Bs {c.monto_final || curso.monto_base_cuota}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modales */}
      <ModalRegistroPagoHistorico
        open={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudianteSeleccionado}
        cuota={cuotaSeleccionada}
      />

      <ModalGestionBeca
        open={modalBecaOpen}
        onClose={() => setModalBecaOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudianteSeleccionado}
      />

      <ModalCargaLoteEstudiante
        open={modalLoteOpen}
        onClose={() => setModalLoteOpen(false)}
        onSuccess={onRefresh}
        estudiante={estudianteSeleccionado}
        montoBaseDefault={Number(curso.monto_base_cuota) || 330}
      />

      <ModalImportarJson
        open={modalJsonOpen}
        onClose={() => setModalJsonOpen(false)}
        onSuccess={onRefresh}
        estudiante={modoCursoJson ? null : estudianteSeleccionado}
        paraleloId={curso.paralelo_id}
        cursoNombre={curso.paralelo_nombre}
        periodoId={curso.periodo_academico_id}
      />
    </Box>
  );
};
