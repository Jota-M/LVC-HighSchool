'use client';
import Header from '../Navbar';
import React, { useState } from 'react';
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
  Collapse
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

  const steps = ['Estudiante', 'Padres', 'Contacto', 'Confirmación'];

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment !== null) setAlignment(newAlignment);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file) {
      setter(file);
    }
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
                          <TextField fullWidth size="small" label="Nombres" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Apellido Paterno" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Apellido Materno" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField fullWidth size="small" label="Cédula de Identidad" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <DatePicker
                            sx={{
                              ...fieldStyle,
                              width: '100%',
                            }}
                            label="Fecha de Nacimiento"
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth size="small" label="Género" sx={fieldStyle}>
                            {generoOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select size="small" fullWidth label="Nacionalidad" sx={fieldStyle}>
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
                          <TextField size="small" fullWidth label="Institución de Procedencia" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField select size="small" fullWidth label="Último grado cursado">
                            {gradosCursados.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField select size="small" fullWidth label="Grado solicitado">
                            {gradosSolicitados.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                          <TextField size="small" select fullWidth label="¿Está repitiendo este grado?">
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
                            value={turno}
                            exclusive
                            onChange={(e, newValue) => {
                              if (newValue !== null) setTurno(newValue);
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
                            value={tieneDiscapacidad}
                            exclusive
                            onChange={(e, newValue) => {
                              if (newValue !== null) setTieneDiscapacidad(newValue);
                            }}
                            sx={{
                              gap: 2, // 💥 <-- esta línea crea espacio entre los botones
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
                            <ToggleButton size="small" value="ninguna">Ninguna</ToggleButton>
                            <ToggleButton size="small" value="especificar">Sí, especificar</ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>

                        {tieneDiscapacidad === "especificar" && (
                          <Grid size={{ xs: 12, md: 12 }}>
                          <TextField
                            sx={fieldStyle}
                            fullWidth
                            multiline
                            minRows={3}
                            label="Describa la necesidad especial o discapacidad"
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
                          <TextField sx={fieldStyle} fullWidth label="Dirección Domiciliaria" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField sx={fieldStyle} fullWidth label="Número de Casa" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth label="Departamento / Estado" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth label="Ciudad / Municipio" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField sx={fieldStyle} fullWidth label="Teléfono Domicilio" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField sx={fieldStyle} fullWidth label="Teléfono Móvil" variant="outlined" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField sx={fieldStyle} fullWidth label="Correo Electrónico" variant="outlined" />
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
                          <TextField fullWidth label="Nombres" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth label="Apellido Paterno" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth label="Apellido Materno" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField fullWidth label="Cédula de Identidad" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <DatePicker
                            sx={fieldStyle}
                            label="Fecha de Nacimiento"
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth label="Género" sx={fieldStyle}>
                            {generoOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField select fullWidth label="Nacionalidad" sx={fieldStyle}>
                            {nacionalidades.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Profesión/ Ocupación" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Empresa/Lugar de trabajo" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Teléfono/ Celular" sx={fieldStyle} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Correo Electrónico" sx={fieldStyle} />
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
                          <Chip
                            label="Requerido"
                            size="small"
                            sx={{
                              backgroundColor: "#ef4444",
                              color: "#fff",
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
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(e, setIdFile)}
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
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(1,87,155,0.02)',
                            borderColor: isDark
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
                            <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" />
                          </Button>
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
                                  onChange={(e) => handleFileUpload(e, setAcademicFile)}
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
                          ¡Casi listo!
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
                          Revisa que toda la información ingresada sea correcta antes de enviar tu solicitud de inscripción.
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2, opacity: 0.3 }} />

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
                        <Typography
                          fontWeight={700}
                          sx={{
                            mb: 2,
                            fontSize: '1.1rem',
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          📋 Información a revisar:
                        </Typography>
                        <Box component="ul" sx={{ mt: 2, mb: 0, pl: 3 }}>
                          <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                            ✔️ Datos personales del estudiante
                          </Typography>
                          <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                            ✔️ Información académica y de contacto
                          </Typography>
                          <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                            ✔️ Datos de los padres o tutores
                          </Typography>
                          <Typography component="li" sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
                            ✔️ Documentos adjuntos
                          </Typography>
                        </Box>
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
                          Finalizar Inscripción
                        </Button>
                      </Box>
                    </FormGroup>
                  </Paper>
                </Fade>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}