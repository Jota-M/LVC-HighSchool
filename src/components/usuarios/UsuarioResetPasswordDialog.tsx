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
  Zoom,
  keyframes,
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
  Security as SecurityIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
`;

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
          borderRadius: 4,
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px rgba(3, 169, 244, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        },
      }}
    >
      <form onSubmit={handleReset}>
        {/* Header Ultra Moderno */}
        <DialogTitle
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            pt: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.dark, 0.08)} 100%)`,
            backdropFilter: 'blur(20px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${theme.palette.info.main}, transparent)`,
              animation: `${shimmer} 2s infinite`,
              backgroundSize: '1000px 100%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Zoom in={open} style={{ transitionDelay: '100ms' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.4)}`,
                  animation: `${float} 3s ease-in-out infinite`,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: 2.5,
                    padding: '2px',
                    background: `linear-gradient(135deg, ${alpha('#fff', 0.4)}, transparent)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  },
                }}
              >
                <LockResetIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Zoom>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Resetear Contraseña
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Nueva contraseña temporal
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small" 
            disabled={loading}
            sx={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'rotate(90deg) scale(1.1)',
                bgcolor: alpha(theme.palette.error.main, 0.15),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Collapse in={!!error}>
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                animation: `${shake} 0.5s`,
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Collapse>

          {/* Card de usuario */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
              border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`,
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.4)}`,
              }}
            >
              <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Resetear contraseña para:
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {usuario?.username}
              </Typography>
            </Box>
          </Box>

          {/* Alerta informativa */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            <SecurityIcon sx={{ color: theme.palette.warning.main, fontSize: 22, mt: 0.2 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 500 }}>
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
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                fullWidth
                disabled={loading}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        fontSize="small" 
                        sx={{ 
                          color: focusedField === 'password' ? theme.palette.info.main : 'action',
                          transition: 'all 0.3s',
                          transform: focusedField === 'password' ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          transition: 'all 0.3s',
                          '&:hover': { 
                            transform: 'scale(1.2) rotate(15deg)',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: focusedField === 'password' 
                      ? alpha(theme.palette.info.main, 0.05)
                      : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.info.main, 0.2)}`,
                    },
                  },
                }}
              />

              {/* Indicador de fuerza de contraseña ULTRA MODERNO */}
              {password && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Seguridad de la contraseña
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: `${passwordStrength.color}.main`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.strength}
                    color={passwordStrength.color as any}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.grey[500], 0.15),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #fcd34d, #f59e0b)', // amarillo a naranja
                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)', // sombra con transparencia
                      },
                    }}
                  />
                  <Box 
                    sx={{ 
                      mt: 1.5, 
                      p: 1.5, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                      💡 <strong>Consejo:</strong> Usa mayúsculas, números y símbolos para mayor seguridad
                    </Typography>
                  </Box>
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
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                required
                fullWidth
                disabled={loading}
                size="small"
                error={confirmPassword.length > 0 && !passwordsMatch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        fontSize="small" 
                        sx={{ 
                          color: focusedField === 'confirm' ? theme.palette.info.main : 'action',
                          transition: 'all 0.3s',
                          transform: focusedField === 'confirm' ? 'scale(1.2)' : 'scale(1)',
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmPassword && (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          {passwordsMatch ? (
                            <CheckCircleIcon 
                              color="success" 
                              fontSize="small"
                              sx={{
                                animation: 'scaleIn 0.3s ease',
                                '@keyframes scaleIn': {
                                  '0%': { transform: 'scale(0)' },
                                  '50%': { transform: 'scale(1.2)' },
                                  '100%': { transform: 'scale(1)' },
                                },
                              }}
                            />
                          ) : (
                            <CancelIcon 
                              color="error" 
                              fontSize="small"
                              sx={{
                                animation: `${shake} 0.5s`,
                              }}
                            />
                          )}
                        </Box>
                      )}
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          transition: 'all 0.3s',
                          '&:hover': { 
                            transform: 'scale(1.2) rotate(15deg)',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          },
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: focusedField === 'confirm' 
                      ? alpha(theme.palette.info.main, 0.05)
                      : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.info.main, 0.2)}`,
                    },
                  },
                }}
              />
              {confirmPassword && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: passwordsMatch 
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    border: `2px solid ${passwordsMatch 
                      ? alpha(theme.palette.success.main, 0.3)
                      : alpha(theme.palette.error.main, 0.3)}`,
                    transition: 'all 0.3s',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordsMatch ? 'success.main' : 'error.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            gap: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            size="large"
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              borderWidth: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
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
              flex: 1,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.4)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: `0 16px 32px ${alpha(theme.palette.info.main, 0.6)}`,
                '&::before': {
                  left: '100%',
                },
              },
              '&:active': {
                transform: 'translateY(-2px) scale(0.98)',
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