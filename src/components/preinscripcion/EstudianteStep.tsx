// components/preinscripcion/EstudianteStep.tsx
'use client';
import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import { PreEstudianteForm, ErroresFormulario } from '@/types/preinscripcionTypes';
import Header from '../../app/login/Header';

interface EstudianteStepProps {
  data: PreEstudianteForm;
  errors: ErroresFormulario;
  onChange: (field: string, value: any) => void;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const GRADOS_SOLICITADOS = [
  { value: 'PRE-KINDER', label: 'Pre-Kinder' },
  { value: 'KINDER', label: 'Kinder' },
  { value: 'PRIMERO_PRIMARIA', label: 'Primero de Primaria' },
  { value: 'SEGUNDO_PRIMARIA', label: 'Segundo de Primaria' },
  { value: 'TERCERO_PRIMARIA', label: 'Tercero de Primaria' },
  { value: 'CUARTO_PRIMARIA', label: 'Cuarto de Primaria' },
  { value: 'QUINTO_PRIMARIA', label: 'Quinto de Primaria' },
  { value: 'SEXTO_PRIMARIA', label: 'Sexto de Primaria' },
  { value: 'PRIMERO_SECUNDARIA', label: 'Primero de Secundaria' },
  { value: 'SEGUNDO_SECUNDARIA', label: 'Segundo de Secundaria' },
  { value: 'TERCERO_SECUNDARIA', label: 'Tercero de Secundaria' },
  { value: 'CUARTO_SECUNDARIA', label: 'Cuarto de Secundaria' },
  { value: 'QUINTO_SECUNDARIA', label: 'Quinto de Secundaria' },
  { value: 'SEXTO_SECUNDARIA', label: 'Sexto de Secundaria' },
];

const GRADOS_CURSADOS = [
  { value: 'NINGUNO', label: 'Será su primer año en la escuela' },
  ...GRADOS_SOLICITADOS,
];

export default function EstudianteStep({ data, errors, onChange }: EstudianteStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fieldStyle = {
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
      transition: 'all 0.3s ease',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(1, 87, 155, 0.2)',
      borderWidth: '2px',
    },
  };

  const sectionTitleStyle = {
    mb: 3,
    fontSize: { xs: '1.3rem', md: '1.5rem' },
    fontWeight: 700,
    background: isDark
      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  };

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      
      {/* Información Personal */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <PersonIcon sx={{ fontSize: 32 }} />
          Información Personal del Estudiante
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Nombres *"
              value={data.nombres}
              onChange={(e) => onChange('nombres', e.target.value)}
              error={!!errors.nombres}
              helperText={errors.nombres}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Apellido Paterno *"
              value={data.apellido_paterno}
              onChange={(e) => onChange('apellido_paterno', e.target.value)}
              error={!!errors.apellido_paterno}
              helperText={errors.apellido_paterno}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Apellido Materno"
              value={data.apellido_materno}
              onChange={(e) => onChange('apellido_materno', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Cédula de Identidad"
              value={data.ci}
              onChange={(e) => onChange('ci', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Lugar de Nacimiento"
              value={data.lugar_nacimiento}
              onChange={(e) => onChange('lugar_nacimiento', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Contacto de Emergencia"
              value={data.contacto_emergencia}
              onChange={(e) => onChange('contacto_emergencia', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Teléfono de Emergencia"
              value={data.telefono_emergencia}
              onChange={(e) => onChange('telefono_emergencia', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <DatePicker
              format="DD/MM/YYYY"
              label="Fecha de Nacimiento *"
              value={data.fecha_nacimiento}
              onChange={(date) => onChange('fecha_nacimiento', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.fecha_nacimiento,
                  helperText: errors.fecha_nacimiento,
                },
              }}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Género *"
              value={data.genero}
              onChange={(e) => onChange('genero', e.target.value)}
              error={!!errors.genero}
              helperText={errors.genero}
              sx={fieldStyle}
            >
              {GENEROS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Información Académica */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <SchoolIcon sx={{ fontSize: 32 }} />
          Información Académica
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12}} >
            <TextField
              fullWidth
              label="Unidad Educativa de Procedencia"
              value={data.institucion_procedencia}
              onChange={(e) => onChange('institucion_procedencia', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Último Grado Cursado"
              value={data.ultimo_grado_cursado}
              onChange={(e) => onChange('ultimo_grado_cursado', e.target.value)}
              sx={fieldStyle}
            >
              {GRADOS_CURSADOS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Grado Solicitado *"
              value={data.grado_solicitado}
              onChange={(e) => onChange('grado_solicitado', e.target.value)}
              error={!!errors.grado_solicitado}
              helperText={errors.grado_solicitado}
              sx={fieldStyle}
            >
              {GRADOS_SOLICITADOS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="¿Repite Grado?"
              value={data.repite_grado ? 'SI' : 'NO'}
              onChange={(e) => onChange('repite_grado', e.target.value === 'SI')}
              sx={fieldStyle}
            >
              <MenuItem value="NO">No</MenuItem>
              <MenuItem value="SI">Sí</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{xs:12, md:6}}>
            <Typography sx={{ mb: 2, fontWeight: 600 }}>
              Turno Solicitado *
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={data.turno_solicitado}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) onChange('turno_solicitado', newValue);
              }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                  },
                },
              }}
            >
              <ToggleButton value="mañana">Mañana</ToggleButton>
              <ToggleButton value="tarde">Tarde</ToggleButton>
            </ToggleButtonGroup>
            {errors.turno_solicitado && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.turno_solicitado}
              </Typography>
            )}
          </Grid>

          <Grid size={{xs:12, md:12}}>
            <Typography sx={{ mb: 2, fontWeight: 600 }}>
              ¿Tiene alguna discapacidad?
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={data.tiene_discapacidad ? 'SI' : 'NO'}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  onChange('tiene_discapacidad', newValue === 'SI');
                  if (newValue === 'NO') onChange('tipo_discapacidad', '');
                }
              }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                  },
                },
              }}
            >
              <ToggleButton value="NO">No</ToggleButton>
              <ToggleButton value="SI">Sí, especificar</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {data.tiene_discapacidad && (
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Describa la discapacidad"
                value={data.tipo_discapacidad}
                onChange={(e) => onChange('tipo_discapacidad', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Información de Contacto */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <HomeIcon sx={{ fontSize: 32 }} />
          Información de Contacto
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12, md:8}}>
            <TextField
              fullWidth
              label="Dirección"
              value={data.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Zona"
              value={data.zona}
              onChange={(e) => onChange('zona', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Ciudad"
              value={data.ciudad}
              onChange={(e) => onChange('ciudad', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}  >
            <TextField
              fullWidth
              label="Teléfono"
              value={data.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}  >
            <TextField
              fullWidth
              label="Correo Electrónico"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              type="email"
              sx={fieldStyle}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}