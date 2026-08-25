// components/pagos/ReporteFacturacion.tsx
'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  ReceiptLong as ReceiptLongIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  QrCode2 as QrCodeIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { usePagos } from '@/hooks/usePagos';
import { useAcademicos } from '@/hooks/useAcademicos';
import { FormatoReporte, MetodoPago } from '@/types/pagos';
import { useSnackbar } from 'notistack';

const COLORS = {
  factura: '#10b981', // Verde esmeralda para facturas
  recibo: '#3b82f6',  // Azul vibrante para recibos
  amber: '#f59e0b',
  purple: '#8b5cf6',
};

export const ReporteFacturacion: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const {
    facturasReport,
    facturasStats,
    loadingFacturasReport,
    loadingExportacionReportes,
    cargarFacturasReport,
    exportarFacturas,
  } = usePagos({});

  const {
    periodoActivo,
    periodos,
    grados,
    paralelos,
    loading: loadingAcademicos,
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: true,
    loadParalelos: true,
    loadMaterias: false,
    loadGradoMaterias: false,
  });

  // Filtros de búsqueda
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [gradoId, setGradoId] = useState<number | ''>('');
  const [paraleloId, setParaleloId] = useState<number | ''>('');
  const [tipoEmision, setTipoEmision] = useState<'todos' | 'factura' | 'recibo'>('todos');
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Paginación de la tabla
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Inicializar período activo
  useEffect(() => {
    if (periodoActivo && !periodoId) {
      setPeriodoId(periodoActivo.id);
    }
  }, [periodoActivo, periodoId]);

  // Cargar datos al cambiar filtros
  const fetchDatos = useCallback(() => {
    if (!periodoId) return;
    cargarFacturasReport({
      periodo_academico_id: Number(periodoId),
      tipo_emision: tipoEmision,
      grado_id: gradoId || undefined,
      paralelo_id: paraleloId || undefined,
      metodo_pago: metodoPago || undefined,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
    });
  }, [periodoId, tipoEmision, gradoId, paraleloId, metodoPago, fechaInicio, fechaFin, cargarFacturasReport]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const paralelosFiltrados = useMemo(() => {
    return gradoId ? paralelos.filter((p) => p.grado_id === gradoId) : paralelos;
  }, [gradoId, paralelos]);

  // Filtrar lista por término de búsqueda
  const itemsFiltrados = useMemo(() => {
    if (!searchTerm) return facturasReport;
    const term = searchTerm.toLowerCase();
    return facturasReport.filter((item) => {
      const estudiante = `${item.estudiante_nombres || ''} ${item.estudiante_apellidos || ''}`.toLowerCase();
      const codigo = (item.estudiante_codigo || '').toLowerCase();
      const codigoPago = (item.codigo_pago || '').toLowerCase();
      const numFactura = (item.numero_factura || '').toLowerCase();
      const numComprobante = (item.numero_comprobante || '').toLowerCase();
      const curso = `${item.grado || ''} ${item.paralelo || ''}`.toLowerCase();

      return (
        estudiante.includes(term) ||
        codigo.includes(term) ||
        codigoPago.includes(term) ||
        numFactura.includes(term) ||
        numComprobante.includes(term) ||
        curso.includes(term)
      );
    });
  }, [facturasReport, searchTerm]);

  // Paginación
  const itemsPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    return itemsFiltrados.slice(start, start + rowsPerPage);
  }, [itemsFiltrados, page, rowsPerPage]);

  // Datos para gráficos
  const pieChartData = useMemo(() => {
    if (!facturasStats) return [];
    return [
      {
        name: 'Con Factura',
        value: facturasStats.facturasCount || 0,
        monto: facturasStats.facturasMonto || 0,
        color: COLORS.factura,
      },
      {
        name: 'Solo Recibo',
        value: facturasStats.recibosCount || 0,
        monto: facturasStats.recibosMonto || 0,
        color: COLORS.recibo,
      },
    ].filter((item) => item.value > 0);
  }, [facturasStats]);

  const metodosBarData = useMemo(() => {
    const map: Record<string, { metodo: string; facturas: number; recibos: number; totalMonto: number }> = {};

    facturasReport.forEach((item) => {
      const met = item.metodo_pago || 'efectivo';
      if (!map[met]) {
        map[met] = { metodo: met.charAt(0).toUpperCase() + met.slice(1), facturas: 0, recibos: 0, totalMonto: 0 };
      }
      if (item.entrego_factura) {
        map[met].facturas++;
      } else {
        map[met].recibos++;
      }
      map[met].totalMonto += Number(item.monto_pagado || 0);
    });

    return Object.values(map);
  }, [facturasReport]);

  // Exportar reporte
  const handleExportar = async (formato: FormatoReporte) => {
    if (!periodoId) {
      enqueueSnackbar('Seleccione un período académico válido', { variant: 'warning' });
      return;
    }

    try {
      await exportarFacturas({
        periodo_academico_id: Number(periodoId),
        formato,
        tipo_emision: tipoEmision,
        grado_id: gradoId || undefined,
        paralelo_id: paraleloId || undefined,
        metodo_pago: metodoPago || undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      });
      enqueueSnackbar(`Reporte de facturación descargado (${formato.toUpperCase()})`, { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al exportar el reporte';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const getMetodoIcon = (metodo?: string) => {
    switch (metodo) {
      case 'qr':
        return <QrCodeIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'transferencia':
        return <BankIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'tarjeta':
        return <CreditCardIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return <AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    }
  };

  const formatMonto = (monto: number) => {
    return `Bs ${Number(monto || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingAcademicos && !periodoId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Cargando configuración del sistema...
        </Typography>
      </Box>
    );
  }

  const facturasCount = facturasStats?.facturasCount || 0;
  const recibosCount = facturasStats?.recibosCount || 0;
  const totalPagos = facturasStats?.totalPagos || (facturasCount + recibosCount);
  const facturasMonto = facturasStats?.facturasMonto || 0;
  const recibosMonto = facturasStats?.recibosMonto || 0;
  const totalMonto = facturasStats?.totalMonto || (facturasMonto + recibosMonto);
  const pctFactura = totalPagos > 0 ? (facturasCount / totalPagos) * 100 : 0;
  const pctRecibo = totalPagos > 0 ? (recibosCount / totalPagos) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── BARRA DE FILTROS Y ACCIONES ────────────────────────────── */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.15)}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(2,136,209,0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ReceiptLongIcon sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Reporte de Facturación y Comprobantes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estadísticas de cuotas emitidas con factura vs. recibos simples de mensualidades
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchDatos}
                disabled={loadingFacturasReport}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('pdf')}
                disabled={loadingExportacionReportes || !periodoId || totalPagos === 0}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                }}
              >
                Exportar PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportar('excel')}
                disabled={loadingExportacionReportes || !periodoId || totalPagos === 0}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                Exportar Excel
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {/* Período Académico */}
            <FormControl fullWidth size="small">
              <InputLabel>Período Académico</InputLabel>
              <Select
                value={periodoId}
                label="Período Académico"
                onChange={(e) => setPeriodoId(Number(e.target.value))}
              >
                {periodos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre} {p.activo ? '(Activo)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo de Emisión (Factura / Recibo / Todos) */}
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Emisión</InputLabel>
              <Select
                value={tipoEmision}
                label="Tipo de Emisión"
                onChange={(e) => setTipoEmision(e.target.value as any)}
              >
                <MenuItem value="todos">Todos (Facturas y Recibos)</MenuItem>
                <MenuItem value="factura">Solo con Factura</MenuItem>
                <MenuItem value="recibo">Solo Recibos (Sin Factura)</MenuItem>
              </Select>
            </FormControl>

            {/* Grado */}
            <FormControl fullWidth size="small">
              <InputLabel>Grado</InputLabel>
              <Select
                value={gradoId}
                label="Grado"
                onChange={(e) => {
                  setGradoId(e.target.value ? Number(e.target.value) : '');
                  setParaleloId('');
                }}
              >
                <MenuItem value="">Todos los Grados</MenuItem>
                {grados.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Paralelo */}
            <FormControl fullWidth size="small">
              <InputLabel>Paralelo</InputLabel>
              <Select
                value={paraleloId}
                label="Paralelo"
                disabled={!gradoId}
                onChange={(e) => setParaleloId(e.target.value ? Number(e.target.value) : '')}
              >
                <MenuItem value="">Todos los Paralelos</MenuItem>
                {paralelosFiltrados.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Método de Pago */}
            <FormControl fullWidth size="small">
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={metodoPago}
                label="Método de Pago"
                onChange={(e) => setMetodoPago(e.target.value as any)}
              >
                <MenuItem value="">Todos los Métodos</MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia Bancaria</MenuItem>
                <MenuItem value="qr">Pago QR</MenuItem>
                <MenuItem value="tarjeta">Tarjeta Débito/Crédito</MenuItem>
              </Select>
            </FormControl>

            {/* Fecha Inicio */}
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha Desde"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* Fecha Fin */}
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha Hasta"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* Búsqueda rápida */}
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar estudiante, N° factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ── CARDS DE RESUMEN Y MÉTRICAS (FACTURAS VS RECIBOS) ──────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* Total Recaudado */}
        <Card
          sx={{
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(2, 136, 209, 0.15) 0%, rgba(1, 87, 155, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(2, 136, 209, 0.08) 0%, rgba(2, 136, 209, 0.02) 100%)',
            border: `1px solid ${alpha(isDark ? '#38bdf8' : '#0288d1', 0.3)}`,
            p: 2.5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                TOTAL RECAUDADO EN CUOTAS
              </Typography>
              <Typography variant="h4" fontWeight={800} color={isDark ? '#38bdf8' : '#0288d1'}>
                {formatMonto(totalMonto)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {totalPagos} pagos registrados en total
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                background: alpha('#0288d1', 0.15),
                color: isDark ? '#38bdf8' : '#0288d1',
              }}
            >
              <AttachMoneyIcon fontSize="medium" />
            </Box>
          </Box>
        </Card>

        {/* Con Factura */}
        <Card
          sx={{
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
            border: `1px solid ${alpha(COLORS.factura, 0.3)}`,
            p: 2.5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  CON FACTURA EMITIDA
                </Typography>
                <Chip
                  label={`${pctFactura.toFixed(1)}%`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(COLORS.factura, 0.15),
                    color: COLORS.factura,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight={800} color={COLORS.factura}>
                {formatMonto(facturasMonto)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {facturasCount} cuotas con factura oficial
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                background: alpha(COLORS.factura, 0.15),
                color: COLORS.factura,
              }}
            >
              <ReceiptLongIcon fontSize="medium" />
            </Box>
          </Box>
        </Card>

        {/* Solo Recibo / Sin Factura */}
        <Card
          sx={{
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
            border: `1px solid ${alpha(COLORS.recibo, 0.3)}`,
            p: 2.5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  SOLO RECIBO (SIN FACTURA)
                </Typography>
                <Chip
                  label={`${pctRecibo.toFixed(1)}%`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(COLORS.recibo, 0.15),
                    color: COLORS.recibo,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight={800} color={COLORS.recibo}>
                {formatMonto(recibosMonto)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {recibosCount} cuotas emitidas con recibo simple
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                background: alpha(COLORS.recibo, 0.15),
                color: COLORS.recibo,
              }}
            >
              <ReceiptIcon fontSize="medium" />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── BARRA DE PROPORCIÓN VISUAL ────────────────────────────── */}
      {totalPagos > 0 && (
        <Card
          sx={{
            borderRadius: '16px',
            background: isDark ? alpha('#fff', 0.03) : alpha('#fff', 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
            p: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Proporción de Emisión: Facturas vs. Recibos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Facturas: <strong>{pctFactura.toFixed(1)}%</strong> ({facturasCount}) &nbsp;|&nbsp; Recibos: <strong>{pctRecibo.toFixed(1)}%</strong> ({recibosCount})
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 14, borderRadius: 7, overflow: 'hidden', display: 'flex', bgcolor: alpha(COLORS.recibo, 0.3) }}>
            <Box
              sx={{
                width: `${pctFactura}%`,
                bgcolor: COLORS.factura,
                transition: 'width 0.6s ease',
              }}
            />
            <Box
              sx={{
                width: `${pctRecibo}%`,
                bgcolor: COLORS.recibo,
                transition: 'width 0.6s ease',
              }}
            />
          </Box>
        </Card>
      )}

      {/* ── GRÁFICOS VISUALES ────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '5fr 7fr',
          },
          gap: 3,
        }}
      >
        {/* Gráfico Circular: Distribución Facturas vs Recibos */}
        <Card
          sx={{
            borderRadius: '20px',
            background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.15)}`,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Distribución de Comprobantes
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Cantidad y montos generados según el tipo de documento entregado
          </Typography>

          {loadingFacturasReport ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              <CircularProgress size={36} />
            </Box>
          ) : pieChartData.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              <Typography variant="body2" color="text.secondary">
                No hay transacciones para mostrar en este período
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} pagos (${formatMonto(item.payload.monto)})`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: 12,
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card>

        {/* Gráfico de Barras: Comparativa por Método de Pago */}
        <Card
          sx={{
            borderRadius: '20px',
            background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.15)}`,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Emisión por Método de Pago
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Desglose de facturas y recibos agrupados por la forma de pago utilizada
          </Typography>

          {loadingFacturasReport ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              <CircularProgress size={36} />
            </Box>
          ) : metodosBarData.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              <Typography variant="body2" color="text.secondary">
                No hay pagos registrados
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metodosBarData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="metodo" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [`${val} pagos`, name === 'facturas' ? 'Con Factura' : 'Solo Recibo']}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: 12,
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}
                  />
                  <Legend formatter={(value) => (value === 'facturas' ? 'Con Factura' : 'Solo Recibo')} />
                  <Bar dataKey="facturas" fill={COLORS.factura} radius={[6, 6, 0, 0]} name="facturas" />
                  <Bar dataKey="recibos" fill={COLORS.recibo} radius={[6, 6, 0, 0]} name="recibos" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card>
      </Box>

      {/* ── TABLA DE DETALLE DE PAGOS ─────────────────────────────── */}
      <Card
        sx={{
          borderRadius: '20px',
          background: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.15)}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Listado Detallado de Cuotas Registradas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mostrando {itemsFiltrados.length} registros según los filtros seleccionados
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Código Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Curso</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cuota / Mes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo Emisión</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>N° Comprobante / Factura</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingFacturasReport ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                        Cargando detalle de pagos...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : itemsPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" fontWeight={600} color="text.secondary">
                        No se encontraron registros de pagos con los filtros seleccionados
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Intente ajustar el período, rango de fechas o los filtros de grado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  itemsPaginados.map((item) => (
                    <TableRow
                      key={item.pago_id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                          {item.codigo_pago}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.fecha_pago ? new Date(item.fecha_pago).toLocaleDateString('es-BO') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.estudiante_apellidos}, {item.estudiante_nombres}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cód: {item.estudiante_codigo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.grado} — {item.paralelo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Cuota ${item.numero_cuota || '1'} (${item.mes_correspondiente || ''})`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                            color: isDark ? '#facc15' : '#0288d1',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.entrego_factura ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: `${COLORS.factura} !important` }} />}
                            label="Factura"
                            size="small"
                            sx={{
                              backgroundColor: alpha(COLORS.factura, 0.12),
                              color: COLORS.factura,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<DescriptionIcon sx={{ fontSize: '14px !important', color: `${COLORS.recibo} !important` }} />}
                            label="Recibo"
                            size="small"
                            sx={{
                              backgroundColor: alpha(COLORS.recibo, 0.12),
                              color: COLORS.recibo,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {item.entrego_factura
                            ? (item.numero_factura ? `FACT-${item.numero_factura}` : 'Facturado')
                            : (item.numero_comprobante || 'Recibo')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getMetodoIcon(item.metodo_pago)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {item.metodo_pago || 'Efectivo'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
                          {formatMonto(item.monto_pagado)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={itemsFiltrados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReporteFacturacion;
