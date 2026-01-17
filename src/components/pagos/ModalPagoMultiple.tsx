// components/pagos/ModalPagoMultipleCompleto.tsx - VERSIÓN CORREGIDA
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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
} from '@mui/material';
import { Payment, NavigateNext, NavigateBefore, CheckCircle } from '@mui/icons-material';
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

const STEPS = ['Resumen', 'Datos de Pago', 'Confirmación'];

export const ModalPagoMultiple: React.FC<ModalPagoMultipleCompletoProps> = ({
  open,
  onClose,
  estudiantes,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

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
  
  // 🔧 Estados para el recibo
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [pagosParaRecibo, setPagosParaRecibo] = useState<any[]>([]);

  // Calcular totales
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
      // Validaciones antes de ir a confirmación
      if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
        enqueueSnackbar('Número de referencia requerido para transferencias', { 
          variant: 'warning' 
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
      // Construir array de mensualidades
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
        `✅ ${totalMensualidades} pagos registrados por Bs ${totalGeneral.toFixed(2)}`,
        { variant: 'success' }
      );

      // 🔧 CORRECCIÓN: Convertir los pagos registrados al formato correcto
      const pagosFormateados = response.data.pagos.map(pago => ({
        id: pago.pago_id,
        codigo_pago: pago.codigo_pago,
        monto_pagado: pago.monto_pagado,
        nombres: pago.estudiante.split(' ')[0], // Extraer nombre
        apellidos: pago.estudiante.split(' ').slice(1).join(' '), // Extraer apellidos
        mes_correspondiente: pago.mes,
        numero_cuota: parseInt(pago.mes.match(/\d+/)?.[0] || '0'), // Extraer número si está en el mes
      }));

      // 🔧 Abrir modal de recibo
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

  // 🔧 Handler para cuando se cierra el modal de recibo
  const handleReciboClose = () => {
    setReciboModalOpen(false);
    onSuccess(); // Refrescar datos
    onClose(); // Cerrar modal de pago
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Paso 1: Resumen
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Resumen del Pago Múltiple
            </Typography>
            <ResumenPagoVisual
              estudiantes={estudiantes.map(est => ({
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
              }))}
              metodo_pago={formData.metodo_pago}
              numero_comprobante={formData.numero_comprobante}
            />
          </Box>
        );

      case 1:
        // Paso 2: Datos de pago
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Datos del Pago
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Método de Pago"
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value as MetodoPago })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  {METODOS_PAGO.map(m => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="N° Comprobante"
                  value={formData.numero_comprobante}
                  onChange={(e) => setFormData({ ...formData, numero_comprobante: e.target.value })}
                  helperText="Opcional"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
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
                      onChange={(e) => setFormData({ ...formData, banco_origen: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="N° Referencia"
                      value={formData.numero_referencia}
                      onChange={(e) => setFormData({ ...formData, numero_referencia: e.target.value })}
                      required
                      helperText="Requerido para transferencias"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
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
                      onChange={(e) => setFormData({ ...formData, entrego_factura: e.target.checked })}
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
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el pago..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        // Paso 3: Confirmación
        return (
          <Box>
            <Box textAlign="center" mb={3}>
              <CheckCircle 
                sx={{ 
                  fontSize: 80, 
                  color: '#10b981',
                  mb: 2,
                }} 
              />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Confirmar Pago Múltiple
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revisa los datos antes de confirmar el pago
              </Typography>
            </Box>

            <ResumenPagoVisual
              estudiantes={estudiantes.map(est => ({
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
              }))}
              metodo_pago={formData.metodo_pago}
              numero_comprobante={formData.numero_comprobante}
            />

            <Alert severity="warning" sx={{ mt: 3, borderRadius: '12px' }}>
              Esta acción registrará {totalMensualidades} pagos por un total de <strong>Bs {totalGeneral.toFixed(2)}</strong>. 
              Una vez confirmado, no se podrá deshacer.
            </Alert>
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
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? alpha('#000', 0.95) : alpha('#fff', 0.98),
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Payment sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
            <Typography variant="h6" fontWeight={700}>
              Pago Múltiple
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <DialogContent sx={{ minHeight: 400 }}>
          {renderStepContent()}
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

          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              startIcon={<NavigateBefore />}
              sx={{ borderRadius: '12px' }}
            >
              Atrás
            </Button>
          )}

          {activeStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<NavigateNext />}
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
              Siguiente
            </Button>
          ) : (
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
                background: isDark
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
              }}
            >
              {loading ? 'Procesando...' : `Confirmar Pago (Bs ${totalGeneral.toFixed(2)})`}
            </Button>
          )}
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