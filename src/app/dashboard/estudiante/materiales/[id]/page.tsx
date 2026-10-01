'use client';
// app/dashboard/estudiante/materiales/[id]/page.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Chip, Skeleton, Fade, alpha, useTheme,
  Container,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { useMisMaterias } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

// Tabs
import RecursosTab from '@/components/estudiante/materiales/RecursosTab';
import MiAvanceTab from '@/components/estudiante/materiales/MiAvanceTab';
import { FavoritosEstudiante } from '@/components/estudiante/materiales/FavoritosEstudiante';

type VistaTab = 'recursos' | 'guardados' | 'avance';

const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

export default function MateriaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const asignacionId = Number(params?.id);
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold}, ${goldEnd})`;

  const { materias, isLoading } = useMisMaterias();
  const [materia, setMateria] = useState<MateriaResumen | null>(null);
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('recursos');

  useEffect(() => {
    if (!isLoading && materias.length > 0) {
      const found = materias.find(m => m.asignacion_docente_id === asignacionId);
      if (!found) {
        router.replace('/dashboard/estudiante/materiales');
        return;
      }
      setMateria(found);
    }
  }, [materias, isLoading, asignacionId, router]);

  if (isLoading || !materia) {
    return (
      <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Skeleton variant="rounded" height={28} width={180} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px' }} />
            <Skeleton variant="rounded" height={450} sx={{ borderRadius: '18px' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  const progreso = materia.progreso_promedio ?? 0;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ══ HEADER IDÉNTICO AL MÓDULO DE DOCENTE Y TEMARIO ══ */}
        <Fade in timeout={350}>
          <Box sx={{ mb: 3.5 }}>
            {/* Volver */}
            <Box
              onClick={() => router.push('/dashboard/estudiante/materiales')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                mb: 1.5,
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: 13,
                fontWeight: 600,
                '&:hover': { color: gold },
                transition: 'color 0.15s ease',
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis materiales
            </Box>

            {/* Título + Chips + Segmented Control */}
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  bgcolor: alpha(gold, 0.12),
                  border: `1.5px solid ${alpha(gold, 0.28)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 16px ${alpha(gold, 0.15)}`,
                }}>
                  <FolderSharedRoundedIcon
                    sx={{
                      color: gold,
                      fontSize: 30,
                      animation: `${bounceIcon} 1.6s ease-in-out infinite`,
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: gold,
                    mb: 0.3,
                  }}>
                    Biblioteca de Estudio · Recursos y Materiales
                  </Typography>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.4rem', sm: '1.85rem', md: '2.2rem' },
                      fontWeight: 800,
                      background: gradBg,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.15,
                    }}
                  >
                    {materia.materia_nombre}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6, flexWrap: 'wrap' }}>
                    <Chip
                      label={materia.materia_codigo || 'MATERIA'}
                      size="small"
                      sx={{
                        background: gradBg,
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 700,
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                    {materia.area_conocimiento && (
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        · {materia.area_conocimiento}
                      </Typography>
                    )}
                    {(materia.docente_nombres || materia.docente_apellidos) && (
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        · Prof. {materia.docente_nombres} {materia.docente_apellidos}
                      </Typography>
                    )}
                    {materia.total_temas > 0 && (
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        · {materia.temas_completados ?? 0}/{materia.total_temas} temas completados ({Math.round(progreso)}%)
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Selector de pestañas moderno (Segmented Control) */}
              <Box sx={{
                display: 'inline-flex',
                gap: 0.6,
                p: 0.6,
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                borderRadius: '14px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
              }}>
                {[
                  { key: 'recursos' as VistaTab, label: 'Materiales didácticos', icon: <AutoStoriesRoundedIcon sx={{ fontSize: 17 }} /> },
                  { key: 'guardados' as VistaTab, label: 'Mis guardados', icon: <BookmarkRoundedIcon sx={{ fontSize: 17 }} /> },
                  { key: 'avance' as VistaTab, label: 'Mi progreso', icon: <BarChartRoundedIcon sx={{ fontSize: 17 }} /> },
                ].map(tab => {
                  const isActive = vistaActiva === tab.key;
                  return (
                    <Box
                      key={tab.key}
                      onClick={() => setVistaActiva(tab.key)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        px: { xs: 1.5, sm: 2.2 },
                        py: 0.8,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        transition: 'all 0.18s ease',
                        color: isActive ? (isDark ? '#000' : '#fff') : 'text.secondary',
                        background: isActive ? gradBg : 'transparent',
                        boxShadow: isActive ? `0 4px 12px ${alpha(gold, 0.3)}` : 'none',
                        '&:hover': !isActive ? {
                          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                          color: 'text.primary',
                        } : {},
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ── CUERPO PRINCIPAL DE PESTAÑAS ── */}
        <Fade in timeout={300} key={vistaActiva}>
          <Box>
            {vistaActiva === 'recursos' && (
              <RecursosTab
                materia={materia}
                accent={gold}
                accentDark={goldEnd}
                isDark={isDark}
              />
            )}
            {vistaActiva === 'guardados' && (
              <FavoritosEstudiante
                materia={materia}
                accent={gold}
                accentDark={goldEnd}
                isDark={isDark}
              />
            )}
            {vistaActiva === 'avance' && (
              <MiAvanceTab
                materia={materia}
                accent={gold}
                accentDark={goldEnd}
                isDark={isDark}
              />
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}