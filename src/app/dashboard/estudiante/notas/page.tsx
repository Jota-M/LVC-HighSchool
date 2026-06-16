'use client';
// components/estudiante/calificaciones/EstudianteCalificaciones.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Stack,
  Chip, Collapse, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Fade,
  useTheme, alpha, IconButton, CircularProgress, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon      from '@mui/icons-material/ExpandMore';
import ExpandLessIcon      from '@mui/icons-material/ExpandLess';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon   from '@mui/icons-material/CancelRounded';
import HourglassEmptyIcon  from '@mui/icons-material/HourglassEmpty';
import SchoolIcon          from '@mui/icons-material/School';
import RefreshIcon         from '@mui/icons-material/Refresh';
import ViewListIcon        from '@mui/icons-material/ViewList';
import AccountTreeIcon     from '@mui/icons-material/AccountTree';
import InfoIcon            from '@mui/icons-material/Info';
import BarChartIcon        from '@mui/icons-material/BarChart';

import { useMisMaterias, useBoletinEstudiante, usePeriodosEstudiante } from '@/hooks/useEstudiante';
import estudianteService from '@/services/estudianteService';
import type { BoletinMateria, NotasPorMateria, MateriaResumen } from '@/types/estudiante';

// ─────────────────────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;
const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;
const float = keyframes`
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-5px) rotate(2deg); }
`;

// ─────────────────────────────────────────────────────────────
// CONFIG DIMENSIONES (modelo boliviano)
// ─────────────────────────────────────────────────────────────
const DIMENSIONES: Record<string, {
  label: string; color: string; porcentaje: number; gradient: string;
}> = {
  SER:  { label: 'Ser',            color: '#10B981', porcentaje: 10, gradient: 'linear-gradient(135deg,#10B981,#34D399)' },
  SAB:  { label: 'Saber',          color: '#3B82F6', porcentaje: 40, gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)' },
  HAC:  { label: 'Hacer',          color: '#F59E0B', porcentaje: 45, gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)' },
  AUT: { label: 'Autoevaluación', color: '#8B5CF6', porcentaje: 5, gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const notaColor = (nota: number | null | undefined, isDark: boolean) => {
  if (nota == null) return isDark ? '#9CA3AF' : '#6B7280';
  if (nota >= 70) return '#10B981';
  if (nota >= 51) return '#F59E0B';
  return '#EF4444';
};
const notaGradient = (nota: number | null | undefined) => {
  if (nota == null) return 'linear-gradient(135deg,#6B7280,#9CA3AF)';
  if (nota >= 70) return 'linear-gradient(135deg,#10B981,#34D399)';
  if (nota >= 51) return 'linear-gradient(135deg,#F59E0B,#FCD34D)';
  return 'linear-gradient(135deg,#EF4444,#F87171)';
};
const formatFecha = (f?: string | null) =>
  f ? new Date(f + 'T12:00:00').toLocaleDateString('es-BO', { day:'numeric', month:'short' }) : '—';
const round1 = (n?: number | null) =>
  n != null ? Math.round(n * 10) / 10 : null;

// ─────────────────────────────────────────────────────────────
// BARRA DE DIMENSIÓN
// ─────────────────────────────────────────────────────────────
const BarraDimension: React.FC<{
  codigo: string; nota: number | null | undefined; delay?: number;
}> = ({ codigo, nota, delay = 0 }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg    = DIMENSIONES[codigo];
  if (!cfg) return null;
  const valor  = nota ?? 0;

  return (
    <Box sx={{ mb: 1.1 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 0.35 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap: 0.75 }}>
          <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor: cfg.color, flexShrink:0 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize:11 }}>
            {cfg.label}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize:10 }}>
            {cfg.porcentaje}%
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={900} sx={{ color: nota != null ? cfg.color : 'text.disabled', fontSize:12 }}>
          {nota != null ? round1(nota) : '—'}
        </Typography>
      </Box>
      <Box sx={{ height:5, borderRadius:3, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06), overflow:'hidden' }}>
        <Box sx={{
          height:'100%', width:`${valor}%`, borderRadius:3, bgcolor: cfg.color,
          transformOrigin:'left',
          animation:`${fillBar} 0.8s cubic-bezier(.4,0,.2,1) ${delay}s both`,
        }} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// SELECTOR VISTA TABLA
