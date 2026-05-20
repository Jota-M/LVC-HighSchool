// components/pagos/ModalGenerarRecibo.tsx - CON SOPORTE PAGO ANUAL
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
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Stack,
  Chip,
  useTheme,
  alpha,
  MenuItem,
} from '@mui/material';
import {
  Close,
  PictureAsPdf,
  Visibility,
  Download,
  Person,
  Badge,
} from '@mui/icons-material';
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

  // 🔧 Detectar si es pago anual
  const esPagoAnual = pagos.length === 1 && 
                      (pagos[0].mes_correspondiente === 'Pago Anual Completo (10 meses)' || 
                       pagos[0].numero_cuota === null);

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
        // 🆕 MODO DIRECTO: Para pago anual, enviar datos completos
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
        // MODO NORMAL: Para pagos regulares, buscar por IDs
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
                background: esPagoAnual
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PictureAsPdf sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {esPagoAnual ? 'Recibo Pago Anual' : 'Generar Recibo de Pago'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {estudiante?.nombres} {estudiante?.apellidos}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Información del pago */}
          <Alert 
            severity={esPagoAnual ? 'success' : 'info'}
            sx={{ 
              borderRadius: '12px',
              bgcolor: alpha(esPagoAnual ? '#10b981' : '#3b82f6', 0.1),
              border: `1px solid ${alpha(esPagoAnual ? '#10b981' : '#3b82f6', 0.3)}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {esPagoAnual ? '🎉 Pago Anual Completo' : '📄 Resumen del Pago'}
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {esPagoAnual ? 'Meses cubiertos:' : 'Mensualidades:'}
              </Typography>
              <Chip
                label={esPagoAnual ? '10 meses (Feb - Nov)' : `${pagos.length} cuota(s)`}
                size="small"
                sx={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  bgcolor: alpha(esPagoAnual ? '#10b981' : '#3b82f6', 0.2),
                }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Monto Total:
              </Typography>
              <Typography variant="body2" fontWeight={700} color={esPagoAnual ? '#10b981' : '#3b82f6'}>
                Bs. {totalMonto.toFixed(2)}
              </Typography>
            </Box>
            {esPagoAnual && (
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Descuento aplicado:
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#10b981">
                  10% (1 mes gratis)
                </Typography>
              </Box>
            )}
          </Alert>

          <Divider>
            <Chip 
              label="Datos de quien entrega el dinero" 
              size="small"
              sx={{ borderRadius: '8px' }}
            />
          </Divider>

          {/* Formulario para personalizar datos de QUIEN ENTREGA */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              border: '2px dashed',
              borderColor: isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3),
              bgcolor: isDark ? alpha('#facc15', 0.05) : alpha('#0288d1', 0.05),
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              gutterBottom 
              display="block"
              sx={{ mb: 2 }}
            >
              💰 Estos datos aparecerán en la sección "ENTREGUÉ CONFORME" del recibo
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Nombre y Apellido (quien entrega)"
                  value={formData.nombre_entrega}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_entrega: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                  helperText="Nombre de la persona que entrega el dinero"
                  required
                />
              </Grid>

              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad"
                  value={formData.ci_entrega}
                  onChange={(e) =>
                    setFormData({ ...formData, ci_entrega: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                  helperText="C.I. de quien entrega el dinero"
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Divider>
            <Chip 
              label="¿Quién recibe el dinero?" 
              size="small"
              sx={{ borderRadius: '8px' }}
            />
          </Divider>

          {/* Selector de quien RECIBE el dinero */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              border: '2px solid',
              borderColor: isDark ? alpha('#10b981', 0.3) : alpha('#10b981', 0.3),
              bgcolor: isDark ? alpha('#10b981', 0.05) : alpha('#10b981', 0.05),
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              gutterBottom 
              display="block"
              sx={{ mb: 2 }}
            >
              📝 Estos datos aparecerán en la sección "RECIBÍ CONFORME" del recibo
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  select
                  label="Persona que recibe el dinero"
                  value={formData.quien_recibe}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      quien_recibe: e.target.value as 'patricia' | 'oswaldo' 
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                  helperText="Seleccione la persona autorizada que recibe el pago"
                >
                  {PERSONAS_QUE_RECIBEN.map((persona) => (
                    <MenuItem key={persona.value} value={persona.value}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {persona.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          C.I.: {persona.ci}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Vista previa de quien recibe */}
              <Grid size={{xs:12}}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: '12px',
                    bgcolor: alpha('#10b981', 0.1),
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Recibirá el dinero:
                  </Typography>
                  <Typography variant="body2">
                    {PERSONAS_QUE_RECIBEN.find(p => p.value === formData.quien_recibe)?.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    C.I.: {PERSONAS_QUE_RECIBEN.find(p => p.value === formData.quien_recibe)?.ci}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>

          {/* Opciones de generación */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.preview}
                  onChange={(e) =>
                    setFormData({ ...formData, preview: e.target.checked })
                  }
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Vista previa en navegador
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Abrir el PDF en una nueva pestaña en lugar de descargarlo
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Lista de mensualidades */}
          {pagos.length > 1 && !esPagoAnual && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Mensualidades incluidas en el recibo:
              </Typography>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {pagos.map((pago) => (
                  <Chip
                    key={pago.id}
                    label={
                      pago.mes_correspondiente
                        ? `${pago.mes_correspondiente} (${pago.numero_cuota})`
                        : `Pago ${pago.id}`
                    }
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
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
          startIcon={formData.preview ? <Visibility /> : <Download />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            background: esPagoAnual
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            '&:hover': {
              background: esPagoAnual
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            },
            '&:disabled': {
              background: alpha(esPagoAnual ? '#10b981' : '#ef4444', 0.5),
              color: '#fff',
            },
          }}
        >
          {loading
            ? 'Generando...'
            : formData.preview
            ? 'Ver Recibo'
            : 'Descargar Recibo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};