'use client';
// components/estudiante/horario/EstudianteHorario.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, alpha, useTheme, useMediaQuery, keyframes,
  Fade, Skeleton, Paper, Chip, Tooltip, IconButton,
  Grid, Divider, LinearProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  EventBusy as NoHorarioIcon,
  Circle as DotIcon,
  PlayArrow as NowIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useHorarioEstudiante } from '@/hooks/useEstudiante';
import type { BloqueHorario, DiaHorario, HorarioEstudiante } from '@/types/estudiante';

// ─────────────────────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────────────────────
const float = keyframes`
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-6px) rotate(3deg); }
`;
const slideUp = keyframes`
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
`;
const slideIn = keyframes`
  from { opacity:0; transform:translateX(-12px); }
  to   { opacity:1; transform:translateX(0); }
`;
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(99,102,241,.5); }
  70%  { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
  100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
`;
const blink = keyframes`
  0%,100% { opacity:1; }
  50%      { opacity:.3; }
`;
const growBar = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const DIAS_LABEL: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};
const DIAS_SHORT: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb',
};

const PALETTE = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#F97316', '#EC4899', '#3B82F6', '#14B8A6',
];
const getColor = (str: string, override?: string | null) => {
  if (override) return override;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const fmtHora = (h: string) => h?.slice(0, 5) ?? '';

const toMin = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

const ahoraMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

const diaActual = (): number | null => {
  const d = new Date().getDay();
  return d === 0 ? null : d;
};

/** Porcentaje de la semana laboral completada (lunes=0% → viernes 17:00=100%) */
const semanaProgreso = (): number => {
  const now = new Date();
  const dow = now.getDay(); // 0=Dom, 1=Lun … 5=Vie, 6=Sáb
  if (dow === 0) return 0;
  if (dow === 6) return 100;
  // minutos transcurridos desde el inicio del lunes 07:00
  const minPorDia = 24 * 60;
  const minDesdeInicio = (dow - 1) * minPorDia + now.getHours() * 60 + now.getMinutes();
  const totalSemana = 5 * minPorDia;
  return Math.min(100, Math.round((minDesdeInicio / totalSemana) * 100));
};

/** Geometría para el anillo de progreso SVG */
const ringGeom = (pct: number, radius = 18) => {
  const circ = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = circ * (1 - clamped / 100);
  return { circ, offset, radius };
};

type Vista = 'semana' | 'dia';
interface Props { user?: any }

// ═════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════
export const EstudianteHorario: React.FC<Props> = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const accent = isDark ? '#818CF8' : '#6366F1';
  const accentDeep = isDark ? '#6366F1' : '#4338CA';
  const accentSoft = alpha(accent, isDark ? 0.15 : 0.08);
  const gradient = `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`;

  const { horario, isLoading, refrescar } = useHorarioEstudiante();

  const [vista, setVista] = useState<Vista>('semana');
  const [diaVista, setDiaVista] = useState<number>(diaActual() ?? 1);
  const [ahora, setAhora] = useState(ahoraMin());

  useEffect(() => {
    const id = setInterval(() => setAhora(ahoraMin()), 60_000);
    return () => clearInterval(id);
  }, []);

  // En mobile arrancamos en vista "día" para evitar overflow horizontal
  useEffect(() => {
    if (isMobile) setVista('dia');
  }, [isMobile]);

  const claseEnCurso = useMemo<BloqueHorario | null>(() => {
    if (!horario || !diaActual()) return null;
    const hoy = horario.grilla.find(d => d.dia_numero === diaActual());
    return hoy?.bloques.find(b =>
      !b.es_recreo && toMin(b.hora_inicio) <= ahora && toMin(b.hora_fin) > ahora
    ) ?? null;
  }, [horario, ahora]);

  const proximaClase = useMemo<BloqueHorario | null>(() => {
    if (!horario || !diaActual() || claseEnCurso) return null;
    const hoy = horario.grilla.find(d => d.dia_numero === diaActual());
    return hoy?.bloques.find(b =>
      !b.es_recreo && toMin(b.hora_inicio) > ahora
    ) ?? null;
  }, [horario, ahora, claseEnCurso]);

  const diasRender: DiaHorario[] = useMemo(() => {
    if (!horario) return [];
    return vista === 'dia'
      ? horario.grilla.filter(d => d.dia_numero === diaVista)
      : horario.grilla;
  }, [horario, vista, diaVista]);

  const bloquesEje = useMemo(() => {
    if (!horario) return [];
    return horario.grilla
      .flatMap(d => d.bloques)
      .filter((b, i, arr) => arr.findIndex(x => x.bloque_numero === b.bloque_numero) === i)
      .sort((a, b) => a.bloque_numero - b.bloque_numero);
  }, [horario]);

  /** Clases por día para el mini chart */
  const clasesPorDia = useMemo(() => {
    if (!horario) return [];
    return horario.grilla.map(d => ({
      dia: d.dia_numero,
      count: d.bloques.filter(b => !b.es_recreo).length,
    }));
  }, [horario]);

  if (isLoading) return <HorarioSkeleton isDark={isDark} />;

  if (!horario) return (
    <Box sx={{ pb: 4 }}>
      <HorarioPageHeader
        accent={accent} gradient={gradient} isDark={isDark}
        onRefresh={refrescar} vista={vista} setVista={setVista}
        diaVista={diaVista} setDiaVista={setDiaVista}
        diasDisponibles={[]} showControls={false}
      />
      <Fade in>
        <Paper elevation={0} sx={{
          p: { xs: 6, md: 10 }, textAlign: 'center', borderRadius: 4,
          border: `2px dashed ${alpha(accent, 0.3)}`, bgcolor: accentSoft,
        }}>
          <NoHorarioIcon sx={{ fontSize: 72, color: alpha(accent, 0.35), mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>Horario aún no disponible</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
            El horario de tu curso todavía no fue publicado. Consultá con la dirección del colegio.
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <HorarioPageHeader
        accent={accent} gradient={gradient} isDark={isDark}
        onRefresh={refrescar} vista={vista} setVista={setVista}
        diaVista={diaVista} setDiaVista={setDiaVista}
        diasDisponibles={horario.grilla.map(d => d.dia_numero)}
        showControls
      />

      {/* ── Stat chips ──────────────────────────────────────── */}
      <Fade in timeout={350}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: 'materias', value: new Set(horario.grilla.flatMap(d => d.bloques.filter(b => !b.es_recreo).map(b => b.materia_nombre))).size },
            { label: 'horas / semana', value: `${horario.total_celdas}h` },
            { label: 'clases hoy', value: horario.grilla.find(d => d.dia_numero === diaActual())?.bloques.filter(b => !b.es_recreo).length ?? 0 },
            { label: 'profesores', value: new Set(horario.grilla.flatMap(d => d.bloques.filter(b => !b.es_recreo && b.docente_apellidos).map(b => b.docente_apellidos))).size },
          ].map(({ label, value }) => (
            <Grid key={label} size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{
                p: 1.5, borderRadius: 2.5, textAlign: 'center',
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: accent, lineHeight: 1 }}>
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* ── Info + Próxima clase ────────────────────────────── */}
      <Fade in timeout={400}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: claseEnCurso || proximaClase ? 6 : 12 }}>
            <InfoHorario horario={horario} isDark={isDark} accent={accent} progreso={semanaProgreso()} />
          </Grid>
          {(claseEnCurso || proximaClase) && (
            <Grid size={{ xs: 12, md: 6 }}>
              <ClaseActualCard
                clase={claseEnCurso ?? proximaClase!}
                tipo={claseEnCurso ? 'enCurso' : 'proxima'}
                ahora={ahora}
                isDark={isDark}
                accent={accent}
              />
            </Grid>
          )}
        </Grid>
      </Fade>

      {/* ── Mini chart distribución semanal ─────────────────── */}
      {clasesPorDia.length > 0 && (
        <Fade in timeout={450}>
          <Box sx={{ mb: 2.5 }}>
            <DistribucionSemanal
              datos={clasesPorDia}
              diaHoy={diaActual()}
              isDark={isDark}
              accent={accent}
            />
          </Box>
        </Fade>
      )}

      {/* ── Grilla / Lista ────────────────────────────────────── */}
      <Fade in timeout={500}>
        <Box sx={{ animation: `${slideUp} .35s ease-out` }}>
          {isMobile && vista === 'dia' ? (
            <VistaListaMobile
              dia={diasRender[0]}
              claseEnCurso={claseEnCurso}
              proximaClase={proximaClase}
              isDark={isDark}
              accent={accent}
            />
          ) : (
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: vista === 'semana'
                  ? `72px repeat(${diasRender.length}, minmax(130px, 1fr))`
                  : '72px 1fr',
                gap: '6px',
                minWidth: vista === 'semana' ? `${72 + diasRender.length * 132}px` : 'auto',
              }}>
                <Box />
                {diasRender.map(d => (
                  <DiaHeader
                    key={d.dia_numero}
                    dia={d}
                    esHoy={d.dia_numero === diaActual()}
                    seleccionado={vista === 'dia' && d.dia_numero === diaVista}
                    isDark={isDark}
                    accent={accent}
                    onClick={() => { setDiaVista(d.dia_numero); setVista('dia'); }}
                  />
                ))}

                {bloquesEje.map(bq => (
                  <React.Fragment key={bq.bloque_numero}>
                    <EjeHora bloque={bq} ahora={ahora} isDark={isDark} accent={accent} />
                    {diasRender.map(d => {
                      const celda = d.bloques.find(b => b.bloque_numero === bq.bloque_numero) ?? null;
                      const enCurso = !!claseEnCurso &&
                        d.dia_numero === diaActual() &&
                        celda?.bloque_numero === claseEnCurso.bloque_numero;
                      const esProxima = !!proximaClase &&
                        d.dia_numero === diaActual() &&
                        celda?.bloque_numero === proximaClase.bloque_numero;
                      return (
                        <CeldaHorario
                          key={`${d.dia_numero}-${bq.bloque_numero}`}
                          celda={celda}
                          esHoy={d.dia_numero === diaActual()}
                          enCurso={enCurso}
                          esProxima={esProxima}
                          isDark={isDark}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Fade>

      {/* ── Leyenda ──────────────────────────────────────────── */}
      <Leyenda horario={horario} isDark={isDark} accent={accent} />

    </Box>
  );
};

// ═════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═════════════════════════════════════════════════════════════

// ── Header ────────────────────────────────────────────────────
const HorarioPageHeader: React.FC<{
  accent: string; gradient: string; isDark: boolean;
  onRefresh: () => void;
  vista: Vista; setVista: (v: Vista) => void;
  diaVista: number; setDiaVista: (d: number) => void;
  diasDisponibles: number[];
  showControls: boolean;
}> = ({ accent, gradient, isDark, onRefresh, vista, setVista, diaVista, setDiaVista, diasDisponibles, showControls }) => (
  <Fade in timeout={300}>
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: showControls ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            p: 1.25, borderRadius: 2.5, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${alpha(accent, 0.4)}`,
            animation: `${float} 3.5s ease-in-out infinite`,
          }}>
            <ScheduleIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{
              background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              Mi Horario
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Horario semanal de clases · {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {showControls && (
            <Box sx={{
              display: 'flex', gap: 0, p: 0.5, borderRadius: 2,
              bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
            }}>
              {(['semana', 'dia'] as Vista[]).map((key) => (
                <Box
                  key={key}
                  onClick={() => setVista(key)}
                  sx={{
                    px: 1.5, py: 0.75, borderRadius: 1.5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    transition: 'all .2s',
                    bgcolor: vista === key ? accent : 'transparent',
                    color: vista === key ? '#fff' : 'text.secondary',
                    fontWeight: vista === key ? 700 : 500,
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: vista === key ? accent : alpha(accent, 0.1) },
                  }}
                >
                  {key === 'semana' ? <WeekIcon sx={{ fontSize: 18 }} /> : <DayIcon sx={{ fontSize: 18 }} />}
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {key === 'semana' ? 'Semana' : 'Día'}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <Tooltip title="Actualizar datos">
            <IconButton onClick={onRefresh} size="small" sx={{
              bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
              '&:hover': { bgcolor: alpha(accent, 0.12), color: accent },
            }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showControls && vista === 'dia' && diasDisponibles.length > 0 && (
        <Fade in>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {diasDisponibles.map(n => (
              <Chip
                key={n}
                label={DIAS_LABEL[n]}
                onClick={() => setDiaVista(n)}
                icon={n === diaActual() ? <DotIcon sx={{ fontSize: '10px !important', color: `${accent} !important`, animation: `${blink} 1.5s ease-in-out infinite` }} /> : undefined}
                sx={{
                  cursor: 'pointer', fontWeight: 600,
                  bgcolor: diaVista === n ? accent : 'transparent',
                  color: diaVista === n ? '#fff' : n === diaActual() ? accent : 'text.secondary',
                  border: `1px solid ${diaVista === n ? accent : alpha(accent, 0.3)}`,
                  '&:hover': { bgcolor: diaVista === n ? accent : alpha(accent, 0.12) },
                  transition: 'all .2s',
                }}
              />
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  </Fade>
);

// ── Info card con progress bar ────────────────────────────────
const InfoHorario: React.FC<{
  horario: HorarioEstudiante; isDark: boolean; accent: string; progreso: number;
}> = ({ horario, isDark, accent, progreso }) => (
  <Paper elevation={0} sx={{
    p: 2.5, borderRadius: 3, height: '100%',
    bgcolor: isDark ? alpha('#fff', 0.03) : alpha(accent, 0.04),
    border: `1px solid ${alpha(accent, isDark ? 0.12 : 0.1)}`,
  }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{
        p: 1.5, borderRadius: 2, bgcolor: alpha(accent, 0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <InfoIcon sx={{ color: accent, fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: accent }}>
          {horario.nombre ?? 'Horario vigente'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {horario.total_celdas} clases semanales · {horario.grilla.length} días lectivos
        </Typography>
        {horario.publicado_en && (
          <Typography variant="caption" color="text.disabled" display="block">
            Publicado el {new Date(horario.publicado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Typography>
        )}

        {/* Barra de progreso semanal */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              Progreso de la semana
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: accent, fontSize: '0.68rem' }}>
              {progreso}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              height: 5, borderRadius: 3,
              bgcolor: alpha(accent, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.7)})`,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  </Paper>
);

// ── Clase en curso / próxima — con anillo de progreso ──────────
const ClaseActualCard: React.FC<{
  clase: BloqueHorario;
  tipo: 'enCurso' | 'proxima';
  ahora: number;
  isDark: boolean;
  accent: string;
}> = ({ clase, tipo, ahora, isDark, accent }) => {
  const color = getColor(clase.materia_nombre ?? '', clase.materia_color);
  const esActual = tipo === 'enCurso';

  // Tiempo restante / tiempo hasta inicio
  const minInicio = toMin(clase.hora_inicio);
  const minFin = toMin(clase.hora_fin);
  const durTotal = minFin - minInicio;

  const tiempoLabel = esActual
    ? `${minFin - ahora} min restantes`
    : `en ${minInicio - ahora} min`;

  const progresoClase = esActual
    ? Math.round(((ahora - minInicio) / durTotal) * 100)
    : 0;

  const ring = ringGeom(progresoClase);

  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, height: '100%',
      bgcolor: isDark ? alpha(color, 0.12) : alpha(color, 0.07),
      border: `1px solid ${alpha(color, esActual ? 0.4 : 0.2)}`,
      position: 'relative', overflow: 'hidden',
      animation: esActual ? `${pulseRing} 2s ease-in-out infinite` : 'none',
    }}>
      {/* Fondo decorativo */}
      <Box sx={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        bgcolor: alpha(color, 0.08),
      }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {esActual ? (
          // ── Anillo de progreso circular ──
          <Box sx={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="22" cy="22" r={ring.radius}
                fill="none" stroke={alpha(color, 0.15)} strokeWidth={4}
              />
              <circle
                cx="22" cy="22" r={ring.radius}
                fill="none" stroke={color} strokeWidth={4}
                strokeDasharray={ring.circ}
                strokeDashoffset={ring.offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset .6s ease' }}
              />
            </svg>
            <Box sx={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <NowIcon sx={{ color, fontSize: 18, animation: `${blink} 1.5s ease-in-out infinite` }} />
            </Box>
          </Box>
        ) : (
          <Box sx={{
            p: 0.75, borderRadius: 1.5, flexShrink: 0,
            bgcolor: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.25)}`,
          }}>
            <TimeIcon sx={{ color, fontSize: 20 }} />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Chip
              label={esActual ? '● En curso' : '⏱ Próxima clase'}
              size="small"
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: alpha(color, 0.12), color,
                border: `1px solid ${alpha(color, 0.2)}`,
              }}
            />
            <Typography variant="caption" fontWeight={700} sx={{ color, fontSize: '0.72rem' }}>
              {tiempoLabel}
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight={800} sx={{ color, lineHeight: 1.2 }} noWrap>
            {clase.materia_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
            {fmtHora(clase.hora_inicio)} – {fmtHora(clase.hora_fin)}
          </Typography>

          {clase.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <PersonIcon sx={{ fontSize: 13, color: alpha(color, 0.7) }} />
              <Typography variant="caption" color="text.secondary">
                Prof. {clase.docente_nombres} {clase.docente_apellidos}
              </Typography>
            </Box>
          )}
          {clase.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <RoomIcon sx={{ fontSize: 13, color: alpha(color, 0.7) }} />
              <Typography variant="caption" color="text.secondary">Aula {clase.aula}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ── Distribución semanal (mini bar chart) ─────────────────────
const DistribucionSemanal: React.FC<{
  datos: { dia: number; count: number }[];
  diaHoy: number | null;
  isDark: boolean;
  accent: string;
}> = ({ datos, diaHoy, isDark, accent }) => {
  const maxCount = Math.max(...datos.map(d => d.count), 1);

  return (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: 3,
      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
      border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingIcon sx={{ fontSize: 16, color: accent }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
            Distribución semanal
          </Typography>
        </Box>
        <Chip
          label={`${datos.reduce((s, d) => s + d.count, 0)} clases totales`}
          size="small"
          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(accent, 0.1), color: accent }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 52 }}>
        {datos.map(({ dia, count }) => {
          const esHoy = dia === diaHoy;
          const pct = (count / maxCount) * 100;
          return (
            <Tooltip key={dia} title={`${DIAS_LABEL[dia]}: ${count} clase${count !== 1 ? 's' : ''}`} placement="top">
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%', justifyContent: 'flex-end' }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: esHoy ? 800 : 500, color: esHoy ? accent : 'text.disabled' }}>
                  {count}
                </Typography>
                <Box sx={{
                  width: '100%', height: `${pct}%`, minHeight: 6, borderRadius: '3px 3px 0 0',
                  bgcolor: esHoy ? accent : alpha(accent, isDark ? 0.3 : 0.25),
                  transition: 'height .4s cubic-bezier(.4,0,.2,1)',
                  transformOrigin: 'bottom',
                  animation: `${growBar} .5s ease-out`,
                }} />
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: esHoy ? 700 : 400, color: esHoy ? accent : 'text.secondary' }}>
                  {DIAS_SHORT[dia]}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
};

// ── Cabecera de día ───────────────────────────────────────────
const DiaHeader: React.FC<{
  dia: DiaHorario; esHoy: boolean; seleccionado: boolean;
  isDark: boolean; accent: string; onClick: () => void;
}> = ({ dia, esHoy, seleccionado, isDark, accent, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      py: 1.25, px: 1, textAlign: 'center', borderRadius: 2.5, cursor: 'pointer',
      bgcolor: esHoy ? accent : isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
      border: seleccionado && !esHoy
        ? `1px solid ${alpha(accent, 0.5)}`
        : `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
      transition: 'all .2s',
      '&:hover': { bgcolor: esHoy ? accent : alpha(accent, 0.1), transform: 'translateY(-1px)' },
    }}
  >
    <Typography variant="caption" fontWeight={700} sx={{
      color: esHoy ? '#fff' : 'text.secondary',
      textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem',
    }}>
      {DIAS_SHORT[dia.dia_numero]}
    </Typography>
    {esHoy && (
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.8)', mx: 'auto', mt: 0.25 }} />
    )}
  </Paper>
);

// ── Eje de horas ──────────────────────────────────────────────
const EjeHora: React.FC<{
  bloque: BloqueHorario; ahora: number; isDark: boolean; accent: string;
}> = ({ bloque, ahora, isDark, accent }) => {
  const inicio = toMin(bloque.hora_inicio);
  const fin = toMin(bloque.hora_fin);
  const pasando = inicio <= ahora && ahora < fin;

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      py: 0.5, minHeight: 88, position: 'relative',
    }}>
      {pasando && (
        <Box sx={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: '60%', borderRadius: 2, bgcolor: accent,
        }} />
      )}
      {bloque.es_recreo ? (
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em' }}>
          RECREO
        </Typography>
      ) : (
        <>
          <Typography variant="caption" sx={{
            fontWeight: pasando ? 800 : 600,
            color: pasando ? accent : 'text.secondary',
            fontSize: '0.72rem',
          }}>
            {fmtHora(bloque.hora_inicio)}
          </Typography>
          <Box sx={{ width: 16, height: 1, bgcolor: alpha(accent, 0.2), my: 0.3 }} />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
            {fmtHora(bloque.hora_fin)}
          </Typography>
        </>
      )}
    </Box>
  );
};

// ── Celda con hover glow + indicador de "próxima" ──────────────
const CeldaHorario: React.FC<{
  celda: BloqueHorario | null;
  esHoy: boolean;
  enCurso: boolean;
  esProxima: boolean;
  isDark: boolean;
}> = ({ celda, esHoy, enCurso, esProxima, isDark }) => {
  const [hover, setHover] = useState(false);

  if (!celda) return (
    <Box sx={{
      borderRadius: 2, minHeight: 88,
      bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.015),
      border: `1px dashed ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
    }} />
  );

  if (celda.es_recreo) return (
    <Box sx={{
      borderRadius: 2, minHeight: 88, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
      border: `1px dashed ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06)}`,
    }}>
      <Typography sx={{ fontSize: '1.1rem' }}>☕</Typography>
    </Box>
  );

  const color = getColor(celda.materia_nombre ?? '', celda.materia_color);

  // Borde más grueso para la próxima clase
  const borderWidth = enCurso || esProxima ? 2 : 1;
  const borderColor = hover
    ? color
    : enCurso
      ? alpha(color, 0.55)
      : esProxima
        ? alpha(color, 0.45)
        : alpha(color, 0.2);

  return (
    <Tooltip
      placement="top"
      title={
        <Box sx={{ p: 0.25 }}>
          <Typography variant="body2" fontWeight={700} gutterBottom>{celda.materia_nombre}</Typography>
          <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
            🕐 {fmtHora(celda.hora_inicio)} – {fmtHora(celda.hora_fin)}
          </Typography>
          {celda.docente_nombres && (
            <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
              👤 Prof. {celda.docente_nombres} {celda.docente_apellidos}
            </Typography>
          )}
          {celda.aula && (
            <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
              📍 Aula {celda.aula}
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Paper
        elevation={0}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          borderRadius: 2.5, minHeight: 88, p: 1.5,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          cursor: 'default', overflow: 'hidden', position: 'relative',
          bgcolor: isDark ? alpha(color, hover ? 0.22 : 0.16) : alpha(color, hover ? 0.13 : 0.09),
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: esHoy
            ? `inset 3px 0 0 ${color}`
            : enCurso
              ? `0 0 0 2px ${alpha(color, 0.4)}, inset 3px 0 0 ${color}`
              : 'none',
          transition: 'all .25s cubic-bezier(.4,0,.2,1)',
          transform: hover ? 'translateY(-3px) scale(1.015)' : 'none',
          ...(hover && {
            boxShadow: `0 0 0 3px ${alpha(color, 0.15)}, 0 6px 18px ${alpha(color, 0.3)}, inset 3px 0 0 ${color}`,
          }),
        }}
      >
        {/* Dot en curso */}
        {enCurso && (
          <Box sx={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%', bgcolor: color,
            animation: `${blink} 1.2s ease-in-out infinite`,
          }} />
        )}
        {/* Ícono reloj para próxima */}
        {esProxima && !enCurso && (
          <Box sx={{ position: 'absolute', top: 5, right: 6 }}>
            <TimeIcon sx={{ fontSize: 11, color: alpha(color, 0.6) }} />
          </Box>
        )}

        <Typography variant="caption" fontWeight={800} sx={{
          color, lineHeight: 1.25, fontSize: '0.75rem',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {celda.materia_nombre}
        </Typography>

        <Box>
          {celda.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.5 }}>
              <PersonIcon sx={{ fontSize: 10, color: alpha(color, 0.65) }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: alpha(color, 0.85), lineHeight: 1 }} noWrap>
                {celda.docente_apellidos}
              </Typography>
            </Box>
          )}
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.25 }}>
              <RoomIcon sx={{ fontSize: 10, color: alpha(color, 0.55) }} />
              <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.disabled', lineHeight: 1 }}>
                {celda.aula}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Tooltip>
  );
};

// ── Vista lista vertical para mobile (vista "día") ──────────────
const VistaListaMobile: React.FC<{
  dia: DiaHorario | undefined;
  claseEnCurso: BloqueHorario | null;
  proximaClase: BloqueHorario | null;
  isDark: boolean;
  accent: string;
}> = ({ dia, claseEnCurso, proximaClase, isDark, accent }) => {
  if (!dia) return null;

  if (dia.bloques.length === 0) {
    return (
      <Paper elevation={0} sx={{
        p: 4, textAlign: 'center', borderRadius: 3,
        border: `1px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
      }}>
        <Typography variant="body2" color="text.secondary">
          No hay clases programadas para este día.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {dia.bloques.map(b => {
        // ── Recreo ──
        if (b.es_recreo) {
          return (
            <Box key={b.bloque_numero} sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{
                minWidth: 54, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 0.5,
              }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                  {fmtHora(b.hora_inicio)}
                </Typography>
                <Box sx={{ width: 2, flex: 1, bgcolor: alpha('#000', isDark ? 0.15 : 0.08), my: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                  {fmtHora(b.hora_fin)}
                </Typography>
              </Box>
              <Box sx={{
                flex: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center',
                justifyContent: 'center', minHeight: 48, opacity: 0.5,
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                border: `1px dashed ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06)}`,
              }}>
                <Typography sx={{ fontSize: '1.1rem' }}>☕</Typography>
              </Box>
            </Box>
          );
        }

        const color = getColor(b.materia_nombre ?? '', b.materia_color);
        const enCurso = claseEnCurso?.bloque_numero === b.bloque_numero;
        const esProxima = proximaClase?.bloque_numero === b.bloque_numero;

        return (
          <Box key={b.bloque_numero} sx={{ display: 'flex', gap: 1.5 }}>
            {/* Eje de horas */}
            <Box sx={{
              minWidth: 54, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 0.5,
            }}>
              <Typography variant="caption" fontWeight={700} sx={{
                fontSize: '0.7rem',
                color: enCurso ? accent : 'text.primary',
              }}>
                {fmtHora(b.hora_inicio)}
              </Typography>
              <Box sx={{ width: 2, flex: 1, bgcolor: alpha('#000', isDark ? 0.15 : 0.08), my: 0.5 }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                {fmtHora(b.hora_fin)}
              </Typography>
            </Box>

            {/* Card de la clase */}
            <Paper
              elevation={0}
              sx={{
                flex: 1, borderRadius: 2.5, p: 1.5, position: 'relative',
                bgcolor: isDark ? alpha(color, 0.16) : alpha(color, 0.09),
                border: `${enCurso || esProxima ? 2 : 1}px solid ${alpha(color, enCurso ? 0.55 : esProxima ? 0.45 : 0.2)}`,
                boxShadow: enCurso ? `inset 4px 0 0 ${color}` : 'none',
              }}
            >
              {enCurso && (
                <Chip
                  label="Ahora"
                  size="small"
                  sx={{
                    position: 'absolute', top: 8, right: 10, height: 20,
                    fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: alpha(color, 0.18), color,
                  }}
                />
              )}
              {esProxima && !enCurso && (
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <TimeIcon sx={{ fontSize: 14, color: alpha(color, 0.6) }} />
                </Box>
              )}

              <Typography variant="body2" fontWeight={700} sx={{ color, pr: 4 }}>
                {b.materia_nombre}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 0.75, flexWrap: 'wrap' }}>
                {b.docente_apellidos && (
                  <Typography variant="caption" sx={{
                    color: alpha(color, 0.85), display: 'flex', alignItems: 'center', gap: 0.4,
                  }}>
                    <PersonIcon sx={{ fontSize: 13 }} />
                    {b.docente_nombres} {b.docente_apellidos}
                  </Typography>
                )}
                {b.aula && (
                  <Typography variant="caption" sx={{
                    color: alpha(color, 0.85), display: 'flex', alignItems: 'center', gap: 0.4,
                  }}>
                    <RoomIcon sx={{ fontSize: 13 }} />
                    Aula {b.aula}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};

// ── Leyenda ───────────────────────────────────────────────────
const Leyenda: React.FC<{
  horario: HorarioEstudiante; isDark: boolean; accent: string;
}> = ({ horario, isDark, accent }) => {
  const materias = useMemo(() => {
    const map = new Map<string, { color: string; docente: string; horas: number }>();
    for (const dia of horario.grilla) {
      for (const b of dia.bloques) {
        if (!b.es_recreo && b.materia_nombre) {
          if (!map.has(b.materia_nombre)) {
            map.set(b.materia_nombre, {
              color: getColor(b.materia_nombre, b.materia_color),
              docente: b.docente_apellidos ? `Prof. ${b.docente_nombres} ${b.docente_apellidos}` : '',
              horas: 1,
            });
          } else {
            map.get(b.materia_nombre)!.horas++;
          }
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].horas - a[1].horas);
  }, [horario]);

  if (materias.length === 0) return null;

  return (
    <Fade in timeout={600}>
      <Box sx={{ mt: 4, animation: `${slideIn} .4s ease-out` }}>
        <Divider sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', px: 1 }}>
            Materias del período
          </Typography>
        </Divider>

        <Grid container spacing={1.5}>
          {materias.map(([nombre, data]) => (
            <Grid key={nombre} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: isDark ? alpha(data.color, 0.07) : alpha(data.color, 0.05),
                border: `1px solid ${alpha(data.color, isDark ? 0.15 : 0.12)}`,
                transition: 'all .2s',
                '&:hover': { bgcolor: alpha(data.color, isDark ? 0.13 : 0.1), transform: 'translateX(3px)' },
              }}>
                <Box sx={{ width: 4, height: 36, borderRadius: 2, bgcolor: data.color, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ color: data.color }}>
                    {nombre}
                  </Typography>
                  {data.docente && (
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {data.docente}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={`${data.horas}h`}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 700, flexShrink: 0,
                    bgcolor: alpha(data.color, 0.15), color: data.color,
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const HorarioSkeleton: React.FC<{ isDark: boolean }> = () => (
  <Box sx={{ pb: 4 }}>
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
      <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: 2.5 }} />
      <Box>
        <Skeleton variant="text" width={160} height={36} />
        <Skeleton variant="text" width={220} height={18} />
      </Box>
    </Box>
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {[1, 2, 3, 4].map(i => (
        <Grid key={i} size={{ xs: 6, sm: 3 }}>
          <Skeleton variant="rounded" height={64} sx={{ borderRadius: 2.5 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} /></Grid>
    </Grid>
    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3, mb: 2 }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: '72px repeat(5, 1fr)', gap: '6px' }}>
      {Array.from({ length: 36 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2.5 }} />
      ))}
    </Box>
  </Box>
);

export default EstudianteHorario;