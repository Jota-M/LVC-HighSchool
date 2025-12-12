// pages/AutoMatriculacion.tsx
'use client';
import React, { useState } from 'react';
import { Box, Container, Paper, Stepper, Step, StepLabel, useTheme,keyframes, Typography, useMediaQuery } from '@mui/material';
import Header from '../../login/Header';
import { useAutoMatriculacion } from '@/hooks/useAutoMatriculacion';
import { DocumentoMatricula } from '@/types/autoMatriculacionTypes';
import { School as SchoolIcon } from '@mui/icons-material';

// Importar componentes
import { PageHeader } from '@/components/automatriculacion/PageHeader';
import { StepperHeader } from '@/components/automatriculacion/StepperHeader';
import { VerificacionStep } from '@/components/automatriculacion/VerificacionStep';
import { InformacionStep } from '@/components/automatriculacion/InformacionStep';
import { ActualizarDatosStep } from '@/components/automatriculacion/ActualizarDatosStep';
import { SeleccionParaleloStep } from '@/components/automatriculacion/SeleccionParaleloStep';
import { DocumentosStep } from '@/components/automatriculacion/DocumentosStep';
import { ConfirmacionStep } from '@/components/automatriculacion/ConfirmacionStep';

const steps = [
  'Verificación',
  'Información',
  'Actualizar Datos',
  'Selección de Paralelo',
  'Documentos',
  'Confirmación',
];
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
const AutoMatriculacion: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    ci: '',
  });

  const [datosActualizacion, setDatosActualizacion] = useState({
    telefono: '',
    email: '',
    direccion: '',
    zona: '',
    ciudad: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState<number | null>(null);
  const [gradoFiltro, setGradoFiltro] = useState<number | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoMatricula[]>([]);

  // Hook de auto-matriculación
  const {
    validar,
    actualizarDatos,
    matricular,
    resetear,
    isValidando,
    isActualizando,
    isMatriculando,
    isLoadingOpciones,
    datosEstudiante,
    opciones,
    matriculaExitosa,
  } = useAutoMatriculacion();

  // =======================================================
  // HANDLERS
  // =======================================================

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDatosChange = (field: string, value: string) => {
    setDatosActualizacion((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidar = () => {
    if (!formData.codigo || !formData.ci) {
      alert('Por favor completa todos los campos');
      return;
    }
    validar(formData);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleActualizarDatos = () => {
    const payload: any = {
      codigo: formData.codigo,
      ci: formData.ci,
    };

    // Solo agregar campos que no estén vacíos
    if (datosActualizacion.telefono.trim()) payload.telefono = datosActualizacion.telefono.trim();
    if (datosActualizacion.email.trim()) payload.email = datosActualizacion.email.trim();
    if (datosActualizacion.direccion.trim()) payload.direccion = datosActualizacion.direccion.trim();
    if (datosActualizacion.zona.trim()) payload.zona = datosActualizacion.zona.trim();
    if (datosActualizacion.ciudad.trim()) payload.ciudad = datosActualizacion.ciudad.trim();
    if (datosActualizacion.contacto_emergencia.trim())
      payload.contacto_emergencia = datosActualizacion.contacto_emergencia.trim();
    if (datosActualizacion.telefono_emergencia.trim())
      payload.telefono_emergencia = datosActualizacion.telefono_emergencia.trim();

    if (fotoFile) payload.foto = fotoFile;

    const hasChanges = Object.keys(payload).length > 2 || fotoFile;

    if (!hasChanges) {
      alert('No hay cambios para guardar');
      return;
    }

    actualizarDatos(payload);
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (documentos.length + files.length > 10) {
      alert('Máximo 10 documentos permitidos');
      return;
    }
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} supera el límite de 10MB`);
        return;
      }
      setDocumentos((prev) => [...prev, { file, tipo_documento: 'otro', observaciones: '' }]);
    });
  };

  const handleDocumentoTipoChange = (index: number, tipo: string) => {
    setDocumentos((prev) => prev.map((doc, i) => (i === index ? { ...doc, tipo_documento: tipo } : doc)));
  };

  const handleEliminarDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleMatricular = () => {
    if (!paraleloSeleccionado) {
      alert('Por favor selecciona un paralelo');
      return;
    }

    matricular({
      codigo: formData.codigo,
      ci: formData.ci,
      paralelo_id: paraleloSeleccionado,
      documentos: documentos.length > 0 ? documentos : undefined,
    });
  };

  const handleReiniciar = () => {
    setActiveStep(0);
    setFormData({ codigo: '', ci: '' });
    setDatosActualizacion({
      telefono: '',
      email: '',
      direccion: '',
      zona: '',
      ciudad: '',
      contacto_emergencia: '',
      telefono_emergencia: '',
    });
    setFotoPreview(null);
    setFotoFile(null);
    setParaleloSeleccionado(null);
    setGradoFiltro(null);
    setDocumentos([]);
    resetear();
  };

  // =======================================================
  // EFFECTS
  // =======================================================

  // Validación exitosa
  React.useEffect(() => {
    if (datosEstudiante && activeStep === 0) {
      setActiveStep(1);
      setDatosActualizacion({
        telefono: datosEstudiante.estudiante.telefono || '',
        email: datosEstudiante.estudiante.email || '',
        direccion: datosEstudiante.estudiante.direccion || '',
        zona: datosEstudiante.estudiante.zona || '',
        ciudad: datosEstudiante.estudiante.ciudad || '',
        contacto_emergencia: datosEstudiante.estudiante.contacto_emergencia || '',
        telefono_emergencia: datosEstudiante.estudiante.telefono_emergencia || '',
      });
    }
  }, [datosEstudiante, activeStep]);

  // Matrícula exitosa
  React.useEffect(() => {
    if (matriculaExitosa) {
      setActiveStep(5);
    }
  }, [matriculaExitosa]);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: isDark
          ? 'linear-gradient(135deg, #090B26 0%, #000000 100%)'
          : 'linear-gradient(135deg, #fdfcfb 0%, #e0e7ff 100%)',
          pt: 15,
          pb: 6,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'column' },
            textAlign: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
            <SchoolIcon
              sx={{
                color: isDark ? '#facc15' : '#0288d1',
                fontSize: 36,
                animation: `${bounce} 1.5s infinite`,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'fadeIn 1s ease-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Matriculación de Estudiantes
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.3,
              animation: 'fadeInText 1.2s ease-out',
              '@keyframes fadeInText': {
                from: { opacity: 0, transform: 'translateY(5px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            Gestiona las matrículas de estudiantes por periodo académico.
          </Typography>
        </Box>

        
        <Container maxWidth="lg">
          {/* Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '20px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#fff',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
          <Stepper
  activeStep={activeStep}
  alternativeLabel={!isMobile} // solo en horizontal
  orientation={isMobile ? 'vertical' : 'horizontal'}
  sx={{
    '& .MuiStepLabel-label': {
      fontWeight: 600,
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      textAlign: isMobile ? 'left' : 'center',
    },
    '& .MuiStepLabel-label.Mui-active': {
      color: isDark ? '#facc15' : '#0288d1',
      fontWeight: 700,
    },
    '& .MuiStepLabel-label.Mui-completed': {
      color: '#10b981',
      fontWeight: 600,
    },
    '& .MuiStepIcon-root.Mui-active': {
      color: isDark ? '#facc15' : '#0288d1',
    },
    '& .MuiStepIcon-root.Mui-completed': {
      color: '#10b981',
    },

    // Solo mobile: ancho completo
    '& .MuiStep-root': {
      width: isMobile ? '100%' : 'auto',
    },
  }}
>
  {steps.map((label) => (
    <Step key={label}>
      <StepLabel>{label}</StepLabel>
    </Step>
  ))}
</Stepper>


          </Paper>

          {/* Contenedor del Step Actual */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '20px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#fff',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Step 0: Verificación */}
            {activeStep === 0 && (
              <VerificacionStep
                formData={formData}
                isValidando={isValidando}
                onChange={handleInputChange}
                onValidar={handleValidar}
              />
            )}

            {/* Step 1: Información */}
            {activeStep === 1 && datosEstudiante && (
              <InformacionStep
                datosEstudiante={datosEstudiante}
                onNext={handleNext}
                onBack={handleReiniciar}
              />
            )}

            {/* Step 2: Actualizar Datos */}
            {activeStep === 2 && datosEstudiante && (
              <ActualizarDatosStep
                datosEstudiante={datosEstudiante}
                datosActualizacion={datosActualizacion}
                fotoPreview={fotoPreview}
                fotoFile={fotoFile}
                isActualizando={isActualizando}
                onChange={handleDatosChange}
                onFotoChange={handleFotoChange}
                onActualizar={handleActualizarDatos}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 3: Selección de Paralelo */}
            {activeStep === 3 && opciones && (
              <SeleccionParaleloStep
                opciones={opciones}
                paraleloSeleccionado={paraleloSeleccionado}
                gradoFiltro={gradoFiltro}
                isLoadingOpciones={isLoadingOpciones}
                onParaleloChange={setParaleloSeleccionado}
                onGradoFiltroChange={setGradoFiltro}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 4: Documentos */}
            {activeStep === 4 && (
              <DocumentosStep
                documentos={documentos}
                isMatriculando={isMatriculando}
                onDocumentoChange={handleDocumentoChange}
                onDocumentoTipoChange={handleDocumentoTipoChange}
                onEliminarDocumento={handleEliminarDocumento}
                onMatricular={handleMatricular}
                onBack={handleBack}
              />
            )}

            {/* Step 5: Confirmación */}
            {activeStep === 5 && matriculaExitosa && (
              <ConfirmacionStep matriculaExitosa={matriculaExitosa} onReiniciar={handleReiniciar} />
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AutoMatriculacion;