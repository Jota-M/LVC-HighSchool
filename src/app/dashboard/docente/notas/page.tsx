'use client';
// app/dashboard/docente/notas/page.tsx
import React, { useState } from 'react';
import {
  Box, Container, Typography, useTheme, alpha,
  Fade, Alert, LinearProgress, Chip, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import GradeRoundedIcon    from '@mui/icons-material/GradeRounded';
import ChevronRightIcon    from '@mui/icons-material/ChevronRight';
import SchoolRoundedIcon   from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon   from '@mui/icons-material/GroupsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMisMateriasNotas } from '@/hooks/useNotas';
import { MateriaDocenteNotas, DIMENSIONES_CONFIG } from '@/types/notasTypes';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Agrupa las materias por asignacion_id para mostrarlas juntas con sus trimestres
function agruparPorMateria(materias: MateriaDocenteNotas[]) {
  const map = new Map<number, MateriaDocenteNotas[]>();
  materias.forEach(m => {
    if (!map.has(m.asignacion_id)) map.set(m.asignacion_id, []);
    map.get(m.asignacion_id)!.push(m);
  });
  return Array.from(map.values());
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function DocenteNotasIndexPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const { materias, isLoading, sinMaterias } = useMisMateriasNotas();

  const grupos = agruparPorMateria(materias);

  const handleIr = (m: MateriaDocenteNotas) => {
    // URL: /notas/[asignacion_id]-[periodo_evaluacion_id]
    router.push(`/dashboard/docente/notas/${m.asignacion_id}-${m.periodo_evaluacion_id}`);
  };

  // Porcentaje de completitud de una materia
  const completitud = (m: MateriaDocenteNotas) => {
    if (!m.total_estudiantes) return 0;
    return Math.round((m.calificaciones_registradas / m.total_estudiantes) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <GradeRoundedIcon sx={{
                color: gold, fontSize: 36,
                animation: `${bounceIcon} 1.5s ease-in-out infinite`,
              }} />
              <Typography variant="h1" sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 800,
                background: gradBg,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Gestión de Notas
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Hola, <strong>{user?.username}</strong> — seleccioná una materia y trimestre para ingresar notas.
            </Typography>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {isLoading && (
          <LinearProgress sx={{ borderRadius: 4, height: 4, mb: 3 }} />
        )}

        {/* ══ SIN MATERIAS ══ */}
        {sinMaterias && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No tenés materias asignadas con períodos de evaluación activos.
            Contactá al administrador si esto es un error.
          </Alert>
        )}

        {/* ══ GRUPOS DE MATERIAS ══ */}
        {grupos.map((grupo, gi) => {
          // Todos los items del grupo comparten materia/grado/paralelo
          const base = grupo[0];
          return (
            <Box
              key={base.asignacion_id}
              sx={{ mb: 4, animation: `${fadeUp} 0.35s ease-out ${gi * 0.07}s both` }}
            >
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

              {/* Cards de trimestres */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 2,
              }}>
                {grupo.map(m => {
                  const pct     = completitud(m);
                  const cerrado = pct === 100;

                  return (
                    <Box
                      key={`${m.asignacion_id}-${m.periodo_evaluacion_id}`}
                      onClick={() => handleIr(m)}
                      sx={{
                        borderRadius: '16px',
                        border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
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
                      {/* Trimestre + badge cerrado */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={m.trimestre_nombre ?? 'Sin trimestre'}
                          size="small"
                          sx={{
                            background: gradBg,
                            color: isDark ? '#000' : '#fff',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                        {cerrado && (
                          <Tooltip title="Todas las notas ingresadas">
                            <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                          </Tooltip>
                        )}
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
                          <Typography variant="body2" fontWeight={800}>
                            {m.total_estudiantes}
                          </Typography>
                        </Box>

                        <Box sx={{
                          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8),
                          borderRadius: '10px', p: 1.2,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                            <AssignmentRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                              Evaluaciones
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={800}>
                            {m.total_evaluaciones}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Mini-barras por dimensión */}
                      <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
                        {(
                          [
                            { key: 'SER',  val: m.evaluaciones_ser   },
                            { key: 'SAB',  val: m.evaluaciones_saber },
                            { key: 'HAC',  val: m.evaluaciones_hacer },
                            { key: 'AUT', val: m.evaluaciones_auto  },
                          ] as const
                        ).map(({ key, val }) => (
                          <Tooltip key={key} title={`${DIMENSIONES_CONFIG[key].label}: ${val} evaluaciones`}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block', mb: 0.3 }}>
                                {DIMENSIONES_CONFIG[key].label.substring(0, 3).toUpperCase()}
                              </Typography>
                              <Box sx={{
                                height: 4, borderRadius: 2,
                                bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                                overflow: 'hidden',
                              }}>
                                <Box sx={{
                                  height: '100%',
                                  width: val > 0 ? '100%' : '0%',
                                  background: gradBg,
                                  borderRadius: 2,
                                  transition: 'width 0.4s',
                                }} />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
                                {val}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ))}
                      </Box>

                      {/* Barra de progreso general */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                            Progreso de notas
                          </Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ color: gold, fontSize: 11 }}>
                            {pct}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
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
                          Abrir
                        </Typography>
                        <ChevronRightIcon sx={{ fontSize: 16, color: gold }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}

      </Container>
    </Box>
  );
}