'use client';
// components/docente/notas/IngresarNotas.tsx
import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Chip, Button, TextField, Tooltip,
  Stack, LinearProgress, CircularProgress, IconButton,
  Collapse, useTheme, alpha, Grid,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SaveRoundedIcon     from '@mui/icons-material/SaveRounded';
import SearchRoundedIcon   from '@mui/icons-material/SearchRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import CommentRoundedIcon  from '@mui/icons-material/CommentRounded';
import ExpandLessIcon      from '@mui/icons-material/ExpandLess';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import TrendingDownIcon    from '@mui/icons-material/TrendingDown';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import {
  CalificacionEstudiante, Evaluacion, RegistroCalificacionItem,
  NotaDimension, DIMENSIONES_CONFIG, DIMENSIONES_ORDEN, CodigoDimension,
  TIPOS_EVALUACION,
} from '@/types/notasTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const shimmerBar = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const countUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Hook de paleta ───────────────────────────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

const TIPOS_MAP: Record<string, string> = {
  examen: '📝 Examen', practica: '🔬 Práctica', tarea: '📚 Tarea',
  proyecto: '🎯 Proyecto', participacion: '🙋 Participación',
  exposicion: '🎤 Exposición', trabajo_grupal: '👥 Trabajo Grupal',
};

// ─── Fila de estudiante ───────────────────────────────────────────────────────
const FilaNota: React.FC<{
  estudiante: CalificacionEstudiante;
  numero: number;
  nota?: RegistroCalificacionItem;
  puntajeMaximo: number;
  dimensionColor: string;
  onSetNota: (datos: Partial<RegistroCalificacionItem>) => void;
  onMarcarAusente: (ausente: boolean) => void;
}> = ({ estudiante, numero, nota, puntajeMaximo, dimensionColor, onSetNota, onMarcarAusente }) => {
  const { isDark, gold, gradBg } = usePalette();
  const [showObs, setShowObs] = useState(false);
  const [obs, setObs] = useState(nota?.observacion ?? '');

  const puntaje = nota?.puntaje_obtenido ?? '';
  const ausente = nota?.esta_ausente ?? false;
  const pct = typeof puntaje === 'number' ? Math.round((puntaje / puntajeMaximo) * 100) : null;
  const colorNota = pct !== null ? (pct >= 51 ? '#16a34a' : '#dc2626') : dimensionColor;

  // Iniciales
  const iniciales = `${(estudiante.estudiante_apellidos ?? '')[0] ?? ''}${(estudiante.estudiante_nombres ?? '')[0] ?? ''}`.toUpperCase();

  return (
    <Box sx={{
      borderRadius: '12px',
      border: `1.5px solid ${
        ausente
          ? alpha('#dc2626', 0.3)
          : nota
            ? alpha(colorNota, 0.25)
            : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07)
      }`,
      bgcolor: ausente
        ? isDark ? alpha('#dc2626', 0.05) : '#fff5f5'
        : nota
          ? isDark ? alpha(colorNota, 0.04) : alpha('#f0fdf4', 0.5)
          : isDark ? alpha('#fff', 0.02) : '#fafafa',
      animation: `${slideDown} 0.25s ease-out`,
      transition: 'border-color 0.15s, background 0.15s',
      '&:hover': {
        borderColor: ausente ? alpha('#dc2626', 0.5) : alpha(dimensionColor, 0.4),
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2 }}>
        {/* Número */}
        <Typography variant="caption" fontWeight={700}
          sx={{ minWidth: 18, textAlign: 'center', color: 'text.disabled', fontSize: 11 }}>
          {numero}
        </Typography>

        {/* Avatar */}
        <Avatar
          src={estudiante.estudiante_foto ?? undefined}
          sx={{
            width: 32, height: 32, fontSize: 11, fontWeight: 800,
            background: nota ? undefined : gradBg,
            bgcolor: nota ? colorNota : undefined,
            border: nota ? `2px solid ${alpha(colorNota, 0.4)}` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {iniciales}
        </Avatar>

        {/* Nombre */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap
            sx={{ color: ausente ? '#dc2626' : nota ? colorNota : 'text.primary', fontSize: 13 }}>
            {estudiante.estudiante_apellidos}, {estudiante.estudiante_nombres}
          </Typography>
          <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: 10 }}>
            {estudiante.estudiante_codigo}
          </Typography>
        </Box>

        {/* Controles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0 }}>
          <Tooltip title={ausente ? 'Ausente (0)' : `Nota sobre ${puntajeMaximo}`}>
            <TextField
              size="small" type="number" disabled={ausente}
              value={ausente ? 0 : puntaje}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onSetNota({
                  matricula_id:     estudiante.matricula_id,
                  puntaje_obtenido: isNaN(val) ? 0 : Math.min(val, puntajeMaximo),
                  esta_ausente:     false,
                });
              }}
              inputProps={{ min: 0, max: puntajeMaximo, step: 0.5 }}
              sx={{
                width: 74,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', fontSize: 14, fontWeight: 800,
                  '& input': {
                    textAlign: 'center',
                    color: nota && !ausente ? colorNota : undefined,
                    WebkitTextFillColor: ausente ? '#dc2626 !important' : undefined,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: dimensionColor },
                  '&:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
                    borderColor: nota ? alpha(colorNota, 0.5) : undefined,
                  },
                },
              }}
            />
          </Tooltip>

          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, minWidth: 22 }}>
            /{puntajeMaximo}
          </Typography>

          <Tooltip title={ausente ? 'Quitar ausente' : 'Marcar ausente'}>
            <IconButton size="small" onClick={() => onMarcarAusente(!ausente)}
              sx={{
                color: ausente ? '#dc2626' : isDark ? alpha('#fff', 0.25) : '#d1d5db',
                '&:hover': { color: '#dc2626' },
              }}>
              <PersonOffRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Observación">
            <IconButton size="small" onClick={() => setShowObs(s => !s)}
              sx={{
                color: obs ? '#f59e0b' : isDark ? alpha('#fff', 0.25) : '#d1d5db',
                '&:hover': { color: '#f59e0b' },
              }}>
              {showObs ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <CommentRoundedIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={showObs}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField size="small" fullWidth placeholder="Observación opcional..."
            value={obs}
            onChange={e => setObs(e.target.value)}
            onBlur={() => onSetNota({ observacion: obs || undefined })}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '10px' } }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── IngresarNotas ────────────────────────────────────────────────────────────
interface IngresarNotasProps {
  lista: CalificacionEstudiante[];
  notas: Record<number, RegistroCalificacionItem>;
  evaluacion: Evaluacion | null;
  isLoading: boolean;
  isSaving: boolean;
  porcentajeCompletado: number;
  onSetNota: (matricula_id: number, datos: Partial<RegistroCalificacionItem>) => void;
  onMarcarAusente: (matricula_id: number, ausente: boolean) => void;
  onGuardar: () => void;
}

export const IngresarNotas: React.FC<IngresarNotasProps> = ({
  lista, notas, evaluacion, isLoading, isSaving,
  porcentajeCompletado, onSetNota, onMarcarAusente, onGuardar,
}) => {
  const { isDark, gold, gradBg } = usePalette();
  const [busqueda, setBusqueda] = useState('');

  // Estado vacío — sin evaluación seleccionada
  if (!evaluacion) return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
      py: 7, textAlign: 'center',
    }}>
      <Typography color="text.disabled" fontWeight={600} variant="body2">
        Seleccioná una evaluación para ingresar notas
      </Typography>
    </Box>
  );

  const codigo    = evaluacion.dimension_codigo as CodigoDimension;
  const cfg       = DIMENSIONES_CONFIG[codigo];
  const color     = cfg?.color ?? gold;
  const completados = Object.keys(notas).length;

  const listaFiltrada = busqueda.trim()
    ? lista.filter(e =>
        `${e.estudiante_nombres} ${e.estudiante_apellidos} ${e.estudiante_codigo}`
          .toLowerCase().includes(busqueda.toLowerCase())
      )
    : lista;

  if (isLoading) return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      py: 6, textAlign: 'center',
    }}>
      <CircularProgress size={28} sx={{ color }} />
      <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1.5 }}>
        Cargando lista de estudiantes...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
      overflow: 'hidden',
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8f9fa', 0.8),
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {evaluacion.nombre}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={cfg?.label ?? codigo} size="small"
                sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 700, fontSize: 11, height: 20 }}
              />
              <Chip
                label={`Máx: ${evaluacion.puntaje_maximo}`} size="small"
                sx={{ fontSize: 11, height: 20, bgcolor: isDark ? alpha('#fff', 0.07) : '#f0f0f0' }}
              />
              {evaluacion.tipo && (
                <Chip
                  label={TIPOS_MAP[evaluacion.tipo] ?? evaluacion.tipo} size="small"
                  sx={{ fontSize: 11, height: 20, bgcolor: isDark ? alpha('#fff', 0.07) : '#f0f0f0' }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Barra de progreso */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {completados}/{lista.length} notas ingresadas
            </Typography>
            <Typography variant="caption" fontWeight={800}
              sx={{ color: porcentajeCompletado === 100 ? '#16a34a' : gold }}>
              {Math.round(porcentajeCompletado)}%
            </Typography>
          </Box>
          <Box sx={{ height: 6, borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.08) : '#e9ecef', overflow: 'hidden' }}>
            <Box sx={{
              height: '100%',
              width: `${porcentajeCompletado}%`,
              borderRadius: 4,
              background: porcentajeCompletado === 100
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : gradBg,
              backgroundSize: '200% 100%',
              animation: porcentajeCompletado < 100 ? `${shimmerBar} 2s linear infinite` : 'none',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </Box>
          {porcentajeCompletado === 100 && (
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> ¡Todas las notas ingresadas!
            </Typography>
          )}
        </Box>
      </Box>

      {/* Búsqueda */}
      <Box sx={{
        px: 2.5, py: 1.2,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)}`,
      }}>
        <TextField
          size="small" fullWidth placeholder="Buscar estudiante..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 17 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold },
            },
          }}
        />
      </Box>

      {/* Lista de estudiantes */}
      <Box sx={{ p: 2, maxHeight: 480, overflowY: 'auto' }}>
        {lista.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">Sin estudiantes en la lista</Typography>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {listaFiltrada.map((est, idx) => (
              <FilaNota
                key={est.matricula_id}
                estudiante={est}
                numero={idx + 1}
                nota={notas[est.matricula_id]}
                puntajeMaximo={evaluacion.puntaje_maximo}
                dimensionColor={color}
                onSetNota={datos => onSetNota(est.matricula_id, datos)}
                onMarcarAusente={ausente => onMarcarAusente(est.matricula_id, ausente)}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 2.5, py: 1.75,
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.6),
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5,
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
          {completados} de {lista.length} notas · {lista.length - completados} pendientes
        </Typography>
        <Box
          component="button"
          onClick={onGuardar}
          disabled={isSaving || completados === 0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.8,
            px: 2.5, py: 0.9,
            borderRadius: '12px', border: 'none',
            background: completados > 0 ? gradBg : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
            color: completados > 0 ? (isDark ? '#000' : '#fff') : 'text.disabled',
            fontWeight: 700, fontSize: 13,
            cursor: isSaving || completados === 0 ? 'default' : 'pointer',
            transition: 'opacity 0.2s, transform 0.15s',
            '&:hover': {
              opacity: (isSaving || completados === 0) ? 1 : 0.88,
              transform: (isSaving || completados === 0) ? 'none' : 'translateY(-1px)',
            },
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          {isSaving
            ? <CircularProgress size={14} sx={{ color: isDark ? '#000' : '#fff' }} />
            : <SaveRoundedIcon sx={{ fontSize: 16 }} />}
          {isSaving ? 'Guardando...' : `Guardar (${completados})`}
        </Box>
      </Box>
    </Box>
  );
};

// ─── ResumenDimensiones ───────────────────────────────────────────────────────
interface ResumenDimensionesProps {
  notas: NotaDimension[];
  isLoading?: boolean;
  notaFinal?: number | null;
  notaMinima?: number;
}

export const ResumenDimensiones: React.FC<ResumenDimensionesProps> = ({
  notas, isLoading = false, notaFinal, notaMinima = 51,
}) => {
  const { isDark, gold, gradBg } = usePalette();

  if (isLoading) return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
      {[0, 1, 2, 3].map(i => (
        <Box key={i} sx={{
          height: 90, borderRadius: '12px',
          bgcolor: isDark ? alpha('#fff', 0.05) : '#f3f4f6',
          animation: `${countUp} 0.4s ease-out ${i * 0.07}s both`,
        }} />
      ))}
    </Box>
  );

  if (notas.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 3,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
      borderRadius: '12px',
      border: `1.5px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
    }}>
      <Typography variant="caption" color="text.disabled" fontWeight={600}>
        Las notas por dimensión aparecerán aquí después de guardar
      </Typography>
    </Box>
  );

  const aprobado = notaFinal != null ? notaFinal >= notaMinima : null;

  return (
    <Box>
      {/* Cards de las 4 dimensiones */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: notaFinal != null ? 1.5 : 0 }}>
        {DIMENSIONES_ORDEN.map((codigo, i) => {
          const nd  = notas.find(n => n.dimension_codigo === codigo);
          const cfg = DIMENSIONES_CONFIG[codigo];
          const nota = nd?.nota_promedio != null ? parseFloat(String(nd.nota_promedio)) : null;
          const aprobadoDim = nota !== null ? nota >= notaMinima : null;

          return (
            <Box key={codigo} sx={{
              borderRadius: '12px', p: 1.75,
              border: `1.5px solid ${alpha(cfg.color, 0.3)}`,
              bgcolor: isDark ? alpha(cfg.color, 0.07) : alpha(cfg.bgColor, 0.5),
              animation: `${countUp} 0.4s ease-out ${i * 0.08}s both`,
              textAlign: 'center',
            }}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: cfg.color, display: 'block', mb: 0.5, lineHeight: 1.3, fontSize: 11 }}>
                {cfg.label}
                <Box component="span" sx={{ opacity: 0.75, fontWeight: 500 }}> · {cfg.porcentaje}%</Box>
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{
                color: nota !== null
                  ? (aprobadoDim ? '#16a34a' : '#dc2626')
                  : 'text.disabled',
                letterSpacing: -1, lineHeight: 1.1,
              }}>
                {nota !== null ? nota.toFixed(1) : '–'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {nd?.total_evaluaciones ?? 0} eval.
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Nota final ponderada */}
      {notaFinal != null && (
        <Box sx={{
          borderRadius: '12px', p: 2,
          border: `1.5px solid ${alpha(aprobado ? '#16a34a' : '#dc2626', 0.35)}`,
          bgcolor: isDark
            ? alpha(aprobado ? '#16a34a' : '#dc2626', 0.07)
            : alpha(aprobado ? '#dcfce7' : '#fee2e2', 0.6),
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1,
        }}>
          <Box>
            <Typography variant="body2" fontWeight={800}>Nota Final Ponderada</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              SER×10% + SAB×40% + HAC×45% + AUTO×5%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant="h4" fontWeight={900}
              sx={{ color: aprobado ? '#16a34a' : '#dc2626', letterSpacing: -1, lineHeight: 1 }}>
              {notaFinal.toFixed(1)}
            </Typography>
            <Chip
              label={aprobado ? '✓ Aprobado' : '✗ Reprobado'}
              size="small"
              icon={aprobado
                ? <TrendingUpIcon sx={{ fontSize: '13px !important' }} />
                : <TrendingDownIcon sx={{ fontSize: '13px !important' }} />}
              sx={{
                mt: 0.5,
                bgcolor: aprobado ? alpha('#16a34a', 0.15) : alpha('#dc2626', 0.15),
                color: aprobado ? '#16a34a' : '#dc2626',
                fontWeight: 700, fontSize: 10, height: 20,
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};