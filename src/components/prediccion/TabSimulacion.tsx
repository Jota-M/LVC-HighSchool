'use client';
/**
 * components/prediccion/TabSimulacion.tsx — v2
 *
 * Cambios respecto al original:
 *   - Sección "Simulación Óptima" nueva encima de los sliders manuales
 *     con tres botones: "Mínimo para aprobar", "Lograr nota X", "Sin contar asistencia"
 *   - ResultadoOptimo: muestra acciones como cards con barra de progreso,
 *     nota actual → proyectada, y badge de dificultad
 *   - Los sliders manuales siguen funcionando igual que antes
 *   - useSimulacionOptimo importado desde hooks/usePrediccion
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Autocomplete, TextField, Avatar,
  CircularProgress, Alert, Chip, Button, alpha,
  IconButton, Tooltip, Paper, Divider, LinearProgress,
  Fade, Collapse, Slider,
} from '@mui/material';
import { keyframes } from '@mui/system';

import TuneRoundedIcon          from '@mui/icons-material/TuneRounded';
import PersonSearchRoundedIcon  from '@mui/icons-material/PersonSearchRounded';
import TrendingDownRoundedIcon  from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon    from '@mui/icons-material/TrendingUpRounded';
import TrendingFlatRoundedIcon  from '@mui/icons-material/TrendingFlatRounded';
import AutoAwesomeRoundedIcon   from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon         from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon         from '@mui/icons-material/InfoOutlined';
import EmojiEventsRoundedIcon   from '@mui/icons-material/EmojiEventsRounded';
import RestartAltRoundedIcon    from '@mui/icons-material/RestartAltRounded';
import ArrowForwardRoundedIcon  from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon          from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon  from '@mui/icons-material/TrackChangesRounded';
import BlockRoundedIcon         from '@mui/icons-material/BlockRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningAmberRoundedIcon  from '@mui/icons-material/WarningAmberRounded';

import { EstudianteClase, NIVELES_RIESGO, PrediccionMeta, AccionRequerida } from '@/types/prediccionTypes';
import { usePrediccionClase, usePrediccionEstudiante, useSimulacionOptimo } from '@/hooks/usePrediccion';
import prediccionService from '@/services/prediccionService';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.92); }
  70%  { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
`;

// ── Helpers ───────────────────────────────────────────────────
const getNivel = (v: string) => NIVELES_RIESGO.find(n => n.value === v) ?? NIVELES_RIESGO[0];

function getInitials(nombre: string) {
  return nombre.split(',')[0].trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function estimarDeltaNota(valorNuevo: number, valorActual: number | null, peso: number): number | null {
  if (valorActual === null || peso === 0) return null;
  return parseFloat(((valorNuevo - valorActual) * peso).toFixed(1));
}

// ── NivelChip ─────────────────────────────────────────────────
const NivelChip: React.FC<{ nivel: string; size?: 'small' | 'medium' }> = ({ nivel, size = 'small' }) => {
  const cfg = getNivel(nivel);
  return (
    <Chip size={size} label={cfg.label} sx={{
      bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 700,
      border: `1px solid ${cfg.borderColor}`,
      fontSize: size === 'small' ? 10 : 12,
    }} />
  );
};

// ══════════════════════════════════════════════════════════════
// SECCIÓN SIMULACIÓN ÓPTIMA — NUEVA
// ══════════════════════════════════════════════════════════════

const COLOR_DIFICULTAD: Record<string, string> = {
  baja:  '#16a34a',
  media: '#d97706',
  alta:  '#dc2626',
};

const AccionCard: React.FC<{ accion: AccionRequerida; index: number; isDark: boolean }> = ({
  accion, index, isDark,
}) => {
  const color   = COLOR_DIFICULTAD[accion.dificultad] ?? '#6b7280';
  const pctActual  = accion.valor_actual;
  const pctNuevo   = accion.valor_necesario;

  return (
    <Box sx={{
      p: 1.8, borderRadius: '14px',
      border: `1.5px solid ${alpha(color, 0.25)}`,
      bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.04),
      animation: `${fadeUp} 0.2s ease-out ${index * 0.07}s both`,
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12, flex: 1, pr: 1 }}>
          {accion.label}
        </Typography>
        <Chip
          size="small"
          label={accion.dificultad}
          sx={{
            height: 18, fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
            bgcolor: alpha(color, 0.12), color,
          }}
        />
      </Box>

      {/* Barra de progreso antes → después */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            Actual: {pctActual.toFixed(0)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
              {pctActual.toFixed(0)}
            </Typography>
            <ArrowForwardRoundedIcon sx={{ fontSize: 10, color }} />
            <Typography variant="caption" fontWeight={800} sx={{ fontSize: 10, color }}>
              {pctNuevo.toFixed(0)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07) }}>
          {/* Barra actual */}
          <Box sx={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pctActual}%`,
            bgcolor: alpha(color, 0.25),
            borderRadius: 3,
          }} />
          {/* Barra objetivo */}
          <Box sx={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pctNuevo}%`,
            bgcolor: color,
            borderRadius: 3,
            transition: 'width 0.5s ease-out',
          }} />
        </Box>
      </Box>

      {/* Impacto en nota */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          Subir {accion.delta.toFixed(0)} puntos en esta dimensión
        </Typography>
        <Chip
          size="small"
          label={`+${accion.impacto_nota.toFixed(1)} pts nota`}
          sx={{
            height: 18, fontSize: '0.6rem', fontWeight: 800,
            bgcolor: alpha('#16a34a', 0.1), color: '#16a34a',
          }}
        />
      </Box>
    </Box>
  );
};

