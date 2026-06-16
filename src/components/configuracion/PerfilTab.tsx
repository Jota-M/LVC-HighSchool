// components/configuracion/PerfilTab.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Chip, Alert, CircularProgress,
  Typography, Stack, Divider, useTheme, alpha, Avatar, keyframes,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import configuracionService, { Perfil } from '@/services/configuracionService';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Shared card shell ────────────────────────────────────────────────────────
function Section({
  title,
  subtitle,
  icon: Icon,
  children,
  accent,
  accentBg,
  border,
  surface,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent: string;
  accentBg: string;
  border: string;
  surface: string;
  delay?: number;
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${border}`,
        overflow: 'hidden',
        animation: `${fadeUp} 0.4s ease both`,
        animationDelay: `${delay}ms`,
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        '&:hover': {
          boxShadow: `0 8px 28px ${alpha(accent, 0.12)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          background: accentBg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})`,
          }}
        >
          <Icon sx={{ fontSize: 17, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5, background: surface }}>{children}</Box>
    </Box>
  );
}

// ─── Row inside "Estado de Cuenta" ───────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  accent,
  border,
  surface,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  accent: string;
  border: string;
  surface: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.8,
        borderRadius: 2,
        border: `1px solid ${border}`,
        background: surface,
        transition: 'background 0.2s',
        '&:hover': { background: alpha(accent, 0.05) },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Icon sx={{ fontSize: 18, color: accent }} />
        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</Typography>
      </Box>
      {value}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PerfilTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent   = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.06);
  const border   = isDark ? alpha('#ffffff', 0.09) : alpha('#000000', 0.08);
  const surface  = isDark ? alpha('#ffffff', 0.025) : alpha('#000000', 0.018);

  const [perfil, setPerfil]     = useState<Perfil | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerPerfil();
      setPerfil(data);
      setEmail(data.email);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cargar perfil');
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
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al actualizar email');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatRelative = (d: string) => {
    const diff  = Date.now() - new Date(d).getTime();
    const m     = Math.floor(diff / 60000);
    const h     = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (m < 1)    return 'Ahora mismo';
    if (m < 60)   return `Hace ${m} min`;
    if (h < 24)   return `Hace ${h}h`;
    if (days < 7) return `Hace ${days}d`;
    return formatDate(d);
  };

  // ── Loading ──
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={46} sx={{ color: accent }} />
      </Box>
    );
  }

  if (!perfil) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
        No se pudo cargar la información del perfil
      </Alert>
    );
  }

  const emailCambiado = email !== perfil.email;
  const sharedProps   = { accent, accentBg, border, surface };

  return (
    <Stack spacing={2.5}>
      {/* Feedback alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}
          sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            bgcolor: accentBg,
            '& .MuiAlert-icon': { color: accent },
          }}>
          {success}
        </Alert>
      )}

      {/* ── Avatar card ── */}
      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#facc15', 0.22) : alpha('#0288d1', 0.22)}`,
          background: isDark
            ? `linear-gradient(160deg, ${alpha('#facc15', 0.07)} 0%, ${alpha('#1a1a2e', 0.55)} 100%)`
            : `linear-gradient(160deg, ${alpha('#0288d1', 0.07)} 0%, ${alpha('#f0f7ff', 0.8)} 100%)`,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          animation: `${fadeUp} 0.35s ease both`,
        }}
      >
        <Avatar
          sx={{
            width: 72, height: 72,
            fontSize: '1.8rem', fontWeight: 700,
            background: isDark
              ? 'linear-gradient(135deg, #facc15, #f59e0b)'
              : 'linear-gradient(135deg, #0288d1, #01579b)',
            color: isDark ? '#000' : '#fff',
            border: `3px solid ${isDark ? alpha('#facc15', 0.35) : alpha('#0288d1', 0.35)}`,
            boxShadow: `0 8px 24px ${alpha(accent, 0.25)}`,
          }}
        >
          {perfil.username.charAt(0).toUpperCase()}
        </Avatar>

        <Box flex={1}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {perfil.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {perfil.email}
          </Typography>
        </Box>

        {perfil.verificado && (
          <Chip
            icon={<VerifiedUserIcon sx={{ fontSize: '14px !important', color: `${isDark ? '#000' : '#fff'} !important` }} />}
            label="Verificado"
            size="small"
            sx={{
              background: isDark
                ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                : 'linear-gradient(135deg, #0288d1, #01579b)',
              color: isDark ? '#000' : '#fff',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          />
        )}
      </Box>

      {/* ── Información general ── */}
      <Section title="Información General" subtitle="Datos básicos de tu cuenta" icon={PersonIcon} delay={60} {...sharedProps}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Nombre de Usuario"
            value={perfil.username}
            disabled
            size="small"
            InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: accent, fontSize: 20 }} /> }}
            helperText="El nombre de usuario no se puede cambiar"
            sx={fieldSx(accent)}
          />

          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: accent, fontSize: 20 }} /> }}
            sx={fieldSx(accent)}
          />

          {emailCambiado && (
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <SaveIcon />}
                onClick={handleGuardar}
                disabled={saving}
                sx={saveBtnSx(accent, isDark)}
              >
                Guardar cambios
              </Button>
            </Box>
          )}
        </Stack>
      </Section>

      {/* ── Estado de la cuenta ── */}
      <Section title="Estado de la Cuenta" subtitle="Información de seguridad y acceso" icon={ShieldIcon} delay={120} {...sharedProps}>
        <Stack spacing={1.5}>
          <InfoRow
            icon={perfil.activo ? CheckCircleIcon : CancelIcon}
            label="Estado"
            accent={perfil.activo ? '#10b981' : '#ef4444'}
            border={border}
            surface={surface}
            value={
              <Chip
                label={perfil.activo ? 'Activa' : 'Inactiva'}
                size="small"
                sx={{
                  bgcolor: alpha(perfil.activo ? '#10b981' : '#ef4444', 0.12),
                  color: perfil.activo ? '#10b981' : '#ef4444',
                  fontWeight: 700,
                  border: `1px solid ${alpha(perfil.activo ? '#10b981' : '#ef4444', 0.28)}`,
                  fontSize: '0.75rem',
                }}
              />
            }
          />

          <InfoRow
            icon={perfil.verificado ? CheckCircleIcon : CancelIcon}
            label="Email verificado"
            accent={perfil.verificado ? '#10b981' : '#f59e0b'}
            border={border}
            surface={surface}
            value={
              <Chip
                label={perfil.verificado ? 'Verificado' : 'Pendiente'}
                size="small"
                sx={{
                  bgcolor: alpha(perfil.verificado ? '#10b981' : '#f59e0b', 0.12),
                  color: perfil.verificado ? '#10b981' : '#f59e0b',
                  fontWeight: 700,
                  border: `1px solid ${alpha(perfil.verificado ? '#10b981' : '#f59e0b', 0.28)}`,
                  fontSize: '0.75rem',
                }}
              />
            }
          />

          {perfil.ultimo_acceso && (
            <InfoRow
              icon={AccessTimeIcon}
              label="Último acceso"
              accent={accent}
              border={border}
              surface={surface}
              value={
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: accent }}>
                  {formatRelative(perfil.ultimo_acceso)}
                </Typography>
              }
            />
          )}

          <InfoRow
            icon={CalendarTodayIcon}
            label="Miembro desde"
            accent={accent}
            border={border}
            surface={surface}
            value={
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.secondary' }}>
                {formatDate(perfil.created_at)}
              </Typography>
            }
          />
        </Stack>
      </Section>

      {/* ── Roles ── */}
      {perfil.roles?.length > 0 && (
        <Section title="Roles Asignados" subtitle="Determinan tus permisos en el sistema" icon={ShieldIcon} delay={180} {...sharedProps}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {perfil.roles.map((rol) => (
              <Chip
                key={rol.id}
                label={rol.nombre}
                sx={{
                  background: accentBg,
                  color: accent,
                  border: `1px solid ${alpha(accent, 0.28)}`,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(accent, 0.28)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              />
            ))}
          </Box>
        </Section>
      )}
    </Stack>
  );
}

// ─── Shared sx helpers ────────────────────────────────────────────────────────
function fieldSx(accent: string) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: accent,
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
  };
}

function saveBtnSx(accent: string, isDark: boolean) {
  const darkAccent = isDark ? '#facc15' : '#0288d1';
  return {
    borderRadius: 2,
    px: 3,
    py: 1,
    fontWeight: 700,
    fontSize: '0.85rem',
    textTransform: 'none' as const,
    background: isDark
      ? 'linear-gradient(135deg, #facc15, #f59e0b)'
      : 'linear-gradient(135deg, #0288d1, #01579b)',
    color: isDark ? '#000' : '#fff',
    boxShadow: `0 4px 14px ${alpha(darkAccent, 0.35)}`,
    '&:hover': {
      background: isDark
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'linear-gradient(135deg, #01579b, #014a7d)',
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 18px ${alpha(darkAccent, 0.45)}`,
    },
    '&.Mui-disabled': { opacity: 0.55 },
  };
}