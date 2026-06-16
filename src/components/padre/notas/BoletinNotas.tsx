'use client';
// components/padre/notas/BoletinNotas.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Stack,
  Chip, Collapse, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  useTheme, alpha, IconButton, CircularProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SchoolIcon from '@mui/icons-material/School';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import {
  ResumenMateriaPadre,
  getNivelRendimiento,
  getColorNivelRendimiento,
  getGradientNivelRendimiento,
  DIMENSIONES_CONFIG,
  CalificacionPorPeriodo,
  CodigoDimension,
} from '@/types/padreNotasTypes';
import { getCalificacionesDetalle } from '@/services/padreNotasService';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

const formatFecha = (f?: string) =>
  f ? new Date(f + 'T12:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'short' }) : '—';

// ──────────────────────────────────────────────
// BARRA DE DIMENSIÓN
// ──────────────────────────────────────────────

const BarraDimension: React.FC<{ codigo: CodigoDimension; nota: number | null | undefined; delay?: number }> = ({
  codigo, nota, delay = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg = DIMENSIONES_CONFIG[codigo];
  if (!cfg) {
  console.warn('código inválido:', JSON.stringify(codigo));
  return null;
}
  const valor = nota ?? 0;
  return (
    <Box sx={{ mb: 1.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 11 }}>
            {cfg.label}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            {cfg.porcentaje}%
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={900} sx={{ color: nota != null ? cfg.color : 'text.disabled', fontSize: 12 }}>
          {nota != null ? nota : '—'}
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06), overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%', width: `${valor}%`, borderRadius: 3, bgcolor: cfg.color,
            transformOrigin: 'left', animation: `${fillBar} 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}s both`,
          }}
        />
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────
// FILA DE EVALUACIÓN (reutilizable en ambas tablas)
// ──────────────────────────────────────────────

const FilaEvaluacion: React.FC<{ ev: CalificacionPorPeriodo; color: string; showDim?: boolean; index: number }> = ({
  ev, color, showDim = false, index,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cod = ev.dimension_codigo as CodigoDimension;
  const cfg = cod && DIMENSIONES_CONFIG[cod] ? DIMENSIONES_CONFIG[cod] : null;
  const max = ev.puntaje_maximo ?? 100;
  const nota = ev.puntaje_obtenido;
  const pct = nota != null ? Math.round((nota / max) * 100) : null;

  return (
    <TableRow
      sx={{
        animation: `${fadeUp} 0.3s ease-out ${index * 0.03}s both`,
        '& td': { fontSize: 13, py: 1.1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` },
        '&:last-child td': { borderBottom: 'none' },
        '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
      }}
    >
      <TableCell>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
          {ev.evaluacion_nombre}
        </Typography>
        {ev.esta_ausente && (
          <Chip size="small" label="Ausente" sx={{ height: 17, fontSize: 9, fontWeight: 700, mt: 0.25, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', borderRadius: 1 }} />
        )}
      </TableCell>
      {showDim && cfg && (
        <TableCell>
          <Chip size="small" label={cfg.label} sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: alpha(cfg.color, 0.12), color: cfg.color, borderRadius: 1.5 }} />
        </TableCell>
      )}
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{ev.evaluacion_tipo ?? '—'}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>{formatFecha(ev.evaluacion_fecha)}</Typography>
      </TableCell>
      <TableCell align="center">
        {nota != null ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight={900} sx={{ color: cfg?.color ?? color, fontSize: 14, lineHeight: 1 }}>{nota}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>/{max}</Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell align="center">
        {pct != null ? (
          <Typography variant="caption" fontWeight={800} sx={{ color: cfg?.color ?? color, fontSize: 12 }}>{pct}%</Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

const thStyle = { fontWeight: 800, fontSize: 11, color: 'text.secondary', py: 1.25 };

// ──────────────────────────────────────────────
// TABLA VISTA "TODAS JUNTAS"
// ──────────────────────────────────────────────

const TablaJunto: React.FC<{ calificaciones: CalificacionPorPeriodo[]; color: string }> = ({ calificaciones, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`, background: isDark ? alpha('#fff', 0.02) : '#fafafa' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { ...thStyle, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02), borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` } }}>
            <TableCell>Evaluación</TableCell>
            <TableCell>Dimensión</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Nota</TableCell>
            <TableCell align="center">%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calificaciones.map((ev, i) => <FilaEvaluacion key={ev.evaluacion_id} ev={ev} color={color} showDim index={i} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ──────────────────────────────────────────────
// TABLA VISTA "POR DIMENSIÓN"
// ──────────────────────────────────────────────

const TablaPorDimension: React.FC<{ calificaciones: CalificacionPorPeriodo[]; color: string }> = ({ calificaciones, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porDimension = calificaciones.reduce<Record<string, CalificacionPorPeriodo[]>>((acc, c) => {
    const cod = c.dimension_codigo ?? 'SIN';
    if (!acc[cod]) acc[cod] = [];
    acc[cod].push(c);
    return acc;
  }, {});

  return (
    <Stack spacing={2}>
      {(['SER', 'SAB', 'HAC', 'AUT'] as CodigoDimension[]).map(cod => {
        const evals = porDimension[cod];
        if (!evals?.length) return null;
        const cfg = DIMENSIONES_CONFIG[cod];
        return (
          <Box key={cod}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: cfg.color }} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: cfg.color }}>{cfg.label}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{cfg.porcentaje}% del total</Typography>
              <Chip size="small" label={`${evals.length} eval.`} sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(cfg.color, 0.1), color: cfg.color, borderRadius: 1.5 }} />
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(cfg.color, 0.2)}`, background: isDark ? alpha(cfg.color, 0.04) : alpha(cfg.color, 0.02) }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { ...thStyle, color: cfg.color, bgcolor: alpha(cfg.color, isDark ? 0.1 : 0.06), borderBottom: `1px solid ${alpha(cfg.color, 0.2)}` } }}>
                    <TableCell>Evaluación</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Nota</TableCell>
                    <TableCell align="center">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evals.map((ev, i) => <FilaEvaluacion key={ev.evaluacion_id} ev={ev} color={cfg.color} index={i} />)}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Stack>
  );
};

// ──────────────────────────────────────────────
// SELECTOR DE VISTA (Todas / Por dimensión)
// ──────────────────────────────────────────────

const SelectorVista: React.FC<{ vista: 0 | 1; onChange: (v: 0 | 1) => void; color: string }> = ({ vista, onChange, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 2.5, bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03), border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`, width: 'fit-content', mb: 2 }}>
      {[
        { icon: <ViewListIcon sx={{ fontSize: 14 }} />, label: 'Todas' },
        { icon: <AccountTreeIcon sx={{ fontSize: 14 }} />, label: 'Por dimensión' },
      ].map((tab, i) => (
        <Box
          key={i}
          onClick={() => onChange(i as 0 | 1)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5,
            borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 700,
            transition: 'all 0.2s ease',
            ...(vista === i
              ? { bgcolor: isDark ? alpha(color, 0.2) : alpha(color, 0.12), color, boxShadow: `0 2px 8px ${alpha(color, 0.2)}` }
              : { color: 'text.secondary', '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) } }),
          }}
        >
          {tab.icon}{tab.label}
        </Box>
      ))}
    </Box>
  );
};

// ──────────────────────────────────────────────
// TARJETA DE MATERIA
// ──────────────────────────────────────────────

interface TarjetaMateriaProps {
  materia: ResumenMateriaPadre;
  index: number;
  matriculaId: number;
  periodoEvaluacionId: number;
  cache: Record<string, CalificacionPorPeriodo[]>;
  onCargado: (key: string, data: CalificacionPorPeriodo[]) => void;
}

const TarjetaMateria: React.FC<TarjetaMateriaProps> = ({
  materia, index, matriculaId, periodoEvaluacionId, cache, onCargado,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandido, setExpandido] = useState(false);
  const [vista, setVista] = useState<0 | 1>(0);
  const [loadingCalif, setLoadingCalif] = useState(false);

  const cacheKey = `${matriculaId}-${periodoEvaluacionId}`;
  const calificaciones = cache[cacheKey] ?? [];

  const nivel = getNivelRendimiento(materia.nota_final);
  const color = getColorNivelRendimiento(nivel, isDark);
  const gradient = getGradientNivelRendimiento(nivel);

  const handleExpandir = useCallback(async () => {
    const nuevo = !expandido;
    setExpandido(nuevo);
    if (nuevo && !cache[cacheKey]) {
      setLoadingCalif(true);
      try {
        const data = await getCalificacionesDetalle(matriculaId, periodoEvaluacionId);
        onCargado(cacheKey, data);
      } catch {
        onCargado(cacheKey, []);
      } finally {
        setLoadingCalif(false);
      }
    }
  }, [expandido, cacheKey, cache, matriculaId, periodoEvaluacionId, onCargado]);

  return (
    <Card
      sx={{
        borderRadius: 3,
        animation: `${fadeUp} 0.4s ease-out ${index * 0.06}s both`,
        overflow: 'hidden',
        border: `1px solid ${alpha(color, expandido ? 0.35 : 0.2)}`,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.03)} 100%)`
          : `linear-gradient(145deg, ${alpha(color, 0.05)} 0%, #fff 100%)`,
        transition: 'all 0.25s ease',
        '&:hover': { boxShadow: `0 4px 20px ${alpha(color, 0.2)}` },
        '&::before': { content: '""', display: 'block', height: '3px', background: gradient },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: expandido ? 1 : 2.5 }}>
        {/* Cabecera clickeable */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: 'pointer' }} onClick={handleExpandir}>
          {/* Nota final */}
          <Box
            sx={{
              width: 64, height: 64, borderRadius: 3, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: gradient, boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
            }}
          >
            {materia.nota_final != null ? (
              <>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>{materia.nota_final}</Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.85), fontSize: 9, fontWeight: 700 }}>/100</Typography>
              </>
            ) : (
              <HourglassEmptyIcon sx={{ color: '#fff', fontSize: 26 }} />
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body1" fontWeight={800} noWrap>{materia.materia_nombre}</Typography>
              {materia.aprobado != null && (
                <Chip
                  size="small"
                  icon={materia.aprobado ? <CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} /> : <CancelRoundedIcon sx={{ fontSize: '13px !important' }} />}
                  label={materia.aprobado ? 'Aprobado' : 'Reprobado'}
                  sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: alpha(color, isDark ? 0.2 : 0.12), color, border: `1px solid ${alpha(color, 0.3)}`, borderRadius: 1.5, '& .MuiChip-icon': { color } }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              Mínimo aprobación: {materia.nota_minima} pts
            </Typography>

            {(['SER', 'SAB', 'HAC', 'AUT'] as CodigoDimension[]).map((cod, i) => (
              <BarraDimension
                key={cod}
                codigo={cod}
                nota={
                  cod === 'SER' ? materia.nota_ser :
                  cod === 'SAB' ? materia.nota_saber :
                  cod === 'HAC' ? materia.nota_hacer :
                  materia.nota_auto   // AUT
                }
                delay={index * 0.06 + i * 0.05}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
            {loadingCalif
              ? <CircularProgress size={18} sx={{ color }} />
              : <IconButton size="small" sx={{ borderRadius: 2 }}>
                  {expandido ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </IconButton>
            }
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, fontWeight: 700 }}>
              {expandido ? 'cerrar' : 'ver notas'}
            </Typography>
          </Box>
        </Box>

        {/* Sección expandible */}
        <Collapse in={expandido}>
          <Divider sx={{ my: 2, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

          {loadingCalif ? (
            <Stack spacing={1}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 1.5 }} />)}</Stack>
          ) : calificaciones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.disabled" fontWeight={600}>No hay evaluaciones registradas aún</Typography>
            </Box>
          ) : (
            <>
              <SelectorVista vista={vista} onChange={setVista} color={color} />
              {vista === 0
                ? <TablaJunto calificaciones={calificaciones} color={color} />
                : <TablaPorDimension calificaciones={calificaciones} color={color} />
              }
            </>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

interface Props {
  boletin: ResumenMateriaPadre[];
  isLoading?: boolean;
  aprobadas?: number;
  reprobadas?: number;
  sinNota?: number;
  promedio?: number | null;
  matriculaId: number | null;
  periodoEvaluacionId: number | null;
}

const BoletinNotas: React.FC<Props> = ({
  boletin, isLoading = false, aprobadas = 0, reprobadas = 0,
  sinNota = 0, promedio, matriculaId, periodoEvaluacionId,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [cache, setCache] = useState<Record<string, CalificacionPorPeriodo[]>>({});

  useEffect(() => { setCache({}); }, [periodoEvaluacionId]);

  const handleCargado = useCallback((key: string, data: CalificacionPorPeriodo[]) => {
    setCache(prev => ({ ...prev, [key]: data }));
  }, []);

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => <Grid size={{ xs: 6, sm: 3 }} key={i}><Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />)}
      </Stack>
    );
  }

  if (boletin.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, borderRadius: 3, background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` }}>
        <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={600}>No hay notas registradas para este trimestre</Typography>
        <Typography variant="caption" color="text.disabled">Las notas aparecerán cuando el docente las registre</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Resumen global */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Aprobadas',  value: aprobadas,  color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)' },
          { label: 'Reprobadas', value: reprobadas, color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
          { label: 'Sin nota',   value: sinNota,    color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)' },
          { label: 'Promedio',   value: promedio != null ? `${promedio}` : '—', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)' },
        ].map((stat, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
            <Card sx={{ borderRadius: 3, animation: `${fadeUp} 0.4s ease-out ${i * 0.07}s both`, border: `1px solid ${alpha(stat.color, 0.2)}`, background: isDark ? alpha(stat.color, 0.1) : alpha(stat.color, 0.05), '&::before': { content: '""', display: 'block', height: '3px', background: stat.gradient } }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={900} sx={{ background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tarjetas por materia */}
      <Stack spacing={1.5}>
        {boletin.map((materia, i) => (
          <TarjetaMateria
            key={materia.materia_codigo}
            materia={materia}
            index={i}
            matriculaId={matriculaId ?? 0}
            periodoEvaluacionId={periodoEvaluacionId ?? 0}
            cache={cache}
            onCargado={handleCargado}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default BoletinNotas;