// components/configuracion/PasswordTab.tsx
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';
import configuracionService from '@/services/configuracionService';

export default function PasswordTab() {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmacion: false,
  });

  const [formData, setFormData] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmacion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validarPassword = (password: string) => {
    const requisitos = [
      { cumple: password.length >= 8, texto: 'Al menos 8 caracteres' },
      { cumple: /[A-Z]/.test(password), texto: 'Al menos una mayúscula' },
      { cumple: /[a-z]/.test(password), texto: 'Al menos una minúscula' },
      { cumple: /[0-9]/.test(password), texto: 'Al menos un número' },
    ];
    return requisitos;
  };

  const requisitos = validarPassword(formData.password_nueva);
  const passwordValida = requisitos.every((r) => r.cumple) && formData.password_nueva.length > 0;
  const passwordsCoinciden = formData.password_nueva === formData.password_confirmacion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.password_actual) {
      newErrors.password_actual = 'La contraseña actual es requerida';
    }

    if (!formData.password_nueva) {
      newErrors.password_nueva = 'La nueva contraseña es requerida';
    } else if (!passwordValida) {
      newErrors.password_nueva = 'La contraseña no cumple los requisitos';
    }

    if (!formData.password_confirmacion) {
      newErrors.password_confirmacion = 'Debes confirmar la nueva contraseña';
    } else if (!passwordsCoinciden) {
      newErrors.password_confirmacion = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setError(null);

      await configuracionService.cambiarPassword(formData);

      setSuccess('Contraseña actualizada correctamente');

      setFormData({
        password_actual: '',
        password_nueva: '',
        password_confirmacion: '',
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cambiar contraseña';
      setError(errorMsg);

      if (errorMsg.includes('incorrecta')) {
        setErrors({ password_actual: 'Contraseña incorrecta' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Card>
      <CardHeader
        title="Cambiar Contraseña"
        subheader="Actualiza tu contraseña para mantener tu cuenta segura"
      />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Contraseña Actual */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Contraseña Actual"
                type={showPasswords.actual ? 'text' : 'password'}
                value={formData.password_actual}
                onChange={(e) => {
                  setFormData({ ...formData, password_actual: e.target.value });
                  setErrors({ ...errors, password_actual: '' });
                }}
                error={!!errors.password_actual}
                helperText={errors.password_actual}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowPassword('actual')}
                        edge="end"
                      >
                        {showPasswords.actual ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Nueva Contraseña */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type={showPasswords.nueva ? 'text' : 'password'}
                value={formData.password_nueva}
                onChange={(e) => {
                  setFormData({ ...formData, password_nueva: e.target.value });
                  setErrors({ ...errors, password_nueva: '' });
                }}
                error={!!errors.password_nueva}
                helperText={errors.password_nueva}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowPassword('nueva')}
                        edge="end"
                      >
                        {showPasswords.nueva ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Requisitos */}
              {formData.password_nueva && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Requisitos de la contraseña:
                  </Typography>
                  <List dense>
                    {requisitos.map((req, index) => (
                      <ListItem key={index} dense>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {req.cumple ? (
                            <CheckCircleIcon fontSize="small" color="success" />
                          ) : (
                            <CancelIcon fontSize="small" color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={req.texto}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: req.cumple ? 'success.main' : 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            {/* Confirmar Contraseña */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                type={showPasswords.confirmacion ? 'text' : 'password'}
                value={formData.password_confirmacion}
                onChange={(e) => {
                  setFormData({ ...formData, password_confirmacion: e.target.value });
                  setErrors({ ...errors, password_confirmacion: '' });
                }}
                error={!!errors.password_confirmacion}
                helperText={errors.password_confirmacion}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowPassword('confirmacion')}
                        edge="end"
                      >
                        {showPasswords.confirmacion ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {formData.password_confirmacion && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {passwordsCoinciden ? (
                    <>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="body2" color="success.main">
                        Las contraseñas coinciden
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CancelIcon fontSize="small" color="error" />
                      <Typography variant="body2" color="error.main">
                        Las contraseñas no coinciden
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Grid>

            {/* Alert de Seguridad */}
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" icon={<WarningIcon />}>
                Después de cambiar tu contraseña, todas tus sesiones activas (excepto la
                actual) serán cerradas automáticamente por seguridad.
              </Alert>
            </Grid>

            {/* Botón Submit */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !passwordValida || !passwordsCoinciden}
                  startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
                >
                  Cambiar Contraseña
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}