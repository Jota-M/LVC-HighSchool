'use client';
// app/dashboard/docente/home/page.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, useTheme, alpha,
  Chip, Avatar, IconButton, Tooltip, Skeleton,
  Grid, LinearProgress, Divider, Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';

// Icons
import EventAvailableIcon   from '@mui/icons-material/EventAvailable';
import GradeRoundedIcon     from '@mui/icons-material/GradeRounded';
import AssessmentIcon       from '@mui/icons-material/Assessment';
import MenuBookIcon         from '@mui/icons-material/MenuBook';
import PsychologyIcon       from '@mui/icons-material/Psychology';
import CalendarMonthIcon    from '@mui/icons-material/CalendarMonth';
import RefreshIcon          from '@mui/icons-material/Refresh';
import GroupsIcon           from '@mui/icons-material/Groups';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon     from '@mui/icons-material/ArrowForward';
import AccessTimeIcon       from '@mui/icons-material/AccessTime';
import TodayIcon            from '@mui/icons-material/Today';
import ErrorOutlineIcon     from '@mui/icons-material/ErrorOutline';
import WbSunnyIcon          from '@mui/icons-material/WbSunny';
import NightsStayIcon       from '@mui/icons-material/NightsStay';
import SchoolIcon           from '@mui/icons-material/School';
import NotificationsIcon    from '@mui/icons-material/Notifications';

// Hooks
import { useAuth }             from '@/context/AuthContext';
import { useMisAsignaciones }  from '@/hooks/useAsistencia';
import { useMisMateriasNotas } from '@/hooks/useNotas';
import { useSolicitudesPermiso } from '@/hooks/useAsistencia';
import { useHorarioDocente }   from '@/hooks/useHorarioDocente';
import { useAcademicos }       from '@/hooks/useAcademicos';

// ─────────────────────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const fillBar = keyframes`
  from { width: 0; }
  to   { width: var(--target-width); }
`;
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;
const scanH = keyframes`
  0%   { left: -100%; }
  100% { left: 200%; }
