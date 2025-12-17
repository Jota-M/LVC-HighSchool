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
  Divider,
} from '@mui/material';
import { VpnKey as KeyIcon, Info as InfoIcon } from '@mui/icons-material';
import { ModoRegistro, CredencialesUsuario } from '@/types/estudianteTypes';

interface EstudianteFormData {
  nombres: string;
  apellido_paterno: string;
}

interface TutorFormData {
  nombres: string;
  apellido_paterno: string;
}

interface UsuariosStepProps {
  modo: ModoRegistro;
  crearUsuarioEstudiante: boolean;
  crearUsuariosTutores: boolean;
  credencialesEstudiantes: CredencialesUsuario[];
  credencialesTutores: CredencialesUsuario[];
  estudiantes: EstudianteFormData[];
  tutores: TutorFormData[];
  onToggleEstudiante: (value: boolean) => void;
  onToggleTutores: (value: boolean) => void;
  onCredencialesEstudiantesChange: (creds: CredencialesUsuario[]) => void;
  onCredencialesTutoresChange: (creds: CredencialesUsuario[]) => void;
}

export const UsuariosStep: React.FC<UsuariosStepProps> = ({
  modo,
  crearUsuarioEstudiante,
  crearUsuariosTutores,
  credencialesEstudiantes,
  credencialesTutores,
  estudiantes,
  tutores,
  onToggleEstudiante,
  onToggleTutores,
  onCredencialesEstudiantesChange,
  onCredencialesTutoresChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const esMultiple = modo === 'multiple';
  const esExistente = modo === 'existente';

  const handleCredencialEstudianteChange = (
    index: number,
    field: keyof CredencialesUsuario,
    value: string
  ) => {
    const newCreds = [...credencialesEstudiantes];
    newCreds[index] = { ...newCreds[index], [field]: value };
    onCredencialesEstudiantesChange(newCreds);
  };

  const handleCredencialTutorChange = (
    index: number,
    field: keyof CredencialesUsuario,
    value: string
  ) => {
    const newCreds = [...credencialesTutores];
    newCreds[index] = { ...newCreds[index], [field]: value };
    onCredencialesTutoresChange(newCreds);
  };

  // Sincronizar arrays de credenciales con cantidad de estudiantes/tutores
  React.useEffect(() => {
    if (esMultiple) {
      // Ajustar credenciales de estudiantes
      if (credencialesEstudiantes.length < estudiantes.length) {
        const nuevas = Array(estudiantes.length - credencialesEstudiantes.length).fill({
          username: '',
          password: '',
          email: '',
        });
        onCredencialesEstudiantesChange([...credencialesEstudiantes, ...nuevas]);
      } else if (credencialesEstudiantes.length > estudiantes.length) {
        onCredencialesEstudiantesChange(credencialesEstudiantes.slice(0, estudiantes.length));
      }
    }

    // Ajustar credenciales de tutores
    if (!esExistente) {
      if (credencialesTutores.length < tutores.length) {
        const nuevas = Array(tutores.length - credencialesTutores.length).fill({
          username: '',
          password: '',
          email: '',
        });
        onCredencialesTutoresChange([...credencialesTutores, ...nuevas]);
      } else if (credencialesTutores.length > tutores.length) {
        onCredencialesTutoresChange(credencialesTutores.slice(0, tutores.length));
      }
    }
  }, [estudiantes.length, tutores.length, esMultiple, esExistente]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <KeyIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Crear Usuarios (Opcional)
        </Typography>
      </Box>

      {/* Usuario(s) del Estudiante */}
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
              Crear usuario{esMultiple ? 's' : ''} para {esMultiple ? 'los' : 'el'} estudiante
              {esMultiple ? 's' : ''}
            </Typography>
          }
        />

        {crearUsuarioEstudiante && (
          <Box sx={{ mt: 3 }}>
            {esMultiple ? (
              // MODO MÚLTIPLE: uno por cada estudiante
              estudiantes.map((est, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 3,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(1,87,155,0.02)',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Estudiante #{index + 1}: {est.nombres || 'Sin nombre'}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={credencialesEstudiantes[index]?.username || ''}
                        onChange={(e) => handleCredencialEstudianteChange(index, 'username', e.target.value)}
                        placeholder="Auto-generar"
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Password"
                        value={credencialesEstudiantes[index]?.password || ''}
                        onChange={(e) => handleCredencialEstudianteChange(index, 'password', e.target.value)}
                        placeholder="Auto-generar"
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={credencialesEstudiantes[index]?.email || ''}
                        onChange={(e) => handleCredencialEstudianteChange(index, 'email', e.target.value)}
                        placeholder="Opcional"
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))
            ) : (
              // MODO NUEVO/EXISTENTE: un solo estudiante
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={credencialesEstudiantes[0]?.username || ''}
                    onChange={(e) => handleCredencialEstudianteChange(0, 'username', e.target.value)}
                    placeholder="Dejar vacío para generar automáticamente"
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    value={credencialesEstudiantes[0]?.password || ''}
                    onChange={(e) => handleCredencialEstudianteChange(0, 'password', e.target.value)}
                    placeholder="Dejar vacío para generar automáticamente"
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={credencialesEstudiantes[0]?.email || ''}
                    onChange={(e) => handleCredencialEstudianteChange(0, 'email', e.target.value)}
                    placeholder="Opcional"
                    sx={fieldStyle}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Usuarios de los Tutores (ocultar si es modo existente) */}
      {!esExistente && (
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
            tutores.map((tutor, index) => (
              <Box
                key={index}
                sx={{
                  mt: 3,
                  p: 3,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(1,87,155,0.02)',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Tutor #{index + 1}: {tutor.nombres || 'Sin nombre'} {tutor.apellido_paterno}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={credencialesTutores[index]?.username || ''}
                      onChange={(e) => handleCredencialTutorChange(index, 'username', e.target.value)}
                      placeholder="Auto-generar"
                      sx={fieldStyle}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Password"
                      value={credencialesTutores[index]?.password || ''}
                      onChange={(e) => handleCredencialTutorChange(index, 'password', e.target.value)}
                      placeholder="Auto-generar"
                      sx={fieldStyle}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={credencialesTutores[index]?.email || ''}
                      onChange={(e) => handleCredencialTutorChange(index, 'email', e.target.value)}
                      placeholder="Opcional"
                      sx={fieldStyle}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
        </Paper>
      )}

      {/* Información para modo existente */}
      {esExistente && (
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{
            mb: 3,
            borderRadius: '16px',
            border: '2px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Typography variant="body2">
            <strong>ℹ️ Modo Padre Existente:</strong> Se usará el tutor/padre que ya está registrado en el
            sistema. No es necesario crear un nuevo usuario para él.
          </Typography>
        </Alert>
      )}

      {/* Información general */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography variant="body2">
          <strong>ℹ️ Información:</strong> Si dejas los campos vacíos, el sistema generará automáticamente el
          usuario y contraseña. Las contraseñas generadas deberán ser cambiadas en el primer inicio de sesión.
        </Typography>
      </Alert>
    </Box>
  );
};