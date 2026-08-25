// components/pagos/ModalGenerarRecibo.tsx - CON SOPORTE PAGO ANUAL (VERSIÓN RESTYLEADA)
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  Stack,
  useTheme,
  alpha,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { useSnackbar } from 'notistack';
import api from '@/lib/api';

interface Pago {
  id: number;
  codigo_pago: string;
  fecha_pago?: string;
  monto_pagado: number | string;
  metodo_pago?: string;
  numero_comprobante?: string | null;
  estudiante_codigo?: string;
  nombres: string;
  apellidos?: string;
  mes_correspondiente?: string;
  numero_cuota?: number | null;
}

interface ModalGenerarReciboProps {
  open: boolean;
  onClose: () => void;
  pagos: Pago[];
  onSuccess?: () => void;
}

interface FormData {
  nombre_entrega: string;
  ci_entrega: string;
  quien_recibe: 'patricia' | 'oswaldo';
  preview: boolean;
}

const PERSONAS_QUE_RECIBEN = [
  { value: 'patricia', label: 'Patricia Ramírez Villca', ci: '5070770' },
  { value: 'oswaldo', label: 'Oswaldo Esteban Bohorquez Velasco', ci: '5071886' },
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

export const ModalGenerarRecibo: React.FC<ModalGenerarReciboProps> = ({
  open,
  onClose,
  pagos,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  // ── tokens (idénticos al resto de modales de pagos) ──────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const green = '#10b981';
  const red = '#ef4444';
  const R = '14px';

  const [formData, setFormData] = useState<FormData>({
    nombre_entrega: '',
    ci_entrega: '',
    quien_recibe: 'patricia',
    preview: false,
  });

  const totalMonto = pagos.reduce((sum, p) =>
    sum + parseFloat(p.monto_pagado.toString() || '0'), 0
  );

  const estudiante = pagos[0];

  const esPagoAnual = pagos.length === 1 &&
    (pagos[0].mes_correspondiente === 'Pago Anual Completo (10 meses)' ||
      pagos[0].numero_cuota === null);

  // color de acento del modal: verde para anual, rojo (recibo/PDF) para el resto
  const accent = esPagoAnual ? green : red;

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

  const personaSeleccionada = PERSONAS_QUE_RECIBEN.find(p => p.value === formData.quien_recibe);

  const handleSubmit = async () => {
    if (!formData.nombre_entrega.trim()) {
      enqueueSnackbar('Debe ingresar el nombre de quien entrega', { variant: 'warning' });
      return;
    }

    if (!formData.ci_entrega.trim()) {
      enqueueSnackbar('Debe ingresar la C.I. de quien entrega', { variant: 'warning' });
      return;
    }

    setLoading(true);

    try {
      let response;

      if (esPagoAnual) {
        console.log('📄 Generando PDF de pago anual con datos directos');

        response = await api.post(
          '/api/pago-mensualidad/pdf-directo',
          {
            pagos: pagos.map(pago => ({
              id: pago.id,
              codigo_pago: pago.codigo_pago,
              fecha_pago: pago.fecha_pago || new Date().toISOString(),
              monto_pagado: parseFloat(pago.monto_pagado.toString()),
              metodo_pago: pago.metodo_pago || 'efectivo',
              numero_comprobante: pago.numero_comprobante || null,
              estudiante_codigo: pago.estudiante_codigo || '',
              nombres: pago.nombres,
              apellidos: pago.apellidos || '',
              mes_correspondiente: pago.mes_correspondiente || '',
              numero_cuota: pago.numero_cuota,
            })),
            nombre_entrega: formData.nombre_entrega,
            ci_entrega: formData.ci_entrega,
            quien_recibe: formData.quien_recibe,
            preview: formData.preview,
          },
          {
            responseType: 'blob',
          }
        );
      } else {
        console.log('📄 Generando PDF de pagos regulares por IDs');

        response = await api.post(
          '/api/pago-mensualidad/pdf-multiple',
          {
            pago_ids: pagos.map(p => p.id),
            nombre_entrega: formData.nombre_entrega,
            ci_entrega: formData.ci_entrega,
            quien_recibe: formData.quien_recibe,
            preview: formData.preview,
          },
          {
            responseType: 'blob',
          }
        );
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (formData.preview) {
        window.open(url, '_blank');
        enqueueSnackbar('Recibo abierto en nueva pestaña', { variant: 'success' });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Recibo_${estudiante.codigo_pago}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        enqueueSnackbar('Recibo descargado exitosamente', { variant: 'success' });
      }

      window.URL.revokeObjectURL(url);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al generar recibo:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error al generar el recibo',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
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
          border: `1.5px solid ${alpha(accent, 0.3)}`,
          boxShadow: isDark
            ? `0 0 0 1px ${alpha(accent, 0.08)}, 0 32px 64px rgba(0,0,0,0.8)`
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
          background: `linear-gradient(135deg, ${alpha(accent, 0.1)} 0%, transparent 65%)`,
          flexShrink: 0,
        }}
      >
        <PictureAsPdfRoundedIcon
          sx={{
            position: 'absolute', right: -14, top: -18, fontSize: 120,
            color: accent, opacity: isDark ? 0.06 : 0.07, transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(accent, 0.85), mb: 0.4,
              }}
            >
              {esPagoAnual ? 'Recibo · pago anual' : 'Generar recibo de pago'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(accent, 0.15),
                  border: `1px solid ${alpha(accent, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <PictureAsPdfRoundedIcon sx={{ color: accent, fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                  {esPagoAnual ? 'Recibo pago anual' : 'Generar recibo'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estudiante?.nombres} {estudiante?.apellidos}
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
              '&:hover': loading ? {} : { background: alpha(accent, 0.12), borderColor: alpha(accent, 0.4), color: accent },
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
            background: alpha(accent, 0.25),
            borderRadius: '8px',
            '&:hover': { background: alpha(accent, 0.4) },
          },
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(accent, 0.25)} transparent`,
        }}
      >
        <Stack spacing={2.5}>
          {/* ── Resumen del pago ── */}
          <Box>
            <SectionLabel icon={esPagoAnual ? <StarsRoundedIcon /> : <ReceiptLongRoundedIcon />} brand={accent} borderField={borderField}>
              {esPagoAnual ? 'Pago anual completo' : 'Resumen del pago'}
            </SectionLabel>

            <Box
              sx={{
                mt: 1.25, p: 1.5, borderRadius: '12px',
                background: alpha(accent, 0.06),
                border: `1px solid ${alpha(accent, 0.2)}`,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {esPagoAnual ? 'Meses cubiertos' : 'Mensualidades'}
                </Typography>
                <Box
                  sx={{
                    px: 1.1, py: 0.35, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                    background: alpha(accent, 0.15), border: `1px solid ${alpha(accent, 0.3)}`, color: accent,
                  }}
                >
                  {esPagoAnual ? '10 meses (Feb - Nov)' : `${pagos.length} cuota(s)`}
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" color="text.secondary">Monto total</Typography>
                <Typography variant="body1" fontWeight={800} sx={{ color: accent }}>
                  Bs {totalMonto.toFixed(2)}
                </Typography>
              </Box>

              {esPagoAnual && (
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.75}>
                  <Typography variant="caption" color="text.secondary">Descuento aplicado</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: accent }}>
                    10% (1 mes gratis)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Lista de mensualidades incluidas */}
            {pagos.length > 1 && !esPagoAnual && (
              <Box mt={1.25} display="flex" flexWrap="wrap" gap={0.75}>
                {pagos.map((pago) => (
                  <Box
                    key={pago.id}
                    sx={{
                      px: 1.1, py: 0.4, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                      color: 'text.secondary', background: bgFieldAlt, border: `1px solid ${borderField}`,
                    }}
                  >
                    {pago.mes_correspondiente
                      ? `${pago.mes_correspondiente} (${pago.numero_cuota})`
                      : `Pago ${pago.id}`}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* ── Quien entrega el dinero ── */}
          <Box>
            <SectionLabel icon={<PersonRoundedIcon />} brand={brand} borderField={borderField}>
              Quien entrega el dinero
            </SectionLabel>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.25 }}>
              Estos datos aparecen en la sección "Entregué conforme" del recibo.
            </Typography>

            <Stack spacing={1.5}>
              <TextField
                fullWidth
                label="Nombre y apellido"
                value={formData.nombre_entrega}
                onChange={(e) => setFormData({ ...formData, nombre_entrega: e.target.value })}
                InputProps={{ startAdornment: <PersonRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }}
                size="small"
                required
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Cédula de identidad"
                value={formData.ci_entrega}
                onChange={(e) => setFormData({ ...formData, ci_entrega: e.target.value })}
                InputProps={{ startAdornment: <BadgeRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }}
                size="small"
                required
                sx={fieldSx}
              />
            </Stack>
          </Box>

          {/* ── Quien recibe el dinero ── */}
          <Box>
            <SectionLabel icon={<HandshakeRoundedIcon />} brand={green} borderField={borderField}>
              Quien recibe el dinero
            </SectionLabel>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.25 }}>
              Estos datos aparecen en la sección "Recibí conforme" del recibo.
            </Typography>

            <Stack spacing={1.25}>
              <TextField
                fullWidth
                select
                label="Persona que recibe el dinero"
                value={formData.quien_recibe}
                onChange={(e) => setFormData({ ...formData, quien_recibe: e.target.value as 'patricia' | 'oswaldo' })}
                size="small"
                sx={fieldSx}
              >
                {PERSONAS_QUE_RECIBEN.map((persona) => (
                  <MenuItem key={persona.value} value={persona.value}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{persona.label}</Typography>
                      <Typography variant="caption" color="text.secondary">C.I.: {persona.ci}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Box
                sx={{
                  p: 1.25, borderRadius: '12px',
                  background: alpha(green, 0.06),
                  border: `1px solid ${alpha(green, 0.2)}`,
                  borderLeft: `3px solid ${green}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: green, display: 'block' }}>
                  Recibirá el dinero
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {personaSeleccionada?.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  C.I.: {personaSeleccionada?.ci}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* ── Opciones de generación ── */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
              p: 1.25, borderRadius: '12px', background: bgFieldAlt, border: `1px solid ${borderField}`,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>Vista previa en navegador</Typography>
              <Typography variant="caption" color="text.secondary">
                Abrir el PDF en una pestaña nueva en vez de descargarlo
              </Typography>
            </Box>
            <Switch
              checked={formData.preview}
              onChange={(e) => setFormData({ ...formData, preview: e.target.checked })}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: brand },
              }}
            />
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
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : formData.preview ? <VisibilityRoundedIcon /> : <DownloadRoundedIcon />}
          sx={{
            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
            background: accent, color: '#fff',
            boxShadow: `0 4px 16px ${alpha(accent, 0.4)}`,
            '&:hover': { background: esPagoAnual ? '#059669' : '#dc2626', boxShadow: `0 6px 20px ${alpha(accent, 0.5)}` },
            '&.Mui-disabled': { opacity: 0.5, background: accent, color: '#fff' },
          }}
        >
          {loading ? 'Generando...' : formData.preview ? 'Ver recibo' : 'Descargar recibo'}
        </Button>
      </Box>
    </Dialog>
  );
};