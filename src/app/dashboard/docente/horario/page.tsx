'use client';
// app/dashboard/docente/horario/page.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, useTheme, alpha,
  Chip, Skeleton, Tooltip, IconButton, Paper,
  ToggleButtonGroup, ToggleButton, FormControl,
  InputLabel, Select, MenuItem, Fade, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  MeetingRoom as AulaIcon,
  Person as PersonIcon,
  Coffee as RecresoIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Refresh as RefreshIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';

import { HorarioReadonlyGrid } from '@/components/horario/HorarioReadonlyGrid';
import { useHorarioDocente }   from '@/hooks/useHorarioDocente';
import { useDocentePerfil }    from '@/hooks/useDocentePerfil';
import { useAcademicos }       from '@/hooks/useAcademicos';
import { DIAS_SEMANA }         from '@/types/horariotypes';
import { useAuth }             from '@/context/AuthContext';

// ─────────────────────────────────────────────────────────────
// KEYFRAMES — mismo estilo que el home de docente
// ─────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const scanH = keyframes`
  0%   { left: -100%; }
  100% { left: 200%; }
`;
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%       { box-shadow: 0 0 0 6px transparent; }
`;

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const DIAS_LV = [1, 2, 3, 4, 5];
const DIAS_LS = [1, 2, 3, 4, 5, 6];
const DIAS_CORTO: Record<number, string> = {
  1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB',
};
const DIAS_FULL: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};

// Paleta de colores para materias sin color asignado
const PALETTE = [
  '#facc15', '#f59e0b', '#3b82f6', '#8b5cf6',
  '#10b981', '#06b6d4', '#f97316', '#ec4899',
];
const getColor = (nombre: string, override?: string | null) => {
  if (override) return override;
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const fmtHora = (h: string) => h?.slice(0, 5) ?? '';
const toMin   = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};
const ahoraMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};
const diaActual = (): number | null => {
  const d = new Date().getDay();
  return d === 0 ? null : d;
};

// ─────────────────────────────────────────────────────────────
// SUB: CELDA DE LA GRILLA — reconstruida desde cero
// ─────────────────────────────────────────────────────────────

interface CeldaProps {
  celda:    any | null;   // HorarioDetalle | null
  esHoy:    boolean;
  enCurso:  boolean;
  isDark:   boolean;
  GOLD:     string;
}

