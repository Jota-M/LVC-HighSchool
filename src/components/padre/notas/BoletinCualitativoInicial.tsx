// components/padre/notas/BoletinCualitativoInicial.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Stack,
  Chip, Divider, Paper, useTheme, alpha, Button,
  Tooltip, Alert, IconButton, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { SvgIconProps } from '@mui/material/SvgIcon';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';

import { inicialService } from '@/services/inicialService';
import type { InformeCualitativo, NivelLogro } from '@/types/inicialTypes';

// ──────────────────────────────────────────────
// ANIMACIONES (IDÉNTICAS A SECUNDARIA/PRIMARIA)
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fillBar = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

interface CotejoItem {
  campo_id: number;
  campo_codigo: string;
  campo_nombre: string;
  indicador_id: number;
  indicador_descripcion: string;
  indicador_orden: number;
  cotejo_id: number | null;
  observaciones: string | null;
  nivel_id: number | null;
  nivel_codigo: string | null;
  nivel_nombre: string | null;
  nivel_color: string | null;
}

interface Props {
  matriculaId: number;
  periodoId: number;
  periodoNombre?: string;
  estudianteNombre?: string;
  gradoNombre?: string;
}

const CAMPO_COLORS: Record<string, { main: string; grad: string; lightBg: string }> = {
  'INI-COM': { main: '#ec4899', grad: 'linear-gradient(135deg, #ec4899, #db2777)', lightBg: 'rgba(236, 72, 153, 0.12)' },
  'INI-CON': { main: '#3b82f6', grad: 'linear-gradient(135deg, #3b82f6, #2563eb)', lightBg: 'rgba(59, 130, 246, 0.12)' },
  'INI-BIO': { main: '#10b981', grad: 'linear-gradient(135deg, #10b981, #059669)', lightBg: 'rgba(16, 185, 129, 0.12)' },
  'INI-SOC': { main: '#f59e0b', grad: 'linear-gradient(135deg, #f59e0b, #d97706)', lightBg: 'rgba(245, 158, 11, 0.12)' },
};

// ──────────────────────────────────────────────
// STAT CARD (IDÉNTICO A BOLETINNOTAS DE SECUNDARIA)
// ──────────────────────────────────────────────

