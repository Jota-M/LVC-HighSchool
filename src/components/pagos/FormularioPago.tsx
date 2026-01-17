// components/pagos/FormularioPago.tsx - FIXED
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
} from '@mui/material';
import { Payment, Upload, Info, CheckCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Mensualidad, MetodoPago } from '@/types/pagos';
import pagosService from '@/services/pagos';

interface FormularioPagoProps {
  open: boolean;
  onClose: () => void;
  mensualidad: Mensualidad;
  onSuccess: () => void;
}

interface FormData {
  monto_pagado: string;
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

export const FormularioPago: React.FC<FormularioPagoProps> = ({
  open,
  onClose,
  mensualidad,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    monto_pagado: '',
    metodo_pago: 'efectivo',
    numero_comprobante: '',
    banco_origen: '',
    numero_referencia: '',
    entrego_factura: false,
    numero_factura: '',
    observaciones: '',
  });

  // 🔧 FIX: Calcular saldo pendiente de forma más robusta
  const montoFinal = parseFloat(mensualidad.monto_final?.toString() || '0') || 0;
  const totalPagado = parseFloat(mensualidad.total_pagado?.toString() || '0') || 0;
  
  // Calcular el saldo pendiente real
  const saldoPendienteCalculado = Math.max(0, montoFinal - totalPagado);
  
  // Usar el saldo del backend SOLO si existe y es válido
  const saldoPendienteBackend = mensualidad.saldo_pendiente !== undefined 
    ? parseFloat(mensualidad.saldo_pendiente?.toString() || '0')
    : null;
  
  // Si el backend envía un valor válido, usarlo; sino, usar el calculado
  const saldoPendiente = saldoPendienteBackend !== null && !isNaN(saldoPendienteBackend)
    ? saldoPendienteBackend
    : saldoPendienteCalculado;
  
  const montoPagado = totalPagado;

  // 🔧 FIX: Verificar si ya está pagado (considerando margen de error de centavos)
  const yaPagado = saldoPendiente < 0.01;

  // Resetear form cuando cambia la mensualidad
  useEffect(() => {
    if (open && mensualidad) {
      // 🐛 DEBUG: Ver qué valores llegan
      console.log('📊 Datos de mensualidad:', {
        monto_final: mensualidad.monto_final,
        total_pagado: mensualidad.total_pagado,
        saldo_pendiente: mensualidad.saldo_pendiente,
        estado: mensualidad.estado,
        calculado: {
          montoFinal,
          totalPagado,
          saldoPendiente,
          yaPagado
        }
      });

      // Solo inicializar si hay saldo pendiente
      if (saldoPendiente > 0.01) {
        setFormData({
          monto_pagado: saldoPendiente.toFixed(2),
          metodo_pago: 'efectivo',
          numero_comprobante: '',
          banco_origen: '',
          numero_referencia: '',
          entrego_factura: false,
          numero_factura: '',
          observaciones: '',
        });
      } else {
        setFormData({
          monto_pagado: '',
          metodo_pago: 'efectivo',
          numero_comprobante: '',
          banco_origen: '',
          numero_referencia: '',
          entrego_factura: false,
          numero_factura: '',
          observaciones: '',
        });
      }
    }
  }, [open, mensualidad, saldoPendiente, montoFinal, totalPagado, yaPagado]);

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

    // 🔧 FIX: Validar si ya está pagado (con margen de centavos)
    if (yaPagado) {
      enqueueSnackbar('Esta mensualidad ya está completamente pagada', { 
        variant: 'warning' 
      });
      return;
    }

    // Validaciones
    const monto = parseFloat(formData.monto_pagado);
    if (isNaN(monto) || monto <= 0) {
      enqueueSnackbar('El monto debe ser mayor a 0', { variant: 'error' });
      return;
    }

    // Validar con margen de error de 1 centavo
    if (monto > saldoPendiente + 0.01) {
      enqueueSnackbar(
        `El monto no puede ser mayor al saldo pendiente (Bs ${saldoPendiente.toFixed(2)})`,
        { variant: 'error' }
      );
      return;
    }