`;
const rotateSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Buenos días', Icon: WbSunnyIcon };
  if (h < 19) return { texto: 'Buenas tardes', Icon: WbSunnyIcon };
  return { texto: 'Buenas noches', Icon: NightsStayIcon };
};

const horaActual = () =>
  new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

const fechaActual = () =>
  new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

// ─────────────────────────────────────────────────────────────
// COMPONENTE: TICKER NUMÉRICO (cuenta ascendente al montar)
// ─────────────────────────────────────────────────────────────

const CountUp: React.FC<{ to: number; duration?: number; suffix?: string }> = ({
  to, duration = 800, suffix = '',
}) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (to === 0) return;
    let start = 0;
    const step = Math.ceil(to / (duration / 16));
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [to, duration]);
  return <>{val}{suffix}</>;
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: PANEL STAT — estilo terminal/industrial
// ─────────────────────────────────────────────────────────────

interface StatPanelProps {
  label:    string;
  value:    number | string;
  sub?:     string;
  accent:   string;
  delay?:   number;
  loading?: boolean;
  warn?:    boolean;
  countUp?: boolean;
}

const StatPanel: React.FC<StatPanelProps> = ({
  label, value, sub, accent, delay = 0, loading, warn, countUp,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      p: 2,
      borderRadius: '2px',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: isDark ? alpha('#000', 0.4) : alpha('#fff', 0.7),
      border: `1px solid ${warn ? alpha('#ef4444', 0.5) : alpha(accent, 0.25)}`,
      borderLeft: `3px solid ${warn ? '#ef4444' : accent}`,
      animation: `${slideRight} 0.4s ease-out ${delay}ms both`,
    }}>
      {/* Scan line */}
      <Box sx={{
        position: 'absolute', top: 0, bottom: 0, width: '30%',
        background: `linear-gradient(90deg, transparent, ${alpha(accent, 0.04)}, transparent)`,
        animation: `${scanH} 3s ease-in-out ${delay}ms infinite`,
        pointerEvents: 'none',
      }} />

      <Typography sx={{
        fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: warn ? '#ef4444' : accent,
        mb: 0.5, display: 'block',
      }}>
        {label}
      </Typography>

      {loading ? (
        <Skeleton variant="text" width={60} height={40} sx={{ bgcolor: alpha(accent, 0.1) }} />
      ) : (
        <Typography sx={{
          fontSize: '2rem', fontWeight: 900, lineHeight: 1,
          letterSpacing: '-0.04em', color: warn ? '#ef4444' : 'text.primary',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {countUp && typeof value === 'number'
            ? <CountUp to={value} />
            : value
          }
        </Typography>
      )}

      {sub && (
        <Typography variant="caption" sx={{
          color: 'text.disabled', fontSize: '0.65rem', fontWeight: 600,
          display: 'block', mt: 0.25,
        }}>
          {sub}
        </Typography>
      )}

      {warn && (
        <Box sx={{
          position: 'absolute', top: 8, right: 8,
          width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444',
          animation: `${blink} 1.2s ease-in-out infinite`,
        }} />
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: MÓDULO NAV — filas con barra lateral de comando
// ─────────────────────────────────────────────────────────────

interface NavModuleProps {
  title:    string;
  desc:     string;
  icon:     React.ElementType;
  accent:   string;
  href:     string;
  delay?:   number;
  badge?:   { text: string; urgent?: boolean };
  stats?:   { label: string; value: string | number; color?: string }[];
  bar?:     { value: number; label?: string };
  loading?: boolean;
}

const NavModule: React.FC<NavModuleProps> = ({
  title, desc, icon: Icon, accent, href,
  delay = 0, badge, stats = [], bar, loading,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  return (
    <Box
      onClick={() => router.push(href)}
      sx={{
        display: 'flex', alignItems: 'stretch',
        borderRadius: '4px', overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#000', 0.3) : '#fff',
        animation: `${fadeIn} 0.4s ease-out ${delay}ms both`,
        transition: 'all 0.18s ease',
        position: 'relative',
        '&:hover': {
          borderColor: accent,
          transform: 'translateX(4px)',
          boxShadow: `inset 0 0 0 1px ${alpha(accent, 0.3)}, 4px 0 0 ${accent}`,
          '& .nav-arrow': { opacity: 1, transform: 'translateX(3px)' },
          '& .nav-icon-wrap': { bgcolor: accent },
          '& .nav-icon-wrap svg': { color: isDark ? '#000' : '#fff' },
        },
      }}
    >
      {/* Ícono izquierdo */}
      <Box
        className="nav-icon-wrap"
        sx={{
          width: 56, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(accent, isDark ? 0.15 : 0.08),
          borderRight: `1px solid ${alpha(accent, 0.15)}`,
          transition: 'background 0.2s ease',
        }}
      >
        <Icon sx={{ fontSize: 22, color: accent, transition: 'color 0.2s ease' }} />
      </Box>

      {/* Cuerpo */}
      <Box sx={{ flex: 1, p: 1.75, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={900} sx={{
              letterSpacing: '-0.02em', lineHeight: 1.2, fontSize: '0.9rem',
            }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
              {desc}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: 1 }}>
            {badge && (
              <Chip
                size="small"
                label={badge.text}
                icon={badge.urgent ? <WarningAmberIcon sx={{ fontSize: '11px !important' }} /> : undefined}
                sx={{
                  height: 20, fontSize: '0.62rem', fontWeight: 800,
                  borderRadius: '3px',
                  bgcolor: badge.urgent
                    ? alpha('#ef4444', isDark ? 0.2 : 0.1)
                    : alpha(accent, isDark ? 0.2 : 0.1),
                  color: badge.urgent ? '#ef4444' : accent,
                  border: `1px solid ${badge.urgent ? alpha('#ef4444', 0.3) : alpha(accent, 0.3)}`,
                  '& .MuiChip-icon': {
                    color: badge.urgent ? '#ef4444' : accent,
                  },
                }}
              />
            )}
            <ArrowForwardIcon
              className="nav-arrow"
              sx={{ fontSize: 14, color: accent, opacity: 0, transition: 'all 0.18s ease' }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="text" width={50} height={28}
                sx={{ bgcolor: alpha(accent, 0.08) }} />
            ))}
          </Box>
        ) : (
          <>
            {/* Stats en fila */}
            {stats.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2.5, mb: bar ? 1 : 0, flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <Box key={i}>
                    <Typography sx={{
                      fontSize: '1.2rem', fontWeight: 900, lineHeight: 1,
                      letterSpacing: '-0.03em', color: s.color ?? accent,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" sx={{
                      fontSize: '0.6rem', fontWeight: 700, color: 'text.disabled',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Barra de progreso */}
            {bar && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  {bar.label && (
                    <Typography variant="caption" sx={{
                      fontSize: '0.6rem', color: 'text.disabled',
                      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
                    }}>
                      {bar.label}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{
                    fontSize: '0.65rem', fontWeight: 900, color: accent, ml: 'auto',
                  }}>
                    {bar.value}%
                  </Typography>
                </Box>
                <Box sx={{
                  height: 3, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07),
                  borderRadius: 0, overflow: 'hidden',
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${bar.value}%`,
                    bgcolor: accent,
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: RELOJ EN VIVO
// ─────────────────────────────────────────────────────────────

