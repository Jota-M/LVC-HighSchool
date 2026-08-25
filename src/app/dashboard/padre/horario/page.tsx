// app/dashboard/padre/horario/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Fade, useTheme, keyframes,
  alpha, Grid, Chip, Skeleton, Alert, FormControl, InputLabel,
  Select, MenuItem, Avatar, Tab, Tabs, Divider,
  ToggleButtonGroup, ToggleButton, Card, CardContent,
  Tooltip, Badge, IconButton,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  MenuBook as MateriaIcon,
  AccessTime as HoraIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  MeetingRoom as AulaIcon,
  ChildCare as HijoIcon,
  CheckCircle as CheckIcon,
  Warning as WarnIcon,
  Info as InfoIcon,
  KeyboardArrowDown as ArrowIcon,
} from '@mui/icons-material';
import { HorarioReadonlyGrid } from '@/components/horario/HorarioReadonlyGrid';
import { useHijosPadre, useHorarioEstudiante, HijoResumen } from '@/hooks/useHorarioFamilia';
import { DIAS_SEMANA } from '@/types/horariotypes';
import { usePeriodosPublicos } from '@/hooks/usePeriodosPublicos';
import { useAuth } from '@/context/AuthContext';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const DIAS_L_V = [1, 2, 3, 4, 5];
const DIAS_L_S = [1, 2, 3, 4, 5, 6];