const Celda: React.FC<CeldaProps> = ({ celda, esHoy, enCurso, isDark, GOLD }) => {
  const [hover, setHover] = useState(false);

  // Vacía
  if (!celda) return (
    <Box sx={{
      borderRadius: '3px',
      minHeight: 80,
      bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.02),
      border: `1px dashed ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.06)}`,
    }} />
  );

  // Recreo
  if (celda.es_recreo) return (
    <Box sx={{
      borderRadius: '3px',
      minHeight: 36,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
      border: `1px dashed ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    }}>
      <RecresoIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
      <Typography sx={{
        fontSize: '0.58rem', color: 'text.disabled', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Recreo
      </Typography>
    </Box>
  );

  const color = getColor(celda.materia_nombre ?? '', celda.color ?? celda.materia_color);

  return (
    <Tooltip
      placement="top"
      arrow
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="body2" fontWeight={800} gutterBottom>
            {celda.materia_nombre}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
            🕐 {fmtHora(celda.hora_inicio)} – {fmtHora(celda.hora_fin)}
          </Typography>
          {celda.docente_apellidos && (
            <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
              👤 {celda.docente_apellidos}, {celda.docente_nombres}
            </Typography>
          )}
          {celda.aula && (
            <Typography variant="caption" display="block" sx={{ color: alpha('#fff', 0.8) }}>
              🚪 Aula {celda.aula}
            </Typography>
          )}
        </Box>
      }
    >
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          borderRadius: '3px',
          minHeight: 80,
          p: 1.1,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          // Fondo basado en el color de la materia
          bgcolor: isDark ? alpha(color, 0.15) : alpha(color, 0.1),
          border: `1px solid ${alpha(color, enCurso ? 0.6 : hover ? 0.45 : 0.22)}`,
          // Borde izquierdo grueso — marca industrial
          borderLeft: `3px solid ${color}`,
          // Indicador "hoy"
          boxShadow: enCurso
            ? `0 0 0 1px ${alpha(color, 0.4)}, inset 0 0 0 1px ${alpha(color, 0.15)}`
            : 'none',
          transition: 'all 0.15s ease',
          transform: hover ? 'translateY(-2px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 0.5,
        }}
      >
        {/* Dot pulsante si está en curso */}
        {enCurso && (
          <Box sx={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: color,
            animation: `${blink} 1.2s ease-in-out infinite`,
          }} />
        )}

        {/* Scan decorativo al hover */}
        {hover && (
          <Box sx={{
            position: 'absolute', top: 0, bottom: 0, width: '40%',
            background: `linear-gradient(90deg, transparent, ${alpha(color, 0.08)}, transparent)`,
            animation: `${scanH} 0.6s ease-in-out`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Nombre materia */}
        <Typography sx={{
          fontSize: '0.72rem',
          fontWeight: 900,
          color,
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {celda.materia_nombre}
        </Typography>

        {/* Info inferior */}
        <Box>
          {celda.aula && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <AulaIcon sx={{ fontSize: 9, color: alpha(color, 0.65) }} />
              <Typography sx={{ fontSize: '0.58rem', color: alpha(color, 0.75), fontWeight: 700 }}>
                {celda.aula}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB: EJE DE HORAS (columna izquierda)
// ─────────────────────────────────────────────────────────────

const EjeHora: React.FC<{ horaInicio: string; horaFin: string; nombre: string; esRecreo: boolean; enCurso: boolean; GOLD: string }> = ({
  horaInicio, horaFin, nombre, esRecreo, enCurso, GOLD,
}) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'flex-end', justifyContent: 'center',
    pr: 1.5, minHeight: esRecreo ? 36 : 80,
    position: 'relative',
  }}>
    {/* Línea de acento si está en curso */}
    {enCurso && (
      <Box sx={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%',
        width: 2, bgcolor: GOLD, borderRadius: 1,
      }} />
    )}
    {esRecreo ? (
      <Typography sx={{
        fontSize: '0.58rem', color: 'text.disabled',
        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}>
        —
      </Typography>
    ) : (
      <>
        <Typography sx={{
          fontSize: '0.68rem', fontWeight: enCurso ? 900 : 700,
          color: enCurso ? GOLD : 'text.secondary',
          fontFamily: 'monospace', lineHeight: 1.2,
        }}>
          {fmtHora(horaInicio)}
        </Typography>
        <Box sx={{ width: 12, height: 1, bgcolor: alpha(GOLD, 0.2), my: 0.25 }} />
        <Typography sx={{
          fontSize: '0.6rem', color: 'text.disabled',
          fontFamily: 'monospace', lineHeight: 1.2,
        }}>
          {fmtHora(horaFin)}
        </Typography>
      </>
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────
// SUB: CABECERA DE DÍA
// ─────────────────────────────────────────────────────────────

const DiaHeader: React.FC<{
  dia: number; esHoy: boolean; clases: number;
  isDark: boolean; GOLD: string;
}> = ({ dia, esHoy, clases, isDark, GOLD }) => (
  <Box sx={{
    textAlign: 'center',
    py: 1.25, px: 0.5,
    borderRadius: '3px',
    bgcolor: esHoy
      ? alpha(GOLD, isDark ? 0.15 : 0.1)
      : isDark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
    border: `1px solid ${esHoy ? alpha(GOLD, 0.4) : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06))}`,
    borderTop: esHoy ? `3px solid ${GOLD}` : `3px solid transparent`,
    transition: 'all 0.2s ease',
  }}>
    <Typography sx={{
      fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em',
      textTransform: 'uppercase', color: esHoy ? GOLD : 'text.disabled',
      display: 'block', lineHeight: 1,
    }}>
      {DIAS_CORTO[dia]}
    </Typography>
    {esHoy && (
      <Box sx={{
        width: 5, height: 5, borderRadius: '50%',
        bgcolor: GOLD, mx: 'auto', mt: 0.5,
        animation: `${blink} 2s ease-in-out infinite`,
      }} />
    )}
    {clases > 0 && (
      <Typography sx={{
        fontSize: '0.55rem', color: esHoy ? GOLD : 'text.disabled',
        fontFamily: 'monospace', mt: 0.25, lineHeight: 1,
      }}>
        {clases}cl
      </Typography>
    )}
  </Box>
);

// ─────────────────────────────────────────────────────────────
// SUB: PANEL STAT — mismo que home del docente
// ─────────────────────────────────────────────────────────────

const StatPanel: React.FC<{
  label: string; value: string | number; sub?: string;
  accent: string; delay?: number; loading?: boolean;
}> = ({ label, value, sub, accent, delay = 0, loading }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      p: 2, borderRadius: '2px', position: 'relative', overflow: 'hidden',
      bgcolor: isDark ? alpha('#000', 0.4) : alpha('#fff', 0.8),
      border: `1px solid ${alpha(accent, 0.2)}`,
      borderLeft: `3px solid ${accent}`,
      animation: `${slideRight} 0.4s ease-out ${delay}ms both`,
    }}>
      <Box sx={{
        position: 'absolute', top: 0, bottom: 0, width: '40%',
        background: `linear-gradient(90deg, transparent, ${alpha(accent, 0.03)}, transparent)`,
        animation: `${scanH} 4s ease-in-out ${delay}ms infinite`,
        pointerEvents: 'none',
      }} />

      <Typography sx={{
        fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: accent, mb: 0.5, display: 'block',
      }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={50} height={38} sx={{ bgcolor: alpha(accent, 0.08) }} />
      ) : (
        <Typography sx={{
          fontSize: '1.8rem', fontWeight: 900, lineHeight: 1,
          letterSpacing: '-0.04em', color: 'text.primary',
          fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
        }}>
          {value}
        </Typography>
      )}
      {sub && (
        <Typography sx={{
          fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600, mt: 0.25,
        }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB: LEYENDA DE MATERIAS
// ─────────────────────────────────────────────────────────────

const Leyenda: React.FC<{ celdas: any[]; isDark: boolean; GOLD: string }> = ({ celdas, isDark, GOLD }) => {
  const materias = useMemo(() => {
    const map = new Map<string, { color: string; horas: number }>();
    celdas.forEach(c => {
      if (!c.materia_nombre || c.es_recreo) return;
      const color = getColor(c.materia_nombre, c.color ?? c.materia_color);
      if (!map.has(c.materia_nombre)) map.set(c.materia_nombre, { color, horas: 1 });
      else map.get(c.materia_nombre)!.horas++;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].horas - a[1].horas);
  }, [celdas]);

  if (!materias.length) return null;

  return (
    <Box sx={{
      mt: 3, p: 2,
      borderRadius: '3px',
      border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      borderTop: `3px solid ${GOLD}`,
      bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.8),
      animation: `${fadeIn} 0.5s ease-out 300ms both`,
    }}>
      <Typography sx={{
        fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: GOLD, mb: 2, display: 'block',
      }}>
        ▸ Leyenda de materias
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {materias.map(([nombre, data]) => (
          <Box key={nombre} sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.75,
            borderRadius: '3px',
            border: `1px solid ${alpha(data.color, 0.25)}`,
            borderLeft: `3px solid ${data.color}`,
            bgcolor: isDark ? alpha(data.color, 0.08) : alpha(data.color, 0.05),
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: isDark ? alpha(data.color, 0.14) : alpha(data.color, 0.1),
              transform: 'translateX(2px)',
            },
          }}>
            <Typography sx={{
              fontSize: '0.72rem', fontWeight: 800, color: data.color,
              letterSpacing: '-0.01em',
            }}>
              {nombre}
            </Typography>
            <Typography sx={{
              fontSize: '0.58rem', color: 'text.disabled',
              fontFamily: 'monospace', fontWeight: 700,
            }}>
              {data.horas}h
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB: VISTA DE DÍA INDIVIDUAL
// ─────────────────────────────────────────────────────────────

const VistaDia: React.FC<{
  dia:      number;
  celdas:   any[];
  bloques:  any[];
  ahora:    number;
  isDark:   boolean;
  GOLD:     string;
}> = ({ dia, celdas, bloques, ahora, isDark, GOLD }) => {
  const celdasDia = celdas.filter(c => c.dia_semana === dia);
  const esHoy = dia === diaActual();

  if (!celdasDia.length) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography sx={{
        fontSize: '0.65rem', color: 'text.disabled', fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
      }}>
        Sin clases este día
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {bloques.map(b => {
        const celda = celdasDia.find(c => c.bloque_horario_id === b.id) ?? null;
        if (!celda) return null;
        const enCurso = esHoy && !b.es_recreo &&
          toMin(b.hora_inicio) <= ahora && ahora < toMin(b.hora_fin);

        return (
          <Box key={b.id} sx={{
            display: 'flex', gap: 1.5, alignItems: 'stretch',
            animation: `${slideRight} 0.35s ease-out both`,
          }}>
            {/* Hora */}
            <Box sx={{
              width: 70, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', justifyContent: 'center', pr: 1,
              borderRight: `2px solid ${enCurso ? GOLD : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07))}`,
            }}>
              <Typography sx={{
                fontSize: '0.7rem', fontWeight: enCurso ? 900 : 700,
                color: enCurso ? GOLD : 'text.secondary',
                fontFamily: 'monospace', lineHeight: 1.2,
              }}>
                {fmtHora(b.hora_inicio)}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: 'monospace' }}>
                {fmtHora(b.hora_fin)}
              </Typography>
            </Box>

            {/* Celda expandida */}
            <Box sx={{ flex: 1 }}>
              {b.es_recreo ? (
                <Box sx={{
                  height: 36,
                  display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5,
                  borderRadius: '3px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  border: `1px dashed ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.07)}`,
                }}>
                  <RecresoIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography sx={{
                    fontSize: '0.6rem', color: 'text.disabled', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {b.nombre}
                  </Typography>
                </Box>
              ) : celda ? (
                <Box sx={{
                  p: 1.75,
                  borderRadius: '3px',
                  bgcolor: isDark ? alpha(getColor(celda.materia_nombre, celda.color ?? celda.materia_color), 0.12) : alpha(getColor(celda.materia_nombre, celda.color ?? celda.materia_color), 0.07),
                  border: `1px solid ${alpha(getColor(celda.materia_nombre, celda.color ?? celda.materia_color), enCurso ? 0.5 : 0.2)}`,
                  borderLeft: `3px solid ${getColor(celda.materia_nombre, celda.color ?? celda.materia_color)}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {enCurso && (
                    <Chip
                      size="small"
                      label="EN CURSO"
                      sx={{
                        position: 'absolute', top: 8, right: 8,
                        height: 18, fontSize: '0.55rem', fontWeight: 900,
                        letterSpacing: '0.1em',
                        bgcolor: alpha(getColor(celda.materia_nombre, celda.color ?? celda.materia_color), 0.2),
                        color: getColor(celda.materia_nombre, celda.color ?? celda.materia_color),
                        border: `1px solid ${alpha(getColor(celda.materia_nombre, celda.color ?? celda.materia_color), 0.4)}`,
                        borderRadius: '3px',
                        animation: `${blink} 1.5s ease-in-out infinite`,
                      }}
                    />
                  )}
                  <Typography sx={{
                    fontSize: '0.9rem', fontWeight: 900,
                    color: getColor(celda.materia_nombre, celda.color ?? celda.materia_color),
                    letterSpacing: '-0.02em', mb: 0.5,
                  }}>
                    {celda.materia_nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {celda.aula && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AulaIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Aula {celda.aula}
                        </Typography>
                      </Box>
                    )}
                    {celda.docente_apellidos && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {celda.docente_apellidos}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{
                  height: 60,
                  borderRadius: '3px',
                  bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.02),
                  border: `1px dashed ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
                }} />
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// GRILLA SEMANAL — reconstruida correctamente con CSS Grid
// ─────────────────────────────────────────────────────────────

const GrillaSemanal: React.FC<{
  celdas:  any[];
  bloques: any[];
  dias:    number[];
  ahora:   number;
  isDark:  boolean;
  GOLD:    string;
}> = ({ celdas, bloques, dias, ahora, isDark, GOLD }) => {
  const hoy = diaActual();

  // Índice celdas por (dia, bloque_horario_id)
  const idx = useMemo(() => {
    const m = new Map<string, any>();
    celdas.forEach(c => m.set(`${c.dia_semana}-${c.bloque_horario_id}`, c));
    return m;
  }, [celdas]);

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      {/* Wrapper con ancho mínimo para que no colapse */}
      <Box sx={{
        minWidth: `${72 + dias.length * 130}px`,
        display: 'grid',
        // columna de horas + N columnas de días
        gridTemplateColumns: `72px repeat(${dias.length}, 1fr)`,
        gap: '5px',
      }}>

        {/* ── Fila 0: cabeceras ── */}
        {/* esquina vacía */}
        <Box />
        {dias.map(dia => (
          <DiaHeader
            key={dia}
            dia={dia}
            esHoy={dia === hoy}
            clases={celdas.filter(c => c.dia_semana === dia && !c.es_recreo).length}
            isDark={isDark}
            GOLD={GOLD}
          />
        ))}

        {/* ── Filas de bloques ── */}
        {bloques.map(b => {
          const esRecreo = b.es_recreo;
          const enCursoBloque = !esRecreo &&
            toMin(b.hora_inicio) <= ahora && ahora < toMin(b.hora_fin);

          return (
            <React.Fragment key={b.id}>
              {/* Columna hora */}
              <EjeHora
                horaInicio={b.hora_inicio}
                horaFin={b.hora_fin}
                nombre={b.nombre}
                esRecreo={esRecreo}
                enCurso={enCursoBloque && hoy !== null}
                GOLD={GOLD}
              />

              {/* Una celda por día */}
              {dias.map(dia => {
                const celda = idx.get(`${dia}-${b.id}`) ?? null;
                const enCurso = enCursoBloque && dia === hoy;
                return (
                  <Celda
                    key={dia}
                    celda={celda ?? (esRecreo ? { es_recreo: true } : null)}
                    esHoy={dia === hoy}
                    enCurso={!!enCurso}
                    isDark={isDark}
                    GOLD={GOLD}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function HorarioDocentePage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();

  // Colores — mismo sistema que home del docente
  const GOLD     = isDark ? '#facc15' : '#d97706';
  const GOLD_END = isDark ? '#f59e0b' : '#b45309';

  const { docenteId, isLoadingPerfil } = useDocentePerfil();

  const [periodoId, setPeriodoId]   = useState<number | null>(null);
  const [diasModo, setDiasModo]     = useState<'lv' | 'ls'>('lv');
  const [vista, setVista]           = useState<'semana' | 'dia'>('semana');
  const [diaVista, setDiaVista]     = useState<number>(diaActual() ?? 1);
  const [ahora, setAhora]           = useState(ahoraMin());

  const diasActivos = diasModo === 'ls' ? DIAS_LS : DIAS_LV;

  // Reloj en vivo
  useEffect(() => {
    const id = setInterval(() => setAhora(ahoraMin()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { periodos, periodoActivo, loadingPeriodos } = useAcademicos({
    loadTurnos: false, loadNiveles: false, loadGrados: false,
    loadParalelos: false, loadMaterias: false, loadGradoMaterias: false,
  });

  useEffect(() => {
    if (periodoActivo && !periodoId) setPeriodoId(periodoActivo.id);
  }, [periodoActivo]);

  const { celdas, bloquesUnicos, materiasUnicas, totalHoras, isLoading, refetch } =
    useHorarioDocente(docenteId, periodoId);

  // Clase en curso ahora
  const claseAhora = useMemo(() => {
    const hoy = diaActual();
    if (!hoy) return null;
    return celdas.find(c => {
      if (c.es_recreo || !c.materia_nombre || c.dia_semana !== hoy) return false;
      return toMin(c.hora_inicio) <= ahora && ahora < toMin(c.hora_fin);
    }) ?? null;
  }, [celdas, ahora]);

  // Horas por día para stats
  const horasPorDia = useMemo(() =>
    diasActivos.reduce<Record<number, number>>((acc, d) => {
      acc[d] = celdas.filter(c => c.dia_semana === d && !c.es_recreo).length;
      return acc;
    }, {}),
  [celdas, diasActivos]);

  const diaConMasClases = Object.entries(horasPorDia)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: isDark
        ? `radial-gradient(ellipse at 0% 0%, ${alpha('#facc15', 0.05)} 0%, transparent 50%),
           linear-gradient(${alpha('#fff', 0.018)} 1px, transparent 1px),
           linear-gradient(90deg, ${alpha('#fff', 0.018)} 1px, transparent 1px)`
        : `radial-gradient(ellipse at 0% 0%, ${alpha('#d97706', 0.04)} 0%, transparent 50%),
           linear-gradient(${alpha('#000', 0.022)} 1px, transparent 1px),
           linear-gradient(90deg, ${alpha('#000', 0.022)} 1px, transparent 1px)`,
      backgroundSize: 'auto, 40px 40px, 40px 40px',
      py: 3,
    }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ══ HEADER ══ */}
        <Box sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: '4px',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          borderTop: `3px solid ${GOLD}`,
          bgcolor: isDark ? alpha('#000', 0.5) : '#fff',
          position: 'relative', overflow: 'hidden',
          animation: `${slideDown} 0.4s ease-out both`,
        }}>
          {/* Scan decorativo */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            animation: `${scanH} 5s ease-in-out infinite`,
            pointerEvents: 'none', opacity: 0.5,
          }} />

          <Box sx={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
          }}>
            {/* Título */}
            <Box>
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: GOLD, mb: 0.5, display: 'block',
              }}>
                ▸ Sistema de horarios · {user?.username}
              </Typography>
              <Typography sx={{
                fontSize: { xs: '1.6rem', sm: '2rem' },
                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
              }}>
                Mi Horario
              </Typography>
              <Typography variant="caption" sx={{
                color: 'text.disabled', fontWeight: 600, fontSize: '0.68rem',
              }}>
                {new Date().toLocaleDateString('es-BO', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Typography>
            </Box>

            {/* Controles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

              {/* Selector período */}
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Período</InputLabel>
                <Select
                  value={periodoId ?? ''}
                  onChange={e => setPeriodoId(e.target.value as number)}
                  label="Período"
                  disabled={loadingPeriodos}
                  sx={{
                    borderRadius: '4px', fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(GOLD, 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(GOLD, 0.6),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GOLD,
                    },
                  }}
                >
                  {periodos.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {p.nombre}
                        {p.activo && (
                          <Box sx={{
                            fontSize: '0.55rem', fontWeight: 900, px: 0.75,
                            py: 0.1, borderRadius: '2px', bgcolor: GOLD,
                            color: isDark ? '#000' : '#fff',
                            letterSpacing: '0.1em',
                          }}>
                            ACTIVO
                          </Box>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Vista semana/día */}
              <Box sx={{
                display: 'flex', gap: 0, p: 0.4,
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
                borderRadius: '4px',
              }}>
                {([['semana', <WeekIcon sx={{ fontSize: 16 }} />, 'Semana'], ['dia', <DayIcon sx={{ fontSize: 16 }} />, 'Día']] as const).map(([key, icon, label]) => (
                  <Box
                    key={key}
                    onClick={() => setVista(key as 'semana' | 'dia')}
                    sx={{
                      px: 1.5, py: 0.6,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      fontSize: '0.72rem', fontWeight: 700,
                      transition: 'all 0.15s ease',
                      bgcolor: vista === key ? GOLD : 'transparent',
                      color: vista === key ? (isDark ? '#000' : '#fff') : 'text.secondary',
                      '&:hover': { bgcolor: vista === key ? GOLD : alpha(GOLD, 0.1), color: vista === key ? (isDark ? '#000' : '#fff') : GOLD },
                    }}
                  >
                    {icon}
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{label}</Box>
                  </Box>
                ))}
              </Box>

              {/* Refresh */}
              <Tooltip title="Actualizar">
                <IconButton
                  onClick={() => void refetch()}
                  size="small"
                  sx={{
                    borderRadius: '4px',
                    border: `1px solid ${alpha(GOLD, 0.3)}`,
                    bgcolor: alpha(GOLD, 0.06), color: GOLD,
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: alpha(GOLD, 0.15), transform: 'rotate(180deg)' },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Clase en curso */}
          {claseAhora && (
            <Box sx={{
              mt: 2, pt: 2,
              borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0,
                animation: `${blink} 1.2s ease-in-out infinite`,
                boxShadow: `0 0 0 3px ${alpha('#10b981', 0.25)}`,
              }} />
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: '#10b981',
              }}>
                Ahora:
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                {claseAhora.materia_nombre}
              </Typography>
              {claseAhora.aula && (
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                  · Aula {claseAhora.aula}
                </Typography>
              )}
              <Typography sx={{
                fontSize: '0.68rem', color: 'text.disabled',
                fontFamily: 'monospace', ml: 'auto',
              }}>
                {fmtHora(claseAhora.hora_inicio)} – {fmtHora(claseAhora.hora_fin)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ══ STATS ══ */}
        {!isLoading && celdas.length > 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5, mb: 3,
          }}>
            <StatPanel
              label="Horas / semana" value={totalHoras} sub="clases"
              accent={GOLD} delay={0}
            />
            <StatPanel
              label="Materias" value={materiasUnicas.length} sub="diferentes"
              accent="#8b5cf6" delay={60}
            />
            <StatPanel
              label="Día más cargado"
              value={diaConMasClases ? DIAS_CORTO[Number(diaConMasClases[0])] : '—'}
              sub={diaConMasClases ? `${diaConMasClases[1]} clases` : undefined}
              accent="#3b82f6" delay={120}
            />
            <StatPanel
              label={claseAhora ? 'En curso' : 'Sin clase ahora'}
              value={claseAhora ? claseAhora.materia_nombre?.split(' ')[0] ?? '—' : '—'}
              sub={claseAhora ? 'ahora mismo' : 'en este momento'}
              accent={claseAhora ? '#10b981' : '#6b7280'} delay={180}
            />
          </Box>
        )}

        {/* ══ SELECTOR DE DÍA (solo vista día) ══ */}
        {periodoId && vista === 'dia' && (
          <Box sx={{
            mb: 2.5, display: 'flex', gap: 0.75, flexWrap: 'wrap',
            animation: `${fadeIn} 0.3s ease-out both`,
          }}>
            {diasActivos.map(d => (
              <Box
                key={d}
                onClick={() => setDiaVista(d)}
                sx={{
                  px: 1.75, py: 0.75,
                  borderRadius: '3px', cursor: 'pointer',
                  border: `1px solid ${diaVista === d ? GOLD : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07))}`,
                  borderTop: `2px solid ${diaVista === d ? GOLD : 'transparent'}`,
                  bgcolor: diaVista === d ? alpha(GOLD, isDark ? 0.12 : 0.08) : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.07) },
                }}
              >
                <Typography sx={{
                  fontSize: '0.65rem', fontWeight: 900,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: diaVista === d ? GOLD : 'text.secondary',
                }}>
                  {DIAS_CORTO[d]}
                </Typography>
                {d === diaActual() && (
                  <Box sx={{
                    width: 5, height: 5, borderRadius: '50%',
                    bgcolor: GOLD, mx: 'auto', mt: 0.25,
                    animation: `${blink} 2s ease-in-out infinite`,
                  }} />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* ══ CONTENIDO PRINCIPAL ══ */}
        {!periodoId && !loadingPeriodos ? (
          <Box sx={{
            p: 6, textAlign: 'center',
            borderRadius: '4px',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            borderTop: `3px solid ${alpha(GOLD, 0.4)}`,
            bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.8),
          }}>
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'text.disabled', mb: 1,
            }}>
              ▸ Seleccioná un período para ver el horario
            </Typography>
          </Box>
        ) : isLoading || isLoadingPerfil ? (
          /* Skeleton de carga */
          <Box sx={{
            borderRadius: '4px',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            borderTop: `3px solid ${GOLD}`,
            bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.8),
            p: 2.5, overflow: 'hidden',
          }}>
            <Typography sx={{
              fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: GOLD, mb: 2,
            }}>
              ▸ Cargando horario...
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `72px repeat(5, 1fr)`,
              gap: '5px',
            }}>
              {Array.from({ length: 36 }).map((_, i) => (
                <Skeleton
                  key={i} variant="rounded" height={i < 6 ? 42 : 80}
                  sx={{
                    borderRadius: '3px',
                    bgcolor: isDark ? alpha(GOLD, 0.06) : alpha(GOLD, 0.04),
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : celdas.length === 0 ? (
          <Box sx={{
            p: 8, textAlign: 'center',
            borderRadius: '4px',
            border: `1px dashed ${alpha(GOLD, 0.3)}`,
            bgcolor: isDark ? alpha(GOLD, 0.04) : alpha(GOLD, 0.03),
          }}>
            <CalendarIcon sx={{ fontSize: 52, color: alpha(GOLD, 0.3), mb: 2 }} />
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'text.disabled',
            }}>
              ▸ Sin horario publicado para este período
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              Contactá con el administrador para verificar tu asignación
            </Typography>
          </Box>
        ) : (
          <>
            {/* Toggle L-V / L-S (solo semana) */}
            {vista === 'semana' && (
              <Box sx={{
                mb: 1.5, display: 'flex', alignItems: 'center', gap: 1,
                animation: `${fadeIn} 0.3s ease-out both`,
              }}>
                <Typography sx={{
                  fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: GOLD,
                }}>
                  ▸ Grilla semanal
                </Typography>
                <Box sx={{ flex: 1 }} />
                {[
                  { v: 'lv', l: 'Lun – Vie' },
                  { v: 'ls', l: 'Lun – Sáb' },
                ].map(({ v, l }) => (
                  <Box
                    key={v}
                    onClick={() => setDiasModo(v as 'lv' | 'ls')}
                    sx={{
                      px: 1.5, py: 0.5,
                      borderRadius: '3px', cursor: 'pointer',
                      border: `1px solid ${diasModo === v ? GOLD : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07))}`,
                      bgcolor: diasModo === v ? alpha(GOLD, isDark ? 0.15 : 0.1) : 'transparent',
                      fontSize: '0.68rem', fontWeight: 700,
                      color: diasModo === v ? GOLD : 'text.secondary',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: GOLD, color: GOLD },
                    }}
                  >
                    {l}
                  </Box>
                ))}
              </Box>
            )}

            {/* Panel de la grilla */}
            <Box sx={{
              borderRadius: '4px',
              border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              borderTop: `3px solid ${GOLD}`,
              bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.8),
              p: { xs: 1.5, sm: 2.5 },
              animation: `${fadeIn} 0.45s ease-out 100ms both`,
            }}>
              {vista === 'semana' ? (
                <GrillaSemanal
                  celdas={celdas}
                  bloques={bloquesUnicos}
                  dias={diasActivos}
                  ahora={ahora}
                  isDark={isDark}
                  GOLD={GOLD}
                />
              ) : (
                <>
                  {/* Título día */}
                  <Typography sx={{
                    fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: GOLD, mb: 2, display: 'block',
                  }}>
                    ▸ {DIAS_FULL[diaVista]}
                    {diaVista === diaActual() && ' · HOY'}
                  </Typography>
                  <VistaDia
                    dia={diaVista}
                    celdas={celdas}
                    bloques={bloquesUnicos}
                    ahora={ahora}
                    isDark={isDark}
                    GOLD={GOLD}
                  />
                </>
              )}
            </Box>

            {/* Leyenda */}
            <Leyenda celdas={celdas} isDark={isDark} GOLD={GOLD} />

            {/* Footer de estado */}
            <Box sx={{
              mt: 2.5, px: 1.5, py: 0.75,
              borderRadius: '3px',
              border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
              bgcolor: isDark ? alpha('#000', 0.25) : alpha('#000', 0.02),
              display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
              animation: `${fadeIn} 0.5s ease-out 400ms both`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981',
                  animation: `${blink} 2s ease-in-out infinite`,
                }} />
                <Typography sx={{
                  fontSize: '0.58rem', fontWeight: 700, color: '#10b981',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Horario publicado
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 10, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) }} />
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 600, color: 'text.disabled',
                letterSpacing: '0.06em', fontFamily: 'monospace',
              }}>
                {totalHoras} bloques · {materiasUnicas.length} materias · {diasActivos.filter(d => horasPorDia[d] > 0).length} días activos
              </Typography>
              {claseAhora && (
                <>
                  <Box sx={{ width: 1, height: 10, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) }} />
                  <Typography sx={{
                    fontSize: '0.58rem', fontWeight: 700, color: '#10b981',
                    letterSpacing: '0.06em', fontFamily: 'monospace',
                  }}>
                    ● {claseAhora.materia_nombre?.toUpperCase()} · EN CURSO
                  </Typography>
                </>
              )}
            </Box>
          </>
        )}

      </Container>
    </Box>
  );
}