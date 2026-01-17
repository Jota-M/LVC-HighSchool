// components/pagos/ModalPagoDistribuido.tsx - VERSIÓN CORREGIDA
'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  AutoAwesome,
  Close,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { Mensualidad, MetodoPago } from '@/types/pagos';
import { ModalGenerarRecibo } from './ModalGenerarRecibo';

interface ModalPagoDistribuidoProps {
  open: boolean;
  onClose: () => void;
  matriculaId: number;
  estudianteNombre: string;
  mensualidadesPendientes: Mensualidad[];
  onSuccess: () => void;
}

interface DistribucionItem {
  mensualidad_id: number;
  numero_cuota: number;
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
  mensualidades_completas: number;
  mensualidades_parciales: number;
  distribucion: DistribucionItem[];
  advertencias: string[];
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export const ModalPagoDistribuido: React.FC<ModalPagoDistribuidoProps> = ({
  open,
  onClose,
  matriculaId,
  estudianteNombre,
  mensualidadesPendientes,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [montoIngresado, setMontoIngresado] = useState('');
  const [distribucion, setDistribucion] = useState<DistribucionCalculada | null>(null);
  const [loadingDistribucion, setLoadingDistribucion] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 🔧 Estados para el recibo
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

  // Calcular total de todas las mensualidades pendientes
  const totalMensualidades = useMemo(() => {
    return mensualidadesPendientes.reduce((sum, m) => {
      const saldo = parseFloat((m.saldo_pendiente ?? m.monto_final).toString());
      return sum + saldo;
    }, 0);
  }, [mensualidadesPendientes]);

  // Calcular distribución automáticamente cuando cambia el monto
  useEffect(() => {
    const calcularDistribucion = async () => {
      if (!montoIngresado || parseFloat(montoIngresado) <= 0) {
        setDistribucion(null);
        return;
      }

      setLoadingDistribucion(true);
      try {
        const { data } = await api.post('/api/pago-distribuido/calcular', {
          matricula_id: matriculaId,
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

    // Debounce de 500ms
    const timeoutId = setTimeout(calcularDistribucion, 500);
    return () => clearTimeout(timeoutId);
  }, [montoIngresado, matriculaId, enqueueSnackbar]);

  const handleSugerirCompleto = () => {
    setMontoIngresado(totalMensualidades.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!distribucion || distribucion.distribucion.length === 0) {
      enqueueSnackbar('No hay distribución calculada', { variant: 'warning' });
      return;
    }

    // Validaciones
    if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
      enqueueSnackbar('Número de referencia requerido para transferencias', {
        variant: 'warning',
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/api/pago-distribuido', {
        matricula_id: matriculaId,
        monto_total: parseFloat(montoIngresado),
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        banco_origen: formData.banco_origen || undefined,
        numero_referencia: formData.numero_referencia || undefined,
        entrego_factura: formData.entrego_factura,
        numero_factura: formData.numero_factura || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar(
        `✅ Pago distribuido registrado: ${data.data.cantidad_pagos} cuota(s) por Bs ${data.data.monto_distribuido.toFixed(2)}`,
        { variant: 'success' }
      );

      // 🔧 CORRECCIÓN: Formatear los pagos para el recibo
      const pagosFormateados = data.data.pagos.map((pago: any) => ({
        id: pago.id,
        codigo_pago: pago.codigo_pago,
        monto_pagado: pago.monto_pagado,
        nombres: estudianteNombre.split(' ')[0], // Primer palabra como nombre
        apellidos: estudianteNombre.split(' ').slice(1).join(' '), // Resto como apellidos
        mes_correspondiente: pago.mensualidad_info?.mes || 'N/A',
        numero_cuota: pago.mensualidad_info?.numero_cuota || 0,
      }));

      // 🔧 Abrir modal de recibo
      setPagosParaRecibo(pagosFormateados);
      setReciboModalOpen(true);

      // ⚠️ NO cerrar el modal principal aún
      
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

  // 🔧 Handler para cuando se cierra el modal de recibo
  const handleReciboClose = () => {
    setReciboModalOpen(false);
    onSuccess(); // Refrescar datos
    onClose(); // Cerrar modal de pago
  };

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
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Payment sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Pago con Distribución Automática
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
                  border: `2px solid ${isDark ? '#facc15' : '#0288d1'}`,
                  background: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <AttachMoney sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Monto a Pagar
                    </Typography>
                    <Box flex={1} />
                    <Tooltip title="Pagar todas las mensualidades">
                      <IconButton size="small" onClick={handleSugerirCompleto}>
                        <AutoAwesome fontSize="small" />
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
                    {mensualidadesPendientes.slice(0, 4).map((m) => {
                      const saldo = parseFloat(
                        (m.saldo_pendiente ?? m.monto_final).toString()
                      );
                      return (
                        <Chip
                          key={m.id}
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
                      label={`Todo: Bs ${totalMensualidades.toFixed(2)}`}
                      onClick={handleSugerirCompleto}
                      color="primary"
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                        <Box key={item.mensualidad_id}>
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
                                  {item.mes_correspondiente} (Cuota{' '}
                                  {item.numero_cuota})
                                </Typography>
                              </Box>
                              {item.es_pago_parcial && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Pago parcial -{' '}
                                  {item.porcentaje_pago.toFixed(1)}%
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
                            Mensualidades Completas
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {distribucion.mensualidades_completas}
                          </Typography>
                        </Grid>
                        <Grid size={{xs:6}}>
                          <Typography variant="caption" color="text.secondary">
                            Pagos Parciales
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {distribucion.mensualidades_parciales}
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

                    {/* Advertencias */}
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.entrego_factura}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            entrego_factura: e.target.checked,
                          })
                        }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_factura: e.target.value,
                        })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  </Grid>
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
              background: isDark
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
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

      {/* 🔧 Modal de Recibo */}
      <ModalGenerarRecibo
        open={reciboModalOpen}
        onClose={handleReciboClose}
        pagos={pagosParaRecibo}
        onSuccess={handleReciboClose}
      />
    </>
  );
};