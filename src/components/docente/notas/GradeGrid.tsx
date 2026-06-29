'use client';
// components/docente/notas/GradeGrid.tsx
//
// Vista tipo planilla Excel:
//   Filas    = estudiantes
//   Columnas = evaluaciones de la dimensión activa
//   Edición  = inline por celda, Tab/Enter para navegar
//
import React, { useCallback, useRef, useState } from 'react';
import {
  Box, Typography, Avatar, Chip, Tooltip, CircularProgress,
  useTheme, alpha,
} from '@mui/material';
import SaveRoundedIcon        from '@mui/icons-material/SaveRounded';
import PersonOffRoundedIcon   from '@mui/icons-material/PersonOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';

import {
  CalificacionEstudiante,
  RegistroCalificacionItem,
  DIMENSIONES_CONFIG,
  CodigoDimension,
} from '@/types/notasTypes';
import { EvaluacionConProgreso } from './GradeGridTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciales(apellidos: string, nombres: string) {
  return `${(apellidos ?? '')[0] ?? ''}${(nombres ?? '')[0] ?? ''}`.toUpperCase();
}

function colorNota(puntaje: number, maximo: number) {
  const pct = maximo > 0 ? (puntaje / maximo) * 100 : 0;
  if (pct >= 51) return '#16a34a';
  if (pct >= 36) return '#d97706';
  return '#dc2626';
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface GradeGridProps {
  // Dimensión activa
  dimensionCodigo: CodigoDimension;
  // Lista de estudiantes (igual para todas las evaluaciones)
  lista: CalificacionEstudiante[];
  // Evaluaciones de la dimensión activa, ya enriquecidas con progreso
  evaluaciones: EvaluacionConProgreso[];
  // Mapa de notas: clave compuesta `${evaluacionId}_${matriculaId}`
  notas: Record<string, RegistroCalificacionItem & { evaluacion_id: number }>;
  isLoadingLista: boolean;
  isSaving: boolean;
  // Callbacks
  onSetNota: (
    evaluacion_id: number,
    matricula_id: number,
    datos: Partial<RegistroCalificacionItem>,
  ) => void;
  onMarcarAusente: (
    evaluacion_id: number,
    matricula_id: number,
    ausente: boolean,
  ) => void;
  onGuardar: () => void;
}

// ─── Celda editable ──────────────────────────────────────────────────────────

const CeldaNota: React.FC<{
  evaluacionId: number;
  matriculaId:  number;
  maximo:       number;
  nota?:        RegistroCalificacionItem & { evaluacion_id: number };
  dimColor:     string;
  isDark:       boolean;
  cellId:       string;
  onSetNota:    GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
  onTabNext:    (current: string) => void;
}> = ({
  evaluacionId, matriculaId, maximo, nota, dimColor, isDark,
  cellId, onSetNota, onMarcarAusente, onTabNext,
}) => {
  const ausente  = nota?.esta_ausente ?? false;
  const puntaje  = ausente ? 0 : (nota?.puntaje_obtenido ?? '');
  const tieneNota = nota !== undefined;

  const color = tieneNota && !ausente && typeof puntaje === 'number'
    ? colorNota(puntaje, maximo)
    : undefined;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSetNota(evaluacionId, matriculaId, {
      matricula_id:     matriculaId,
      puntaje_obtenido: isNaN(val) ? 0 : Math.min(Math.max(val, 0), maximo),
      esta_ausente:     false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      onTabNext(cellId);
    }
  };

  const bgAusente = isDark
    ? `repeating-linear-gradient(45deg,${alpha('#fff',0.03)},${alpha('#fff',0.03)} 4px,${alpha('#dc2626',0.06)} 4px,${alpha('#dc2626',0.06)} 8px)`
    : `repeating-linear-gradient(45deg,#fff,#fff 4px,#fff5f5 4px,#fff5f5 8px)`;

  return (
    <td
      data-cell={cellId}
      style={{
        padding: 0,
        borderRight: `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        background: ausente ? bgAusente : tieneNota ? alpha(color ?? dimColor, 0.06) : undefined,
        minWidth: 80,
        maxWidth: 100,
        position: 'relative',
      }}
    >
      {ausente ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 40, gap: 0.5,
        }}>
          <PersonOffRoundedIcon sx={{ fontSize: 13, color: '#dc2626', opacity: 0.7 }} />
          <Typography sx={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Ausente</Typography>
        </Box>
      ) : (
        <input
          ref={inputRef}
          data-cell={cellId}
          type="number"
          min={0}
          max={maximo}
          step={0.5}
          value={puntaje}
          placeholder="—"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: 40,
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: tieneNota ? 700 : 400,
            color: tieneNota ? color : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
            outline: 'none',
            cursor: 'text',
            fontFamily: 'inherit',
          }}
          onFocus={e => {
            e.currentTarget.style.background = isDark
              ? 'rgba(59,130,246,0.15)'
              : 'rgba(59,130,246,0.08)';
            e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${dimColor}`;
          }}
          onBlur={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      )}

      {/* Botón ausente — aparece en hover */}
      <Tooltip title={ausente ? 'Quitar ausente' : 'Marcar ausente'}>
        <Box
          onClick={e => { e.stopPropagation(); onMarcarAusente(evaluacionId, matriculaId, !ausente); }}
          sx={{
            position: 'absolute', top: 2, right: 2,
            width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '4px',
            opacity: 0,
            cursor: 'pointer',
            color: ausente ? '#dc2626' : 'text.disabled',
            'td:hover &': { opacity: 1 },
            '&:hover': { color: '#dc2626', background: alpha('#dc2626', 0.1) },
          }}
        >
          <PersonOffRoundedIcon sx={{ fontSize: 11 }} />
        </Box>
      </Tooltip>
    </td>
  );
};