// ─────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────
export default function PadreHorarioPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  // ID del padre de familia autenticado
  // Ajusta según tu implementación de auth
  const { user } = useAuth();


  const [periodoId, setPeriodoId] = useState<number | null>(null);
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number>(0); // índice del tab
  const [diasModo, setDiasModo] = useState<'lv' | 'ls'>('lv');
  const diasActivos = diasModo === 'ls' ? DIAS_L_S : DIAS_L_V;

  const { periodos, periodoActivo, isLoading: loadingPeriodos } = usePeriodosPublicos();

  useEffect(() => {
    if (periodoActivo && !periodoId) setPeriodoId(periodoActivo.id);
  }, [periodoActivo]);

  const { hijos, isLoading: loadingHijos } = useHijosPadre(periodoId);

  // Resetear tab si el hijo ya no existe en el nuevo período
  useEffect(() => {
    if (hijos.length > 0 && hijoSeleccionado >= hijos.length) {
      setHijoSeleccionado(0);
    }
  }, [hijos]);

  const hijoActivo = hijos[hijoSeleccionado] ?? null;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={450}>
          <Box>

            {/* ── HEADER ── */}
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <CalendarIcon sx={{ color: accentColor, fontSize: 34, animation: `${float} 2.5s ease-in-out infinite` }} />
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
                      Horarios de mis Hijos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {hijos.length > 0
                        ? `${hijos.length} ${hijos.length === 1 ? 'estudiante registrado' : 'estudiantes registrados'}`
                        : 'Seguimiento académico familiar'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Selector período */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Período Académico</InputLabel>
                <Select
                  value={periodoId ?? ''}
                  onChange={(e) => { setPeriodoId(e.target.value as number); setHijoSeleccionado(0); }}
                  label="Período Académico"
                  disabled={loadingPeriodos}
                >
                  {periodos.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {p.nombre}
                        {p.activo && (
                          <Typography component="span" sx={{ fontSize: '0.6rem', fontWeight: 700, px: 0.7, py: 0.15, borderRadius: 1, bgcolor: accentColor, color: isDark ? '#000' : '#fff' }}>
                            ACTIVO
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {!periodoId && !loadingPeriodos && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Selecciona un período académico para ver los horarios
              </Alert>
            )}

            {periodoId && (
              <>
                {/* ── SELECTOR DE HIJOS ── */}
                {loadingHijos ? (
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {[1, 2].map((i) => (
                      <Skeleton key={i} variant="rounded" width={160} height={80} sx={{ borderRadius: 3 }} />
                    ))}
                  </Box>
                ) : hijos.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    No se encontraron estudiantes vinculados a tu cuenta en este período.
                  </Alert>
                ) : (
                  <>
                    {/* Cards de hijos — selector visual */}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                      {hijos.map((hijo, idx) => (
                        <HijoCard
                          key={hijo.estudiante_id}
                          hijo={hijo}
                          activo={hijoSeleccionado === idx}
                          accentColor={accentColor}
                          isDark={isDark}
                          onClick={() => setHijoSeleccionado(idx)}
                        />
                      ))}
                    </Box>

                    {/* ── CONTENIDO DEL HIJO SELECCIONADO ── */}
                    {hijoActivo && (
                      <HijoHorarioPanel
                        hijo={hijoActivo}
                        periodoId={periodoId}
                        diasActivos={diasActivos}
                        diasModo={diasModo}
                        onDiasModoChange={setDiasModo}
                        accentColor={accentColor}
                        isDark={isDark}
                      />
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

// ─────────────────────────────────────────────────
// Sub: Card selector de hijo
// ─────────────────────────────────────────────────
interface HijoCardProps {
  hijo: HijoResumen;
  activo: boolean;
  accentColor: string;
  isDark: boolean;
  onClick: () => void;
}

const HijoCard: React.FC<HijoCardProps> = ({ hijo, activo, accentColor, isDark, onClick }) => {
  const tieneHorario = !!hijo.paralelo_id;
  const iniciales = `${hijo.nombres?.charAt(0) ?? ''}${hijo.apellidos?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        p: 1.5,
        borderRadius: 3,
        minWidth: { xs: 140, sm: 170 },
        maxWidth: { xs: 160, sm: 200 },
        border: `2px solid ${activo ? accentColor : alpha(accentColor, 0.15)}`,
        bgcolor: activo
          ? isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.07)
          : isDark ? '#ffffff06' : '#fafafa',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: accentColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${alpha(accentColor, 0.18)}`,
        },
      }}
    >
      {/* Franja activo */}
      {activo && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: accentColor, borderRadius: '12px 12px 0 0' }} />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            tieneHorario
              ? <CheckIcon sx={{ fontSize: 12, color: '#10b981', bgcolor: isDark ? '#1a1a1a' : '#fff', borderRadius: '50%' }} />
              : <WarnIcon sx={{ fontSize: 12, color: '#f59e0b', bgcolor: isDark ? '#1a1a1a' : '#fff', borderRadius: '50%' }} />
          }
        >
          <Avatar
            src={hijo.foto_url ?? undefined}
            sx={{
              width: 38, height: 38,
              bgcolor: activo ? accentColor : alpha(accentColor, 0.2),
              color: activo ? (isDark ? '#000' : '#fff') : accentColor,
              fontWeight: 800, fontSize: '0.9rem',
            }}
          >
            {iniciales}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ lineHeight: 1.2, color: activo ? accentColor : 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {hijo.nombres.split(' ')[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2, display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {hijo.apellidos}
          </Typography>
          {hijo.grado_nombre && (
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: accentColor, fontWeight: 600, lineHeight: 1 }}>
              {hijo.grado_nombre}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Estado matrícula */}
      <Box sx={{ mt: 1 }}>
        <Chip
          size="small"
          label={tieneHorario ? (hijo.estado_matricula ?? 'Activo') : 'Sin matrícula'}
          sx={{
            height: 16, fontSize: '0.58rem', fontWeight: 700,
            bgcolor: tieneHorario ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
            color: tieneHorario ? '#10b981' : '#f59e0b',
          }}
        />
        {hijo.es_becado && (
          <Chip size="small" label="Beca" sx={{ height: 16, fontSize: '0.58rem', ml: 0.5, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────
// Sub: Panel completo de un hijo
// ─────────────────────────────────────────────────
interface HijoHorarioPanelProps {
  hijo: HijoResumen;
  periodoId: number;
  diasActivos: number[];
  diasModo: 'lv' | 'ls';
  onDiasModoChange: (v: 'lv' | 'ls') => void;
  accentColor: string;
  isDark: boolean;
}

const HijoHorarioPanel: React.FC<HijoHorarioPanelProps> = ({
  hijo, periodoId, diasActivos, diasModo, onDiasModoChange, accentColor, isDark,
}) => {
  const { celdas, bloques, materiasUnicas, totalHoras, isLoading } =
    useHorarioEstudiante(hijo.paralelo_id, periodoId);

  // Horas por día para resumen
  const horasPorDia = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, dia) => {
    acc[dia] = celdas.filter((c) => c.dia_semana === dia && !c.es_recreo).length;
    return acc;
  }, {});

  const diasConMasHoras = Object.entries(horasPorDia)
    .filter(([, h]) => h > 0)
    .sort(([, a], [, b]) => b - a);

  // CORRECCIÓN: el backend manda un solo campo `apellidos` (no apellido_paterno/materno)
  const nombreCompleto = `${hijo.nombres} ${hijo.apellidos}`;

  if (!hijo.paralelo_id) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <Typography variant="body2" fontWeight={600}>
          {hijo.nombres} no tiene matrícula activa en este período.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Contacta con secretaría para verificar su estado.
        </Typography>
      </Alert>
    );
  }

  return (
    <Fade in timeout={350}>
      <Box>
        {/* ── Info del estudiante ── */}
        <Paper
          sx={{
            mb: 3, p: 2, borderRadius: 3,
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            background: isDark
              ? `linear-gradient(135deg,${alpha('#facc15', 0.06)},transparent)`
              : `linear-gradient(135deg,${alpha('#0288d1', 0.05)},transparent)`,
            display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
          }}
        >
          <Avatar
            src={hijo.foto_url ?? undefined}
            sx={{ width: 52, height: 52, bgcolor: alpha(accentColor, 0.2), color: accentColor, fontWeight: 800, fontSize: '1.1rem' }}
          >
            {`${hijo.nombres?.charAt(0) ?? ''}${hijo.apellidos?.charAt(0) ?? ''}`}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {nombreCompleto}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.8 }}>
              {hijo.grado_nombre && (
                <Chip size="small" icon={<SchoolIcon sx={{ fontSize: 12 }} />} label={`${hijo.grado_nombre} — Paralelo ${hijo.paralelo_nombre}`}
                  sx={{ height: 22, fontSize: '0.68rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, '& .MuiChip-icon': { color: accentColor } }} />
              )}
              {hijo.turno_nombre && (
                <Chip size="small" icon={<HoraIcon sx={{ fontSize: 12 }} />} label={hijo.turno_nombre}
                  sx={{ height: 22, fontSize: '0.68rem' }} />
              )}
              {hijo.aula && (
                <Chip size="small" icon={<AulaIcon sx={{ fontSize: 12 }} />} label={`Aula ${hijo.aula}`}
                  sx={{ height: 22, fontSize: '0.68rem' }} />
              )}
              {hijo.es_repitente && (
                <Chip size="small" label="Repitente" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }} />
              )}
              {hijo.es_becado && (
                <Chip size="small" label="Becado" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
              )}
            </Box>
          </Box>

          {/* Mini stats inline */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { valor: isLoading ? '—' : totalHoras, label: 'hrs/sem', color: accentColor },
              { valor: isLoading ? '—' : materiasUnicas.length, label: 'materias', color: '#8b5cf6' },
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.valor}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ── GRILLA ── */}
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
          {/* Barra controles */}
          <Box
            sx={{
              px: 2.5, py: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 1,
              borderBottom: `1px solid ${alpha(accentColor, 0.1)}`,
              background: isDark ? alpha('#facc15', 0.04) : alpha('#0288d1', 0.04),
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: accentColor, fontSize: 18 }} />
              Horario Semanal
              {!isLoading && celdas.length > 0 && (
                <Chip size="small" label={`${totalHoras} clases`}
                  sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700 }} />
              )}
            </Typography>

            <ToggleButtonGroup
              value={diasModo} exclusive
              onChange={(_, v) => v && onDiasModoChange(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: `1px solid ${alpha(accentColor, 0.3)}`,
                  borderRadius: '8px !important',
                  px: 1.5, py: 0.5,
                  fontSize: '0.72rem', fontWeight: 600, textTransform: 'none',
                  '&.Mui-selected': { bgcolor: accentColor, color: isDark ? '#000' : '#fff' },
                },
              }}
            >
              <ToggleButton value="lv">L – V</ToggleButton>
              <ToggleButton value="ls">L – S</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <HorarioReadonlyGrid
              celdas={celdas}
              bloques={bloques}
              diasActivos={diasActivos}
              isLoading={isLoading}
            />
          </Box>
        </Paper>

        {/* ── RESUMEN POR DÍA + DOCENTES ── */}
        {!isLoading && celdas.length > 0 && (
          <Grid container spacing={2}>
            {/* Resumen por día */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
                Clases por día
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1, 2, 3, 4, 5].filter((d) => horasPorDia[d] > 0).map((dia) => {
                  const clasesDelDia = celdas
                    .filter((c) => c.dia_semana === dia && !c.es_recreo)
                    .sort((a, b) => a.bloque_numero - b.bloque_numero);

                  return (
                    <Paper key={dia} sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${alpha(accentColor, 0.1)}` }}>
                      {/* Cabecera día */}
                      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? alpha('#facc15', 0.05) : alpha('#0288d1', 0.04) }}>
                        <Typography variant="caption" fontWeight={700}>{DIAS_SEMANA[dia]}</Typography>
                        <Chip size="small" label={`${clasesDelDia.length} clases`}
                          sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha(accentColor, 0.1), color: accentColor }} />
                      </Box>

                      {/* Lista de clases compacta */}
                      <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                        {clasesDelDia.map((c) => {
                          const color = c.color || c.materia_color || accentColor;
                          return (
                            <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Box sx={{ width: 3, height: 22, borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color, display: 'block', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                  {c.materia_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                                  {c.hora_inicio?.slice(0, 5)} – {c.hora_fin?.slice(0, 5)}
                                </Typography>
                              </Box>
                              {c.docente_apellidos && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', flexShrink: 0, maxWidth: 90, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                  Prof. {c.docente_apellidos}
                                </Typography>
                              )}
                              {c.aula && (
                                <Chip size="small" label={c.aula}
                                  sx={{ height: 16, fontSize: '0.58rem', flexShrink: 0, bgcolor: alpha(accentColor, 0.07), color: 'text.secondary' }} />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Grid>

            {/* Panel de docentes */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
                Docentes de {hijo.nombres.split(' ')[0]}
              </Typography>
              <Paper sx={{ borderRadius: 2.5, border: `1px solid ${alpha(accentColor, 0.12)}`, overflow: 'hidden' }}>
                {[...new Map(
                  celdas
                    .filter((c) => c.docente_apellidos && !c.es_recreo)
                    .map((c) => [
                      c.docente_id,
                      {
                        id: c.docente_id,
                        nombre: `${c.docente_apellidos}, ${c.docente_nombres}`,
                        materias: [] as string[],
                        color: c.materia_color || accentColor,
                      },
                    ])
                ).values()].map((d, idx, arr) => {
                  // Materias de este docente
                  const materiasDocente = [...new Set(
                    celdas.filter((c) => c.docente_id === d.id && !c.es_recreo).map((c) => c.materia_nombre)
                  )];

                  return (
                    <Box key={d.id}>
                      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(d.color, 0.15), color: d.color, fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {d.nombre}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {materiasDocente.map((m) => (
                              <Chip key={m} size="small" label={m}
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(d.color, 0.1), color: d.color, fontWeight: 600 }} />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                      {idx < arr.length - 1 && <Divider sx={{ mx: 2 }} />}
                    </Box>
                  );
                })}

                {celdas.filter((c) => c.docente_apellidos).length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 32, opacity: 0.2, mb: 1 }} />
                    <Typography variant="caption" color="text.disabled">
                      Sin docentes asignados aún
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Materias sin docente (alerta útil para el padre) */}
              {(() => {
                const sinDocente = [...new Set(
                  celdas.filter((c) => !c.docente_apellidos && !c.es_recreo).map((c) => c.materia_nombre)
                )];
                return sinDocente.length > 0 ? (
                  <Alert
                    severity="warning"
                    icon={<WarnIcon />}
                    sx={{ mt: 1.5, borderRadius: 2.5, py: 0.8 }}
                  >
                    <Typography variant="caption" fontWeight={600} display="block">
                      Materias sin docente asignado:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sinDocente.join(', ')}
                    </Typography>
                  </Alert>
                ) : null;
              })()}
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
};