interface StatCardData {
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<{ stat: StatCardData; index: number }> = ({ stat, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        animation: `${fadeUp} 0.4s ease-out ${index * 0.07}s both`,
        border: `1px solid ${alpha(stat.color, 0.25)}`,
        background: isDark
          ? `linear-gradient(155deg, ${alpha(stat.color, 0.18)} 0%, ${alpha(stat.color, 0.04)} 55%, transparent 100%)`
          : `linear-gradient(155deg, ${alpha(stat.color, 0.1)} 0%, #fff 60%)`,
        boxShadow: `0 4px 18px ${alpha(stat.color, isDark ? 0.18 : 0.1)}`,
        transition: 'all 0.25s ease',
        '&::before': { content: '""', display: 'block', height: '3px', background: stat.gradient },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 26px ${alpha(stat.color, isDark ? 0.28 : 0.2)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          bottom: -14,
          opacity: isDark ? 0.1 : 0.06,
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          color: stat.color,
          '& .MuiSvgIcon-root': { fontSize: 110 },
        }}
      >
        {stat.icon}
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, position: 'relative' }}>
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            fontSize: { xs: 10, sm: 11 },
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: alpha(stat.color, 0.9),
            mb: 1.25,
          }}
        >
          {stat.label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: stat.gradient,
              boxShadow: `0 4px 14px ${alpha(stat.color, 0.45)}`,
            }}
          >
            {React.cloneElement(stat.icon as React.ReactElement<SvgIconProps>, {
              sx: {
                color: '#fff',
                fontSize: 24,
              },
            })}
          </Box>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              fontSize: { xs: '2.3rem', sm: '2.65rem' },
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: stat.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {stat.value}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: 13, lineHeight: 1.4 }}>
          {stat.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// CONTENEDOR DE CAMPO DE SABERES (IDÉNTICO A TARJETAMATERIA)
// Muestra las calificaciones cualitativas en texto plano
// ──────────────────────────────────────────────

interface TarjetaCampoProps {
  campo: { campo_nombre: string; campo_codigo: string; items: CotejoItem[] };
  index: number;
  forzarExpandido?: boolean | null;
}

const TarjetaCampo: React.FC<TarjetaCampoProps> = ({ campo, index, forzarExpandido }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandido, setExpandido] = useState(index === 0);
  const [vista, setVista] = useState<0 | 1>(0);

  // Sincronizar si el padre fuerza expandir/colapsar todos
  useEffect(() => {
    if (forzarExpandido !== null && forzarExpandido !== undefined) {
      setExpandido(forzarExpandido);
    }
  }, [forzarExpandido]);

  const cfg = CAMPO_COLORS[campo.campo_codigo] || {
    main: '#3b82f6',
    grad: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    lightBg: 'rgba(59, 130, 246, 0.12)'
  };

  const totalItems = campo.items.length;
  const evaluados = campo.items.filter(i => i.nivel_codigo).length;
  const plenosOptimos = campo.items.filter(i => i.nivel_codigo === 'DP' || i.nivel_codigo === 'DO').length;
  const enDesarrollo = campo.items.filter(i => i.nivel_codigo === 'ED' || i.nivel_codigo === 'DA').length;
  const pct = totalItems > 0 ? Math.round((plenosOptimos / totalItems) * 100) : 0;

  const estadoLabel = pct >= 80 ? 'Desarrollo Pleno' : pct >= 50 ? 'Desarrollo Óptimo' : 'En Proceso';
  const estadoColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';

  return (
    <Card
      sx={{
        borderRadius: 3,
        animation: `${fadeUp} 0.4s ease-out ${index * 0.06}s both`,
        overflow: 'hidden',
        border: `1px solid ${alpha(cfg.main, expandido ? 0.4 : 0.18)}`,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(cfg.main, 0.1)} 0%, ${alpha(cfg.main, 0.03)} 100%)`
          : `linear-gradient(145deg, ${alpha(cfg.main, 0.05)} 0%, #fff 100%)`,
        transition: 'all 0.25s ease',
        boxShadow: expandido ? `0 8px 28px ${alpha(cfg.main, 0.25)}` : `0 2px 10px ${alpha(cfg.main, 0.08)}`,
        '&:hover': {
          boxShadow: `0 10px 30px ${alpha(cfg.main, 0.3)}`,
          transform: 'translateY(-2px)',
        },
        '&::before': { content: '""', display: 'block', height: '3px', background: cfg.grad },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: expandido ? 1.5 : 2.5 }}>
        {/* Cabecera clickeable — idéntica a TarjetaMateria */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, cursor: 'pointer' }}
          onClick={() => setExpandido(p => !p)}
        >
          {/* Badge del porcentaje/logro */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: cfg.grad,
              boxShadow: `0 6px 18px ${alpha(cfg.main, 0.45)}`,
              transition: 'transform 0.25s ease',
              '.MuiCard-root:hover &': { transform: 'scale(1.05)' },
            }}
          >
            <Typography variant="h5" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
              {pct}%
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.9), fontSize: 9, fontWeight: 800 }}>
              LOGRO
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body1" fontWeight={800} noWrap>
                {campo.campo_nombre}
              </Typography>
              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                label={estadoLabel}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor: alpha(estadoColor, isDark ? 0.2 : 0.12),
                  color: estadoColor,
                  border: `1px solid ${alpha(estadoColor, 0.3)}`,
                  borderRadius: 1.5,
                  '& .MuiChip-icon': { color: estadoColor },
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              {evaluados} de {totalItems} indicadores observados · {plenosOptimos} pleno/óptimo · {enDesarrollo} en proceso
            </Typography>

            {/* Barra de progreso animada */}
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06), overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 3,
                  background: cfg.grad,
                  boxShadow: `0 0 8px ${alpha(cfg.main, 0.5)}`,
                  transformOrigin: 'left',
                  animation: `${fillBar} 0.8s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s both`,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
            <IconButton
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: alpha(cfg.main, isDark ? 0.15 : 0.08),
                '&:hover': { bgcolor: alpha(cfg.main, isDark ? 0.25 : 0.15) }
              }}
            >
              {expandido ? <ExpandLessIcon sx={{ fontSize: 18, color: cfg.main }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: cfg.main }} />}
            </IconButton>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, fontWeight: 700 }}>
              {expandido ? 'cerrar' : 'ver notas'}
            </Typography>
          </Box>
        </Box>

        {/* Sección expandible: TABLA DE EVALUACIÓN CUALITATIVA EN TEXTO PLANO */}
        <Collapse in={expandido}>
          <Divider sx={{ my: 2, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />

          {/* Selector de vista interno */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 2.5, bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03), border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`, width: 'fit-content', mb: 2 }}>
            {[
              { icon: <ViewListIcon sx={{ fontSize: 14 }} />, label: 'Todos los indicadores' },
              { icon: <AccountTreeIcon sx={{ fontSize: 14 }} />, label: 'Solo evaluados' },
            ].map((tab, i) => (
              <Box
                key={i}
                onClick={() => setVista(i as 0 | 1)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  ...(vista === i
                    ? { bgcolor: isDark ? alpha(cfg.main, 0.2) : alpha(cfg.main, 0.12), color: cfg.main, boxShadow: `0 2px 8px ${alpha(cfg.main, 0.2)}` }
                    : { color: 'text.secondary', '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) } }),
                }}
              >
                {tab.icon}{tab.label}
              </Box>
            ))}
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
              background: isDark ? alpha('#fff', 0.02) : '#fafafa'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, fontSize: 11, color: 'text.secondary', py: 1.25, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02), borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` } }}>
                  <TableCell>Indicador de Desarrollo Integral</TableCell>
                  <TableCell align="center">Calificación Cualitativa</TableCell>
                  <TableCell>Observaciones Pedagógicas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campo.items
                  .filter(ind => (vista === 1 ? !!ind.nivel_codigo : true))
                  .map((ind, i) => (
                    <TableRow
                      key={ind.indicador_id || i}
                      sx={{
                        animation: `${fadeUp} 0.3s ease-out ${i * 0.03}s both`,
                        '& td': { fontSize: 13, py: 1.2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` },
                        '&:last-child td': { borderBottom: 'none' },
                        '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
                      }}
                    >
                      <TableCell sx={{ minWidth: 260 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, lineHeight: 1.4 }}>
                          {ind.indicador_descripcion}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ width: 140 }}>
                        {ind.nivel_codigo ? (
                          <Chip
                            size="small"
                            label={`${ind.nivel_codigo} • ${ind.nivel_nombre || 'Registrado'}`}
                            sx={{
                              height: 22,
                              fontSize: 10.5,
                              fontWeight: 900,
                              bgcolor: ind.nivel_color || '#3b82f6',
                              color: '#fff',
                              borderRadius: 1.5,
                              boxShadow: `0 2px 8px ${alpha(ind.nivel_color || '#3b82f6', 0.4)}`,
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="En Proceso"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 700,
                              borderColor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                              color: 'text.secondary',
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="caption" sx={{ color: ind.observaciones ? 'text.primary' : 'text.disabled', fontStyle: ind.observaciones ? 'normal' : 'italic' }}>
                          {ind.observaciones || 'Sin observaciones adicionales'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// Calificaciones Cualitativas en Contenedores de Texto Plano
// ──────────────────────────────────────────────

export default function BoletinCualitativoInicial({
  matriculaId,
  periodoId,
  periodoNombre = 'Primer Trimestre',
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Tokens de marca compartidos con Secundaria/Primaria
  const primary = isDark ? '#facc15' : '#0288d1';
  const primaryEnd = isDark ? '#f59e0b' : '#01579b';
  const primaryGrad = `linear-gradient(135deg, ${primary}, ${primaryEnd})`;

  const [loading, setLoading] = useState(true);
  const [expandirTodos, setExpandirTodos] = useState<boolean | null>(null);

  const [informe, setInforme] = useState<InformeCualitativo | null>(null);
  const [cotejos, setCotejos] = useState<CotejoItem[]>([]);
  const [niveles, setNiveles] = useState<NivelLogro[]>([]);

  const cargarDatos = useCallback(async () => {
    if (!matriculaId || !periodoId) return;
    setLoading(true);
    try {
      const [infRes, cotRes, nivRes] = await Promise.allSettled([
        inicialService.getInforme(matriculaId, periodoId),
        inicialService.getCotejoEstudiante(matriculaId, periodoId),
        inicialService.getNivelesLogro(),
      ]);

      if (infRes.status === 'fulfilled') {
        setInforme(infRes.value);
      } else {
        console.warn('No se pudo obtener el informe cualitativo:', infRes.reason);
      }

      if (cotRes.status === 'fulfilled') {
        setCotejos(cotRes.value || []);
      } else {
        console.warn('No se pudo obtener la lista de cotejo:', cotRes.reason);
      }

      if (nivRes.status === 'fulfilled') {
        setNiveles(nivRes.value || []);
      } else {
        console.warn('No se pudo obtener los niveles de logro:', nivRes.reason);
      }
    } catch (err) {
      console.error('Error general al cargar datos cualitativos:', err);
    } finally {
      setLoading(false);
    }
  }, [matriculaId, periodoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Agrupamiento por campos de saberes
  const camposMap = useMemo(() => {
    const map = new Map<string, { campo_nombre: string; campo_codigo: string; items: CotejoItem[] }>();
    cotejos.forEach(item => {
      const code = item.campo_codigo || 'GENERAL';
      if (!map.has(code)) {
        map.set(code, {
          campo_nombre: item.campo_nombre,
          campo_codigo: code,
          items: []
        });
      }
      map.get(code)!.items.push(item);
    });
    return map;
  }, [cotejos]);

  const camposArray = useMemo(() => Array.from(camposMap.values()), [camposMap]);

  // Cálculos estadísticos cualitativos para las StatCards
  const totalIndicadores = cotejos.length;
  const evaluados = cotejos.filter(c => c.nivel_codigo).length;
  const plenosOptimos = cotejos.filter(c => c.nivel_codigo === 'DP' || c.nivel_codigo === 'DO').length;
  const enDesarrollo = cotejos.filter(c => c.nivel_codigo === 'ED' || c.nivel_codigo === 'DA').length;
  const sinNota = cotejos.filter(c => !c.nivel_codigo).length;
  const pctGlobal = totalIndicadores > 0 ? Math.round((plenosOptimos / totalIndicadores) * 100) : 0;

  const stats: StatCardData[] = [
    {
      label: 'Desarrollo Pleno',
      value: plenosOptimos,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      subtitle: `${plenosOptimos} de ${totalIndicadores} indicadores con desarrollo pleno u óptimo`,
      icon: <CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'En Proceso',
      value: enDesarrollo,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      subtitle: enDesarrollo > 0 ? `${enDesarrollo} indicadores en proceso de fortalecimiento` : 'Sin indicadores en rezago este trimestre',
      icon: <StarRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Por Valorar',
      value: sinNota,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      subtitle: sinNota > 0 ? `${sinNota} indicadores en observación pedagógica` : 'Todos los indicadores han sido evaluados',
      icon: <HourglassEmptyRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />,
    },
    {
      label: 'Avance General',
      value: `${pctGlobal}%`,
      color: primary,
      gradient: primaryGrad,
      subtitle: `Desarrollo Integral Global (${evaluados}/${totalIndicadores} observados)`,
      icon: <BarChartRoundedIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 22 }} />,
    },
  ];

  if (loading) {
    return (
      <Stack spacing={2}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3, mb: 2 }} />
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Box>
      {/* ── 1. STAT CARDS (IDÉNTICAS A SECUNDARIA/PRIMARIA) ── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
            <StatCard stat={stat} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* ── 2. CONTENEDOR: INFORME CUALITATIVO NARRATIVO DESCRIPTIVO (TEXTO PLANO) ── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          background: isDark
            ? `linear-gradient(145deg, ${alpha('#fff', 0.04)} 0%, ${alpha('#fff', 0.01)} 100%)`
            : '#ffffff',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <CardContent sx={{ p: 2.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: alpha(primary, 0.15),
                  color: primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  Informe Pedagógico Cualitativo Descriptivo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Apreciación diagnóstica y formativa de la maestra de aula · {periodoNombre}
                </Typography>
              </Box>
            </Box>

            <Chip
              size="small"
              icon={informe?.estado === 'publicado' ? <CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} /> : <SchoolRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label={informe?.estado === 'publicado' ? 'Publicado Oficialmente' : 'En Evaluación Continua'}
              color={informe?.estado === 'publicado' ? 'success' : 'warning'}
              sx={{ fontWeight: 800, height: 24, fontSize: 11 }}
            />
          </Box>

          {informe?.texto ? (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: isDark ? alpha(primary, 0.08) : alpha(primary, 0.04),
                borderLeft: `4px solid ${primary}`,
                color: isDark ? '#f1f5f9' : '#1e293b',
                lineHeight: 1.7,
                fontSize: '0.98rem',
                fontStyle: 'italic',
              }}
            >
              "{informe.texto}"
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              La educadora de aula está completando la valoración del desarrollo socioafectivo y cognitivo para este periodo.
            </Alert>
          )}

          {informe?.observaciones_docente && (
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`
              }}
            >
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                Observaciones Adicionales de la Educadora:
              </Typography>
              <Typography variant="body2" color="text.primary">
                {informe.observaciones_docente}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── 3. CABECERA DE CAMPOS DE SABERES CON ESCALA Y CONTROLES ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolRoundedIcon sx={{ fontSize: 18, color: primary }} />
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Campos de Saberes y Áreas de Desarrollo Integral ({camposArray.length})
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="text"
            startIcon={expandirTodos === true ? <UnfoldLessRoundedIcon sx={{ fontSize: 16 }} /> : <UnfoldMoreRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setExpandirTodos(prev => (prev === true ? false : true))}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: primary,
              borderRadius: 2,
              px: 1.5,
              py: 0.25,
            }}
          >
            {expandirTodos === true ? 'Colapsar todos' : 'Expandir todos'}
          </Button>
        </Stack>
      </Box>

      {/* Escala oficial badges informativas */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 11 }}>
          Escala de Valoración:
        </Typography>
        {niveles.map(n => (
          <Tooltip key={n.id} title={n.descripcion} arrow>
            <Chip
              size="small"
              label={`${n.codigo} • ${n.nombre}`}
              sx={{
                bgcolor: alpha(n.color || '#3b82f6', isDark ? 0.2 : 0.1),
                color: n.color || '#3b82f6',
                border: `1px solid ${alpha(n.color || '#3b82f6', 0.35)}`,
                fontWeight: 800,
                fontSize: 10.5,
                height: 22,
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* ── 4. CONTENEDORES POR CAMPOS DE SABERES (IDÉNTICOS A TARJETAMATERIA) ── */}
      {camposArray.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, borderRadius: 3, background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` }}>
          <SchoolRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Aún no se han registrado indicadores de lista de cotejo para este trimestre
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Las calificaciones e indicadores cualitativos aparecerán a medida que la educadora registre el seguimiento
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {camposArray.map((campo, i) => (
            <TarjetaCampo
              key={campo.campo_codigo || i}
              campo={campo}
              index={i}
              forzarExpandido={expandirTodos}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
