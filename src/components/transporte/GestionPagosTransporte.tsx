// components/transporte/GestionPagosTransporte.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { useTransporte } from '@/hooks/useTransporte';
import transporteService from '@/services/transporte';
import type { PagoTransporte, RegistrarPagoTransporteRequest } from '@/types/transporte';

export const GestionPagosTransporte: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const {
    pagosTransporte,
    loadingPagos,
    cargarPagosTransporte,
    registrarPagoTransporte,
    anularPagoTransporte,
  } = useTransporte({
    autoLoad: true,
    loadPagos: true,
  });

  const [openDialogPago, setOpenDialogPago] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoTransporte | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    mes_correspondiente: '',
  });

  const [formPago, setFormPago] = useState<RegistrarPagoTransporteRequest>({
    monto_pagado: 0,
    metodo_pago: 'efectivo',
    numero_comprobante: '',
    observaciones: '',
  });

  const limpiarFormularioPago = () => {
    setFormPago({
      monto_pagado: 0,
      metodo_pago: 'efectivo',
      numero_comprobante: '',
      observaciones: '',
    });
    setComprobante(null);
  };

  const handleRegistrarPago = (pago: PagoTransporte) => {
    setPagoSeleccionado(pago);
    setFormPago({
      monto_pagado: pago.monto_final - (pago.monto_pagado || 0),
      metodo_pago: 'efectivo',
      numero_comprobante: '',
      observaciones: '',
    });
    setOpenDialogPago(true);
  };

  const handleVerDetalles = (pago: PagoTransporte) => {
    setPagoSeleccionado(pago);
    setOpenDetalles(true);
  };

  const handleAnularPago = async (pago: PagoTransporte) => {
    const motivo = prompt('Ingrese el motivo de la anulación:');
    if (!motivo) return;

    if (confirm(`¿Está seguro de anular el pago de ${transporteService.formatearMonto(pago.monto_pagado)}?`)) {
      try {
        await anularPagoTransporte(pago.id, motivo);
        alert('Pago anulado exitosamente');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al anular el pago');
      }
    }
  };

  const handleChangePago = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormPago((prev) => ({
      ...prev,
      [name]: name === 'monto_pagado' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleSubmitPago = async () => {
    if (!pagoSeleccionado) return;

    try {
      await registrarPagoTransporte(pagoSeleccionado.id, formPago, comprobante || undefined);
      alert('Pago registrado exitosamente');
      setOpenDialogPago(false);
      limpiarFormularioPago();
      setPagoSeleccionado(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar el pago');
    }
  };

  const handleFiltrar = () => {
    cargarPagosTransporte({
      estado: filtros.estado || undefined,
      mes_correspondiente: filtros.mes_correspondiente || undefined,
    });
  };

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Calcular estadísticas
  const estadisticas = {
    total: pagosTransporte.length,
    pagados: pagosTransporte.filter(p => p.estado === 'pagado').length,
    pendientes: pagosTransporte.filter(p => p.estado === 'pendiente').length,
    vencidos: pagosTransporte.filter(p => p.estado === 'vencido').length,
    monto_total: pagosTransporte.reduce((sum, p) => sum + p.monto_final, 0),
    monto_pagado: pagosTransporte.reduce((sum, p) => sum + (p.monto_pagado || 0), 0),
  };

  return (
    <Box>
      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.02)} 100%)`,
              border: `1px solid ${alpha('#10b981', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Pagados
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#10b981">
                {estadisticas.pagados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
              border: `1px solid ${alpha(yellowColor, 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Pendientes
              </Typography>
              <Typography variant="h4" fontWeight={700} color={yellowColor}>
                {estadisticas.pendientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.02)} 100%)`,
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Vencidos
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#ef4444">
                {estadisticas.vencidos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.02)} 100%)`,
              border: `1px solid ${alpha('#3b82f6', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Recaudado
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#3b82f6">
                {transporteService.formatearMonto(estadisticas.monto_pagado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header con filtros */}
      <Card
        sx={{
          mb: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(yellowColor, 0.15)} 0%, ${alpha(yellowColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(yellowColor, 0.2)}`,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Gestión de Pagos de Transporte
          </Typography>

          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Estado"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="pagado">Pagado</MenuItem>
                <MenuItem value="vencido">Vencido</MenuItem>
                <MenuItem value="anulado">Anulado</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Mes"
                value={filtros.mes_correspondiente}
                onChange={(e) => setFiltros({ ...filtros, mes_correspondiente: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {['febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre'].map(mes => (
                  <MenuItem key={mes} value={mes}>
                    {transporteService.getMesNombre(mes)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleFiltrar}
                sx={{
                  background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de pagos */}
      <Fade in>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: `0 4px 12px ${alpha(yellowColor, 0.1)}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: alpha(yellowColor, 0.1) }}>
                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ruta</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mes</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingPagos ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <LinearProgress sx={{ '& .MuiLinearProgress-bar': { backgroundColor: yellowColor } }} />
                  </TableCell>
                </TableRow>
              ) : pagosTransporte.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No se encontraron pagos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagosTransporte.map((pago) => {
                  const estaVencido = transporteService.estaVencido(pago);
                  const diasMora = estaVencido ? transporteService.calcularDiasMora(pago.fecha_vencimiento) : 0;

                  return (
                    <TableRow
                      key={pago.id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(yellowColor, 0.05),
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={pago.codigo_pago}
                          size="small"
                          sx={{
                            backgroundColor: alpha(yellowColor, 0.2),
                            color: yellowColor,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {pago.estudiante_nombres} {pago.estudiante_apellido_paterno}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pago.estudiante_codigo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pago.ruta_nombre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {transporteService.getMesNombre(pago.mes_correspondiente)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {transporteService.formatearFecha(pago.fecha_vencimiento)}
                          </Typography>
                          {estaVencido && (
                            <Chip
                              icon={<WarningIcon />}
                              label={`${diasMora} días`}
                              size="small"
                              color="error"
                              sx={{ mt: 0.5, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={700} color={yellowColor}>
                            {transporteService.formatearMonto(pago.monto_final)}
                          </Typography>
                          {pago.monto_pagado > 0 && (
                            <Typography variant="caption" color="success.main">
                              Pagado: {transporteService.formatearMonto(pago.monto_pagado)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transporteService.getEstadoPagoTransporteLabel(pago.estado)}
                          size="small"
                          className={transporteService.getEstadoPagoTransporteColor(pago.estado)}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalles(pago)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {pago.estado !== 'pagado' && pago.estado !== 'anulado' && (
                          <Tooltip title="Registrar pago">
                            <IconButton
                              size="small"
                              onClick={() => handleRegistrarPago(pago)}
                              sx={{ color: '#10b981' }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {pago.estado === 'pagado' && !pago.anulado && (
                          <Tooltip title="Anular pago">
                            <IconButton
                              size="small"
                              onClick={() => handleAnularPago(pago)}
                              sx={{ color: '#ef4444' }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Dialog de registro de pago */}
      <Dialog
        open={openDialogPago}
        onClose={() => {
          setOpenDialogPago(false);
          limpiarFormularioPago();
          setPagoSeleccionado(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 700,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon />
            Registrar Pago de Transporte
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {pagoSeleccionado && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Pago para: <strong>{pagoSeleccionado.estudiante_nombres} {pagoSeleccionado.estudiante_apellido_paterno}</strong>
                <br />
                Mes: <strong>{transporteService.getMesNombre(pagoSeleccionado.mes_correspondiente)}</strong>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Monto Total a Pagar (Bs) *"
                    name="monto_pagado"
                    type="number"
                    value={formPago.monto_pagado}
                    onChange={handleChangePago}
                    required
                    helperText={`Monto pendiente: ${transporteService.formatearMonto(pagoSeleccionado.monto_final - (pagoSeleccionado.monto_pagado || 0))}`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Método de Pago *"
                    name="metodo_pago"
                    value={formPago.metodo_pago}
                    onChange={handleChangePago}
                    required
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                    <MenuItem value="qr">QR</MenuItem>
                    <MenuItem value="tarjeta">Tarjeta</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número de Comprobante"
                    name="numero_comprobante"
                    value={formPago.numero_comprobante}
                    onChange={handleChangePago}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<AttachIcon />}
                  >
                    {comprobante ? comprobante.name : 'Adjuntar Comprobante'}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={handleArchivoChange}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    name="observaciones"
                    value={formPago.observaciones}
                    onChange={handleChangePago}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenDialogPago(false);
              limpiarFormularioPago();
              setPagoSeleccionado(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitPago}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
              color: '#000',
              fontWeight: 600,
            }}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog
        open={openDetalles}
        onClose={() => setOpenDetalles(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon />
            Detalles del Pago
          </Box>
          <IconButton size="small" onClick={() => setOpenDetalles(false)} sx={{ color: '#000' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {pagoSeleccionado && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Código de Pago
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {pagoSeleccionado.codigo_pago}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Estudiante
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {pagoSeleccionado.estudiante_nombres} {pagoSeleccionado.estudiante_apellido_paterno}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Código: {pagoSeleccionado.estudiante_codigo}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Ruta
                </Typography>
                <Typography variant="body2">
                  {pagoSeleccionado.ruta_nombre}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Mes Correspondiente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {transporteService.getMesNombre(pagoSeleccionado.mes_correspondiente)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de Vencimiento
                </Typography>
                <Typography variant="body2">
                  {transporteService.formatearFecha(pagoSeleccionado.fecha_vencimiento)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Montos
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Monto Original: {transporteService.formatearMonto(pagoSeleccionado.monto_original)}
                  </Typography>
                  {pagoSeleccionado.monto_recargo > 0 && (
                    <Typography variant="body2" color="error">
                      Recargo: {transporteService.formatearMonto(pagoSeleccionado.monto_recargo)}
                    </Typography>
                  )}
                  <Typography variant="h6" fontWeight={700} color={yellowColor}>
                    Total: {transporteService.formatearMonto(pagoSeleccionado.monto_final)}
                  </Typography>
                </Box>
              </Box>

              {pagoSeleccionado.estado === 'pagado' && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Monto Pagado
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {transporteService.formatearMonto(pagoSeleccionado.monto_pagado)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fecha de Pago
                    </Typography>
                    <Typography variant="body2">
                      {pagoSeleccionado.fecha_pago && transporteService.formatearFechaHora(pagoSeleccionado.fecha_pago)}
                    </Typography>
                  </Box>

                  {pagoSeleccionado.metodo_pago && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Método de Pago
                      </Typography>
                      <Typography variant="body2">
                        {transporteService.getMetodoPagoLabel(pagoSeleccionado.metodo_pago)}
                      </Typography>
                    </Box>
                  )}

                  {pagoSeleccionado.numero_comprobante && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Número de Comprobante
                      </Typography>
                      <Typography variant="body2">
                        {pagoSeleccionado.numero_comprobante}
                      </Typography>
                    </Box>
                  )}

                  {pagoSeleccionado.registrado_por_username && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Registrado por
                      </Typography>
                      <Typography variant="body2">
                        {pagoSeleccionado.registrado_por_username}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={transporteService.getEstadoPagoTransporteLabel(pagoSeleccionado.estado)}
                    className={transporteService.getEstadoPagoTransporteColor(pagoSeleccionado.estado)}
                  />
                </Box>
              </Box>

              {pagoSeleccionado.anulado && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Pago Anulado
                  </Typography>
                  {pagoSeleccionado.motivo_anulacion && (
                    <Typography variant="caption">
                      Motivo: {pagoSeleccionado.motivo_anulacion}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalles(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionPagosTransporte;