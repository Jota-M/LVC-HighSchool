'use client';
// app/dashboard/estudiante/home/page.tsx

import React, { useMemo } from 'react';
import {
  Box, Container, Typography, Fade, Chip, Avatar,
  useTheme, alpha, IconButton, Tooltip, Skeleton,
  Paper, LinearProgress, Grid, Divider,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useRouter } from 'next/navigation';

// Icons
import MenuBookIcon        from '@mui/icons-material/MenuBook';
import SchoolIcon          from '@mui/icons-material/School';
import AssignmentIcon      from '@mui/icons-material/Assignment';
import CalendarMonthIcon   from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon  from '@mui/icons-material/EventAvailable';
import RefreshIcon         from '@mui/icons-material/Refresh';
import ArrowForwardIcon    from '@mui/icons-material/ArrowForward';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import WarningRoundedIcon  from '@mui/icons-material/WarningRounded';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import TrendingDownIcon    from '@mui/icons-material/TrendingDown';
import AccessTimeIcon      from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline';
import AutoStoriesIcon     from '@mui/icons-material/AutoStories';
import WbSunnyIcon         from '@mui/icons-material/WbSunny';
import NightsStayIcon      from '@mui/icons-material/NightsStay';
import BoltIcon            from '@mui/icons-material/Bolt';

// Hooks
import { useAuth }                               from '@/context/AuthContext';
import { usePerfilEstudiante, usePeriodosEstudiante, useMisMaterias, useBoletinEstudiante, useTareasEstudiante, useAsistenciaEstudiante, useHorarioEstudiante } from '@/hooks/useEstudiante';

// ─────────────────────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const scanline = keyframes`
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(400%); }
`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
`;
const ticker = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const saludoData = (): { texto: string; emoji: string; Icon: React.ElementType } => {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Buenos días', emoji: '☀️', Icon: WbSunnyIcon };
  if (h < 19) return { texto: 'Buenas tardes', emoji: '🌤️', Icon: WbSunnyIcon };
  return { texto: 'Buenas noches', emoji: '🌙', Icon: NightsStayIcon };
};

const round1 = (n?: number | null) =>
  n != null ? Math.round(n * 10) / 10 : null;

// ─────────────────────────────────────────────────────────────
// STAT GRANDE — número editorial
// ─────────────────────────────────────────────────────────────

interface BigStatProps {
  value:    string | number;
  label:    string;
  sub?:     string;
  color:    string;
  delay?:   number;
  trend?:   'up' | 'down' | 'neutral';
  loading?: boolean;
}

const BigStat: React.FC<BigStatProps> = ({ value, label, sub, color, delay = 0, trend, loading }) => (
  <Box sx={{ animation: `${fadeUp} 0.5s ease-out ${delay}ms both` }}>
    {loading ? (
      <>
        <Skeleton variant="text" width={80} height={64} />
        <Skeleton variant="text" width={100} height={18} />
      </>
    ) : (
      <>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, lineHeight: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: '2.4rem', sm: '3rem' },
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color,
            }}
          >
            {value}
          </Typography>
          {trend === 'up'   && <TrendingUpIcon   sx={{ fontSize: 22, color: '#10b981', mb: 0.5 }} />}
          {trend === 'down' && <TrendingDownIcon  sx={{ fontSize: 22, color: '#ef4444', mb: 0.5 }} />}
        </Box>
        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
          {label}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
            {sub}
          </Typography>
        )}
      </>
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────
// MÓDULO NAVEGABLE — estilo editorial, sin cards genéricas
// ─────────────────────────────────────────────────────────────

interface ModuleRowProps {
  title:      string;
  desc:       string;
  icon:       React.ElementType;
  accentColor:string;
  href:       string;
  delay?:     number;
  tag?:       string;
  tagColor?:  'warn' | 'err' | 'ok' | 'info';
  barValue?:  number; // 0-100 para barra de progreso
  barLabel?:  string;
  items?:     { label: string; value: string | number; color?: string }[];
  loading?:   boolean;
}

