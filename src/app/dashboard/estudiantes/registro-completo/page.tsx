// pages/RegistroCompleto.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  useTheme,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import '@fontsource/roboto';

import dayjs, { Dayjs } from 'dayjs';

// Importar los steps (los crearemos después)
import { EstudianteStep } from '@/components/estudiantes/registro/EstudianteStep';
import { TutoresStep } from '@/components/estudiantes/registro/TutoresStep';
import { UsuariosStep } from '@/components/estudiantes/registro/UsuariosStep';
import { MatriculaStep } from '@/components/estudiantes/registro/MatriculaStep';
import { DocumentosStep } from '@/components/estudiantes/registro/DocumentosStep';
import { ConfirmacionStep } from '@/components/estudiantes/registro/ConfirmacionStep';
import { CredencialesModal } from '@/components/estudiantes/CredencialesModal';
import { useRouter } from 'next/navigation';

// Hooks
import { useRegistroCompleto } from '@/hooks/useRegistroCompleto';

// Types
import {
  EstudianteCreate,
  TutorCreate,
  CredencialesUsuario,
  MatriculaCreate,
} from '@/types/estudianteTypes';

const steps = ['Estudiante', 'Tutores', 'Usuarios', 'Matrícula', 'Documentos', 'Confirmación'];

interface FormData {
  estudiante: Omit<EstudianteCreate, 'fecha_nacimiento'> & { fecha_nacimiento: Dayjs | null };
  foto: File | null;
  tutores: Array<Omit<TutorCreate, 'fecha_nacimiento'> & { fecha_nacimiento: Dayjs | null }>;
  crear_usuario_estudiante: boolean;
  crear_usuarios_tutores: boolean;
  credenciales_estudiante: CredencialesUsuario;
  credenciales_tutores: CredencialesUsuario[];
  incluir_matricula: boolean;
  matricula: MatriculaCreate;
  documentos_archivos: Array<{
    file: File;
    tipo_documento: string;
    observaciones?: string;
  }>;
}

