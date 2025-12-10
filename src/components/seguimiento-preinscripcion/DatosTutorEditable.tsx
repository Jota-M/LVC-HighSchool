import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PeopleIcon from '@mui/icons-material/People';
import { PreTutor } from '@/types/preinscripcionTypes';

interface DatosTutorEditableProps {
  tutor: PreTutor;
  onGuardar: (datos: any) => Promise<{ success: boolean; error?: string }>;
  guardando: boolean;
}

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

export const DatosTutorEditable: React.FC<DatosTutorEditableProps> = ({
  tutor,
  onGuardar,
  guardando,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [datos, setDatos] = useState({
    nombres: tutor.nombres || '',
    apellido_paterno: tutor.apellido_paterno || '',
    apellido_materno: tutor.apellido_materno || '',
    ci: tutor.ci || '',
    parentesco: tutor.parentesco || '',
    telefono: tutor.telefono || '',
    celular: tutor.celular || '',
    email: tutor.email || '',
    direccion: tutor.direccion || '',
    ocupacion: tutor.ocupacion || '',
    lugar_trabajo: tutor.lugar_trabajo || '',
  });

  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const handleChange = (field: string, value: any) => {
    setDatos(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const resultado = await onGuardar(datos);

    if (resultado.success) {
      setMensaje({ tipo: 'success', texto: 'Datos actualizados correctamente' });
    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al guardar' });
    }
  };

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

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={sectionTitleStyle}>
        <PeopleIcon sx={{ fontSize: 32 }} />
        Editar Datos del Tutor
      </Box>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 3, borderRadius: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Nombres *"
            value={datos.nombres}
            onChange={(e) => handleChange('nombres', e.target.value)}
            required
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Apellido Paterno *"
            value={datos.apellido_paterno}
            onChange={(e) => handleChange('apellido_paterno', e.target.value)}
            required
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Apellido Materno"
            value={datos.apellido_materno}
            onChange={(e) => handleChange('apellido_materno', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="CI *"
            value={datos.ci}
            onChange={(e) => handleChange('ci', e.target.value)}
            required
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            select
            fullWidth
            label="Parentesco *"
            value={datos.parentesco}
            onChange={(e) => handleChange('parentesco', e.target.value)}
            required
            sx={fieldStyle}
          >
            {PARENTESCOS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Teléfono *"
            value={datos.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            required
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Celular"
            value={datos.celular}
            onChange={(e) => handleChange('celular', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={datos.email}
            onChange={(e) => handleChange('email', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12}}>
          <TextField
            fullWidth
            label="Dirección"
            value={datos.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Ocupación"
            value={datos.ocupacion}
            onChange={(e) => handleChange('ocupacion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Lugar de Trabajo"
            value={datos.lugar_trabajo}
            onChange={(e) => handleChange('lugar_trabajo', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={guardando}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>
    </form>
  );
};
