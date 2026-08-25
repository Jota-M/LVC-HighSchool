// components/pagos/ModalPagoAnual.tsx - SISTEMA 10 MESES (VERSIÓN RESTYLEADA)
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  alpha,
  MenuItem,
  Switch,
  CircularProgress,
  Stack,
} from '@mui/material';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';
import type { Mensualidad, MetodoPago } from '@/types/pagos';
import { ModalGenerarRecibo } from './ModalGenerarRecibo';

interface ModalPagoAnualProps {
  open: boolean;
  onClose: () => void;
  matriculaId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  mensualidades: Mensualidad[];
  onSuccess: () => void;
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

export const ModalPagoAnual: React.FC<ModalPagoAnualProps> = ({
  open,
  onClose,
  matriculaId,
  estudianteNombre,
  estudianteCodigo,
  mensualidades,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  // ── tokens (idénticos a ProductoFormDialog) ──────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const green = '#10b981';
  const amber = '#f59e0b';
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
        `Pago anual registrado. Ahorro: Bs ${calculos.montoDescuento.toFixed(2)}`,
        { variant: 'success' }
      );

      const pagoData = data.data.pago;

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
        numero_cuota: null,
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

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  // ── Caso: no hay suficientes mensualidades pendientes ────────────────────
  if (!calculos) {
    const disponibles = mensualidades.filter(m => m.estado === 'pendiente' || m.estado === 'vencido').length;
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '88vh',
          },
        }}
      >
        <Box
          sx={{
            px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${borderField}`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Pago anual no disponible</Typography>
          <Box
            onClick={onClose}
            sx={{
              width: 30, height: 30, borderRadius: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`, color: 'text.secondary',
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              p: 1.75, borderRadius: '12px', display: 'flex', gap: 1.25,
              background: alpha(amber, 0.08), border: `1px solid ${alpha(amber, 0.25)}`,
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: amber, fontSize: 20, flexShrink: 0, mt: '1px' }} />
            <Typography variant="body2" sx={{ color: amber, fontWeight: 600 }}>
              Se necesitan al menos 10 mensualidades pendientes para el pago anual.
              Actualmente hay {disponibles} disponibles.
            </Typography>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cerrar
          </Button>
        </Box>
      </Dialog>
    );
  }

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
            border: `1.5px solid ${alpha(green, 0.3)}`,
            boxShadow: isDark
              ? `0 0 0 1px rgba(16,185,129,0.08), 0 32px 64px rgba(0,0,0,0.8)`
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
            background: `linear-gradient(135deg, ${alpha(green, 0.1)} 0%, transparent 65%)`,
            flexShrink: 0,
          }}
        >
          <LocalOfferRoundedIcon
            sx={{
              position: 'absolute', right: -14, top: -18, fontSize: 120,
              color: green, opacity: isDark ? 0.06 : 0.07, transform: 'rotate(-12deg)',
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.4 }}>
                <StarsRoundedIcon sx={{ fontSize: 13, color: green }} />
                <Typography
                  sx={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: green,
                  }}
                >
                  Sistema de 10 meses · 1 mes gratis
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                    background: alpha(green, 0.15),
                    border: `1px solid ${alpha(green, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <LocalOfferRoundedIcon sx={{ color: green, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Pago anual completo
                </Typography>
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
                '&:hover': loading ? {} : { background: alpha(green, 0.12), borderColor: alpha(green, 0.4), color: green },
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
              background: alpha(green, 0.25),
              borderRadius: '8px',
              '&:hover': { background: alpha(green, 0.4) },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(green, 0.25)} transparent`,
          }}
        >
          <Stack spacing={2.5}>
            {/* ── Sección: estudiante + desglose ── */}
            <Box>
              <SectionLabel icon={<CalendarMonthRoundedIcon />} brand={green} borderField={borderField}>
                Estudiante
              </SectionLabel>
              <Box
                sx={{
                  mt: 1.25, p: 1.5, borderRadius: '12px',
                  background: bgFieldAlt, border: `1px solid ${borderField}`,
                }}
              >
                <Typography variant="body1" fontWeight={800}>{estudianteNombre}</Typography>
                <Typography variant="caption" color="text.secondary">Código: {estudianteCodigo}</Typography>
              </Box>
            </Box>

            <Box>
              <SectionLabel icon={<ReceiptLongRoundedIcon />} brand={green} borderField={borderField}>
                Desglose
              </SectionLabel>

              <Stack spacing={1} sx={{ mt: 1.25 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Mensualidades a pagar</Typography>
                  <Box
                    sx={{
                      px: 1.1, py: 0.35, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                      background: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.3)}`, color: brand,
                    }}
                  >
                    {calculos.cantidadMeses} meses (Feb - Nov)
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 1.5, borderRadius: '12px', background: bgFieldAlt, border: `1px solid ${borderField}`,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1.25}>
                    <Typography variant="body2" color="text.secondary">Total sin descuento</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      Bs {calculos.totalSinDescuento.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1.25, borderRadius: '10px',
                      background: alpha(green, 0.1),
                      borderLeft: `3px solid ${green}`,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDownRoundedIcon sx={{ color: green, fontSize: 18 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={800} sx={{ color: green }}>
                          Descuento ({calculos.porcentajeDescuento}%)
                        </Typography>
                        <Typography variant="caption" sx={{ color: green }}>
                          ≈ {calculos.mesesGratis.toFixed(1)} mes gratis
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight={800} sx={{ color: green }}>
                      - Bs {calculos.montoDescuento.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Total a pagar — flat, sin gradiente, con borde de acento */}
                <Box
                  sx={{
                    p: 2.25, borderRadius: '14px', textAlign: 'center',
                    background: alpha(green, 0.08),
                    border: `1.5px solid ${alpha(green, 0.35)}`,
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Total a pagar
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: green, lineHeight: 1.2, my: 0.5 }}>
                    Bs {calculos.totalAPagar.toFixed(2)}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.75}>
                    <CheckCircleRoundedIcon sx={{ color: green, fontSize: 16 }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: green }}>
                      10 meses de educación
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Mensaje de ahorro */}
            <Box
              sx={{
                p: 1.5, borderRadius: '12px', display: 'flex', gap: 1.25,
                background: alpha(green, 0.06), border: `1px solid ${alpha(green, 0.2)}`,
              }}
            >
              <StarsRoundedIcon sx={{ color: green, fontSize: 18, flexShrink: 0, mt: '1px' }} />
              <Box>
                <Typography variant="body2" fontWeight={800} sx={{ color: green }}>
                  Excelente decisión
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Al pagar el año completo, ahorrás Bs {calculos.montoDescuento.toFixed(2)}. Es como pagar
                  solo 9 meses y recibir el 10° mes completamente gratis.
                </Typography>
              </Box>
            </Box>

            {/* ── Sección: datos de pago ── */}
            <Box>
              <SectionLabel icon={<PaymentsRoundedIcon />} brand={brand} borderField={borderField}>
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
                  helperText="Opcional"
                  size="small"
                  sx={fieldSx}
                />

                {formData.metodo_pago === 'transferencia' && (
                  <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
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
          </Stack>
        </DialogContent>

        {/* ── FOOTER (fijo) ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}`, flexShrink: 0 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
          >
            Cancelar
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: green, color: '#fff',
              boxShadow: `0 4px 16px ${alpha(green, 0.4)}`,
              '&:hover': { background: '#059669', boxShadow: `0 6px 20px ${alpha(green, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.5, background: green, color: '#fff' },
            }}
          >
            {loading ? 'Procesando...' : `Confirmar pago (Bs ${calculos.totalAPagar.toFixed(2)})`}
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