// ─────────────────────────────────────────────────────────────
const SelectorVista: React.FC<{
  vista: 0 | 1; onChange: (v: 0 | 1) => void; color: string;
}> = ({ vista, onChange, color }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      display:'flex', alignItems:'center', gap:0.5, p:0.5,
      borderRadius:2.5, width:'fit-content', mb:2,
      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
      border:`1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    }}>
      {[
        { icon:<ViewListIcon sx={{fontSize:14}}/>,     label:'Todas' },
        { icon:<AccountTreeIcon sx={{fontSize:14}}/>,  label:'Por dimensión' },
      ].map((tab, i) => (
        <Box
          key={i}
          onClick={() => onChange(i as 0 | 1)}
          sx={{
            display:'flex', alignItems:'center', gap:0.75, px:1.5, py:0.5,
            borderRadius:2, cursor:'pointer', fontSize:12, fontWeight:700,
            transition:'all .2s ease',
            ...(vista === i
              ? { bgcolor: isDark ? alpha(color, 0.2) : alpha(color, 0.12), color, boxShadow:`0 2px 8px ${alpha(color, 0.2)}` }
              : { color:'text.secondary', '&:hover':{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) } }),
          }}
        >
          {tab.icon}{tab.label}
        </Box>
      ))}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// TABLA — todas juntas
// ─────────────────────────────────────────────────────────────
const thSx = { fontWeight:800, fontSize:11, color:'text.secondary', py:1.25 };

const TablaJuntas: React.FC<{ detalle: NotasPorMateria; color: string }> = ({ detalle, color }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <TableContainer component={Paper} elevation={0} sx={{
      borderRadius:2.5,
      border:`1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
      background: isDark ? alpha('#fff', 0.02) : '#fafafa',
    }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th':{ ...thSx, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02), borderBottom:`1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` } }}>
            <TableCell>Evaluación</TableCell>
            <TableCell>Dimensión</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Nota</TableCell>
            <TableCell align="center">%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalle.evaluaciones.map((ev, i) => {
            const cod = ev.dimension_codigo;
            const cfg = DIMENSIONES[cod] ?? null;
            const pct = ev.nota_sobre_100;
            return (
              <TableRow
                key={ev.id}
                sx={{
                  animation:`${fadeUp} .3s ease-out ${i * .03}s both`,
                  '& td':{ fontSize:13, py:1.1, borderBottom:`1px solid ${isDark ? alpha('#fff', .04) : alpha('#000', .05)}` },
                  '&:last-child td':{ borderBottom:'none' },
                  '&:hover':{ bgcolor: isDark ? alpha('#fff', .02) : alpha('#000', .015) },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize:13 }}>{ev.evaluacion_nombre}</Typography>
                  {ev.esta_ausente && (
                    <Chip size="small" label="Ausente" sx={{ height:17, fontSize:9, fontWeight:700, mt:.25, bgcolor:alpha('#EF4444', .1), color:'#EF4444', borderRadius:1 }} />
                  )}
                </TableCell>
                <TableCell>
                  {cfg && <Chip size="small" label={cfg.label} sx={{ height:20, fontSize:10, fontWeight:800, bgcolor:alpha(cfg.color, .12), color:cfg.color, borderRadius:1.5 }} />}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize:11 }}>{ev.tipo ?? '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize:11 }}>{formatFecha(ev.fecha)}</Typography>
                </TableCell>
                <TableCell align="center">
                  {ev.puntaje_obtenido != null ? (
                    <Box sx={{ textAlign:'center' }}>
                      <Typography variant="body2" fontWeight={900} sx={{ color: cfg?.color ?? color, fontSize:14, lineHeight:1 }}>{ev.puntaje_obtenido}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize:10 }}>/{ev.puntaje_maximo}</Typography>
                    </Box>
                  ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell align="center">
                  {pct != null ? (
                    <Typography variant="caption" fontWeight={800} sx={{ color: cfg?.color ?? color, fontSize:12 }}>{pct}%</Typography>
                  ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ─────────────────────────────────────────────────────────────
// TABLA — por dimensión
// ─────────────────────────────────────────────────────────────
const TablaPorDimension: React.FC<{ detalle: NotasPorMateria; color: string }> = ({ detalle, color }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const porDimension = detalle.evaluaciones.reduce<Record<string, typeof detalle.evaluaciones>>((acc, ev) => {
    const cod = ev.dimension_codigo ?? 'SIN';
    if (!acc[cod]) acc[cod] = [];
    acc[cod].push(ev);
    return acc;
  }, {});

  return (
    <Stack spacing={2.5}>
      {['SER','SAB','HAC','AUT'].map(cod => {
        const evals = porDimension[cod];
        if (!evals?.length) return null;
        const cfg = DIMENSIONES[cod];
        // Nota promedio de esta dimensión desde detalle.dimensiones
        const dimData = detalle.dimensiones.find(d => d.dimension_codigo === cod);
        return (
          <Box key={cod}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1 }}>
              <Box sx={{ width:4, height:20, borderRadius:2, bgcolor:cfg.color }} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ color:cfg.color }}>{cfg.label}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize:10 }}>{cfg.porcentaje}% del total</Typography>
              <Chip size="small" label={`${evals.length} eval.`} sx={{ height:18, fontSize:10, fontWeight:700, bgcolor:alpha(cfg.color, .1), color:cfg.color, borderRadius:1.5 }} />
              {dimData && (
                <Chip size="small" label={`Promedio: ${round1(dimData.nota_promedio)}`} sx={{ height:18, fontSize:10, fontWeight:800, bgcolor:alpha(cfg.color, .15), color:cfg.color, borderRadius:1.5 }} />
              )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius:2.5, border:`1px solid ${alpha(cfg.color, .2)}`, background: isDark ? alpha(cfg.color, .04) : alpha(cfg.color, .02) }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th':{ ...thSx, color:cfg.color, bgcolor:alpha(cfg.color, isDark ? .1 : .06), borderBottom:`1px solid ${alpha(cfg.color, .2)}` } }}>
                    <TableCell>Evaluación</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Nota</TableCell>
                    <TableCell align="center">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evals.map((ev, i) => {
                    const pct = ev.nota_sobre_100;
                    return (
                      <TableRow
                        key={ev.id}
                        sx={{
                          animation:`${fadeUp} .3s ease-out ${i * .04}s both`,
                          '& td':{ fontSize:13, py:1.1, borderBottom:`1px solid ${isDark ? alpha('#fff', .04) : alpha('#000', .04)}` },
                          '&:last-child td':{ borderBottom:'none' },
                          '&:hover':{ bgcolor: isDark ? alpha(cfg.color, .06) : alpha(cfg.color, .03) },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize:13 }}>{ev.evaluacion_nombre}</Typography>
                          {ev.esta_ausente && <Chip size="small" label="Ausente" sx={{ height:17, fontSize:9, fontWeight:700, mt:.25, bgcolor:alpha('#EF4444', .1), color:'#EF4444', borderRadius:1 }} />}
                        </TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary" sx={{ fontSize:11 }}>{ev.tipo ?? '—'}</Typography></TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize:11 }}>{formatFecha(ev.fecha)}</Typography></TableCell>
                        <TableCell align="center">
                          {ev.puntaje_obtenido != null ? (
                            <Box sx={{ textAlign:'center' }}>
                              <Typography variant="body2" fontWeight={900} sx={{ color:cfg.color, fontSize:14, lineHeight:1 }}>{ev.puntaje_obtenido}</Typography>
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize:10 }}>/{ev.puntaje_maximo}</Typography>
                            </Box>
                          ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell align="center">
                          {pct != null ? (
                            <Chip size="small" label={`${pct}%`} sx={{ height:20, fontSize:10, fontWeight:800, bgcolor:alpha(cfg.color, .12), color:cfg.color, borderRadius:1.5 }} />
                          ) : <Typography variant="caption" color="text.disabled">Pendiente</Typography>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Stack>
  );
};

// ─────────────────────────────────────────────────────────────
// TARJETA DE MATERIA (expandible)
// ─────────────────────────────────────────────────────────────
const TarjetaMateria: React.FC<{
  item:         BoletinMateria;
  grado_materia_id: number | undefined;
  periodo_evaluacion_id: number;
  index:        number;
  cache:        Record<string, NotasPorMateria>;
  onCargado:    (key: string, data: NotasPorMateria) => void;
}> = ({ item, grado_materia_id, periodo_evaluacion_id, index, cache, onCargado }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [expandido,      setExpandido]      = useState(false);
  const [vista,          setVista]          = useState<0 | 1>(0);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cacheKey = `${grado_materia_id}-${periodo_evaluacion_id}`;
  const detalle  = cache[cacheKey];

  const color    = notaColor(item.nota_final, isDark);
  const gradient = notaGradient(item.nota_final);

  const handleExpandir = useCallback(async () => {
    const nuevo = !expandido;
    setExpandido(nuevo);
    if (nuevo && !detalle && grado_materia_id) {
      setLoadingDetalle(true);
      try {
        const res = await estudianteService.getNotasPorMateria(grado_materia_id, periodo_evaluacion_id);
        onCargado(cacheKey, res.data);
      } catch {
        onCargado(cacheKey, { dimensiones:[], evaluaciones:[], nota_final: null });
      } finally {
        setLoadingDetalle(false);
      }
    }
  }, [expandido, detalle, grado_materia_id, periodo_evaluacion_id, cacheKey, onCargado]);

  return (
    <Card sx={{
      borderRadius:3,
      animation:`${fadeUp} .4s ease-out ${index * .06}s both`,
      overflow:'hidden',
      border:`1px solid ${alpha(color, expandido ? .35 : .2)}`,
      background: isDark
        ? `linear-gradient(145deg, ${alpha(color, .1)} 0%, ${alpha(color, .03)} 100%)`
        : `linear-gradient(145deg, ${alpha(color, .05)} 0%, #fff 100%)`,
      transition:'all .25s ease',
      '&:hover':{ boxShadow:`0 4px 20px ${alpha(color, .2)}` },
      '&::before':{ content:'""', display:'block', height:'3px', background:gradient },
    }}>
      <CardContent sx={{ p:2.5, pb: expandido ? 1 : 2.5 }}>

        {/* ── Cabecera clickeable ── */}
        <Box
          sx={{ display:'flex', alignItems:'flex-start', gap:2, cursor: grado_materia_id ? 'pointer' : 'default' }}
          onClick={grado_materia_id ? handleExpandir : undefined}
        >
          {/* Nota final */}
          <Box sx={{
            width:64, height:64, borderRadius:3, flexShrink:0,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            background:gradient, boxShadow:`0 4px 14px ${alpha(color, .35)}`,
          }}>
            {item.nota_final != null ? (
              <>
                <Typography variant="h5" fontWeight={900} sx={{ color:'#fff', lineHeight:1 }}>
                  {round1(item.nota_final)}
                </Typography>
                <Typography variant="caption" sx={{ color:alpha('#fff', .85), fontSize:9, fontWeight:700 }}>/100</Typography>
              </>
            ) : <HourglassEmptyIcon sx={{ color:'#fff', fontSize:26 }} />}
          </Box>

          {/* Info materia */}
          <Box sx={{ flex:1, minWidth:0 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:.5, flexWrap:'wrap' }}>
              <Typography variant="body1" fontWeight={800} noWrap>{item.materia_nombre}</Typography>
              {item.aprobado != null && (
                <Chip
                  size="small"
                  icon={item.aprobado
                    ? <CheckCircleRoundedIcon sx={{ fontSize:'13px !important' }} />
                    : <CancelRoundedIcon   sx={{ fontSize:'13px !important' }} />}
                  label={item.aprobado ? 'Aprobado' : 'Reprobado'}
                  sx={{
                    height:22, fontSize:11, fontWeight:800,
                    bgcolor:alpha(color, isDark ? .2 : .12), color,
                    border:`1px solid ${alpha(color, .3)}`, borderRadius:1.5,
                    '& .MuiChip-icon':{ color },
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display:'block', mb:1 }}>
              Mínimo aprobación: {item.nota_minima ?? 51} pts
            </Typography>

            {/* Barras Ser/Saber/Hacer */}
            {(['SER', 'SAB', 'HAC', 'AUT'] as const).map((cod, i) => (
            <BarraDimension
              key={cod}
              codigo={cod}
              nota={
                cod === 'SER'  ? item.nota_ser :
                cod === 'SAB'  ? item.nota_saber :
                cod === 'HAC'  ? item.nota_hacer :
                item.nota_auto ?? null
              }
              delay={index * .06 + i * .05}
            />
          ))}
          </Box>

          {/* Botón expandir */}
          <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:.25, flexShrink:0 }}>
            {loadingDetalle
              ? <CircularProgress size={18} sx={{ color }} />
              : grado_materia_id
                ? <IconButton size="small" sx={{ borderRadius:2 }}>
                    {expandido ? <ExpandLessIcon sx={{ fontSize:18 }} /> : <ExpandMoreIcon sx={{ fontSize:18 }} />}
                  </IconButton>
                : null
            }
            {grado_materia_id && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize:9, fontWeight:700 }}>
                {expandido ? 'cerrar' : 'ver notas'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Detalle expandido ── */}
        <Collapse in={expandido}>
          <Divider sx={{ my:2, borderColor: isDark ? alpha('#fff', .06) : alpha('#000', .06) }} />

          {loadingDetalle ? (
            <Stack spacing={1}>{[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius:1.5 }} />)}</Stack>
          ) : !detalle || detalle.evaluaciones.length === 0 ? (
            <Box sx={{ textAlign:'center', py:3 }}>
              <Typography variant="body2" color="text.disabled" fontWeight={600}>
                No hay evaluaciones publicadas para este período
              </Typography>
            </Box>
          ) : (
            <>
              {/* Tarjetas de dimensiones */}
              {detalle.dimensiones.length > 0 && (
                <Box sx={{ display:'flex', gap:1.25, flexWrap:'wrap', mb:2.5 }}>
                  {detalle.dimensiones.map((dim, i) => {
                    const cfg = DIMENSIONES[dim.dimension_codigo] ?? null;
                    if (!cfg) return null;
                    return (
                      <Box key={dim.dimension_codigo} sx={{
                        flex:'1 1 130px', minWidth:120, p:2, borderRadius:2.5,
                        animation:`${fadeUp} .4s ease-out ${i * .08}s both`,
                        background: isDark ? alpha(cfg.color, .1) : alpha(cfg.color, .06),
                        border:`1px solid ${alpha(cfg.color, .2)}`,
                      }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                          <Box sx={{
                            width:36, height:36, borderRadius:2, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background:cfg.gradient, boxShadow:`0 3px 10px ${alpha(cfg.color, .35)}`,
                          }}>
                            <Typography variant="subtitle2" fontWeight={900} sx={{ color:'#fff', lineHeight:1 }}>
                              {dim.nota_promedio != null ? round1(dim.nota_promedio) : '—'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" fontWeight={800} sx={{ color:cfg.color, display:'block' }}>{cfg.label}</Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize:10 }}>
                              {cfg.porcentaje}% · {dim.total_evaluaciones} eval.
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ height:5, borderRadius:3, bgcolor: isDark ? alpha('#fff', .06) : alpha('#000', .06), overflow:'hidden' }}>
                          <Box sx={{
                            height:'100%', width:`${dim.nota_promedio ?? 0}%`,
                            borderRadius:3, bgcolor:cfg.color,
                            transformOrigin:'left', animation:`${fillBar} .8s ease-out both`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <SelectorVista vista={vista} onChange={setVista} color={color} />
              {vista === 0
                ? <TablaJuntas       detalle={detalle} color={color} />
                : <TablaPorDimension detalle={detalle} color={color} />
              }
            </>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────
// SELECTOR DE PERÍODO
// ─────────────────────────────────────────────────────────────
const SelectorPeriodo: React.FC<{
  periodos:      { id: number; nombre: string }[];
  periodoActivo: number | null;
  onChange:      (id: number) => void;
  isLoading:     boolean;
  isDark:        boolean;
}> = ({ periodos, periodoActivo, onChange, isLoading, isDark }) => {
  if (isLoading) return (
    <Box sx={{ display:'flex', gap:1 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" width={130} height={34} sx={{ borderRadius:2.5 }} />)}
    </Box>
  );
  return (
    <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
      {periodos.map(p => {
        const activo = p.id === periodoActivo;
        return (
          <Chip
            key={p.id}
            label={p.nombre}
            onClick={() => onChange(p.id)}
            sx={{
              height:34, fontWeight:700, fontSize:13, borderRadius:2.5, cursor:'pointer',
              transition:'all .2s ease',
              ...(activo
                ? { background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'#fff', boxShadow:'0 4px 12px rgba(59,130,246,.35)', border:'none' }
                : { bgcolor: isDark ? alpha('#fff', .06) : alpha('#000', .04), color:'text.secondary', border:`1px solid ${isDark ? alpha('#fff', .1) : alpha('#000', .08)}`, '&:hover':{ bgcolor: isDark ? alpha('#3b82f6', .15) : alpha('#3b82f6', .08), color: isDark ? '#60A5FA' : '#3B82F6' } }),
            }}
          />
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
interface Props { user?: any }

export const EstudianteCalificaciones: React.FC<Props> = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // DESPUÉS — reemplazar con:
const {
  periodos,
  periodoActivo,
  setPeriodoActivo,
  isLoading: loadingPeriodos,
} = usePeriodosEstudiante();

const { materias, isLoading: loadingMaterias } = useMisMaterias(periodoActivo ?? undefined);
  
  const [cache, setCache] = useState<Record<string, NotasPorMateria>>({});

  // Seleccionar el primer período al cargar
  

  // Limpiar cache al cambiar período
  useEffect(() => { setCache({}); }, [periodoActivo]);

  const {
    boletin, isLoading: loadingBoletin,
    aprobadas, reprobadas, promedio,
    refrescar,
  } = useBoletinEstudiante(periodoActivo);

  // Mapa materia_codigo → grado_materia_id (para cargar detalle)
  const gradoMateriaMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const mat of materias) m.set(mat.materia_codigo, mat.grado_materia_id);
    return m;
  }, [materias]);

  const handleCargado = useCallback((key: string, data: NotasPorMateria) => {
    setCache(prev => ({ ...prev, [key]: data }));
  }, []);

  const sinNota = boletin.filter(b => b.nota_final == null).length;

  const isLoading = loadingPeriodos || loadingMaterias || loadingBoletin;

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <Fade in timeout={350}>
        <Box sx={{
          p:3.5, mb:4, borderRadius:4,
          background: isDark
            ? 'linear-gradient(145deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.02) 100%)'
            : '#fff',
          border:`1px solid ${isDark ? alpha('#fff', .08) : alpha('#000', .05)}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,.3)' : '0 8px 32px rgba(0,0,0,.06)',
          position:'relative', overflow:'hidden',
        }}>
          {/* shimmer */}
          <Box sx={{
            position:'absolute', inset:0,
            background:`linear-gradient(90deg,transparent,${alpha('#fff', isDark ? .03 : .08)},transparent)`,
            backgroundSize:'1000px 100%',
            animation:`${shimmer} 4s linear infinite`,
            pointerEvents:'none',
          }} />

          <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:2, position:'relative', zIndex:1 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
              <Box sx={{
                width:56, height:56, borderRadius:3,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'linear-gradient(135deg,#10B981,#059669)',
                boxShadow:'0 6px 20px rgba(16,185,129,.4)',
                animation:`${float} 3s ease-in-out infinite`,
              }}>
                <SchoolIcon sx={{ fontSize:30, color:'#fff' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{
                  background:'linear-gradient(135deg,#10B981,#059669)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  letterSpacing:-.5, lineHeight:1.2,
                }}>
                  Mis Calificaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt:.25 }}>
                  Boletín de notas · modelo educativo boliviano
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, flexWrap:'wrap' }}>
              {promedio != null && (
                <Chip
                  icon={<BarChartIcon sx={{ fontSize:'16px !important' }} />}
                  label={`Promedio: ${promedio}`}
                  size="small"
                  sx={{
                    height:28, fontWeight:800, fontSize:12,
                    bgcolor: isDark ? alpha('#10B981', .15) : alpha('#10B981', .1),
                    color: isDark ? '#34D399' : '#059669',
                    border:`1px solid ${alpha('#10B981', .3)}`, borderRadius:2,
                    '& .MuiChip-icon':{ color: isDark ? '#34D399' : '#059669' },
                  }}
                />
              )}
              <Tooltip title="Actualizar">
                <IconButton
                  onClick={refrescar}
                  disabled={loadingBoletin}
                  size="small"
                  sx={{
                    bgcolor: isDark ? alpha('#fff', .06) : alpha('#000', .04),
                    border:`1px solid ${isDark ? alpha('#fff', .08) : alpha('#000', .06)}`,
                    borderRadius:2, transition:'all .3s ease',
                    '&:hover':{ bgcolor: isDark ? alpha('#10B981', .15) : alpha('#10B981', .08), transform:'rotate(180deg)' },
                  }}
                >
                  <RefreshIcon sx={{ fontSize:18, color: isDark ? '#34D399' : '#059669' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Nota modelo boliviano */}
          <Box sx={{
            mt:2, p:1.5, borderRadius:2,
            bgcolor: isDark ? alpha('#3B82F6', .08) : alpha('#3B82F6', .05),
            border:`1px solid ${alpha('#3B82F6', .2)}`,
            display:'flex', alignItems:'center', gap:1,
            position:'relative', zIndex:1,
          }}>
            <InfoIcon sx={{ fontSize:16, color:'#3B82F6', flexShrink:0 }} />
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: DIMENSIONES.SER.color,  fontWeight:800 }}>Ser</Box> 10% ·{' '}
              <Box component="span" sx={{ color: DIMENSIONES.SAB.color, fontWeight:800 }}>Saber</Box> 40% ·{' '}
              <Box component="span" sx={{ color: DIMENSIONES.HAC.color, fontWeight:800 }}>Hacer</Box> 45% ·{' '}
              Nota mínima aprobación: <Box component="span" fontWeight={800}>51</Box>
            </Typography>
          </Box>

          {/* Selector período */}
          <Box sx={{ mt:2.5, pt:2.5, borderTop:`1px solid ${isDark ? alpha('#fff', .06) : alpha('#000', .05)}`, position:'relative', zIndex:1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb:1, display:'block' }}>
              Trimestre
            </Typography>
            <SelectorPeriodo
              periodos={periodos}
              periodoActivo={periodoActivo}
              onChange={setPeriodoActivo}
              isLoading={loadingPeriodos}
              isDark={isDark}
            />
          </Box>
        </Box>
      </Fade>

      {/* ── Resumen ─────────────────────────────────────────── */}
      {isLoading ? (
        <Grid container spacing={1.5} sx={{ mb:3 }}>
          {[1,2,3,4].map(i => <Grid key={i} size={{ xs:6, sm:3 }}><Skeleton variant="rounded" height={80} sx={{ borderRadius:3 }} /></Grid>)}
        </Grid>
      ) : boletin.length > 0 && (
        <Fade in>
          <Grid container spacing={1.5} sx={{ mb:3 }}>
            {[
              { label:'Aprobadas',  value:aprobadas,  color:'#10B981', gradient:'linear-gradient(135deg,#10B981,#34D399)' },
              { label:'Reprobadas', value:reprobadas, color:'#EF4444', gradient:'linear-gradient(135deg,#EF4444,#F87171)' },
              { label:'Sin nota',   value:sinNota,    color:'#6B7280', gradient:'linear-gradient(135deg,#6B7280,#9CA3AF)' },
              { label:'Promedio',   value: promedio != null ? `${promedio}` : '—', color:'#3B82F6', gradient:'linear-gradient(135deg,#3B82F6,#60A5FA)' },
            ].map((s, i) => (
              <Grid key={s.label} size={{ xs:6, sm:3 }}>
                <Card sx={{
                  borderRadius:3, animation:`${fadeUp} .4s ease-out ${i * .07}s both`,
                  border:`1px solid ${alpha(s.color, .2)}`,
                  background: isDark ? alpha(s.color, .1) : alpha(s.color, .05),
                  '&::before':{ content:'""', display:'block', height:'3px', background:s.gradient },
                }}>
                  <CardContent sx={{ p:2, textAlign:'center' }}>
                    <Typography variant="h4" fontWeight={900} sx={{ background:s.gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{s.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* ── Lista materias ──────────────────────────────────── */}
      {isLoading ? (
        <Stack spacing={1.5}>
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius:3 }} />)}
        </Stack>
      ) : !periodoActivo || boletin.length === 0 ? (
        <Box sx={{
          textAlign:'center', py:8, borderRadius:3,
          background: isDark ? alpha('#fff', .02) : alpha('#000', .02),
          border:`2px dashed ${isDark ? alpha('#fff', .08) : alpha('#000', .08)}`,
        }}>
          <SchoolIcon sx={{ fontSize:48, color:'text.disabled', mb:2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            {periodoActivo ? 'No hay notas registradas para este trimestre' : 'Seleccioná un trimestre para ver tus notas'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Las notas aparecerán cuando el docente las registre y publique
          </Typography>
        </Box>
      ) : (
        <Fade in>
          <Stack spacing={1.5}>
            {boletin.map((item, i) => (
              <TarjetaMateria
                key={item.materia_codigo}
                item={item}
                grado_materia_id={gradoMateriaMap.get(item.materia_codigo)}
                periodo_evaluacion_id={periodoActivo!}
                index={i}
                cache={cache}
                onCargado={handleCargado}
              />
            ))}
          </Stack>
        </Fade>
      )}
    </Box>
  );
};

export default EstudianteCalificaciones;