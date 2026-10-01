// components/migracion/ModalCargaLoteEstudiante.tsx
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
  Checkbox,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Layers,
  Receipt,
  Description,
  CalendarToday,
  AttachMoney,
  Close,
  CheckCircle,
  AutoAwesome
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import migracionPagosService, {
  EstudianteMatrizItem,
  obtenerFechaDefectoCuota
} from '@/services/migracionPagosService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiante: EstudianteMatrizItem | null;
  montoBaseDefault?: number;
}

export const ModalCargaLoteEstudiante: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  estudiante,
  montoBaseDefault = 330
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState<'recibo' | 'factura' | 'ambos' | 'sin_documento'>('recibo');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [esCorrelativo, setEsCorrelativo] = useState(false);
  const [usarFechasAutomaticas, setUsarFechasAutomaticas] = useState(true);
  const [montoPorCuota, setMontoPorCuota] = useState<number | string>(montoBaseDefault);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'qr' | 'transferencia' | 'tarjeta'>('efectivo');
  const [fechaPagoManual, setFechaPagoManual] = useState(new Date().toISOString().substring(0, 10));
  const [observaciones, setObservaciones] = useState('Pago múltiple de cuotas (carga histórica)');

  useEffect(() => {
    if (!open || !estudiante) return;

    // Preseleccionar todas las cuotas que no estén pagadas
    const pendientes = estudiante.cuotas
      .filter(c => c.estado !== 'pagado' && (!c.pagos || c.pagos.length === 0))
      .map(c => c.numero_cuota);

    setCuotasSeleccionadas(pendientes);
    setMontoPorCuota(montoBaseDefault);
    setUsarFechasAutomaticas(true);
    setEsCorrelativo(false);
    setNumeroComprobante('');
    setNumeroFactura('');
  }, [open, estudiante, montoBaseDefault]);

  const toggleCuota = (num: number) => {
    setCuotasSeleccionadas(prev =>
      prev.includes(num) ? prev.filter(x => x !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const seleccionarRango = (hastaCuota: number) => {
    if (!estudiante) return;
    const list = [];
    for (let i = 1; i <= hastaCuota; i++) {
      const c = estudiante.cuotas.find(x => x.numero_cuota === i);
      if (c && (c.estado === 'pagado' || (c.pagos && c.pagos.length > 0))) continue;
      list.push(i);
    }
    setCuotasSeleccionadas(list);
  };

  const seleccionarTodas = () => {
    if (!estudiante) return;
    const list = estudiante.cuotas
      .filter(c => c.estado !== 'pagado' && (!c.pagos || c.pagos.length === 0))
      .map(c => c.numero_cuota);
    setCuotasSeleccionadas(list);
  };

  const desmarcarTodas = () => {
    setCuotasSeleccionadas([]);
  };

  const handleSubmit = async () => {
    if (!estudiante || cuotasSeleccionadas.length === 0) {
      enqueueSnackbar('Debes seleccionar al menos una cuota a registrar', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const anioEstudiante = estudiante.cuotas[0]?.fecha_vencimiento?.substring(0, 4) || new Date().getFullYear();
      
      let baseCompNum = parseInt(numeroComprobante.replace(/\D/g, ''), 10);
      let baseFactNum = parseInt(numeroFactura.replace(/\D/g, ''), 10);
      const isCompNumeric = !isNaN(baseCompNum) && numeroComprobante.trim() === String(baseCompNum);
      const isFactNumeric = !isNaN(baseFactNum) && numeroFactura.trim() === String(baseFactNum);

      const sortedCuotas = [...cuotasSeleccionadas].sort((a, b) => a - b);

      const cuotasPayload = sortedCuotas.map((num, idx) => {
        const fechaCuota = usarFechasAutomaticas
          ? obtenerFechaDefectoCuota(num, anioEstudiante)
          : fechaPagoManual;

        let compFinal = numeroComprobante.trim() || null;
        let factFinal = numeroFactura.trim() || null;

        if (esCorrelativo) {
          if (isCompNumeric) compFinal = String(baseCompNum + idx);
          if (isFactNumeric) factFinal = String(baseFactNum + idx);
        }

        return {
          numero_cuota: num,
          monto: Number(montoPorCuota),
          metodo_pago: metodoPago,
          tipo_documento: tipoDocumento,
          numero_comprobante: compFinal,
          numero_factura: factFinal,
          fecha_pago: fechaCuota,
          observaciones: observaciones.trim() || undefined
        };
      });

      await migracionPagosService.registrarLoteEstudiante({
        matricula_id: estudiante.matricula_id,
        cuotas: cuotasPayload
      });

      enqueueSnackbar(
        `✓ Se registraron ${cuotasSeleccionadas.length} mensualidades exitosamente para ${estudiante.nombre_completo}`,
        { variant: 'success' }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al registrar lote:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al registrar pagos en lote', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!estudiante) return null;

  const totalPagar = cuotasSeleccionadas.length * Number(montoPorCuota);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#059669', 0.1),
              color: isDark ? '#34d399' : '#059669'
            }}>
              <Layers />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Registro de Pagos en Lote (Múltiples Meses)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estudiante.nombre_completo} (CI: {estudiante.ci || 'Sin CI'})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Atajos de selección */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Seleccionar cuotas a pagar de forma conjunta:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Button size="small" variant="contained" color="success" onClick={seleccionarTodas} sx={{ py: 0.25, fontSize: '0.75rem' }}>
                ⭐ Todas (Feb-Nov)
              </Button>
              <Button size="small" variant="outlined" onClick={() => seleccionarRango(6)} sx={{ py: 0.25, fontSize: '0.75rem' }}>
                1° Semestre
              </Button>
              <Button size="small" variant="outlined" onClick={() => seleccionarRango(3)} sx={{ py: 0.25, fontSize: '0.75rem' }}>
                1° Trimestre
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={desmarcarTodas} sx={{ py: 0.25, fontSize: '0.75rem' }}>
                🧹 Limpiar
              </Button>
            </Box>
          </Box>

          <Grid container spacing={1}>
            {estudiante.cuotas.map((c) => {
              const yaPagada = c.estado === 'pagado' || (c.pagos && c.pagos.length > 0);
              const isSelected = cuotasSeleccionadas.includes(c.numero_cuota);
              const anioEst = c.fecha_vencimiento?.substring(0, 4) || new Date().getFullYear();
              const fechaAuto = obtenerFechaDefectoCuota(c.numero_cuota, anioEst);

              return (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={c.numero_cuota}>
                  <Box
                    onClick={() => !yaPagada && toggleCuota(c.numero_cuota)}
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderRadius: 1.5,
                      cursor: yaPagada ? 'not-allowed' : 'pointer',
                      opacity: yaPagada ? 0.6 : 1,
                      textAlign: 'center',
                      borderColor: isSelected
                        ? 'success.main'
                        : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                      bgcolor: isSelected
                        ? (isDark ? alpha('#10b981', 0.15) : alpha('#059669', 0.08))
                        : 'transparent'
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {c.numero_cuota}. {c.mes}
                    </Typography>
                    <Typography variant="caption" color={yaPagada ? 'success.main' : 'primary.main'} display="block" fontWeight={600}>
                      {yaPagada ? 'Ya Pagada' : `Día 10 (${fechaAuto.substring(8, 10)}/${fechaAuto.substring(5, 7)})`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Bs {c.monto_final || montoBaseDefault}
                    </Typography>
                    <Checkbox
                      size="small"
                      color="success"
                      checked={isSelected}
                      disabled={yaPagada}
                      sx={{ p: 0.5 }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Configuración de Fechas y Documentos */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Información del Documento y Fecha de Pago:
        </Typography>

        <Grid container spacing={2}>
          {/* Opción Fecha Automática (Día 10) */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: isDark ? alpha('#3b82f6', 0.1) : alpha('#0288d1', 0.06),
              border: '1px solid',
              borderColor: isDark ? alpha('#3b82f6', 0.3) : alpha('#0288d1', 0.2),
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1
            }}>
              <Box>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  📅 Fechas Automáticas (Día 10 de cada mes)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Asigna a Feb: 10/02, Mar: 10/03, Abr: 10/04, May: 10/05, etc. automáticamente sin que tengas que escribir cada fecha.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usarFechasAutomaticas}
                    onChange={(e) => setUsarFechasAutomaticas(e.target.checked)}
                    color="primary"
                  />
                }
                label="Usar día 10 automático"
                sx={{ m: 0 }}
              />
            </Box>
          </Grid>

          {/* Tipo de Documento */}
          <Grid size={{ xs: 12 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
                Tipo de Documento:
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
                <FormControlLabel value="recibo" control={<Radio size="small" />} label="Solo Recibo" />
                <FormControlLabel value="factura" control={<Radio size="small" />} label="Solo Factura" />
                <FormControlLabel value="ambos" control={<Radio size="small" />} label="Ambos (R+F)" />
                <FormControlLabel value="sin_documento" control={<Radio size="small" />} label="Sin Documento" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {(tipoDocumento === 'recibo' || tipoDocumento === 'ambos') && (
            <Grid size={{ xs: 12, sm: tipoDocumento === 'ambos' ? 6 : 12 }}>
              <TextField
                fullWidth
                size="small"
                label="N° de Recibo / Comprobante inicial"
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

          {(tipoDocumento === 'factura' || tipoDocumento === 'ambos') && (
            <Grid size={{ xs: 12, sm: tipoDocumento === 'ambos' ? 6 : 12 }}>
              <TextField
                fullWidth
                size="small"
                label="N° de Factura inicial"
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

          {/* Opción correlativo */}
          {(tipoDocumento === 'recibo' || tipoDocumento === 'factura' || tipoDocumento === 'ambos') && (
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={esCorrelativo}
                    onChange={(e) => setEsCorrelativo(e.target.checked)}
                    color="secondary"
                    size="small"
                  />
                }
                label="Numeración correlativa automática (+1 por cada cuota, ej: 101, 102, 103...)"
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Monto por cada cuota (Bs)"
              value={montoPorCuota}
              onChange={(e) => setMontoPorCuota(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
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

          {!usarFechasAutomaticas && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha de Pago Manual (Para todas)"
                value={fechaPagoManual}
                onChange={(e) => setFechaPagoManual(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Resumen final */}
        <Box sx={{
          mt: 2.5,
          p: 2,
          borderRadius: 2,
          bgcolor: isDark ? alpha('#10b981', 0.1) : alpha('#059669', 0.05),
          border: '1px solid',
          borderColor: isDark ? alpha('#10b981', 0.3) : alpha('#059669', 0.2),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="body2" fontWeight={600}>
            Cuotas a registrar: <strong>{cuotasSeleccionadas.length}</strong> {usarFechasAutomaticas ? '(Fechas: 10 de cada mes)' : ''}
          </Typography>
          <Typography variant="h6" fontWeight={800} color="success.main">
            Total a Registrar: Bs {totalPagar.toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading || cuotasSeleccionadas.length === 0}
          startIcon={<CheckCircle />}
        >
          {loading ? 'Procesando Lote...' : `⚡ Registrar ${cuotasSeleccionadas.length} Cuotas en 1 Clic`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
