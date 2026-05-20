// components/transporte/ModalPagoTransporteDistribuido.tsx
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
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  Stack,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Warning,
  AttachMoney,
  Calculate,
  Close,
  DirectionsBus,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { PagoTransporte, MetodoPago } from '@/types/transporte';

interface ModalPagoTransporteDistribuidoProps {
  open: boolean;
  onClose: () => void;
  asignacionId: number;
  estudianteNombre: string;
  pagosPendientes: PagoTransporte[];
  onSuccess: () => void;
}

interface DistribucionItem {
  pago_id: number;
  mes_correspondiente: string;
  saldo_pendiente: number;
  monto_a_pagar: number;
  saldo_restante: number;
  porcentaje_pago: number;
  es_pago_completo: boolean;
  es_pago_parcial: boolean;
}

interface DistribucionCalculada {
  monto_total: number;
  monto_distribuido: number;
  monto_sobrante: number;
  pagos_completos: number;
  pagos_parciales: number;
  distribucion: DistribucionItem[];
  advertencias: string[];
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const ModalPagoTransporteDistribuido: React.FC<ModalPagoTransporteDistribuidoProps> = ({
  open,
  onClose,
  asignacionId,
  estudianteNombre,
  pagosPendientes,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [montoIngresado, setMontoIngresado] = useState('');
  const [distribucion, setDistribucion] = useState<DistribucionCalculada | null>(null);
  const [loadingDistribucion, setLoadingDistribucion] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    metodo_pago: 'efectivo' as MetodoPago,
    numero_comprobante: '',
    banco_origen: '',
    numero_referencia: '',
    observaciones: '',
  });

  const yellowColor = isDark ? '#facc15' : '#f59e0b';

  // Calcular total de pagos pendientes
  const totalPendiente = React.useMemo(() => {
    return pagosPendientes.reduce((sum, p) => {
      const saldo = parseFloat((p.saldo_pendiente ?? p.monto_final).toString());
      return sum + saldo;
    }, 0);
  }, [pagosPendientes]);

  // Calcular distribución automáticamente
  useEffect(() => {
    const calcularDistribucion = async () => {
      if (!montoIngresado || parseFloat(montoIngresado) <= 0) {
        setDistribucion(null);
        return;
      }

      setLoadingDistribucion(true);
      try {
        const { data } = await api.post('/api/pago-transporte/calcular-distribucion', {
          asignacion_id: asignacionId,
          monto_total: parseFloat(montoIngresado),
        });

        setDistribucion(data.data);
      } catch (error: any) {
        console.error('Error al calcular distribución:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Error al calcular distribución',
          { variant: 'error' }
        );
        setDistribucion(null);
      } finally {
        setLoadingDistribucion(false);
      }
    };

    const timeoutId = setTimeout(calcularDistribucion, 500);
    return () => clearTimeout(timeoutId);
  }, [montoIngresado, asignacionId, enqueueSnackbar]);

