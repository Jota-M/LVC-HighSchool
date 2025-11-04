"use client";
import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Chip,
  IconButton,
  Alert,
  Paper,
  Fade,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';
import MenuItem from '@mui/material/MenuItem';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function Page() {
  const theme = useTheme();
  const isVertical = useMediaQuery(theme.breakpoints.down('sm'));
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    motherLastName: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    title: '',
    experience: '',
    subject: '',
    level: '',
    username: '',
    temporaryPassword: '',
    confirmPassword: '',
    institution: '',
    graduationYear: '',
    accountStatus: true,
    contractType: '',
    startDate: '',
    salary: '',
    bankAccount: '',
    specialization: '',
  });

  const steps = ['Personal', 'Académico', 'Laboral', 'Documentos'];

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' }
  ];

  const educationLevels = [
    { value: 'Licenciatura', label: 'Licenciatura' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' },
    { value: 'Postdoctorado', label: 'Postdoctorado' }
  ];

  const contractTypes = [
    { value: 'Tiempo Completo', label: 'Tiempo Completo' },
    { value: 'Medio Tiempo', label: 'Medio Tiempo' },
    { value: 'Por Horas', label: 'Por Horas' },
    { value: 'Temporal', label: 'Temporal' }
  ];

  const maritalStatusOptions = [
    { value: 'Soltero/a', label: 'Soltero/a' },
    { value: 'Casado/a', label: 'Casado/a' },
    { value: 'Divorciado/a', label: 'Divorciado/a' },
    { value: 'Viudo/a', label: 'Viudo/a' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        setSnackbarMessage("La foto no debe superar 5MB");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) {
        setSnackbarMessage("El contrato no debe superar 10MB");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      setContractFile(file);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      if (photoPreview) {
        formDataToSend.append('photo', photoPreview);
      }
      if (contractFile) {
        formDataToSend.append('contract', contractFile);
      }

      const res = await fetch("http://localhost:3000/api/teachers", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);
      setSnackbarMessage("¡Docente creado exitosamente!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      setTimeout(() => {
        setActiveStep(0);
        setPhotoPreview(null);
        setContractFile(null);
        setFormData({
          firstName: '',
          lastName: '',
          motherLastName: '',
          idNumber: '',
          phone: '',
          email: '',
          address: '',
          birthDate: '',
          gender: '',
          nationality: '',
          maritalStatus: '',
          title: '',
          experience: '',
          subject: '',
          level: '',
          username: '',
          temporaryPassword: '',
          confirmPassword: '',
          institution: '',
          graduationYear: '',
          accountStatus: true,
          contractType: '',
          startDate: '',
          salary: '',
          bankAccount: '',   
          specialization: '',
        });
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("Error al crear docente");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Estilos modernos basados en el ejemplo
  const fieldStyle = {
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 1)',
        transform: 'translateY(-2px)',
        boxShadow: isDark 
          ? '0 8px 24px rgba(250, 204, 21, 0.15)' 
          : '0 8px 24px rgba(1, 87, 155, 0.15)',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(1, 87, 155, 0.2)',
      borderWidth: '2px',
      transition: 'all 0.3s ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? '#facc15' : '#0288d1',
    },
    '& .MuiInputBase-root.Mui-focused': {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 1)',
      boxShadow: isDark 
        ? '0 0 0 3px rgba(250, 204, 21, 0.1), 0 8px 24px rgba(250, 204, 21, 0.2)' 
        : '0 0 0 3px rgba(2, 136, 209, 0.1), 0 8px 24px rgba(2, 136, 209, 0.2)',
    },
    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? '#facc15' : '#0288d1',
      borderWidth: '2px',
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(1, 87, 155, 0.7)',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    },
    '&:hover .MuiInputLabel-root': {
      color: isDark ? '#facc15' : '#0288d1',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: isDark ? '#facc15' : '#0288d1',
      fontWeight: 600,
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#ffffff' : '#01579b',
      fontWeight: 500,
    },
  };

  const paperStyle = {
    p: { xs: 3, md: 5 },
    borderRadius: '24px',
    backgroundColor: isDark 
      ? 'rgba(15, 23, 42, 0.7)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: isDark 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(1, 87, 155, 0.1)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(250, 204, 21, 0.05)'
      : '0 20px 60px rgba(1, 87, 155, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: isDark 
        ? 'linear-gradient(90deg, #facc15, #f59e0b, #facc15)' 
        : 'linear-gradient(90deg, #0288d1, #01579b, #0288d1)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 3s ease infinite',
    },
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  };

  const sectionTitleStyle = {
    mb: 3,
    fontSize: { xs: "1.3rem", md: "1.8rem" },
    fontWeight: 700,
    background: isDark 
      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)' 
      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '60px',
      height: '4px',
      borderRadius: '2px',
      background: isDark 
        ? 'linear-gradient(90deg, #facc15, #f59e0b)' 
        : 'linear-gradient(90deg, #0288d1, #01579b)',
    },
  };

  const buttonStyle = {
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    px: 4,
    py: 1.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'none',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark 
        ? '0 8px 24px rgba(250, 204, 21, 0.3)' 
        : '0 8px 24px rgba(2, 136, 209, 0.3)',
    },
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={sectionTitleStyle}>
              <PersonIcon sx={{ fontSize: 32 }} />
              Información Personal del Docente
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
                  <Box position="relative">
                    <Avatar
                      src={photoPreview || undefined}
                      sx={{
                        width: 140,
                        height: 140,
                        border: isDark 
                          ? '4px solid rgba(250, 204, 21, 0.3)'
                          : '4px solid rgba(2, 136, 209, 0.3)',
                        boxShadow: isDark
                          ? '0 8px 32px rgba(250, 204, 21, 0.2)'
                          : '0 8px 32px rgba(2, 136, 209, 0.2)',
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(2, 136, 209, 0.1) 0%, rgba(1, 87, 155, 0.1) 100%)',
                      }}
                    >
                      {!photoPreview && <PhotoCameraIcon sx={{ fontSize: 56, color: 'rgba(255, 255, 255, 0.5)' }} />}
                    </Avatar>
                    {photoPreview && (
                      <IconButton
                        onClick={() => setPhotoPreview(null)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            transform: 'scale(1.1)',
                          },
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      ...buttonStyle,
                      borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                      color: isDark ? '#facc15' : '#0288d1',
                      '&:hover': {
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        background: isDark 
                          ? 'rgba(250, 204, 21, 0.1)' 
                          : 'rgba(2, 136, 209, 0.1)',
                      },
                    }}
                  >
                    Subir Fotografía
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombres *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Paterno *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apellido Materno"
                  name="motherLastName"
                  value={formData.motherLastName}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cédula de Identidad *"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fecha de Nacimiento *"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sexo *"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nacionalidad"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado Civil"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                >
                  {maritalStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Correo Electrónico *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección de Residencia"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={sectionTitleStyle}>
              <SchoolIcon sx={{ fontSize: 32 }} />
              Información Académica
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Título Profesional *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Nivel de Estudios *"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                >
                  {educationLevels.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Institución de Estudio"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Año de Egreso"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Área de Especialización"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Materia Principal"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Años de Experiencia Docente"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box sx={sectionTitleStyle}>
              <WorkIcon sx={{ fontSize: 32 }} />
              Información Laboral
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de Contrato "
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                  sx={fieldStyle}
                >
                  {contractTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fecha de Inicio *"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Salario Mensual (Bs.)"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número de Cuenta Bancaria"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    background: isDark 
                      ? 'rgba(255, 255, 255, 0.03)' 
                      : 'rgba(2, 136, 209, 0.05)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(2, 136, 209, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="600" sx={{ color: isDark ? '#fff' : '#01579b' }} gutterBottom>
                      Estado de la Cuenta
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(1, 87, 155, 0.7)' }}>
                      Determina si el docente tendrá acceso al sistema
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={formData.accountStatus ? "Activo" : "Inactivo"}
                      sx={{
                        background: formData.accountStatus 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                      icon={formData.accountStatus ? <CheckCircleIcon /> : undefined}
                    />
                    <Switch
                      checked={formData.accountStatus}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountStatus: e.target.checked,
                        }))
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#059669',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Alert
                  severity="info"
                  sx={{
                    background: isDark 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'rgba(2, 136, 209, 0.1)',
                    border: isDark
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : '1px solid rgba(2, 136, 209, 0.3)',
                    borderRadius: '12px',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#01579b',
                    '& .MuiAlert-icon': {
                      color: isDark ? '#3b82f6' : '#0288d1',
                    },
                  }}
                >
                  El docente recibirá un correo con sus credenciales de acceso una vez completado el registro.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Box sx={sectionTitleStyle}>
              <DescriptionIcon sx={{ fontSize: 32 }} />
              Documentos Requeridos
            </Box>

            <Box
              sx={{
                backgroundColor: isDark 
                  ? 'rgba(250, 204, 21, 0.05)' 
                  : 'rgba(2, 136, 209, 0.05)',
                borderRadius: '16px',
                p: 3,
                mb: 3,
                border: isDark 
                  ? '2px solid rgba(250, 204, 21, 0.2)' 
                  : '2px solid rgba(2, 136, 209, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography
                fontWeight={700}
                sx={{
                  mb: 2,
                  fontSize: '1.1rem',
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              >
                📄 Instrucciones para la Carga de Documentos
              </Typography>
              <Box component="ul" sx={{ mt: 2, mb: 0, pl: 3 }}>
                <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                  ✔️ Asegúrate de que los documentos estén escaneados en buena calidad
                </Typography>
                <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                  ✔️ Formato permitido: PDF (máximo 10MB)
                </Typography>
                <Typography component="li" sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                  ✔️ El contrato debe estar firmado por ambas partes
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography
                fontWeight={600}
                mb={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,0.9)',
                  fontSize: '1.1rem',
                }}
              >
                📄 Contrato Laboral
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: '3px',
                  borderRadius: '16px',
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: contractFile
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(16, 185, 129, 0.05)'
                    : isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(2, 136, 209, 0.02)',
                  borderColor: contractFile
                    ? '#10b981'
                    : isDark
                    ? 'rgba(250, 204, 21, 0.3)'
                    : 'rgba(2, 136, 209, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(2, 136, 209, 0.05)',
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 12px 32px rgba(250, 204, 21, 0.2)'
                      : '0 12px 32px rgba(2, 136, 209, 0.2)',
                  },
                }}
              >
                {contractFile ? (
                  <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography fontWeight={600} sx={{ color: isDark ? '#fff' : '#01579b' }}>
                          {contractFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        sx={{
                          backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                          '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setContractFile(null)}
                        sx={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': { backgroundColor: '#ef4444', color: '#fff' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon
                      sx={{
                        fontSize: 56,
                        color: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{ mb: 3, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}
                    >
                      Contrato laboral firmado por ambas partes
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        ...buttonStyle,
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      Seleccionar Archivo
                      <input
                        hidden
                        type="file"
                        accept=".pdf"
                        onChange={handleContractUpload}
                      />
                    </Button>
                  </>
                )}
              </Paper>
            </Box>

            <Divider sx={{ my: 3, opacity: 0.3 }} />

            <Box
              sx={{
                background: isDark 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : 'rgba(2, 136, 209, 0.03)',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(2, 136, 209, 0.2)',
                borderRadius: '16px',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: isDark ? '#fff' : '#01579b' }}>
                Resumen del Registro
              </Typography>
              <Divider sx={{ my: 2, opacity: 0.3 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Nombre Completo:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.firstName} {formData.lastName} {formData.motherLastName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Cédula:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.idNumber || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Email:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.email || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Título:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.title || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Tipo de Contrato:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.contractType || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(1,87,155,0.7)' }}>
                    Fecha de Inicio:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: isDark ? '#fff' : '#01579b' }}>
                    {formData.startDate || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, md: 10, lg: 12 }}>
          <Fade in timeout={700}>
            <Paper elevation={0} sx={paperStyle}>
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  pb: 3,
                  borderBottom: isDark
                    ? '2px solid rgba(250, 204, 21, 0.2)'
                    : '2px solid rgba(2, 136, 209, 0.2)',
                }}
              >
                <BadgeIcon 
                  sx={{ 
                    fontSize: 48, 
                    mb: 2,
                    color: isDark ? '#facc15' : '#0288d1',
                  }} 
                />
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Registro de Nuevo Docente
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(1, 87, 155, 0.8)',
                  }}
                >
                  Sistema integral de gestión de personal académico
                </Typography>
              </Box>

              <Stepper 
                activeStep={activeStep}
                orientation={isVertical ? 'vertical' : 'horizontal'}
                sx={{ 
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(1, 87, 155, 0.6)',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: isDark ? '#facc15' : '#0288d1',
                    fontWeight: 600,
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(1, 87, 155, 0.8)',
                  },
                  '& .MuiStepIcon-root': {
                    color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(1, 87, 155, 0.2)',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: isDark ? '#facc15' : '#0288d1',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#10b981',
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(1, 87, 155, 0.2)',
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box component="form" onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}

                <Divider sx={{ my: 4, opacity: 0.3 }} />

                <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<NavigateBeforeIcon />}
                    variant="outlined"
                    sx={{
                      ...buttonStyle,
                      borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                      color: isDark ? '#facc15' : '#0288d1',
                      '&:disabled': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    Anterior
                  </Button>

                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{
                        ...buttonStyle,
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: '#dc2626',
                        },
                      }}
                    >
                      Limpiar
                    </Button>

                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        type="submit"
                        startIcon={<PersonAddIcon />}
                        sx={{
                          ...buttonStyle,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          px: 5,
                        }}
                      >
                        Crear Docente
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon />}
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
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}