'use client';
// app/dashboard/docente/notas/[id]/nueva/page.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Stack, Chip, Button, IconButton, Switch,
  FormControlLabel, Divider, LinearProgress, Tooltip,
  CircularProgress, Alert, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import EditorPreguntasExamen from '@/components/docente/notas/EditorPreguntasExamen';
import type { PreguntaExamen } from '@/types/examenTypes';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMisMateriasNotas, useDimensiones, useEvaluaciones, useTemario } from '@/hooks/useNotas';
import {
  MateriaDocenteNotas, Evaluacion, CrearEvaluacionDTO, ActualizarEvaluacionDTO,
  CriterioRubrica, TIPOS_EVALUACION, DIMENSIONES_CONFIG,
  DIMENSIONES_ORDEN, CodigoDimension,
  TIPOS_POR_DIMENSION, PREGUNTAS_AUTOEVALUACION, generarNombreDefault,
} from '@/types/notasTypes';
import { evaluacionesService, rubricaService, adjuntosService } from '@/services/notasService';
import { PanelTareasInicial } from '@/components/docente/inicial/PanelTareasInicial';
import { examenService } from '@/services/examenService';
import { toast } from 'react-hot-toast';

// ─── Pesos y consejos por dimensión ──────────────────────────────────────────
const PESOS_CONFIG: { key: CodigoDimension; label: string; pct: number; color: string }[] = [
  { key: 'SER', label: 'Ser', pct: 10, color: '#f59e0b' },
  { key: 'SAB', label: 'Saber', pct: 40, color: '#3b82f6' },
  { key: 'HAC', label: 'Hacer', pct: 45, color: '#10b981' },
  { key: 'AUT', label: 'Autoevaluación', pct: 5, color: '#a855f7' },
];

const getConsejoDimension = (dim: CodigoDimension) => {
  switch (dim) {
    case 'SER':
      return 'Las evaluaciones de Ser no requieren nota numérica. Podés registrar solo observaciones de actitud y convivencia para el reporte de padres.';
    case 'SAB':
      return 'Las evaluaciones de Saber evalúan conocimientos y teoría (40%). Podés programar un examen virtual con IA o vincular una rúbrica presencial.';
    case 'HAC':
      return 'El Hacer representa el 45% del promedio. Ideal para prácticas de laboratorio, talleres, proyectos y trabajos grupales evaluados con rúbrica.';
    case 'AUT':
      return 'La Autoevaluación (5%) fomenta la autoreflexión guiada del estudiante sobre sus avances, dificultades y metas en el trimestre.';
    default:
      return '';
  }
};

const formatearFecha = (f?: string) => {
  if (!f) return 'Sin definir';
  try {
    const parts = f.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return f;
  } catch {
    return f;
  }
};

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity:0; transform:scale(0.96); }
  to   { opacity:1; transform:scale(1); }
