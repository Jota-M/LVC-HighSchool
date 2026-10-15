// app/PreInscripcion/registro/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  useTheme,
  Fade,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import '@fontsource/roboto';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

// Componentes del flujo
import FormStepper from '@/components/preinscripcion/FormStepper';
import EstudianteStep from '@/components/preinscripcion/EstudianteStep';
import PadresStep from '@/components/preinscripcion/PadresStep';
import ConfirmacionStep from '@/components/preinscripcion/ConfirmacionStep';
import Header from '../../login/Header';

// Hook
import { usePreinscripcion } from '@/hooks/usePreinscripcion';

const TOTAL_PASOS = 3;

export default function PreinscripcionRegistroPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const router = useRouter();

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const {
    activeStep,
    isSubmitting,
    isSuccess,
    errores,
    mensajeError,
    estudiantes,
    tutores,
    relaciones,
    principales,
    principal,
    resultadoCreadas,
    agregarEstudiante,
    eliminarEstudiante,
    updateEstudiante,
    agregarTutor,
    eliminarTutor,
    updateTutor,
    cambiarRelacion,
    cambiarPrincipal,
    handleNext,
    handleBack,
    handleSubmit,
    limpiarFormulario,
  } = usePreinscripcion();

  // Abrir diálogo de éxito al completar
  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccessDialog(true);
    }
  }, [isSuccess]);

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    router.push('/PreInscripcion/estado');
  };

  const isLastStep = activeStep === TOTAL_PASOS - 1;
  const isFirstStep = activeStep === 0;

  const buttonStyle = {
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  };

  const paperStyle = {
    p: { xs: 2.5, md: 5 },
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.1)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(1, 87, 155, 0.12)',
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <EstudianteStep
            estudiantes={estudiantes}
            errors={errores}
            onChange={updateEstudiante}
            onAddEstudiante={agregarEstudiante}
            onRemoveEstudiante={eliminarEstudiante}
          />
        );
      case 1:
        return (
          <PadresStep
            tutores={tutores}
            estudiantes={estudiantes}
            relaciones={relaciones}
            principales={principales}
            principal={principal}
            errors={errores}
            onChange={updateTutor}
            onAddTutor={agregarTutor}
            onRemoveTutor={eliminarTutor}
            onRelacionChange={cambiarRelacion}
            onPrincipalChange={cambiarPrincipal}
          />
        );
      case 2:
        return (
          <ConfirmacionStep
            estudiantes={estudiantes}
            tutores={tutores}
            relaciones={relaciones}
            principales={principales}
            principal={principal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Box
          sx={{
            minHeight: '100vh',
            background: isDark
              ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
              : 'linear-gradient(135deg, #fdfcfb 0%, #B9BED4 100%)',
            py: { xs: 17, md: 15 },
          }}
        >
          <Container maxWidth="lg">
            {/* Título de la página */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                }}
              >
                Formulario de Solicitud de Ingreso Escolar
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Registra a tus hijos y a los tutores responsables de forma rápida y sencilla.
              </Typography>
            </Box>

            {/* Stepper visual */}
            <Paper elevation={0} sx={{ ...paperStyle, mb: 4, p: { xs: 2.5, md: 4 } }}>
              <FormStepper activeStep={activeStep} />
            </Paper>

            {/* Alerta de error si existe */}
            {mensajeError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
                {mensajeError}
              </Alert>
            )}

            {/* Contenido del paso actual */}
            <Paper elevation={0} sx={paperStyle}>
              <Fade in key={activeStep} timeout={400}>
                <Box>{renderStep()}</Box>
              </Fade>

              {/* Botones de navegación */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 5,
                  pt: 3,
                  borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={isFirstStep || isSubmitting}
                  sx={{
                    ...buttonStyle,
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: isDark ? '#fff' : '#000',
                  }}
                >
                  Anterior
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={limpiarFormulario}
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none', borderRadius: '12px' }}
                  >
                    Reiniciar
                  </Button>

                  {isLastStep ? (
                    <Button
                      variant="contained"
                      endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      sx={{
                        ...buttonStyle,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                      }}
                    >
                      {isSubmitting ? 'Enviando Solicitud...' : 'Enviar Preinscripción'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                      sx={{
                        ...buttonStyle,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                        boxShadow: isDark
                          ? '0 8px 25px rgba(250, 204, 21, 0.3)'
                          : '0 8px 25px rgba(2, 136, 209, 0.3)',
                      }}
                    >
                      Siguiente
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* DIÁLOGO MODAL DE ÉXITO */}
        <Dialog
          open={showSuccessDialog}
          onClose={handleCloseSuccess}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              p: 2,
              background: isDark
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
            <Typography variant="h4" fontWeight={800} color="text.primary">
              ¡Preinscripción Registrada!
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Se han generado los comprobantes de postulación para tu familia.
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                p: 3,
                my: 2,
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)',
                border: '2px dashed #10b981',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="#10b981" mb={1.5}>
                Códigos de Preinscripción Asignados:
              </Typography>

              {resultadoCreadas.length > 0 ? (
                resultadoCreadas.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: idx < resultadoCreadas.length - 1 ? '1px solid rgba(16,185,129,0.2)' : 'none',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {item.estudiante_nombres}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.estado === 'en_espera' && (
                        <Chip
                          size="small"
                          label={`Espera #${item.posicion_espera || 1}`}
                          sx={{
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.15)',
                            color: isDark ? '#fbbf24' : '#b45309',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        />
                      )}
                      <Chip
                        label={item.codigo_inscripcion}
                        color={item.estado === 'en_espera' ? 'warning' : 'success'}
                        sx={{ fontWeight: 800, letterSpacing: '0.5px' }}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Tu solicitud ha ingresado correctamente al sistema.
                </Typography>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Guarda tus códigos para consultar el estado de aprobación de los cupos en nuestro portal.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleCloseSuccess}
              sx={{
                borderRadius: '12px',
                px: 5,
                py: 1.5,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
              }}
            >
              Consultar Estado de Preinscripción
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}