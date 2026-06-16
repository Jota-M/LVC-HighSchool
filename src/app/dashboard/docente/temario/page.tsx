'use client';
// app/dashboard/docente/temario/page.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Chip,
  Skeleton, Fade, alpha, useTheme, LinearProgress, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  AutoStories as AutoStoriesIcon,
  ChevronRight as ChevronRightIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Bookmark as BookmarkIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { toast } from 'react-hot-toast';

// ─── Animaciones ──────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`;

// ─── Colores por materia (cycling) ────────────────────────────────────────────
const MATERIA_PALETTES = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#14b8a6',
];

// ─── Agrupa asignaciones por materia_nombre ───────────────────────────────────
function agruparPorMateria(asignaciones: AsignacionDocente[]) {
  const map = new Map<string, AsignacionDocente[]>();
  asignaciones.forEach(a => {
    const key = a.materia_nombre;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  });
  return Array.from(map.values());
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const AsignacionCardSkeleton: React.FC = () => (
  <Box sx={{ borderRadius: '16px', border: '1.5px solid', borderColor: 'divider', p: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: '8px' }} />
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
      <Skeleton variant="rounded" height={52} sx={{ borderRadius: '10px' }} />
      <Skeleton variant="rounded" height={52} sx={{ borderRadius: '10px' }} />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Skeleton variant="text" width={40} />
    </Box>
  </Box>
);

// ─── Card de asignación ───────────────────────────────────────────────────────
const AsignacionCard: React.FC<{
  asignacion: AsignacionDocente;
  gold: string;
  goldEnd: string;
  isDark: boolean;
  onClick: () => void;
}> = ({ asignacion, gold, goldEnd, isDark, onClick }) => {
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  // Stats opcionales — si la API los devuelve los mostramos, si no mostramos grado/paralelo
  const totalUnidades = (asignacion as any).total_unidades ?? null;
  const totalTemas = (asignacion as any).total_temas ?? null;
  const hayStats = totalUnidades !== null || totalTemas !== null;
  const temasReg = (asignacion as any).temas_registrados ?? 0;
  const pct = totalTemas > 0 ? Math.round((temasReg / totalTemas) * 100) : 0;

  return (
    <Box
      onClick={onClick}
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
      {/* Turno + gestión */}
      {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Chip
          label={asignacion.turno_nombre ?? 'Sin turno'}
          size="small"
          sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, fontSize: 11 }}
        />
        {asignacion.gestion_nombre && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
            {asignacion.gestion_nombre}
          </Typography>
        )}
      </Box> */}

      {/* Stats: datos reales si los hay, si no → grado y paralelo */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <Box sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8), borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
            <LibraryBooksIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {hayStats ? 'Unidades' : 'Grado'}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={800} noWrap>
            {hayStats ? (totalUnidades ?? '—') : asignacion.grado_nombre}
          </Typography>
        </Box>

        <Box sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8f9fa', 0.8), borderRadius: '10px', p: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
            <BookmarkIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {hayStats ? 'Temas' : 'Paralelo'}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={800} noWrap>
            {hayStats ? (totalTemas ?? '—') : `"${asignacion.paralelo_nombre}"`}
          </Typography>
        </Box>
      </Box>

      {/* Barra de progreso solo si hay datos reales */}
      {hayStats && totalTemas > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Avance del temario</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: gold, fontSize: 11 }}>{pct}%</Typography>
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
      )}

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
        <Typography variant="caption" sx={{ color: gold, fontWeight: 700, fontSize: 11 }}>Abrir</Typography>
        <ChevronRightIcon sx={{ fontSize: 16, color: gold }} />
      </Box>
    </Box>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DocenteTemarioPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [loading, setLoading] = useState(true);

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

  const grupos = agruparPorMateria(asignaciones);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: '100%' }}>

        {/* ══ HEADER ══ */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <AutoStoriesIcon sx={{
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
                Temario
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Seleccioná una materia para gestionar sus unidades y temas.
            </Typography>
          </Box>
        </Fade>

        {/* ══ LOADING ══ */}
        {loading && <LinearProgress sx={{ borderRadius: 4, height: 4, mb: 3 }} />}

        {/* ══ SIN ASIGNACIONES ══ */}
        {!loading && asignaciones.length === 0 && (
          <Fade in timeout={400}>
            <Box sx={{
              textAlign: 'center', py: 12, borderRadius: '24px',
              border: `2px dashed ${alpha(gold, 0.2)}`,
              bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
            }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '22px',
                background: `linear-gradient(135deg, ${alpha(gold, 0.15)}, ${alpha(goldEnd, 0.15)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2.5,
                animation: `${pulse} 2.5s ease-in-out infinite`,
              }}>
                <MenuBookIcon sx={{ fontSize: 38, color: alpha(gold, 0.5) }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
                Sin materias asignadas
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 340, mx: 'auto' }}>
                No tenés asignaciones activas para el período actual. Contactá al administrador.
              </Typography>
            </Box>
          </Fade>
        )}

        {/* ══ GRUPOS POR MATERIA ══ */}
        {grupos.map((grupo, gi) => {
          const base = grupo[0];

          return (
            <Box
              key={base.materia_nombre}
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
                  <SchoolIcon sx={{ fontSize: 20, color: isDark ? '#000' : '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {base.materia_nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {base.nivel_nombre}
                    {grupo.length > 1 && ` · ${grupo.length} paralelos`}
                  </Typography>
                </Box>
              </Box>

              {/* Cards — máximo 3 columnas, nunca se estiran a ancho completo cuando hay pocas */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 340px))',
                  md: 'repeat(3, minmax(0, 340px))',
                },
                gap: 2,
              }}>
                {loading
                  ? [1, 2].map(i => <AsignacionCardSkeleton key={i} />)
                  : grupo.map(asig => (
                    <AsignacionCard
                      key={asig.asignacion_id}
                      asignacion={asig}
                      gold={gold}
                      goldEnd={goldEnd}
                      isDark={isDark}
                      onClick={() => router.push(`/dashboard/docente/temario/${asig.asignacion_id}`)}
                    />
                  ))
                }
              </Box>
            </Box>
          );
        })}

      </Box>
    </Box>
  );
}