`;
const bounceIcon = keyframes`
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-5px); }
`;

// ─── Paleta ───────────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cardSx = (isDark: boolean) => ({
  borderRadius: '16px',
  border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
  overflow: 'hidden',
});

const inputSx = (accentColor: string) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '0.975rem',
    minHeight: '48px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: accentColor,
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(accentColor, 0.45),
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: accentColor,
    fontWeight: 600,
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.825rem',
  },
});

// ─── Sección header reutilizable ──────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent: string;
  isDark: boolean;
}> = ({ icon, title, subtitle, accent, isDark }) => (
  <Box sx={{
    px: 2.5, py: 2,
    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.7),
    display: 'flex', alignItems: 'center', gap: 1.5,
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
      bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: accent,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

// ─── Editor de rúbrica ────────────────────────────────────────────────────────
const EditorRubrica: React.FC<{
  criterios: CriterioRubrica[];
  puntajeMaximo: number;
  accentColor: string;
  onChange: (c: CriterioRubrica[]) => void;
}> = ({ criterios, puntajeMaximo, accentColor, onChange }) => {
  const { isDark } = usePalette();
  const suma = criterios.reduce((s, c) => s + Number(c.puntos_posibles || 0), 0);
  const excede = suma > puntajeMaximo;
  const noAlcanza = criterios.length > 0 && suma < puntajeMaximo;
  const coincide = criterios.length > 0 && Math.round(suma * 100) === Math.round(puntajeMaximo * 100);
  const pct = puntajeMaximo > 0 ? Math.min((suma / puntajeMaximo) * 100, 100) : 0;

  const agregar = () => onChange([...criterios, { orden: criterios.length + 1, criterio: '', puntos_posibles: 0 }]);
  const upd = (i: number, k: keyof CriterioRubrica, v: any) => {
    const cp = [...criterios]; (cp[i] as any)[k] = v; onChange(cp);
  };
  const del = (i: number) =>
    onChange(criterios.filter((_, j) => j !== i).map((c, j) => ({ ...c, orden: j + 1 })));

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Barra de suma */}
      <Box sx={{
        p: 1.5, borderRadius: '10px', mb: 2,
        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8f9fa', 0.8),
        border: `1px solid ${excede ? alpha('#dc2626', 0.3) : noAlcanza ? alpha('#f59e0b', 0.3) : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
          <Typography variant="caption" color="text.secondary">Suma de criterios</Typography>
          <Typography variant="caption" fontWeight={700}
            sx={{ color: excede ? '#dc2626' : (noAlcanza ? '#f59e0b' : '#16a34a') }}>
            {suma} / {puntajeMaximo} pts
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={pct}
          sx={{
            height: 5, borderRadius: 4,
            bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
            '& .MuiLinearProgress-bar': {
              background: excede
                ? '#dc2626'
                : noAlcanza
                  ? '#f59e0b'
                  : `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
              borderRadius: 4,
            },
          }}
        />
        {excede && (
          <Typography variant="caption" sx={{ color: '#dc2626', mt: 0.5, display: 'block', fontWeight: 600 }}>
            ⚠️ La suma de criterios ({suma} pts) supera el puntaje máximo ({puntajeMaximo} pts).
          </Typography>
        )}
        {noAlcanza && (
          <Typography variant="caption" sx={{ color: '#f59e0b', mt: 0.5, display: 'block', fontWeight: 600 }}>
            ⚠️ Faltan {(puntajeMaximo - suma).toFixed(1)} pts para completar el puntaje máximo ({puntajeMaximo} pts).
          </Typography>
        )}
        {coincide && (
          <Typography variant="caption" sx={{ color: '#16a34a', mt: 0.5, display: 'block', fontWeight: 600 }}>
            ✓ La suma de los criterios coincide exactamente con el puntaje máximo ({puntajeMaximo} pts).
          </Typography>
        )}
      </Box>

      <Stack spacing={1}>
        {criterios.map((c, i) => (
          <Box key={i} sx={{
            display: 'flex', gap: 1, alignItems: 'center',
            p: 1.2, borderRadius: '10px',
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
            animation: `${fadeUp} 0.2s ease-out`,
          }}>
            <Box sx={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              bgcolor: alpha(accentColor, 0.15),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: accentColor,
            }}>
              {i + 1}
            </Box>
            <TextField
              placeholder={`Criterio ${i + 1}...`}
              value={c.criterio}
              onChange={e => upd(i, 'criterio', e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', fontSize: '0.95rem', height: 44,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                },
              }}
            />
            <TextField
              type="number" placeholder="Pts"
              value={c.puntos_posibles || ''}
              onChange={e => upd(i, 'puntos_posibles', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.5 }}
              sx={{
                width: 86,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', fontSize: '0.95rem', height: 44,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                },
              }}
            />
            <IconButton onClick={() => del(i)}
              sx={{ color: isDark ? alpha('#fff', 0.25) : '#d1d5db', p: 1, '&:hover': { color: '#dc2626' } }}>
              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Button
        startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />} onClick={agregar}
        sx={{ mt: 2, px: 2.5, py: 1, textTransform: 'none', fontWeight: 700, fontSize: 13.5, color: accentColor, borderRadius: '10px', border: `1px solid ${alpha(accentColor, 0.3)}`, '&:hover': { bgcolor: alpha(accentColor, 0.08) } }}
      >
        Agregar criterio
      </Button>
    </Box>
  );
};

// ─── Vista de detalle post-creación ───────────────────────────────────────────
const DetalleEvaluacion: React.FC<{
  evaluacion: Evaluacion;
  materia: MateriaDocenteNotas;
  onNueva: () => void;
  onVolver: () => void;
}> = ({ evaluacion, materia, onNueva, onVolver }) => {
  const { isDark, gold, gradBg } = usePalette();
  const codigo = evaluacion.dimension_codigo as CodigoDimension;
  const cfg = DIMENSIONES_CONFIG[codigo] ?? DIMENSIONES_CONFIG['SAB'];
  const tipo = TIPOS_EVALUACION.find(t => t.value === evaluacion.tipo);

  const filas = [
    { label: 'Materia', value: materia.materia_nombre },
    { label: 'Grado', value: `${materia.grado_nombre} "${materia.paralelo_nombre}"` },
    { label: 'Trimestre', value: materia.trimestre_nombre ?? '—' },
    { label: 'Dimensión', value: `${cfg.label} (${cfg.porcentaje}%)` },
    { label: 'Tipo', value: codigo === 'SER' ? '⭐ General (Actitudinal)' : codigo === 'AUT' ? '🟣 Autoevaluación' : tipo ? `${tipo.icon} ${tipo.label}` : '—' },
    { label: 'Puntaje máx', value: `${evaluacion.puntaje_maximo} pts` },
    { label: 'Peso', value: evaluacion.peso_en_dimension ?? '—' },
    { label: 'Modalidad', value: evaluacion.modalidad === 'virtual' ? '🌐 Virtual (Examen en línea)' : '📝 Presencial' },
    { label: 'Visible', value: evaluacion.visible_para_padres ? 'Sí, publicada' : 'No publicada' },
    ...(evaluacion.tema_titulo
      ? [{ label: 'Tema', value: `${evaluacion.unidad_titulo ? `U${evaluacion.numero_unidad} · ` : ''}T${evaluacion.numero_tema} — ${evaluacion.tema_titulo}` }]
      : []
    ),
  ];

  return (
    <Fade in timeout={500}>
      <Box sx={{ animation: `${scaleIn} 0.4s ease-out` }}>

        {/* Éxito banner */}
        <Box sx={{
          borderRadius: '16px', mb: 3, p: 2.5,
          background: `linear-gradient(135deg, ${alpha('#16a34a', isDark ? 0.2 : 0.08)} 0%, ${alpha('#16a34a', isDark ? 0.06 : 0.02)} 100%)`,
          border: `1.5px solid ${alpha('#16a34a', 0.3)}`,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 32, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#16a34a', lineHeight: 1.2 }}>
              ¡Evaluación creada exitosamente!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ya podés calificarla desde la pantalla de evaluaciones.
            </Typography>
          </Box>
        </Box>

        {/* Tarjeta principal */}
        <Box sx={cardSx(isDark)}>
          {/* Header con color de dimensión */}
          <Box sx={{
            px: 2.5, py: 2.5,
            background: `linear-gradient(135deg, ${alpha(cfg.color, isDark ? 0.2 : 0.1)} 0%, ${alpha(cfg.color, isDark ? 0.06 : 0.03)} 100%)`,
            borderBottom: `1.5px solid ${alpha(cfg.color, 0.2)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                  bgcolor: alpha(cfg.color, isDark ? 0.25 : 0.18),
                  border: `1.5px solid ${alpha(cfg.color, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AssignmentRoundedIcon sx={{ color: cfg.color, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {evaluacion.nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={cfg.label} size="small"
                      sx={{ bgcolor: alpha(cfg.color, 0.15), color: cfg.color, fontWeight: 700, fontSize: 11 }} />
                    {codigo === 'SER' ? (
                      <Chip label="⭐ General" size="small"
                        sx={{ fontSize: 11, bgcolor: isDark ? alpha(cfg.color, 0.18) : alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 700 }} />
                    ) : tipo ? (
                      <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
                        sx={{ fontSize: 11, bgcolor: isDark ? alpha('#fff', 0.08) : '#f0f0f0' }} />
                    ) : null}
                    {evaluacion.tema_titulo && (
                      <Chip
                        icon={<BookmarkRoundedIcon sx={{ fontSize: '11px !important', color: `${alpha(cfg.color, 0.8)} !important` }} />}
                        label={evaluacion.tema_titulo}
                        size="small"
                        sx={{ bgcolor: alpha(cfg.color, 0.1), color: cfg.color, fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                    {evaluacion.visible_para_padres && (
                      <Chip
                        icon={<VisibilityRoundedIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
                        label="Publicada"
                        size="small"
                        sx={{ bgcolor: alpha('#16a34a', 0.12), color: '#16a34a', fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Stats rápidos */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[
                  { icon: <ScaleRoundedIcon sx={{ fontSize: 16 }} />, label: 'Puntaje', value: `${evaluacion.puntaje_maximo} pts` },
                  { icon: <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />, label: 'Fecha', value: evaluacion.fecha ?? 'Sin fecha' },
                  { icon: <GroupsRoundedIcon sx={{ fontSize: 16 }} />, label: 'Estudiantes', value: `${materia.total_estudiantes}` },
                ].map(stat => (
                  <Box key={stat.label} sx={{
                    px: 1.5, py: 1, borderRadius: '10px', textAlign: 'center', minWidth: 72,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#fff', 0.7),
                    border: `1px solid ${alpha(cfg.color, 0.2)}`,
                  }}>
                    <Box sx={{ color: cfg.color, display: 'flex', justifyContent: 'center', mb: 0.3 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Tabla de detalles */}
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 0,
              borderRadius: '10px',
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              overflow: 'hidden',
            }}>
              {filas.map((f, i) => (
                <Box key={f.label} sx={{
                  px: 2, py: 1.2,
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
                  borderRight: i % 2 === 0
                    ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`
                    : 'none',
                  bgcolor: i % 2 === 0
                    ? (isDark ? alpha('#fff', 0.01) : alpha('#f8f9fa', 0.5))
                    : 'transparent',
                  display: 'flex', flexDirection: 'column', gap: 0.2,
                }}>
                  <Typography variant="caption" color="text.disabled"
                    sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>
                    {f.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                    {f.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Instrucciones / descripción */}
          {(evaluacion.instrucciones || evaluacion.descripcion) && (
            <>
              <Divider sx={{ mx: 2.5, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
              <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {evaluacion.instrucciones && (
                  <Box>
                    <Typography variant="caption" color="text.disabled"
                      sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>
                      Instrucciones para padres
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.6 }}>
                      {evaluacion.instrucciones}
                    </Typography>
                  </Box>
                )}
                {evaluacion.descripcion && (
                  <Box>
                    <Typography variant="caption" color="text.disabled"
                      sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>
                      Descripción interna
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.6 }}>
                      {evaluacion.descripcion}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Adjuntos */}
          {(evaluacion.foto_url || evaluacion.pdf_url) && (
            <>
              <Divider sx={{ mx: 2.5, borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography variant="caption" color="text.disabled"
                  sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600, mb: 1.2, display: 'block' }}>
                  Adjuntos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {evaluacion.foto_url && (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                      borderRadius: '10px', border: `1px solid ${alpha(gold, 0.3)}`,
                      bgcolor: alpha(gold, isDark ? 0.08 : 0.04),
                    }}>
                      <ImageRoundedIcon sx={{ fontSize: 16, color: gold }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: gold }}>Foto adjunta</Typography>
                    </Box>
                  )}
                  {evaluacion.pdf_url && (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                      borderRadius: '10px', border: `1px solid ${alpha('#dc2626', 0.3)}`,
                      bgcolor: alpha('#dc2626', isDark ? 0.08 : 0.04),
                    }}>
                      <PictureAsPdfRoundedIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: '#dc2626' }}>
                        {evaluacion.pdf_nombre ?? 'PDF adjunto'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={onVolver}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: alpha('#000', 0.15) }}>
            Ver todas las evaluaciones
          </Button>
          {evaluacion.modalidad === 'virtual' ? (
            <Button
              variant="contained"
              onClick={onVolver}
              startIcon={<ComputerRoundedIcon />}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                background: gradBg, color: isDark ? '#000' : '#fff'
              }}
            >
              Configurar Examen & Preguntas IA →
            </Button>
          ) : (
            <Box
              component="button" onClick={onNueva}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.8,
                px: 2.5, py: 1, borderRadius: '12px', border: 'none',
                background: gradBg, color: isDark ? '#000' : '#fff',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'opacity .15s, transform .15s',
                '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
              }}
            >
              + Crear otra evaluación
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

