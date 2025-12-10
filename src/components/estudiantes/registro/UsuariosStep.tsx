// components/estudiantes/registro/UsuariosStep.tsx
import React from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
  useTheme,
} from '@mui/material';
import { VpnKey as KeyIcon, Info as InfoIcon } from '@mui/icons-material';

interface UsuariosStepProps {
  crearUsuarioEstudiante: boolean;
  crearUsuariosTutores: boolean;
  credencialesEstudiante: { username: string; password: string; email: string };
  credencialesTutores: Array<{ username: string; password: string; email: string }>;
  tutores: Array<{ nombres: string; apellido_paterno: string }>;
  onToggleEstudiante: (value: boolean) => void;
  onToggleTutores: (value: boolean) => void;
  onCredencialesEstudianteChange: (creds: any) => void;
  onCredencialesTutoresChange: (creds: any[]) => void;
}

export const UsuariosStep: React.FC<UsuariosStepProps> = ({
  crearUsuarioEstudiante,
  crearUsuariosTutores,
  credencialesEstudiante,
  credencialesTutores,
  tutores,
  onToggleEstudiante,
  onToggleTutores,
  onCredencialesEstudianteChange,
  onCredencialesTutoresChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleCredencialTutorChange = (
    index: number,
    field: 'username' | 'password' | 'email',
    value: string
  ) => {
    const newCreds = [...credencialesTutores];
    newCreds[index] = { ...newCreds[index], [field]: value };
    onCredencialesTutoresChange(newCreds);
  };

  const fieldStyle = {
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <KeyIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Crear Usuarios (Opcional)
        </Typography>
      </Box>

      {/* Usuario del Estudiante */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          border: '2px solid',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
        }}
      >
        <FormControlLabel
          control={
            <Switch checked={crearUsuarioEstudiante} onChange={(e) => onToggleEstudiante(e.target.checked)} />
          }
          label={
            <Typography fontWeight={700} sx={{ fontSize: '1.1rem' }}>
              Crear usuario para el estudiante
            </Typography>
          }
        />

        {crearUsuarioEstudiante && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{xs:12, md:4}} >
              <TextField
                fullWidth
                size="small"
                label="Username"
                value={credencialesEstudiante.username}
                onChange={(e) =>
                  onCredencialesEstudianteChange({ ...credencialesEstudiante, username: e.target.value })
                }
                placeholder="Dejar vacío para generar automáticamente"
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:4}} >
              <TextField
                fullWidth
                size="small"
                label="Password"
                value={credencialesEstudiante.password}
                onChange={(e) =>
                  onCredencialesEstudianteChange({ ...credencialesEstudiante, password: e.target.value })
                }
                placeholder="Dejar vacío para generar automáticamente"
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{xs:12, md:4}} >
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={credencialesEstudiante.email}
                onChange={(e) =>
                  onCredencialesEstudianteChange({ ...credencialesEstudiante, email: e.target.value })
                }
                placeholder="Opcional"
                sx={fieldStyle}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Usuarios de los Tutores */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          border: '2px solid',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
        }}
      >
        <FormControlLabel
          control={
            <Switch checked={crearUsuariosTutores} onChange={(e) => onToggleTutores(e.target.checked)} />
          }
          label={
            <Typography fontWeight={700} sx={{ fontSize: '1.1rem' }}>
              Crear usuarios para los tutores
            </Typography>
          }
        />

        {crearUsuariosTutores &&
          credencialesTutores.map((cred, index) => (
            <Box
              key={index}
              sx={{
                mt: 3,
                p: 3,
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(1,87,155,0.02)',
                borderRadius: '12px',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Tutor #{index + 1}: {tutores[index]?.nombres || 'Sin nombre'}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{xs:12, md:4}} >
                  <TextField
                    fullWidth
                    size="small"
                    label="Username"
                    value={cred.username}
                    onChange={(e) => handleCredencialTutorChange(index, 'username', e.target.value)}
                    placeholder="Auto-generar"
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{xs:12, md:4}} >
                  <TextField
                    fullWidth
                    size="small"
                    label="Password"
                    value={cred.password}
                    onChange={(e) => handleCredencialTutorChange(index, 'password', e.target.value)}
                    placeholder="Auto-generar"
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{xs:12, md:4}} >
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={cred.email}
                    onChange={(e) => handleCredencialTutorChange(index, 'email', e.target.value)}
                    placeholder="Opcional"
                    sx={fieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
      </Paper>

      {/* Información */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography variant="body2">
          <strong>ℹ️ Información:</strong> Si dejas los campos vacíos, el sistema generará automáticamente
          el usuario y contraseña. Las contraseñas generadas deberán ser cambiadas en el primer inicio de
          sesión.
        </Typography>
      </Alert>
    </Box>
  );
};