interface SeccionOptimaProps {
  seleccionado:  EstudianteClase | null;
  asignacionId:  number;
  periodoId:     number;
  accent:        string;
  isDark:        boolean;
}

const SeccionOptima: React.FC<SeccionOptimaProps> = ({
  seleccionado, asignacionId, periodoId, accent, isDark,
}) => {
  const { calcular, resultado, isLoading, limpiar } = useSimulacionOptimo();
  const [modoActivo, setModoActivo] = useState<string | null>(null);
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState<number>(70);
  const [mostrarSliderObjetivo, setMostrarSliderObjetivo] = useState(false);

  // Limpiar cuando cambia el estudiante
  useEffect(() => {
    limpiar();
    setModoActivo(null);
    setMostrarSliderObjetivo(false);
  }, [seleccionado?.estudiante_id]); // eslint-disable-line

  const ejecutar = async (modo: string, objetivoNota: number, restricciones = {}) => {
    if (!seleccionado) return;
    setModoActivo(modo);
    await calcular(
      {
        matricula_id:          seleccionado.matricula_id,
        asignacion_docente_id: asignacionId,
        periodo_evaluacion_id: periodoId,
      },
      { objetivoNota, restricciones, silencioso: true },
    );
  };

  const botones = [
    {
      id:    'minimo',
      label: '¿Mínimo para aprobar?',
      sub:   'Calcula el menor esfuerzo para llegar a 51',
      icon:  <BoltRoundedIcon sx={{ fontSize: 16 }} />,
      color: '#16a34a',
      accion: () => ejecutar('minimo', 51),
    },
    {
      id:    'objetivo',
      label: mostrarSliderObjetivo ? `¿Qué necesito para ${objetivoPersonalizado}?` : '¿Qué necesito para nota X?',
      sub:   'Elegí la nota objetivo con el slider',
      icon:  <TrackChangesRoundedIcon sx={{ fontSize: 16 }} />,
      color: '#0284c7',
      accion: () => {
        if (!mostrarSliderObjetivo) {
          setMostrarSliderObjetivo(true);
        } else {
          ejecutar('objetivo', objetivoPersonalizado);
        }
      },
    },
    {
      id:    'sin_asistencia',
      label: 'Sin contar asistencia',
      sub:   'Calcula solo con notas (asistencia bloqueada)',
      icon:  <BlockRoundedIcon sx={{ fontSize: 16 }} />,
      color: '#d97706',
      accion: () => ejecutar('sin_asistencia', 51, { bloquearAsistencia: true }),
    },
  ];

  return (
    <Box sx={{
      mb: 3, p: 2, borderRadius: '16px',
      border: `1.5px solid ${isDark ? alpha(accent, 0.25) : alpha(accent, 0.2)}`,
      bgcolor: isDark ? alpha(accent, 0.04) : alpha(accent, 0.03),
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: accent }} />
        <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: 13 }}>
          Simulación automática óptima
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, ml: 0.5 }}>
          el sistema calcula el mínimo esfuerzo
        </Typography>
      </Box>

      {/* Botones de modo */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: mostrarSliderObjetivo ? 1.5 : 0 }}>
        {botones.map(b => (
          <Button
            key={b.id}
            size="small"
            variant={modoActivo === b.id ? 'contained' : 'outlined'}
            startIcon={isLoading && modoActivo === b.id ? <CircularProgress size={12} color="inherit" /> : b.icon}
            disabled={!seleccionado || (isLoading && modoActivo !== b.id)}
            onClick={b.accion}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'none',
              py: 0.7,
              ...(modoActivo === b.id
                ? { bgcolor: b.color, borderColor: b.color, color: '#fff', '&:hover': { bgcolor: b.color } }
                : { borderColor: alpha(b.color, 0.4), color: b.color, '&:hover': { bgcolor: alpha(b.color, 0.06), borderColor: b.color } }
              ),
            }}
          >
            {b.label}
          </Button>
        ))}
      </Box>

      {/* Slider de objetivo personalizado */}
      {mostrarSliderObjetivo && (
        <Box sx={{
          px: 1, py: 1.5, mb: 1.5,
          bgcolor: isDark ? alpha('#0284c7', 0.08) : alpha('#e0f2fe', 0.6),
          borderRadius: '12px',
          animation: `${fadeUp} 0.2s ease-out`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Nota objetivo
            </Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: '#0284c7' }}>
              {objetivoPersonalizado}
            </Typography>
          </Box>
          <Slider
            value={objetivoPersonalizado}
            min={51}
            max={95}
            step={1}
            onChange={(_, v) => setObjetivoPersonalizado(v as number)}
            sx={{
              color: '#0284c7',
              '& .MuiSlider-thumb': { width: 18, height: 18 },
              '& .MuiSlider-track': { height: 5 },
              '& .MuiSlider-rail':  { height: 5, opacity: 0.2 },
            }}
            marks={[
              { value: 51, label: '51' },
              { value: 69, label: '69' },
              { value: 85, label: '85' },
            ]}
          />
          <Button
            size="small" fullWidth
            onClick={() => ejecutar('objetivo', objetivoPersonalizado)}
            disabled={isLoading}
            startIcon={isLoading && modoActivo === 'objetivo' ? <CircularProgress size={12} color="inherit" /> : <TrackChangesRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              mt: 1, borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem',
              textTransform: 'none', bgcolor: '#0284c7', color: '#fff',
              '&:hover': { bgcolor: '#0369a1' },
            }}
          >
            Calcular para nota {objetivoPersonalizado}
          </Button>
        </Box>
      )}

      {/* Resultado */}
      {resultado && modoActivo && !isLoading && (
        <Box sx={{ mt: 1.5, animation: `${popIn} 0.25s ease-out` }}>
          <Divider sx={{ mb: 1.5, opacity: 0.4 }} />

          {/* Cabecera del resultado */}
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            p: 1.5, mb: 1.5, borderRadius: '12px',
            bgcolor: resultado.alcanzable
              ? isDark ? alpha('#16a34a', 0.1) : alpha('#f0fdf4', 0.9)
              : isDark ? alpha('#dc2626', 0.1) : alpha('#fef2f2', 0.9),
            border: `1px solid ${resultado.alcanzable ? alpha('#16a34a', 0.25) : alpha('#dc2626', 0.25)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {resultado.alcanzable
                ? <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                : <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#dc2626' }} />
              }
              <Box>
                <Typography variant="caption" fontWeight={800} sx={{
                  color: resultado.alcanzable ? '#16a34a' : '#dc2626',
                  fontSize: 11, display: 'block',
                }}>
                  {resultado.alcanzable ? 'Objetivo alcanzable' : 'Difícil de alcanzar'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {resultado.mensaje}
                </Typography>
              </Box>
            </Box>

            {/* Nota actual → proyectada */}
            <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: 13 }}>
                  {resultado.nota_actual.toFixed(1)}
                </Typography>
                <ArrowForwardRoundedIcon sx={{ fontSize: 12, color: resultado.alcanzable ? '#16a34a' : '#dc2626' }} />
                <Typography variant="body2" fontWeight={800} sx={{
                  fontSize: 16,
                  color: resultado.alcanzable ? '#16a34a' : '#dc2626',
                }}>
                  {resultado.nota_proyectada.toFixed(1)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                actual → proyectada
              </Typography>
            </Box>
          </Box>

          {/* Acciones requeridas */}
          {resultado.acciones.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary"
                sx={{ fontSize: 10, letterSpacing: 0.4 }}>
                QUÉ NECESITA HACER:
              </Typography>
              {resultado.acciones.map((accion, i) => (
                <AccionCard key={i} accion={accion} index={i} isDark={isDark} />
              ))}
            </Box>
          )}

          {resultado.acciones.length === 0 && resultado.alcanzable && (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 28, color: '#16a34a', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11 }}>
                Ya supera el objetivo sin cambios adicionales
              </Typography>
            </Box>
          )}

          {!resultado.alcanzable && (
            <Box sx={{ mt: 1, p: 1.2, borderRadius: '10px', bgcolor: isDark ? alpha('#dc2626', 0.08) : alpha('#fef2f2', 1), border: `1px solid ${alpha('#dc2626', 0.2)}` }}>
              <Typography variant="caption" sx={{ color: '#dc2626', fontSize: 10, fontWeight: 600 }}>
                Nota máxima posible: {resultado.nota_maxima_posible.toFixed(1)} — Se recomienda intervención pedagógica
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// ── Slider con ancla ──────────────────────────────────────────
interface AnchoredSliderProps {
  sliderKey:    string;
  label:        string;
  subLabel:     string;
  emoji:        string;
  color:        string;
  min:          number;
  max:          number;
  step:         number;
  unit:         string;
  tooltip:      string;
  peso?:        number;
  valorActual?: number | null;
  valor:        number | null;
  onChange:     (key: string, val: number | null) => void;
  isDark:       boolean;
}

const AnchoredSlider: React.FC<AnchoredSliderProps> = ({
  sliderKey, label, subLabel, emoji, color, min, max, step,
  unit, tooltip, peso, valorActual, valor, onChange, isDark,
}) => {
  const activo        = valor !== null && valor !== 0;
  const pctActual     = valorActual != null ? ((valorActual - min) / (max - min)) * 100 : null;
  const deltaEstimado = activo && valor !== null && valorActual != null && peso
    ? estimarDeltaNota(valor, valorActual, peso)
    : null;
  const deltaPositivo = deltaEstimado !== null && deltaEstimado > 0;

  return (
    <Box sx={{ mb: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ fontSize: 15 }}>{emoji}</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>{label}</Typography>
            {peso !== undefined && (
              <Chip size="small" label={`${(peso * 100).toFixed(0)}% del total`}
                sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha(color, 0.1), color }} />
            )}
            <Tooltip title={tooltip} placement="top">
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, ml: 2.8 }}>{subLabel}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
          {deltaEstimado !== null && (
            <Chip size="small"
              label={`${deltaPositivo ? '+' : ''}${deltaEstimado} pts`}
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800,
                bgcolor: alpha(deltaPositivo ? '#16a34a' : '#dc2626', 0.12),
                color: deltaPositivo ? '#16a34a' : '#dc2626',
                animation: `${popIn} 0.2s ease-out` }} />
          )}
          <Typography variant="body2" fontWeight={800}
            sx={{ color: activo ? color : 'text.disabled', minWidth: 44, textAlign: 'right', fontSize: 13 }}>
            {activo ? `${valor}${unit}` : '—'}
          </Typography>
          {activo && (
            <IconButton size="small"
              onClick={() => onChange(sliderKey, sliderKey === 'semanas' ? 0 : null)}
              sx={{ p: 0.3, color: 'text.disabled', '&:hover': { color: '#dc2626' } }}>
              <CloseRoundedIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', px: 0.5 }}>
        {pctActual !== null && (
          <Tooltip title={`Valor actual: ${valorActual}${unit}`} placement="top">
            <Box sx={{
              position: 'absolute', left: `calc(${pctActual}% - 1px)`,
              top: -2, bottom: -2, width: 3,
              bgcolor: isDark ? alpha('#fff', 0.4) : alpha('#000', 0.3),
              borderRadius: 2, zIndex: 2, cursor: 'pointer',
              '&::before': {
                content: '""', position: 'absolute', top: -6, left: '50%',
                transform: 'translateX(-50%)', width: 0, height: 0,
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: `5px solid ${isDark ? alpha('#fff', 0.4) : alpha('#000', 0.3)}`,
              },
            }} />
          </Tooltip>
        )}
        <Slider
          value={valor ?? min}
          onChange={(_, v) => onChange(sliderKey, v as number)}
          min={min} max={max} step={step}
          sx={{
            color: activo ? color : alpha(color, 0.25),
            '& .MuiSlider-thumb': {
              width: 20, height: 20,
              bgcolor: activo ? color : isDark ? alpha('#fff', 0.25) : alpha('#000', 0.18),
              boxShadow: activo ? `0 0 0 4px ${alpha(color, 0.2)}, 0 2px 8px ${alpha(color, 0.4)}` : 'none',
              transition: 'all 0.15s cubic-bezier(.34,1.56,.64,1)',
              '&:hover': { boxShadow: `0 0 0 8px ${alpha(color, 0.16)}, 0 2px 8px ${alpha(color, 0.4)}` },
            },
            '& .MuiSlider-track': { height: 6, bgcolor: color, border: 'none' },
            '& .MuiSlider-rail':  { height: 6, opacity: 0.15 },
            '& .MuiSlider-markLabel': { fontSize: 9, color: 'text.disabled' },
          }}
          marks={[
            { value: min, label: `${min}${unit}` },
            ...(sliderKey !== 'semanas' ? [{ value: 51, label: '51' }] : []),
            { value: max, label: `${max}${unit}` },
          ]}
        />
      </Box>

      {pctActual !== null && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ width: 8, height: 2, bgcolor: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.25), borderRadius: 1 }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
              actual: {valorActual}{unit}
            </Typography>
          </Box>
          {activo && valor !== null && valorActual != null && valor !== valorActual && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>{valorActual}{unit}</Typography>
              <ArrowForwardRoundedIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color }}>{valor}{unit}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// ── EscenarioCard ─────────────────────────────────────────────
const EscenarioCard: React.FC<{
  esc: any; base: any; isMejor: boolean; index: number; isDark: boolean; accent: string;
}> = ({ esc, base, isMejor, index, isDark, accent }) => {
  const cfg      = getNivel(esc.nivel_riesgo);
  const cfgBase  = getNivel(base.nivel_riesgo);
  const mejora   = esc.cambio_probabilidad < 0;
  const pctBase  = Math.round(base.probabilidad_reprobar * 100);
  const pctNuevo = Math.round(esc.probabilidad_reprobar * 100);
  const deltaPct = Math.round(esc.cambio_probabilidad * 100);
  const cambioNivel = esc.nivel_riesgo !== base.nivel_riesgo;

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${isMejor ? alpha('#16a34a', 0.4) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
      bgcolor: isMejor
        ? isDark ? alpha('#16a34a', 0.06) : alpha('#f0fdf4', 0.8)
        : isDark ? alpha('#fff', 0.02) : '#fff',
      overflow: 'hidden',
      animation: `${fadeUp} 0.25s ease-out ${index * 0.06}s both`,
    }}>
      <Box sx={{ height: 3, bgcolor: cfg.color, opacity: 0.7 }} />
      <Box sx={{ p: 1.8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11, flex: 1, lineHeight: 1.4, pr: 1 }}>
            {esc.descripcion}
          </Typography>
          {isMejor && (
            <Chip size="small"
              icon={<EmojiEventsRoundedIcon sx={{ fontSize: '10px !important', color: '#16a34a !important' }} />}
              label="Mejor impacto"
              sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha('#16a34a', 0.12), color: '#16a34a', flexShrink: 0 }} />
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8fafc', 1), textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block', mb: 0.3 }}>ANTES</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: cfgBase.color, fontSize: 18, lineHeight: 1 }}>
              {base.nota_estimada_final.toFixed(1)}
            </Typography>
            <NivelChip nivel={base.nivel_riesgo} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
              {mejora
                ? <TrendingDownRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                : deltaPct === 0
                  ? <TrendingFlatRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                  : <TrendingUpRoundedIcon sx={{ fontSize: 20, color: '#dc2626' }} />
              }
              <Typography variant="caption" fontWeight={800}
                sx={{ fontSize: 11, color: mejora ? '#16a34a' : deltaPct === 0 ? 'text.disabled' : '#dc2626' }}>
                {deltaPct > 0 ? '+' : ''}{deltaPct}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: isDark ? alpha(cfg.color, 0.08) : alpha(cfg.bgColor, 0.5), border: `1px solid ${alpha(cfg.color, 0.2)}`, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: 9, display: 'block', mb: 0.3, color: cfg.color, fontWeight: 700 }}>DESPUÉS</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: cfg.color, fontSize: 18, lineHeight: 1 }}>
              {esc.nota_estimada_final.toFixed(1)}
            </Typography>
            <NivelChip nivel={esc.nivel_riesgo} />
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>Prob. reprobar</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 9, color: mejora ? '#16a34a' : '#dc2626' }}>
              {pctBase}% → {pctNuevo}%
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07) }}>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pctBase}%`, bgcolor: alpha(cfgBase.color, 0.25), borderRadius: 3 }} />
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pctNuevo}%`, bgcolor: cfg.color, borderRadius: 3, transition: 'width 0.5s ease-out' }} />
          </Box>
        </Box>

        {cambioNivel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.8, borderRadius: '8px', bgcolor: isDark ? alpha('#16a34a', 0.08) : alpha('#f0fdf4', 1), border: `1px solid ${alpha('#16a34a', 0.2)}` }}>
            <Typography variant="caption" sx={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
              ✓ Cambia de nivel: {cfgBase.label} → {cfg.label}
            </Typography>
          </Box>
        )}
        {esc.conclusion && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, mt: 0.8, display: 'block', lineHeight: 1.5 }}>
            {esc.conclusion}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ── buildSliders ──────────────────────────────────────────────
interface SliderDef {
  key: string; label: string; subLabel: string; emoji: string;
  color: string; min: number; max: number; step: number; unit: string;
  tooltip: string; peso?: number;
}

function buildSliders(meta: PrediccionMeta | null): SliderDef[] {
  const pesoComp = meta?.peso_complementario ?? 0.15;
  const pesoSab  = meta ? parseFloat(((1 - pesoComp) * 0.53).toFixed(3)) : 0.45;
  const pesoHac  = meta ? parseFloat(((1 - pesoComp) * 0.47).toFixed(3)) : 0.40;

  return [
    { key: 'nota_sab', label: 'Saber (SAB)', emoji: '📋', subLabel: 'Próximo examen o prueba', color: '#2563eb', min: 0, max: 100, step: 5, unit: 'pts', peso: pesoSab, tooltip: `Exámenes y pruebas — ${(pesoSab * 100).toFixed(0)}%` },
    { key: 'nota_hac', label: 'Hacer (HAC)', emoji: '📝', subLabel: 'Próxima práctica o tarea', color: '#7c3aed', min: 0, max: 100, step: 5, unit: 'pts', peso: pesoHac, tooltip: `Prácticas y trabajos — ${(pesoHac * 100).toFixed(0)}%` },
    ...(pesoComp > 0 ? [{ key: 'nota_comp', label: 'Ser + Autoevaluación', emoji: '🌱', subLabel: 'Aporte complementario', color: '#16a34a', min: 0, max: 100, step: 5, unit: 'pts', peso: pesoComp, tooltip: `SER y AUT — ${(pesoComp * 100).toFixed(0)}%` }] : []),
    { key: 'asistencia', label: 'Asistencia', emoji: '📅', subLabel: 'Porcentaje proyectado', color: '#0284c7', min: 0, max: 100, step: 5, unit: '%', tooltip: 'Asistencia acumulada proyectada' },
    { key: 'semanas', label: 'Semanas adicionales', emoji: '🗓️', subLabel: 'Al ritmo actual', color: '#f59e0b', min: 0, max: 8, step: 1, unit: 'sem', tooltip: 'Proyectar N semanas más al ritmo actual' },
  ];
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
interface TabSimulacionProps {
  asignacionId: number;
  periodoId:    number;
  paraleloId:   number;
  accent:       string;
  isDark:       boolean;
}

const TabSimulacion: React.FC<TabSimulacionProps> = ({
  asignacionId, periodoId, paraleloId, accent, isDark,
}) => {
  const { estudiantes, analizar: cargarClase }                                       = usePrediccionClase();
  const { predecir, limpiar, resultado: resultadoBase, meta, isLoading: analizando } = usePrediccionEstudiante();

  const [seleccionado, setSeleccionado] = useState<EstudianteClase | null>(null);
  const [simResult, setSimResult]       = useState<any>(null);
  const [simLoading, setSimLoading]     = useState(false);
  const [simError, setSimError]         = useState<string | null>(null);

  const [valores, setValores] = useState<Record<string, number | null>>({
    nota_sab: null, nota_hac: null, nota_comp: null, asistencia: null, semanas: 0,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valoresActuales: Record<string, number | null> = {
    nota_sab:   null,
    nota_hac:   null,
    nota_comp:  meta?.nota_complementaria_pct ?? null,
    asistencia: seleccionado?.asistencia_pct ?? null,
    semanas:    0,
  };

  useEffect(() => {
    if (estudiantes.length === 0) {
      cargarClase({ asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, paralelo_id: paraleloId }, { incluirGemini: false });
    }
  }, []); // eslint-disable-line

  const handleSeleccionar = useCallback(async (est: EstudianteClase | null) => {
    setSeleccionado(est);
    setSimResult(null);
    setSimError(null);
    setValores({ nota_sab: null, nota_hac: null, nota_comp: null, asistencia: null, semanas: 0 });
    limpiar();
    if (!est) return;
    await predecir(
      { matricula_id: est.matricula_id, asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId },
      { incluirGemini: false, silencioso: true },
    );
  }, [asignacionId, periodoId]); // eslint-disable-line

  const construirEscenarios = useCallback(() => {
    const esc = [];
    if (valores.nota_sab !== null)   esc.push({ descripcion: `SAB → ${valores.nota_sab} pts`, nota_proximo_examen: valores.nota_sab });
    if (valores.nota_hac !== null)   esc.push({ descripcion: `HAC → ${valores.nota_hac} pts`, nota_proxima_practica: valores.nota_hac });
    if (valores.nota_comp !== null)  esc.push({ descripcion: `SER+AUT → ${valores.nota_comp} pts`, nota_complementaria_pct: valores.nota_comp });
    if (valores.asistencia !== null) esc.push({ descripcion: `Asistencia al ${valores.asistencia}%`, asistencia_proyectada: valores.asistencia });
    if ((valores.semanas ?? 0) > 0)  esc.push({ descripcion: `+${valores.semanas} semanas al ritmo actual`, semanas_adicionales: valores.semanas! });
    return esc;
  }, [valores]);

  const simular = useCallback(() => {
    if (!seleccionado) return;
    const escenarios = construirEscenarios();
    if (escenarios.length === 0) { setSimResult(null); return; }
    setSimLoading(true);
    setSimError(null);
    prediccionService.simular(
      { matricula_id: seleccionado.matricula_id, asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, escenarios },
      { incluirGemini: true },
    )
      .then(res => setSimResult(res.data))
      .catch(err => setSimError(err.response?.data?.message || 'Error en simulación'))
      .finally(() => setSimLoading(false));
  }, [seleccionado, construirEscenarios, asignacionId, periodoId]);

  useEffect(() => {
    if (!seleccionado) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(simular, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [valores, seleccionado]); // eslint-disable-line

  const setValor    = (key: string, val: number | null) => setValores(prev => ({ ...prev, [key]: val }));
  const sliders     = buildSliders(meta);
  const hayValores  = Object.values(valores).some(v => v !== null && v !== 0);
  const mejorEsc    = simResult?.escenarios?.length > 0
    ? simResult.escenarios.reduce((best: any, e: any) => e.cambio_probabilidad < best.cambio_probabilidad ? e : best)
    : null;

  return (
    <Box>
      {/* Selector de estudiante */}
      <Autocomplete
        options={estudiantes}
        getOptionLabel={e => e.nombre_completo}
        value={seleccionado}
        onChange={(_, val) => handleSeleccionar(val)}
        loading={estudiantes.length === 0}
        renderOption={(props, option) => {
          const cfg = getNivel(option.nivel_riesgo);
          return (
            <Box component="li" {...props} sx={{ gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: alpha(cfg.color, 0.15), color: cfg.color, fontWeight: 800, fontSize: 12 }}>
                {getInitials(option.nombre_completo)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={700}>{option.nombre_completo}</Typography>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                  <NivelChip nivel={option.nivel_riesgo} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {Math.round(option.probabilidad_reprobar * 100)}% riesgo · {option.nota_estimada_final.toFixed(1)} pts
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
        renderInput={params => (
          <TextField {...params} label="Seleccioná un estudiante para simular"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            InputProps={{ ...params.InputProps, endAdornment: (<>{estudiantes.length === 0 && <CircularProgress size={16} />}{params.InputProps.endAdornment}</>) }} />
        )}
        sx={{ mb: 3 }}
      />

      {!seleccionado && (
        <Box sx={{ textAlign: 'center', py: 8, border: `2px dashed ${alpha(accent, 0.2)}`, borderRadius: '20px', color: 'text.secondary' }}>
          <PersonSearchRoundedIcon sx={{ fontSize: 52, opacity: 0.2, mb: 1.5 }} />
          <Typography variant="body2" fontWeight={600}>Seleccioná un estudiante</Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
            Los sliders y la simulación óptima se activan con los datos reales
          </Typography>
        </Box>
      )}

      {seleccionado && (
        <Box sx={{ animation: `${fadeUp} 0.3s ease-out` }}>

          {/* ══ SECCIÓN ÓPTIMA — nueva ══ */}
          <SeccionOptima
            seleccionado={seleccionado}
            asignacionId={asignacionId}
            periodoId={periodoId}
            accent={accent}
            isDark={isDark}
          />

          {/* ══ SLIDERS MANUALES — igual que antes ══ */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>

            {/* Columna izquierda */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneRoundedIcon sx={{ fontSize: 18, color: accent }} />
                  <Typography variant="subtitle2" fontWeight={800}>Simulación manual</Typography>
                  {simLoading && <CircularProgress size={14} sx={{ color: accent }} />}
                </Box>
                {hayValores && (
                  <Button size="small"
                    onClick={() => setValores({ nota_sab: null, nota_hac: null, nota_comp: null, asistencia: null, semanas: 0 })}
                    startIcon={<RestartAltRoundedIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ color: 'text.disabled', fontSize: '0.75rem', fontWeight: 600 }}>
                    Limpiar
                  </Button>
                )}
              </Box>

              {analizando && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={22} sx={{ color: accent }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontSize: 11 }}>Cargando datos…</Typography>
                </Box>
              )}

              {resultadoBase && meta && !analizando && (
                <Box sx={{ p: 1.8, mb: 3, borderRadius: '14px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8fafc', 1), border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`, animation: `${slideRight} 0.3s ease-out` }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.2, fontSize: 10, letterSpacing: 0.4 }}>SITUACIÓN ACTUAL</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={900} sx={{ color: getNivel(resultadoBase.nivel_riesgo).color, lineHeight: 1 }}>{resultadoBase.nota_estimada_final.toFixed(1)}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>nota est.</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ opacity: 0.4 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={900} sx={{ color: getNivel(resultadoBase.nivel_riesgo).color, lineHeight: 1 }}>{Math.round(resultadoBase.probabilidad_reprobar * 100)}%</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>riesgo</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ opacity: 0.4 }} />
                    <NivelChip nivel={resultadoBase.nivel_riesgo} />
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                      {[
                        { label: `SAB: ${meta.n_notas_sab}`, color: '#2563eb' },
                        { label: `HAC: ${meta.n_notas_hac}`, color: '#7c3aed' },
                        { label: `Asist: ${seleccionado.asistencia_pct.toFixed(0)}%`, color: seleccionado.asistencia_pct < 75 ? '#dc2626' : '#16a34a' },
                      ].map(({ label, color }) => (
                        <Chip key={label} size="small" label={label} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(color, 0.1), color }} />
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, fontSize: 9 }}>
                    ▲ La línea vertical en cada slider marca el valor actual
                  </Typography>
                </Box>
              )}

              {sliders.map(s => (
                <AnchoredSlider
                  key={s.key} sliderKey={s.key} label={s.label} subLabel={s.subLabel}
                  emoji={s.emoji} color={s.color} min={s.min} max={s.max} step={s.step}
                  unit={s.unit} tooltip={s.tooltip} peso={s.peso}
                  valorActual={valoresActuales[s.key]} valor={valores[s.key]}
                  onChange={setValor} isDark={isDark}
                />
              ))}
            </Box>

            {/* Columna derecha */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight={800}>Resultado en tiempo real</Typography>
              {simError && <Alert severity="error" sx={{ borderRadius: '12px', fontSize: 12 }}>{simError}</Alert>}

              {!simResult && !simLoading && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, borderRadius: '16px', border: `2px dashed ${alpha(accent, 0.18)}`, color: 'text.secondary' }}>
                  <TuneRoundedIcon sx={{ fontSize: 42, opacity: 0.18, mb: 1.5 }} />
                  <Typography variant="body2" fontWeight={600}>Ajustá un parámetro</Typography>
                  <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5, textAlign: 'center', maxWidth: 220 }}>
                    Los resultados aparecen 0.5s después de mover el slider
                  </Typography>
                </Box>
              )}

              {simLoading && !simResult && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: accent }} size={32} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>Calculando…</Typography>
                </Box>
              )}

              {simResult && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, animation: `${fadeUp} 0.25s ease-out` }}>
                  {simResult.escenarios.map((esc: any, i: number) => (
                    <EscenarioCard key={i} esc={esc} base={simResult.situacion_actual} isMejor={esc === mejorEsc} index={i} isDark={isDark} accent={accent} />
                  ))}

                  {simResult.recomendacion_gemini && (
                    <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? alpha('#f59e0b', 0.07) : alpha('#fefce8', 0.9), border: `1.5px solid ${alpha('#f59e0b', 0.28)}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                        <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 15 }} />
                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: 11 }}>Recomendación Gemini</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.75, fontSize: 12 }}>{simResult.recomendacion_gemini}</Typography>
                    </Box>
                  )}

                  {mejorEsc && (
                    <Box sx={{ p: 2, borderRadius: '16px', background: isDark ? alpha('#16a34a', 0.12) : alpha('#f0fdf4', 1), border: `2px solid ${alpha('#16a34a', 0.3)}`, animation: `${popIn} 0.3s ease-out` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                        <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#16a34a' }}>Acción prioritaria</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: 12 }}>
                        Enfocarse en <strong>{mejorEsc.descripcion.toLowerCase()}</strong> reduce el riesgo un{' '}
                        <strong style={{ color: '#16a34a' }}>{Math.abs(Math.round(mejorEsc.cambio_probabilidad * 100))}%</strong>
                        {mejorEsc.cambio_nota !== 0 && <> y mejora la nota en <strong style={{ color: '#16a34a' }}>{mejorEsc.cambio_nota > 0 ? '+' : ''}{mejorEsc.cambio_nota.toFixed(1)} pts</strong></>}.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TabSimulacion;