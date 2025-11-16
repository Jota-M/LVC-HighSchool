'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  alpha,
  useTheme,
  Slide,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  LockReset as LockResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export default function UsuarioResetPasswordDialog({
  open,
  onClose,
  usuario,
  onSuccess,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validación de contraseña en tiempo real
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: 'grey' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    if (strength < 40) return { strength, label: 'Débil', color: 'error' };
    if (strength < 70) return { strength, label: 'Media', color: 'warning' };
    return { strength, label: 'Fuerte', color: 'success' };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario) return;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await usuariosService.resetearPassword(usuario.id, password);
      onSuccess();
      onClose();
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as any}
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
            : 'none',
        },
      }}
    >
      <form onSubmit={handleReset}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockResetIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Resetear Contraseña
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Establecer nueva contraseña temporal
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Collapse in={!!error}>
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Collapse>

          {/* Card de usuario */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)}, ${alpha(theme.palette.info.dark, 0.2)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
              }}
            >
              <PersonIcon sx={{ color: theme.palette.info.main, fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Resetear contraseña para:
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {usuario?.username}
              </Typography>
            </Box>
          </Box>

          {/* Alerta informativa */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <InfoIcon sx={{ color: theme.palette.warning.main, fontSize: 20, mt: 0.2 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              El usuario deberá cambiar esta contraseña en su próximo inicio de sesión
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Nueva contraseña */}
            <Box>
              <TextField
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Indicador de fuerza de contraseña */}
              {password && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Seguridad de la contraseña
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={`${passwordStrength.color}.main`}
                    >
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.strength}
                    color={passwordStrength.color as any}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.grey[500], 0.2),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Mínimo 8 caracteres. Usa mayúsculas, números y símbolos para mayor seguridad
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Confirmar contraseña */}
            <Box>
              <TextField
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                disabled={loading}
                error={confirmPassword.length > 0 && !passwordsMatch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmPassword && (
                        <Box sx={{ mr: 1 }}>
                          {passwordsMatch ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      )}
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              {confirmPassword && (
                <Typography
                  variant="caption"
                  color={passwordsMatch ? 'success.main' : 'error.main'}
                  sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}
                >
                  {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            gap: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            size="large"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              borderWidth: 2,
              px: 3,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !passwordsMatch || password.length < 8}
            size="large"
            startIcon={loading ? null : <LockResetIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.info.main, 0.4)}`,
              },
              '&:disabled': {
                background: theme.palette.action.disabledBackground,
                boxShadow: 'none',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Resetear Contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}