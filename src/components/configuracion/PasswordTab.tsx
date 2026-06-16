// components/configuracion/PasswordTab.tsx
'use client';
import { useState } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress,
  Typography, Stack, InputAdornment, IconButton,
  LinearProgress, useTheme, alpha, keyframes,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import configuracionService from '@/services/configuracionService';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Password strength helpers ────────────────────────────────────────────────
interface StrengthResult {
  score: number;      // 0–4
  label: string;
  color: string;
}

function evalStrength(pwd: string): StrengthResult {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let s = 0;
  if (pwd.length >= 8)            s++;
  if (/[A-Z]/.test(pwd))          s++;
  if (/[0-9]/.test(pwd))          s++;
  if (/[^A-Za-z0-9]/.test(pwd))   s++;
  const map: StrengthResult[] = [
    { score: 1, label: 'Muy débil',  color: '#ef4444' },
    { score: 2, label: 'Débil',      color: '#f59e0b' },
    { score: 3, label: 'Aceptable',  color: '#3b82f6' },
    { score: 4, label: 'Fuerte',     color: '#10b981' },
  ];
  return map[s - 1] ?? map[0];
}

interface Req { label: string; met: (p: string) => boolean }
const REQUIREMENTS: Req[] = [
  { label: 'Mínimo 8 caracteres',         met: (p) => p.length >= 8 },
  { label: 'Al menos una mayúscula',       met: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos un número',           met: (p) => /[0-9]/.test(p) },
  { label: 'Al menos un carácter especial',met: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
  title, subtitle, icon: Icon, children,
  accent, accentBg, border, surface, delay = 0,
}: {
  title: string; subtitle?: string; icon: React.ElementType;
  children: React.ReactNode;
  accent: string; accentBg: string; border: string; surface: string; delay?: number;
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${border}`,
        overflow: 'hidden',
        animation: `${fadeUp} 0.4s ease both`,
        animationDelay: `${delay}ms`,
        transition: 'box-shadow 0.25s, transform 0.25s',
        '&:hover': { boxShadow: `0 8px 28px ${alpha(accent, 0.12)}`, transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, background: accentBg, borderBottom: `1px solid ${border}` }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})` }}>
          <Icon sx={{ fontSize: 17, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ p: 2.5, background: surface }}>{children}</Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PasswordTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent   = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.06);
  const border   = isDark ? alpha('#ffffff', 0.09) : alpha('#000000', 0.08);
  const surface  = isDark ? alpha('#ffffff', 0.025) : alpha('#000000', 0.018);

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [show, setShow]   = useState({ actual: false, nueva: false, confirm: false });
  const [form, setForm]   = useState({ password_actual: '', password_nueva: '', password_confirmacion: '' });

  const strength = evalStrength(form.password_nueva);

  const toggleShow = (field: keyof typeof show) =>
    setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError(null);
    };

  const handleGuardar = async () => {
    if (!form.password_actual || !form.password_nueva || !form.password_confirmacion) {
      setError('Completa todos los campos');
      return;
    }
    if (form.password_nueva !== form.password_confirmacion) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (form.password_nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await configuracionService.cambiarPassword(form);
      setSuccess('Contraseña actualizada correctamente');
      setForm({ password_actual: '', password_nueva: '', password_confirmacion: '' });
      setTimeout(() => setSuccess(null), 4000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const sharedProps = { accent, accentBg, border, surface };
  const canSave = form.password_actual && form.password_nueva && form.password_confirmacion;

  return (
    <Stack spacing={2.5}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}
          sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}
          sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, bgcolor: accentBg, '& .MuiAlert-icon': { color: accent } }}>
          {success}
        </Alert>
      )}

      {/* ── Change password form ── */}
      <Section title="Cambiar Contraseña" subtitle="Actualiza tu contraseña de acceso" icon={LockIcon} delay={0} {...sharedProps}>
        <Stack spacing={2}>
          {/* Contraseña actual */}
          <TextField
            fullWidth
            size="small"
            label="Contraseña actual"
            type={show.actual ? 'text' : 'password'}
            value={form.password_actual}
            onChange={handleChange('password_actual')}
            InputProps={{
              startAdornment: <LockOpenIcon sx={{ mr: 1, color: accent, fontSize: 20 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => toggleShow('actual')} edge="end">
                    {show.actual ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx(accent)}
          />

          {/* Nueva contraseña */}
          <Box>
            <TextField
              fullWidth
              size="small"
              label="Nueva contraseña"
              type={show.nueva ? 'text' : 'password'}
              value={form.password_nueva}
              onChange={handleChange('password_nueva')}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: accent, fontSize: 20 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleShow('nueva')} edge="end">
                      {show.nueva ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx(accent)}
            />

            {/* Strength bar */}
            {form.password_nueva && (
              <Box sx={{ mt: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Seguridad</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>
                    {strength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(strength.score / 4) * 100}
                  sx={{
                    height: 5,
                    borderRadius: 99,
                    bgcolor: alpha(strength.color, 0.15),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strength.color,
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Confirmación */}
          <TextField
            fullWidth
            size="small"
            label="Confirmar nueva contraseña"
            type={show.confirm ? 'text' : 'password'}
            value={form.password_confirmacion}
            onChange={handleChange('password_confirmacion')}
            error={!!form.password_confirmacion && form.password_nueva !== form.password_confirmacion}
            helperText={
              form.password_confirmacion && form.password_nueva !== form.password_confirmacion
                ? 'Las contraseñas no coinciden'
                : undefined
            }
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: accent, fontSize: 20 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => toggleShow('confirm')} edge="end">
                    {show.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx(accent)}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <SaveIcon />}
              onClick={handleGuardar}
              disabled={saving || !canSave}
              sx={saveBtnSx(accent, isDark)}
            >
              Actualizar contraseña
            </Button>
          </Box>
        </Stack>
      </Section>

      {/* ── Requirements checklist ── */}
      <Section title="Requisitos de Seguridad" subtitle="Tu nueva contraseña debe cumplir lo siguiente" icon={LockIcon} delay={80} {...sharedProps}>
        <Stack spacing={1.2}>
          {REQUIREMENTS.map((req) => {
            const met = !!form.password_nueva && req.met(form.password_nueva);
            return (
              <Box key={req.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                {met
                  ? <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: alpha('#fff', 0.25) }} />
                }
                <Typography
                  sx={{
                    fontSize: '0.83rem',
                    color: met ? '#10b981' : 'text.secondary',
                    fontWeight: met ? 600 : 400,
                    transition: 'color 0.2s',
                  }}
                >
                  {req.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Section>
    </Stack>
  );
}

function fieldSx(accent: string) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent, borderWidth: 2 },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
  };
}

function saveBtnSx(accent: string, isDark: boolean) {
  return {
    borderRadius: 2, px: 3, py: 1,
    fontWeight: 700, fontSize: '0.85rem', textTransform: 'none' as const,
    background: isDark
      ? 'linear-gradient(135deg, #facc15, #f59e0b)'
      : 'linear-gradient(135deg, #0288d1, #01579b)',
    color: isDark ? '#000' : '#fff',
    boxShadow: `0 4px 14px ${alpha(accent, 0.35)}`,
    '&:hover': {
      background: isDark
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'linear-gradient(135deg, #01579b, #014a7d)',
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 18px ${alpha(accent, 0.45)}`,
    },
    '&.Mui-disabled': { opacity: 0.55 },
  };
}