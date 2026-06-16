'use client';
// app/dashboard/docente/materiales/[id]/page.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Skeleton, Fade, alpha, useTheme,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoStories as AutoStoriesIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useParams, useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { toast } from 'react-hot-toast';
import { MaterialesDocente } from '../../../../../components/materiales/MaterialesDocente';
import TabRecursosIA from '@/components/prediccion/TabRecursosIA';
import CursoDocente from '@/components/docente/materiales/CursoDocente';


type VistaTab = 'materiales' | 'recursosIA' | 'curso';

const TABS: { key: VistaTab; label: string; icon: React.ReactNode }[] = [
  { key: 'materiales', label: 'Materiales', icon: <AutoStoriesIcon sx={{ fontSize: 15 }} /> },
  { key: 'recursosIA', label: 'Recursos IA', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} /> },
  { key: 'curso', label: 'Curso', icon: <MenuBookIcon sx={{ fontSize: 15 }} /> },
];

export default function MateriaDetallePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';
  const router = useRouter();
  const params = useParams();
  const asignacionId = Number(params?.id);

  const [asignacion, setAsignacion] = useState<AsignacionDocente | null>(null);
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<VistaTab>('materiales');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await asistenciaService.getMisAsignaciones();
        const found = res.data.asignaciones.find(
          (a: AsignacionDocente) => a.asignacion_id === asignacionId
        );
        if (!found) { router.replace('/dashboard/docente/materiales'); return; }
        setAsignacion(found);
      } catch {
        toast.error('Error al cargar la materia');
        router.replace('/dashboard/docente/materiales');
      } finally {
        setLoading(false);
      }
    };
    if (asignacionId) cargar();
  }, [asignacionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Skeleton variant="rounded" height={32} width={200} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="rounded" height={48} width={300} sx={{ borderRadius: '10px' }} />
      </Box>
    );
  }

  if (!asignacion) return null;

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Volver ── */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Box
            onClick={() => router.push('/dashboard/docente/materiales')}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.6, mb: 3,
              cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
              transition: 'color 0.15s', '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Mis materias
          </Box>

          {/* ── Info de la materia ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" sx={{
                fontWeight: 700, letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }} noWrap>
                {asignacion.materia_nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={`${asignacion.grado_nombre} "${asignacion.paralelo_nombre}"`}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '5px',
                    background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                    color: isDark ? '#000' : '#fff',
                  }}
                />
                {asignacion.turno_nombre && (
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    · {asignacion.turno_nombre}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Tabs ── */}
          <Box sx={{
            display: 'inline-flex', gap: 0.5, p: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
            borderRadius: '10px',
          }}>
            {TABS.map(tab => (
              <Box
                key={tab.key}
                onClick={() => setVistaActiva(tab.key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 2, py: 0.75, borderRadius: '7px', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s ease',
                  color: vistaActiva === tab.key ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  bgcolor: vistaActiva === tab.key ? accent : 'transparent',
                  boxShadow: vistaActiva === tab.key ? `0 2px 8px ${alpha(accent, 0.25)}` : 'none',
                  '&:hover': vistaActiva !== tab.key
                    ? { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) }
                    : {},
                }}
              >
                {tab.icon}
                {tab.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>

      {/* ── Contenido ── */}
      <Fade in timeout={300} key={vistaActiva}>
        <Box>
          {vistaActiva === 'materiales' && (
            <MaterialesDocente
              asignacion={asignacion}
              accent={accent}
              accentDark={accentDark}
              isDark={isDark}
            />
          )}
          {vistaActiva === 'recursosIA' && (
            <TabRecursosIA
              asignacionId={asignacion.asignacion_id}
              periodoId={asignacion.periodo_evaluacion_id}
              paraleloId={asignacion.paralelo_id}
              accent={accent}
              isDark={isDark}
            />
          )}
          {vistaActiva === 'curso' && (
            <CursoDocente
              asignacion={asignacion}
              accent={accent}
              accentDark={accentDark}
              isDark={isDark}
            />
          )}
        </Box>
      </Fade>
    </Box>
  );
}