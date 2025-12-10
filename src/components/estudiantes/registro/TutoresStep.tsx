// components/estudiantes/registro/TutoresStep.tsx
import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BorderColor, CameraAlt as CameraIcon, Person as PersonIcon } from '@mui/icons-material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface Tutor {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: Dayjs | null;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ocupacion: string;
  lugar_trabajo: string;
  telefono_trabajo: string;
  parentesco: string;
  estado_civil: string;
  nivel_educacion: string;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  autorizado_recoger: boolean;
  puede_autorizar_salidas: boolean;
  recibe_notificaciones: boolean;
  prioridad_contacto: number;
  observaciones: string;
}

interface TutoresStepProps {
  tutores: Tutor[];
  onChange: (tutores: Tutor[]) => void;
}

const parentescoOptions = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'tio', label: 'Tío/a' },
  { value: 'tutor_legal', label: 'Tutor Legal' },
  { value: 'otro', label: 'Otro' },
];

const estadosCiviles = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union_libre', label: 'Unión Libre' },
];

const nivelesEducacion = [
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
];

export const TutoresStep: React.FC<TutoresStepProps> = ({ tutores, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleTutorChange = (index: number, field: keyof Tutor, value: any) => {
    const newTutores = [...tutores];
    newTutores[index] = { ...newTutores[index], [field]: value };
    onChange(newTutores);
  };

  const agregarTutor = () => {
    onChange([
      ...tutores,
      {
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: null,
        telefono: '',
        celular: '',
        email: '',
        direccion: '',
        ocupacion: '',
        lugar_trabajo: '',
        telefono_trabajo: '',
        parentesco: '',
        estado_civil: '',
        nivel_educacion: '',
        es_tutor_principal: false,
        vive_con_estudiante: true,
        autorizado_recoger: true,
        puede_autorizar_salidas: true,
        recibe_notificaciones: true,
        prioridad_contacto: tutores.length + 1,
        observaciones: '',
      },
    ]);
  };

  const eliminarTutor = (index: number) => {
    if (tutores.length > 1) {
      onChange(tutores.filter((_, i) => i !== index));
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
    padding: '10px 14px',
    fontSize: '0.95rem',
  },
};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
            Información de Padre de Familia/Tutores
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={agregarTutor}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          }}
        >
          Agregar Tutor
        </Button>
      </Box>

      {tutores.map((tutor, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            border: '2px solid',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
            position: 'relative',
          }}
        >
          {tutores.length > 1 && (
            <IconButton
              onClick={() => eliminarTutor(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#ef4444',
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <Typography variant="h6" fontWeight={700} mb={3}>
            Tutor #{index + 1}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{xs:12, md:6}} >
              <TextField
                fullWidth
                size="small"
                label="Nombres"
                value={tutor.nombres}
                onChange={(e) => handleTutorChange(index, 'nombres', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{xs:12, md:3}} >
              <TextField
                fullWidth
                size="small"
                label="Apellido Paterno"
                value={tutor.apellido_paterno}
                onChange={(e) => handleTutorChange(index, 'apellido_paterno', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Apellido Materno"
                value={tutor.apellido_materno}
                onChange={(e) => handleTutorChange(index, 'apellido_materno', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="CI"
                value={tutor.ci}
                onChange={(e) => handleTutorChange(index, 'ci', e.target.value)}
                sx={fieldStyle}
                required
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <DatePicker
                label="Fecha de Nacimiento"
                value={tutor.fecha_nacimiento}
                onChange={(date) => handleTutorChange(index, 'fecha_nacimiento', date)}
                sx={fieldStyle}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                select
                fullWidth
                size="small"
                label="Parentesco"
                value={tutor.parentesco}
                onChange={(e) => handleTutorChange(index, 'parentesco', e.target.value)}
                sx={fieldStyle}
              >
                {parentescoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                value={tutor.telefono}
                onChange={(e) => handleTutorChange(index, 'telefono', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Celular"
                value={tutor.celular}
                onChange={(e) => handleTutorChange(index, 'celular', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={tutor.email}
                onChange={(e) => handleTutorChange(index, 'email', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                size="small"
                label="Ocupación"
                value={tutor.ocupacion}
                onChange={(e) => handleTutorChange(index, 'ocupacion', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                size="small"
                label="Lugar de Trabajo"
                value={tutor.lugar_trabajo}
                onChange={(e) => handleTutorChange(index, 'lugar_trabajo', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:4}}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono de Trabajo"
                value={tutor.telefono_trabajo}
                onChange={(e) => handleTutorChange(index, 'telefono_trabajo', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:4}}>
              <TextField
                select
                fullWidth
                size="small"
                label="Estado Civil"
                value={tutor.estado_civil}
                onChange={(e) => handleTutorChange(index, 'estado_civil', e.target.value)}
                sx={fieldStyle}
              >
                {estadosCiviles.map((option) => (
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
                size="small"
                label="Nivel de Educación"
                value={tutor.nivel_educacion}
                onChange={(e) => handleTutorChange(index, 'nivel_educacion', e.target.value)}
                sx={fieldStyle}
              >
                {nivelesEducacion.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                size="small"
                label="Dirección"
                value={tutor.direccion}
                onChange={(e) => handleTutorChange(index, 'direccion', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>

            <Grid size={{xs:12, md:3}}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Prioridad de Contacto"
                value={tutor.prioridad_contacto}
                onChange={(e) =>
                  handleTutorChange(index, 'prioridad_contacto', parseInt(e.target.value) || 1)
                }
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:9}}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Observaciones"
                value={tutor.observaciones}
                onChange={(e) => handleTutorChange(index, 'observaciones', e.target.value)}
                sx={fieldStyle}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={tutor.es_tutor_principal}
                  onChange={(e) =>
                    handleTutorChange(index, 'es_tutor_principal', e.target.checked)
                  }
                />
              }
              label="Tutor Principal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tutor.vive_con_estudiante}
                  onChange={(e) =>
                    handleTutorChange(index, 'vive_con_estudiante', e.target.checked)
                  }
                />
              }
              label="Vive con el estudiante"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tutor.autorizado_recoger}
                  onChange={(e) =>
                    handleTutorChange(index, 'autorizado_recoger', e.target.checked)
                  }
                />
              }
              label="Autorizado a recoger"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tutor.puede_autorizar_salidas}
                  onChange={(e) =>
                    handleTutorChange(index, 'puede_autorizar_salidas', e.target.checked)
                  }
                />
              }
              label="Puede autorizar salidas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tutor.recibe_notificaciones}
                  onChange={(e) =>
                    handleTutorChange(index, 'recibe_notificaciones', e.target.checked)
                  }
                />
              }
              label="Recibe notificaciones"
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};