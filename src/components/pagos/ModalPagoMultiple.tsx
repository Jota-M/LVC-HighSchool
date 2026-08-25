// components/pagos/ModalPagoMultipleCompleto.tsx - VERSIÓN RESTYLEADA (estilo ProductoFormDialog)
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Switch,
  useTheme,
  alpha,
  CircularProgress,
  Stack,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useSnackbar } from 'notistack';
import pagosService from '@/services/pagos';
import type {
  EstudianteConMensualidades,
  MetodoPago
} from '@/types/pagos';
import { ResumenPagoVisual } from './ResumenPagoVisual';
import { ModalGenerarRecibo } from './ModalGenerarRecibo';

interface ModalPagoMultipleCompletoProps {
  open: boolean;
  onClose: () => void;
  estudiantes: EstudianteConMensualidades[];
  onSuccess: () => void;
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

const STEPS = ['Resumen', 'Datos de pago', 'Confirmación'];

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

export const ModalPagoMultiple: React.FC<ModalPagoMultipleCompletoProps> = ({
  open,
  onClose,
  estudiantes,
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

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    metodo_pago: 'efectivo' as MetodoPago,
    numero_comprobante: '',
    banco_origen: '',
    numero_referencia: '',
    entrego_factura: false,
    numero_factura: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);

  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [pagosParaRecibo, setPagosParaRecibo] = useState<any[]>([]);

  const totalGeneral = estudiantes.reduce(
    (sum, est) => sum + est.mensualidades.reduce((s, m) => s + m.saldo_pendiente, 0),
    0
  );

  const totalMensualidades = estudiantes.reduce(
    (sum, est) => sum + est.mensualidades.length,
    0
  );

  const handleNext = () => {
    if (activeStep === 1) {
      if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
        enqueueSnackbar('Número de referencia requerido para transferencias', {
          variant: 'warning',
        });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const mensualidadesArray: { mensualidad_id: number; monto_pagado: number; }[] = [];

      estudiantes.forEach(est => {
        est.mensualidades.forEach(mens => {
          mensualidadesArray.push({
            mensualidad_id: mens.mensualidad_id,
            monto_pagado: mens.saldo_pendiente
          });
        });
      });

      const response = await pagosService.registrarPagoMultiple({
        mensualidades: mensualidadesArray,
        metodo_pago: formData.metodo_pago,
        numero_comprobante: formData.numero_comprobante || undefined,
        banco_origen: formData.banco_origen || undefined,
        numero_referencia: formData.numero_referencia || undefined,
        entrego_factura: formData.entrego_factura,
        numero_factura: formData.numero_factura || undefined,
        observaciones: formData.observaciones || undefined,
      });

      enqueueSnackbar(
        `${totalMensualidades} pagos registrados por Bs ${totalGeneral.toFixed(2)}`,
        { variant: 'success' }
      );

      const pagosFormateados = response.data.pagos.map(pago => ({
        id: pago.pago_id,
        codigo_pago: pago.codigo_pago,
        monto_pagado: pago.monto_pagado,
        nombres: pago.estudiante.split(' ')[0],
        apellidos: pago.estudiante.split(' ').slice(1).join(' '),
        mes_correspondiente: pago.mes,
        numero_cuota: parseInt(pago.mes.match(/\d+/)?.[0] || '0'),
      }));

      setPagosParaRecibo(pagosFormateados);
      setReciboModalOpen(true);
      // ⚠️ NO cerrar el modal principal aún, esperar a que se genere el recibo
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

  const handleReciboClose = () => {
    setReciboModalOpen(false);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const estudiantesFormateados = estudiantes.map(est => ({
    estudiante_id: est.estudiante_id,
    estudiante_codigo: est.estudiante_codigo,
    nombres: est.nombres,
    apellidos: est.apellidos,
    grado: est.grado,
    paralelo: est.paralelo,
    mensualidades: est.mensualidades.map(m => ({
      mensualidad_id: m.mensualidad_id,
      numero_cuota: m.numero_cuota,
      mes_correspondiente: m.mes_correspondiente,
      monto_pagado: m.saldo_pendiente,
    })),
  }));

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <SectionLabel icon={<ReceiptLongRoundedIcon />} brand={brand} borderField={borderField}>
              Resumen del pago múltiple
            </SectionLabel>
            <Box sx={{ mt: 1.25 }}>
              <ResumenPagoVisual
                estudiantes={estudiantesFormateados}
                metodo_pago={formData.metodo_pago}
                numero_comprobante={formData.numero_comprobante}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <SectionLabel icon={<PaymentsRoundedIcon />} brand={brand} borderField={borderField}>
              Datos del pago
            </SectionLabel>

            <Stack spacing={1.5} sx={{ mt: 1.25 }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  select
                  label="Método de pago"
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value as MetodoPago })}
                  required
                  size="small"
                  sx={fieldSx}
                >
                  {METODOS_PAGO.map(m => (
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
              </Box>

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
                    helperText="Requerido para transferencias"
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
                rows={3}
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales sobre el pago..."
                size="small"
                sx={fieldSx}
              />
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box textAlign="center" mb={2.5}>
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: alpha(green, 0.12), border: `1px solid ${alpha(green, 0.3)}`,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 30, color: green }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }} gutterBottom>
                Confirmar pago múltiple
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revisá los datos antes de confirmar el pago
              </Typography>
            </Box>

            <SectionLabel icon={<ReceiptLongRoundedIcon />} brand={brand} borderField={borderField}>
              Resumen
            </SectionLabel>
            <Box sx={{ mt: 1.25 }}>
              <ResumenPagoVisual
                estudiantes={estudiantesFormateados}
                metodo_pago={formData.metodo_pago}
                numero_comprobante={formData.numero_comprobante}
              />
            </Box>

            <Box
              sx={{
                mt: 2, p: 1.5, borderRadius: '12px', display: 'flex', gap: 1,
                background: alpha(amber, 0.08), border: `1px solid ${alpha(amber, 0.25)}`,
              }}
            >
              <WarningAmberRoundedIcon sx={{ color: amber, fontSize: 20, flexShrink: 0, mt: '1px' }} />
              <Typography variant="caption" sx={{ color: amber, fontWeight: 600 }}>
                Esta acción registrará {totalMensualidades} pagos por un total de Bs {totalGeneral.toFixed(2)}.
                Una vez confirmado, no se podrá deshacer.
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
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
        {/* ── HEADER (fijo, incluye el stepper) ── */}
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', mb: 2.25 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
                }}
              >
                {estudiantes.length} estudiante(s) · {totalMensualidades} cuota(s)
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
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Pago múltiple
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
                '&:hover': loading ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* ── Stepper custom, flat ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {STEPS.map((label, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              const stateColor = isCompleted || isActive ? brand : borderField;
              return (
                <React.Fragment key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 800,
                        background: isCompleted ? brand : isActive ? alpha(brand, 0.15) : bgFieldAlt,
                        border: `1.5px solid ${stateColor}`,
                        color: isCompleted ? (isDark ? '#000' : '#fff') : isActive ? brand : 'text.secondary',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : index + 1}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.75rem', fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                  {index < STEPS.length - 1 && (
                    <Box sx={{ flex: 1, height: '1.5px', mx: 1.25, background: index < activeStep ? brand : borderField, transition: 'background 0.15s' }} />
                  )}
                </React.Fragment>
              );
            })}
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
          {renderStepContent()}
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

          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              startIcon={<NavigateBeforeRoundedIcon />}
              sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
            >
              Atrás
            </Button>
          )}

          {activeStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<NavigateNextRoundedIcon />}
              sx={{
                borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                background: brand, color: isDark ? '#000' : '#fff',
                boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              }}
            >
              Siguiente
            </Button>
          ) : (
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
              {loading ? 'Procesando...' : `Confirmar pago (Bs ${totalGeneral.toFixed(2)})`}
            </Button>
          )}
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