const RelojVivo: React.FC<{ accent: string }> = ({ accent }) => {
  const [hora, setHora] = useState(horaActual());
  useEffect(() => {
    const id = setInterval(() => setHora(horaActual()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      <Typography sx={{
        fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.05em',
        color: accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        fontFamily: 'monospace',
      }}>
        {hora}
      </Typography>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: CLASE EN CURSO
// ─────────────────────────────────────────────────────────────

const ClaseEnCurso: React.FC<{
  celda:  any;
  isDark: boolean;
  accent: string;
}> = ({ celda, isDark, accent }) => (
  <Box sx={{
    p: 1.75,
    borderRadius: '4px',
    bgcolor: isDark ? alpha('#10b981', 0.1) : alpha('#10b981', 0.06),
    border: `1px solid ${alpha('#10b981', 0.35)}`,
    borderLeft: `3px solid #10b981`,
    display: 'flex', alignItems: 'center', gap: 1.5,
    animation: `${slideDown} 0.35s ease-out both`,
  }}>
    <Box sx={{
      width: 10, height: 10, borderRadius: '50%',
      bgcolor: '#10b981', flexShrink: 0,
      boxShadow: `0 0 0 3px ${alpha('#10b981', 0.25)}`,
      animation: `${blink} 1.5s ease-in-out infinite`,
    }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{
        fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: '#10b981', display: 'block', mb: 0.15,
      }}>
        En clase ahora
      </Typography>
      <Typography variant="body2" fontWeight={800} noWrap>
        {celda.materia_nombre}
        {celda.aula && (
          <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary', ml: 1, fontSize: '0.8rem' }}>
            · Aula {celda.aula}
          </Box>
        )}
      </Typography>
    </Box>
    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontFamily: 'monospace' }}>
        {celda.hora_inicio?.slice(0, 5)} – {celda.hora_fin?.slice(0, 5)}
      </Typography>
    </Box>
  </Box>
);

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function DocenteHomePage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const { texto: saludoTexto } = saludo();

  // Color de acento — ámbrar dorado, el tono del docente en todo el sistema
  const GOLD     = isDark ? '#facc15' : '#d97706';
  const GOLD_END = isDark ? '#f59e0b' : '#b45309';

  // ── Hooks ──
  const {
    asignaciones, isLoading: loadingAsig,
    refrescar: refrescarAsig,
  } = useMisAsignaciones();

  const { materias: materiasNotas, isLoading: loadingNotas } = useMisMateriasNotas();

  const { solicitudes: permisosPendientes, isLoading: loadingPermisos } =
    useSolicitudesPermiso({ estado: 'pendiente', limit: 50 });

  const { periodoActivo, loadingPeriodos } = useAcademicos({
    loadTurnos: false, loadNiveles: false, loadGrados: false,
    loadParalelos: false, loadMaterias: false, loadGradoMaterias: false,
  });

  const [periodoId, setPeriodoId] = useState<number | null>(null);
  useEffect(() => {
    if (periodoActivo && !periodoId) setPeriodoId(periodoActivo.id);
  }, [periodoActivo]);

  const docenteId: number | null = (user as any)?.docente_id ?? null;
  const { celdas, isLoading: loadingHorario } = useHorarioDocente(docenteId, periodoId);

  // ── Stats derivadas ──

  const totalEstudiantes = useMemo(() =>
    asignaciones.reduce((a, m) => a + Number(m.total_estudiantes), 0),
  [asignaciones]);

  const materiasCompletas = useMemo(() =>
    asignaciones.filter(a => a.asistencia_completa).length,
  [asignaciones]);

  const asistenciaHoy = asignaciones.length > 0
    ? Math.round((materiasCompletas / asignaciones.length) * 100)
    : 0;

  // Progreso global de notas (evaluaciones registradas / posibles)
  const progresoNotas = useMemo(() => {
    const grupos = new Map<number, typeof materiasNotas>();
    materiasNotas.forEach(m => {
      if (!grupos.has(m.asignacion_id)) grupos.set(m.asignacion_id, []);
      grupos.get(m.asignacion_id)!.push(m);
    });
    const total = materiasNotas.reduce((a, m) => a + m.total_estudiantes, 0);
    const reg   = materiasNotas.reduce((a, m) => a + m.calificaciones_registradas, 0);
    return total > 0 ? Math.round((reg / total) * 100) : 0;
  }, [materiasNotas]);

  // Clase en curso ahora
  const claseAhora = useMemo(() => {
    const hoy = new Date().getDay();
    if (hoy === 0) return null;
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    return celdas.find(c => {
      if (!c.materia_nombre || c.es_recreo) return false;
      const [hh, mm] = (c.hora_inicio ?? '0:0').split(':').map(Number);
      const [eh, em] = (c.hora_fin   ?? '0:0').split(':').map(Number);
      return c.dia_semana === hoy && (hh * 60 + mm) <= ahora && ahora < (eh * 60 + em);
    }) ?? null;
  }, [celdas]);

  // Alertas globales
  const alertas: { texto: string; urgent: boolean }[] = [];
  if (permisosPendientes.length > 0)
    alertas.push({
      texto: `${permisosPendientes.length} permiso${permisosPendientes.length > 1 ? 's' : ''} pendiente${permisosPendientes.length > 1 ? 's' : ''} de revisión`,
      urgent: true,
    });
  if (asignaciones.filter(a => !a.asistencia_completa).length > 0)
    alertas.push({
      texto: `${asignaciones.filter(a => !a.asistencia_completa).length} lista${asignaciones.filter(a => !a.asistencia_completa).length > 1 ? 's' : ''} sin registrar hoy`,
      urgent: false,
    });

  // Próxima clase
  const proxima = useMemo(() => {
    const hoy = new Date().getDay();
    if (hoy === 0) return null;
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    return celdas
      .filter(c => c.dia_semana === hoy && !c.es_recreo && c.materia_nombre)
      .find(c => {
        const [hh, mm] = (c.hora_inicio ?? '0:0').split(':').map(Number);
        return (hh * 60 + mm) > ahora;
      }) ?? null;
  }, [celdas]);

  return (
    <Box sx={{
      minHeight: '100vh',
      // Textura de cuadrícula sutil — estilo industrial
      backgroundImage: isDark
        ? `
          radial-gradient(ellipse at 0% 0%, ${alpha('#facc15', 0.06)} 0%, transparent 50%),
          linear-gradient(${alpha('#fff', 0.02)} 1px, transparent 1px),
          linear-gradient(90deg, ${alpha('#fff', 0.02)} 1px, transparent 1px)
        `
        : `
          radial-gradient(ellipse at 0% 0%, ${alpha('#d97706', 0.04)} 0%, transparent 50%),
          linear-gradient(${alpha('#000', 0.025)} 1px, transparent 1px),
          linear-gradient(90deg, ${alpha('#000', 0.025)} 1px, transparent 1px)
        `,
      backgroundSize: 'auto, 40px 40px, 40px 40px',
    }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══════════════════════════════════════════════
            HERO — layout asimétrico tipo sala de control
        ══════════════════════════════════════════════ */}
        <Box sx={{
          pt: 3, mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
          gap: 2,
          animation: `${slideDown} 0.45s ease-out both`,
        }}>
          {/* Izquierda: identidad */}
          <Box sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: '4px',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            borderTop: `3px solid ${GOLD}`,
            bgcolor: isDark ? alpha('#000', 0.5) : '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Scan decorativo */}
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              animation: `${scanH} 4s ease-in-out infinite`,
              pointerEvents: 'none', opacity: 0.6,
            }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{
                width: 56, height: 56, fontWeight: 900, fontSize: '1.3rem',
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_END})`,
                color: isDark ? '#000' : '#fff',
                borderRadius: '4px', // cuadrado — más industrial
                border: `2px solid ${alpha(GOLD, 0.4)}`,
              }}>
                {user?.username?.charAt(0)?.toUpperCase() ?? 'D'}
              </Avatar>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography sx={{
                    fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: GOLD,
                  }}>
                    ▸ {saludoTexto}
                  </Typography>
                </Box>
                <Typography sx={{
                  fontSize: { xs: '1.5rem', sm: '1.9rem' },
                  fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
                }}>
                  {user?.username ?? 'Docente'}
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'text.disabled', fontSize: '0.68rem', fontWeight: 600,
                }}>
                  {periodoActivo?.nombre ?? '—'} · {fechaActual()}
                </Typography>
              </Box>

              <Box sx={{ ml: 'auto' }}>
                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={refrescarAsig}
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      border: `1px solid ${alpha(GOLD, 0.3)}`,
                      bgcolor: alpha(GOLD, 0.06),
                      color: GOLD,
                      transition: 'all 0.3s ease',
                      '&:hover': { bgcolor: alpha(GOLD, 0.15), transform: 'rotate(180deg)' },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Tags de materias */}
            {asignaciones.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {asignaciones.slice(0, 4).map((a, i) => (
                  <Chip
                    key={a.asignacion_id}
                    size="small"
                    label={`${a.materia_nombre} · ${a.grado_nombre} "${a.paralelo_nombre}"`}
                    sx={{
                      height: 22, fontSize: '0.62rem', fontWeight: 700,
                      borderRadius: '3px',
                      bgcolor: alpha(GOLD, isDark ? 0.12 : 0.08),
                      color: GOLD,
                      border: `1px solid ${alpha(GOLD, 0.2)}`,
                    }}
                  />
                ))}
                {asignaciones.length > 4 && (
                  <Chip
                    size="small"
                    label={`+${asignaciones.length - 4} más`}
                    sx={{
                      height: 22, fontSize: '0.62rem', fontWeight: 700,
                      borderRadius: '3px',
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      color: 'text.secondary',
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Derecha: reloj + clase ahora */}
          <Box sx={{
            display: 'flex', flexDirection: 'column', gap: 1.5,
            minWidth: { md: 260 },
          }}>
            {/* Reloj */}
            <Box sx={{
              p: 2.5,
              borderRadius: '4px',
              border: `1px solid ${alpha(GOLD, 0.25)}`,
              borderTop: `3px solid ${GOLD}`,
              bgcolor: isDark ? alpha('#000', 0.5) : '#fff',
              textAlign: 'center',
            }}>
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: GOLD, mb: 0.5, display: 'block',
              }}>
                ▸ Hora local
              </Typography>
              <RelojVivo accent={GOLD} />
            </Box>

            {/* Clase en curso o próxima */}
            {!loadingHorario && (claseAhora || proxima) && (
              <Box sx={{
                p: 2,
                borderRadius: '4px',
                border: `1px solid ${claseAhora ? alpha('#10b981', 0.35) : alpha(GOLD, 0.2)}`,
                borderLeft: `3px solid ${claseAhora ? '#10b981' : GOLD}`,
                bgcolor: isDark ? alpha('#000', 0.4) : '#fff',
              }}>
                <Typography sx={{
                  fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: claseAhora ? '#10b981' : GOLD,
                  display: 'block', mb: 0.5,
                }}>
                  {claseAhora ? '▸ En clase ahora' : '▸ Próxima clase'}
                  {claseAhora && (
                    <Box component="span" sx={{
                      display: 'inline-block', width: 6, height: 6,
                      borderRadius: '50%', bgcolor: '#10b981',
                      ml: 1, animation: `${blink} 1.2s infinite`,
                      verticalAlign: 'middle',
                    }} />
                  )}
                </Typography>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {(claseAhora ?? proxima)?.materia_nombre}
                </Typography>
                <Typography variant="caption" sx={{
                  fontSize: '0.65rem', color: 'text.disabled', fontFamily: 'monospace',
                }}>
                  {(claseAhora ?? proxima)?.hora_inicio?.slice(0,5)} – {(claseAhora ?? proxima)?.hora_fin?.slice(0,5)}
                  {(claseAhora ?? proxima)?.aula ? ` · Aula ${(claseAhora ?? proxima)?.aula}` : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════
            ALERTAS — línea horizontal de chips urgentes
        ══════════════════════════════════════════════ */}
        {alertas.length > 0 && (
          <Box sx={{
            mb: 2.5, p: 1.5,
            borderRadius: '4px',
            border: `1px solid ${alpha('#ef4444', 0.25)}`,
            borderLeft: '3px solid #ef4444',
            bgcolor: isDark ? alpha('#ef4444', 0.06) : alpha('#ef4444', 0.03),
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            animation: `${slideDown} 0.35s ease-out 100ms both`,
          }}>
            <Typography sx={{
              fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#ef4444', flexShrink: 0,
            }}>
              ▸ Alertas
            </Typography>
            {alertas.map((a, i) => (
              <Chip
                key={i}
                size="small"
                label={a.texto}
                icon={a.urgent
                  ? <ErrorOutlineIcon sx={{ fontSize: '12px !important' }} />
                  : <WarningAmberIcon sx={{ fontSize: '12px !important' }} />
                }
                sx={{
                  height: 22, fontSize: '0.65rem', fontWeight: 700,
                  borderRadius: '3px',
                  bgcolor: a.urgent
                    ? isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.08)
                    : isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.08),
                  color: a.urgent ? '#ef4444' : '#f59e0b',
                  border: `1px solid ${a.urgent ? alpha('#ef4444', 0.3) : alpha('#f59e0b', 0.3)}`,
                  '& .MuiChip-icon': { color: a.urgent ? '#ef4444' : '#f59e0b' },
                }}
              />
            ))}
          </Box>
        )}

        {/* ══════════════════════════════════════════════
            PANEL DE STATS — cuadrícula tipo dashboard
        ══════════════════════════════════════════════ */}
        <Box sx={{
          mb: 3, p: { xs: 2, sm: 2.5 },
          borderRadius: '4px',
          border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.8),
          animation: `${fadeIn} 0.5s ease-out 80ms both`,
        }}>
          {/* Label de sección — estilo terminal */}
          <Typography sx={{
            fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: GOLD, mb: 2, display: 'block',
          }}>
            ▸ Dashboard · {periodoActivo?.nombre ?? 'Período activo'}
          </Typography>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatPanel
                label="Mis materias"
                value={asignaciones.length}
                sub="asignadas"
                accent={GOLD}
                delay={0}
                loading={loadingAsig}
                countUp
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatPanel
                label="Estudiantes"
                value={totalEstudiantes}
                sub="en total"
                accent={GOLD}
                delay={60}
                loading={loadingAsig}
                countUp
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatPanel
                label="Permisos"
                value={loadingPermisos ? '…' : permisosPendientes.length}
                sub="pendientes"
                accent={GOLD}
                delay={120}
                warn={permisosPendientes.length > 0}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatPanel
                label="Listas hoy"
                value={`${materiasCompletas}/${asignaciones.length}`}
                sub="completadas"
                accent={GOLD}
                delay={180}
                loading={loadingAsig}
                warn={materiasCompletas < asignaciones.length && asignaciones.length > 0}
              />
            </Grid>
          </Grid>

          {/* Barra de progreso de asistencia del día */}
          {asignaciones.length > 0 && !loadingAsig && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{
                  fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'text.disabled',
                }}>
                  Pases de lista completados hoy
                </Typography>
                <Typography sx={{
                  fontSize: '0.72rem', fontWeight: 900, color: GOLD,
                  fontFamily: 'monospace',
                }}>
                  {asistenciaHoy}%
                </Typography>
              </Box>
              <Box sx={{
                height: 4,
                bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07),
                borderRadius: 0, overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%', width: `${asistenciaHoy}%`,
                  background: asistenciaHoy === 100
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : `linear-gradient(90deg, ${GOLD}, ${GOLD_END})`,
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* ══════════════════════════════════════════════
            MÓDULOS DE NAVEGACIÓN — dos columnas
        ══════════════════════════════════════════════ */}
        <Typography sx={{
          fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: GOLD,
          mb: 1.5, display: 'block',
          animation: `${fadeIn} 0.4s ease-out 200ms both`,
        }}>
          ▸ Módulos del sistema
        </Typography>

        <Grid container spacing={1.5} sx={{ pb: 6 }}>

          {/* Columna A */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {/* ASISTENCIA */}
              <NavModule
                title="Control de Asistencia"
                desc="Pase de lista · historial · permisos"
                icon={EventAvailableIcon}
                accent="#3b82f6"
                href="/dashboard/docente/asistencia"
                delay={0}
                badge={
                  permisosPendientes.length > 0
                    ? { text: `${permisosPendientes.length} permiso${permisosPendientes.length > 1 ? 's' : ''}`, urgent: true }
                    : materiasCompletas === asignaciones.length && asignaciones.length > 0
                      ? { text: 'Todo al día', urgent: false }
                      : undefined
                }
                stats={[
                  { label: 'Materias',    value: asignaciones.length,   color: '#3b82f6' },
                  { label: 'Completadas', value: materiasCompletas,     color: '#10b981' },
                  { label: 'Estudiantes', value: totalEstudiantes,      color: '#3b82f6' },
                ]}
                bar={{ value: asistenciaHoy, label: 'Progreso del día' }}
                loading={loadingAsig}
              />

              {/* NOTAS */}
              <NavModule
                title="Gestión de Notas"
                desc="Evaluaciones · calificaciones · dimensiones"
                icon={GradeRoundedIcon}
                accent={GOLD}
                href="/dashboard/docente/notas"
                delay={80}
                badge={
                  progresoNotas < 50 && materiasNotas.length > 0
                    ? { text: 'Incompleto', urgent: false }
                    : progresoNotas === 100
                      ? { text: 'Completo', urgent: false }
                      : undefined
                }
                stats={[
                  { label: 'Materias', value: new Set(materiasNotas.map(m => m.asignacion_id)).size, color: GOLD },
                  { label: 'Eval. reg.', value: materiasNotas.reduce((a, m) => a + m.calificaciones_registradas, 0), color: GOLD },
                  { label: 'Pendientes', value: materiasNotas.reduce((a, m) => a + (m.total_estudiantes - m.calificaciones_registradas), 0), color: progresoNotas < 100 ? '#f59e0b' : '#10b981' },
                ]}
                bar={{ value: progresoNotas, label: 'Notas registradas' }}
                loading={loadingNotas}
              />

              {/* SEGUIMIENTO */}
              <NavModule
                title="Seguimiento Pedagógico"
                desc="Observaciones · comportamiento · reportes"
                icon={PsychologyIcon}
                accent="#8b5cf6"
                href="/dashboard/docente/seguimiento"
                delay={160}
                stats={[
                  { label: 'Materias', value: asignaciones.length, color: '#8b5cf6' },
                  { label: 'Alumnos', value: totalEstudiantes,    color: '#8b5cf6' },
                ]}
                loading={loadingAsig}
              />

            </Box>
          </Grid>

          {/* Columna B */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {/* HORARIO */}
              <NavModule
                title="Mi Horario"
                desc="Clases semanales · bloques · aulas"
                icon={CalendarMonthIcon}
                accent="#06b6d4"
                href="/dashboard/docente/horario"
                delay={0}
                badge={
                  claseAhora
                    ? { text: 'En clase', urgent: false }
                    : proxima
                      ? { text: 'Próxima', urgent: false }
                      : undefined
                }
                stats={
                  !loadingHorario && celdas.length > 0
                    ? [
                        { label: 'Clases/sem', value: celdas.filter(c => !c.es_recreo).length, color: '#06b6d4' },
                        { label: 'Días', value: new Set(celdas.map(c => c.dia_semana)).size, color: '#06b6d4' },
                        ...(claseAhora ? [{ label: 'Ahora', value: claseAhora.materia_nombre?.split(' ')[0] ?? '—', color: '#10b981' }] : []),
                      ]
                    : []
                }
                loading={loadingHorario}
              />

              {/* MATERIALES */}
              <NavModule
                title="Materiales Académicos"
                desc="Temario · recursos · publicaciones"
                icon={MenuBookIcon}
                accent="#10b981"
                href="/dashboard/docente/materiales"
                delay={80}
                stats={[
                  { label: 'Materias', value: asignaciones.length, color: '#10b981' },
                ]}
                loading={loadingAsig}
              />

              {/* REPORTES */}
              <NavModule
                title="Reportes de Asistencia"
                desc="PDF · Excel · por período o estudiante"
                icon={AssessmentIcon}
                accent="#f59e0b"
                href="/dashboard/docente/reportes"
                delay={160}
                badge={{ text: '6 tipos', urgent: false }}
                stats={[
                  { label: 'Formatos', value: 2,                  color: '#f59e0b' },
                  { label: 'Tipos',    value: 6,                  color: '#f59e0b' },
                  { label: 'Materias', value: asignaciones.length, color: '#f59e0b' },
                ]}
                loading={loadingAsig}
              />

            </Box>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════
            FOOTER DE ESTADO — línea de sistema
        ══════════════════════════════════════════════ */}
        <Box sx={{
          mb: 3, px: 1.5, py: 1,
          borderRadius: '4px',
          border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
          bgcolor: isDark ? alpha('#000', 0.3) : alpha('#000', 0.02),
          display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
          animation: `${fadeIn} 0.5s ease-out 400ms both`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981',
              animation: `${blink} 2s ease-in-out infinite`,
            }} />
            <Typography sx={{
              fontSize: '0.6rem', fontWeight: 700, color: '#10b981',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Sistema en línea
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 12, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) }} />
          <Typography sx={{
            fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled',
            letterSpacing: '0.06em', fontFamily: 'monospace',
          }}>
            {periodoActivo?.nombre ?? '—'}
          </Typography>
          <Box sx={{ width: 1, height: 12, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) }} />
          <Typography sx={{
            fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled',
            letterSpacing: '0.06em',
          }}>
            {asignaciones.length} asignacion{asignaciones.length !== 1 ? 'es' : ''} · {totalEstudiantes} estudiantes
          </Typography>
          {claseAhora && (
            <>
              <Box sx={{ width: 1, height: 12, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) }} />
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 700, color: '#10b981',
                letterSpacing: '0.06em', fontFamily: 'monospace',
              }}>
                ● {claseAhora.materia_nombre?.toUpperCase()} · ACTIVO
              </Typography>
            </>
          )}
        </Box>

      </Container>
    </Box>
  );
}