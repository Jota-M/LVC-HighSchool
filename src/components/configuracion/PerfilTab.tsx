// components/configuracion/PerfilTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  Stack,
  Divider,
  Grid,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import configuracionService, { Perfil } from '@/services/configuracionService';

export default function PerfilTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerPerfil();
      setPerfil(data);
      setEmail(data.email);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!email || email === perfil?.email) return;

    try {
      setSaving(true);
      setError(null);
      await configuracionService.actualizarPerfil({ email });
      
      setSuccess('Email actualizado correctamente');
      await cargarPerfil();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar email');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress 
          sx={{ 
            color: isDark ? '#facc15' : '#0288d1',
            animationDuration: '0.8s'
          }} 
          size={50}
        />
      </Box>
    );
  }

  if (!perfil) {
    return (
      <Alert 
        severity="error"
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
        }}
      >
        No se pudo cargar la información del perfil
      </Alert>
    );
  }

  const emailCambiado = email !== perfil.email;

  return (
    <Stack spacing={3}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            '& .MuiAlert-icon': {
              color: theme.palette.error.main
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
            '& .MuiAlert-icon': {
              color: isDark ? '#facc15' : '#0288d1'
            }
          }}
        >
          {success}
        </Alert>
      )}

      {/* Avatar y Nombre */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.2)}`,
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#facc15', 0.05)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha('#0288d1', 0.05)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: isDark 
              ? `0 8px 24px ${alpha('#facc15', 0.15)}`
              : `0 8px 24px ${alpha('#0288d1', 0.15)}`,
            transform: 'translateY(-2px)',
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: '2rem',
                fontWeight: 700,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
                border: `3px solid ${isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3)}`,
              }}
            >
              {perfil.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {perfil.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {perfil.email}
              </Typography>
            </Box>
            {perfil.verificado && (
              <Chip
                icon={<VerifiedUserIcon />}
                label="Verificado"
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: isDark ? '#000' : '#fff',
                  }
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Información General */}
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
            <Typography variant="h6" fontWeight={700}>
              Información General
            </Typography>
          }
          subheader="Datos básicos de tu cuenta"
          sx={{
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Username */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                value={perfil.username}
                disabled
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: isDark ? '#facc15' : '#0288d1' }} />
                }}
                helperText="El nombre de usuario no se puede cambiar"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  }
                }}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: isDark ? '#facc15' : '#0288d1' }} />
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

            {emailCambiado && (
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleGuardar}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
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
                      }
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Estado de la Cuenta */}
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
            <Typography variant="h6" fontWeight={700}>
              Estado de la Cuenta
            </Typography>
          }
          sx={{
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
          }}
        />
        <CardContent>
          <Stack spacing={2.5}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                {perfil.activo ? (
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
                ) : (
                  <CancelIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                )}
                <Typography fontWeight={600} fontSize="1.05rem">Estado:</Typography>
              </Box>
              <Chip
                label={perfil.activo ? 'Activa' : 'Inactiva'}
                sx={{
                  backgroundColor: perfil.activo ? alpha('#10b981', 0.15) : alpha('#ef4444', 0.15),
                  color: perfil.activo ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                  border: `1px solid ${perfil.activo ? alpha('#10b981', 0.3) : alpha('#ef4444', 0.3)}`,
                }}
              />
            </Box>

            <Divider />

            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                {perfil.verificado ? (
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
                ) : (
                  <CancelIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
                )}
                <Typography fontWeight={600} fontSize="1.05rem">Email Verificado:</Typography>
              </Box>
              <Chip
                label={perfil.verificado ? 'Verificado' : 'Pendiente'}
                sx={{
                  backgroundColor: perfil.verificado ? alpha('#10b981', 0.15) : alpha('#f59e0b', 0.15),
                  color: perfil.verificado ? '#10b981' : '#f59e0b',
                  fontWeight: 600,
                  border: `1px solid ${perfil.verificado ? alpha('#10b981', 0.3) : alpha('#f59e0b', 0.3)}`,
                }}
              />
            </Box>

            <Divider />

            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <CalendarTodayIcon sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 24 }} />
                <Typography fontWeight={600} fontSize="1.05rem">Último Acceso:</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {perfil.ultimo_acceso
                  ? new Date(perfil.ultimo_acceso).toLocaleString('es-BO')
                  : 'N/A'}
              </Typography>
            </Box>

            <Divider />

            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <CalendarTodayIcon sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 24 }} />
                <Typography fontWeight={600} fontSize="1.05rem">Miembro Desde:</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {new Date(perfil.created_at).toLocaleDateString('es-BO')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Roles */}
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
            <Typography variant="h6" fontWeight={700}>
              Roles Asignados
            </Typography>
          }
          subheader="Los roles determinan tus permisos en el sistema"
          sx={{
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
          }}
        />
        <CardContent>
          {perfil.roles && perfil.roles.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              {perfil.roles.map((rol) => (
                <Chip
                  key={rol.id}
                  label={rol.nombre}
                  sx={{
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha('#facc15', 0.2)} 0%, ${alpha('#f59e0b', 0.2)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#0288d1', 0.2)} 0%, ${alpha('#01579b', 0.2)} 100%)`,
                    color: isDark ? '#facc15' : '#0288d1',
                    fontWeight: 600,
                    border: `1px solid ${isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3)}`,
                    px: 2,
                    py: 2.5,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark 
                        ? `0 4px 12px ${alpha('#facc15', 0.3)}`
                        : `0 4px 12px ${alpha('#0288d1', 0.3)}`,
                    }
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tienes roles asignados
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}