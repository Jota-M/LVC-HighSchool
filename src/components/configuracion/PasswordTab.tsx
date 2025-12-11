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
  Grid,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import configuracionService from '@/services/configuracionService';

export default function PasswordTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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

  const calcularFortaleza = (password: string) => {
    if (!password) return 0;
    const requisitos = validarPassword(password);
    const cumplidos = requisitos.filter(r => r.cumple).length;
    return (cumplidos / requisitos.length) * 100;
  };

  const getFortalezaColor = (fortaleza: number) => {
    if (fortaleza < 50) return '#ef4444';
    if (fortaleza < 75) return '#f59e0b';
    return '#10b981';
  };

  const getFortalezaTexto = (fortaleza: number) => {
    if (fortaleza < 50) return 'Débil';
    if (fortaleza < 75) return 'Media';
    return 'Fuerte';
  };

  const requisitos = validarPassword(formData.password_nueva);
  const passwordValida = requisitos.every((r) => r.cumple) && formData.password_nueva.length > 0;
  const passwordsCoinciden = formData.password_nueva === formData.password_confirmacion;
  const fortaleza = calcularFortaleza(formData.password_nueva);

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
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
            '& .MuiAlert-icon': {
              color: isDark ? '#facc15' : '#0288d1'
            }
          }} 
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: isDark 
              ? `0 8px 24px ${alpha('#facc15', 0.1)}`
              : `0 8px 24px ${alpha('#0288d1', 0.1)}`,
          }
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1.5}>
              <ShieldIcon sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Cambiar Contraseña
              </Typography>
            </Box>
          }
          subheader="Actualiza tu contraseña para mantener tu cuenta segura"
          sx={{
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
          }}
        />
        <CardContent>
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('actual')}
                          edge="end"
                          sx={{
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          {showPasswords.actual ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        borderWidth: 2,
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: isDark ? '#facc15' : '#0288d1',
                    }
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('nueva')}
                          edge="end"
                          sx={{
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          {showPasswords.nueva ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        borderWidth: 2,
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: isDark ? '#facc15' : '#0288d1',
                    }
                  }}
                />

                {/* Fortaleza de Contraseña */}
                {formData.password_nueva && (
                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Fortaleza de la contraseña:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={700}
                        sx={{ color: getFortalezaColor(fortaleza) }}
                      >
                        {getFortalezaTexto(fortaleza)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={fortaleza}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getFortalezaColor(fortaleza),
                          borderRadius: 4,
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Requisitos */}
                {formData.password_nueva && (
                  <Box 
                    mt={2} 
                    p={2} 
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                      border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Requisitos de la contraseña:
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {requisitos.map((req, index) => (
                        <ListItem key={index} dense sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {req.cumple ? (
                              <CheckCircleIcon 
                                fontSize="small" 
                                sx={{ color: '#10b981' }}
                              />
                            ) : (
                              <CancelIcon 
                                fontSize="small" 
                                sx={{ color: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={req.texto}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: 500,
                              color: req.cumple ? '#10b981' : 'text.secondary',
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('confirmacion')}
                          edge="end"
                          sx={{
                            color: isDark ? '#facc15' : '#0288d1',
                          }}
                        >
                          {showPasswords.confirmacion ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? '#facc15' : '#0288d1',
                        borderWidth: 2,
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: isDark ? '#facc15' : '#0288d1',
                    }
                  }}
                />

                {formData.password_confirmacion && (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1} 
                    mt={1.5}
                    p={1.5}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: passwordsCoinciden 
                        ? alpha('#10b981', 0.1)
                        : alpha('#ef4444', 0.1),
                      border: `1px solid ${passwordsCoinciden 
                        ? alpha('#10b981', 0.3)
                        : alpha('#ef4444', 0.3)}`
                    }}
                  >
                    {passwordsCoinciden ? (
                      <>
                        <CheckCircleIcon sx={{ color: '#10b981' }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
                          Las contraseñas coinciden
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon sx={{ color: '#ef4444' }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#ef4444' }}>
                          Las contraseñas no coinciden
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Grid>

              {/* Alert de Seguridad */}
              <Grid size={{ xs: 12 }}>
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                    backgroundColor: alpha('#f59e0b', 0.1),
                    '& .MuiAlert-icon': {
                      color: '#f59e0b'
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    Después de cambiar tu contraseña, todas tus sesiones activas (excepto la
                    actual) serán cerradas automáticamente por seguridad.
                  </Typography>
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
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                      boxShadow: isDark 
                        ? `0 4px 14px ${alpha('#facc15', 0.4)}`
                        : `0 4px 14px ${alpha('#0288d1', 0.4)}`,
                      '&:hover': {
                        background: isDark
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #01579b 0%, #014a7d 100%)',
                        boxShadow: isDark 
                          ? `0 6px 20px ${alpha('#facc15', 0.5)}`
                          : `0 6px 20px ${alpha('#0288d1', 0.5)}`,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        background: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                      }
                    }}
                  >
                    Cambiar Contraseña
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}