// pages/FormularioMatriculacion.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useMatriculacion, useDisponibilidadParalelo } from '@/hooks/useMatriculacion';
import { useGestionAcademica } from '@/hooks/useRegistroCompleto';
import { useEstudiante } from '@/hooks/useEstudiantes';
import { InformacionEstudianteStep } from '@/components/matriculacion/InformacionEstudianteStep';
import { DatosMatriculaStep } from '@/components/matriculacion/DatosMatriculaStep';
import { DocumentosMatriculaStep } from '@/components/matriculacion/DocumentosMatriculaStep';
import { ConfirmacionMatriculaStep } from '@/components/matriculacion/ConfirmacionMatriculaStep';

const steps = ['Información del Estudiante', 'Datos de Matrícula', 'Documentos', 'Confirmación'];

interface DocumentoForm {
  tipo_documento: string;
  file: File | null;
  observaciones: string;
}

const FormularioMatriculacion: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const estudianteId = Number(params.id);

  const [activeStep, setActiveStep] = useState(0);
  const [paralelosDisponibles, setParalelosDisponibles] = useState<any[]>([]);
  const [isLoadingParalelos, setIsLoadingParalelos] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    periodo_academico_id: null as number | null,
    paralelo_id: null as number | null,
    es_repitente: false,
    es_becado: false,
    porcentaje_beca: null as number | null,
    tipo_beca: '',
    observaciones: '',
  });

  const [documentos, setDocumentos] = useState<DocumentoForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const { estudiante, isLoading: isLoadingEstudiante } = useEstudiante(estudianteId);
  const { matricular, isMatriculando } = useMatriculacion();
  const {
    periodos,
    periodoActivo,
    isLoadingPeriodos,
    obtenerTodosLosParalelos,
  } = useGestionAcademica();

  // Disponibilidad del paralelo
  const { disponibilidad, puedeMatricular } = useDisponibilidadParalelo(
    formData.paralelo_id,
    formData.periodo_academico_id
  );

  // Establecer periodo activo por defecto
  useEffect(() => {
    if (periodoActivo && !formData.periodo_academico_id) {
      setFormData((prev) => ({ ...prev, periodo_academico_id: periodoActivo.id }));
    }
  }, [periodoActivo, formData.periodo_academico_id]);

  // Cargar paralelos cuando cambia el periodo
  useEffect(() => {
    const cargarParalelos = async () => {
      if (!formData.periodo_academico_id) return;

      setIsLoadingParalelos(true);
      try {
        const anioActual = 2025;
        const paralelos = await obtenerTodosLosParalelos(anioActual);
        setParalelosDisponibles(paralelos);
      } catch (error) {
        console.error('Error al cargar paralelos:', error);
      } finally {
        setIsLoadingParalelos(false);
      }
    };

    cargarParalelos();
  }, [formData.periodo_academico_id, obtenerTodosLosParalelos]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate current step
    if (activeStep === 1) {
      const newErrors: Record<string, string> = {};
      if (!formData.periodo_academico_id) {
        newErrors.periodo_academico_id = 'Periodo académico requerido';
      }
      if (!formData.paralelo_id) {
        newErrors.paralelo_id = 'Paralelo requerido';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStep((prev) => prev - 1);
  };

  const agregarDocumento = () => {
    setDocumentos((prev) => [
      ...prev,
      { tipo_documento: 'cedula_estudiante', file: null, observaciones: '' },
    ]);
  };

  const eliminarDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarDocumento = (index: number, field: keyof DocumentoForm, value: any) => {
    setDocumentos((prev) => {
      const newDocs = [...prev];
      newDocs[index] = { ...newDocs[index], [field]: value };
      return newDocs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Solo enviar si estamos en el último paso
    if (activeStep !== steps.length - 1) {
      console.warn('Intento de submit antes del último paso');
      return;
    }

    if (!puedeMatricular) {
      alert('El paralelo no tiene capacidad disponible');
      return;
    }

    const documentosArchivos = documentos
      .filter((doc) => doc.file !== null)
      .map((doc) => ({
        file: doc.file!,
        tipo_documento: doc.tipo_documento,
        observaciones: doc.observaciones,
      }));

    const documentosMetadata = documentosArchivos.map((doc) => ({
      tipo_documento: doc.tipo_documento,
      observaciones: doc.observaciones,
    }));

    matricular(
      {
        estudianteId,
        data: {
          matricula: {
            periodo_academico_id: formData.periodo_academico_id!,
            paralelo_id: formData.paralelo_id!,
            es_repitente: formData.es_repitente,
            es_becado: formData.es_becado,
            porcentaje_beca: formData.es_becado ? formData.porcentaje_beca : null,
            tipo_beca: formData.es_becado ? formData.tipo_beca : null,
            observaciones: formData.observaciones || null,
          },
          documentos: documentosMetadata,
          documentos_archivos: documentosArchivos,
        },
      },
      {
        onSuccess: () => {
          router.push('/dashboard/matriculacion');
        },
      }
    );
  };

  if (isLoadingEstudiante) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
          }}
        />
      </Box>
    );
  }

  if (!estudiante) {
    return (
      <Container>
        <Alert severity="error" sx={{ borderRadius: '16px' }}>
          Estudiante no encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            variant="outlined"
            onClick={() => router.back()}
            sx={{
              mb: 3,
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
              color: isDark ? '#facc15' : '#0288d1',
              '&:hover': {
                borderColor: isDark ? '#facc15' : '#0288d1',
                backgroundColor: isDark
                  ? 'rgba(250, 204, 21, 0.05)'
                  : 'rgba(2, 136, 209, 0.05)',
              },
            }}
          >
            Volver
          </Button>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Matricular Estudiante
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Completa el proceso de matrícula siguiendo los pasos indicados
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '2px solid',
            borderColor: isDark
              ? 'rgba(250, 204, 21, 0.2)'
              : 'rgba(2, 136, 209, 0.2)',
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600,
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: isDark ? '#facc15' : '#0288d1',
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                      color: isDark ? '#facc15' : '#0288d1',
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: isDark ? '#facc15' : '#0288d1',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Content - SIN <form> aquí */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '2px solid',
            borderColor: isDark
              ? 'rgba(250, 204, 21, 0.2)'
              : 'rgba(2, 136, 209, 0.2)',
            minHeight: '500px',
          }}
        >
          {/* Step 0: Información del Estudiante */}
          {activeStep === 0 && <InformacionEstudianteStep estudiante={estudiante} />}

          {/* Step 1: Datos de Matrícula */}
          {activeStep === 1 && (
            <DatosMatriculaStep
              formData={formData}
              periodos={periodos}
              paralelosDisponibles={paralelosDisponibles}
              isLoadingParalelos={isLoadingParalelos}
              disponibilidad={disponibilidad}
              puedeMatricular={puedeMatricular}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          {/* Step 2: Documentos */}
          {activeStep === 2 && (
            <DocumentosMatriculaStep
              documentos={documentos}
              onAgregarDocumento={agregarDocumento}
              onEliminarDocumento={eliminarDocumento}
              onActualizarDocumento={actualizarDocumento}
            />
          )}

          {/* Step 3: Confirmación */}
          {activeStep === 3 && (
            <ConfirmacionMatriculaStep
              estudiante={estudiante}
              formData={formData}
              periodos={periodos}
              paralelosDisponibles={paralelosDisponibles}
              documentos={documentos}
            />
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: '2px solid',
              borderColor: isDark
                ? 'rgba(250, 204, 21, 0.1)'
                : 'rgba(2, 136, 209, 0.1)',
            }}
          >
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<PrevIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                px: 4,
                color: isDark ? '#facc15' : '#0288d1',
                '&:hover': {
                  backgroundColor: isDark
                    ? 'rgba(250, 204, 21, 0.1)'
                    : 'rgba(2, 136, 209, 0.1)',
                },
              }}
            >
              Atrás
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 1 && !puedeMatricular}
                endIcon={<NextIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 4px 14px rgba(250, 204, 21, 0.4)'
                    : '0 4px 14px rgba(2, 136, 209, 0.4)',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #eab308 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(250, 204, 21, 0.5)'
                      : '0 6px 20px rgba(2, 136, 209, 0.5)',
                  },
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isMatriculando}
                startIcon={isMatriculando ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  background: isDark
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                  },
                }}
              >
                {isMatriculando ? 'Guardando...' : 'Confirmar Matrícula'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default FormularioMatriculacion;