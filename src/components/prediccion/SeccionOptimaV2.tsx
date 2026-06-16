'use client';
/**
 * SeccionOptimaV2.tsx — v8.6
 *
 * Cambios respecto a v8.5:
 *   - Controles numéricos para que el docente especifique cuántas
 *     prácticas y exámenes quedan (en lugar de estimarlos).
 *   - Los valores se mandan al backend como practicas_restantes / examenes_restantes.
 *   - Si el docente no los toca, quedan en null y el backend estima por ritmo.
 *   - Eliminado botón "Sin contar asistencia".
 *   - Techo garantizado desde el backend — siempre hay al menos 1 escenario alcanzable.
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Button, alpha,
  CircularProgress, Divider, Collapse, Slider,
  IconButton,
} from '@mui/material';
import { keyframes } from '@mui/system';

import AutoAwesomeRoundedIcon        from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon               from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon       from '@mui/icons-material/TrackChangesRounded';
import ArrowForwardRoundedIcon       from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningAmberRoundedIcon       from '@mui/icons-material/WarningAmberRounded';
import KeyboardArrowDownRoundedIcon  from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon    from '@mui/icons-material/KeyboardArrowUpRounded';
import ErrorOutlineRoundedIcon       from '@mui/icons-material/ErrorOutlineRounded';
import SchoolRoundedIcon             from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon           from '@mui/icons-material/MenuBookRounded';
import AddRoundedIcon                from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon             from '@mui/icons-material/RemoveRounded';

import {
  EscenarioDetalladoResponse,
  EvaluacionPendienteResponse,
  EstudianteClase,
} from '@/types/prediccionTypes';
import { useSimulacionOptimoV2 } from '@/hooks/usePrediccion';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.94); }
  70%  { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
`;

const COLOR_ESCENARIO: Record<string, string> = {
  proyeccion: '#6b7280',  // gris
  aprobar:    '#16a34a',  // verde
  margen:     '#0284c7',  // azul
};

// ── Contador numérico +/- ─────────────────────────────────────
interface CounterProps {
  label:    string;
  value:    number | null;
  min:      number;
  max:      number;
  color:    string;
  isDark:   boolean;
  onChange: (v: number | null) => void;
}

const Counter: React.FC<CounterProps> = ({ label, value, min, max, color, isDark, onChange }) => {
  const val = value ?? 0;

  return (
    <Box sx={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           0.4,
      px:            1.2,
      py:            0.8,
      borderRadius:  '12px',
      border:        `1.5px solid ${value !== null ? alpha(color, 0.4) : alpha(color, 0.15)}`,
      bgcolor:       value !== null
        ? isDark ? alpha(color, 0.08) : alpha(color, 0.05)
        : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
      minWidth:      90,
      transition:    'all 0.15s',
    }}>
      <Typography variant="caption" sx={{ fontSize: 10, color, fontWeight: 700 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          disabled={val <= min}
          onClick={() => onChange(val <= min ? null : val - 1)}
          sx={{
            p: 0.2, width: 22, height: 22,
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
            '&:hover': { bgcolor: alpha(color, 0.12) },
            '&:disabled': { opacity: 0.3 },
          }}
        >
          <RemoveRoundedIcon sx={{ fontSize: 13 }} />
        </IconButton>

        <Typography variant="body2" fontWeight={800}
          sx={{ fontSize: 20, minWidth: 24, textAlign: 'center', color: value !== null ? color : 'text.disabled', lineHeight: 1 }}>
          {value !== null ? value : '?'}
        </Typography>

        <IconButton
          size="small"
          disabled={val >= max}
          onClick={() => onChange(val >= max ? max : val + 1)}
          sx={{
            p: 0.2, width: 22, height: 22,
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
            '&:hover': { bgcolor: alpha(color, 0.12) },
            '&:disabled': { opacity: 0.3 },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>
      <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
        {value === null ? 'estimado' : 'confirmado'}
      </Typography>
    </Box>
  );
};

// ── EvalChip ──────────────────────────────────────────────────
const EvalChip: React.FC<{
  ev: EvaluacionPendienteResponse; color: string; isDark: boolean;
}> = ({ ev, color, isDark }) => {
  const colorBase  = ev.es_alcanzable ? color      : '#dc2626';
  const bgBase     = ev.es_alcanzable ? alpha(color, 0.09) : alpha('#dc2626', 0.08);
  const borderBase = ev.es_alcanzable ? alpha(color, 0.28) : alpha('#dc2626', 0.3);
  const Icon       = ev.tipo === 'examen' ? SchoolRoundedIcon : MenuBookRoundedIcon;

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '2px', px: 1.2, py: 0.8, borderRadius: '10px',
      border: `1px solid ${borderBase}`, bgcolor: bgBase, minWidth: 64,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: colorBase }}>
        <Icon sx={{ fontSize: 11 }} />
        <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: colorBase }}>
          {ev.tipo === 'examen' ? 'Examen' : 'Práctica'} {ev.numero}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={800}
        sx={{ fontSize: 17, lineHeight: 1, color: colorBase }}>
        {ev.nota_objetivo.toFixed(0)}
      </Typography>
      {!ev.es_alcanzable && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 9, color: '#dc2626' }} />
          <Typography variant="caption" sx={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>
            difícil
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── EscenarioDetalladoCard ────────────────────────────────────
const EscenarioDetalladoCard: React.FC<{
  esc: EscenarioDetalladoResponse; index: number; isDark: boolean; notaActual: number;
}> = ({ esc, index, isDark, notaActual }) => {
  const [abierto, setAbierto] = useState(index === 0);
  const color    = COLOR_ESCENARIO[esc.id] ?? '#6b7280';
  const holgura  = esc.nota_proyectada - notaActual;

  return (
    <Box sx={{
      borderRadius: '14px',
      border: `1.5px solid ${esc.alcanzable ? alpha(color, 0.35) : alpha('#dc2626', 0.25)}`,
      bgcolor: esc.alcanzable
        ? isDark ? alpha(color, 0.05) : alpha(color, 0.03)
        : isDark ? alpha('#dc2626', 0.04) : alpha('#fef2f2', 0.7),
      overflow: 'hidden',
      animation: `${fadeUp} 0.2s ease-out ${index * 0.06}s both`,
    }}>
      <Box sx={{ height: 3, bgcolor: esc.alcanzable ? color : '#dc2626', opacity: 0.7 }} />

      {/* Header */}
      <Box onClick={() => setAbierto(p => !p)} sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.6, py: 1.2, cursor: 'pointer', userSelect: 'none',
      }}>
        <Chip size="small" label={esc.alcanzable ? 'alcanzable' : 'difícil'} sx={{
          height: 18, fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
          bgcolor: esc.alcanzable ? alpha(color, 0.12) : alpha('#dc2626', 0.1),
          color:   esc.alcanzable ? color              : '#dc2626',
        }} />
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12, flex: 1 }}>
          {esc.titulo}
        </Typography>
        <Typography variant="body2" fontWeight={800}
          sx={{ fontSize: 14, color: esc.alcanzable ? color : '#dc2626', flexShrink: 0 }}>
          {esc.nota_proyectada.toFixed(1)}
          <Typography component="span" variant="caption" color="text.disabled" sx={{ fontSize: 9, ml: 0.3 }}>pts</Typography>
        </Typography>
        {abierto
          ? <KeyboardArrowUpRoundedIcon   sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
          : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
        }
      </Box>

      {/* Cuerpo */}
      <Collapse in={abierto}>
        <Box sx={{ px: 1.6, pb: 1.4 }}>
          <Divider sx={{ mb: 1.2, opacity: 0.3 }} />
          <Typography variant="caption" color="text.secondary"
            sx={{ fontSize: 11, display: 'block', mb: 1.2, lineHeight: 1.5 }}>
            {esc.descripcion}
          </Typography>

          {/* Chips de evaluaciones */}
          {esc.evaluaciones.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.2 }}>
              {esc.evaluaciones.map((ev, i) => (
                <EvalChip key={i} ev={ev} color={color} isDark={isDark} />
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled"
              sx={{ fontSize: 10, display: 'block', mb: 1.2 }}>
              Sin evaluaciones pendientes.
            </Typography>
          )}

          {/* Proyección */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.8,
            p: 1, borderRadius: '9px',
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8fafc', 1),
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              Nota proyectada:
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 11 }}>
              {notaActual.toFixed(1)}
            </Typography>
            <ArrowForwardRoundedIcon sx={{ fontSize: 11, color: esc.alcanzable ? color : '#dc2626' }} />
            <Typography variant="caption" fontWeight={800}
              sx={{ fontSize: 13, color: esc.alcanzable ? color : '#dc2626' }}>
              {esc.nota_proyectada.toFixed(1)}
            </Typography>
            <Chip size="small"
              label={`${holgura >= 0 ? '+' : ''}${holgura.toFixed(1)} sobre objetivo`}
              sx={{
                ml: 'auto', height: 16, fontSize: '0.58rem', fontWeight: 800,
                bgcolor: holgura >= 0 ? alpha('#16a34a', 0.1) : alpha('#dc2626', 0.1),
                color:   holgura >= 0 ? '#16a34a'             : '#dc2626',
              }}
            />
          </Box>

          {esc.mensaje && (
            <Typography variant="caption" color="text.disabled"
              sx={{ fontSize: 10, display: 'block', mt: 0.8, lineHeight: 1.5 }}>
              {esc.mensaje}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
interface SeccionOptimaV2Props {
  seleccionado: EstudianteClase | null;
  asignacionId: number;
  periodoId:    number;
  accent:       string;
  isDark:       boolean;
}

const SeccionOptimaV2: React.FC<SeccionOptimaV2Props> = ({
  seleccionado, asignacionId, periodoId, accent, isDark,
}) => {
  const { calcular, resultado, isLoading, limpiar } = useSimulacionOptimoV2();

  const [modoActivo,            setModoActivo]            = useState<string | null>(null);
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState<number>(70);
  const [mostrarSlider,         setMostrarSlider]         = useState(false);

  // Evaluaciones ingresadas por el docente (null = estimar)
  const [practRestantes,  setPractRestantes]  = useState<number | null>(null);
  const [examRestantes,   setExamRestantes]   = useState<number | null>(null);

  useEffect(() => {
    limpiar();
    setModoActivo(null);
    setMostrarSlider(false);
    setPractRestantes(null);
    setExamRestantes(null);
  }, [seleccionado?.estudiante_id]); // eslint-disable-line

  const ejecutar = async (modo: string, objetivoNota: number) => {
    if (!seleccionado) return;
    setModoActivo(modo);
    await calcular(
      {
        matricula_id:          seleccionado.matricula_id,
        asignacion_docente_id: asignacionId,
        periodo_evaluacion_id: periodoId,
      },
      {
        objetivoNota,
        // Pasar los valores del docente — el hook/service los manda al backend
        practicasRestantes: practRestantes ?? undefined,
        examenesRestantes:  examRestantes  ?? undefined,
        silencioso: true,
      },
    );
  };

  const botones = [
    {
      id:     'minimo',
      label:  '¿Mínimo para aprobar?',
      icon:   <BoltRoundedIcon sx={{ fontSize: 15 }} />,
      color:  '#16a34a',
      accion: () => ejecutar('minimo', 51),
    },
    {
      id:     'objetivo',
      label:  mostrarSlider ? `¿Qué necesito para ${objetivoPersonalizado}?` : '¿Qué necesito para nota X?',
      icon:   <TrackChangesRoundedIcon sx={{ fontSize: 15 }} />,
      color:  '#0284c7',
      accion: () => mostrarSlider ? ejecutar('objetivo', objetivoPersonalizado) : setMostrarSlider(true),
    },
  ];

  return (
    <Box sx={{
      mb: 3, p: 2, borderRadius: '16px',
      border:  `1.5px solid ${isDark ? alpha(accent, 0.25) : alpha(accent, 0.2)}`,
      bgcolor: isDark ? alpha(accent, 0.04) : alpha(accent, 0.03),
    }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: accent }} />
        <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: 13 }}>
          Simulación automática óptima
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, ml: 0.3 }}>
          con desglose por evaluación
        </Typography>
      </Box>

      {/* ── Controles evaluaciones restantes ── */}
      {seleccionado && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          mb: 1.5, flexWrap: 'wrap',
        }}>
          <Typography variant="caption" color="text.secondary"
            sx={{ fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
            Evaluaciones que quedan:
          </Typography>
          <Counter
            label="Prácticas"
            value={practRestantes}
            min={0} max={8}
            color="#7c3aed"
            isDark={isDark}
            onChange={setPractRestantes}
          />
          <Counter
            label="Exámenes"
            value={examRestantes}
            min={0} max={2}
            color="#0284c7"
            isDark={isDark}
            onChange={setExamRestantes}
          />
          {(practRestantes !== null || examRestantes !== null) && (
            <Button size="small"
              onClick={() => { setPractRestantes(null); setExamRestantes(null); }}
              sx={{ fontSize: '0.68rem', color: 'text.disabled', textTransform: 'none', py: 0.3 }}>
              resetear
            </Button>
          )}
        </Box>
      )}

      {/* Botones de modo */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: mostrarSlider ? 1.5 : 0 }}>
        {botones.map(b => (
          <Button key={b.id} size="small"
            variant={modoActivo === b.id ? 'contained' : 'outlined'}
            startIcon={isLoading && modoActivo === b.id
              ? <CircularProgress size={12} color="inherit" />
              : b.icon}
            disabled={!seleccionado || (isLoading && modoActivo !== b.id)}
            onClick={b.accion}
            sx={{
              borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem',
              textTransform: 'none', py: 0.7,
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

      {/* Slider objetivo */}
      {mostrarSlider && (
        <Box sx={{
          px: 1, py: 1.5, mb: 1.5,
          bgcolor: isDark ? alpha('#0284c7', 0.08) : alpha('#e0f2fe', 0.6),
          borderRadius: '12px', animation: `${fadeUp} 0.2s ease-out`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Nota objetivo</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: '#0284c7' }}>{objetivoPersonalizado}</Typography>
          </Box>
          <Slider
            value={objetivoPersonalizado} min={51} max={95} step={1}
            onChange={(_, v) => setObjetivoPersonalizado(v as number)}
            sx={{
              color: '#0284c7',
              '& .MuiSlider-thumb': { width: 18, height: 18 },
              '& .MuiSlider-track': { height: 5 },
              '& .MuiSlider-rail':  { height: 5, opacity: 0.2 },
            }}
            marks={[{ value: 51, label: '51' }, { value: 69, label: '69' }, { value: 85, label: '85' }]}
          />
          <Button size="small" fullWidth disabled={isLoading}
            onClick={() => ejecutar('objetivo', objetivoPersonalizado)}
            startIcon={isLoading && modoActivo === 'objetivo'
              ? <CircularProgress size={12} color="inherit" />
              : <TrackChangesRoundedIcon sx={{ fontSize: 14 }} />}
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

      {/* ── Resultados ── */}
      {resultado && modoActivo && !isLoading && (
        <Box sx={{ mt: 1.5, animation: `${popIn} 0.22s ease-out` }}>
          <Divider sx={{ mb: 1.5, opacity: 0.35 }} />

          {resultado.ya_alcanza && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1.4, borderRadius: '12px',
              bgcolor: isDark ? alpha('#16a34a', 0.1) : alpha('#f0fdf4', 0.9),
              border: `1px solid ${alpha('#16a34a', 0.25)}`,
            }}>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a', fontSize: 12 }}>
                {resultado.mensaje_general}
              </Typography>
            </Box>
          )}

          {resultado.imposible && (
            <Box sx={{
              p: 1.4, borderRadius: '12px',
              bgcolor: isDark ? alpha('#dc2626', 0.08) : alpha('#fef2f2', 1),
              border: `1px solid ${alpha('#dc2626', 0.25)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: '#dc2626', fontSize: 12 }}>
                  No es posible alcanzar esa nota
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {resultado.mensaje_general} — Nota máxima posible:{' '}
                <strong>{resultado.nota_maxima_posible.toFixed(1)}</strong>
              </Typography>
            </Box>
          )}

          {!resultado.ya_alcanza && !resultado.imposible && (
            <>
              {/* Resumen superior */}
              <Box sx={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', mb: 1.2, px: 0.2,
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, flex: 1, pr: 1 }}>
                  {resultado.mensaje_general}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.6, flexShrink: 0, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`${resultado.semanas_restantes} sem`}
                    sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha(accent, 0.1), color: accent }} />
                  {resultado.examenes_restantes_est > 0 && (
                    <Chip size="small"
                      label={`${resultado.examenes_restantes_est} examen${examRestantes !== null ? ' ✓' : ''}`}
                      sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha('#0284c7', 0.1), color: '#0284c7' }} />
                  )}
                  {resultado.practicas_restantes_est > 0 && (
                    <Chip size="small"
                      label={`${resultado.practicas_restantes_est} práct.${practRestantes !== null ? ' ✓' : ''}`}
                      sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed' }} />
                  )}
                </Box>
              </Box>

              {/* Escenarios */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {resultado.escenarios.map((esc, i) => (
                  <EscenarioDetalladoCard
                    key={esc.id} esc={esc} index={i}
                    isDark={isDark} notaActual={resultado.nota_actual}
                  />
                ))}
              </Box>

              {/* Techos informativos */}
              {(resultado.techo_practicas > 0 || resultado.techo_examenes > 0) && (
                <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                    Referencia histórica del estudiante:
                  </Typography>
                  {resultado.techo_examenes > 0 && (
                    <Chip size="small" label={`Examen ~ ${resultado.techo_examenes.toFixed(0)}`}
                      sx={{ height: 16, fontSize: '0.58rem', fontWeight: 600, bgcolor: alpha('#0284c7', 0.08), color: '#0284c7' }} />
                  )}
                  {resultado.techo_practicas > 0 && (
                    <Chip size="small" label={`Práctica ~ ${resultado.techo_practicas.toFixed(0)}`}
                      sx={{ height: 16, fontSize: '0.58rem', fontWeight: 600, bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed' }} />
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SeccionOptimaV2;