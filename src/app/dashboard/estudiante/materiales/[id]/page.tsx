'use client';
// app/dashboard/estudiante/materiales/[id]/page.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Chip, Skeleton, Fade, alpha, useTheme,
  IconButton, LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  AutoStories as CursoIcon,
  Folder as RecursosIcon,
  BarChart as AvanceIcon,
  Favorite as FavIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useMisMaterias } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

// Tabs
import CursoEstudiante from '@/components/estudiante/materiales/CursoEstudiante';
import RecursosTab from '@/components/estudiante/materiales/RecursosTab';
import MiAvanceTab from '@/components/estudiante/materiales/MiAvanceTab';
import { FavoritosEstudiante } from '@/components/estudiante/materiales/FavoritosEstudiante';

type VistaTab = 'curso' | 'recursos' | 'avance' | 'guardados';

const TABS: { key: VistaTab; label: string; icon: React.ReactNode }[] = [
  { key: 'curso', label: 'Curso', icon: <CursoIcon sx={{ fontSize: 15 }} /> },
  { key: 'recursos', label: 'Recursos', icon: <RecursosIcon sx={{ fontSize: 15 }} /> },
  { key: 'avance', label: 'Mi avance', icon: <AvanceIcon sx={{ fontSize: 15 }} /> },
  { key: 'guardados', label: 'Guardados', icon: <FavIcon sx={{ fontSize: 15 }} /> },
];

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
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('curso');

  useEffect(() => {
    if (!isLoading && materias.length > 0) {
      const found = materias.find(m => m.asignacion_docente_id === asignacionId);
      if (!found) {
        router.replace('/dashboard/estudiante/materiales');
        return;
      }
      setMateria(found);
    }
  }, [materias, isLoading, asignacionId]);

  // Usar color de la materia si existe
  const color = materia?.materia_color || accent;
  const colorDark = materia?.materia_color
    ? alpha(materia.materia_color, 0.8)
    : accentDark;

  if (isLoading || !materia) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Skeleton variant="rounded" height={28} width={160} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" height={90} sx={{ borderRadius: '16px' }} />
        <Skeleton variant="rounded" height={44} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  const progreso = materia.progreso_promedio ?? 0;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Fade in timeout={300}>
        <Box>

          {/* ── Volver ── */}
          <Box
            onClick={() => router.push('/dashboard/estudiante/materiales')}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.6, mb: 3,
              cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
              transition: 'color 0.15s', '&:hover': { color },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Mis materias
          </Box>

          {/* ── Header de la materia ── */}
          <Box sx={{
            borderRadius: '18px',
            border: `1px solid ${alpha(color, 0.2)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            overflow: 'hidden',
            mb: 3,
            boxShadow: `0 4px 24px ${alpha(color, 0.08)}`,
          }}>
            {/* Barra de color */}
            <Box sx={{
              height: 5,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
            }} />

            <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Icono */}
              <Box sx={{
                width: 52, height: 52, borderRadius: '14px',
                bgcolor: alpha(color, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MenuBookIcon sx={{ fontSize: 24, color }} />
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.3, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: alpha(color, 0.8), letterSpacing: 0.8 }}>
                    {materia.materia_codigo}
                  </Typography>
                  {materia.area_conocimiento && (
                    <Chip
                      label={materia.area_conocimiento}
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(color, 0.1), color }}
                    />
                  )}
                </Box>

                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.4 }}>
                  {materia.materia_nombre}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {materia.docente_nombres} {materia.docente_apellidos}
                  </Typography>
                </Box>
              </Box>

              {/* Progreso */}
              {materia.total_temas > 0 && (
                <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Progreso</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color }}>
                      {Math.round(progreso)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progreso}
                    sx={{
                      height: 6, borderRadius: 3,
                      bgcolor: alpha(color, 0.12),
                      '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                    }}
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                    {materia.temas_completados}/{materia.total_temas} temas
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── Tabs ── */}
          <Box sx={{
            display: 'inline-flex', gap: 0.5, p: 0.5, mb: 3,
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
            borderRadius: '12px',
          }}>
            {TABS.map(tab => {
              const isActive = vistaActiva === tab.key;
              return (
                <Box
                  key={tab.key}
                  component="button"
                  type="button"
                  onClick={() => setVistaActiva(tab.key)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 2.5, py: 0.9, borderRadius: '9px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s ease',
                    userSelect: 'none', whiteSpace: 'nowrap',
                    border: 'none', outline: 'none',
                    color: isActive ? (isDark ? '#000' : '#fff') : 'text.secondary',
                    bgcolor: isActive ? color : 'transparent',
                    boxShadow: isActive ? `0 4px 12px ${alpha(color, 0.32)}` : 'none',
                    '&:hover': !isActive
                      ? { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04) }
                      : {},
                    '&:focus-visible': { outline: `2px solid ${color}`, outlineOffset: 2 },
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </Box>
              );
            })}
          </Box>

          {/* ── Contenido del tab activo ── */}
          <Fade in timeout={250} key={vistaActiva}>
            <Box>
              {vistaActiva === 'curso' && (
                <CursoEstudiante
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              )}
              {vistaActiva === 'recursos' && (
                <RecursosTab
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              )}
              {vistaActiva === 'avance' && (
                <MiAvanceTab
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              )}
              {vistaActiva === 'guardados' && (
                <FavoritosEstudiante
                  materia={materia}
                  accent={color}
                  accentDark={colorDark}
                  isDark={isDark}
                />
              )}
            </Box>
          </Fade>

        </Box>
      </Fade>
    </Box>
  );
}