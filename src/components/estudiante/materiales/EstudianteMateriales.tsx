'use client';
// components/estudiante/materiales/EstudianteMateriales.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, alpha, useTheme, keyframes,
  Fade, Skeleton, Grid, Badge,
} from '@mui/material';
import {
  AutoStories       as AutoStoriesIcon,
  MenuBook          as MenuBookIcon,
  Favorite          as FavIcon,
  TrendingUp        as ProgresoIcon,
  EventAvailable    as AsistenciaIcon,
  Assignment        as AssignmentRoundedIcon,
} from '@mui/icons-material';

import { useMisMaterias }            from '@/hooks/useEstudiante';
import { SelectorMateriaEstudiante } from './SelectorMateriaEstudiante';
import { TemarioEstudiante }         from './TemarioEstudiante';
import { MaterialesLista }           from './MaterialesLista';
import { FavoritosEstudiante }       from './FavoritosEstudiante';
import { ProgresoEstudianteView }    from './ProgresoEstudianteView';
import { AsistenciaEstudianteView }  from './Asistenciaestudianteview';
import { MaterialesAsignados }       from './MaterialesAsignados';
import { estudianteService }         from '@/services/estudianteService';
import type { MateriaResumen }       from '@/services/estudianteService';

// ── Animaciones ──────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-3deg); }
  50%       { transform: translateY(-7px) rotate(3deg); }
`;
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Tabs ─────────────────────────────────────────────────────
type VistaTab = 'materiales' | 'temario' | 'favoritos' | 'progreso' | 'asistencia' | 'asignados';

const TABS: { key: VistaTab; label: string; icon: React.ReactNode }[] = [
  { key: 'materiales', label: 'Materiales',  icon: <MenuBookIcon          sx={{ fontSize: 15 }} /> },
  { key: 'temario',    label: 'Temario',      icon: <AutoStoriesIcon       sx={{ fontSize: 15 }} /> },
  { key: 'favoritos',  label: 'Favoritos',    icon: <FavIcon               sx={{ fontSize: 15 }} /> },
  { key: 'progreso',   label: 'Mi Progreso',  icon: <ProgresoIcon          sx={{ fontSize: 15 }} /> },
  { key: 'asistencia', label: 'Asistencia',   icon: <AsistenciaIcon        sx={{ fontSize: 15 }} /> },
  { key: 'asignados',  label: 'Del docente',  icon: <AssignmentRoundedIcon sx={{ fontSize: 15 }} /> },
];

interface EstudianteMaterialesProps { user: any; }

export const EstudianteMateriales: React.FC<EstudianteMaterialesProps> = ({ user }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent     = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaResumen | null>(null);
  const [vistaActiva, setVistaActiva]                 = useState<VistaTab>('materiales');
  const [pendientesAsignados, setPendientesAsignados] = useState(0);

  const { materias, isLoading: loadingMaterias } = useMisMaterias();

  // Badge de materiales pendientes
  useEffect(() => {
    estudianteService.getMaterialesAsignadosPendientes()
      .then(res => setPendientesAsignados(res.data.total))
      .catch(() => {});
  }, []);

  // Auto-seleccionar si hay una sola materia
  useEffect(() => {
    if (materias.length === 1 && !materiaSeleccionada) {
      setMateriaSeleccionada(materias[0]);
    }
  }, [materias]); // eslint-disable-line

  const handleSeleccionar = useCallback((m: MateriaResumen) => {
    setMateriaSeleccionada(prev => {
      if (prev?.asignacion_docente_id === m.asignacion_docente_id) return prev;
      setVistaActiva('materiales');
      return m;
    });
  }, []);

  const gradient = `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`;

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <MenuBookIcon sx={{ color: accent, fontSize: 36, animation: `${float} 3s ease-in-out infinite` }} />
            <Typography variant="h4" fontWeight={800} sx={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mis Materiales
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Accede al temario, recursos y materiales compartidos por tus docentes.
          </Typography>
        </Box>
      </Fade>

      {/* ── Selector de materia ── */}
      {loadingMaterias ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={110} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : materias.length === 0 ? (
        <SinMaterias accent={accent} isDark={isDark} />
      ) : (
        <SelectorMateriaEstudiante
          materias={materias}
          seleccionada={materiaSeleccionada}
          onSeleccionar={handleSeleccionar}
          accent={accent}
          accentDark={accentDark}
          isDark={isDark}
        />
      )}

      {/* ── Contenido por materia ── */}
      {materiaSeleccionada && (
        <Fade in timeout={400} key={materiaSeleccionada.asignacion_docente_id}>
          <Box sx={{ animation: `${slideUp} 0.35s ease-out` }}>

            {/* ── Tabs ── */}
            <Box sx={{
              display: 'flex', gap: 0.75, mb: 3, p: 0.6,
              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
              borderRadius: '14px', width: '100%', overflowX: 'auto', flexShrink: 0,
              '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
            }}>
              {TABS.map(tab => {
                const isActive  = vistaActiva === tab.key;
                // ── Badge SOLO en el tab "asignados" y solo si hay pendientes ──
                const showBadge = tab.key === 'asignados' && pendientesAsignados > 0;

                return (
                  <Box
                    key={tab.key}
                    component="button"
                    type="button"
                    onClick={() => setVistaActiva(tab.key)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.6,
                      px: 2, py: 0.9, borderRadius: '10px', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s ease',
                      userSelect: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                      border: 'none', outline: 'none',
                      color:   isActive ? (isDark ? '#000' : '#fff') : 'text.secondary',
                      bgcolor: isActive ? accent : 'transparent',
                      boxShadow: isActive ? `0 4px 12px ${alpha(accent, 0.32)}` : 'none',
                      '&:hover':        !isActive ? { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05) } : {},
                      '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
                    }}
                  >
                    {showBadge ? (
                      <Badge
                        badgeContent={pendientesAsignados}
                        color="error"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', height: 14, minWidth: 14 } }}
                      >
                        {tab.icon}
                      </Badge>
                    ) : tab.icon}
                    {tab.label}
                  </Box>
                );
              })}
            </Box>

            {/* ── Vista activa ── */}
            <Fade in timeout={300} key={vistaActiva}>
              <Box>
                {vistaActiva === 'materiales' && (
                  <MaterialesLista materia={materiaSeleccionada} accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
                {vistaActiva === 'temario' && (
                  <TemarioEstudiante materia={materiaSeleccionada} accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
                {vistaActiva === 'favoritos' && (
                  <FavoritosEstudiante materia={materiaSeleccionada} accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
                {vistaActiva === 'progreso' && (
                  <ProgresoEstudianteView materia={materiaSeleccionada} accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
                {vistaActiva === 'asistencia' && (
                  <AsistenciaEstudianteView materia={materiaSeleccionada} accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
                {vistaActiva === 'asignados' && (
                  <MaterialesAsignados accent={accent} accentDark={accentDark} isDark={isDark} />
                )}
              </Box>
            </Fade>

          </Box>
        </Fade>
      )}
    </Box>
  );
};

// ── Vacío ─────────────────────────────────────────────────────
const SinMaterias: React.FC<{ accent: string; isDark: boolean }> = ({ accent }) => (
  <Box sx={{ textAlign: 'center', py: 10, borderRadius: '20px', border: `2px dashed ${alpha(accent, 0.25)}` }}>
    <MenuBookIcon sx={{ fontSize: 60, color: alpha(accent, 0.35), mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>Sin materias activas</Typography>
    <Typography variant="body2" color="text.disabled">No tienes materias matriculadas para el período actual.</Typography>
  </Box>
);

export default EstudianteMateriales;