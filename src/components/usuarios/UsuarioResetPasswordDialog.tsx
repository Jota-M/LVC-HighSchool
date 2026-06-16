'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, Button, Box, Typography,
  TextField, Alert, CircularProgress, useTheme, alpha,
  InputAdornment, IconButton, LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export default function UsuarioResetPasswordDialog({ open, onClose, usuario, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── tokens (mismo sistema que NuevoHorarioModal) ────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.10)' : 'rgba(2,136,209,0.07)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '12px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}` },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  // ── fuerza de contraseña ────────────────────────────────────────────────────
  const getPasswordStrength = () => {
    if (!password) return { pct: 0, label: '', color: brand };
    let s = 0;
    if (password.length >= 8) s += 25;
    if (password.length >= 12) s += 15;
    if (/[a-z]/.test(password)) s += 15;
    if (/[A-Z]/.test(password)) s += 15;
    if (/[0-9]/.test(password)) s += 15;
    if (/[^a-zA-Z0-9]/.test(password)) s += 15;
    if (s < 40) return { pct: s, label: 'Débil', color: theme.palette.error.main };
    if (s < 70) return { pct: s, label: 'Media', color: theme.palette.warning.main };
    return { pct: s, label: 'Fuerte', color: theme.palette.success.main };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = !!password && !!confirmPassword && password === confirmPassword;

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres');

    setError('');
    setLoading(true);
    try {
      await usuariosService.resetearPassword(usuario.id, password);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      <form onSubmit={handleReset}>

        {/* ── HEADER ── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.5,
              }}>
                Administración · Seguridad
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LockOpenIcon sx={{ color: brand, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary' }}>
                  Resetear contraseña
                </Typography>
              </Box>
            </Box>

            <Box onClick={handleClose} sx={{
              width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
              color: 'text.secondary', transition: 'all 0.15s',
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')}
              sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Card de usuario */}
          <Box sx={{
            p: 1.75, borderRadius: '12px',
            background: alpha(brand, 0.08), border: `1px solid ${alpha(brand, 0.2)}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '9px',
              background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.28)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PersonIcon sx={{ color: brand, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Resetear contraseña para:
              </Typography>
              <Typography fontWeight={700} fontSize={15} color="text.primary">
                {usuario?.username}
              </Typography>
            </Box>
          </Box>

          {/* Advertencia */}
          <Box sx={{
            p: 1.75, borderRadius: '12px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: 1.25,
          }}>
            <ShieldIcon sx={{ color: 'warning.main', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              El usuario deberá cambiar esta contraseña en su próximo inicio de sesión
            </Typography>
          </Box>

          {/* Campo contraseña */}
          <Box>
            <TextField
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required fullWidth disabled={loading} size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            {password && (
              <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Seguridad</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: strength.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {strength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={strength.pct}
                  sx={{
                    height: 5, borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[500], 0.15),
                    '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: strength.color },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Campo confirmar */}
          <Box>
            <TextField
              label="Confirmar contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required fullWidth disabled={loading} size="small"
              error={!!confirmPassword && !passwordsMatch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {confirmPassword && (
                        passwordsMatch
                          ? <CheckCircleIcon color="success" fontSize="small" />
                          : <CancelIcon color="error" fontSize="small" />
                      )}
                      <IconButton size="small" onClick={() => setShowConfirmPassword(v => !v)}>
                        {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            {confirmPassword && (
              <Box sx={{
                mt: 1, p: '8px 12px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: 0.75,
                background: passwordsMatch ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.error.main, 0.08),
                border: `1px solid ${passwordsMatch ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
              }}>
                <Typography variant="caption" fontWeight={600}
                  sx={{ color: passwordsMatch ? 'success.main' : 'error.main' }}>
                  {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', gap: 1.25, borderTop: `1px solid ${borderField}` }}>
          <Button onClick={handleClose} disabled={loading} sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600,
            color: 'text.secondary', border: `1px solid ${borderField}`,
            '&:hover': { borderColor: brand, color: brand, background: alpha(brand, 0.06) },
          }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !passwordsMatch || password.length < 8}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockOpenIcon />}
            sx={{
              flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
            }}
          >
            {loading ? 'Reseteando...' : 'Resetear contraseña'}
          </Button>
        </Box>

      </form>
    </Dialog>
  );
}