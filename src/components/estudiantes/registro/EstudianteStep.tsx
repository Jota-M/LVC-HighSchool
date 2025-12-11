// components/estudiantes/registro/EstudianteStep.tsx
import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BorderColor, CameraAlt as CameraIcon, Person as PersonIcon } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import '@fontsource/roboto';

interface EstudianteStepProps {
  data: any;
  foto: File | null;
  onChange: (data: any) => void;
  onFotoChange: (foto: File | null) => void;
}

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const EstudianteStep: React.FC<EstudianteStepProps> = ({
  data,
  foto,
  onChange,
  onFotoChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
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


  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? 'rgba(250, 204, 21, 0.08)'
            : 'rgba(2, 136, 209, 0.08)',
          transition: '0.3s ease',
        }}
      >
        <PersonIcon
          sx={{
            fontSize: 38,
            color: isDark ? '#facc15' : '#0288d1',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Información Personal del Estudiante
        </Typography>
      </Box>


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

      <Grid container spacing={3}>
        <Grid size={{xs:12,md:6}} >
          <TextField
            fullWidth
            label="Nombres"
            value={data.nombres}
            onChange={(e) => handleChange('nombres', e.target.value)}
            sx={fieldStyle}
            required
          />
        </Grid>
        <Grid size={{xs:12,md:3}} >
          <TextField
            fullWidth
            label="Apellido Paterno"
            value={data.apellido_paterno}
            onChange={(e) => handleChange('apellido_paterno', e.target.value)}
            sx={fieldStyle}
            required
          />
        </Grid>
        <Grid size={{xs:12,md:3}} >
          <TextField
            fullWidth
            label="Apellido Materno"
            value={data.apellido_materno}
            onChange={(e) => handleChange('apellido_materno', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12,md:3}}>
          <DatePicker
            label="Fecha de Nacimiento *"
            value={data.fecha_nacimiento}
            onChange={(date) => handleChange('fecha_nacimiento', date)}
            sx={fieldStyle}
            slotProps={{ textField: { fullWidth: true, required: true } }}
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <TextField
            fullWidth
            label="CI"
            value={data.ci}
            onChange={(e) => handleChange('ci', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <TextField
            fullWidth
            label="Lugar de Nacimiento"
            value={data.lugar_nacimiento}
            onChange={(e) => handleChange('lugar_nacimiento', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <TextField
            select
            fullWidth
            label="Género"
            value={data.genero || ''}
            onChange={(e) => handleChange('genero', e.target.value)}
            sx={fieldStyle}
          >
            {generoOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{xs:12,md:9}}>
          <TextField
            fullWidth
            label="Dirección"
            value={data.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <TextField
            fullWidth
            label="Zona"
            value={data.zona}
            onChange={(e) => handleChange('zona', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12,md:4}}>
          <TextField
            fullWidth
            label="Ciudad"
            value={data.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:4}}>
          <TextField
            fullWidth
            label="Teléfono"
            value={data.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:4}}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12,md:6}}>
          <TextField
            fullWidth
            label="Contacto de Emergencia"
            value={data.contacto_emergencia}
            onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12,md:6}}>
          <TextField
            fullWidth
            label="Teléfono de Emergencia"
            value={data.telefono_emergencia}
            onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <FormControlLabel
            control={
              <Switch
                checked={data.tiene_discapacidad || false} 
                onChange={(e) => handleChange('tiene_discapacidad', e.target.checked)}
              />
            }
            label="¿Tiene alguna discapacidad?"
          />
        </Grid>

        {data.tiene_discapacidad && (
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Tipo de discapacidad"
              value={data.tipo_discapacidad}
              onChange={(e) => handleChange('tipo_discapacidad', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
        )}

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={data.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
      </Grid>
    </Box>
  );
};