// components/pagos/ModalPagoAnual.tsx - SISTEMA 10 MESES - DATOS CORREGIDOS
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  useTheme,
  alpha,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Payment,
  LocalOffer,
  Close,
  CheckCircle,
  TrendingDown,
  CalendarMonth,
  Stars,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { Mensualidad, MetodoPago } from '@/types/pagos';
import { ModalGenerarRecibo } from './ModalGenerarRecibo';

interface ModalPagoAnualProps {
  open: boolean;
  onClose: () => void;
  matriculaId: number;
  estudianteNombre: string;
  estudianteCodigo: string; // 🆕 Agregar código de estudiante
  mensualidades: Mensualidad[];
  onSuccess: () => void;
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const ModalPagoAnual: React.FC<ModalPagoAnualProps> = ({
  open,
  onClose,
  matriculaId,
  estudianteNombre,
  estudianteCodigo, // 🆕
  mensualidades,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [pagosParaRecibo, setPagosParaRecibo] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    metodo_pago: 'efectivo' as MetodoPago,
    numero_comprobante: '',
    banco_origen: '',
    numero_referencia: '',
    entrego_factura: false,
    numero_factura: '',
    observaciones: '',
  });

  const calculos = React.useMemo(() => {
    const pendientes = mensualidades.filter(
      m => m.estado === 'pendiente' || m.estado === 'vencido'
    );

    if (pendientes.length < 10) {
      return null;
    }

    const MESES = 10;
    const DESCUENTO = 10.0;

    const totalSinDescuento = pendientes.reduce(
      (sum, m) => sum + parseFloat(m.monto_final.toString()),
      0
    );

    const montoDescuento = totalSinDescuento * (DESCUENTO / 100);
    const totalAPagar = totalSinDescuento - montoDescuento;
    const mesesGratis = Math.round((montoDescuento / (totalSinDescuento / MESES)) * 10) / 10;

    return {
      cantidadMeses: pendientes.length,
      totalSinDescuento,
      porcentajeDescuento: DESCUENTO,
      montoDescuento,
      totalAPagar,
      mesesGratis,
    };
  }, [mensualidades]);

