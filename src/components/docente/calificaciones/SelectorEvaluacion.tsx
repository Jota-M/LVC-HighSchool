'use client';
// components/docente/calificaciones/SelectorEvaluacion.tsx
//
// Panel izquierdo del módulo de calificaciones.
// Muestra TODAS las evaluaciones de la materia+trimestre agrupadas
// por dimensión, con barra de progreso de cuántos alumnos ya tienen nota.
// No incluye ningún botón de "crear evaluación".

import React, { useState } from 'react';
import {
  Box, Typography, Chip, Stack, Tooltip, LinearProgress,
  TextField, InputAdornment, Collapse, IconButton,
  CircularProgress, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SearchRoundedIcon       from '@mui/icons-material/SearchRounded';
import ExpandLessIcon          from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon          from '@mui/icons-material/ExpandMore';
import AssignmentRoundedIcon   from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded';
import ImageRoundedIcon        from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import RefreshRoundedIcon      from '@mui/icons-material/RefreshRounded';

import {
  Evaluacion, DIMENSIONES_CONFIG, DIMENSIONES_ORDEN,
  CodigoDimension, TIPOS_EVALUACION,
} from '@/types/notasTypes';

// ── Animaciones ────────────────────────────────────────────────────────────────
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ── Hook de paleta ─────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ── Tipos ──────────────────────────────────────────────────────────────────────
export interface EvaluacionConProgreso extends Evaluacion {
  /** Cantidad de alumnos que ya tienen nota en esta evaluación */
  con_nota:        number;
  /** Total de alumnos en la materia */
  total_alumnos:   number;
  /** Cantidad de ausentes */
  ausentes:        number;
}

// ── Card de evaluación individual ─────────────────────────────────────────────
const EvaluacionItem: React.FC<{
  evaluacion:  EvaluacionConProgreso;
  isSelected:  boolean;
  dimColor:    string;
  dimBgColor:  string;
  index:       number;
  onClick:     () => void;
}> = ({ evaluacion: ev, isSelected, dimColor, dimBgColor, index, onClick }) => {
  const { isDark, gradBg } = usePalette();

  const tipo         = TIPOS_EVALUACION.find(t => t.value === ev.tipo);
  const pct          = ev.total_alumnos > 0
    ? Math.round((ev.con_nota / ev.total_alumnos) * 100)
    : 0;
  const completa     = pct === 100;
  const barraColor   = completa ? '#16a34a' : dimColor;
  const barraGrad    = completa
    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
    : `linear-gradient(90deg, ${dimColor}, ${alpha(dimColor, 0.6)})`;

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        border: `1.5px solid ${isSelected
          ? dimColor
          : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isSelected
          ? isDark ? alpha(dimColor, 0.12) : alpha(dimBgColor, 0.55)
          : isDark ? alpha('#fff', 0.02) : '#fafafa',
        p: 1.5, cursor: 'pointer',
        animation: `${slideIn} 0.28s ease-out ${index * 0.05}s both`,
        transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          borderColor: dimColor,
          transform: 'translateY(-1px)',
          bgcolor: isDark ? alpha(dimColor, 0.08) : alpha(dimBgColor, 0.4),
          boxShadow: `0 4px 14px ${alpha(dimColor, 0.14)}`,
        },
      }}
    >
      {/* Fila superior: nombre + badge activa */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
        <AssignmentRoundedIcon sx={{
          fontSize: 15, mt: '1px', flexShrink: 0,
          color: isSelected ? dimColor : 'text.disabled',
        }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap
            sx={{ color: isSelected ? dimColor : 'text.primary', lineHeight: 1.25, fontSize: 13 }}>
            {ev.nombre}
          </Typography>
        </Box>
        {isSelected && (
          <Chip label="Activa" size="small"
            sx={{ bgcolor: alpha(dimColor, 0.18), color: dimColor,
                  fontWeight: 700, fontSize: 9, height: 16, flexShrink: 0 }} />
        )}
        {completa && !isSelected && (
          <Tooltip title="Todas las notas ingresadas">
            <CheckCircleRoundedIcon sx={{ fontSize: 15, color: '#16a34a', flexShrink: 0 }} />
          </Tooltip>
        )}
      </Box>

      {/* Chips de meta */}
      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
        {tipo && (
          <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
            sx={{ fontSize: 9, height: 17, bgcolor: isDark ? alpha('#fff', 0.07) : '#f0f0f0' }} />
        )}
        <Chip label={`Máx: ${ev.puntaje_maximo}`} size="small"
          sx={{ fontSize: 9, height: 17,
                bgcolor: isSelected ? alpha(dimColor, 0.15) : isDark ? alpha('#fff', 0.07) : '#f0f0f0',
                color: isSelected ? dimColor : undefined }} />
        {ev.fecha && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
            📅 {ev.fecha}
          </Typography>
        )}
        {ev.foto_url && (
          <Tooltip title="Tiene imagen adjunta">
            <ImageRoundedIcon sx={{ fontSize: 12, color: isDark ? '#facc15' : '#0288d1' }} />
          </Tooltip>
        )}
        {ev.pdf_url && (
          <Tooltip title="Tiene PDF adjunto">
            <PictureAsPdfRoundedIcon sx={{ fontSize: 12, color: '#dc2626' }} />
          </Tooltip>
        )}
      </Box>

      {/* Barra de progreso de notas */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, fontWeight: 600 }}>
            {ev.con_nota}/{ev.total_alumnos} notas ingresadas
            {ev.ausentes > 0 && ` · ${ev.ausentes} ausentes`}
          </Typography>
          <Typography variant="caption" fontWeight={800} sx={{ fontSize: 9, color: barraColor }}>
            {pct}%
          </Typography>
        </Box>
        <Box sx={{ height: 4, borderRadius: 2,
                   bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07), overflow: 'hidden' }}>
          <Box sx={{
            height: '100%', borderRadius: 2,
            width: `${pct}%`,
            background: barraGrad,
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </Box>
      </Box>
    </Box>
  );
};

// ── Sección por dimensión ──────────────────────────────────────────────────────
const SeccionDimension: React.FC<{
  codigo:       CodigoDimension;
  evaluaciones: EvaluacionConProgreso[];
  selectedId:   number | null;
  onSelect:     (ev: EvaluacionConProgreso) => void;
}> = ({ codigo, evaluaciones, selectedId, onSelect }) => {
  const { isDark } = usePalette();
  const [open, setOpen] = useState(true);
  const cfg = DIMENSIONES_CONFIG[codigo];

  const completadas  = evaluaciones.filter(e =>
    e.total_alumnos > 0 && e.con_nota >= e.total_alumnos
  ).length;
  const totalNotas   = evaluaciones.reduce((s, e) => s + e.con_nota, 0);
  const totalAlumnos = evaluaciones.reduce((s, e) => s + e.total_alumnos, 0);
  const pctGlobal    = totalAlumnos > 0 ? Math.round((totalNotas / totalAlumnos) * 100) : 0;

  return (
    <Box>
      {/* Cabecera de la dimensión */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.2, mb: 1,
          cursor: 'pointer', userSelect: 'none',
          p: 1, borderRadius: '10px',
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) },
          transition: 'background 0.15s',
        }}
      >
        {/* Indicador de color */}
        <Box sx={{
          width: 10, height: 10, borderRadius: '50%',
          bgcolor: cfg.color, flexShrink: 0,
          boxShadow: `0 0 6px ${alpha(cfg.color, 0.5)}`,
        }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" fontWeight={800}
              sx={{ color: cfg.color, fontSize: 11, letterSpacing: 0.3 }}>
              {cfg.label.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
              {cfg.porcentaje}%
            </Typography>
          </Box>
        </Box>

        {/* Stats globales */}
        <Chip
          label={`${completadas}/${evaluaciones.length} completas`}
          size="small"
          sx={{
            bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
            fontWeight: 700, fontSize: 9, height: 17,
          }}
        />
        <Chip
          label={`${pctGlobal}%`}
          size="small"
          sx={{
            bgcolor: pctGlobal === 100
              ? alpha('#16a34a', 0.15)
              : isDark ? alpha('#fff', 0.07) : '#f0f0f0',
            color: pctGlobal === 100 ? '#16a34a' : 'text.secondary',
            fontWeight: 700, fontSize: 9, height: 17,
          }}
        />

        <IconButton size="small" sx={{ color: 'text.disabled', p: 0.2 }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        {evaluaciones.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 2.5,
            borderRadius: '10px',
            border: `1.5px dashed ${alpha(cfg.color, 0.3)}`,
            bgcolor: isDark ? alpha(cfg.color, 0.04) : alpha(cfg.bgColor, 0.3),
            mb: 1,
          }}>
            <HourglassEmptyRoundedIcon sx={{ fontSize: 18, color: alpha(cfg.color, 0.5), mb: 0.5 }} />
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 10 }}>
              Sin evaluaciones en {cfg.label}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.8} sx={{ mb: 0.5 }}>
            {evaluaciones.map((ev, i) => (
              <EvaluacionItem
                key={ev.id}
                evaluacion={ev}
                isSelected={selectedId === ev.id}
                dimColor={cfg.color}
                dimBgColor={cfg.bgColor}
                index={i}
                onClick={() => onSelect(ev)}
              />
            ))}
          </Stack>
        )}
      </Collapse>
    </Box>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
interface SelectorEvaluacionProps {
  /** Evaluaciones con datos de progreso de notas */
  evaluaciones:  EvaluacionConProgreso[];
  /** ID de la evaluación actualmente seleccionada */
  selectedId:    number | null;
  isLoading:     boolean;
  onSelect:      (ev: EvaluacionConProgreso) => void;
  onRefrescar:   () => void;
}

const SelectorEvaluacion: React.FC<SelectorEvaluacionProps> = ({
  evaluaciones, selectedId, isLoading, onSelect, onRefrescar,
}) => {
  const { isDark, gold, gradBg } = usePalette();
  const [busqueda, setBusqueda]   = useState('');

  // Filtrar por búsqueda
  const filtradas = busqueda.trim()
    ? evaluaciones.filter(e =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.tipo ?? '').toLowerCase().includes(busqueda.toLowerCase())
      )
    : evaluaciones;

  // Agrupar por dimensión preservando el orden canónico
  const porDimension = DIMENSIONES_ORDEN.reduce<Record<CodigoDimension, EvaluacionConProgreso[]>>(
    (acc, k) => ({ ...acc, [k]: [] }),
    {} as Record<CodigoDimension, EvaluacionConProgreso[]>
  );
  filtradas.forEach(e => {
    const codigo = e.dimension_codigo as CodigoDimension;
    if (porDimension[codigo]) porDimension[codigo].push(e);
  });

  // Stats globales
  const totalEv      = evaluaciones.length;
  const totalNotas   = evaluaciones.reduce((s, e) => s + e.con_nota, 0);
  const totalAlumnos = evaluaciones.reduce((s, e) => s + e.total_alumnos, 0);
  const pctGlobal    = totalAlumnos > 0 ? Math.round((totalNotas / totalAlumnos) * 100) : 0;

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
      overflow: 'hidden',
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      {/* ── Header ── */}
      <Box sx={{
        px: 2, py: 1.8,
        background: gradBg,
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800}
            sx={{ color: isDark ? '#000' : '#fff', lineHeight: 1.2 }}>
            Evaluaciones
          </Typography>
          <Typography variant="caption"
            sx={{ color: isDark ? alpha('#000', 0.6) : alpha('#fff', 0.8), fontSize: 10 }}>
            {totalEv} evaluaciones · progreso global {pctGlobal}%
          </Typography>
        </Box>
        <Tooltip title="Refrescar lista">
          <IconButton size="small" onClick={onRefrescar}
            sx={{ color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.85),
                  '&:hover': { color: isDark ? '#000' : '#fff' } }}>
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Barra de progreso global ── */}
      <Box sx={{ px: 2, py: 1,
                 borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                 bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.7) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600 }}>
            Notas ingresadas en el trimestre
          </Typography>
          <Typography variant="caption" fontWeight={800}
            sx={{ fontSize: 10, color: pctGlobal === 100 ? '#16a34a' : gold }}>
            {totalNotas}/{totalAlumnos}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pctGlobal}
          sx={{
            height: 5, borderRadius: 3,
            bgcolor: isDark ? alpha('#fff', 0.08) : '#e9ecef',
            '& .MuiLinearProgress-bar': {
              background: pctGlobal === 100
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : gradBg,
              borderRadius: 3,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            },
          }}
        />
      </Box>

      {/* ── Búsqueda ── */}
      <Box sx={{ px: 2, py: 1.2,
                 borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)}` }}>
        <TextField
          size="small" fullWidth placeholder="Buscar evaluación..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', fontSize: 13,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold },
            },
          }}
        />
      </Box>

      {/* ── Lista de evaluaciones ── */}
      <Box sx={{ p: 1.5, maxHeight: 580, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ color: gold }} />
            <Typography variant="caption" color="text.secondary"
              sx={{ display: 'block', mt: 1, fontSize: 11 }}>
              Cargando evaluaciones...
            </Typography>
          </Box>
        ) : totalEv === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 5,
            borderRadius: '12px',
            border: `1.5px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}>
            <AssignmentRoundedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled" fontWeight={600}>
              Sin evaluaciones creadas
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
              Creá evaluaciones desde el módulo de Notas
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {DIMENSIONES_ORDEN.map(codigo => (
              porDimension[codigo] !== undefined && (
                // Solo mostrar dimensiones que tienen evaluaciones (o todas si no hay filtro)
                (!busqueda.trim() || porDimension[codigo].length > 0) && (
                  <SeccionDimension
                    key={codigo}
                    codigo={codigo}
                    evaluaciones={porDimension[codigo]}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                )
              )
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default SelectorEvaluacion;
export type { SelectorEvaluacionProps };