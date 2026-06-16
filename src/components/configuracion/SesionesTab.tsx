// components/configuracion/SesionesTab.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Chip, Alert, CircularProgress, IconButton,
  Typography, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Stack, Tooltip,
  useTheme, alpha, keyframes,
} from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DevicesIcon from '@mui/icons-material/Devices';
import LanguageIcon from '@mui/icons-material/Language';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import configuracionService, { Sesion } from '@/services/configuracionService';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDeviceIcon(ua: string) {
  const u = ua.toLowerCase();
  if (u.includes('mobile') || u.includes('android') || u.includes('iphone')) return <SmartphoneIcon sx={{ fontSize: 26 }} />;
  if (u.includes('tablet') || u.includes('ipad')) return <TabletIcon sx={{ fontSize: 26 }} />;
  return <ComputerIcon sx={{ fontSize: 26 }} />;
}

function getDeviceName(ua: string) {
  const u = ua.toLowerCase();
  if (u.includes('mobile') || u.includes('android') || u.includes('iphone')) return 'Móvil';
  if (u.includes('tablet') || u.includes('ipad')) return 'Tablet';
  return 'Escritorio';
}

function getBrowserName(ua: string) {
  if (ua.includes('Edg'))     return 'Edge';
  if (ua.includes('Chrome'))  return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari'))  return 'Safari';
  return 'Navegador';
}

