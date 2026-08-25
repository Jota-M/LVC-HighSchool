// components/pagos/ModalPagoDistribuido.tsx - VERSIÓN RESTYLEADA (estilo ProductoFormDialog)
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
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

// ── pequeño helper visual: eyebrow de sección (ícono + etiqueta + regla) ─────
const SectionLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode; brand: string; borderField: string }> = ({
  icon, children, brand, borderField,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
    <Box sx={{ display: 'flex', color: alpha(brand, 0.85), '& svg': { fontSize: 15 } }}>{icon}</Box>
    <Typography
      sx={{
        fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', background: borderField }} />
  </Box>
);

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

  // ── tokens (idénticos a ProductoFormDialog) ──────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandSoft = isDark ? '#eab308' : '#01579b';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const green = '#10b981';
  const amber = '#f59e0b';
  const red = '#ef4444';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
      '&.Mui-disabled': { background: bgFieldAlt },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const [montoIngresado, setMontoIngresado] = useState('');
  const [distribucion, setDistribucion] = useState<DistribucionCalculada | null>(null);
  const [loadingDistribucion, setLoadingDistribucion] = useState(false);
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

  const totalMensualidades = useMemo(() => {
    return mensualidadesPendientes.reduce((sum, m) => {
      const saldo = parseFloat((m.saldo_pendiente ?? m.monto_final).toString());
      return sum + saldo;
    }, 0);
  }, [mensualidadesPendientes]);

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
        `Pago distribuido registrado: ${data.data.cantidad_pagos} cuota(s) por Bs ${data.data.monto_distribuido.toFixed(2)}`,
        { variant: 'success' }
      );

      const pagosFormateados = data.data.pagos.map((pago: any) => ({
        id: pago.id,
        codigo_pago: pago.codigo_pago,
        monto_pagado: pago.monto_pagado,
        nombres: estudianteNombre.split(' ')[0],
        apellidos: estudianteNombre.split(' ').slice(1).join(' '),
        mes_correspondiente: pago.mensualidad_info?.mes || 'N/A',
        numero_cuota: pago.mensualidad_info?.numero_cuota || 0,
      }));

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

  const handleReciboClose = () => {
    setReciboModalOpen(false);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
              : `0 32px 64px rgba(0,0,0,0.18)`,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '88vh',
          },
        }}
      >
        {/* ── HEADER (fijo) ── */}
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
            borderBottom: `1px solid ${borderField}`,
            background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
            flexShrink: 0,
          }}
        >
          <PaymentsRoundedIcon
            sx={{
              position: 'absolute', right: -14, top: -18, fontSize: 120,
              color: brand, opacity: isDark ? 0.05 : 0.06, transform: 'rotate(-12deg)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
                }}
              >
                Pago con distribución automática
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                    background: alpha(brand, 0.15),
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <PaymentsRoundedIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                    Registrar pago
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {estudianteNombre}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              onClick={handleClose}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                opacity: loading ? 0.4 : 1,
                transition: 'all 0.15s',
                '&:hover': loading ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY (único scroll) ── */}
        <DialogContent
          sx={{
            px: 3, py: 2.75,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(brand, 0.25),
              borderRadius: '8px',
              '&:hover': { background: alpha(brand, 0.4) },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(brand, 0.25)} transparent`,
          }}
        >
          <Stack spacing={2.5}>
            {/* ── Sección: monto ── */}
            <Box>
              <SectionLabel icon={<AttachMoneyRoundedIcon />} brand={brand} borderField={borderField}>
                Monto a pagar
              </SectionLabel>

              <Box sx={{ mt: 1.25 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto en Bolivianos"
                  value={montoIngresado}
                  onChange={(e) => setMontoIngresado(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 700 }}>
                        Bs
                      </Typography>
                    ),
                  }}
                  sx={{
                    ...fieldSx,
                    '& .MuiOutlinedInput-input': { fontSize: '1.15rem', fontWeight: 700 },
                  }}
                />

                <Box mt={1.25} display="flex" gap={0.75} flexWrap="wrap">
                  {mensualidadesPendientes.slice(0, 4).map((m) => {
                    const saldo = parseFloat((m.saldo_pendiente ?? m.monto_final).toString());
                    return (
                      <Box
                        key={m.id}
                        onClick={() => setMontoIngresado(saldo.toString())}
                        sx={{
                          px: 1.25, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
                          background: bgFieldAlt, border: `1px solid ${borderField}`,
                          '&:hover': { borderColor: alpha(brand, 0.5), color: brand },
                        }}
                      >
                        Bs {saldo.toFixed(2)}
                      </Box>
                    );
                  })}
                  <Box
                    onClick={handleSugerirCompleto}
                    sx={{
                      px: 1.25, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5,
                      background: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.3)}`, color: brand,
                      '&:hover': { background: alpha(brand, 0.18) },
                    }}
                  >
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
                    Todo: Bs {totalMensualidades.toFixed(2)}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ── Sección: distribución ── */}
            {loadingDistribucion ? (
              <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} py={3}>
                <CircularProgress size={18} sx={{ color: brand }} />
                <Typography variant="body2" color="text.secondary">
                  Calculando distribución...
                </Typography>
              </Box>
            ) : distribucion ? (
              <Box>
                <SectionLabel icon={<CalculateRoundedIcon />} brand={brand} borderField={borderField}>
                  Distribución automática
                </SectionLabel>

                <Stack spacing={1} sx={{ mt: 1.25 }}>
                  {distribucion.distribucion.map((item) => {
                    const color = item.es_pago_completo ? green : amber;
                    return (
                      <Box
                        key={item.mensualidad_id}
                        sx={{
                          p: 1.25, borderRadius: '12px',
                          background: bgField,
                          borderLeft: `3px solid ${color}`,
                          border: `1px solid ${borderField}`,
                          borderLeftWidth: '3px',
                          borderLeftColor: color,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Box display="flex" alignItems="center" gap={0.75}>
                              {item.es_pago_completo ? (
                                <CheckCircleRoundedIcon sx={{ color: green, fontSize: 16 }} />
                              ) : (
                                <WarningAmberRoundedIcon sx={{ color: amber, fontSize: 16 }} />
                              )}
                              <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'capitalize' }}>
                                {item.mes_correspondiente} · Cuota {item.numero_cuota}
                              </Typography>
                            </Box>
                            {item.es_pago_parcial && (
                              <Typography variant="caption" color="text.secondary" sx={{ pl: 2.9 }}>
                                Pago parcial · {item.porcentaje_pago.toFixed(1)}%
                              </Typography>
                            )}
                          </Box>

                          <Box textAlign="right">
                            <Typography variant="body2" fontWeight={800}>
                              Bs {item.monto_a_pagar.toFixed(2)}
                            </Typography>
                            {item.es_pago_parcial && (
                              <Typography variant="caption" color="text.secondary">
                                Restante: Bs {item.saldo_restante.toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: 0.75, height: 4, borderRadius: 2, overflow: 'hidden',
                            background: alpha(color, 0.12),
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%', width: `${item.porcentaje_pago}%`,
                              background: color, borderRadius: 2, transition: 'width 0.2s',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                {/* Resumen */}
                <Box
                  mt={1.5}
                  p={1.5}
                  sx={{
                    borderRadius: '12px',
                    background: bgFieldAlt,
                    border: `1px solid ${borderField}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.62rem', fontWeight: 700 }}>
                      Completas
                    </Typography>
                    <Typography variant="body1" fontWeight={800}>
                      {distribucion.mensualidades_completas}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.62rem', fontWeight: 700 }}>
                      Parciales
                    </Typography>
                    <Typography variant="body1" fontWeight={800}>
                      {distribucion.mensualidades_parciales}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.62rem', fontWeight: 700 }}>
                      Distribuido
                    </Typography>
                    <Typography variant="body1" fontWeight={800} sx={{ color: green }}>
                      Bs {distribucion.monto_distribuido.toFixed(2)}
                    </Typography>
                  </Box>
                  {distribucion.monto_sobrante > 0.01 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.62rem', fontWeight: 700 }}>
                        Sobrante
                      </Typography>
                      <Typography variant="body1" fontWeight={800} sx={{ color: amber }}>
                        Bs {distribucion.monto_sobrante.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Advertencias */}
                {distribucion.advertencias.length > 0 && (
                  <Box
                    mt={1.25}
                    p={1.25}
                    sx={{
                      borderRadius: '12px',
                      background: alpha(amber, 0.08),
                      border: `1px solid ${alpha(amber, 0.25)}`,
                    }}
                  >
                    {distribucion.advertencias.map((adv, i) => (
                      <Typography key={i} variant="caption" sx={{ display: 'block', color: amber, fontWeight: 600 }}>
                        • {adv}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}

            {/* ── Sección: datos de pago ── */}
            {distribucion && (
              <Box>
                <SectionLabel icon={<ReceiptLongRoundedIcon />} brand={brand} borderField={borderField}>
                  Datos del pago
                </SectionLabel>

                <Stack spacing={1.5} sx={{ mt: 1.25 }}>
                  <TextField
                    fullWidth
                    select
                    label="Método de pago"
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value as MetodoPago })}
                    size="small"
                    sx={fieldSx}
                  >
                    {METODOS_PAGO.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="N° Comprobante"
                    value={formData.numero_comprobante}
                    onChange={(e) => setFormData({ ...formData, numero_comprobante: e.target.value })}
                    size="small"
                    sx={fieldSx}
                  />

                  {formData.metodo_pago === 'transferencia' && (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField
                        fullWidth
                        label="Banco origen"
                        value={formData.banco_origen}
                        onChange={(e) => setFormData({ ...formData, banco_origen: e.target.value })}
                        size="small"
                        sx={fieldSx}
                      />
                      <TextField
                        fullWidth
                        label="N° Referencia"
                        value={formData.numero_referencia}
                        onChange={(e) => setFormData({ ...formData, numero_referencia: e.target.value })}
                        required
                        helperText="Requerido"
                        size="small"
                        sx={fieldSx}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.25, borderRadius: '12px', background: bgFieldAlt, border: `1px solid ${borderField}`,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>¿Entregó factura?</Typography>
                    <Switch
                      checked={formData.entrego_factura}
                      onChange={(e) => setFormData({ ...formData, entrego_factura: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: brand },
                      }}
                    />
                  </Box>

                  {formData.entrego_factura && (
                    <TextField
                      fullWidth
                      label="N° Factura"
                      value={formData.numero_factura}
                      onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                      size="small"
                      sx={fieldSx}
                    />
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Notas adicionales..."
                    size="small"
                    sx={fieldSx}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        {/* ── FOOTER (fijo) ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}`, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {distribucion ? `${distribucion.distribucion.length} cuota(s) afectada(s)` : ''}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !distribucion || !montoIngresado || parseFloat(montoIngresado) <= 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: green, color: '#fff',
              boxShadow: `0 4px 16px ${alpha(green, 0.4)}`,
              '&:hover': { background: '#059669', boxShadow: `0 6px 20px ${alpha(green, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.5, background: green, color: '#fff' },
            }}
          >
            {loading
              ? 'Procesando...'
              : `Confirmar pago${distribucion ? ` (Bs ${distribucion.monto_distribuido.toFixed(2)})` : ''}`}
          </Button>
        </Box>
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