const tagStyles = (t: 'warn' | 'err' | 'ok' | 'info', isDark: boolean) => ({
  warn: { bg: isDark ? alpha('#f59e0b', 0.18) : alpha('#f59e0b', 0.1),  fg: isDark ? '#fbbf24' : '#d97706', border: alpha('#f59e0b', 0.3) },
  err:  { bg: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),  fg: isDark ? '#f87171' : '#dc2626', border: alpha('#ef4444', 0.3) },
  ok:   { bg: isDark ? alpha('#10b981', 0.18) : alpha('#10b981', 0.1),  fg: isDark ? '#34d399' : '#059669', border: alpha('#10b981', 0.3) },
  info: { bg: isDark ? alpha('#6366f1', 0.18) : alpha('#6366f1', 0.08), fg: isDark ? '#818cf8' : '#4f46e5', border: alpha('#6366f1', 0.25) },
}[t]);

const ModuleRow: React.FC<ModuleRowProps> = ({
  title, desc, icon: Icon, accentColor, href,
  delay = 0, tag, tagColor = 'info',
  barValue, barLabel, items = [], loading,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const ts     = tagColor ? tagStyles(tagColor, isDark) : null;

  return (
    <Box
      onClick={() => router.push(href)}
      sx={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        borderRadius: '16px', overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
          : '#fff',
        animation: `${fadeUp} 0.45s ease-out ${delay}ms both`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha(accentColor, 0.4),
          boxShadow: `0 8px 32px ${alpha(accentColor, isDark ? 0.2 : 0.12)}`,
          '& .mod-arrow': { opacity: 1, transform: 'translateX(4px)' },
          '& .mod-accent-bar': { opacity: 1 },
        },
      }}
    >
      {/* Barra lateral de acento */}
      <Box
        className="mod-accent-bar"
        sx={{
          width: 4, flexShrink: 0,
          background: `linear-gradient(180deg, ${accentColor}, ${alpha(accentColor, 0.3)})`,
          opacity: 0.5,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Cuerpo */}
      <Box sx={{ flex: 1, p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          {/* Ícono + título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.6)})`,
              boxShadow: `0 4px 12px ${alpha(accentColor, 0.35)}`,
            }}>
              <Icon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                {desc}
              </Typography>
            </Box>
          </Box>

          {/* Tag + flecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            {tag && ts && (
              <Chip
                size="small"
                label={tag}
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 800,
                  bgcolor: ts.bg, color: ts.fg,
                  border: `1px solid ${ts.border}`,
                  borderRadius: '6px',
                }}
              />
            )}
            <ArrowForwardIcon
              className="mod-arrow"
              sx={{
                fontSize: 15, color: accentColor, opacity: 0,
                transition: 'all 0.2s ease',
              }}
            />
          </Box>
        </Box>

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="text" width={60} height={32} />)}
          </Box>
        ) : (
          <>
            {/* Items numéricos inline */}
            {items.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2.5, mb: barValue != null ? 1.25 : 0, flexWrap: 'wrap' }}>
                {items.map((it, i) => (
                  <Box key={i}>
                    <Typography
                      sx={{
                        fontSize: '1.35rem', fontWeight: 900, lineHeight: 1,
                        letterSpacing: '-0.03em',
                        color: it.color ?? accentColor,
                      }}
                    >
                      {it.value}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                      {it.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Barra de progreso */}
            {barValue != null && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.62rem' }}>
                    {barLabel ?? 'Progreso'}
                  </Typography>
                  <Typography variant="caption" fontWeight={900} sx={{ color: accentColor, fontSize: '0.68rem' }}>
                    {barValue}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(barValue, 100)}
                  sx={{
                    height: 5, borderRadius: 3,
                    bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.6)})`,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// TICKER DE TAREAS PRÓXIMAS
// ─────────────────────────────────────────────────────────────

const TareasTicker: React.FC<{
  tareas: { evaluacion_nombre: string; materia_nombre: string; dias_restantes: number | null | undefined }[];
  isDark: boolean;
}> = ({ tareas, isDark }) => {
  if (tareas.length === 0) return null;
  const items = [...tareas, ...tareas]; // duplicar para loop continuo

  return (
    <Box sx={{
      overflow: 'hidden', borderRadius: '10px',
      bgcolor: isDark ? alpha('#f59e0b', 0.08) : alpha('#f59e0b', 0.06),
      border: `1px solid ${alpha('#f59e0b', 0.2)}`,
      display: 'flex', alignItems: 'center', gap: 0,
      height: 36,
    }}>
      {/* Label fijo */}
      <Box sx={{
        px: 1.5, py: 0, height: '100%',
        display: 'flex', alignItems: 'center', gap: 0.75,
        bgcolor: isDark ? alpha('#f59e0b', 0.2) : alpha('#f59e0b', 0.15),
        borderRight: `1px solid ${alpha('#f59e0b', 0.25)}`,
        flexShrink: 0,
      }}>
        <BoltIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
        <Typography variant="caption" fontWeight={800} sx={{ color: '#f59e0b', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
          Próximas
        </Typography>
      </Box>

      {/* Ticker */}
      <Box sx={{ overflow: 'hidden', flex: 1 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 3,
          animation: `${ticker} ${tareas.length * 5}s linear infinite`,
          width: 'max-content', px: 2,
        }}>
          {items.map((t, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', color: 'text.primary' }}>
                {t.evaluacion_nombre}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                · {t.materia_nombre}
              </Typography>
              {t.dias_restantes != null && (
                <Chip
                  size="small"
                  label={t.dias_restantes === 0 ? 'hoy' : `${t.dias_restantes}d`}
                  sx={{
                    height: 16, fontSize: '0.6rem', fontWeight: 800,
                    bgcolor: t.dias_restantes <= 1 ? alpha('#ef4444', 0.15) : alpha('#f59e0b', 0.15),
                    color: t.dias_restantes <= 1 ? '#ef4444' : '#f59e0b',
                    borderRadius: '5px',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// HERO DEL ESTUDIANTE — asimétrico, editorial
// ─────────────────────────────────────────────────────────────

const HeroEstudiante: React.FC<{
  perfil:    any;
  isDark:    boolean;
  onRefresh: () => void;
  loading:   boolean;
}> = ({ perfil, isDark, onRefresh, loading }) => {
  const { texto, emoji } = saludoData();

  const nivelColor = perfil?.porcentaje_beca > 0 ? '#8b5cf6' : '#6366f1';

  return (
    <Box sx={{
      position: 'relative', overflow: 'hidden',
      borderRadius: '24px',
      background: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      p: { xs: 2.5, sm: 3.5 },
      mb: 3,
      animation: `${fadeUp} 0.5s ease-out both`,
    }}>
      {/* Decoración geométrica de fondo */}
      <Box sx={{
        position: 'absolute', top: -60, right: -60,
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -40, left: '30%',
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Líneas de cuadrícula sutiles */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Línea de scan animada */}
      <Box sx={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
        animation: `${scanline} 4s ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      <Box sx={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        {/* Lado izquierdo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          {/* Avatar con glow */}
          <Box sx={{
            position: 'relative', flexShrink: 0,
            animation: `${pulseGlow} 3s ease-in-out infinite`,
          }}>
            {loading ? (
              <Skeleton variant="circular" width={72} height={72} sx={{ bgcolor: alpha('#fff', 0.1) }} />
            ) : (
              <Avatar
                src={perfil?.foto_url ?? undefined}
                sx={{
                  width: 72, height: 72,
                  fontWeight: 900, fontSize: '1.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #10b981)',
                  border: '3px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 0 0 4px rgba(99,102,241,0.3)',
                }}
              >
                {perfil?.nombres?.charAt(0) ?? '?'}
              </Avatar>
            )}
            {/* Punto verde "online" */}
            <Box sx={{
              position: 'absolute', bottom: 4, right: 4,
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: '#10b981', border: '2px solid #1e1b4b',
            }} />
          </Box>

          {/* Nombre y datos */}
          <Box>
            <Typography variant="caption" sx={{
              color: alpha('#fff', 0.5), fontWeight: 700,
              fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              display: 'block', mb: 0.25,
            }}>
              {emoji} {texto}
            </Typography>
            {loading ? (
              <>
                <Skeleton variant="text" width={200} height={38} sx={{ bgcolor: alpha('#fff', 0.1) }} />
                <Skeleton variant="text" width={150} height={20} sx={{ bgcolor: alpha('#fff', 0.08), mt: 0.5 }} />
              </>
            ) : (
              <>
                <Typography sx={{
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1,
                  color: '#fff',
                }}>
                  {perfil?.nombres?.split(' ')[0] ?? 'Estudiante'}
                  {' '}
                  <Box component="span" sx={{ color: '#818cf8' }}>
                    {perfil?.apellidos?.split(' ')[0] ?? ''}
                  </Box>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                  {[
                    perfil?.grado_nombre && `${perfil.grado_nombre} "${perfil.paralelo_nombre}"`,
                    perfil?.nivel_academico,
                    perfil?.turno,
                  ].filter(Boolean).map((label, i) => (
                    <Chip key={i} label={label} size="small" sx={{
                      height: 22, fontSize: '0.65rem', fontWeight: 700,
                      bgcolor: alpha('#fff', 0.1), color: alpha('#fff', 0.85),
                      border: `1px solid ${alpha('#fff', 0.15)}`,
                      borderRadius: '6px',
                    }} />
                  ))}
                  {perfil?.es_becado && (
                    <Chip label="Becado" size="small" sx={{
                      height: 22, fontSize: '0.65rem', fontWeight: 800,
                      bgcolor: alpha('#8b5cf6', 0.3), color: '#c4b5fd',
                      border: `1px solid ${alpha('#8b5cf6', 0.4)}`, borderRadius: '6px',
                    }} />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Lado derecho: período + refresh */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={onRefresh}
              size="small"
              sx={{
                bgcolor: alpha('#fff', 0.08),
                border: `1px solid ${alpha('#fff', 0.12)}`,
                borderRadius: '10px',
                color: alpha('#fff', 0.7),
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: alpha('#6366f1', 0.3), transform: 'rotate(180deg)', color: '#fff' },
              }}
            >
              <RefreshIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          {!loading && perfil?.periodo_academico && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Período activo
              </Typography>
              <Typography variant="body2" fontWeight={800} sx={{ color: '#a5b4fc', fontSize: '0.78rem' }}>
                {perfil.periodo_academico}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Código de estudiante al pie */}
      {!loading && perfil?.codigo_estudiante && (
        <Box sx={{
          position: 'relative', zIndex: 1,
          mt: 2.5, pt: 2,
          borderTop: `1px solid ${alpha('#fff', 0.08)}`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Typography sx={{
            fontFamily: 'monospace', fontSize: '0.7rem',
            color: alpha('#fff', 0.35), letterSpacing: '0.12em',
          }}>
            ID #{perfil.codigo_estudiante}
          </Typography>
          <Box sx={{ flex: 1, height: 1, bgcolor: alpha('#fff', 0.06) }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{
                width: 6, height: 6, borderRadius: '50%',
                bgcolor: i === 0 ? '#10b981' : alpha('#fff', 0.2),
              }} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function EstudianteHomePage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Datos ──
  const { perfil, isLoading: loadingPerfil } = usePerfilEstudiante();
  const { periodoActivo, isLoading: loadingPeriodos } = usePeriodosEstudiante();
  const { materias, isLoading: loadingMaterias, refrescar: refrescarMaterias } = useMisMaterias(periodoActivo ?? undefined);
  const { boletin, aprobadas, reprobadas, promedio, isLoading: loadingBoletin } = useBoletinEstudiante(periodoActivo);
  const { resumen: resumenTareas, proximasAvencer, isLoading: loadingTareas } = useTareasEstudiante({ periodo_evaluacion_id: periodoActivo ?? undefined });
  const { reporte: reporteAsistencia, isLoading: loadingAsistencia } = useAsistenciaEstudiante();
  const { horario, isLoading: loadingHorario } = useHorarioEstudiante();

  const handleRefresh = () => { refrescarMaterias(); };

  // ── Estadísticas derivadas ──

  // Asistencia global (promedio de materias)
  const asistenciaGlobal = useMemo(() => {
    if (!reporteAsistencia.length) return null;
    const sum = reporteAsistencia.reduce((a, r) => a + (r.porcentaje_asistencia ?? 0), 0);
    return Math.round(sum / reporteAsistencia.length);
  }, [reporteAsistencia]);

  // Materias en riesgo de asistencia
  const materiasRiesgo = useMemo(
    () => reporteAsistencia.filter(r => r.porcentaje_asistencia < 75).length,
    [reporteAsistencia]
  );

  // Progreso promedio del temario
  const progresoTemario = useMemo(() => {
    if (!materias.length) return 0;
    const sum = materias.reduce((a, m) => a + (m.progreso_promedio ?? 0), 0);
    return Math.round(sum / materias.length);
  }, [materias]);

  // Clase en curso ahora
  const claseAhora = useMemo(() => {
    if (!horario) return null;
    const hoy = new Date().getDay(); // 0=Dom
    if (hoy === 0) return null;
    const diaData = horario.grilla.find(d => d.dia_numero === hoy);
    if (!diaData) return null;
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    return diaData.bloques.find(b => {
      if (b.es_recreo || !b.materia_nombre) return false;
      const [hh, mm] = (b.hora_inicio ?? '0:0').split(':').map(Number);
      const [eh, em] = (b.hora_fin   ?? '0:0').split(':').map(Number);
      return (hh * 60 + mm) <= ahora && ahora < (eh * 60 + em);
    }) ?? null;
  }, [horario]);

  // Alertas
  const alertas: string[] = [];
  if ((resumenTareas?.atrasados ?? 0) > 0) alertas.push(`${resumenTareas!.atrasados} tarea${resumenTareas!.atrasados > 1 ? 's' : ''} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`);
  if (materiasRiesgo > 0) alertas.push(`${materiasRiesgo} materia${materiasRiesgo > 1 ? 's' : ''} con asistencia baja`);
  if (reprobadas > 0) alertas.push(`${reprobadas} materia${reprobadas > 1 ? 's' : ''} reprobada${reprobadas > 1 ? 's' : ''}`);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at 10% 0%, rgba(99,102,241,0.08) 0%, transparent 50%)'
        : 'radial-gradient(ellipse at 10% 0%, rgba(99,102,241,0.04) 0%, transparent 50%)',
    }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══ HERO ══ */}
        <Box sx={{ pt: 3 }}>
          <HeroEstudiante
            perfil={perfil}
            isDark={isDark}
            onRefresh={handleRefresh}
            loading={loadingPerfil}
          />
        </Box>

        {/* ══ CLASE EN CURSO ══ */}
        {claseAhora && (
          <Fade in timeout={400}>
            <Box sx={{
              mb: 3, p: 2, borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: 2,
              background: isDark
                ? `linear-gradient(135deg, ${alpha('#10b981', 0.18)}, ${alpha('#10b981', 0.06)})`
                : `linear-gradient(135deg, ${alpha('#10b981', 0.1)}, ${alpha('#10b981', 0.03)})`,
              border: `1px solid ${alpha('#10b981', 0.3)}`,
              animation: `${fadeLeft} 0.4s ease-out 200ms both`,
            }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0,
                boxShadow: `0 0 0 4px ${alpha('#10b981', 0.25)}`,
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: '#10b981', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Ahora en clase
                </Typography>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {claseAhora.materia_nombre}
                  {claseAhora.aula && (
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, ml: 1, fontSize: '0.8rem' }}>
                      · Aula {claseAhora.aula}
                    </Box>
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                  {claseAhora.hora_inicio?.slice(0, 5)} – {claseAhora.hora_fin?.slice(0, 5)}
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}

        {/* ══ TICKER DE PRÓXIMAS TAREAS ══ */}
        {proximasAvencer.length > 0 && !loadingTareas && (
          <Box sx={{ mb: 3, animation: `${fadeUp} 0.4s ease-out 150ms both` }}>
            <TareasTicker
              tareas={proximasAvencer.map(t => ({
                evaluacion_nombre: t.evaluacion_nombre,
                materia_nombre:    t.materia_nombre,
                dias_restantes:    t.dias_restantes,
              }))}
              isDark={isDark}
            />
          </Box>
        )}

        {/* ══ ALERTAS ══ */}
        {alertas.length > 0 && (
          <Fade in timeout={400}>
            <Box sx={{
              mb: 3, p: 1.75, borderRadius: '12px',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25,
              bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.05),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
              animation: `${fadeUp} 0.4s ease-out 100ms both`,
            }}>
              <ErrorOutlineIcon sx={{ fontSize: 17, color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#f87171' : '#dc2626', fontSize: '0.72rem' }}>
                Requiere atención:
              </Typography>
              {alertas.map((a, i) => (
                <Chip key={i} size="small" label={a} sx={{
                  height: 22, fontWeight: 700, fontSize: '0.65rem', borderRadius: '7px',
                  bgcolor: isDark ? alpha('#ef4444', 0.18) : alpha('#ef4444', 0.1),
                  color: isDark ? '#f87171' : '#dc2626',
                  border: `1px solid ${alpha('#ef4444', 0.25)}`,
                }} />
              ))}
            </Box>
          </Fade>
        )}

        {/* ══ STATS RÁPIDAS — fila editorial ══ */}
        <Box sx={{
          mb: 3, p: { xs: 2, sm: 2.5 }, borderRadius: '18px',
          border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
          background: isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
            : '#fff',
          animation: `${fadeUp} 0.45s ease-out 50ms both`,
        }}>
          <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{
            fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            display: 'block', mb: 2,
          }}>
            Resumen del período
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2.5, sm: 4 } }}>
            <BigStat
              value={promedio ?? '—'}
              label="Promedio general"
              sub="sobre 100 pts"
              color={
                promedio == null ? (isDark ? '#6b7280' : '#9ca3af')
                : promedio >= 70 ? '#10b981'
                : promedio >= 51 ? '#f59e0b'
                : '#ef4444'
              }
              trend={promedio != null ? (promedio >= 70 ? 'up' : 'down') : undefined}
              delay={0}
              loading={loadingBoletin}
            />
            <Box sx={{ width: 1, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07), display: { xs: 'none', sm: 'block' } }} />
            <BigStat
              value={aprobadas}
              label="Materias aprobadas"
              color="#10b981"
              trend={aprobadas > 0 ? 'up' : 'neutral'}
              delay={60}
              loading={loadingBoletin}
            />
            <BigStat
              value={asistenciaGlobal != null ? `${asistenciaGlobal}%` : '—'}
              label="Asistencia global"
              color={
                asistenciaGlobal == null ? (isDark ? '#6b7280' : '#9ca3af')
                : asistenciaGlobal >= 85 ? '#10b981'
                : asistenciaGlobal >= 70 ? '#f59e0b'
                : '#ef4444'
              }
              trend={asistenciaGlobal != null ? (asistenciaGlobal >= 80 ? 'up' : 'down') : undefined}
              delay={120}
              loading={loadingAsistencia}
            />
            <BigStat
              value={resumenTareas?.entregados ?? '—'}
              label="Tareas entregadas"
              sub={resumenTareas ? `de ${resumenTareas.total} totales` : undefined}
              color="#6366f1"
              delay={180}
              loading={loadingTareas}
            />
            <BigStat
              value={progresoTemario ? `${progresoTemario}%` : '—'}
              label="Progreso temario"
              color="#f59e0b"
              delay={240}
              loading={loadingMaterias}
            />
          </Box>
        </Box>

        {/* ══ GRID DE MÓDULOS ══ */}
        <Grid container spacing={2} sx={{ pb: 6 }}>

          {/* Columna izquierda — 2 módulos apilados */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* CALIFICACIONES */}
              <ModuleRow
                title="Calificaciones"
                desc="Boletín, notas y dimensiones"
                icon={SchoolIcon}
                accentColor="#10b981"
                href="/dashboard/estudiante/calificaciones"
                delay={0}
                tag={
                  reprobadas > 0
                    ? `${reprobadas} reprobada${reprobadas > 1 ? 's' : ''}`
                    : promedio != null
                      ? `Prom. ${promedio}`
                      : undefined
                }
                tagColor={reprobadas > 0 ? 'err' : 'ok'}
                items={[
                  { label: 'Promedio',   value: promedio ?? '—',    color: '#10b981' },
                  { label: 'Aprobadas',  value: aprobadas,           color: '#10b981' },
                  { label: 'Reprobadas', value: reprobadas,          color: reprobadas > 0 ? '#ef4444' : undefined },
                  { label: 'Sin nota',   value: boletin.filter(b => b.nota_final == null).length },
                ]}
                loading={loadingBoletin}
              />

              {/* ASISTENCIA */}
              <ModuleRow
                title="Asistencia"
                desc="Presencias, tardanzas y historial"
                icon={EventAvailableIcon}
                accentColor="#3b82f6"
                href="/dashboard/estudiante/asistencia"
                delay={80}
                tag={
                  materiasRiesgo > 0
                    ? `${materiasRiesgo} en riesgo`
                    : asistenciaGlobal != null && asistenciaGlobal >= 85
                      ? 'Excelente'
                      : undefined
                }
                tagColor={materiasRiesgo > 0 ? 'warn' : 'ok'}
                barValue={asistenciaGlobal ?? undefined}
                barLabel="Asistencia promedio"
                items={[
                  { label: 'Presente',    value: reporteAsistencia.reduce((a, r) => a + r.presentes, 0),  color: '#10b981' },
                  { label: 'Ausente',     value: reporteAsistencia.reduce((a, r) => a + r.ausentes, 0),   color: '#ef4444' },
                  { label: 'Tardanzas',   value: reporteAsistencia.reduce((a, r) => a + r.tardanzas, 0),  color: '#f59e0b' },
                ]}
                loading={loadingAsistencia}
              />

            </Box>
          </Grid>

          {/* Columna derecha — 3 módulos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* TAREAS */}
              <ModuleRow
                title="Tareas y Evaluaciones"
                desc="Entregas pendientes y resultados"
                icon={AssignmentIcon}
                accentColor="#f59e0b"
                href="/dashboard/estudiante/tareas"
                delay={160}
                tag={
                  (resumenTareas?.atrasados ?? 0) > 0
                    ? `${resumenTareas!.atrasados} atrasada${resumenTareas!.atrasados > 1 ? 's' : ''}`
                    : (resumenTareas?.pendientes ?? 0) > 0
                      ? `${resumenTareas!.pendientes} pendiente${resumenTareas!.pendientes > 1 ? 's' : ''}`
                      : undefined
                }
                tagColor={(resumenTareas?.atrasados ?? 0) > 0 ? 'err' : 'warn'}
                barValue={
                  resumenTareas?.total
                    ? Math.round((resumenTareas.entregados / resumenTareas.total) * 100)
                    : undefined
                }
                barLabel="Progreso de entregas"
                items={[
                  { label: 'Total',      value: resumenTareas?.total      ?? '—' },
                  { label: 'Entregadas', value: resumenTareas?.entregados ?? '—', color: '#10b981' },
                  { label: 'Pendientes', value: resumenTareas?.pendientes ?? '—', color: '#f59e0b' },
                  { label: 'Atrasadas',  value: resumenTareas?.atrasados  ?? '—', color: (resumenTareas?.atrasados ?? 0) > 0 ? '#ef4444' : undefined },
                ]}
                loading={loadingTareas}
              />

              {/* MATERIAS */}
              <ModuleRow
                title="Mis Materias"
                desc="Temario, materiales y docentes"
                icon={AutoStoriesIcon}
                accentColor="#8b5cf6"
                href="/dashboard/estudiante/materias"
                delay={240}
                tag={materias.length > 0 ? `${materias.length} materias` : undefined}
                tagColor="info"
                barValue={progresoTemario || undefined}
                barLabel="Progreso del temario"
                items={[
                  { label: 'Materias',     value: materias.length },
                  { label: 'Con nota',     value: materias.filter(m => m.nota_final != null).length, color: '#8b5cf6' },
                  { label: 'Materiales',   value: materias.reduce((a, m) => a + m.total_materiales, 0), color: '#6366f1' },
                ]}
                loading={loadingMaterias}
              />

              {/* HORARIO */}
              <ModuleRow
                title="Mi Horario"
                desc="Clases, bloques y docentes"
                icon={CalendarMonthIcon}
                accentColor="#06b6d4"
                href="/dashboard/estudiante/horario"
                delay={320}
                tag={
                  claseAhora
                    ? 'En clase ahora'
                    : horario
                      ? `${horario.total_celdas} clases/sem`
                      : undefined
                }
                tagColor={claseAhora ? 'ok' : 'info'}
                items={
                  horario
                    ? [
                        { label: 'Clases/sem',  value: horario.total_celdas },
                        { label: 'Días',        value: horario.grilla.length },
                        ...(claseAhora
                          ? [{ label: 'Ahora', value: claseAhora.materia_nombre?.split(' ')[0] ?? '—', color: '#10b981' }]
                          : []),
                      ]
                    : []
                }
                loading={loadingHorario}
              />

            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}