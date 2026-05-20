'use client';
// app/dashboard/docente/notas/[id]/nueva/page.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Container, Typography, useTheme, alpha, Fade,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Stack, Chip, Button, IconButton, Switch,
  FormControlLabel, Divider, LinearProgress, Tooltip,
  CircularProgress, Alert,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon      from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon    from '@mui/icons-material/CheckCircleRounded';
import ImageRoundedIcon          from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon   from '@mui/icons-material/PictureAsPdfRounded';
import AddCircleOutlineIcon      from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon         from '@mui/icons-material/DeleteOutline';
import CloseIcon                 from '@mui/icons-material/Close';
import VisibilityRoundedIcon     from '@mui/icons-material/VisibilityRounded';
import AssignmentRoundedIcon     from '@mui/icons-material/AssignmentRounded';
import CalendarTodayRoundedIcon  from '@mui/icons-material/CalendarTodayRounded';
import ScaleRoundedIcon          from '@mui/icons-material/ScaleRounded';
import GroupsRoundedIcon         from '@mui/icons-material/GroupsRounded';
import BookmarkRoundedIcon       from '@mui/icons-material/BookmarkRounded';
import AutoAwesomeRoundedIcon    from '@mui/icons-material/AutoAwesomeRounded';

import { useParams, useRouter } from 'next/navigation';
import { useMisMateriasNotas, useDimensiones, useEvaluaciones, useTemario } from '@/hooks/useNotas';
import {
  MateriaDocenteNotas, Evaluacion, CrearEvaluacionDTO,
  CriterioRubrica, TIPOS_EVALUACION, DIMENSIONES_CONFIG,
  DIMENSIONES_ORDEN, CodigoDimension,
  TIPOS_POR_DIMENSION, PREGUNTAS_AUTOEVALUACION, generarNombreDefault,
} from '@/types/notasTypes';

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
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
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
    borderRadius: '10px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
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
  const suma   = criterios.reduce((s, c) => s + Number(c.puntos_posibles || 0), 0);
  const excede = suma > puntajeMaximo;
  const pct    = puntajeMaximo > 0 ? Math.min((suma / puntajeMaximo) * 100, 100) : 0;

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
        border: `1px solid ${excede ? alpha('#dc2626', 0.3) : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
          <Typography variant="caption" color="text.secondary">Suma de criterios</Typography>
          <Typography variant="caption" fontWeight={700}
            sx={{ color: excede ? '#dc2626' : '#16a34a' }}>
            {suma} / {puntajeMaximo} pts
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={pct}
          sx={{
            height: 5, borderRadius: 4,
            bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
            '& .MuiLinearProgress-bar': {
              background: excede ? '#dc2626' : `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
              borderRadius: 4,
            },
          }}
        />
        {excede && (
          <Typography variant="caption" sx={{ color: '#dc2626', mt: 0.5, display: 'block' }}>
            La suma supera el puntaje máximo
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
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              bgcolor: alpha(accentColor, 0.15),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: accentColor,
            }}>
              {i + 1}
            </Box>
            <TextField
              size="small" placeholder={`Criterio ${i + 1}...`}
              value={c.criterio}
              onChange={e => upd(i, 'criterio', e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px', fontSize: 13,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                },
              }}
            />
            <TextField
              size="small" type="number" placeholder="Pts"
              value={c.puntos_posibles || ''}
              onChange={e => upd(i, 'puntos_posibles', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.5 }}
              sx={{
                width: 72,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px', fontSize: 13,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                },
              }}
            />
            <IconButton size="small" onClick={() => del(i)}
              sx={{ color: isDark ? alpha('#fff', 0.25) : '#d1d5db', '&:hover': { color: '#dc2626' } }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Button
        size="small" startIcon={<AddCircleOutlineIcon />} onClick={agregar}
        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, color: accentColor, borderRadius: '8px' }}
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
  const cfg    = DIMENSIONES_CONFIG[codigo] ?? DIMENSIONES_CONFIG['SAB'];
  const tipo   = TIPOS_EVALUACION.find(t => t.value === evaluacion.tipo);

  const filas = [
    { label: 'Materia',       value: materia.materia_nombre },
    { label: 'Grado',         value: `${materia.grado_nombre} "${materia.paralelo_nombre}"` },
    { label: 'Trimestre',     value: materia.trimestre_nombre ?? '—' },
    { label: 'Dimensión',     value: `${cfg.label} (${cfg.porcentaje}%)` },
    { label: 'Tipo',          value: tipo ? `${tipo.icon} ${tipo.label}` : '—' },
    { label: 'Puntaje máx',   value: `${evaluacion.puntaje_maximo} pts` },
    { label: 'Peso',          value: evaluacion.peso_en_dimension ?? '—' },
    { label: 'Fecha',         value: evaluacion.fecha ?? '—' },
    { label: 'Visible',       value: evaluacion.visible_para_padres ? 'Sí, publicada' : 'No publicada' },
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
                    {tipo && (
                      <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
                        sx={{ fontSize: 11, bgcolor: isDark ? alpha('#fff', 0.08) : '#f0f0f0' }} />
                    )}
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
                  { icon: <ScaleRoundedIcon sx={{ fontSize: 16 }} />,        label: 'Puntaje',     value: `${evaluacion.puntaje_maximo} pts` },
                  { icon: <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />, label: 'Fecha',       value: evaluacion.fecha ?? 'Sin fecha' },
                  { icon: <GroupsRoundedIcon sx={{ fontSize: 16 }} />,        label: 'Estudiantes', value: `${materia.total_estudiantes}` },
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

      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth disabled={isLoading}>
          <InputLabel sx={{ '&.Mui-focused': { color: accentColor } }}>Unidad temática</InputLabel>
          <Select
            value={unidadSel}
            label="Unidad temática"
            onChange={e => {
              const val = e.target.value as number | '';
              setUnidadSel(val);
              onChange(undefined);
            }}
            sx={{
              borderRadius: '10px',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
            }}
          >
            <MenuItem value=""><em>Sin unidad</em></MenuItem>
            {unidades.map(u => (
              <MenuItem key={u.id} value={u.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                    bgcolor: alpha(accentColor, 0.15),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: accentColor,
                  }}>
                    {u.numero}
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: 13 }}>{u.titulo}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {unidadSel !== '' && (
          <Fade in timeout={200}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ '&.Mui-focused': { color: accentColor } }}>Tema</InputLabel>
              <Select
                value={temaId ?? ''}
                label="Tema"
                onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
                sx={{
                  borderRadius: '10px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                }}
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

  const [asignacionId, periodoId] = String(params.id ?? '').split('-').map(Number);

  const { materias, isLoading: loadingMaterias } = useMisMateriasNotas();
  const { dimensiones }                          = useDimensiones();
  const { crear, isSubmitting }                  = useEvaluaciones({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  });

  const seleccionada = materias.find(
    m => m.asignacion_id === asignacionId && m.periodo_evaluacion_id === periodoId,
  );

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [dimTab, setDimTab]   = useState(0);
  const [created, setCreated] = useState<Evaluacion | null>(null);

  const dimActiva: CodigoDimension = DIMENSIONES_ORDEN[dimTab];
  const cfg         = DIMENSIONES_CONFIG[dimActiva];
  const accentColor = cfg.color;
  const esAUT       = dimActiva === 'AUT';
  const esSER       = dimActiva === 'SER';

  const dimActObj = dimensiones.find(d => d.codigo === dimActiva);

  // Tipos filtrados según dimensión activa
  const tiposDimension = TIPOS_EVALUACION.filter(t =>
    TIPOS_POR_DIMENSION[dimActiva].includes(t.value)
  );

  const [form, setForm] = useState<Partial<CrearEvaluacionDTO>>({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
    puntaje_maximo:        100,
    peso_en_dimension:     1,
    visible_para_padres:   false,
  });
  const [tipo, setTipo]           = useState<string>('examen');
  const [criterios, setCriterios] = useState<CriterioRubrica[]>([]);
  const [foto, setFoto]           = useState<File | null>(null);
  const [pdf, setPdf]             = useState<File | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const pdfRef  = useRef<HTMLInputElement>(null);

  const set = (k: keyof CrearEvaluacionDTO, v: any) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit = !!form.nombre?.trim() && !!dimActObj;

  // Sincronizar dimension_evaluacion_id + resetear tipo al cambiar tab
  useEffect(() => {
    if (dimActObj) set('dimension_evaluacion_id', dimActObj.id);
    const primero = TIPOS_POR_DIMENSION[dimActiva][0];
    if (primero) setTipo(primero);
  }, [dimActObj?.id]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const data: CrearEvaluacionDTO = {
      ...(form as CrearEvaluacionDTO),
      tipo: esAUT ? undefined : (tipo as any),
      dimension_evaluacion_id: dimActObj!.id,
      // AUT no necesita puntaje complejo
      puntaje_maximo:    esAUT ? 5 : (form.puntaje_maximo ?? 100),
      peso_en_dimension: esAUT ? 1 : (form.peso_en_dimension ?? 1),
    };
    const ev = await crear(
      data,
      foto ?? undefined,
      pdf ?? undefined,
      criterios.filter(c => c.criterio.trim()).length > 0 ? criterios : undefined,
    );
    if (ev) setCreated(ev);
  }, [form, tipo, dimActObj, foto, pdf, criterios, crear, canSubmit, esAUT]);

  const handleNueva = () => {
    setCreated(null);
    setForm({
      asignacion_docente_id: asignacionId,
      periodo_evaluacion_id: periodoId,
      puntaje_maximo:        100,
      peso_en_dimension:     1,
      visible_para_padres:   false,
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

  // ── Tabs de dimensión compartidos ─────────────────────────────────────────
  const DimTabs = (
    <Box sx={{
      background: gradBg, borderRadius: '16px', p: 1, mb: 3,
      backdropFilter: 'blur(20px)',
      display: 'flex', gap: 0.5,
      overflowX: 'auto',
    }}>
      {DIMENSIONES_ORDEN.map((k, i) => {
        const c        = DIMENSIONES_CONFIG[k];
        const isActive = i === dimTab;
        return (
          <Box
            key={k}
            onClick={() => !created && setDimTab(i)}
            sx={{
              flex: 1, minWidth: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              px: 1.5, py: 1.2, borderRadius: '12px',
              cursor: created ? 'default' : 'pointer',
              bgcolor: isActive
                ? (isDark ? alpha('#000', 0.25) : alpha('#fff', 0.3))
                : 'transparent',
              transition: 'background .15s',
              '&:hover': !created
                ? { bgcolor: isDark ? alpha('#000', 0.15) : alpha('#fff', 0.2) }
                : {},
            }}
          >
            <Typography variant="caption" fontWeight={isActive ? 800 : 600}
              sx={{ color: isDark ? '#000' : '#fff', fontSize: 13, whiteSpace: 'nowrap' }}>
              {c.label}
            </Typography>
            <Box sx={{
              fontSize: 10, fontWeight: 700,
              bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
              color:   isDark ? '#000' : '#fff',
              borderRadius: '8px', px: 0.8, py: 0.2, lineHeight: 1.4, flexShrink: 0,
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
      <Container maxWidth="lg">
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
                    Nueva Evaluación
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {seleccionada.materia_nombre} · {seleccionada.grado_nombre} "{seleccionada.paralelo_nombre}" · {seleccionada.trimestre_nombre}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabs dimensión */}
            {DimTabs}

            {/* Formulario */}
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
                          {esSER && 'En Ser calificás mediante observación directa. No se necesita examen — registrá actitudes, participación y convivencia.'}
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
                      fullWidth size="small"
                      placeholder={
                        esAUT ? 'Ej: Autoevaluación trimestre 1...' :
                        esSER ? 'Ej: Observación semana 3, Conducta mayo...' :
                        'Ej: Práctica de laboratorio U2, Examen parcial...'
                      }
                      value={form.nombre ?? ''}
                      onChange={e => set('nombre', e.target.value)}
                      sx={inputSx(accentColor)}
                    />

                    {/* ── Tipo — oculto para AUT, filtrado por dimensión para SER/SAB/HAC ── */}
                    {!esAUT && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}
                          sx={{ mb: 1, display: 'block' }}>
                          Tipo de evaluación
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {tiposDimension.map(t => {
                            const sel = tipo === t.value;
                            return (
                              <Box
                                key={t.value}
                                onClick={() => setTipo(t.value)}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 0.8,
                                  px: 1.5, py: 0.9, borderRadius: '10px', cursor: 'pointer',
                                  border: `1.5px solid ${sel ? accentColor : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                  bgcolor: sel ? alpha(accentColor, isDark ? 0.15 : 0.08) : isDark ? alpha('#fff', 0.02) : '#fafafa',
                                  transition: 'all .15s',
                                  '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.06) },
                                }}
                              >
                                <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</Typography>
                                <Typography variant="caption" fontWeight={sel ? 700 : 500}
                                  sx={{ color: sel ? accentColor : 'text.secondary', fontSize: 12 }}>
                                  {t.label}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
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
                      </Box>
                    )}

                    {/* ── Selector tema — solo SAB y HAC (tiene más sentido pedagógico) ── */}
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

                    {/* ── Puntaje / peso / fechas — oculto para AUT ── */}
                    {!esAUT && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <TextField
                            label="Puntaje máximo *" type="number" fullWidth size="small"
                            value={form.puntaje_maximo ?? (esSER ? 10 : 100)}
                            onChange={e => set('puntaje_maximo', parseFloat(e.target.value))}
                            inputProps={{ min: 1, step: 1 }}
                            sx={inputSx(accentColor)}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <TextField
                            label="Peso en dimensión" type="number" fullWidth size="small"
                            helperText="Peso relativo"
                            value={form.peso_en_dimension ?? 1}
                            onChange={e => set('peso_en_dimension', parseFloat(e.target.value))}
                            inputProps={{ min: 0.1, step: 0.1 }}
                            sx={inputSx(accentColor)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Fecha" type="date" fullWidth size="small"
                            InputLabelProps={{ shrink: true }}
                            value={form.fecha ?? ''}
                            onChange={e => set('fecha', e.target.value || undefined)}
                            sx={inputSx(accentColor)}
                          />
                        </Grid>
                        {/* Fecha límite solo para tarea/proyecto */}
                        {(tipo === 'tarea' || tipo === 'proyecto') && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Fecha límite" type="datetime-local" fullWidth size="small"
                              InputLabelProps={{ shrink: true }}
                              helperText="Entrega máxima"
                              value={form.fecha_limite ?? ''}
                              onChange={e => set('fecha_limite', e.target.value || undefined)}
                              sx={inputSx(accentColor)}
                            />
                          </Grid>
                        )}
                      </Grid>
                    )}

                    {/* ── Observaciones — solo SER ── */}
                    {esSER && (
                      <TextField
                        label="Observaciones del comportamiento"
                        fullWidth size="small" multiline rows={2}
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
                        fullWidth size="small" multiline rows={2}
                        value={form.instrucciones ?? ''}
                        onChange={e => set('instrucciones', e.target.value)}
                        sx={inputSx(accentColor)}
                      />
                    )}

                    {/* Descripción interna — todas las dimensiones */}
                    {!esSER && (
                      <TextField
                        label={esAUT ? 'Instrucción general para el estudiante' : 'Descripción interna'}
                        fullWidth size="small" multiline rows={2}
                        placeholder={esAUT ? 'Contexto para que el estudiante complete la autoevaluación...' : ''}
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
                          {esSER  && 'Los padres verán el comentario, sin nota numérica'}
                          {esAUT  && 'El estudiante accede desde la app para completarla'}
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

              {/* ── Bloque 2: Adjuntos — oculto para AUT ── */}
              {!esAUT && (
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

              {/* ── Bloque 3: Rúbrica — oculto para AUT ── */}
              {!esAUT && (
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
                    puntajeMaximo={form.puntaje_maximo ?? (esSER ? 10 : 100)}
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
                      opacity:    (!canSubmit || isSubmitting) ? 1 : 0.88,
                      transform:  (!canSubmit || isSubmitting) ? 'none' : 'translateY(-1px)',
                    },
                  }}
                >
                  {isSubmitting ? (
                    <><CircularProgress size={16} sx={{ color: isDark ? '#000' : '#fff' }} /> Creando...</>
                  ) : (
                    <>
                      <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                      {esAUT ? 'Crear autoevaluación' : esSER ? 'Registrar observación' : 'Crear evaluación'}
                    </>
                  )}
                </Box>
              </Box>

            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}