'use client';
import Header from '../Navbar';
import React, { useState } from 'react';
import { Dayjs } from 'dayjs';

import {
  Grid,
  Box,
  Typography,
  TextField,
  FormGroup,
  Button,
  MenuItem,
  IconButton,
  Paper,
  Fade,
  useTheme,
  createTheme,
  ThemeProvider,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Collapse,
  Dialog
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tokens } from '@/app/dashboard/theme';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SendIcon from '@mui/icons-material/Send';
import FormStepper from '../../components/FormStepper';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Title from '@/app/components/HomePage/Title';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Opciones
const generoOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

const nacionalidades = [
  { value: 'BO', label: 'Boliviana' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chilena' },
  { value: 'OT', label: 'Otro' },
];

const gradosSolicitados = [
  { value: 'PRE-KINDER', label: 'Pre-Kinder' },
  { value: 'KINDER', label: 'Kinder' },
  { value: 'PRIMERO', label: 'Primero de Primaria' },
  { value: 'SEGUNDO', label: 'Segundo de Primaria' },
  { value: 'TERCERO', label: 'Tercero de Primaria' },
  { value: 'CUARTO', label: 'Cuarto de Primaria' },
  { value: 'QUINTO', label: 'Quinto de Primaria' },
  { value: 'SEXTO', label: 'Sexto de Primaria' },
  { value: 'PRIMERO_SEC', label: 'Primero de Secundaria' },
  { value: 'SEGUNDO_SEC', label: 'Segundo de Secundaria' },
  { value: 'TERCERO_SEC', label: 'Tercero de Secundaria' },
  { value: 'CUARTO_SEC', label: 'Cuarto de Secundaria' },
  { value: 'QUINTO_SEC', label: 'Quinto de Secundaria' },
  { value: 'SEXTO_SEC', label: 'Sexto de Secundaria' },
];

const gradosCursados = [
  { value: 'NINGUNO', label: 'Será su primer año en la escuela' },
  ...gradosSolicitados,
];

const estadosCiviles = [
  { value: 'SOLTERO', label: 'Soltero(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
];

export default function MultiStepForm() {
  const [tieneDiscapacidad, setTieneDiscapacidad] = useState("ninguna");
  const [activeStep, setActiveStep] = useState(0);
  const [alignment, setAlignment] = useState('web');
  const [turno, setTurno] = useState<string>('mañana');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';

  const [idFile, setIdFile] = useState<File | null>(null);
  const [academicFile, setAcademicFile] = useState<File | null>(null);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [parentIdFile, setParentIdFile] = useState<File | null>(null);

  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

  const handlePreview = (file: File) => {
  const fileUrl = URL.createObjectURL(file);
  setPreviewFile({
    url: fileUrl,
    name: file.name,
    type: file.type,
  });
};
  const [formData, setFormData] = useState<{
  // ----- Date of Student -----
  firstName: string;
  lastName: string;
  middleName: string;
  idNumber: string;
  birthDate: Dayjs | null;
  gender: string;
  nationality: string;
  institution: string;
  lastGrade: string;
  gradeRequested: string;
  repeatingGrade: boolean;
  turn: string;
  hasDisability: boolean;
  discapacityDetails: string;
  directAddress: string;
  houseNumber: string;
  department: string;
  city: string;
  homePhone: string;
  mobilePhone: string;
  email: string;
  // ----- Date of Parent -----
  firstNameParent: string,
  lastNameParent: string,
  middleNameParent: string,
  idNumberParent: string,
  birthDateParent: Dayjs | null,
  genderParent: string,
  nationalityParent: string,
  professionParent: string,
  workplaceParent: string,
  phoneParent: string,
  emailParent: string,
  // ----- Documents for student
  idFile: File | null;
  academicFile: File | null;
  birthCertFile: File | null;
  parentIdFile: File | null;
  
}>({
  // ----- Date of Student -----
  firstName: '',
  lastName: '',
  middleName: '',
  idNumber: '',
  birthDate: null,
  gender: '',
  nationality: '',
  institution: '',
  lastGrade: '',
  gradeRequested: '',
  repeatingGrade: false,
  turn: '',
  hasDisability: false,
  discapacityDetails: '',
  directAddress: '',
  houseNumber: '',
  department: '',
  city: '',
  homePhone: '',
  mobilePhone: '',
  email: '',
  // -----Date of Parent -----
  firstNameParent: '',
  lastNameParent: '',
  middleNameParent: '',
  idNumberParent: '',
  birthDateParent: null,
  genderParent: '',
  nationalityParent: '',
  professionParent: '',
  workplaceParent: '',
  phoneParent: '',
  emailParent: '',
  // ----- Documents for student
  idFile: null,
  academicFile: null,
  birthCertFile: null,
  parentIdFile: null,
});

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleDateChange = (date: Dayjs | null) => {
  setFormData((prev) => ({
    ...prev,
    birthDate: date,
  }));
};



  const steps = ['Estudiante', 'Padres', 'Contacto', 'Confirmación'];

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment !== null) setAlignment(newAlignment);
  };

  const handleFileUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  fieldName: keyof typeof formData
) => {
  const file = e.target.files?.[0] || null;
  setFormData((prev) => ({
    ...prev,
    [fieldName]: file,
  }));
};


  const handleFileRemove = (setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    setter(null);
  };

  // Estilos mejorados para los campos
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

  // Estilo para el paper principal con efecto glassmorphism
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

  // Estilo para los títulos de sección
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

  // Estilo mejorado para los botones
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


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg,#090B26, #000000)'
          : 'linear-gradient(135deg, #fdfcfb,#B9BED4)', 
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <Header />
        <Grid container direction="column" sx={{ pt: 14, pb: 5 }}>
          <FormStepper activeStep={activeStep} />
          <Grid container justifyContent="center" sx={{ px: 2}}>
            <Grid size={{ xs: 12, md: 10, lg: 8 }}>
              {/* === Paso 1: Estudiante === */}
              {activeStep === 0 && (
                <Fade in timeout={700}>
                  <Paper elevation={0} sx={paperStyle}>
                    <FormGroup sx={{ gap: 4 }}>
                      <Box sx={sectionTitleStyle}>
                        <PersonIcon sx={{ fontSize: 32 }} />
                        Información Personal del Estudiante
                      </Box>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Nombres" variant="outlined" value={formData.firstName} onChange={handleInputChange} name="firstName" required />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Apellido Paterno" variant="outlined" value={formData.lastName} onChange={handleInputChange} name="lastName" required />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Apellido Materno" variant="outlined" value={formData.middleName} onChange={handleInputChange} name="middleName" required />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Cédula de Identidad" variant="outlined" value={formData.idNumber} onChange={handleInputChange} name="idNumber" required />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <DatePicker
                            label="Fecha de Nacimiento"
                            value={formData.birthDate}
                            onChange={handleDateChange}
                            sx={{
                              ...fieldStyle,
                              width: '100%',
                            }}
                            
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                            
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth size="small" 
                          label="Género" 
                          value={formData.gender}
                          onChange={handleInputChange}
                          name="gender"
                          sx={fieldStyle}>
                            {generoOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select size="small" fullWidth 
                          label="Nacionalidad"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          name="nationality"
                          sx={fieldStyle}>
                            {nacionalidades.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2, opacity: 0.3 }} />

                      <Box sx={sectionTitleStyle}>
                        <SchoolIcon sx={{ fontSize: 32 }} />
                        Información Académica
                      </Box>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 12 }} sx={fieldStyle}>
                          <TextField size="small" fullWidth 
                          label="Institución de Procedencia"
                          value={formData.institution}
                          onChange={handleInputChange}
                          name="institution"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField select size="small" fullWidth label="Último grado cursado"
                          value={formData.lastGrade}
                          onChange={handleInputChange}
                          name="lastGrade"
                        >
                            {gradosCursados.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField select size="small" fullWidth 
                          label="Grado solicitado"
                          value={formData.gradeRequested}
                          onChange={handleInputChange}
                          name="gradeRequested"
                          >
                            {gradosSolicitados.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField size="small" select fullWidth 
                          label="¿Está repitiendo este grado?"
                          value={formData.repeatingGrade ? "SI" : "NO"}
                          onChange={(e) => setFormData((prev) => ({ ...prev, repeatingGrade: e.target.value === "SI" }))}
                          >
                            <MenuItem value="NO">No</MenuItem>
                            <MenuItem value="SI">Sí</MenuItem>
                          </TextField>
                        </Grid>
                         <Grid size={{ xs: 12, md: 6 }}>
                          <Typography
                            sx={{
                              mb: 2,
                              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(1, 87, 155, 0.9)',
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          >
                            Seleccione el turno
                          </Typography>

                          <ToggleButtonGroup
                            size="small"
                            color="primary"
                            value={formData.turn}
                            exclusive
                            onChange={(e, newValue) => {
                              if (newValue !== null) setFormData((prev) => ({ ...prev, turn: newValue }));
                            }}
                            sx={{
                              gap: 2, 
                              display: 'flex',
                              '& .MuiToggleButton-root': {
                                borderRadius: '12px',
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                border: isDark
                                  ? '2px solid rgba(250, 204, 21, 0.3)'
                                  : '2px solid rgba(2, 136, 209, 0.3)',
                                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(1, 87, 155, 0.9)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: isDark
                                    ? 'rgba(250, 204, 21, 0.1)'
                                    : 'rgba(2, 136, 209, 0.1)',
                                  transform: 'translateY(-2px)',
                                },
                                '&.Mui-selected': {
                                  backgroundColor: isDark ? '#facc15' : '#0288d1',
                                  color: isDark ? '#000' : '#fff',
                                  borderColor: isDark ? '#facc15' : '#0288d1',
                                  boxShadow: isDark
                                    ? '0 4px 16px rgba(250, 204, 21, 0.4)'
                                    : '0 4px 16px rgba(2, 136, 209, 0.4)',
                                  '&:hover': {
                                    backgroundColor: isDark ? '#eab308' : '#0277bd',
                                    transform: 'translateY(-2px)',
                                  },
                                },
                              },
                            }}
                          >
                            <ToggleButton size="small" value="mañana">
                              Mañana
                            </ToggleButton>
                            <ToggleButton size="small" value="noche">
                              Noche
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>
                        <Grid size={{ xs: 12, md: 12 }}>
                          <Typography
                            sx={{
                              mb: 2,
                              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(1, 87, 155, 0.9)',
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          >
                            ¿Tiene alguna necesidad especial o discapacidad?
                          </Typography>

                          <ToggleButtonGroup
                            size="small"
                            color="primary"
                            value={formData.hasDisability ? "especificar" : "ninguna"}
                            exclusive
                            onChange={(e, newValue) => {
                              if (newValue !== null) {
                                setFormData((prev) => ({
                                  ...prev,
                                  hasDisability: newValue === "especificar", // convierte a boolean
                                  discapacityDetails: newValue === "ninguna" ? "" : prev.discapacityDetails, // limpia si selecciona "ninguna"
                                }));
                              }
                            }}
                            sx={{
                              gap: 2,
                              display: "flex",
                              "& .MuiToggleButton-root": {
                                borderRadius: "12px",
                                px: 4,
                                py: 1.5,
                                textTransform: "none",
                                border: isDark
                                  ? "2px solid rgba(250, 204, 21, 0.3)"
                                  : "2px solid rgba(2, 136, 209, 0.3)",
                                color: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(1, 87, 155, 0.9)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  backgroundColor: isDark
                                    ? "rgba(250, 204, 21, 0.1)"
                                    : "rgba(2, 136, 209, 0.1)",
                                  transform: "translateY(-2px)",
                                },
                                "&.Mui-selected": {
                                  backgroundColor: isDark ? "#facc15" : "#0288d1",
                                  color: isDark ? "#000" : "#fff",
                                  borderColor: isDark ? "#facc15" : "#0288d1",
                                  boxShadow: isDark
                                    ? "0 4px 16px rgba(250, 204, 21, 0.4)"
                                    : "0 4px 16px rgba(2, 136, 209, 0.4)",
                                  "&:hover": {
                                    backgroundColor: isDark ? "#eab308" : "#0277bd",
                                    transform: "translateY(-2px)",
                                  },
                                },
                              },
                            }}
                          >
                            <ToggleButton size="small" value="ninguna">Ninguna</ToggleButton>
                            <ToggleButton size="small" value="especificar">Sí, especificar</ToggleButton>
                          </ToggleButtonGroup>
                          </Grid>

                          {/* Campo condicional */}
                          {formData.hasDisability && (
                            <Grid size={{ xs: 12, md: 12 }}>
                              <TextField
                                sx={fieldStyle}
                                fullWidth
                                multiline
                                minRows={3}
                                label="Describa la necesidad especial o discapacidad"
                                value={formData.discapacityDetails}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    discapacityDetails: e.target.value,
                                  }))
                                }
                                variant="outlined"
                              />
                            </Grid>
                          )}

                        </Grid>

                      <Divider sx={{ my: 2, opacity: 0.3 }} />

                      <Box sx={sectionTitleStyle}>
                        <HomeIcon sx={{ fontSize: 32 }} />
                        Información de Contacto
                      </Box>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 9 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Dirección Domiciliaria"
                          value={formData.directAddress}
                          onChange={handleInputChange}
                          name="directAddress"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Número de Casa"
                          value={formData.houseNumber}
                          onChange={handleInputChange}
                          name="houseNumber"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Departamento / Estado"
                          value={formData.department}
                          onChange={handleInputChange}
                          name="department"
                           variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Ciudad / Municipio"
                          value={formData.city}
                          onChange={handleInputChange}
                          name="city"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Teléfono Domicilio"
                          value={formData.homePhone}
                          onChange={handleInputChange}
                          name="homePhone"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField sx={fieldStyle} fullWidth 
                          label="Teléfono Móvil"
                          value={formData.mobilePhone}
                          onChange={handleInputChange}
                          name="mobilePhone"
                          variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField sx={fieldStyle} fullWidth label="Correo Electrónico"
                          value={formData.email}
                          onChange={handleInputChange}
                          name="email"
                          variant="outlined" />
                        </Grid>
                      </Grid>

                      <Box mt={4} display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
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
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Limpiar Datos
                        </Button>
                        <Button
                          variant="contained"
                          endIcon={<SendIcon />}
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
                      </Box>
                    </FormGroup>
                  </Paper>
                </Fade>
              )}

              {/* === Paso 2: Padres de familia === */}
              {activeStep === 1 && (
                <Fade in timeout={700}>
                  <Paper elevation={0} sx={paperStyle}>
                    <FormGroup sx={{ gap: 4 }}>
                      <Box sx={sectionTitleStyle}>
                        <PersonIcon sx={{ fontSize: 32 }} />
                        Información de Representante
                      </Box>

                      <ToggleButtonGroup
                        color="secondary"
                        value={alignment}
                        exclusive
                        onChange={handleChange}
                        sx={{
                          mb: 2,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          '& .MuiToggleButton-root': {
                            flex: { xs: '1 1 100%', sm: '0 1 auto' },
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            border: isDark 
                              ? '2px solid rgba(250, 204, 21, 0.3)' 
                              : '2px solid rgba(2, 136, 209, 0.3)',
                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(1, 87, 155, 0.9)',
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                              backgroundColor: isDark ? '#facc15' : '#0288d1',
                              color: isDark ? '#000' : '#fff',
                              borderColor: isDark ? '#facc15' : '#0288d1',
                              boxShadow: isDark 
                                ? '0 4px 16px rgba(250, 204, 21, 0.4)' 
                                : '0 4px 16px rgba(2, 136, 209, 0.4)',
                            },
                          },
                        }}
                      >
                        <ToggleButton value="web">Ambos Padres</ToggleButton>
                        <ToggleButton value="android">Padre o Madre</ToggleButton>
                        <ToggleButton value="ios">Tutor Legal</ToggleButton>
                      </ToggleButtonGroup>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.2rem',
                          color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(1, 87, 155, 0.9)',
                        }}
                      >
                        Información del Padre
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth 
                          label="Nombres"
                          value={formData.firstNameParent}
                          onChange={handleInputChange}
                          name="firstNameParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth 
                          label="Apellido Paterno"
                          value={formData.lastNameParent}
                          onChange={handleInputChange}
                          name="lastNameParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth 
                          label="Apellido Materno"
                          value={formData.middleNameParent}
                          onChange={handleInputChange}
                          name="middleNameParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth 
                          label="Cédula de Identidad" 
                          value={formData.idNumberParent}
                          onChange={handleInputChange}
                          name="idNumberParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <DatePicker
                            sx={fieldStyle}
                            label="Fecha de Nacimiento"
                            value={formData.birthDateParent}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                birthDateParent: date,
                              }))
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth 
                          label="Género" 
                          value={formData.genderParent}
                          onChange={handleInputChange}
                          name="genderParent"
                          sx={fieldStyle}>
                            {generoOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth 
                          label="Nacionalidad" 
                          value={formData.nationalityParent}
                          onChange={handleInputChange}
                          name="nationalityParent"
                          sx={fieldStyle}>
                            {nacionalidades.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth 
                          label="Profesión/ Ocupación" 
                          value={formData.professionParent}
                          onChange={handleInputChange}
                          name="professionParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth 
                          label="Empresa/Lugar de trabajo" 
                          value={formData.workplaceParent}
                          onChange={handleInputChange}
                          name="workplaceParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth 
                          label="Teléfono/ Celular" 
                          value={formData.phoneParent}
                          onChange={handleInputChange}
                          name="phoneParent"
                          sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth 
                          label="Correo Electrónico"
                          value={formData.emailParent}
                          onChange={handleInputChange}
                          name="emailParent"
                          sx={fieldStyle} />
                        </Grid>
                      </Grid>

                      <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleBack}
                          startIcon={<ArrowBackIcon />}
                          sx={{
                            ...buttonStyle,
                            borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Atrás
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                            Limpiar Datos
                          </Button>
                          <Button
                            size='small'
                            variant="contained"
                            color="success"
                            endIcon={<SendIcon />}
                            onClick={handleNext}
                            sx={{
                              ...buttonStyle,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                            }}
                          >
                            Siguiente
                          </Button>
                        </Box>
                      </Box>
                    </FormGroup>
                  </Paper>
                </Fade>
              )}

              {/* === Paso 3: Documentos === */}
              {activeStep === 2 && (
                <Fade in timeout={700}>
                  <Paper elevation={0} sx={paperStyle}>
                    <FormGroup sx={{ gap: 4 }}>
                      <Box sx={sectionTitleStyle}>
                        <UploadFileIcon sx={{ fontSize: 32 }} />
                        Documentos Requeridos
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: isDark 
                            ? 'rgba(250, 204, 21, 0.05)' 
                            : 'rgba(2, 136, 209, 0.05)',
                          borderRadius: '16px',
                          p: 3,
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
                            ✔️ Formatos permitidos: PDF, JPG, PNG (máximo 5MB por archivo)
                          </Typography>
                          <Typography component="li" sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                            ✔️ Los documentos deben ser legibles y mostrar toda la información claramente
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          fontSize: '1.2rem',
                          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,0.9)',
                        }}
                      >
                        Documentos del Estudiante
                      </Typography>

                      {/* Cédula de Identidad */}
                      <Box>
                        <Typography
                          component="div" 
                          fontWeight={600}
                          mb={2}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          🪪 Documentos de Identidad del Estudiante
                          
                        </Typography>

                        <Paper
                          variant="outlined"
                          sx={{
                            borderStyle: 'dashed',
                            borderWidth: '3px',
                            borderRadius: '16px',
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: idFile
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(16, 185, 129, 0.05)'
                              : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(1,87,155,0.02)',
                            borderColor: idFile
                              ? '#10b981'
                              : isDark
                              ? 'rgba(250, 204, 21, 0.3)'
                              : 'rgba(2, 136, 209, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(1,87,155,0.05)',
                              transform: 'translateY(-4px)',
                              boxShadow: isDark
                                ? '0 12px 32px rgba(250, 204, 21, 0.2)'
                                : '0 12px 32px rgba(2, 136, 209, 0.2)',
                            },
                          }}
                        >
                          {idFile ? (
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                  <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                                    {idFile.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {(idFile.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handlePreview(idFile)}
                                  sx={{
                                    backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                                    '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleFileRemove(setIdFile)}
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
                              <UploadFileIcon
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
                                Cédula de identidad del estudiante
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
                                  name="idFile"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0] || null;
                                   handleFileUpload(e, "idFile");
                                   setIdFile(file);
                                 }}
                                />
                              </Button>
                            </>
                          )}
                        </Paper>
                      </Box>

                      {/* Certificado de Nacimiento */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          mb={2}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)',
                          }}
                        >
                          🪪 Certificado de Nacimiento del Estudiante
                          <Chip
                            label="Requerido"
                            size="small"
                            sx={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderStyle: 'dashed',
                            borderWidth: '3px',
                            borderRadius: '16px',
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: birthCertFile
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(16, 185, 129, 0.05)'
                              : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(1,87,155,0.02)',
                            borderColor: birthCertFile
                              ? '#10b981'
                              : isDark
                              ? 'rgba(250, 204, 21, 0.3)'
                              : 'rgba(2, 136, 209, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(1,87,155,0.05)',
                              transform: 'translateY(-4px)',
                              boxShadow: isDark
                                ? '0 12px 32px rgba(250, 204, 21, 0.2)'
                                : '0 12px 32px rgba(2, 136, 209, 0.2)',
                            },
                          }}
                        >
                          {birthCertFile ? (
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                  <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                                    {birthCertFile.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {(birthCertFile.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handlePreview(birthCertFile)}
                                  sx={{
                                    backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                                    '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleFileRemove(setBirthCertFile)}
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
                              <UploadFileIcon
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
                                Certificado de nacimiento del estudiante
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
                                <input hidden
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                   const file = e.target.files?.[0] || null;
                                   handleFileUpload(e, "birthCertFile");
                                   setBirthCertFile(file);
                                 }}
                                />
                              </Button>
                            </>
                          )}
                        </Paper>
                      </Box>

                      {/* Documentos Académicos */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          mb={2}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)',
                          }}
                        >
                          📘 Documentos Académicos
                          <Chip
                            label="Requerido"
                            size="small"
                            sx={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderStyle: 'dashed',
                            borderWidth: '3px',
                            borderRadius: '16px',
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: academicFile
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(16, 185, 129, 0.05)'
                              : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(1,87,155,0.02)',
                            borderColor: academicFile
                              ? '#10b981'
                              : isDark
                              ? 'rgba(250, 204, 21, 0.3)'
                              : 'rgba(2, 136, 209, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(1,87,155,0.05)',
                              transform: 'translateY(-4px)',
                              boxShadow: isDark
                                ? '0 12px 32px rgba(250, 204, 21, 0.2)'
                                : '0 12px 32px rgba(2, 136, 209, 0.2)',
                            },
                          }}
                        >
                          {academicFile ? (
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                  <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                                    {academicFile.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {(academicFile.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handlePreview(academicFile)}
                                  sx={{
                                    backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                                    '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleFileRemove(setAcademicFile)}
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
                              <UploadFileIcon
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
                                Libreta de notas de la gestión pasada o actual
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
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleFileUpload(e, "academicFile");
                                    setAcademicFile(file);
                                  }}
                                />
                              </Button>
                            </>
                          )}
                        </Paper>
                      </Box>
                      <Divider sx={{ my: 2, opacity: 0.3 }} />

                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          fontSize: '1.2rem',
                          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,0.9)',
                        }}
                      >
                        Documentos de los Padres/Tutores
                      </Typography>

                      {/* Cédula de Identidad de Padres */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          mb={2}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)',
                          }}
                        >
                          🪪 Cédula de Identidad del Padre/Madre/Tutor
                          <Chip
                            label="Requerido"
                            size="small"
                            sx={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </Typography>

                        <Paper
                          variant="outlined"
                          sx={{
                            borderStyle: 'dashed',
                            borderWidth: '3px',
                            borderRadius: '16px',
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: parentIdFile
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(16, 185, 129, 0.05)'
                              : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(1,87,155,0.02)',
                            borderColor: parentIdFile
                              ? '#10b981'
                              : isDark
                              ? 'rgba(250, 204, 21, 0.3)'
                              : 'rgba(2, 136, 209, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(1,87,155,0.05)',
                              transform: 'translateY(-4px)',
                              boxShadow: isDark
                                ? '0 12px 32px rgba(250, 204, 21, 0.2)'
                                : '0 12px 32px rgba(2, 136, 209, 0.2)',
                            },
                          }}
                        >
                          {parentIdFile ? (
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                  <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                                    {parentIdFile.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {(parentIdFile.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handlePreview(parentIdFile)}
                                  sx={{
                                    backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                                    '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleFileRemove(setParentIdFile)}
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
                              <UploadFileIcon
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
                                Cédula de identidad del padre, madre o tutor
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
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                   const file = e.target.files?.[0] || null;
                                   handleFileUpload(e, "parentIdFile");
                                   setParentIdFile(file);
                                 }}
                                />
                              </Button>
                            </>
                          )}
                        </Paper>
                      </Box>

                      <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleBack}
                          startIcon={<ArrowBackIcon />}
                          sx={{
                            ...buttonStyle,
                            borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Atrás
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<SendIcon />}
                          sx={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                          }}
                        >
                          Siguiente
                        </Button>
                      </Box>
                      
                    </FormGroup>
                  </Paper>
                </Fade>
              )}

              {/* === Paso 4: Confirmación === */}
              {activeStep === 3 && (
              <Fade in timeout={700}>
                <Paper elevation={0} sx={paperStyle}>
                  <FormGroup sx={{ gap: 4 }}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          mb: 3,
                          animation: 'pulse 2s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                            '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 20px rgba(16, 185, 129, 0)' },
                          },
                        }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#fff' }} />
                      </Box>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          mb: 2,
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        ¡Revisa tu Información!
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(1,87,155,0.8)',
                          maxWidth: 600,
                          mx: 'auto',
                          lineHeight: 1.6,
                        }}
                      >
                        Verifica que todos los datos sean correctos antes de enviar tu solicitud de inscripción.
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2, opacity: 0.3 }} />

                    {/* Resumen: Información del Estudiante */}
                    <Box
                      sx={{
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.05)'
                          : 'rgba(2, 136, 209, 0.05)',
                        borderRadius: '16px',
                        p: 3,
                        border: isDark
                          ? '2px solid rgba(250, 204, 21, 0.2)'
                          : '2px solid rgba(2, 136, 209, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <PersonIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography
                          fontWeight={700}
                          sx={{
                            fontSize: '1.3rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Información Personal del Estudiante
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Nombre Completo
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                               {formData.firstName} {formData.lastName} {formData.middleName}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Cédula de Identidad
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.idNumber}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Fecha de Nacimiento
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.birthDate ? formData.birthDate.format('DD/MM/YYYY') : ''}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Género
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.gender}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Nacionalidad
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.nationality}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Resumen: Información Académica */}
                    <Box
                      sx={{
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.05)'
                          : 'rgba(2, 136, 209, 0.05)',
                        borderRadius: '16px',
                        p: 3,
                        border: isDark
                          ? '2px solid rgba(250, 204, 21, 0.2)'
                          : '2px solid rgba(2, 136, 209, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <SchoolIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography
                          fontWeight={700}
                          sx={{
                            fontSize: '1.3rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Información Académica
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Institución de Procedencia
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.institution}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Último Grado Cursado
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.lastGrade}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Grado Solicitado
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.gradeRequested}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Turno
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.turn}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              ¿Repitiendo?
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.repeatingGrade ? 'Sí' : 'No'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Resumen: Información de Contacto */}
                    <Box
                      sx={{
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.05)'
                          : 'rgba(2, 136, 209, 0.05)',
                        borderRadius: '16px',
                        p: 3,
                        border: isDark
                          ? '2px solid rgba(250, 204, 21, 0.2)'
                          : '2px solid rgba(2, 136, 209, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <HomeIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography
                          fontWeight={700}
                          sx={{
                            fontSize: '1.3rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Información de Contacto
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Dirección
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.directAddress}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Teléfono Móvil
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.mobilePhone}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Correo Electrónico
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.email}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Resumen: Información de Padres */}
                    <Box
                      sx={{
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.05)'
                          : 'rgba(2, 136, 209, 0.05)',
                        borderRadius: '16px',
                        p: 3,
                        border: isDark
                          ? '2px solid rgba(250, 204, 21, 0.2)'
                          : '2px solid rgba(2, 136, 209, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <PersonIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography
                          fontWeight={700}
                          sx={{
                            fontSize: '1.3rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Información del Padre/Madre/Tutor
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Nombre Completo
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.firstNameParent} {formData.lastNameParent} {formData.middleNameParent}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Profesión
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.professionParent}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Teléfono
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.phoneParent}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                              Correo Electrónico
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 }}>
                              {formData.emailParent}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Resumen: Documentos */}
                    <Box
                      sx={{
                        backgroundColor: isDark
                          ? 'rgba(250, 204, 21, 0.05)'
                          : 'rgba(2, 136, 209, 0.05)',
                        borderRadius: '16px',
                        p: 3,
                        border: isDark
                          ? '2px solid rgba(250, 204, 21, 0.2)'
                          : '2px solid rgba(2, 136, 209, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <UploadFileIcon sx={{ fontSize: 28, color: isDark ? '#facc15' : '#0288d1' }} />
                        <Typography
                          fontWeight={700}
                          sx={{
                            fontSize: '1.3rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          Documentos Adjuntos
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        {idFile && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid #10b981',
                            }}>
                              <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                                  Cédula de Identidad del Estudiante
                                </Typography>
                                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {idFile.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        
                        {birthCertFile && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid #10b981',
                            }}>
                              <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                                  Certificado de Nacimiento
                                </Typography>
                                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {birthCertFile.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        
                        {academicFile && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid #10b981',
                            }}>
                              <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                                  Documentos Académicos
                                </Typography>
                                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {academicFile.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        
                        {parentIdFile && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: '12px',
                              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid #10b981',
                            }}>
                              <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 }}>
                                  CI del Padre/Madre/Tutor
                                </Typography>
                                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {parentIdFile.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                          ...buttonStyle,
                          borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                          color: isDark ? '#facc15' : '#0288d1',
                        }}
                      >
                        Atrás
                      </Button>
                      <Button
                        variant="contained"
                        endIcon={<CheckCircleOutlineIcon />}
                        sx={{
                          ...buttonStyle,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          px: 5,
                          py: 2,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)',
                          },
                        }}
                      >
                        Confirmar y Enviar Inscripción
                      </Button>
                    </Box>
                  </FormGroup>
                </Paper>
              </Fade>
            )}
              {/* Modal de Previsualización */}
              <Dialog
                open={!!previewFile}
                onClose={() => {
                  if (previewFile) {
                    URL.revokeObjectURL(previewFile.url);
                  }
                  setPreviewFile(null);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: '16px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                  }
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} color={isDark ? '#facc15' : '#0288d1'}>
                      {previewFile?.name}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        if (previewFile) {
                          URL.revokeObjectURL(previewFile.url);
                        }
                        setPreviewFile(null);
                      }}
                      sx={{
                        color: '#ef4444',
                        '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  {previewFile && (
                    <Box sx={{ textAlign: 'center', maxHeight: '70vh', overflow: 'auto' }}>
                      {previewFile.type === 'application/pdf' ? (
                        <iframe
                          src={previewFile.url}
                          style={{
                            width: '100%',
                            height: '70vh',
                            border: 'none',
                            borderRadius: '12px',
                          }}
                          title="PDF Preview"
                        />
                      ) : (
                        <img
                          src={previewFile.url}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            borderRadius: '12px',
                            objectFit: 'contain',
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </Dialog>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}