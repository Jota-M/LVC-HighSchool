// app/preinscripcion/page.tsx
'use client';
import React from 'react';
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
} from '@mui/material';
import '@fontsource/roboto';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

// Componentes personalizados
import ModoRegistroSelector from '@/components/preinscripcion/ModoRegistroSelector';
import FormStepper from '@/components/preinscripcion/FormStepper';
import EstudianteStep from '@/components/preinscripcion/EstudianteStep';
import PadresStep from '@/components/preinscripcion/PadresStep';
import DocumentosStep from '@/components/preinscripcion/DocumentosStep';
import ConfirmacionStep from '@/components/preinscripcion/ConfirmacionStep';
import Header from '../../login/Header';

// Hook
import { usePreinscripcion } from '@/hooks/usePreinscripcion';

const steps = ['Estudiante', 'Padres', 'Documentos', 'Confirmación'];

export default function PreinscripcionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  const {
    // 🆕 Estados de modo
    etapa,
    modo,
    padreExistente,
    handleModoSeleccionado,
    volverSeleccionModo,

    // 🆕 Múltiples estudiantes
    estudiantes,
    estudianteActivo,
    setEstudianteActivo,
    agregarEstudiante,
    eliminarEstudiante,

    // Estados originales
    formData,
    activeStep,
    errors,
    updateEstudiante,
    updateRepresentante,
    updateDocumento,
    handleNext,
    handleBack,
    handleSubmit,
    limpiarFormulario,
    isSubmitting,
    isSuccess,
  } = usePreinscripcion();

  // Mostrar modal de éxito
  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccessDialog(true);
    }
  }, [isSuccess]);

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    window.location.reload(); // Reiniciar formulario
  };

  // =============================================
  // RENDERIZADO DE PASOS
  // =============================================
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <EstudianteStep
            data={formData.estudiante}
            errors={errors}
            onChange={updateEstudiante}
          />
        );
      case 1:
        return modo === 'padre_existente' ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '16px',
              border: '2px solid #10b981',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} mb={2}>
              ✅ Usando datos del padre existente
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
              <strong>Nombre:</strong> {padreExistente?.nombres} {padreExistente?.apellido_paterno}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>CI:</strong> {padreExistente?.ci} | <strong>Teléfono:</strong> {padreExistente?.telefono}
            </Typography>
            {padreExistente?.hijos && padreExistente.hijos.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Hijos ya matriculados:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {padreExistente.hijos.map((hijo: any) => (
                    <Chip
                      key={`${hijo.id}-${hijo.grado_actual}`}
                      label={`${hijo.nombres} ${hijo.apellido_paterno} (${hijo.grado_actual})`}
                      size="small"
                      color="success"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <PadresStep
            data={formData.representante}
            errors={errors}
            onChange={updateRepresentante}
          />
        );
      case 2:
        return (
          <DocumentosStep
            documentos={formData.documentos}
            errors={errors}
            onChange={updateDocumento}
            modoRegistro={modo}
          />
        );
      case 3:
        return (
          <ConfirmacionStep
            estudiante={formData.estudiante}
            representante={formData.representante}
            documentos={formData.documentos}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  // Estilos
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
    p: { xs: 3, md: 5 },
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.1)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(1, 87, 155, 0.15)',
  };

  // =============================================
  // SI ESTÁ EN SELECCIÓN DE MODO
  // =============================================
  if (etapa === 'seleccion_modo') {
    return (
      <>
      <Header />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            minHeight: '100vh',
            background: isDark
              ? 'linear-gradient(135deg, #090B26, #000000)'
              : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
            py: 10,
          }}
        >
          <ModoRegistroSelector onModoSeleccionado={handleModoSeleccionado} />
        </Box>
      </LocalizationProvider>
      </>
    );
  }

  // =============================================
  // FORMULARIO PRINCIPAL
  // =============================================
  return (
    <>
      <Header />
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg, #090B26, #000000)'
            : 'linear-gradient(135deg, #fdfcfb, #B9BED4)',
          py: 15,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box>
              {/* Header */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Inscripción de Estudiantes
                </Typography>
                <Typography variant="body1" color="text.secondary" fontSize={{xs:"1rem", md:"1.2rem" }}>
                  {modo === 'nuevo' && 'Modo: Nuevo Padre/Tutor'}
                  {modo === 'padre_existente' && 'Modo: Padre Existente'}
                  {modo === 'multiple' && 'Modo: Varios Estudiantes'}
                </Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={volverSeleccionModo}
                  sx={{ mt: 1 }}
                >
                  Cambiar modo
                </Button>
              </Box>

              {/* Stepper */}
              <FormStepper activeStep={activeStep} />

              {/* 🆕 Selector de estudiante (solo en modo múltiple) */}
              {modo === 'multiple' && activeStep < 3 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {estudiantes.map((_, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Button
                        variant={estudianteActivo === index ? 'contained' : 'outlined'}
                        onClick={() => setEstudianteActivo(index)}
                        sx={{
                          ...buttonStyle,
                          background: estudianteActivo === index
                            ? isDark
                              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)'
                            : 'transparent',
                          ...(estudianteActivo === index && {
                            color: isDark ? '#000' : '#fff',
                          }),
                        }}
                      >
                        Estudiante {index + 1}
                      </Button>
                      {estudiantes.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: '#ef4444',
                            color: '#fff',
                            '&:hover': { bgcolor: '#dc2626' },
                          }}
                          onClick={() => eliminarEstudiante(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  {estudiantes.length < 5 && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={agregarEstudiante}
                      sx={buttonStyle}
                    >
                      Agregar estudiante
                    </Button>
                  )}
                </Box>
              )}

              {/* Content */}
              <Paper elevation={0} sx={{ ...paperStyle, mb: 4 }}>
                {renderStep()}
              </Paper>

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    disabled={isFirstStep || isSubmitting}
                    sx={{
                      ...buttonStyle,
                      borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                      color: isDark ? '#facc15' : '#0288d1',
                    }}
                  >
                    Atrás
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={limpiarFormulario}
                    disabled={isSubmitting}
                    sx={{
                      ...buttonStyle,
                      borderColor: '#ef4444',
                      color: '#ef4444',
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>

                {isLastStep ? (
                  <Button
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{
                      ...buttonStyle,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                    }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Preinscripción'}
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
                    }}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onClose={handleCloseSuccess} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
            <Typography variant="h4" fontWeight={700}>
              ¡Inscripción Enviada!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Su solicitud ha sido recibida exitosamente. En breve nos pondremos en contacto con usted para
              continuar con el proceso de admisión.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
            <Button
              variant="contained"
              onClick={handleCloseSuccess}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Entendido
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
    </>
  );
}