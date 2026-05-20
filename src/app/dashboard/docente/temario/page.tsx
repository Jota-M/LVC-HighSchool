'use client';
// app/dashboard/docente/temario/page.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Skeleton, Fade, alpha, useTheme, keyframes, LinearProgress,
} from '@mui/material';
import {
  AutoStories as AutoStoriesIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { toast } from 'react-hot-toast';

// ── Animaciones ───────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-8px) rotate(-1deg); }
  66%       { transform: translateY(-4px) rotate(1deg); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`;

// ── Colores por materia (cycling) ─────────────────────────
const MATERIA_PALETTES = [
  { main: '#6366f1', end: '#8b5cf6', bg: '#eef2ff' },
  { main: '#0ea5e9', end: '#06b6d4', bg: '#e0f2fe' },
  { main: '#10b981', end: '#059669', bg: '#d1fae5' },
  { main: '#f59e0b', end: '#ef4444', bg: '#fef3c7' },
  { main: '#ec4899', end: '#a855f7', bg: '#fce7f3' },
  { main: '#14b8a6', end: '#0891b2', bg: '#ccfbf1' },
];

// ── Paleta dinámica ───────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent    = isDark ? '#facc15' : '#6366f1';
  const accentEnd = isDark ? '#f59e0b' : '#8b5cf6';
  return { isDark, accent, accentEnd };
};

// ── Skeleton de carga ─────────────────────────────────────
const MateriaCardSkeleton: React.FC = () => (
  <Card elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', height: 200 }}>
    <Skeleton variant="rectangular" height={8} />
    <CardContent sx={{ p: 3 }}>
      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '14px', mb: 2 }} />
      <Skeleton variant="text" width="70%" height={28} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '8px' }} />
      </Box>
    </CardContent>
  </Card>
);

// ── Card de materia ───────────────────────────────────────
const MateriaCard: React.FC<{
  asignacion: AsignacionDocente;
  index: number;
  isDark: boolean;
  onClick: () => void;
}> = ({ asignacion, index, isDark, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const palette = MATERIA_PALETTES[index % MATERIA_PALETTES.length];

  const gradient = `linear-gradient(135deg, ${palette.main} 0%, ${palette.end} 100%)`;
  const softBg   = isDark ? alpha(palette.main, 0.12) : alpha(palette.bg, 0.8);

  return (
    <Fade in timeout={300 + index * 80}>
      <Card
        elevation={0}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          borderRadius: '20px',
          cursor: 'pointer',
          overflow: 'hidden',
          border: `1.5px solid ${hovered
            ? alpha(palette.main, 0.5)
            : isDark ? alpha('#fff', 0.07) : alpha(palette.main, 0.12)}`,
          bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
          transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none',
          boxShadow: hovered
            ? `0 20px 60px ${alpha(palette.main, isDark ? 0.25 : 0.18)}, 0 4px 16px ${alpha(palette.main, 0.1)}`
            : isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
          animation: `${fadeSlideUp} 0.45s ease-out ${index * 0.08}s both`,
        }}
      >
        {/* Barra superior con gradiente */}
        <Box sx={{
          height: 5,
          background: gradient,
          transition: 'height 0.2s ease',
          ...(hovered && { height: 7 }),
        }} />

        <CardContent sx={{ p: 3 }}>
          {/* Ícono */}
          <Box sx={{
            width: 52, height: 52,
            borderRadius: '16px',
            background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2,
            boxShadow: `0 8px 24px ${alpha(palette.main, 0.3)}`,
            transition: 'transform 0.25s ease',
            transform: hovered ? 'rotate(-6deg) scale(1.1)' : 'none',
          }}>
            <AutoStoriesIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>

          {/* Nombre de la materia */}
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              fontSize: '1rem',
              lineHeight: 1.3,
              mb: 0.4,
              color: hovered ? palette.main : 'text.primary',
              transition: 'color 0.2s ease',
            }}
          >
            {asignacion.materia_nombre}
          </Typography>

          {/* Grado y paralelo */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 2 }}>
            {asignacion.grado_nombre} "{asignacion.paralelo_nombre}"
            {asignacion.turno_nombre && ` · ${asignacion.turno_nombre}`}
          </Typography>

          {/* Chips info */}
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
            {asignacion.gestion_nombre && (
              <Chip
                label={asignacion.gestion_nombre}
                size="small"
                sx={{
                  height: 22, fontSize: '0.68rem', fontWeight: 700,
                  bgcolor: softBg, color: palette.main,
                  border: `1px solid ${alpha(palette.main, 0.2)}`,
                }}
              />
            )}
            <Chip
              icon={<BookmarkIcon sx={{ fontSize: '11px !important', color: `${palette.main} !important` }} />}
              label="Ver temario"
              size="small"
              sx={{
                height: 22, fontSize: '0.68rem', fontWeight: 700,
                bgcolor: hovered ? gradient : softBg,
                color: hovered ? '#fff' : palette.main,
                border: `1px solid ${alpha(palette.main, hovered ? 0 : 0.2)}`,
                transition: 'all 0.2s ease',
              }}
            />
          </Box>
        </CardContent>

        {/* Flecha de navegación */}
        <Box sx={{
          position: 'absolute',
          bottom: 16, right: 16,
          width: 32, height: 32,
          borderRadius: '10px',
          bgcolor: hovered ? palette.main : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}>
          <ChevronRightIcon sx={{
            fontSize: 20,
            color: hovered ? '#fff' : alpha(palette.main, 0.4),
            transform: hovered ? 'translateX(2px)' : 'none',
            transition: 'all 0.2s ease',
          }} />
        </Box>
      </Card>
    </Fade>
  );
};

// ── Página principal ──────────────────────────────────────
export default function DocenteTemarioPage() {
  const { isDark, accent, accentEnd } = usePalette();
  const router = useRouter();

  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const res = await asistenciaService.getMisAsignaciones();
        setAsignaciones(res.data.asignaciones);
      } catch (error: any) {
        if (error.response?.status !== 404) toast.error('Error al cargar tus materias');
        setAsignaciones([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const gradient = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  return (
    <Box sx={{ minHeight: '100vh', py: 1 }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 52, height: 52,
              borderRadius: '16px',
              background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 28px ${alpha(accent, 0.35)}`,
              animation: `${float} 4s ease-in-out infinite`,
              flexShrink: 0,
            }}>
              <AutoStoriesIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  letterSpacing: '-0.5px',
                }}
              >
                Temario
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Gestiona las unidades temáticas y temas de cada materia
              </Typography>
            </Box>
          </Box>

          {/* Línea decorativa */}
          <Box sx={{
            mt: 2,
            height: 3,
            width: 80,
            background: gradient,
            borderRadius: '4px',
            opacity: 0.6,
          }} />
        </Box>
      </Fade>

      {/* ── STATS HEADER ───────────────────────────────── */}
      {!loading && asignaciones.length > 0 && (
        <Fade in timeout={400}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 3,
            px: 2.5, py: 1.5,
            borderRadius: '14px',
            bgcolor: isDark ? alpha(accent, 0.06) : alpha(accent, 0.05),
            border: `1px solid ${alpha(accent, 0.15)}`,
            width: 'fit-content',
          }}>
            <SchoolIcon sx={{ color: accent, fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color="text.secondary">
              Tenés{' '}
              <Box component="span" sx={{ color: accent, fontWeight: 900 }}>
                {asignaciones.length}
              </Box>
              {' '}materia{asignaciones.length !== 1 ? 's' : ''} asignada{asignaciones.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Fade>
      )}

      {/* ── GRID DE MATERIAS ────────────────────────────── */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <MateriaCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : asignaciones.length === 0 ? (
        <SinAsignaciones accent={accent} accentEnd={accentEnd} isDark={isDark} />
      ) : (
        <Grid container spacing={2.5}>
          {asignaciones.map((asig, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asig.asignacion_id}>
              <Box sx={{ position: 'relative' }}>
                <MateriaCard
                  asignacion={asig}
                  index={i}
                  isDark={isDark}
                  onClick={() => router.push(`/dashboard/docente/temario/${asig.asignacion_id}`)}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// ── Estado vacío ──────────────────────────────────────────
const SinAsignaciones: React.FC<{
  accent: string; accentEnd: string; isDark: boolean;
}> = ({ accent, accentEnd, isDark }) => (
  <Fade in timeout={400}>
    <Box sx={{
      textAlign: 'center',
      py: 12,
      borderRadius: '24px',
      border: `2px dashed ${alpha(accent, 0.2)}`,
      bgcolor: isDark ? alpha(accent, 0.03) : alpha(accent, 0.02),
    }}>
      <Box sx={{
        width: 72, height: 72,
        borderRadius: '22px',
        background: `linear-gradient(135deg, ${alpha(accent, 0.15)}, ${alpha(accentEnd, 0.15)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 2.5,
        animation: `${pulse} 2.5s ease-in-out infinite`,
      }}>
        <MenuBookIcon sx={{ fontSize: 38, color: alpha(accent, 0.5) }} />
      </Box>
      <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
        Sin materias asignadas
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 340, mx: 'auto' }}>
        No tenés asignaciones activas para el período actual. Contactá al administrador.
      </Typography>
    </Box>
  </Fade>
);