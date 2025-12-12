import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ValidacionResponse } from '@/types/autoMatriculacionTypes';

interface ActualizarDatosStepProps {
  datosEstudiante: ValidacionResponse['data'];
  datosActualizacion: any;
  fotoPreview: string | null;
  fotoFile: File | null;
  isActualizando: boolean;
  onChange: (field: string, value: string) => void;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onActualizar: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ActualizarDatosStep: React.FC<ActualizarDatosStepProps> = ({
  datosEstudiante,
  datosActualizacion,
  fotoPreview,
  fotoFile,
  isActualizando,
  onChange,
  onFotoChange,
  onActualizar,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        }}
      >
        <EditIcon
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
          Actualizar Información Personal
        </Typography>
      </Box>

      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          borderRadius: '12px',
          border: '2px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          ℹ️ Actualiza tus Datos
        </Typography>
        <Typography variant="body2">
          Puedes actualizar tu información de contacto y foto. Los campos que dejes vacíos no se modificarán.
        </Typography>
      </Alert>

      {/* Foto */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={fotoPreview || datosEstudiante.estudiante.foto_url || undefined}
            sx={{ 
              width: 120, 
              height: 120,
              border: '4px solid',
              borderColor: isDark ? '#facc15' : '#0288d1',
            }}
          >
            {datosEstudiante.estudiante.nombres.charAt(0)}
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
            <input type="file" hidden accept="image/*" onChange={onFotoChange} />
          </IconButton>
        </Box>
      </Box>

      {fotoFile && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body2">
            📷 Nueva foto seleccionada: <strong>{fotoFile.name}</strong>
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Teléfono"
            placeholder="Ej: 70123456"
            value={datosActualizacion.telefono}
            onChange={(e) => onChange('telefono', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={datosActualizacion.email}
            onChange={(e) => onChange('email', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Dirección"
            placeholder="Calle, Zona, Ciudad"
            value={datosActualizacion.direccion}
            onChange={(e) => onChange('direccion', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Zona"
            placeholder="Ej: Centro"
            value={datosActualizacion.zona}
            onChange={(e) => onChange('zona', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Ciudad"
            placeholder="Ej: La Paz"
            value={datosActualizacion.ciudad}
            onChange={(e) => onChange('ciudad', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Contacto de Emergencia"
            placeholder="Nombre completo"
            value={datosActualizacion.contacto_emergencia}
            onChange={(e) => onChange('contacto_emergencia', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Teléfono de Emergencia"
            placeholder="Ej: 70123456"
            value={datosActualizacion.telefono_emergencia}
            onChange={(e) => onChange('telefono_emergencia', e.target.value)}
            sx={fieldStyle}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<BackIcon />} 
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Atrás
        </Button>
        <Stack direction="row" spacing={2}>
          <Button 
            onClick={onNext} 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Omitir
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onActualizar();
              setTimeout(onNext, 1000);
            }}
            disabled={isActualizando}
            startIcon={isActualizando ? <CircularProgress size={20} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isActualizando ? 'Guardando...' : 'Guardar y Continuar'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
