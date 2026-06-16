// components/configuracion/ActividadTab.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Chip, Alert, CircularProgress,
  Typography, Stack, useTheme, alpha, keyframes,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import configuracionService, { Actividad } from '@/services/configuracionService';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Label maps ───────────────────────────────────────────────────────────────
const ACCION_LABELS: Record<string, string> = {
  login:                   'Inicio de sesión',
  logout:                  'Cierre de sesión',
  crear:                   'Creación',
  actualizar:              'Actualización',
  eliminar:                'Eliminación',
  cambiar_password:        'Cambio de contraseña',
  actualizar_perfil:       'Actualización de perfil',
  cerrar_sesion:           'Cierre de sesión',
  cerrar_todas_sesiones:   'Cierre de todas las sesiones',
  registro_completo:       'Registro completo',
};

const MODULO_LABELS: Record<string, string> = {
  auth:          'Autenticación',
  configuracion: 'Configuración',
  estudiante:    'Estudiantes',
  docente:       'Docentes',
  matricula:     'Matrículas',
  usuario:       'Usuarios',
};

// ─── Per-result config ────────────────────────────────────────────────────────
function getResultConfig(resultado: string) {
  switch (resultado) {
    case 'exitoso':  return { icon: CheckCircleIcon,  color: '#10b981', label: 'Exitoso'   };
    case 'fallido':  return { icon: CancelIcon,       color: '#ef4444', label: 'Fallido'   };
    case 'pendiente':return { icon: WarningAmberIcon, color: '#f59e0b', label: 'Pendiente' };
    default:         return { icon: AccessTimeIcon,   color: '#6b7280', label: resultado   };
  }
}

// ─── Relative date ────────────────────────────────────────────────────────────
function formatFecha(d: string) {
  const date = new Date(d);
  const diff  = Date.now() - date.getTime();
  const m     = Math.floor(diff / 60000);
  const h     = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (m < 1)    return 'Hace un momento';
  if (m < 60)   return `Hace ${m} min`;
  if (h < 24)   return `Hace ${h}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Single activity row ──────────────────────────────────────────────────────
function ActivityRow({
  actividad, accent, border, surface,
}: {
  actividad: Actividad;
  accent: string; border: string; surface: string;
}) {
  const cfg = getResultConfig(actividad.resultado);
  const Icon = cfg.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.8,
        p: 1.8,
        borderRadius: 2,
        border: `1px solid ${border}`,
        background: surface,
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(accent, 0.04),
          borderColor: alpha(accent, 0.18),
          transform: 'translateX(3px)',
        },
      }}
    >
      {/* Circle icon */}
      <Box
        sx={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(cfg.color, 0.12),
          border: `1px solid ${alpha(cfg.color, 0.25)}`,
        }}
      >
        <Icon sx={{ fontSize: 18, color: cfg.color }} />
      </Box>

      {/* Content */}
      <Box flex={1} minWidth={0}>
        {/* Action + module */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.3 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>
            {ACCION_LABELS[actividad.accion] ?? actividad.accion}
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            {MODULO_LABELS[actividad.modulo] ?? actividad.modulo}
          </Typography>
        </Box>

        {/* Message */}
        {actividad.mensaje && (
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 0.6, lineHeight: 1.4 }}>
            {actividad.mensaje}
          </Typography>
        )}

        {/* Meta row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {formatFecha(actividad.created_at)}
            </Typography>
          </Box>
          {actividad.ip_address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                {actividad.ip_address}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Status chip */}
      <Chip
        label={cfg.label}
        size="small"
        sx={{
          alignSelf: 'flex-start',
          flexShrink: 0,
          bgcolor: alpha(cfg.color, 0.12),
          color: cfg.color,
          fontWeight: 700,
          fontSize: '0.7rem',
          border: `1px solid ${alpha(cfg.color, 0.25)}`,
          height: 22,
        }}
      />
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ActividadTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent   = isDark ? '#facc15' : '#0288d1';
  const accentBg = isDark ? alpha('#facc15', 0.06) : alpha('#0288d1', 0.06);
  const border   = isDark ? alpha('#ffffff', 0.09) : alpha('#000000', 0.08);
  const surface  = isDark ? alpha('#ffffff', 0.025) : alpha('#000000', 0.018);

  const [actividades, setActividades]   = useState<Actividad[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [total, setTotal]               = useState(0);
  const [offset, setOffset]             = useState(0);
  const [error, setError]               = useState<string | null>(null);
  const LIMIT = 20;

  useEffect(() => { cargarActividades(); }, []);

  const cargarActividades = async (loadMore = false) => {
    try {
      loadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const currentOffset = loadMore ? offset : 0;
      const data = await configuracionService.obtenerActividad(LIMIT, currentOffset);

      setActividades((prev) => loadMore ? [...prev, ...data.actividades] : data.actividades);
      setTotal(data.total);
      setOffset(currentOffset + LIMIT);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cargar actividad');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading && actividades.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={46} sx={{ color: accent }} />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}
          sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
          {error}
        </Alert>
      )}

      {/* ── Card ── */}
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
            px: 2.5, py: 2,
            background: accentBg,
            borderBottom: `1px solid ${border}`,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})` }}>
              <TimelineIcon sx={{ fontSize: 17, color: '#fff' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }}>
                Actividad Reciente
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Historial de tus últimas acciones
              </Typography>
            </Box>
          </Box>

          {/* Counter badge */}
          <Chip
            label={`${actividades.length} / ${total}`}
            size="small"
            sx={{
              bgcolor: accentBg,
              color: accent,
              border: `1px solid ${alpha(accent, 0.28)}`,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Body */}
        <Box sx={{ p: 2.5, background: surface }}>
          {actividades.length === 0 ? (
            <Alert severity="info"
              sx={{ borderRadius: 2, border: `1px solid ${alpha(accent, 0.3)}`, bgcolor: accentBg, '& .MuiAlert-icon': { color: accent } }}>
              No tienes actividad registrada aún
            </Alert>
          ) : (
            <Stack spacing={1.2}>
              {actividades.map((a) => (
                <ActivityRow
                  key={a.id}
                  actividad={a}
                  accent={accent}
                  border={border}
                  surface={surface}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Load more */}
        {actividades.length < total && (
          <Box
            sx={{
              px: 2.5, py: 2,
              borderTop: `1px solid ${border}`,
              background: accentBg,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={() => cargarActividades(true)}
              disabled={loadingMore}
              startIcon={
                loadingMore
                  ? <CircularProgress size={18} sx={{ color: accent }} />
                  : <ExpandMoreIcon />
              }
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.83rem',
                color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
                px: 3, py: 0.8,
                '&:hover': {
                  bgcolor: alpha(accent, 0.08),
                  borderColor: accent,
                },
              }}
            >
              {loadingMore ? 'Cargando…' : `Cargar más (${total - actividades.length} restantes)`}
            </Button>
          </Box>
        )}
      </Box>
    </Stack>
  );
}