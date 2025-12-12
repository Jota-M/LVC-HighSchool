// components/preinscripcion/PadresStep.tsx
'use client';
import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PeopleIcon from '@mui/icons-material/People';
import { PreTutorForm, ErroresFormulario } from '@/types/preinscripcionTypes';

interface PadresStepProps {
  data: PreTutorForm;
  errors: ErroresFormulario;
  onChange: (field: string, value: any) => void;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const TIPOS_REPRESENTANTE = [
  { value: 'Ambos Padres', label: 'Ambos Padres' },
  { value: 'Padre', label: 'Solo Padre' },
  { value: 'Madre', label: 'Solo Madre' },
  { value: 'Tutor Legal', label: 'Tutor Legal' },
];

const PARENTESCOS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'abuelo', label: 'Abuelo' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'tio', label: 'Tío' },
  { value: 'tia', label: 'Tía' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS_CIVILES = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union_libre', label: 'Unión Libre' },
];

const NIVELES_EDUCACION = [
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'ninguno', label: 'Ninguno' },
];

export default function PadresStep({ data, errors, onChange }: PadresStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Validaciones en tiempo real
  const handleNameInput = (field: string, value: string) => {
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (namePattern.test(value) || value === '') {
      onChange(field, value);
    }
  };

  const handlePhoneInput = (field: string, value: string) => {
    const phonePattern = /^[0-9\s\-\(\)\+]*$/;
    if (phonePattern.test(value) || value === '') {
      onChange(field, value);
    }
  };

  const handleEmailInput = (field: string, value: string) => {
    onChange(field, value.toLowerCase().trim());
  };

  const handleCIInput = (field: string, value: string) => {
    const ciPattern = /^[0-9A-Za-z]*$/;
    if ((ciPattern.test(value) && value.length <= 12) || value === '') {
      onChange(field, value.toUpperCase());
    }
  };

  const fieldStyle = {
    width: '100%',
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      fontSize: '0.95rem',
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
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
    '& .MuiInputBase-input': {
      color: isDark ? '#fff' : '#000',
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

  const mostrarCampoOtroParentesco = data.parentesco === 'otro';

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={sectionTitleStyle}>
        <PeopleIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        Información del Tutor/Representante
      </Box>

      {/* Datos personales */}
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Nombres *"
            value={data.nombres}
            onChange={(e) => handleNameInput('nombres', e.target.value)}
            error={!!errors.nombres_rep}
            helperText={errors.nombres_rep}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Apellido Paterno *"
            value={data.apellido_paterno}
            onChange={(e) => handleNameInput('apellido_paterno', e.target.value)}
            error={!!errors.apellido_paterno_rep}
            helperText={errors.apellido_paterno_rep}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Apellido Materno"
            value={data.apellido_materno}
            onChange={(e) => handleNameInput('apellido_materno', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Cédula de Identidad *"
            value={data.ci}
            onChange={(e) => handleCIInput('ci', e.target.value)}
            error={!!errors.ci_rep}
            helperText={errors.ci_rep}
            inputProps={{ maxLength: 12 }}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <DatePicker
            format="DD/MM/YYYY"
            label="Fecha de Nacimiento"
            value={data.fecha_nacimiento}
            onChange={(date) => onChange('fecha_nacimiento', date)}
            slotProps={{ textField: { fullWidth: true } }}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            select
            fullWidth
            label="Género"
            value={data.genero}
            onChange={(e) => onChange('genero', e.target.value)}
            sx={fieldStyle}
          >
            {GENEROS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{xs:12, md: mostrarCampoOtroParentesco ? 6 : 12}}>
          <TextField
            select
            fullWidth
            label="Parentesco *"
            value={data.parentesco}
            onChange={(e) => onChange('parentesco', e.target.value)}
            sx={fieldStyle}
          >
            {PARENTESCOS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {mostrarCampoOtroParentesco && (
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Especificar Parentesco *"
              value={data.otro_parentesco || ''}
              onChange={(e) => handleNameInput('otro_parentesco', e.target.value)}
              placeholder="Ej: Hermano, Primo, etc."
              sx={fieldStyle}
            />
          </Grid>
        )}
      </Grid>

      {/* Información laboral */}
      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mt: 2 }}>
        Información Laboral
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Ocupación / Profesión"
            value={data.ocupacion}
            onChange={(e) => onChange('ocupacion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Lugar de Trabajo"
            value={data.lugar_trabajo}
            onChange={(e) => onChange('lugar_trabajo', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Teléfono de Trabajo"
            value={data.telefono_trabajo}
            onChange={(e) => handlePhoneInput('telefono_trabajo', e.target.value)}
            inputProps={{ maxLength: 20 }}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            select
            fullWidth
            label="Estado Civil"
            value={data.estado_civil}
            onChange={(e) => onChange('estado_civil', e.target.value)}
            sx={fieldStyle}
          >
            {ESTADOS_CIVILES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            select
            fullWidth
            label="Nivel de Educación"
            value={data.nivel_educacion}
            onChange={(e) => onChange('nivel_educacion', e.target.value)}
            sx={fieldStyle}
          >
            {NIVELES_EDUCACION.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Grid size={{xs:12}}>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>
          ¿Vive con el estudiante?
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={data.vive_con_estudiante ? 'SI' : 'NO'}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              onChange('vive_con_estudiante', newValue === 'SI');
            }
          }}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: isDark ? '#facc15' : '#0288d1',
                color: isDark ? '#000' : '#fff',
              },
            },
          }}
        >
          <ToggleButton value="NO">No</ToggleButton>
          <ToggleButton value="SI">Sí</ToggleButton>
        </ToggleButtonGroup>
      </Grid>

      {/* Información de contacto */}
      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mt: 2 }}>
        Información de Contacto
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Teléfono *"
            value={data.telefono}
            onChange={(e) => handlePhoneInput('telefono', e.target.value)}
            error={!!errors.telefono_rep}
            helperText={errors.telefono_rep}
            inputProps={{ maxLength: 20 }}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Celular"
            value={data.celular}
            onChange={(e) => handlePhoneInput('celular', e.target.value)}
            inputProps={{ maxLength: 20 }}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            value={data.email}
            onChange={(e) => handleEmailInput('email', e.target.value)}
            type="email"
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Dirección"
            value={data.direccion}
            onChange={(e) => onChange('direccion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
      </Grid>
    </Box>
  );
}