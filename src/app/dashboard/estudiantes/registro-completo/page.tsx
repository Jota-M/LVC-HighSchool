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
import { useRouter } from 'next/navigation';

// Components
import ModoRegistroSelector from '@/components/estudiantes/registro/ModoRegistroSelector';
import { EstudianteStep } from '@/components/estudiantes/registro/EstudianteStep';
import { TutoresStep } from '@/components/estudiantes/registro/TutoresStep';
import { UsuariosStep } from '@/components/estudiantes/registro/UsuariosStep';
import { MatriculaStep } from '@/components/estudiantes/registro/MatriculaStep';
import { DocumentosStep } from '@/components/estudiantes/registro/DocumentosStep';
import { ConfirmacionStep } from '@/components/estudiantes/registro/ConfirmacionStep';
import { CredencialesModal } from '@/components/estudiantes/CredencialesModal';

// Hooks
import { useRegistroCompleto } from '@/hooks/useRegistroCompleto';

// Types
import {
  EstudianteCreate,
  TutorCreate,
  CredencialesUsuario,
  MatriculaCreate,
  ModoRegistro,
  PadreEncontrado,
} from '@/types/estudianteTypes';

const steps = ['Estudiante(s)', 'Tutores', 'Usuarios', 'Matrícula', 'Documentos', 'Confirmación'];

interface EstudianteFormData extends Omit<EstudianteCreate, 'fecha_nacimiento'> {
  fecha_nacimiento: Dayjs | null;
}

interface TutorFormData extends Omit<TutorCreate, 'fecha_nacimiento'> {
  fecha_nacimiento: Dayjs | null;
}

interface FormData {
  // MODO
  modo: ModoRegistro | null;
  padre_existente_id: number | null;
  padre_existente: PadreEncontrado | null;

  // ESTUDIANTES (array para modo múltiple)
  estudiantes: EstudianteFormData[];
  fotos: (File | null)[];

  // TUTORES (array)
  tutores: TutorFormData[];

  // USUARIOS
  crear_usuario_estudiante: boolean;
  crear_usuarios_tutores: boolean;
  credenciales_estudiantes: CredencialesUsuario[];
  credenciales_tutores: CredencialesUsuario[];

  // MATRÍCULA (array para modo múltiple)
  incluir_matricula: boolean;
  matriculas: MatriculaCreate[];

