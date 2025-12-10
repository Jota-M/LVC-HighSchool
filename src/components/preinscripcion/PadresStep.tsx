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

  const fieldStyle = {
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
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

  const mostrarCampoOtroParentesco = data.parentesco === 'otro';

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={sectionTitleStyle}>
        <PeopleIcon sx={{ fontSize: 32 }} />
        Información del Tutor/Representante
      </Box>

      {/* Datos personales */}
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Nombres *"
            value={data.nombres}
            onChange={(e) => onChange('nombres', e.target.value)}
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
            onChange={(e) => onChange('apellido_paterno', e.target.value)}
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
            onChange={(e) => onChange('apellido_materno', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Cédula de Identidad *"
            value={data.ci}
            onChange={(e) => onChange('ci', e.target.value)}
            error={!!errors.ci_rep}
            helperText={errors.ci_rep}
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
              onChange={(e) => onChange('otro_parentesco', e.target.value)}
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
            onChange={(e) => onChange('telefono_trabajo', e.target.value)}
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
            if (newValue !== null) onChange('vive_con_estudiante', newValue === 'SI');
          }}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              border: '2px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(1, 87, 155, 0.2)',
              '&.Mui-selected': {
                backgroundColor: isDark ? '#f59e0b' : '#fbbf24',
                color: isDark ? '#000' : '#78350f',
                borderColor: isDark ? '#f59e0b' : '#fbbf24',
                '&:hover': {
                  backgroundColor: isDark ? '#ea980b' : '#f59e0b',
                },
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
            onChange={(e) => onChange('telefono', e.target.value)}
            error={!!errors.telefono_rep}
            helperText={errors.telefono_rep}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Celular"
            value={data.celular}
            onChange={(e) => onChange('celular', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
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