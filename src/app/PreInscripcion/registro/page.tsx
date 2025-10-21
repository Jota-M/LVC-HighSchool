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
  ThemeProvider
  
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
  const fieldStyle = {
  '& .MuiInputBase-root': {
    borderRadius: 2,
    transition: 'all 0.3s ease',
  },

  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: isDark ? '#ffffff' : '#01579b',
  },

  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: isDark ? '#facc15' : '#01579b',
  },

  '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: isDark ? '#facc15' : '#01579b',
  },

  '&:hover .MuiInputLabel-root': {
    color: isDark ? '#ffffff' : '#01579b',
  },

  '& .MuiInputLabel-root.Mui-focused': {
    color: isDark ? '#ffffff' : '#01579b',
  },
  '& .MuiInputBase-input': {
  color: isDark ? '#ffffff' : '#01579b',
},

};

  return (
    <ThemeProvider theme={fieldStyle}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Header />
      <Grid container direction="column" sx={{ minHeight: '100vh', mt: 14 }}>
        <FormStepper activeStep={activeStep} />
        <Grid container justifyContent="center" sx={{ px: 2, pb: 5 }}>
          <Grid size={{ xs: 12, md: 10, lg: 8 }}>
            {/* === Paso 1: Estudiante === */}
            {activeStep === 0 && (
              <Fade in timeout={700}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 5,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#0B1326' : '#ffffff',
                    fontFamily:'Inter'
                  }}
                >
                  <FormGroup sx={{ gap: 3  }}>
                    <Typography
                      
                      sx={{
                        m:{xs:1,md:2},
                        
                        fontSize: { xs: "1.2rem", md: "1.7rem" },
                        textShadow: `0 0 8px ${theme.palette.primary.main}40`,
                        color: isDark ? "#facc15" : "#01579b",
                      }}> Información Personal del Estudiante
                    </Typography>
                    <Grid container spacing={2} >
                      <Grid size={{ xs: 12, md: 6 }} sx={fieldStyle}>
                        <TextField fullWidth label="Nombres" variant="outlined" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}sx={fieldStyle}>
                        <TextField fullWidth label="Apellido Paterno" variant="outlined" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}sx={fieldStyle}>
                        <TextField fullWidth label="Apellido Materno" variant="outlined" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}sx={fieldStyle}>
                        <TextField fullWidth label="Cédula de Identidad" variant="outlined" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <DatePicker sx={{color:'red',border:isDark?'1px solid #ffffff':'1px solid #01579b'}} label="Fecha de Nacimiento" slotProps={{ textField: { fullWidth: true,   } }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="Género"sx={fieldStyle}>
                          {generoOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="Nacionalidad"sx={fieldStyle}>
                          {nacionalidades.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 12 }}>
                        <Typography
                      sx={{
                        m:{xs:2,md:2},
                        
                        fontSize: { xs: "1.2rem", md: "1.7rem" },
                        textShadow: `0 0 8px ${theme.palette.primary.main}40`,
                        color: isDark ? "#facc15" : "#01579b",
                      }}> Información Academica
                    </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 12 }}sx={fieldStyle}>
                        <TextField fullWidth label="Intitucion de Procedencia" variant="outlined" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }} sx={fieldStyle}>
                        <TextField select fullWidth label="Ultimo grado cursado">
                        {gradosCursados.map((option) => (
                            <MenuItem  key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}sx={fieldStyle}>
                        <TextField select fullWidth label="Grado solicitado">
                        {gradosSolicitados.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}sx={fieldStyle}>
                        <TextField
                            select
                            fullWidth
                            label="¿Está repitiendo este grado?"
                            >
                            <MenuItem value="NO">No</MenuItem>
                            <MenuItem value="SI">Sí</MenuItem>
                        </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3}}>
                          <TextField
                            sx={fieldStyle}
                            select
                            fullWidth
                            label="¿Tiene alguna necesidad especial o discapacidad?"
                            value={tieneDiscapacidad}
                            onChange={(e) => setTieneDiscapacidad(e.target.value)}
                          >
                            <MenuItem value="ninguna">Ninguna</MenuItem>
                            <MenuItem value="especificar">Especificar</MenuItem>
                          </TextField>
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
                        <Grid size={{ xs: 12, md: 12 }}>
                        <Typography
                          sx={{
                            m:{xs:2,md:2},
                            
                            fontSize: { xs: "1.2rem", md: "1.7rem" },
                            textShadow: `0 0 8px ${theme.palette.primary.main}40`,
                            color: isDark ? "#facc15" : "#01579b",
                          }}> Información de Contacto
                        </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 9 }} >
                            <TextField sx={fieldStyle} fullWidth label="Direccion Domiciliaria" variant="outlined" />
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

                    <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
                      <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
                        Limpiar Datos
                      </Button>
                      <Button variant="contained" endIcon={<SendIcon />} onClick={handleNext}>
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
                <Paper
                  elevation={6}
                  sx={{
                    p: 5,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#0B1326' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#111827',
                  }}
                >
                  <FormGroup sx={{ gap: 3 }}>
                    <Typography variant="h3" fontWeight="bold">
                      Información de Representante
                    </Typography>

                    <ToggleButtonGroup
                    
                      color="secondary"
                      value={alignment}
                      exclusive
                      onChange={handleChange}
                      sx={{ mb: 3 ,fieldStyle}}
                    >
                      <ToggleButton  value="web">Ambos Padres</ToggleButton>
                      <ToggleButton value="android">Padre o Madre</ToggleButton>
                      <ToggleButton value="ios">Tutor Legal</ToggleButton>
                    </ToggleButtonGroup>

                    <Typography fontWeight="bold">Información del Padre</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Nombres" sx={fieldStyle}/>
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
                        <DatePicker sx={{color:'red',border:isDark?'1px solid #ffffff':'1px solid #01579b'}} label="Fecha de Nacimiento" slotProps={{ textField: { fullWidth: true } }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="Género" sx={fieldStyle} >
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
                        <TextField fullWidth label="Profesión/ Ocupación" sx={fieldStyle}/>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Empresa/Lugar de trabajo" sx={fieldStyle}/>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Teléfono/ Celular" sx={fieldStyle}/>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Correo Electrónico" sx={fieldStyle}/>
                      </Grid>
                    </Grid>
                    <Box mt={4} display="flex" justifyContent="space-between" sx={{gap:2}}>
                      <Button variant="outlined" color='secondary'onClick={handleBack} startIcon={<ArrowBackIcon />}>
                        Atrás
                        </Button>
                      <Box sx={{display:'flex',gap:2}}>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} >
                        Limpiar Datos
                        </Button>
                      <Button variant="contained" color="success" endIcon={<SendIcon />} onClick={handleNext}>
                        Siguiente
                      </Button>
                      </Box>
                    </Box>
                  </FormGroup>
                </Paper>
              </Fade>
            )}

            {/* === Paso 3: Contacto === */}
            {activeStep === 2 && (
              <Fade in timeout={700}>
                <Paper sx={{ p: 5, borderRadius: 4, bgcolor: isDark ? '#0B1326' : '#ffffff',}}>
                  <Typography fontWeight="bold">Documentos Requeridos</Typography>
                  <Box
            sx={{
              backgroundColor: isDark ? '#0f172a' : '#e0f2f1',
              borderRadius: 2,
              p: 2,
              mb: 4,
            }}
          >
            <Typography fontWeight="bold">📄 Instrucciones para la Carga de Documentos</Typography>
            <ul style={{ marginTop: 10, marginBottom: 0 }}>
              <li>✔️ Asegúrate de que los documentos estén escaneados en buena calidad</li>
              <li>✔️ Formatos permitidos: PDF, JPG, PNG (máximo 5MB por archivo)</li>
              <li>✔️ Los documentos deben ser legibles y mostrar toda la información claramente</li>
            </ul>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Documentos del Estudiante
          </Typography>

          {/* Documentos de Identidad */}
          <Box mb={3}>
            <Typography fontWeight="medium" mb={1}>
              🪪 Documentos de Identidad del Estudiante <Typography component="span" color="error"> (Requerido)</Typography>
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                borderStyle: 'dashed',
                p: 3,
                textAlign: 'center',
                backgroundColor: idFile ? '#e6ffed' : 'inherit',
              }}
            >
              {idFile ? (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>{idFile.name} ({(idFile.size / 1024 / 1024).toFixed(1)} MB)</Typography>
                  <Box>
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleFileRemove(setIdFile)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <UploadFileIcon sx={{ fontSize: 40, color: 'gray' }} />
                  <Typography variant="body2" mt={1}>
                    Cédula de identidad del estudiante
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2 }}
                  >
                    Seleccionar
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
          <Box mb={3}>
            <Typography fontWeight="medium" mb={1}>
              🪪 Certificado de Nacimiento del Estudiante <Typography component="span" color="error"> (Requerido)</Typography>
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                borderStyle: 'dashed',
                p: 3,
                textAlign: 'center',
                backgroundColor: idFile ? '#e6ffed' : 'inherit',
              }}
            >
              {idFile ? (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>{idFile.name} ({(idFile.size / 1024 / 1024).toFixed(1)} MB)</Typography>
                  <Box>
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleFileRemove(setIdFile)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <UploadFileIcon sx={{ fontSize: 40, color: 'gray' }} />
                  <Typography variant="body2" mt={1}>
                    Certificado de nacimiento del estudiante
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2 }}
                  >
                    Seleccionar
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
          {/* Documentos Académicos */}
          <Box mb={4}>
            <Typography fontWeight="medium" mb={1}>
              📘 Documentos Académicos <Typography component="span" color="error"> (Requerido)</Typography>
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                borderStyle: 'dashed',
                p: 3,
                textAlign: 'center',
                backgroundColor: academicFile ? '#fff8e1' : 'inherit',
              }}
            >
              {academicFile ? (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>{academicFile.name} ({(academicFile.size / 1024 / 1024).toFixed(1)} MB)</Typography>
                  <Box>
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleFileRemove(setAcademicFile)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <UploadFileIcon sx={{ fontSize: 40, color: 'gray' }} />
                  <Typography variant="body2" mt={1}>
                    Libreta de notas de la gestión pasada o actual
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                  >
                    Seleccionar
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


                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={handleBack}>
                      Atrás
                    </Button>
                    <Button variant="contained" onClick={handleNext}>
                      Siguiente
                    </Button>
                  </Box>
                </Paper>
              </Fade>
            )}

            {/* === Paso 4: Confirmación === */}
            {activeStep === 3 && (
              <Fade in timeout={700}>
                <Paper sx={{ p: 5, borderRadius: 4, bgcolor: isDark ? '#1e293b' : '#fff' }}>
                  <Typography fontWeight="bold" mb={2}>
                    Confirmación
                  </Typography>
                  <Typography>Revise que toda la información ingresada sea correcta.</Typography>
                  <Box mt={4} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={handleBack}>
                      Atrás
                    </Button>
                    <Button variant="contained">Finalizar</Button>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Grid>
        </Grid>
      </Grid>
    </LocalizationProvider>
    </ThemeProvider>
  );
}