// ─── Selector de Unidad → Tema ────────────────────────────────────────────────
const SelectorTema: React.FC<{
  grado_materia_id: number;
  periodo_evaluacion_id: number;
  temaId: number | undefined;
  accentColor: string;
  isDark: boolean;
  onChange: (tema_id: number | undefined) => void;
}> = ({ grado_materia_id, periodo_evaluacion_id, temaId, accentColor, isDark, onChange }) => {
  const { unidades, isLoading } = useTemario(grado_materia_id, periodo_evaluacion_id);
  const [unidadSel, setUnidadSel] = useState<number | ''>('');

  useEffect(() => {
    if (!temaId) { setUnidadSel(''); return; }
    const unidad = unidades.find(u => u.temas.some(t => t.tema_id === temaId));
    if (unidad) setUnidadSel(unidad.id);
  }, [temaId, unidades]);

  if (!isLoading && unidades.length === 0) return null;

  const temasDeUnidad = unidades.find(u => u.id === unidadSel)?.temas ?? [];

  return (
    <Box sx={{
      p: 2, borderRadius: '12px',
      border: `1.5px solid ${isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.15)}`,
      bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
        <BookmarkRoundedIcon sx={{ fontSize: 14, color: accentColor }} />
        <Typography variant="caption" fontWeight={800}
          sx={{ color: accentColor, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Vincular a tema (opcional)
        </Typography>
        {isLoading && <CircularProgress size={10} sx={{ color: accentColor, ml: 0.5 }} />}
      </Box>

      <Stack spacing={2}>
        <FormControl fullWidth disabled={isLoading} sx={inputSx(accentColor)}>
          <InputLabel>Unidad temática</InputLabel>
          <Select
            value={unidadSel}
            label="Unidad temática"
            onChange={e => {
              const val = e.target.value as number | '';
              setUnidadSel(val);
              onChange(undefined);
            }}
          >
            <MenuItem value=""><em>Sin unidad</em></MenuItem>
            {unidades.map(u => (
              <MenuItem key={u.id} value={u.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box sx={{
                    width: 24, height: 24, borderRadius: '7px', flexShrink: 0,
                    bgcolor: alpha(accentColor, 0.15),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: accentColor,
                  }}>
                    {u.numero}
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>{u.titulo}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {unidadSel !== '' && (
          <Fade in timeout={200}>
            <FormControl fullWidth sx={inputSx(accentColor)}>
              <InputLabel>Tema</InputLabel>
              <Select
                value={temaId ?? ''}
                label="Tema"
                onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
              >
                <MenuItem value=""><em>Sin tema específico</em></MenuItem>
                {temasDeUnidad.map(t => (
                  <MenuItem key={t.tema_id} value={t.tema_id}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', width: '100%', gap: 2,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Box sx={{
                          width: 18, height: 18, borderRadius: '5px', flexShrink: 0,
                          bgcolor: alpha(accentColor, 0.12),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, color: accentColor,
                        }}>
                          {t.numero_tema}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: 13 }} noWrap>
                          {t.tema_titulo}
                        </Typography>
                      </Box>
                      {t.total_evaluaciones > 0 && (
                        <Chip
                          label={`${t.total_evaluaciones} ev.`} size="small"
                          sx={{
                            fontSize: 9, height: 16, flexShrink: 0,
                            bgcolor: alpha(accentColor, 0.12), color: accentColor,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Fade>
        )}

        {temaId && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.2, py: 0.8, borderRadius: '8px',
            bgcolor: alpha(accentColor, isDark ? 0.1 : 0.06),
            border: `1px solid ${alpha(accentColor, 0.2)}`,
          }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 13, color: accentColor, flexShrink: 0 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: accentColor, fontSize: 11 }}>
              Vinculada a:{' '}
              {temasDeUnidad.find(t => t.tema_id === temaId)?.tema_titulo ?? `Tema ${temaId}`}
            </Typography>
            <Box
              onClick={() => { onChange(undefined); setUnidadSel(''); }}
              sx={{ ml: 'auto', cursor: 'pointer', color: accentColor, display: 'flex', '&:hover': { opacity: 0.7 } }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function NuevaEvaluacionPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [asignacionId, periodoId] = String(params.id ?? '').split('-').map(Number);
  const evaluacionIdParam = searchParams.get('evaluacionId');
  const editId = evaluacionIdParam ? parseInt(evaluacionIdParam) : null;
  const isEditing = Boolean(editId);

  const { materias, isLoading: loadingMaterias } = useMisMateriasNotas();
  const { dimensiones, dimensionesConfig, dimensionesOrden } = useDimensiones();
  const { crear, actualizar, isSubmitting } = useEvaluaciones({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  });

  const seleccionada = materias.find(
    m => m.asignacion_id === asignacionId && m.periodo_evaluacion_id === periodoId,
  );

  // Helper para datetime-local
  const formatForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => (n < 10 ? '0' + n : String(n));
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [selectedDimCodigo, setSelectedDimCodigo] = useState<CodigoDimension | null>(
    (searchParams.get('dimension') as CodigoDimension) || null
  );
  const [created, setCreated] = useState<Evaluacion | null>(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [previewExistenteFoto, setPreviewExistenteFoto] = useState<string | null>(null);
  const [previewExistentePdf, setPreviewExistentePdf] = useState<string | null>(null);

  const dimActiva: CodigoDimension = selectedDimCodigo || (dimensionesOrden[0] ?? 'SAB');
  const cfg = dimensionesConfig[dimActiva] || DIMENSIONES_CONFIG[dimActiva];
  const accentColor = cfg.color;
  const esAUT = dimActiva === 'AUT';
  const esSER = dimActiva === 'SER';

  // Tipos filtrados según dimensión activa
  const tiposDimension = TIPOS_EVALUACION.filter(t =>
    TIPOS_POR_DIMENSION[dimActiva]?.includes(t.value)
  );

  const [form, setForm] = useState<Partial<CrearEvaluacionDTO>>({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
    puntaje_maximo: 45,
    peso_en_dimension: 1,
    visible_para_padres: false,
    fecha: new Date().toISOString().split('T')[0],
    permite_entrega_archivo: false,
  });

  const dimActObj = dimensiones.find(d => d.codigo === dimActiva)
    || (form.dimension_evaluacion_id ? dimensiones.find(d => d.id === form.dimension_evaluacion_id) : undefined);

  const [tipo, setTipo] = useState<string>('examen');
  const [criterios, setCriterios] = useState<CriterioRubrica[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);

  const { unidades: listaUnidades } = useTemario(seleccionada?.grado_materia_id ?? 0, periodoId);
  const temaSeleccionado = (listaUnidades || []).flatMap(u => u.temas).find(t => t.tema_id === form.tema_id);
  const temaTituloDefault = temaSeleccionado?.tema_titulo || form.nombre || seleccionada?.materia_nombre || '';
  const fotoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [duracionMinutos, setDuracionMinutos] = useState<number>(45);
  const [fechaHoraInicio, setFechaHoraInicio] = useState<string>('');
  const [fechaHoraFin, setFechaHoraFin] = useState<string>('');
  const [intentosPermitidos, setIntentosPermitidos] = useState<number>(1);
  const [ordenAleatorio, setOrdenAleatorio] = useState<boolean>(false);
  const [preguntas, setPreguntas] = useState<PreguntaExamen[]>([]);
  const [dialogLimpiarOpen, setDialogLimpiarOpen] = useState(false);
  const [limpiandoIntentos, setLimpiandoIntentos] = useState(false);

  const handleLimpiarTodosIntentos = async () => {
    if (!editId) return;
    setLimpiandoIntentos(true);
    try {
      const res = await examenService.limpiarTodosIntentos(editId);
      toast.success(res.message || 'Todos los intentos fueron eliminados exitosamente');
      setDialogLimpiarOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al limpiar intentos');
    } finally {
      setLimpiandoIntentos(false);
    }
  };

  const set = (k: keyof CrearEvaluacionDTO, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSelectDimension = (codigo: CodigoDimension) => {
    setSelectedDimCodigo(codigo);
    const d = dimensiones.find(dim => dim.codigo === codigo);
    const pesoDim = Number(d?.porcentaje_ponderacion ?? (codigo === 'SER' ? 10 : (codigo === 'AUT' ? 5 : 45)));
    if (d) {
      set('dimension_evaluacion_id', d.id);
      set('puntaje_maximo', pesoDim);
    }
    if (codigo === 'AUT') {
      set('puntaje_maximo', pesoDim);
      set('peso_en_dimension', 1);
      set('visible_para_padres', true);
    } else if (codigo === 'SER') {
      setTipo('general');
    } else {
      const primero = TIPOS_POR_DIMENSION[codigo]?.[0];
      if (primero) setTipo(primero);
    }
  };

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (!editId) return;
    let cancel = false;
    setCargandoEdicion(true);
    (async () => {
      try {
        const [evalRes, rubricaRes, preguntasRes] = await Promise.all([
          evaluacionesService.obtenerPorId(editId),
          rubricaService.listar(editId).catch(() => ({ data: { criterios: [] } })),
          examenService.listarPreguntas(editId).catch(() => ({ data: { preguntas: [] } })),
        ]);
        if (cancel) return;
        const ev = evalRes?.data?.evaluacion;
        if (!ev) return;

        const codNormalizado = (ev.dimension_codigo as string) === 'AUTO' ? 'AUT' : (ev.dimension_codigo as CodigoDimension);
        if (codNormalizado) {
          setSelectedDimCodigo(codNormalizado);
        }
        setForm({
          asignacion_docente_id: ev.asignacion_docente_id,
          periodo_evaluacion_id: ev.periodo_evaluacion_id,
          dimension_evaluacion_id: ev.dimension_evaluacion_id,
          nombre: ev.nombre,
          tipo: ev.tipo,
          descripcion: ev.descripcion ?? '',
          instrucciones: ev.instrucciones ?? '',
          fecha: ev.fecha ? ev.fecha.slice(0, 10) : '',
          fecha_limite: ev.fecha_limite ? formatForInput(ev.fecha_limite) : '',
          puntaje_maximo: ev.puntaje_maximo,
          peso_en_dimension: ev.peso_en_dimension,
          visible_para_padres: ev.visible_para_padres ?? false,
          tema_id: ev.tema_id ?? undefined,
          permite_entrega_archivo: ev.permite_entrega_archivo ?? false,
        });
        if (ev.tipo) setTipo(ev.tipo);
        if (ev.modalidad) setModalidad(ev.modalidad);
        if (ev.duracion_minutos) setDuracionMinutos(ev.duracion_minutos);
        if (ev.fecha_hora_inicio) setFechaHoraInicio(formatForInput(ev.fecha_hora_inicio));
        if (ev.fecha_hora_fin) setFechaHoraFin(formatForInput(ev.fecha_hora_fin));
        if (ev.intentos_permitidos) setIntentosPermitidos(ev.intentos_permitidos);
        if (ev.orden_aleatorio !== undefined && ev.orden_aleatorio !== null) {
          setOrdenAleatorio(Boolean(ev.orden_aleatorio));
        }

        if (rubricaRes?.data?.criterios && rubricaRes.data.criterios.length > 0) {
          setCriterios(rubricaRes.data.criterios);
        }
        if (preguntasRes?.data?.preguntas && preguntasRes.data.preguntas.length > 0) {
          setPreguntas(preguntasRes.data.preguntas);
        }
        if (ev.foto_url) setPreviewExistenteFoto(ev.foto_url);
        if (ev.pdf_url) setPreviewExistentePdf(ev.pdf_nombre || 'Documento PDF actual');
      } catch (err: any) {
        toast.error('Error al cargar la evaluación para editar');
      } finally {
        if (!cancel) {
          setCargandoEdicion(false);
        }
      }
    })();
    return () => { cancel = true; };
  }, [editId]);

  const pesoDimDefecto = Number(dimActObj?.porcentaje_ponderacion ?? (esAUT ? 5 : (esSER ? 10 : 45)));
  const puntajeMax = esAUT ? pesoDimDefecto : Number(form.puntaje_maximo ?? pesoDimDefecto);
  const puntajeMaxValido = !form.puntaje_maximo || (Number(form.puntaje_maximo) > 0 && Number(form.puntaje_maximo) <= pesoDimDefecto);
  const criteriosValidos = criterios.filter(c => c.criterio.trim());
  const sumaCriterios = criteriosValidos.reduce((s, c) => s + Number(c.puntos_posibles || 0), 0);
  const rubricaValida = criteriosValidos.length === 0 || Math.round(sumaCriterios * 100) === Math.round(puntajeMax * 100);
  const fechaLimiteValida = !form.permite_entrega_archivo || Boolean(form.fecha_limite);
  const canSubmit = !!form.nombre?.trim() && (!!dimActObj || !!form.dimension_evaluacion_id) && puntajeMaxValido && rubricaValida && fechaLimiteValida;
  const tipoObj = TIPOS_EVALUACION.find(t => t.value === tipo);
  const tipoLabel = esAUT ? 'Autoevaluación' : esSER ? 'General' : (tipoObj?.label || 'Sin definir');
  const dimActiveColor = PESOS_CONFIG.find(p => p.key === dimActiva)?.color || accentColor;

  // En modo creación: sincronizar dimension_evaluacion_id inicial una vez que carguen las dimensiones
  useEffect(() => {
    if (isEditing) return;
    if (dimActObj && !form.dimension_evaluacion_id) {
      set('dimension_evaluacion_id', dimActObj.id);
      set('puntaje_maximo', Number(dimActObj.porcentaje_ponderacion ?? (dimActiva === 'SER' ? 10 : (dimActiva === 'AUT' ? 5 : 45))));
    }
  }, [isEditing, dimActObj, dimActiva, form.dimension_evaluacion_id]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      if (!rubricaValida) {
        toast.error(`La suma de la rúbrica (${sumaCriterios} pts) debe ser exactamente igual al puntaje máximo (${puntajeMax} pts).`);
      } else if (!fechaLimiteValida) {
        toast.error('Debes definir la fecha límite para habilitar la entrega de archivos.');
      }
      return;
    }
    const data: any = {
      ...(form as CrearEvaluacionDTO),
      tipo: esAUT ? undefined : esSER ? 'general' : (tipo as any),
      modalidad: esAUT || esSER ? 'presencial' : modalidad,
      duracion_minutos: modalidad === 'virtual' ? duracionMinutos : undefined,
      fecha_hora_inicio: modalidad === 'virtual' && fechaHoraInicio ? fechaHoraInicio : undefined,
      fecha_hora_fin: modalidad === 'virtual' && fechaHoraFin ? fechaHoraFin : undefined,
      intentos_permitidos: modalidad === 'virtual' ? intentosPermitidos : undefined,
      orden_aleatorio: modalidad === 'virtual' ? ordenAleatorio : undefined,
      permite_entrega_archivo: esAUT || esSER ? false : Boolean(form.permite_entrega_archivo),
      preguntas: modalidad === 'virtual' && preguntas.length > 0 ? preguntas : undefined,
      dimension_evaluacion_id: dimActObj?.id ?? form.dimension_evaluacion_id!,
      // Calificación directa: por defecto el puntaje de la dimensión
      puntaje_maximo: esAUT ? pesoDimDefecto : (form.puntaje_maximo ?? dimActObj?.porcentaje_ponderacion ?? 45),
      peso_en_dimension: esAUT ? 1 : (form.peso_en_dimension ?? 1),
      visible_para_padres: esAUT ? true : (form.visible_para_padres ?? false),
    };

    if (isEditing && editId) {
      const ok = await actualizar(
        editId,
        data,
        foto ?? undefined,
        pdf ?? undefined,
        criterios.filter(c => c.criterio.trim()).length > 0 ? criterios : undefined
      );
      if (ok) {
        router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`);
      }
      return;
    }

    const ev = await crear(
      data,
      foto ?? undefined,
      pdf ?? undefined,
      criterios.filter(c => c.criterio.trim()).length > 0 ? criterios : undefined,
    );
    if (ev) setCreated(ev);
  }, [
    canSubmit, form, esAUT, esSER, tipo, modalidad, duracionMinutos,
    fechaHoraInicio, fechaHoraFin, intentosPermitidos, ordenAleatorio,
    preguntas, dimActObj, isEditing, editId, actualizar, crear, foto,
    pdf, criterios, router, asignacionId, periodoId,
  ]);

  const handleNueva = () => {
    setCreated(null);
    setModalidad('presencial');
    setDuracionMinutos(45);
    setFechaHoraInicio('');
    setFechaHoraFin('');
    setIntentosPermitidos(1);
    setOrdenAleatorio(false);
    setPreguntas([]);
    setForm({
      asignacion_docente_id: asignacionId,
      periodo_evaluacion_id: periodoId,
      puntaje_maximo: 100,
      peso_en_dimension: 1,
      visible_para_padres: false,
    });
    setTipo('examen');
    setCriterios([]);
    setFoto(null);
    setPdf(null);
  };

  useEffect(() => {
    if (!loadingMaterias && materias.length > 0 && !seleccionada)
      router.replace('/dashboard/docente/notas');
  }, [loadingMaterias, materias, seleccionada]);

  if (loadingMaterias || !seleccionada) return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
      </Container>
    </Box>
  );

  const esInicial =
    seleccionada.modalidad_evaluacion === 'cualitativa' ||
    seleccionada.nivel_nombre?.toLowerCase().includes('inicial');

  if (esInicial) {
    return (
      <PanelTareasInicial
        materia={seleccionada}
        asignacionId={asignacionId}
        periodoId={periodoId}
        paraleloId={seleccionada.paralelo_id}
        gradoId={seleccionada.grado_id}
        modoInicial="crear"
        editId={editId}
        onVolver={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
      />
    );
  }

  // ── Tabs de dimensión compartidos ─────────────────────────────────────────
  const DimTabs = (
    <Box sx={{
      background: gradBg, borderRadius: '16px', p: 1, mb: 3,
      backdropFilter: 'blur(20px)',
      display: 'flex', gap: 0.5,
      overflowX: 'auto',
      flexWrap: 'nowrap',
      scrollSnapType: 'x proximity',
      WebkitOverflowScrolling: 'touch',
      '&::-webkit-scrollbar': { height: 4 },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.4),
        borderRadius: 4,
      },
    }}>
      {dimensionesOrden.map((k) => {
        const c = dimensionesConfig[k] || DIMENSIONES_CONFIG[k];
        const isActive = k === dimActiva;
        return (
          <Box
            key={k}
            onClick={() => !created && handleSelectDimension(k)}
            sx={{
              flex: 1, py: 1.1, px: 2, borderRadius: '12px', textAlign: 'center',
              cursor: created ? 'default' : 'pointer',
              background: isActive
                ? (isDark ? '#000' : '#fff')
                : 'transparent',
              color: isActive
                ? (isDark ? '#fff' : '#000')
                : (isDark ? alpha('#000', 0.65) : alpha('#fff', 0.75)),
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              transition: 'all .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              whiteSpace: 'nowrap',
              '&:hover': !created ? {
                background: isActive
                  ? (isDark ? '#000' : '#fff')
                  : (isDark ? alpha('#000', 0.1) : alpha('#fff', 0.15)),
              } : {},
            }}
          >
            <span>{c.label}</span>
            <Box sx={{
              fontSize: 10, fontWeight: 700,
              bgcolor: isActive
                ? (isDark ? alpha('#fff', 0.15) : alpha('#000', 0.1))
                : (isDark ? alpha('#000', 0.2) : alpha('#fff', 0.2)),
              color: isActive
                ? (isDark ? '#fff' : '#000')
                : (isDark ? '#000' : '#fff'),
              borderRadius: '8px', px: 0.8, py: 0.2, lineHeight: 1.4,
            }}>
              {c.porcentaje}%
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  // ── Vista detalle post-creación ────────────────────────────────────────────
  if (created) return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Fade in timeout={400}>
          <Box>
            <Box
              onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: gold }, transition: 'color .15s',
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a evaluaciones
            </Box>
            {DimTabs}
            <DetalleEvaluacion
              evaluacion={created}
              materia={seleccionada}
              onNueva={handleNueva}
              onVolver={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
            />
          </Box>
        </Fade>
      </Container>
    </Box>
  );

  // ── Vista formulario ───────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Fade in timeout={400}>
          <Box>

            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box
                onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                  cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                  '&:hover': { color: gold }, transition: 'color .15s',
                }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                Volver
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AssignmentRoundedIcon sx={{
                  color: gold, fontSize: 34,
                  animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 800,
                    background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {isEditing ? 'Editar Práctica / Evaluación' : 'Nueva Evaluación'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {isEditing && form.nombre ? `Editando: ${form.nombre} · ` : ''}
                    {seleccionada?.materia_nombre} · {seleccionada?.grado_nombre} "{seleccionada?.paralelo_nombre}" · {seleccionada?.trimestre_nombre}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabs dimensión */}
            {cargandoEdicion && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress sx={{ borderRadius: 1, height: 4 }} />
              </Box>
            )}
            {DimTabs}

            {/* Grid 2 Columnas: Formulario + Panel Lateral Resumen */}
            <Grid container spacing={3.5} alignItems="flex-start">
              {/* Columna Principal: Formulario */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box sx={{ animation: `${fadeUp} 0.3s ease-out`, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* ── Bloque 1: Información básica ── */}
                  <Box sx={cardSx(isDark)}>
                    <SectionHeader
                      icon={<AssignmentRoundedIcon sx={{ fontSize: 18 }} />}
                      title="Información básica"
                      subtitle={
                        esAUT ? 'El estudiante completa la autoevaluación desde la app' :
                          esSER ? 'Observación de actitudes y valores — sin examen' :
                            'Nombre, tipo y configuración principal'
                      }
                      accent={accentColor}
                      isDark={isDark}
                    />
                    <Box sx={{ p: 2.5 }}>
                      <Stack spacing={2.5}>

                        {/* ── Infobox contextual por dimensión ── */}
                        {(esSER || esAUT) && (
                          <Box sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1.2,
                            p: 1.5, borderRadius: '10px',
                            bgcolor: isDark ? alpha(accentColor, 0.1) : alpha(accentColor, 0.06),
                            border: `1px solid ${alpha(accentColor, 0.2)}`,
                          }}>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: accentColor, flexShrink: 0, mt: 0.1 }} />
                            <Typography variant="caption" sx={{ color: accentColor, lineHeight: 1.5 }}>
                              {esSER && 'En Ser calificás mediante observación directa de actitudes y valores sociocomunitarios. Se asigna una evaluación general por defecto sin necesidad de especificar tipo ni examen.'}
                              {esAUT && 'En Autoevaluación el estudiante responde preguntas guiadas desde la app. No requiere tipo de evaluación ni puntaje complejo.'}
                            </Typography>
                          </Box>
                        )}

                        {/* ── Autogenerador de nombre para SER y AUT ── */}
                        {(esSER || esAUT) && (
                          <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
                            p: 1.5, borderRadius: '10px',
                            border: `1px solid ${isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.15)}`,
                            bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
                          }}>
                            <Box>
                              <Typography variant="caption" fontWeight={700} sx={{ color: accentColor, display: 'block' }}>
                                Nombre sugerido
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                {generarNombreDefault(dimActiva)}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              onClick={() => set('nombre', generarNombreDefault(dimActiva))}
                              sx={{
                                textTransform: 'none', fontWeight: 600, fontSize: 12, flexShrink: 0,
                                color: accentColor, borderRadius: '8px',
                                border: `1px solid ${alpha(accentColor, 0.3)}`,
                                '&:hover': { bgcolor: alpha(accentColor, 0.08) },
                              }}
                            >
                              Usar este
                            </Button>
                          </Box>
                        )}

                        {/* Nombre */}
                        <TextField
                          label="Nombre de la evaluación *"
                          fullWidth
                          placeholder={
                            esAUT ? 'Ej: Autoevaluación trimestre 1...' :
                              esSER ? 'Ej: Observación semana 3, Conducta mayo...' :
                                'Ej: Práctica de laboratorio U2, Examen parcial...'
                          }
                          value={form.nombre ?? ''}
                          onChange={e => set('nombre', e.target.value)}
                          sx={inputSx(accentColor)}
                        />

                        {/* ── Tipo — oculto para AUT y SER, filtrado por dimensión para SAB/HAC ── */}
                        {!esAUT && !esSER && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}
                              sx={{ mb: 1.2, display: 'block', fontSize: '0.9rem' }}>
                              Tipo de evaluación
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                              {tiposDimension.map(t => {
                                const sel = tipo === t.value;
                                return (
                                  <Box
                                    key={t.value}
                                    onClick={() => setTipo(t.value)}
                                    sx={{
                                      display: 'flex', alignItems: 'center', gap: 1,
                                      px: 2, py: 1.2, borderRadius: '12px', cursor: 'pointer',
                                      border: `1.5px solid ${sel ? accentColor : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                      bgcolor: sel ? alpha(accentColor, isDark ? 0.18 : 0.1) : isDark ? alpha('#fff', 0.03) : '#fafafa',
                                      transition: 'all .15s',
                                      '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.08) },
                                    }}
                                  >
                                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</Typography>
                                    <Typography variant="body2" fontWeight={sel ? 700 : 500}
                                      sx={{ color: sel ? accentColor : 'text.secondary', fontSize: 13.5 }}>
                                      {t.label}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        )}

                        {/* ── Selector tema — solo SAB y HAC (ubicado antes de modalidad para vincular directamente) ── */}
                        {!esSER && !esAUT && (
                          <SelectorTema
                            grado_materia_id={seleccionada.grado_materia_id}
                            periodo_evaluacion_id={periodoId}
                            temaId={form.tema_id}
                            accentColor={accentColor}
                            isDark={isDark}
                            onChange={tema_id => set('tema_id', tema_id)}
                          />
                        )}

                        {/* ── Modalidad: Presencial / Virtual (solo SAB y HAC) ── */}
                        {!esAUT && !esSER && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}
                              sx={{ mb: 1.2, display: 'block', fontSize: '0.9rem' }}>
                              Modalidad de la evaluación
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: modalidad === 'virtual' ? 1.5 : 0 }}>
                              <Box
                                onClick={() => setModalidad('presencial')}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  px: 2.2, py: 1.3, borderRadius: '12px', cursor: 'pointer',
                                  border: `1.5px solid ${modalidad === 'presencial' ? accentColor : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                  bgcolor: modalidad === 'presencial' ? alpha(accentColor, isDark ? 0.18 : 0.1) : isDark ? alpha('#fff', 0.03) : '#fafafa',
                                  transition: 'all .15s',
                                  '&:hover': { borderColor: accentColor },
                                }}
                              >
                                <Typography sx={{ fontSize: 20 }}>📝</Typography>
                                <Typography variant="body2" fontWeight={modalidad === 'presencial' ? 700 : 500}
                                  sx={{ color: modalidad === 'presencial' ? accentColor : 'text.secondary', fontSize: 14 }}>
                                  Presencial (Físico / Papel)
                                </Typography>
                              </Box>

                              <Box
                                onClick={() => setModalidad('virtual')}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  px: 2.2, py: 1.3, borderRadius: '12px', cursor: 'pointer',
                                  border: `1.5px solid ${modalidad === 'virtual' ? '#10b981' : isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                  bgcolor: modalidad === 'virtual' ? alpha('#10b981', isDark ? 0.18 : 0.1) : isDark ? alpha('#fff', 0.03) : '#fafafa',
                                  transition: 'all .15s',
                                  '&:hover': { borderColor: '#10b981' },
                                }}
                              >
                                <ComputerRoundedIcon sx={{ fontSize: 22, color: modalidad === 'virtual' ? '#10b981' : 'text.secondary' }} />
                                <Typography variant="body2" fontWeight={modalidad === 'virtual' ? 800 : 500}
                                  sx={{ color: modalidad === 'virtual' ? '#10b981' : 'text.secondary', fontSize: 14 }}>
                                  🌐 Examen Virtual (con IA Gemini)
                                </Typography>
                              </Box>
                            </Box>

                            {modalidad === 'virtual' && (
                              <Box sx={{
                                mt: 2, p: 2.5, borderRadius: '14px',
                                border: `1.5px solid ${alpha('#10b981', 0.25)}`,
                                bgcolor: isDark ? alpha('#10b981', 0.05) : alpha('#10b981', 0.02),
                                display: 'flex', flexDirection: 'column', gap: 2.5,
                              }}>
                                {/* Alert de Programación */}
                                <Alert severity="info" sx={{ borderRadius: '10px', fontSize: 13, py: 0.8 }}>
                                  📅 <strong>Programación del Examen:</strong> Puedes configurar las preguntas hoy mismo. Si defines una <strong>Fecha y Hora de Inicio</strong> futura (ej. mañana a las 08:00), el examen permanecerá bloqueado y los alumnos <strong>no podrán ingresar ni ver las preguntas</strong> hasta que llegue ese momento exacto.
                                </Alert>

                                {/* Campos de Horarios y Tiempo */}
                                <Grid container spacing={2}>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      label="Duración del intento (minutos) *"
                                      type="number"
                                      fullWidth
                                      value={duracionMinutos}
                                      onChange={e => setDuracionMinutos(Math.max(1, parseInt(e.target.value) || 1))}
                                      inputProps={{ min: 1, max: 300 }}
                                      helperText="Tiempo cronometrado al iniciar"
                                      sx={inputSx('#10b981')}
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      label="Habilitar desde (Fecha y Hora)"
                                      type="datetime-local"
                                      fullWidth
                                      InputLabelProps={{ shrink: true }}
                                      value={fechaHoraInicio}
                                      onChange={e => setFechaHoraInicio(e.target.value)}
                                      helperText="Opcional: Inicio de visibilidad para alumnos"
                                      sx={inputSx('#10b981')}
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      label="Cerrar plazo el (Fecha y Hora)"
                                      type="datetime-local"
                                      fullWidth
                                      InputLabelProps={{ shrink: true }}
                                      value={fechaHoraFin}
                                      onChange={e => setFechaHoraFin(e.target.value)}
                                      helperText="Opcional: Límite de entrega"
                                      sx={inputSx('#10b981')}
                                    />
                                  </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pt: 1, borderTop: `1px solid ${alpha('#10b981', 0.15)}` }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormControl sx={{ minWidth: 180, ...inputSx('#10b981') }}>
                                      <InputLabel>Intentos permitidos</InputLabel>
                                      <Select
                                        value={intentosPermitidos}
                                        label="Intentos permitidos"
                                        onChange={e => setIntentosPermitidos(Number(e.target.value))}
                                      >
                                        <MenuItem value={1}>1 intento único</MenuItem>
                                        <MenuItem value={2}>2 intentos</MenuItem>
                                        <MenuItem value={3}>3 intentos</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Box>

                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={ordenAleatorio}
                                        onChange={e => setOrdenAleatorio(e.target.checked)}
                                        color="success"
                                      />
                                    }
                                    label={
                                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13.5 }}>
                                        Barajar orden de preguntas para cada alumno (Anti-copia)
                                      </Typography>
                                    }
                                  />
                                </Box>

                                {/* Opción de limpiar envíos al editar examen virtual */}
                                {isEditing && editId && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      borderRadius: '12px',
                                      border: `1.5px solid ${alpha('#ef4444', 0.25)}`,
                                      bgcolor: isDark ? alpha('#ef4444', 0.06) : '#fef2f2',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: 1.5,
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <Box sx={{
                                        width: 38, height: 38, borderRadius: '10px',
                                        bgcolor: alpha('#ef4444', 0.15), color: '#ef4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>
                                        <DeleteSweepRoundedIcon sx={{ fontSize: 22 }} />
                                      </Box>
                                      <Box>
                                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ef4444' }}>
                                          Limpiar intentos y envíos previos
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Si modificas preguntas del examen, puedes borrar los envíos anteriores para que todos los alumnos vuelvan a rendirlo.
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      startIcon={limpiandoIntentos ? <CircularProgress size={14} color="inherit" /> : <DeleteSweepRoundedIcon />}
                                      disabled={limpiandoIntentos}
                                      onClick={() => setDialogLimpiarOpen(true)}
                                      sx={{
                                        borderRadius: '9px',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        fontSize: 12,
                                        py: 0.6, px: 1.8,
                                        bgcolor: isDark ? alpha('#ef4444', 0.1) : '#fff',
                                      }}
                                    >
                                      Limpiar todos los intentos
                                    </Button>
                                  </Paper>
                                )}

                                {/* Editor y Generador de Preguntas */}
                                <Divider sx={{ my: 1 }} />
                                <EditorPreguntasExamen
                                  preguntas={preguntas}
                                  onChange={setPreguntas}
                                  puntajeMaximo={form.puntaje_maximo ?? 100}
                                  temaId={form.tema_id}
                                  temaTituloDefault={temaTituloDefault}
                                  unidades={listaUnidades}
                                  onSelectTemaId={id => set('tema_id', id)}
                                  isDark={isDark}
                                  accentColor="#10b981"
                                />
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* ── Preguntas de autoreflexión — solo AUT ── */}
                        {esAUT && (
                          <Box sx={{
                            p: 2, borderRadius: '12px',
                            border: `1.5px solid ${alpha(accentColor, 0.2)}`,
                            bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                              <BookmarkRoundedIcon sx={{ fontSize: 14, color: accentColor }} />
                              <Typography variant="caption" fontWeight={800}
                                sx={{ color: accentColor, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                                Preguntas de autoreflexión
                              </Typography>
                            </Box>
                            <Stack spacing={0.8}>
                              {PREGUNTAS_AUTOEVALUACION.map((p, i) => (
                                <Box key={i} sx={{
                                  px: 1.5, py: 1, borderRadius: '8px',
                                  border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                                  display: 'flex', alignItems: 'center', gap: 1,
                                }}>
                                  <Box sx={{
                                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                    bgcolor: alpha(accentColor, 0.15),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 9, fontWeight: 800, color: accentColor,
                                  }}>
                                    {i + 1}
                                  </Box>
                                  <Typography variant="caption" sx={{ fontSize: 12, lineHeight: 1.4 }}>{p}</Typography>
                                </Box>
                              ))}
                            </Stack>
                            <Typography variant="caption" color="text.secondary"
                              sx={{ display: 'block', mt: 1.2, fontSize: 11 }}>
                              El estudiante responde estas preguntas desde la app. Vos aprobás su reflexión.
                            </Typography>
                            <Box sx={{
                              mt: 1.5, p: 1.2, borderRadius: '8px',
                              bgcolor: isDark ? alpha(accentColor, 0.12) : alpha(accentColor, 0.08),
                              border: `1px solid ${alpha(accentColor, 0.25)}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
                                Escala de calificación directa: 1 a 5 pts
                              </Typography>
                              <Chip
                                size="small"
                                label="5% ponderado trimestral"
                                sx={{
                                  fontSize: 10, fontWeight: 800,
                                  bgcolor: alpha(accentColor, 0.2),
                                  color: accentColor, height: 20,
                                }}
                              />
                            </Box>
                          </Box>
                        )}

                        {/* ── Fecha límite y mensaje para AUT ── */}
                        {esAUT && (
                          <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Fecha límite para autoevaluarse" type="datetime-local" fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText="Plazo máximo para que los estudiantes envíen su autoevaluación"
                                value={form.fecha_limite ?? ''}
                                onChange={e => set('fecha_limite', e.target.value || undefined)}
                                sx={inputSx(accentColor)}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Fecha de la evaluación" type="date" fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={form.fecha ?? ''}
                                onChange={e => set('fecha', e.target.value || undefined)}
                                sx={inputSx(accentColor)}
                              />
                            </Grid>
                          </Grid>
                        )}

                        {/* ── Puntaje / peso / fechas — oculto para AUT ── */}
                        {!esAUT && (
                          <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Puntaje máximo *" type="number" fullWidth
                                value={form.puntaje_maximo ?? pesoDimDefecto}
                                onChange={e => {
                                  const val = parseFloat(e.target.value);
                                  if (isNaN(val)) {
                                    set('puntaje_maximo', '');
                                  } else {
                                    set('puntaje_maximo', Math.min(Math.max(val, 0), pesoDimDefecto));
                                  }
                                }}
                                inputProps={{ min: 1, max: pesoDimDefecto, step: 1 }}
                                helperText={
                                  Number(form.puntaje_maximo) > pesoDimDefecto
                                    ? `No puede superar los ${pesoDimDefecto} pts de la dimensión`
                                    : `Tope máximo de la dimensión ${dimActObj?.nombre || dimActiva}: ${pesoDimDefecto} pts`
                                }
                                error={Boolean(form.puntaje_maximo && Number(form.puntaje_maximo) > pesoDimDefecto)}
                                sx={inputSx(accentColor)}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Fecha" type="date" fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={form.fecha ?? ''}
                                onChange={e => set('fecha', e.target.value || undefined)}
                                sx={inputSx(accentColor)}
                              />
                            </Grid>
                            {/* Fecha límite para Saber y Hacer */}
                            {!esSER && !esAUT && (
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label={form.permite_entrega_archivo ? 'Fecha límite de entrega *' : 'Fecha límite (opcional)'}
                                  type="datetime-local" fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  helperText={
                                    form.permite_entrega_archivo
                                      ? 'Requerida: el sistema bloqueará entregas al vencer este plazo'
                                      : 'Plazo máximo de entrega o rendición'
                                  }
                                  value={form.fecha_limite ?? ''}
                                  onChange={e => set('fecha_limite', e.target.value || undefined)}
                                  error={Boolean(form.permite_entrega_archivo && !form.fecha_limite)}
                                  sx={inputSx(accentColor)}
                                />
                              </Grid>
                            )}
                          </Grid>
                        )}

                        {/* ── Entrega digital de archivos por el estudiante (solo SAB y HAC) ── */}
                        {!esSER && !esAUT && (
                          <Box sx={{
                            p: 2, borderRadius: '12px',
                            border: `1.5px solid ${form.permite_entrega_archivo ? accentColor : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                            bgcolor: form.permite_entrega_archivo ? alpha(accentColor, isDark ? 0.12 : 0.04) : isDark ? alpha('#fff', 0.02) : '#fafafa',
                            transition: 'all .18s',
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Box sx={{
                                  width: 38, height: 38, borderRadius: '10px',
                                  bgcolor: form.permite_entrega_archivo ? accentColor : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)),
                                  color: form.permite_entrega_archivo ? '#fff' : 'text.secondary',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: form.permite_entrega_archivo ? accentColor : 'text.primary' }}>
                                    Permitir entrega digital (subir archivo a la plataforma)
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                                    Los estudiantes podrán subir su práctica o examen resuelto (PDF o imágenes) para que lo revises en línea.
                                  </Typography>
                                </Box>
                              </Box>
                              <Switch
                                checked={form.permite_entrega_archivo ?? false}
                                onChange={e => {
                                  const val = e.target.checked;
                                  set('permite_entrega_archivo', val);
                                  if (val) {
                                    set('visible_para_padres', true);
                                  }
                                }}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor },
                                }}
                              />
                            </Box>

                            {form.permite_entrega_archivo && !form.fecha_limite && (
                              <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '10px', fontSize: 12, py: 0.5 }}>
                                ⚠️ <strong>Fecha límite obligatoria:</strong> Debes especificar la fecha límite arriba para que el sistema cierre automáticamente los envíos cuando expire el plazo.
                              </Alert>
                            )}
                          </Box>
                        )}

                        {/* ── Observaciones — solo SER ── */}
                        {esSER && (
                          <TextField
                            label="Observaciones del comportamiento"
                            fullWidth multiline rows={3}
                            placeholder="Describí actitudes, participación, convivencia del grupo..."
                            value={form.descripcion ?? ''}
                            onChange={e => set('descripcion', e.target.value)}
                            sx={inputSx(accentColor)}
                          />
                        )}

                        {/* ── Instrucciones — para SAB y HAC ── */}
                        {!esSER && !esAUT && (
                          <TextField
                            label="Instrucciones (visible para padres)"
                            fullWidth multiline rows={3}
                            value={form.instrucciones ?? ''}
                            onChange={e => set('instrucciones', e.target.value)}
                            sx={inputSx(accentColor)}
                          />
                        )}

                        {/* Descripción / Mensaje general */}
                        {!esSER && (
                          <TextField
                            label={esAUT ? 'Mensaje o consigna para el estudiante' : 'Descripción interna'}
                            fullWidth multiline rows={3}
                            placeholder={esAUT ? 'Ej: Estimado estudiante, reflexiona con honestidad sobre tu compromiso y desempeño en este trimestre...' : ''}
                            value={form.descripcion ?? ''}
                            onChange={e => set('descripcion', e.target.value)}
                            sx={inputSx(accentColor)}
                          />
                        )}

                        {/* ── Toggle publicar ── */}
                        <Box sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          p: 1.5, borderRadius: '10px',
                          border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.8),
                        }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {esAUT ? 'Visible para el estudiante' : 'Publicar para padres'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {esSER && 'Los padres verán el comentario, sin nota numérica'}
                              {esAUT && 'El estudiante accede desde la app para completarla'}
                              {!esSER && !esAUT && 'Los padres podrán ver esta evaluación desde el inicio'}
                            </Typography>
                          </Box>
                          <Switch
                            checked={form.visible_para_padres ?? false}
                            onChange={e => set('visible_para_padres', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor },
                            }}
                          />
                        </Box>

                      </Stack>
                    </Box>
                  </Box>

                  {/* ── Bloque 2: Adjuntos — solo presencial y no AUT ── */}
                  {!esAUT && modalidad === 'presencial' && (
                    <Box sx={cardSx(isDark)}>
                      <SectionHeader
                        icon={<ImageRoundedIcon sx={{ fontSize: 18 }} />}
                        title="Adjuntos"
                        subtitle="Opcional — foto o PDF del enunciado"
                        accent={accentColor}
                        isDark={isDark}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <input ref={fotoRef} type="file" accept="image/*" hidden
                              onChange={e => setFoto(e.target.files?.[0] ?? null)} />
                            {foto ? (
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px',
                                border: `1.5px solid ${alpha(accentColor, 0.4)}`,
                                bgcolor: alpha(accentColor, isDark ? 0.06 : 0.04),
                              }}>
                                <Box component="img" src={URL.createObjectURL(foto)}
                                  sx={{ width: 60, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} noWrap display="block">{foto.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{(foto.size / 1024).toFixed(1)} KB</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setFoto(null)} sx={{ color: '#dc2626' }}>
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ) : previewExistenteFoto ? (
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px',
                                border: `1.5px solid ${alpha(accentColor, 0.4)}`,
                                bgcolor: alpha(accentColor, isDark ? 0.06 : 0.04),
                              }}>
                                <Box component="img" src={previewExistenteFoto}
                                  sx={{ width: 60, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} noWrap display="block">Foto actual guardada</Typography>
                                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => fotoRef.current?.click()}>
                                    Cambiar imagen
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box onClick={() => fotoRef.current?.click()} sx={{
                                p: 2.5, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                border: `1.5px dashed ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                                bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                                transition: 'border-color .15s, background .15s',
                                '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.04) },
                              }}>
                                <ImageRoundedIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
                                <Typography variant="body2" fontWeight={600} color="text.secondary">Foto del enunciado</Typography>
                                <Typography variant="caption" color="text.disabled">JPG, PNG · máx 5MB</Typography>
                              </Box>
                            )}
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <input ref={pdfRef} type="file" accept="application/pdf" hidden
                              onChange={e => setPdf(e.target.files?.[0] ?? null)} />
                            {pdf ? (
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px',
                                border: `1.5px solid ${alpha('#dc2626', 0.3)}`,
                                bgcolor: alpha('#dc2626', isDark ? 0.06 : 0.03),
                              }}>
                                <PictureAsPdfRoundedIcon sx={{ fontSize: 32, color: '#dc2626', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} noWrap display="block">{pdf.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{(pdf.size / 1024).toFixed(1)} KB</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setPdf(null)} sx={{ color: '#dc2626' }}>
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ) : previewExistentePdf ? (
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px',
                                border: `1.5px solid ${alpha('#dc2626', 0.3)}`,
                                bgcolor: alpha('#dc2626', isDark ? 0.06 : 0.03),
                              }}>
                                <PictureAsPdfRoundedIcon sx={{ fontSize: 32, color: '#dc2626', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} noWrap display="block">{previewExistentePdf}</Typography>
                                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => pdfRef.current?.click()}>
                                    Cambiar PDF
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box onClick={() => pdfRef.current?.click()} sx={{
                                p: 2.5, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                border: `1.5px dashed ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                                bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                                transition: 'border-color .15s, background .15s',
                                '&:hover': { borderColor: '#dc2626', bgcolor: alpha('#dc2626', 0.03) },
                              }}>
                                <PictureAsPdfRoundedIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
                                <Typography variant="body2" fontWeight={600} color="text.secondary">PDF de instrucciones</Typography>
                                <Typography variant="caption" color="text.disabled">PDF · máx 10MB</Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  )}

                  {/* ── Bloque 3: Rúbrica — solo presencial y no AUT ── */}
                  {!esAUT && modalidad === 'presencial' && (
                    <Box sx={cardSx(isDark)}>
                      <SectionHeader
                        icon={<ScaleRoundedIcon sx={{ fontSize: 18 }} />}
                        title="Rúbrica de evaluación"
                        subtitle="Opcional — definí los criterios de corrección"
                        accent={accentColor}
                        isDark={isDark}
                      />
                      <EditorRubrica
                        criterios={criterios}
                        puntajeMaximo={puntajeMax}
                        accentColor={accentColor}
                        onChange={setCriterios}
                      />
                    </Box>
                  )}

                  {/* ── Botón crear ── */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}`)}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                      Cancelar
                    </Button>
                    <Box
                      component="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 3, py: 1.2, borderRadius: '12px', border: 'none',
                        background: canSubmit ? gradBg : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                        color: canSubmit ? (isDark ? '#000' : '#fff') : 'text.disabled',
                        fontWeight: 700, fontSize: 14,
                        cursor: (!canSubmit || isSubmitting) ? 'default' : 'pointer',
                        transition: 'opacity .15s, transform .15s',
                        '&:hover': {
                          opacity: (!canSubmit || isSubmitting) ? 1 : 0.88,
                          transform: (!canSubmit || isSubmitting) ? 'none' : 'translateY(-1px)',
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <><CircularProgress size={16} sx={{ color: isDark ? '#000' : '#fff' }} /> {isEditing ? 'Guardando...' : 'Creando...'}</>
                      ) : (
                        <>
                          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                          {isEditing ? 'Guardar Cambios' : (esAUT ? 'Crear autoevaluación' : esSER ? 'Registrar observación' : 'Crear evaluación')}
                        </>
                      )}
                    </Box>
                  </Box>

                </Box>
              </Grid>

              {/* Columna Lateral: Resumen, Consejo y Pesos */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Box sx={{
                  position: { lg: 'sticky' },
                  top: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  animation: `${fadeUp} 0.35s ease-out`,
                }}>
                  {/* ── 1. Resumen ── */}
                  <Box sx={cardSx(isDark)}>
                    <Box sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                        Resumen
                      </Typography>

                      {/* DIMENSIÓN ACTIVA */}
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        DIMENSIÓN ACTIVA
                      </Typography>

                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        px: 1.5, py: 0.65, borderRadius: '20px',
                        bgcolor: isDark ? alpha(dimActiveColor, 0.15) : alpha(dimActiveColor, 0.1),
                        border: `1px solid ${alpha(dimActiveColor, 0.3)}`,
                        mb: 2.5,
                      }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dimActiveColor }} />
                        <Typography sx={{ color: dimActiveColor, fontWeight: 700, fontSize: '0.85rem' }}>
                          {cfg.label} · {cfg.porcentaje}%
                        </Typography>
                      </Box>

                      {/* DETALLES */}
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                        DETALLES
                      </Typography>

                      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Nombre</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{
                            color: form.nombre?.trim() ? (isDark ? '#e2e8f0' : '#1e293b') : 'text.disabled',
                            maxWidth: '58%',
                            textAlign: 'right',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {form.nombre?.trim() || 'Sin definir'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Tipo</Typography>
                          {esAUT ? (
                            <Chip size="small" label="Autoevaluación" sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#a855f7', fontWeight: 700, borderRadius: '20px', height: 24, fontSize: '0.75rem', border: `1px solid ${alpha('#8b5cf6', 0.3)}` }} />
                          ) : tipoLabel !== 'Sin definir' ? (
                            <Chip size="small" label={tipoLabel} sx={{ bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.12), color: isDark ? '#34d399' : '#059669', fontWeight: 700, borderRadius: '20px', height: 24, fontSize: '0.75rem', border: `1px solid ${alpha('#10b981', 0.25)}` }} />
                          ) : (
                            <Typography variant="body2" color="text.disabled">Sin definir</Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Puntaje máx.</Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            {puntajeMax} pts
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Peso</Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            {form.peso_en_dimension ?? 1} (relativo)
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Fecha</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: form.fecha ? (isDark ? '#e2e8f0' : '#1e293b') : 'text.disabled' }}>
                            {formatearFecha(form.fecha)}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* RÚBRICA */}
                      <Box sx={{ pt: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}` }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                          RÚBRICA
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Criterios</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {criterios.length} {criterios.length === 1 ? 'agregado' : 'agregados'}
                          </Typography>
                        </Box>

                        <Box sx={{
                          width: '100%',
                          height: 4,
                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                          borderRadius: 2,
                          mb: 1.2,
                          overflow: 'hidden',
                        }}>
                          <Box sx={{
                            width: `${Math.min(100, puntajeMax > 0 ? (sumaCriterios / puntajeMax) * 100 : 0)}%`,
                            height: '100%',
                            bgcolor: sumaCriterios > puntajeMax ? '#ef4444' : '#10b981',
                            borderRadius: 2,
                            transition: 'width 0.3s ease',
                          }} />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Total</Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: sumaCriterios > puntajeMax ? '#ef4444' : '#10b981' }}>
                            {sumaCriterios} / {puntajeMax} pts
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* ── 2. Consejo ── */}
                  <Box sx={{
                    p: 2.2,
                    borderRadius: '16px',
                    bgcolor: isDark ? 'rgba(6, 44, 33, 0.4)' : '#f0fdf4',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LightbulbOutlinedIcon sx={{ fontSize: 19, color: isDark ? '#34d399' : '#059669' }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: isDark ? '#34d399' : '#059669', fontSize: 14.5 }}>
                        Consejo
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{
                      color: isDark ? '#34d399' : '#047857',
                      fontSize: '0.84rem',
                      lineHeight: 1.55,
                      opacity: 0.95,
                    }}>
                      {getConsejoDimension(dimActiva)}
                    </Typography>
                  </Box>

                  {/* ── 3. Pesos por dimensión ── */}
                  <Box sx={cardSx(isDark)}>
                    <Box sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, fontSize: '1.05rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                        Pesos por dimensión
                      </Typography>

                      <Stack spacing={2}>
                        {PESOS_CONFIG.map(item => (
                          <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                            {/* Dot + Label */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 110 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                              <Typography variant="body2" fontWeight={item.key === dimActiva ? 700 : 500} sx={{
                                color: item.key === dimActiva ? (isDark ? '#fff' : '#0f172a') : 'text.secondary',
                                fontSize: '0.875rem',
                              }}>
                                {item.label}
                              </Typography>
                            </Box>

                            {/* Progress bar */}
                            <Box sx={{
                              flex: 1,
                              height: 6,
                              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}>
                              <Box sx={{
                                width: `${item.pct}%`,
                                height: '100%',
                                bgcolor: item.color,
                                borderRadius: 3,
                                transition: 'width 0.3s ease',
                              }} />
                            </Box>

                            {/* Pct text */}
                            <Typography variant="body2" fontWeight={800} sx={{
                              color: item.color,
                              minWidth: 38,
                              textAlign: 'right',
                              fontSize: '0.875rem',
                            }}>
                              {item.pct}%
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* ── Modal de confirmación: Limpiar envíos en edición ── */}
        <Dialog
          open={dialogLimpiarOpen}
          onClose={() => !limpiandoIntentos && setDialogLimpiarOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 1,
              bgcolor: isDark ? '#0f172a' : '#ffffff',
              border: `1.5px solid ${alpha('#ef4444', 0.3)}`,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteSweepRoundedIcon /> Limpiar todos los intentos
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', fontSize: 13 }}>
              <strong>¿Deseas reiniciar esta evaluación?</strong> Se borrarán las respuestas enviadas y notas registradas para que los estudiantes puedan volver a dar el examen.
            </Alert>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Esta acción es recomendada si modificaste preguntas o criterios clave del examen y necesitas que el curso responda la versión actualizada.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setDialogLimpiarOpen(false)}
              disabled={limpiandoIntentos}
              sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleLimpiarTodosIntentos}
              disabled={limpiandoIntentos}
              startIcon={limpiandoIntentos ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepRoundedIcon />}
              sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 800 }}
            >
              {limpiandoIntentos ? 'Limpiando...' : 'Sí, eliminar intentos'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}