export const RegistroCompleto: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);

  const { registrar, isRegistrando, credencialesGeneradas, limpiarCredenciales } = useRegistroCompleto();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    estudiante: {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: null,
      ci: '',
      lugar_nacimiento: '',
      genero: undefined,
      direccion: '',
      zona: '',
      ciudad: '',
      telefono: '',
      email: '',
      contacto_emergencia: '',
      telefono_emergencia: '',
      tiene_discapacidad: false,
      tipo_discapacidad: '',
      observaciones: '',
    },
    foto: null,
    tutores: [
      {
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: null,
        telefono: '',
        celular: '',
        email: '',
        direccion: '',
        ocupacion: '',
        lugar_trabajo: '',
        telefono_trabajo: '',
        parentesco: '',
        estado_civil: '',
        nivel_educacion: '',
        es_tutor_principal: true,
        vive_con_estudiante: true,
        autorizado_recoger: true,
        puede_autorizar_salidas: true,
        recibe_notificaciones: true,
        prioridad_contacto: 1,
        observaciones: '',
      },
    ],
    crear_usuario_estudiante: false,
    crear_usuarios_tutores: false,
    credenciales_estudiante: { username: '', password: '', email: '' },
    credenciales_tutores: [{ username: '', password: '', email: '' }],
    incluir_matricula: false,
    matricula: {
      paralelo_id: 0,
      periodo_academico_id: 0,
      numero_matricula: '',
      es_repitente: false,
      es_becado: false,
      porcentaje_beca: 0,
      tipo_beca: '',
      observaciones: '',
    },
    documentos_archivos: [],
  });

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
  try {
    // Transformar datos para enviar al backend
    const dataToSend = {
      estudiante: {
        ...formData.estudiante,
        fecha_nacimiento: formData.estudiante.fecha_nacimiento
          ? formData.estudiante.fecha_nacimiento.format('YYYY-MM-DD')
          : '',
      },
      foto: formData.foto,
      tutores: formData.tutores.map((tutor) => ({
        ...tutor,
        fecha_nacimiento: tutor.fecha_nacimiento
          ? tutor.fecha_nacimiento.format('YYYY-MM-DD')
          : undefined,
      })),
      crear_usuario_estudiante: formData.crear_usuario_estudiante,
      crear_usuarios_tutores: formData.crear_usuarios_tutores,
      credenciales_estudiante: formData.crear_usuario_estudiante
        ? formData.credenciales_estudiante
        : undefined,
      credenciales_tutores: formData.crear_usuarios_tutores
        ? formData.credenciales_tutores
        : undefined,
      matricula: formData.incluir_matricula ? formData.matricula : undefined,
      documentos_archivos: formData.documentos_archivos,
    };

    // 👇 AGREGA ESTO PARA VER QUÉ SE ENVÍA
    console.log('📤 DATOS A ENVIAR:', JSON.stringify(dataToSend, null, 2));

    await registrar(dataToSend as any);
  } catch (error) {
    console.error('Error en registro:', error);
  }
};

  const handleCredencialesClose = () => {
    limpiarCredenciales();
    router.push('/dashboard/estudiantes');
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <EstudianteStep
            data={formData.estudiante}
            foto={formData.foto}
            onChange={(data) => setFormData((prev) => ({ ...prev, estudiante: { ...prev.estudiante, ...data } }))}
            onFotoChange={(foto) => setFormData((prev) => ({ ...prev, foto }))}
          />
        );
      case 1:
        return (
          <TutoresStep
            tutores={formData.tutores as any}
            onChange={(tutores) => setFormData((prev) => ({ ...prev, tutores }))}
          />
        );
      case 2:
        return (
          <UsuariosStep
            crearUsuarioEstudiante={formData.crear_usuario_estudiante}
            crearUsuariosTutores={formData.crear_usuarios_tutores}
            credencialesEstudiante={{
              username: formData.credenciales_estudiante.username ?? '',
              password: formData.credenciales_estudiante.password ?? '',
              email: formData.credenciales_estudiante.email ?? '',
            }}
            credencialesTutores={formData.credenciales_tutores.map((cred) => ({
              username: cred.username ?? '',
              password: cred.password ?? '',
              email: cred.email ?? '',
            }))}
            tutores={formData.tutores}
            onToggleEstudiante={(value) =>
              setFormData((prev) => ({ ...prev, crear_usuario_estudiante: value }))
            }
            onToggleTutores={(value) =>
              setFormData((prev) => ({ ...prev, crear_usuarios_tutores: value }))
            }
            onCredencialesEstudianteChange={(creds) =>
              setFormData((prev) => ({ ...prev, credenciales_estudiante: creds }))
            }
            onCredencialesTutoresChange={(creds) =>
              setFormData((prev) => ({ ...prev, credenciales_tutores: creds }))
            }
          />
        );
      case 3:
        return (
          <MatriculaStep
            incluirMatricula={formData.incluir_matricula}
            matricula={formData.matricula}
            onToggleIncluir={(value) => setFormData((prev) => ({ ...prev, incluir_matricula: value }))}
            onChange={(data) => setFormData((prev) => ({ ...prev, matricula: { ...prev.matricula, ...data } }))}
          />
        );
      case 4:
        return (
          <DocumentosStep
            documentos={formData.documentos_archivos}
            onChange={(docs) => setFormData((prev) => ({ ...prev, documentos_archivos: docs }))}
          />
        );
      case 5:
        return (
          <ConfirmacionStep
            estudiante={formData.estudiante}
            foto={formData.foto}
            tutores={formData.tutores}
            crearUsuarioEstudiante={formData.crear_usuario_estudiante}
            crearUsuariosTutores={formData.crear_usuarios_tutores}
            credencialesEstudiante={formData.credenciales_estudiante}
            credencialesTutores={formData.credenciales_tutores}
            incluirMatricula={formData.incluir_matricula}
            matricula={formData.matricula}
            documentos={formData.documentos_archivos}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
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
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 800,
                    letterSpacing: 1,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: isDark
                      ? '0 3px 12px rgba(250, 204, 21, 0.35)'
                      : '0 3px 12px rgba(2, 136, 209, 0.35)',
                    mb: 1,
                    transition: '0.3s ease',
                  }}
                >
                  Registro Completo de Estudiante
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1.05rem',
                  }}
                >
                  Completa todos los pasos para registrar al estudiante
                </Typography>
            </Box>


              {/* Stepper */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  mb: 4,
                }}
              >
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>

              {/* Content */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: '24px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  mb: 4,
                }}
              >
                {renderStep()}
              </Paper>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={isFirstStep || isRegistrando}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#facc15' : '#0288d1',
                    transition: '0.25s ease',

                    '&:hover': {
                      borderColor: isDark ? '#f59e0b' : '#01579b',
                      backgroundColor: isDark
                        ? 'rgba(250, 204, 21, 0.1)'
                        : 'rgba(2, 136, 209, 0.1)',
                    },

                    '&.Mui-disabled': {
                      borderColor: 'rgba(128,128,128,0.3)',
                      color: 'rgba(128,128,128,0.5)',
                    },
                  }}
                >
                  Atrás
                </Button>


                {isLastStep ? (
                  <Button
                    variant="contained"
                    startIcon={isRegistrando ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                    onClick={handleSubmit}
                    disabled={isRegistrando}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 5,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isRegistrando ? 'Registrando...' : 'Confirmar y Registrar'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
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

        {/* Modal de credenciales */}
        {credencialesGeneradas && (
          <CredencialesModal
            open={true}
            onClose={handleCredencialesClose}
            data={credencialesGeneradas}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default RegistroCompleto;