function formatRelative(d: string) {
  const date = new Date(d);
  const now = Date.now();
  const diff = now - date.getTime(); // positivo = pasado, negativo = futuro

  // Fecha futura (expiración)
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    const m    = Math.floor(absDiff / 60000);
    const h    = Math.floor(absDiff / 3600000);
    const days = Math.floor(absDiff / 86400000);
    if (m < 1)    return 'En un momento';
    if (m < 60)   return `En ${m} min`;
    if (h < 24)   return `En ${h}h`;
    if (days < 7) return `En ${days}d`;
    return date.toLocaleDateString('es-BO');
  }

  // Fecha pasada (inicio de sesión)
  const m    = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1)    return 'Ahora mismo';
  if (m < 60)   return `Hace ${m} min`;
  if (h < 24)   return `Hace ${h}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-BO');
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SesionesTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent   = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.06);
  const border   = isDark ? alpha('#ffffff', 0.09) : alpha('#000000', 0.08);
  const surface  = isDark ? alpha('#ffffff', 0.025) : alpha('#000000', 0.018);

  const [sesiones, setSesiones]             = useState<Sesion[]>([]);
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog]   = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState<string | null>(null);

  useEffect(() => { cargarSesiones(); }, []);

  const cargarSesiones = async () => {
    try {
      setLoading(true);
      setError(null);
      setSesiones(await configuracionService.obtenerSesiones());
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async (id: number) => {
    try {
      setActionLoading(id);
      setError(null);
      await configuracionService.cerrarSesion(id);
      setSuccess('Sesión cerrada correctamente');
      await cargarSesiones();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cerrar sesión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCerrarTodas = async () => {
    try {
      setLoading(true);
      setError(null);
      const n = await configuracionService.cerrarTodasSesiones();
      setSuccess(`${n} sesión${n !== 1 ? 'es' : ''} cerrada${n !== 1 ? 's' : ''} correctamente`);
      await cargarSesiones();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cerrar sesiones');
    } finally {
      setLoading(false);
      setConfirmDialog(false);
    }
  };

  if (loading && sesiones.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={46} sx={{ color: accent }} />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2.5}>
        {/* Feedback */}
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

        {/* ── Card principal ── */}
        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${border}`,
            overflow: 'hidden',
            animation: `${fadeUp} 0.4s ease both`,
            transition: 'box-shadow 0.25s',
            '&:hover': { boxShadow: `0 8px 28px ${alpha(accent, 0.1)}` },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: 2.5,
              py: 2,
              background: accentBg,
              borderBottom: `1px solid ${border}`,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})` }}>
                <DevicesIcon sx={{ fontSize: 17, color: '#fff' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }}>
                  Sesiones Activas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dispositivos donde has iniciado sesión
                </Typography>
              </Box>
            </Box>

            {sesiones.length > 1 && (
              <Button
                size="small"
                startIcon={<ExitToAppIcon />}
                onClick={() => setConfirmDialog(true)}
                disabled={loading}
                sx={{
                  borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 2,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  boxShadow: `0 4px 14px ${alpha('#ef4444', 0.35)}`,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 18px ${alpha('#ef4444', 0.45)}`,
                  },
                }}
              >
                Cerrar todas
              </Button>
            )}
          </Box>

          {/* Body */}
          <Box sx={{ p: 2.5, background: surface }}>
            {sesiones.length === 0 ? (
              <Alert severity="info"
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(accent, 0.3)}`,
                  bgcolor: accentBg,
                  '& .MuiAlert-icon': { color: accent },
                }}>
                No tienes sesiones activas en otros dispositivos
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {sesiones.map((sesion, i) => (
                  <SessionRow
                    key={sesion.id}
                    sesion={sesion}
                    isCurrent={i === 0}
                    actionLoading={actionLoading}
                    onClose={handleCerrarSesion}
                    accent={accent}
                    accentBg={accentBg}
                    border={border}
                    surface={surface}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>

        {/* ── Security note ── */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            bgcolor: alpha('#f59e0b', 0.07),
            animation: `${fadeUp} 0.4s ease both`,
            animationDelay: '80ms',
          }}
        >
          <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20, flexShrink: 0, mt: 0.1 }} />
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', mb: 0.3 }}>
              Nota de seguridad
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}>
              Si ves una sesión que no reconoces, ciérrala de inmediato y cambia tu contraseña.
            </Typography>
          </Box>
        </Box>
      </Stack>

      {/* ── Confirm dialog ── */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, border: `1px solid ${border}`, minWidth: 320 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          ¿Cerrar todas las sesiones?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.88rem' }}>
            Se cerrarán todas las sesiones activas excepto la actual. Tendrás que volver a iniciar
            sesión en esos dispositivos.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCerrarTodas}
            variant="contained"
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: `0 4px 14px ${alpha('#ef4444', 0.35)}`,
              '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
            }}
          >
            Cerrar todas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────
function SessionRow({
  sesion, isCurrent, actionLoading, onClose,
  accent, accentBg, border, surface,
}: {
  sesion: Sesion;
  isCurrent: boolean;
  actionLoading: number | null;
  onClose: (id: number) => void;
  accent: string; accentBg: string; border: string; surface: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${isCurrent ? alpha(accent, 0.3) : border}`,
        background: isCurrent ? alpha(accent, 0.05) : surface,
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(accent, 0.06),
          boxShadow: `0 4px 14px ${alpha(accent, 0.1)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Device icon */}
      <Box
        sx={{
          width: 46, height: 46, borderRadius: 2, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})`,
          color: '#fff',
        }}
      >
        {getDeviceIcon(sesion.user_agent)}
      </Box>

      {/* Info */}
      <Box flex={1} minWidth={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
            {getDeviceName(sesion.user_agent)} · {getBrowserName(sesion.user_agent)}
          </Typography>
          {isCurrent && (
            <Chip
              label="Sesión actual"
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})`,
                color: accent === '#facc15' ? '#000' : '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
        </Box>

        <Stack spacing={0.6}>
          {sesion.ip_address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LanguageIcon sx={{ fontSize: 15, color: accent }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {sesion.ip_address}
                {sesion.ubicacion && ` · ${sesion.ubicacion}`}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CalendarTodayIcon sx={{ fontSize: 15, color: accent }} />
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              Iniciada {formatRelative(sesion.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              Expira {formatRelative(sesion.expires_at)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Close button */}
      {!isCurrent && (
        <Tooltip title="Cerrar sesión">
          <IconButton
            onClick={() => onClose(sesion.id)}
            disabled={actionLoading === sesion.id}
            size="small"
            sx={{
              color: '#ef4444',
              bgcolor: alpha('#ef4444', 0.08),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.18),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s',
            }}
          >
            {actionLoading === sesion.id
              ? <CircularProgress size={20} sx={{ color: '#ef4444' }} />
              : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}