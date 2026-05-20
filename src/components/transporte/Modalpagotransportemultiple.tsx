// components/transporte/ModalPagoTransporteMultiple.tsx
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
  Alert,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Close,
  DirectionsBus,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { MetodoPago } from '@/types/transporte';

interface ModalPagoTransporteMultipleProps {
  open: boolean;
  onClose: () => void;
  pagosSeleccionados: number[];
  estudiantes: any[];
  onSuccess: () => void;
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const ModalPagoTransporteMultiple: React.FC<ModalPagoTransporteMultipleProps> = ({
  open,
  onClose,
  pagosSeleccionados,
  estudiantes,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    metodo_pago: 'efectivo' as MetodoPago,
    numero_comprobante: '',
    observaciones: '',
  });

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Calcular datos de los pagos
  const datosPagos = React.useMemo(() => {
    const pagos: any[] = [];
    let totalGeneral = 0;

    estudiantes.forEach(est => {
      est.pagos_transporte
        .filter((p: any) => pagosSeleccionados.includes(p.id))
        .forEach((pago: any) => {
          const saldo = parseFloat((pago.saldo_pendiente ?? pago.monto_final).toString());
          totalGeneral += saldo;
          
          pagos.push({
            pago_id: pago.id,
            estudiante: `${est.nombres} ${est.apellido_paterno}`,
            mes: pago.mes_correspondiente,
            monto: saldo,
          });
        });
    });

    return { pagos, totalGeneral };
  }, [estudiantes, pagosSeleccionados]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Registrar pagos múltiples de transporte
      const { data } = await api.post('/api/pago-transporte/multiple', {
        pagos: datosPagos.pagos.map(p => ({
          pago_transporte_id: p.pago_id,
          monto_pagado: p.monto,
        })),
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar(
        `✅ ${datosPagos.pagos.length} pagos registrados por Bs ${datosPagos.totalGeneral.toFixed(2)}`,
        { variant: 'success' }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar pago múltiple:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al procesar el pago múltiple',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DirectionsBus sx={{ color: '#000', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Pago Múltiple de Transporte
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {datosPagos.pagos.length} cuotas seleccionadas
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Resumen de pagos */}
        <Card
          sx={{
            mb: 3,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(yellowColor, 0.1)} 0%, ${alpha(yellowColor, 0.05)} 100%)`,
            border: `2px solid ${alpha(yellowColor, 0.3)}`,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Resumen de Pagos
            </Typography>

            <Stack spacing={1.5} mb={2}>
              {datosPagos.pagos.map((pago, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    background: alpha('#fff', isDark ? 0.05 : 0.5),
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {pago.estudiante}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pago.mes}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} color={yellowColor}>
                    Bs {pago.monto.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: '#000', opacity: 0.8 }}>
                TOTAL A PAGAR
              </Typography>
              <Typography variant="h3" fontWeight={700} color="#000" my={1}>
                Bs {datosPagos.totalGeneral.toFixed(2)}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                <CheckCircle sx={{ color: '#000', fontSize: 20 }} />
                <Typography variant="body2" color="#000" fontWeight={600}>
                  {datosPagos.pagos.length} cuotas de transporte
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Datos del pago */}
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

          <Grid size={{ xs: 12 }}>
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
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
            '&:hover': {
              background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
            },
          }}
        >
          {loading
            ? 'Procesando...'
            : `Confirmar Pago (Bs ${datosPagos.totalGeneral.toFixed(2)})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPagoTransporteMultiple;