'use client';
// app/dashboard/docente/temario/[id]/page.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Fade, Skeleton,
  useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  MenuBookRounded as MenuBookRoundedIcon,
  ArrowBackRounded as ArrowBackRoundedIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { CursoDocente } from '@/components/docente/temario';
import { TemarioInicialDocente } from '@/components/docente/inicial/TemarioInicialDocente';
import { toast } from 'react-hot-toast';

// ── Animación idéntica a Tareas y Calificaciones ──────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;

export default function DocenteTemarioDetailPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const asignacionId = Number(params?.id);

  // Paleta de marca unificada con Notas / Tareas / Calificaciones
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const [asignacion, setAsignacion] = useState<AsignacionDocente | null>(null);
  const [loadingAsig, setLoadingAsig] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await asistenciaService.getMisAsignaciones();
        const found = res.data.asignaciones.find(
          (a: AsignacionDocente) => a.asignacion_id === asignacionId
        );
        if (!found) {
          toast.error('Materia no encontrada');
          router.replace('/dashboard/docente/temario');
          return;
        }
        setAsignacion(found);
      } catch (error) {
        toast.error('Error al cargar la materia');
        router.replace('/dashboard/docente/temario');
      } finally {
        setLoadingAsig(false);
      }
    };
    if (asignacionId) cargar();
  }, [asignacionId, router]);

  if (loadingAsig) {
    return (
      <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 } }}>
        <Skeleton variant="rounded" height={28} width={180} sx={{ borderRadius: '8px', mb: 2 }} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px', mb: 3 }} />
        <Skeleton variant="rounded" height={450} sx={{ borderRadius: '18px' }} />
      </Box>
    );
  }

  if (!asignacion) return null;

  // ── Detectar si es Nivel Inicial ─────────────────────────────────────────
  const esInicial = asignacion.nivel_nombre?.toLowerCase().includes('inicial');

  return (
    <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 }, width: '100%' }}>
      {/* ══ HEADER IDÉNTICO AL MÓDULO DE TAREAS Y CALIFICACIONES ══ */}
      <Fade in timeout={400}>
        <Box sx={{ mb: 3 }}>
          <Box
            onClick={() => router.push('/dashboard/docente/temario')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1.5,
              cursor: 'pointer',
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 600,
              '&:hover': { color: gold },
              transition: 'color 0.15s',
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            Volver a mis materias
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <MenuBookRoundedIcon sx={{ color: gold, fontSize: 34, animation: `${bounceIcon} 1.5s ease-in-out infinite` }} />
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.15,
                  }}
                >
                  {asignacion.materia_nombre}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${asignacion.grado_nombre} "${asignacion.paralelo_nombre}"`}
                    size="small"
                    sx={{
                      background: gradBg,
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                  {asignacion.turno_nombre && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · Turno {asignacion.turno_nombre}
                    </Typography>
                  )}
                  {asignacion.nivel_nombre && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · {asignacion.nivel_nombre}
                    </Typography>
                  )}
                  {asignacion.total_estudiantes && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · {asignacion.total_estudiantes} estudiantes
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* ══ CUERPO PRINCIPAL — Bifurcación Inicial vs. Regular ══ */}
      <Fade in timeout={450}>
        <Box sx={{ width: '100%' }}>
          {esInicial ? (
            <TemarioInicialDocente
              asignacion={asignacion}
              accent={gold}
              accentDark={goldEnd}
              isDark={isDark}
            />
          ) : (
            <CursoDocente
              asignacion={asignacion}
              accent={gold}
              accentDark={goldEnd}
              isDark={isDark}
            />
          )}
        </Box>
      </Fade>
    </Box>
  );
}