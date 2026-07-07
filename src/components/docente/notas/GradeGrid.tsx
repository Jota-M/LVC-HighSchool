'use client';
// components/docente/notas/GradeGrid.tsx
//
// Vista tipo planilla Excel en desktop / tarjetas por estudiante en mobile:
//   Filas    = estudiantes
//   Columnas = evaluaciones de la dimensión activa
//   Edición  = inline por celda, Tab/Enter para navegar (desktop)
//
import React, { useCallback, useRef } from 'react';
import {
  Box, Typography, Avatar, Chip, Tooltip, CircularProgress,
  useTheme, useMediaQuery, alpha,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
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

// Color semántico de la nota (aprobado / en riesgo / reprobado).
// Esto es información funcional -> se mantiene fijo, no sigue la marca.
function colorNota(puntaje: number, maximo: number) {
  const pct = maximo > 0 ? (puntaje / maximo) * 100 : 0;
  if (pct >= 51) return '#16a34a';
  if (pct >= 36) return '#d97706';
  return '#dc2626';
}

function estadoChip(pct: number | null) {
  if (pct === null) return { color: 'text.disabled' as const, bg: null as string | null };
  if (pct >= 51) return { color: '#16a34a', bg: alpha('#16a34a', 0.12) };
  if (pct >= 36) return { color: '#d97706', bg: alpha('#d97706', 0.12) };
  return { color: '#dc2626', bg: alpha('#dc2626', 0.12) };
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface GradeGridProps {
  dimensionCodigo: CodigoDimension;
  lista: CalificacionEstudiante[];
  evaluaciones: EvaluacionConProgreso[];
  notas: Record<string, RegistroCalificacionItem & { evaluacion_id: number }>;
  isLoadingLista: boolean;
  isSaving: boolean;
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

// ─── Celda editable (desktop) ─────────────────────────────────────────────────

const CeldaNota: React.FC<{
  evaluacionId: number;
  matriculaId: number;
  maximo: number;
  nota?: RegistroCalificacionItem & { evaluacion_id: number };
  isDark: boolean;
  brandAccent: string;
  cellId: string;
  onSetNota: GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
  onTabNext: (current: string) => void;
}> = ({
  evaluacionId, matriculaId, maximo, nota, isDark, brandAccent,
  cellId, onSetNota, onMarcarAusente, onTabNext,
}) => {
    const ausente = nota?.esta_ausente ?? false;
    const puntaje = ausente ? 0 : (nota?.puntaje_obtenido ?? '');
    const tieneNota = nota !== undefined;

    const color = tieneNota && !ausente && typeof puntaje === 'number'
      ? colorNota(Number(puntaje), Number(maximo))
      : undefined;

    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      onSetNota(evaluacionId, matriculaId, {
        matricula_id: matriculaId,
        puntaje_obtenido: isNaN(val) ? 0 : Math.min(Math.max(val, 0), Number(maximo)),
        esta_ausente: false,
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onTabNext(cellId);
      }
    };

    const bgAusente = isDark
      ? `repeating-linear-gradient(45deg,${alpha('#fff', 0.025)},${alpha('#fff', 0.025)} 4px,${alpha('#dc2626', 0.08)} 4px,${alpha('#dc2626', 0.08)} 8px)`
      : `repeating-linear-gradient(45deg,#fff,#fff 4px,#fff5f5 4px,#fff5f5 8px)`;

    // En dark mode evitamos el "fondo tintado completo" (se ve murky/caqui) y
    // usamos un borde izquierdo de acento en su lugar; en light mode el tinte
    // suave de fondo sigue funcionando bien.
    const cellBg = ausente
      ? bgAusente
      : tieneNota
        ? (isDark ? alpha('#fff', 0.025) : alpha(color ?? brandAccent, 0.07))
        : undefined;

    return (
      <td
        data-cell={cellId}
        style={{
          padding: 0,
          borderRight: `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          borderLeft: tieneNota && !ausente ? `3px solid ${color}` : '3px solid transparent',
          background: cellBg,
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
              e.currentTarget.style.background = alpha(brandAccent, isDark ? 0.14 : 0.08);
              e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${brandAccent}`;
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        )}

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

// ─── Fila editable (mobile, dentro de una tarjeta de estudiante) ─────────────

const FilaNotaMobile: React.FC<{
  ev: EvaluacionConProgreso;
  matriculaId: number;
  nota?: RegistroCalificacionItem & { evaluacion_id: number };
  isDark: boolean;
  brandAccent: string;
  onSetNota: GradeGridProps['onSetNota'];
  onMarcarAusente: GradeGridProps['onMarcarAusente'];
}> = ({ ev, matriculaId, nota, isDark, brandAccent, onSetNota, onMarcarAusente }) => {
  const ausente = nota?.esta_ausente ?? false;
  const puntaje = ausente ? 0 : (nota?.puntaje_obtenido ?? '');
  const tieneNota = nota !== undefined;
  const color = tieneNota && !ausente && typeof puntaje === 'number'
    ? colorNota(Number(puntaje), Number(ev.puntaje_maximo))
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSetNota(ev.id, matriculaId, {
      matricula_id: matriculaId,
      puntaje_obtenido: isNaN(val) ? 0 : Math.min(Math.max(val, 0), Number(ev.puntaje_maximo)),
      esta_ausente: false,
    });
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.2,
      py: 1.1, px: 0.5,
      borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
      '&:last-of-type': { borderBottom: 'none' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {ev.nombre}
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>
          /{ev.puntaje_maximo} pts
        </Typography>
      </Box>

      {ausente ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1.2, py: 0.7, borderRadius: '10px',
          bgcolor: alpha('#dc2626', 0.1),
        }}>
          <PersonOffRoundedIcon sx={{ fontSize: 14, color: '#dc2626' }} />
          <Typography sx={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Ausente</Typography>
        </Box>
      ) : (
        <input
          type="number"
          min={0}
          max={ev.puntaje_maximo}
          step={0.5}
          value={puntaje}
          placeholder="—"
          onChange={handleChange}
          style={{
            width: 68,
            height: 44,
            borderRadius: 10,
            border: `1.5px solid ${tieneNota ? alpha(color ?? brandAccent, 0.5) : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
            background: tieneNota ? alpha(color ?? brandAccent, isDark ? 0.1 : 0.06) : 'transparent',
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 700,
            color: tieneNota ? color : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      )}

      <Box
        onClick={() => onMarcarAusente(ev.id, matriculaId, !ausente)}
        sx={{
          width: 36, height: 36, borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ausente ? '#dc2626' : 'text.disabled',
          bgcolor: ausente ? alpha('#dc2626', 0.1) : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)),
          flexShrink: 0,
        }}
      >
        <PersonOffRoundedIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cfg = DIMENSIONES_CONFIG[dimensionCodigo];
  const dimColor = cfg.color;

  // Acento de marca: amarillo en oscuro, celeste-azulado en claro.
  // Mismo par de colores que el título y los tabs en la página contenedora.
  const brandAccent = isDark ? '#facc15' : '#0288d1';
  const brandAccentEnd = isDark ? '#f59e0b' : '#01579b';
  const brandGrad = `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccentEnd} 100%)`;

  // --- Navegación con Tab/Enter -----------------------------------------------
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
  const totalCeldas = lista.length * evaluaciones.length;
  const celdas_notas = Object.values(notas).filter(n => !n.esta_ausente).length;
  const celdas_ausentes = Object.values(notas).filter(n => n.esta_ausente).length;
  const pctGlobal = totalCeldas > 0
    ? Math.round(((celdas_notas + celdas_ausentes) / totalCeldas) * 100) : 0;
  const todo_completo = pctGlobal === 100;

  // --- Total por estudiante ---------------------------------------------------
  // IMPORTANTE: maxi solo suma el máximo de evaluaciones YA calificadas.
  // Si sumara el máximo de todas (incluidas las sin nota), el denominador
  // queda inflado y el % sale artificialmente bajo.
  const calcularTotal = useCallback((matriculaId: number) => {
    let suma = 0; let maxi = 0; let contadas = 0;
    evaluaciones.forEach(ev => {
      const key = `${ev.id}_${matriculaId}`;
      const nota = notas[key];
      if (nota !== undefined) {
        maxi += Number(ev.puntaje_maximo);
        suma += nota.esta_ausente ? 0 : Number(nota.puntaje_obtenido ?? 0);
        contadas++;
      }
    });
    return { suma, maxi, contadas };
  }, [evaluaciones, notas]);

  const borderCell = `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`;
  const thBase: React.CSSProperties = {
    padding: '8px 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize: 11,
    borderRight: borderCell,
    borderBottom: borderCell,
    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
    background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.02)',
  };

  // --- Estados vacíos ---------------------------------------------------------
  if (isLoadingLista) return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress size={28} sx={{ color: brandAccent }} />
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', mt: 1.5 }}>
        Cargando estudiantes...
      </Typography>
    </Box>
  );

  if (evaluaciones.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(dimColor, 0.3)}`,
      bgcolor: isDark ? alpha(dimColor, 0.04) : alpha(cfg.bgColor, 0.3),
    }}>
      <HourglassEmptyRoundedIcon sx={{ fontSize: 40, color: alpha(dimColor, 0.35), mb: 1 }} />
      <Typography variant="body1" sx={{ color: dimColor, fontWeight: 700 }}>
        Sin evaluaciones en {cfg.label}
      </Typography>
    </Box>
  );

  if (lista.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${alpha(dimColor, 0.3)}`,
    }}>
      <Typography variant="body2" color="text.disabled">
        Sin estudiantes en la lista
      </Typography>
    </Box>
  );

  // ── Barra superior: progreso global + botón guardar (compartida) ──────────
  const barraSuperior = (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      mb: 2, gap: 2, flexWrap: 'wrap',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
              {celdas_notas + celdas_ausentes}/{totalCeldas} notas
              {celdas_ausentes > 0 && ` · ${celdas_ausentes} ausentes`}
            </Typography>
            <Typography variant="caption" fontWeight={800}
              sx={{ fontSize: 11, color: todo_completo ? '#16a34a' : brandAccent }}>
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
                : brandGrad,
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </Box>
        </Box>
        {todo_completo && !isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, fontSize: 11 }}>
              ¡Completo!
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        component="button"
        onClick={onGuardar}
        disabled={isSaving || (celdas_notas + celdas_ausentes) === 0}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
          px: 2.5, py: 1,
          width: { xs: '100%', sm: 'auto' },
          borderRadius: '12px', border: 'none',
          background: (celdas_notas + celdas_ausentes) > 0 ? brandGrad : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
          color: (celdas_notas + celdas_ausentes) > 0 ? (isDark ? '#1a1a1a' : '#fff') : 'text.disabled',
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
          ? <CircularProgress size={14} sx={{ color: 'inherit' }} />
          : <SaveRoundedIcon sx={{ fontSize: 16 }} />}
        {isSaving ? 'Guardando...' : `Guardar (${celdas_notas + celdas_ausentes})`}
      </Box>
    </Box>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE: tarjetas por estudiante
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <Box>
        {barraSuperior}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {lista.map((est, estIdx) => {
            const { suma, maxi, contadas } = calcularTotal(est.matricula_id);
            const pctTotal = maxi > 0 ? Math.round((suma / maxi) * 100) : null;
            const estado = estadoChip(contadas > 0 ? pctTotal : null);

            return (
              <Box key={est.matricula_id} sx={{
                borderRadius: '14px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                overflow: 'hidden',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              }}>
                {/* Encabezado de la tarjeta */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  p: 1.4,
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8f9fa', 0.9),
                }}>
                  <Typography sx={{ minWidth: 16, fontSize: 10, fontWeight: 600, color: 'text.disabled' }}>
                    {estIdx + 1}
                  </Typography>
                  <Avatar
                    src={est.estudiante_foto ?? undefined}
                    sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, background: brandGrad, color: isDark ? '#1a1a1a' : '#fff', flexShrink: 0 }}
                  >
                    {iniciales(est.estudiante_apellidos, est.estudiante_nombres)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {est.estudiante_apellidos}, {est.estudiante_nombres}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>
                      {est.estudiante_codigo}
                    </Typography>
                  </Box>
                  {contadas > 0 ? (
                    <Chip
                      label={pctTotal !== null ? `${pctTotal}%` : '—'}
                      size="small"
                      sx={{
                        fontSize: 12, height: 26, fontWeight: 800,
                        bgcolor: estado.bg ?? undefined,
                        color: estado.color,
                        border: `1px solid ${estado.color}`,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }}>—</Typography>
                  )}
                </Box>

                {/* Evaluaciones */}
                <Box sx={{ px: 1.4 }}>
                  {evaluaciones.map(ev => (
                    <FilaNotaMobile
                      key={ev.id}
                      ev={ev}
                      matriculaId={est.matricula_id}
                      nota={notas[`${ev.id}_${est.matricula_id}`]}
                      isDark={isDark}
                      brandAccent={brandAccent}
                      onSetNota={onSetNota}
                      onMarcarAusente={onMarcarAusente}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Leyenda */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Aprobado ≥51%', color: '#16a34a' },
            { label: 'En riesgo 36–50%', color: '#d97706' },
            { label: 'Reprobado <36%', color: '#dc2626' },
          ].map(l => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: 1, bgcolor: alpha(l.color, 0.15), border: `1px solid ${l.color}` }} />
              <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP / TABLET: tabla
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Box>
      {barraSuperior}

      <Box sx={{
        border: borderCell,
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table
            ref={tableRef}
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}
          >
            <thead>
              <tr>
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
                      width: 8, height: 8, borderRadius: '50%', bgcolor: dimColor,
                      boxShadow: `0 0 6px ${alpha(dimColor, 0.5)}`,
                    }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: dimColor }}>
                      {cfg.label} · {cfg.porcentaje}%
                    </Typography>
                  </Box>
                </th>

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
                        <Box sx={{ width: '80%', height: 3, borderRadius: 2, bgcolor: alpha(dimColor, 0.15), overflow: 'hidden' }}>
                          <Box sx={{
                            height: '100%', borderRadius: 2,
                            width: `${pct}%`,
                            bgcolor: pct === 100 ? '#16a34a' : dimColor,
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

                <th style={{
                  ...thBase,
                  minWidth: 80,
                  borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                  borderRight: 'none',
                  color: brandAccent,
                  fontWeight: 700,
                }}>
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {lista.map((est, estIdx) => {
                const { suma, maxi, contadas } = calcularTotal(est.matricula_id);
                const pctTotal = maxi > 0 ? Math.round((suma / maxi) * 100) : null;
                const estado = estadoChip(contadas > 0 ? pctTotal : null);

                return (
                  <tr key={est.matricula_id}>
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
                            background: brandGrad,
                            color: isDark ? '#1a1a1a' : '#fff',
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

                    {evaluaciones.map((ev, evIdx) => (
                      <CeldaNota
                        key={ev.id}
                        evaluacionId={ev.id}
                        matriculaId={est.matricula_id}
                        maximo={ev.puntaje_maximo}
                        nota={notas[`${ev.id}_${est.matricula_id}`]}
                        isDark={isDark}
                        brandAccent={brandAccent}
                        cellId={`${evIdx}_${estIdx}`}
                        onSetNota={onSetNota}
                        onMarcarAusente={onMarcarAusente}
                        onTabNext={handleTabNext}
                      />
                    ))}

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
                            bgcolor: estado.bg ?? undefined,
                            color: estado.color,
                            border: `0.5px solid ${estado.color}`,
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
                    .filter(n => n && !n.esta_ausente && n.puntaje_obtenido !== null && n.puntaje_obtenido !== undefined)
                    .map(n => Number(n!.puntaje_obtenido));
                  const prom = vals.length > 0
                    ? (vals.reduce((s, v) => s + v, 0) / vals.length)
                    : null;
                  return (
                    <td key={ev.id} style={{
                      textAlign: 'center',
                      padding: '7px 8px',
                      borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                      borderRight: borderCell,
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: prom !== null ? brandAccent : 'text.disabled' }}>
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

      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 10, color: 'text.disabled', fontWeight: 600 }}>
          Tab / Enter para avanzar celda
        </Typography>
        {[
          { label: 'Aprobado ≥51%', color: '#16a34a', bg: alpha('#16a34a', 0.1) },
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