  const handleSubmit = async () => {
    if (!calculos) {
      enqueueSnackbar('No hay suficientes mensualidades pendientes', { variant: 'error' });
      return;
    }

    if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
      enqueueSnackbar('Número de referencia requerido para transferencias', {
        variant: 'warning',
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/api/pago-anual', {
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
        `✅ Pago anual registrado. Ahorro: Bs ${calculos.montoDescuento.toFixed(2)}`,
        { variant: 'success' }
      );

      // 🔧 CORREGIDO: Preparar datos correctos para el recibo
      const pagoData = data.data.pago;
      
      // Separar nombres y apellidos correctamente
      const nombresParts = estudianteNombre.trim().split(' ');
      const nombres = nombresParts.slice(0, Math.ceil(nombresParts.length / 2)).join(' ');
      const apellidos = nombresParts.slice(Math.ceil(nombresParts.length / 2)).join(' ');

      setPagosParaRecibo([{
        id: pagoData.id,
        codigo_pago: pagoData.codigo_pago,
        fecha_pago: pagoData.fecha_pago,
        monto_pagado: pagoData.monto_pagado,
        metodo_pago: pagoData.metodo_pago,
        numero_comprobante: pagoData.numero_comprobante,
        estudiante_codigo: estudianteCodigo,
        nombres: nombres,
        apellidos: apellidos,
        mes_correspondiente: 'Pago Anual Completo (10 meses)',
        numero_cuota: null, // null para indicar que es pago anual
      }]);

      setReciboModalOpen(true);
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

  const handleReciboClose = () => {
    setReciboModalOpen(false);
    onSuccess();
    onClose();
  };

  if (!calculos) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Pago Anual No Disponible</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Se necesitan al menos 10 mensualidades pendientes para el pago anual.
            Actualmente hay {mensualidades.filter(m => m.estado === 'pendiente' || m.estado === 'vencido').length} disponibles.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: isDark ? alpha('#000', 0.95) : alpha('#fff', 0.98),
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalOffer sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Pago Anual Completo
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Stars sx={{ fontSize: 18, color: '#facc15' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Sistema de 10 meses • 1 mes GRATIS
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Card
            sx={{
              mb: 3,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#059669', 0.05)} 100%)`,
              border: `2px solid ${alpha('#10b981', 0.3)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CalendarMonth sx={{ color: '#10b981', fontSize: 32 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estudiante
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {estudianteNombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Código: {estudianteCodigo}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Mensualidades a pagar:
                  </Typography>
                  <Chip
                    label={`${calculos.cantidadMeses} meses (Feb - Nov)`}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#3b82f6', 0.1),
                      color: '#3b82f6',
                      fontWeight: 700,
                      borderRadius: '8px',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: alpha('#fff', isDark ? 0.05 : 0.5),
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total sin descuento:
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      Bs {calculos.totalSinDescuento.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: '8px',
                      background: alpha('#10b981', 0.15),
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown sx={{ color: '#10b981', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="#10b981">
                          Descuento ({calculos.porcentajeDescuento}%)
                        </Typography>
                        <Typography variant="caption" color="#10b981">
                          ≈ {calculos.mesesGratis.toFixed(1)} mes gratis
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#10b981">
                      - Bs {calculos.montoDescuento.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.9) }}>
                    TOTAL A PAGAR
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="#fff" my={1}>
                    Bs {calculos.totalAPagar.toFixed(2)}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <CheckCircle sx={{ color: '#fff', fontSize: 20 }} />
                    <Typography variant="body2" color="#fff" fontWeight={600}>
                      10 meses de educación
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Alert
            severity="success"
            icon={<Stars />}
            sx={{
              mb: 3,
              borderRadius: '12px',
              background: alpha('#10b981', 0.1),
              border: `1px solid ${alpha('#10b981', 0.3)}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              🎉 ¡Excelente decisión!
            </Typography>
            <Typography variant="caption">
              Al pagar el año completo, ahorras <strong>Bs {calculos.montoDescuento.toFixed(2)}</strong>.
              Es como pagar solo 9 meses y recibir el 10° mes completamente GRATIS.
            </Typography>
          </Alert>

          <Typography variant="h6" fontWeight={700} mb={2}>
            Datos del Pago
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Método de Pago"
                value={formData.metodo_pago}
                onChange={(e) =>
                  setFormData({ ...formData, metodo_pago: e.target.value as MetodoPago })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                {METODOS_PAGO.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="N° Comprobante"
                value={formData.numero_comprobante}
                onChange={(e) =>
                  setFormData({ ...formData, numero_comprobante: e.target.value })
                }
                helperText="Opcional"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {formData.metodo_pago === 'transferencia' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Banco Origen"
                    value={formData.banco_origen}
                    onChange={(e) =>
                      setFormData({ ...formData, banco_origen: e.target.value })
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="N° Referencia"
                    value={formData.numero_referencia}
                    onChange={(e) =>
                      setFormData({ ...formData, numero_referencia: e.target.value })
                    }
                    required
                    helperText="Requerido para transferencias"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.entrego_factura}
                    onChange={(e) =>
                      setFormData({ ...formData, entrego_factura: e.target.checked })
                    }
                    color="primary"
                  />
                }
                label="¿Entregó factura?"
              />
            </Grid>

            {formData.entrego_factura && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="N° Factura"
                  value={formData.numero_factura}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_factura: e.target.value })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder="Notas adicionales..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Box flex={1} />

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            {loading
              ? 'Procesando...'
              : `Confirmar Pago (Bs ${calculos.totalAPagar.toFixed(2)})`}
          </Button>
        </DialogActions>
      </Dialog>

      <ModalGenerarRecibo
        open={reciboModalOpen}
        onClose={handleReciboClose}
        pagos={pagosParaRecibo}
        onSuccess={handleReciboClose}
      />
    </>
  );
};