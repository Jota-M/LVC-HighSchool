// app/dashboard/docente/horario/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Fade, useTheme, keyframes,
  alpha, Grid, Chip, Skeleton, Alert, FormControl, InputLabel,
  Select, MenuItem, Avatar, Divider, Tooltip, IconButton,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  MenuBook as MateriaIcon,
  AccessTime as HoraIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  Refresh as RefreshIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { HorarioReadonlyGrid } from '@/components/horario/HorarioReadonlyGrid';
import { useHorarioDocente } from '@/hooks/useHorarioDocente';
import { useDocentePerfil } from '@/hooks/useDocentePerfil';
import { usePeriodosPublicos } from '@/hooks/usePeriodosPublicos';
import { useAuth } from '@/context/AuthContext';
import { DIAS_SEMANA } from '@/types/horariotypes';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
`;

const DIAS_L_V = [1, 2, 3, 4, 5];

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

// ─────────────────────────────────────────────────
// Página principal — Horario Docente (Estilo Padre)
// ─────────────────────────────────────────────────
export default function DocenteHorarioPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const { user } = useAuth();
  const { docente, docenteId, isLoadingPerfil } = useDocentePerfil();

  const [periodoId, setPeriodoId] = useState<number | null>(null);
  const [ahora, setAhora] = useState(ahoraMin());

  // Reloj para detectar clases en curso
  useEffect(() => {
    const timer = setInterval(() => setAhora(ahoraMin()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const { periodos, periodoActivo, isLoading: loadingPeriodos } = usePeriodosPublicos();

  useEffect(() => {
    if (periodoActivo && !periodoId) {
      setPeriodoId(periodoActivo.id);
    }
  }, [periodoActivo]);

  const {
    celdas,
    bloquesUnicos,
    materiasUnicas,
    totalHoras,
    diasConClases,
    isLoading: loadingHorario,
    refetch,
  } = useHorarioDocente(docenteId, periodoId);

  const isLoading = loadingHorario || isLoadingPerfil;

  // Clase actualmente en curso
  const claseAhora = useMemo(() => {
    const hoy = diaActual();
    if (!hoy || celdas.length === 0) return null;
    return (
      celdas.find((c) => {
        if (c.es_recreo || !c.materia_nombre || c.dia_semana !== hoy) return false;
        return toMin(c.hora_inicio) <= ahora && ahora < toMin(c.hora_fin);
      }) ?? null
    );
  }, [celdas, ahora]);

  // Horas por día para resumen
  const horasPorDia = useMemo(() => {
    return DIAS_L_V.reduce<Record<number, number>>((acc, dia) => {
      acc[dia] = celdas.filter((c) => c.dia_semana === dia && !c.es_recreo).length;
      return acc;
    }, {});
  }, [celdas]);

  // Cursos/Materias agrupadas para el panel lateral
  const materiasResumen = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        nombre: string;
        color: string;
        horas: number;
        cursos: Set<string>;
      }
    >();

    celdas.forEach((c) => {
      if (!c.materia_id || c.es_recreo) return;
      const color = c.color || c.materia_color || accentColor;
      if (!map.has(c.materia_id)) {
        map.set(c.materia_id, {
          id: c.materia_id,
          nombre: c.materia_nombre,
          color,
          horas: 1,
          cursos: new Set<string>(),
        });
      } else {
        map.get(c.materia_id)!.horas++;
      }

      const cursoLabel = [c.grado_nombre, c.paralelo_nombre ? `Paralelo ${c.paralelo_nombre}` : null]
        .filter(Boolean)
        .join(' — ');
      if (cursoLabel) {
        map.get(c.materia_id)!.cursos.add(cursoLabel);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.horas - a.horas);
  }, [celdas, accentColor]);

  const nombreDocente = docente
    ? `${docente.nombres} ${docente.apellidos}`
    : user?.username || 'Docente';

  const inicialesDocente = docente
    ? `${docente.nombres?.charAt(0) ?? ''}${docente.apellidos?.charAt(0) ?? ''}`.toUpperCase()
    : (user?.username?.slice(0, 2) ?? 'DC').toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={450}>
          <Box>

            {/* ── HEADER ── */}
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <CalendarIcon
                    sx={{
                      color: accentColor,
                      fontSize: 34,
                      animation: `${float} 2.5s ease-in-out infinite`,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                        fontWeight: 800,
                        background: isDark
                          ? 'linear-gradient(135deg,#facc15,#f59e0b)'
                          : 'linear-gradient(135deg,#0288d1,#01579b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1,
                      }}
                    >
                      Mi Horario
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {!isLoading && celdas.length > 0
                        ? `${totalHoras} clases semanales · ${materiasUnicas.length} materias · ${diasConClases.length} días activos`
                        : 'Planificación académica semanal'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Controles de cabecera: Período y Refresh */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Período Académico</InputLabel>
                  <Select
                    value={periodoId ?? ''}
                    onChange={(e) => setPeriodoId(e.target.value as number)}
                    label="Período Académico"
                    disabled={loadingPeriodos}
                  >
                    {periodos.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {p.nombre}
                          {p.activo && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                px: 0.7,
                                py: 0.15,
                                borderRadius: 1,
                                bgcolor: accentColor,
                                color: isDark ? '#000' : '#fff',
                              }}
                            >
                              ACTIVO
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Tooltip title="Actualizar horario">
                  <IconButton
                    onClick={() => void refetch()}
                    size="small"
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: `1px solid ${alpha(accentColor, 0.25)}`,
                      color: accentColor,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(accentColor, 0.1),
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Alerta sin período seleccionado */}
            {!periodoId && !loadingPeriodos && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Selecciona un período académico para ver tu horario
              </Alert>
            )}

            {periodoId && (
              <>
                {/* ── CARD PERFIL DOCENTE (Mismo estilo que panel de hijo en Padre) ── */}
                <Paper
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(accentColor, 0.2)}`,
                    background: isDark
                      ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                      : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={docente?.foto_url ?? undefined}
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: alpha(accentColor, 0.2),
                      color: accentColor,
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {inicialesDocente}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                      {nombreDocente}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.8 }}>
                      <Chip
                        size="small"
                        icon={<PersonIcon sx={{ fontSize: 12 }} />}
                        label="Docente"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          bgcolor: alpha(accentColor, 0.1),
                          color: accentColor,
                          fontWeight: 700,
                          '& .MuiChip-icon': { color: accentColor },
                        }}
                      />
                      {docente?.codigo && (
                        <Chip
                          size="small"
                          icon={<SchoolIcon sx={{ fontSize: 12 }} />}
                          label={`Código: ${docente.codigo}`}
                          sx={{ height: 22, fontSize: '0.68rem' }}
                        />
                      )}
                      {docente?.especialidad && (
                        <Chip
                          size="small"
                          label={docente.especialidad}
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            bgcolor: alpha('#8b5cf6', 0.1),
                            color: '#8b5cf6',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {docente?.email && (
                        <Chip
                          size="small"
                          label={docente.email}
                          sx={{ height: 22, fontSize: '0.68rem' }}
                        />
                      )}
                      {claseAhora && (
                        <Chip
                          size="small"
                          icon={<DotIcon sx={{ fontSize: 10, animation: `${pulse} 1.5s infinite` }} />}
                          label={`En curso: ${claseAhora.materia_nombre}${claseAhora.aula ? ` · Aula ${claseAhora.aula}` : ''}`}
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: alpha('#10b981', 0.15),
                            color: '#10b981',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                            '& .MuiChip-icon': { color: '#10b981' },
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Mini stats inline — Exacto al apartado de padres */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[
                      { valor: isLoading ? '—' : totalHoras, label: 'hrs/sem', color: accentColor },
                      { valor: isLoading ? '—' : materiasUnicas.length, label: 'materias', color: '#8b5cf6' },
                      { valor: isLoading ? '—' : diasConClases.length, label: 'días activos', color: '#10b981' },
                    ].map((s) => (
                      <Box key={s.label} sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>
                          {s.valor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                          {s.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* ── ALERTA SIN HORARIOS ── */}
                {!isLoading && celdas.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                    <Typography variant="body2" fontWeight={600}>
                      No tienes clases asignadas o el horario no ha sido publicado aún para este período.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Contacta con secretaría o coordinación académica para verificar tus asignaciones.
                    </Typography>
                  </Alert>
                ) : (
                  <>
                    {/* ── GRILLA PRINCIPAL (Paper idéntico al de Padres) ── */}
                    <Paper
                      sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(accentColor, 0.15)}`,
                        overflow: 'hidden',
                        mb: 3,
                        background: isDark
                          ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                          : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                      }}
                    >
                      {/* Barra de controles / título de la grilla */}
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                          borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
                          background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <CalendarIcon sx={{ color: accentColor, fontSize: 18 }} />
                          Horario Semanal
                          {!isLoading && celdas.length > 0 && (
                            <Chip
                              size="small"
                              label={`${totalHoras} clases`}
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: alpha(accentColor, 0.1),
                                color: accentColor,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Typography>

                        {claseAhora && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#10b981',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <DotIcon sx={{ fontSize: 12, animation: `${pulse} 1.2s infinite` }} />
                            En clase: {claseAhora.materia_nombre} ({claseAhora.hora_inicio?.slice(0, 5)}–{claseAhora.hora_fin?.slice(0, 5)})
                          </Typography>
                        )}
                      </Box>

                      {/* Contenedor de la grilla */}
                      <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                        <HorarioReadonlyGrid
                          celdas={celdas}
                          bloques={bloquesUnicos}
                          diasActivos={DIAS_L_V}
                          isLoading={isLoading}
                          ocultarDocente={true}
                        />
                      </Box>
                    </Paper>

                    {/* ── RESUMEN INFERIOR (Clases por día + Materias y Cursos) ── */}
                    {!isLoading && celdas.length > 0 && (
                      <Grid container spacing={2}>
                        {/* Columna izquierda: Clases por día */}
                        <Grid size={{ xs: 12, md: 7 }}>
                          <Paper
                            sx={{
                              borderRadius: 3,
                              border: `1px solid ${alpha(accentColor, 0.15)}`,
                              overflow: 'hidden',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              background: isDark
                                ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                                : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                            }}
                          >
                            {/* Barra de cabecera como el del horario */}
                            <Box
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
                                borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
                                background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                <CalendarIcon sx={{ color: accentColor, fontSize: 18 }} />
                                Clases por día
                              </Typography>
                              <Chip
                                size="small"
                                label={`${totalHoras} clases`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(accentColor, 0.1),
                                  color: accentColor,
                                  fontWeight: 700,
                                }}
                              />
                            </Box>

                            {/* Contenido de días */}
                            <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                              {DIAS_L_V.filter((d) => (horasPorDia[d] ?? 0) > 0).map((dia) => {
                                const clasesDelDia = celdas
                                  .filter((c) => c.dia_semana === dia && !c.es_recreo)
                                  .sort((a, b) => a.bloque_numero - b.bloque_numero);

                                return (
                                  <Paper
                                    key={dia}
                                    sx={{
                                      borderRadius: 2.5,
                                      overflow: 'hidden',
                                      border: `1px solid ${alpha(accentColor, 0.12)}`,
                                      background: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.7),
                                    }}
                                  >
                                    {/* Cabecera del día */}
                                    <Box
                                      sx={{
                                        px: 2,
                                        py: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        bgcolor: isDark
                                          ? alpha('#facc15', 0.08)
                                          : alpha('#0288d1', 0.06),
                                        borderBottom: `1px solid ${alpha(accentColor, 0.08)}`,
                                      }}
                                    >
                                      <Typography variant="caption" fontWeight={700}>
                                        {DIAS_SEMANA[dia]}
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={`${clasesDelDia.length} clases`}
                                        sx={{
                                          height: 16,
                                          fontSize: '0.58rem',
                                          fontWeight: 700,
                                          bgcolor: alpha(accentColor, 0.15),
                                          color: accentColor,
                                        }}
                                      />
                                    </Box>

                                    {/* Lista de clases compacta */}
                                    <Box sx={{ px: 2, py: 1.2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                      {clasesDelDia.map((c) => {
                                        const color = c.color || c.materia_color || accentColor;
                                        const cursoLabel = [c.grado_nombre, c.paralelo_nombre ? `Paralelo ${c.paralelo_nombre}` : null]
                                          .filter(Boolean)
                                          .join(' — ');

                                        return (
                                          <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                            <Box
                                              sx={{
                                                width: 3,
                                                height: 22,
                                                borderRadius: 2,
                                                bgcolor: color,
                                                flexShrink: 0,
                                              }}
                                            />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography
                                                variant="caption"
                                                fontWeight={700}
                                                sx={{
                                                  color,
                                                  display: 'block',
                                                  lineHeight: 1.2,
                                                  overflow: 'hidden',
                                                  whiteSpace: 'nowrap',
                                                  textOverflow: 'ellipsis',
                                                }}
                                              >
                                                {c.etiqueta_personalizada || c.materia_nombre}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{ fontSize: '0.62rem' }}
                                              >
                                                {c.hora_inicio?.slice(0, 5)} – {c.hora_fin?.slice(0, 5)}
                                              </Typography>
                                            </Box>

                                            {cursoLabel && (
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                  fontSize: '0.62rem',
                                                  flexShrink: 0,
                                                  maxWidth: 130,
                                                  overflow: 'hidden',
                                                  whiteSpace: 'nowrap',
                                                  textOverflow: 'ellipsis',
                                                }}
                                              >
                                                {cursoLabel}
                                              </Typography>
                                            )}

                                            {c.aula && (
                                              <Chip
                                                size="small"
                                                label={c.aula}
                                                sx={{
                                                  height: 16,
                                                  fontSize: '0.58rem',
                                                  flexShrink: 0,
                                                  bgcolor: alpha(accentColor, 0.07),
                                                  color: 'text.secondary',
                                                }}
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
                        </Grid>

                        {/* Columna derecha: Cursos y materias asignadas */}
                        <Grid size={{ xs: 12, md: 5 }}>
                          <Paper
                            sx={{
                              borderRadius: 3,
                              border: `1px solid ${alpha(accentColor, 0.15)}`,
                              overflow: 'hidden',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              background: isDark
                                ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
                                : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
                            }}
                          >
                            {/* Barra de cabecera como el del horario */}
                            <Box
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
                                borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
                                background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                <MateriaIcon sx={{ color: accentColor, fontSize: 18 }} />
                                Materias y Cursos Asignados
                              </Typography>
                              <Chip
                                size="small"
                                label={`${materiasResumen.length} materias`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(accentColor, 0.1),
                                  color: accentColor,
                                  fontWeight: 700,
                                }}
                              />
                            </Box>

                            {/* Contenido de materias */}
                            <Box sx={{ flex: 1 }}>
                              {materiasResumen.map((m, idx, arr) => (
                                <Box key={m.id}>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 1.5,
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: 1.5,
                                      transition: 'background-color 0.15s ease',
                                      '&:hover': {
                                        bgcolor: isDark ? alpha('#facc15', 0.02) : alpha('#0288d1', 0.02),
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        bgcolor: alpha(m.color, 0.15),
                                        color: m.color,
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <MateriaIcon sx={{ fontSize: 18 }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          gap: 1,
                                        }}
                                      >
                                        <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                          {m.nombre}
                                        </Typography>
                                        <Chip
                                          size="small"
                                          label={`${m.horas} hrs/sem`}
                                          sx={{
                                            height: 18,
                                            fontSize: '0.58rem',
                                            fontWeight: 700,
                                            bgcolor: alpha(m.color, 0.12),
                                            color: m.color,
                                          }}
                                        />
                                      </Box>

                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.8 }}>
                                        {Array.from(m.cursos).map((c) => (
                                          <Chip
                                            key={c}
                                            size="small"
                                            icon={<SchoolIcon sx={{ fontSize: 11 }} />}
                                            label={c}
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              bgcolor: alpha(accentColor, 0.08),
                                              color: 'text.secondary',
                                              fontWeight: 600,
                                              '& .MuiChip-icon': { color: accentColor },
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  </Box>
                                  {idx < arr.length - 1 && <Divider sx={{ mx: 2, borderColor: alpha(accentColor, 0.08) }} />}
                                </Box>
                              ))}

                              {materiasResumen.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                  <MateriaIcon sx={{ fontSize: 36, opacity: 0.2, mb: 1, color: accentColor }} />
                                  <Typography variant="caption" color="text.disabled">
                                    Sin materias asignadas aún
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}