// ─── GradeGrid ────────────────────────────────────────────────────────────────

export const GradeGrid: React.FC<GradeGridProps> = ({
  dimensionCodigo,
  lista,
  evaluaciones,
  notas,
  isLoadingLista,
  isSaving,
  onSetNota,
  onMarcarAusente,
  onGuardar,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg    = DIMENSIONES_CONFIG[dimensionCodigo];
  const color  = cfg.color;

  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`;

  // --- Navegación con Tab/Enter -----------------------------------------------
  // cellId = `${evIdx}_${estIdx}`
  const tableRef = useRef<HTMLTableElement>(null);

  const handleTabNext = useCallback((current: string) => {
    if (!tableRef.current) return;
    const cells = Array.from(
      tableRef.current.querySelectorAll<HTMLInputElement>('input[data-cell]')
    );
    const idx = cells.findIndex(c => c.dataset.cell === current);
    if (idx !== -1 && idx < cells.length - 1) {
      cells[idx + 1].focus();
    }
  }, []);

  // --- Contadores globales ----------------------------------------------------
  const totalCeldas   = lista.length * evaluaciones.length;
  const celdas_notas  = Object.values(notas).filter(n => !n.esta_ausente).length;
  const celdas_ausentes = Object.values(notas).filter(n => n.esta_ausente).length;
  const pctGlobal     = totalCeldas > 0
    ? Math.round(((celdas_notas + celdas_ausentes) / totalCeldas) * 100) : 0;
  const todo_completo = pctGlobal === 100;

  // --- Total por estudiante ---------------------------------------------------
  function calcularTotal(matriculaId: number) {
    let suma = 0; let maxi = 0; let contadas = 0;
    evaluaciones.forEach(ev => {
      const key  = `${ev.id}_${matriculaId}`;
      const nota = notas[key];
      maxi += ev.puntaje_maximo;
      if (nota !== undefined) {
        suma += nota.esta_ausente ? 0 : (nota.puntaje_obtenido ?? 0);
        contadas++;
      }
    });
    return { suma, maxi, contadas };
  }

  const borderCell = `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`;
  const thBase: React.CSSProperties = {
    padding: '8px 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize: 11,
    borderRight: borderCell,
    borderBottom: borderCell,
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  };

  // --- Estados vacíos ---------------------------------------------------------
  if (isLoadingLista) return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress size={28} sx={{ color }} />
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', mt: 1.5 }}>
        Cargando estudiantes...
      </Typography>
    </Box>
  );

  if (evaluaciones.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(color, 0.3)}`,
      bgcolor: isDark ? alpha(color, 0.04) : alpha(cfg.bgColor, 0.3),
    }}>
      <HourglassEmptyRoundedIcon sx={{ fontSize: 40, color: alpha(color, 0.35), mb: 1 }} />
      <Typography variant="body1" sx={{ color, fontWeight: 700 }}>
        Sin evaluaciones en {cfg.label}
      </Typography>
    </Box>
  );

  if (lista.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(color, 0.3)}`,
    }}>
      <Typography variant="body2" color="text.disabled">
        Sin estudiantes en la lista
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* ── Barra de resumen + botón guardar ─────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 2, gap: 2, flexWrap: 'wrap',
      }}>
        {/* Progreso global */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
                {celdas_notas + celdas_ausentes}/{totalCeldas} notas
                {celdas_ausentes > 0 && ` · ${celdas_ausentes} ausentes`}
              </Typography>
              <Typography variant="caption" fontWeight={800}
                sx={{ fontSize: 11, color: todo_completo ? '#16a34a' : color }}>
                {pctGlobal}%
              </Typography>
            </Box>
            <Box sx={{
              height: 5, borderRadius: 3,
              bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
              overflow: 'hidden',
            }}>
              <Box sx={{
                height: '100%', borderRadius: 3,
                width: `${pctGlobal}%`,
                background: todo_completo
                  ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                  : gradBg,
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </Box>
          </Box>
          {todo_completo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, fontSize: 11 }}>
                ¡Completo!
              </Typography>
            </Box>
          )}
        </Box>

        {/* Botón guardar */}
        <Box
          component="button"
          onClick={onGuardar}
          disabled={isSaving || (celdas_notas + celdas_ausentes) === 0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.8,
            px: 2.5, py: 1,
            borderRadius: '12px', border: 'none',
            background: (celdas_notas + celdas_ausentes) > 0 ? gradBg : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
            color: (celdas_notas + celdas_ausentes) > 0 ? '#fff' : 'text.disabled',
            fontWeight: 700, fontSize: 13,
            cursor: isSaving || (celdas_notas + celdas_ausentes) === 0 ? 'default' : 'pointer',
            transition: 'opacity 0.2s, transform 0.15s',
            flexShrink: 0,
            '&:hover': {
              opacity: isSaving ? 1 : 0.88,
              transform: isSaving ? 'none' : 'translateY(-1px)',
            },
          }}
        >
          {isSaving
            ? <CircularProgress size={14} sx={{ color: '#fff' }} />
            : <SaveRoundedIcon sx={{ fontSize: 16 }} />}
          {isSaving ? 'Guardando...' : `Guardar (${celdas_notas + celdas_ausentes})`}
        </Box>
      </Box>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        border: borderCell,
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table
            ref={tableRef}
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}
          >
            {/* ── THEAD ── */}
            <thead>
              {/* Fila 1: nombre col + evaluaciones + total */}
              <tr>
                {/* Columna nombre — sticky */}
                <th style={{
                  ...thBase,
                  textAlign: 'left',
                  minWidth: 200,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: isDark ? '#1e1e1e' : '#f8f9fa',
                  borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%', bgcolor: color,
                      boxShadow: `0 0 6px ${alpha(color, 0.5)}`,
                    }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>
                      {cfg.label} · {cfg.porcentaje}%
                    </Typography>
                  </Box>
                </th>

                {/* Columnas de evaluaciones */}
                {evaluaciones.map(ev => {
                  const pct = ev.total_alumnos > 0
                    ? Math.round((ev.con_nota / ev.total_alumnos) * 100) : 0;
                  return (
                    <th key={ev.id} style={{ ...thBase, minWidth: 90, maxWidth: 110, verticalAlign: 'bottom' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
                        <Tooltip title={ev.nombre} placement="top">
                          <Typography sx={{
                            fontSize: 11, fontWeight: 700,
                            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                            maxWidth: 88, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            cursor: 'default',
                          }}>
                            {ev.nombre}
                          </Typography>
                        </Tooltip>
                        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                          /{ev.puntaje_maximo} pts
                        </Typography>
                        {/* Mini barra de progreso por columna */}
                        <Box sx={{ width: '80%', height: 3, borderRadius: 2, bgcolor: alpha(color, 0.15), overflow: 'hidden' }}>
                          <Box sx={{
                            height: '100%', borderRadius: 2,
                            width: `${pct}%`,
                            bgcolor: pct === 100 ? '#16a34a' : color,
                            transition: 'width 0.3s',
                          }} />
                        </Box>
                        <Typography sx={{ fontSize: 9, color: pct === 100 ? '#16a34a' : 'text.disabled', fontWeight: pct === 100 ? 700 : 400 }}>
                          {pct}%
                        </Typography>
                      </Box>
                    </th>
                  );
                })}

                {/* Columna total */}
                <th style={{
                  ...thBase,
                  minWidth: 80,
                  borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  borderRight: 'none',
                  color,
                  fontWeight: 700,
                }}>
                  Total
                </th>
              </tr>
            </thead>

            {/* ── TBODY ── */}
            <tbody>
              {lista.map((est, estIdx) => {
                const { suma, maxi, contadas } = calcularTotal(est.matricula_id);
                const pctTotal = maxi > 0 ? Math.round((suma / maxi) * 100) : null;
                const chipColor = pctTotal === null
                  ? 'text.disabled'
                  : pctTotal >= 51 ? '#16a34a' : pctTotal >= 36 ? '#d97706' : '#dc2626';
                const chipBg = pctTotal === null
                  ? (isDark ? alpha('#fff', 0.04) : '#f3f4f6')
                  : pctTotal >= 51
                    ? alpha('#16a34a', 0.12)
                    : pctTotal >= 36
                      ? alpha('#d97706', 0.12)
                      : alpha('#dc2626', 0.12);

                return (
                  <tr key={est.matricula_id}>
                    {/* Celda nombre — sticky */}
                    <td style={{
                      borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                      borderBottom: borderCell,
                      padding: '6px 12px',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      background: isDark ? '#1e1e1e' : '#fff',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{
                          minWidth: 20, textAlign: 'center',
                          fontSize: 10, fontWeight: 600,
                          color: 'text.disabled',
                        }}>
                          {estIdx + 1}
                        </Typography>
                        <Avatar
                          src={est.estudiante_foto ?? undefined}
                          sx={{
                            width: 28, height: 28,
                            fontSize: 10, fontWeight: 700,
                            background: gradBg,
                            flexShrink: 0,
                          }}
                        >
                          {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                            {est.estudiante_apellidos}, {est.estudiante_nombres}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                            {est.estudiante_codigo}
                          </Typography>
                        </Box>
                      </Box>
                    </td>

                    {/* Celdas de notas */}
                    {evaluaciones.map((ev, evIdx) => (
                      <CeldaNota
                        key={ev.id}
                        evaluacionId={ev.id}
                        matriculaId={est.matricula_id}
                        maximo={ev.puntaje_maximo}
                        nota={notas[`${ev.id}_${est.matricula_id}`]}
                        dimColor={color}
                        isDark={isDark}
                        cellId={`${evIdx}_${estIdx}`}
                        onSetNota={onSetNota}
                        onMarcarAusente={onMarcarAusente}
                        onTabNext={handleTabNext}
                      />
                    ))}

                    {/* Total */}
                    <td style={{
                      padding: '6px 10px',
                      textAlign: 'center',
                      borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                      borderBottom: borderCell,
                      borderRight: 'none',
                    }}>
                      {contadas > 0 ? (
                        <Chip
                          label={pctTotal !== null ? `${pctTotal}%` : '—'}
                          size="small"
                          sx={{
                            fontSize: 11, height: 22, fontWeight: 700,
                            bgcolor: chipBg, color: chipColor,
                            border: `0.5px solid ${chipColor}`,
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* ── TFOOT: promedio por columna ── */}
            <tfoot>
              <tr>
                <td style={{
                  padding: '7px 12px',
                  borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  background: isDark ? '#1e1e1e' : '#f8f9fa',
                  position: 'sticky', left: 0, zIndex: 1,
                }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}>
                    Promedio clase
                  </Typography>
                </td>
                {evaluaciones.map(ev => {
                  const vals = lista
                    .map(est => notas[`${ev.id}_${est.matricula_id}`])
                    .filter(n => n && !n.esta_ausente && typeof n.puntaje_obtenido === 'number');
                  const prom = vals.length > 0
                    ? (vals.reduce((s, n) => s + (n!.puntaje_obtenido ?? 0), 0) / vals.length)
                    : null;
                  return (
                    <td key={ev.id} style={{
                      textAlign: 'center',
                      padding: '7px 8px',
                      borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                      borderRight: borderCell,
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: prom !== null ? color : 'text.disabled' }}>
                        {prom !== null ? prom.toFixed(1) : '—'}
                      </Typography>
                    </td>
                  );
                })}
                <td style={{
                  borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  background: isDark ? '#1e1e1e' : '#f8f9fa',
                }} />
              </tr>
            </tfoot>
          </table>
        </Box>
      </Box>

      {/* ── Leyenda ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 10, color: 'text.disabled', fontWeight: 600 }}>
          Tab / Enter para avanzar celda
        </Typography>
        {[
          { label: 'Aprobado ≥51%',  color: '#16a34a', bg: alpha('#16a34a', 0.1) },
          { label: 'En riesgo 36–50%', color: '#d97706', bg: alpha('#d97706', 0.1) },
          { label: 'Reprobado <36%', color: '#dc2626', bg: alpha('#dc2626', 0.1) },
        ].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: l.bg, border: `0.5px solid ${l.color}` }} />
            <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};