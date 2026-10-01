// components/migracion/ModalRegistroPagoHistorico.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Payment,
  Receipt,
  Description,
  Delete,
  CalendarToday,
  AttachMoney,
  Close,
  CheckCircle,
  Edit,
  ArrowForward,
  ArrowBack,
  FastForward
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  EstudianteMatrizItem,
  CuotaMatrizItem,
  PagoHistoricoItem,
  obtenerFechaDefectoCuota
} from '@/services/migracionPagosService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiante: EstudianteMatrizItem | null;
  cuota: CuotaMatrizItem | null;
  pagoEditar?: PagoHistoricoItem | null;
}

export const ModalRegistroPagoHistorico: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  estudiante,
  cuota: initialCuota,
  pagoEditar
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [currentCuota, setCurrentCuota] = useState<CuotaMatrizItem | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<'recibo' | 'factura' | 'ambos' | 'sin_documento'>('recibo');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [montoPagado, setMontoPagado] = useState<number | string>(330);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'qr' | 'transferencia' | 'tarjeta'>('efectivo');
  const [fechaPago, setFechaPago] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Sincronizar cuota activa
  useEffect(() => {
    if (initialCuota) {
      setCurrentCuota(initialCuota);
    }
  }, [initialCuota, open]);

  // Sincronizar estado cuando cambia la cuota activa
  useEffect(() => {
    if (!open || !currentCuota) return;

    const pago = pagoEditar || (currentCuota.pagos && currentCuota.pagos.length > 0 ? currentCuota.pagos[0] : null);

    if (pago) {
      // Modo edición
      if (pago.numero_factura && pago.numero_comprobante) {
        setTipoDocumento('ambos');
      } else if (pago.entrego_factura || pago.numero_factura) {
        setTipoDocumento('factura');
      } else if (pago.numero_comprobante) {
        setTipoDocumento('recibo');
      } else {
        setTipoDocumento('sin_documento');
      }

      setNumeroComprobante(pago.numero_comprobante || '');
      setNumeroFactura(pago.numero_factura || '');
      setMontoPagado(pago.monto_pagado || currentCuota.monto_final || 330);
      setMetodoPago(pago.metodo_pago || 'efectivo');
      setFechaPago(
        pago.fecha_pago
          ? pago.fecha_pago.substring(0, 10)
          : obtenerFechaDefectoCuota(currentCuota.numero_cuota, currentCuota.fecha_vencimiento?.substring(0, 4))
      );
      setObservaciones(pago.observaciones || '');
    } else {
      // Modo nuevo registro: Por defecto día 10 del mes de esa cuota
      setTipoDocumento(prev => prev || 'recibo');
      setMontoPagado(currentCuota.monto_final > 0 ? currentCuota.monto_final : currentCuota.monto_original || 330);
      setMetodoPago(prev => prev || 'efectivo');
      setFechaPago(obtenerFechaDefectoCuota(currentCuota.numero_cuota, currentCuota.fecha_vencimiento?.substring(0, 4)));
      setObservaciones('');
    }
  }, [open, currentCuota, pagoEditar]);

  // Cambiar manualmente a otra cuota dentro del modal
  const cambiarCuota = (numCuota: number) => {
    if (!estudiante) return;
    const targetCuota = estudiante.cuotas.find(c => c.numero_cuota === numCuota);
    if (targetCuota) {
      setCurrentCuota(targetCuota);
    }
  };

  const ejecutarGuardado = async () => {
    if (!estudiante || !currentCuota) return false;

    if (Number(montoPagado) <= 0) {
      enqueueSnackbar('El monto pagado debe ser mayor a 0', { variant: 'warning' });
      return false;
    }

    setLoading(true);
    try {
      const pagoExistente = pagoEditar || (currentCuota.pagos && currentCuota.pagos.length > 0 ? currentCuota.pagos[0] : null);

      if (pagoExistente) {
        await migracionPagosService.actualizarPagoHistorico(pagoExistente.id, {
          monto_pagado: Number(montoPagado),
          metodo_pago: metodoPago,
          tipo_documento: tipoDocumento,
          numero_comprobante: numeroComprobante.trim() || null,
          numero_factura: numeroFactura.trim() || null,
          entrego_factura: tipoDocumento === 'factura' || tipoDocumento === 'ambos',
          fecha_pago: fechaPago,
          observaciones: observaciones.trim() || undefined
        });
      } else {
        await migracionPagosService.registrarPagoHistorico({
          matricula_id: estudiante.matricula_id,
          numero_cuota: currentCuota.numero_cuota,
          monto_pagado: Number(montoPagado),
          metodo_pago: metodoPago,
          tipo_documento: tipoDocumento,
          numero_comprobante: numeroComprobante.trim() || null,
          numero_factura: numeroFactura.trim() || null,
          entrego_factura: tipoDocumento === 'factura' || tipoDocumento === 'ambos',
          fecha_pago: fechaPago,
          observaciones: observaciones.trim() || undefined
        });
      }
      return true;
    } catch (err: any) {
      console.error('Error al guardar pago:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al guardar el pago histórico', { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const ok = await ejecutarGuardado();
    if (ok && currentCuota) {
      enqueueSnackbar(`Pago de cuota ${currentCuota.numero_cuota} (${currentCuota.mes}) guardado`, { variant: 'success' });
      onSuccess();
      onClose();
    }
  };

  // Guardar y pasar automáticamente a la siguiente cuota
  const handleGuardarYSiguiente = async () => {
    if (!estudiante || !currentCuota) return;
    const ok = await ejecutarGuardado();
    if (!ok) return;

    enqueueSnackbar(`✓ Cuota ${currentCuota.numero_cuota} (${currentCuota.mes}) guardada`, { variant: 'success' });
    onSuccess();

    // Siguiente cuota
    const siguienteNum = currentCuota.numero_cuota + 1;
    if (siguienteNum <= 10) {
      const siguienteCuota = estudiante.cuotas.find(c => c.numero_cuota === siguienteNum);
      if (siguienteCuota) {
        // Auto-incrementar número correlativo si es número
        if (numeroComprobante && /^\d+$/.test(numeroComprobante.trim())) {
          setNumeroComprobante(String(Number(numeroComprobante.trim()) + 1));
        }
        if (numeroFactura && /^\d+$/.test(numeroFactura.trim())) {
          setNumeroFactura(String(Number(numeroFactura.trim()) + 1));
        }
        setCurrentCuota(siguienteCuota);
        return;
      }
    }

    enqueueSnackbar('¡Todas las cuotas procesadas con éxito!', { variant: 'info' });
    onClose();
  };

  const handleEliminar = async () => {
    const pagoExistente = pagoEditar || (currentCuota?.pagos && currentCuota.pagos.length > 0 ? currentCuota.pagos[0] : null);
    if (!pagoExistente) {
      enqueueSnackbar('No se encontró un pago registrado para eliminar en esta cuota', { variant: 'warning' });
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el pago de la cuota ${currentCuota?.numero_cuota || ''}? La cuota volverá a estado pendiente.`)) {
      return;
    }

    setLoading(true);
    try {
      await migracionPagosService.eliminarPagoHistorico(pagoExistente.id);
      enqueueSnackbar('Pago eliminado correctamente', { variant: 'info' });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar pago:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al eliminar el pago', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!estudiante || !currentCuota) return null;

  const esEdicion = !!(pagoEditar || (currentCuota.pagos && currentCuota.pagos.length > 0));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#3b82f6', 0.2) : alpha('#0288d1', 0.1),
              color: isDark ? '#60a5fa' : '#0288d1'
            }}>
              {esEdicion ? <Edit /> : <Payment />}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {esEdicion ? 'Editar Pago Histórico' : 'Registrar Pago Histórico'}
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={700}>
                Cuota {currentCuota.numero_cuota} - {currentCuota.mes.toUpperCase()} (Día 10 automático)
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* Selector rápido de cuota 1..10 */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', pb: 0.5 }}>
          {estudiante.cuotas.map((c) => {
            const isCurrent = c.numero_cuota === currentCuota.numero_cuota;
            const tienePago = c.estado === 'pagado' || (c.pagos && c.pagos.length > 0);
            return (
              <Chip
                key={c.numero_cuota}
                label={`${c.numero_cuota}.${c.mes.substring(0, 3)}`}
                size="small"
                onClick={() => cambiarCuota(c.numero_cuota)}
                color={isCurrent ? 'primary' : tienePago ? 'success' : 'default'}
                variant={isCurrent ? 'filled' : tienePago ? 'filled' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  fontWeight: isCurrent ? 800 : 500,
                  fontSize: '0.72rem'
                }}
              />
            );
          })}
        </Box>

        {/* Ficha rápida del alumno */}
        <Box sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)
        }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {estudiante.nombre_completo}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              CI: <strong>{estudiante.ci || 'Sin CI'}</strong>
            </Typography>
            {estudiante.es_becado && (
              <Chip
                label={`Becado (${estudiante.porcentaje_beca || 100}%)`}
                size="small"
                color="secondary"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Tipo de Documento emitido */}
          <Grid size={{ xs: 12 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
                Tipo de Documento Entregado:
              </FormLabel>
              <RadioGroup
                row
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as any)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
                  gap: 1
                }}
              >
                <FormControlLabel
                  value="recibo"
                  control={<Radio size="small" />}
                  label="Solo Recibo"
                  sx={{
                    m: 0, p: 1, border: '1px solid',
                    borderColor: tipoDocumento === 'recibo' ? 'primary.main' : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    borderRadius: 1.5,
                    bgcolor: tipoDocumento === 'recibo' ? (isDark ? alpha('#3b82f6', 0.15) : alpha('#0288d1', 0.08)) : 'transparent'
                  }}
                />
                <FormControlLabel
                  value="factura"
                  control={<Radio size="small" />}
                  label="Solo Factura"
                  sx={{
                    m: 0, p: 1, border: '1px solid',
                    borderColor: tipoDocumento === 'factura' ? 'primary.main' : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    borderRadius: 1.5,
                    bgcolor: tipoDocumento === 'factura' ? (isDark ? alpha('#3b82f6', 0.15) : alpha('#0288d1', 0.08)) : 'transparent'
                  }}
                />
                <FormControlLabel
                  value="ambos"
                  control={<Radio size="small" />}
                  label="Ambos (R+F)"
                  sx={{
                    m: 0, p: 1, border: '1px solid',
                    borderColor: tipoDocumento === 'ambos' ? 'primary.main' : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    borderRadius: 1.5,
                    bgcolor: tipoDocumento === 'ambos' ? (isDark ? alpha('#3b82f6', 0.15) : alpha('#0288d1', 0.08)) : 'transparent'
                  }}
                />
                <FormControlLabel
                  value="sin_documento"
                  control={<Radio size="small" />}
                  label="Sin Documento"
                  sx={{
                    m: 0, p: 1, border: '1px solid',
                    borderColor: tipoDocumento === 'sin_documento' ? 'primary.main' : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                    borderRadius: 1.5,
                    bgcolor: tipoDocumento === 'sin_documento' ? (isDark ? alpha('#3b82f6', 0.15) : alpha('#0288d1', 0.08)) : 'transparent'
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* N° Comprobante / Recibo */}
          {(tipoDocumento === 'recibo' || tipoDocumento === 'ambos') && (
            <Grid size={{ xs: 12, sm: tipoDocumento === 'ambos' ? 6 : 12 }}>
              <TextField
                fullWidth
                size="small"
                label="N° de Recibo / Comprobante"
                placeholder="Ej. 2321 o C-2321"
                value={numeroComprobante}
                onChange={(e) => setNumeroComprobante(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt fontSize="small" color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}

          {/* N° Factura */}
          {(tipoDocumento === 'factura' || tipoDocumento === 'ambos') && (
            <Grid size={{ xs: 12, sm: tipoDocumento === 'ambos' ? 6 : 12 }}>
              <TextField
                fullWidth
                size="small"
                label="N° de Factura"
                placeholder="Ej. 266 o E-266"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description fontSize="small" color="secondary" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}

          {/* Monto Pagado */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Monto Pagado (Bs)"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Método de Pago */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Método de Pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as any)}
            >
              <MenuItem value="efectivo">💵 Efectivo</MenuItem>
              <MenuItem value="qr">📱 Pago QR</MenuItem>
              <MenuItem value="transferencia">🏦 Transferencia Bancaria</MenuItem>
              <MenuItem value="tarjeta">💳 Tarjeta de Débito/Crédito</MenuItem>
            </TextField>
          </Grid>

          {/* Fecha de Pago (Prellenada automáticamente al día 10 del mes) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha de Pago (Día 10 del mes)"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Prellenada automáticamente al día 10 del mes"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Observaciones */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Notas / Observaciones"
              placeholder="Ej. Pagado anticipado, regularizado"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          {esEdicion && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={handleEliminar}
              disabled={loading}
            >
              Eliminar Pago
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={onClose} disabled={loading} color="inherit" size="small">
            Cerrar
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            size="small"
            startIcon={<CheckCircle />}
          >
            {loading ? 'Guardando...' : 'Solo Guardar'}
          </Button>
          {currentCuota.numero_cuota < 10 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleGuardarYSiguiente}
              disabled={loading}
              size="small"
              startIcon={<FastForward />}
            >
              Guardar y Siguiente ({currentCuota.numero_cuota + 1}°) ➔
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