  // DOCUMENTOS
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
  const [modoSeleccionado, setModoSeleccionado] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { registrar, isRegistrando, credencialesGeneradas, limpiarCredenciales } = useRegistroCompleto();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    modo: null,
    padre_existente_id: null,
    padre_existente: null,
    estudiantes: [
      {
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
        rude: '',
        tiene_discapacidad: false,
        tipo_discapacidad: '',
        observaciones: '',
      },
    ],
    fotos: [null],
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
        // lugar_trabajo: '',
        // telefono_trabajo: '',
        parentesco: '',
        estado_civil: '',
        // nivel_educacion: '',
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
    credenciales_estudiantes: [{ username: '', password: '', email: '' }],
    credenciales_tutores: [{ username: '', password: '', email: '' }],
    incluir_matricula: false,
    matriculas: [
      {
        paralelo_id: 0,
        periodo_academico_id: 0,
        numero_matricula: '',
        es_repitente: false,
        es_becado: false,
        porcentaje_beca: 0,
        tipo_beca: '',
        observaciones: '',
      },
    ],
    documentos_archivos: [],
  });

  const handleModoSeleccionado = (data: { modo: string; padre: PadreEncontrado | null }) => {
    console.log('📌 Modo seleccionado:', data);

    setFormData((prev) => ({
      ...prev,
      modo: data.modo as ModoRegistro,
      padre_existente_id: data.padre?.id || null,
      padre_existente: data.padre,
      // Si es modo existente, limpiar tutores ya que usaremos el padre existente
      tutores: data.modo === 'existente' ? [] : prev.tutores,
    }));

    setModoSeleccionado(true);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
  try {
    if (!formData.modo) {
      console.error('❌ No hay modo seleccionado');
      return;
    }

    // Base común para todos los modos
    const baseData = {
      modo: formData.modo,
      crear_usuario_estudiante: formData.crear_usuario_estudiante,
      crear_usuarios_tutores: formData.crear_usuarios_tutores,
      documentos_archivos: formData.documentos_archivos,
    };

    let dataToSend: any = {};

    // ========================================
    // MODO 1: NUEVO
    // ========================================
    if (formData.modo === 'nuevo') {
      dataToSend = {
        ...baseData,
        estudiante: {
          ...formData.estudiantes[0],
          fecha_nacimiento: formData.estudiantes[0].fecha_nacimiento?.format('YYYY-MM-DD'),
        },
        foto: formData.fotos[0],
        tutores: formData.tutores.map((t) => ({
          ...t,
          fecha_nacimiento: t.fecha_nacimiento?.format('YYYY-MM-DD'),
        })),
        credenciales_estudiante: formData.crear_usuario_estudiante
          ? formData.credenciales_estudiantes[0]
          : undefined,
        credenciales_tutores: formData.crear_usuarios_tutores
          ? formData.credenciales_tutores
          : undefined,
        // 🔧 FIX: Solo enviar si incluir_matricula es true Y tiene datos válidos
        matricula: formData.incluir_matricula && 
                   formData.matriculas[0]?.paralelo_id > 0 && 
                   formData.matriculas[0]?.periodo_academico_id > 0
          ? formData.matriculas[0]
          : undefined,
      };
    }

    // ========================================
    // MODO 2: EXISTENTE
    // ========================================
    else if (formData.modo === 'existente') {
      dataToSend = {
        ...baseData,
        padre_existente_id: formData.padre_existente_id,
        estudiante: {
          ...formData.estudiantes[0],
          fecha_nacimiento: formData.estudiantes[0].fecha_nacimiento?.format('YYYY-MM-DD'),
        },
        foto: formData.fotos[0],
        credenciales_estudiante: formData.crear_usuario_estudiante
          ? formData.credenciales_estudiantes[0]
          : undefined,
        // 🔧 FIX: Solo enviar si incluir_matricula es true Y tiene datos válidos
        matricula: formData.incluir_matricula && 
                   formData.matriculas[0]?.paralelo_id > 0 && 
                   formData.matriculas[0]?.periodo_academico_id > 0
          ? formData.matriculas[0]
          : undefined,
      };
    }

    // ========================================
    // MODO 3: MÚLTIPLE
    // ========================================
    else if (formData.modo === 'multiple') {
      // 🔧 FIX: Filtrar solo matrículas válidas
      const matriculasValidas = formData.incluir_matricula
        ? formData.matriculas.filter(
            (m) => m.paralelo_id > 0 && m.periodo_academico_id > 0
          )
        : [];

      dataToSend = {
        ...baseData,
        estudiantes: formData.estudiantes.map((e) => ({
          ...e,
          fecha_nacimiento: e.fecha_nacimiento?.format('YYYY-MM-DD'),
        })),
        fotos: formData.fotos,
        tutores: formData.tutores.map((t) => ({
          ...t,
          fecha_nacimiento: t.fecha_nacimiento?.format('YYYY-MM-DD'),
        })),
        credenciales_estudiantes: formData.crear_usuario_estudiante
          ? formData.credenciales_estudiantes
          : undefined,
        credenciales_tutores: formData.crear_usuarios_tutores
          ? formData.credenciales_tutores
          : undefined,
        // 🔧 FIX: Solo enviar si hay matrículas válidas
        matriculas: matriculasValidas.length > 0 ? matriculasValidas : undefined,
      };
    }

    console.log('📤 DATOS A ENVIAR:', JSON.stringify(dataToSend, null, 2));

    await registrar(dataToSend);
  } catch (error) {
    console.error('❌ Error en registro:', error);
  }
};

  const handleCredencialesClose = () => {
    limpiarCredenciales();
    router.push('/dashboard/estudiantes');
  };

  const renderStep = () => {
    if (!formData.modo) return null;

    switch (activeStep) {
      case 0:
        return (
          <EstudianteStep
            modo={formData.modo}
            estudiantes={formData.estudiantes}
            fotos={formData.fotos}
            onEstudiantesChange={(estudiantes) => setFormData((prev) => ({ ...prev, estudiantes }))}
            onFotosChange={(fotos) => setFormData((prev) => ({ ...prev, fotos }))}
          />
        );
      case 1:
        // Ocultar paso de tutores si es modo existente
        if (formData.modo === 'existente') {
          return (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                ℹ️ Usando padre/tutor existente
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={2}>
                {formData.padre_existente?.nombres} {formData.padre_existente?.apellido_paterno}
              </Typography>
            </Box>
          );
        }
        return (
          <TutoresStep
            tutores={formData.tutores as any}
            onChange={(tutores) => setFormData((prev) => ({ ...prev, tutores }))}
          />
        );
      case 2:
        return (
          <UsuariosStep
            modo={formData.modo}
            crearUsuarioEstudiante={formData.crear_usuario_estudiante}
            crearUsuariosTutores={formData.crear_usuarios_tutores}
            credencialesEstudiantes={formData.credenciales_estudiantes}
            credencialesTutores={formData.credenciales_tutores}
            estudiantes={formData.estudiantes}
            tutores={formData.tutores}
            onToggleEstudiante={(value) =>
              setFormData((prev) => ({ ...prev, crear_usuario_estudiante: value }))
            }
            onToggleTutores={(value) =>
              setFormData((prev) => ({ ...prev, crear_usuarios_tutores: value }))
            }
            onCredencialesEstudiantesChange={(creds) =>
              setFormData((prev) => ({ ...prev, credenciales_estudiantes: creds }))
            }
            onCredencialesTutoresChange={(creds) =>
              setFormData((prev) => ({ ...prev, credenciales_tutores: creds }))
            }
          />
        );
      case 3:
        return (
          <MatriculaStep
            modo={formData.modo}
            incluirMatricula={formData.incluir_matricula}
            matriculas={formData.matriculas}
            estudiantes={formData.estudiantes}
            onToggleIncluir={(value) => setFormData((prev) => ({ ...prev, incluir_matricula: value }))}
            onMatriculasChange={(matriculas) => setFormData((prev) => ({ ...prev, matriculas }))}
          />
        );
      case 4:
        return (
          <DocumentosStep
            documentos={formData.documentos_archivos}
            onChange={(docs) => setFormData((prev) => ({ ...prev, documentos_archivos: docs }))}
            modo={formData.modo || 'nuevo'} // 🆕 Pasar modo
            estudiantes={formData.estudiantes} // 🆕 Pasar estudiantes
          />
      );
      case 5:
        return (
          <ConfirmacionStep
            modo={formData.modo}
            estudiantes={formData.estudiantes}
            fotos={formData.fotos}
            tutores={formData.tutores}
            padreExistente={formData.padre_existente}
            crearUsuarioEstudiante={formData.crear_usuario_estudiante}
            crearUsuariosTutores={formData.crear_usuarios_tutores}
            credencialesEstudiantes={formData.credenciales_estudiantes}
            credencialesTutores={formData.credenciales_tutores}
            incluirMatricula={formData.incluir_matricula}
            matriculas={formData.matriculas}
            documentos={formData.documentos_archivos}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  // Si no se ha seleccionado modo, mostrar selector
  if (!modoSeleccionado) {
    return <ModoRegistroSelector onModoSeleccionado={handleModoSeleccionado} />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
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

                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.05rem' }}>
                  Modo: <strong>{formData.modo}</strong> • Completa todos los pasos
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
                  {steps.map((label, index) => {
                    // Ocultar visualmente el paso de tutores en modo existente
                    if (index === 1 && formData.modo === 'existente') {
                      return (
                        <Step key={label}>
                          <StepLabel>Tutor (Existente)</StepLabel>
                        </Step>
                      );
                    }
                    return (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    );
                  })}
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
                      backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
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
          <CredencialesModal open={true} onClose={handleCredencialesClose} data={credencialesGeneradas} />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default RegistroCompleto;