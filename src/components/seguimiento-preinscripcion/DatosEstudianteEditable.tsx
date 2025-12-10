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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import { PreEstudiante } from '@/types/preinscripcionTypes';

interface DatosEstudianteEditableProps {
  estudiante: PreEstudiante;
  onGuardar: (datos: any) => Promise<{ success: boolean; error?: string }>;
  guardando: boolean;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const DatosEstudianteEditable: React.FC<DatosEstudianteEditableProps> = ({
  estudiante,
  onGuardar,
  guardando,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [datos, setDatos] = useState({
    nombres: estudiante.nombres || '',
    apellido_paterno: estudiante.apellido_paterno || '',
    apellido_materno: estudiante.apellido_materno || '',
    ci: estudiante.ci || '',
    fecha_nacimiento: estudiante.fecha_nacimiento ? dayjs(estudiante.fecha_nacimiento) : null,
    lugar_nacimiento: estudiante.lugar_nacimiento || '',
    genero: estudiante.genero || '',
    direccion: estudiante.direccion || '',
    zona: estudiante.zona || '',
    ciudad: estudiante.ciudad || '',
    telefono: estudiante.telefono || '',
    email: estudiante.email || '',
    contacto_emergencia: estudiante.contacto_emergencia || '',
    telefono_emergencia: estudiante.telefono_emergencia || '',
  });

  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const handleChange = (field: string, value: any) => {
    setDatos(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const resultado = await onGuardar({
      ...datos,
      fecha_nacimiento: datos.fecha_nacimiento?.format('YYYY-MM-DD'),
    });

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit}>
        <Box sx={sectionTitleStyle}>
          <PersonIcon sx={{ fontSize: 32 }} />
          Editar Datos del Estudiante
        </Box>

        {mensaje && (
          <Alert severity={mensaje.tipo} sx={{ mb: 3, borderRadius: 2 }}>
            {mensaje.texto}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{xs:12, md:4}} >
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

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="CI"
              value={datos.ci}
              onChange={(e) => handleChange('ci', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <DatePicker
              label="Fecha de Nacimiento *"
              value={datos.fecha_nacimiento}
              onChange={(date) => handleChange('fecha_nacimiento', date)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, required: true, sx: fieldStyle } }}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Género *"
              value={datos.genero}
              onChange={(e) => handleChange('genero', e.target.value)}
              required
              sx={fieldStyle}
            >
              {GENEROS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Lugar de Nacimiento"
              value={datos.lugar_nacimiento}
              onChange={(e) => handleChange('lugar_nacimiento', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Dirección"
              value={datos.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Zona"
              value={datos.zona}
              onChange={(e) => handleChange('zona', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Ciudad"
              value={datos.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Teléfono"
              value={datos.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
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
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Contacto de Emergencia"
              value={datos.contacto_emergencia}
              onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Teléfono de Emergencia"
              value={datos.telefono_emergencia}
              onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
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
    </LocalizationProvider>
  );
};