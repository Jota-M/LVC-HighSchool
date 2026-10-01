'use client';
// app/dashboard/estudiante/materias/[id]/page.tsx
// Vista detallada de la materia seleccionada: Curso, Temario, Recursos y Avance

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Chip, Skeleton, Fade, alpha, useTheme,
  LinearProgress, Container, Paper,
} from '@mui/material';
import {
  ArrowBackRounded as ArrowBackIcon,
  MenuBookRounded as MenuBookIcon,
  PersonRounded as PersonIcon,
  AccessTimeRounded as TimeIcon,
} from '@mui/icons-material';
import { useMisMaterias } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

// Subcomponente de Temario y Contenido del Curso
import CursoEstudiante from '@/components/estudiante/materiales/CursoEstudiante';
import RinconLudicoEstudiante from '@/components/estudiante/inicial/RinconLudicoEstudiante';

export default function MateriaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const asignacionId = Number(params?.id);
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const { materias, isLoading } = useMisMaterias();
  const [materia, setMateria] = useState<MateriaResumen | null>(null);

  useEffect(() => {
    if (!isLoading && materias.length > 0) {
      const found = materias.find(m => m.asignacion_docente_id === asignacionId);
      if (!found) {
        router.replace('/dashboard/estudiante/materias');
        return;
      }
      setMateria(found);
    }
  }, [materias, isLoading, asignacionId, router]);

  // Color de acento de la materia
  const color = materia?.materia_color || accent;
  const colorDark = materia?.materia_color
    ? alpha(materia.materia_color, 0.8)
    : accentDark;

  if (isLoading || !materia) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Skeleton variant="rounded" height={36} width={180} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: '20px' }} />
          <Skeleton variant="rounded" height={50} sx={{ borderRadius: '14px' }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: '20px' }} />
        </Box>
      </Container>
    );
  }

  const progreso = materia.progreso_promedio ?? 0;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Fade in timeout={300}>
          <Box>

            {/* ── Botón de regreso a Mis Materias ── */}
            <Box
              onClick={() => router.push('/dashboard/estudiante/materias')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 2.5,
                px: 1.5,
                py: 0.8,
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  color,
                  borderColor: color,
                  bgcolor: alpha(color, 0.08),
                  transform: 'translateX(-3px)',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
              Volver a Mis Materias
            </Box>

            {/* ── Header Institucional de la Materia ── */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '22px',
                border: `1.5px solid ${alpha(color, isDark ? 0.28 : 0.2)}`,
                bgcolor: isDark
                  ? `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, rgba(15, 23, 42, 0.85) 100%)`
                  : `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, #ffffff 100%)`,
                overflow: 'hidden',
                mb: 3,
                boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.35)' : `0 4px 20px ${alpha(color, 0.1)}`,
                position: 'relative',
              }}
            >
              {/* Barra superior de acento */}
              <Box
                sx={{
                  height: 4,
                  background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
                }}
              />

              <Box sx={{ p: { xs: 2.2, md: 3 }, display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Icono de materia */}
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: '16px',
                    bgcolor: alpha(color, 0.16),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 16px ${alpha(color, 0.25)}`,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 28 }} />
                </Box>

                {/* Información de la materia */}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                    {materia.materia_codigo && (
                      <Typography variant="caption" sx={{ fontWeight: 800, color, letterSpacing: 0.8 }}>
                        {materia.materia_codigo}
                      </Typography>
                    )}
                    {materia.area_conocimiento && (
                      <Chip
                        label={materia.area_conocimiento}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: alpha(color, 0.12),
                          color,
                          borderRadius: '6px',
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.2, mb: 0.5, letterSpacing: -0.4 }}>
                    {materia.materia_nombre}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Prof. {materia.docente_nombres} {materia.docente_apellidos}
                      </Typography>
                    </Box>

                    {materia.horas_semanales && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled">
                          {materia.horas_semanales} hrs/semana
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Barra de progreso de avance */}
                {materia.total_temas > 0 && (
                  <Box sx={{ minWidth: 160, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Progreso del curso
                      </Typography>
                      <Typography variant="caption" fontWeight={900} sx={{ color }}>
                        {Math.round(progreso)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progreso, 100)}
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        bgcolor: alpha(color, 0.15),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem', mt: 0.4, display: 'block' }}>
                      {materia.temas_completados} de {materia.total_temas} temas avanzados
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* ── Contenido del Curso y Temario ── */}
            <Box sx={{ mt: 1 }}>
              {materia.nivel_nombre?.toLowerCase().includes('inicial') ? (
                <RinconLudicoEstudiante
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              ) : (
                <CursoEstudiante
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              )}
            </Box>

          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
