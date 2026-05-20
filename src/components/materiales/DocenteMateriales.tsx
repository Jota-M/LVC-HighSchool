'use client';
// components/docente/materiales/DocenteMateriales.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, alpha, useTheme, Fade, Skeleton, Grid,
} from '@mui/material';
import { MenuBook as MenuBookIcon } from '@mui/icons-material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';  // ← NUEVO
import AutoStoriesIcon from '@mui/icons-material/AutoStories';               // ← NUEVO (para tab Materiales)
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import { toast } from 'react-hot-toast';
import { SelectorMateria }   from './SelectorMateria';
import { MaterialesDocente } from './MaterialesDocente';
import TabRecursosIA         from '@/components/prediccion/TabRecursosIA';  // ← NUEVO

// ── Tipo para el tab activo ──────────────────────────────────
type VistaTab = 'materiales' | 'recursosIA';                                 // ← NUEVO

interface DocenteMaterialesProps { user: any; }

export const DocenteMateriales: React.FC<DocenteMaterialesProps> = ({ user }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent     = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [asignaciones, setAsignaciones]                     = useState<AsignacionDocente[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionDocente | null>(null);
  const [loadingAsignaciones, setLoadingAsignaciones]       = useState(true);
  const [vistaActiva, setVistaActiva]                       = useState<VistaTab>('materiales'); // ← NUEVO

  useEffect(() => {
    const cargar = async () => {
      setLoadingAsignaciones(true);
      try {
        const res = await asistenciaService.getMisAsignaciones();
        setAsignaciones(res.data.asignaciones);
        if (res.data.asignaciones.length === 1) {
          setAsignacionSeleccionada(res.data.asignaciones[0]);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) toast.error('Error al cargar tus materias');
        setAsignaciones([]);
      } finally {
        setLoadingAsignaciones(false);
      }
    };
    cargar();
  }, []);

  // ── Al cambiar de materia, resetear al tab por defecto ──  // ← NUEVO
  const handleSeleccionar = (asignacion: AsignacionDocente | null) => {
    setAsignacionSeleccionada(asignacion);
    setVistaActiva('materiales');
  };

  const TABS: { key: VistaTab; label: string; icon: React.ReactNode }[] = [  // ← NUEVO
    { key: 'materiales', label: 'Materiales',  icon: <AutoStoriesIcon        sx={{ fontSize: 15 }} /> },
    { key: 'recursosIA', label: 'Recursos IA', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Header editorial ── */}
      <Fade in timeout={400}>
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 1.5,
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              bgcolor: alpha(accent, 0.08),
              border: `1px solid ${alpha(accent, 0.2)}`,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 14, color: accent }} />
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              Materiales académicos
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'text.primary',
              mb: 1,
            }}
          >
            Mis{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Materiales
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 480 }}
          >
            Gestiona los recursos académicos de tus clases. Selecciona una materia para comenzar.
          </Typography>
        </Box>
      </Fade>

      {/* ── Selector de materia ── */}
      {loadingAsignaciones ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      ) : asignaciones.length === 0 ? (
        <SinAsignaciones accent={accent} isDark={isDark} />
      ) : (
        <SelectorMateria
          asignaciones={asignaciones}
          seleccionada={asignacionSeleccionada}
          onSeleccionar={handleSeleccionar}  // ← usa el nuevo handler
          accent={accent}
          accentDark={accentDark}
          isDark={isDark}
        />
      )}

      {/* ── Contenido (solo si hay materia seleccionada) ── */}
      {asignacionSeleccionada && (
        <Fade in timeout={300} key={asignacionSeleccionada.asignacion_id}>
          <Box>
            {/* Separador con nombre de materia */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 1 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08) }} />
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  whiteSpace: 'nowrap',
                }}
              >
                {asignacionSeleccionada.materia_nombre} · {asignacionSeleccionada.grado_nombre}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08) }} />
            </Box>

            {/* ── TABS ── */}                                               {/* ← NUEVO BLOQUE */}
            <Box
              sx={{
                display: 'inline-flex',
                gap: 0.5,
                mb: 3,
                p: 0.5,
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                borderRadius: '10px',
              }}
            >
              {TABS.map(tab => (
                <Box
                  key={tab.key}
                  onClick={() => setVistaActiva(tab.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 0.75,
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    color: vistaActiva === tab.key
                      ? (isDark ? '#000' : '#fff')
                      : 'text.secondary',
                    bgcolor: vistaActiva === tab.key ? accent : 'transparent',
                    boxShadow: vistaActiva === tab.key
                      ? `0 2px 8px ${alpha(accent, 0.25)}`
                      : 'none',
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
            {/* ── FIN TABS ── */}

            {/* Tab: Materiales */}
            {vistaActiva === 'materiales' && (
              <MaterialesDocente
                asignacion={asignacionSeleccionada}
                accent={accent}
                accentDark={accentDark}
                isDark={isDark}
              />
            )}

            {/* Tab: Recursos IA */}                                         {/* ← NUEVO */}
            {vistaActiva === 'recursosIA' && (
              <TabRecursosIA
                asignacionId={asignacionSeleccionada.asignacion_id}
                periodoId={asignacionSeleccionada.periodo_evaluacion_id}
                paraleloId={asignacionSeleccionada.paralelo_id}
                accent={accent}
                isDark={isDark}
              />
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

const SinAsignaciones: React.FC<{ accent: string; isDark: boolean }> = ({ accent, isDark }) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 12,
      borderRadius: '16px',
      border: `1px dashed ${alpha(accent, 0.2)}`,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
      Sin materias asignadas
    </Typography>
    <Typography variant="body2" color="text.disabled">
      No tienes asignaciones activas para el período actual.
    </Typography>
  </Box>
);

export default DocenteMateriales;