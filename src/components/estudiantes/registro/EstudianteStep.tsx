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
  Paper,
  Button,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  CameraAlt as CameraIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import '@fontsource/roboto';
import { ModoRegistro, EstudianteCreate } from '@/types/estudianteTypes';

// Tipo con Dayjs para el formulario
type EstudianteFormData = Omit<EstudianteCreate, 'fecha_nacimiento'> & {
  fecha_nacimiento: Dayjs | null;
};

interface EstudianteStepProps {
  modo: ModoRegistro;
  estudiantes: EstudianteFormData[];
  fotos: (File | null)[];
  onEstudiantesChange: (estudiantes: EstudianteFormData[]) => void;
  onFotosChange: (fotos: (File | null)[]) => void;
}

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export const EstudianteStep: React.FC<EstudianteStepProps> = ({
  modo,
  estudiantes,
  fotos,
  onEstudiantesChange,
  onFotosChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [fotoPreviews, setFotoPreviews] = React.useState<(string | null)[]>(
    fotos.map((f) => (f ? URL.createObjectURL(f) : null))
  );

  const esMultiple = modo === 'multiple';
  const maxEstudiantes = 5;

  const handleEstudianteChange = (index: number, field: string, value: any) => {
    const newEstudiantes = [...estudiantes];
    newEstudiantes[index] = { ...newEstudiantes[index], [field]: value };
    onEstudiantesChange(newEstudiantes);
  };

  const handleFotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFotos = [...fotos];
      newFotos[index] = file;
      onFotosChange(newFotos);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...fotoPreviews];
        newPreviews[index] = reader.result as string;
        setFotoPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarEstudiante = () => {
    if (estudiantes.length < maxEstudiantes) {
      onEstudiantesChange([
        ...estudiantes,
        {
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          fecha_nacimiento: null,
          ci: '',
          lugar_nacimiento: '',
          genero: undefined,
          direccion: '',
          zona: '',
          ciudad: '',
          telefono: '',
          email: '',
          contacto_emergencia: '',
          rude: '',
          tiene_discapacidad: false,
          tipo_discapacidad: '',
          observaciones: '',
        },
      ]);
      onFotosChange([...fotos, null]);
      setFotoPreviews([...fotoPreviews, null]);
    }
  };

  const eliminarEstudiante = (index: number) => {
    if (estudiantes.length > 1) {
      onEstudiantesChange(estudiantes.filter((_, i) => i !== index));
      onFotosChange(fotos.filter((_, i) => i !== index));
      setFotoPreviews(fotoPreviews.filter((_, i) => i !== index));
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 3,
            background: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(2, 136, 209, 0.08)',
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
            Información del Estudiante{esMultiple ? 's' : ''}
          </Typography>
        </Box>

        {esMultiple && estudiantes.length < maxEstudiantes && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={agregarEstudiante}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
            }}
          >
            Agregar Estudiante
          </Button>
        )}
      </Box>

      {/* Lista de estudiantes */}
      {estudiantes.map((estudiante, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: '20px',
            border: '2px solid',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
            position: 'relative',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Botón eliminar (solo si hay más de 1 en modo múltiple) */}
          {esMultiple && estudiantes.length > 1 && (
            <IconButton
              onClick={() => eliminarEstudiante(index)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          {/* Título */}
          {esMultiple && (
            <Typography variant="h6" fontWeight={700} mb={3}>
              Estudiante #{index + 1}
            </Typography>
          )}

          {/* Foto */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={fotoPreviews[index] || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid',
                  borderColor: isDark ? '#facc15' : '#0288d1',
                }}
              >
                {!fotoPreviews[index] && <CameraIcon sx={{ fontSize: 48 }} />}
              </Avatar>
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
                <input type="file" accept="image/*" onChange={(e) => handleFotoChange(index, e)} hidden />
              </IconButton>
            </Box>
          </Box>

          {/* Formulario */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombres"
                value={estudiante.nombres}
                onChange={(e) => handleEstudianteChange(index, 'nombres', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                value={estudiante.apellido_paterno}
                onChange={(e) => handleEstudianteChange(index, 'apellido_paterno', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Apellido Materno"
                value={estudiante.apellido_materno}
                onChange={(e) => handleEstudianteChange(index, 'apellido_materno', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha de Nacimiento *"
                value={estudiante.fecha_nacimiento}
                onChange={(date) => handleEstudianteChange(index, 'fecha_nacimiento', date)}
                sx={fieldStyle}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="CI"
                value={estudiante.ci}
                onChange={(e) => handleEstudianteChange(index, 'ci', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Lugar de Nacimiento"
                value={estudiante.lugar_nacimiento}
                onChange={(e) => handleEstudianteChange(index, 'lugar_nacimiento', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="R.U.D.E."
                value={estudiante.rude}
                onChange={(e) => handleEstudianteChange(index, 'rude', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Género"
                value={estudiante.genero || ''}
                onChange={(e) => handleEstudianteChange(index, 'genero', e.target.value)}
                sx={fieldStyle}
              >
                {generoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                label="Dirección"
                value={estudiante.direccion}
                onChange={(e) => handleEstudianteChange(index, 'direccion', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Zona"
                value={estudiante.zona}
                onChange={(e) => handleEstudianteChange(index, 'zona', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Ciudad"
                value={estudiante.ciudad}
                onChange={(e) => handleEstudianteChange(index, 'ciudad', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={estudiante.telefono}
                onChange={(e) => handleEstudianteChange(index, 'telefono', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={estudiante.email}
                onChange={(e) => handleEstudianteChange(index, 'email', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contacto de Emergencia"
                value={estudiante.contacto_emergencia}
                onChange={(e) => handleEstudianteChange(index, 'contacto_emergencia', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={estudiante.tiene_discapacidad || false}
                    onChange={(e) => handleEstudianteChange(index, 'tiene_discapacidad', e.target.checked)}
                  />
                }
                label="¿Tiene alguna discapacidad?"
              />
            </Grid>

            {estudiante.tiene_discapacidad && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tipo de discapacidad"
                  value={estudiante.tipo_discapacidad}
                  onChange={(e) => handleEstudianteChange(index, 'tipo_discapacidad', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={estudiante.observaciones}
                onChange={(e) => handleEstudianteChange(index, 'observaciones', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      {/* Contador en modo múltiple */}
      {esMultiple && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
          {estudiantes.length} de {maxEstudiantes} estudiantes • {maxEstudiantes - estudiantes.length} espacios
          disponibles
        </Typography>
      )}
    </Box>
  );
};