  const handleSugerirCompleto = () => {
    setMontoIngresado(totalPendiente.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!distribucion || distribucion.distribucion.length === 0) {
      enqueueSnackbar('No hay distribución calculada', { variant: 'warning' });
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
      const { data } = await api.post('/api/pago-transporte/distribuido', {
        asignacion_id: asignacionId,
        monto_total: parseFloat(montoIngresado),
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        banco_origen: formData.banco_origen || undefined,
        numero_referencia: formData.numero_referencia || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar(
        `✅ Pago distribuido: ${data.data.cantidad_pagos} cuota(s) por Bs ${data.data.monto_distribuido.toFixed(2)}`,
        { variant: 'success' }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al procesar el pago',
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
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calculate sx={{ color: '#000', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Pago Distribuido de Transporte
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {estudianteNombre}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Monto a Pagar */}
          <Grid size={{xs:12}}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `2px solid ${yellowColor}`,
                background: alpha(yellowColor, 0.05),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <AttachMoney sx={{ color: yellowColor }} />
                  <Typography variant="h6" fontWeight={700}>
                    Monto a Pagar
                  </Typography>
                  <Box flex={1} />
                  <Tooltip title="Pagar todas las cuotas">
                    <IconButton size="small" onClick={handleSugerirCompleto}>
                      <DirectionsBus fontSize="small" sx={{ color: yellowColor }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="Monto en Bolivianos"
                  value={montoIngresado}
                  onChange={(e) => setMontoIngresado(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Typography
                        variant="h6"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      >
                        Bs
                      </Typography>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    },
                  }}
                />

                <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                  {pagosPendientes.slice(0, 4).map((p) => {
                    const saldo = parseFloat(
                      (p.saldo_pendiente ?? p.monto_final).toString()
                    );
                    return (
                      <Chip
                        key={p.id}
                        label={`Bs ${saldo.toFixed(2)}`}
                        onClick={() => setMontoIngresado(saldo.toString())}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                  <Chip
                    label={`Todo: Bs ${totalPendiente.toFixed(2)}`}
                    onClick={handleSugerirCompleto}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: yellowColor,
                      color: '#000',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución */}
          {loadingDistribucion ? (
            <Grid size={{xs:12}}>
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Calculando distribución...
                </Typography>
              </Box>
            </Grid>
          ) : distribucion ? (
            <Grid size={{xs:12}}>
              <Card
                sx={{
                  borderRadius: '16px',
                  background: alpha('#10b981', 0.05),
                  border: `2px solid ${alpha('#10b981', 0.3)}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Calculate sx={{ color: '#10b981' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Distribución Automática
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {distribucion.distribucion.map((item, index) => (
                      <Box key={item.pago_id}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="start"
                          mb={1}
                        >
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              {item.es_pago_completo ? (
                                <CheckCircle
                                  sx={{ color: '#10b981', fontSize: 20 }}
                                />
                              ) : (
                                <Warning
                                  sx={{ color: '#f59e0b', fontSize: 20 }}
                                />
                              )}
                              <Typography
                                variant="body1"
                                fontWeight={700}
                                sx={{ textTransform: 'capitalize' }}
                              >
                                {item.mes_correspondiente}
                              </Typography>
                            </Box>
                            {item.es_pago_parcial && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Pago parcial - {item.porcentaje_pago.toFixed(1)}%
                              </Typography>
                            )}
                          </Box>

                          <Box textAlign="right">
                            <Typography variant="h6" fontWeight={700}>
                              Bs {item.monto_a_pagar.toFixed(2)}
                            </Typography>
                            {item.es_pago_parcial && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Restante: Bs {item.saldo_restante.toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={item.porcentaje_pago}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(
                              item.es_pago_completo ? '#10b981' : '#f59e0b',
                              0.1
                            ),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: item.es_pago_completo
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                            },
                          }}
                        />

                        {index < distribucion.distribucion.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Resumen */}
                  <Box
                    mt={3}
                    p={2}
                    sx={{
                      borderRadius: '12px',
                      background: alpha('#10b981', 0.1),
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{xs:6}}>
                        <Typography variant="caption" color="text.secondary">
                          Pagos Completos
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {distribucion.pagos_completos}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:6}}>
                        <Typography variant="caption" color="text.secondary">
                          Pagos Parciales
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {distribucion.pagos_parciales}
                        </Typography>
                      </Grid>
                      <Grid size={{xs:12}}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid size={{xs:6}}>
                        <Typography variant="caption" color="text.secondary">
                          Total Distribuido
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="#10b981"
                        >
                          Bs {distribucion.monto_distribuido.toFixed(2)}
                        </Typography>
                      </Grid>
                      {distribucion.monto_sobrante > 0.01 && (
                        <Grid size={{xs:6}}>
                          <Typography variant="caption" color="text.secondary">
                            Sobrante
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="#f59e0b"
                          >
                            Bs {distribucion.monto_sobrante.toFixed(2)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {distribucion.advertencias.length > 0 && (
                    <Alert
                      severity="warning"
                      sx={{ mt: 2, borderRadius: '12px' }}
                    >
                      {distribucion.advertencias.map((adv, i) => (
                        <Typography key={i} variant="body2">
                          • {adv}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ) : null}

          {/* Datos de Pago */}
          {distribucion && (
            <>
              <Grid size={{xs:12}}>
                <Divider>
                  <Chip label="Datos del Pago" />
                </Divider>
              </Grid>

              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  select
                  label="Método de Pago"
                  value={formData.metodo_pago}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metodo_pago: e.target.value as MetodoPago,
                    })
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  {METODOS_PAGO.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="N° Comprobante"
                  value={formData.numero_comprobante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numero_comprobante: e.target.value,
                    })
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {formData.metodo_pago === 'transferencia' && (
                <>
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth
                      label="Banco Origen"
                      value={formData.banco_origen}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          banco_origen: e.target.value,
                        })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  </Grid>
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth
                      label="N° Referencia"
                      value={formData.numero_referencia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_referencia: e.target.value,
                        })
                      }
                      required
                      helperText="Requerido para transferencias"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{xs:12}}>
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </>
          )}
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

        <Box flex={1} />

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !distribucion ||
            !montoIngresado ||
            parseFloat(montoIngresado) <= 0
          }
          startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            background: `linear-gradient(135deg, ${yellowColor} 0%, #d97706 100%)`,
            color: '#000',
          }}
        >
          {loading
            ? 'Procesando...'
            : `Confirmar Pago${
                distribucion
                  ? ` (Bs ${distribucion.monto_distribuido.toFixed(2)})`
                  : ''
              }`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPagoTransporteDistribuido;