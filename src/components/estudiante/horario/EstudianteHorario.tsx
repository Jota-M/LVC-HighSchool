'use client';
// components/estudiante/horario/EstudianteHorario.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, alpha, useTheme, useMediaQuery, keyframes,
  Fade, Skeleton, Paper, Chip, Tooltip, IconButton, ButtonBase,
  Grid, Divider, Alert, Dialog, DialogContent, DialogActions, Button,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  MenuBook as MateriaIcon,
  AccessTime as HoraIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Refresh as RefreshIcon,
  FiberManualRecord as DotIcon,
  Close as CloseIcon,
  Coffee as RecreoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useHorarioEstudiante } from '@/hooks/useEstudiante';
import type { BloqueHorario, DiaHorario, HorarioEstudiante } from '@/types/estudiante';

// ─────────────────────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const DIAS_L_V = [1, 2, 3, 4, 5];
const DIAS_SEMANA: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes',
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
  if (!h) return 0;
  const [hh, mm] = h.split(':').map(Number);
  return (hh || 0) * 60 + (mm || 0);
};

const ahoraMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

const diaActual = (): number | null => {
  const d = new Date().getDay();
  return d === 0 || d === 6 ? null : d;
};

interface Props { user?: any }

// ═════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — Horario Estudiante (estilo Docente)
// ═════════════════════════════════════════════════════════════
export const EstudianteHorario: React.FC<Props> = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const { horario, isLoading, refrescar } = useHorarioEstudiante();

  const [ahora, setAhora] = useState(ahoraMin());
  const [detalleCelda, setDetalleCelda] = useState<BloqueHorario | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setAhora(ahoraMin()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const diasActivos = useMemo(
    () => (horario
      ? horario.grilla.map(d => d.dia_numero).filter(d => d >= 1 && d <= 5).sort((a, b) => a - b)
      : DIAS_L_V),
    [horario]
  );

  const bloquesEje = useMemo(() => {
    if (!horario) return [];
    return horario.grilla
      .filter(d => d.dia_numero >= 1 && d.dia_numero <= 5)
      .flatMap(d => d.bloques)
      .filter((b, i, arr) => arr.findIndex(x => x.bloque_numero === b.bloque_numero) === i)
      .sort((a, b) => a.bloque_numero - b.bloque_numero);
  }, [horario]);

  const celdaMap = useMemo(() => {
    const map: Record<string, BloqueHorario> = {};
    if (!horario) return map;
    horario.grilla.forEach(d => {
      d.bloques.forEach(b => { map[`${d.dia_numero}-${b.bloque_numero}`] = b; });
    });
    return map;
  }, [horario]);

  const claseAhora = useMemo<BloqueHorario | null>(() => {
    const hoy = diaActual();
    if (!hoy || !horario) return null;
    const dia = horario.grilla.find(d => d.dia_numero === hoy);
    return dia?.bloques.find(b => !b.es_recreo && toMin(b.hora_inicio) <= ahora && ahora < toMin(b.hora_fin)) ?? null;
  }, [horario, ahora]);

  const proximaClase = useMemo<BloqueHorario | null>(() => {
    const hoy = diaActual();
    if (!hoy || !horario || claseAhora) return null;
    const dia = horario.grilla.find(d => d.dia_numero === hoy);
    return dia?.bloques.find(b => !b.es_recreo && toMin(b.hora_inicio) > ahora) ?? null;
  }, [horario, ahora, claseAhora]);

  const totalHoras = horario?.total_celdas ?? 0;

  const materiasUnicas = useMemo(() => {
    if (!horario) return [];
    return Array.from(new Set(
      horario.grilla.flatMap(d => d.bloques.filter(b => !b.es_recreo).map(b => b.materia_nombre))
    ));
  }, [horario]);

  const diasConClases = useMemo(() => {
    if (!horario) return [];
    return horario.grilla.filter(d => d.bloques.some(b => !b.es_recreo));
  }, [horario]);

  const horasPorDia = useMemo(() => {
    return DIAS_L_V.reduce<Record<number, number>>((acc, dia) => {
      const d = horario?.grilla.find(g => g.dia_numero === dia);
      acc[dia] = d ? d.bloques.filter(b => !b.es_recreo).length : 0;
      return acc;
    }, {});
  }, [horario]);

  const materiasResumen = useMemo(() => {
    const map = new Map<string, { nombre: string; color: string; horas: number; docente: string }>();
    if (!horario) return [];
    horario.grilla.forEach(d => {
      d.bloques.forEach(b => {
        if (b.es_recreo || !b.materia_nombre) return;
        const color = getColor(b.materia_nombre, b.materia_color);
        if (!map.has(b.materia_nombre)) {
          map.set(b.materia_nombre, {
            nombre: b.materia_nombre,
            color,
            horas: 1,
            docente: b.docente_apellidos ? `Prof. ${b.docente_nombres ?? ''} ${b.docente_apellidos}` : '',
          });
        } else {
          map.get(b.materia_nombre)!.horas++;
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.horas - a.horas);
  }, [horario]);

  if (isLoading) return <HorarioSkeleton />;

  return (
    <Box sx={{ pb: 4 }}>
      <Fade in timeout={450}>
        <Box>

          {/* ── HEADER ── */}
          <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarIcon sx={{ color: accentColor, fontSize: 34, animation: `${float} 2.5s ease-in-out infinite` }} />
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                    fontWeight: 800,
                    background: isDark ? 'linear-gradient(135deg,#facc15,#f59e0b)' : 'linear-gradient(135deg,#0288d1,#01579b)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1,
                  }}
                >
                  Mi Horario
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {horario && horario.grilla.length > 0
                    ? `${totalHoras} clases semanales · ${materiasUnicas.length} materias · ${diasConClases.length} días activos`
                    : 'Horario académico semanal'}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Actualizar horario">
              <IconButton
                onClick={() => void refrescar()}
                size="small"
                sx={{
                  p: 1, borderRadius: 2, border: `1px solid ${alpha(accentColor, 0.25)}`, color: accentColor,
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: alpha(accentColor, 0.1), transform: 'rotate(180deg)' },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {!horario || horario.grilla.length === 0 ? (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Tu horario todavía no fue publicado.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Consultá con la dirección del colegio para más información.
              </Typography>
            </Alert>
          ) : (
            <>
              {/* ── RESUMEN ── */}
              <Paper
                sx={{
                  mb: 3, p: 2, borderRadius: 3, border: `1px solid ${alpha(accentColor, 0.2)}`,
                  background: isDark
                    ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                    : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                  display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
                }}
              >
                <Box sx={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  bgcolor: alpha(accentColor, 0.15), color: accentColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ScheduleIcon sx={{ fontSize: 26 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {horario.nombre ?? 'Horario vigente'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.8 }}>
                    <Chip
                      size="small"
                      icon={<PersonIcon sx={{ fontSize: 12 }} />}
                      label="Estudiante"
                      sx={{
                        height: 22, fontSize: '0.68rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700,
                        '& .MuiChip-icon': { color: accentColor },
                      }}
                    />
                    {horario.publicado_en && (
                      <Chip
                        size="small"
                        label={`Publicado el ${new Date(horario.publicado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                        sx={{ height: 22, fontSize: '0.68rem' }}
                      />
                    )}
                    {claseAhora && (
                      <Chip
                        size="small"
                        icon={<DotIcon sx={{ fontSize: 10, animation: `${pulse} 1.5s infinite` }} />}
                        label={`En curso: ${claseAhora.etiqueta_personalizada || claseAhora.materia_nombre}${claseAhora.aula ? ` · Aula ${claseAhora.aula}` : ''}`}
                        sx={{
                          height: 22, fontSize: '0.68rem', fontWeight: 700,
                          bgcolor: alpha('#10b981', 0.15), color: '#10b981',
                          border: `1px solid ${alpha('#10b981', 0.3)}`,
                          '& .MuiChip-icon': { color: '#10b981' },
                        }}
                      />
                    )}
                    {!claseAhora && proximaClase && (
                      <Chip
                        size="small"
                        icon={<HoraIcon sx={{ fontSize: 12 }} />}
                        label={`Próxima: ${proximaClase.etiqueta_personalizada || proximaClase.materia_nombre} · ${fmtHora(proximaClase.hora_inicio)}`}
                        sx={{
                          height: 22, fontSize: '0.68rem', fontWeight: 700,
                          bgcolor: alpha(accentColor, 0.12), color: accentColor,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { valor: totalHoras, label: 'hrs/sem', color: accentColor },
                    { valor: materiasUnicas.length, label: 'materias', color: '#8b5cf6' },
                    { valor: diasConClases.length, label: 'días activos', color: '#10b981' },
                  ].map(s => (
                    <Box key={s.label} sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.valor}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* ── GRILLA PRINCIPAL ── */}
              <Paper
                sx={{
                  borderRadius: 3, border: `1px solid ${alpha(accentColor, 0.15)}`, overflow: 'hidden', mb: 3,
                  background: isDark
                    ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                    : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                }}
              >
                <Box
                  sx={{
                    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
                    background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ color: accentColor, fontSize: 18 }} />
                    Horario Semanal
                    <Chip
                      size="small"
                      label={`${totalHoras} clases`}
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700 }}
                    />
                  </Typography>

                  {claseAhora && (
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DotIcon sx={{ fontSize: 12, animation: `${pulse} 1.2s infinite` }} />
                      En clase: {claseAhora.etiqueta_personalizada || claseAhora.materia_nombre} ({fmtHora(claseAhora.hora_inicio)}–{fmtHora(claseAhora.hora_fin)})
                    </Typography>
                  )}
                </Box>

                <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  {isMobile ? (
                    <AgendaMobile
                      horario={horario}
                      diasActivos={diasActivos}
                      accentColor={accentColor}
                      isDark={isDark}
                      onCeldaClick={setDetalleCelda}
                    />
                  ) : (
                    <GrillaDesktop
                      diasActivos={diasActivos}
                      bloquesEje={bloquesEje}
                      celdaMap={celdaMap}
                      accentColor={accentColor}
                      isDark={isDark}
                      onCeldaClick={setDetalleCelda}
                    />
                  )}
                </Box>
              </Paper>

              {/* ── RESUMEN INFERIOR ── */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <ClasesPorDiaCard horario={horario} horasPorDia={horasPorDia} accentColor={accentColor} isDark={isDark} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <MateriasCard materiasResumen={materiasResumen} accentColor={accentColor} isDark={isDark} />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Fade>

      <DetalleCeldaModal celda={detalleCelda} onClose={() => setDetalleCelda(null)} accentColor={accentColor} isDark={isDark} />
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═════════════════════════════════════════════════════════════

const MIN_COL = 138, ROW_HEIGHT = 96, RECREO_HEIGHT = 38, HORA_COL = 92, GAP = 10;

// ── Grilla de escritorio (fluida, estilo docente) ───────────────
const GrillaDesktop: React.FC<{
  diasActivos: number[];
  bloquesEje: BloqueHorario[];
  celdaMap: Record<string, BloqueHorario>;
  accentColor: string;
  isDark: boolean;
  onCeldaClick: (b: BloqueHorario) => void;
}> = ({ diasActivos, bloquesEje, celdaMap, accentColor, isDark, onCeldaClick }) => (
  <Box sx={{ overflowX: 'auto', pb: 1 }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${HORA_COL}px repeat(${diasActivos.length}, minmax(${MIN_COL}px, 1fr))`,
        gap: `${GAP}px`,
        minWidth: HORA_COL + (MIN_COL + GAP) * diasActivos.length,
        width: '100%',
      }}
    >
      <Box />
      {diasActivos.map(dia => {
        const esHoy = dia === diaActual();
        return (
          <Box
            key={`h-${dia}`}
            sx={{
              textAlign: 'center', px: 1, py: 1.2, borderRadius: 2,
              background: esHoy
                ? isDark ? 'linear-gradient(135deg,#facc1530,#f59e0b18)' : 'linear-gradient(135deg,#0288d128,#01579b14)'
                : isDark ? '#ffffff08' : '#f9fafb',
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: esHoy ? accentColor : 'text.disabled', fontSize: '0.85rem' }}>
              {DIAS_SEMANA[dia]}
            </Typography>
          </Box>
        );
      })}

      {bloquesEje.map(bloque => {
        const isRecreo = bloque.es_recreo;
        const height = isRecreo ? RECREO_HEIGHT : ROW_HEIGHT;
        return (
          <React.Fragment key={bloque.bloque_numero}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', pr: 1.5, height }}>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', color: 'text.primary', lineHeight: 1.3 }}>
                {fmtHora(bloque.hora_inicio)}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.3 }}>
                {fmtHora(bloque.hora_fin)}
              </Typography>
            </Box>

            {isRecreo ? (
              <Box
                sx={{
                  gridColumn: `span ${diasActivos.length}`, height: RECREO_HEIGHT, borderRadius: 2,
                  bgcolor: isDark ? '#ffffff07' : '#f3f4f6', border: `1px dashed ${isDark ? '#ffffff18' : '#d1d5db'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                }}
              >
                <RecreoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                  Recreo · {fmtHora(bloque.hora_inicio)}–{fmtHora(bloque.hora_fin)}
                </Typography>
              </Box>
            ) : (
              diasActivos.map(dia => {
                const celda = celdaMap[`${dia}-${bloque.bloque_numero}`];
                return (
                  <CeldaDesktop
                    key={dia}
                    celda={celda}
                    height={height}
                    accentColor={accentColor}
                    isDark={isDark}
                    onClick={() => celda && onCeldaClick(celda)}
                  />
                );
              })
            )}
          </React.Fragment>
        );
      })}
    </Box>
  </Box>
);

// ── Celda de escritorio ──────────────────────────────────────
const CeldaDesktop: React.FC<{
  celda?: BloqueHorario; height: number; accentColor: string; isDark: boolean; onClick: () => void;
}> = ({ celda, height, isDark, onClick }) => {
  if (!celda) {
    return (
      <Box sx={{
        width: '100%', height, borderRadius: 2,
        border: `1.5px dashed ${isDark ? '#ffffff0f' : '#e5e7eb'}`,
        bgcolor: isDark ? '#ffffff04' : 'transparent',
      }} />
    );
  }

  const cellColor = getColor(celda.materia_nombre ?? '', celda.materia_color);

  return (
    <Tooltip title="Toca para ver detalles" placement="top" arrow>
      <ButtonBase
        onClick={onClick}
        sx={{
          width: '100%', height, borderRadius: 2,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.07)})`
            : `linear-gradient(135deg, ${alpha(cellColor, 0.16)}, ${alpha(cellColor, 0.05)})`,
          border: `1px solid ${alpha(cellColor, 0.55)}`,
          borderLeft: `5px solid ${cellColor}`,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
          p: 1.2, textAlign: 'left', overflow: 'hidden', transition: 'all 0.18s', cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.015)', borderColor: cellColor, boxShadow: `0 6px 18px ${alpha(cellColor, 0.32)}`,
            background: isDark
              ? `linear-gradient(135deg, ${alpha(cellColor, 0.3)}, ${alpha(cellColor, 0.1)})`
              : `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.08)})`,
          },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            color: cellColor, fontSize: '0.75rem', lineHeight: 1.25,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%',
          }}
        >
          {celda.etiqueta_personalizada || celda.materia_nombre}
        </Typography>

        <Box sx={{ width: '100%' }}>
          {celda.docente_apellidos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.2 }}>
              <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem', lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                {celda.docente_apellidos}
              </Typography>
            </Box>
          )}
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <AulaIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.64rem', lineHeight: 1 }}>
                {celda.aula}
              </Typography>
            </Box>
          )}
        </Box>
      </ButtonBase>
    </Tooltip>
  );
};

// ── Agenda mobile: selector de día + lista apilada ─────────────
const AgendaMobile: React.FC<{
  horario: HorarioEstudiante;
  diasActivos: number[];
  accentColor: string;
  isDark: boolean;
  onCeldaClick: (b: BloqueHorario) => void;
}> = ({ horario, diasActivos, accentColor, isDark, onCeldaClick }) => {
  const primerDiaConClases = diasActivos.find(
    d => horario.grilla.find(g => g.dia_numero === d)?.bloques.some(b => !b.es_recreo)
  ) ?? diasActivos[0];
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(diaActual() ?? primerDiaConClases);

  useEffect(() => {
    if (!diasActivos.includes(diaSeleccionado)) setDiaSeleccionado(diasActivos[0]);
  }, [diasActivos, diaSeleccionado]);

  const dia = horario.grilla.find(d => d.dia_numero === diaSeleccionado);
  const bloques = dia?.bloques.slice().sort((a, b) => a.bloque_numero - b.bloque_numero) ?? [];

  return (
    <Box>
      <Box sx={{
        display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2,
        '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
      }}>
        {diasActivos.map(d => {
          const activo = d === diaSeleccionado;
          const tieneClases = horario.grilla.find(g => g.dia_numero === d)?.bloques.some(b => !b.es_recreo);
          return (
            <ButtonBase
              key={d}
              onClick={() => setDiaSeleccionado(d)}
              sx={{
                px: 2, py: 1, borderRadius: 2.5, flexShrink: 0, fontWeight: 700, fontSize: '0.78rem',
                bgcolor: activo ? accentColor : (isDark ? '#ffffff08' : '#f3f4f6'),
                color: activo ? (isDark ? '#000' : '#fff') : (tieneClases ? 'text.primary' : 'text.disabled'),
                border: `1px solid ${activo ? accentColor : alpha(accentColor, 0.15)}`,
                transition: 'all 0.15s',
              }}
            >
              {DIAS_SEMANA[d]}
            </ButtonBase>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {bloques.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3, display: 'block' }}>
            No hay clases programadas para este día.
          </Typography>
        )}
        {bloques.map(b => {
          if (b.es_recreo) {
            return (
              <Box
                key={b.bloque_numero}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1, borderRadius: 2,
                  border: `1px dashed ${isDark ? '#ffffff18' : '#d1d5db'}`, bgcolor: isDark ? '#ffffff07' : '#f3f4f6',
                }}
              >
                <RecreoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                  Recreo · {fmtHora(b.hora_inicio)}–{fmtHora(b.hora_fin)}
                </Typography>
              </Box>
            );
          }

          const cellColor = getColor(b.materia_nombre ?? '', b.materia_color);

          return (
            <ButtonBase
              key={b.bloque_numero}
              onClick={() => onCeldaClick(b)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, width: '100%', textAlign: 'left',
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(cellColor, 0.22)}, ${alpha(cellColor, 0.07)})`
                  : `linear-gradient(135deg, ${alpha(cellColor, 0.16)}, ${alpha(cellColor, 0.05)})`,
                border: `1px solid ${alpha(cellColor, 0.55)}`,
                borderLeft: `5px solid ${cellColor}`,
                transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box sx={{ width: 54, flexShrink: 0 }}>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.72rem', display: 'block' }}>
                  {fmtHora(b.hora_inicio)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', display: 'block' }}>
                  {fmtHora(b.hora_fin)}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} sx={{ color: cellColor, lineHeight: 1.25 }}>
                  {b.etiqueta_personalizada || b.materia_nombre}
                </Typography>
                {b.etiqueta_personalizada && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem', display: 'block', fontStyle: 'italic' }}>
                    {b.materia_nombre}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mt: 0.4 }}>
                  {b.docente_apellidos && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <PersonIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                        {b.docente_nombres} {b.docente_apellidos}
                      </Typography>
                    </Box>
                  )}
                  {b.aula && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <AulaIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                        {b.aula}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// ── Clases por día (columna izquierda, estilo docente) ─────────
const ClasesPorDiaCard: React.FC<{
  horario: HorarioEstudiante; horasPorDia: Record<number, number>; accentColor: string; isDark: boolean;
}> = ({ horario, horasPorDia, accentColor, isDark }) => (
  <Paper
    sx={{
      borderRadius: 3, border: `1px solid ${alpha(accentColor, 0.15)}`, overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: isDark
        ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
        : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
    }}
  >
    <Box
      sx={{
        px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
        background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarIcon sx={{ color: accentColor, fontSize: 18 }} />
        Clases por día
      </Typography>
      <Chip
        size="small"
        label={`${horario.total_celdas} clases`}
        sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700 }}
      />
    </Box>

    <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
      {DIAS_L_V.filter(d => (horasPorDia[d] ?? 0) > 0).map(dia => {
        const clasesDelDia = horario.grilla.find(g => g.dia_numero === dia)?.bloques
          .filter(b => !b.es_recreo)
          .sort((a, b) => a.bloque_numero - b.bloque_numero) ?? [];

        return (
          <Paper
            key={dia}
            sx={{
              borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${alpha(accentColor, 0.12)}`,
              background: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.7),
            }}
          >
            <Box
              sx={{
                px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                bgcolor: isDark ? alpha('#facc15', 0.08) : alpha('#0288d1', 0.06),
                borderBottom: `1px solid ${alpha(accentColor, 0.08)}`,
              }}
            >
              <Typography variant="caption" fontWeight={700}>{DIAS_SEMANA[dia]}</Typography>
              <Chip
                size="small"
                label={`${clasesDelDia.length} clases`}
                sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha(accentColor, 0.15), color: accentColor }}
              />
            </Box>

            <Box sx={{ px: 2, py: 1.2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {clasesDelDia.map(c => {
                const color = getColor(c.materia_nombre ?? '', c.materia_color);
                return (
                  <Box key={c.bloque_numero} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{ width: 3, height: 22, borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption" fontWeight={700}
                        sx={{ color, display: 'block', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                      >
                        {c.etiqueta_personalizada || c.materia_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                        {fmtHora(c.hora_inicio)} – {fmtHora(c.hora_fin)}
                      </Typography>
                    </Box>
                    {c.docente_apellidos && (
                      <Typography
                        variant="caption" color="text.secondary"
                        sx={{ fontSize: '0.62rem', flexShrink: 0, maxWidth: 130, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                      >
                        {c.docente_apellidos}
                      </Typography>
                    )}
                    {c.aula && (
                      <Chip
                        size="small" label={c.aula}
                        sx={{ height: 16, fontSize: '0.58rem', flexShrink: 0, bgcolor: alpha(accentColor, 0.07), color: 'text.secondary' }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        );
      })}
    </Box>
  </Paper>
);

// ── Materias del período (columna derecha, estilo docente) ─────
const MateriasCard: React.FC<{
  materiasResumen: { nombre: string; color: string; horas: number; docente: string }[];
  accentColor: string; isDark: boolean;
}> = ({ materiasResumen, accentColor, isDark }) => (
  <Paper
    sx={{
      borderRadius: 3, border: `1px solid ${alpha(accentColor, 0.15)}`, overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: isDark
        ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
        : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
    }}
  >
    <Box
      sx={{
        px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
        background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MateriaIcon sx={{ color: accentColor, fontSize: 18 }} />
        Materias del período
      </Typography>
      <Chip
        size="small"
        label={`${materiasResumen.length} materias`}
        sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700 }}
      />
    </Box>

    <Box sx={{ flex: 1 }}>
      {materiasResumen.map((m, idx, arr) => (
        <Box key={m.nombre}>
          <Box
            sx={{
              px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5,
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: isDark ? alpha('#facc15', 0.02) : alpha('#0288d1', 0.02) },
            }}
          >
            <Box sx={{
              width: 38, height: 38, borderRadius: '50%', bgcolor: alpha(m.color, 0.15), color: m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MateriaIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{m.nombre}</Typography>
                <Chip
                  size="small" label={`${m.horas} hrs/sem`}
                  sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha(m.color, 0.12), color: m.color }}
                />
              </Box>
              {m.docente && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.3, display: 'block' }}>
                  {m.docente}
                </Typography>
              )}
            </Box>
          </Box>
          {idx < arr.length - 1 && <Divider sx={{ mx: 2, borderColor: alpha(accentColor, 0.08) }} />}
        </Box>
      ))}

      {materiasResumen.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <MateriaIcon sx={{ fontSize: 36, opacity: 0.2, mb: 1, color: accentColor }} />
          <Typography variant="caption" color="text.disabled">Sin materias asignadas aún</Typography>
        </Box>
      )}
    </Box>
  </Paper>
);

// ── Modal de detalle de celda ────────────────────────────────
const DetalleCeldaModal: React.FC<{
  celda: BloqueHorario | null; onClose: () => void; accentColor: string; isDark: boolean;
}> = ({ celda, onClose, accentColor }) => {
  if (!celda) return null;
  const cellColor = getColor(celda.materia_nombre ?? '', celda.materia_color);

  return (
    <Dialog open={!!celda} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: `linear-gradient(135deg, ${cellColor}ee, ${cellColor}88)`, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', textShadow: '0 1px 3px #0005', lineHeight: 1.2 }}>
              {celda.etiqueta_personalizada || celda.materia_nombre}
            </Typography>
            {celda.etiqueta_personalizada && (
              <Typography variant="caption" sx={{ color: '#ffffffdd', display: 'block', fontStyle: 'italic' }}>
                Materia oficial: {celda.materia_nombre}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#ffffffcc', display: 'block' }}>
              {fmtHora(celda.hora_inicio)} – {fmtHora(celda.hora_fin)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small"><CloseIcon /></IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <InfoRow icon={<HoraIcon sx={{ fontSize: 18, color: accentColor }} />} label="Horario" value={`${fmtHora(celda.hora_inicio)} – ${fmtHora(celda.hora_fin)}`} />
          <Divider />
          {celda.docente_apellidos && (
            <InfoRow icon={<PersonIcon sx={{ fontSize: 18, color: accentColor }} />} label="Docente" value={`${celda.docente_apellidos}, ${celda.docente_nombres ?? ''}`} />
          )}
          {celda.aula && (
            <InfoRow icon={<AulaIcon sx={{ fontSize: 18, color: accentColor }} />} label="Aula" value={celda.aula} />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button
          onClick={onClose} variant="contained" fullWidth
          sx={{ borderRadius: 2, bgcolor: cellColor, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: cellColor, filter: 'brightness(0.9)' } }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box sx={{ mt: 0.2, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Box>
  </Box>
);

// ── Skeleton ──────────────────────────────────────────────────
const HorarioSkeleton: React.FC = () => (
  <Box sx={{ pb: 4 }}>
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
      <Skeleton variant="circular" width={34} height={34} />
      <Box>
        <Skeleton variant="text" width={160} height={36} />
        <Skeleton variant="text" width={220} height={18} />
      </Box>
    </Box>
    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3, mb: 2 }} />
    <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3, mb: 2 }} />
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}><Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} /></Grid>
      <Grid size={{ xs: 12, md: 5 }}><Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} /></Grid>
    </Grid>
  </Box>
);

export default EstudianteHorario;