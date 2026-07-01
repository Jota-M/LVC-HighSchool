'use client';
// app/dashboard/docente/asistencia/page.tsx
// Estructura idéntica a notas/page.tsx

import React, { useState } from 'react';
import {
  Box, Container, Typography, useTheme, alpha,
  Fade, Alert, LinearProgress, Chip, Tooltip,
  TextField,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import { AsignacionDocente } from '@/services/asistenciaService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function agruparPorMateria(asignaciones: AsignacionDocente[]) {
  const map = new Map<number, AsignacionDocente[]>();
  asignaciones.forEach(a => {
    if (!map.has(a.asignacion_id)) map.set(a.asignacion_id, []);
    map.get(a.asignacion_id)!.push(a);
  });
  return Array.from(map.values());
}

// ─── Selector de fecha simple ─────────────────────────────────────────────────

const SelectorFecha: React.FC<{ fecha: string; onChange: (f: string) => void }> = ({ fecha, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const hoy = new Date().toISOString().slice(0, 10);
  const esHoy = fecha === hoy;

  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const fechaDisplay = new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      p: 2, borderRadius: 2,
      border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
    }}>
      <CalendarTodayIcon sx={{ color: gold, fontSize: 20 }} />
      <Typography variant="body2" fontWeight={700} sx={{
        flex: 1, textTransform: 'capitalize', color: 'text.primary',
      }}>
        {fechaDisplay}
      </Typography>
      {esHoy && (
        <Chip label="HOY" size="small" icon={<TodayIcon sx={{ fontSize: '13px !important' }} />} sx={{
          height: 22, fontSize: 10, fontWeight: 800,
          bgcolor: isDark ? alpha(gold, 0.15) : alpha(gold, 0.1),
          color: gold,
          border: `1px solid ${alpha(gold, 0.3)}`,
          '& .MuiChip-icon': { color: gold },
        }} />
      )}
      <TextField
        type="date" size="small" value={fecha}
        onChange={e => onChange(e.target.value)}
        inputProps={{ max: hoy }}
        sx={{
          width: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5, fontSize: 13, fontWeight: 600,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold },
          },
        }}
      />
    </Box>
  );
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DocenteAsistenciaPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const { asignaciones, fecha, isLoading, sinAsignaciones, cambiarFecha } = useMisAsignaciones();

  const grupos = agruparPorMateria(asignaciones);

  const handleIr = (a: AsignacionDocente) => {
    // URL: /asistencia/[asignacion_id]?fecha=YYYY-MM-DD
    router.push(`/dashboard/docente/asistencia/${a.asignacion_id}?fecha=${fecha}`);
  };

  const pct = (a: AsignacionDocente) => {
    if (!a.total_estudiantes) return 0;
    return Math.round((a.total_marcados / a.total_estudiantes) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventAvailableIcon sx={{ color: gold, fontSize: 36 }} />
                <Typography variant="h1" sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: gradBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Control de Asistencia
                </Typography>
              </Box>
              <Box sx={{ minWidth: 300 }}>
                <SelectorFecha fecha={fecha} onChange={cambiarFecha} />
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Hola, <strong>{user?.username}</strong> — seleccioná una materia para pasar lista.
            </Typography>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {isLoading && (
          <LinearProgress sx={{ borderRadius: 4, height: 4, mb: 3 }} />
        )}

        {/* ══ SIN ASIGNACIONES ══ */}
        {sinAsignaciones && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No tenés asignaciones activas para este período académico.
            Contactá al administrador si esto es un error.
          </Alert>
        )}
        {/* <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        > */}
        {/* ══ GRUPOS DE MATERIAS ══ */}
        {grupos.map((grupo, gi) => {
          const base = grupo[0];
          const completada = base.asistencia_completa;
          const porcentaje = pct(base);

          return (
            <Box key={base.asignacion_id} sx={{ mb: 4 }}>
              {/* Cabecera del grupo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: gradBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <SchoolRoundedIcon sx={{ fontSize: 20, color: isDark ? '#000' : '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {base.materia_nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {base.grado_nombre} "{base.paralelo_nombre}" · {base.turno_nombre} · {base.nivel_nombre}
                  </Typography>
                </Box>
              </Box>

              {/* Cards — una por grupo (en asistencia cada asignacion_id es única por día) */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 2,
              }}>
                <Box
                  onClick={() => handleIr(base)}
                  sx={{
                    borderRadius: '16px',
                    border: `1.5px solid ${completada
                      ? alpha('#10b981', 0.4)
                      : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    p: 2.5,
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                    boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: alpha(gold, 0.5),
                      boxShadow: isDark
                        ? `0 4px 20px ${alpha(gold, 0.12)}`
                        : `0 6px 24px ${alpha(gold, 0.15)}`,
                    },
                  }}
                >
                  {/* Badge estado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    {completada ? (
                      <Chip
                        size="small"
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        label="Lista pasada"
                        sx={{
                          bgcolor: alpha('#10b981', 0.12),
                          color: '#10b981',
                          fontWeight: 700, fontSize: 11, height: 24, borderRadius: 2,
                          border: `1px solid ${alpha('#10b981', 0.25)}`,
                          '& .MuiChip-icon': { color: '#10b981' },
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        icon={<RadioButtonUncheckedIcon sx={{ fontSize: '14px !important' }} />}
                        label="Pendiente"
                        sx={{
                          bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08),
                          color: gold, fontWeight: 700, fontSize: 11, height: 24, borderRadius: 2,
                          border: `1px solid ${alpha(gold, 0.25)}`,
                          '& .MuiChip-icon': { color: gold },
                        }}
                      />
                    )}
                    <Chip label={`Turno ${base.turno_nombre}`} size="small" sx={{
                      height: 22, fontSize: 10, fontWeight: 600,
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    }} />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8),
                      borderRadius: '10px', p: 1.2,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                        <GroupsRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          Estudiantes
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={800}>{base.total_estudiantes}</Typography>
                    </Box>

                    <Box sx={{
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8),
                      borderRadius: '10px', p: 1.2,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          Marcados
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={800}>
                        {base.total_marcados} / {base.total_estudiantes}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Contadores de estado */}
                  <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
                    {[
                      { label: 'P', val: base.presentes, color: '#10b981' },
                      { label: 'A', val: base.ausentes, color: '#ef4444' },
                      { label: 'T', val: base.tardanzas, color: '#f59e0b' },
                      { label: 'J', val: base.justificados, color: '#3b82f6' },
                    ].map(s => (
                      <Tooltip key={s.label} title={
                        s.label === 'P' ? 'Presentes' :
                          s.label === 'A' ? 'Ausentes' :
                            s.label === 'T' ? 'Tardanzas' : 'Justificados'
                      }>
                        <Box sx={{
                          px: 1, py: 0.3, borderRadius: 1.5,
                          bgcolor: alpha(s.color, isDark ? 0.15 : 0.1),
                          border: `1px solid ${alpha(s.color, 0.25)}`,
                          display: 'flex', alignItems: 'center', gap: 0.5,
                        }}>
                          <Typography variant="caption" fontWeight={900} sx={{ color: s.color, fontSize: 11 }}>
                            {s.val}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, fontWeight: 700 }}>
                            {s.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>

                  {/* Barra de progreso */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Progreso del día
                      </Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: gold, fontSize: 11 }}>
                        {porcentaje}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={porcentaje}
                      sx={{
                        height: 5, borderRadius: 4,
                        bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                        '& .MuiLinearProgress-bar': { background: gradBg, borderRadius: 4 },
                      }}
                    />
                  </Box>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                    <Typography variant="caption" sx={{ color: gold, fontWeight: 700, fontSize: 11 }}>
                      {completada ? 'Ver detalle' : 'Pasar lista'}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: gold }} />
                  </Box>
                </Box>
              </Box>

            </Box>
          );
        })}
        {/* </Box> */}
      </Container>
    </Box>
  );
}