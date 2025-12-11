// pages/RegistroCompletoDocente.tsx - VERSIÓN SIMPLIFICADA
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  Card,
  CardContent,
  Alert,
  IconButton
} from '@mui/material';
import { BorderColor, CameraAlt as CameraIcon } from '@mui/icons-material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoIcon,
  Description as CVIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import docenteService from '@/services/docenteService';

import {
  CrearDocenteDTO,
  GENEROS,
  TIPOS_CONTRATO,
  NIVELES_FORMACION,
} from '@/types/docenteTypes';

const steps = ['Datos Personales', 'Datos Profesionales', 'Usuario y Acceso'];

export const RegistroCompletoDocente: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================
  // ESTADO DEL FORMULARIO (SIN ASIGNACIONES)
  // =============================================
  const [formData, setFormData] = useState<CrearDocenteDTO>({
    docente: {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      ci: '',
      fecha_nacimiento: '',
      genero: 'masculino',
      telefono: '',
      celular: '',
      email: '',
      direccion: '',
      titulo_profesional: '',
      titulo_postgrado: '',
      especialidad: '',
      salario_mensual: 0,
      numero_cuenta: '',
      fecha_contratacion: new Date().toISOString().split('T')[0],
      tipo_contrato: 'contrato',
      nivel_formacion: 'licenciatura',
      experiencia_anios: 0,
    },
    crear_usuario: false,
    credenciales: {
      username: '',
      password: '',
      email: '',
    },
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [cv, setCV] = useState<File | null>(null);
  const [cvFileName, setCVFileName] = useState<string>('');

  // =============================================
  // MANEJADORES
  // =============================================
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      docente: {
        ...prev.docente,
        [field]: value,
      },
    }));
  };

  const handleCredencialesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      credenciales: {
        ...prev.credenciales!,
        [field]: value,
      },
    }));
  };

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La foto no debe superar los 5MB');
        return;
      }

      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF o Word');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El CV no debe superar los 10MB');
        return;
      }

      setCV(file);
      setCVFileName(file.name);
    }
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview('');
  };

  const handleRemoveCV = () => {
    setCV(null);
    setCVFileName('');
  };

  // =============================================
  // VALIDACIONES
  // =============================================
  const validarPaso = (paso: number): boolean => {
    switch (paso) {
      case 0: // Datos Personales
        if (!formData.docente.nombres.trim()) {
          toast.error('El nombre es requerido');
          return false;
        }
        if (!formData.docente.apellido_paterno.trim()) {
          toast.error('El apellido paterno es requerido');
          return false;
        }
        if (!formData.docente.ci.trim()) {
          toast.error('El CI es requerido');
          return false;
        }
        return true;

      case 1: // Datos Profesionales
        return true; // Opcionales

      case 2: // Usuario
        if (formData.crear_usuario) {
          if (formData.credenciales?.username && !formData.credenciales.username.trim()) {
            toast.error('El username no puede estar vacío');
            return false;
          }
          if (formData.credenciales?.password) {
            if (formData.credenciales.password.length > 0 && formData.credenciales.password.length < 6) {
              toast.error('La contraseña debe tener al menos 6 caracteres');
              return false;
            }
          }
        }
        return true;

      default:
        return true;
    }
  };

  // =============================================
  // NAVEGACIÓN
  // =============================================
  const handleNext = () => {
    if (validarPaso(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // =============================================
  // ENVIAR FORMULARIO
  // =============================================
  const handleSubmit = async () => {
    if (!validarPaso(activeStep)) return;

    setIsSubmitting(true);
    try {
      const response = await docenteService.registroCompleto.registrar(
        formData,
        foto || undefined,
        cv || undefined
      );

      toast.success(response.message);

      // Mostrar credenciales si se creó usuario
      if (response.data.credenciales) {
        toast.success(
          `Usuario creado: ${response.data.credenciales.username}\n` +
          `Contraseña: ${response.data.credenciales.password}`,
          { duration: 10000 }
        );
      }

      // Redirigir al detalle del docente
      router.push(`/dashboard/docentes/${response.data.docente.id}`);
    } catch (error: any) {
      console.error('Error al registrar docente:', error);
      toast.error(error.response?.data?.message || 'Error al registrar docente');
    } finally {
      setIsSubmitting(false);
    }
  };
  const fieldStyle = {
  width: '100%',

  // Label
  '& .MuiInputLabel-root': {
    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    fontWeight: 500,
    fontSize: '0.95rem',
    '&.Mui-focused': {
      color: isDark ? '#facc15' : '#0288d1',
    },
  },

  // Caja del input (fondo)
  '& .MuiInputBase-root': {
    borderRadius: '12px',
    
    transition: '0.2s ease',
    border: '1px solid transparent',

    '&:hover': {
      borderColor: isDark ? '#facc15' : '#0288d1',
    },

    '&.Mui-focused': {
      borderColor: isDark ? '#facc15' : '#0288d1',
      boxShadow: `0 0 0 2px ${isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.25)'}`,
    },
  },

  // Texto dentro del input
  '& .MuiInputBase-input': {
    color: isDark ? '#fff' : '#000',
  },
};

  // =============================================
  // RENDER DE PASOS
  // =============================================
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Foto */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: isDark ? '#facc15' : '#0288d1',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <CameraIcon sx={{ fontSize: 48, color: 'gray' }} />
                  )}
                </Box>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                    '&:hover': {
                      backgroundColor: isDark ? '#eab308' : '#0277bd',
                    },
                  }}
                >
                  <CameraIcon />
                  <input type="file" accept="image/*" onChange={handleFotoChange} hidden />
                </IconButton>
              </Box>
            </Box>

            {/* Datos Personales */}
            <Grid size={{xs:12, md:8}}>
              <Grid container spacing={2}>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    required
                    label="Nombres"
                    value={formData.docente.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    required
                    label="Apellido Paterno"
                    value={formData.docente.apellido_paterno}
                    onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Apellido Materno"
                    value={formData.docente.apellido_materno}
                    onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    required
                    label="CI"
                    value={formData.docente.ci}
                    onChange={(e) => handleInputChange('ci', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    type="date"
                    label="Fecha de Nacimiento"
                    value={formData.docente.fecha_nacimiento}
                    onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    select
                    label="Género"
                    value={formData.docente.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                  >
                    {GENEROS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Teléfono"
                    value={formData.docente.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Celular"
                    value={formData.docente.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.docente.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Grid>
                <Grid size={{xs:12}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Dirección"
                    multiline
                    rows={2}
                    value={formData.docente.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Formación Académica
              </Typography>
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                label="Título Profesional"
                value={formData.docente.titulo_profesional}
                onChange={(e) => handleInputChange('titulo_profesional', e.target.value)}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                label="Título de Postgrado"
                value={formData.docente.titulo_postgrado}
                onChange={(e) => handleInputChange('titulo_postgrado', e.target.value)}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                select
                label="Nivel de Formación"
                value={formData.docente.nivel_formacion}
                onChange={(e) => handleInputChange('nivel_formacion', e.target.value)}
              >
                {NIVELES_FORMACION.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                label="Especialidad"
                value={formData.docente.especialidad}
                onChange={(e) => handleInputChange('especialidad', e.target.value)}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                type="number"
                label="Años de Experiencia"
                value={formData.docente.experiencia_anios}
                onChange={(e) => handleInputChange('experiencia_anios', parseInt(e.target.value) || 0)}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, mt: 2 }}>
                Información Contractual
              </Typography>
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                select
                label="Tipo de Contrato"
                value={formData.docente.tipo_contrato}
                onChange={(e) => handleInputChange('tipo_contrato', e.target.value)}
              >
                {TIPOS_CONTRATO.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                type="date"
                label="Fecha de Contratación"
                value={formData.docente.fecha_contratacion}
                onChange={(e) => handleInputChange('fecha_contratacion', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                type="number"
                label="Salario Mensual (Bs.)"
                value={formData.docente.salario_mensual}
                onChange={(e) => handleInputChange('salario_mensual', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                sx={fieldStyle}
                fullWidth
                label="Número de Cuenta"
                value={formData.docente.numero_cuenta}
                onChange={(e) => handleInputChange('numero_cuenta', e.target.value)}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, mt: 2 }}>
                Curriculum Vitae (CV)
              </Typography>
            </Grid>

            <Grid size={{xs:12}}>
              <Box
                sx={{
                  border: `2px dashed ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
                  borderRadius: '12px',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                {cvFileName ? (
                  <Box>
                    <CVIcon sx={{ fontSize: 60, color: isDark ? '#facc15' : '#0288d1', mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {cvFileName}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveCV}
                    >
                      Quitar CV
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <CVIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Sube el CV del docente (PDF o Word)
                    </Typography>
                    <input
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="cv-upload"
                      type="file"
                      onChange={handleCVChange}
                    />
                    <label htmlFor="cv-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<CVIcon />}
                      >
                        Seleccionar CV
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <Card
                sx={{
                  backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                  borderRadius: '16px',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AccountIcon sx={{ fontSize: 40, color: isDark ? '#facc15' : '#0288d1' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Crear Usuario de Acceso
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Permite al docente acceder al sistema con credenciales propias
                      </Typography>
                    </Box>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.crear_usuario}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          crear_usuario: e.target.checked 
                        }))}
                      />
                    }
                    label="Crear usuario para este docente"
                  />
                </CardContent>
              </Card>
            </Grid>

            {formData.crear_usuario && (
              <>
                <Grid size={{xs:12}}>
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    Si dejas los campos vacíos, se generarán automáticamente username y contraseña.
                  </Alert>
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    label="Username (opcional)"
                    value={formData.credenciales?.username || ''}
                    onChange={(e) => handleCredencialesChange('username', e.target.value)}
                    helperText="Se generará automáticamente si se deja vacío"
                  />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    type="password"
                    label="Contraseña (opcional)"
                    value={formData.credenciales?.password || ''}
                    onChange={(e) => handleCredencialesChange('password', e.target.value)}
                    helperText="Se generará automáticamente si se deja vacía"
                  />
                </Grid>
                <Grid size={{xs:12}}>
                  <TextField
                    sx={fieldStyle}
                    fullWidth
                    type="email"
                    label="Email de acceso (opcional)"
                    value={formData.credenciales?.email || ''}
                    onChange={(e) => handleCredencialesChange('email', e.target.value)}
                    helperText="Se usará el email del docente si se deja vacío"
                  />
                </Grid>
              </>
            )}

            <Grid size={{xs:12}}>
              <Alert severity="success" icon={<SchoolIcon />} sx={{ borderRadius: '12px', mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  ¿Necesitas asignar materias al docente?
                </Typography>
                <Typography variant="body2">
                  Después de registrar al docente, podrás asignarlo a las materias y paralelos correspondientes 
                  desde la pestaña "Asignaciones" en la sección de Docentes.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4}}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.back()}
            sx={{
              mb: 2,
              color: isDark ? '#facc15' : '#0288d1',
            }}
          >
            Volver
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SchoolIcon
              sx={{
                fontSize: 40,
                color: isDark ? '#facc15' : '#0288d1',
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Registro de Docente
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Completa la información del docente. Las asignaciones se realizarán posteriormente.
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '20px',
             backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Contenido */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            minHeight: '500px',
          }}
        >
          {renderStepContent(activeStep)}
        </Paper>

        {/* Botones de navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            color='success'
            size="large"
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Anterior
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                borderRadius: '12px',
                px: 4,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Docente'}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              sx={{
                borderRadius: '12px',
                px: 4,
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
      </Container>
    </Box>
  );
};

export default RegistroCompletoDocente;