    if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
      enqueueSnackbar('Número de referencia requerido para transferencias', { 
        variant: 'warning' 
      });
      return;
    }

    try {
      setLoading(true);

      await pagosService.registrarPago({
        mensualidad_id: mensualidad.id,
        monto_pagado: monto,
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        banco_origen: formData.banco_origen || undefined,
        numero_referencia: formData.numero_referencia || undefined,
        entrego_factura: formData.entrego_factura,
        numero_factura: formData.numero_factura || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
      onSuccess();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al registrar el pago',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const requiresComprobante = ['transferencia', 'qr', 'tarjeta'].includes(
    formData.metodo_pago
  );

  // 🔧 FIX: Si ya está pagado, mostrar mensaje de confirmación
  if (yaPagado) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? alpha('#000', 0.9) : alpha('#fff', 0.95),
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle sx={{ color: 'success.main' }} />
            <Typography variant="h6" fontWeight={700}>
              Mensualidad Pagada
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Esta mensualidad ya está completamente pagada.
          </Alert>

          <Card
            sx={{
              borderRadius: '12px',
              background: alpha('success.main', 0.1),
              border: `1px solid ${alpha('success.main', 0.2)}`,
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{xs:12}}>
                  <Typography variant="body2" color="text.secondary">
                    Estudiante
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {mensualidad.nombres} {mensualidad.apellidos}
                  </Typography>
                </Grid>

                <Grid size={{xs:6}}>
                  <Typography variant="caption" color="text.secondary">
                    Monto Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Bs {montoFinal.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{xs:6}}>
                  <Typography variant="caption" color="text.secondary">
                    Pagado
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    Bs {montoPagado.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cerrar
          </Button>
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
            <Payment sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
            <Typography variant="h6" fontWeight={700}>
              Registrar Pago
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Información de la mensualidad */}
          <Card
            sx={{
              mb: 3,
              borderRadius: '12px',
              background: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{xs:12}}>
                  <Typography variant="body2" color="text.secondary">
                    Estudiante
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {mensualidad.nombres} {mensualidad.apellidos}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mensualidad.estudiante_codigo}
                  </Typography>
                </Grid>

                <Grid size={{xs:6}}>
                  <Typography variant="body2" color="text.secondary">
                    Cuota
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Cuota {mensualidad.numero_cuota} - {mensualidad.mes_correspondiente}
                  </Typography>
                </Grid>

                <Grid size={{xs:6}}>
                  <Typography variant="body2" color="text.secondary">
                    Vencimiento
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(mensualidad.fecha_vencimiento).toLocaleDateString('es-BO')}
                  </Typography>
                </Grid>

                <Grid size={{xs:12}}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{xs:4}}>
                  <Typography variant="caption" color="text.secondary">
                    Monto Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Bs {montoFinal.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{xs:4}}>
                  <Typography variant="caption" color="text.secondary">
                    Pagado
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    Bs {montoPagado.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{xs:4}}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo Pendiente
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    Bs {saldoPendiente.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Formulario */}
          <Grid container spacing={2}>
            {/* Monto */}
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Monto a Pagar"
                type="number"
                value={formData.monto_pagado}
                onChange={handleChange('monto_pagado')}
                required
                inputProps={{
                  min: 0.01,
                  max: saldoPendiente,
                  step: 0.01,
                }}
                InputProps={{
                  startAdornment: (
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Bs
                    </Typography>
                  ),
                }}
                helperText={`Máximo: Bs ${saldoPendiente.toFixed(2)}`}
              />
            </Grid>

            {/* Método de Pago */}
            <Grid size={{xs:12, sm:6}}>
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
                placeholder="Notas adicionales sobre el pago..."
              />
            </Grid>

            {/* Info */}
            <Grid size={{xs:12}}>
              <Alert severity="info" icon={<Info />}>
                El estado de la mensualidad se actualizará automáticamente al registrar el pago.
              </Alert>
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
            {loading ? 'Procesando...' : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};