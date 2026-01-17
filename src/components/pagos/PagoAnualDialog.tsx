// components/pagos/PagoAnualDialog.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import {
  Payment,
  Info,
  LocalOffer,
  TrendingDown,
  CheckCircle,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Mensualidad, MetodoPago } from '@/types/pagos';
import pagosService from '@/services/pagos';

interface PagoAnualDialogProps {
  open: boolean;
  onClose: () => void;
  mensualidades: Mensualidad[];
  matriculaId: number;
  estudianteNombre: string;
  onSuccess: () => void;
}

interface FormData {
  metodo_pago: MetodoPago;
  numero_comprobante: string;
  banco_origen: string;
  numero_referencia: string;
  entrego_factura: boolean;
  numero_factura: string;
  observaciones: string;
}

const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const PagoAnualDialog: React.FC<PagoAnualDialogProps> = ({
  open,
  onClose,
  mensualidades,
  matriculaId,
  estudianteNombre,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    metodo_pago: 'efectivo',
    numero_comprobante: '',
    banco_origen: '',
    numero_referencia: '',
    entrego_factura: false,
    numero_factura: '',
    observaciones: '',
  });

  // Calcular totales
  const calculos = React.useMemo(() => {
    const mensualidadesPendientes = mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido'
    );

    if (mensualidadesPendientes.length === 0) {
      return null;
    }

    // Total sin descuento (suma de todas las mensualidades pendientes)
    const totalSinDescuento = mensualidadesPendientes.reduce(
      (sum, m) => sum + parseFloat(m.monto_final.toString()),
      0
    );

    // Descuento del 9.09% (equivalente a 1 mes gratis)
    const PORCENTAJE_DESCUENTO = 9.09;
    const montoDescuento = totalSinDescuento * (PORCENTAJE_DESCUENTO / 100);
    
    // Total a pagar
    const totalAPagar = totalSinDescuento - montoDescuento;

    return {
      cantidadMeses: mensualidadesPendientes.length,
      totalSinDescuento,
      porcentajeDescuento: PORCENTAJE_DESCUENTO,
      montoDescuento,
      totalAPagar,
      ahorro: montoDescuento,
    };
  }, [mensualidades]);

  // Resetear form
  useEffect(() => {
    if (open) {
      setFormData({
        metodo_pago: 'efectivo',
        numero_comprobante: '',
        banco_origen: '',
        numero_referencia: '',
        entrego_factura: false,
        numero_factura: '',
        observaciones: '',
      });
    }
  }, [open]);

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!calculos) {
      enqueueSnackbar('No hay mensualidades pendientes para pago anual', { variant: 'error' });
      return;
    }

    if (calculos.cantidadMeses < 11) {
      enqueueSnackbar(
        `Se requieren al menos 11 mensualidades pendientes. Solo hay ${calculos.cantidadMeses} disponibles.`,
        { variant: 'warning' }
      );
      return;
    }

    if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
      enqueueSnackbar('Número de referencia requerido para transferencias', { 
        variant: 'warning' 
      });
      return;
    }

    const confirm = window.confirm(
      `¿Confirmar Pago Anual Completo?\n\n` +
      `Estudiante: ${estudianteNombre}\n` +
      `Meses a pagar: ${calculos.cantidadMeses}\n` +
      `Total sin descuento: Bs ${calculos.totalSinDescuento.toFixed(2)}\n` +
      `Descuento (${calculos.porcentajeDescuento}%): Bs ${calculos.montoDescuento.toFixed(2)}\n` +
      `TOTAL A PAGAR: Bs ${calculos.totalAPagar.toFixed(2)}\n\n` +
      `Se marcarán las ${calculos.cantidadMeses} mensualidades como pagadas.`
    );

    if (!confirm) return;

    try {
      setLoading(true);

      await pagosService.registrarPagoAnual({
        matricula_id: matriculaId,
        monto_pagado: calculos.totalAPagar,
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        banco_origen: formData.banco_origen || undefined,
        numero_referencia: formData.numero_referencia || undefined,
        entrego_factura: formData.entrego_factura,
        numero_factura: formData.numero_factura || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar(
        `✅ Pago anual registrado exitosamente. Ahorro: Bs ${calculos.ahorro.toFixed(2)}`,
        { variant: 'success' }
      );
      onSuccess();
    } catch (error: any) {
      console.error('Error al registrar pago anual:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al registrar el pago anual',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const requiresComprobante = ['transferencia', 'qr', 'tarjeta'].includes(
    formData.metodo_pago
  );

  if (!calculos) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="warning" icon={<Info />}>
            No hay mensualidades pendientes para realizar un pago anual completo.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (calculos.cantidadMeses < 11) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="warning" icon={<Info />}>
            Se requieren al menos 11 mensualidades pendientes para el pago anual completo.
            Actualmente solo hay {calculos.cantidadMeses} mensualidad(es) pendiente(s).
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: isDark ? alpha('#000', 0.9) : alpha('#fff', 0.95),
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalOffer sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
            <Typography variant="h6" fontWeight={700}>
              Pago Anual Completo - 1 Mes GRATIS 🎉
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Información del estudiante */}
          <Card
            sx={{
              mb: 3,
              borderRadius: '12px',
              background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estudiante
              </Typography>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {estudianteNombre}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Desglose del pago */}
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Mensualidades a pagar:
                  </Typography>
                  <Chip 
                    label={`${calculos.cantidadMeses} meses`}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#3b82f6', 0.1),
                      color: '#3b82f6',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total sin descuento:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Bs {calculos.totalSinDescuento.toFixed(2)}
                  </Typography>
                </Box>

                <Box 
                  display="flex" 
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: alpha('#10b981', 0.1),
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingDown sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" color="#10b981" fontWeight={600}>
                      Descuento ({calculos.porcentajeDescuento}%)
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={700} color="#10b981">
                    - Bs {calculos.montoDescuento.toFixed(2)}
                  </Typography>
                </Box>

                <Divider />

                <Box 
                  display="flex" 
                  justifyContent="space-between"
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${
                      isDark 
                        ? alpha('#facc15', 0.2) 
                        : alpha('#0288d1', 0.2)
                    } 0%, ${
                      isDark 
                        ? alpha('#f59e0b', 0.1) 
                        : alpha('#01579b', 0.1)
                    } 100%)`,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      TOTAL A PAGAR
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
                      Bs {calculos.totalAPagar.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 32 }} />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Alerta informativa */}
          <Alert 
            severity="success" 
            icon={<LocalOffer />}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              ¡Aprovecha esta oferta especial!
            </Typography>
            <Typography variant="caption">
              Ahorra <strong>Bs {calculos.ahorro.toFixed(2)}</strong> pagando el año completo.
              Es como pagar {calculos.cantidadMeses - 1} meses y recibir 1 mes completamente GRATIS.
            </Typography>
          </Alert>

          {/* Formulario */}
          <Grid container spacing={2}>
            {/* Método de Pago */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                select
                label="Método de Pago"
                value={formData.metodo_pago}
                onChange={handleChange('metodo_pago')}
                required
              >
                {METODOS_PAGO.map(metodo => (
                  <MenuItem key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Número de Comprobante */}
            {requiresComprobante && (
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="N° Comprobante"
                  value={formData.numero_comprobante}
                  onChange={handleChange('numero_comprobante')}
                  helperText="Opcional"
                />
              </Grid>
            )}

            {/* Banco (solo transferencia) */}
            {formData.metodo_pago === 'transferencia' && (
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="Banco Origen"
                  value={formData.banco_origen}
                  onChange={handleChange('banco_origen')}
                />
              </Grid>
            )}

            {/* Número de Referencia (transferencia/QR) */}
            {['transferencia', 'qr'].includes(formData.metodo_pago) && (
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="N° Referencia"
                  value={formData.numero_referencia}
                  onChange={handleChange('numero_referencia')}
                  required={formData.metodo_pago === 'transferencia'}
                  helperText={
                    formData.metodo_pago === 'transferencia' 
                      ? 'Requerido' 
                      : 'Opcional'
                  }
                />
              </Grid>
            )}

            {/* Factura */}
            <Grid size={{xs:12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.entrego_factura}
                    onChange={handleChange('entrego_factura')}
                    color="primary"
                  />
                }
                label="¿Entregó factura?"
              />
            </Grid>

            {formData.entrego_factura && (
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="N° Factura"
                  value={formData.numero_factura}
                  onChange={handleChange('numero_factura')}
                />
              </Grid>
            )}

            {/* Observaciones */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                value={formData.observaciones}
                onChange={handleChange('observaciones')}
                placeholder="Notas adicionales sobre el pago anual..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: '12px' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {loading ? 'Procesando...' : `Registrar Pago Anual (Bs ${calculos.totalAPagar.toFixed(2)})`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};